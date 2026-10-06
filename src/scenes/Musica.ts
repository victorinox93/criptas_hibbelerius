import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio, TrackId } from '../audio';
import { MUSIC_FILES, W } from '../config';
import { button, Btn, dungeonBackground, fadeTo, frame, title, txt } from '../ui/widgets';

/** Pistas del soundtrack, en orden de aparición */
const PISTAS: [TrackId, string, string][] = [
  ['menu', 'El Umbral', 'Menú'],
  ['mapa', 'Criptas de Newton', 'Mapa · Acto I'],
  ['combate', 'Choque de Masas', 'Combate · Acto I'],
  ['combate2', 'Huesos y Fricción', 'Combate · Acto I'],
  ['jefe', 'El Coloso Inerte', 'Jefe · Acto I'],
  ['mapa2', 'Galerías de la Fricción', 'Mapa · Acto II'],
  ['combate3', 'Trabajo y Energía', 'Combate · Acto II'],
  ['jefe2', 'La Bruja de la Fricción', 'Jefe · Acto II'],
  ['mapa3', 'La Torre del Tomo', 'Mapa · Acto III'],
  ['combate4', 'Impulso', 'Combate · Acto III'],
  ['jefe3', 'La Parca del Tomo', 'Jefe final'],
  ['santuario', 'Ecos del Pasado', 'Santuario'],
  ['calma', 'Respiro', 'Fogata y encuentros'],
];

/** Menú → Soundtrack (se desbloquea al vencer a Hibbelerius) */
export class MusicaScene extends Phaser.Scene {
  private btns: Btn[] = [];

  constructor() { super('Musica'); }

  create() {
    this.cameras.main.fadeIn(250);
    dungeonBackground(this, 77, 0x16121c);
    title(this, W / 2, 38, 'Soundtrack', 44);
    txt(this, W / 2, 74, 'Las pistas sin archivo se generan en vivo (dungeon synth). «Cold Soul»: Lost in The Forest.', 16, CSS.dim).setOrigin(0.5);
    const g = this.add.graphics();
    frame(g, 40, 92, W - 80, 404, 0x0e0b12, UI.border, 0.92);
    this.btns = [];
    PISTAS.forEach(([id, nombre, donde], i) => {
      const col = i < 7 ? 0 : 1, row = i < 7 ? i : i - 7;
      const x = 62 + col * 440, y = 104 + row * 55;
      const archivo = MUSIC_FILES[id];
      const b = button(this, x + 20, y + 22, 36, 36, '▶', () => this.play(i), { size: 18, silent: true });
      this.btns.push(b);
      txt(this, x + 48, y + 4, `${String(i + 1).padStart(2, '0')}. ${nombre}`, 21, CSS.bone);
      txt(this, x + 48, y + 28, archivo ? `${donde} · Lost in The Forest («Cold Soul»)` : `${donde} · sintetizado en vivo`, 15, CSS.dim);
    });
    button(this, W / 2, 516, 200, 36, 'Volver', () => fadeTo(this, 'Menu'), { size: 22 });
  }

  private play(i: number) {
    audio.play(PISTAS[i][0]);
    this.btns.forEach((b, j) => {
      b.label.setText(j === i ? '♪' : '▶').setColor(j === i ? CSS.gold : CSS.bone);
    });
  }
}
