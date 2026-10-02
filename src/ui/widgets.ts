import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';

export const FONT = 'VT323, monospace';
export const TITLE_FONT = '"Pirata One", Georgia, serif';

export function txt(
  s: Phaser.Scene, x: number, y: number, str: string, size = 22, color = CSS.bone,
  opts: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {},
) {
  return s.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, lineSpacing: -2, ...opts });
}

export function title(s: Phaser.Scene, x: number, y: number, str: string, size = 48, color = CSS.gold) {
  return s.add
    .text(x, y, str, { fontFamily: TITLE_FONT, fontSize: `${size}px`, color, stroke: '#0d0b10', strokeThickness: 6 })
    .setOrigin(0.5)
    .setShadow(0, 3, '#000', 0, true, true);
}

/** Marco pixelado doble */
export function frame(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, fill = UI.panel, border = UI.border, alpha = 0.96) {
  g.fillStyle(0x000000, 0.5).fillRect(x + 4, y + 4, w, h);
  g.fillStyle(fill, alpha).fillRect(x, y, w, h);
  g.lineStyle(2, 0x000000, 1).strokeRect(x, y, w, h);
  g.lineStyle(2, border, 1).strokeRect(x + 3, y + 3, w - 6, h - 6);
  // esquinas
  g.fillStyle(border, 1);
  for (const [cx, cy] of [[x + 1, y + 1], [x + w - 7, y + 1], [x + 1, y + h - 7], [x + w - 7, y + h - 7]]) g.fillRect(cx, cy, 6, 6);
  return g;
}

export function panel(s: Phaser.Scene, x: number, y: number, w: number, h: number, fill = UI.panel, border = UI.border) {
  return frame(s.add.graphics(), x, y, w, h, fill, border);
}

export interface Btn extends Phaser.GameObjects.Container {
  setEnabled(v: boolean): Btn;
  label: Phaser.GameObjects.Text;
}

export function button(
  s: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, onClick: () => void,
  opts: { color?: number; size?: number; enabled?: boolean } = {},
): Btn {
  const c = s.add.container(x, y) as Btn;
  const g = s.add.graphics();
  const color = opts.color ?? UI.border;
  let enabled = opts.enabled ?? true;
  const draw = (hover: boolean) => {
    g.clear();
    frame(g, -w / 2, -h / 2, w, h, hover && enabled ? UI.panel2 : UI.panel, enabled ? (hover ? UI.gold : color) : 0x2a2433);
  };
  draw(false);
  const t = txt(s, 0, 0, label, opts.size ?? 26, CSS.bone, { align: 'center' }).setOrigin(0.5);
  c.add([g, t]);
  c.label = t;
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerover', () => draw(true));
  c.on('pointerout', () => draw(false));
  c.on('pointerdown', () => {
    if (!enabled) return;
    s.tweens.add({ targets: c, scale: 0.95, duration: 60, yoyo: true });
    onClick();
  });
  c.setEnabled = (v: boolean) => {
    enabled = v;
    t.setColor(v ? CSS.bone : '#5a5468');
    draw(false);
    return c;
  };
  c.setEnabled(enabled);
  return c;
}

// ── Tooltip global por escena ──
export class Tooltip {
  private c: Phaser.GameObjects.Container;
  private g: Phaser.GameObjects.Graphics;
  private t1: Phaser.GameObjects.Text;
  private t2: Phaser.GameObjects.Text;
  constructor(private s: Phaser.Scene) {
    this.g = s.add.graphics();
    this.t1 = txt(s, 12, 8, '', 22, CSS.gold);
    this.t2 = txt(s, 12, 32, '', 19, CSS.bone, { wordWrap: { width: 300 } });
    this.c = s.add.container(0, 0, [this.g, this.t1, this.t2]).setDepth(1000).setVisible(false);
  }
  show(x: number, y: number, head: string, body: string) {
    this.t1.setText(head);
    this.t2.setText(body);
    const w = Math.max(this.t1.width, this.t2.width) + 26;
    const h = this.t2.y + this.t2.height + 12;
    this.g.clear();
    frame(this.g, 0, 0, w, h, 0x0f0c13, UI.gold, 0.97);
    const px = Phaser.Math.Clamp(x, 8, W - w - 8);
    const py = Phaser.Math.Clamp(y, 8, H - h - 8);
    this.c.setPosition(px, py).setVisible(true);
  }
  hide() {
    this.c.setVisible(false);
  }
  attach(obj: Phaser.GameObjects.GameObject & { setInteractive: any }, head: string | (() => string), body: string | (() => string), dy = -10) {
    obj.setInteractive();
    obj.on('pointerover', (p: Phaser.Input.Pointer) => {
      const hh = typeof head === 'function' ? head() : head;
      const bb = typeof body === 'function' ? body() : body;
      this.show(p.x + 14, p.y + dy, hh, bb);
    });
    obj.on('pointerout', () => this.hide());
  }
}

// ── Fondos ──
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export function dungeonBackground(s: Phaser.Scene, seed = 7, tint = 0x241c2c) {
  const r = rng(seed);
  const g = s.add.graphics().setDepth(-10);
  g.fillStyle(UI.bg, 1).fillRect(0, 0, W, H);
  // muro de ladrillo
  const bw = 48, bh = 24;
  for (let y = 0; y < 330; y += bh) {
    const off = (y / bh) % 2 ? bw / 2 : 0;
    for (let x = -bw; x < W + bw; x += bw) {
      const shade = Phaser.Display.Color.IntegerToColor(tint);
      const k = 0.55 + r() * 0.45 - y / 900;
      g.fillStyle(Phaser.Display.Color.GetColor(shade.red * k, shade.green * k, shade.blue * k), 1);
      g.fillRect(x + off + 2, y + 2, bw - 4, bh - 4);
      if (r() < 0.12) {
        g.fillStyle(0x000000, 0.35).fillRect(x + off + 6 + r() * 20, y + 6, 6, 4);
      }
    }
  }
  // suelo
  for (let y = 330; y < H; y += 18) {
    for (let x = 0; x < W; x += 36) {
      const k = 0.25 + r() * 0.25 + (y - 330) / 900;
      g.fillStyle(Phaser.Display.Color.GetColor(40 * k * 2, 32 * k * 2, 44 * k * 2), 1);
      g.fillRect(x + ((y / 18) % 2 ? 18 : 0) + 1, y + 1, 34, 16);
    }
  }
  g.fillStyle(0x000000, 0.55).fillRect(0, 326, W, 8);
  // columnas
  for (const cx of [70, W - 110]) {
    g.fillStyle(0x15111a, 1).fillRect(cx, 0, 40, 334);
    g.fillStyle(0x2c2535, 1).fillRect(cx + 4, 0, 6, 334);
    g.fillStyle(0x0a080c, 1).fillRect(cx + 32, 0, 8, 334);
  }
  // antorchas
  for (const tx of [210, W - 230]) torch(s, tx, 150);
  vignette(s);
  return g;
}

export function torch(s: Phaser.Scene, x: number, y: number) {
  const g = s.add.graphics().setDepth(-9);
  g.fillStyle(0x3a2a1a, 1).fillRect(x - 3, y, 6, 22);
  g.fillStyle(0x6b4a2b, 1).fillRect(x - 5, y - 2, 10, 5);
  const glow = s.add.circle(x, y - 10, 70, 0xc87533, 0.12).setDepth(-9).setBlendMode(Phaser.BlendModes.ADD);
  s.tweens.add({ targets: glow, alpha: 0.05, scale: 0.9, duration: 160, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Math.random() * 200 });
  s.add.particles(x, y - 6, 'px', {
    speed: { min: 8, max: 30 }, angle: { min: 250, max: 290 }, lifespan: 600, quantity: 1, frequency: 50,
    scale: { start: 2.2, end: 0 }, tint: [0xe8c15a, 0xc87533, 0xc43a3a], blendMode: 'ADD',
  }).setDepth(-8);
}

export function vignette(s: Phaser.Scene) {
  const g = s.add.graphics().setDepth(500);
  for (let i = 0; i < 18; i++) {
    g.lineStyle(14, 0x000000, 0.09 + i * 0.012);
    g.strokeRect(-i * 7 + 120, -i * 7 + 80, W - 240 + i * 14, H - 160 + i * 14);
  }
  return g;
}

export function embers(s: Phaser.Scene) {
  return s.add.particles(0, H + 10, 'px', {
    x: { min: 0, max: W }, speedY: { min: -40, max: -15 }, speedX: { min: -10, max: 10 }, lifespan: 9000, frequency: 160,
    scale: { start: 1.5, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: [0xc87533, 0xc43a3a, 0xe8c15a], blendMode: 'ADD',
  }).setDepth(-5);
}

export function fadeTo(s: Phaser.Scene, key: string, data?: object) {
  s.cameras.main.fadeOut(250, 0, 0, 0);
  s.cameras.main.once('camerafadeoutcomplete', () => s.scene.start(key, data));
}

export function icon(s: Phaser.Scene, x: number, y: number, key: string, scale = 3) {
  return s.add.image(x, y, key).setScale(scale);
}

export function bar(s: Phaser.Scene, x: number, y: number, w: number, h: number, color: number) {
  const g = s.add.graphics();
  const t = txt(s, x + w / 2, y + h / 2, '', 18, CSS.bone).setOrigin(0.5);
  const set = (v: number, max: number, extra = 0) => {
    g.clear();
    g.fillStyle(0x000000, 1).fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(0x2a1418, 1).fillRect(x, y, w, h);
    g.fillStyle(color, 1).fillRect(x, y, Math.max(0, (w * v) / max), h);
    g.fillStyle(0xffffff, 0.15).fillRect(x, y, Math.max(0, (w * v) / max), 2);
    if (extra > 0) {
      g.lineStyle(2, UI.block, 1).strokeRect(x - 2, y - 2, w + 4, h + 4);
    }
    t.setText(`${Math.max(0, v)}/${max}`);
  };
  return { g, t, set };
}
