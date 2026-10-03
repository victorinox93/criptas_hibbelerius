import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { EFFECTS } from '../data/effects';
import { FAMILIARS } from '../data/familiars';
import { BOONS } from '../data/figures';
import { RELICS } from '../data/relics';
import { Game } from '../state';
import { T } from '../textos';
import { cardView, CW, CH } from './card';
import { button, frame, icon, Tooltip, txt } from './widgets';

export interface Hud {
  setHp(hp: number, max: number): void;
  refresh(): void;
}

/** Barra superior: héroe, vida, piso, puntaje, Ergios, reliquias, efectos y mazo */
export function topBar(s: Phaser.Scene, tip: Tooltip, opts: { onMenu?: () => void } = {}): Hud {
  const g = s.add.graphics().setDepth(400);
  g.fillStyle(0x050407, 0.95).fillRect(0, 0, W, 40);
  g.fillStyle(UI.border, 1).fillRect(0, 40, W, 2);
  const D = <T extends Phaser.GameObjects.GameObject>(o: T) => {
    (o as any).setDepth?.(401);
    return o;
  };
  const p = Game.profile!;
  const name = D(txt(s, 10, 6, p.avatar?.alias ?? '', 26, CSS.gold));
  if (name.width > 130) name.setScale(130 / name.width, 1);
  const hpIcon = D(icon(s, 160, 20, 'i_heart', 2.6));
  const hpT = D(txt(s, 176, 6, '', 26, '#d08080'));
  tip.attach(hpIcon, T.hud.vida, T.hud.vidaInfo, 20);
  D(icon(s, 270, 20, 'i_skull', 2.6));
  const floorT = D(txt(s, 286, 6, '', 24, CSS.bone));
  const scoreT = D(txt(s, 365, 6, '', 24, CSS.gold));
  const coin = D(icon(s, 445, 20, 'i_coin', 2.6));
  const ergT = D(txt(s, 461, 6, '', 24, CSS.gold));
  tip.attach(coin, T.moneda, 'Moneda de las criptas (el ergio es una unidad de energía). Se gana en combates y runas; se gasta con el Mercader.', 20);

  const deckBtn = D(button(s, W - 205, 20, 120, 30, '', () => deckOverlay(s), { size: 20 }));
  const relicRow = s.add.container(530, 20).setDepth(401);
  const effRow = s.add.container(W - 36, 62).setDepth(401);
  const boonRow = s.add.container(26, 62).setDepth(401);
  if (opts.onMenu) D(button(s, W - 34, 20, 56, 30, T.hud.menu, opts.onMenu, { size: 20 }));

  const hud: Hud = {
    setHp(hp, max) {
      hpT.setText(`${Math.max(0, hp)}/${max}`);
    },
    refresh() {
      const r = Game.run!;
      hud.setHp(r.hp, r.maxHp);
      floorT.setText(`${(r.acto ?? 1) === 2 ? 'II' : 'I'}·${Math.min(r.floor + 1, 9)}/9`);
      scoreT.setText(`✦${r.score}`);
      ergT.setText(`${r.ergios}`);
      deckBtn.label.setText(`${T.hud.mazo} (${r.deck.length})`);
      relicRow.removeAll(true);
      const step = Math.min(32, 150 / Math.max(1, r.relics.length - 1));
      r.relics.forEach((id, i) => {
        const rel = RELICS[id];
        if (!rel) return;
        const im = icon(s, i * step, 0, rel.icon, step < 28 ? 2.3 : 2.8);
        tip.attach(im, rel.name, `${rel.text}\n${rel.lore}`, 20);
        relicRow.add(im);
      });
      effRow.removeAll(true);
      let off = 0;
      const fam = r.familiar ? FAMILIARS[r.familiar.id] : null;
      if (fam && r.familiar) {
        const bg = s.add.graphics();
        frame(bg, -22, -14, 46, 28, 0x1a1424, 0x8e5bb0, 0.9);
        const im = icon(s, -8, 0, 'i_paw', 2.2);
        const n = txt(s, 4, -10, `×${r.familiar.left}`, 18, '#c8a8e8');
        tip.attach(im, `Familiar: ${fam.name}`, `${fam.text}\nSe queda ${r.familiar.left} combate(s) más.\n${fam.lore}`, 20);
        effRow.add([bg, im, n]);
        off = 1;
      }
      r.effects.forEach((e, i0) => {
        const def = EFFECTS[e.id];
        if (!def) return;
        const i = i0 + off;
        const x = -i * 52;
        const bg = s.add.graphics();
        frame(bg, x - 22, -14, 46, 28, def.good ? 0x14200f : 0x24100f, def.good ? UI.green : 0x9a4040, 0.9);
        const im = icon(s, x - 8, 0, def.icon, 2.2);
        const n = txt(s, x + 4, -10, `×${e.left}`, 18, def.good ? CSS.green : '#e08a8a');
        tip.attach(im, `${def.good ? T.evento.bendicion : T.evento.maldicion}: ${def.name}`,
          `${def.text}\nQuedan ${e.left} combate(s).\n${def.lore}`, 20);
        effRow.add([bg, im, n]);
      });
      boonRow.removeAll(true);
      r.boons.forEach((b, i) => {
        const def = BOONS[b.id];
        if (!def) return;
        const x = i * 32;
        const bg = s.add.graphics();
        frame(bg, x - 14, -14, 28, 28, 0x0b0d16, b.epic ? UI.gold : 0x7a8aa0, 0.9);
        const im = icon(s, x, 0, def.icon, 2.2);
        tip.attach(im, `${T.santuario.don} ${b.epic ? T.santuario.epico : T.santuario.comun}: ${def.name}`, `${def.text[b.epic ? 1 : 0]}\n${def.lore}`, 20);
        boonRow.add([bg, im]);
      });
    },
  };
  hud.refresh();
  return hud;
}

export function deckOverlay(s: Phaser.Scene, title = 'Tu mazo', cards = Game.run!.deck, onPick?: (i: number) => void) {
  const layer = s.add.container(0, 0).setDepth(900);
  const bg = s.add.rectangle(0, 0, W, H, 0x000000, 0.88).setOrigin(0).setInteractive();
  layer.add(bg);
  layer.add(txt(s, W / 2, 30, title, 32, CSS.gold).setOrigin(0.5));
  const sc = 0.62;
  const perRow = 8;
  const inner = s.add.container(0, 0);
  layer.add(inner);
  cards.forEach((ci, i) => {
    const x = 90 + (i % perRow) * (CW * sc + 14);
    const y = 140 + Math.floor(i / perRow) * (CH * sc + 14);
    const v = cardView(s, x, y, ci).setScale(sc);
    if (onPick) {
      v.setInteractive({ useHandCursor: true });
      v.on('pointerover', () => v.setScale(sc * 1.08));
      v.on('pointerout', () => v.setScale(sc));
      v.on('pointerdown', () => {
        layer.destroy();
        onPick(i);
      });
    }
    inner.add(v);
  });
  const rows = Math.ceil(cards.length / perRow);
  const maxScroll = Math.max(0, 140 + rows * (CH * sc + 14) - (H - 70));
  bg.on('wheel', (_p: unknown, _dx: number, dy: number) => {
    inner.y = Phaser.Math.Clamp(inner.y - dy * 0.5, -maxScroll, 0);
  });
  if (maxScroll > 0) layer.add(txt(s, W / 2, 56, '(rueda del ratón para desplazarte)', 18, CSS.dim).setOrigin(0.5));
  const g = s.add.graphics();
  frame(g, W / 2 - 80, H - 52, 160, 40, UI.panel, UI.border);
  layer.add(g);
  layer.add(button(s, W / 2, H - 32, 160, 40, onPick ? 'Cancelar' : 'Cerrar', () => layer.destroy(), { size: 22 }));
  return layer;
}
