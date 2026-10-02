import Phaser from 'phaser';
import { api, isOnline } from '../api';
import { CAPES, CSS, UI } from '../art/palette';
import { makeKnight } from '../art/sprites';
import { GAME_TITLE, W } from '../config';
import { clearSession, Game, logEvent, newRun, saveLocal, syncRun } from '../state';
import { button, dungeonBackground, embers, fadeTo, panel, title, torch, txt } from '../ui/widgets';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.cameras.main.fadeIn(300);
    dungeonBackground(this, 5, 0x1e1a26);
    embers(this);
    const p = Game.profile!;
    const av = p.avatar!;
    makeKnight(this, 'hero', av.helm, CAPES[av.cape]);

    title(this, W / 2, 50, GAME_TITLE, 50);
    txt(this, W / 2, 90, 'El Umbral de las Criptas', 24, CSS.dim).setOrigin(0.5);

    // héroe junto a la fogata
    torch(this, 300, 330);
    this.add.image(300, 352, 'i_fire').setScale(5);
    const hero = this.add.image(200, 330, 'hero').setScale(6);
    this.tweens.add({ targets: hero, y: 326, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    panel(this, 60, 420, 360, 98);
    txt(this, 80, 432, av.alias, 30, CSS.gold);
    txt(this, 80, 464, `Caballero de la Masa · ${p.matricula}`, 20, CSS.bone);
    txt(this, 80, 488, p.offline || !isOnline() ? '● Sin conexión (no se reporta)' : `● Conectado · Grupo ${p.grupo}`, 18,
      p.offline || !isOnline() ? CSS.dim : CSS.green);

    const x = 680;
    let y = 170;
    const run = Game.run && !Game.run.done ? Game.run : null;
    if (run) {
      button(this, x, y, 320, 50, `Continuar expedición (piso ${run.floor + 1})`, () => fadeTo(this, 'Map'), { color: UI.gold, size: 24 });
      y += 66;
    }
    const startBtn = button(this, x, y, 320, 50, run ? 'Nueva expedición' : 'Comenzar expedición', async () => {
      if (run) {
        syncRun('abandonada', 'nueva expedición');
      }
      startBtn.setEnabled(false);
      let runId = `L-${Date.now().toString(36)}`;
      if (!p.offline && isOnline()) {
        try {
          runId = (await api.startRun(p.token, av.clase)).runId;
        } catch (e) {
          console.warn(e);
        }
      }
      Game.run = newRun(runId);
      saveLocal();
      logEvent('inicio', '', '', { clase: av.clase });
      fadeTo(this, 'Help', { next: 'Map', first: true });
    }, { color: run ? UI.border : UI.blood, size: 26 });
    y += 66;
    button(this, x, y, 320, 50, 'Cómo se juega', () => fadeTo(this, 'Help', { next: 'Menu' }), { size: 24 });
    y += 66;
    button(this, x, y, 320, 50, 'Editar héroe', () => fadeTo(this, 'Avatar'), { size: 24 });
    y += 66;
    button(this, x, y, 320, 50, 'Cerrar sesión', () => {
      clearSession();
      Game.profile = null;
      Game.run = null;
      fadeTo(this, 'Login');
    }, { size: 22 });
  }
}
