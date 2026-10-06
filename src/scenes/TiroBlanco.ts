import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { gravityOf } from '../data/gravity';
import { addErgios, Game, logEvent, saveLocal } from '../state';
import { completarEncargo } from '../data/encargos';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, Btn, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';

/** Ergios según qué tan cerca cayó del centro de la diana (en metros) */
const PREMIOS: [number, number, string][] = [[0.5, 25, '¡Diana!'], [1.5, 12, '¡Muy cerca!'], [3, 5, 'Cerca']];
const TIROS = 3;
const X0 = 90, X1 = 860, SUELO = 420; // la escena: del lanzador (X0) al borde (X1)

/**
 * Tiro al blanco: eliges θ y v₀ para que el proyectil caiga en la diana.
 * Alcance: R = v₀²·sen(2θ) / g (con la gravedad del astro de la expedición).
 */
export class TiroBlancoScene extends Phaser.Scene {
  private th = 45;
  private v = 10;
  private g = 9.81;
  private d = 10;
  private escala = 20; // px por metro
  private tiros = 0;
  private ganado = 0;
  private valT!: Phaser.GameObjects.Text;
  private resT!: Phaser.GameObjects.Text;
  private ui: Btn[] = [];
  private tray!: Phaser.GameObjects.Graphics;
  private volver = 'Taberna';
  private floor = 0;
  private hud!: ReturnType<typeof topBar>;

  constructor() { super('TiroBlanco'); }

  create(data: { floor: number; volver?: string }) {
    this.floor = data.floor;
    this.volver = data.volver ?? 'Taberna';
    this.tiros = 0;
    this.ganado = 0;
    this.th = 45;
    this.v = 10;
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    const run = Game.run!;
    const grav = gravityOf(run.gravity);
    this.g = grav.g;
    // la diana queda a una distancia alcanzable con v₀ ≤ 20 m/s
    const rMax = (20 * 20) / this.g;
    this.d = Math.round(Phaser.Math.FloatBetween(0.3, 0.85) * rMax * 2) / 2;
    this.escala = (X1 - X0) / rMax;

    this.add.rectangle(0, 0, W, H, 0x0a0b10).setOrigin(0);
    const tip = new Tooltip(this);
    this.hud = topBar(this, tip);
    title(this, W / 2, 62, 'Tiro al Blanco', 36);
    txt(this, W / 2, 92, `R = v₀²·sen(2θ) / g   ·   g = ${this.g} m/s² (${grav.name})   ·   ${TIROS} tiros`, 18, CSS.dim).setOrigin(0.5);

    // suelo, regla y diana
    const gfx = this.add.graphics();
    gfx.fillStyle(0x1a1620, 1).fillRect(0, SUELO, W, H - SUELO);
    gfx.lineStyle(2, 0x4a4256, 1).lineBetween(0, SUELO, W, SUELO);
    for (let m = 0; m <= rMax; m += 5) {
      const x = X0 + m * this.escala;
      gfx.lineStyle(1, 0x4a4256, 1).lineBetween(x, SUELO, x, SUELO + 8);
      txt(this, x, SUELO + 10, `${m}`, 13, '#5a5468').setOrigin(0.5, 0);
    }
    const dx = X0 + this.d * this.escala;
    for (const [r, c] of [[3, 0x5a2a2a], [1.5, 0xa84a4a], [0.5, 0xe8c15a]] as [number, number][]) {
      gfx.fillStyle(c, 1).fillRect(dx - r * this.escala, SUELO - 4, 2 * r * this.escala, 8);
    }
    gfx.fillStyle(0x6a4a2a, 1).fillRect(dx - 2, SUELO - 46, 4, 42);
    gfx.fillStyle(0xe8c15a, 1).fillCircle(dx, SUELO - 50, 8).fillStyle(0xa84a4a, 1).fillCircle(dx, SUELO - 50, 4);
    txt(this, dx, SUELO - 74, `Diana: ${this.d} m`, 18, CSS.gold).setOrigin(0.5);
    // lanzador
    this.add.image(X0 - 30, SUELO, 'hero').setOrigin(0.5, 1).setScale(1.6);
    this.tray = this.add.graphics();

    // controles
    const panelG = this.add.graphics();
    frame(panelG, 20, 452, 600, 80, 0x0e0b12, UI.border, 0.95);
    this.valT = txt(this, 36, 462, '', 22, CSS.bone);
    this.resT = txt(this, 640, 462, '', 19, CSS.gold, { wordWrap: { width: 300 } });
    const ctl = (x: number, lbl: string, fn: () => void) => this.ui.push(button(this, x, 510, 54, 32, lbl, () => { fn(); this.refresh(); audio.sfx('click'); }, { size: 17, silent: true }));
    this.ui = [];
    ctl(64, 'θ−5', () => (this.th = Math.max(5, this.th - 5)));
    ctl(122, 'θ−1', () => (this.th = Math.max(1, this.th - 1)));
    ctl(180, 'θ+1', () => (this.th = Math.min(89, this.th + 1)));
    ctl(238, 'θ+5', () => (this.th = Math.min(85, this.th + 5)));
    ctl(318, 'v−1', () => (this.v = Math.max(3, this.v - 1)));
    ctl(376, 'v+1', () => (this.v = Math.min(20, this.v + 1)));
    this.ui.push(button(this, 520, 510, 150, 40, '¡Disparar!', () => this.disparar(), { size: 21, color: UI.gold, silent: true }));
    this.resT.setText('Calcula con la fórmula a qué ángulo y rapidez cae en la diana. Pista: con 45° llegas más lejos.');
    this.refresh();
    logEvent('minijuego', '', '', { juego: 'tiro', diana: this.d, g: this.g });
  }

  private refresh() {
    this.valT.setText(`θ = ${this.th}°    v₀ = ${this.v} m/s    Tiro ${Math.min(this.tiros + 1, TIROS)} de ${TIROS}`);
  }

  private disparar() {
    if (this.tiros >= TIROS) return;
    this.ui.forEach((b) => b.setEnabled(false));
    audio.sfx('card');
    const rad = (this.th * Math.PI) / 180;
    const R = (this.v * this.v * Math.sin(2 * rad)) / this.g;
    const tf = (2 * this.v * Math.sin(rad)) / this.g;
    const p = this.add.circle(X0, SUELO, 5, 0xe8c15a).setDepth(5);
    const o = { t: 0 };
    let px = X0, py = SUELO;
    this.tray.lineStyle(2, 0xe8c15a, 0.5);
    this.tweens.add({
      targets: o, t: tf, duration: 900 + tf * 150, ease: 'Linear',
      onUpdate: () => {
        const x = X0 + this.v * Math.cos(rad) * o.t * this.escala;
        const y = SUELO - (this.v * Math.sin(rad) * o.t - 0.5 * this.g * o.t * o.t) * this.escala;
        this.tray.lineBetween(px, py, x, y);
        px = x; py = y;
        p.setPosition(x, Math.min(SUELO, y));
      },
      onComplete: () => this.cae(R, p),
    });
  }

  private cae(R: number, p: Phaser.GameObjects.Arc) {
    this.tiros++;
    const err = Math.abs(R - this.d);
    const premio = PREMIOS.find(([e]) => err <= e);
    const ganas = premio ? premio[1] : 0;
    this.ganado += ganas;
    this.cameras.main.shake(120, 0.004);
    audio.sfx(ganas ? 'coin' : 'wrong');
    const enc = premio && premio[0] === PREMIOS[0][0] ? completarEncargo('diana') : 0;
    const lbl = (premio ? `${premio[2]} +${ganas} ${T.moneda}` : 'Fallaste') + (enc ? ` · Encargo +${enc}` : '');
    const ft = txt(this, p.x, SUELO - 30, lbl, 20, ganas ? CSS.gold : CSS.dim).setOrigin(0.5).setStroke('#000', 4);
    this.tweens.add({ targets: ft, y: SUELO - 70, alpha: 0, delay: 900, duration: 700, onComplete: () => ft.destroy() });
    this.resT.setText(`R = ${this.v}²·sen(${2 * this.th}°)/${this.g} = ${R.toFixed(1)} m\nLa diana estaba a ${this.d} m (${R > this.d ? 'te pasaste' : 'te quedaste corto'} ${err.toFixed(1)} m).`);
    this.refresh();
    if (this.tiros < TIROS) {
      this.time.delayedCall(700, () => this.ui.forEach((b) => b.setEnabled(true)));
      return;
    }
    // fin
    if (this.ganado) addErgios(this.ganado);
    saveLocal();
    this.hud.refresh();
    logEvent('minijuego_fin', '', this.ganado > 0, { juego: 'tiro', premio: this.ganado });
    this.time.delayedCall(1200, () => {
      const g = this.add.graphics().setDepth(30);
      frame(g, W / 2 - 230, 150, 460, 170, 0x0b090e, this.ganado ? UI.gold : UI.border, 0.97);
      title(this, W / 2, 190, this.ganado ? `+${this.ganado} ${T.moneda}` : 'Sin premio', 34, this.ganado ? CSS.gold : CSS.dim).setDepth(31);
      txt(this, W / 2, 232, 'Ángulos complementarios (30° y 60°) llegan igual de lejos.', 17, CSS.dim).setOrigin(0.5).setDepth(31);
      button(this, W / 2, 284, 200, 42, T.runa.continuar, () => fadeTo(this, this.volver, { floor: this.floor }), { size: 21, color: UI.gold }).setDepth(31);
    });
  }
}
void H;
