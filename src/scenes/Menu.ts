import Phaser from 'phaser';
import { api, isOnline } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { T } from '../textos';
import { W } from '../config';
import { clearSession, Game, logEvent, newRun, saveLocal, syncRun } from '../state';
import { button, dungeonBackground, embers, fadeTo, panel, title, torch, txt } from '../ui/widgets';

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

    // héroe junto a la fogata
    torch(this, 300, 330);
    this.add.image(300, 352, 'i_fire').setScale(5);
    const hero = this.add.image(200, 330, 'hero').setScale(6);
    this.tweens.add({ targets: hero, y: 326, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    panel(this, 60, 420, 360, 98);
    txt(this, 80, 432, av.alias, 30, CSS.gold);
    txt(this, 80, 464, `Caballero de la Masa · ${p.matricula}`, 20, CSS.bone);
    txt(this, 80, 488, p.offline || !isOnline() ? `● ${T.menu.desconectado}` : `● ${T.menu.conectado} ${p.grupo}`, 18,
      p.offline || !isOnline() ? CSS.dim : CSS.green);

    const x = 680;
    let y = 170;
    const run = Game.run && !Game.run.done ? Game.run : null;
    if (run) {
      button(this, x, y, 320, 50, `${T.menu.continuar} (${T.hud.piso.toLowerCase()} ${run.floor + 1})`, () => fadeTo(this, 'Map'), { color: UI.gold, size: 24 });
      y += 66;
    }
    const startBtn = button(this, x, y, 320, 50, run ? T.menu.nueva : T.menu.comenzar, async () => {
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
    button(this, x, y, 320, 50, T.menu.ayuda, () => fadeTo(this, 'Help', { next: 'Menu' }), { size: 24 });
    y += 66;
    button(this, x, y, 320, 50, T.menu.editar, () => fadeTo(this, 'Avatar'), { size: 24 });
    y += 66;
    button(this, x, y, 320, 50, T.menu.salir, () => {
      clearSession();
      Game.profile = null;
      Game.run = null;
      fadeTo(this, 'Login');
    }, { size: 22 });
  }
}
