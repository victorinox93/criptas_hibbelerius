import Phaser from 'phaser';
import { txt } from '../ui/widgets';

/**
 * Epílogos ilustrados: al vencer a Hibbelerius con un alma aliada, se dibuja
 * una pequeña escena con el alma (sprite `alma_<id>`) y un objeto propio.
 * Cada objeto se dibuja con rectángulos «pixelados» (P = tamaño de pixel).
 */
const P = 4;

type Dib = (s: Phaser.Scene, c: Phaser.GameObjects.Container, x: number, y: number) => void;

/** pinta rectángulos en unidades de pixel de arte */
function px(g: Phaser.GameObjects.Graphics, x: number, y: number, rects: [number, number, number, number, number][]) {
  for (const [cx, cy, w, h, col] of rects) g.fillStyle(col, 1).fillRect(x + cx * P, y + cy * P, w * P, h * P);
}

/** hoja de papel con texto */
function hoja(s: Phaser.Scene, c: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number, ang = 0) {
  const k = s.add.container(x, y).setAngle(ang);
  const g = s.add.graphics();
  g.fillStyle(0x2a2218, 1).fillRect(-w / 2 + 3, -h / 2 + 3, w, h);
  g.fillStyle(0xe8dcc0, 1).fillRect(-w / 2, -h / 2, w, h);
  g.lineStyle(1, 0xb8a888, 1);
  for (let ly = -h / 2 + 14; ly < h / 2 - 6; ly += 9) g.lineBetween(-w / 2 + 8, ly, w / 2 - 8, ly);
  k.add(g);
  c.add(k);
  return k;
}

function chispas(s: Phaser.Scene, c: Phaser.GameObjects.Container, x: number, y: number, color: number, n = 8) {
  for (let i = 0; i < n; i++) {
    const sp = s.add.rectangle(x + Phaser.Math.Between(-60, 60), y + Phaser.Math.Between(-40, 40), P, P, color).setAlpha(0);
    c.add(sp);
    s.tweens.add({ targets: sp, alpha: { from: 0, to: 1 }, y: sp.y - 20, duration: 900, yoyo: true, repeat: -1, delay: i * 180 });
  }
}

const DIBUJOS: Record<string, Dib> = {
  // Ícaro levanta su examen: un 10 en rojo
  icaro: (s, c, x, y) => {
    const h = hoja(s, c, x, y - 40, 92, 116, -8);
    h.add(txt(s, -38, -52, 'Examen', 14, '#3a3024'));
    h.add(txt(s, 6, -20, '10', 40, '#c83a3a').setOrigin(0.5, 0).setAngle(-10));
    const g = s.add.graphics();
    g.lineStyle(3, 0xc83a3a, 1).strokeCircle(6, 8, 30);
    h.add(g);
    s.tweens.add({ targets: h, y: y - 56, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    chispas(s, c, x, y - 40, 0xe8c15a);
  },
  // La ayudante recuerda su nombre: una vela y letras que flotan
  ayudante: (s, c, x, y) => {
    const g = s.add.graphics();
    px(g, x - 8, y - 20, [[0, 4, 4, 12, 0xe8dcc0], [1, 0, 2, 4, 0xe8c15a], [1, 1, 2, 2, 0xfff0a0], [-2, 16, 8, 2, 0x5a4a3a]]);
    c.add(g);
    const luz = s.add.circle(x, y - 14, 34, 0xe8c15a, 0.15);
    c.add(luz);
    s.tweens.add({ targets: luz, scale: 1.25, alpha: 0.05, duration: 800, yoyo: true, repeat: -1 });
    const letras = 'Me llamo…';
    [...letras].forEach((l, i) => {
      const t = txt(s, x - 54 + i * 12, y - 70, l, 20, '#9ad8f0').setAlpha(0);
      c.add(t);
      s.tweens.add({ targets: t, alpha: 1, y: y - 84, duration: 600, delay: 3400 + i * 140 });
    });
  },
  // Bernoulli: su máquina da una vuelta completa
  bernoulli: (s, c, x, y) => {
    const g = s.add.graphics();
    px(g, x - 6, y - 30, [[0, 0, 3, 10, 0x5a4a3a], [-4, 10, 11, 2, 0x3a3020]]);
    c.add(g);
    const rueda = s.add.container(x, y - 46);
    const r = s.add.graphics();
    r.lineStyle(5, 0x8a7a5a, 1).strokeCircle(0, 0, 40);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      r.lineStyle(3, 0x6a5a3a, 1).lineBetween(0, 0, Math.cos(a) * 40, Math.sin(a) * 40);
      r.fillStyle(0xc8f070, 1).fillCircle(Math.cos(a) * 40, Math.sin(a) * 40, 5);
    }
    r.fillStyle(0xe8c15a, 1).fillCircle(0, 0, 6);
    rueda.add(r);
    c.add(rueda);
    s.tweens.add({ targets: rueda, angle: 360, duration: 2400, delay: 3400, ease: 'Cubic.inOut', repeat: -1, repeatDelay: 2500 });
    const t = txt(s, x, y - 100, '¡ΔE = 0… casi!', 15, '#c8f070').setOrigin(0.5);
    c.add(t);
  },
  // Sir Radián: sin(90) en DEG = 1
  radian: (s, c, x, y) => {
    const k = s.add.container(x, y - 30);
    const g = s.add.graphics();
    g.fillStyle(0x1a1a22, 1).fillRoundedRect(-44, -64, 88, 128, 8);
    g.fillStyle(0x9ab89a, 1).fillRect(-34, -54, 68, 34);
    for (let fy = 0; fy < 4; fy++) for (let fx = 0; fx < 4; fx++) {
      g.fillStyle(fy === 3 && fx === 3 ? 0xff7a5a : 0x4a4a5a, 1).fillRect(-34 + fx * 18, -8 + fy * 17, 14, 12);
    }
    k.add(g);
    k.add(txt(s, -30, -54, 'DEG', 11, '#2a3a2a'));
    k.add(txt(s, 30, -54, 'sin(90)', 12, '#2a3a2a').setOrigin(1, 0));
    const uno = txt(s, 30, -40, '1', 20, '#1a2a1a').setOrigin(1, 0).setAlpha(0);
    k.add(uno);
    c.add(k);
    s.tweens.add({ targets: uno, alpha: 1, duration: 200, delay: 3400, yoyo: true, hold: 1600, repeat: -1, repeatDelay: 300 });
    chispas(s, c, x, y - 40, 0xff7a5a, 5);
  },
  // El Doctorando: tesis aprobada
  doctorando: (s, c, x, y) => {
    const g = s.add.graphics();
    g.fillStyle(0x3a2a1a, 1).fillRect(x - 56, y - 6, 112, 10);
    g.fillStyle(0x2a1810, 1).fillRect(x - 50, y + 4, 8, 40).fillRect(x + 42, y + 4, 8, 40);
    g.fillStyle(0x5a2a2a, 1).fillRect(x - 36, y - 26, 72, 20);
    g.fillStyle(0xe8dcc0, 1).fillRect(x - 34, y - 24, 68, 4);
    c.add(g);
    c.add(txt(s, x, y - 20, 'TESIS', 12, '#e8c15a').setOrigin(0.5, 0));
    const sello = txt(s, x, y - 64, 'APROBADA', 22, '#5ac86a').setOrigin(0.5).setAngle(-12).setStroke('#1a3a1a', 4).setScale(2.5).setAlpha(0);
    c.add(sello);
    s.tweens.add({ targets: sello, scale: 1, alpha: 1, duration: 260, delay: 3400, ease: 'Back.out', onComplete: () => s.cameras.main.shake(120, 0.004) });
    c.add(txt(s, x, y - 40, 'sin cambios', 14, '#9ad8f0').setOrigin(0.5));
  },
  // Sir Mañana: entrega a tiempo (reloj que se detiene antes de la hora)
  procrastinador: (s, c, x, y) => {
    const g = s.add.graphics();
    g.fillStyle(0x2a2a20, 1).fillCircle(x, y - 40, 40);
    g.lineStyle(4, 0xc8c8a0, 1).strokeCircle(x, y - 40, 40);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      g.fillStyle(0xc8c8a0, 1).fillRect(x + Math.cos(a) * 32 - 2, y - 40 + Math.sin(a) * 32 - 2, 4, 4);
    }
    c.add(g);
    const aguja = s.add.rectangle(x, y - 40, 4, 30, 0xe8c15a).setOrigin(0.5, 1).setAngle(-120);
    c.add(aguja);
    s.tweens.add({ targets: aguja, angle: -8, duration: 2600, delay: 800, ease: 'Cubic.out' });
    const ok = txt(s, x, y - 104, '✓ ENTREGADO 23:59', 16, '#5ac86a').setOrigin(0.5).setAlpha(0);
    c.add(ok);
    s.tweens.add({ targets: ok, alpha: 1, duration: 400, delay: 3400 });
  },
  // La Dama de los Decimales: g = 9.81 m/s² en el pizarrón, y firma
  decimales: (s, c, x, y) => {
    const g = s.add.graphics();
    g.fillStyle(0x5a3a22, 1).fillRect(x - 64, y - 96, 128, 92);
    g.fillStyle(0x1e2e24, 1).fillRect(x - 58, y - 90, 116, 80);
    g.fillStyle(0x5a3a22, 1).fillRect(x - 50, y - 4, 6, 40).fillRect(x + 44, y - 4, 6, 40);
    c.add(g);
    const formula = 'g = 9.81 m/s²';
    const t = txt(s, x - 50, y - 76, '', 18, '#f0e8ff');
    c.add(t);
    let i = 0;
    s.time.addEvent({ delay: 110, startAt: 0, repeat: formula.length - 1, callback: () => t.setText(formula.slice(0, ++i)) });
    const firma = txt(s, x + 50, y - 36, '— D.', 16, '#e8c15a').setOrigin(1, 0).setAlpha(0);
    c.add(firma);
    s.tweens.add({ targets: firma, alpha: 1, duration: 500, delay: 3600 });
  },
  // El Encadenado: levanta la mano y llega la respuesta (cadenas rotas + foco)
  duda: (s, c, x, y) => {
    const g = s.add.graphics();
    for (let i = 0; i < 4; i++) g.lineStyle(3, 0x6a6a7a, 1).strokeEllipse(x - 50 + i * 10, y + 4 + (i % 2) * 4, 10, 6);
    for (let i = 0; i < 4; i++) g.lineStyle(3, 0x6a6a7a, 1).strokeEllipse(x + 22 + i * 10, y + 8 - (i % 2) * 4, 10, 6);
    c.add(g);
    const foco = s.add.container(x, y - 50).setAlpha(0).setScale(0.4);
    const f = s.add.graphics();
    f.fillStyle(0xfff0a0, 0.25).fillCircle(0, 0, 36);
    f.fillStyle(0xfff0a0, 1).fillCircle(0, 0, 18);
    f.fillStyle(0x8a8a9a, 1).fillRect(-8, 16, 16, 12);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      f.lineStyle(3, 0xfff0a0, 1).lineBetween(Math.cos(a) * 26, Math.sin(a) * 26, Math.cos(a) * 36, Math.sin(a) * 36);
    }
    foco.add(f);
    c.add(foco);
    s.tweens.add({ targets: foco, alpha: 1, scale: 1, duration: 500, delay: 3400, ease: 'Back.out' });
    s.tweens.add({ targets: foco, y: y - 58, duration: 1000, delay: 4000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    c.add(txt(s, x, y - 112, '¡Ya entendí!', 16, '#9ad8f0').setOrigin(0.5));
  },
  // Sir Autocompleto: apaga la llama y escribe a mano «Lo verifiqué yo»
  autocompleto: (s, c, x, y) => {
    const h = hoja(s, c, x, y - 44, 104, 110, 4);
    const lineas = ['K = ½·m·v²', '= ½(2)(3)²', '= 9 J  ✓'];
    lineas.forEach((l, i) => {
      const t = txt(s, -42, -40 + i * 22, '', 15, '#2a2a3a');
      h.add(t);
      let k = 0;
      s.time.addEvent({ delay: 90, startAt: 0, repeat: l.length - 1, callback: () => t.setText(l.slice(0, ++k)) });
      t.setData('d', i);
    });
    const firma = txt(s, 46, 32, '— lo verifiqué yo', 12, '#3a5a8a').setOrigin(1, 0).setAlpha(0);
    h.add(firma);
    s.tweens.add({ targets: firma, alpha: 1, duration: 600, delay: 3600 });
    // la llama amarilla se apaga y queda humo
    const fl = s.add.ellipse(x - 130, y - 112, 16, 26, 0xffd21a, 0.9).setBlendMode(Phaser.BlendModes.ADD);
    c.add(fl);
    s.tweens.add({ targets: fl, scaleY: 0.2, scaleX: 0.4, alpha: 0, duration: 900, delay: 2600, ease: 'Quad.in' });
    for (let i = 0; i < 6; i++) {
      const humo = s.add.circle(x - 130, y - 112, 5, 0x8a8478, 0).setAlpha(0);
      c.add(humo);
      s.tweens.add({ targets: humo, y: y - 175, alpha: { from: 0.5, to: 0 }, scale: 2.5, duration: 1600, delay: 3300 + i * 260, repeat: -1, repeatDelay: 600 });
    }
  },
};

/**
 * Dibuja el epílogo del alma `id` centrado en (x, y) (y = el piso de la escena).
 * Devuelve el contenedor (aparece con un fundido) o null si no hay dibujo.
 */
export function epilogoAlma(s: Phaser.Scene, id: string, x: number, y: number) {
  const dib = DIBUJOS[id];
  if (!dib) return null;
  const c = s.add.container(0, 0).setAlpha(0);
  const suelo = s.add.ellipse(x, y + 2, 300, 26, 0x000000, 0.35);
  c.add(suelo);
  const alma = s.add.image(x - 70, y, `alma_${id}`).setOrigin(0.5, 1).setScale(3);
  c.add(alma);
  // el alma brinca de gusto
  s.tweens.add({ targets: alma, y: y - 10, duration: 260, delay: 3400, yoyo: true, repeat: 2, ease: 'Quad.out' });
  dib(s, c, x + 60, y - 10);
  s.tweens.add({ targets: c, alpha: 1, duration: 1400, delay: 1600 });
  return c;
}
