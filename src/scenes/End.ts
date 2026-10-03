import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { audio } from '../audio';
import { T } from '../textos';
import { Game, saveLocal } from '../state';
import { button, embers, fadeTo, panel, title, txt, vignette } from '../ui/widgets';

const TIPS = T.final.consejos;

export class EndScene extends Phaser.Scene {
  constructor() { super('End'); }

  create(data: { victory: boolean; by?: string }) {
    this.cameras.main.fadeIn(500);
    audio.play('menu');
    const run = Game.run!;
    this.add.rectangle(0, 0, W, H, 0x07060a).setOrigin(0);
    embers(this);
    vignette(this);

    if (data.victory) {
      title(this, W / 2, 70, T.final.victoria, 54);
      txt(this, W / 2, 112, T.final.victoriaTexto, 22, CSS.bone).setOrigin(0.5);
      const wz = this.add.image(W - 170, 300, 'wizard').setScale(7).setAlpha(0);
      this.tweens.add({ targets: wz, alpha: 0.9, duration: 2500, delay: 800 });
      this.tweens.add({ targets: wz, y: 292, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const q = txt(this, W - 170, 470, T.final.cita, 20, CSS.purple, { align: 'center' }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: q, alpha: 1, duration: 1500, delay: 2600 });
    } else {
      title(this, W / 2, 70, T.final.derrota, 54, '#b8a8c8');
      txt(this, W / 2, 112, `${T.final.derrotaTexto}: ${data.by ?? '—'} · ${T.hud.piso.toLowerCase()} ${run.floor + 1}`, 22, CSS.dim).setOrigin(0.5);
    }

    panel(this, 80, 150, 520, 300);
    const F = T.final.filas;
    const rows: [string, string | number][] = [
      [F[0], `${((run.acto ?? 1) - 1) * 9 + run.floor}/18`],
      [F[1], run.stats.combates],
      [F[2], run.stats.elites],
      [F[3], `${run.stats.runasOk}/${run.stats.runasTotal}`],
      [F[4], run.stats.ergiosTotal ?? 0],
      [F[5], run.score],
    ];
    rows.forEach(([k, v], i) => {
      txt(this, 110, 172 + i * 40, k, 26, CSS.dim);
      txt(this, 570, 172 + i * 40, String(v), 28, i === rows.length - 1 ? CSS.gold : CSS.bone).setOrigin(1, 0);
    });
    if (!data.victory) {
      txt(this, W - 175, 200, T.final.consejo, 24, CSS.gold).setOrigin(0.5);
      txt(this, W - 175, 226, Phaser.Utils.Array.GetRandom(TIPS), 21, CSS.bone, { wordWrap: { width: 290 }, align: 'center' }).setOrigin(0.5, 0);
    }
    txt(this, 340, 466, Game.profile?.offline ? T.final.local : T.final.registrado, 20, CSS.dim).setOrigin(0.5);
    run.done = true;
    saveLocal();
    Game.run = null;
    saveLocal();
    button(this, 340, 506, 260, 44, T.final.volver, () => fadeTo(this, 'Menu'), { color: UI.gold });
  }
}
