import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CardInst, CARDS } from '../data/cards';
import {
  abrirSobre, ACTO_ABISMO, CartaSobre, CORDURA, EDICIONES, editarAlAzar, ELIGES_POR_SOBRE, mazoCiego, PACTO_CIEGO_CORDURA, PactoDef, PACTOS, PaginaDef, PAGINAS, PROLOGO,
  RARAS_ABISMO, rarezaDe, SobreDef, SOBRES,
} from '../data/abismo_modo';
import { cardView, CW, CH } from '../ui/card';
import { guiaAbismo } from '../ui/guiaAbismo';
import { codexFlag, Game, generateMap, newRun, saveLocal, unlock } from '../state';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/**
 * EL ABISMO DE LOS EJES · inicio de la expedición:
 *   1. Prólogo (el diario del profesor Arrieta; se puede saltar)
 *   2. Una página del Necronomicón (modificador para toda la expedición)
 *   3. El Pacto (mazo base) o el Pacto ciego (mazo al azar)
 *   4. Tres sobres (como Pokémon TCG): de cada uno te quedas con 2 cartas
 * La primera vez sale la Guía del Abismo (src/ui/guiaAbismo.ts); luego, con el botón «Guía».
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
  private elegido: PactoDef | null = null; // null = Pacto ciego
  private mazo: { id: string; up: boolean; ed?: CardInst['ed'] }[] = [];

  constructor() { super('Abismo'); }

  create(data: AbismoData) {
    this.d = data;
    this.pagina = null;
    this.elegido = null;
    this.mazo = [];
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

  /** Botón «Guía» en la esquina (abre la Guía del Abismo encima) */
  private botonGuia() {
    this.layer.add(button(this, 70, 26, 110, 32, '? Guía', () => guiaAbismo(this), { size: 18, color: 0x2c5a4e }));
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
      const primera = !(Game.codex.flags ?? []).includes('abismo_guia');
      if (primera) {
        // la primera vez se explican las reglas antes de abrir el libro
        L(button(this, W / 2, 380, 340, 44, 'Aprender las reglas del Abismo', () => guiaAbismo(this, () => this.necronomicon()), { color: UI.gold, size: 22 }));
        L(button(this, W / 2, 436, 260, 36, 'Ya las conozco', () => this.necronomicon(), { size: 18 }));
      } else {
        L(button(this, W / 2, 380, 260, 44, 'Abrir el Necronomicón', () => this.necronomicon(), { color: UI.gold, size: 22 }));
        L(button(this, W / 2, 436, 260, 36, 'Repasar las reglas', () => guiaAbismo(this), { size: 18 }));
      }
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
    this.botonGuia();
  }

  // ── 3. El Pacto: elige tu mazo ──
  private pacto() {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    L(title(this, W / 2, 48, 'El Pacto', 44, '#9ad8c8'));
    L(txt(this, W / 2, 86, `Página: ${this.pagina?.nombre ?? '—'}. Elige tu mazo base; después abrirás 3 sobres (+${SOBRES.length * ELIGES_POR_SOBRE} cartas).`, 19, CSS.bone).setOrigin(0.5));
    this.botonGuia();
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
      c.on('pointerdown', () => this.firmar(p));
      L(c);
    });
    L(button(this, W / 2, 440, 380, 44, `Pacto ciego: mazo al azar y +${PACTO_CIEGO_CORDURA} de Cordura`, () => this.firmar(null), { size: 19, color: UI.border }));
    L(button(this, W / 2, 496, 200, 36, 'Volver al libro', () => this.necronomicon(), { size: 18 }));
  }

  /** «4× Golpe de Mazo, 4× Fuerza Normal…» */
  private resumen(ids: string[]) {
    const n = new Map<string, number>();
    ids.forEach((id) => n.set(id, (n.get(id) ?? 0) + 1));
    return [...n].map(([id, k]) => `${k}× ${CARDS[id].name}`).join(', ');
  }

  /** Firma el Pacto: guarda el mazo base y pasa a los sobres */
  private firmar(p: PactoDef | null) {
    audio.sfx('card');
    this.elegido = p;
    const ids = p ? p.mazo(this.d.clase) : mazoCiego(this.d.clase);
    this.mazo = ids.map((id) => ({ id, up: false }));
    if (p?.id === 'hueco') this.mazo.push({ id: Phaser.Utils.Array.GetRandom(RARAS_ABISMO), up: false, ed: 'lamina' });
    this.cameras.main.flash(250, 20, 60, 50);
    this.sobre(0);
  }

  // ── 4. Sobres: rasgas el empaque, se voltean 5 cartas y te quedas con 2 ──
  private sobre(n: number) {
    if (n >= SOBRES.length) return this.empezar();
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const def = SOBRES[n];
    L(title(this, W / 2, 46, `Sobre ${n + 1} de ${SOBRES.length}`, 40, '#9ad8c8'));
    L(txt(this, W / 2, 84, `${def.nombre}: ${def.texto} Trae 5 cartas; te quedas con ${ELIGES_POR_SOBRE}. Tu mazo: ${this.mazo.length} cartas.`, 18, CSS.bone, { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5, 0));
    this.botonGuia();
    const emp = L(this.empaque(def, W / 2, 300));
    this.tweens.add({ targets: emp, y: 292, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // se abre con clic en el sobre, con el botón o con Enter (sólo una vez)
    let abierto = false;
    const abrir = () => { if (abierto || !emp.active) return; abierto = true; this.rasgar(def, emp, n); };
    L(button(this, W / 2, 462, 240, 42, 'Rasgar el sobre', abrir, { size: 21, color: UI.gold }));
    emp.setSize(170, 236).setInteractive({ useHandCursor: true });
    emp.on('pointerdown', abrir);
    this.input.keyboard?.once('keydown-ENTER', abrir);
  }

  /** Dibujo del sobre: empaque metalizado con orillas dentadas y un destello que cruza */
  private empaque(def: SobreDef, x: number, y: number) {
    const c = this.add.container(x, y);
    const w = 170, h = 236;
    const g = this.add.graphics();
    g.fillStyle(def.color, 1).fillRect(-w / 2, -h / 2 + 14, w, h - 28);
    // orillas dentadas (el «sellado» de un sobre de cartas)
    for (const yy of [-h / 2, h / 2 - 14]) for (let xx = -w / 2; xx < w / 2; xx += 10) g.fillStyle(def.brillo, 0.85).fillTriangle(xx, yy + (yy < 0 ? 14 : 0), xx + 10, yy + (yy < 0 ? 14 : 0), xx + 5, yy + (yy < 0 ? 2 : 12));
    g.lineStyle(3, def.brillo, 1).strokeRect(-w / 2, -h / 2 + 14, w, h - 28);
    g.fillStyle(0x000000, 0.35).fillRect(-w / 2 + 12, -h / 2 + 40, w - 24, 110);
    g.lineStyle(1, def.brillo, 0.6).strokeRect(-w / 2 + 12, -h / 2 + 40, w - 24, 110);
    const ic = this.add.image(0, -h / 2 + 95, def.icono).setScale(5);
    const nom = txt(this, 0, h / 2 - 66, def.nombre, 20, '#ffffff', { align: 'center', wordWrap: { width: w - 20 } }).setOrigin(0.5).setStroke('#000', 4);
    const sub = txt(this, 0, h / 2 - 32, '5 cartas', 15, CSS.gold).setOrigin(0.5);
    const shine = this.add.graphics();
    const t = { v: 0 };
    const tw = this.tweens.add({ targets: t, v: 1, duration: 2200, repeat: -1, onUpdate: () => {
      shine.clear();
      const x0 = -w + t.v * w * 2.4;
      for (let k = 0; k < 3; k++) {
        const xx = x0 + k * 10;
        const m = k === 1 ? 8 : 4; // el trazo no se sale del empaque
        const ya = Math.max(-h / 2 + 14 + m, (-w / 2 + m - xx) / 0.5), yb = Math.min(h / 2 - 14 - m, (w / 2 - m - xx) / 0.5);
        if (yb > ya) shine.lineStyle(k === 1 ? 10 : 3, 0xffffff, k === 1 ? 0.18 : 0.35).lineBetween(xx + 0.5 * ya, ya, xx + 0.5 * yb, yb);
      }
    } });
    c.once('destroy', () => tw.stop());
    c.add([g, ic, nom, sub, shine]);
    return c;
  }

  /** Animación de abrir: el sobre tiembla, se rasga la tira de arriba y salen las cartas boca abajo */
  private rasgar(def: SobreDef, emp: Phaser.GameObjects.Container, n: number) {
    audio.sfx('card');
    this.tweens.killTweensOf(emp);
    this.tweens.add({ targets: emp, x: emp.x + 5, duration: 45, yoyo: true, repeat: 5, onComplete: () => {
      const tira = this.add.graphics().setPosition(emp.x, emp.y - 104);
      tira.fillStyle(def.brillo, 1).fillRect(-85, -14, 170, 16);
      this.layer.add(tira);
      this.tweens.add({ targets: tira, y: tira.y - 120, angle: -25, alpha: 0, duration: 600, onComplete: () => tira.destroy() });
      this.cameras.main.flash(200, 255, 255, 255);
      this.tweens.add({ targets: emp, y: emp.y + 160, alpha: 0, duration: 500, delay: 150, onComplete: () => this.revelar(def, n) });
    } });
  }

  /** Las 5 cartas aparecen boca abajo y se voltean; eliges 2 */
  private revelar(def: SobreDef, n: number) {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    L(title(this, W / 2, 46, def.nombre, 40, '#9ad8c8'));
    const aviso = L(txt(this, W / 2, 84, `Elige ${ELIGES_POR_SOBRE} cartas para tu mazo (clic para marcar o desmarcar).`, 19, CSS.bone).setOrigin(0.5, 0));
    this.botonGuia();
    const cartas = abrirSobre(def.id, this.d.clase);
    const elegidas = new Set<number>();
    const K = 0.82, y = 290;
    const ok = button(this, W / 2, 492, 300, 42, `Quedarme con estas (0/${ELIGES_POR_SOBRE})`, () => {
      if (elegidas.size < ELIGES_POR_SOBRE) return;
      for (const i of elegidas) this.mazo.push({ id: cartas[i].id, up: cartas[i].up, ed: cartas[i].ed });
      audio.sfx('coin');
      this.sobre(n + 1);
    }, { size: 19, color: UI.gold });
    ok.setEnabled(false);
    L(ok);
    const marcos: Phaser.GameObjects.Graphics[] = [];
    cartas.forEach((cs: CartaSobre, i) => {
      const x = W / 2 + (i - 2) * 176;
      // dorso
      const dorso = this.add.container(W / 2, 520).setScale(0.3);
      const dg = this.add.graphics();
      frame(dg, -CW / 2, -CH / 2, CW, CH, def.color, def.brillo);
      dg.lineStyle(3, def.brillo, 0.8).strokeTriangle(0, -50, -44, 30, 44, 30);
      dg.fillStyle(0xb8ff9a, 0.9).fillCircle(0, 4, 9);
      dorso.add(dg);
      L(dorso);
      this.tweens.add({ targets: dorso, x, y, scale: K, duration: 380, delay: i * 110, ease: 'Back.out', onComplete: () => {
        // se voltea (la brillante, al final y con destello)
        this.tweens.add({ targets: dorso, scaleX: 0, duration: 140, delay: 300 + i * 160 + (cs.brillante ? 300 : 0), onComplete: () => {
          dorso.destroy();
          const v = L(cardView(this, x, y, { uid: -100 - i, id: cs.id, up: cs.up, ed: cs.ed }).setScale(0, K));
          this.tweens.add({ targets: v, scaleX: K, duration: 160 });
          if (cs.brillante) { this.cameras.main.flash(250, 200, 160, 255); audio.sfx('coin'); }
          const rz = rarezaDe(cs.id);
          L(txt(this, x, y + 108, cs.ed ? `${rz.t} · ${EDICIONES[cs.ed].nombre}` : rz.t, 15, cs.ed ? '#e6c8ff' : rz.css).setOrigin(0.5, 0));
          const marco = this.add.graphics();
          marcos[i] = L(marco);
          v.setInteractive({ useHandCursor: true });
          v.on('pointerover', () => {
            const d = CARDS[cs.id];
            this.tip.show(x < W / 2 ? x + 80 : x - 340, 120, cs.ed ? `${d.name} · ${EDICIONES[cs.ed].nombre}` : d.name, `${cs.ed ? `${EDICIONES[cs.ed].texto}\n\n` : ''}${d.concept}: ${d.lore}`);
          });
          v.on('pointerout', () => this.tip.hide());
          v.on('pointerdown', () => {
            if (elegidas.has(i)) elegidas.delete(i);
            else if (elegidas.size < ELIGES_POR_SOBRE) elegidas.add(i);
            else return void this.tweens.add({ targets: v, x: x + 6, duration: 40, yoyo: true, repeat: 3 });
            audio.sfx('click');
            const sel = elegidas.has(i);
            this.tweens.add({ targets: v, y: sel ? y - 18 : y, duration: 120 });
            marco.clear();
            if (sel) marco.lineStyle(4, 0xe8c15a, 1).strokeRect(x - (CW * K) / 2 - 6, y - 18 - (CH * K) / 2 - 6, CW * K + 12, CH * K + 12);
            ok.label.setText(`Quedarme con estas (${elegidas.size}/${ELIGES_POR_SOBRE})`);
            ok.setEnabled(elegidas.size === ELIGES_POR_SOBRE);
            aviso.setText(elegidas.size === ELIGES_POR_SOBRE ? '¡Listo! Confirma con el botón de abajo.' : `Elige ${ELIGES_POR_SOBRE - elegidas.size} carta(s) más.`);
          });
        } });
      } });
    });
  }

  /** Crea la expedición del Abismo y baja al mapa */
  private empezar() {
    const p = this.elegido;
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
    r.deck = this.mazo.map((c) => (c.ed ? { uid: uid++, id: c.id, up: c.up, ed: c.ed } : { uid: uid++, id: c.id, up: c.up }));
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
