import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { CalcCtx, CARDS, CardInst, statsOf } from '../data/cards';
import { borrarTexto } from '../data/abismo';
import { frame, txt } from './widgets';
import { Game } from '../state';

export const CW = 172;
export const CH = 240;

const TYPE_COLOR: Record<string, number> = {
  Ataque: 0xa8323e,
  Defensa: 0x3f6aa8,
  Habilidad: 0x4f8a3a,
  Poder: 0x8e5bb0,
  Estado: 0x4a4650,
};

export interface CardView extends Phaser.GameObjects.Container {
  inst: CardInst;
  refresh(ctx: CalcCtx, playable?: boolean): void;
}

export const NO_CTX: CalcCtx = { masaBonus: 0, acelBonus: 0, friccion: 0 };

/** Costos alterados en combate (Confusión, Pacto del Centroide): uid → J. El combate lo llena y lo limpia. */
export const costOverride = new Map<number, number>();

/** Colores de las ediciones del Abismo (src/data/abismo_modo.ts) */
const ED_COLOR: Record<string, [number, string, string]> = {
  lamina: [0x9ad8f0, '#9ad8f0', 'LÁMINA'],
  holo: [0xc88aff, '#d0a0ff', 'HOLO'],
  poli: [0xff8ad0, '#ff9ad8', 'POLÍCROMA'],
  cristal: [0xe8fbff, '#e8fbff', 'CRISTAL'],
};

export function cardView(s: Phaser.Scene, x: number, y: number, inst: CardInst, ctx: CalcCtx = NO_CTX): CardView {
  const def = CARDS[inst.id];
  const c = s.add.container(x, y) as CardView;
  c.inst = inst;
  const g = s.add.graphics();
  const col = TYPE_COLOR[def.type];
  frame(g, -CW / 2, -CH / 2, CW, CH, def.rarity === 'legendaria' ? 0x201a10 : 0x1a151f, col);
  if (def.rarity === 'legendaria') {
    // marco dorado de las legendarias
    g.lineStyle(3, 0xe8c15a, 1).strokeRect(-CW / 2 + 3, -CH / 2 + 3, CW - 6, CH - 6);
    g.lineStyle(1, 0xfff2b0, 0.6).strokeRect(-CW / 2 + 6, -CH / 2 + 6, CW - 12, CH - 12);
  }
  // caja de arte
  g.fillStyle(0x0d0b10, 1).fillRect(-CW / 2 + 12, -CH / 2 + 34, CW - 24, 56);
  g.lineStyle(2, col, 0.6).strokeRect(-CW / 2 + 12, -CH / 2 + 34, CW - 24, 56);
  const art = s.add.image(0, -CH / 2 + 62, def.icon).setScale(4.6);
  const name = txt(s, 6, -CH / 2 + 18, def.name + (inst.up ? '+' : '') + (inst.evo ? ` ✦${inst.evo}` : ''), 21, inst.evo ? CSS.gold : inst.up ? CSS.green : CSS.bone).setOrigin(0.5);
  if (name.width > CW - 44) name.setScale((CW - 44) / name.width, 1);
  const type = txt(s, 0, -CH / 2 + 100, `${def.type} · ${def.concept}`, 16, CSS.dim).setOrigin(0.5);
  if (type.width > CW - 16) type.setScale((CW - 16) / type.width, 1);
  const body = txt(s, 0, -CH / 2 + 114, '', 20, CSS.bone, { align: 'center', lineSpacing: -4 }).setOrigin(0.5, 0);
  // gema de costo
  const gem = s.add.graphics();
  gem.fillStyle(0x000000, 1).fillCircle(-CW / 2 + 12, -CH / 2 + 12, 16);
  gem.fillStyle(0x1d4d5a, 1).fillCircle(-CW / 2 + 12, -CH / 2 + 12, 13);
  gem.lineStyle(2, UI.energy, 1).strokeCircle(-CW / 2 + 12, -CH / 2 + 12, 13);
  const cost = txt(s, -CW / 2 + 12, -CH / 2 + 10, '', 24, '#e8fbff').setOrigin(0.5);
  const unit = txt(s, -CW / 2 + 12, -CH / 2 + 30, 'J', 14, CSS.energy).setOrigin(0.5);
  c.add([g, art, name, type, body, gem, cost, unit]);
  if (inst.ed && ED_COLOR[inst.ed]) {
    // edición estilo Balatro: marco brillante que late y una etiqueta
    const [col, css, label] = ED_COLOR[inst.ed];
    const glow = s.add.graphics();
    glow.lineStyle(3, col, 1).strokeRect(-CW / 2 + 2, -CH / 2 + 2, CW - 4, CH - 4);
    glow.lineStyle(1, 0xffffff, 0.7).strokeRect(-CW / 2 + 6, -CH / 2 + 6, CW - 12, CH - 12);
    if (inst.ed === 'cristal') {
      // destellos diagonales sobre el arte
      glow.fillStyle(0xffffff, 0.18).fillRect(-CW / 2 + 12, -CH / 2 + 34, CW - 24, 56);
      glow.lineStyle(2, 0xffffff, 0.6).lineBetween(-30, -CH / 2 + 88, 10, -CH / 2 + 36).lineBetween(-10, -CH / 2 + 88, 30, -CH / 2 + 36);
    }
    const tag = txt(s, CW / 2 - 16, -CH / 2 + 82, label, 14, css).setOrigin(1, 0.5).setStroke('#000', 3);
    c.add([glow, tag]);
    s.tweens.add({ targets: glow, alpha: 0.35, duration: 700 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const k = { h: Math.random() };
    c.once('destroy', () => { s.tweens.killTweensOf(glow); s.tweens.killTweensOf(k); });
    if (inst.ed === 'poli' || inst.ed === 'holo') {
      // el color cambia como un holograma
      s.tweens.add({ targets: k, h: k.h + 1, duration: inst.ed === 'poli' ? 1800 : 3200, repeat: -1, onUpdate: () => {
        const rgb = Phaser.Display.Color.HSVToRGB(k.h % 1, 0.45, 1) as Phaser.Types.Display.ColorObject;
        const hex = Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b);
        glow.clear();
        glow.lineStyle(3, hex, 1).strokeRect(-CW / 2 + 2, -CH / 2 + 2, CW - 4, CH - 4);
        glow.lineStyle(1, 0xffffff, 0.7).strokeRect(-CW / 2 + 6, -CH / 2 + 6, CW - 12, CH - 12);
        tag.setColor(`#${hex.toString(16).padStart(6, '0')}`);
      } });
    }
  }
  c.setSize(CW, CH);

  c.refresh = (cx: CalcCtx, playable = true) => {
    const st = statsOf(inst);
    body.setText(borrarTexto(def.text(st, cx), Game.run?.entropia ?? 0, inst.uid));
    // el texto se ajusta bajando el tamaño de letra (no aplastándolo)
    const maxH = CH / 2 - 8 - (-CH / 2 + 114), maxW = CW - 14;
    let fs = 20;
    body.setScale(1).setFontSize(fs);
    while ((body.height > maxH || body.width > maxW) && fs > 13) body.setFontSize(--fs);
    const k = Math.min(1, maxH / body.height, maxW / body.width);
    body.setScale(k);
    const ov = costOverride.get(inst.uid);
    cost.setText(String(ov ?? st.cost)).setColor(ov !== undefined && ov !== st.cost ? '#e0b0ff' : '#e8fbff');
    c.setAlpha(playable ? 1 : 0.55);
  };
  c.refresh(ctx);
  return c;
}
