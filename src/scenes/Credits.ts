import Phaser from 'phaser';
import { CSS } from '../art/palette';
import { audio } from '../audio';
import { VERSION, W } from '../config';
import { T } from '../textos';
import { button, dungeonBackground, embers, fadeTo, panel, title, txt } from '../ui/widgets';

export class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play('santuario');
    dungeonBackground(this, 77, 0x14111a);
    embers(this);
    title(this, W / 2, 44, T.titulo, 44);
    txt(this, W / 2, 82, `${T.creditos.titulo} · ${VERSION}`, 22, CSS.dim).setOrigin(0.5);
    panel(this, 60, 104, W - 120, 344);
    let y = 120;
    T.creditos.filas.forEach(([k, v], i) => {
      txt(this, 84, y, k, 20, CSS.dim);
      const t = txt(this, 290, y - 2, v, i === 0 ? 26 : 21, i === 0 ? CSS.gold : CSS.bone, { wordWrap: { width: W - 380 } });
      y += Math.max(34, t.height + 10);
    });
    txt(this, W / 2, 464, T.creditos.nota, 18, CSS.dim, { align: 'center', wordWrap: { width: W - 180 } }).setOrigin(0.5);
    this.add.image(W - 120, 470, 'wizard').setScale(3).setAlpha(0.35);
    button(this, W / 2, 510, 200, 36, T.creditos.volver, () => fadeTo(this, 'Menu'), { size: 22 });
  }
}
