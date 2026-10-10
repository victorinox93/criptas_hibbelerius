// ════════════════════════════════════════════════════════════════
//  MECHA «Inercia-01» (v0.31): armadura completa de logro platino.
//  Diseño original (no copia ningún robot existente): cresta de una
//  sola aleta, visor horizontal, propulsores en la espalda, escudo con
//  anillo y rifle de haz. Generado con tools/arte/mecha.py.
//  c/C = color de la capa del alumno · E/B = color de su visor.
// ════════════════════════════════════════════════════════════════
export const MECHA_ROWS = [
  '....................kyyk..................',
  '...................kyyk...................',
  '...................kyyk...................',
  '................kkkkyykkk.................',
  '...............kwwwwwwwwwk................',
  '.........kk....kWWWWWWWWWk................',
  '........kllk..krWWggggEEEk................',
  '........kllkk.krwwgggggEgk................',
  '........kllggkkrwwWWWWWWWk................',
  '.........kwwwggrwwWWWWWWWk................',
  '.........kwwwggkWWWwwwwwwk................',
  '.........kwwwggkWWWwgwgwgk................',
  '.......kkkwwwggkkkgggggkkkkkkkkkkkk.......',
  '......kwwwwwwWWWWWWWWWWWWWwwwwwwwwwk......',
  '......kWWWWWWWcccccWWWccccWWWWWWWWWk......',
  '......kWcccccWcyyycWBWcyyyWcccccccWk......',
  '......kWcccccWcyyycWEWcyyyWcccccccWk......',
  '......kWWWWWWWCCCCCWBWCCCCWWWWWWWWWk......',
  '......kWWWWWWWCCCCCWWWCCCCWWWWWWWWWk......',
  '..kkkkkyyyyyyWWWWWWWWWWWWWyyyyyyyyyk......',
  '.kRRRRRRRRwwwWWWWWWWWWWWWWWWWWWWWkk.......',
  '.krrrrrrrrwwwWWrrrrWWWrrrrWWWWWWWk........',
  '.krrrrrrrrwwwwkrrrrWyWrrrrkkWWWWWk........',
  '.krrrrrrrrwwwWWWWWWWWWWWWWWWWWWWWk........',
  '.krrryyrrrwwwWWWWWWkkkWWWWWWwwwwwk..kk....',
  '.krryrryrrwwwWWWWWWk.kWWWWWWWWWWWkkkggk...',
  '.krryrryrrwwwWWWWWWk.kWWWWWWWWggggggkkkkkk',
  '.krrryyrrrwwwwwwwwwk.kwwwwlllllllllllllllB',
  '.krrrrrrrrwwwwgggggk.kgggglllllllllllllllB',
  '.krrrrrrrrkkkkgggggk.kgggggkgggggggkkkkkkk',
  '.krrrrrrrrk..kgggggk.kgggggkkkkkkggk......',
  '.krrrrrrrrk.kwwwwwwwkwwwwwwwk...kggk......',
  '.krrrrrrrrk.kwwwwwwwkwwwwwwwk....kk.......',
  '.kRRRRRRRRk.kWWWWWwwkWWWWWwwk.............',
  '..kkkkkkkk..kWWWWWwwkWWWWWwwk.............',
  '............kWccWWwwkWWWWcwwk.............',
  '............kWccWWwwkWWWWcwwk.............',
  '............kWccWWwwkWWWWcwwk.............',
  '............kWWWWWwwkWWWWWwwk.............',
  '...........kkWWWWWWWkWWWWWWWkkk...........',
  '..........kwwwwwwwrrrwwwwwwwrrrk..........',
  '..........kwwwwwwwrrrwwwwwwwrrrk..........',
  '..........kwwwwwwwwwwwwwwwwwwwwk..........',
  '..........kggggggggggggggggggggk..........',
];

export const MECHA_PAL: Record<string, string> = {
  W: '#e8ecf0', w: '#9aa4b4', g: '#3a4050', l: '#6a7484', r: '#c8323a', R: '#7a1a20', y: '#e8c15a', B: '#d8f8ff',
};
