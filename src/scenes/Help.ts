import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W } from '../config';
import { T } from '../textos';
import { audio } from '../audio';
import { button, dungeonBackground, fadeTo, icon, panel, title, txt } from '../ui/widgets';

import { Game } from '../state';

const ARC_ROW: [string, string, string] = ['i_momentum', 'K = ½ · m · v²', 'Tus hechizos dañan con energía cinética. Sube tu rapidez v con Acelerar; cada Proyectil te frena 1 m/s y la fricción también.'];

export class HelpScene extends Phaser.Scene {
  constructor() { super('Help'); }

  create(data: { next?: string; first?: boolean }) {
    this.cameras.main.fadeIn(250);
    audio.play('menu');
    dungeonBackground(this, 3, 0x18141e);
    title(this, W / 2, 44, data.first ? T.ayuda.tituloPrimera : T.ayuda.titulo, 44);
    panel(this, 60, 82, W - 120, 380);
    const ROWS = T.ayuda.filas.map((r, i) => (i === 1 && Game.run?.clase === 'arcanista' ? ARC_ROW : r));
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
