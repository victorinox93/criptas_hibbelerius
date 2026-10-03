import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CARDS, rewardPool, cardName } from '../data/cards';
import { RELICS } from '../data/relics';
import { addCard, addErgios, Game, logEvent, saveLocal, ShopItem, ShopState, syncRun, unlock } from '../state';
import { T } from '../textos';
import { cardView } from '../ui/card';
import { deckOverlay, topBar } from '../ui/hud';
import { button, Btn, embers, fadeTo, frame, icon, mist, title, Tooltip, txt, vignette } from '../ui/widgets';
import { randomRelics } from './Reward';
import { grantRelic } from './Reward';

function makeStock(node: number): ShopState {
  const ids = Phaser.Utils.Array.Shuffle([...new Set(rewardPool(Game.run!.clase))]).slice(0, 3);
  const [rel] = randomRelics(1);
  return {
    node,
    cards: ids.map((id) => {
      const up = Math.random() < 0.2;
      const base = CARDS[id].rarity === 'rara' ? 75 : CARDS[id].rarity === 'inicial' ? 40 : 50;
      return { id, up, price: base + (up ? 25 : 0) + Phaser.Math.Between(-5, 5), sold: false };
    }),
    relic: rel ? { id: rel, price: Phaser.Math.Between(115, 140), sold: false } : null,
    heal: { price: 30, sold: false },
    remove: { price: 55, sold: false },
    discount: false,
    haggled: false,
  };
}

export class ShopScene extends Phaser.Scene {
  private floor = 0;
  private hud!: ReturnType<typeof topBar>;
  private tip!: Tooltip;
  private msg!: Phaser.GameObjects.Text;
  private layer!: Phaser.GameObjects.Container;

  constructor() { super('Shop'); }

  create(data: { floor: number }) {
    this.floor = data.floor;
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    const run = Game.run!;
    unlock('npcs', 'mercader');
    if (!run.shop || run.shop.node !== run.pos) {
      run.shop = makeStock(run.pos);
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

    title(this, 600, 70, T.mercader.titulo, 38);
    txt(this, 600, 104, T.mercader.saludo, 20, CSS.dim).setOrigin(0.5);
    this.msg = txt(this, 860, 400, '', 21, CSS.blood, { align: 'center', wordWrap: { width: 170 } }).setOrigin(0.5).setDepth(50);
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

    // servicios
    L(txt(this, 300, 372, T.mercader.servicios, 22, CSS.gold));
    const svc = (y: number, label: string, it: ShopItem | null, fn: () => void, enabled = true) => {
      const b: Btn = button(this, 470, y, 340, 40, label, fn, { size: 21, enabled: enabled && !(it?.sold), silent: true });
      L(b);
      if (it) this.tag(680, y, it);
    };
    const r = Game.run!;
    svc(412, T.mercader.olvidar, s.remove, () => {
      if (this.price(s.remove) > r.ergios) return this.buy(s.remove, '', () => undefined);
      deckOverlay(this, T.mercader.olvidarElige, r.deck, (i) => {
        const card = r.deck[i];
        this.buy(s.remove, `olvidar ${cardName(card)}`, () => r.deck.splice(i, 1));
      });
    }, r.deck.length > 5);
    svc(458, T.mercader.curar, s.heal, () => this.buy(s.heal, 'curar', () => {
      r.hp = Math.min(r.maxHp, r.hp + 20);
      audio.sfx('heal');
    }), r.hp < r.maxHp);
    svc(504, s.discount ? `✔ ${T.mercader.regateado}` : T.mercader.regatear, null, () => {
      fadeTo(this, 'Rune', { floor: this.floor, source: 'regateo' });
    }, !s.haggled);
  }
}
