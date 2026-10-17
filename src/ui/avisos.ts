import Phaser from 'phaser';
import { audio } from '../audio';
import { W } from '../config';
import { premiosNuevosAbismo } from '../data/logros';
import { frame, txt } from './widgets';

/**
 * v0.46 · Revisa los logros del Abismo y muestra cada premio nuevo como un letrero
 * dorado arriba de la pantalla (uno tras otro). Se llama en el menú, el mapa y al terminar.
 */
export function avisarPremios(s: Phaser.Scene) {
  const avisos = premiosNuevosAbismo();
  avisos.forEach((a, i) => s.time.delayedCall(800 + i * 4200, () => {
    const c = s.add.container(W / 2, -60).setDepth(1500);
    const t = txt(s, 0, 0, a, 18, '#ffe08a', { align: 'center', wordWrap: { width: 640 } }).setOrigin(0.5);
    const g = s.add.graphics();
    frame(g, -t.width / 2 - 20, -t.height / 2 - 12, t.width + 40, t.height + 24, 0x1a1408, 0xe8c15a, 0.97);
    c.add([g, t]);
    audio.sfx('coin');
    s.tweens.add({ targets: c, y: 96, duration: 500, ease: 'Back.out' });
    s.tweens.add({ targets: c, y: -80, delay: 3600, duration: 400, onComplete: () => c.destroy() });
  }));
}
