import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { EVENTS } from '../data/events';
import { Game, logEvent, saveLocal, syncRun } from '../state';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, embers, fadeTo, frame, icon, mist, title, Tooltip, txt, vignette } from '../ui/widgets';
import { describeOutcome } from './Rune';

export class EventScene extends Phaser.Scene {
  constructor() { super('Event'); }

  create(data: { floor: number }) {
    this.cameras.main.fadeIn(400);
    audio.play('calma');
    const run = Game.run!;
    const ev = EVENTS[(Math.max(0, run.pos) * 3 + run.runId.length) % EVENTS.length];

    this.add.rectangle(0, 0, W, H, 0x050407).setOrigin(0);
    const floor = this.add.graphics();
    floor.fillStyle(0x0e0b12, 1).fillEllipse(W / 2 - 140, 400, 520, 90);
    const glow = this.add.circle(W / 2 - 140, 300, 150, 0xc8a070, 0.05).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.09, duration: 1800, yoyo: true, repeat: -1 });
    mist(this, 360);
    embers(this);
    vignette(this);
    const tip = new Tooltip(this);
    topBar(this, tip);

    const npc = this.add.image(W / 2 - 140, 300, ev.npc).setScale(7);
    this.tweens.add({ targets: npc, y: 294, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    if (ev.prop) this.add.image(W / 2 - 40, 360, ev.prop).setScale(4);
    const hero = this.add.image(130, 340, 'hero').setScale(4);
    this.tweens.add({ targets: hero, y: 337, duration: 1100, yoyo: true, repeat: -1 });

    title(this, W / 2, 76, ev.name, 40, CSS.bone);

    const g = this.add.graphics();
    frame(g, 520, 120, 410, 300, 0x0b090e, UI.border, 0.95);
    txt(this, 540, 136, ev.intro, 21, CSS.bone, { wordWrap: { width: 370 }, lineSpacing: 2 });
    txt(this, 540, 300, `${T.evento.siAciertas}:`, 19, CSS.green);
    txt(this, 540, 320, describeOutcome(ev.bless), 19, CSS.bone, { wordWrap: { width: 370 } });
    txt(this, 540, 360, `${T.evento.siFallas}:`, 19, '#e08a8a');
    txt(this, 540, 380, describeOutcome(ev.curse), 19, CSS.bone, { wordWrap: { width: 370 } });

    button(this, 625, 470, 200, 50, T.evento.aceptar, () => {
      fadeTo(this, 'Rune', { floor: data.floor, source: 'evento', eventId: ev.id });
    }, { color: UI.gold, size: 24 });
    button(this, 835, 470, 190, 50, T.evento.rechazar, () => {
      run.floor = data.floor + 1;
      saveLocal();
      logEvent('encuentro', '', '', { npc: ev.id, resultado: 'rechazado' });
      syncRun('en curso');
      fadeTo(this, 'Map');
    }, { size: 22 });
    void icon;
  }
}
