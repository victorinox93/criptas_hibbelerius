import Phaser from 'phaser';
import { W, H } from '../config';
import { vignette } from '../ui/widgets';
import { ABISMO_PAL, ABISMO_SPRITES } from './abismo_sprites';
import { MYTHOS_SPRITES } from './mythos_sprites';
import { makeTexture } from './sprites';

// ════════════════════════════════════════════════════════════════
//  EL ABISMO DE LOS EJES · arte del modo
//  Criaturas: tools/arte/abismo.py → abismo_sprites.ts
//  Aquí: retratos de los Ecos Quebrados y el fondo de la ciudad hundida.
// ════════════════════════════════════════════════════════════════

const mirror = (rows: string[]) => rows.map((r) => r + r.split('').reverse().join(''));

/** Retratos (busto) de los Ecos Quebrados: mismas letras que los ecos normales */
const FIG_ABISMO: Record<string, { rows: string[]; ov: Record<string, string> }> = {
  // Newton en 1693: la misma peluca, más gris; ojeras y la mirada verde del mercurio
  fig_newton1693: {
    rows: mirror([
      '...wwwww', '..wwwwww', '.wwwssss', '.wwsssss', '.wwskkss', '.wwsqqss', '.wwssssq', '.wwsssss',
      'wwwssqqq', 'www.ssss', 'ww...sss', 'w..ccccW', '..cccccW', '.ccccccW', 'cccccccW', 'cccccccc', 'cccccccc',
    ]),
    ov: { w: '#a8a49a', s: '#c8bca6', q: '#7a6a5e', k: '#4ab88a', c: '#2a2420', W: '#c8c0b0' },
  },
  // Georg Cantor: frente amplia y barba oscura y cerrada
  fig_cantor: {
    rows: mirror([
      '........', '....hhhh', '...hssss', '..hsssss', '..hsssss', '..hskkss', '..hsssss', '..bbssss',
      '..bbbbbb', '...bbbbb', '...bbbbb', '....bbbb', '..ccbbbb', '.cccccWW', 'ccccccWW', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#2a2018', b: '#2e241c', s: '#e0bea0', c: '#1a1a24', W: '#e8e4dc' },
  },
  // Ludwig Boltzmann: barba enorme, lentes redondos
  fig_boltzmann: {
    rows: mirror([
      '........', '....hhhh', '...hhhhh', '..hhssss', '..wsssss', '..wgGGgs', '..wsssss', '..wwssss',
      '..wwwwww', '..wwwwww', '...wwwww', '...wwwww', '..ccwwww', '.cccccww', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#4a3a2e', w: '#6a5a48', s: '#e0bea0', g: '#1a1a1a', G: '#9ab8c8', c: '#22222a' },
  },
  // v0.43 · El Astrónomo Aficionado de Providence (H. P. Lovecraft): cara larga y pálida,
  // mandíbula grande, pelo corto con raya, cuello alto y corbata
  fig_lovecraft: {
    rows: mirror([
      '........', '.....hhh', '....hhhh', '...hhsss', '...sssss', '...skkss', '...sssss', '...ssssq',
      '...sssss', '...qssss', '....ssss', '....qsss', '..cccWWt', '.ccccWWt', 'cccccWtt', 'cccccctt', 'cccccccc',
    ]),
    ov: { h: '#1e1a16', s: '#e8d6c2', q: '#b89c86', k: '#2a2a34', c: '#2a2a36', W: '#eeeae0', t: '#5a3040' },
  },  // v0.58 · el Astrónomo de cuerpo entero: traje gris, leyendo un libro (tools/arte/astronomo.py)
  fig_astronomo: {
    rows: [
      '...........kkkk...........',
      '..........kqhhhk..........',
      '..........khhhhhk.........',
      '.........khhhhhhhk........',
      '........khhsssssqhk.......',
      '........khssssssqhk.......',
      '........kssqsssqsqk.......',
      '........kssksssksqk.......',
      '........kssssqsssqk.......',
      '........kssssqsssqk.......',
      '........kssssssssqk.......',
      '.........kssqqqsqk........',
      '.........kssssssqk........',
      '.........kqssssqqk........',
      '.......kkkkssssqkkkk......',
      '......kCccCWWtWWCccCk.....',
      '.....kCCccCWtttWCccCCk....',
      '....kCCCDccWWtWWccDCCCk...',
      '....kCCCDccCWtWCccDCCCk...',
      '....kDCCDcccWtWcccDCCDk...',
      '....kDCCDcccCtCcccDCCDk...',
      '....kDCCDcccctccccDCCDk...',
      '....kDCCbppppBppppbCCDk...',
      '....kDCCbpPppBpPppbCCDk...',
      '....kDCCbppPpBppPpbCCDk...',
      '....kCCCbppppBppppbCCCk...',
      '....kCCCBbbbbBbbbbBCCCk...',
      '.....kcCCCscccccsCCCck....',
      '.....kcCcccccccccccCck....',
      '.....kcCcccccccccccCck....',
      '.....kcCcccccDcccccCck....',
      '.....kcCcccccccccccCck....',
      '.....kcCcccccccccccCck....',
      '.....kcCcccccDcccccCck....',
      '......kCcccccDcccccCk.....',
      '......kCccccDcDccccCk.....',
      '.......kkCccCkCccCkk......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '........kCccCkCccCk.......',
      '.......krnnnnkrnnnnk......',
      '.......knnnnnknnnnnk......',
      '........kkkkk.kkkkk.......',
    ],
    ov: { h: '#1e1a16', s: '#e8d6c2', q: '#b89c86', k: '#141018', c: '#6a6a76', C: '#44444e', D: '#2c2c34', W: '#eeeae0', t: '#6a2a3a', b: '#5a3420', B: '#3a2014', p: '#e8dcb8', P: '#b8a880', n: '#3a2a1e', r: '#9a7a5a' },
  },
};

/** Genera las texturas del modo (se llama desde generateAllTextures) */
export function generateAbismoTextures(scene: Phaser.Scene) {
  for (const [k, rows] of Object.entries(ABISMO_SPRITES)) makeTexture(scene, k, rows, ABISMO_PAL);
  for (const [k, rows] of Object.entries(MYTHOS_SPRITES)) makeTexture(scene, k, rows, ABISMO_PAL); // v0.51
  for (const [k, f] of Object.entries(FIG_ABISMO)) makeTexture(scene, k, f.rows, f.ov);
}

function rng(seed: number) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

/** Fondo: los Muelles Inclinados de una ciudad hundida, con agua que se mueve y geometría que no cierra */
export function abismoBackground(s: Phaser.Scene, seed = 5, boss = false) {
  const r = rng(seed);
  const g = s.add.graphics().setDepth(-10);
  // agua profunda en franjas (de verde a negro)
  const bandas = [0x0a1a18, 0x081614, 0x061210, 0x050e0d, 0x040a0a];
  bandas.forEach((c, i) => g.fillStyle(boss ? Phaser.Display.Color.IntegerToColor(c).darken(10).color : c, 1).fillRect(0, (i * H) / bandas.length, W, H / bandas.length + 1));
  // torres torcidas de la ciudad (ninguna es vertical)
  for (let i = 0; i < 7; i++) {
    const x = 40 + i * 140 + r() * 60;
    const w = 40 + r() * 50;
    const h = 120 + r() * 160;
    const lean = (r() - 0.5) * 60;
    g.fillStyle(0x0c201c, 0.9).fillPoints([
      new Phaser.Math.Vector2(x, 336), new Phaser.Math.Vector2(x + w, 336),
      new Phaser.Math.Vector2(x + w + lean, 336 - h), new Phaser.Math.Vector2(x + lean * 0.6, 336 - h - 20 * r()),
    ], true);
    // ventanas que brillan verde
    for (let k = 0; k < 3; k++) g.fillStyle(0x6af0a0, 0.12 + r() * 0.15).fillRect(x + 8 + r() * (w - 20) + lean * 0.4, 336 - 30 - r() * (h - 50), 4, 6);
  }
  // un triángulo imposible gigante al fondo
  const tri = s.add.graphics().setDepth(-9);
  const cx = W / 2 + (r() - 0.5) * 200, cy = 170, R = boss ? 150 : 110;
  const pts = [0, 1, 2].map((k) => new Phaser.Math.Vector2(cx + R * Math.cos(-Math.PI / 2 + (k * 2 * Math.PI) / 3), cy + R * Math.sin(-Math.PI / 2 + (k * 2 * Math.PI) / 3)));
  tri.lineStyle(10, boss ? 0x3a2058 : 0x16302a, 0.8).strokePoints(pts, true);
  tri.lineStyle(2, boss ? 0x9a6ad0 : 0x2c5a4e, 0.6).strokePoints(pts, true);
  s.tweens.add({ targets: tri, alpha: 0.4, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  // fórmulas que flotan como algas
  const eqs = ['x̄ = ΣxA/ΣA', 'I = Σm·r²', 'I = I₀ + m·d²', 'k = √(I/m)', 'ΣM = I·α', 'H = I·ω'];
  eqs.forEach((e, i) => {
    const t = s.add.text(50 + (i % 3) * 320 + r() * 60, 70 + Math.floor(i / 3) * 140 + r() * 30, e, { fontFamily: 'monospace', fontSize: '22px', color: boss ? '#3a2458' : '#163a30' }).setDepth(-8);
    s.tweens.add({ targets: t, y: t.y - 8, alpha: 0.35, duration: 2400 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  });
  // muelle de madera podrida, inclinado
  g.fillStyle(0x0a0d0c, 1).fillRect(0, 336, W, H - 336);
  g.lineStyle(2, 0x1c2a24, 0.9);
  for (let y = 346; y < H; y += 20) g.lineBetween(0, y + 6, W, y - 6);
  // burbujas que suben
  s.add.particles(0, 0, 'px', {
    x: { min: 0, max: W }, y: H, speedY: { min: -40, max: -18 }, speedX: { min: -6, max: 6 }, lifespan: 9000, frequency: 220,
    scale: { start: 1.2, end: 2.4 }, alpha: { start: 0.35, end: 0 }, tint: 0x9ad8c8,
  }).setDepth(-7);
  // luz que ondula desde arriba (cáusticas)
  for (let i = 0; i < 4; i++) {
    const l = s.add.ellipse(r() * W, 60, 300, 40, 0x6af0c0, 0.04).setDepth(-7).setBlendMode(Phaser.BlendModes.ADD);
    s.tweens.add({ targets: l, x: l.x + (r() < 0.5 ? -1 : 1) * 160, scaleX: 1.4, duration: 5000 + r() * 3000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }
  if (boss) {
    const ojo = s.add.circle(W - 210, 190, 140, 0x9a6ad0, 0.06).setBlendMode(Phaser.BlendModes.ADD).setDepth(-8);
    s.tweens.add({ targets: ojo, alpha: 0.02, scale: 1.12, duration: 1400, yoyo: true, repeat: -1 });
  }
  vignette(s);
  vignette(s);
}
