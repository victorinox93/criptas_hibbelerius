import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { addCard, arcanistaUnlocked, codexFlag, Game, generateMap, logEvent, saveLocal, syncRun } from '../state';
import { T } from '../textos';
import { button, embers, fadeTo, frame, icon, title, Tooltip, txt, vignette } from '../ui/widgets';
import { BOSS_RELICS, RELICS } from '../data/relics';
import { CARDS, legendariasDisponibles } from '../data/cards';
import { cardView } from '../ui/card';
import { grantRelic } from './Reward';

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

    const seguir = () => {
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
    };
    button(this, W / 2, 500, 340, 50, tx.descender, () => this.reliquiaJefe(to, () => this.legendaria(to, seguir)), { color: UI.gold, size: 24 });
  }

  /** Carta legendaria tras vencer al jefe: elige 1 de 3 */
  private legendaria(to: number, seguir: () => void) {
    const run = Game.run!;
    const key = `legendaria_${to}`;
    const opts = legendariasDisponibles(run.deck, 3);
    if ((run.seen ??= []).includes(key) || !opts.length) return seguir();
    const layer = this.add.container(0, 0).setDepth(900);
    layer.add(this.add.rectangle(0, 0, W, H, 0x030304, 0.97).setOrigin(0).setInteractive());
    layer.add(title(this, W / 2, 50, 'Carta Legendaria', 40));
    layer.add(txt(this, W / 2, 84, 'Entre los restos del jefe brillan tres cartas. Sólo puedes llevar una.', 19, CSS.dim).setOrigin(0.5));
    const tip = new Tooltip(this);
    opts.forEach((id, i) => {
      const v = cardView(this, W / 2 + (i - (opts.length - 1) / 2) * 210, 260, { uid: -1, id, up: false });
      v.setInteractive({ useHandCursor: true });
      v.on('pointerover', () => { v.setScale(1.08); tip.show(v.x + 90, 420, CARDS[id].concept, CARDS[id].lore); });
      v.on('pointerout', () => { v.setScale(1); tip.hide(); });
      v.on('pointerdown', () => {
        run.seen!.push(key);
        addCard(id);
        logEvent('legendaria', '', '', { id });
        audio.sfx('victory');
        seguir();
      });
      layer.add(v);
    });
    layer.add(button(this, W / 2, 492, 200, 40, 'No tomar ninguna', () => { run.seen!.push(key); seguir(); }, { size: 19 }));
    void tip;
  }

  /** Reliquia de jefe: elige 1 de 3 (poderosas, con una desventaja) */
  private reliquiaJefe(to: number, seguir: () => void) {
    const run = Game.run!;
    const key = `reliquia_jefe_${to}`;
    const opts = Phaser.Utils.Array.Shuffle(BOSS_RELICS.filter((id) => !run.relics.includes(id))).slice(0, 3);
    if ((run.seen ??= []).includes(key) || !opts.length) return seguir();
    const layer = this.add.container(0, 0).setDepth(900);
    layer.add(this.add.rectangle(0, 0, W, H, 0x030304, 0.97).setOrigin(0).setInteractive());
    layer.add(title(this, W / 2, 56, 'Reliquia del Jefe', 40));
    layer.add(txt(this, W / 2, 92, 'Del cuerpo del jefe cae un tesoro. Elige uno: todos tienen un precio.', 19, CSS.dim).setOrigin(0.5));
    const tip = new Tooltip(this);
    opts.forEach((id, i) => {
      const r = RELICS[id];
      const x = W / 2 + (i - (opts.length - 1) / 2) * 290;
      const g = this.add.graphics();
      const draw = (hi: boolean) => { g.clear(); frame(g, x - 130, 130, 260, 300, 0x0e0b12, hi ? UI.gold : UI.border, 0.97); };
      draw(false);
      const [bueno, costo] = r.text.split('\nCosto:');
      layer.add([g, icon(this, x, 190, r.icon, 6),
        txt(this, x, 238, r.name, 21, CSS.gold, { align: 'center', wordWrap: { width: 230 } }).setOrigin(0.5, 0),
        txt(this, x, 296, bueno, 18, CSS.bone, { align: 'center', wordWrap: { width: 230 } }).setOrigin(0.5, 0),
        txt(this, x, 362, `Costo:${costo ?? ''}`, 17, '#e08a8a', { align: 'center', wordWrap: { width: 230 } }).setOrigin(0.5, 0)]);
      const z = this.add.zone(x - 130, 130, 260, 300).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerover', (p: Phaser.Input.Pointer) => { draw(true); tip.show(p.worldX + 16, 440, r.name, r.lore); });
      z.on('pointerout', () => { draw(false); tip.hide(); });
      z.on('pointerdown', () => {
        run.seen!.push(key);
        grantRelic(id);
        logEvent('reliquia', '', '', { id, jefe: true });
        audio.sfx('victory');
        layer.destroy();
        seguir();
      });
      layer.add(z);
    });
    layer.add(button(this, W / 2, 480, 200, 40, 'No tomar ninguna', () => { run.seen!.push(key); layer.destroy(); seguir(); }, { size: 19 }));
  }
}
