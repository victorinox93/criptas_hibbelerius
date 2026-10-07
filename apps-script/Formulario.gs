/**
 * ════════════════════════════════════════════════════════════════
 *  LAS CRIPTAS DE HIBBELERIUS — Formulario y evidencia
 * ════════════════════════════════════════════════════════════════
 *  Pega este archivo como uno NUEVO en el mismo proyecto de Apps Script
 *  (Archivos → + → Secuencia de comandos → «Formulario»). No hace falta
 *  crear una nueva implementación: sólo se usa desde el menú «Criptas».
 *
 *  · crearFormulario(): crea un Google Form de retroalimentación con sus
 *    respuestas en esta misma hoja (pestaña nueva). Al final te muestra el
 *    enlace: pégalo en FORM_URL de src/config.ts y aparecerá el botón
 *    «✎ Tu opinión» en el menú y en la pantalla final del juego.
 *  · generarEvidencia(): crea/actualiza la pestaña «Evidencia» con los
 *    indicadores para reportar el proyecto (tiempo, aciertos, curva de
 *    aprendizaje por alumno y por tema) y una gráfica.
 * ════════════════════════════════════════════════════════════════
 */

function crearFormulario() {
  var ss = SpreadsheetApp.getActive();
  var form = FormApp.create('Las Criptas de Hibbelerius · Tu opinión');
  form.setDescription(
    '¡Gracias por jugar! Tus respuestas nos ayudan a mejorar el juego y a saber si te ayudó a aprender Dinámica.\n' +
    'Toma unos 7 minutos. No hay respuestas correctas o incorrectas, y no afecta tu calificación.');
  form.setProgressBar(true);
  form.setCollectEmail(false);

  // ── 1. Datos ──
  form.addTextItem().setTitle('Tu alias en el juego').setHelpText('Opcional: sirve para relacionar tu opinión con tu avance.');
  form.addTextItem().setTitle('Grupo').setHelpText('Ejemplo: DIN-OTO26');
  form.addMultipleChoiceItem().setTitle('¿Con qué clase jugaste más?')
    .setChoiceValues(['Caballero de la Masa', 'Arcanista Cinético', 'Penitente del Empuje', 'Probé varias por igual']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('¿Hasta dónde llegaste?')
    .setChoiceValues(['No pasé el Acto I', 'Llegué al Acto II', 'Llegué al Acto III', 'Vencí a Hibbelerius', 'Entré al Núcleo del Cálculo (Acto IV)', 'Vencí a AM']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('¿Cuánto tiempo jugaste en total (aprox.)?')
    .setChoiceValues(['Menos de 30 min', '30 min a 1 h', '1 a 3 h', '3 a 6 h', 'Más de 6 h']).setRequired(true);

  // ── 2. Experiencia ──
  form.addPageBreakItem().setTitle('Tu experiencia');
  escala_(form, '¿Qué tan divertido te pareció?', 'Nada divertido', 'Muy divertido');
  escala_(form, '¿Qué tan difícil te pareció?', 'Muy fácil', 'Muy difícil');
  escala_(form, '¿Qué tan claras fueron las reglas (fuerza, umbral, bloqueo, energía)?', 'Nada claras', 'Muy claras');
  form.addCheckboxItem().setTitle('¿Qué fue lo que MÁS te gustó? (elige hasta 3)')
    .setChoiceValues(['Los combates y las cartas', 'Los jefes', 'Las almas en pena', 'Los ecos (figuras históricas)', 'AM y el Núcleo',
      'La Taberna (minijuegos)', 'El arte y la música', 'Personalizar mi héroe', 'Competir en el ranking', 'Las preguntas de física'])
    .setValidation(FormApp.createCheckboxValidation().requireSelectAtMost(3).build());
  form.addCheckboxItem().setTitle('¿Qué fue lo más frustrante?')
    .setChoiceValues(['Morir muy rápido', 'No entender cómo funciona una carta', 'Preguntas muy difíciles', 'Preguntas muy fáciles',
      'Partidas muy largas', 'Errores o fallas del juego', 'Nada en especial']).showOtherOption(true);

  // ── 3. Aprendizaje ──
  form.addPageBreakItem().setTitle('¿Te ayudó a aprender?');
  form.addGridItem().setTitle('El juego me ayudó a entender…')
    .setRows(['2ª ley de Newton (ΣF = m·a)', 'Fricción y plano inclinado', 'Trabajo y energía', 'Conservación de la energía', 'Impulso y cantidad de movimiento', 'Choques'])
    .setColumns(['Nada', 'Poco', 'Algo', 'Bastante', 'Mucho']);
  escala_(form, 'Antes de jugar, ¿qué tan seguro(a) te sentías resolviendo problemas de Dinámica?', 'Nada', 'Muy seguro(a)');
  escala_(form, 'Después de jugar, ¿qué tan seguro(a) te sientes?', 'Nada', 'Muy seguro(a)');
  form.addMultipleChoiceItem().setTitle('Las runas (problemas) del juego se parecen a los de clase y examen…')
    .setChoiceValues(['Nada', 'Un poco', 'Bastante', 'Mucho']);
  form.addMultipleChoiceItem().setTitle('¿Usaste la pista o el repaso final para estudiar?')
    .setChoiceValues(['Sí, me sirvió', 'Sí, pero no me sirvió', 'No los usé']);

  // ── 4. Ideas para el juego ──
  form.addPageBreakItem().setTitle('¡Diseña con nosotros!')
    .setHelpText('Las mejores ideas pueden entrar al juego con tu nombre en los créditos.');
  form.addParagraphTextItem().setTitle('Personaje jugable (la clase «¿?»): ¿cómo se llamaría, qué concepto de física usaría y cómo pelearía?');
  form.addParagraphTextItem().setTitle('Un enemigo o jefe nuevo: nombre, qué hace y qué concepto de física representa');
  form.addParagraphTextItem().setTitle('Una carta nueva: nombre, costo y qué hace');
  form.addParagraphTextItem().setTitle('Un alma en pena o un eco (figura histórica) que te gustaría ver');
  form.addParagraphTextItem().setTitle('¿Qué cambiarías o quitarías del juego?');
  form.addParagraphTextItem().setTitle('¿Encontraste algún error? Descríbelo (qué pasó y en qué pantalla)');

  // ── 5. Cierre ──
  form.addPageBreakItem().setTitle('Para terminar');
  form.addScaleItem().setTitle('¿Qué tanto recomendarías el juego a alumnos de otros cursos?').setBounds(0, 10).setLabels('Nada', 'Totalmente').setRequired(true);
  form.addMultipleChoiceItem().setTitle('¿Te gustaría seguir usándolo en otros temas o materias?').setChoiceValues(['Sí', 'Tal vez', 'No']);
  form.addMultipleChoiceItem().setTitle('Autorizo que mis respuestas se usen, de forma anónima, para reportar y mejorar este proyecto educativo')
    .setChoiceValues(['Sí, autorizo', 'No autorizo']).setRequired(true);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  form.setConfirmationMessage('¡Gracias! Hibbelerius ha tomado nota. Nos vemos en las criptas.');
  var url = form.getPublishedUrl();
  ss.toast('Formulario creado', 'Criptas', 5);
  SpreadsheetApp.getUi().alert('Formulario creado ✔\n\nEnlace para los alumnos (pégalo en FORM_URL de src/config.ts):\n' + url +
    '\n\nPara editarlo: ' + form.getEditUrl() + '\n\nLas respuestas llegan a una pestaña nueva de esta hoja.');
}

function escala_(form, titulo, bajo, alto) {
  return form.addScaleItem().setTitle(titulo).setBounds(1, 5).setLabels(bajo, alto).setRequired(true);
}

// ───────────────────────── Evidencia para reportar el proyecto ─────────────────────────
function generarEvidencia() {
  var ss = SpreadsheetApp.getActive();
  var alumnos = rows_('Alumnos'), partidas = rows_('Partidas'), eventos = rows_('Eventos');
  var sh = ss.getSheetByName('Evidencia') || ss.insertSheet('Evidencia');
  sh.clear();
  sh.getCharts().forEach(function (c) { sh.removeChart(c); });

  // respuestas a preguntas (runas y encuentros) en orden cronológico
  var resp = eventos.filter(function (e) {
    return (e[4] === 'runa' || e[4] === 'encuentro') && (e[6] === true || e[6] === false || e[6] === 'TRUE' || e[6] === 'FALSE');
  }).map(function (e) {
    return { fecha: new Date(e[0]), mat: String(e[1]), grupo: e[2], tema: e[5] || '(sin tema)', ok: e[6] === true || e[6] === 'TRUE' };
  }).sort(function (a, b) { return a.fecha - b.fecha; });

  // ── por alumno ──
  var por = {};
  alumnos.forEach(function (a) { por[String(a[0])] = { mat: String(a[0]), grupo: a[1], alias: a[2], partidas: 0, min: 0, acto: 0, victorias: 0, puntaje: 0, r: [] }; });
  partidas.forEach(function (p) {
    var s = por[String(p[1])];
    if (!s) return;
    s.partidas++;
    s.min += num_(p[19]);
    s.acto = Math.max(s.acto, num_(p[7]));
    s.puntaje = Math.max(s.puntaje, num_(p[10]));
    if (p[11] === 'victoria') s.victorias++;
  });
  resp.forEach(function (x) { if (por[x.mat]) por[x.mat].r.push(x.ok); });
  var pct = function (arr) { return arr.length ? arr.filter(Boolean).length / arr.length : ''; };
  var lista = Object.keys(por).map(function (k) { return por[k]; }).filter(function (s) { return s.partidas > 0; });

  // ── indicadores generales ──
  var minutos = lista.map(function (s) { return s.min; }).sort(function (a, b) { return a - b; });
  var mediana = minutos.length ? minutos[Math.floor(minutos.length / 2)] : 0;
  var conCurva = lista.filter(function (s) { return s.r.length >= 10; });
  var prom = function (f) { return conCurva.length ? conCurva.reduce(function (a, s) { return a + f(s); }, 0) / conCurva.length : ''; };
  var primeras = prom(function (s) { return pct(s.r.slice(0, 5)); });
  var ultimas = prom(function (s) { return pct(s.r.slice(-5)); });
  var gen = [
    ['Indicador', 'Valor'],
    ['Alumnos registrados', alumnos.length],
    ['Alumnos que jugaron al menos una expedición', lista.length],
    ['Expediciones jugadas', partidas.length],
    ['Horas de juego en total', Math.round(lista.reduce(function (a, s) { return a + s.min; }, 0) / 6) / 10],
    ['Minutos de juego por alumno (mediana)', mediana],
    ['Problemas de Dinámica respondidos', resp.length],
    ['% de aciertos (todos los problemas)', pct(resp.map(function (x) { return x.ok; }))],
    ['Alumnos con 10 o más respuestas (para la curva)', conCurva.length],
    ['% de aciertos en sus PRIMERAS 5 respuestas (promedio)', primeras],
    ['% de aciertos en sus ÚLTIMAS 5 respuestas (promedio)', ultimas],
    ['Cambio (puntos porcentuales)', primeras === '' ? '' : Math.round((ultimas - primeras) * 1000) / 10],
    ['Alumnos que superaron el Acto I', lista.filter(function (s) { return s.acto >= 2; }).length],
    ['Alumnos que vencieron a Hibbelerius', lista.filter(function (s) { return s.victorias > 0; }).length],
  ];
  sh.getRange(1, 1).setValue('EVIDENCIA · Las Criptas de Hibbelerius (generado ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') + ')')
    .setFontWeight('bold').setFontSize(13);
  sh.getRange(3, 1, gen.length, 2).setValues(gen);
  sh.getRange(3, 1, 1, 2).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  [10, 12, 13].forEach(function (r) { sh.getRange(r, 2).setNumberFormat('0.0%'); });

  // ── por tema: primera mitad vs segunda mitad de las respuestas de cada tema ──
  var temas = {};
  resp.forEach(function (x) { (temas[x.tema] = temas[x.tema] || []).push(x.ok); });
  var filasT = [['Tema', 'Respuestas', '% aciertos', '% 1ª mitad', '% 2ª mitad']];
  Object.keys(temas).sort().forEach(function (t) {
    var a = temas[t], h = Math.floor(a.length / 2);
    filasT.push([t, a.length, pct(a), h ? pct(a.slice(0, h)) : '', h ? pct(a.slice(h)) : '']);
  });
  var c0 = 4;
  sh.getRange(3, c0, filasT.length, 5).setValues(filasT);
  sh.getRange(3, c0, 1, 5).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  if (filasT.length > 1) sh.getRange(4, c0 + 2, filasT.length - 1, 3).setNumberFormat('0%');

  // ── por alumno ──
  var r0 = Math.max(gen.length, filasT.length) + 6;
  var filasA = [['Matrícula', 'Grupo', 'Alias', 'Expediciones', 'Minutos', 'Respuestas', '% aciertos', '% primeras 5', '% últimas 5', 'Acto máximo', 'Victorias', 'Mejor puntaje']];
  lista.sort(function (a, b) { return b.min - a.min; }).forEach(function (s) {
    filasA.push([s.mat, s.grupo, s.alias, s.partidas, s.min, s.r.length, pct(s.r),
      s.r.length >= 10 ? pct(s.r.slice(0, 5)) : '', s.r.length >= 10 ? pct(s.r.slice(-5)) : '', s.acto, s.victorias, s.puntaje]);
  });
  sh.getRange(r0, 1).setValue('Por alumno (sólo quienes jugaron)').setFontWeight('bold');
  sh.getRange(r0 + 1, 1, filasA.length, filasA[0].length).setValues(filasA);
  sh.getRange(r0 + 1, 1, 1, filasA[0].length).setFontWeight('bold').setBackground('#221c2a').setFontColor('#e8c15a');
  if (filasA.length > 1) sh.getRange(r0 + 2, 7, filasA.length - 1, 3).setNumberFormat('0%');
  sh.autoResizeColumns(1, 12);

  // ── gráfica: aciertos por tema, 1ª vs 2ª mitad ──
  if (filasT.length > 1) {
    var ch = sh.newChart().asColumnChart()
      .addRange(sh.getRange(3, c0, filasT.length, 1))
      .addRange(sh.getRange(3, c0 + 3, filasT.length, 2))
      .setTitle('Aciertos por tema: primeras vs. últimas respuestas')
      .setPosition(3, c0 + 6, 0, 0)
      .setOption('vAxis.format', 'percent')
      .build();
    sh.insertChart(ch);
  }
  ss.setActiveSheet(sh);
  ss.toast('Pestaña «Evidencia» actualizada', 'Criptas', 5);
}
