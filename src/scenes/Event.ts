import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { EVENTS, EventDef, PROFE_CHANCE, PROFE_ENOJADO_CHANCE } from '../data/events';
import { ALMA_CHANCE, ALMA_IDS } from '../data/almas';
import { AM_CHANCE } from '../data/am';

/** Probabilidad de encontrar el Necronomicón en un encuentro (Actos II y III, una vez) */
const NECRO_CHANCE = 0.15;
import { DILEMMA_CHANCE, DILEMMAS } from '../data/dilemmas';
import { Game, logEvent, saveLocal, syncRun, unlock } from '../state';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, embers, fadeTo, frame, icon, mist, title, Tooltip, txt, vignette } from '../ui/widgets';
import { describeOutcome } from './Rune';

export class EventScene extends Phaser.Scene {
  constructor() { super('Event'); }

  create(data: { floor: number; eventId?: string }) {
    const run = Game.run!;
    const seen = (run.seen ??= []);
    // ── ¿qué hay en la penumbra? (azar) ──
    let ev: EventDef | undefined = data.eventId ? EVENTS.find((e) => e.id === data.eventId) : undefined;
    if (!ev) {
      const profeVisto = seen.includes('victorino') || seen.includes('profe_enojado');
      const almas = ALMA_IDS.filter((id) => !seen.includes(`alma_${id}`));
      if (!profeVisto && data.floor >= 2 && Math.random() < PROFE_ENOJADO_CHANCE) {
        ev = EVENTS.find((e) => e.id === 'profe_enojado')!;
      } else if (!profeVisto && Math.random() < PROFE_CHANCE) {
        ev = EVENTS.find((e) => e.id === 'victorino')!;
      } else if ((run.acto ?? 1) >= 2 && !seen.includes('atril') && !run.relics.includes('necronomicon') && Math.random() < NECRO_CHANCE) {
        seen.push('atril');
        saveLocal();
        this.scene.start('Dilemma', { floor: data.floor, id: 'atril' });
        return;
      } else if (!seen.includes('am') && data.floor >= 3 && Math.random() < AM_CHANCE) {
        // AM, la inteligencia artificial de las criptas (src/data/am.ts)
        seen.push('am');
        saveLocal();
        this.scene.start('AM', { floor: data.floor });
        return;
      } else if (almas.length && Math.random() < ALMA_CHANCE) {
        // un alma en pena (rara): escena propia
        const id = Phaser.Utils.Array.GetRandom(almas);
        seen.push(`alma_${id}`);
        saveLocal();
        this.scene.start('Alma', { floor: data.floor, id });
        return;
      } else {
        const dil = DILEMMAS.filter((d) => !d.special && !seen.includes(d.id));
        if (dil.length && Math.random() < DILEMMA_CHANCE) {
          const d = Phaser.Utils.Array.GetRandom(dil);
          seen.push(d.id);
          saveLocal();
          this.scene.start('Dilemma', { floor: data.floor, id: d.id });
          return;
        }
        const pool = EVENTS.filter((e) => !e.special && !seen.includes(e.id));
        ev = Phaser.Utils.Array.GetRandom(pool.length ? pool : EVENTS.filter((e) => !e.special));
      }
      seen.push(ev.id);
    }
    this.cameras.main.fadeIn(400);
    audio.play('calma');
    unlock('npcs', ev.id);
    // el profe de mal humor: ¡librazo! (la mitad de tu vida, una sola vez)
    let golpe = 0;
    if (ev.id === 'profe_enojado' && !seen.includes('profe_golpe')) {
      seen.push('profe_golpe');
      golpe = Math.floor(run.hp / 2);
      run.hp = Math.max(1, run.hp - golpe);
      logEvent('encuentro', '', '', { npc: ev.id, resultado: `librazo: −${golpe} de vida` });
    }
    saveLocal();

    this.add.rectangle(0, 0, W, H, 0x050407).setOrigin(0);
    const floor = this.add.graphics();
    floor.fillStyle(0x0e0b12, 1).fillEllipse(W / 2 - 140, 400, 520, 90);
    const glow = this.add.circle(W / 2 - 140, 300, 150, 0xc8a070, 0.05).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.09, duration: 1800, yoyo: true, repeat: -1 });
    mist(this, 360);
    embers(this);
    vignette(this);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);

    const npc = this.add.image(W / 2 - 140, 300, ev.npc).setScale(7);
    this.tweens.add({ targets: npc, y: 294, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    if (ev.prop) this.add.image(W / 2 - 40, 360, ev.prop).setScale(4);
    const hero = this.add.image(130, 340, 'hero').setScale(2);
    this.tweens.add({ targets: hero, y: 337, duration: 1100, yoyo: true, repeat: -1 });
    if (golpe) {
      this.time.delayedCall(700, () => {
        audio.sfx('hit');
        this.cameras.main.shake(350, 0.012);
        this.cameras.main.flash(250, 160, 20, 20);
        hero.setTint(0xff6a6a);
        this.time.delayedCall(300, () => hero.clearTint());
        const t = txt(this, 130, 250, `−${golpe}`, 40, '#e04a4a').setOrigin(0.5).setDepth(900);
        this.tweens.add({ targets: t, y: 200, alpha: 0, duration: 1400, onComplete: () => t.destroy() });
        hud.refresh();
      });
    }

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
