import { ACT4_PAL, ACT4_SPRITES } from './act4';
import Phaser from 'phaser';
import { ACT3_SPRITES, EXTRA_SPRITES, HIBBELERIUS, HIB_PAL } from './act3';
import { ARMORS, CAPES, PAL, VISORS } from './palette';
import { heroMatrix, SKINS, CABELLOS } from './heroes';
import { ALMAS } from '../data/almas';
import { POCIONES } from '../data/pociones';

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

// ── Arcanista Cinético (mismo tamaño que el caballero: 21×22) ──
const MAGE_HATS: Record<string, string[]> = {
  penacho: [ // sombrero puntiagudo
    '........k............',
    '.......kCk...........',
    '......kCcCk..........',
    '.....kCccCCk.........',
    '...kkkkkkkkkkk.......',
  ],
  cuernos: [ // capucha
    '.....................',
    '.......kkkk..........',
    '......kCccCk.........',
    '.....kCcccCCk........',
    '.....kCkkkkCk........',
  ],
  corona: [ // diadema
    '.....................',
    '.....................',
    '.......kkkkk.........',
    '......kgyEygk........',
    '.....kkkkkkkk........',
  ],
};
const MAGE_BODY = [
  '.....kssssssk',
  '.....ksEssEsk',
  '.....kssssssk',
  '......kssssk',
  '.....kkCccCkk',
  '....kCcclllcCk',
  '...kCcccyccccCk',
  '...kCcccccccccCk',
  '..kCcccllcccccCk',
  '..kCcccccccccCCk',
  '..kCccccccccccCk',
  '..kCCcccccccccCk',
  '.kCCcccccccccCCk',
  '.kCCCcccccccCCCk',
  '.kCCCCcccccCCCCk',
  '.kkkkkkkkkkkkkkk',
  '...kdk....kdk',
];
// bastón con orbe brillante, dibujado encima del cuerpo
const MAGE_STAFF: [number, number, string][] = [
  [0, 18, 'y'], [0, 19, 'y'], [1, 17, 'y'], [1, 18, 'B'], [1, 19, 'B'], [1, 20, 'y'],
  [2, 17, 'y'], [2, 18, 'B'], [2, 19, 'B'], [2, 20, 'y'], [3, 18, 'y'], [3, 19, 'y'],
  ...Array.from({ length: 13 }, (_, i) => [4 + i, 18, 'n'] as [number, number, string]),
  [6, 17, 's'], [7, 16, 's'], [7, 17, 's'],
];
export function mageMatrix(hatId: string): string[] {
  const hat = (MAGE_HATS[hatId] ?? MAGE_HATS.penacho).map((r) => r.slice(0, 21).padEnd(21, '.'));
  const body = MAGE_BODY.map((r) => r.padEnd(21, '.').split(''));
  for (const [y, x, ch] of MAGE_STAFF) if (body[y]) body[y][x] = ch;
  const rows = [...hat, ...body.map((r) => r.join(''))];
  while (rows.length < 22) rows.push('.'.repeat(21));
  return rows.slice(0, 22);
}

export function knightMatrix(helm: string): string[] {
  return [...(HELMS[helm] ?? HELMS.penacho), ...KNIGHT_BODY].map((r) => r.slice(0, 21).padEnd(21, '.'));
}

function mirrorHalf(rows: string[]): string[] {
  return rows.map((r) => r + r.split('').reverse().join(''));
}
/** Igual que mirrorHalf pero alinea las mitades por la derecha (el centro) */
function mirrorPad(rows: string[]): string[] {
  const w = Math.max(...rows.map((r) => r.length));
  return mirrorHalf(rows.map((r) => r.padStart(w, '.')));
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
  // ── Acto II · Galerías de la Fricción ──
  anima: mirrorPad([
    '.......o',
    '......oy',
    '.....oyy',
    '....oyyw',
    '...oyyww',
    '...oyFkw',
    '..oyyyww',
    '..oyyyyw',
    '.ooyyyyy',
    '.oRoyyyo',
    '..R.ooo.',
    '....R..o',
  ]),
  muelle: mirrorPad([
    '...kkkkk',
    '..kllllk',
    '..klFkll',
    '...kkkkk',
    '..kgggg.',
    '...kgggg',
    '..kgggg.',
    '...kgggg',
    '..kgggg.',
    '...kgggg',
    '.kkkkkkk',
    'kllllllll',
  ]),
  volante: mirrorPad([
    'kkkkkk',
    'kkkggggg',
    'kkgggllll',
    'kgglllgggg',
    'kgllgggkkkk',
    'kglgggkk',
    'kglggk',
    'kglggk...kkk',
    'kglgk...kyyy',
    'kglgk..kyFyy',
    'kglgk...kyyy',
    'kglggk...kkk',
    'kglggk',
    'kglgggkk',
    'kgllgggkkkk',
    'kgglllgggg',
    'kkgggllll',
    'kkkggggg',
    'kkkkkk',
  ]),
  bruja: mirrorPad([
    'k',
    'kp',
    'kpp',
    'kppp',
    'kpppP',
    'kppppP',
    'kpppppP',
    'kkkkkkkkkkkk',
    'kdssssss',
    'kdskFkss',
    'kdssssss',
    'kdsqqqs',
    'kGGdsssk',
    'kGLGGGGGGG',
    'kGLLGGpGGGG',
    'kGLGGGpGGGG',
    'kGLLGGGpGGGG',
    'kGLGGGGpGGGG',
    'kGLLGGGGpGGGG',
    'kGLGGGGGpGGGG',
    'kGLLGGGGGpGGGG',
    'kGGGGGGGGpGGGG',
    'kkkkkkkkkkkkkk',
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
  i_rad: [
    '..yy.yy..',
    '.yyy.yyy.',
    'yyyy.yyyy',
    'yyy...yyy',
    '....y....',
    '.........',
    '...yyy...',
    '..yyyyy..',
    '...yyy...',
  ],
  i_book: [
    '.yyyyyyy.',
    '.ywwwwwky',
    '.ywkkwwky',
    '.ywwwwwky',
    '.ywkkkwky',
    '.ywwwwwky',
    '.ywkkwwky',
    '.yyyyyyyy',
    '..kkkkkkk',
  ],
  i_necro: [
    '.ppppppp.',
    '.pGGGGGkp',
    '.pGwwwGkp',
    '.pwwLwwkp',
    '.pGwwwGkp',
    '.pGGLGGkp',
    '.pGLGLGkp',
    '.pppppppp',
    '..kkkkkkk',
  ],
  i_ojo: [
    '.........',
    '...www...',
    '.wwwwwww.',
    'wwwLLLwww',
    'wwLLkLLww',
    'wwwLLLwww',
    '.wwwwwww.',
    '...www...',
    '.........',
  ],
  i_hoz: [
    '..WWWW...',
    '.W....W..',
    '.......W.',
    '........W',
    '........l',
    '.......l.',
    '..nn..l..',
    '.n..ll...',
    'n........',
  ],
  i_jarra: [
    '.wwwww...',
    'wwwwwww..',
    'yyyyyyykk',
    'yoyyyyy.k',
    'yyyoyyy.k',
    'yoyyyyy.k',
    'yyyyoyykk',
    'yyyyyyy..',
    '.kkkkk...',
  ],
  i_paw: [
    '.w.....w.',
    '.ww...ww.',
    '.........',
    'w..w.w..w',
    'w..w.w..w',
    '.........',
    '..wwwww..',
    '.wwwwwww.',
    '..ww.ww..',
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

/**
 * Dibuja el héroe del perfil en la textura indicada ('hero' por omisión).
 * Los héroes miden 42×44 (doble detalle): en pantalla se usan a la mitad
 * de la escala que tenían los sprites de 21×22.
 */
export function makeHeroFromAvatar(scene: Phaser.Scene, av: HeroAvatar, key = 'hero') {
  const cape = CAPES[av.cape] ?? CAPES[0];
  const armor = ARMORS[av.armor ?? 0] ?? ARMORS[0];
  const vis = VISORS[av.visor ?? 0] ?? VISORS[0];
  const visor = vis.c;
  const skin = SKINS[av.piel ?? 1] ?? SKINS[1];
  const rows = heroMatrix({ clase: av.clase, helm: av.helm, arma: av.arma, extra: av.extra, figura: av.figura });
  const ov: Record<string, string> = { c: cape.c, C: cape.C, l: armor.l, g: armor.g, E: visor, B: visor, s: skin.s, q: skin.q };
  if ((av.figura ?? 0) > 0) ov.h = CABELLOS[av.figura!] ?? CABELLOS[1];
  // cosméticos holográficos (premio de AM): el tono recorre el arcoíris por pixel y con el tiempo
  const holo: Record<string, [number, number, number]> = {}; // letra → [tono inicial, luminosidad, rango de tono]
  if (cape.holo !== undefined) { const r = cape.rango ?? 360; holo.c = [cape.holo, 0.62, r]; holo.C = [cape.holo + Math.min(40, r / 3), 0.42, r]; }
  if (armor.holo !== undefined) { const r = armor.rango ?? 360; holo.l = [armor.holo, 0.75, r]; holo.g = [armor.holo + Math.min(40, r / 3), 0.5, r]; }
  if (vis.holo !== undefined) { const r = vis.rango ?? 360; holo.E = [vis.holo, 0.65, r]; holo.B = [vis.holo, 0.65, r]; }
  const prev = (scene as unknown as Record<string, Phaser.Time.TimerEvent | undefined>)[`__holo_${key}`];
  prev?.remove();
  if (!Object.keys(holo).length) return makeTexture(scene, key, rows, ov);
  const t0 = performance.now();
  const draw = () => makeTextureHolo(scene, key, rows, ov, holo, (performance.now() - t0) / 8);
  draw();
  (scene as unknown as Record<string, Phaser.Time.TimerEvent>)[`__holo_${key}`] = scene.time.addEvent({ delay: 90, loop: true, callback: draw });
}

/** Como makeTexture, pero las letras de `holo` cambian de tono según su posición y el tiempo (efecto holograma) */
export function makeTextureHolo(scene: Phaser.Scene, key: string, rows: string[], overrides: Record<string, string>, holo: Record<string, [number, number, number]>, t: number) {
  makeTexture(scene, key, rows, overrides);
  const tex = scene.textures.get(key) as Phaser.Textures.CanvasTexture;
  const ctx = tex.getContext();
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const h = holo[row[x]];
      if (!h) continue;
      // el tono va y viene dentro de su rango (rango 360 = arcoíris completo)
      const R = h[2], ph = (t + y * 9 + x * 4) % (2 * R);
      const hue = (h[0] + (R >= 360 ? ph : ph < R ? ph : 2 * R - ph) + 360) % 360;
      ctx.fillStyle = `hsl(${hue}, 95%, ${Math.round(h[1] * 100)}%)`;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  tex.refresh();
}
export interface HeroAvatar { helm: string; cape: number; armor?: number; visor?: number; clase?: string; arma?: number; extra?: number; piel?: number; figura?: number }

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
  fig_einstein: {
    rows: mirrorHalf([
      'w.w..w.w', '.wwwwwww', 'wwwwwwww', 'wwwwssss', '.wwsssss', 'wwwskkss', '.wwsssss', '..wssssq',
      '...ssmmm', '...sssss', '....ssss', '..ccccWW', '.cccccWk', 'ccccccWk', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { w: '#e8e8ec', s: '#e0c0a0', q: '#b8907a', m: '#c8c8cc', c: '#4a4a56', W: '#e8e4dc', k: '#1a1a20' },
  },
  fig_curie: {
    rows: mirrorHalf([
      '......hh', '.....hhh', '....hhhh', '...hhhhh', '..hhssss', '..hsssss', '..hskkss', '..hsssss',
      '..hssssq', '...sssss', '....ssqq', '.....sss', '...ccccc', '..cccccc', '.ccccccc', 'cccccccg', 'cccccccc',
    ]),
    ov: { h: '#3a2e28', s: '#e8ccb4', q: '#c0a090', c: '#16161c', g: '#9bf07a' },
  },
  fig_huygens: {
    rows: mirrorHalf([
      '...hhhhh', '..hhhhhh', '.hhhssss', '.hhsssss', 'hhhskkss', 'hhhsssss', 'hhhssssq', 'hhhsbbbb',
      'hhhhsbss', 'hhh.ssss', 'hh..WWWW', 'h..WWWWW', '..ccWWWW', '.cccccWW', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#2e2218', b: '#3a2a1e', s: '#e0bea0', q: '#b08e78', c: '#1e1a26', W: '#ece8e0' },
  },
  fig_hooke: {
    rows: mirrorHalf([
      '....kkkk', '...kkkkk', '..kkkkkk', '..kkkkkk', '..kkkkkk', '..kkkkkk', '..kkk?kk', '..kkkkkk',
      '...kkkkk', '....kkkk', '.....kkk', '..ccccck', '.cccccWW', 'ccccccWW', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { k: '#1a1820', c: '#2a2630', W: '#4a4656', '?': '#e8c15a' },
  },
  fig_noether: {
    rows: mirrorHalf([
      '........', '....hhhh', '...hhhhh', '..hhhhhh', '..hhssss', '..hsssss', '..hgGGgs', '..hsssss',
      '..hssssq', '...sssss', '....ssss', '.....sss', '...cccss', '..cccccc', '.ccccccc', 'cccccccy', 'cccccccc',
    ]),
    ov: { h: '#3a2e26', s: '#e4c8b0', q: '#c0a090', g: '#2a2420', G: '#9ab8c8', c: '#2a3040', y: '#c8a050' },
  },
  fig_coriolis: {
    rows: mirrorHalf([
      '........', '....hhhh', '...hhhhh', '..hhhsss', '..hsssss', '..hskkss', '.hhsssss', '.hhssssq',
      '..hsssss', '...sssss', '....ssss', '...cWWWW', '..ccWWWW', '.cccccWW', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#2a1e18', s: '#e0bea0', q: '#b08e78', c: '#16161e', W: '#ece8e0' },
  },
  fig_tesla: {
    rows: mirrorHalf([
      '........', '....hhhh', '...hhhh.', '..hhhhss', '..hsssss', '..hskkss', '..hsssss', '..hssssq',
      '...sbbbb', '...sssss', '....ssss', '...cWWWk', '..ccWWWk', '.cccccWW', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#1a1414', b: '#2a1e1a', s: '#e4c8b0', q: '#b8987e', c: '#14141c', W: '#ece8e0', k: '#3a3a8a' },
  },
  fig_oppenheimer: {
    rows: mirrorHalf([
      '........', '....HHHH', '...HHHHH', '.HHHHHHH', '...bssss', '...sssss', '...skkss', '...sssss',
      '...ssssq', '....ssqq', '.....sss', '...ccWWk', '..cccWWk', '.ccccWWW', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { H: '#6a6458', b: '#2a221c', s: '#dcc0a8', q: '#a88a74', c: '#3a3a40', W: '#e8e4dc', k: '#1a1a20' },
  },
  fig_darwin: {
    rows: mirrorHalf([
      '........', '........', '....ssss', '...sssss', '..wsssss', '..wskkss', '..wsssss', '..wwssss',
      '..wwwwww', '...wwwww', '...wwwww', '...wwwww', '..ccwwww', '.cccccww', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { w: '#e8e4dc', s: '#e0bea0', q: '#b08e78', c: '#2a2a22' },
  },
  fig_asimov: {
    // patillas blancas enormes, lentes de armazón negro y corbata de bolo
    rows: mirrorHalf([
      '........', '....hhhh', '...hhhhh', '..hhhhss', '..wsssss', '..wgGGgs', '..wsssss', '..wwssss',
      '..wwwsss', '...wwsss', '....ssss', '...cWWWt', '..ccWWWt', '.cccccWt', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#8a8478', w: '#d8d4cc', s: '#e0bea0', g: '#141414', G: '#6a7a8a', c: '#4a3a28', W: '#e8e4dc', t: '#c8a050' },
  },
  fig_turing: {
    // joven, pelo oscuro ondulado, saco de tweed y corbata
    rows: mirrorHalf([
      '........', '....hhhh', '...hhhhh', '..hhhhhh', '..hhssss', '..hskkss', '..hsssss', '..hssssq',
      '...sssss', '....ssss', '.....sss', '...cWWWt', '..ccWWWt', '.cccccWt', 'cccccccc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#2a1e16', s: '#e4c8b0', q: '#b8987e', k: '#2a2a3a', c: '#5a4a36', W: '#e8e4dc', t: '#3a4a6a' },
  },
  fig_joule: {
    rows: mirrorHalf([
      '....hhhh', '...hhhhh', '..hhssss', '..hsssss', '..hskkss', '..bsssss', '..bssssq', '..bbssss',
      '..bbssqq', '...bbsss', '....bsss', '...ccckk', '..ccccWk', '.cccccWW', 'ccccccWc', 'cccccccc', 'cccccccc',
    ]),
    ov: { h: '#4a3a2e', b: '#5a463a', s: '#e0bea0', q: '#b08e78', c: '#2a2a36', W: '#e8e4dc' },
  },
};

// El profe (encuentro especial): lentes, saco y corbata
const PROFE = mirrorHalf([
  '........', '....hhhh', '...hhhhh', '...hhhhh', '..hhssss', '..hsssss', '..hgGGgg', '..hsssss',
  '...sssss', '...ssqqq', '....ssss', '..WWWWWt', '.ccccWWt', 'cccccWWT', 'cccccWWT', 'ccccccWT', 'ccccccWW', 'cccccccc',
]);

// El profe de mal humor: cejas fruncidas, boca apretada
const PROFE_ENOJADO = mirrorHalf([
  '........', '....hhhh', '...hhhhh', '...hhhhh', '..hhssss', '..hsKKKs', '..hgGGgg', '..hsssss',
  '...sssss', '...sKKKK', '....ssss', '..WWWWWt', '.ccccWWt', 'cccccWWT', 'cccccWWT', 'ccccccWT', 'ccccccWW', 'cccccccc',
]);

// Familiares (miran al frente)
const FAMS: Record<string, { rows: string[]; ov: Record<string, string> }> = {
  fam_gato: {
    rows: mirrorHalf(['.k....', '.kk...', '.kkkkk', 'kkEkkk', 'kkkkkk', '.kkkkp', '..kkkk', '.kkkkk', 'kkkkkk', 'kkkkkk', '.kk.kk']),
    ov: { k: '#2a2630', E: '#c8f070', p: '#c87a8a' },
  },
  fam_lechuza: {
    rows: mirrorHalf(['.b....', '.bb...', '.bbbbb', 'bwwbbb', 'wEkwbb', 'bwwbbb', 'bbbbby', 'bbBbbb', 'bBbBbb', 'bbBbbb', '.bbbbb', '..y.y.']),
    ov: { b: '#5a4a3a', B: '#8a7a5a', w: '#d8d0c0', E: '#e8c15a', k: '#0d0b10', y: '#c89a3a' },
  },
  fam_salamandra: {
    rows: mirrorHalf(['....r', '...rr', '...Er', '...rr', '.r.rr', 'rr.rr', '..rrr', '..rrr', '.r.rr', 'rr.rr', '....r', '....r', '....f', '....f']),
    ov: { r: '#c8542a', E: '#ffe080', f: '#ffb040' },
  },
  fam_tortuga: {
    rows: mirrorHalf(['....ss', '....sk', '.s.ggg', 'ssgGgg', '..gggG', '..gGgg', '..gggG', 'ssgGgg', '.s.ggg', '.....s']),
    ov: { s: '#7a9a5a', k: '#0d0b10', g: '#5a4a2a', G: '#8a7a4a' },
  },
  fam_dragon: {
    rows: mirrorHalf(['R.....', 'RR..hh', 'RRR.kk', 'RRRkkk', 'RRkkEk', '.RRkkk', '..Rkkk', '...kkm', '...kkk', '..kGkk', '..kkkk', '.k...k']),
    ov: { R: '#c8542a', k: '#7a2418', E: '#ffe080', h: '#d8d0c0', m: '#ff9a3a', G: '#e8a060' },
  },
  fam_cuervo: {
    rows: mirrorHalf(['...kk', '..kkk', '.kkEk', '.kkkk', '..kkY', '..kkY', '.kkkk', 'kkkkk', 'kKkkk', 'kKkkk', '.kkkk', '..y.y']),
    ov: { k: '#1a1822', K: '#3a3650', E: '#e04a4a', Y: '#8a8a90', y: '#6a6a70' },
  },
};

// Escenarios de los dilemas
const DIL: Record<string, { rows: string[]; ov: Record<string, string> }> = {
  d_pozo: {
    rows: mirrorHalf(['..nnnn', '.nnnnn', 'nnnnnn', '..n...', '..n...', '..n..l', '..n..l', 'gggggg', 'gdgdgd', 'gggggg', 'gdgdgd', 'gggggg']),
    ov: {},
  },
  d_reactor: {
    rows: mirrorHalf(['...kkk', '..kggg', '.kgLLL', '.kgLyy', '.kgLyy', '.kgLLL', '..kggg', '...kkk', '..kkkk', '.kgggg', 'kggggg', 'kkkkkk']),
    ov: { L: '#7fff9a', y: '#e8ffe8' },
  },
  d_balanza: {
    rows: mirrorHalf(['.....y', 'yyyyyy', 'y....y', 'y....y', 'y....y', 'yyy..y', '.y...y', '.....y', '.....y', '....yy', '..yyyy']),
    ov: { y: '#c8a050' },
  },
  d_atril: {
    rows: mirrorHalf(['......', '.pppp.', 'pGGGGp', 'pGwwwG', 'pGwLkw', 'pGwwwG', 'pppppp', '....nn', '....nn', '....nn', '...nnn', '.nnnnn']),
    ov: { p: '#2a1a3a', G: '#3d4a22', w: '#c8d0a0', L: '#9bf07a', k: '#0d0b10', n: '#3a2a1e' },
  },
  npc_am: {
    rows: mirrorHalf(['..kkkk', '.kgggg', '.kgddd', '.kgddd', '.kgdRF', '.kgdFF', '.kgddd', '.kgddd', '.kgdLd', '.kgddd', '.kgdLL', '.kgddd', '.kgddd', '.kgddd', 'kkgggg', 'kggggg']),
    ov: { k: '#050505', g: '#2a2a30', d: '#101014', F: '#ff2a1a', R: '#ff9a7a', L: '#3aff6a' },
  },
  d_puente: {
    rows: mirrorHalf(['k.....', 'k.....', 'kl....', 'k.l...', 'k..lll', 'knnnnn', 'k.....', 'k.....']),
    ov: { l: '#a89a7a' },
  },
};

export const NPCS: Record<string, Record<string, string>> = {
  npc_ermitano: { c: '#5b4632', C: '#33261a', E: '#ffd27a', s: '#c8a07a' },
  npc_cartografa: { c: '#2f5a5a', C: '#183333', E: '#d8d0c0', s: '#c8a07a' },
  npc_herrero: { c: '#3a2f2a', C: '#1e1714', E: '#ff9a4a', s: '#a87a5a' },
  npc_estatua: { c: '#7a7684', C: '#4a4656', E: '#e8f4ff', s: '#7a7684', k: '#1a1820' },
  npc_coleccionista: { c: '#4a2a5e', C: '#28153a', E: '#b8f0d0', s: '#c8a07a' },
  npc_mercader: { c: '#5e3a1a', C: '#33200e', E: '#e8c15a', s: '#d8b08a' },
  npc_notario: { c: '#2e2e30', C: '#161618', E: '#c8f070', s: '#b8a890' },
  npc_laplace: { c: '#3a1a2a', C: '#1e0c16', E: '#ff5a3a', s: '#8a6a7a' },
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
  for (const [k, f] of Object.entries({ ...FAMS, ...DIL })) makeTexture(scene, k, f.rows, f.ov);
  makeTexture(scene, 'npc_victorino', PROFE, {
    h: '#2a2420', s: '#d8b08a', q: '#a8806a', g: '#1a1a1a', G: '#9ad8f0', W: '#e8e4dc', t: '#8a2030', T: '#8a2030', c: '#2a3a5a',
  });
  // la Sombra del Abismo (alucinación): figura encapuchada casi transparente, ojos verdes
  makeTexture(scene, 'sombra', NPC, { c: '#141a14', C: '#070a07', E: '#9bf07a', s: '#1e2a1e', k: '#000000' });
  makeTexture(scene, 'npc_profe_enojado', PROFE_ENOJADO, {
    h: '#2a2420', s: '#e0907a', q: '#b06a5a', g: '#1a1a1a', G: '#ff5a3a', K: '#3a1210', W: '#e8e4dc', t: '#8a2030', T: '#8a2030', c: '#2a3a5a',
  });
  // Almas en pena (fantasmas aliados): usan el generador de héroes
  for (const a of Object.values(ALMAS)) makeTexture(scene, `alma_${a.id}`, heroMatrix(a.look), a.pal);
  // Acto II: variantes oscuras de sprites existentes
  makeTexture(scene, 'brea', SPRITES.slime, { L: '#2e2c26', G: '#141310', w: '#5a5440', F: '#e0a040' });
  makeTexture(scene, 'minero', NPC, { c: '#2c3836', C: '#161e1c', E: '#9bf0c0', s: '#4a5a58' });
  makeTexture(scene, 'golem', SPRITES.colossus, { g: '#26323a', l: '#43566a', o: '#2e7a8a', y: '#8fd0e0', E: '#7fe8ff', d: '#141c22' });
  makeTexture(scene, 'anima', SPRITES.anima, { y: '#c8743a', o: '#6a2a18', w: '#f0c070', R: '#8a3a20' });
  makeTexture(scene, 'bruja', SPRITES.bruja, { G: '#1c2418', L: '#34442a', p: '#24162e', P: '#46285a', s: '#7a8a6a', q: '#5a6a4e', F: '#c8f070', d: '#10140e' });
  makeTexture(scene, 'volante', SPRITES.volante, { g: '#3a3a44', l: '#6a6a7a', y: '#c87533', F: '#ffe080' });
  // Acto III: la Torre del Tomo
  makeTexture(scene, 'hibbelerius', HIBBELERIUS, HIB_PAL);
  for (const [k, rows] of Object.entries(ACT3_SPRITES)) makeTexture(scene, k, rows, { c: '#7fd8ff' });
  // v0.9: enemigos más duros (casi todos son variantes de color de otros)
  for (const [k, rows] of Object.entries(EXTRA_SPRITES)) makeTexture(scene, k, rows, { c: '#7fd8ff' });
  // Acto IV: el Núcleo del Cálculo (autómatas y AM)
  for (const [k, rows] of Object.entries(ACT4_SPRITES)) makeTexture(scene, k === 'am' ? 'am_jefe' : k, rows, ACT4_PAL);
  makeTexture(scene, 'babosaMadre', SPRITES.slime, { L: '#8a6a3a', G: '#4a3418', w: '#c8a070', F: '#ff8a3a' });
  makeTexture(scene, 'nigromante', NPC, { c: '#1e2a1e', C: '#0e160e', E: '#9bf07a', s: '#8a9a7a' });
  makeTexture(scene, 'armaduraPuas', knightMatrix('cuernos'), { l: '#6a3a2a', g: '#3a1e16', c: '#2a1210', C: '#160806', E: '#ff8a3a', w: '#c8b8a0', y: '#a83a1e' }, true);
  makeTexture(scene, 'mercurio', SPRITES.slime, { L: '#c4c8d4', G: '#7a7e8c', w: '#ffffff', F: '#3a6aff' });
  makeTexture(scene, 'gotita', SPRITES.slime, { L: '#aeb4c4', G: '#6a6e7c', w: '#ffffff', F: '#3a6aff' });
  makeTexture(scene, 'sifon', SPRITES.anima, { y: '#3ac8c8', o: '#1a4a5a', w: '#b8f0f0', R: '#1a6a6a' });
  makeTexture(scene, 'bibliotecario', NPC, { c: '#3a2a4e', C: '#1e1430', E: '#7fd8ff', s: '#9a8aa8' });
  makeTexture(scene, 'indice', SPRITES.colossus, { g: '#3a2e4a', l: '#6a5a86', o: '#c8a050', y: '#e8c15a', E: '#7fd8ff', d: '#1a1424' });
  // pociones: el mismo frasco con el color de cada líquido
  const FLASK = ['...kkk...', '...kWk...', '...kWk...', '..kpppk..', '.kpWpppk.', 'kppWppppk', 'kpppppPPk', 'kppppPPPk', '.kkkkkkk.'];
  const EMPTY = ['...kkk...', '...kgk...', '...kgk...', '..kdddk..', '.kddddk..', 'kdddddddk', 'kdddddddk', 'kdddddddk', '.kkkkkkk.'];
  for (const p of Object.values(POCIONES)) {
    const dark = Phaser.Display.Color.HexStringToColor(p.color).darken(35).color.toString(16).padStart(6, '0');
    makeTexture(scene, `pot_${p.id}`, FLASK, { p: p.color, P: `#${dark}`, W: '#f0ece4' });
  }
  makeTexture(scene, 'pot_vacia', EMPTY, { d: '#1a1520', g: '#3a3244' });
  // pixel blanco para partículas
  if (!scene.textures.exists('px')) {
    const c = scene.textures.createCanvas('px', 2, 2)!;
    c.getContext().fillStyle = '#ffffff';
    c.getContext().fillRect(0, 0, 2, 2);
    c.refresh();
  }
}
