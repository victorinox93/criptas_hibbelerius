/**
 * ════════════════════════════════════════════════════════════════
 *  LAS CRIPTAS DE HIBBELERIUS — Backend en Google Sheets
 * ════════════════════════════════════════════════════════════════
 *  1) Crea una hoja de cálculo nueva en Google Drive.
 *  2) Extensiones → Apps Script. Pega este archivo completo.
 *  3) Ejecuta la función  setup  una vez (acepta permisos).
 *  4) Implementar → Nueva implementación → Tipo: Aplicación web
 *       · Ejecutar como: Yo
 *       · Quién tiene acceso: Cualquier usuario
 *     Copia la URL que termina en /exec y pégala en src/config.ts
 *  5) En la hoja "Grupos" da de alta tus claves de grupo.
 *  6) Menú "Criptas" → Actualizar panel, para ver el avance.
 * ════════════════════════════════════════════════════════════════
 */

var HEAD = {
  Grupos: ['clave', 'nombre', 'activo', 'creado'],
  Alumnos: ['matricula', 'grupo', 'alias', 'avatar', 'salt', 'hash', 'token', 'creado', 'ultimoAcceso'],
  Partidas: ['runId', 'matricula', 'grupo', 'alias', 'clase', 'inicio', 'actualizado', 'acto', 'pisoMax', 'vida',
    'puntaje', 'resultado', 'causa', 'combates', 'elites', 'runasOk', 'runasTotal', 'mazo'],
  Eventos: ['fecha', 'matricula', 'grupo', 'runId', 'tipo', 'concepto', 'correcto', 'detalle'],
};

// ───────────────────────── Configuración ─────────────────────────
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(HEAD).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, 1, HEAD[name].length).setValues([HEAD[name]])
      .setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
    sh.setFrozenRows(1);
  });
  var g = ss.getSheetByName('Grupos');
  if (g.getLastRow() < 2) g.appendRow(['DIN-OTO26', 'Dinámica · Otoño 2026', true, new Date()]);
  ['Panel', 'Conceptos'].forEach(function (n) { if (!ss.getSheetByName(n)) ss.insertSheet(n); });
  var def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  actualizarPanel();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Criptas')
    .addItem('Actualizar panel', 'actualizarPanel')
    .addItem('Configurar hojas', 'setup')
    .addItem('Actualizar panel cada hora', 'instalarDisparador')
    .addToUi();
}

function instalarDisparador() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'actualizarPanel') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('actualizarPanel').timeBased().everyHours(1).create();
}

// ───────────────────────── API ─────────────────────────
function doGet() {
  return json_({ ok: true, msg: 'API de Las Criptas de Hibbelerius activa' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var req = JSON.parse(e.postData.contents);
    lock.waitLock(20000);
    var fn = ACTIONS[req.action];
    if (!fn) throw new Error('Acción desconocida');
    return json_(fn(req));
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

var ACTIONS = {
  register: function (r) {
    var mat = clean_(r.matricula, 12).toUpperCase();
    var grupo = clean_(r.grupo, 20).toUpperCase();
    if (!/^[A-Z0-9_-]{3,12}$/.test(mat)) throw new Error('Matrícula inválida.');
    if (!/^[a-f0-9]{64}$/.test(r.passHash)) throw new Error('Contraseña inválida.');
    if (!grupoActivo_(grupo)) throw new Error('La clave de grupo no existe o está cerrada.');
    var sh = sheet_('Alumnos');
    if (findRow_(sh, 1, mat)) throw new Error('Esa matrícula ya tiene cuenta. Usa "Entrar".');
    var salt = Utilities.getUuid();
    var token = Utilities.getUuid();
    sh.appendRow([mat, grupo, '', '', salt, sha_(salt + r.passHash), token, new Date(), new Date()]);
    return { ok: true, token: token, matricula: mat, grupo: grupo, alias: '', avatar: '' };
  },

  login: function (r) {
    var mat = clean_(r.matricula, 12).toUpperCase();
    var sh = sheet_('Alumnos');
    var row = findRow_(sh, 1, mat);
    if (!row) throw new Error('Matrícula o contraseña incorrecta.');
    var v = sh.getRange(row, 1, 1, HEAD.Alumnos.length).getValues()[0];
    if (sha_(v[4] + r.passHash) !== v[5]) throw new Error('Matrícula o contraseña incorrecta.');
    var token = Utilities.getUuid();
    sh.getRange(row, 7).setValue(token);
    sh.getRange(row, 9).setValue(new Date());
    return { ok: true, token: token, matricula: mat, grupo: v[1], alias: v[2], avatar: v[3] };
  },

  saveProfile: function (r) {
    var u = auth_(r.token);
    u.sh.getRange(u.row, 3).setValue(clean_(r.alias, 16));
    u.sh.getRange(u.row, 4).setValue(clean_(r.avatar, 300));
    return { ok: true };
  },

  startRun: function (r) {
    var u = auth_(r.token);
    var runId = 'R-' + Utilities.getUuid().slice(0, 8);
    sheet_('Partidas').appendRow([runId, u.mat, u.grupo, u.alias, clean_(r.clase, 20), new Date(), new Date(),
      1, 0, '', 0, 'en curso', '', 0, 0, 0, 0, 10]);
    return { ok: true, runId: runId };
  },

  updateRun: function (r) {
    var u = auth_(r.token);
    var sh = sheet_('Partidas');
    var row = findRow_(sh, 1, String(r.runId));
    if (!row) return { ok: true, ignored: true };
    var cur = sh.getRange(row, 1, 1, HEAD.Partidas.length).getValues()[0];
    if (cur[1] !== u.mat) throw new Error('Partida ajena.');
    cur[6] = new Date();
    cur[7] = num_(r.acto);
    cur[8] = Math.max(num_(cur[8]), num_(r.piso));
    cur[9] = num_(r.vida);
    cur[10] = Math.max(num_(cur[10]), num_(r.puntaje));
    cur[11] = clean_(r.resultado, 20);
    cur[12] = clean_(r.causa, 60);
    cur[13] = num_(r.combates);
    cur[14] = num_(r.elites);
    cur[15] = num_(r.runasOk);
    cur[16] = num_(r.runasTotal);
    cur[17] = num_(r.mazo);
    sh.getRange(row, 1, 1, cur.length).setValues([cur]);
    return { ok: true };
  },

  logEvent: function (r) {
    var u = auth_(r.token);
    sheet_('Eventos').appendRow([new Date(), u.mat, u.grupo, clean_(r.runId, 20), clean_(r.tipo, 20),
      clean_(r.concepto, 30), r.correcto === '' ? '' : r.correcto === true, clean_(r.detalle, 500)]);
    return { ok: true };
  },
};

// ───────────────────────── Panel docente ─────────────────────────
function actualizarPanel() {
  var ss = SpreadsheetApp.getActive();
  var alumnos = rows_('Alumnos');
  var partidas = rows_('Partidas');
  var eventos = rows_('Eventos');

  var por = {};
  alumnos.forEach(function (a) {
    por[a[0]] = { mat: a[0], grupo: a[1], alias: a[2], ultimo: a[8], partidas: 0, piso: 0, victorias: 0, puntaje: 0, ok: 0, tot: 0 };
  });
  partidas.forEach(function (p) {
    var s = por[p[1]];
    if (!s) return;
    s.partidas++;
    s.piso = Math.max(s.piso, num_(p[8]));
    s.puntaje = Math.max(s.puntaje, num_(p[10]));
    if (p[11] === 'victoria') s.victorias++;
  });
  var conc = {};
  eventos.forEach(function (e) {
    if (e[4] !== 'runa') return;
    var s = por[e[1]];
    var ok = e[6] === true || e[6] === 'TRUE';
    if (s) { s.tot++; if (ok) s.ok++; }
    var k = e[2] + '|' + e[5];
    conc[k] = conc[k] || { grupo: e[2], concepto: e[5], tot: 0, ok: 0 };
    conc[k].tot++;
    if (ok) conc[k].ok++;
  });

  var panel = ss.getSheetByName('Panel') || ss.insertSheet('Panel');
  panel.clear();
  var head = ['Matrícula', 'Grupo', 'Héroe', 'Partidas', 'Piso máx. (de 9)', 'Acto I superado', 'Puntaje máx.',
    'Runas correctas', 'Runas intentadas', '% aciertos', 'Último acceso'];
  var data = Object.keys(por).map(function (k) {
    var s = por[k];
    return [s.mat, s.grupo, s.alias, s.partidas, s.piso, s.victorias > 0 ? 'Sí' : 'No', s.puntaje, s.ok, s.tot,
      s.tot ? s.ok / s.tot : '', s.ultimo];
  }).sort(function (a, b) { return String(a[1]).localeCompare(String(b[1])) || b[4] - a[4]; });
  panel.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  if (data.length) {
    panel.getRange(2, 1, data.length, head.length).setValues(data);
    panel.getRange(2, 10, data.length, 1).setNumberFormat('0%');
    panel.getRange(2, 11, data.length, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  }
  panel.setFrozenRows(1);
  panel.autoResizeColumns(1, head.length);

  var cs = ss.getSheetByName('Conceptos') || ss.insertSheet('Conceptos');
  cs.clear();
  var ch = ['Grupo', 'Concepto', 'Intentos', 'Aciertos', '% aciertos'];
  var cd = Object.keys(conc).map(function (k) {
    var c = conc[k];
    return [c.grupo, c.concepto, c.tot, c.ok, c.tot ? c.ok / c.tot : 0];
  }).sort(function (a, b) { return String(a[0]).localeCompare(String(b[0])) || a[4] - b[4]; });
  cs.getRange(1, 1, 1, ch.length).setValues([ch]).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  if (cd.length) {
    cs.getRange(2, 1, cd.length, ch.length).setValues(cd);
    cs.getRange(2, 5, cd.length, 1).setNumberFormat('0%');
    var rule = SpreadsheetApp.newConditionalFormatRule().setGradientMaxpoint('#9bc96a').setGradientMidpointWithValue('#e8c15a', SpreadsheetApp.InterpolationType.NUMBER, '0.6')
      .setGradientMinpoint('#e05050').setRanges([cs.getRange(2, 5, cd.length, 1)]).build();
    cs.setConditionalFormatRules([rule]);
  }
  cs.setFrozenRows(1);
  cs.autoResizeColumns(1, ch.length);
  panel.getRange(1, 13).setValue('Actualizado: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'));
}

// ───────────────────────── utilidades ─────────────────────────
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function sheet_(n) {
  var sh = SpreadsheetApp.getActive().getSheetByName(n);
  if (!sh) throw new Error('Falta la hoja ' + n + '. Ejecuta setup().');
  return sh;
}
function rows_(n) {
  var sh = sheet_(n);
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD[n].length).getValues();
}
function findRow_(sh, col, value) {
  if (sh.getLastRow() < 2) return 0;
  var f = sh.getRange(2, col, sh.getLastRow() - 1, 1).createTextFinder(String(value)).matchEntireCell(true).findNext();
  return f ? f.getRow() : 0;
}
function auth_(token) {
  if (!token) throw new Error('Sesión inválida. Vuelve a entrar.');
  var sh = sheet_('Alumnos');
  var row = findRow_(sh, 7, token);
  if (!row) throw new Error('Tu sesión expiró. Vuelve a entrar.');
  var v = sh.getRange(row, 1, 1, 3).getValues()[0];
  return { sh: sh, row: row, mat: v[0], grupo: v[1], alias: v[2] };
}
function grupoActivo_(clave) {
  return rows_('Grupos').some(function (g) {
    return String(g[0]).toUpperCase() === clave && (g[2] === true || String(g[2]).toUpperCase() === 'TRUE');
  });
}
function sha_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function clean_(v, max) {
  // evita fórmulas inyectadas en la hoja
  var s = String(v == null ? '' : v).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function num_(v) {
  var n = Number(v);
  return isFinite(n) ? n : 0;
}
