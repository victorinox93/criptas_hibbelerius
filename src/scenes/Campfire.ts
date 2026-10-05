import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W } from '../config';
import { audio } from '../audio';
import { T } from '../textos';
import { gravityOf } from '../data/gravity';
import { Game, logEvent, saveLocal, syncRun } from '../state';
import { topBar } from '../ui/hud';
import { button, embers, fadeTo, title, torch, Tooltip, txt, vignette } from '../ui/widgets';

export class CampfireScene extends Phaser.Scene {
  constructor() { super('Campfire'); }

  create(data: { floor: number }) {
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    const run = Game.run!;
    this.add.rectangle(0, 0, W, 540, 0x050407).setOrigin(0);
    for (let i = 0; i < 120; i++) this.add.rectangle(Math.random() * W, Math.random() * 300, 2, 2, 0xd8d0c0, Math.random() * 0.35);
    this.add.ellipse(W / 2, 400, 700, 120, 0x100d14);
    embers(this);
    vignette(this);
    const tip = new Tooltip(this);
    topBar(this, tip);
    title(this, W / 2, 80, T.fogata.titulo, 50);
    txt(this, W / 2, 118, T.fogata.texto, 22, CSS.dim).setOrigin(0.5);

    torch(this, W / 2, 330);
    this.add.image(W / 2, 360, 'i_fire').setScale(7);
    const hero = this.add.image(W / 2 - 150, 340, 'hero').setScale(2.5);
    this.tweens.add({ targets: hero, y: 336, duration: 1100, yoyo: true, repeat: -1 });

    const heal = Math.round(run.maxHp * gravityOf(run.gravity).heal);
    button(this, W / 2 - 170, 470, 300, 64, `${T.fogata.descansar}\n+${Math.min(heal, run.maxHp - run.hp)} de vida`, () => {
      audio.sfx('heal');
      run.hp = Math.min(run.maxHp, run.hp + heal);
      run.floor = data.floor + 1;
      saveLocal();
      logEvent('fogata', '', '', { opcion: 'descansar' });
      syncRun('en curso');
      fadeTo(this, 'Map');
    }, { color: UI.blood, size: 22 });
    const canUp = run.deck.some((c) => !c.up);
    button(this, W / 2 + 170, 470, 300, 64, T.fogata.estudiar, () => {
      fadeTo(this, 'Rune', { floor: data.floor, source: 'fogata' });
    }, { color: 0x8e5bb0, size: 22, enabled: canUp });
  }
}
