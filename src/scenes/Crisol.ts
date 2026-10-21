import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CARDS, mezclaDe } from '../data/cards';
import { base, defDiente, esParasito } from '../data/dientes';
import { buscarReceta, marcarReceta, RECETAS_CARTAS, RECETAS_DIENTES, recetaConocida } from '../data/fusiones';
import { aplicarSarro, Game, logEvent, saveLocal, syncRun } from '../state';
import { cardView } from '../ui/card';
import { dibujarDiente } from '../ui/dentadura';
import { topBar } from '../ui/hud';
import { recetario } from '../ui/recetario';
import { button, embers, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/**
 * v0.64 · EL TALLER DE NEWTON (antes «Crisol»; opción de la Fogata). v0.65: cualquier pareja sin receta da una MEZCLA (src/data/cards.ts, m_*). Eliges 2 cartas de tu mazo: si su física
 * se combina (src/data/fusiones.ts) se funden en una carta nueva tras una pregunta (Rune, fuente 'fusion').
 * En el Abismo también se funden DIENTES de tu dentadura (sin pregunta).
 */
const TIPO_COLOR: Record<string, number> = { Ataque: 0xa84a4a, Defensa: 0x4a7ab8, Habilidad: 0x4a9a5a, Poder: 0x9a6ad0, Estado: 0x5a5a5a };

export class CrisolScene extends Phaser.Scene {
  private floor = 0;
  private capa!: Phaser.GameObjects.Container;
  private modo: 'cartas' | 'dientes' = 'cartas';
  private sel: number[] = [];

  constructor() { super('Crisol'); }

  create(data: { floor: number }) {
    this.floor = data.floor;
    this.sel = [];
    this.modo = 'cartas';
    this.cameras.main.fadeIn(300);
    this.add.rectangle(0, 0, W, H, 0x07050a).setOrigin(0);
    const brillo = this.add.circle(790, 300, 160, 0xff8a2a, 0.07).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: brillo, scale: 1.15, alpha: 0.03, duration: 1400, yoyo: true, repeat: -1 });
    embers(this);
    vignette(this);
    const tip = new Tooltip(this);
    topBar(this, tip);
    title(this, W / 2, 70, 'El Taller de Newton', 34, '#ffc080');
    this.capa = this.add.container(0, 0);
    this.dibujar();
  }

  private L<T extends Phaser.GameObjects.GameObject>(o: T) { this.capa.add(o); return o; }

  private dibujar() {
    this.capa.removeAll(true);
    const run = Game.run!;
    const abismo = run.modo === 'abismo';
    this.L(txt(this, W / 2, 96, this.modo === 'cartas'
      ? 'Elige 2 cartas de tu mazo y combínalas en una nueva (las dos se van). Si su física encaja, descubres una RECETA secreta.'
      : 'Elige 2 dientes de tu dentadura. Si se combinan, se funden en uno solo que cuenta como los dos AL DOBLE.', 15, CSS.dim, { align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5, 0));
    if (abismo) {
      this.L(button(this, 150, 130, 150, 30, 'Cartas', () => { this.modo = 'cartas'; this.sel = []; this.dibujar(); }, { size: 16, color: this.modo === 'cartas' ? 0xc8701a : UI.border }));
      this.L(button(this, 310, 130, 150, 30, 'Dientes', () => { this.modo = 'dientes'; this.sel = []; this.dibujar(); }, { size: 16, color: this.modo === 'dientes' ? 0xc8701a : UI.border }));
    }
    const g = this.add.graphics();
    frame(g, 62, 150, 552, 330, 0x0e0a10, 0x6a4a2a, 0.95);
    frame(g, 626, 150, 314, 330, 0x0e0a10, 0x8a5a2a, 0.95);
    this.L(g);
    if (this.modo === 'cartas') this.cartas(); else this.dientes();
    this.L(button(this, 210, 505, 220, 36, '📜 Recetario', () => recetario(this), { size: 18, color: 0x6a4a2a }));
    this.L(button(this, 750, 505, 260, 36, 'Volver a la fogata', () => fadeTo(this, 'Campfire', { floor: this.floor }), { size: 18 }));
  }

  // ───────── cartas ─────────
  private cartas() {
    const run = Game.run!;
    const deck = run.deck.filter((x) => CARDS[x.id] && CARDS[x.id].rarity !== 'estado' && !CARDS[x.id].fusion);
    const cols = 3, w = 176, h = 26;
    deck.slice(0, 36).forEach((inst, i) => {
      const x = 72 + (i % cols) * (w + 4), y = 160 + Math.floor(i / cols) * (h + 1);
      const d = CARDS[inst.id];
      const on = this.sel.includes(inst.uid);
      const g = this.add.graphics();
      g.fillStyle(on ? 0x5a3a1a : 0x1a141e, 1).fillRect(x, y, w, h);
      g.lineStyle(2, on ? 0xffc080 : TIPO_COLOR[d.type] ?? 0x5a5a5a, 1).strokeRect(x, y, w, h);
      this.L(g);
      const t = this.L(txt(this, x + 6, y + 4, `${d.name}${inst.up ? '+' : ''}`, 14, on ? '#ffe0a0' : CSS.bone));
      if (t.width > w - 10) t.setScale((w - 10) / t.width, 1);
      const z = this.L(this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true }));
      z.on('pointerdown', () => this.elegir(inst.uid));
    });
    if (deck.length > 36) this.L(txt(this, 338, 466, `(y ${deck.length - 36} más)`, 13, CSS.dim).setOrigin(0.5, 0));
    // panel derecho: las dos cartas elegidas, de verdad (no sólo el nombre)
    const [a, b] = this.sel.map((uid) => run.deck.find((x) => x.uid === uid)!).filter(Boolean);
    const K = 0.5;
    [a, b].forEach((inst, k) => {
      const x = 700 + k * 166;
      if (inst) this.L(cardView(this, x, 222, inst).setScale(K));
      else {
        const g = this.add.graphics();
        g.lineStyle(2, 0x6a4a2a, 0.8).strokeRect(x - 43, 222 - 60, 86, 120);
        this.L(g);
        this.L(txt(this, x, 222, '?', 30, '#6a4a2a').setOrigin(0.5));
      }
    });
    this.L(txt(this, 783, 222, '+', 30, '#ffc080').setOrigin(0.5));
    if (!a || !b) {
      // pistas de las recetas que aún no conoces (de tu clase)
      const clase = run.clase ?? 'caballero';
      const pistas = RECETAS_CARTAS.filter((r) => !recetaConocida(r.id) && ['neutral', clase].includes(CARDS[r.res].cls ?? 'caballero'));
      this.L(txt(this, 640, 284, pistas.length ? 'Pistas de recetas secretas:' : '¡Ya descubriste todas las recetas de tu clase!', 14, CSS.gold));
      pistas.slice(0, 4).forEach((r, i) => this.L(txt(this, 640, 304 + i * 36, `• ${r.pista}`, 13, '#c8b0e0', { wordWrap: { width: 292 } })));
      this.L(txt(this, 783, 448, 'Cualquier pareja se puede combinar.', 13, CSS.dim).setOrigin(0.5, 0));
      return;
    }
    const r = buscarReceta(RECETAS_CARTAS, a.id, b.id);
    const mz = r ? null : mezclaDe(a.id, b.id);
    this.L(txt(this, 783, 284, '↓', 20, '#ffc080').setOrigin(0.5, 0));
    if (r && !recetaConocida(r.id)) {
      const sigilo = this.L(txt(this, 783, 356, '?', 80, '#ffc080').setOrigin(0.5).setStroke('#000', 6));
      this.tweens.add({ targets: sigilo, scale: 1.15, duration: 500, yoyo: true, repeat: -1 });
    } else this.L(cardView(this, 783, 356, { uid: -300, id: r ? r.res : mz!, up: false }).setScale(0.46));
    this.L(txt(this, 783, 416, r ? (recetaConocida(r.id) ? `Receta: ${r.formula}` : '¡Una receta secreta! Algo se arma…') : 'Mezcla (sin receta exacta): los efectos se superponen', 13, r ? '#ffc080' : '#c8b0e0', { align: 'center', wordWrap: { width: 300 } }).setOrigin(0.5, 0));
    this.L(button(this, 783, 456, 260, 36, 'Combinar (pregunta)', () => {
      audio.sfx('card');
      logEvent('crisol', '', true, r ? { receta: r.id } : { mezcla: mz });
      fadeTo(this, 'Rune', r ? { floor: this.floor, source: 'fusion', receta: r.id, uids: [a.uid, b.uid] } : { floor: this.floor, source: 'fusion', mezcla: mz, uids: [a.uid, b.uid] });
    }, { size: 17, color: 0xc8541a }));
  }

  private elegir(uid: number) {
    audio.sfx('click');
    this.sel = this.sel.includes(uid) ? this.sel.filter((u) => u !== uid) : [...this.sel, uid].slice(-2);
    this.dibujar();
  }

  // ───────── dientes (sólo en el Abismo) ─────────
  private dientes() {
    const run = Game.run!;
    const dent = run.dientes ?? [];
    const huecos = dent.map((x, i) => (x && !esParasito(x) ? i : -1)).filter((i) => i >= 0);
    if (!huecos.length) this.L(txt(this, 315, 300, 'No tienes dientes que fundir.', 18, CSS.dim).setOrigin(0.5));
    huecos.forEach((i, k) => {
      const x = 140 + (k % 4) * 132, y = 220 + Math.floor(k / 4) * 130;
      const on = this.sel.includes(i);
      const g = this.add.graphics();
      frame(g, x - 60, y - 52, 120, 120, on ? 0x3a2410 : 0x14101a, on ? 0xffc080 : 0x4a3a5a, 0.95);
      this.L(g);
      this.L(dibujarDiente(this, x, y - 8, dent[i], 0.8));
      const t = this.L(txt(this, x, y + 40, defDiente(dent[i]!).nombre, 12, on ? '#ffe0a0' : CSS.bone, { align: 'center', wordWrap: { width: 112 } }).setOrigin(0.5, 0));
      void t;
      const z = this.L(this.add.zone(x - 60, y - 52, 120, 120).setOrigin(0).setInteractive({ useHandCursor: true }));
      z.on('pointerdown', () => this.elegir(i));
    });
    if (this.sel.length < 2) {
      const pistas = RECETAS_DIENTES.filter((r) => !recetaConocida(r.id));
      this.L(txt(this, 640, 162, pistas.length ? 'Pistas del Recetario:' : '¡Conoces todas las fusiones de dientes!', 15, CSS.gold));
      pistas.forEach((r, i) => this.L(txt(this, 640, 188 + i * 52, `• ${r.pista}`, 14, '#c8b0e0', { wordWrap: { width: 290 } })));
      return;
    }
    const [i, j] = this.sel;
    const r = buscarReceta(RECETAS_DIENTES, base(dent[i]!), base(dent[j]!));
    this.L(txt(this, 783, 170, `${defDiente(dent[i]!).nombre}\n+ ${defDiente(dent[j]!).nombre}`, 15, CSS.bone, { align: 'center' }).setOrigin(0.5, 0));
    if (!r) {
      this.L(txt(this, 783, 280, 'No reaccionan.\nPrueba otra pareja.', 17, CSS.dim, { align: 'center' }).setOrigin(0.5, 0));
      return;
    }
    if (recetaConocida(r.id)) this.L(dibujarDiente(this, 783, 300, r.res, 1.1));
    else { const q = this.L(txt(this, 783, 300, '?', 90, '#ffc080').setOrigin(0.5).setStroke('#000', 6)); this.tweens.add({ targets: q, scale: 1.15, duration: 500, yoyo: true, repeat: -1 }); }
    this.L(txt(this, 783, 370, recetaConocida(r.id) ? defDiente(r.res).nombre : '¡Algo se arma en el taller!', 15, '#ffc080', { align: 'center', wordWrap: { width: 290 } }).setOrigin(0.5, 0));
    this.L(button(this, 783, 446, 240, 40, 'Combinar', () => {
      dent[i] = r.res;
      dent[j] = null;
      marcarReceta(r.id);
      aplicarSarro(run);
      logEvent('fusion', 'Dientes', true, { receta: r.id });
      run.floor = this.floor + 1;
      saveLocal();
      syncRun('en curso');
      audio.sfx('coin');
      this.cameras.main.flash(400, 255, 180, 90);
      this.capa.removeAll(true);
      const c = this.L(this.add.container(0, 0));
      const fg = this.add.graphics();
      frame(fg, W / 2 - 300, 150, 600, 290, 0x120a06, 0xffc080, 0.98);
      c.add(fg);
      c.add(title(this, W / 2, 176, `¡Nace ${defDiente(r.res).nombre}!`, 28, '#ffc080'));
      c.add(dibujarDiente(this, W / 2, 268, r.res, 1.3));
      c.add(txt(this, W / 2, 330, `${defDiente(r.res).texto}\n${r.explica}`, 15, CSS.bone, { align: 'center', wordWrap: { width: 560 } }).setOrigin(0.5, 0));
      c.add(button(this, W / 2, 412, 200, 38, 'Seguir', () => fadeTo(this, 'Map'), { size: 18, color: UI.gold }));
    }, { size: 18, color: 0xc8541a }));
  }
}
