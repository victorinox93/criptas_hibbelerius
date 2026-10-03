import Phaser from 'phaser';
import { ARMORS, CAPES, PAL, VISORS } from './palette';

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
  gargola: mirrorHalf([
    'k.......',
    'gk......',
    'ggk...kk',
    'gggk.kgg',
    'kgggkggl',
    '.kggkgFl',
    '.kgggggg',
    '..kgkggk',
    '...kgggg',
    '...kglgg',
    '..kggggg',
    '..kgglgg',
    '..kggggk',
    '...kgg.k',
    '..kggk..',
    '..kkkk..',
  ]),
  pendulo: mirrorHalf([
    '....kkkk',
    '......kl',
    '.......l',
    '......kl',
    '.......l',
    '......kl',
    '.......l',
    '......kl',
    '.......l',
    '......kl',
    '.......l',
    '......kl',
    '.......l',
    '......kl',
    '.......l',
    '......kl',
    '....kkkk',
    '...kgggg',
    '..kgglll',
    '..kglyyy',
    '..kgllyE',
    '..kglyyy',
    '..kgglll',
    '...kgggg',
    '....kkkk',
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
  i_event: [
    '..kkkkk..',
    '.kpPPPpk.',
    'kpPkkkPpk',
    'kpkPPkPpk',
    '.kPPPkPk.',
    '..kPkPk..',
    '...kPk...',
    '...kkk...',
    '...kPk...',
  ],
  i_coin: [
    '..kkkkk..',
    '.kyyyyyk.',
    'kyywwyyyk',
    'kywyyyyyk',
    'kyyyoyyyk',
    'kyyyyyyok',
    'kyyyyyook',
    '.koooook.',
    '..kkkkk..',
  ],
  i_bag: [
    '...kkk...',
    '..knnnk..',
    '...kyk...',
    '..knnnk..',
    '.knnnnnk.',
    'knnyyynnk',
    'knnynnnnk',
    'knnnnnnnk',
    '.kkkkkkk.',
  ],
  i_tired: [
    '.........',
    '.BBBB....',
    '...B.....',
    '..B......',
    '.BBBB.BBB',
    '.......B.',
    '......B..',
    '.....BBB.',
    '.........',
  ],
  i_feather: [
    '.......lk',
    '......llk',
    '.....lwlk',
    '....lwlk.',
    '...lwlk..',
    '..lwlk...',
    '.lllk....',
    'kk.......',
    'k........',
  ],
  i_fog: [
    '.........',
    '.lllll...',
    'lllllll..',
    '....lllll',
    '.........',
    '..lllllll',
    'llllll...',
    '...lllll.',
    '.........',
  ],
  i_lantern: [
    '...kkk...',
    '...k.k...',
    '..kkkkk..',
    '.kgyyygk.',
    '.kyywyyk.',
    '.kyyyyyk.',
    '.kgyyygk.',
    '..kkkkk..',
    '.........',
  ],
  i_note: [
    '...wwwwww',
    '...wwwwww',
    '...w....w',
    '...w....w',
    '...w....w',
    '.www..www',
    'wwww.wwww',
    'wwww.wwww',
    '.ww...ww.',
  ],
  i_full: [
    'wwww.wwww',
    'w.......w',
    'w.......w',
    'w.......w',
    '.........',
    'w.......w',
    'w.......w',
    'w.......w',
    'wwww.wwww',
  ],
  i_apple: [
    '....n....',
    '...nG....',
    '.RRRnRR..',
    'RRwRRRRR.',
    'RwRRRRRRR',
    'RRRRRRRRR',
    'RRRRRRRRk',
    '.RRRRRRk.',
    '..RRkRk..',
  ],
  i_pend: [
    'kkkkkkkkk',
    '....l....',
    '....l....',
    '.....l...',
    '.....l...',
    '......l..',
    '.....yyy.',
    '.....yyy.',
    '.........',
  ],
  i_shrine: [
    '....y....',
    '...yBy...',
    '..yBwBy..',
    '...yBy...',
    '.k..y..k.',
    '.kl...lk.',
    '.kl...lk.',
    '.kl...lk.',
    'kkkkkkkkk',
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

export function makeKnight(
  scene: Phaser.Scene, key: string, helm: string, cape: { c: string; C: string },
  armor: { l: string; g: string } = { l: PAL.l, g: PAL.g }, visor = PAL.E,
) {
  makeTexture(scene, key, knightMatrix(helm), { c: cape.c, C: cape.C, l: armor.l, g: armor.g, E: visor });
}

/** Dibuja el héroe del perfil actual en la textura 'hero' */
export function makeHeroFromAvatar(scene: Phaser.Scene, av: { helm: string; cape: number; armor?: number; visor?: number }) {
  makeKnight(scene, 'hero', av.helm, CAPES[av.cape] ?? CAPES[0], ARMORS[av.armor ?? 0], VISORS[av.visor ?? 0].c);
}

const NPC = mirrorHalf([
  '.....kkk',
  '....kccc',
  '...kcccc',
  '...kccCk',
  '..kccCkk',
  '..kcCkkE',
  '..kcCkkk',
  '..kccCkk',
  '.kcccCCk',
  '.kccccCC',
  'kcccccsC',
  'kccccCss',
  'kcccccCC',
  'kccccccC',
  'kcccccCc',
  'kccccccC',
  'kcccccCC',
  'kkkkkkkk',
]);

// Retratos de figuras históricas (busto)
const FIG: Record<string, { rows: string[]; ov: Record<string, string> }> = {
  fig_newton: {
    rows: mirrorHalf([
      '...wwwww', '..wwwwww', '.wwwssss', '.wwsssss', '.wwskkss', '.wwsssss', '.wwssssq', '.wwsssss',
      'wwwssqqq', 'www.ssss', 'ww...sss', 'w..ccccW', '..cccccW', '.ccccccW', 'cccccccW', 'cccccccc', 'cccccccc',
    ]),
    ov: { w: '#e4e0d8', s: '#e0c0a0', q: '#b8907a', c: '#4a3428', W: '#f0ece4' },
  },
  fig_galileo: {
    rows: mirrorHalf([
      '........', '....hhhh', '...hssss', '..hsssss', '..hskkss', '..hsssss', '..hssssq', '..hbssss',
      '...bbbqq', '...bbbbb', '....bbbb', '..ccccbb', '.cccccWW', 'ccccccWW', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#5a4a3a', b: '#8a7a6a', s: '#d8b090', q: '#a8806a', c: '#1e1a22', W: '#e8e4dc' },
  },
  fig_chatelet: {
    rows: mirrorHalf([
      '....wwww', '...wwwww', '...wwwww', '..wwwwww', '..wwssss', '..wsssss', '..wskkss', '..wsssss',
      '..wssssq', '...sssss', '...yssRR', '....ssss', '.....sss', '..ccssss', '.cccssss', 'ccccccss', 'cccccccy',
    ]),
    ov: { w: '#dcd8e4', s: '#ecd0b8', q: '#c0a090', c: '#3a5a8a', R: '#b05a6a', y: '#e8c15a' },
  },
  fig_joule: {
    rows: mirrorHalf([
      '....hhhh', '...hhhhh', '..hhssss', '..hsssss', '..hskkss', '..bsssss', '..bssssq', '..bbssss',
      '..bbssqq', '...bbsss', '....bsss', '...ccckk', '..ccccWk', '.cccccWW', 'ccccccWc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#4a3a2e', b: '#5a463a', s: '#e0bea0', q: '#b08e78', c: '#2a2a36', W: '#e8e4dc' },
  },
};

export const NPCS: Record<string, Record<string, string>> = {
  npc_ermitano: { c: '#5b4632', C: '#33261a', E: '#ffd27a', s: '#c8a07a' },
  npc_cartografa: { c: '#2f5a5a', C: '#183333', E: '#d8d0c0', s: '#c8a07a' },
  npc_herrero: { c: '#3a2f2a', C: '#1e1714', E: '#ff9a4a', s: '#a87a5a' },
  npc_estatua: { c: '#7a7684', C: '#4a4656', E: '#e8f4ff', s: '#7a7684', k: '#1a1820' },
  npc_coleccionista: { c: '#4a2a5e', C: '#28153a', E: '#b8f0d0', s: '#c8a07a' },
  npc_mercader: { c: '#5e3a1a', C: '#33200e', E: '#e8c15a', s: '#d8b08a' },
};

export function generateAllTextures(scene: Phaser.Scene) {
  for (const [k, rows] of Object.entries(SPRITES)) {
    makeTexture(scene, k, rows);
  }
  // Caballero Inerte (élite): armadura oscura, mirando a la izquierda
  makeTexture(scene, 'inertKnight', knightMatrix('cuernos'), {
    l: '#4b4458', g: '#2f2a38', c: '#5e1420', C: '#3a0c14', E: '#ff5a3a', y: '#8b1e2b',
  }, true);
  for (const [k, ov] of Object.entries(NPCS)) makeTexture(scene, k, NPC, ov);
  for (const [k, f] of Object.entries(FIG)) makeTexture(scene, k, f.rows, f.ov);
  // pixel blanco para partículas
  if (!scene.textures.exists('px')) {
    const c = scene.textures.createCanvas('px', 2, 2)!;
    c.getContext().fillStyle = '#ffffff';
    c.getContext().fillRect(0, 0, 2, 2);
    c.refresh();
  }
}
