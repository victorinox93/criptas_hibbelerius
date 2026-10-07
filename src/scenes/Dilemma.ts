import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CARDS, rewardPool, cardName } from '../data/cards';
import { Choice, DILEMMAS, Result } from '../data/dilemmas';
import { EFFECTS } from '../data/effects';
import { FAMILIARS } from '../data/familiars';
import { RELICS } from '../data/relics';
import { addCard, addEntropia, addEffect, addErgios, addFamiliar, Game, logEvent, saveLocal, syncRun, unlock, nivelActual, amVencido } from '../state';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, Btn, embers, fadeTo, frame, mist, title, Tooltip, txt, vignette } from '../ui/widgets';
import { grantRelic, randomRelics } from './Reward';
import { explicar } from '../ui/explicar';
import { PUNTOS, sumar } from '../data/puntaje';

/** Situaciones de riesgo: el jugador elige cuánto arriesgar */
export class DilemmaScene extends Phaser.Scene {
  private hud!: ReturnType<typeof topBar>;

  constructor() { super('Dilemma'); }

  create(data: { floor: number; id: string }) {
    this.cameras.main.fadeIn(400);
    audio.play('calma');
    const d = DILEMMAS.find((x) => x.id === data.id) ?? DILEMMAS[0];
    unlock('npcs', `dil_${d.id}`);
    saveLocal();

    this.add.rectangle(0, 0, W, H, 0x050407).setOrigin(0);
    const floor = this.add.graphics();
    floor.fillStyle(0x0e0b12, 1).fillEllipse(230, 400, 400, 80);
    const glow = this.add.circle(230, 300, 140, d.id === 'reactor' ? 0x7fff9a : 0xc8a070, 0.05).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.1, duration: 1600, yoyo: true, repeat: -1 });
    mist(this, 360);
    embers(this);
    vignette(this);
    const tip = new Tooltip(this);
    this.hud = topBar(this, tip);

    const img = this.add.image(250, 370, d.sprite).setOrigin(0.5, 1);
    img.setScale(Math.min(8, 200 / img.height, 220 / img.width));
    if (d.tint) img.setTint(d.tint);
    this.tweens.add({ targets: img, y: 364, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const hero = this.add.image(90, 370, 'hero').setOrigin(0.5, 1).setScale(2);
    this.tweens.add({ targets: hero, y: 367, duration: 1100, yoyo: true, repeat: -1 });

    title(this, W / 2, 70, d.name, 40, CSS.bone);
    const g = this.add.graphics();
    frame(g, 450, 104, 480, 140, 0x0b090e, UI.border, 0.95);
    txt(this, 468, 116, d.intro, 20, CSS.bone, { wordWrap: { width: 444 }, lineSpacing: 2 });

    const run = Game.run!;
    const btns: Btn[] = [];
    d.choices.forEach((ch, i) => {
      const ok = (ch.need?.ergios ?? 0) <= run.ergios && (ch.need?.hp ?? 0) <= run.hp;
      const y = 290 + i * 74;
      const b = button(this, 690, y, 480, 64, '', () => {
        tip.hide();
        btns.forEach((x) => x.setVisible(false).disableInteractive());
        this.resolve(d.id, ch, data.floor);
      }, { size: 22, enabled: ok, color: i === d.choices.length - 1 ? UI.border : UI.gold });
      b.label.setText(ch.label).setY(-12);
      // qué es cada carta, efecto o reliquia que puede salir (antes de elegir)
      const rs = ch.outcomes.map((o) => o.r);
      const info = explicar({
        cards: rs.flatMap((r) => [r.junk?.id, r.card]),
        effects: rs.flatMap((r) => [r.effect, ...(r.effects ?? []).map((e) => e[0])]),
        relics: rs.map((r) => r.relic),
        familiars: rs.map((r) => r.familiar),
      });
      const risk = txt(this, 0, 14, `${ok ? ch.risk : `${ch.risk} (no te alcanza)`}${info ? '  ⓘ' : ''}`, 17, ok ? CSS.dim : '#7a5a5a').setOrigin(0.5);
      if (risk.width > 466) risk.setScale(466 / risk.width, 1);
      b.add(risk);
      if (info) tip.attach(b, ch.label, info);
      btns.push(b);
    });
  }

  private resolve(id: string, ch: Choice, floor: number) {
    // sorteo: la suma de p es 1
    let x = Math.random();
    let res = ch.outcomes[ch.outcomes.length - 1].r;
    for (const o of ch.outcomes) {
      if (x < o.p) { res = o.r; break; }
      x -= o.p;
    }
    const lines = this.apply(res);
    const run = Game.run!;
    run.floor = floor + 1;
    saveLocal();
    syncRun('en curso');
    this.hud.refresh();
    logEvent('dilema', '', '', { id, opcion: ch.label, resultado: res.text });
    const bad = (res.entropia ?? 0) > 0 || (res.hp ?? 0) < 0 || (res.maxHp ?? 0) < 0 || !!res.junk || res.effect === 'radiacion' || ((res.ergios ?? 0) < 0 && !res.familiar && !res.score);
    audio.sfx(bad ? 'wrong' : 'correct');

    const g = this.add.graphics();
    frame(g, 450, 262, 480, 200, 0x0b090e, bad ? 0x9a4040 : UI.green, 0.95);
    txt(this, 468, 276, res.text, 20, bad ? '#e08a8a' : CSS.green, { wordWrap: { width: 444 }, lineSpacing: 2 });
    txt(this, 468, 360, lines.join('\n'), 19, CSS.gold, { wordWrap: { width: 444 }, lineSpacing: 2 });
    button(this, 690, 494, 220, 44, T.runa.continuar, () => fadeTo(this, 'Map'), { size: 22 });
  }

  /** Aplica un resultado y devuelve qué cambió */
  private apply(r: Result): string[] {
    const run = Game.run!;
    const out: string[] = [];
    if (r.maxHp) {
      run.maxHp = Math.max(10, run.maxHp + r.maxHp);
      out.push(`${r.maxHp > 0 ? '+' : ''}${r.maxHp} de Vida máxima`);
    }
    if (r.hp) {
      const before = run.hp;
      run.hp = Phaser.Math.Clamp(run.hp + r.hp, 1, run.maxHp);
      out.push(`${run.hp - before >= 0 ? '+' : ''}${run.hp - before} de vida`);
    }
    run.hp = Math.min(run.hp, run.maxHp);
    if (r.ergios) {
      const n = r.ergios < 0 ? -Math.min(run.ergios, -r.ergios) : r.ergios;
      addErgios(n);
      out.push(`${n >= 0 ? '+' : ''}${n} ${T.moneda}`);
    }
    if (r.entropia) {
      const n = addEntropia(r.entropia);
      if (n) out.push(`${n > 0 ? '+' : ''}${n} de Locura`);
    }
    if (r.score) {
      sumar(run, 'Dilemas', r.score * PUNTOS.dilema);
      out.push(`+${r.score} puntos`);
    }
    const fx: [string, number][] = [...(r.effects ?? [])];
    if (r.effect) fx.push([r.effect, r.combats ?? 1]);
    for (const [eid, n] of fx) {
      addEffect(eid, n);
      const e = EFFECTS[eid];
      out.push(`${e.good ? T.evento.bendicion : T.evento.maldicion}: ${e.name} (${n} combate${n > 1 ? 's' : ''})`);
    }
    if (r.relic) {
      const rid = r.relic === 'random' ? randomRelics(1)[0] : r.relic;
      if (rid) {
        grantRelic(rid);
        out.push(`Reliquia: ${RELICS[rid].name} — ${RELICS[rid].text}`);
      } else {
        addErgios(40);
        out.push(`Ya tienes todas las reliquias: +40 ${T.moneda}`);
      }
    }
    if (r.card) {
      const pool = rewardPool(run.clase, run.acto, nivelActual(), amVencido()).filter((id) => r.card === 'random' || r.card !== 'rara' || CARDS[id].rarity === 'rara');
      const cid = r.card === 'rara' || r.card === 'random' ? Phaser.Utils.Array.GetRandom(pool) : r.card;
      addCard(cid, !!r.cardUp);
      out.push(`Carta: ${CARDS[cid].name}${r.cardUp ? '+' : ''}`);
    }
    if (r.junk) {
      for (let i = 0; i < r.junk.n; i++) addCard(r.junk.id);
      out.push(`${r.junk.n} «${CARDS[r.junk.id].name}» a tu mazo`);
    }
    if (r.removeRandom && run.deck.length > 5) {
      const i = Math.floor(Math.random() * run.deck.length);
      const [c] = run.deck.splice(i, 1);
      out.push(`Olvidaste: ${cardName(c)}`);
    }
    if (r.familiar) {
      const fid = addFamiliar(r.familiar, r.famCombats);
      const f = FAMILIARS[fid];
      out.push(`Familiar: ${f.name} (${run.familiar!.left} combates) — ${f.text}`);
    }
    return out;
  }
}
