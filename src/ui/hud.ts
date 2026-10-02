import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { RELICS } from '../data/relics';
import { Game } from '../state';
import { cardView, CW, CH } from './card';
import { button, frame, icon, Tooltip, txt } from './widgets';

export interface Hud {
  setHp(hp: number, max: number): void;
  refresh(): void;
}

/** Barra superior: héroe, vida, piso, puntaje, mazo y reliquias */
export function topBar(s: Phaser.Scene, tip: Tooltip, opts: { onMenu?: () => void } = {}): Hud {
  const g = s.add.graphics().setDepth(400);
  g.fillStyle(0x07060a, 0.92).fillRect(0, 0, W, 40);
  g.fillStyle(UI.border, 1).fillRect(0, 40, W, 2);
  const objs: Phaser.GameObjects.GameObject[] = [];
  const add = <T extends Phaser.GameObjects.GameObject>(o: T) => {
    (o as any).setDepth?.(401);
    objs.push(o);
    return o;
  };
  const p = Game.profile!;
  add(txt(s, 12, 6, p.avatar?.alias ?? '', 26, CSS.gold));
  const hpIcon = add(icon(s, 190, 20, 'i_heart', 2.6));
  const hpT = add(txt(s, 208, 6, '', 26, CSS.blood));
  add(icon(s, 320, 20, 'i_skull', 2.6));
  const floorT = add(txt(s, 338, 6, '', 24, CSS.bone));
  const scoreT = add(txt(s, 440, 6, '', 24, CSS.gold));
  tip.attach(hpIcon, 'Vida', 'Si llega a 0, la expedición termina. Tu avance queda registrado.', 20);

  const deckBtn = add(button(s, W - 190, 20, 120, 30, '', () => deckOverlay(s), { size: 20 }));
  const relicRow = s.add.container(560, 20).setDepth(401);
  if (opts.onMenu) add(button(s, W - 60, 20, 100, 30, 'Menú', opts.onMenu, { size: 20 }));

  const hud: Hud = {
    setHp(hp, max) {
      hpT.setText(`${Math.max(0, hp)}/${max}`);
    },
    refresh() {
      const r = Game.run!;
      hud.setHp(r.hp, r.maxHp);
      floorT.setText(`Piso ${Math.min(r.floor + 1, 9)}/9`);
      scoreT.setText(`✦ ${r.score}`);
      deckBtn.label.setText(`Mazo (${r.deck.length})`);
      relicRow.removeAll(true);
      r.relics.forEach((id, i) => {
        const rel = RELICS[id];
        const im = icon(s, i * 34, 0, rel.icon, 3);
        tip.attach(im, rel.name, `${rel.text}\n${rel.lore}`, 20);
        relicRow.add(im);
      });
    },
  };
  hud.refresh();
  return hud;
}

export function deckOverlay(s: Phaser.Scene, title = 'Tu mazo', cards = Game.run!.deck, onPick?: (i: number) => void) {
  const layer = s.add.container(0, 0).setDepth(900);
  const bg = s.add.rectangle(0, 0, W, H, 0x000000, 0.86).setOrigin(0).setInteractive();
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
  const g = s.add.graphics();
  frame(g, W / 2 - 80, H - 52, 160, 40, UI.panel, UI.border);
  layer.add(g);
  layer.add(button(s, W / 2, H - 32, 160, 40, onPick ? 'Cancelar' : 'Cerrar', () => layer.destroy(), { size: 22 }));
  return layer;
}
