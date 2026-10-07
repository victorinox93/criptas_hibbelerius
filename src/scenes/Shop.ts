import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CARDS, CardInst, rewardPool, cardName } from '../data/cards';
import { RELICS } from '../data/relics';
import { FAMILIAR_POOL, FAMILIARS } from '../data/familiars';
import { MAX_POCIONES, POCIONES, pocionesDisponibles } from '../data/pociones';
import { addCard, addErgios, addFamiliar, Game, logEvent, saveLocal, ShopItem, ShopState, syncRun, unlock, nivelActual, amVencido } from '../state';
import { T } from '../textos';
import { cardView } from '../ui/card';
import { deckOverlay, topBar } from '../ui/hud';
import { button, Btn, embers, fadeTo, frame, icon, mist, title, Tooltip, txt, vignette } from '../ui/widgets';
import { randomRelics } from './Reward';
import { grantRelic } from './Reward';

/** Cuánto paga el mercader por una carta de tu mazo */
export function precioVenta(ci: CardInst) {
  const r = CARDS[ci.id].rarity;
  const base = r === 'legendaria' ? 45 : r === 'rara' ? 25 : r === 'inicial' ? 8 : 14;
  return base + (ci.up ? 8 : 0) + 4 * (ci.evo ?? 0);
}

function makeStock(node: number, ambulante = false): ShopState {
  const ids = Phaser.Utils.Array.Shuffle([...new Set(rewardPool(Game.run!.clase, Game.run!.acto, nivelActual(), amVencido()))]).slice(0, 3);
  const [rel] = randomRelics(1);
  return {
    node,
    cards: ids.map((id) => {
      const up = Math.random() < 0.2;
      const base = CARDS[id].rarity === 'rara' ? 75 : CARDS[id].rarity === 'inicial' ? 40 : 50;
      return { id, up, price: base + (up ? 25 : 0) + Phaser.Math.Between(-5, 5), sold: false };
    }),
    relic: rel ? { id: rel, price: Phaser.Math.Between(115, 140), sold: false } : null,
    familiar: Math.random() < 0.6 ? { id: Phaser.Utils.Array.GetRandom(FAMILIAR_POOL), price: Phaser.Math.Between(55, 70), sold: false } : null,
    pociones: Phaser.Utils.Array.Shuffle(pocionesDisponibles(nivelActual())).slice(0, 2).map((id) => ({ id, price: Phaser.Math.Between(22, 34), sold: false })),
    heal: { price: 30, sold: false },
    remove: { price: 55, sold: false },
    discount: ambulante, // el ambulante ya trae precios rebajados
    haggled: ambulante,
    ambulante,
  };
}

export class ShopScene extends Phaser.Scene {
  private floor = 0;
  private hud!: ReturnType<typeof topBar>;
  private tip!: Tooltip;
  private msg!: Phaser.GameObjects.Text;
  private layer!: Phaser.GameObjects.Container;

  constructor() { super('Shop'); }

  create(data: { floor: number; ambulante?: boolean }) {
    this.floor = data.floor;
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    const run = Game.run!;
    unlock('npcs', 'mercader');
    if (!run.shop || run.shop.node !== run.pos || !!run.shop.ambulante !== !!data.ambulante) {
      run.shop = makeStock(run.pos, !!data.ambulante);
      // oferta del día: una carta a −30 %
      if (!data.ambulante && run.shop.cards.length) {
        const o = Phaser.Utils.Array.GetRandom(run.shop.cards);
        o.price = Math.round(o.price * 0.7);
        (o as { oferta?: boolean }).oferta = true;
      }
      saveLocal();
    }

    this.add.rectangle(0, 0, W, H, 0x060508).setOrigin(0);
    const g = this.add.graphics();
    g.fillStyle(0x100d14, 1).fillRect(0, 300, W, H - 300);
    g.fillStyle(0x1a1520, 1).fillRect(250, 312, W - 270, 14); // mostrador
    const glow = this.add.circle(130, 260, 140, 0xe8c15a, 0.04).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.08, duration: 1500, yoyo: true, repeat: -1 });
    mist(this, 420);
    embers(this);
    vignette(this);
    this.tip = new Tooltip(this);
    this.hud = topBar(this, this.tip);

    const npc = this.add.image(130, 300, 'npc_mercader').setScale(7);
    this.tweens.add({ targets: npc, y: 296, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.image(200, 360, 'i_bag').setScale(4);
    this.add.image(60, 150, 'i_lantern').setScale(4);

    title(this, 600, 70, data.ambulante ? 'Mercader Ambulante' : T.mercader.titulo, 38);
    txt(this, 600, 104, data.ambulante ? '«Ando de paso. Todo con descuento, pero sólo hoy.»' : T.mercader.saludo, 20, CSS.dim).setOrigin(0.5);
    this.msg = txt(this, 600, 128, '', 21, CSS.blood, { align: 'center', wordWrap: { width: 170 } }).setOrigin(0.5).setDepth(50);
    this.layer = this.add.container(0, 0);
    this.draw();

    button(this, 130, 470, 200, 44, T.mercader.salir, () => {
      run.floor = this.floor + 1;
      saveLocal();
      syncRun('en curso');
      fadeTo(this, 'Map');
    }, { size: 22 });
  }

  private price(it: ShopItem) {
    return Game.run!.shop!.discount ? Math.round(it.price * 0.7) : it.price;
  }

  private buy(it: ShopItem, what: string, then: () => void) {
    const r = Game.run!;
    const p = this.price(it);
    if (it.sold) return;
    if (r.ergios < p) {
      audio.sfx('wrong');
      this.say(T.mercader.sinDinero);
      return;
    }
    addErgios(-p);
    it.sold = true;
    then();
    audio.sfx('coin');
    logEvent('compra', '', '', { que: what, precio: p });
    saveLocal();
    this.hud.refresh();
    this.draw();
  }

  private say(s: string, color = CSS.blood) {
    this.msg.setText(s).setColor(color).setAlpha(1);
    this.tweens.killTweensOf(this.msg);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 1800, duration: 400 });
  }

  private tag(x: number, y: number, it: ShopItem) {
    const c = this.add.container(x, y);
    if (it.sold) {
      c.add(txt(this, 0, 0, T.mercader.vendido, 20, CSS.dim).setOrigin(0.5));
    } else {
      const p = this.price(it);
      const afford = Game.run!.ergios >= p;
      c.add(icon(this, -22, 0, 'i_coin', 2.4));
      c.add(txt(this, -8, 0, `${p}`, 24, afford ? CSS.gold : '#7a6a5a').setOrigin(0, 0.5));
    }
    this.layer.add(c);
  }

  private draw() {
    this.layer.removeAll(true);
    const s = Game.run!.shop!;
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);

    L(txt(this, 300, 128, T.mercader.cartas, 22, CSS.gold));
    s.cards.forEach((it, i) => {
      const x = 360 + i * 150;
      const v = cardView(this, x, 230, { uid: -1, id: it.id, up: it.up }).setScale(0.78);
      if (it.sold) v.setAlpha(0.25);
      else {
        v.setInteractive({ useHandCursor: true });
        v.on('pointerover', () => {
          v.setScale(0.84);
          this.tip.show(x + 70, 140, CARDS[it.id].concept, CARDS[it.id].lore);
        });
        v.on('pointerout', () => {
          v.setScale(0.78);
          this.tip.hide();
        });
        v.on('pointerdown', () => this.buy(it, `carta ${it.id}`, () => addCard(it.id, it.up)));
      }
      L(v);
      if ((it as { oferta?: boolean }).oferta && !it.sold) L(txt(this, x, 130, '¡Oferta −30 %!', 17, CSS.green).setOrigin(0.5).setStroke('#000', 4));
      this.tag(x, 334, it);
    });

    // reliquia
    if (s.relic) {
      const rel = RELICS[s.relic.id];
      const g = this.add.graphics();
      frame(g, 780, 140, 160, 180, UI.panel, s.relic.sold ? UI.border : UI.gold);
      L(g);
      L(txt(this, 860, 156, T.mercader.reliquia, 20, CSS.gold).setOrigin(0.5));
      const im = icon(this, 860, 210, rel.icon, 6).setAlpha(s.relic.sold ? 0.3 : 1);
      L(im);
      const nm = txt(this, 860, 262, rel.name, 19, CSS.bone, { align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5);
      L(nm);
      const z = this.add.zone(780, 140, 160, 180).setOrigin(0).setInteractive({ useHandCursor: !s.relic.sold });
      z.on('pointerover', (p: Phaser.Input.Pointer) => this.tip.show(p.worldX - 330, p.worldY, rel.name, `${rel.text}\n${rel.lore}`));
      z.on('pointerout', () => this.tip.hide());
      z.on('pointerdown', () => this.buy(s.relic!, `reliquia ${rel.id}`, () => grantRelic(rel.id)));
      L(z);
      this.tag(860, 334, s.relic);
    }

    // familiar en una jaula
    if (s.familiar) {
      const f = FAMILIARS[s.familiar.id];
      const g = this.add.graphics();
      frame(g, 780, 372, 160, 132, UI.panel, s.familiar.sold ? UI.border : 0x8e5bb0);
      L(g);
      L(txt(this, 860, 386, 'Familiar', 20, '#c8a8e8').setOrigin(0.5));
      L(this.add.image(860, 444, f.sprite).setScale(3.4).setAlpha(s.familiar.sold ? 0.3 : 1));
      L(txt(this, 860, 474, f.name, 16, CSS.bone, { align: 'center', wordWrap: { width: 150 } }).setOrigin(0.5, 0));
      const z = this.add.zone(780, 372, 160, 132).setOrigin(0).setInteractive({ useHandCursor: !s.familiar.sold });
      z.on('pointerover', (p: Phaser.Input.Pointer) => this.tip.show(p.worldX - 330, p.worldY - 150, f.name, `${f.text}\nTe acompaña ${f.combats} combates.\n${f.lore}`));
      z.on('pointerout', () => this.tip.hide());
      z.on('pointerdown', () => this.buy(s.familiar!, `familiar ${f.id}`, () => addFamiliar(f.id)));
      L(z);
      this.tag(860, 520, s.familiar);
    }

    // servicios
    L(txt(this, 300, 358, T.mercader.servicios, 20, CSS.gold));
    const svc = (y: number, label: string, it: ShopItem | null, fn: () => void, enabled = true) => {
      const b: Btn = button(this, 455, y, 320, 34, label, fn, { size: 20, enabled: enabled && !(it?.sold), silent: true });
      L(b);
      if (it) this.tag(650, y, it);
    };
    // pociones
    (s.pociones ?? []).forEach((it, i) => {
      const p = POCIONES[it.id];
      const y = 396 + i * 66;
      const im = this.add.image(718, y, `pot_${p.id}`).setScale(3.2).setAlpha(it.sold ? 0.25 : 1);
      L(im);
      if (!it.sold) {
        im.setInteractive({ useHandCursor: true });
        im.on('pointerover', (pt: Phaser.Input.Pointer) => this.tip.show(pt.worldX - 320, pt.worldY - 100, p.name, `${p.text}\n${p.lore}`));
        im.on('pointerout', () => this.tip.hide());
        im.on('pointerdown', () => {
          const r = Game.run!;
          r.pociones ??= [];
          if (r.pociones.length >= MAX_POCIONES) return this.say('Tus frascos están llenos.');
          this.buy(it, `pocion ${p.id}`, () => r.pociones!.push(p.id));
        });
      }
      this.tag(724, y + 30, it);
    });
    const r = Game.run!;
    svc(404, T.mercader.olvidar, s.remove, () => {
      if (this.price(s.remove) > r.ergios) return this.buy(s.remove, '', () => undefined);
      deckOverlay(this, T.mercader.olvidarElige, r.deck, (i) => {
        const card = r.deck[i];
        this.buy(s.remove, `olvidar ${cardName(card)}`, () => r.deck.splice(i, 1));
      });
    }, r.deck.length > 5);
    svc(442, T.mercader.curar, s.heal, () => this.buy(s.heal, 'curar', () => {
      r.hp = Math.min(r.maxHp, r.hp + 20);
      audio.sfx('heal');
    }), r.hp < r.maxHp);
    // vender cartas (máx. 2 por visita)
    const vend = s.vendidas ?? 0;
    svc(480, `Vender una carta (${2 - vend} más)`, null, () => {
      deckOverlay(this, 'Vender: común 14 · rara 25 · legendaria 45 (+8 si está mejorada)', r.deck, (i) => {
        const c = r.deck[i];
        const p = precioVenta(c);
        r.deck.splice(i, 1);
        addErgios(p);
        s.vendidas = vend + 1;
        audio.sfx('coin');
        logEvent('venta', '', '', { carta: c.id, precio: p });
        this.say(`Vendiste ${cardName(c)} por ${p} ${T.moneda}`, CSS.gold);
        saveLocal();
        this.hud.refresh();
        this.draw();
      });
    }, vend < 2 && r.deck.length > 5);
    svc(518, s.discount ? `✔ ${T.mercader.regateado}` : T.mercader.regatear, null, () => {
      fadeTo(this, 'Rune', { floor: this.floor, source: 'regateo' });
    }, !s.haggled);
  }
}
