import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { arcanistaUnlocked, codexFlag, Game, generateMap, logEvent, saveLocal, syncRun } from '../state';
import { T } from '../textos';
import { button, embers, fadeTo, title, txt, vignette } from '../ui/widgets';

/** Entre el Acto I y el Acto II: descanso, aviso de desbloqueo y descenso */
export class ActTransitionScene extends Phaser.Scene {
  constructor() { super('ActTransition'); }

  create() {
    this.cameras.main.fadeIn(600);
    audio.play('santuario');
    const run = Game.run!;
    this.add.rectangle(0, 0, W, H, 0x030304).setOrigin(0);
    // escalera que desciende
    const g = this.add.graphics();
    for (let i = 0; i < 12; i++) {
      const w = 420 - i * 30, y = 300 + i * 18;
      g.fillStyle(Phaser.Display.Color.GetColor(30 - i * 2, 34 - i * 2, 40 - i * 2), 1).fillRect(W / 2 - w / 2, y, w, 16);
      g.lineStyle(1, 0x34404e, 0.6 - i * 0.04).strokeRect(W / 2 - w / 2, y, w, 16);
    }
    embers(this);
    vignette(this);
    const col = this.add.image(W - 170, 230, 'colossus').setScale(4).setAlpha(0.5).setTint(0x6a6a7a);
    this.tweens.add({ targets: col, alpha: 0.1, y: 260, duration: 3000 });

    title(this, W / 2, 60, T.transicion.titulo, 50);
    txt(this, W / 2, 104, T.transicion.texto, 21, CSS.bone, { align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5, 0);
    const wz = this.add.image(170, 250, 'wizard').setScale(5).setAlpha(0);
    this.tweens.add({ targets: wz, alpha: 0.85, duration: 1600, delay: 500 });
    const q = txt(this, 170, 340, T.transicion.cita, 18, CSS.purple, { align: 'center' }).setOrigin(0.5, 0).setAlpha(0);
    this.tweens.add({ targets: q, alpha: 1, duration: 1200, delay: 1400 });

    // descanso entre actos: recupera 75 % de la vida perdida
    const heal = Math.ceil((run.maxHp - run.hp) * 0.75);
    const wasLocked = !(Game.codex.flags ?? []).includes('acto1-visto');
    txt(this, W / 2, 196, `${T.transicion.curacion} ${heal} de vida.`, 22, CSS.green).setOrigin(0.5);
    if (arcanistaUnlocked() && wasLocked && run.clase !== 'arcanista') {
      txt(this, W / 2, 226, T.transicion.desbloqueo, 22, CSS.gold).setOrigin(0.5);
    }
    codexFlag('acto1-visto');

    button(this, W / 2, 500, 320, 50, T.transicion.descender, () => {
      run.hp = Math.min(run.maxHp, run.hp + heal);
      run.acto = 2;
      run.map = generateMap(2);
      run.pos = -1;
      run.visited = [];
      run.floor = 0;
      run.shop = undefined;
      run.score += 50;
      saveLocal();
      logEvent('inicio_acto', '', '', { acto: 2 });
      syncRun('en curso');
      audio.sfx('heal');
      fadeTo(this, 'Map');
    }, { color: UI.gold, size: 26 });
  }
}
