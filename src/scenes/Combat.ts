import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { G, W, H } from '../config';
import { CalcCtx, CARDS, CardInst, force } from '../data/cards';
import { ENCOUNTERS, EnemyState, Intent, pick, spawn } from '../data/enemies';
import { addErgios, Game, logEvent, saveLocal, syncRun } from '../state';
import { audio } from '../audio';
import { T } from '../textos';
import { cardView, CardView, CH } from '../ui/card';
import { deckOverlay, Hud, topBar } from '../ui/hud';
import { bar, button, Btn, dungeonBackground, fadeTo, frame, icon, Tooltip, txt } from '../ui/widgets';

type Kind = 'easy' | 'normal' | 'elite' | 'boss';

interface EnemyView {
  st: EnemyState;
  root: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
  hp: ReturnType<typeof bar>;
  blockT: Phaser.GameObjects.Text;
  intentC: Phaser.GameObjects.Container;
  statusC: Phaser.GameObjects.Container;
  baseX: number;
  dead: boolean;
}

const HAND_Y = 478;
const CARD_SCALE = 0.8;

export class CombatScene extends Phaser.Scene {
  private kind: Kind = 'easy';
  private floor = 0;
  private tip!: Tooltip;
  private hud!: Hud;
  private enemies: EnemyView[] = [];
  private draw: CardInst[] = [];
  private hand: CardView[] = [];
  private discard: CardInst[] = [];
  private exhaust: CardInst[] = [];
  private energy = 3;
  private maxEnergy = 3;
  private block = 0;
  private acel = 0;
  private masa = 0;
  private friccion = 0;
  private reflect = false;
  private keepBlock = false;
  private busy = false;
  private turn = 0;
  private selected: CardView | null = null;
  private hero!: Phaser.GameObjects.Image;
  private heroX = 220;
  private hpBar!: ReturnType<typeof bar>;
  private pBlockT!: Phaser.GameObjects.Text;
  private pStatus!: Phaser.GameObjects.Container;
  private energyT!: Phaser.GameObjects.Text;
  private drawT!: Phaser.GameObjects.Text;
  private discT!: Phaser.GameObjects.Text;
  private endBtn!: Btn;
  private calcLines: Phaser.GameObjects.Text[] = [];
  private hintT!: Phaser.GameObjects.Text;
  private bannerT!: Phaser.GameObjects.Text;
  private log: string[] = [];
  private zones: Phaser.GameObjects.GameObject[] = [];
  private baseAcel = 0;

  constructor() { super('Combat'); }

  init(data: { kind: Kind; floor: number }) {
    this.kind = data.kind;
    this.floor = data.floor;
    this.enemies = [];
    this.hand = [];
    this.discard = [];
    this.exhaust = [];
    this.energy = this.maxEnergy;
    this.block = 0;
    this.acel = 0;
    this.masa = 0;
    this.friccion = 0;
    this.reflect = false;
    this.keepBlock = false;
    this.busy = false;
    this.turn = 0;
    this.selected = null;
    this.calcLines = [];
    this.zones = [];
    this.log = [];
    this.baseAcel = 0;
  }

  private has(relic: string) {
    return Game.run!.relics.includes(relic);
  }
  private hasFx(id: string) {
    return Game.run!.effects.some((e) => e.id === id && e.left > 0);
  }
  private ctx(): CalcCtx {
    return { masaBonus: this.masa, acelBonus: this.acel, friccion: this.friccion };
  }
  private wait(ms: number) {
    return new Promise<void>((r) => this.time.delayedCall(ms, () => r()));
  }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play(this.kind === 'boss' ? 'jefe' : 'combate');
    const run = Game.run!;
    dungeonBackground(this, 100 + this.floor * 7, this.kind === 'boss' ? 0x241820 : this.kind === 'elite' ? 0x201822 : 0x1c1722);
    this.tip = new Tooltip(this);
    this.hud = topBar(this, this.tip);

    // ── Jugador ──
    this.hero = this.add.image(this.heroX, 272, 'hero').setScale(5);
    this.tweens.add({ targets: this.hero, scaleY: 5.12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.ellipse(this.heroX, 330, 110, 16, 0x000000, 0.5).setDepth(-1);
    this.hpBar = bar(this, this.heroX - 70, 344, 140, 14, 0x9a3a4a);
    this.pBlockT = txt(this, this.heroX - 92, 351, '', 22, CSS.block).setOrigin(0.5);
    this.pStatus = this.add.container(this.heroX - 70, 376);

    // ── Enemigos ──
    const enc = pick(ENCOUNTERS[this.kind]);
    const n = enc.length;
    enc.forEach((id, i) => this.addEnemy(spawn(id), 700 + (i - (n - 1) / 2) * 190));

    // ── UI de combate ──
    const orb = this.add.graphics();
    orb.fillStyle(0x000000, 1).fillCircle(62, 440, 36);
    orb.fillStyle(0x12333d, 1).fillCircle(62, 440, 32);
    orb.lineStyle(3, UI.energy, 1).strokeCircle(62, 440, 32);
    this.energyT = txt(this, 62, 434, '', 30, '#e8fbff').setOrigin(0.5);
    txt(this, 62, 458, T.combate.joules, 15, CSS.energy).setOrigin(0.5);
    const orbZ = this.add.zone(62, 440, 70, 70);
    this.tip.attach(orbZ, 'Energía (J)', 'Cada carta cuesta trabajo, medido en Joules. Recuperas 3 J al inicio de cada turno.');

    this.drawT = txt(this, 62, 510, '', 20, CSS.dim).setOrigin(0.5);
    const drawZ = this.add.zone(62, 510, 90, 24);
    drawZ.setInteractive({ useHandCursor: true }).on('pointerdown', () => deckOverlay(this, 'Mazo de robo (orden oculto)', [...this.draw].sort((a, b) => a.id.localeCompare(b.id))));
    this.discT = txt(this, W - 62, 510, '', 20, CSS.dim).setOrigin(0.5);
    const discZ = this.add.zone(W - 62, 510, 110, 24);
    discZ.setInteractive({ useHandCursor: true }).on('pointerdown', () => deckOverlay(this, 'Descarte', this.discard));

    this.endBtn = button(this, W - 82, 452, 140, 46, T.combate.finTurno, () => this.endTurn(), { color: UI.gold, size: 24 });

    // registro de cálculos
    const lg = this.add.graphics();
    frame(lg, W / 2 - 250, 48, 500, 66, 0x0f0c13, 0x2c2534, 0.85);
    txt(this, W / 2 - 238, 52, T.combate.pergamino, 16, '#5a5468');
    for (let i = 0; i < 2; i++) this.calcLines.push(txt(this, W / 2 - 238, 68 + i * 21, '', 20, i === 0 ? CSS.bone : CSS.dim));
    this.hintT = txt(this, W / 2, 132, '', 22, CSS.gold).setOrigin(0.5).setDepth(700).setStroke('#000', 4);
    this.bannerT = this.add
      .text(W / 2, 220, '', { fontFamily: '"Pirata One", serif', fontSize: '56px', color: CSS.gold, stroke: '#000', strokeThickness: 8, resolution: 2 })
      .setOrigin(0.5)
      .setDepth(800)
      .setAlpha(0);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) this.cancelSelect();
    });
    this.input.keyboard?.on('keydown-ESC', () => this.cancelSelect());
    this.input.keyboard?.on('keydown-E', () => this.endTurn());

    // ── Inicio ──
    this.draw = Phaser.Utils.Array.Shuffle([...run.deck]);
    if (this.has('yunque')) this.masa += 1;
    if (this.has('coraza')) this.block = 6;
    if (this.hasFx('yunque')) this.masa += 1;
    if (this.hasFx('hueca')) this.masa -= 1;
    if (this.hasFx('manto')) this.block += 8;
    if (this.hasFx('lodo') && !this.has('botas')) this.friccion += 2;
    if (this.hasFx('impulso')) this.baseAcel += 1;
    if (this.has('guante')) this.baseAcel += 1;
    this.refreshPlayer();
    this.banner(this.kind === 'boss' ? T.combate.bannerJefe : this.kind === 'elite' ? T.combate.bannerElite : T.combate.bannerCombate).then(() => this.startTurn());
  }

  // ───────────────────────── ENEMIGOS ─────────────────────────
  private addEnemy(st: EnemyState, x: number) {
    const root = this.add.container(x, 0);
    const sprite = this.add.image(0, 330, st.def.sprite).setOrigin(0.5, 1).setScale(st.def.scale);
    const shadow = this.add.ellipse(0, 330, sprite.displayWidth * 0.9, 16, 0x000000, 0.5);
    root.add([shadow, sprite]);
    if (st.def.id === 'bat') {
      sprite.y = 260;
      this.tweens.add({ targets: sprite, y: 248, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    } else {
      this.tweens.add({ targets: sprite, scaleY: st.def.scale * 1.04, duration: 800 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    const hp = bar(this, x - 60, 344, 120, 14, 0x6a2a3a);
    const blockT = txt(this, x - 82, 351, '', 22, CSS.block).setOrigin(0.5);
    const top = 330 - sprite.displayHeight - (st.def.id === 'bat' ? 80 : 12);
    const intentC = this.add.container(x, top);
    const statusC = this.add.container(x + 66, 351);
    txt(this, x, 370, st.def.name, 19, CSS.dim).setOrigin(0.5);
    const ev: EnemyView = { st, root, sprite, hp, blockT, intentC, statusC, baseX: x, dead: false };
    this.enemies.push(ev);

    sprite.setInteractive({ useHandCursor: true, pixelPerfect: false });
    sprite.on('pointerover', (p: Phaser.Input.Pointer) => {
      if (this.selected) sprite.setTint(0xffaaaa);
      const d = st.def;
      let body = `Masa: ${d.mass} kg · Peso: ${Math.round(d.mass * G)} N\n${d.desc}`;
      if (d.umbral) body += `\n\nUmbral para detenerlo: F ≥ ${st.phase2 ? d.umbral + 3 : d.umbral} N en un solo golpe (1ª ley).`;
      this.tip.show(p.worldX + 16, p.worldY - 120, d.name, body);
    });
    sprite.on('pointerout', () => {
      sprite.clearTint();
      this.tip.hide();
    });
    sprite.on('pointerdown', () => {
      if (this.selected && !ev.dead) this.playOn(this.selected, ev);
    });
    this.refreshEnemy(ev);
  }

  private intentText(i: Intent) {
    if (i.kind === 'stunned') return { ic: 'i_stun', t: 'Detenido', d: 'Está detenido: no actuará este turno y recibe ×1.5 de daño.' };
    if (i.kind === 'block')
      return { ic: 'i_shield', t: `${i.block}${i.dmg ? ` +${i.dmg}` : ''}`, d: `Ganará ${i.block} de Bloque${i.dmg ? ` y atacará con ${i.dmg} N` : ''}.` };
    const t = i.hits && i.hits > 1 ? `${i.dmg}×${i.hits}` : `${i.dmg}`;
    let d = `Atacará con una fuerza de ${i.dmg} N${i.hits && i.hits > 1 ? `, ${i.hits} veces` : ''}.`;
    if (i.friccion) d += `\nTe cubrirá de lodo: +${i.friccion} Fricción (−${i.friccion} m/s² a tus ataques).`;
    return { ic: 'i_combat', t, d };
  }

  private refreshEnemy(ev: EnemyView) {
    const st = ev.st;
    ev.hp.set(st.hp, st.maxHp, st.block);
    ev.blockT.setText(st.block > 0 ? `🛡${st.block}` : '');
    ev.intentC.removeAll(true);
    if (!ev.dead) {
      const it = this.intentText(st.intent);
      const ic = icon(this, -14, 0, it.ic, 3.2);
      const tt = txt(this, 2, -12, it.t, 26, st.intent.kind === 'attack' ? '#e0a070' : CSS.bone);
      ev.intentC.add([ic, tt]);
      if (st.intent.kind === 'attack' && st.intent.friccion) ev.intentC.add(icon(this, tt.x + tt.width + 16, 0, 'i_mud', 3));
      this.tip.attach(ic, 'Intención', it.d);
      this.tweens.add({ targets: ev.intentC, y: ev.intentC.y - 4, duration: 600, yoyo: true, repeat: 1 });
    }
    ev.statusC.removeAll(true);
    let sx = 0;
    if (st.inercia > 0 || st.def.umbral) {
      const ic = icon(this, sx + 8, 0, 'i_momentum', 2.4);
      const t = txt(this, sx + 20, -11, `${st.inercia}`, 20, '#e0a070');
      this.tip.attach(ic, `Inercia ×${st.inercia}`,
        `1ª ley: mientras nadie lo detenga, sigue avanzando y su golpe crece cada turno.\nDetenlo con un golpe de F ≥ ${st.phase2 ? st.def.umbral! + 3 : st.def.umbral} N.`);
      ev.statusC.add([ic, t]);
      sx += 44;
    }
    if (st.detenido) {
      const ic = icon(this, sx + 8, 0, 'i_stun', 2.4);
      this.tip.attach(ic, 'Detenido', 'Una fuerza neta suficiente lo detuvo. Pierde su turno y recibe ×1.5 de daño.');
      ev.statusC.add(ic);
    }
  }

  private alive() {
    return this.enemies.filter((e) => !e.dead);
  }

  // ───────────────────────── JUGADOR ─────────────────────────
  private refreshPlayer() {
    const run = Game.run!;
    this.hpBar.set(run.hp, run.maxHp, this.block);
    this.hud.setHp(run.hp, run.maxHp);
    this.pBlockT.setText(this.block > 0 ? `🛡${this.block}` : '');
    this.energyT.setText(`${this.energy}/${this.maxEnergy}`);
    this.drawT.setText(`${T.combate.robo}: ${this.draw.length}`);
    this.discT.setText(`${T.combate.descarte}: ${this.discard.length}`);
    this.pStatus.removeAll(true);
    const items: [string, string, string, string][] = [];
    const baseA = this.baseAcel;
    if (this.acel !== 0) items.push(['i_wind', `+${this.acel}`, 'Aceleración extra', `+${this.acel} m/s² a tus ataques este turno.${baseA ? ` (Incluye +${baseA} de reliquias o bendiciones.)` : ''}`]);
    if (this.masa) items.push(['i_mass', `${this.masa > 0 ? '+' : ''}${this.masa}`, 'Masa extra', `${this.masa > 0 ? '+' : ''}${this.masa} kg a todos tus ataques en este combate.`]);
    if (this.friccion) items.push(['i_mud', `${this.friccion}`, 'Fricción', `El lodo resta ${this.friccion} m/s² a la aceleración de tus ataques. Baja 1 por turno.`]);
    if (this.reflect) items.push(['i_reflect', '', 'Acción-Reacción', 'Este turno, cada golpe que recibas regresa con la misma fuerza al atacante (3ª ley).']);
    if (this.keepBlock) items.push(['i_crystal', '', 'Inercia Defensiva', 'Tu Bloque no se perderá al iniciar tu siguiente turno (1ª ley).']);
    items.forEach(([ic, t, h, b], i) => {
      const im = icon(this, i * 46 + 8, 0, ic, 2.4);
      const tt = txt(this, i * 46 + 20, -11, t, 20, CSS.bone);
      this.tip.attach(im, h, b);
      this.pStatus.add([im, tt]);
    });
    this.hand.forEach((c) => c.refresh(this.ctx(), this.cost(c) <= this.energy));
  }

  private cost(c: CardView) {
    return CARDS[c.inst.id].stats(c.inst.up).cost;
  }

  private drawCards(n: number) {
    for (let i = 0; i < n; i++) {
      if (!this.draw.length) {
        if (!this.discard.length) break;
        this.draw = Phaser.Utils.Array.Shuffle(this.discard);
        this.discard = [];
      }
      if (this.hand.length >= 10) break;
      const inst = this.draw.pop()!;
      const v = cardView(this, 62, 510, inst, this.ctx()).setScale(0.2).setDepth(200);
      this.setupCard(v);
      this.hand.push(v);
    }
    this.layoutHand();
    this.refreshPlayer();
  }

  private setupCard(v: CardView) {
    v.setInteractive({ useHandCursor: true });
    v.on('pointerover', () => {
      if (this.busy || this.selected) return;
      v.setDepth(300);
      audio.sfx('hover');
      this.tweens.add({ targets: v, y: HAND_Y - 76, scale: 1, angle: 0, duration: 120 });
      const def = CARDS[v.inst.id];
      this.tip.show(v.x + 82, HAND_Y - 260, def.concept, def.lore);
    });
    v.on('pointerout', () => {
      this.tip.hide();
      if (this.selected === v) return;
      this.layoutHand();
    });
    v.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) return;
      this.clickCard(v);
    });
  }

  private layoutHand() {
    const n = this.hand.length;
    const spacing = Math.min(124, 640 / Math.max(n, 1));
    this.hand.forEach((c, i) => {
      if (c === this.selected) return;
      const off = i - (n - 1) / 2;
      c.setDepth(200 + i);
      this.tweens.add({ targets: c, x: W / 2 + off * spacing, y: HAND_Y + Math.abs(off) * 5, angle: off * 2.5, scale: CARD_SCALE, duration: 160 });
    });
  }

  private hint(s: string) {
    this.hintT.setText(s);
    this.hintT.setAlpha(1);
    this.tweens.killTweensOf(this.hintT);
    this.tweens.add({ targets: this.hintT, alpha: 0, delay: 1600, duration: 400 });
  }

  private calc(line: string) {
    this.log.unshift(line);
    this.calcLines.forEach((t, i) => t.setText(this.log[i] ?? ''));
  }

  private clickCard(v: CardView) {
    if (this.busy) return;
    this.tip.hide();
    if (this.selected === v) return this.cancelSelect();
    if (this.selected) this.cancelSelect();
    if (this.cost(v) > this.energy) {
      this.hint(T.combate.sinEnergia);
      this.tweens.add({ targets: v, x: v.x + 6, duration: 40, yoyo: true, repeat: 3 });
      return;
    }
    const def = CARDS[v.inst.id];
    if (def.id === 'tajo') return this.chooseAngle(v);
    if (def.target === 'enemy' && this.alive().length > 1) return this.enterTargeting(v);
    this.playOn(v, this.alive()[0]);
  }

  /** Modo apuntar: la mano baja y cada enemigo tiene una zona grande para hacer clic */
  private enterTargeting(v: CardView) {
    this.selected = v;
    audio.sfx('card');
    this.tweens.killTweensOf(this.hintT);
    this.hintT.setText(T.combate.eligeObjetivo).setAlpha(1);
    this.hand.forEach((c) => {
      if (c !== v) this.tweens.add({ targets: c, y: HAND_Y + 120, duration: 160 });
    });
    v.setDepth(320);
    this.tweens.add({ targets: v, x: this.heroX + 150, y: 470, scale: 0.75, angle: 0, duration: 160 });
    for (const ev of this.alive()) {
      const w = Math.max(150, ev.sprite.displayWidth + 40);
      const z = this.add.rectangle(ev.baseX, 250, w, 260, 0xe8c15a, 0.0001).setDepth(650).setInteractive({ useHandCursor: true });
      const ret = this.add.graphics().setDepth(651).setVisible(false);
      const x0 = ev.baseX - w / 2, y0 = 120, x1 = ev.baseX + w / 2, y1 = 380, L = 18;
      ret.lineStyle(3, UI.gold, 1);
      ret.strokePoints([{ x: x0, y: y0 + L }, { x: x0, y: y0 }, { x: x0 + L, y: y0 }]);
      ret.strokePoints([{ x: x1 - L, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y0 + L }]);
      ret.strokePoints([{ x: x0, y: y1 - L }, { x: x0, y: y1 }, { x: x0 + L, y: y1 }]);
      ret.strokePoints([{ x: x1 - L, y: y1 }, { x: x1, y: y1 }, { x: x1, y: y1 - L }]);
      z.on('pointerover', () => {
        ret.setVisible(true);
        ev.sprite.setTint(0xffe0a0);
        audio.sfx('hover');
      });
      z.on('pointerout', () => {
        ret.setVisible(false);
        ev.sprite.clearTint();
      });
      z.on('pointerdown', (p: Phaser.Input.Pointer) => {
        if (p.rightButtonDown()) return this.cancelSelect();
        ev.sprite.clearTint();
        if (this.selected) this.playOn(this.selected, ev);
      });
      this.zones.push(z, ret);
    }
  }

  private clearZones() {
    this.zones.forEach((z) => z.destroy());
    this.zones = [];
    this.enemies.forEach((e) => e.sprite.clearTint());
  }

  private cancelSelect() {
    if (!this.selected) return;
    this.selected = null;
    this.clearZones();
    this.hintT.setAlpha(0);
    this.layoutHand();
  }

  private chooseAngle(v: CardView) {
    this.busy = true;
    const layer = this.add.container(0, 0).setDepth(850);
    const g = this.add.graphics();
    frame(g, W / 2 - 230, 150, 460, 170, 0x0f0c13, UI.gold);
    const { F } = force(CARDS.tajo.stats(v.inst.up), this.ctx());
    layer.add([
      g,
      txt(this, W / 2, 176, 'Tajo Angulado: elige el ángulo θ', 26, CSS.gold).setOrigin(0.5),
      txt(this, W / 2, 206, `F = ${F} N.  La componente útil es F·cosθ`, 20, CSS.bone).setOrigin(0.5),
    ]);
    const close = () => {
      layer.destroy();
      this.busy = false;
    };
    layer.add(
      button(this, W / 2 - 115, 260, 200, 60, `θ = 0° → ${F} N\na un enemigo`, () => {
        close();
        (v as any).angle0 = true;
        if (this.alive().length > 1) this.enterTargeting(v);
        else this.playOn(v, this.alive()[0]);
      }, { size: 20 }),
    );
    layer.add(
      button(this, W / 2 + 115, 260, 200, 60, `θ = 60° → ${Math.round(F * 0.5)} N\na TODOS`, () => {
        close();
        (v as any).angle0 = false;
        this.playOn(v, this.alive()[0]);
      }, { size: 20 }),
    );
    layer.add(button(this, W / 2 + 200, 168, 36, 30, '×', close, { size: 20 }));
  }

  // ───────────────────────── JUGAR CARTA ─────────────────────────
  private async playOn(v: CardView, target: EnemyView | undefined) {
    if (this.busy) return;
    const inst = v.inst;
    const def = CARDS[inst.id];
    const st = def.stats(inst.up);
    if (st.cost > this.energy) return;
    this.busy = true;
    this.selected = null;
    this.clearZones();
    this.hintT.setAlpha(0);
    this.tip.hide();
    audio.sfx('card');
    this.energy -= st.cost;
    this.hand = this.hand.filter((c) => c !== v);
    v.disableInteractive();
    this.tweens.add({ targets: v, x: W / 2, y: 230, scale: 0.9, angle: 0, duration: 140 });
    await this.wait(200);
    this.tweens.add({ targets: v, alpha: 0, scale: 0.6, y: 200, duration: 200, onComplete: () => v.destroy() });
    if (def.exhaust) this.exhaust.push(inst);
    else this.discard.push(inst);

    const c = this.ctx();
    switch (def.id) {
      case 'golpe':
      case 'embestida':
      case 'fuerzaNeta': {
        const f = force(st, c);
        this.calc(`${def.name}: F = ${r1(f.m)} kg × ${r1(f.a)} m/s² = ${f.F} N`);
        await this.heroLunge();
        const stopped = target ? await this.hitEnemy(target, f.F) : false;
        if (def.id === 'embestida') {
          const rec = Math.floor(f.F / 4);
          if (rec > 0) {
            this.calc(`3ª ley → retroceso: ¼·${f.F} N = ${rec} N sobre ti`);
            await this.hurtPlayer(rec, null);
          }
        }
        if (def.id === 'fuerzaNeta' && stopped) {
          this.energy += 1;
          this.calc('¡Lo detuviste con fuerza neta! +1 J');
        }
        break;
      }
      case 'tajo': {
        const f = force(st, c);
        if ((v as any).angle0 === false) {
          const Fc = Math.round(f.F * 0.5);
          this.calc(`Tajo: F·cos60° = ${f.F} N × 0.5 = ${Fc} N a todos`);
          await this.heroLunge();
          for (const e of this.alive()) await this.hitEnemy(e, Fc, false, 60);
        } else {
          this.calc(`Tajo: F·cos0° = ${f.F} N × 1 = ${f.F} N`);
          await this.heroLunge();
          if (target) await this.hitEnemy(target, f.F);
        }
        break;
      }
      case 'pesoMuerto': {
        const m = (st.m ?? 0) + this.masa;
        const Wt = Math.round(m * G);
        this.calc(`Peso Muerto: W = ${r1(m)} kg × 9.81 m/s² = ${Wt} N (ignora Bloque)`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, Wt, true);
        break;
      }
      case 'normal':
      case 'accion':
      case 'inerciaDef': {
        this.gainBlock(st.block!);
        this.calc(`${def.name}: +${st.block} de Bloque`);
        if (def.id === 'accion') this.reflect = true;
        if (def.id === 'inerciaDef') this.keepBlock = true;
        break;
      }
      case 'equilibrio': {
        const inc = this.alive().reduce((s, e) => {
          const i = e.st.intent;
          if (i.kind === 'attack') return s + i.dmg * (i.hits ?? 1);
          if (i.kind === 'block') return s + (i.dmg ?? 0);
          return s;
        }, 0);
        const b = Math.min(inc, st.extra!);
        this.gainBlock(b);
        this.calc(`ΣF = 0: fuerza entrante ${inc} N → +${b} de Bloque`);
        break;
      }
      case 'carrera':
        this.acel += st.extra!;
        this.calc(`Carrera: +${st.extra} m/s² → cada ataque gana +${st.extra} × m N`);
        this.drawCards(1);
        break;
      case 'segunda':
        this.acel += st.extra!;
        this.calc(`Segunda Ley: +${st.extra} m/s² este turno`);
        break;
      case 'forja':
        this.masa += st.extra!;
        this.calc(`Forja Pesada: +${st.extra} kg a tus armas (masa total extra: ${this.masa} kg)`);
        break;
    }
    this.refreshPlayer();
    this.layoutHand();
    if (Game.run!.hp <= 0) return this.defeat('tu propia Embestida');
    this.busy = false;
    await this.checkEnd();
  }

  private gainBlock(n: number) {
    this.block += n;
    audio.sfx('block');
    const t = txt(this, this.heroX, 220, `+${n} 🛡`, 30, CSS.block).setOrigin(0.5).setDepth(700);
    this.tweens.add({ targets: t, y: 180, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  private async heroLunge() {
    await new Promise<void>((r) => this.tweens.add({ targets: this.hero, x: this.heroX + 60, duration: 90, yoyo: true, ease: 'Quad.out', onComplete: () => r() }));
  }

  /** Aplica una fuerza a un enemigo. Devuelve true si lo detuvo. */
  private async hitEnemy(ev: EnemyView, F: number, ignoreBlock = false, _angle = 0): Promise<boolean> {
    if (ev.dead) return false;
    const st = ev.st;
    let dmg = F;
    if (st.detenido) dmg = Math.round(dmg * 1.5);
    let absorbed = 0;
    if (!ignoreBlock) {
      absorbed = Math.min(st.block, dmg);
      st.block -= absorbed;
      dmg -= absorbed;
    }
    st.hp -= dmg;
    // efectos
    ev.sprite.setTintFill(0xffffff);
    this.time.delayedCall(80, () => ev.sprite.clearTint());
    this.tweens.add({ targets: ev.root, x: ev.baseX + 14, duration: 50, yoyo: true, repeat: 1 });
    this.burst(ev.baseX, 280, 0xb8b0c8, 12);
    audio.sfx('hit');
    if (F >= 12) this.cameras.main.shake(140, 0.005);
    const t = txt(this, ev.baseX + Phaser.Math.Between(-20, 20), 230, `${dmg}`, 40, '#f0d090').setOrigin(0.5).setDepth(700).setStroke('#000', 5);
    if (absorbed) txt(this, ev.baseX + 40, 250, `(🛡${absorbed})`, 22, CSS.block).setOrigin(0.5).setDepth(700).setAlpha(0.9).setData('tmp', 1);
    this.tweens.add({ targets: t, y: 170, alpha: 0, duration: 900, onComplete: () => t.destroy() });

    let stopped = false;
    const umbral = st.def.umbral ? st.def.umbral + (st.phase2 ? 3 : 0) : 0;
    if (umbral && !st.detenido && st.hp > 0) {
      if (F >= umbral) {
        stopped = true;
        st.detenido = true;
        st.stunned = 1;
        st.inercia = 0;
        st.intent = { kind: 'stunned' };
        this.calc(`1ª ley: F = ${F} N ≥ ${umbral} N → ¡${st.def.name} DETENIDO!`);
        this.floatText(ev.baseX, 140, T.combate.detenido, CSS.gold);
        audio.sfx('stop');
        logEvent('detener', '1a ley', true, { enemigo: st.def.id, F, umbral });
      } else if (F >= umbral * 0.6) {
        this.hint(`Necesitas F ≥ ${umbral} N en un solo golpe para detenerlo (tienes ${F} N).`);
      }
    }
    // fase 2 del jefe
    if (st.def.id === 'colossus' && !st.phase2 && st.hp <= st.maxHp / 2 && st.hp > 0) {
      st.phase2 = true;
      this.floatText(ev.baseX, 110, '¡Gana masa! Umbral 18 N', '#e0a070');
      this.calc('El Coloso absorbe piedra: más masa → necesitas más fuerza para detenerlo.');
    }
    if (st.hp <= 0) await this.killEnemy(ev);
    else this.refreshEnemy(ev);
    await this.wait(160);
    this.children.list.filter((o) => o.getData && o.getData('tmp')).forEach((o) => this.tweens.add({ targets: o, alpha: 0, duration: 400, onComplete: () => o.destroy() }));
    return stopped;
  }

  private floatText(x: number, y: number, s: string, color: string) {
    const t = txt(this, x, y, s, 32, color).setOrigin(0.5).setDepth(700).setStroke('#000', 5);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, delay: 600, duration: 700, onComplete: () => t.destroy() });
  }

  private burst(x: number, y: number, tint: number, q: number) {
    const e = this.add.particles(x, y, 'px', {
      speed: { min: 60, max: 200 }, lifespan: 450, scale: { start: 2.5, end: 0 }, tint, quantity: q, emitting: false,
    }).setDepth(600);
    e.explode(q);
    this.time.delayedCall(600, () => e.destroy());
  }

  private async killEnemy(ev: EnemyView) {
    ev.dead = true;
    ev.st.hp = 0;
    ev.hp.set(0, ev.st.maxHp);
    ev.intentC.removeAll(true);
    ev.statusC.removeAll(true);
    ev.blockT.setText('');
    this.burst(ev.baseX, 260, 0x8a8296, 30);
    this.tweens.killTweensOf(ev.sprite);
    this.tweens.add({ targets: ev.root, alpha: 0, y: 20, duration: 500 });
    this.tweens.add({ targets: [ev.hp.g, ev.hp.t], alpha: 0, duration: 400 });
    await this.wait(300);
  }

  private async hurtPlayer(dmg: number, from: EnemyView | null) {
    const run = Game.run!;
    const absorbed = Math.min(this.block, dmg);
    this.block -= absorbed;
    const real = dmg - absorbed;
    run.hp -= real;
    this.hero.setTintFill(0xb0a0c0);
    if (real > 0) audio.sfx('hit');
    else audio.sfx('block');
    this.time.delayedCall(90, () => this.hero.clearTint());
    this.tweens.add({ targets: this.hero, x: this.heroX - 12, duration: 50, yoyo: true, repeat: 1 });
    if (real > 0) {
      const t = txt(this, this.heroX + Phaser.Math.Between(-15, 15), 210, `-${real}`, 38, '#d08080').setOrigin(0.5).setDepth(700).setStroke('#000', 5);
      this.tweens.add({ targets: t, y: 160, alpha: 0, duration: 900, onComplete: () => t.destroy() });
      if (real >= 10) this.cameras.main.shake(160, 0.008);
    } else {
      const t = txt(this, this.heroX, 210, T.combate.bloqueado, 28, CSS.block).setOrigin(0.5).setDepth(700).setStroke('#000', 5);
      this.tweens.add({ targets: t, y: 170, alpha: 0, duration: 800, onComplete: () => t.destroy() });
    }
    if (from && this.reflect && !from.dead) {
      this.calc(`3ª ley: te golpeó con ${dmg} N → recibe ${dmg} N de reacción`);
      await this.hitEnemy(from, dmg);
    }
    this.refreshPlayer();
  }

  // ───────────────────────── TURNOS ─────────────────────────
  private async startTurn() {
    this.turn++;
    if (this.keepBlock) {
      this.keepBlock = false;
    } else if (this.has('cristal')) {
      this.block = Math.floor(this.block / 2);
    } else if (this.turn > 1) {
      this.block = 0;
    }
    this.energy = this.maxEnergy;
    let draw = 5;
    if (this.turn === 1) {
      if (this.hasFx('vigor')) this.energy += 1;
      if (this.hasFx('fatiga')) this.energy -= 1;
      if (this.hasFx('niebla')) draw -= 1;
    }
    this.acel = this.baseAcel;
    this.reflect = false;
    this.drawCards(draw);
    this.endBtn.setEnabled(true);
    this.refreshPlayer();
    this.hint(`${T.combate.turno} ${this.turn}`);
  }

  private async endTurn() {
    if (this.busy) return;
    this.cancelSelect();
    this.busy = true;
    this.endBtn.setEnabled(false);
    // descartar mano
    for (const c of this.hand) {
      this.discard.push(c.inst);
      this.tweens.add({ targets: c, x: W - 62, y: 510, scale: 0.1, alpha: 0, duration: 220, onComplete: () => c.destroy() });
    }
    this.hand = [];
    this.friccion = Math.max(0, this.friccion - 1);
    this.acel = this.baseAcel;
    this.refreshPlayer();
    await this.wait(300);

    for (const ev of this.alive()) {
      const st = ev.st;
      st.block = 0;
      const it = st.intent;
      if (it.kind === 'stunned') {
        st.stunned = Math.max(0, st.stunned - 1);
        this.floatText(ev.baseX, 160, 'Detenido…', CSS.dim);
        await this.wait(500);
      } else {
        await new Promise<void>((r) => this.tweens.add({ targets: ev.root, x: ev.baseX - 50, duration: 110, yoyo: true, ease: 'Quad.out', onComplete: () => r() }));
        if (it.kind === 'block') {
          st.block += it.block;
          if (it.dmg) await this.hurtPlayer(it.dmg, ev);
        } else if (it.kind === 'attack') {
          for (let h = 0; h < (it.hits ?? 1); h++) {
            await this.hurtPlayer(it.dmg, ev);
            if (Game.run!.hp <= 0 || ev.dead) break;
            await this.wait(140);
          }
          if (it.friccion) {
            if (this.has('botas')) this.calc('Botas de Agarre: el lodo no te afecta.');
            else {
              this.friccion += it.friccion;
              this.calc(`Lodo: +${it.friccion} Fricción → tus ataques pierden ${this.friccion} m/s²`);
            }
          }
        }
        if (st.def.umbral && !ev.dead) st.inercia++;
        await this.wait(250);
      }
      if (Game.run!.hp <= 0) return this.defeat(ev.st.def.name);
      if (ev.dead) continue;
      st.turn++;
      if (st.stunned > 0) st.intent = { kind: 'stunned' };
      else {
        st.detenido = false;
        st.intent = st.def.next(st);
      }
      this.refreshEnemy(ev);
      this.refreshPlayer();
    }
    if (await this.checkEnd()) return;
    this.busy = false;
    this.startTurn();
  }

  private async checkEnd(): Promise<boolean> {
    if (this.alive().length > 0) return false;
    if (this.bannerT.getData('ended')) return true;
    this.bannerT.setData('ended', true);
    this.busy = true;
    const run = Game.run!;
    run.floor = this.floor + 1;
    run.stats.combates++;
    const pts = this.kind === 'boss' ? 150 : this.kind === 'elite' ? 40 : 15;
    run.score += pts;
    if (this.kind === 'elite') run.stats.elites++;
    // los efectos pasajeros se consumen al terminar el combate
    run.effects.forEach((e) => e.left--);
    run.effects = run.effects.filter((e) => e.left > 0);
    const erg = this.kind === 'elite' ? Phaser.Math.Between(35, 45) : this.kind === 'easy' ? Phaser.Math.Between(10, 14) : Phaser.Math.Between(13, 19);
    if (this.kind !== 'boss') addErgios(erg);
    audio.sfx('victory');
    logEvent('combate', '', true, { tipo: this.kind, piso: this.floor, turnos: this.turn, vida: run.hp });
    saveLocal();
    if (this.kind === 'boss') {
      run.done = true;
      saveLocal();
      syncRun('victoria', 'Coloso Inerte derrotado');
      await this.banner(T.combate.victoria);
      fadeTo(this, 'End', { victory: true });
      return true;
    }
    syncRun('en curso');
    await this.banner(T.combate.victoria);
    fadeTo(this, 'Reward', { kind: this.kind, ergios: erg });
    return true;
  }

  private async defeat(by: string) {
    const run = Game.run!;
    run.hp = 0;
    run.done = true;
    saveLocal();
    logEvent('derrota', '', false, { piso: this.floor, enemigo: by });
    syncRun('derrota', by);
    audio.sfx('defeat');
    this.tweens.add({ targets: this.hero, alpha: 0.2, y: 290, duration: 900 });
    await this.banner(T.combate.derrota, '#b8a8c8');
    fadeTo(this, 'End', { victory: false, by });
  }

  private banner(s: string, color = CSS.gold) {
    this.bannerT.setText(s).setColor(color).setAlpha(0).setScale(0.6);
    return new Promise<void>((r) => {
      this.tweens.add({
        targets: this.bannerT, alpha: 1, scale: 1, duration: 260, ease: 'Back.out',
        onComplete: () => this.tweens.add({ targets: this.bannerT, alpha: 0, delay: 650, duration: 300, onComplete: () => r() }),
      });
    });
  }
}

const r1 = (x: number) => Math.round(x * 10) / 10;
void CH;
void H;
