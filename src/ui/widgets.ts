import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H, RES } from '../config';

export const FONT = 'VT323, monospace';
export const TITLE_FONT = '"Pirata One", Georgia, serif';

export function txt(
  s: Phaser.Scene, x: number, y: number, str: string, size = 22, color = CSS.bone,
  opts: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {},
) {
  return s.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, lineSpacing: -2, resolution: RES, ...opts });
}

export function title(s: Phaser.Scene, x: number, y: number, str: string, size = 48, color = CSS.gold) {
  return s.add
    .text(x, y, str, { fontFamily: TITLE_FONT, fontSize: `${size}px`, color, stroke: '#07060a', strokeThickness: 6, resolution: RES })
    .setOrigin(0.5)
    .setShadow(0, 3, '#000', 0, true, true);
}

/** Marco pixelado doble */
export function frame(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, fill = UI.panel, border = UI.border, alpha = 0.96) {
  g.fillStyle(0x000000, 0.5).fillRect(x + 4, y + 4, w, h);
  g.fillStyle(fill, alpha).fillRect(x, y, w, h);
  g.lineStyle(2, 0x000000, 1).strokeRect(x, y, w, h);
  g.lineStyle(2, border, 1).strokeRect(x + 3, y + 3, w - 6, h - 6);
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
  opts: { color?: number; size?: number; enabled?: boolean; silent?: boolean } = {},
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
  c.on('pointerover', () => {
    draw(true);
    if (enabled) audio.sfx('hover');
  });
  c.on('pointerout', () => draw(false));
  c.on('pointerdown', () => {
    if (!enabled) return;
    if (!opts.silent) audio.sfx('click');
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

// ── Campo de texto dibujado en el juego ──
// Usa un <input> invisible para recibir el teclado (acentos, pegar y celulares),
// pero lo que se ve está dentro del lienzo: nunca se encima con otros botones.
export interface FieldOpts {
  placeholder?: string;
  maxLength?: number;
  password?: boolean;
  upper?: boolean;
  numeric?: boolean;
  value?: string;
  size?: number;
  color?: string;
  center?: boolean;
  onEnter?: () => void;
}

export class TextField {
  c: Phaser.GameObjects.Container;
  private g: Phaser.GameObjects.Graphics;
  private t: Phaser.GameObjects.Text;
  private caret: Phaser.GameObjects.Rectangle;
  private el: HTMLInputElement;
  private focused = false;
  value = '';

  constructor(private s: Phaser.Scene, x: number, y: number, private w: number, private o: FieldOpts = {}) {
    const h = 40;
    this.c = s.add.container(x, y);
    this.g = s.add.graphics();
    const size = o.size ?? 24;
    this.t = txt(s, o.center ? 0 : -w / 2 + 12, 0, '', size, o.color ?? CSS.bone).setOrigin(o.center ? 0.5 : 0, 0.5);
    this.caret = s.add.rectangle(0, 0, 2, size - 4, UI.gold).setVisible(false);
    this.c.add([this.g, this.t, this.caret]);
    this.c.setSize(w, h).setInteractive({ useHandCursor: true });
    this.c.on('pointerdown', (_p: unknown, _x: unknown, _y: unknown, ev: Phaser.Types.Input.EventData) => {
      ev?.stopPropagation?.();
      this.focus();
    });

    const el = (this.el = document.createElement('input'));
    el.type = 'text';
    el.autocomplete = 'off';
    el.spellcheck = false;
    el.setAttribute('autocapitalize', o.upper ? 'characters' : 'off');
    if (o.numeric) el.inputMode = 'decimal';
    if (o.maxLength) el.maxLength = o.maxLength;
    Object.assign(el.style, {
      position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0',
      border: '0', padding: '0', fontSize: '16px', pointerEvents: 'none',
    });
    document.body.appendChild(el);
    el.value = o.value ?? '';
    el.addEventListener('input', () => this.sync());
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        o.onEnter?.();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        TextField.focusNext(s, this, e.shiftKey ? -1 : 1);
      }
      e.stopPropagation();
    });
    el.addEventListener('blur', () => this.setFocus(false));
    this.sync();
    this.redraw();

    const list: TextField[] = s.data.get('fields') ?? [];
    list.push(this);
    s.data.set('fields', list);
    if (!s.data.get('fieldsHooked')) {
      s.data.set('fieldsHooked', true);
      s.input.on('pointerdown', (_p: unknown, over: Phaser.GameObjects.GameObject[]) => {
        const fl: TextField[] = s.data.get('fields') ?? [];
        if (!fl.some((f) => over.includes(f.c))) fl.forEach((f) => f.blur());
      });
      s.events.once('shutdown', () => {
        (s.data.get('fields') as TextField[] | undefined)?.forEach((f) => f.el.remove());
        s.data.set('fields', []);
        s.data.set('fieldsHooked', false);
      });
      s.time.addEvent({
        delay: 500, loop: true,
        callback: () => (s.data.get('fields') as TextField[]).forEach((f) => f.caret.setVisible(f.focused && !f.caret.visible)),
      });
    }
  }

  static focusNext(s: Phaser.Scene, cur: TextField, dir: number) {
    const fl = (s.data.get('fields') as TextField[]).filter((f) => f.c.visible && f.c.active);
    const i = fl.indexOf(cur);
    fl[(i + dir + fl.length) % fl.length]?.focus();
  }

  private sync() {
    let v = this.el.value;
    if (this.o.upper) v = v.toUpperCase();
    if (this.o.numeric) v = v.replace(/[^0-9.,\-eE]/g, '');
    if (v !== this.el.value) this.el.value = v;
    this.value = v;
    this.render();
  }

  private render() {
    if (!this.t.scene) return;
    const empty = this.value.length === 0;
    if (empty && !this.focused) {
      this.t.setText(this.o.placeholder ?? '').setColor('#5a5468');
    } else {
      this.t.setText(this.o.password ? '•'.repeat(this.value.length) : this.value).setColor(this.o.color ?? CSS.bone);
    }
    const tw = empty ? 0 : this.t.displayWidth;
    const x = this.o.center ? tw / 2 + 3 : -this.w / 2 + 12 + tw + 2;
    this.caret.setPosition(x, 0);
  }

  private redraw() {
    this.g.clear();
    this.g.fillStyle(0x000000, 0.6).fillRect(-this.w / 2 + 3, -17, this.w, 40);
    this.g.fillStyle(0x0a080d, 1).fillRect(-this.w / 2, -20, this.w, 40);
    this.g.lineStyle(2, this.focused ? UI.gold : UI.border, 1).strokeRect(-this.w / 2, -20, this.w, 40);
  }

  private setFocus(v: boolean) {
    if (!this.t.scene) return; // la escena ya terminó
    this.focused = v;
    this.caret.setVisible(v);
    this.redraw();
    this.render();
  }

  focus() {
    (this.s.data.get('fields') as TextField[]).forEach((f) => f !== this && f.blur());
    this.el.focus({ preventScroll: true });
    this.setFocus(true);
  }

  blur() {
    if (document.activeElement === this.el) this.el.blur();
    this.setFocus(false);
  }

  setVisible(v: boolean) {
    this.c.setVisible(v);
    if (!v) this.blur();
    return this;
  }

  setValue(v: string) {
    this.el.value = v;
    this.sync();
  }
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
    frame(this.g, 0, 0, w, h, 0x0b090e, UI.gold, 0.97);
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
      this.show(p.worldX + 14, p.worldY + dy, hh, bb);
    });
    obj.on('pointerout', () => this.hide());
  }
}

// ── Fondos (oscuros, con niebla) ──
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export function dungeonBackground(s: Phaser.Scene, seed = 7, tint = 0x1c1722) {
  const r = rng(seed);
  const g = s.add.graphics().setDepth(-10);
  g.fillStyle(0x060508, 1).fillRect(0, 0, W, H);
  const bw = 48, bh = 24;
  const base = Phaser.Display.Color.IntegerToColor(tint);
  for (let y = 0; y < 330; y += bh) {
    const off = (y / bh) % 2 ? bw / 2 : 0;
    for (let x = -bw; x < W + bw; x += bw) {
      const k = 0.4 + r() * 0.3 - (330 - y) / 1100;
      g.fillStyle(Phaser.Display.Color.GetColor(base.red * k, base.green * k, base.blue * k), 1);
      g.fillRect(x + off + 2, y + 2, bw - 4, bh - 4);
      if (r() < 0.1) g.fillStyle(0x000000, 0.4).fillRect(x + off + 6 + r() * 20, y + 6, 6, 4);
      if (r() < 0.05) g.fillStyle(0x2c3a24, 0.35).fillRect(x + off + 2, y + bh - 8, bw - 10, 6); // musgo
    }
  }
  for (let y = 330; y < H; y += 18) {
    for (let x = 0; x < W; x += 36) {
      const k = 0.18 + r() * 0.16 + (y - 330) / 1600;
      g.fillStyle(Phaser.Display.Color.GetColor(40 * k * 2, 34 * k * 2, 46 * k * 2), 1);
      g.fillRect(x + ((y / 18) % 2 ? 18 : 0) + 1, y + 1, 34, 16);
    }
  }
  g.fillStyle(0x000000, 0.6).fillRect(0, 326, W, 8);
  for (const cx of [70, W - 110]) {
    g.fillStyle(0x0e0b12, 1).fillRect(cx, 0, 40, 334);
    g.fillStyle(0x1e1926, 1).fillRect(cx + 4, 0, 6, 334);
    g.fillStyle(0x060508, 1).fillRect(cx + 32, 0, 8, 334);
  }
  // degradado de oscuridad desde arriba
  for (let i = 0; i < 12; i++) g.fillStyle(0x000000, 0.06).fillRect(0, 0, W, 150 - i * 12);
  for (const tx of [210, W - 230]) torch(s, tx, 150);
  mist(s);
  vignette(s);
  return g;
}

export function mist(s: Phaser.Scene, y = 300) {
  for (let i = 0; i < 5; i++) {
    const m = s.add.ellipse(Math.random() * W, y + Math.random() * 60, 420 + Math.random() * 200, 70, 0x3a3346, 0.08).setDepth(-6);
    s.tweens.add({ targets: m, x: m.x + (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 120), alpha: 0.03, duration: 9000 + Math.random() * 6000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }
}

export function torch(s: Phaser.Scene, x: number, y: number) {
  const g = s.add.graphics().setDepth(-9);
  g.fillStyle(0x2a1e14, 1).fillRect(x - 3, y, 6, 22);
  g.fillStyle(0x4a3420, 1).fillRect(x - 5, y - 2, 10, 5);
  const glow = s.add.circle(x, y - 10, 70, 0xc87533, 0.07).setDepth(-9).setBlendMode(Phaser.BlendModes.ADD);
  s.tweens.add({ targets: glow, alpha: 0.03, scale: 0.9, duration: 160, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Math.random() * 200 });
  s.add.particles(x, y - 6, 'px', {
    speed: { min: 8, max: 26 }, angle: { min: 250, max: 290 }, lifespan: 550, quantity: 1, frequency: 60,
    scale: { start: 2, end: 0 }, tint: [0xe8c15a, 0xc87533, 0x8a4a2a], blendMode: 'ADD', alpha: { start: 0.8, end: 0 },
  }).setDepth(-8);
}

export function vignette(s: Phaser.Scene) {
  const g = s.add.graphics().setDepth(500);
  for (let i = 0; i < 20; i++) {
    g.lineStyle(14, 0x000000, 0.1 + i * 0.014);
    g.strokeRect(-i * 7 + 130, -i * 7 + 90, W - 260 + i * 14, H - 180 + i * 14);
  }
  return g;
}

export function embers(s: Phaser.Scene) {
  return s.add.particles(0, H + 10, 'px', {
    x: { min: 0, max: W }, speedY: { min: -30, max: -10 }, speedX: { min: -10, max: 10 }, lifespan: 10000, frequency: 220,
    scale: { start: 1.3, end: 0 }, alpha: { start: 0.6, end: 0 }, tint: [0x8a7a9a, 0x5b4a6a, 0xc87533], blendMode: 'ADD',
  }).setDepth(-5);
}

export function fadeTo(s: Phaser.Scene, key: string, data?: object) {
  s.input.enabled = false;
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
    g.fillStyle(0x1e1418, 1).fillRect(x, y, w, h);
    g.fillStyle(color, 1).fillRect(x, y, Math.max(0, (w * v) / max), h);
    g.fillStyle(0xffffff, 0.12).fillRect(x, y, Math.max(0, (w * v) / max), 2);
    if (extra > 0) g.lineStyle(2, UI.block, 1).strokeRect(x - 2, y - 2, w + 4, h + 4);
    t.setText(`${Math.max(0, v)}/${max}`);
  };
  return { g, t, set };
}
