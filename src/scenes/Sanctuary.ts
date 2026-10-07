import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { BOONS, FIGURES, FigureDef } from '../data/figures';
import { addCard, addEntropia, addErgios, Game, logEvent, saveLocal, syncRun, unlock } from '../state';
import { CardInst, cardName, evolucionable } from '../data/cards';
import { ENTROPIA } from '../data/abismo';
import { T } from '../textos';
import { deckOverlay, topBar } from '../ui/hud';
import { button, fadeTo, frame, icon, title, Tooltip, txt, vignette } from '../ui/widgets';

export interface SanctuaryData {
  floor: number;
  figureId?: string;
  phase?: 'intro' | 'elegir';
  epic?: boolean;
}

function pickFigure(): FigureDef {
  const r = Game.run!;
  const acto = r.acto ?? 1;
  const posibles = FIGURES.filter((f) => !f.act || acto >= f.act);
  // en el Núcleo, los ecos del Núcleo (Asimov y Turing) salen más seguido
  const delActo = posibles.filter((f) => f.act === acto && !r.met.includes(f.id));
  if (delActo.length && Math.random() < 0.6) return Phaser.Utils.Array.GetRandom(delActo);
  const unmet = posibles.filter((f) => !r.met.includes(f.id));
  const pool = unmet.length ? unmet : posibles;
  return Phaser.Utils.Array.GetRandom(pool);
}

export class SanctuaryScene extends Phaser.Scene {
  private hud!: ReturnType<typeof topBar>;
  private tip!: Tooltip;

  constructor() { super('Sanctuary'); }

  create(data: SanctuaryData) {
    this.cameras.main.fadeIn(500);
    audio.play('santuario');
    const run = Game.run!;
    const fig = (data.figureId && FIGURES.find((f) => f.id === data.figureId)) || pickFigure();
    const phase = data.phase ?? 'intro';
    unlock('figures', fig.id);
    saveLocal();

    // ── ambiente: haz de luz espectral ──
    this.add.rectangle(0, 0, W, H, 0x040308).setOrigin(0);
    const fx = phase === 'intro' ? 250 : 150;
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(fx, 0, 160 - i * 22, H, 0x7fd8ff, 0.025).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD);
    }
    const glow = this.add.circle(fx, 250, 120, 0x7fd8ff, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.15, scale: 1.08, duration: 2200, yoyo: true, repeat: -1 });
    this.add.particles(fx, 420, 'px', {
      x: { min: -70, max: 70 }, speedY: { min: -40, max: -15 }, lifespan: 4000, frequency: 90,
      scale: { start: 1.6, end: 0 }, alpha: { start: 0.7, end: 0 }, tint: [0x7fd8ff, 0xd8f4ff, 0xe8c15a], blendMode: 'ADD',
    });
    vignette(this);
    this.tip = new Tooltip(this);
    this.hud = topBar(this, this.tip);

    const sc = phase === 'intro' ? 9 : 6;
    const por = this.add.image(fx, phase === 'intro' ? 250 : 230, fig.sprite).setScale(sc).setTint(0xd8ecff).setAlpha(0);
    this.tweens.add({ targets: por, alpha: 0.95, duration: 1200 });
    this.tweens.add({ targets: por, y: por.y - 6, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, fx, phase === 'intro' ? 352 : 312, fig.name, 26, CSS.bone).setOrigin(0.5);
    txt(this, fx, phase === 'intro' ? 378 : 336, `${fig.years} · ${fig.epithet}`, 18, '#9ad8f0').setOrigin(0.5);

    if (phase === 'intro') this.intro(fig, data);
    else this.choose(fig, data, !!data.epic);
    void run;
  }

  private intro(fig: FigureDef, data: SanctuaryData) {
    title(this, 690, 76, T.mapa.nodos.santuario[0], 38, '#9ad8f0');
    const g = this.add.graphics();
    frame(g, 470, 110, 460, 250, 0x07090e, 0x3a6a8a, 0.95);
    txt(this, 490, 128, fig.intro, 21, CSS.bone, { wordWrap: { width: 420 }, lineSpacing: 2 });
    txt(this, 490, 250, `${T.santuario.don}s:`, 19, CSS.gold);
    fig.boons.forEach((id, i) => {
      const b = BOONS[id];
      const im = icon(this, 504, 286 + i * 24, b.icon, 2);
      txt(this, 520, 276 + i * 24, b.name, 19, CSS.dim);
      this.tip.attach(im, b.name, `${T.santuario.comun}: ${b.text[0]}\n${T.santuario.epico}: ${b.text[1]}`);
    });
    button(this, 580, 430, 220, 60, T.santuario.responder, () => {
      fadeTo(this, 'Rune', { floor: data.floor, source: 'santuario', figureId: fig.id });
    }, { color: UI.gold, size: 21 });
    button(this, 820, 430, 220, 60, T.santuario.sinResponder, () => {
      fadeTo(this, 'Sanctuary', { floor: data.floor, figureId: fig.id, phase: 'elegir', epic: false });
    }, { size: 21 });
  }

  /** Dones que hacen algo en el momento (Oppenheimer, Darwin) */
  private donInmediato(id: string, epic: boolean, done: (extra?: string) => void) {
    const run = Game.run!;
    const vida = (n: number) => { run.maxHp += n; run.hp = Math.min(run.maxHp, run.hp + n); };
    if (id === 'o_trinity') {
      addCard('trinity', epic);
      return done('La carta «Trinity» está en tu mazo. Úsala con cuidado: sólo hay una.');
    }
    if (id === 'd_adaptacion') {
      vida(epic ? 20 : 12);
      return done(`+${epic ? 20 : 12} de Vida máxima.`);
    }
    if (id === 'd_seleccion') {
      vida(epic ? 10 : 5);
      const cands = run.deck.filter(evolucionable);
      if (!cands.length) return done(`+${epic ? 10 : 5} de Vida máxima.`);
      const evo = (ci: CardInst) => {
        ci.evo = (ci.evo ?? 0) + 3;
        if (epic) ci.up = true;
        saveLocal();
        audio.sfx('victory');
        done(`«${cardName(ci)}» evolucionó 3 niveles. +${epic ? 10 : 5} de Vida máxima.`);
      };
      deckOverlay(this, 'Selección Natural: elige la carta que evolucionará', cands, (i) => evo(cands[i]),
        () => evo(Phaser.Utils.Array.GetRandom(cands)));
      return;
    }
    done();
  }

  private choose(fig: FigureDef, data: SanctuaryData, epic: boolean) {
    const run = Game.run!;
    title(this, 600, 76, `${T.santuario.elige} · ${epic ? T.santuario.epico : T.santuario.comun}`, 36, epic ? CSS.gold : CSS.bone);
    const finish = (msg: string) => {
      if (!run.met.includes(fig.id)) run.met.push(fig.id);
      addEntropia(ENTROPIA.eco); // una mente lúcida calma la tuya
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      this.hud.refresh();
      this.children.list.filter((o) => o.getData?.('boon')).forEach((o) => o.destroy());
      const g = this.add.graphics();
      frame(g, 330, 180, 560, 180, 0x07090e, 0x3a6a8a, 0.95);
      txt(this, 610, 230, fig.farewell, 23, CSS.bone, { align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5);
      txt(this, 610, 300, msg, 20, CSS.gold, { align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5);
      button(this, 610, 420, 220, 44, T.santuario.continuar, () => fadeTo(this, 'Map'), { size: 22 });
    };

    const avail = fig.boons.filter((id) => !run.boons.some((b) => b.id === id));
    if (!avail.length) {
      addErgios(30);
      return finish(T.santuario.sinDones);
    }
    fig.boons.forEach((id, i) => {
      const b = BOONS[id];
      const owned = !avail.includes(id);
      const x = 390 + i * 210, y = 140;
      const c = this.add.container(0, 0).setData('boon', true);
      const g = this.add.graphics();
      const draw = (hover: boolean) => {
        g.clear();
        frame(g, x - 95, y, 190, 290, hover ? 0x14182a : 0x0b0d16, owned ? UI.border : epic ? UI.gold : 0x9aa4b8, 0.97);
      };
      draw(false);
      c.add(g);
      c.add(icon(this, x, y + 50, b.icon, 6).setAlpha(owned ? 0.3 : 1));
      c.add(txt(this, x, y + 98, b.name, 22, owned ? CSS.dim : CSS.bone, { align: 'center', wordWrap: { width: 170 } }).setOrigin(0.5, 0));
      c.add(txt(this, x, y + 148, owned ? T.santuario.yaLoTienes : epic ? T.santuario.epico : T.santuario.comun, 18,
        owned ? CSS.dim : epic ? CSS.gold : '#b8c0d0').setOrigin(0.5, 0));
      // el texto puede traer una segunda parte con el costo de radiación
      const [good, rad] = b.text[epic ? 1 : 0].split('\nRadiación:');
      const gt = txt(this, x, y + 172, good, 18, CSS.bone, { align: 'center', wordWrap: { width: 170 } }).setOrigin(0.5, 0);
      c.add(gt);
      if (rad) c.add(txt(this, x, gt.y + gt.height + 6, `Radiación:${rad}`, 17, '#9bf07a', { align: 'center', wordWrap: { width: 170 } }).setOrigin(0.5, 0));
      else c.add(txt(this, x, y + 250, b.lore, 15, '#7a8a9a', { align: 'center', wordWrap: { width: 170 } }).setOrigin(0.5, 0));
      if (!owned) {
        const z = this.add.zone(x - 95, y, 190, 290).setOrigin(0).setInteractive({ useHandCursor: true });
        z.on('pointerover', (p: Phaser.Input.Pointer) => { draw(true); audio.sfx('hover'); this.tip.show(p.worldX + 20, 452, b.name, b.lore); });
        z.on('pointerout', () => { draw(false); this.tip.hide(); });
        z.on('pointerdown', () => {
          run.boons.push({ id, epic });
          unlock('boons', id);
          audio.sfx('heal');
          logEvent('don', fig.id, epic, { don: id, epico: epic });
          const msg = `${T.santuario.don}: ${b.name} (${epic ? T.santuario.epico : T.santuario.comun})`;
          this.tip.hide();
          this.donInmediato(id, epic, (extra) => finish(extra ? `${msg}\n${extra}` : msg));
        });
        c.add(z);
      }
    });
  }
}
