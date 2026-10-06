import { fmtPuntos } from '../data/puntaje';
import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { EFFECTS } from '../data/effects';
import { FAMILIARS } from '../data/familiars';
import { BOONS } from '../data/figures';
import { RELICS } from '../data/relics';
import { FLOORS, Game, ROMAN, saveLocal } from '../state';
import { MAX_POCIONES, POCIONES } from '../data/pociones';
import { audio } from '../audio';
import { T } from '../textos';
import { cardView, CW, CH } from './card';
import { button, frame, icon, Tooltip, txt } from './widgets';

/**
 * Quién sabe usar una poción ahora mismo. El combate registra el suyo;
 * fuera de combate sólo funcionan las que no son de combate (curación).
 * Debe devolver true si la poción se usó.
 */
let potionHandler: ((id: string) => boolean) | null = null;
export function setPotionHandler(fn: ((id: string) => boolean) | null) {
  potionHandler = fn;
}
/** Uso fuera de combate (p. ej. en el mapa) */
function usePotionOutside(id: string): boolean {
  const r = Game.run!;
  if (id === 'vida') r.hp = Math.min(r.maxHp, r.hp + 15);
  else if (id === 'mayor') { r.maxHp += 5; r.hp = Math.min(r.maxHp, r.hp + 30); }
  else return false;
  return true;
}

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
  const scoreT = D(txt(s, 392, 6, '', 24, CSS.gold));
  const coin = D(icon(s, 468, 20, 'i_coin', 2.6));
  const ergT = D(txt(s, 484, 6, '', 24, CSS.gold));
  tip.attach(coin, T.moneda, 'Moneda de las criptas (el ergio es una unidad de energía). Se gana en combates y runas; se gasta con el Mercader.', 20);

  const deckBtn = D(button(s, W - 182, 20, 96, 30, '', () => deckOverlay(s), { size: 19 }));
  const potRow = s.add.container(552, 20).setDepth(401);
  const relicRow = s.add.container(648, 20).setDepth(401);
  let potMenu: Phaser.GameObjects.Container | null = null;
  const closeMenu = () => { potMenu?.destroy(); potMenu = null; };
  const openPotion = (i: number) => {
    closeMenu();
    tip.hide();
    const r = Game.run!;
    const id = r.pociones?.[i];
    if (!id) return;
    const def = POCIONES[id];
    const x = 552 + i * 30;
    const m = (potMenu = s.add.container(x - 10, 46).setDepth(950));
    const g = s.add.graphics();
    frame(g, 0, 0, 250, 116, 0x0b090e, UI.gold, 0.98);
    m.add([g, txt(s, 12, 8, def.name, 21, CSS.gold), txt(s, 12, 32, def.text, 17, CSS.bone, { wordWrap: { width: 226 } })]);
    const use = () => {
      const ok = potionHandler ? potionHandler(id) : !def.combate && usePotionOutside(id);
      if (!ok) {
        m.add(txt(s, 12, 96, def.combate ? 'Sólo se puede usar en combate.' : 'No se puede usar ahora.', 15, CSS.blood));
        return;
      }
      r.pociones!.splice(i, 1);
      audio.sfx('heal');
      saveLocal();
      closeMenu();
      hud.refresh();
    };
    m.add(button(s, 70, 84, 104, 28, 'Usar', use, { size: 18, color: UI.green }));
    m.add(button(s, 180, 84, 104, 28, 'Tirar', () => { r.pociones!.splice(i, 1); saveLocal(); closeMenu(); hud.refresh(); }, { size: 18 }));
    s.time.delayedCall(10, () => s.input.once('pointerdown', (_p: unknown, over: Phaser.GameObjects.GameObject[]) => {
      if (!over.some((o) => m.exists(o))) closeMenu();
    }));
  };
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
      floorT.setText(`${ROMAN[(r.acto ?? 1) - 1] ?? 'I'}·${Math.min(r.floor + 1, FLOORS + 1)}/${FLOORS + 1}`);
      scoreT.setText(`✦${fmtPuntos(r.score)}`);
      ergT.setText(`${r.ergios}`);
      deckBtn.label.setText(`${T.hud.mazo} ${r.deck.length}`);
      potRow.removeAll(true);
      for (let i = 0; i < MAX_POCIONES; i++) {
        const id = r.pociones?.[i];
        const im = s.add.image(i * 30, 0, id ? `pot_${id}` : 'pot_vacia').setScale(2.6);
        if (id) {
          im.setInteractive({ useHandCursor: true }).on('pointerdown', () => openPotion(i));
          tip.attach(im, POCIONES[id].name, `${POCIONES[id].text}\n${POCIONES[id].lore}\n(clic para usarla)`, 20);
        } else tip.attach(im, 'Frasco vacío', 'Las pociones se consiguen al ganar combates y en la tienda.', 20);
        potRow.add(im);
      }
      relicRow.removeAll(true);
      const step = Math.min(30, 62 / Math.max(1, r.relics.length - 1));
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

export function deckOverlay(s: Phaser.Scene, title = 'Tu mazo', cards = Game.run!.deck, onPick?: (i: number) => void, onCancel?: () => void) {
  const layer = s.add.container(0, 0).setDepth(900);
  const bg = s.add.rectangle(0, 0, W, H, 0x000000, 0.88).setOrigin(0).setInteractive();
  layer.add(bg);
  layer.add(txt(s, W / 2, 30, title, 32, CSS.gold).setOrigin(0.5));
  const sc = 0.6;
  const step = CW * sc + 12;
  const perRow = Math.floor((W - 40) / step);
  const x0 = (W - perRow * step) / 2 + step / 2;
  const inner = s.add.container(0, 0);
  layer.add(inner);
  cards.forEach((ci, i) => {
    const x = x0 + (i % perRow) * step;
    const y = 150 + Math.floor(i / perRow) * (CH * sc + 14);
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
  const maxScroll = Math.max(0, 150 + rows * (CH * sc + 14) - (H - 70));
  bg.on('wheel', (_p: unknown, _dx: number, dy: number) => {
    inner.y = Phaser.Math.Clamp(inner.y - dy * 0.5, -maxScroll, 0);
  });
  if (maxScroll > 0) layer.add(txt(s, W / 2, 56, '(rueda del ratón para desplazarte)', 18, CSS.dim).setOrigin(0.5));
  const g = s.add.graphics();
  frame(g, W / 2 - 80, H - 52, 160, 40, UI.panel, UI.border);
  layer.add(g);
  layer.add(button(s, W / 2, H - 32, 160, 40, onPick ? (onCancel ? 'Al azar' : 'Cancelar') : 'Cerrar', () => { layer.destroy(); onCancel?.(); }, { size: 22 }));
  return layer;
}
