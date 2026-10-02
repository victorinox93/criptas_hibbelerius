import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W } from '../config';
import { button, dungeonBackground, fadeTo, icon, panel, title, txt } from '../ui/widgets';

const ROWS: [string, string, string][] = [
  ['i_bolt', 'Energía en Joules', 'Cada turno tienes 3 J. Jugar una carta cuesta trabajo: gasta Joules.'],
  ['i_combat', 'F = m · a', 'Tus ataques calculan su fuerza: masa del arma (kg) × aceleración (m/s²). El daño es F en newtons.'],
  ['i_shield', 'Bloque', 'Absorbe daño. Se pierde al iniciar tu turno… salvo que la inercia diga lo contrario.'],
  ['i_momentum', 'Inercia (1ª ley)', 'Algunos enemigos avanzan sin detenerse y su golpe crece. Detenlos con UN golpe de F ≥ su umbral.'],
  ['i_mud', 'Fricción', 'El lodo reduce la aceleración de tus ataques. Menos a, menos F.'],
  ['i_rune', 'Runas', 'Altares y fogatas te retan con problemas de dinámica. Resuélvelos para ganar poder.'],
];

export class HelpScene extends Phaser.Scene {
  constructor() { super('Help'); }

  create(data: { next?: string; first?: boolean }) {
    this.cameras.main.fadeIn(250);
    dungeonBackground(this, 3, 0x18141e);
    title(this, W / 2, 44, data.first ? 'Antes de descender…' : 'Cómo se juega', 44);
    panel(this, 60, 82, W - 120, 380);
    ROWS.forEach(([ic, head, body], i) => {
      const y = 112 + i * 58;
      icon(this, 104, y + 14, ic, 4);
      txt(this, 140, y - 4, head, 26, CSS.gold);
      txt(this, 140, y + 20, body, 20, CSS.bone, { wordWrap: { width: 720 } });
    });
    txt(this, W / 2, 480, 'Pasa el cursor sobre cartas, estados y enemigos para ver la física detrás.', 20, CSS.dim).setOrigin(0.5);
    button(this, W / 2, 514, 260, 40, data.first ? 'Descender' : 'Entendido', () => fadeTo(this, data.next ?? 'Menu'), {
      color: UI.blood,
    });
  }
}
