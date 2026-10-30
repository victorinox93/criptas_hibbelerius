import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { addEntropia, addErgios, Game, logEvent, saveLocal, syncRun } from '../state';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/**
 * v0.53 · EL GABINETE DE MONTEMAYOR (nodo del Abismo, como la Taberna del modo normal).
 * Tres minijuegos de dinámica del cuerpo rígido, dibujados en pantalla:
 *   · La Rampa de R'lyeh: ángulo de una pendiente, ejes inclinados y componentes del peso.
 *   · El Centroide del Ídolo: haz clic donde está el centroide de una figura compuesta.
 *   · ¿Cuál gira más fácil?: momento de inercia de aros, discos, esferas y varillas.
 * Cada acierto da Ergios; acertar las 3 rondas de un juego da Cordura. v0.54: en cada visita sólo se ofrece UNO de los tres.
 */
const G = 9.81;
const ERGIOS_ACIERTO = 15;
const CORDURA_PERFECTO = 8;
const r1 = (x: number) => Math.round(x * 10) / 10;
const deg = (rad: number) => (rad * 180) / Math.PI;

type Juego = 'rampa' | 'centroide' | 'inercia' | 'carrera' | 'balanza';
const JUEGOS: { id: Juego; nombre: string; desc: string; icono: string }[] = [
  { id: 'rampa', nombre: "La Rampa de R'lyeh", desc: 'Una criatura sobre una pendiente: ¿qué ángulo tiene?, ¿con qué ejes conviene trabajar? y ¿cuánto peso la jala hacia abajo?', icono: 'i_angle' },
  { id: 'centroide', nombre: 'El Centroide del Ídolo', desc: 'Figuras compuestas: haz clic justo donde está su centroide (x̄ = ΣxA/ΣA).', icono: 'i_rune' },
  { id: 'inercia', nombre: '¿Cuál gira más fácil?', desc: 'Aros, discos, esferas y varillas de la misma masa: ¿cuál tiene más momento de inercia?', icono: 'i_pend' },
  // v0.85
  { id: 'carrera', nombre: "La Carrera de R'lyeh", desc: 'Aros, discos y esferas ruedan cuesta abajo. Apuesta quién llega primero… y mira la carrera: a = g·senθ / (1 + I/mr²).', icono: 'i_momentum' },
  { id: 'balanza', nombre: 'La Balanza del Ídolo', desc: 'Una balanza con un ídolo de un lado. ¿Dónde pones el contrapeso para que quede en equilibrio? ΣM = 0.', icono: 'i_anvil' },
];

export class GabineteScene extends Phaser.Scene {
  private floor = 0;
  private capa!: Phaser.GameObjects.Container;
  private hud!: { refresh: () => void };
  private ronda = 0;
  private aciertos = 0;
  constructor() { super('Gabinete'); }

  create(data: { floor: number }) {
    this.floor = data.floor;
    this.cameras.main.fadeIn(300);
    audio.play('abismo2');
    this.add.rectangle(0, 0, W, H, 0x06100e).setOrigin(0);
    const g = this.add.graphics();
    for (let x = 0; x < W; x += 40) g.lineStyle(1, 0x0e2420, 1).lineBetween(x, 60, x, H);
    for (let y = 60; y < H; y += 40) g.lineStyle(1, 0x0e2420, 1).lineBetween(0, y, W, y);
    vignette(this);
    const tip = new Tooltip(this);
    this.hud = topBar(this, tip);
    this.capa = this.add.container(0, 0);
    this.menu();
  }

  private limpiar() { this.capa.removeAll(true); }
  private L<T extends Phaser.GameObjects.GameObject>(o: T) { this.capa.add(o); return o; }
  private clave(j: Juego) { return `gab_${j}_${Game.run!.pos}`; }

  // ───────────── menú ─────────────
  private menu() {
    this.limpiar();
    const run = Game.run!;
    const seen = (run.seen ??= []);
    this.L(title(this, W / 2, 84, 'El Gabinete de Montemayor', 38, '#9ad8c8'));
    this.L(txt(this, W / 2, 120, '«Mis instrumentos siguen aquí. Si entiendes cómo se mueve un cuerpo rígido, el Abismo te paga.»', 18, CSS.dim, { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5, 0));
    // v0.54 · en cada visita el gabinete prepara UN solo juego (cambia según el piso y el tramo)
    const hoy = JUEGOS[Math.abs((run.pos ?? 0) * 7 + (run.tramo ?? 1) * 5 + this.floor) % JUEGOS.length];
    this.L(txt(this, W / 2, 168, 'Hoy Montemayor dejó preparado este experimento:', 17, CSS.gold).setOrigin(0.5, 0));
    [hoy].forEach((j, i) => {
      const y = 260 + i * 96;
      const hecho = seen.includes(this.clave(j.id));
      const fr = this.add.graphics();
      frame(fr, 120, y - 42, 720, 84, 0x0a1614, hecho ? UI.border : 0x3a8a74, 0.95);
      this.L(fr);
      this.L(this.add.image(160, y, j.icono).setScale(3.4).setAlpha(hecho ? 0.4 : 1));
      this.L(txt(this, 196, y - 34, j.nombre, 22, hecho ? CSS.dim : '#9ad8c8'));
      this.L(txt(this, 196, y - 6, j.desc, 15, hecho ? '#4a5a56' : CSS.bone, { wordWrap: { width: 470 } }));
      this.L(button(this, 760, y, 130, 44, hecho ? 'Jugado' : 'Jugar', () => {
        seen.push(this.clave(j.id));
        saveLocal();
        this.ronda = 0;
        this.aciertos = 0;
        this.jugar(j.id);
      }, { size: 20, enabled: !hecho, color: UI.gold }));
    });
    this.L(txt(this, W / 2, 470, `Cada acierto: +${ERGIOS_ACIERTO} Ergios · 3 de 3 en un juego: +${CORDURA_PERFECTO} de Cordura`, 16, CSS.gold).setOrigin(0.5));
    this.L(button(this, W / 2, 512, 240, 40, 'Seguir bajando', () => {
      run.floor = this.floor + 1;
      saveLocal();
      syncRun('en curso');
      fadeTo(this, 'Map');
    }, { size: 20 }));
  }

  private jugar(j: Juego) {
    if (this.ronda >= 3) return this.final(j);
    this.limpiar();
    this.ronda++;
    if (j === 'rampa') this.rampa();
    else if (j === 'centroide') this.centroide();
    else if (j === 'carrera') this.carrera();
    else if (j === 'balanza') this.balanza();
    else this.inercia();
  }

  /** Resultado de una respuesta: premio, explicación y botón para seguir */
  private resolver(j: Juego, ok: boolean, concepto: string, explicacion: string, py = 360) {
    if (ok) { this.aciertos++; addErgios(ERGIOS_ACIERTO); audio.sfx('victory'); } else audio.sfx('hit');
    logEvent('gabinete', concepto, ok, { juego: j, ronda: this.ronda });
    this.hud.refresh();
    const g = this.add.graphics();
    frame(g, 560, py, 380, 160, 0x0a1614, ok ? 0x6ad08a : 0xc84a5a, 0.97);
    this.L(g);
    this.L(txt(this, 576, py + 12, ok ? `¡Correcto! +${ERGIOS_ACIERTO} Ergios` : 'No era esa…', 20, ok ? '#9af0a0' : '#ff9aa8'));
    this.L(txt(this, 576, py + 40, explicacion, 14, CSS.bone, { wordWrap: { width: 350 }, lineSpacing: 2 }));
    this.L(button(this, 750, py + 138, 200, 32, this.ronda >= 3 ? 'Ver resultado' : 'Siguiente ronda', () => this.jugar(j), { size: 18, color: UI.gold }));
  }

  /** Botones de opción múltiple (se bloquean al contestar) */
  private opciones(x: number, y: number, ops: string[], correcta: number, alResponder: (ok: boolean, elegida: number) => void) {
    const btns = ops.map((o, i) => this.L(button(this, x, y + i * 46, 340, 40, o, () => {
      btns.forEach((b, k) => { b.setEnabled(false); if (k === correcta) b.label.setColor('#9af0a0'); else if (k === i) b.label.setColor('#ff9aa8'); });
      alResponder(i === correcta, i);
    }, { size: 17 })));
    return btns;
  }

  private encabezado(nombre: string, pregunta: string) {
    this.L(title(this, W / 2, 76, `${nombre} · ronda ${this.ronda} de 3`, 28, '#9ad8c8'));
    this.L(txt(this, W / 2, 104, pregunta, 18, CSS.bone, { align: 'center', wordWrap: { width: 860 } }).setOrigin(0.5, 0));
  }

  // ───────────── 1. La Rampa de R'lyeh ─────────────
  private rampa() {
    // triángulos con catetos «bonitos» (altura h, base b)
    const tri = Phaser.Utils.Array.GetRandom([[3, 4], [5, 12], [1, 1], [8, 15], [7, 24], [1, 1.73], [4, 3], [9, 12]] as [number, number][]);
    const [h, b] = tri;
    const th = Math.atan2(h, b);
    const m = Phaser.Math.Between(4, 20);
    const bicho = Phaser.Utils.Array.GetRandom(['polipito', 'retono', 'serIb', 'martense', 'vertice']);
    // dibujo: rampa a la izquierda
    const x0 = 160, y0 = 470, largo = 400;
    const bx = largo * Math.cos(th), hy = largo * Math.sin(th);
    const esc = Math.min(1, 300 / hy);
    const B = bx * esc, Hh = hy * esc;
    const g = this.add.graphics();
    g.fillStyle(0x1c3632, 1).fillTriangle(x0, y0, x0 + B, y0, x0, y0 - Hh);
    g.lineStyle(3, 0x4a8a74, 1).strokeTriangle(x0, y0, x0 + B, y0, x0, y0 - Hh);
    g.lineStyle(2, 0xd0ae4a, 1);
    g.beginPath(); g.arc(x0 + B, y0, 42, Math.PI, Math.PI + th, false); g.strokePath();
    this.L(g);
    this.L(txt(this, x0 + B - 70, y0 - 26, 'θ', 22, '#ffd060'));
    this.L(txt(this, x0 + B / 2, y0 + 8, `b = ${b} m`, 17, CSS.bone).setOrigin(0.5, 0));
    this.L(txt(this, x0 - 10, y0 - Hh / 2, `h = ${h} m`, 17, CSS.bone).setOrigin(1, 0.5));
    // la criatura sobre la rampa (girada con la pendiente)
    const t = 0.45;
    const px = x0 + B * (1 - t), py = y0 - Hh * t;
    const nx = Math.sin(th), ny = -Math.cos(th); // normal hacia afuera de la rampa (arriba a la derecha)
    const cx = px + nx * 26, cy = py + ny * 26;
    this.L(this.add.image(cx, cy, bicho).setScale(3).setRotation(th));
    this.L(txt(this, cx + 40, cy - 54, `m = ${m} kg`, 16, '#ffd060'));
    const fase = this.ronda; // 1: ángulo · 2: ejes · 3: componente del peso
    const dibujarEjes = () => {
      const e = this.add.graphics();
      const L = 90;
      const ux = Math.cos(th), uy = Math.sin(th); // eje x' a lo largo de la rampa (hacia abajo)
      e.lineStyle(3, 0x7fe8d8, 1).lineBetween(cx, cy, cx + ux * L, cy + uy * L);
      e.lineStyle(3, 0xc8a8ff, 1).lineBetween(cx, cy, cx + nx * L, cy + ny * L);
      e.lineStyle(3, 0xff6a7a, 1).lineBetween(cx, cy, cx, cy + 80); // peso
      this.L(e);
      this.L(txt(this, cx + ux * L - 18, cy + uy * L + 4, "x'", 18, '#7fe8d8'));
      this.L(txt(this, cx + nx * L - 6, cy + ny * L - 22, "y'", 18, '#c8a8ff'));
      this.L(txt(this, cx + 6, cy + 74, 'W = m·g', 15, '#ff9aa8'));
    };
    const thTxt = `${r1(deg(th))}°`;
    if (fase === 1) {
      this.encabezado("La Rampa de R'lyeh", `La rampa sube ${h} m en ${b} m horizontales. ¿Cuál es su ángulo θ con el suelo?`);
      const correcta = r1(deg(th));
      const ops = Phaser.Utils.Array.Shuffle([correcta, r1(deg(Math.atan2(b, h))), r1(deg(Math.asin(Math.min(1, h / b)))), r1(correcta + 10)]).filter((v, i, a) => a.indexOf(v) === i);
      while (ops.length < 4) ops.push(r1(correcta + 5 * ops.length));
      const idx = ops.indexOf(correcta);
      this.opciones(760, 180, ops.map((v) => `θ = ${v}°`), idx, (ok) =>
        this.resolver('rampa', ok, 'Plano inclinado', `tan θ = h / b = ${h}/${b} → θ = arctan(${r1((b === 1.73 ? 1 : h) / b)}) = ${thTxt}. (El ángulo se mide desde el suelo, frente a la altura.)`));
    } else if (fase === 2) {
      this.encabezado("La Rampa de R'lyeh", `θ = ${thTxt}. Para analizar a la criatura, ¿qué ejes conviene usar?`);
      const ops = [
        "x' a lo largo de la rampa, y' perpendicular a ella",
        'x horizontal, y vertical (los de siempre)',
        "x' perpendicular a la rampa, y' vertical",
        'Un solo eje vertical: el del peso',
      ];
      const orden = Phaser.Utils.Array.Shuffle([0, 1, 2, 3]);
      this.opciones(760, 180, orden.map((k) => ops[k]), orden.indexOf(0), (ok) => {
        dibujarEjes();
        this.resolver('rampa', ok, 'Plano inclinado', "Con x' sobre la rampa, la aceleración queda en UN solo eje y la normal N en el otro. Sólo el peso W hay que descomponerlo: Wx' = m·g·senθ y Wy' = m·g·cosθ.");
      });
    } else {
      dibujarEjes();
      const comp = Math.random() < 0.6 ? 'x' : 'y';
      this.encabezado("La Rampa de R'lyeh", comp === 'x'
        ? `θ = ${thTxt}, m = ${m} kg, g = 9.81 m/s². ¿Cuánto vale la componente del peso a lo largo de la rampa (eje x')?`
        : `θ = ${thTxt}, m = ${m} kg, g = 9.81 m/s². ¿Cuánto vale la componente del peso perpendicular a la rampa (eje y')? (= la normal N)`);
      const W0 = m * G;
      const sx = r1(W0 * Math.sin(th)), sy = r1(W0 * Math.cos(th));
      const correcta = comp === 'x' ? sx : sy;
      const ops = Phaser.Utils.Array.Shuffle([sx, sy, r1(W0 * Math.tan(th)), r1(W0)]).filter((v, i, a) => a.indexOf(v) === i);
      while (ops.length < 4) ops.push(r1(correcta * 1.5 + ops.length));
      this.opciones(760, 180, ops.map((v) => `${v} N`), ops.indexOf(correcta), (ok) =>
        this.resolver('rampa', ok, 'Plano inclinado', comp === 'x'
          ? `Wx' = m·g·senθ = ${m}·9.81·sen(${thTxt}) = ${sx} N. Es la que jala a la criatura hacia abajo de la rampa.`
          : `Wy' = m·g·cosθ = ${m}·9.81·cos(${thTxt}) = ${sy} N. Sin otras fuerzas, la normal vale lo mismo: N = ${sy} N.`));
    }
  }

  // ───────────── 2. El Centroide del Ídolo ─────────────
  private centroide() {
    this.encabezado('El Centroide del Ídolo', 'Haz clic justo donde está el centroide de la figura (cada cuadro mide 1 m).');
    const U = 30, ox = 120, oy = 430; // origen del dibujo (abajo a la izquierda)
    type Pieza = { tipo: 'rect' | 'tri' | 'hueco'; x: number; y: number; w: number; h: number };
    const figuras: Pieza[][] = [
      [{ tipo: 'rect', x: 0, y: 0, w: 6, h: 2 }, { tipo: 'rect', x: 0, y: 2, w: 2, h: 6 }], // L
      [{ tipo: 'rect', x: 0, y: 0, w: 8, h: 2 }, { tipo: 'rect', x: 3, y: 2, w: 2, h: 6 }], // T invertida
      [{ tipo: 'rect', x: 0, y: 0, w: 6, h: 4 }, { tipo: 'tri', x: 0, y: 4, w: 6, h: 3 }], // casa
      [{ tipo: 'rect', x: 0, y: 0, w: 8, h: 6 }, { tipo: 'hueco', x: 4, y: 2, w: 2, h: 2 }], // placa con hueco
      [{ tipo: 'rect', x: 0, y: 0, w: 4, h: 4 }, { tipo: 'rect', x: 4, y: 0, w: 4, h: 2 }, { tipo: 'rect', x: 0, y: 4, w: 2, h: 3 }],
      [{ tipo: 'tri', x: 0, y: 0, w: 6, h: 6 }, { tipo: 'rect', x: 6, y: 0, w: 2, h: 3 }],
    ];
    const fig = Phaser.Utils.Array.GetRandom(figuras);
    // área y centroide de cada pieza (los triángulos son rectángulos: ángulo recto abajo-izq; la «casa» es isósceles)
    const datos = fig.map((p) => {
      if (p.tipo === 'tri') {
        const casa = fig.length === 2 && fig[0].tipo === 'rect' && p.y > 0;
        const A = (p.w * p.h) / 2;
        return { A, x: casa ? p.x + p.w / 2 : p.x + p.w / 3, y: p.y + p.h / 3, p, casa };
      }
      const A = p.w * p.h * (p.tipo === 'hueco' ? -1 : 1);
      return { A, x: p.x + p.w / 2, y: p.y + p.h / 2, p, casa: false };
    });
    const At = datos.reduce((s, d) => s + d.A, 0);
    const xb = datos.reduce((s, d) => s + d.A * d.x, 0) / At;
    const yb = datos.reduce((s, d) => s + d.A * d.y, 0) / At;
    const P = (x: number, y: number) => ({ x: ox + x * U, y: oy - y * U });
    const g = this.add.graphics();
    for (let i = 0; i <= 10; i++) { g.lineStyle(1, 0x1c3632, 1).lineBetween(ox + i * U, oy, ox + i * U, oy - 10 * U); g.lineBetween(ox, oy - i * U, ox + 10 * U, oy - i * U); }
    for (const d of datos) {
      const p = d.p;
      const col = p.tipo === 'hueco' ? 0x06100e : 0x4a8a74;
      g.fillStyle(col, 1);
      if (p.tipo === 'tri') {
        const a = P(p.x, p.y), bq = P(p.x + p.w, p.y), c = d.casa ? P(p.x + p.w / 2, p.y + p.h) : P(p.x, p.y + p.h);
        g.fillTriangle(a.x, a.y, bq.x, bq.y, c.x, c.y);
      } else { const a = P(p.x, p.y + p.h); g.fillRect(a.x, a.y, p.w * U, p.h * U); }
    }
    g.lineStyle(2, 0x9ad8c8, 1);
    this.L(g);
    this.L(txt(this, ox, oy + 6, '0', 14, CSS.dim));
    const zona = this.add.zone(ox - 20, oy - 10 * U - 20, 10 * U + 40, 10 * U + 40).setOrigin(0).setInteractive({ useHandCursor: true });
    this.L(zona);
    let listo = false;
    zona.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (listo) return;
      listo = true;
      const ux = (ptr.worldX - ox) / U, uy = (oy - ptr.worldY) / U;
      const dist = Math.hypot(ux - xb, uy - yb);
      const ok = dist <= 0.6;
      const m = this.add.graphics();
      const tp = P(xb, yb);
      m.lineStyle(3, 0xffd060, 1).lineBetween(tp.x - 10, tp.y, tp.x + 10, tp.y).lineBetween(tp.x, tp.y - 10, tp.x, tp.y + 10);
      m.fillStyle(ok ? 0x9af0a0 : 0xff6a7a, 1).fillCircle(ptr.worldX, ptr.worldY, 5);
      for (const d of datos) { const q = P(d.x, d.y); m.fillStyle(0xc8a8ff, 1).fillCircle(q.x, q.y, 3); }
      this.L(m);
      const sumas = datos.map((d, i) => `${i ? (d.A < 0 ? ' − ' : ' + ') : ''}${r1(d.x)}·${r1(Math.abs(d.A))}`).join('');
      const formula = `x̄ = ΣxA/ΣA = (${sumas}) / ${r1(At)} = ${r1(xb)} m\nȳ = ${r1(yb)} m (cruz amarilla). Tu clic quedó a ${r1(dist)} m.`;
      this.resolver('centroide', ok, 'Centroide', `${ok ? '' : 'Tenías que quedar a menos de 0.6 m. '}${formula}${datos.some((d) => d.A < 0) ? '\nEl hueco cuenta con área NEGATIVA.' : ''}`);
    });
  }

  // ───────────── 3. ¿Cuál gira más fácil? ─────────────
  private inercia() {
    type Cuerpo = { id: string; nombre: string; k: number; formula: string };
    const C: Cuerpo[] = [
      { id: 'aro', nombre: 'Anillo de Saturno (aro)', k: 1, formula: 'I = m·R²' },
      { id: 'disco', nombre: "Disco de R'lyeh (disco)", k: 0.5, formula: 'I = ½·m·R²' },
      { id: 'esfera', nombre: 'Esfera de Yog-Sothoth (sólida)', k: 0.4, formula: 'I = ⅖·m·R²' },
      { id: 'hueca', nombre: 'Esfera Hueca del Faro', k: 2 / 3, formula: 'I = ⅔·m·R²' },
      { id: 'varillaC', nombre: 'Báculo girando por su centro', k: 1 / 3, formula: 'I = (1/12)·m·L² = ⅓·m·R² (L = 2R)' },
      { id: 'varillaE', nombre: 'Báculo girando por su punta', k: 4 / 3, formula: 'I = ⅓·m·L² = (4/3)·m·R² (L = 2R)' },
    ];
    const [a, b] = Phaser.Utils.Array.Shuffle([...C]).slice(0, 2) as Cuerpo[];
    const masDificil = Math.random() < 0.5;
    this.encabezado('¿Cuál gira más fácil?', masDificil
      ? 'Misma masa m y mismo radio R. ¿Cuál cuesta MÁS trabajo poner a girar (mayor momento de inercia I)?'
      : 'Misma masa m y mismo radio R. Ruedan sin deslizar desde lo alto de una rampa: ¿cuál llega PRIMERO? (el de menor I)');
    const dibujar = (cu: Cuerpo, x: number) => {
      const g = this.add.graphics();
      const y = 220, R = 60;
      g.lineStyle(2, 0x3a5a54, 1).strokeCircle(x, y, R + 14);
      if (cu.id === 'aro') g.lineStyle(10, 0xd0ae4a, 1).strokeCircle(x, y, R);
      else if (cu.id === 'disco') { g.fillStyle(0x4a8a74, 1).fillCircle(x, y, R); g.lineStyle(3, 0x2c5a4e, 1).strokeCircle(x, y, R); }
      else if (cu.id === 'esfera') { g.fillStyle(0x563880, 1).fillCircle(x, y, R); g.fillStyle(0x9a6ad0, 1).fillCircle(x - 20, y - 22, 22); }
      else if (cu.id === 'hueca') { g.lineStyle(10, 0x7fe8d8, 1).strokeCircle(x, y, R); g.lineStyle(2, 0x7fe8d8, 0.5).strokeEllipse(x, y, R * 2, R * 0.7); }
      else if (cu.id === 'varillaC') { g.fillStyle(0xd0ae4a, 1).fillRect(x - R, y - 6, 2 * R, 12); }
      else { g.fillStyle(0xd0ae4a, 1).fillRect(x - R, y - 6, 2 * R, 12); }
      // eje de giro
      const ex = cu.id === 'varillaE' ? x - R : x;
      g.fillStyle(0xff6a7a, 1).fillCircle(ex, y, 6);
      g.lineStyle(2, 0xff6a7a, 0.8).beginPath();
      g.arc(ex, y, 24, -2.4, 0.6, false); g.strokePath();
      this.L(g);
      this.L(txt(this, x, y + R + 24, cu.nombre, 17, '#e8dcff', { align: 'center', wordWrap: { width: 300 } }).setOrigin(0.5, 0));
    };
    dibujar(a, 300);
    dibujar(b, 660);
    this.L(txt(this, W / 2, 220, 'vs', 26, CSS.dim).setOrigin(0.5));
    const gana = masDificil ? (a.k >= b.k ? 0 : 1) : (a.k <= b.k ? 0 : 1);
    const empate = Math.abs(a.k - b.k) < 1e-6;
    const btns = [a, b].map((cu, i) => this.L(button(this, i === 0 ? 300 : 660, 344, 300, 42, `Éste: ${cu.nombre.split(' (')[0]}`, () => {
      btns.forEach((x) => x.setEnabled(false));
      const ok = empate || i === gana;
      const expl = `${a.nombre.split(' (')[0]}: ${a.formula}\n${b.nombre.split(' (')[0]}: ${b.formula}\n${masDificil ? 'Más masa lejos del eje = más I = cuesta más girarlo.' : 'Menos I: menos energía se va en girar y más en avanzar.'}`;
      this.resolver('inercia', ok, 'Momento de inercia', expl, 374);
    }, { size: 16 })));
  }


  // ───────────── 4. La Carrera de R'lyeh (v0.85) ─────────────
  private carrera() {
    type Rodante = { id: string; nombre: string; k: number; formula: string; color: number };
    const C: Rodante[] = [
      { id: 'aro', nombre: 'Aro', k: 1, formula: 'I = m·r²', color: 0xd0ae4a },
      { id: 'disco', nombre: 'Disco', k: 0.5, formula: 'I = ½·m·r²', color: 0x4a8a74 },
      { id: 'esfera', nombre: 'Esfera maciza', k: 0.4, formula: 'I = ⅖·m·r²', color: 0x9a6ad0 },
      { id: 'hueca', nombre: 'Esfera hueca', k: 2 / 3, formula: 'I = ⅔·m·r²', color: 0x7fe8d8 },
    ];
    const fase = this.ronda; // 1: ¿quién gana? · 2: ¿quién llega al último? · 3: misma forma, distinta masa
    let corredores: (Rodante & { etiqueta: string })[];
    let pregunta: string, ops: string[], correcta: number;
    if (fase < 3) {
      corredores = Phaser.Utils.Array.Shuffle([...C]).slice(0, 3).map((c) => ({ ...c, etiqueta: c.nombre }));
      const orden = [...corredores].sort((a, b) => a.k - b.k);
      const buscado = fase === 1 ? orden[0] : orden[2];
      pregunta = fase === 1 ? 'Misma masa y mismo radio. Ruedan sin deslizar desde arriba. ¿Quién llega PRIMERO?' : 'Ahora, ¿quién llega AL ÚLTIMO?';
      ops = corredores.map((c) => c.nombre);
      correcta = corredores.indexOf(buscado);
    } else {
      const tipo = Phaser.Utils.Array.GetRandom(C);
      const m1 = Phaser.Math.Between(1, 3), m2 = Phaser.Math.Between(15, 40);
      corredores = [{ ...tipo, etiqueta: `${tipo.nombre} de ${m1} kg` }, { ...tipo, etiqueta: `${tipo.nombre} de ${m2} kg (y más grande)` }];
      pregunta = `Dos ${tipo.nombre.toLowerCase()}s de la misma forma: uno de ${m1} kg y otro de ${m2} kg, más grande. ¿Quién gana?`;
      ops = [`El de ${m2} kg`, `El de ${m1} kg`, 'Llegan al mismo tiempo'];
      correcta = 2;
    }
    this.encabezado("La Carrera de R'lyeh", pregunta);
    // rampas (una por carril) y meta
    const x0 = 70, x1 = 520, y0 = 160, caida = 130, sep = 74;
    const g = this.add.graphics();
    corredores.forEach((_, i) => {
      const yy = y0 + i * sep;
      g.fillStyle(0x1c3632, 1).fillTriangle(x0, yy + 30, x1, yy + caida + 30, x0, yy + caida + 30);
      g.lineStyle(3, 0x4a8a74, 1).lineBetween(x0, yy + 30, x1, yy + caida + 30);
    });
    g.lineStyle(3, 0xff6a7a, 1).lineBetween(x1 - 4, y0 + 10, x1 - 4, y0 + (corredores.length - 1) * sep + caida + 40);
    this.L(g);
    this.L(txt(this, x1 - 8, y0 - 8, 'META', 15, '#ff9aa8').setOrigin(1, 1));
    const R = 18;
    const th = Math.atan2(caida, x1 - x0);
    const piezas = corredores.map((c, i) => {
      const yy = y0 + i * sep;
      const nx = Math.sin(th), ny = -Math.cos(th);
      const cont = this.add.container(x0 + 10 + nx * R, yy + 30 + ny * R + 10 * Math.tan(th));
      const gg = this.add.graphics();
      if (c.id === 'aro') gg.lineStyle(6, c.color, 1).strokeCircle(0, 0, R);
      else if (c.id === 'hueca') { gg.lineStyle(5, c.color, 1).strokeCircle(0, 0, R); gg.lineStyle(2, c.color, 0.6).strokeEllipse(0, 0, 2 * R, R * 0.7); }
      else { gg.fillStyle(c.color, 1).fillCircle(0, 0, R); if (c.id === 'esfera') gg.fillStyle(0xd8c0ff, 1).fillCircle(-6, -6, 5); }
      gg.lineStyle(2, 0x05090a, 1).lineBetween(0, 0, R - 2, 0); // una marca para ver que gira
      cont.add(gg);
      this.L(cont);
      this.L(txt(this, x0 - 4, yy + 40, c.etiqueta, 13, '#e8dcff').setOrigin(0, 0).setDepth(2));
      return cont;
    });
    this.opciones(760, 180, ops, correcta, (ok) => {
      // la carrera: tiempo t = √(2L/a) con a = g·senθ/(1 + k)
      const ts = corredores.map((c) => Math.sqrt(1 + c.k));
      const tMin = Math.min(...ts);
      const dist = (x1 - x0 - 30) / Math.cos(th);
      piezas.forEach((p, i) => {
        const dur = 2400 * (ts[i] / tMin);
        this.tweens.add({ targets: p, x: p.x + dist * Math.cos(th), y: p.y + dist * Math.sin(th), duration: dur, ease: 'Quad.in' });
        this.tweens.add({ targets: p, rotation: dist / R, duration: dur, ease: 'Quad.in' });
      });
      audio.sfx('card');
      const expl = fase < 3
        ? `${corredores.map((c) => `${c.nombre}: ${c.formula}`).join('\n')}\nMenos I (por cada kg) → menos energía se va en girar → más rápido: a = g·senθ/(1 + I/mr²).`
        : 'La masa y el radio se cancelan: a = g·senθ/(1 + I/mr²) sólo depende de la FORMA (I/mr²). Por eso llegan juntos.';
      this.time.delayedCall(2400 * (Math.max(...ts) / tMin) + 200, () => this.resolver('carrera', ok, 'Momento de inercia', expl, 330));
    });
  }

  // ───────────── 5. La Balanza del Ídolo (v0.85) ─────────────
  private balanza() {
    const PX = 46; // píxeles por metro
    const cx = 330, cy = 320;
    // contrapeso y su posición correcta (números enteros)
    let m2 = 0, d2 = 0, izq: { m: number; d: number }[] = [];
    for (let i = 0; i < 200; i++) {
      m2 = Phaser.Math.Between(2, 8); d2 = Phaser.Math.Between(1, 6);
      const M = m2 * d2;
      if (this.ronda < 3) {
        const d1 = Phaser.Math.Between(1, 5);
        if (M % d1 === 0 && M / d1 <= 30 && M / d1 !== m2) { izq = [{ m: M / d1, d: d1 }]; break; }
      } else {
        const d1 = Phaser.Math.Between(1, 3), d3 = Phaser.Math.Between(4, 6);
        const m1 = Phaser.Math.Between(1, 6);
        const resto = M - m1 * d1;
        if (resto > 0 && resto % d3 === 0 && resto / d3 <= 20) { izq = [{ m: m1, d: d1 }, { m: resto / d3, d: d3 }]; break; }
      }
    }
    const Mizq = izq.reduce((a, o) => a + o.m * o.d, 0);
    this.encabezado('La Balanza del Ídolo', `${izq.map((o, i) => `${i ? 'otro' : 'Un'} ídolo de ${o.m} kg a ${o.d} m`).join(' y ')} del lado izquierdo. Tienes un contrapeso de ${m2} kg: haz clic en el punto de la derecha donde la balanza queda en equilibrio.`);
    // soporte (fijo) y viga (gira)
    const base = this.add.graphics();
    base.fillStyle(0x2c5a4e, 1).fillTriangle(cx, cy, cx - 26, cy + 60, cx + 26, cy + 60);
    base.fillStyle(0x1c3632, 1).fillRect(cx - 120, cy + 60, 240, 10);
    this.L(base);
    const viga = this.add.container(cx, cy);
    const vg = this.add.graphics();
    vg.fillStyle(0x7a6424, 1).fillRect(-6.5 * PX, -6, 13 * PX, 12);
    for (let m = -6; m <= 6; m++) { vg.fillStyle(m === 0 ? 0xff6a7a : 0xd0ae4a, 1).fillRect(m * PX - 1, -10, 2, 20); }
    viga.add(vg);
    for (let m = 1; m <= 6; m++) { viga.add(txt(this, -m * PX, 14, `${m}`, 13, CSS.dim).setOrigin(0.5, 0)); viga.add(txt(this, m * PX, 14, `${m}`, 13, CSS.dim).setOrigin(0.5, 0)); }
    izq.forEach((o, i) => {
      const img = this.add.image(-o.d * PX, -8, i === 0 ? 'idoloWilcox' : 'tomoProhibido').setOrigin(0.5, 1).setScale(i === 0 ? 1.1 : 2);
      viga.add([img, txt(this, -o.d * PX, -8 - img.displayHeight - 4, `${o.m} kg`, 15, '#ffd060').setOrigin(0.5, 1)]);
    });
    this.L(viga);
    this.L(txt(this, cx, cy + 76, 'metros desde el eje', 13, CSS.dim).setOrigin(0.5, 0));
    // el contrapeso se pone con un clic sobre la viga (lado derecho)
    const peso = this.add.container(0, 0).setVisible(false);
    const pg = this.add.graphics();
    pg.fillStyle(0x5e6e6c, 1).fillRect(-14, -30, 28, 30);
    pg.fillStyle(0xa4b4ac, 1).fillRect(-10, -36, 20, 6);
    peso.add([pg, txt(this, 0, -44, `${m2} kg`, 15, '#c8e0d8').setOrigin(0.5, 1)]);
    viga.add(peso);
    let jugado = false;
    const marcas: Phaser.GameObjects.Arc[] = [];
    for (let d = 1; d <= 6; d++) {
      const z = this.add.zone(cx + d * PX, cy, PX - 6, 70).setInteractive({ useHandCursor: true });
      const marca = this.add.circle(cx + d * PX, cy - 22, 7, 0x7fe8d8, 0.35);
      this.L(z); this.L(marca);
      marcas.push(marca);
      z.on('pointerover', () => !jugado && marca.setFillStyle(0x7fe8d8, 0.9));
      z.on('pointerout', () => marca.setFillStyle(0x7fe8d8, 0.35));
      z.on('pointerdown', () => {
        if (jugado) return;
        jugado = true;
        marcas.forEach((mk) => mk.setVisible(false));
        peso.setPosition(d * PX, -6).setVisible(true);
        const Mder = m2 * d;
        const dif = Mder - Mizq;
        const ang = Phaser.Math.Clamp(dif * 0.9, -14, 14);
        audio.sfx(dif === 0 ? 'victory' : 'card');
        this.tweens.add({ targets: viga, angle: ang, duration: 900, ease: 'Back.out' });
        const ok = dif === 0;
        const expl = `ΣM = 0 respecto al eje:\n${izq.map((o) => `${o.m}·${o.d}`).join(' + ')} = ${Mizq} N·m (×g) a la izquierda\n${m2}·${d} = ${Mder} a la derecha.${ok ? '' : `\nEl punto correcto era ${d2} m: ${m2}·${d2} = ${Mizq}.`}`;
        this.time.delayedCall(1000, () => this.resolver('balanza', ok, 'Centro de masa', expl, 360));
      });
    }
  }

  // ───────────── resultado ─────────────
  private final(j: Juego) {
    this.limpiar();
    const perfecto = this.aciertos === 3;
    if (perfecto) addEntropia(-CORDURA_PERFECTO);
    this.hud.refresh();
    saveLocal();
    const nombre = JUEGOS.find((x) => x.id === j)!.nombre;
    this.L(title(this, W / 2, 150, nombre, 34, '#9ad8c8'));
    this.L(txt(this, W / 2, 210, `Aciertos: ${this.aciertos} de 3  ·  +${this.aciertos * ERGIOS_ACIERTO} Ergios${perfecto ? `  ·  +${CORDURA_PERFECTO} de Cordura` : ''}`, 22, perfecto ? CSS.gold : CSS.bone).setOrigin(0.5));
    this.L(txt(this, W / 2, 252, perfecto ? '«Montemayor estaría orgulloso. Bueno, si siguiera cuerdo.»' : '«Vuelve a intentarlo en otro gabinete. La física no se va a ningún lado.»', 18, CSS.dim).setOrigin(0.5));
    this.L(button(this, W / 2, 330, 260, 44, 'Volver al gabinete', () => this.menu(), { size: 20, color: UI.gold }));
  }
}
