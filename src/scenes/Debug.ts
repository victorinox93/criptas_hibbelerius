import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CARDS, rewardPool } from '../data/cards';
import { DILEMMAS } from '../data/dilemmas';
import { FAMILIAR_POOL, FAMILIARS } from '../data/familiars';
import { BOONS, FIGURES } from '../data/figures';
import { EFFECTS } from '../data/effects';
import { ENEMIES } from '../data/enemies';
import { EVENTS } from '../data/events';
import { ALMA_IDS } from '../data/almas';
import { RELIC_POOL, RELICS } from '../data/relics';
import { codexFlag, emptyCodex, FLOORS, Game, generateMap, isAdmin, newRun, Run, saveLocal, unlock } from '../state';
import { button, Btn, dungeonBackground, fadeTo, frame, title, txt } from '../ui/widgets';

/**
 * MODO PROFESOR (depuración). Sólo lo ven las matrículas de ADMINS (src/config.ts).
 * Las partidas creadas aquí llevan run.debug = true: no se registran en la hoja
 * ni en el ranking, y en combate la tecla K gana al instante.
 */
const OPTS = {
  clase: 'caballero',
  gravedad: 1,
  mazo: 'inicial' as 'inicial' | 'fuerte',
  vida: 'normal' as 'normal' | 'tanque',
  extras: false,
  figura: 0,
  dilema: 0,
};

export class DebugScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private msg!: Phaser.GameObjects.Text;

  constructor() { super('Debug'); }

  create() {
    if (!isAdmin()) return void this.scene.start('Menu');
    this.cameras.main.fadeIn(250);
    audio.play('menu');
    dungeonBackground(this, 9, 0x1a1218);
    title(this, W / 2, 40, 'Modo profesor', 42, '#e08a8a');
    txt(this, W / 2, 74, 'Las partidas de prueba NO se guardan en la hoja ni en el ranking. En combate, la tecla K gana al instante.', 17, CSS.dim).setOrigin(0.5);
    this.msg = txt(this, W / 2, 470, '', 19, CSS.green).setOrigin(0.5);
    this.layer = this.add.container(0, 0);
    this.draw();
    button(this, W / 2, 510, 200, 36, 'Volver al menú', () => fadeTo(this, 'Menu'), { size: 21 });
  }

  private say(s: string) {
    this.msg.setText(s).setAlpha(1);
    this.tweens.killTweensOf(this.msg);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 2500, duration: 400 });
  }

  private draw() {
    this.layer.removeAll(true);
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    const g = this.add.graphics();
    frame(g, 30, 92, W - 60, 360, 0x0e0b12, 0x6a3a3a, 0.92);
    L(g);
    const label = (x: number, y: number, s: string) => L(txt(this, x, y, s, 20, CSS.gold));
    const btn = (x: number, y: number, w: number, s: string, fn: () => void, on = false): Btn => {
      const b = button(this, x, y, w, 34, s, fn, { size: 18, color: on ? UI.gold : UI.border });
      L(b);
      return b;
    };

    // ── ajustes de la partida de prueba ──
    label(50, 104, 'Partida de prueba');
    const CLS = ['caballero', 'arcanista', 'penitente'];
    btn(150, 148, 180, `Clase: ${{ caballero: 'Caballero', arcanista: 'Arcanista', penitente: 'Penitente' }[OPTS.clase]}`, () => { OPTS.clase = CLS[(CLS.indexOf(OPTS.clase) + 1) % CLS.length]; this.draw(); });
    btn(340, 148, 180, `Gravedad: ${['Tierra', 'Neptuno', 'Júpiter'][OPTS.gravedad - 1]}`, () => { OPTS.gravedad = (OPTS.gravedad % 3) + 1; this.draw(); });
    btn(530, 148, 180, `Mazo: ${OPTS.mazo}`, () => { OPTS.mazo = OPTS.mazo === 'inicial' ? 'fuerte' : 'inicial'; this.draw(); }, OPTS.mazo === 'fuerte');
    btn(720, 148, 180, `Vida: ${OPTS.vida === 'normal' ? 'normal' : '×10'}`, () => { OPTS.vida = OPTS.vida === 'normal' ? 'tanque' : 'normal'; this.draw(); }, OPTS.vida === 'tanque');
    btn(860, 108, 150, `Extras: ${OPTS.extras ? 'sí' : 'no'}`, () => { OPTS.extras = !OPTS.extras; this.draw(); }, OPTS.extras);

    label(50, 180, 'Empezar en');
    [1, 2, 3].forEach((a, i) => btn(200 + i * 200, 222, 180, `Acto ${['I', 'II', 'III'][i]}`, () => this.go(a, 'Map')));

    // ── saltos directos ──
    label(50, 252, 'Ir directo a (en el acto de la partida actual, o Acto III si no hay)');
    const acto = () => (Game.run && !Game.run.done ? Game.run.acto : 3);
    const jumps: [string, () => void][] = [
      ['Combate', () => this.go(acto(), 'Combat', { kind: 'normal', floor: 3 })],
      ['Élite', () => this.go(acto(), 'Combat', { kind: 'elite', floor: 5 })],
      ['Jefe', () => this.go(acto(), 'Combat', { kind: 'boss', floor: FLOORS })],
      ['Profesor', () => this.go(acto(), 'Event', { floor: 2, eventId: 'victorino' })],
      ['Profe enojado', () => this.go(acto(), 'Event', { floor: 2, eventId: 'profe_enojado' })],
      ['AM', () => this.go(acto(), 'AM', { floor: 3 })],
      ['Necronomicón', () => this.go(Math.max(2, acto()), 'Dilemma', { floor: 2, id: 'atril' })],
      ['Alma en pena', () => this.go(acto(), 'Alma', { floor: 2, id: Phaser.Utils.Array.GetRandom(ALMA_IDS) })],
      ['Mercader', () => this.go(acto(), 'Shop', { floor: 4 })],
      ['Altar', () => this.go(acto(), 'Rune', { floor: 3, source: 'altar' })],
      ['Fogata', () => this.go(acto(), 'Campfire', { floor: 7 })],
      ['Final', () => this.go(acto(), 'End', { victory: true })],
    ];
    jumps.forEach(([s, fn], i) => btn(106 + (i % 6) * 150, 294 + Math.floor(i / 6) * 42, 142, s, fn));
    const fig = FIGURES[OPTS.figura];
    btn(150, 386, 240, `Eco: ${fig.name}`, () => this.go(acto(), 'Sanctuary', { floor: 2, figureId: fig.id }));
    btn(300, 386, 50, '▸', () => { OPTS.figura = (OPTS.figura + 1) % FIGURES.length; this.draw(); });
    const dil = DILEMMAS[OPTS.dilema];
    btn(520, 386, 260, `Dilema: ${dil.name}`, () => this.go(acto(), 'Dilemma', { floor: 2, id: dil.id }));
    btn(685, 386, 50, '▸', () => { OPTS.dilema = (OPTS.dilema + 1) % DILEMMAS.length; this.draw(); });
    btn(830, 386, 180, 'Transición II→III', () => this.go(2, 'ActTransition', { to: 3 }));

    // ── grimorio ──
    label(50, 414, 'Grimorio');
    btn(330, 430, 220, 'Desbloquear todo', () => {
      Object.keys(ENEMIES).forEach((k) => unlock('enemies', k));
      EVENTS.forEach((e) => unlock('npcs', e.id));
      unlock('npcs', 'mercader');
      DILEMMAS.forEach((d) => unlock('npcs', `dil_${d.id}`));
      FAMILIAR_POOL.forEach((f) => unlock('npcs', `fam_${f}`));
      ALMA_IDS.forEach((a) => unlock('npcs', `alma_${a}`));
      unlock('npcs', 'am');
      FIGURES.forEach((f) => unlock('figures', f.id));
      Object.keys(CARDS).forEach((k) => unlock('cards', k));
      Object.keys(RELICS).forEach((k) => unlock('relics', k));
      Object.keys(BOONS).forEach((k) => unlock('boons', k));
      Object.keys(EFFECTS).forEach((k) => unlock('effects', k));
      codexFlag('acto1');
      Game.codex.gravedadMax = Math.max(Game.codex.gravedadMax, 3);
      Game.codex.victorias = Math.max(Game.codex.victorias, 1); // desbloquea al Penitente
      Game.codex.xp = Math.max(Game.codex.xp ?? 0, 1000);
      saveLocal();
      this.say('Grimorio, Arcanista, Penitente, gravedades y nivel 10 de Conocimiento desbloqueados.');
    });
    btn(570, 430, 220, 'Reiniciar mi Grimorio', () => {
      Game.codex = emptyCodex();
      saveLocal();
      this.say('Grimorio vacío (como alumno nuevo).');
    });
  }

  /** Crea una partida de prueba en el acto indicado y abre la escena */
  private go(acto: number, scene: string, data: object = {}) {
    const r: Run = newRun(`DBG-${Date.now().toString(36)}`, OPTS.gravedad, OPTS.clase);
    r.debug = true;
    r.acto = acto;
    r.map = generateMap(acto);
    if (OPTS.vida === 'tanque') r.maxHp = r.hp = r.maxHp * 10;
    if (OPTS.mazo === 'fuerte' || acto > 1) {
      // un mazo razonable para el acto: mejoras y cartas de la clase
      const pool = rewardPool(OPTS.clase, acto);
      const n = OPTS.mazo === 'fuerte' ? 10 : acto * 3;
      for (let i = 0; i < n; i++) r.deck.push({ uid: r.nextUid++, id: Phaser.Utils.Array.GetRandom(pool), up: OPTS.mazo === 'fuerte' || Math.random() < 0.4 });
      if (OPTS.mazo === 'fuerte') r.deck.forEach((c) => (c.up = true));
      r.relics = Phaser.Utils.Array.Shuffle([...RELIC_POOL]).slice(0, acto - 1 + (OPTS.mazo === 'fuerte' ? 2 : 0));
    }
    if (OPTS.extras) {
      r.ergios = 500;
      r.relics = [...RELIC_POOL, 'vidaExtra', 'necronomicon'];
      r.entropia = 75;
      const fam = Phaser.Utils.Array.GetRandom(FAMILIAR_POOL);
      r.familiar = { id: fam, left: FAMILIARS[fam].combats };
    }
    Game.run = r;
    saveLocal();
    fadeTo(this, scene, data);
  }
}
void H;
