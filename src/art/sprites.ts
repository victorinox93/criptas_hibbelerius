import Phaser from 'phaser';
import { PAL } from './palette';

// Cada sprite es una matriz de caracteres; cada carácter es un color de la paleta.
// '.' = transparente. Las filas cortas se rellenan con transparente.

const KNIGHT_BODY = [
  '.....kkllkk..........',
  '....kllllllk.........',
  '...klllllgllk...kkk..',
  '...kllkkkkkgk..kgggk.',
  '...klkEkkEklk.kglggk.',
  '...kllllllggkkkggggk.',
  '....kgllllgk...kgggk.',
  '...kCkkddkkCk...kkk..',
  '..kCclllllllk..kn....',
  '..kCcllgyglllkkn.....',
  '.kCCcllyyyllllkk.....',
  '.kCCclllgllllk.......',
  '.kCCcklllllk.........',
  '.kCCckggggk..........',
  '.kCCkkdddkk..........',
  '..kCkdkkkdk..........',
  '...kkdk.kdk..........',
  '....kdk.kdk..........',
  '...kkkk.kkkk.........',
];

const HELMS: Record<string, string[]> = {
  penacho: ['......kkk...', '.....kccCk..', '......kcck..'],
  cuernos: ['..k.......k.', '..kwk...kwk.', '...kwk.kwk..'],
  corona: ['............', '....k.k.k...', '....kykykk..'],
};

export function knightMatrix(helm: string): string[] {
  return [...(HELMS[helm] ?? HELMS.penacho), ...KNIGHT_BODY];
}

function mirrorHalf(rows: string[]): string[] {
  return rows.map((r) => r + r.split('').reverse().join(''));
}

export const SPRITES: Record<string, string[]> = {
  skeleton: mirrorHalf([
    '.....kkk',
    '....kwww',
    '...kwwww',
    '...kwkkw',
    '...kwkFk',
    '...kwwwk',
    '....kwkw',
    '.....kww',
    '...kkkww',
    '..kwkwkk',
    '..kwkkww',
    '..kwkwkk',
    '..kk.kww',
    '..kk..kw',
    '.....kww',
    '.....kwk',
    '.....kw.',
    '.....kw.',
    '....kkw.',
  ]),
  slime: mirrorHalf([
    '......kkk',
    '....kkLLL',
    '...kLLLLL',
    '..kLLwLLL',
    '..kLwwLLL',
    '.kLLLLkkL',
    '.kLLLLkFk',
    '.kLLLLLLL',
    '.kGLLLLkk',
    'kGGLLLLLL',
    'kGGGGLLLL',
    'kGGGGGGGG',
    '.kkkkkkkk',
  ]),
  bat: mirrorHalf([
    'k.......',
    'kk....k.',
    'kpk...kk',
    'kppk.kpp',
    'kpppkpFp',
    '.kpppppp',
    '..kppkpp',
    '...kk.kw',
    '......kk',
  ]),
  colossus: mirrorHalf([
    '..........kkkkk',
    '........kkggggg',
    '.......kgggdggg',
    '......kggglllll',
    '......kglkkkkll',
    '......kglkEEEkl',
    '......kgglkkkll',
    '.......kgglllll',
    '....kkkkkgdkkkk',
    '..kkggggggkdooo',
    '.kgglllgggkdooy',
    '.kglllllggkdooo',
    'kgglllllgggkddd',
    'kglllllggggdkkk',
    'kglllllgggdgggg',
    'kgglllgggdggggl',
    '.kgggggkkdggggl',
    '.kgllgk.kdgggll',
    '.kglllk.kdggggg',
    '.kglllk..kdgggg',
    '.kgglgk..kddddd',
    '..kkkk...kdgggk',
    '.........kgggk.',
    '........kgllgk.',
    '........kglggk.',
    '.......kgglgk..',
    '.......kggggk..',
    '......kkkkkkk..',
  ]),
  wizard: mirrorHalf([
    '..........kk',
    '.........kpp',
    '........kppp',
    '.......kpppp',
    '......kppppp',
    '......kpppkk',
    '.....kppkkkk',
    '.....kppkkFk',
    '.....kppkkkk',
    '.....kpppkkk',
    '....kppppppw',
    '...kpppppwww',
    '..kpPppppwww',
    '..kpPpppkwww',
    '.kppPppkyyyy',
    '.kppPppkynny',
    '.kpppPpkynnn',
    '.kppppPkyyyy',
    'kpppppPppppp',
    'kppppppPpppp',
    'kpppppppPppp',
    'kkkkkkkkkkkk',
  ]),
  // ── Íconos 9x9 ──
  i_combat: [
    'k.......k',
    'kl.....lk',
    '.kl...lk.',
    '..kl.lk..',
    '...klk...',
    '..kl.lk..',
    '.nk...kn.',
    'nn.....nn',
    'n.......n',
  ],
  i_elite: [
    'w.......w',
    'wk.....kw',
    '.wkkkkkw.',
    '.kwwwwwk.',
    'kwFkwkFwk',
    'kwwwkwwwk',
    '.kwkwkwk.',
    '..kwkwk..',
    '...kkk...',
  ],
  i_fire: [
    '....o....',
    '...oyo...',
    '..oyyo...',
    '..oyyyo..',
    '.oyywyyo.',
    '.oywwwyo.',
    '..oyyyo..',
    'nnkkkkknn',
    '.nn...nn.',
  ],
  i_rune: [
    '..kkkkk..',
    '.kpPPPpk.',
    'kpPkPkPpk',
    'kpPPkPPpk',
    'kpPPkPPpk',
    'kpPkPkPpk',
    'kpPPPPPpk',
    '.kpPPPpk.',
    '..kkkkk..',
  ],
  i_boss: [
    'y.y.y.y.y',
    'yyyyyyyyy',
    'kgggggggk',
    'kglllllgk',
    'kglEkElgk',
    'kgllllllk',
    'kgkdkdkgk',
    '.kgggggk.',
    '..kkkkk..',
  ],
  i_heart: [
    '.RR...RR.',
    'RRRR.RRRR',
    'RRwRRRRRR',
    'RRRRRRRRR',
    '.RRRRRRR.',
    '..RRRRR..',
    '...RRR...',
    '....R....',
  ],
  i_shield: [
    'kkkkkkkkk',
    'kBBBBBBBk',
    'kBlBBBBBk',
    'kBBBBBBBk',
    'kBBBBBBBk',
    '.kBBBBBk.',
    '..kBBBk..',
    '...kBk...',
    '....k....',
  ],
  i_sword: [
    '.......lk',
    '......lk.',
    '.....lk..',
    '....lk...',
    '.y.lk....',
    '..yk.....',
    '.nky.....',
    'nk..y....',
    'k........',
  ],
  i_mass: [
    '...kkk...',
    '..k...k..',
    '..kkkkk..',
    '.kgggggk.',
    '.kglgggk.',
    'kgglggggk',
    'kgggggggk',
    'kgggggggk',
    '.kkkkkkk.',
  ],
  i_bolt: [
    '....yyk..',
    '...yyk...',
    '..yyk....',
    '.yyyyyy..',
    '....yyk..',
    '...yyk...',
    '..yyk....',
    '.yk......',
    'k........',
  ],
  i_wind: [
    '.........',
    'BBBBBB...',
    '......B..',
    'BBBBBBB..',
    '.........',
    'BBBBBBBB.',
    '........B',
    'BBBBB...B',
    '.....BBB.',
  ],
  i_angle: [
    'k........',
    'kR.......',
    'k.R......',
    'k..R.....',
    'ky..R....',
    'k.y..R...',
    'k..y..R..',
    'k...y..R.',
    'kkkkkkkkk',
  ],
  i_anvil: [
    '.........',
    'kkkkkkkk.',
    'kllllllgk',
    '.kgggggk.',
    '...kgk...',
    '...kgk...',
    '..kgggk..',
    '.kgggggk.',
    '.kkkkkkk.',
  ],
  i_reflect: [
    '...k.....',
    '..kRk....',
    '.kRRRk...',
    '...R...B.',
    '...R...B.',
    '...R...B.',
    '...kBBBk.',
    '....kBk..',
    '.....k...',
  ],
  i_boots: [
    '..kkk....',
    '..knk....',
    '..knk....',
    '..knk....',
    '..knnk...',
    '.knnnnkk.',
    'knnnnnnnk',
    'kkkkkkkkk',
    'g.g.g.g.g',
  ],
  i_crystal: [
    '....k....',
    '...kBk...',
    '..kBwBk..',
    '..kBBBk..',
    '.kBBwBBk.',
    '..kBBBk..',
    '..kBBBk..',
    '...kBk...',
    '....k....',
  ],
  i_gaunt: [
    '.k.k.k...',
    'kgkgkgk..',
    'kgkgkgk..',
    'kgggggkk.',
    'kggggggk.',
    'kgggggk..',
    '.kyyyk...',
    '.kgggk...',
    '.kkkkk...',
  ],
  i_stun: [
    '.y.....y.',
    '..y...y..',
    '...yyy...',
    'yyyEyEyyy',
    '...yyy...',
    '..y...y..',
    '.y.....y.',
    '.........',
    '.........',
  ],
  i_momentum: [
    '.........',
    'RR.......',
    '.RR..RR..',
    '..RR..RR.',
    '...RR..RR',
    '..RR..RR.',
    '.RR..RR..',
    'RR.......',
    '.........',
  ],
  i_mud: [
    '.........',
    '.........',
    '...LL....',
    '..LGGL.L.',
    '.LGGGGLGL',
    'LGGGGGGGG',
    'GGGGGGGGG',
    '.........',
    '.........',
  ],
  i_skull: [
    '.kkkkkkk.',
    'kwwwwwwwk',
    'kwkkwkkwk',
    'kwkFwkFwk',
    'kwwwkwwwk',
    '.kwwwwwk.',
    '.kwkwkwk.',
    '..kkkkk..',
    '.........',
  ],
};

/** Dibuja una matriz como textura. Permite sustituir colores (p. ej. capa). */
export function makeTexture(
  scene: Phaser.Scene,
  key: string,
  rows: string[],
  overrides: Record<string, string> = {},
  flip = false,
) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  let canvas: Phaser.Textures.CanvasTexture;
  const existing = scene.textures.exists(key) ? scene.textures.get(key) : null;
  if (existing instanceof Phaser.Textures.CanvasTexture && existing.width === w && existing.height === h) {
    canvas = existing;
    canvas.getContext().clearRect(0, 0, w, h);
  } else {
    if (existing) scene.textures.remove(key);
    canvas = scene.textures.createCanvas(key, w, h)!;
  }
  const ctx = canvas.getContext();
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = overrides[ch] ?? PAL[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }
  });
  canvas.refresh();
}

export function makeKnight(scene: Phaser.Scene, key: string, helm: string, cape: { c: string; C: string }) {
  makeTexture(scene, key, knightMatrix(helm), { c: cape.c, C: cape.C });
}

export function generateAllTextures(scene: Phaser.Scene) {
  for (const [k, rows] of Object.entries(SPRITES)) {
    makeTexture(scene, k, rows);
  }
  // Caballero Inerte (élite): armadura oscura, mirando a la izquierda
  makeTexture(scene, 'inertKnight', knightMatrix('cuernos'), {
    l: '#4b4458', g: '#2f2a38', c: '#5e1420', C: '#3a0c14', E: '#ff5a3a', y: '#8b1e2b',
  }, true);
  // pixel blanco para partículas
  if (!scene.textures.exists('px')) {
    const c = scene.textures.createCanvas('px', 2, 2)!;
    c.getContext().fillStyle = '#ffffff';
    c.getContext().fillRect(0, 0, 2, 2);
    c.refresh();
  }
}
