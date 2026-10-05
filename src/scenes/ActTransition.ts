import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { arcanistaUnlocked, codexFlag, Game, generateMap, logEvent, saveLocal, syncRun } from '../state';
import { T } from '../textos';
import { button, embers, fadeTo, title, txt, vignette } from '../ui/widgets';

/** Entre actos: descanso, aviso de desbloqueo y paso al siguiente acto (to = 2 o 3) */
export class ActTransitionScene extends Phaser.Scene {
  constructor() { super('ActTransition'); }

  create(data: { to?: number } = {}) {
    const to = data.to ?? 2;
    const tx = to === 3 ? { ...T.transicion, ...T.transicion2 } : T.transicion;
    this.cameras.main.fadeIn(600);
    audio.play('santuario');
    const run = Game.run!;
    this.add.rectangle(0, 0, W, H, 0x030304).setOrigin(0);
    const g = this.add.graphics();
    if (to === 3) {
      // escalera de caracol que SUBE hacia la torre
      for (let i = 0; i < 14; i++) {
        const a = i * 0.55, rx = 150 - i * 6, y = 470 - i * 22;
        const x = W / 2 + Math.cos(a) * rx;
        g.fillStyle(Phaser.Display.Color.GetColor(22 + i * 2, 18 + i, 30 + i * 2), 1).fillRect(x - 40, y, 80, 12);
        g.lineStyle(1, 0x4a3a5a, 0.3 + i * 0.03).strokeRect(x - 40, y, 80, 12);
      }
      const glow = this.add.circle(W / 2, 140, 90, 0x8e5bb0, 0.08).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: glow, alpha: 0.03, duration: 2000, yoyo: true, repeat: -1 });
    } else {
      // escalera que desciende
      for (let i = 0; i < 12; i++) {
        const w = 420 - i * 30, y = 300 + i * 18;
        g.fillStyle(Phaser.Display.Color.GetColor(30 - i * 2, 34 - i * 2, 40 - i * 2), 1).fillRect(W / 2 - w / 2, y, w, 16);
        g.lineStyle(1, 0x34404e, 0.6 - i * 0.04).strokeRect(W / 2 - w / 2, y, w, 16);
      }
    }
    embers(this);
    vignette(this);
    const boss = this.add.image(W - 170, 230, to === 3 ? 'bruja' : 'colossus').setScale(4).setAlpha(0.5).setTint(0x6a6a7a);
    this.tweens.add({ targets: boss, alpha: 0.1, y: 260, duration: 3000 });

    title(this, W / 2, 60, tx.titulo, 50);
    txt(this, W / 2, 104, tx.texto, 21, CSS.bone, { align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5, 0);
    const wz = this.add.image(170, 330, 'hibbelerius').setOrigin(0.5, 1).setScale(to === 3 ? 3 : 2.4).setAlpha(0);
    this.tweens.add({ targets: wz, alpha: 0.85, duration: 1600, delay: 500 });
    this.tweens.add({ targets: wz, y: 324, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const q = txt(this, 170, 344, tx.cita, 18, CSS.purple, { align: 'center' }).setOrigin(0.5, 0).setAlpha(0);
    this.tweens.add({ targets: q, alpha: 1, duration: 1200, delay: 1400 });

    // descanso entre actos: recupera 75 % de la vida perdida
    const heal = Math.ceil((run.maxHp - run.hp) * 0.75);
    const wasLocked = !(Game.codex.flags ?? []).includes('acto1-visto');
    txt(this, W / 2, 196, `${tx.curacion} ${heal} de vida.`, 22, CSS.green).setOrigin(0.5);
    if (to === 2 && arcanistaUnlocked() && wasLocked && run.clase !== 'arcanista') {
      txt(this, W / 2, 226, T.transicion.desbloqueo, 22, CSS.gold).setOrigin(0.5);
    }
    codexFlag(to === 3 ? 'acto2-visto' : 'acto1-visto');

    button(this, W / 2, 500, 340, 50, tx.descender, () => {
      run.hp = Math.min(run.maxHp, run.hp + heal);
      run.acto = to;
      run.map = generateMap(to);
      run.pos = -1;
      run.visited = [];
      run.floor = 0;
      run.shop = undefined;
      saveLocal();
      logEvent('inicio_acto', '', '', { acto: to });
      syncRun('en curso');
      audio.sfx('heal');
      fadeTo(this, 'Map');
    }, { color: UI.gold, size: 24 });
  }
}
