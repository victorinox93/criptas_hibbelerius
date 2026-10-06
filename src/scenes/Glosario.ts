import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W } from '../config';
import { GLOSARIO } from '../data/glosario';
import { button, Btn, dungeonBackground, fadeTo, frame, icon, title, txt } from '../ui/widgets';

/** Menú → Glosario: tipos de ataque, estados, efectos y el abismo (datos en src/data/glosario.ts) */
export class GlosarioScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private tabs: Btn[] = [];

  constructor() { super('Glosario'); }

  create() {
    this.cameras.main.fadeIn(250);
    audio.play('menu');
    dungeonBackground(this, 57, 0x16121c);
    title(this, W / 2, 38, 'Glosario', 44);
    this.tabs = GLOSARIO.map((t, i) => button(this, W / 2 + (i - (GLOSARIO.length - 1) / 2) * 162, 88, 152, 34, t.tab, () => this.show(i), { size: 20 }));
    this.layer = this.add.container(0, 0);
    button(this, W / 2, 516, 200, 36, 'Volver', () => fadeTo(this, 'Menu'), { size: 22 });
    this.show(0);
  }

  private show(i: number) {
    audio.sfx('click');
    this.tabs.forEach((b, j) => b.label.setColor(j === i ? CSS.gold : CSS.dim));
    this.layer.removeAll(true);
    GLOSARIO[i].items.forEach(([ic, h, b], k) => {
      const x = 28 + (k % 2) * 456, y = 116 + Math.floor(k / 2) * 94;
      const g = this.add.graphics();
      frame(g, x, y, 448, 88, 0x0e0b12, UI.border, 0.92);
      const t = txt(this, x + 66, y + 8, h, 20, CSS.gold);
      if (t.width > 372) t.setScale(372 / t.width, 1);
      const d = txt(this, x + 66, y + 34, b, 16, CSS.bone, { wordWrap: { width: 372 }, lineSpacing: 1 });
      let fs = 16;
      while (d.height > 50 && fs > 12) d.setFontSize(--fs);
      this.layer.add([g, icon(this, x + 32, y + 44, ic, 4), t, d]);
    });
  }
}
