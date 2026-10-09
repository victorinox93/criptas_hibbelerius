import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { cardName, CARDS } from '../data/cards';
import { EFFECTS } from '../data/effects';
import { EVENTS, Outcome } from '../data/events';
import { RELICS } from '../data/relics';
import { CALCULO_CONCEPTS, checkAnswer, IMPULSE_CONCEPTS, Problem, randomProblem } from '../data/runes';
import { multRacha, PUNTOS, sumar } from '../data/puntaje';
import { ENTROPIA } from '../data/abismo';
import { AM_ENTROPIA, PACTO_AM } from '../data/am';
import { completarEncargo } from '../data/encargos';
import { addCard, addEffect, addEntropia, addErgios, boonLevel, Game, logEvent, saveLocal, syncRun } from '../state';
import { FIGURES } from '../data/figures';
import { gravityOf } from '../data/gravity';
import { T } from '../textos';
import { PISTA_COSTO } from '../config';
import { deckOverlay, topBar } from '../ui/hud';
import { button, Btn, embers, fadeTo, frame, icon, panel, TextField, title, Tooltip, txt, vignette } from '../ui/widgets';
import { grantRelic, randomRelics } from './Reward';

export type RuneSource = 'altar' | 'fogata' | 'evento' | 'regateo' | 'santuario';

export interface RuneData {
  floor: number;
  source: RuneSource;
  eventId?: string;
  figureId?: string;
  reto?: boolean; // eco molesto: reto de reconciliación (si fallas, se va)
}

/** Aplica el resultado de un encuentro y devuelve una descripción */
export function applyOutcome(o: Outcome): string {
  const r = Game.run!;
  const parts: string[] = [];
  if (o.effect) {
    addEffect(o.effect, o.combats ?? 1);
    const e = EFFECTS[o.effect];
    parts.push(`${e.good ? T.evento.bendicion : T.evento.maldicion}: ${e.name} — ${e.text} (${o.combats ?? 1} combate${(o.combats ?? 1) > 1 ? 's' : ''})`);
  }
  if (o.ergios) {
    const n = o.ergios < 0 ? -Math.min(r.ergios, -o.ergios) : o.ergios;
    addErgios(n);
    parts.push(`${n >= 0 ? '+' : ''}${n} ${T.moneda}`);
  }
  if (o.heal) {
    r.hp = Math.min(r.maxHp, r.hp + o.heal);
    parts.push(`+${o.heal} de vida`);
  }
  if (o.relic && RELICS[o.relic]) {
    grantRelic(o.relic);
    parts.push(`Reliquia: ${RELICS[o.relic].name}`);
  }
  if (o.junk) {
    for (let i = 0; i < o.junk.n; i++) addCard(o.junk.id);
    parts.push(`${o.junk.n} «${CARDS[o.junk.id].name}» a tu mazo`);
  }
  return parts.join('\n');
}

export function describeOutcome(o: Outcome): string {
  if (o.relic && RELICS[o.relic]) return `${RELICS[o.relic].name}${o.ergios ? ` y +${o.ergios} ${T.moneda}` : ''}`;
  if (o.effect) {
    const e = EFFECTS[o.effect];
    return `${e.name}: ${e.text} (${o.combats ?? 1} combate${(o.combats ?? 1) > 1 ? 's' : ''})`;
  }
  if (o.ergios && o.heal) return `+${o.ergios} ${T.moneda} y +${o.heal} de vida`;
  if (o.ergios) return `${o.ergios > 0 ? '+' : ''}${o.ergios} ${T.moneda}`;
  if (o.junk) return `${o.junk.n} «${CARDS[o.junk.id].name}» a tu mazo`;
  if (o.heal) return `+${o.heal} de vida`;
  return '';
}

export class RuneScene extends Phaser.Scene {
  private p!: Problem;
  private d!: RuneData;
  private attempts = 0;
  private resultC!: Phaser.GameObjects.Container;
  private hud!: ReturnType<typeof topBar>;
  private tip!: Tooltip;
  private answerUi: Phaser.GameObjects.GameObject[] = [];
  private field: TextField | null = null;
  private amUsado = false; // la resolvió AM (src/data/am.ts)

  constructor() { super('Rune'); }

  create(data: RuneData) {
    this.d = data;
    this.attempts = 0;
    this.amUsado = false;
    this.answerUi = [];
    this.field = null;
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    this.add.rectangle(0, 0, W, H, 0x07060a).setOrigin(0);
    const circle = this.add.graphics();
    circle.lineStyle(2, 0x8e5bb0, 0.18).strokeCircle(W / 2, 290, 230).strokeCircle(W / 2, 290, 200);
    this.tweens.add({ targets: circle, alpha: 0.4, duration: 1500, yoyo: true, repeat: -1 });
    embers(this);
    vignette(this);
    this.tip = new Tooltip(this);
    this.hud = topBar(this, this.tip);

    const ev = data.eventId ? EVENTS.find((e) => e.id === data.eventId) : undefined;
    const fig = data.figureId ? FIGURES.find((f) => f.id === data.figureId) : undefined;
    const acto = Game.run?.acto ?? 1;
    const actC = acto >= 3 ? [...IMPULSE_CONCEPTS, 'Conservacion']
      : acto === 2 ? ['Trabajo', 'Energia cinetica', 'Energia potencial', 'Conservacion', 'Trabajo-energia', 'Friccion', 'Potencia'] : undefined;
    // en el Núcleo (Acto IV) todas las preguntas son de derivadas e integrales
    this.p = randomProblem(acto >= 4 ? CALCULO_CONCEPTS : ev?.concepts ?? fig?.concepts ?? actC);
    const p = this.p;
    if (fig) {
      const por = this.add.image(62, 150, fig.sprite).setScale(4).setTint(0xd8ecff);
      this.tweens.add({ targets: por, y: 146, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      title(this, W / 2, 86, fig.name, 34, '#9ad8f0');
    } else if (ev) {
      const npc = this.add.image(62, 150, ev.npc).setScale(4);
      this.tweens.add({ targets: npc, y: 146, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      title(this, W / 2, 86, ev.name, 34, CSS.bone);
    } else {
      icon(this, W / 2, 80, 'i_rune', 5);
      title(this, W / 2, 124, p.title, 36, CSS.purple);
    }
    const sub: Record<RuneSource, string> = {
      altar: T.runa.altar,
      fogata: T.runa.fogata,
      evento: ev ? `${T.evento.siAciertas}: ${describeOutcome(ev.bless)}` : '',
      regateo: '«Resuélvelo y te rebajo los precios.»',
      santuario: T.santuario.siAciertas,
    };
    txt(this, W / 2, 156, sub[data.source], 20, CSS.dim).setOrigin(0.5);

    panel(this, 110, 176, W - 220, 154, 0x0e0b12, 0x4a2f5c);
    txt(this, 136, 192, p.prompt, 23, CSS.bone, { wordWrap: { width: W - 280 }, lineSpacing: 2 });

    this.resultC = this.add.container(0, 0);

    const choiceBtns: Btn[] = [];
    if (p.choices) {
      p.choices.forEach((ch, i) => {
        const b: Btn = button(this, W / 2, 360 + i * 44, 660, 38, ch, () => this.answer(i), { size: 20, silent: true });
        this.answerUi.push(b);
        choiceBtns.push(b);
      });
    } else {
      const f = (this.field = new TextField(this, W / 2 - 80, 372, 230, {
        placeholder: T.runa.tuRespuesta, numeric: true, maxLength: 14, onEnter: () => send(), size: 26,
      }));
      const unit = txt(this, W / 2 + 46, 372, p.unit, 26, CSS.purple).setOrigin(0, 0.5);
      const send = () => {
        if (!f.value.trim()) return;
        this.answer(f.value);
      };
      const b = button(this, W / 2 + 210, 372, 160, 44, T.runa.responder, send, { color: 0x8e5bb0, size: 24, silent: true });
      const rules = txt(this, W / 2, 412, T.runa.reglas, 18, CSS.dim).setOrigin(0.5);
      this.answerUi.push(f.c, unit, b, rules);
      this.time.delayedCall(400, () => f.focus());
    }

    // ── Pacto con AM: puede resolver la runa por ti (sin puntos ni aprendizaje) ──
    const run = Game.run;
    if (run && (run.amPacto ?? 0) > 0) {
      const amb: Btn = button(this, W - 72, 420, 124, 52, `Que AM lo\nresuelva (${run.amPacto})`, () => {
        run.amPacto = Math.max(0, (run.amPacto ?? 1) - 1);
        this.amUsado = true;
        amb.destroy();
        this.answer(p.choices ? p.correct! : p.answer!);
      }, { size: 16, color: 0x9a2a1a, silent: true });
      this.answerUi.push(amb);
    }
    // ── Pista a cambio de Ergios ──
    if (run) {
      const hint: Btn = button(this, W - 72, 360, 124, 48, `Pista\n−${PISTA_COSTO} ${T.moneda}`, () => {
        if (run.ergios < PISTA_COSTO) {
          this.flash(`Necesitas ${PISTA_COSTO} ${T.moneda} para una pista.`, CSS.blood);
          return;
        }
        addErgios(-PISTA_COSTO);
        sumar(run, 'Pistas usadas', PUNTOS.pista);
        this.hud.refresh();
        audio.sfx('coin');
        hint.setEnabled(false);
        hint.label.setText('Pista\nusada');
        logEvent('pista', p.concept, '', { titulo: p.title, fuente: this.d.source });
        if (p.choices) {
          // descarta dos opciones incorrectas
          const wrong = Phaser.Utils.Array.Shuffle(p.choices.map((_, i) => i).filter((i) => i !== p.correct)).slice(0, 2);
          for (const i of wrong) {
            choiceBtns[i].setEnabled(false);
            choiceBtns[i].label.setColor('#4a4256');
          }
        } else {
          // muestra la fórmula con la que se resuelve
          txt(this, 136, 306, `Pista: ${p.solution[0]}`, 19, CSS.gold).setDepth(5);
        }
      }, { size: 18, color: UI.gold, silent: true });
      this.answerUi.push(hint);
      if (run.ergios < PISTA_COSTO) hint.label.setColor('#6a5a5a');
    }
  }

  private answer(v: number | string) {
    const p = this.p;
    this.attempts++;
    const ok = checkAnswer(p, v);
    const run = Game.run!;
    if (!this.amUsado) logEvent('runa', p.concept, ok, {
      titulo: p.title, intento: this.attempts, respuesta: v, esperado: p.answer ?? p.choices?.[p.correct!], fuente: this.d.source,
      evento: this.d.eventId ?? '',
    });
    if (!ok && !p.choices && this.attempts < 2) {
      audio.sfx('wrong');
      this.flash(T.runa.reintento, CSS.blood);
      this.field?.setValue('');
      this.field?.focus();
      return;
    }
    audio.sfx(ok ? 'correct' : 'wrong');
    this.field?.blur();
    this.answerUi.forEach((o) => o.destroy());
    if (!this.amUsado) run.stats.runasTotal++;
    if (this.amUsado) {
      // AM pensó por ti: aciertas, pero sin puntos, racha, Conocimiento ni repaso
      addEntropia(AM_ENTROPIA);
      this.flash(PACTO_AM.usar, '#ff5a4a', 156);
      logEvent('am_runa', p.concept, true, { titulo: p.title, fuente: this.d.source });
    }
    const tm = ((run.temas ??= {})[p.concept] ??= { ok: 0, total: 0 });
    if (!this.amUsado) tm.total++;
    if (ok && !this.amUsado) tm.ok++;
    if (ok && !this.amUsado) {
      run.stats.runasOk++;
      addEntropia(ENTROPIA.runa);
      run.stats.racha = (run.stats.racha ?? 0) + 1;
      run.stats.rachaMax = Math.max(run.stats.rachaMax ?? 0, run.stats.racha);
      const pts = sumar(run, 'Preguntas correctas', PUNTOS.runa * multRacha(run.stats.racha));
      if (run.stats.racha > 1) this.flash(`Racha ×${run.stats.racha}: +${pts} puntos`, CSS.gold);
      if (run.stats.racha >= 3) {
        const e = completarEncargo('racha3');
        if (e) this.flash(`¡Encargo cumplido! +${e} ${T.moneda}`, '#e8b070', 156);
      }
      const tr = boonLevel('c_traductora');
      if (tr && this.d.source !== 'regateo') addErgios(15 * tr);
    } else if (!this.amUsado) run.stats.racha = 0;
    if (this.d.source !== 'regateo') run.floor = this.d.floor + 1;
    saveLocal();
    syncRun('en curso');
    this.showResult(ok);
  }

  /** Columna derecha del resultado: apila los textos debajo del título y los encoge
   *  hasta que quepan arriba del botón «Continuar» (que vive en y≈476–516). */
  private apilar(c: Phaser.GameObjects.Container, textos: Phaser.GameObjects.Text[], top = 384, fondo = 468) {
    const base = textos.map((t) => Number.parseInt(String(t.style.fontSize), 10) || 20);
    const colocar = () => {
      let y = top;
      textos.forEach((t) => { t.setPosition(560, y); y += t.height + 6; });
      return y - 6;
    };
    for (let k = 0; colocar() > fondo && k < 8; k++) textos.forEach((t, i) => t.setFontSize(Math.max(13, base[i] - k - 1)));
    textos.forEach((t) => c.add(t));
  }

  private flash(s: string, color: string, y = 440) {
    const t = txt(this, W / 2, y, s, 21, color).setOrigin(0.5).setDepth(20).setStroke('#000', 4);
    this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 400, onComplete: () => t.destroy() });
  }

  private showResult(ok: boolean) {
    const p = this.p;
    const c = this.resultC;
    const g = this.add.graphics();
    frame(g, 110, 340, W - 220, 186, 0x0e0b12, ok ? UI.green : 0x9a4040);
    c.add(g);
    c.add(txt(this, 132, 350, ok ? T.runa.correcto : T.runa.incorrecto, 24, ok ? CSS.green : '#e08a8a'));
    if (p.answer !== undefined) {
      c.add(txt(this, W - 132, 352, `${T.runa.respuesta}: ${Math.round(p.answer * 100) / 100} ${p.unit}`, 22, CSS.gold).setOrigin(1, 0));
    }
    const sol = txt(this, 132, 382, p.solution.join('\n'), 21, CSS.bone, { lineSpacing: 2, wordWrap: { width: 410 } });
    for (let f = 20; sol.y + sol.height > 518 && f >= 14; f--) sol.setFontSize(f);
    c.add(sol);

    const cont = () => fadeTo(this, 'Map');
    const contBtn = () => c.add(button(this, W - 210, 496, 220, 40, T.runa.continuar, cont, { size: 22 }));

    if (this.d.source === 'regateo') {
      const r = Game.run!;
      if (r.shop) {
        r.shop.haggled = true;
        r.shop.discount = ok;
      }
      saveLocal();
      this.apilar(c, [txt(this, 0, 0, ok ? '«Trato hecho: −30 % en todo.»' : '«Lo siento, viajero. Precio completo.»', 21, ok ? CSS.green : CSS.dim, { wordWrap: { width: 300 } })]);
      c.add(button(this, W - 210, 496, 220, 40, T.runa.continuar, () => fadeTo(this, 'Shop', { floor: this.d.floor }), { size: 22 }));
      return;
    }

    if (this.d.source === 'santuario') {
      const reto = !!this.d.reto;
      this.apilar(c, [txt(this, 0, 0, ok ? (reto ? '«…Está bien. Razonas mejor de lo que pensé. Hagamos las paces.»' : '«Bien razonado. Mis dones serán dignos de ti.»')
        : reto ? '«Lo suponía.» El eco te da la espalda y se desvanece.' : '«No importa. Aún así te ayudaré, aunque con menos fuerza.»',
        21, ok ? CSS.green : reto ? '#e08a8a' : CSS.dim, { wordWrap: { width: 300 } })]);
      c.add(button(this, W - 210, 496, 220, 40, reto && !ok ? T.runa.continuar : T.santuario.elegirDon, () => fadeTo(this, 'Sanctuary', {
        floor: this.d.floor, figureId: this.d.figureId, phase: 'elegir', epic: ok, reto,
      }), { size: 22, color: ok ? UI.gold : UI.border }));
      return;
    }

    if (this.d.source === 'evento') {
      const ev = EVENTS.find((e) => e.id === this.d.eventId)!;
      const res = applyOutcome(ok ? ev.bless : ev.curse);
      saveLocal();
      this.hud.refresh();
      logEvent('encuentro', p.concept, ok, { npc: ev.id, resultado: res });
      this.apilar(c, [
        txt(this, 0, 0, ok ? ev.win : ev.lose, 20, ok ? CSS.green : '#e08a8a', { wordWrap: { width: 300 } }),
        txt(this, 0, 0, res, 18, CSS.gold, { wordWrap: { width: 300 } }),
      ]);
      contBtn();
      return;
    }

    if (!ok) return contBtn();

    if (this.d.source === 'altar') {
      const opts = randomRelics(2);
      addErgios(15);
      this.hud.refresh();
      if (!opts.length) return contBtn();
      c.add(txt(this, 560, 384, T.runa.eligeReliquia, 22, CSS.gold));
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
      c.add(button(this, W - 210, 496, 240, 40, T.runa.mejorar, () => {
        const options = Game.run!.deck.filter((x) => !x.up);
        deckOverlay(this, T.runa.eligeMejorar, options, (i) => {
          const card = options[i];
          card.up = true;
          saveLocal();
          audio.sfx('heal');
          logEvent('mejora', '', '', { carta: cardName(card) });
          cont();
        });
      }, { size: 22, color: UI.green }));
    }
  }
}
