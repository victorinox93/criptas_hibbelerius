import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { completarEncargo } from '../data/encargos';
import { fmt, MAGNITUDES, Objeto, parAzar } from '../data/masmenos';
import { addErgios, Game, logEvent, saveLocal } from '../state';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';

/** Rondas máximas: con 5 aciertos la apuesta se multiplica ×32 */
const MAX_RONDAS = 5;

/** «¿Más o menos?»: doble o nada comparando K = ½mv² o p = m·v (datos en src/data/masmenos.ts) */
export class MasMenosScene extends Phaser.Scene {
  private apuesta = 0;
  private bote = 0;
  private aciertos = 0;
  private layer!: Phaser.GameObjects.Container;
  private hud!: ReturnType<typeof topBar>;
  private volver = 'Taberna';
  private floor = 0;

  constructor() { super('MasMenos'); }

  create(data: { floor: number; volver?: string }) {
    this.floor = data.floor;
    this.volver = data.volver ?? 'Taberna';
    this.aciertos = 0;
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    this.add.rectangle(0, 0, W, H, 0x100a08).setOrigin(0);
    const tip = new Tooltip(this);
    this.hud = topBar(this, tip);
    this.layer = this.add.container(0, 0);
    this.elegirApuesta();
  }

  private elegirApuesta() {
    const run = Game.run!;
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    this.layer.removeAll(true);
    L(title(this, W / 2, 80, '¿Más o menos?', 44, '#e8b070'));
    L(txt(this, W / 2, 140, 'Te muestro dos cosas con su masa y su rapidez.\nTú eliges cuál tiene MÁS energía cinética o MÁS cantidad de movimiento.\nCada acierto DUPLICA tu apuesta. Retírate cuando quieras… si fallas, la pierdes.', 19, CSS.bone, { align: 'center', lineSpacing: 4 }).setOrigin(0.5, 0));
    L(txt(this, W / 2, 262, 'K = ½·m·v²   ·   p = m·v', 24, '#9ad8f0').setOrigin(0.5));
    L(txt(this, W / 2, 320, '¿Cuánto apuestas?', 22, CSS.gold).setOrigin(0.5));
    [10, 25, 50].forEach((n, i) => {
      L(button(this, W / 2 + (i - 1) * 170, 372, 150, 46, `${n} ${T.moneda}`, () => {
        this.apuesta = this.bote = n;
        addErgios(-n);
        this.hud.refresh();
        logEvent('minijuego', '', '', { juego: 'masmenos', apuesta: n });
        this.ronda();
      }, { size: 22, color: UI.gold, enabled: run.ergios >= n }));
    });
    L(button(this, W / 2, 450, 200, 36, 'Mejor no', () => this.salir(), { size: 19 }));
  }

  private ronda() {
    const { a, b, mag } = parAzar();
    const M = MAGNITUDES[mag];
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    this.layer.removeAll(true);
    L(txt(this, W / 2, 62, `Ronda ${this.aciertos + 1} de ${MAX_RONDAS}  ·  En juego: ${this.bote} ${T.moneda}`, 20, CSS.gold).setOrigin(0.5));
    L(txt(this, W / 2, 104, `¿Cuál tiene MÁS ${M.nombre}?`, 30, CSS.bone).setOrigin(0.5));
    L(txt(this, W / 2, 140, M.formula, 22, '#9ad8f0').setOrigin(0.5));
    L(txt(this, W / 2, 268, 'o', 30, CSS.dim).setOrigin(0.5));

    const tarjeta = (o: Objeto, x: number, otro: Objeto) => {
      const g = this.add.graphics();
      const draw = (hi: boolean) => { g.clear(); frame(g, x - 190, 170, 380, 200, hi ? 0x2a1e14 : 0x1a120c, hi ? UI.gold : 0xd89a4a, 0.97); };
      draw(false);
      L(g);
      L(txt(this, x, 200, o[0], 22, '#e8b070', { align: 'center', wordWrap: { width: 350 } }).setOrigin(0.5, 0));
      L(txt(this, x, 280, `m = ${fmt(o[1])} kg\nv = ${fmt(o[2])} m/s`, 22, CSS.bone, { align: 'center', lineSpacing: 6 }).setOrigin(0.5, 0));
      const z = this.add.zone(x - 190, 170, 380, 200).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerover', () => draw(true));
      z.on('pointerout', () => draw(false));
      z.on('pointerdown', () => this.resolver(o, otro, mag));
      L(z);
    };
    tarjeta(a, W / 2 - 230, b);
    tarjeta(b, W / 2 + 230, a);
    if (this.aciertos > 0) {
      L(button(this, W / 2, 470, 280, 44, `Retirarme con ${this.bote} ${T.moneda}`, () => this.final(true), { size: 20, color: UI.green }));
    }
  }

  private resolver(elegido: Objeto, otro: Objeto, mag: 'K' | 'p') {
    const M = MAGNITUDES[mag];
    const ve = M.calc(elegido[1], elegido[2]), vo = M.calc(otro[1], otro[2]);
    const ok = ve > vo;
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    this.layer.removeAll(true);
    audio.sfx(ok ? 'correct' : 'wrong');
    const linea = (o: Objeto, v: number) => mag === 'K'
      ? `${o[0]}:  K = ½·${fmt(o[1])}·${fmt(o[2])}² = ${fmt(v)} J`
      : `${o[0]}:  p = ${fmt(o[1])}·${fmt(o[2])} = ${fmt(v)} kg·m/s`;
    L(title(this, W / 2, 96, ok ? '¡Correcto!' : 'No…', 42, ok ? CSS.green : '#e08a8a'));
    L(txt(this, W / 2, 160, `${linea(elegido, ve)}\n${linea(otro, vo)}`, 19, CSS.bone, { align: 'center', lineSpacing: 8, wordWrap: { width: 860 } }).setOrigin(0.5, 0));
    const ratio = Math.max(ve, vo) / Math.min(ve, vo);
    L(txt(this, W / 2, 248, `Uno es ${ratio >= 100 ? fmt(ratio) : ratio.toFixed(1)} veces el otro.${mag === 'K' ? ' En K la rapidez pesa al CUADRADO.' : ''}`, 18, '#9ad8f0').setOrigin(0.5));
    if (!ok) {
      logEvent('minijuego_fin', mag === 'K' ? 'Energia cinetica' : 'Cantidad de movimiento', false, { juego: 'masmenos', aciertos: this.aciertos, apuesta: this.apuesta, premio: 0 });
      L(txt(this, W / 2, 310, `Pierdes los ${this.bote} ${T.moneda} que estaban en juego.`, 21, '#e08a8a').setOrigin(0.5));
      L(button(this, W / 2, 400, 220, 44, T.runa.continuar, () => this.salir(), { size: 21 }));
      saveLocal();
      return;
    }
    this.aciertos++;
    this.bote *= 2;
    if (this.aciertos >= 4) {
      const e = completarEncargo('magnitudes');
      if (e) L(txt(this, W / 2, 280, `¡Encargo cumplido! +${e} ${T.moneda}`, 19, '#e8b070').setOrigin(0.5));
    }
    if (this.aciertos >= MAX_RONDAS) return this.final(false);
    L(txt(this, W / 2, 316, `En juego: ${this.bote} ${T.moneda}`, 26, CSS.gold).setOrigin(0.5));
    L(button(this, W / 2 - 160, 400, 280, 50, `¡Doble o nada! (${this.bote * 2})`, () => this.ronda(), { size: 21, color: 0xd89a4a }));
    L(button(this, W / 2 + 160, 400, 280, 50, `Retirarme con ${this.bote}`, () => this.final(true), { size: 21, color: UI.green }));
  }

  private final(retiro: boolean) {
    addErgios(this.bote);
    saveLocal();
    this.hud.refresh();
    logEvent('minijuego_fin', '', true, { juego: 'masmenos', aciertos: this.aciertos, apuesta: this.apuesta, premio: this.bote });
    audio.sfx('coin');
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    this.layer.removeAll(true);
    void retiro;
    const g = this.add.graphics();
    frame(g, W / 2 - 240, 180, 480, 180, 0x0b090e, UI.gold, 0.98);
    L(g);
    L(title(this, W / 2, 224, `+${this.bote} ${T.moneda}`, 36));
    L(txt(this, W / 2, 270, retiro ? `Te retiras a tiempo con ${this.aciertos} acierto(s).` : `¡${MAX_RONDAS} de ${MAX_RONDAS}! La taberna entera te aplaude.`, 19, CSS.bone).setOrigin(0.5));
    L(button(this, W / 2, 322, 200, 40, T.runa.continuar, () => this.salir(), { size: 20, color: UI.gold }));
  }

  private salir() {
    fadeTo(this, this.volver, { floor: this.floor });
  }
}
