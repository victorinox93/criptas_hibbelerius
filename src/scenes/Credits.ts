import Phaser from 'phaser';
import { CSS } from '../art/palette';
import { audio } from '../audio';
import { VERSION_NUM, W } from '../config';
import { T } from '../textos';
import { button, frame, dungeonBackground, embers, fadeTo, panel, title, txt } from '../ui/widgets';

export class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play('santuario');
    dungeonBackground(this, 77, 0x14111a);
    embers(this);
    title(this, W / 2, 44, T.titulo, 44);
    txt(this, W / 2, 82, `${T.creditos.titulo} · v${VERSION_NUM}`, 22, CSS.dim).setOrigin(0.5);
    // el cuadro crece con el contenido (se dibuja detrás de los textos)
    const bg = this.add.graphics();
    let y = 112;
    T.creditos.filas.forEach(([k, v], i) => {
      txt(this, 80, y, k, 16, CSS.dim);
      const t = txt(this, 240, y - 2, v, i === 0 ? 22 : 16, i === 0 ? CSS.gold : CSS.bone, { wordWrap: { width: W - 320 } });
      const url = v.match(/([a-z0-9-]+\.bandcamp\.com[^\s)]*)/i)?.[1];
      if (url) {
        const link = url.includes('/') ? `https://${url}` : 'https://lostintheforest.bandcamp.com/album/cold-soul';
        t.setInteractive({ useHandCursor: true }).on('pointerdown', () => window.open(link, '_blank'));
        t.on('pointerover', () => t.setColor(CSS.gold)).on('pointerout', () => t.setColor(CSS.bone));
      }
      y += Math.max(24, t.height + 6);
    });
    frame(bg, 56, 98, W - 112, y - 98 + 6, 0x0e0b12, 0x4a3f55, 0.94);
    bg.setDepth(-1);
    txt(this, W / 2, y + 20, T.creditos.nota, 15, CSS.dim, { align: 'center', wordWrap: { width: W - 180 } }).setOrigin(0.5);
    this.add.image(W - 70, 470, 'hibbelerius').setScale(1.2).setAlpha(0.3);
    button(this, W / 2, 510, 200, 36, T.creditos.volver, () => fadeTo(this, 'Menu'), { size: 22 });
  }
}
