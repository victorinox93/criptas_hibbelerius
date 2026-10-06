import Phaser from 'phaser';
import { api, isOnline } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { T } from '../textos';
import { W, H } from '../config';
import { starterDeck } from '../data/cards';
import { CLASSES } from '../data/classes';
import { GRAVITY } from '../data/gravity';
import { siguienteNivel } from '../data/progreso';
import { claseJugable, clearSession, Game, isAdmin, nivelActual, logEvent, newRun, saveLocal, syncRun, unlock } from '../state';
import { button, dungeonBackground, embers, fadeTo, frame, panel, title, torch, txt } from '../ui/widgets';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play('menu');
    dungeonBackground(this, 5, 0x1a1622);
    embers(this);
    const p = Game.profile!;
    const av = p.avatar!;
    makeHeroFromAvatar(this, av);

    title(this, W / 2, 50, T.titulo, 50);
    txt(this, W / 2, 90, T.menu.lugar, 24, CSS.dim).setOrigin(0.5);

    torch(this, 300, 330);
    this.add.image(300, 352, 'i_fire').setScale(5);
    const hero = this.add.image(200, 330, 'hero').setScale(3);
    this.tweens.add({ targets: hero, y: 326, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    panel(this, 60, 412, 380, 108);
    txt(this, 80, 422, av.alias, 30, CSS.gold);
    const xp = Game.codex.xp ?? 0;
    const sig = siguienteNivel(xp);
    txt(this, 424, 428, `Conocimiento: nivel ${nivelActual()}`, 18, '#9ad8f0').setOrigin(1, 0);
    txt(this, 424, 478, sig ? `${xp} / ${sig}` : 'máximo', 16, CSS.dim).setOrigin(1, 0);
    txt(this, 80, 454, `${CLASSES.find((c) => c.id === av.clase)?.name ?? 'Caballero de la Masa'} · ${p.matricula}`, 20, CSS.bone);
    const gmax = Game.codex.gravedadMax;
    txt(this, 80, 476, `${T.menu.mejorGravedad}: ${gmax ? GRAVITY[gmax - 1].name : T.menu.ninguna}`, 18, CSS.dim);
    txt(this, 80, 496, p.offline || !isOnline() ? `● ${T.menu.desconectado}` : `● ${T.menu.conectado} ${p.grupo}`, 18,
      p.offline || !isOnline() ? CSS.dim : CSS.green);
    const seg = Game.codex.tiempo ?? 0;
    const hrs = Math.floor(seg / 3600);
    const min = Math.floor((seg % 3600) / 60);
    txt(this, 424, 498, `Jugado: ${hrs ? `${hrs} h ` : ''}${min} min`, 16, CSS.dim).setOrigin(1, 0);

    const x = 690;
    let y = 150;
    const run = Game.run && !Game.run.done ? Game.run : null;
    if (run) {
      button(this, x, y, 330, 48, `${T.menu.continuar} (${T.hud.piso.toLowerCase()} ${run.floor + 1})`, () => fadeTo(this, 'Map'), { color: UI.gold, size: 24 });
      y += 58;
    }
    button(this, x, y, 330, 48, run ? T.menu.nueva : T.menu.comenzar, () => this.pickGravity(), { color: run ? UI.border : UI.blood, size: 26 });
    y += 72;
    const grid: [string, () => void][] = [
      [T.menu.grimorio, () => fadeTo(this, 'Codex')],
      [T.menu.ranking, () => fadeTo(this, 'Ranking')],
      [T.menu.ayuda, () => fadeTo(this, 'Help', { next: 'Menu' })],
      [T.menu.editar, () => fadeTo(this, 'Avatar')],
      [T.menu.creditos, () => fadeTo(this, 'Credits')],
      [T.menu.salir, () => {
        clearSession();
        Game.profile = null;
        Game.run = null;
        fadeTo(this, 'Login');
      }],
    ];
    grid.forEach(([label, fn], i) => {
      button(this, x - 84 + (i % 2) * 168, y + Math.floor(i / 2) * 52, 160, 44, label, fn, { size: 21 });
    });
    if (isAdmin()) button(this, x, y + 156, 330, 40, 'Modo profesor (depuración)', () => fadeTo(this, 'Debug'), { color: 0x9a4040, size: 21 });
  }

  /** Ventana para elegir el nivel de gravedad antes de una expedición */
  private pickGravity() {
    const layer = this.add.container(0, 0).setDepth(900);
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setInteractive();
    const g = this.add.graphics();
    frame(g, 150, 70, W - 300, 410, 0x0b090e, UI.gold);
    layer.add([shade, g, title(this, W / 2, 104, T.menu.gravedad, 36),
      txt(this, W / 2, 138, T.menu.gravedadInfo, 18, CSS.dim, { align: 'center', wordWrap: { width: W - 360 } }).setOrigin(0.5, 0)]);
    GRAVITY.forEach((lv, i) => {
      const unlocked = lv.id <= Game.codex.gravedadMax + 1;
      const y = 200 + i * 86;
      const b = button(this, W / 2, y + 18, W - 360, 74, '', () => {
        layer.destroy();
        this.start(lv.id);
      }, { enabled: unlocked, color: i === 0 ? UI.border : i === 1 ? 0x6a8fc4 : 0xc87533 });
      b.label.setText('');
      b.add(txt(this, -(W - 360) / 2 + 20, -26, `${lv.name}  ·  g = ${lv.g} m/s²  ·  puntaje ×${lv.scoreMul}`, 23, unlocked ? CSS.gold : '#5a5468'));
      b.add(txt(this, -(W - 360) / 2 + 20, 2, unlocked ? lv.desc : T.menu.gravedadBloqueada, 18, unlocked ? CSS.bone : '#5a5468',
        { wordWrap: { width: W - 400 } }));
      layer.add(b);
    });
    layer.add(button(this, W / 2, 458, 160, 34, T.menu.cancelar, () => layer.destroy(), { size: 20 }));
  }

  private async start(gravity: number) {
    const p = Game.profile!;
    const av = p.avatar!;
    if (Game.run && !Game.run.done) syncRun('abandonada', 'nueva expedición');
    let runId = `L-${Date.now().toString(36)}`;
    if (!p.offline && isOnline()) {
      try {
        runId = (await api.startRun(p.token, av.clase, gravity)).runId;
      } catch (e) {
        console.warn(e);
      }
    }
    const clase = claseJugable(av.clase);
    Game.run = newRun(runId, gravity, clase);
    starterDeck(clase).forEach((id) => unlock('cards', id));
    saveLocal();
    logEvent('inicio', '', '', { clase: av.clase, gravedad: gravity });
    fadeTo(this, 'Help', { next: 'Map', first: true });
  }
}
