import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { cardName } from '../data/cards';
import { RELICS } from '../data/relics';
import { checkAnswer, Problem, randomProblem } from '../data/runes';
import { Game, logEvent, saveLocal, syncRun } from '../state';
import { deckOverlay, topBar } from '../ui/hud';
import { button, Btn, embers, fadeTo, frame, icon, panel, title, Tooltip, txt, vignette } from '../ui/widgets';
import { grantRelic, randomRelics } from './Reward';

export class RuneScene extends Phaser.Scene {
  private p!: Problem;
  private source: 'altar' | 'fogata' = 'altar';
  private floor = 0;
  private attempts = 0;
  private resultC!: Phaser.GameObjects.Container;
  private hud!: ReturnType<typeof topBar>;
  private tip!: Tooltip;

  constructor() { super('Rune'); }

  create(data: { floor: number; source: 'altar' | 'fogata' }) {
    this.source = data.source;
    this.floor = data.floor;
    this.attempts = 0;
    this.cameras.main.fadeIn(300);
    this.add.rectangle(0, 0, W, H, 0x0b0910).setOrigin(0);
    const circle = this.add.graphics();
    circle.lineStyle(2, 0x8e5bb0, 0.25).strokeCircle(W / 2, 290, 230).strokeCircle(W / 2, 290, 200);
    this.tweens.add({ targets: circle, alpha: 0.4, duration: 1500, yoyo: true, repeat: -1 });
    embers(this);
    vignette(this);
    this.tip = new Tooltip(this);
    this.hud = topBar(this, this.tip);

    this.p = randomProblem();
    const p = this.p;
    icon(this, W / 2, 86, 'i_rune', 5);
    title(this, W / 2, 132, p.title, 38, CSS.purple);
    txt(this, W / 2, 160, this.source === 'altar' ? 'Resuélvela y el altar te concederá una reliquia.' : 'Resuélvela y podrás mejorar una carta.', 20, CSS.dim).setOrigin(0.5);

    panel(this, 110, 180, W - 220, 150, 0x120e17, 0x5b3a72);
    txt(this, 136, 196, p.prompt, 23, CSS.bone, { wordWrap: { width: W - 280 }, lineSpacing: 2 });

    this.resultC = this.add.container(0, 0);

    if (p.choices) {
      p.choices.forEach((ch, i) => {
        const b: Btn = button(this, W / 2, 360 + i * 44, 640, 38, ch, () => this.answer(i), { size: 20 });
        b.setData('choice', i);
      });
    } else {
      const dom = this.add.dom(W / 2 - 60, 372).createFromHTML(
        `<div class="answer"><input id="ans" inputmode="decimal" placeholder="tu respuesta" autocomplete="off"/><span>${p.unit}</span></div>`,
      );
      const inp = (dom.node as HTMLElement).querySelector('#ans') as HTMLInputElement;
      setTimeout(() => inp.focus(), 350);
      const send = () => {
        if (!inp.value.trim()) return;
        this.answer(inp.value);
      };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
      const b = button(this, W / 2 + 200, 372, 160, 44, 'Responder', send, { color: 0x8e5bb0, size: 24 });
      this.events.once('solved', () => { dom.destroy(); b.destroy(); });
      txt(this, W / 2, 410, 'Usa g = 9.81 m/s². Se acepta un margen de ±2–3 %. Tienes 2 intentos.', 18, CSS.dim).setOrigin(0.5).setName('rules');
    }
  }

  private answer(v: number | string) {
    const p = this.p;
    this.attempts++;
    const ok = checkAnswer(p, v);
    const run = Game.run!;
    logEvent('runa', p.concept, ok, {
      titulo: p.title, intento: this.attempts, respuesta: v, esperado: p.answer ?? p.choices?.[p.correct!], fuente: this.source,
    });
    if (!ok && !p.choices && this.attempts < 2) {
      this.flash('No es correcto. Revisa tu diagrama de cuerpo libre y vuelve a intentar.', CSS.blood);
      return;
    }
    this.events.emit('solved');
    this.children.list.filter((o) => (o as any).getData?.('choice') !== undefined).forEach((o) => (o as any).disableInteractive?.());
    this.children.getByName('rules')?.destroy();
    run.stats.runasTotal++;
    if (ok) {
      run.stats.runasOk++;
      run.score += 25;
    }
    run.floor = this.floor + 1;
    saveLocal();
    syncRun('en curso');
    this.showResult(ok);
  }

  private flash(s: string, color: string) {
    const t = txt(this, W / 2, 440, s, 21, color).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 400, onComplete: () => t.destroy() });
  }

  private showResult(ok: boolean) {
    const p = this.p;
    this.children.list.filter((o) => (o as any).getData?.('choice') !== undefined).forEach((o) => o.destroy());
    const c = this.resultC;
    const g = this.add.graphics();
    frame(g, 110, 340, W - 220, 186, 0x120e17, ok ? UI.green : UI.blood);
    c.add(g);
    c.add(txt(this, 132, 350, ok ? '✔ ¡Correcto! La runa brilla.' : '✘ La runa se apaga… Así se resolvía:', 24, ok ? CSS.green : CSS.blood));
    if (p.answer !== undefined) {
      c.add(txt(this, W - 132, 352, `Respuesta: ${Math.round(p.answer * 100) / 100} ${p.unit}`, 22, CSS.gold).setOrigin(1, 0));
    }
    c.add(txt(this, 132, 382, p.solution.join('\n'), 21, CSS.bone, { lineSpacing: 2 }));

    const cont = () => fadeTo(this, 'Map');
    if (!ok) {
      c.add(button(this, W - 200, 496, 220, 40, 'Continuar', cont, { size: 22 }));
      return;
    }
    if (this.source === 'altar') {
      const opts = randomRelics(2);
      if (!opts.length) {
        Game.run!.score += 25;
        c.add(button(this, W - 200, 496, 220, 40, 'Continuar', cont, { size: 22 }));
        return;
      }
      c.add(txt(this, 560, 384, 'Elige una reliquia:', 22, CSS.gold));
      opts.forEach((id, i) => {
        const rel = RELICS[id];
        const b = button(this, 690, 428 + i * 48, 260, 42, '', () => {
          grantRelic(id);
          saveLocal();
          this.hud.refresh();
          logEvent('reliquia', '', '', { id });
          cont();
        }, { size: 20, color: UI.gold });
        b.label.setText(`   ${rel.name}`);
        b.add(icon(this, -110, 0, rel.icon, 2.6));
        this.tip.attach(b, rel.name, `${rel.text}\n${rel.lore}`);
      });
    } else {
      c.add(button(this, W - 210, 496, 240, 40, 'Mejorar una carta', () => {
        const options = Game.run!.deck.filter((x) => !x.up);
        deckOverlay(this, 'Elige una carta para mejorar', options, (i) => {
          const card = options[i];
          card.up = true;
          saveLocal();
          logEvent('mejora', '', '', { carta: cardName(card) });
          cont();
        });
      }, { size: 22, color: UI.green }));
    }
  }
}
