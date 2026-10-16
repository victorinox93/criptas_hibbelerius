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

/** traza una polilínea poco a poco (como si alguien la dibujara) */
function trazo(s: Phaser.Scene, k: Phaser.GameObjects.Container, pts: [number, number][], color: number, delay: number, dur: number, ancho = 3) {
  const g = s.add.graphics();
  k.add(g);
  const L: number[] = [];
  let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  const o = { t: 0 };
  s.tweens.add({
    targets: o, t: 1, delay, duration: dur, onUpdate: () => {
      g.clear().lineStyle(ancho, color, 1).beginPath().moveTo(pts[0][0], pts[0][1]);
      let resto = o.t * tot;
      for (let i = 1; i < pts.length; i++) {
        const d = L[i - 1];
        if (resto >= d) { g.lineTo(pts[i][0], pts[i][1]); resto -= d; continue; }
        const f = resto / d;
        g.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f);
        break;
      }
      g.strokePath();
    },
  });
  return g;
}

/** flecha horizontal o inclinada dibujada en g */
function flecha(g: Phaser.GameObjects.Graphics, x0: number, y0: number, x1: number, y1: number, color: number, ancho = 5) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  g.lineStyle(ancho, color, 1).lineBetween(x0, y0, x1 - Math.cos(a) * 8, y1 - Math.sin(a) * 8);
  g.fillStyle(color, 1).fillTriangle(x1, y1, x1 - Math.cos(a - 0.5) * 16, y1 - Math.sin(a - 0.5) * 16, x1 - Math.cos(a + 0.5) * 16, y1 - Math.sin(a + 0.5) * 16);
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
    s.time.addEvent({ delay: 110, startAt: 0, repeat: formula.length - 1, callback: () => { if (t.active) t.setText(formula.slice(0, ++i)); } });
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
      s.time.addEvent({ delay: 90, startAt: 0, repeat: l.length - 1, callback: () => { if (t.active) t.setText(l.slice(0, ++k)); } });
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
  // Sir Dextro: escribe el determinante en su escudo y la flecha de r×F aparece sola
  manco: (s, c, x, y) => {
    const esc = s.add.graphics();
    esc.fillStyle(0x1e2a38, 1).fillRoundedRect(x - 56, y - 140, 112, 128, 14);
    esc.fillStyle(0x3a4a5e, 1).fillRoundedRect(x - 50, y - 134, 100, 116, 12);
    esc.lineStyle(3, 0x7ad0ff, 0.8).strokeRoundedRect(x - 50, y - 134, 100, 116, 12);
    c.add(esc);
    const lineas = ['| i  j  k |', '| 2  1  0 |', '| 1  3  0 |', '= (6−1)k', '= +5k  ⊙'];
    lineas.forEach((l, i) => {
      const t = txt(s, x - 42, y - 128 + i * 20, '', 14, i < 3 ? '#e8e0d0' : '#7ad0ff');
      c.add(t);
      let k = 0;
      s.time.addEvent({ delay: 80, startAt: 0, repeat: l.length - 1, callback: () => { if (t.active) t.setText(l.slice(0, ++k)); } });
    });
    // la flecha de r×F «sale del plano»: un punto que crece (⊙)
    const punto = s.add.circle(x + 82, y - 120, 8, 0x7ad0ff, 0.9).setScale(0);
    const anillo = s.add.circle(x + 82, y - 120, 16).setStrokeStyle(3, 0x7ad0ff, 0.9).setScale(0);
    c.add([anillo, punto]);
    s.tweens.add({ targets: [punto, anillo], scale: 1, duration: 600, delay: 3600, ease: 'Back.out' });
    s.tweens.add({ targets: anillo, scale: 1.4, alpha: 0.3, duration: 900, delay: 4300, yoyo: true, repeat: -1 });
    c.add(txt(s, x + 82, y - 96, 'sale', 12, '#7ad0ff').setOrigin(0.5, 0));
    chispas(s, c, x, y - 80, 0x7ad0ff, 6);
  },
  // Fray Histéresis: dibuja su propio ciclo σ–ε; al descargar no vuelve al origen (queda la huella)
  histeresis: (s, c, x, y) => {
    const h = hoja(s, c, x, y - 72, 160, 136, -3);
    const ej = s.add.graphics();
    ej.lineStyle(2, 0x3a3024, 1).lineBetween(-64, 50, 70, 50).lineBetween(-64, 50, -64, -58);
    h.add(ej);
    h.add(txt(s, -76, -64, 'σ', 16, '#3a3024'));
    h.add(txt(s, 62, 50, 'ε', 16, '#3a3024'));
    const P2 = (u: number, v: number): [number, number] => [-64 + u * 124, 50 - v * 100];
    trazo(s, h, [P2(0, 0), P2(0.3, 0.6), P2(0.45, 0.74), P2(0.62, 0.82), P2(0.8, 0.86)], 0xc83a3a, 2600, 1500);
    trazo(s, h, [P2(0.8, 0.86), P2(0.37, 0)], 0x3a5a8a, 4200, 900);
    const marca = s.add.circle(P2(0.37, 0)[0], P2(0.37, 0)[1], 7).setStrokeStyle(3, 0xc83a3a).setAlpha(0);
    const et = txt(s, P2(0.37, 0)[0] + 12, 34, 'huella', 13, '#c83a3a').setOrigin(0, 0.5).setAlpha(0);
    h.add([marca, et]);
    s.tweens.add({ targets: [marca, et], alpha: 1, duration: 500, delay: 5200 });
    h.add(txt(s, -40, -56, 'carga', 12, '#c83a3a').setAlpha(0.9));
    h.add(txt(s, 22, -10, 'descarga', 12, '#3a5a8a').setAlpha(0.9));
  },
  // Sir Cebollín: empuja su proyecto; nada… nada… hasta superar μs·N, y entonces se desliza
  cebollin: (s, c, x, y) => {
    const g0 = s.add.graphics();
    g0.fillStyle(0x3a3020, 1).fillRect(x - 100, y - 4, 196, 6);
    for (let i = 0; i < 13; i++) g0.fillStyle(0x5a4a3a, 1).fillRect(x - 96 + i * 15, y + 2, 8, 3);
    c.add(g0);
    const caja = s.add.container(x - 10, y - 26);
    const cg = s.add.graphics();
    px(cg, -24, -20, [[0, 0, 12, 11, 0x8a6a3a], [0, 0, 12, 1, 0xa88a5a], [0, 10, 12, 1, 0x5a4020], [5, 0, 2, 11, 0x6a5030]]);
    caja.add([cg, txt(s, 0, -28, 'Proyecto', 12, '#e8dcc0').setOrigin(0.5, 1)]);
    c.add(caja);
    const fg = s.add.graphics();
    c.add(fg);
    const lab = txt(s, x - 50, y - 50, '', 15, '#e8e0d0').setOrigin(0.5);
    const reg = txt(s, x + 30, y - 120, 'f ≤ μs·N = 12', 14, '#9ad8f0').setOrigin(0.5);
    c.add([lab, reg]);
    const o = { f: 0 };
    s.tweens.add({
      targets: o, f: 14, delay: 2600, duration: 2600, onUpdate: () => {
        const F = Math.floor(o.f / 2) * 2;
        fg.clear();
        flecha(fg, caja.x - 34 - 6 - F * 4, y - 26, caja.x - 34, y - 26, 0xe8c15a);
        lab.setText(`F = ${F}`).setColor(F > 12 ? '#7fc87a' : '#e8e0d0');
      },
      onComplete: () => {
        reg.setText('μk < μs: ¡ya se mueve!').setColor('#7fc87a');
        s.tweens.add({
          targets: caja, x: x + 50, duration: 900, ease: 'Quad.in', onUpdate: () => {
            fg.clear();
            flecha(fg, caja.x - 34 - 62, y - 26, caja.x - 34, y - 26, 0xe8c15a);
          },
          onComplete: () => {
            const sello = txt(s, caja.x, y - 24, 'ENTREGADO', 18, '#c83a3a').setOrigin(0.5).setAngle(-12).setScale(2).setAlpha(0);
            c.add(sello);
            s.tweens.add({ targets: sello, scale: 1, alpha: 1, duration: 300, ease: 'Back.out' });
          },
        });
      },
    });
  },
  // Sir Helios: un sol sube detrás de él, y los Joules que sobraban vuelan hacia él
  helios: (s, c, x, y) => {
    const halo = s.add.circle(x, y - 20, 58, 0xffd21a, 0.12);
    const rayos = s.add.container(x, y - 20);
    const rg = s.add.graphics();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      rg.fillStyle(0xffb020, 1).fillTriangle(Math.cos(a - 0.12) * 34, Math.sin(a - 0.12) * 34, Math.cos(a + 0.12) * 34, Math.sin(a + 0.12) * 34, Math.cos(a) * (i % 2 ? 48 : 58), Math.sin(a) * (i % 2 ? 48 : 58));
    }
    rayos.add(rg);
    const sol = s.add.circle(x, y - 20, 30, 0xffd21a);
    const cara = s.add.graphics();
    px(cara, x - 10, y - 30, [[0, 0, 1, 2, 0xa86a10], [4, 0, 1, 2, 0xa86a10], [0, 4, 1, 1, 0xa86a10], [1, 5, 3, 1, 0xa86a10], [4, 4, 1, 1, 0xa86a10]]);
    const sube = [halo, rayos, sol, cara];
    c.add(sube);
    s.tweens.add({ targets: sube, y: '-=40', duration: 2000, delay: 1800, ease: 'Sine.out' });
    s.tweens.add({ targets: rayos, angle: 360, duration: 12000, repeat: -1 });
    s.tweens.add({ targets: halo, scale: 1.3, alpha: 0.05, duration: 1100, yoyo: true, repeat: -1 });
    for (let i = 0; i < 6; i++) {
      const j = txt(s, x + Phaser.Math.Between(-90, 90), y + 4, 'J', 18, '#ffd21a').setOrigin(0.5).setAlpha(0);
      c.add(j);
      s.tweens.add({ targets: j, x, y: y - 60, alpha: { from: 1, to: 0 }, duration: 1200, delay: 4000 + i * 250, repeat: -1, repeatDelay: 900, ease: 'Quad.in' });
    }
    const lema = txt(s, x, y - 130, '¡Alabado sea!', 20, '#ffd21a').setOrigin(0.5).setAlpha(0);
    c.add(lema);
    s.tweens.add({ targets: lema, alpha: 1, duration: 700, delay: 4400 });
  },
  // Parches: abre su cofre y te regresa tus Ergios… casi todos (uno vuelve a su bolsillo)
  parches: (s, c, x, y) => {
    const cof = s.add.graphics();
    px(cof, x - 28, y - 30, [[0, 0, 14, 8, 0x6a4a2a], [0, 0, 14, 1, 0x8a6a3a], [0, 3, 14, 1, 0xa8873a], [6, 2, 2, 3, 0xe8c15a]]);
    c.add(cof);
    const tapa = s.add.container(x - 28, y - 30);
    const tg = s.add.graphics();
    px(tg, 0, -16, [[0, 0, 14, 4, 0x7a5a32], [0, 0, 14, 1, 0xa88a5a]]);
    tapa.add(tg);
    c.add(tapa);
    s.tweens.add({ targets: tapa, angle: -35, duration: 500, delay: 2600, ease: 'Back.out' });
    const brillo = s.add.ellipse(x, y - 34, 50, 14, 0xc8f070, 0).setBlendMode(Phaser.BlendModes.ADD);
    c.add(brillo);
    s.tweens.add({ targets: brillo, fillAlpha: 0.5, duration: 400, delay: 2900, yoyo: true, repeat: -1, repeatDelay: 300 });
    const n = 8;
    for (let i = 0; i < n; i++) {
      const vuelve = i === n - 1;
      const m = s.add.circle(x, y - 34, 6, 0xc8f070).setStrokeStyle(2, 0x5a7a20).setAlpha(0);
      c.add(m);
      const dx = vuelve ? -150 : 30 + i * 6;
      const o = { t: 0 };
      s.tweens.add({
        targets: o, t: 1, duration: 800, delay: 3100 + i * 180,
        onStart: () => m.setAlpha(1),
        onUpdate: () => { m.x = x + dx * o.t; m.y = y - 34 - 70 * 4 * o.t * (1 - o.t) + (vuelve ? 0 : 30 * o.t); },
        onComplete: () => { if (vuelve) m.destroy(); },
      });
    }
    const cuenta = txt(s, x + 30, y - 132, '+ 38 de 40 Ergios', 16, '#c8f070').setOrigin(0.5).setAlpha(0);
    const nota = txt(s, x + 30, y - 112, '(comisión: 2)', 12, '#a8a088').setOrigin(0.5).setAlpha(0);
    c.add([cuenta, nota]);
    s.tweens.add({ targets: [cuenta, nota], alpha: 1, duration: 600, delay: 5000 });
  },
  // Hanbei: tres vasijas de energía que suben y bajan, pero la suma no cambia; caen pétalos
  hanbei: (s, c, x, y) => {
    const g = s.add.graphics();
    c.add(g);
    const tot = txt(s, x - 16, y - 126, 'ΣE = 90 J', 20, '#e8c15a').setOrigin(0.5);
    const vals = [0, 1, 2].map((i) => txt(s, x - 54 + i * 54, y - 4, '', 14, '#e8e0d0').setOrigin(0.5, 0));
    c.add([tot, ...vals]);
    const o = { f: 0 };
    s.tweens.add({
      targets: o, f: Math.PI * 2, duration: 4200, repeat: -1, delay: 1600, onUpdate: () => {
        g.clear();
        const Es = [0, 1, 2].map((i) => 30 + 18 * Math.sin(o.f + (i * 2 * Math.PI) / 3));
        const r0 = Math.round(Es[0]), r1 = Math.round(Es[1]);
        const rs = [r0, r1, 90 - r0 - r1]; // así la suma en pantalla siempre da 90
        [0, 1, 2].forEach((i) => {
          const E = Es[i];
          const bx = x - 70 + i * 54;
          g.fillStyle(0x1a1620, 1).fillRect(bx, y - 110, 32, 104);
          g.fillStyle(0xe8c15a, 0.9).fillRect(bx + 3, y - 9 - E * 2, 26, E * 2);
          g.lineStyle(2, 0x8a7a5a, 1).strokeRect(bx, y - 110, 32, 104);
          vals[i].setText(`${rs[i]}`);
        });
      },
    });
    for (let i = 0; i < 10; i++) {
      const p = s.add.rectangle(x + Phaser.Math.Between(-150, 120), y - 190, P + 1, P, 0xf0a0c0).setAlpha(0.9);
      c.add(p);
      s.tweens.add({ targets: p, y: y, x: p.x + Phaser.Math.Between(20, 60), angle: 360, duration: Phaser.Math.Between(3200, 4800), delay: i * 420, repeat: -1 });
    }
  },
  // Gough: dispara a 45° sin ver; la flecha sigue la parábola de alcance máximo y da en el blanco
  gough: (s, c, x, y) => {
    const x0 = x - 100, y0 = y - 24, R = 150;
    const xb = x0 + R;
    const blanco = s.add.graphics();
    [[16, 0xe8e0d0], [12, 0xc83a3a], [8, 0xe8e0d0], [4, 0xc83a3a]].forEach(([r, col]) => blanco.fillStyle(col, 1).fillCircle(xb, y0, r));
    blanco.fillStyle(0x5a4a3a, 1).fillRect(xb - 2, y0 + 16, 4, 20);
    c.add(blanco);
    const ang = s.add.graphics();
    ang.lineStyle(2, 0x9ad8f0, 0.8).lineBetween(x0, y0, x0 + 50, y0).lineBetween(x0, y0, x0 + 36, y0 - 36);
    ang.beginPath().arc(x0, y0, 26, -Math.PI / 4, 0).strokePath();
    c.add([ang, txt(s, x0 + 30, y0 - 18, '45°', 13, '#9ad8f0')]);
    const pts: [number, number][] = [];
    for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([x0 + R * u, y0 - R * u * (1 - u)]); }
    trazo(s, c, pts, 0x8a8478, 2800, 1300, 2).setAlpha(0.7);
    const fl = s.add.rectangle(x0, y0, 18, 3, 0xe8dcc0).setAlpha(0);
    c.add(fl);
    const o = { u: 0 };
    s.tweens.add({
      targets: o, u: 1, delay: 2800, duration: 1300, onStart: () => fl.setAlpha(1),
      onUpdate: () => { fl.x = x0 + R * o.u; fl.y = y0 - R * o.u * (1 - o.u); fl.setRotation(Math.atan(-(1 - 2 * o.u))); },
      onComplete: () => {
        fl.setPosition(xb - 6, y0).setRotation(0);
        chispas(s, c, xb, y0, 0xe8c15a, 6);
        const t = txt(s, xb, y0 - 54, '¡Blanco!', 18, '#e8c15a').setOrigin(0.5);
        c.add(t);
      },
    });
    c.add(txt(s, x + 10, y - 118, 'R = v²·sen 2θ / g', 15, '#e8e0d0').setOrigin(0.5));
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
