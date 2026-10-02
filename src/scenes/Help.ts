import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W } from '../config';
import { T } from '../textos';
import { audio } from '../audio';
import { button, dungeonBackground, fadeTo, icon, panel, title, txt } from '../ui/widgets';

const ROWS = T.ayuda.filas;

export class HelpScene extends Phaser.Scene {
  constructor() { super('Help'); }

  create(data: { next?: string; first?: boolean }) {
    this.cameras.main.fadeIn(250);
    audio.play('menu');
    dungeonBackground(this, 3, 0x18141e);
    title(this, W / 2, 44, data.first ? T.ayuda.tituloPrimera : T.ayuda.titulo, 44);
    panel(this, 60, 82, W - 120, 380);
    ROWS.forEach(([ic, head, body], i) => {
      const y = 112 + i * 58;
      icon(this, 104, y + 14, ic, 4);
      txt(this, 140, y - 4, head, 26, CSS.gold);
      txt(this, 140, y + 20, body, 20, CSS.bone, { wordWrap: { width: 720 } });
    });
    txt(this, W / 2, 480, T.ayuda.pie, 20, CSS.dim).setOrigin(0.5);
    button(this, W / 2, 514, 260, 40, data.first ? T.ayuda.descender : T.ayuda.entendido, () => fadeTo(this, data.next ?? 'Menu'), {
      color: UI.blood,
    });
  }
}
