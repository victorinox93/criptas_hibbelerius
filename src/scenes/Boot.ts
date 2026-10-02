import Phaser from 'phaser';
import { generateAllTextures } from '../art/sprites';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  async create() {
    generateAllTextures(this);
    try {
      await Promise.race([
        Promise.all([document.fonts.load('24px VT323'), document.fonts.load('48px "Pirata One"')]),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
    } catch { /* fuentes de respaldo */ }
    this.scene.launch('Overlay');
    this.scene.start('Login');
  }
}
