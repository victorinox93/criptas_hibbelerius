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

export type Slot = 'cabeza' | 'cara' | 'mano' | 'pies';
export const SLOTS: { id: Slot; nombre: string }[] = [
  { id: 'cabeza', nombre: 'Cabeza' }, { id: 'cara', nombre: 'Cara' }, { id: 'mano', nombre: 'Mano' }, { id: 'pies', nombre: 'Pies' },
];

export type Cat = 'clasicos' | 'armas' | 'udem' | 'mexico' | 'halloween' | 'muertos' | 'navidad' | 'scifi' | 'criptas';
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
];
export const NOMBRE_CAT = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nombre])) as Record<Cat, string>;

export interface Accesorio {
  id: string;
  nombre: string;
  slot: Slot;
  precio: number;
  desc: string;
  rows: string[];
  /** cabeza: centro inferior · cara: centro de los ojos · mano: punto de agarre · pies: centro inferior de UNA bota (se dibujan dos) */
  ancla: [number, number];
  cat?: Cat; // categoría en la tienda (se completa en CAT_DE si falta)
}

/** Colores de los accesorios (independientes de la capa y la armadura del héroe) */
export const PAL_ACC: Record<string, string> = {
  k: '#0d0b10', W: '#f0ece4', w: '#c8c4bc', r: '#c8323a', R: '#7a1a20', o: '#f08a1a', O: '#b85a10', y: '#e8c15a', Y: '#a87a2a',
  n: '#7a5232', N: '#4a3020', g: '#3a8a3a', G: '#8ad06a', m: '#b8d878', p: '#6a3a8a', P: '#a86ac8', s: '#f0a0b8', b: '#3a5a9a', B: '#9ad8f0', d: '#2a2433', l: '#9a93a8',
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
    id: 'calabaza', nombre: 'Calabaza', slot: 'cabeza', cat: 'halloween', precio: 10, desc: 'Para la noche de brujas. Cuidado con la Bruja de la Fricción.',
    rows: ['....g.....', '..oooooo..', '.oOkooOko.', '.oooooooo.', '.ookkkkoo.', '..oooooo..'], ancla: [5, 6],
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
    id: 'astronauta', nombre: 'Casco de Astronauta', slot: 'cabeza', cat: 'scifi', precio: 10, desc: 'En la Luna, g = 1.62 m/s². Aquí no te sirve, pero luce.',
    rows: ['...WWWWWW...', '..WBBBBBBW..', '.WBWBBBBBBW.', '.WBBWBBBBBW.', '.WBBBBBBBBW.', '.WBBBBBBBBW.', '..WBBBBBBW..', '..WWWWWWWW..', '..llllllll..'], ancla: [6, 3],
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
    rows: ['.WWWWWWW.', 'WWkWWWkWW', 'WrWWkWWrW', '.WkWkWkW.'], ancla: [4, 1],
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
  { id: 'termo', nombre: 'Termo Universitario', slot: 'mano', cat: 'udem', precio: 5, desc: 'Conserva el calor: casi un sistema aislado.', rows: ['.ll.', 'uuuu', 'uyyu', 'uuuu', 'uUUu', 'uuuu', '.uu.'], ancla: [1, 4] },
  // ── México ──
  { id: 'sombrero_charro', nombre: 'Sombrero de Charro', slot: 'cabeza', cat: 'mexico', precio: 12, desc: 'Ala ancha, momento de inercia enorme. ¡Ajúa!', rows: ['.....nnnn.....', '....nyyyyn....', '....nnnnnn....', '.nnnnnnnnnnnn.', 'nyynnyynnyynny'], ancla: [7, 5] },
  { id: 'mascara_luchador', nombre: 'Máscara de Luchador', slot: 'cara', cat: 'mexico', precio: 9, desc: 'Llave de tercera ley: toda acción tiene su reacción… en el ring.', rows: ['.rrrrrrr.', 'rWWrrrWWr', 'rWkrrrkWr', '.rryyyrr.'], ancla: [4, 2] },
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
  { id: 'venda_momia', nombre: 'Vendas de Momia', slot: 'cara', cat: 'halloween', precio: 8, desc: 'Tres mil años de antigüedad y todavía con dudas de Dinámica.', rows: ['WwWwWwWwW', 'Wk.WwW.kW', 'wWwWwWwWw'], ancla: [4, 1] },
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
  { id: 'casco_ciber', nombre: 'Casco Cibernético', slot: 'cabeza', cat: 'scifi', precio: 12, desc: 'Con antena y visor de datos. Calcula trayectorias en tiempo real.', rows: ['...c...', '...l...', '.lllll.', 'llBBBll', 'lllllll'], ancla: [3, 5] },
  { id: 'visor_ciber', nombre: 'Visor Cyberpunk', slot: 'cara', cat: 'scifi', precio: 10, desc: 'Luz de neón sobre los ojos. Ves los vectores de fuerza.', rows: ['eeeeeeeee', 'cfcfcfcfc'], ancla: [4, 0] },
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
];

export const ACC = Object.fromEntries(ACCESORIOS.map((a) => [a.id, a])) as Record<string, Accesorio>;

/** Momentum por jefes vencidos en una expedición (acumulado): Coloso 2, Bruja 3, Hibbelerius 5, AM 5 */
export const MOMENTUM_JEFES = [0, 2, 5, 10, 15];
/** Regalo diario de Layla por entrar al juego */
export const REGALO_DIARIO = 1;
/** Descuento de la oferta del día */
export const OFERTA = 0.4;

/** Día (número entero, hora local) para elegir la oferta: todos los alumnos ven la misma */
export function diaNum(hoy = new Date()) {
  return Math.floor(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) / 86400000);
}

/** La oferta del día (−40 %): cambia cada día, igual para todo el grupo */
export function ofertaDelDia(hoy = new Date()) {
  const n = diaNum(hoy);
  return ACCESORIOS[(n * 7919) % ACCESORIOS.length];
}

/** Precio de hoy (con la oferta si aplica) */
export function precioHoy(a: Accesorio, hoy = new Date()) {
  return ofertaDelDia(hoy).id === a.id ? Math.max(1, Math.round(a.precio * (1 - OFERTA))) : a.precio;
}

/** Artículos de una categoría (o todos) */
export function catalogo(cat: Cat | 'todo') {
  return cat === 'todo' ? ACCESORIOS : ACCESORIOS.filter((a) => a.cat === cat);
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
