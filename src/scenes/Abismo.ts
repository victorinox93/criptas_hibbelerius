import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CARDS } from '../data/cards';
import {
  ACTO_ABISMO, CORDURA, editarAlAzar, mazoCiego, PACTO_CIEGO_CORDURA, PactoDef, PACTOS, PaginaDef, PAGINAS, PROLOGO, RARAS_ABISMO,
} from '../data/abismo_modo';
import { codexFlag, Game, generateMap, newRun, saveLocal, unlock } from '../state';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/**
 * EL ABISMO DE LOS EJES · inicio de la expedición:
 *   1. Prólogo (el diario del profesor Arrieta; se puede saltar)
 *   2. Una página del Necronomicón (modificador para toda la expedición)
 *   3. El Pacto (mazo inicial) o el Pacto ciego (mazo al azar)
 * Por ahora sólo se entra desde el Modo profesor (src/scenes/Debug.ts).
 */
export interface AbismoData {
  clase: string;
  gravedad?: number;
  debug?: boolean;
  tanque?: boolean; // Modo profesor: vida ×10
  saltarPrologo?: boolean;
}

export class AbismoScene extends Phaser.Scene {
  private d!: AbismoData;
  private layer!: Phaser.GameObjects.Container;
  private tip!: Tooltip;
  private pagina: PaginaDef | null = null;

  constructor() { super('Abismo'); }

  create(data: AbismoData) {
    this.d = data;
    this.pagina = null;
    this.cameras.main.fadeIn(700);
    audio.play('abismo');
    this.fondo();
    this.tip = new Tooltip(this);
    this.layer = this.add.container(0, 0);
    if (data.saltarPrologo) this.necronomicon();
    else this.prologo(0);
  }

  /** Mar oscuro con ondas lentas y burbujas */
  private fondo() {
    const g = this.add.graphics().setDepth(-10);
    for (let i = 0; i < 12; i++) g.fillStyle(Phaser.Display.Color.GetColor(4, 12 + i, 12 + i), 1).fillRect(0, (i * H) / 12, W, H / 12 + 1);
    for (let i = 0; i < 6; i++) {
      const w = this.add.graphics().setDepth(-9);
      w.lineStyle(2, 0x1c3a32, 0.5);
      const y0 = 80 + i * 80;
      w.beginPath();
      for (let x = 0; x <= W; x += 12) w.lineTo(x, y0 + Math.sin(x / 70 + i) * 6);
      w.strokePath();
      this.tweens.add({ targets: w, x: (i % 2 ? -1 : 1) * 40, duration: 6000 + i * 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    this.add.particles(0, 0, 'px', {
      x: { min: 0, max: W }, y: H, speedY: { min: -36, max: -14 }, lifespan: 10000, frequency: 260,
      scale: { start: 1.2, end: 2.6 }, alpha: { start: 0.3, end: 0 }, tint: 0x9ad8c8,
    }).setDepth(-8);
    vignette(this);
  }

  private limpiar() {
    this.layer.removeAll(true);
    this.tip.hide();
  }

  // ── 1. Prólogo ──
  private prologo(i: number) {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    if (i >= PROLOGO.length) {
      codexFlag('abismo_prologo');
      L(title(this, W / 2, 210, 'El Abismo de los Ejes', 64, '#9ad8c8'));
      L(txt(this, W / 2, 268, 'Bajas a la ciudad hundida que el profesor Arrieta vio en sueños.', 22, CSS.bone).setOrigin(0.5));
      L(txt(this, W / 2, 300, 'Una respuesta correcta te devuelve la cordura. Un error te la quita.', 20, CSS.dim).setOrigin(0.5));
      L(button(this, W / 2, 380, 260, 44, 'Abrir el Necronomicón', () => this.necronomicon(), { color: UI.gold, size: 22 }));
      return;
    }
    const pg = PROLOGO[i];
    const g = this.add.graphics();
    frame(g, W / 2 - 330, 70, 660, 340, 0x16130e, 0x5a4a2e, 0.97);
    g.lineStyle(1, 0x3a3020, 0.6);
    for (let y = 130; y < 400; y += 26) g.lineBetween(W / 2 - 300, y, W / 2 + 300, y); // renglones del cuaderno
    L(g);
    L(txt(this, W / 2 - 300, 86, `Diario del profesor Elías Arrieta · página ${i + 1}/${PROLOGO.length}`, 17, '#8a7a5a'));
    L(txt(this, W / 2 + 300, 86, pg.fecha, 17, '#8a7a5a').setOrigin(1, 0));
    const t = L(txt(this, W / 2, 140, '', 24, '#d8c8a0', { align: 'center', wordWrap: { width: 580 }, lineSpacing: 6 }).setOrigin(0.5, 0));
    // se escribe letra por letra, como si alguien lo estuviera escribiendo ahora
    let n = 0;
    const ev = this.time.addEvent({ delay: 22, repeat: pg.texto.length - 1, callback: () => t.setText(pg.texto.slice(0, ++n)) });
    const sig = () => { if (n < pg.texto.length) { ev.remove(); t.setText(pg.texto); n = pg.texto.length; return; } this.prologo(i + 1); };
    L(button(this, W / 2 + 120, 450, 200, 40, i === PROLOGO.length - 1 ? 'Cerrar el diario' : 'Siguiente', sig, { color: UI.gold, size: 21 }));
    L(button(this, W / 2 - 120, 450, 200, 40, 'Saltar prólogo', () => this.prologo(PROLOGO.length), { size: 19 }));
  }

  // ── 2. Necronomicón: elige una página ──
  private necronomicon() {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    L(title(this, W / 2, 48, 'El Necronomicón de Hibbelerius', 40, '#c8a8e8'));
    L(txt(this, W / 2, 86, 'El libro se abre solo en tres páginas. Arranca una: te acompañará toda la expedición.', 19, CSS.bone).setOrigin(0.5));
    const libro = L(this.add.image(W / 2, 124, 'i_necro').setScale(4).setAlpha(0.95));
    this.tweens.add({ targets: libro, y: 116, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const opciones = Phaser.Utils.Array.Shuffle([...PAGINAS]).slice(0, 3);
    opciones.forEach((p, i) => {
      const x = W / 2 + (i - 1) * 300, y = 154;
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      frame(g, -135, 0, 270, 300, 0x14101a, 0x5a3a7a, 0.97);
      c.add(g);
      c.add(txt(this, 0, 16, p.nombre, 24, '#d8b8ff', { align: 'center', wordWrap: { width: 240 } }).setOrigin(0.5, 0));
      c.add(txt(this, -118, 74, 'Poder', 16, CSS.dim));
      c.add(txt(this, -118, 94, p.poder, 18, CSS.green, { wordWrap: { width: 236 } }));
      c.add(txt(this, -118, 170, 'Costo', 16, CSS.dim));
      c.add(txt(this, -118, 190, p.costo, 18, '#e08a8a', { wordWrap: { width: 236 } }));
      c.add(txt(this, 0, 284, p.lore, 15, CSS.purple, { align: 'center', wordWrap: { width: 240 } }).setOrigin(0.5, 1));
      c.setSize(270, 300).setInteractive(new Phaser.Geom.Rectangle(-135, 0, 270, 300), Phaser.Geom.Rectangle.Contains);
      c.input!.cursor = 'pointer';
      c.on('pointerover', () => this.tweens.add({ targets: c, y: y - 8, duration: 120 }));
      c.on('pointerout', () => this.tweens.add({ targets: c, y, duration: 120 }));
      c.on('pointerdown', () => {
        audio.sfx('card');
        this.pagina = p;
        this.cameras.main.flash(300, 60, 30, 90);
        this.pacto();
      });
      L(c);
    });
    L(txt(this, W / 2, 476, 'Las páginas cambian en cada expedición.', 17, CSS.dim).setOrigin(0.5));
  }

  // ── 3. El Pacto: elige tu mazo ──
  private pacto() {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    L(title(this, W / 2, 48, 'El Pacto', 44, '#9ad8c8'));
    L(txt(this, W / 2, 86, `Página elegida: ${this.pagina?.nombre ?? '—'}. Ahora elige con qué mazo bajas.`, 19, CSS.bone).setOrigin(0.5));
    const clase = this.d.clase;
    const opciones = Phaser.Utils.Array.Shuffle([...PACTOS]).slice(0, 3);
    opciones.forEach((p, i) => {
      const x = W / 2 + (i - 1) * 300, y = 118;
      const ids = p.mazo(clase);
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      frame(g, -135, 0, 270, 280, 0x0c1614, 0x2c5a4e, 0.97);
      c.add(g);
      c.add(txt(this, 0, 14, p.nombre, 24, '#9ad8c8').setOrigin(0.5, 0));
      c.add(txt(this, -118, 52, p.regla, 18, CSS.bone, { wordWrap: { width: 236 } }));
      c.add(txt(this, -118, 160, `Mazo (${ids.length + (p.id === 'hueco' ? 1 : 0)} cartas):`, 16, CSS.dim));
      c.add(txt(this, -118, 180, this.resumen(ids) + (p.id === 'hueco' ? '\n+ 1 carta rara de Lámina' : ''), 15, CSS.gold, { wordWrap: { width: 236 } }));
      c.setSize(270, 280).setInteractive(new Phaser.Geom.Rectangle(-135, 0, 270, 280), Phaser.Geom.Rectangle.Contains);
      c.input!.cursor = 'pointer';
      c.on('pointerover', () => this.tweens.add({ targets: c, y: y - 8, duration: 120 }));
      c.on('pointerout', () => this.tweens.add({ targets: c, y, duration: 120 }));
      c.on('pointerdown', () => this.empezar(p));
      L(c);
    });
    L(button(this, W / 2, 440, 380, 44, `Pacto ciego: mazo al azar y +${PACTO_CIEGO_CORDURA} de Cordura`, () => this.empezar(null), { size: 19, color: UI.border }));
    L(button(this, W / 2, 496, 200, 36, 'Volver al libro', () => this.necronomicon(), { size: 18 }));
  }

  /** «4× Golpe de Mazo, 4× Fuerza Normal…» */
  private resumen(ids: string[]) {
    const n = new Map<string, number>();
    ids.forEach((id) => n.set(id, (n.get(id) ?? 0) + 1));
    return [...n].map(([id, k]) => `${k}× ${CARDS[id].name}`).join(', ');
  }

  /** Crea la expedición del Abismo y baja al mapa */
  private empezar(p: PactoDef | null) {
    audio.sfx('card');
    const d = this.d;
    const r = newRun(`${d.debug ? 'DBG' : 'ABI'}-${Date.now().toString(36)}`, d.gravedad ?? 1, d.clase);
    r.debug = d.debug ?? true;
    r.modo = 'abismo';
    r.acto = ACTO_ABISMO;
    r.map = generateMap(ACTO_ABISMO);
    r.necro = this.pagina?.id;
    r.pacto = p?.id ?? 'ciego';
    r.entropia = 100 - CORDURA.inicial;
    let uid = 1;
    const ids = p ? p.mazo(d.clase) : mazoCiego(d.clase);
    r.deck = ids.map((id) => ({ uid: uid++, id, up: false }));
    if (p?.id === 'hueco') r.deck.push({ uid: uid++, id: Phaser.Utils.Array.GetRandom(RARAS_ABISMO), up: false, ed: 'lamina' });
    r.nextUid = uid;
    if (p?.vidaMax) { r.maxHp += p.vidaMax; r.hp = r.maxHp; }
    if (!p) r.entropia = Math.max(0, r.entropia - PACTO_CIEGO_CORDURA);
    // efectos iniciales de la página del Necronomicón
    switch (r.necro) {
      case 'geometria': r.maxHp -= 10; r.hp = r.maxHp; break;
      case 'mercader': r.ergios += 100; r.entropia += 15; break;
      case 'confusion': editarAlAzar(r.deck, 'poli', 1); break;
      case 'cristal': editarAlAzar(r.deck, 'cristal', 3); break;
    }
    if (d.tanque) r.maxHp = r.hp = r.maxHp * 10;
    r.relics = ['necronomicon']; // el libro baja contigo
    r.deck.forEach((c) => unlock('cards', c.id));
    unlock('relics', 'necronomicon');
    Game.run = r;
    saveLocal();
    this.cameras.main.flash(400, 20, 60, 50);
    fadeTo(this, 'Map');
  }
}
