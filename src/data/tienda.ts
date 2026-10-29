// ════════════════════════════════════════════════════════════════
//  TIENDA DE LAYLA (menú principal) y MOMENTUM (p = m·v)
//  · Momentum se gana al vencer jefes (más mientras más lejos llegas)
//    y Layla regala 1 al día por entrar.
//  · v0.29: TODO el catálogo está siempre a la venta, ordenado por
//    categorías (UDEM, México, Halloween, Día de Muertos, Navidad,
//    Ciencia ficción, De las Criptas…). Cada día hay una OFERTA (−40 %).
//    Lo que compras es tuyo para siempre.
//  · Los accesorios se dibujan sobre el héroe de cualquier clase
//    (cabeza o mano); un accesorio de mano reemplaza al arma.
// ════════════════════════════════════════════════════════════════
import { ARMORS, CAPES, VISORS } from '../art/palette';

export type Slot = 'cabeza' | 'cara' | 'mano' | 'pies' | 'escudo';
export const SLOTS: { id: Slot; nombre: string }[] = [
  { id: 'cabeza', nombre: 'Cabeza' }, { id: 'cara', nombre: 'Cara' }, { id: 'mano', nombre: 'Mano' }, { id: 'pies', nombre: 'Pies' }, { id: 'escudo', nombre: 'Escudo' },
];

export type Cat = 'clasicos' | 'armas' | 'udem' | 'mexico' | 'halloween' | 'muertos' | 'navidad' | 'scifi' | 'criptas' | 'escudos' | 'colores' | 'sets';
export const CATEGORIAS: { id: Cat; nombre: string; color: string }[] = [
  { id: 'clasicos', nombre: 'Clásicos', color: '#c8b49a' },
  { id: 'armas', nombre: 'Armas', color: '#c8c4bc' },
  { id: 'udem', nombre: 'UDEM', color: '#7aa0f0' },
  { id: 'mexico', nombre: 'México', color: '#5ac86a' },
  { id: 'halloween', nombre: 'Halloween', color: '#f08a1a' },
  { id: 'muertos', nombre: 'Día de Muertos', color: '#f0a050' },
  { id: 'navidad', nombre: 'Navidad', color: '#e05a5a' },
  { id: 'scifi', nombre: 'Ciencia ficción', color: '#3ad8d0' },
  { id: 'criptas', nombre: 'De las Criptas', color: '#b89ad0' },
  { id: 'escudos', nombre: 'Escudos', color: '#f0c050' },
  { id: 'colores', nombre: 'Colores', color: '#c890ff' },
  { id: 'sets', nombre: 'Sets', color: '#e05a5a' },
];
export const NOMBRE_CAT = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nombre])) as Record<Cat, string>;

export interface Accesorio {
  id: string;
  nombre: string;
  slot: Slot;
  precio: number;
  desc: string;
  rows: string[];
  /** cabeza: centro inferior · cara: centro de los ojos · mano: punto de agarre · escudo: centro del escudo · pies: centro inferior de UNA bota (se dibujan dos) */
  ancla: [number, number];
  cat?: Cat; // categoría en la tienda (se completa en CAT_DE si falta)
  /** v0.35 · el artículo es un color (capa, armadura o visor de src/art/palette.ts), no un accesorio */
  color?: { parte: 'cape' | 'armor' | 'visor'; idx: number };
  /** v0.46 · no se vende: se gana con un logro (src/data/logros.ts) y llega solo al Vestidor */
  logro?: string;
  /** v0.36 · el artículo es un set: varias piezas y una capa, con descuento */
  set?: { piezas: string[]; capa: string };
}

/** Colores de los accesorios (independientes de la capa y la armadura del héroe) */
export const PAL_ACC: Record<string, string> = {
  k: '#0d0b10', W: '#f0ece4', w: '#c8c4bc', r: '#c8323a', R: '#7a1a20', o: '#f08a1a', O: '#b85a10', y: '#e8c15a', Y: '#a87a2a',
  n: '#7a5232', N: '#4a3020', g: '#3a8a3a', G: '#8ad06a', m: '#b8d878', p: '#6a3a8a', P: '#a86ac8', s: '#f0a0b8', b: '#3a5a9a', B: '#9ad8f0', d: '#2a2433', l: '#9a93a8',
  // v0.34 · escudos chistosos
  T: '#f0dca0', u: '#c8a060', S: '#d07890', e: '#3a3640', c: '#c8904a', C: '#8a5a2a', x: '#b88a50',
  // v0.36 · letras que usaban algunos accesorios y no tenían color (se veían huecos)
  U: '#8a6a30', a: '#f0d040', f: '#ff8a4a', h: '#a0703a', i: '#dff4ff', q: '#a89a8a', t: '#d05a2a', v: '#9ae05a',
  // v0.36 · sets
  H: '#5a5248', J: '#3a342e',
};

export const ACCESORIOS: Accesorio[] = [
  // ── siempre en rotación (4 por semana) ──
  {
    id: 'orejas_gato', nombre: 'Orejas de Gato', slot: 'cabeza', cat: 'criptas', precio: 4, desc: 'Como las de Layla. Miau.',
    rows: ['o........o', 'oo......oo', 'oso....oso', 'ooo....ooo'], ancla: [5, 4],
  },
  {
    id: 'copa', nombre: 'Sombrero de Copa', slot: 'cabeza', cat: 'clasicos', precio: 6, desc: 'Elegancia victoriana para un caballero de la masa.',
    rows: ['..dddd..', '..dddd..', '..dddd..', '..rrrr..', 'dddddddd'], ancla: [4, 5],
  },
  {
    id: 'laurel', nombre: 'Corona de Laurel', slot: 'cabeza', cat: 'clasicos', precio: 5, desc: 'Para quien ya venció a Hibbelerius… o eso cree.',
    rows: ['g.G.g.G.g.G', 'GgGgGgGgGgG'], ancla: [5, 2],
  },
  {
    id: 'birrete', nombre: 'Birrete de Graduación', slot: 'cabeza', cat: 'udem', precio: 8, desc: 'Aprobaste Dinámica. En el juego, al menos.',
    rows: ['dddddddddd', '.dddddddd.', '..dddddd.y', '..dddddd.y', '.........y'], ancla: [4, 4],
  },
  {
    id: 'latigo', nombre: 'Látigo', slot: 'mano', cat: 'armas', precio: 6, desc: 'F = m·a, pero con estilo de arqueólogo.',
    rows: ['..nnn...', '.n...n..', 'n.....n.', 'n.....n.', '.n...n..', '..n.n...', '...N....', '...N....', '...N....', '...N....'], ancla: [3, 8],
  },
  {
    id: 'matcha', nombre: 'Vaso de Matcha', slot: 'mano', cat: 'clasicos', precio: 4, desc: 'Energía para un turno más. (No da energía.)',
    rows: ['....W.', '...W..', 'WWWWW.', 'WmmmW.', 'WGmGW.', 'WmmmW.', 'WmGmW.', '.WWW..'], ancla: [2, 5],
  },
  {
    id: 'tridente', nombre: 'Tridente', slot: 'mano', cat: 'armas', precio: 8, desc: 'Tres puntas: ΣF = F₁ + F₂ + F₃.',
    rows: ['y.y.y', 'y.y.y', 'yyyyy', '..y..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..'], ancla: [2, 15],
  },
  {
    id: 'guadana', nombre: 'Guadaña Pequeña', slot: 'mano', cat: 'criptas', precio: 8, desc: 'Inspirada en Hibbelerius. No se lo digas.',
    rows: ['WWWWW...', 'w..WWW..', '.....WWn', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.'], ancla: [6, 11],
  },
  {
    id: 'espada_madera', nombre: 'Espada de Madera', slot: 'mano', cat: 'armas', precio: 3, desc: 'De entrenamiento. Pega igual (en el juego, sí).',
    rows: ['.n.', 'nnn', 'nnn', 'nnn', 'nnn', 'nnn', 'nnn', 'nnn', 'nnn', 'NNN', 'YYYYY', '.N.', '.N.'], ancla: [1, 11],
  },
  {
    id: 'calculadora', nombre: 'Calculadora Científica', slot: 'mano', cat: 'udem', precio: 5, desc: 'En modo DEG, por favor. (Sir Radián aprueba.)',
    rows: ['dddddd', 'dBBBBd', 'dBBBBd', 'dddddd', 'dlldld', 'dlldld', 'dlldrd', 'dddddd'], ancla: [3, 6],
  },
  // ── Día de Muertos ──
  {
    id: 'cempasuchil', nombre: 'Corona de Cempasúchil', slot: 'cabeza', cat: 'muertos', precio: 12, desc: 'Flor de veinte pétalos para guiar a las almas en pena.',
    rows: ['.o.O.o.O.o.', 'oOoOoOoOoOo', '.g.g.g.g.g.'], ancla: [5, 3],
  },
  {
    id: 'catrina', nombre: 'Sombrero de Catrina', slot: 'cabeza', cat: 'muertos', precio: 16, desc: 'Elegante como la Catrina de Posada.',
    rows: ['....pppp....', '...pppppp...', '...oyrOoP...', 'pppppppppppp', '.pppppppppp.'], ancla: [6, 5],
  },
  {
    id: 'pan_muerto', nombre: 'Pan de Muerto', slot: 'mano', cat: 'muertos', precio: 9, desc: 'Con azúcar. Las huesitos son decoración, no física.',
    rows: ['...yy...', '.yyNNyy.', 'yyNyyNyy', 'yyyyyyyy', '.yyyyyy.'], ancla: [4, 3],
  },
  {
    id: 'calabaza', nombre: 'Cabeza de Calabaza', slot: 'cabeza', cat: 'halloween', precio: 10, desc: 'Para la noche de brujas. Cuidado con la Bruja de la Fricción.',
    rows: ['......Gg......', '...oooOOooo...', '.ooOoooOoooOo.', 'ooOooooOooooOo', 'oOoyyooOooyyOo', 'oOoykooOookyOo', 'oOooooyyooooOo', 'oOoooooooooOoo', 'oOykykyykykyOo', 'oOoykykykykoOo', '.ooOoooOoooOo.', '...ooooooooo..'], ancla: [7, 5],
  },
  // ── Navidad ──
  {
    id: 'gorro_navidad', nombre: 'Gorro Navideño', slot: 'cabeza', cat: 'navidad', precio: 12, desc: '¡Jo, jo, jo! La masa de los regalos no se conserva.',
    rows: ['........WW', '.......WWW', '......rr..', '....rrrr..', '...rrrrr..', '..rrrrrrr.', '.WWWWWWWW.', '.WWWWWWWW.'], ancla: [5, 8],
  },
  {
    id: 'baston_caramelo', nombre: 'Bastón de Caramelo', slot: 'mano', cat: 'navidad', precio: 9, desc: 'Momento de torsión dulce.',
    rows: ['.WrW.', 'r...W', 'W...r', '....W', '....r', '....W', '....r', '....W', '....r', '....W', '....r', '....W'], ancla: [4, 9],
  },
  // ── Día del Amor y la Amistad ──
  {
    id: 'rosa', nombre: 'Rosa Roja', slot: 'mano', cat: 'clasicos', precio: 8, desc: 'Para tu compañero de estudio favorito.',
    rows: ['.rr.', 'rRrr', '.rr.', '.g..', '.gG.', '.g..', '.g..', '.g..'], ancla: [1, 6],
  },
  // ── v0.26 · cascos ──
  {
    id: 'vikingo', nombre: 'Casco Vikingo', slot: 'cabeza', cat: 'clasicos', precio: 7, desc: 'Cuernos de hueso. (Los vikingos reales no los usaban, pero se ven bien.)',
    rows: ['w..........w', 'ww..llll..ww', '.wllllllllw.', '.llllllllll.', '.yyyyyyyyyy.'], ancla: [6, 4],
  },
  {
    id: 'espartano', nombre: 'Casco Espartano', slot: 'cabeza', cat: 'clasicos', precio: 8, desc: 'Con penacho rojo. Esto es… ¡DINÁMICA!',
    rows: ['..rrrrrr..', '.rrRrrRrr.', '...yyyy...', '..yyyyyy..', '.yyyyyyyy.', '.yyY..Yyy.'], ancla: [5, 4],
  },
  {
    id: 'astronauta', nombre: 'Escafandra de Astronauta', slot: 'cabeza', cat: 'scifi', precio: 10, desc: 'En la Luna, g = 1.62 m/s². Aquí no te sirve, pero luce.',
    rows: ['....WWWWWW....', '..WWBBBBBBWW..', '.WBiBBBBBBBBW.', '.WBBiBBBBBBBW.', 'WBBBiBBBBBBBBW', 'WBBBBBBBBBBBBW', 'WBBBBBBBBBBBBW', 'WBBBBBBBBBBBBW', '.WBBBBBBBBBBW.', '.WWBBBBBBBBWW.', '..llllllllll..', '.llylllllylll.'], ancla: [7, 5],
  },
  {
    id: 'minero', nombre: 'Casco de Minero', slot: 'cabeza', cat: 'clasicos', precio: 5, desc: 'Con lámpara, para las Galerías de la Fricción.',
    rows: ['...yyyy...', '..yyWByy..', '.yyyyyyyy.', 'yyyyyyyyyy'], ancla: [5, 4],
  },
  {
    id: 'kabuto', nombre: 'Kabuto de Samurái', slot: 'cabeza', cat: 'clasicos', precio: 9, desc: 'Yelmo con cuernos dorados. Disciplina y momento angular.',
    rows: ['..y......y..', '...y....y...', '....yyyy....', '..rrrrrrrr..', '.rRrRrRrRrr.', 'rrrrrrrrrrrr'], ancla: [6, 5],
  },
  {
    id: 'corona_real', nombre: 'Corona Real', slot: 'cabeza', cat: 'clasicos', precio: 10, desc: 'Para el primer lugar del ranking. O para quien la compre.',
    rows: ['y.y.y.y.y', 'yyyyyyyyy', 'yryyByyry', 'yyyyyyyyy'], ancla: [4, 4],
  },
  // ── v0.26 · cara ──
  {
    id: 'lentes_sol', nombre: 'Lentes de Sol', slot: 'cara', cat: 'clasicos', precio: 4, desc: 'Demasiado cool para el Abismo.',
    rows: ['ddddkdddd', '.dd...dd.'], ancla: [4, 0],
  },
  {
    id: 'lentes_nerd', nombre: 'Lentes de Pasta', slot: 'cara', cat: 'udem', precio: 3, desc: 'Para leer el Hibbeler sin perder detalle.',
    rows: ['kkkkkkkkk', 'kBBk.kBBk', 'kkkk.kkkk'], ancla: [4, 1],
  },
  {
    id: 'monoculo', nombre: 'Monóculo', slot: 'cara', cat: 'clasicos', precio: 5, desc: 'Muy distinguido. Muy siglo XIX.',
    rows: ['.yyy', 'yWBy', '.yyy', '...y', '...y'], ancla: [2, 1],
  },
  {
    id: 'parche', nombre: 'Parche de Pirata', slot: 'cara', cat: 'clasicos', precio: 4, desc: '¡Arrr! La fuerza de flotación también aplica en altamar.',
    rows: ['kkkkkkkkkk', '...kkk....', '...kkk....'], ancla: [4, 0],
  },
  {
    id: 'bigote', nombre: 'Bigote Elegante', slot: 'cara', cat: 'clasicos', precio: 3, desc: 'Al estilo de Einstein (o casi).',
    rows: ['nn....nn', '.nnnnnn.'], ancla: [4, -2],
  },
  // ── v0.26 · pies ──
  {
    id: 'vaqueras', nombre: 'Botas Vaqueras', slot: 'pies', cat: 'mexico', precio: 6, desc: 'Con espuelas. Yiijaa: fricción garantizada.',
    rows: ['.nnn..', '.nYn..', '.nnn..', '.nnnnn', 'NN.lNN'], ancla: [3, 5],
  },
  {
    id: 'tenis', nombre: 'Tenis Rojos', slot: 'pies', cat: 'clasicos', precio: 5, desc: 'Más fricción estática para arrancar rápido.',
    rows: ['.rr...', '.rrr..', 'rrrrrr', 'WWWWWW'], ancla: [3, 4],
  },
  {
    id: 'pantuflas', nombre: 'Pantuflas de Gato', slot: 'pies', cat: 'criptas', precio: 4, desc: 'Regalo de Layla para los días de estudio en casa.',
    rows: ['q...q.', 'qqqqqq', 'qkqkqq', 'qqsqqq'], ancla: [3, 4],
  },
  {
    id: 'botas_espacio', nombre: 'Botas Lunares', slot: 'pies', cat: 'scifi', precio: 7, desc: 'Suela pesada: más masa, menos rebote.',
    rows: ['.WWW..', '.WWW..', '.WWWW.', 'WWWWWW', 'llllll'], ancla: [3, 5],
  },
  // ── v0.26 · armas (guiños a otros juegos y películas) ──
  {
    id: 'sable_azul', nombre: 'Sable Láser Azul', slot: 'mano', cat: 'scifi', precio: 10, desc: 'Una hoja de plasma. La energía cinética de los electrones nunca fue tan elegante.',
    rows: ['.W.', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'lll', 'dld', 'ldl', 'ddd'], ancla: [1, 13],
  },
  {
    id: 'sable_rojo', nombre: 'Sable Láser Rojo', slot: 'mano', cat: 'scifi', precio: 10, desc: 'El lado oscuro de la fuerza… neta.',
    rows: ['.W.', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'lll', 'dld', 'ldl', 'ddd'], ancla: [1, 13],
  },
  {
    id: 'espada_gigante', nombre: 'Espada del Mercenario', slot: 'mano', cat: 'armas', precio: 9, desc: 'Más grande que tú. La inercia de esa hoja es enorme.',
    rows: ['.ll.', 'llll', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'llll', 'yyyyyy', '.nn.', '.nn.', '.yy.'], ancla: [2, 15],
  },
  {
    id: 'martillo_trueno', nombre: 'Martillo del Trueno', slot: 'mano', cat: 'armas', precio: 9, desc: 'De la mitología nórdica. Sólo lo levanta quien domina F = m·a.',
    rows: ['llllll', 'lwwwwl', 'lwwwwl', 'llllll', '..nn..', '..nn..', '..nn..', '..nn..', '..NN..', '..y...'], ancla: [2, 7],
  },
  {
    id: 'pico', nombre: 'Pico de Minero', slot: 'mano', cat: 'armas', precio: 5, desc: 'Para picar bloques… y rocas de las criptas.',
    rows: ['.llll..', 'l..n.ll', '...n...', '...n...', '...n...', '...n...', '...n...', '...n...'], ancla: [3, 6],
  },
  {
    id: 'arco', nombre: 'Arco Élfico', slot: 'mano', cat: 'armas', precio: 7, desc: 'Energía potencial elástica convertida en cinética. Física pura.',
    rows: ['nn..', '.nw.', '..nw', '..nw', '..nw', '..nw', '..nw', '..nw', '.nw.', 'nn..'], ancla: [2, 5],
  },
  {
    id: 'llave_inglesa', nombre: 'Llave Inglesa', slot: 'mano', cat: 'udem', precio: 4, desc: 'Momento de torsión: M = F·d. Mientras más larga, menos esfuerzo.',
    rows: ['l..l', 'l..l', 'llll', '.ll.', '.ll.', '.ll.', '.ll.', '.ll.', '.ll.'], ancla: [1, 7],
  },
  {
    id: 'varita', nombre: 'Varita Estelar', slot: 'mano', cat: 'armas', precio: 6, desc: 'Ilumina las fórmulas. No las resuelve por ti.',
    rows: ['.y.', 'yyy', '.y.', '.n.', '.n.', '.n.', '.n.', '.n.'], ancla: [1, 6],
  },
  // ── Día de Muertos (extra) ──
  {
    id: 'mascara_calavera', nombre: 'Máscara de Calavera', slot: 'cara', cat: 'muertos', precio: 10, desc: 'Calaverita de azúcar con flores.',
    rows: ['...WWWWWWWW...', '..WWfWWWWbWW..', '.WWfyfWWbybWW.', '.WWWfWWWWbWWW.', 'WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', 'WWkkkWWWWkkkWW', 'WkkpkkWWkkpkkW', 'WkkkkkWWkkkkkW', 'WWWWWkWWkWWWWW', '.WWkWkWkWkWkW.', '..WWWWWWWWWW..'], ancla: [8, 8],
  },
  // ── Navidad (extra) ──
  {
    id: 'botas_duende', nombre: 'Botas de Duende', slot: 'pies', cat: 'navidad', precio: 10, desc: 'Con punta enroscada y cascabel.',
    rows: ['....gy', '.gg.g.', '.ggg..', 'gggggg', 'rrrrrr'], ancla: [3, 5],
  },
  // ════════════════ v0.29 · catálogo ampliado ════════════════
  // ── UDEM ──
  { id: 'gorra_udem', nombre: 'Gorra Universitaria', slot: 'cabeza', cat: 'udem', precio: 6, desc: 'Azul de campus. Para las clases de las 7 a. m.', rows: ['...UUUUU...', '..UUUyUUU..', '..UUUUUUU..', '..uuuuuuuuuu'], ancla: [5, 4] },
  { id: 'casco_obra', nombre: 'Casco de Ingeniería', slot: 'cabeza', cat: 'udem', precio: 7, desc: 'Obligatorio en el laboratorio de estructuras. La seguridad también es física.', rows: ['...yyyy...', '..yyYYyy..', '.yyyYYyyy.', 'yyyyyyyyyyy'], ancla: [5, 4] },
  { id: 'laptop', nombre: 'Laptop con Apuntes', slot: 'mano', cat: 'udem', precio: 9, desc: 'Con 47 pestañas abiertas y una sola es de Dinámica.', rows: ['eeeeeee', 'eBBBBBe', 'eBWBWBe', 'eBBBBBe', 'eeeeeee', '.lllll.'], ancla: [3, 5] },
  { id: 'cafe_examenes', nombre: 'Café de Exámenes', slot: 'mano', cat: 'udem', precio: 5, desc: 'Semana de parciales: la cafeína no es energía cinética, pero ayuda.', rows: ['.w.w.', '.....', 'WWWWW', 'WnnnW', 'WuuuW', 'WnnnW', '.WWW.'], ancla: [2, 5] },
  { id: 'credencial', nombre: 'Credencial de Estudiante', slot: 'mano', cat: 'udem', precio: 4, desc: 'Abre la biblioteca, el gimnasio y, con suerte, el estacionamiento.', rows: ['.y...', '.y...', 'uuuuu', 'uWsWu', 'uWWWu', 'uwwwu', 'uuuuu'], ancla: [2, 4] },
  { id: 'lentes_lab', nombre: 'Lentes de Laboratorio', slot: 'cara', cat: 'udem', precio: 4, desc: 'Protección ocular: las partículas también obedecen F = m·a.', rows: ['BBBBBBBBB', 'BiiBBBiiB'], ancla: [4, 0] },
  { id: 'mini_entropia', nombre: 'Réplica de La Entropía', slot: 'mano', cat: 'udem', precio: 12, desc: 'La escultura amarilla del campus, en miniatura. ¿Bloques en desorden… o papas? ΔS ≥ 0.', rows: ['..ay..', '.aYa..', '..yay.', '.ayY..', '..aYya', '.yaY..', 'ayYa..', '.yaYy.', '..aYa.', '.yaYy.', 'aYyaY.', '.llll.'], ancla: [2, 10] },
  { id: 'papas_entropia', nombre: 'Papas a la Entropía', slot: 'mano', cat: 'udem', precio: 7, desc: 'Lo que todos ven en la escultura. Crujientes, amarillas y en máximo desorden.', rows: ['.a.y.a', 'a.ya.y', '.yaYay', 'ya.yaY', 'rrrrrr', 'rWrrWr', 'rrrrrr', '.rrrr.'], ancla: [2, 5] },
  { id: 'termo', nombre: 'Termo Universitario', slot: 'mano', cat: 'udem', precio: 5, desc: 'Conserva el calor: casi un sistema aislado.', rows: ['.ll.', 'uuuu', 'uyyu', 'uuuu', 'uUUu', 'uuuu', '.uu.'], ancla: [1, 4] },
  // ── México ──
  { id: 'sombrero_charro', nombre: 'Sombrero de Charro', slot: 'cabeza', cat: 'mexico', precio: 12, desc: 'Ala ancha, momento de inercia enorme. ¡Ajúa!', rows: ['.....nnnn.....', '....nyyyyn....', '....nnnnnn....', '.nnnnnnnnnnnn.', 'nyynnyynnyynny'], ancla: [7, 5] },
  { id: 'mascara_luchador', nombre: 'Máscara de Luchador', slot: 'cara', cat: 'mexico', precio: 9, desc: 'Llave de tercera ley: toda acción tiene su reacción… en el ring.', rows: ['...rrrrrrrr...', '..rrrrrrrrrr..', '.rrrrryyrrrrr.', '.rrrryrryrrrr.', 'rrrryrrrryrrrr', 'rrryrrrrrryrrr', 'rryrrrrrrrryrr', 'rWWWWrrrrWWWWr', 'rWkkWrrrrWkkWr', 'rrWWrrrrrrWWrr', '.rrrrsssssrrr.', '..rrrrrrrrrr..'], ancla: [8, 8] },
  { id: 'paliacate', nombre: 'Paliacate', slot: 'cara', cat: 'mexico', precio: 5, desc: 'Rojo con flores blancas. Para el polvo de las criptas.', rows: ['rrWrrWrr', '.rrWrrr.', '..rrr...'], ancla: [4, -2] },
  { id: 'maracas', nombre: 'Maraca', slot: 'mano', cat: 'mexico', precio: 6, desc: 'Oscilación forzada con ritmo.', rows: ['.rr.', 'rgrr', 'rrgr', '.rr.', '.n..', '.n..', '.n..'], ancla: [1, 5] },
  { id: 'elote', nombre: 'Elote con Chile', slot: 'mano', cat: 'mexico', precio: 6, desc: 'Con limón, mayonesa y chile del que pica.', rows: ['..yy.', '.yyyy', '.yryy', '.yyyy', '.yyry', '.yyyy', '.GGG.', '..n..', '..n..'], ancla: [2, 7] },
  { id: 'taco', nombre: 'Taco al Pastor', slot: 'mano', cat: 'mexico', precio: 7, desc: 'Con piña. El trompo es un ejemplo perfecto de rotación.', rows: ['..tttt..', '.tGorGt.', 'ttOooOtt', 'tttttttt'], ancla: [4, 3] },
  { id: 'concha', nombre: 'Concha', slot: 'mano', cat: 'mexico', precio: 5, desc: 'Pan dulce de vainilla. Ideal con chocolate después de un examen.', rows: ['.ssss.', 'sWsWss', 'ssssss', 'tttttt'], ancla: [3, 3] },
  { id: 'guitarra', nombre: 'Guitarra de Mariachi', slot: 'mano', cat: 'mexico', precio: 12, desc: 'Cuerdas tensas: la frecuencia depende de la tensión y la masa.', rows: ['.NN..', '..n..', '..n..', '..n..', '..n..', '.OOO.', 'OoooO', 'OokoO', 'OoooO', '.OOO.'], ancla: [2, 5] },
  { id: 'huaraches', nombre: 'Huaraches', slot: 'pies', cat: 'mexico', precio: 6, desc: 'De piel tejida. Fricción artesanal.', rows: ['.n.n..', '.nnn..', 'nhhhhh', 'NNNNNN'], ancla: [3, 4] },
  // ── Halloween ──
  { id: 'sombrero_bruja', nombre: 'Sombrero de Bruja', slot: 'cabeza', cat: 'halloween', precio: 12, desc: 'Puntiagudo y con hebilla. La Bruja de la Fricción tiene uno igual.', rows: ['......dd...', '.....ddd...', '....ddd....', '...dddd....', '...dPdd....', '.ddddddddd.', 'ddddddddddd'], ancla: [5, 7] },
  { id: 'antifaz_murcielago', nombre: 'Antifaz de Murciélago', slot: 'cara', cat: 'halloween', precio: 8, desc: 'Ecolocalización: mide distancias con el tiempo de ida y vuelta del sonido.', rows: ['p.......p', 'pp.ppp.pp', 'ppppppppp', '.pWp.pWp.'], ancla: [4, 3] },
  { id: 'diablito', nombre: 'Diadema de Diablito', slot: 'cabeza', cat: 'halloween', precio: 7, desc: 'Cuernitos rojos. Travesura garantizada.', rows: ['r......r', 'rr....rr', '.rrrrrr.'], ancla: [3.5, 3] },
  { id: 'venda_momia', nombre: 'Vendas de Momia', slot: 'cara', cat: 'halloween', precio: 8, desc: 'Tres mil años de antigüedad y todavía con dudas de Dinámica.', rows: ['..WwWwWwWwWw..', '.wWwWwWwWwWwW.', 'WwWwWwWwWwWwWw', 'wWwWwWwWwWwWwW', 'WwWwWwWwWwWwWw', 'wWwWwWwWwWwWwW', 'WwWwWwWwWwWwWw', 'wWkkwWwWwkkwWw', 'WwkrkwWwWkrkWw', 'wWwWwWwWwWwWwW', '.wWwWwWwWwWwW.', '..WwWwWwWwWw..'], ancla: [8, 8] },
  { id: 'escoba', nombre: 'Escoba Voladora', slot: 'mano', cat: 'halloween', precio: 11, desc: 'Sustentación mágica. La física aún la está investigando.', rows: ['..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..N..', '.yYy.', 'yYyYy', 'YyYyY', 'yYyYy'], ancla: [2, 4] },
  { id: 'caldero', nombre: 'Caldero Burbujeante', slot: 'mano', cat: 'halloween', precio: 10, desc: 'Transferencia de calor por convección. Y algo de magia verde.', rows: ['.v.v..', '..v...', 'kkkkkk', 'kvvvvk', 'keeeek', 'keeeek', '.kkkk.'], ancla: [3, 2] },
  { id: 'linterna_calabaza', nombre: 'Linterna de Calabaza', slot: 'mano', cat: 'halloween', precio: 8, desc: 'Ilumina las criptas. Cuidado: la vela no es infinita.', rows: ['..n..', '..n..', '.ooo.', 'oOkOo', 'ooooo', 'okkko', '.ooo.'], ancla: [2, 1] },
  { id: 'botas_bruja', nombre: 'Botas de Bruja', slot: 'pies', cat: 'halloween', precio: 9, desc: 'Puntiagudas y con hebilla dorada.', rows: ['.dd....', '.dd....', '.ddd...', 'ddydddd', 'ddddddd'], ancla: [3, 5] },
  // ── Día de Muertos ──
  { id: 'vela_ofrenda', nombre: 'Vela de Ofrenda', slot: 'mano', cat: 'muertos', precio: 8, desc: 'Para iluminar el camino de las almas en pena.', rows: ['..y..', '.yoy.', '..o..', '.WWW.', '.WWW.', '.WWW.', '.WWW.', '.WWW.'], ancla: [2, 6] },
  { id: 'papel_picado', nombre: 'Papel Picado', slot: 'cabeza', cat: 'muertos', precio: 9, desc: 'Banderines de colores que flotan sobre tu cabeza.', rows: ['nnnnnnnnnnn', 'ff.yy.pp.bb', 'f.fy.yp.pb.'], ancla: [5, 4] },
  { id: 'calaverita', nombre: 'Calaverita de Azúcar', slot: 'mano', cat: 'muertos', precio: 9, desc: 'Dulce y con tu nombre en la frente.', rows: ['.WWWW.', 'WbWWfW', 'WWkWWW', '.WkWk.'], ancla: [3, 3] },
  // ── Navidad ──
  { id: 'cuernos_reno', nombre: 'Cuernos de Reno', slot: 'cabeza', cat: 'navidad', precio: 11, desc: 'Un trineo a velocidad orbital necesita buenos cuernos.', rows: ['n.n.......n.n', '.nn.......nn.', '..nn.....nn..', '...nnnnnnn...'], ancla: [6, 4] },
  { id: 'gorro_nieve', nombre: 'Gorro de Nieve', slot: 'cabeza', cat: 'navidad', precio: 9, desc: 'Con pompón. Conducción térmica bajo control.', rows: ['...WW...', '..gggg..', '.gggggg.', 'gWgWgWgW', 'WWWWWWWW'], ancla: [4, 5] },
  { id: 'rosca_reyes', nombre: 'Rosca de Reyes', slot: 'mano', cat: 'navidad', precio: 11, desc: 'Si te sale el muñeco, invitas los tamales.', rows: ['..tttttt..', '.tryGtyrt.', 'tt......tt', '.tttttttt.'], ancla: [5, 3] },
  { id: 'esfera', nombre: 'Esfera Navideña', slot: 'mano', cat: 'navidad', precio: 8, desc: 'Una esfera de vidrio: I = ⅔·m·r² (cascarón delgado).', rows: ['..y..', '.yyy.', '.rrr.', 'rrWrr', 'rrrrr', '.rrr.'], ancla: [2, 0] },
  // ── Ciencia ficción ──
  { id: 'casco_ciber', nombre: 'Cabeza de Robot', slot: 'cabeza', cat: 'scifi', precio: 12, desc: 'Cabeza completa de autómata, con antena. Calcula trayectorias en tiempo real.', rows: ['......cc......', '......ll......', '.llllllllllll.', 'llWlllllllllll', 'lleeeeeeeeeell', 'lecccceeccccel', 'lecBcceecBccel', 'lecccceeccccel', 'lleeeeeeeeeell', 'llleWeWeWeWlll', '.llleeeeeelll.', '..llllllllll..'], ancla: [7, 5] },
  { id: 'visor_ciber', nombre: 'Visor Cyberpunk', slot: 'cara', cat: 'scifi', precio: 10, desc: 'Luz de neón sobre los ojos. Ves los vectores de fuerza.', rows: ['eeeeeeeeeeeeee', 'ecfcfcfcfcfcfe', 'eeeeeeeeeeeeee'], ancla: [8, 1] },
  { id: 'pistola_rayos', nombre: 'Pistola de Rayos', slot: 'mano', cat: 'scifi', precio: 12, desc: 'Dispara fotones: momento sin masa, p = E/c.', rows: ['...c....', '.lllll..', 'lcclllvv', '.lll....', '..e.....', '..e.....'], ancla: [2, 4] },
  { id: 'antenas_alien', nombre: 'Antenas Alienígenas', slot: 'cabeza', cat: 'scifi', precio: 8, desc: 'Captan señales de otras galaxias (y de tu profesor).', rows: ['v.....v', '.v...v.', '..vvv..'], ancla: [3, 3] },
  { id: 'botas_cohete', nombre: 'Botas Cohete', slot: 'pies', cat: 'scifi', precio: 14, desc: 'Empuje = flujo de masa × velocidad de salida. ¡Despegue!', rows: ['.lll..', '.lll..', '.llll.', 'llllll', '.oyo..', '..o...'], ancla: [3, 4] },
  { id: 'sable_verde', nombre: 'Sable de Plasma Verde', slot: 'mano', cat: 'scifi', precio: 12, desc: 'Plasma contenido por un campo magnético. Muy verde.', rows: ['.W.', 'vWv', 'vWv', 'vWv', 'vWv', 'vWv', 'vWv', 'vWv', 'vWv', 'vWv', 'vWv', 'vWv', 'lll', 'dld', 'ldl', 'ddd'], ancla: [1, 13] },
  // ── De las Criptas (personajes, ecos y almas) ──
  { id: 'alas_icaro', nombre: 'Alas de Ícaro', slot: 'cabeza', cat: 'criptas', precio: 14, desc: 'Cera nueva. Esta vez, vuela más bajo.', rows: ['W.........W', 'WW.......WW', '.Ww.....wW.', '..ww...ww..', '...wwwww...'], ancla: [5, 5] },
  { id: 'yelmo_llama', nombre: 'Yelmo de la Llama', slot: 'cabeza', cat: 'criptas', precio: 15, desc: 'De Sir Autocompleto. La llama ya no dicta: sólo ilumina.', rows: ['...a...', '..aoa..', '.aoyoa.', '..ooo..', '.lllll.'], ancla: [3, 5] },
  { id: 'escudo_det', nombre: 'Escudo del Determinante', slot: 'mano', cat: 'criptas', precio: 15, desc: 'De Sir Dextro: |i j k| grabado en el frente. No necesita mano derecha.', rows: ['.uuuuu.', 'uWWWWWu', 'uWuWuWu', 'uWWWWWu', 'uWuWuWu', '.uWWWu.', '..uuu..'], ancla: [3, 3] },
  { id: 'pluma_ayudante', nombre: 'Pluma sin Tinta', slot: 'mano', cat: 'criptas', precio: 10, desc: 'De la Ayudante Sin Nombre. Calificó diez mil diagramas.', rows: ['W..', 'WW.', '.WW', '..n', '..n', '..n'], ancla: [2, 4] },
  { id: 'piedra_duda', nombre: 'Piedra de la Duda', slot: 'mano', cat: 'criptas', precio: 11, desc: 'Del Encadenado. Ya no pesa: alguien hizo la pregunta.', rows: ['..l...', '.llll.', 'lkkkkl', 'llllkl', 'llkkll', 'llllll', 'llkll.'], ancla: [2, 0] },
  { id: 'ojo_am', nombre: 'Ojo de AM', slot: 'cara', cat: 'criptas', precio: 16, desc: 'Un monóculo rojo que nunca parpadea. Odia… pero ve muy bien.', rows: ['.kkk.', 'krRrk', 'kRWRk', 'krRrk', '.kkk.'], ancla: [0, 2] },
  { id: 'sombrero_myriam', nombre: 'Sombrero de Myriam', slot: 'cabeza', cat: 'criptas', precio: 16, desc: 'Se lo robaste a la Hechicera Oscura. Ella lo sabe.', rows: ['.....pp.....', '....pppp....', '...pppppp...', '...pPPPPp...', 'pppppppppppp'], ancla: [6, 5] },
  { id: 'lentes_profe', nombre: 'Lentes del Profesor', slot: 'cara', cat: 'criptas', precio: 10, desc: 'Para revisar exámenes a la luz de una vela.', rows: ['llll.llll', 'lBBlllBBl', 'llll.llll'], ancla: [4, 1] },
  { id: 'tomo_hib', nombre: 'Tomo de Hibbelerius', slot: 'mano', cat: 'criptas', precio: 14, desc: 'Capítulos 12 al 15. Pesa más que el Coloso.', rows: ['RRRRRR', 'RyyyyR', 'RyRRyR', 'RyyyyR', 'RRRRRR', 'WWWWWW'], ancla: [3, 3] },
  { id: 'peluca_newton', nombre: 'Peluca de Newton', slot: 'cabeza', cat: 'criptas', precio: 12, desc: 'Rizos de 1687, año de los Principia.', rows: ['.wwwwww.', 'wwWwwWww', 'ww....ww', 'w......w', 'w......w'], ancla: [4, 2] },
  { id: 'manzana', nombre: 'Manzana de Newton', slot: 'mano', cat: 'criptas', precio: 6, desc: 'Cayó con a = 9.81 m/s². La historia hizo el resto.', rows: ['..g.', '.Gn.', 'rrrr', 'rWrr', 'rrrr', '.rr.'], ancla: [2, 3] },
  { id: 'bobina_tesla', nombre: 'Bobina de Tesla', slot: 'mano', cat: 'criptas', precio: 13, desc: 'Resonancia eléctrica. Chispas incluidas.', rows: ['.B.B.', 'BBcBB', '.lll.', '.yyy.', '.yyy.', '.yyy.', '.lll.', '..n..', '..n..'], ancla: [2, 7] },
  { id: 'melena_einstein', nombre: 'Melena de Einstein', slot: 'cabeza', cat: 'criptas', precio: 12, desc: 'Despeinada a velocidades relativistas.', rows: ['w.w.w.w.w', '.wwwwwww.', 'wwwwwwwww', 'ww.....ww'], ancla: [4, 3] },
  { id: 'mascara_layla', nombre: 'Máscara de Layla', slot: 'cabeza', cat: 'criptas', precio: 18, desc: 'Atigrada, con bigotes y ojos verdes. Layla dice que no se parece. Miau.', rows: ['q..........q', 'qq........qq', 'qsq......qsq', 'qqqqqqqqqqqq', 'qnqnqqqqnqnq', 'qqqqqqqqqqqq', 'qGGkqqqqGGkq', 'qqqqqWWqqqqq', 'qqqqqsWqqqqq', 'qnqWWWWWWqnq', '.qqWWWWWWqq.', '..qqqqqqqq..'], ancla: [6, 5] },
  // ── v0.34 · escudos chistosos (van en la mano de atrás; el caballero deja su escudo normal) ──
  {
    id: 'esc_pizza', nombre: 'Escudo de Pizza', slot: 'escudo', cat: 'escudos', precio: 8, desc: 'A = πr². Más radio, más área, más queso.',
    rows: [".....OOO.....", "...OOOnOOO...", "..OnnyyYnnO..", ".OnyyYyyrrnO.", ".OnrryyyrrnO.", "OOyrryyyyyyOO", "OnyyyyyyyyYnO", "OOyyyyyyYyyOO", ".OnyyyYrrynO.", ".OnyrryrrynO.", "..OnnyyynnO..", "...OOOnOOO...", ".....OOO....."], ancla: [6.0, 6.0],
  },
  {
    id: 'esc_tortilla', nombre: 'Tortilla de Harina', slot: 'escudo', cat: 'escudos', precio: 4, desc: 'Norteña y gigante. Resistencia al impacto: dudosa.',
    rows: [".....TuT.....", "...TuTTTuT...", "..TTTTTTuTu..", ".TTuTTTTTTTT.", ".TTTTTTuTTTu.", "TTuTTTTTTTTuT", "uTTTTTuTTTTTu", "TuTTTTTTTTuTT", ".uTTTuTTTTTT.", ".TTTTTTTTuTT.", "..uTuTTTTTT..", "...TuTTTuT...", ".....TuT....."], ancla: [6.0, 6.0],
  },
  {
    id: 'esc_concha', nombre: 'Concha de Vainilla', slot: 'escudo', cat: 'escudos', precio: 5, desc: 'Pan dulce reforzado. Las grietas del azúcar no son fallas estructurales.',
    rows: [".....uuu.....", "...uuusuuu...", "..usssSsssu..", ".usSsSsSsSsu.", ".ussSsssSssu.", "uusSsSsSsSsuu", "usSsssSsssSsu", "uusSsSsSsSsuu", ".ussSsssSssu.", ".usSsSsSsSsu.", "..usssSsssu..", "...uuusuuu...", ".....uuu....."], ancla: [6.0, 6.0],
  },
  {
    id: 'esc_olla', nombre: 'Tapa de Olla Exprés', slot: 'escudo', cat: 'escudos', precio: 6, desc: 'PV = nRT. Si silba, aléjate.',
    rows: [".....lll.....", "...llwwwll...", "..lwwwwwwwl..", ".lwwwwwwwwwl.", ".lWwwwwwwwwl.", "lwwWwdddwwwwl", "lwwwWdddwwwwl", "lwwwwdddwwwwl", ".lwwwwWwwwwl.", ".lwwwwwWwwwl.", "..lwwwwwWwl..", "...llwwwll...", ".....lll....."], ancla: [6.0, 6.0],
  },
  {
    id: 'esc_alto', nombre: 'Señal de ALTO', slot: 'escudo', cat: 'escudos', precio: 7, desc: 'Fuerza neta = 0. Literalmente.',
    rows: ["...WWWWWWW...", "..WrrrrrrrW..", ".WrrrrrrrrrW.", "WrrrrrrrrrrrW", "WrrrrrrrrrrrW", "WrWWWWWWWWWrW", "WrWWWWWWWWWrW", "WrWWWWWWWWWrW", "WrrrrrrrrrrrW", "WrrrrrrrrrrrW", ".WrrrrrrrrrW.", "..WrrrrrrrW..", "...WWWWWWW..."], ancla: [6.0, 6.0],
  },
  {
    id: 'esc_hibbeler', nombre: 'El Hibbeler (14ª ed.)', slot: 'escudo', cat: 'escudos', precio: 9, desc: 'Bloquea todo… menos las preguntas del examen.',
    rows: ["Bbbbbbbbbb", "Bbbbbbbbbb", "BbWWWWWWbb", "BbWyyyyWbb", "BbWWWWWWbb", "Bbbbbbbbbb", "BbbbYYbbbb", "BbbYyyYbbb", "BbbbYYbbbb", "Bbbbbbbbbb", "BbWWWWWWbb", "Bbbbbbbbbb", "BBBBBBBBBB"], ancla: [4.5, 6.0],
  },
  {
    id: 'esc_vinilo', nombre: 'Vinilo de Synth Funk', slot: 'escudo', cat: 'escudos', precio: 8, desc: '33⅓ rpm: ω ≈ 3.49 rad/s. Layla lo aprueba.',
    rows: [".....eee.....", "...eddddde...", "..ededddede..", ".eddeedeedde.", ".deeWrrrdeed.", "edderrrrredde", "edddrrkrrddde", "edderrrrredde", ".deedrrrdeed.", ".eddeedeedde.", "..ededddede..", "...eddddde...", ".....eee....."], ancla: [6.0, 6.0],
  },
  {
    id: 'esc_galleta', nombre: 'Galleta Gigante', slot: 'escudo', cat: 'escudos', precio: 5, desc: 'Con chispas de chocolate. Masa: la suficiente.',
    rows: [".....CCC.....", "...CCcccCC...", "..CcccccccC..", ".CcNcccccccC.", ".CccNccccccC.", "CccccNccccccC", "CcccccNcccccC", "CccccccNccccC", ".CccccccNccC.", ".CcccccccNcC.", "..CcccccccC..", "...CCcccCC...", ".....CCC....."], ancla: [6.0, 6.0],
  },
  {
    id: 'esc_sandia', nombre: 'Rebanada de Sandía', slot: 'escudo', cat: 'escudos', precio: 4, desc: '92 % agua: ρ casi de 1000 kg/m³.',
    rows: ["gGrrrrrrrrrGg", "gGrrkrrrkrrGg", ".gGrrrrrrrGg.", ".gGrrkrrkrGg.", "..gGrrrrrGg..", "...gGGGGGg...", "....ggggg...."], ancla: [6.0, 3.0],
  },
  {
    id: 'esc_tupper', nombre: 'Tupper de la Abuela', slot: 'escudo', cat: 'escudos', precio: 6, desc: 'Con tamales adentro. Si lo pierdes, no regreses.',
    rows: [".bbbbbbbbbbbb.", "bBBBBBBBBBBBBb", "bBbbbbbbbbbbBb", "bBbWWWWWWWWbBb", "bBbWkkWkWkWbBb", "bBbWWWWWWWWbBb", "bBbbbbbbbbbbBb", "bBBBBBBBBBBBBb", ".bbbbbbbbbbbb."], ancla: [6.5, 4.0],
  },
  {
    id: 'esc_carton', nombre: 'Cartón del Proyecto Final', slot: 'escudo', cat: 'escudos', precio: 3, desc: 'Hecho a las 3 a. m. Aguanta lo justo para la entrega.',
    rows: ["cccccTTccccc", "cxxxxTTxxxxc", "cxxxxTTxxxxc", "cxkkxTTxkxkc", "cxkxkTTxkkxc", "cxkkxTTxkxkc", "cxkxxTTxkxkc", "cxxxxTTxxxxc", "cxxxxTTxxxxc", "cxxxxTTxxxxc", "cccccTTccccc"], ancla: [5.5, 5.0],
  },
  // ── v0.36 · piezas de los sets (también se venden sueltas) ──
  { id: 'pico_peste', nombre: 'Máscara de Pico', slot: 'cara', cat: 'criptas', precio: 8, desc: 'El pico llevaba hierbas: el primer filtro de aire de la historia.', rows: ["..WWWWWWW......", ".WWWWWWWWWW....", "WWkkWWkkWWWWW..", "WkBBkkBBkWWWWW.", "WWkkWWkkWWWwwww", "WWWWWWWWWwwww..", ".WWWWWWWww.....", "..WWWWWWW......"], ancla: [4.5, 3] },
  { id: 'sombrero_ala', nombre: 'Sombrero de Ala Ancha', slot: 'cabeza', cat: 'criptas', precio: 6, desc: 'Ala ancha: más área, más resistencia del aire al caer.', rows: ["....dddddd....", "....dddddd....", "....dddddd....", "....eeeeee....", "dddddddddddddd", ".dddddddddddd."], ancla: [7, 6] },
  { id: 'farol', nombre: 'Farol de Aceite', slot: 'mano', cat: 'criptas', precio: 6, desc: 'Combustión lenta: energía química → luz y calor.', rows: ["..k..", ".ddd.", "dyoyd", "doyod", "dyoyd", ".ddd.", "..n..", "..n..", "..n.."], ancla: [2, 7] },
  { id: 'bombin', nombre: 'Bombín Raído', slot: 'cabeza', cat: 'criptas', precio: 5, desc: 'Remendado tres veces. Como el pozo que cava.', rows: ["...dddd...", "..dddddd..", "..dedddd..", "..eeeeee..", "dddddddddd"], ancla: [5, 5] },
  { id: 'pala', nombre: 'Pala de Sepulturero', slot: 'mano', cat: 'criptas', precio: 6, desc: 'Trabajo = F·d: cada palada cuenta.', rows: [".lll.", "lllll", "lllll", "llwll", ".lll.", "..n..", "..n..", "..n..", "..n..", "..n..", "..n..", ".nnn."], ancla: [2, 9] },
  { id: 'esc_lapida', nombre: 'Lápida', slot: 'escudo', cat: 'criptas', precio: 7, desc: 'Q.E.P.D. Pesa como 80 kg, pero protege.', rows: ["...llll...", ".llllllll.", "llllllllll", "llllelllll", "lllleeelll", "llllelllll", "llllelllll", "llllllllll", "llllllllll", "llllllllll", "gggggggggg"], ancla: [4.5, 5] },
  { id: 'corona_engranes', nombre: 'Corona de Engranes', slot: 'cabeza', cat: 'criptas', precio: 7, desc: 'Cada engrane transmite el torque al siguiente: τ₁/r₁ = τ₂/r₂.', rows: ["y.y.y.y.y", "yyyyyyyyy", "yYkYyYkYy", "yyyyyyyyy"], ancla: [4, 4] },
  { id: 'pendulo', nombre: 'Maza de Péndulo', slot: 'mano', cat: 'criptas', precio: 8, desc: 'T = 2π√(L/g): no depende de la masa de la bola.', rows: [".nnn.", "..n..", "..Y..", "..Y..", "..Y..", "..Y..", "..Y..", ".yyy.", "yyYyy", "yYkYy", "yyYyy", ".yyy."], ancla: [2, 0] },
  { id: 'esc_reloj', nombre: 'Escudo de Reloj', slot: 'escudo', cat: 'criptas', precio: 8, desc: 'Las 3:00. Siempre son las 3:00 en las criptas.', rows: [".....YYY.....", "...YYWkWYY...", "..YWWWWWWWY..", ".YWWWWkWWWWY.", ".YWWWWkWWWWY.", "YWWWWWkWWWWWY", "YkWWWWkkkkWkY", "YWWWWWWWWWWWY", ".YWWWWWWWWWY.", ".YWWWWWWWWWY.", "..YWWWWWWWY..", "...YYWkWYY...", ".....YYY....."], ancla: [6, 6] },
  { id: 'capucha_monje', nombre: 'Capucha de Monje', slot: 'cabeza', cat: 'criptas', precio: 9, desc: 'En la oscuridad sólo se ven los ojos. Voto de silencio (y de estudio).', rows: [".....HHHH.....", "...HHHHHHHH...", "..HHHHHHHHHH..", ".HHHJJJJJJHHH.", ".HHJkkkkkkJHH.", "HHJkkkkkkkkJHH", "HHJkkkykkkykJH", "HHJkkkkkkkkJHH", "HHHJkkkkkkJHHH", "HHHHJJJJJJHHHH", ".HHHHHHHHHHHH.", "..HHHHHHHHHH.."], ancla: [7, 5] },
  { id: 'campana', nombre: 'Campana de Bronce', slot: 'mano', cat: 'criptas', precio: 6, desc: 'Resuena a su frecuencia natural. Dong.', rows: ["..n..", "..n..", ".yyy.", "yyyyy", "yyYyy", "yyyyy", "YYYYY", "..k.."], ancla: [2, 1] },
  { id: 'goggles', nombre: 'Goggles de Latón', slot: 'cara', cat: 'scifi', precio: 6, desc: 'Protegen del vapor a 100 °C (a 1 atm).', rows: ["YYYY.YYYY", "YBBYYYBBY", "YBiYnYBiY", "YYYY.YYYY"], ancla: [4, 1] },
  { id: 'matraz', nombre: 'Matraz Burbujeante', slot: 'mano', cat: 'scifi', precio: 5, desc: 'PV = nRT: si calientas, sube la presión. Cuidado.', rows: ["..ll..", "..ll..", "..ll..", ".lGGl.", "lGGGGl", "lGvGGl", "lGGGvl", ".llll."], ancla: [2, 5] },
  { id: 'bandera_exp', nombre: 'Bandera de la Expedición', slot: 'mano', cat: 'scifi', precio: 5, desc: 'En la Luna, g = 1.62 m/s²: la bandera casi flota.', rows: ["nyyyyy", "nykkky", "nyyyyy", "n.....", "n.....", "n.....", "n.....", "n.....", "n.....", "n....."], ancla: [0, 7] },
  { id: 'cinturon', nombre: 'Cinturón de Campeón', slot: 'mano', cat: 'mexico', precio: 8, desc: 'Impulso = F·Δt: la plancha desde la tercera cuerda.', rows: ["kk.....kk", "kyyyyyyyk", "kyYrrrYyk", "kyyyyyyyk", "kk.....kk"], ancla: [4, 2] },
  { id: 'colmillos', nombre: 'Colmillos', slot: 'cara', cat: 'halloween', precio: 4, desc: 'Para morder los problemas difíciles.', rows: ["WkkkkW", ".W..W."], ancla: [2.5, -3] },
  // v0.58 · set «Cazador de Ecos» (original): capucha con broche de plata, antifaz de cuero con lentes de latón y ballesta de resorte
  { id: 'capucha_cazador', nombre: 'Capucha del Cazador', slot: 'cabeza', cat: 'criptas', precio: 7, desc: 'Cuero encerado contra la lluvia de las criptas. El broche de plata es para las noches largas.',
    rows: ['.....kkkk.....', '...kkJJJJkk...', '..kJJJHHJJJk..', '.kJJHHHHHHJJk.', '.kJHHJJJJHHJk.', 'kJJHJk..kJHJJk', 'kJJJk....kJJJk', 'kJJk......kJJk', 'kJJk......kJJk', 'kiJk......kJJk', '.kk........kk.'], ancla: [7, 5] },
  { id: 'antifaz_cazador', nombre: 'Antifaz del Cazador', slot: 'cara', cat: 'criptas', precio: 5, desc: 'Lentes de latón ahumado: ves los ecos sin que los ecos te vean a ti.',
    rows: ['NNNNNNNNNNN', 'NUyUNNNUyUN', 'NUUUN.NUUUN', '.NNN...NNN.'], ancla: [5, 1] },
  { id: 'ballesta_resorte', nombre: 'Ballesta de Resorte', slot: 'mano', cat: 'armas', precio: 8, desc: 'E = ½·k·x²: mientras más estiras la cuerda, más energía guarda el virote.',
    rows: ['.......kl..', '.......l.w.', '......l..w.', 'NNNNNNNNNNy', 'nnnnnnNl.w.', '..nn...l.w.', '..nn....kl.', '..nn.......'], ancla: [3, 5] },
  // v0.70 · yelmos medievales (cubren el casco de cualquier clase)
  { id: 'yelmo_cubeta', nombre: 'Yelmo de Cubeta', slot: 'cabeza', cat: 'clasicos', precio: 8, desc: 'El gran yelmo de los cruzados: pesado, cerrado y con respiraderos. Más masa en la cabeza, más momento de inercia.',
    rows: ['..llllllll..', '.llllllllll.', 'lllllyylllll', 'lllllyylllll', 'lkkkkyykkkkl', 'lllllyylllll', 'llelelyylele', 'lllllyylllll', '.llllllllll.', '..eeeeeeee..'], ancla: [6, 4] },
  { id: 'celada', nombre: 'Celada', slot: 'cabeza', cat: 'clasicos', precio: 7, desc: 'Yelmo del siglo XV con cola hacia atrás y una rendija para ver. Aerodinámica medieval.',
    rows: ['....llllll..', '..llllllllll', '.lllllllllll', 'llllllllllll', 'llllkkkkkkkl', 'lll.........', 'll..........'], ancla: [6, 4] },
  { id: 'candelabro', nombre: 'Candelabro', slot: 'mano', cat: 'criptas', precio: 7, desc: 'Tres llamas, la misma presión atmosférica.', rows: ["y.y.y", "o.o.o", "W.W.W", "W.W.W", "YYYYY", "..Y..", "..Y..", ".YYY."], ancla: [2, 6] },
];

// v0.35 · los colores con precio (campo tienda en src/art/palette.ts) también se venden
const NOMBRE_PARTE = { cape: 'Capa', armor: 'Armadura', visor: 'Visor' } as const;
for (const [parte, lista] of [['cape', CAPES], ['armor', ARMORS], ['visor', VISORS]] as const) {
  lista.forEach((c, idx) => {
    if (c.tienda === undefined || !c.id || c.enSet) return;
    const efecto = c.fuego ? ' En llamas: el fuego sube por la tela y te envuelve.' : c.forma ? ' Cambia la forma de la armadura, no sólo el color.' : c.cosmos ? ' Efecto cósmico: nebulosa en movimiento y estrellas que titilan.' : c.holo !== undefined ? ' Holográfico: cambia de color con el tiempo.' : '';
    ACCESORIOS.push({ id: c.id, nombre: `${NOMBRE_PARTE[parte]} ${c.name}`, slot: 'cabeza', cat: 'colores', precio: c.tienda, desc: `Color de ${NOMBRE_PARTE[parte].toLowerCase()}.${efecto}`, rows: [], ancla: [0, 0], color: { parte, idx } });
  });
}

// ── v0.36 · SETS: varias piezas + una capa exclusiva, con 25 % de descuento sobre lo que te falte ──
export const DESCUENTO_SET = 0.25;
const SETS: { id: string; nombre: string; desc: string; piezas: string[]; capa: string }[] = [
  { id: 'set_peste', nombre: 'Doctor de la Peste', desc: 'Máscara de pico, sombrero de ala ancha, farol y capa de cera negra. El pico llevaba hierbas: el primer filtro de aire.', piezas: ['pico_peste', 'sombrero_ala', 'farol'], capa: 'col_capa_cera' },
  { id: 'set_sepulturero', nombre: 'Sepulturero', desc: 'Bombín raído, pala, lápida de escudo y capa color tierra. Trabajo = F·d: cada palada cuenta.', piezas: ['bombin', 'pala', 'esc_lapida'], capa: 'col_capa_tumba' },
  { id: 'set_pendulo', nombre: 'Caballero de Péndulo', desc: 'Corona de engranes, maza de péndulo, escudo de reloj y capa de latón. T = 2π√(L/g).', piezas: ['corona_engranes', 'pendulo', 'esc_reloj'], capa: 'col_capa_laton' },
  { id: 'set_monje', nombre: 'Monje de la Campana', desc: 'Capucha, campana de bronce y hábito gris. La campana resuena a su frecuencia natural.', piezas: ['capucha_monje', 'campana'], capa: 'col_capa_habito' },
  { id: 'set_conde', nombre: 'Conde de las Criptas', desc: 'Colmillos, candelabro y capa de terciopelo. Un aristócrata gótico que nunca ve el sol.', piezas: ['colmillos', 'candelabro', 'copa'], capa: 'col_capa_terciopelo' },
  { id: 'set_alquimista', nombre: 'Alquimista de Vapor', desc: 'Goggles de latón, matraz, sombrero de copa y capa de cobre. PV = nRT con estilo.', piezas: ['goggles', 'matraz', 'copa'], capa: 'col_capa_cobre' },
  { id: 'set_astronauta', nombre: 'Astronauta de las Criptas', desc: 'Escafandra, botas lunares, bandera y traje blanco. En la Luna, g = 1.62 m/s².', piezas: ['astronauta', 'botas_espacio', 'bandera_exp'], capa: 'col_capa_espacial' },
  { id: 'set_cazador', nombre: 'Cazador de Ecos', desc: 'Capucha con broche de plata, antifaz de latón, ballesta de resorte y gabardina de ceniza. Caza de noche, estudia de día.', piezas: ['capucha_cazador', 'antifaz_cazador', 'ballesta_resorte'], capa: 'col_capa_ceniza' },
  { id: 'set_luchador', nombre: 'Luchador', desc: 'Máscara, cinturón de campeón y capa de lentejuela. Impulso = F·Δt desde la tercera cuerda.', piezas: ['mascara_luchador', 'cinturon'], capa: 'col_capa_lentejuela' },
];
// v0.46 · premios del Abismo de los Ejes (no están a la venta; se ganan con logros)
ACCESORIOS.push(
  { id: 'casco_buzo', nombre: 'Casco de Buzo 1931', slot: 'cabeza', logro: 'abismo_primigenio', precio: 0, desc: 'De latón y vidrio. Para bajar a donde duermen los Primigenios.',
    rows: ['...YYYY...', '..YyyyyY..', '.YyBBBByY.', '.YyBiiByY.', '.YyBBBByY.', '..YyyyyY..', '.YYYYYYYY.'], ancla: [5, 7] },
  { id: 'sombrero_montemayor', nombre: 'Sombrero de Montemayor', slot: 'cabeza', logro: 'abismo_diario8', precio: 0, desc: 'El sombrero de explorador del erudito. Todavía huele a cueva.',
    rows: ['...nnnn...', '..nnnnnn..', '..NNNNNN..', 'nnnnnnnnnn'], ancla: [5, 4] },
  { id: 'monoculo', nombre: 'Monóculo de Montemayor', slot: 'cara', logro: 'abismo_diario', precio: 0, desc: 'Con él leyó el último registro. Ve ejes donde nadie más los ve.',
    rows: ['.....yyy', '.....yiy', '.....yyy', '......y.', '......y.'], ancla: [4, 1] },
  { id: 'sonrisa_oro', nombre: 'Sonrisa de Oro', slot: 'cara', logro: 'abismo_dentadura', precio: 0, desc: 'Ocho dientes, ocho huecos. Sonríe y que tiemble el Abismo.',
    rows: ['.........', '.........', '.........', '..yWyWy..', '...yyy...'], ancla: [4, 0] },
  // v0.47 · el mito de Lovecraft: un premio por cada jefe del Abismo
  { id: 'mascara_cthulhu', nombre: 'Máscara de Cthulhu', slot: 'cara', logro: 'abismo_cthulhu', precio: 0, desc: 'Ph\'nglui mglw\'nafh… La máscara sueña contigo puesta.',
    rows: ['....GGGGGGG....', '...GgggggggG...', '..GgggggggggG..', '.GgggGgggGgggG.', '.GgggggggggggG.', 'GgggyygggyygggG', 'GgggykgggykgggG', 'GgggggGgGgggggG', '.GgggGgggGgggG.', '.GgGgGgGgGgGgG.', '.G.G.G.G.G.G.G.', '.g.G.g.G.g.G.g.', '..G.g.G.g.G.g..', '..g...g...g....'], ancla: [7, 6] },
  { id: 'mascara_palida', nombre: 'Máscara Pálida', slot: 'cara', logro: 'abismo_hastur', precio: 0, desc: '«¿Y la máscara?» «Yo no llevo máscara.» (El Rey de Amarillo, 1895)',
    rows: ['...yyyyyyy...', '..yWWWWWWWy..', '.yWWWWWWWWWy.', '.yWkkWWWkkWy.', '.yWWWWWWWWWy.', '.yWWWWkWWWWy.', '..yWWWWWWWy..', '..yyWWWWWyy..', '...yyyyyyy...'], ancla: [6, 3] },
  { id: 'corona_amarilla', nombre: 'Corona del Rey de Amarillo', slot: 'cabeza', logro: 'abismo_hastur', precio: 0, desc: 'Nadie debería leer la segunda parte de la obra. Tú ya la leíste.',
    rows: ['y...y...y...y', 'yR.yyy.yyy.By', 'yyyyyyyyyyyyy', 'yYyYyRyYyYyYy', 'yyyyyyyyyyyyy'], ancla: [6, 5] },
  { id: 'tocado_faraon', nombre: 'Tocado del Faraón Negro', slot: 'cabeza', logro: 'abismo_nyarlathotep', precio: 0, desc: 'Nyarlathotep tiene mil máscaras. Esta te la prestó.',
    rows: ['.....yyy.....', '....kyyyk....', '...kykykyk...', '..kykykykyk..', '.kykykykykyk.', 'kykykykykykyk', 'k.yyyyyyyyy.k'], ancla: [6, 6] },
  { id: 'esferas_yog', nombre: 'Esferas de Yog-Sothoth', slot: 'cabeza', logro: 'abismo_yogSothoth', precio: 0, desc: 'La Llave y la Puerta flotan sobre tu cabeza. No las cuentes: cambian.',
    rows: ['.BB.....PP...', 'BiBB...PsPP..', 'BBBB...PPPP..', '.BB.....PP.BB', '..........BiB', '...yy.....BBB', '..yaay.....B.', '..yyyy.......', '...yy........'], ancla: [6, 11] },
  { id: 'necronomicon_mano', nombre: 'Necronomicón de Hibbelerius', slot: 'mano', logro: 'abismo_geometra', precio: 0, desc: 'El tomo de la cueva del Cerro de la Silla. Los problemas se resuelven solos… o eso parece.',
    rows: ['NNNNNN', 'NnnnnN', 'NnrrnN', 'NnrrnN', 'NnnnnN', 'NNNNNN'], ancla: [0, 3] },
  { id: 'tridente_dagon', nombre: 'Tridente de Dagón', slot: 'mano', logro: 'abismo_dagon', precio: 0, desc: 'P = ρ·g·h: mientras más hondo, más pesa. Y más pica.',
    rows: ['G.G.G', 'G.G.G', 'GGGGG', '..G..', '..g..', '..g..', '..g..', '..g..', '..g..', '..g..', '..g..', '..g..', '..g..', '..g..', '..g..', '..g..'], ancla: [2, 13] },
  { id: 'telescopio', nombre: 'Telescopio de Providence', slot: 'mano', logro: 'abismo_providence', precio: 0, desc: 'Regalo del Astrónomo Aficionado de Providence. Apunta a estrellas que no existen.',
    rows: ['.......YY', '.....yyY.', '...yyy...', '.yyy.....', 'k........', '.k.......', '..k......'], ancla: [1, 4] },
  // v0.56 · La Entropía (la escultura del campus) hecha casco
  { id: 'casco_entropia', nombre: 'Casco de la Entropía', slot: 'cabeza', logro: 'abismo_entropia', precio: 0, desc: 'Bloques amarillos que nunca vuelven a acomodarse: ΔS ≥ 0. Lo ganaste perdiendo la cordura… y sobreviviendo.',
    rows: ['.....ay......', '....aYya..ay.', '...ayYa.ayYa.', '..aYya.aYya..', '.ayYa.ayYa.ay', 'aYyaYyaYyaYya', 'lllllllllllll'], ancla: [6, 6] },
  { id: 'calculadora_domada', nombre: 'Calculadora Domada', slot: 'mano', logro: 'abismo_calculadora', precio: 0, desc: 'Ya está en DEG. Ya no tiene tentáculos. Casi.',
    rows: ['llllll', 'lBBBBl', 'lBrBBl', 'llllll', 'lwlwyl', 'lwlwyl', 'lwlwRl', 'llllll', '.p..p.'], ancla: [2, 5] },
  // v0.59 · Astros Ambulantes (un premio por planeta)
  { id: 'sandalias_mercurio', nombre: 'Sandalias de Mercurio', slot: 'pies', logro: 'abismo_astro_mercurio', precio: 0, desc: 'Con alitas, como las del mensajero de los dioses. Mercurio da una vuelta al Sol en 88 días.',
    rows: ['W.W...', '.WW...', '.yyy..', '.yyyyy', 'YYYYYY'], ancla: [3, 5] },
  { id: 'yelmo_marte', nombre: 'Yelmo de Marte', slot: 'cabeza', logro: 'abismo_astro_marte', precio: 0, desc: 'Del dios de la guerra. En Marte pesarías sólo el 38 %: g = 3.71 m/s².',
    rows: ['.....RRR.....', '....RrrrR....', '...rrrrrrr...', '..rrrRrRrrr..', '.rrrrrrrrrrr.', 'rrrrrrrrrrrrr'], ancla: [6, 6] },
  { id: 'esc_gran_mancha', nombre: 'Escudo de la Gran Mancha', slot: 'escudo', logro: 'abismo_astro_jupiter', precio: 0, desc: 'Una tormenta más grande que la Tierra, que lleva más de 300 años girando. Te mira.',
    rows: ['...TTTTTTT...', '.TTuuuuuuuTT.', 'TuuTTTTTTTuuT', 'TTTTToooTTTTT', 'TuuuoWkWouuuT', 'TTTTToooTTTTT', 'TuuTTTTTTTuuT', '.TTuuuuuuuTT.', '...TTTTTTT...'], ancla: [6, 4] },
  { id: 'anillos_saturno', nombre: 'Anillos de Saturno', slot: 'cabeza', logro: 'abismo_astro_saturno', precio: 0, desc: 'Hielo y roca girando sobre tu cabeza. Saturno es tan poco denso que flotaría en el agua.',
    rows: ['.....yyyyy.....', '..yyYYYYYYYyy..', 'yyY.........Yyy', '..yyYYYYYYYyy..', '.....yyyyy.....', '...............'], ancla: [7, 6] },
  { id: 'corona_solar', nombre: 'Corona Solar', slot: 'cabeza', logro: 'abismo_astro_sol', precio: 0, desc: 'Plasma a un millón de grados. E = m·c²: el Sol pierde 4 millones de toneladas por segundo para brillar.',
    rows: ['a.....a.....a', '.a...aaa...a.', '..a.aoooa.a..', 'aaaaoooooaaaa', '.aooooooooooa', 'ooooooooooooo'], ancla: [6, 6] },
  // v0.60 · un casco o escudo por astro
  { id: 'casco_mercurio', nombre: 'Casco Alado de Mercurio', slot: 'cabeza', logro: 'abismo_astro_mercurio', precio: 0, desc: 'El casco del mensajero de los dioses. Con él darías la vuelta al Sol en 88 días… si aguantas los 430 °C de día.',
    rows: ['W...........W', 'WW...lll...WW', '.WW.lllll.WW.', '..Wlllllllw..', '..lllllllll..', '.lllllllllll.'], ancla: [6, 6] },
  { id: 'esc_venus', nombre: 'Escudo de las Nubes de Venus', slot: 'escudo', logro: 'abismo_astro_venus', precio: 0, desc: 'Nubes de ácido sulfúrico con un ojo que no parpadea. Aguanta 92 atmósferas de presión.',
    rows: ['...uuuuuuu...', '.uuTTTTTTTuu.', 'uTTTWWTTTTTTu', 'uTTWTTTWWTTTu', 'uTTTTvvvTTWTu', 'uTWTvWkWvTTTu', 'uTTWTvvvTTTTu', 'uTTTWTTTTWTTu', '.uuTTTWWTTuu.', '...uuuuuuu...', '....v...v....'], ancla: [6, 5] },
  { id: 'esc_marte', nombre: 'Escudo de Fobos y Deimos', slot: 'escudo', logro: 'abismo_astro_marte', precio: 0, desc: 'El ojo rojo con su boca de cañón y sus dos lunas: el miedo y el terror.',
    rows: ['...RRRRRRR...', '.RRrrrrrrrRR.', 'RrrWWWrrrrrlR', 'RrrrrrrrrrrrR', 'RrrkkkkkkrrrR', 'RrrrWrWrWrrrR', 'RlrrrrrrrrrrR', '.RRrrrrrrrRR.', '...RRRRRRR...'], ancla: [6, 4] },
  { id: 'esc_saturno', nombre: 'Escudo de los Anillos', slot: 'escudo', logro: 'abismo_astro_saturno', precio: 0, desc: 'Saturno con su anillo de hielo. ρ = 0.69 g/cm³: este escudo flotaría.',
    rows: ['...nnnnnnn...', '.nnTTTTTTTnn.', 'nTTTTyyyTTTTn', 'nTTTyYYYyTTTn', 'naaaaaaaaaaan', 'nTTTyYYYyTTTn', 'nTTTTyyyTTTTn', '.nnTTTTTTTnn.', '...nnnnnnn...'], ancla: [6, 4] },
  { id: 'esc_sol', nombre: 'Escudo del Ojo Solar', slot: 'escudo', logro: 'abismo_astro_sol', precio: 0, desc: 'Un ojo de plasma a 5500 °C. No lo mires directamente (en serio, nunca mires el Sol).',
    rows: ['...ooooooo...', '.ooaaaaaaaoo.', 'oaaaWWWWWaaao', 'oaaWWaaaWWaao', 'oaaWakkkaWaao', 'oaaWWaaaWWaao', 'oaaaWWWWWaaao', '.ooaaaaaaaoo.', '...ooooooo...'], ancla: [6, 4] },
  // v0.51 · Las Tierras del Sueño
  { id: 'cuernos_shub', nombre: 'Cuernos de la Cabra Negra', slot: 'cabeza', logro: 'abismo_shubNiggurath', precio: 0, desc: '¡Iä! ¡Shub-Niggurath! Mil retoños te reconocen como familia.',
    rows: ['N...............N', 'NN.............NN', '.NN...........NN.', '.NNh.........hNN.', '..NNh.......hNN..', '..dNNh.....hNNd..', '...ddddddddddd...'], ancla: [8, 6] },
  { id: 'corona_yig', nombre: 'Corona de Serpientes de Yig', slot: 'cabeza', logro: 'abismo_yig', precio: 0, desc: 'Yig no perdona a quien lastima a sus hijos. A ti te dejó esta corona.',
    rows: ['.G...G...G...G.', 'GrG.GrG.GrG.GrG', '.g...g...g...g.', '.g...g...g...g.', 'ggggggggggggggg', 'gyGyGyGyGyGyGyg', 'ggggggggggggggg'], ancla: [7, 6] },
  { id: 'mascara_esfinge', nombre: 'Máscara de la Esfinge', slot: 'cara', logro: 'abismo_cincoCabezas', precio: 0, desc: 'Bajo la Esfinge había algo con cinco cabezas. Esta cara es la que muestra hacia afuera.',
    rows: ['...ybybybybyb...', '..ybybybybybyb..', '.ybybqqqqqqbyby.', 'ybybqqqqqqqqbyby', 'bybqqkkqqkkqqyby', 'ybyqqqqqqqqqqbyb', 'bybqqqqqkqqqqyby', 'ybyqqqqqqqqqqbyb', 'bybyqqkkkkqqybyb', '.ybyqqqqqqqqyby.', '.byb.qqqqqq.byb.', '..b...bybb...b..', '......bybb......'], ancla: [7.5, 4] },
  { id: 'idolo_bokrug', nombre: 'Ídolo de Bokrug', slot: 'mano', logro: 'abismo_bokrug', precio: 0, desc: 'El ídolo verde de Ib. Sarnath se lo robó y Sarnath ya no existe. Cuídalo.',
    rows: ['..GG...', '.GgGG..', '.GggG.k', 'GGggGGk', '.GggG..', '.GgGG..', '..GgG..', '.G.G.G.', 'G..G..G'], ancla: [3, 6] },
  { id: 'gorro_sonador', nombre: 'Gorro del Soñador', slot: 'cabeza', logro: 'abismo_sueno1', precio: 0, desc: 'Para bajar los escalones del sueño ligero sin despertarte.',
    rows: ['..........a.', '.........aWa', '.......bb.a.', '.....bbbbb..', '...bbbbBbb..', '..bbBbbbbb..', '.bbbbbbBbbb.', 'WWWWWWWWWWWW'], ancla: [6, 7] },
  { id: 'llave_plata', nombre: 'La Llave de Plata', slot: 'mano', logro: 'abismo_sueno3', precio: 0, desc: 'Randolph Carter la encontró en el desván. Gírala y vuelves a soñar como cuando eras niño.',
    rows: ['.iii.', 'i.W.i', 'iWlWi', 'i.W.i', '.iii.', '..i..', '..i..', '..i..', '..ii.', '..i..', '..iii'], ancla: [2, 5] },
);
for (const a of ACCESORIOS) if (a.logro) a.cat = 'criptas';

for (const st of SETS) ACCESORIOS.push({ id: st.id, nombre: st.nombre, slot: 'cabeza', cat: 'sets', precio: 0, desc: st.desc, rows: [], ancla: [0, 0], set: { piezas: st.piezas, capa: st.capa } });

export const ACC = Object.fromEntries(ACCESORIOS.map((a) => [a.id, a])) as Record<string, Accesorio>;

/** Momentum por jefes vencidos en una expedición (acumulado): Coloso 2, Bruja 3, Hibbelerius 5, AM 5 */
export const MOMENTUM_JEFES = [0, 2, 5, 10, 15];
/** v0.80 · Momentum del Abismo según cuántos jefes de tramo venciste: tramo 1 → 5, Primigenio (tramo 2) → +10, cada tramo sin fondo → +5 */
export function momentumAbismo(tramosVencidos: number) {
  let m = 0;
  for (let t = 1; t <= tramosVencidos; t++) m += t === 1 ? 5 : t === 2 ? 10 : 5;
  return m;
}
/** Regalo diario de Layla por entrar al juego */
export const REGALO_DIARIO = 1;
/** Descuento de la oferta del día */
export const OFERTA = 0.4;

/** Día (número entero, hora local) para elegir la oferta: todos los alumnos ven la misma */
export function diaNum(hoy = new Date()) {
  return Math.floor(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) / 86400000);
}

/** La oferta del día (−40 %): cambia cada día, igual para todo el grupo (los sets ya traen descuento) */
export function ofertaDelDia(hoy = new Date()) {
  const n = diaNum(hoy);
  const sueltos = ACCESORIOS.filter((a) => !a.set && !a.logro);
  return sueltos[(n * 7919) % sueltos.length];
}

/** ¿Ya tienes el artículo? (un set cuenta si tienes todas sus piezas y su capa) */
export function loTiene(a: Accesorio, compras: string[]) {
  return a.set ? [...a.set.piezas, a.set.capa].every((id) => compras.includes(id)) : compras.includes(a.id);
}

/** Precio de un set: 25 % menos que lo que te falte de él */
export function precioSet(a: Accesorio, compras: string[]) {
  if (!a.set) return a.precio;
  const capa = CAPES.find((c) => c.id === a.set!.capa);
  const falta = a.set.piezas.filter((id) => !compras.includes(id)).reduce((s, id) => s + (ACC[id]?.precio ?? 0), 0)
    + (capa && !compras.includes(capa.id!) ? capa.tienda ?? 0 : 0);
  return Math.max(1, Math.round(falta * (1 - DESCUENTO_SET)));
}

/** Precio de hoy (con la oferta si aplica) */
export function precioHoy(a: Accesorio, hoy = new Date()) {
  return ofertaDelDia(hoy).id === a.id ? Math.max(1, Math.round(a.precio * (1 - OFERTA))) : a.precio;
}

/** Artículos de una categoría (o todos) */
export function catalogo(cat: Cat | 'todo') {
  const venta = ACCESORIOS.filter((a) => !a.logro); // los premios del Abismo no se venden
  return cat === 'todo' ? venta : venta.filter((a) => a.cat === cat);
}

/** Frases de Layla */
export const LAYLA = [
  '«Miau. Sólo acepto Momentum: p = m·v. Lo demás no me interesa.»',
  '«¿Ves mis rayas? Atigrada «caballa». Las tuyas no cuentan, humano.»',
  '«Duermo 16 horas al día. Conservo la energía mejor que cualquier sistema cerrado.»',
  '«Si me empujas de la mesa, caigo con a = g. Como todo. Pero no lo intentes.»',
  '«Mis bigotes miden distancias. Mi cola, el equilibrio. Mi tienda, tu Momentum.»',
  '«Un vaso en el borde de la mesa es energía potencial esperando a ser liberada. Por mí.»',
  '«Cada día rebajo un artículo. Los martes duermo. Los miércoles también.»',
  '«Hibbelerius me debe tres latas de atún. Si lo ves, recuérdaselo.»',
  '«¿Sabías que salto hasta 6 veces mi altura? Todo es fuerza en las patas traseras.»',
  '«AM me ofreció un pacto. Le respondí con un rasguño. Sin boca, pero no sin uñas.»',
  '«Compra algo bonito. Luego póntelo en «Forjar héroe». Yo no visto a nadie, miau.»',
  '«Ícaro me quiso vender sus alas derretidas. No acepto mercancía usada.»',
  '«La curiosidad mató al gato… pero la física lo trajo de vuelta. Siete veces.»',
  '«La oferta del día cambia a medianoche. Si no vienes, te la pierdes. Miau.»',
  '«¿Ergios? Esos se quedan en las criptas. Aquí se paga con Momentum.»',
  '«Ronroneo a 25 Hz. Es física, no cariño. Bueno… un poco de cariño.»',
  '«Vence jefes y vuelve. Mientras más lejos llegues, más Momentum traes.»',
  '«Caí de un librero y aterricé de pie. Conservación del momento angular, humano.»',
  '«¿Tacos al pastor? ¿Conchas? Vendo comida de mentira. La de verdad me la como yo.»',
  '«Sir Dextro me pagó con la mano izquierda. Le hice descuento por el esfuerzo.»',
  '«Myriam quiso su sombrero de vuelta. Se lo vendí… a otro alumno.»',
  '«El Tomo de Hibbelerius es para el que lo aguante. Yo duermo encima.»',
];
