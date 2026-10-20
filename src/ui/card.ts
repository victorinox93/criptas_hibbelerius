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
/** Cartas cuyo costo cambió por Confusión (gema naranja con «?»). El combate lo llena y lo limpia. */
export const costConfusion = new Set<number>();
const GEMA_CONFUSA = 0xe8781a;

/** Ediciones del Abismo (src/data/abismo_modo.ts): color base, color del texto, nombre de la cinta */
const ED_COLOR: Record<string, [number, string, string]> = {
  lamina: [0x7fc8ff, '#bfe6ff', 'LÁMINA'],
  holo: [0xc88aff, '#e6c8ff', 'HOLOGRÁFICA'],
  poli: [0xff6ac8, '#ffc0e8', 'POLÍCROMA'],
  cristal: [0xc8f4ff, '#f0fcff', 'CRISTAL'],
};

const hue = (h: number, sat = 0.75, v = 1) => {
  const c = Phaser.Display.Color.HSVToRGB(((h % 1) + 1) % 1, sat, v) as Phaser.Types.Display.ColorObject;
  return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
};

/** Segmento de la recta x = x0 + k·y recortado a la carta (para los brillos diagonales) */
function rayo(g: Phaser.GameObjects.Graphics, x0: number, k: number, ancho: number, color: number, alpha: number) {
  const m = ancho / 2 + 3; // margen: el trazo grueso no debe salirse de la carta
  let ya = -CH / 2 + m, yb = CH / 2 - m;
  // x dentro de [−CW/2, CW/2]  →  y dentro de un intervalo
  const lim = [(-CW / 2 + m - x0) / k, (CW / 2 - m - x0) / k].sort((a, b) => a - b);
  ya = Math.max(ya, lim[0]); yb = Math.min(yb, lim[1]);
  if (yb <= ya) return;
  g.lineStyle(ancho, color, alpha).lineBetween(x0 + k * ya, ya, x0 + k * yb, yb);
}

/**
 * Dibuja la edición sobre la carta (estilo Balatro) y la anima:
 *  · Lámina: tinte azul acero y un destello blanco que barre la carta
 *  · Holográfica: arcoíris suave que se mueve y líneas de escaneo
 *  · Polícroma: franjas de todos los colores que corren y borde arcoíris grueso
 *  · Cristal: carta helada y translúcida con facetas y chispas
 */
function edicionVisual(s: Phaser.Scene, c: Phaser.GameObjects.Container, ed: string) {
  const [col, css, label] = ED_COLOR[ed];
  const tinte = s.add.graphics();
  const brillo = s.add.graphics();
  const borde = s.add.graphics();
  const x0 = -CW / 2, y0 = -CH / 2;
  const t = { v: Math.random() };
  // cinta con el nombre, en la parte de abajo de la caja de arte (no tapa el texto de la carta)
  const cinta = s.add.graphics();
  const wl = label.length * 8 + 20;
  cinta.fillStyle(0x000000, 0.75).fillRect(CW / 2 - wl - 6, y0 + 74, wl, 18);
  cinta.lineStyle(2, col, 1).strokeRect(CW / 2 - wl - 6, y0 + 74, wl, 18);
  const tag = txt(s, CW / 2 - 6 - wl / 2, y0 + 83, `◆ ${label}`, 15, css).setOrigin(0.5);
  const pinta = () => {
    tinte.clear(); brillo.clear(); borde.clear();
    if (ed === 'holo' || ed === 'poli') tag.setColor(`#${hue(t.v + 0.1, 0.35).toString(16).padStart(6, '0')}`);
    if (ed === 'lamina') {
      tinte.fillStyle(col, 0.16).fillRect(x0, y0, CW, CH);
      const pos = -CW + ((t.v * 2) % 1) * CW * 2.4; // un destello que cruza cada ~2 s
      rayo(brillo, pos, 0.55, 18, 0xffffff, 0.22);
      rayo(brillo, pos + 16, 0.55, 5, 0xffffff, 0.45);
      borde.lineStyle(4, col, 1).strokeRect(x0 + 2, y0 + 2, CW - 4, CH - 4);
    } else if (ed === 'holo') {
      const a = hue(t.v), b = hue(t.v + 0.33), d = hue(t.v + 0.66);
      tinte.fillGradientStyle(a, b, d, a, 0.22).fillRect(x0, y0, CW, CH);
      for (let y = y0 + 6; y < CH / 2; y += 6) brillo.lineStyle(1, 0xffffff, 0.06).lineBetween(x0 + 4, y, CW / 2 - 4, y);
      borde.lineStyle(4, hue(t.v), 1).strokeRect(x0 + 2, y0 + 2, CW - 4, CH - 4);
    } else if (ed === 'poli') {
      const n = 7;
      for (let i = 0; i < n; i++) tinte.fillStyle(hue(t.v * 2 + i / n, 0.8), 0.2).fillRect(x0 + (i * CW) / n, y0, CW / n + 1, CH);
      rayo(brillo, -CW + ((t.v * 3) % 1) * CW * 2.4, 0.55, 10, 0xffffff, 0.3);
      for (let i = 0; i < 4; i++) borde.lineStyle(2, hue(t.v * 2 + i / 4), 1).strokeRect(x0 + 1 + i * 2, y0 + 1 + i * 2, CW - 2 - i * 4, CH - 2 - i * 4);
    } else {
      // cristal: hielo translúcido con facetas fijas y chispas que titilan
      tinte.fillStyle(col, 0.2).fillRect(x0, y0, CW, CH);
      tinte.lineStyle(1, 0xffffff, 0.35);
      const f: [number, number, number, number][] = [[-86, -40, -10, -120], [-10, -120, 40, 10], [40, 10, 86, -60], [-86, 60, 20, 120], [20, 120, 40, 10], [-40, -10, 40, 10]];
      f.forEach(([a, b, cc, d]) => tinte.lineBetween(a, b, cc, d));
      const pos = -CW + ((t.v * 1.5) % 1) * CW * 2.4;
      rayo(brillo, pos, -0.7, 22, 0xffffff, 0.18);
      rayo(brillo, pos + 18, -0.7, 4, 0xffffff, 0.55);
      const k = Math.floor(t.v * 40);
      for (let i = 0; i < 5; i++) {
        const sx = ((k * 37 + i * 61) % (CW - 20)) - CW / 2 + 10, sy = ((k * 53 + i * 97) % (CH - 20)) - CH / 2 + 10;
        brillo.fillStyle(0xffffff, 0.9).fillRect(sx - 1, sy - 4, 2, 8).fillRect(sx - 4, sy - 1, 8, 2);
      }
      borde.lineStyle(4, 0xffffff, 0.9).strokeRect(x0 + 2, y0 + 2, CW - 4, CH - 4);
      borde.lineStyle(2, col, 1).strokeRect(x0 + 6, y0 + 6, CW - 12, CH - 12);
    }
  };
  pinta();
  c.add([tinte, brillo, borde, cinta, tag]);
  const tw = s.tweens.add({ targets: t, v: t.v + 1, duration: ed === 'holo' ? 4000 : ed === 'poli' ? 3000 : 2600, repeat: -1, onUpdate: pinta });
  c.once('destroy', () => tw.stop());
}

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
  const pintaGema = (confusa: boolean) => {
    gem.clear();
    gem.fillStyle(0x000000, 1).fillCircle(-CW / 2 + 12, -CH / 2 + 12, 16);
    gem.fillStyle(confusa ? GEMA_CONFUSA : 0x1d4d5a, 1).fillCircle(-CW / 2 + 12, -CH / 2 + 12, 13);
    gem.lineStyle(2, confusa ? 0xfff0a0 : UI.energy, 1).strokeCircle(-CW / 2 + 12, -CH / 2 + 12, 13);
  };
  pintaGema(false);
  // marca de Confusión: un «?» grande junto a la gema que tiembla
  const duda = txt(s, -CW / 2 + 34, -CH / 2 + 4, '?', 26, '#ffd040').setOrigin(0.5).setStroke('#000', 5).setVisible(false);
  const tiembla = s.tweens.add({ targets: duda, angle: { from: -14, to: 14 }, scale: { from: 0.9, to: 1.15 }, duration: 260, yoyo: true, repeat: -1, paused: true });
  const cost = txt(s, -CW / 2 + 12, -CH / 2 + 10, '', 24, '#e8fbff').setOrigin(0.5);
  const unit = txt(s, -CW / 2 + 12, -CH / 2 + 30, 'J', 14, CSS.energy).setOrigin(0.5);
  c.add([g, art, name, type, body, gem, cost, unit, duda]);
  c.once('destroy', () => tiembla.stop());
  if (inst.ed && ED_COLOR[inst.ed]) edicionVisual(s, c, inst.ed);
  c.setSize(CW, CH);

  c.refresh = (cx: CalcCtx, playable = true) => {
    const st = statsOf(inst);
    body.setText(borrarTexto(def.text(st, cx), Game.preparando ? 0 : Game.run?.entropia ?? 0, inst.uid));
    // el texto se ajusta bajando el tamaño de letra (no aplastándolo)
    const maxH = CH / 2 - 8 - (-CH / 2 + 114), maxW = CW - 14;
    let fs = 20;
    body.setScale(1).setFontSize(fs);
    while ((body.height > maxH || body.width > maxW) && fs > 13) body.setFontSize(--fs);
    const k = Math.min(1, maxH / body.height, maxW / body.width);
    body.setScale(k);
    const ov = costOverride.get(inst.uid);
    const confusa = costConfusion.has(inst.uid);
    pintaGema(confusa);
    duda.setVisible(confusa);
    if (confusa && tiembla.isPaused()) tiembla.resume(); else if (!confusa && !tiembla.isPaused()) tiembla.pause();
    cost.setText(String(ov ?? st.cost)).setColor(confusa ? '#1a0e00' : ov !== undefined && ov !== st.cost ? '#ffd040' : '#e8fbff');
    unit.setColor(confusa ? '#ffd040' : CSS.energy);
    c.setAlpha(playable ? 1 : 0.55);
  };
  c.refresh(ctx);
  return c;
}
