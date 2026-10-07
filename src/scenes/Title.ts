import Phaser from 'phaser';
import { CSS } from '../art/palette';
import { audio } from '../audio';
import { H, VERSION_NUM, W } from '../config';
import { embers, fadeTo, txt, vignette } from '../ui/widgets';

/** Portada: la ilustración de public/portada.jpg y «clic para comenzar» */
export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    this.cameras.main.fadeIn(900);
    this.add.rectangle(0, 0, W, H, 0x0a0908).setOrigin(0);
    if (this.textures.exists('portada')) {
      // fondo: la misma portada, ampliada y oscura, para llenar los lados si la imagen es vertical
      const bg = this.add.image(W / 2, H / 2, 'portada');
      bg.setScale(Math.max(W / bg.width, H / bg.height)).setTint(0x3a3038).setAlpha(0.55);
      bg.postFX?.addBlur(2, 2, 2, 1.2);
      const img = this.add.image(W / 2, H / 2, 'portada');
      img.setScale(Math.min(H / img.height, W / img.width));
      // la portada «respira» muy despacio
      this.tweens.add({ targets: img, scale: img.scale * 1.025, duration: 9000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      // orillas oscuras para fundirla con el fondo
      const g = this.add.graphics();
      const x0 = W / 2 - img.displayWidth / 2, x1 = W / 2 + img.displayWidth / 2;
      for (let i = 0; i < 40; i++) {
        g.fillStyle(0x0a0908, 1 - i / 40).fillRect(x0 + i, 0, 1, H).fillRect(x1 - i - 1, 0, 1, H);
      }
    }
    embers(this);
    vignette(this);
    this.add.rectangle(W / 2, H - 58, 420, 44, 0x000000, 0.75);
    const t = txt(this, W / 2, H - 58, 'Clic o toca para comenzar', 26, CSS.gold).setOrigin(0.5).setStroke('#000', 6);
    this.tweens.add({ targets: t, alpha: 0.25, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, W - 12, H - 8, `v${VERSION_NUM}`, 16, '#5a5048').setOrigin(1, 1);
    let gone = false;
    const go = () => {
      if (gone) return;
      gone = true;
      audio.unlock();
      fadeTo(this, 'Login');
    };
    this.input.once('pointerdown', go);
    this.input.keyboard?.once('keydown', go);
  }
}
