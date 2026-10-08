// ════════════════════════════════════════════════════════════════
//  TIENDA DE LAYLA (menú principal) y MOMENTUM (p = m·v)
//  · Momentum se gana al vencer jefes (más mientras más lejos llegas)
//    y Layla regala 1 al día por entrar.
//  · La tienda cambia cada semana (4 artículos) y tiene artículos de
//    TEMPORADA que sólo se venden en ciertas fechas (Día de Muertos,
//    Navidad…). Lo que compras es tuyo para siempre.
//  · Los accesorios se dibujan sobre el héroe de cualquier clase
//    (cabeza o mano); un accesorio de mano reemplaza al arma.
// ════════════════════════════════════════════════════════════════

export type Slot = 'cabeza' | 'cara' | 'mano' | 'pies';
export const SLOTS: { id: Slot; nombre: string }[] = [
  { id: 'cabeza', nombre: 'Cabeza' }, { id: 'cara', nombre: 'Cara' }, { id: 'mano', nombre: 'Mano' }, { id: 'pies', nombre: 'Pies' },
];

export interface Temporada {
  nombre: string;
  desde: string; // 'MM-DD'
  hasta: string; // 'MM-DD' (si es menor que «desde», cruza el año)
}

export interface Accesorio {
  id: string;
  nombre: string;
  slot: Slot;
  precio: number;
  desc: string;
  rows: string[];
  /** cabeza: centro inferior · cara: centro de los ojos · mano: punto de agarre · pies: centro inferior de UNA bota (se dibujan dos) */
  ancla: [number, number];
  temporada?: string; // id de TEMPORADAS
}

export const TEMPORADAS: Record<string, Temporada> = {
  muertos: { nombre: 'Día de Muertos', desde: '10-01', hasta: '11-05' },
  navidad: { nombre: 'Navidad', desde: '12-01', hasta: '01-06' },
  amor: { nombre: 'Día del Amor y la Amistad', desde: '02-07', hasta: '02-16' },
};

/** Colores de los accesorios (independientes de la capa y la armadura del héroe) */
export const PAL_ACC: Record<string, string> = {
  k: '#0d0b10', W: '#f0ece4', w: '#c8c4bc', r: '#c8323a', R: '#7a1a20', o: '#f08a1a', O: '#b85a10', y: '#e8c15a', Y: '#a87a2a',
  n: '#7a5232', N: '#4a3020', g: '#3a8a3a', G: '#8ad06a', m: '#b8d878', p: '#6a3a8a', P: '#a86ac8', s: '#f0a0b8', b: '#3a5a9a', B: '#9ad8f0', d: '#2a2433', l: '#9a93a8',
};

export const ACCESORIOS: Accesorio[] = [
  // ── siempre en rotación (4 por semana) ──
  {
    id: 'orejas_gato', nombre: 'Orejas de Gato', slot: 'cabeza', precio: 4, desc: 'Como las de Layla. Miau.',
    rows: ['o........o', 'oo......oo', 'oso....oso', 'ooo....ooo'], ancla: [5, 4],
  },
  {
    id: 'copa', nombre: 'Sombrero de Copa', slot: 'cabeza', precio: 6, desc: 'Elegancia victoriana para un caballero de la masa.',
    rows: ['..dddd..', '..dddd..', '..dddd..', '..rrrr..', 'dddddddd'], ancla: [4, 5],
  },
  {
    id: 'laurel', nombre: 'Corona de Laurel', slot: 'cabeza', precio: 5, desc: 'Para quien ya venció a Hibbelerius… o eso cree.',
    rows: ['g.G.g.G.g.G', 'GgGgGgGgGgG'], ancla: [5, 2],
  },
  {
    id: 'birrete', nombre: 'Birrete de Graduación', slot: 'cabeza', precio: 8, desc: 'Aprobaste Dinámica. En el juego, al menos.',
    rows: ['dddddddddd', '.dddddddd.', '..dddddd.y', '..dddddd.y', '.........y'], ancla: [4, 4],
  },
  {
    id: 'latigo', nombre: 'Látigo', slot: 'mano', precio: 6, desc: 'F = m·a, pero con estilo de arqueólogo.',
    rows: ['..nnn...', '.n...n..', 'n.....n.', 'n.....n.', '.n...n..', '..n.n...', '...N....', '...N....', '...N....', '...N....'], ancla: [3, 8],
  },
  {
    id: 'matcha', nombre: 'Vaso de Matcha', slot: 'mano', precio: 4, desc: 'Energía para un turno más. (No da energía.)',
    rows: ['....W.', '...W..', 'WWWWW.', 'WmmmW.', 'WGmGW.', 'WmmmW.', 'WmGmW.', '.WWW..'], ancla: [2, 5],
  },
  {
    id: 'tridente', nombre: 'Tridente', slot: 'mano', precio: 8, desc: 'Tres puntas: ΣF = F₁ + F₂ + F₃.',
    rows: ['y.y.y', 'y.y.y', 'yyyyy', '..y..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..', '..n..'], ancla: [2, 15],
  },
  {
    id: 'guadana', nombre: 'Guadaña Pequeña', slot: 'mano', precio: 8, desc: 'Inspirada en Hibbelerius. No se lo digas.',
    rows: ['WWWWW...', 'w..WWW..', '.....WWn', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.', '......n.'], ancla: [6, 11],
  },
  {
    id: 'espada_madera', nombre: 'Espada de Madera', slot: 'mano', precio: 3, desc: 'De entrenamiento. Pega igual (en el juego, sí).',
    rows: ['.n.', 'nnn', 'nnn', 'nnn', 'nnn', 'nnn', 'nnn', 'nnn', 'nnn', 'NNN', 'YYYYY', '.N.', '.N.'], ancla: [1, 11],
  },
  {
    id: 'calculadora', nombre: 'Calculadora Científica', slot: 'mano', precio: 5, desc: 'En modo DEG, por favor. (Sir Radián aprueba.)',
    rows: ['dddddd', 'dBBBBd', 'dBBBBd', 'dddddd', 'dlldld', 'dlldld', 'dlldrd', 'dddddd'], ancla: [3, 6],
  },
  // ── Día de Muertos ──
  {
    id: 'cempasuchil', nombre: 'Corona de Cempasúchil', slot: 'cabeza', precio: 6, temporada: 'muertos', desc: 'Flor de veinte pétalos para guiar a las almas en pena.',
    rows: ['.o.O.o.O.o.', 'oOoOoOoOoOo', '.g.g.g.g.g.'], ancla: [5, 3],
  },
  {
    id: 'catrina', nombre: 'Sombrero de Catrina', slot: 'cabeza', precio: 9, temporada: 'muertos', desc: 'Elegante como la Catrina de Posada.',
    rows: ['....pppp....', '...pppppp...', '...oyrOoP...', 'pppppppppppp', '.pppppppppp.'], ancla: [6, 5],
  },
  {
    id: 'pan_muerto', nombre: 'Pan de Muerto', slot: 'mano', precio: 4, temporada: 'muertos', desc: 'Con azúcar. Las huesitos son decoración, no física.',
    rows: ['...yy...', '.yyNNyy.', 'yyNyyNyy', 'yyyyyyyy', '.yyyyyy.'], ancla: [4, 3],
  },
  {
    id: 'calabaza', nombre: 'Calabaza', slot: 'cabeza', precio: 5, temporada: 'muertos', desc: 'Para la noche de brujas. Cuidado con la Bruja de la Fricción.',
    rows: ['....g.....', '..oooooo..', '.oOkooOko.', '.oooooooo.', '.ookkkkoo.', '..oooooo..'], ancla: [5, 6],
  },
  // ── Navidad ──
  {
    id: 'gorro_navidad', nombre: 'Gorro Navideño', slot: 'cabeza', precio: 6, temporada: 'navidad', desc: '¡Jo, jo, jo! La masa de los regalos no se conserva.',
    rows: ['........WW', '.......WWW', '......rr..', '....rrrr..', '...rrrrr..', '..rrrrrrr.', '.WWWWWWWW.', '.WWWWWWWW.'], ancla: [5, 8],
  },
  {
    id: 'baston_caramelo', nombre: 'Bastón de Caramelo', slot: 'mano', precio: 4, temporada: 'navidad', desc: 'Momento de torsión dulce.',
    rows: ['.WrW.', 'r...W', 'W...r', '....W', '....r', '....W', '....r', '....W', '....r', '....W', '....r', '....W'], ancla: [4, 9],
  },
  // ── Día del Amor y la Amistad ──
  {
    id: 'rosa', nombre: 'Rosa Roja', slot: 'mano', precio: 4, temporada: 'amor', desc: 'Para tu compañero de estudio favorito.',
    rows: ['.rr.', 'rRrr', '.rr.', '.g..', '.gG.', '.g..', '.g..', '.g..'], ancla: [1, 6],
  },
  // ── v0.26 · cascos ──
  {
    id: 'vikingo', nombre: 'Casco Vikingo', slot: 'cabeza', precio: 7, desc: 'Cuernos de hueso. (Los vikingos reales no los usaban, pero se ven bien.)',
    rows: ['w..........w', 'ww..llll..ww', '.wllllllllw.', '.llllllllll.', '.yyyyyyyyyy.'], ancla: [6, 4],
  },
  {
    id: 'espartano', nombre: 'Casco Espartano', slot: 'cabeza', precio: 8, desc: 'Con penacho rojo. Esto es… ¡DINÁMICA!',
    rows: ['..rrrrrr..', '.rrRrrRrr.', '...yyyy...', '..yyyyyy..', '.yyyyyyyy.', '.yyY..Yyy.'], ancla: [5, 4],
  },
  {
    id: 'astronauta', nombre: 'Casco de Astronauta', slot: 'cabeza', precio: 10, desc: 'En la Luna, g = 1.62 m/s². Aquí no te sirve, pero luce.',
    rows: ['...WWWWWW...', '..WBBBBBBW..', '.WBWBBBBBBW.', '.WBBWBBBBBW.', '.WBBBBBBBBW.', '.WBBBBBBBBW.', '..WBBBBBBW..', '..WWWWWWWW..', '..llllllll..'], ancla: [6, 3],
  },
  {
    id: 'minero', nombre: 'Casco de Minero', slot: 'cabeza', precio: 5, desc: 'Con lámpara, para las Galerías de la Fricción.',
    rows: ['...yyyy...', '..yyWByy..', '.yyyyyyyy.', 'yyyyyyyyyy'], ancla: [5, 4],
  },
  {
    id: 'kabuto', nombre: 'Kabuto de Samurái', slot: 'cabeza', precio: 9, desc: 'Yelmo con cuernos dorados. Disciplina y momento angular.',
    rows: ['..y......y..', '...y....y...', '....yyyy....', '..rrrrrrrr..', '.rRrRrRrRrr.', 'rrrrrrrrrrrr'], ancla: [6, 5],
  },
  {
    id: 'corona_real', nombre: 'Corona Real', slot: 'cabeza', precio: 10, desc: 'Para el primer lugar del ranking. O para quien la compre.',
    rows: ['y.y.y.y.y', 'yyyyyyyyy', 'yryyByyry', 'yyyyyyyyy'], ancla: [4, 4],
  },
  // ── v0.26 · cara ──
  {
    id: 'lentes_sol', nombre: 'Lentes de Sol', slot: 'cara', precio: 4, desc: 'Demasiado cool para el Abismo.',
    rows: ['ddddkdddd', '.dd...dd.'], ancla: [4, 0],
  },
  {
    id: 'lentes_nerd', nombre: 'Lentes de Pasta', slot: 'cara', precio: 3, desc: 'Para leer el Hibbeler sin perder detalle.',
    rows: ['kkkkkkkkk', 'kBBk.kBBk', 'kkkk.kkkk'], ancla: [4, 1],
  },
  {
    id: 'monoculo', nombre: 'Monóculo', slot: 'cara', precio: 5, desc: 'Muy distinguido. Muy siglo XIX.',
    rows: ['.yyy', 'yWBy', '.yyy', '...y', '...y'], ancla: [2, 1],
  },
  {
    id: 'parche', nombre: 'Parche de Pirata', slot: 'cara', precio: 4, desc: '¡Arrr! La fuerza de flotación también aplica en altamar.',
    rows: ['kkkkkkkkkk', '...kkk....', '...kkk....'], ancla: [4, 0],
  },
  {
    id: 'bigote', nombre: 'Bigote Elegante', slot: 'cara', precio: 3, desc: 'Al estilo de Einstein (o casi).',
    rows: ['nn....nn', '.nnnnnn.'], ancla: [4, -2],
  },
  // ── v0.26 · pies ──
  {
    id: 'vaqueras', nombre: 'Botas Vaqueras', slot: 'pies', precio: 6, desc: 'Con espuelas. Yiijaa: fricción garantizada.',
    rows: ['.nnn..', '.nYn..', '.nnn..', '.nnnnn', 'NN.lNN'], ancla: [3, 5],
  },
  {
    id: 'tenis', nombre: 'Tenis Rojos', slot: 'pies', precio: 5, desc: 'Más fricción estática para arrancar rápido.',
    rows: ['.rr...', '.rrr..', 'rrrrrr', 'WWWWWW'], ancla: [3, 4],
  },
  {
    id: 'pantuflas', nombre: 'Pantuflas de Gato', slot: 'pies', precio: 4, desc: 'Regalo de Layla para los días de estudio en casa.',
    rows: ['q...q.', 'qqqqqq', 'qkqkqq', 'qqsqqq'], ancla: [3, 4],
  },
  {
    id: 'botas_espacio', nombre: 'Botas Lunares', slot: 'pies', precio: 7, desc: 'Suela pesada: más masa, menos rebote.',
    rows: ['.WWW..', '.WWW..', '.WWWW.', 'WWWWWW', 'llllll'], ancla: [3, 5],
  },
  // ── v0.26 · armas (guiños a otros juegos y películas) ──
  {
    id: 'sable_azul', nombre: 'Sable Láser Azul', slot: 'mano', precio: 10, desc: 'Una hoja de plasma. La energía cinética de los electrones nunca fue tan elegante.',
    rows: ['.W.', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'BWB', 'lll', 'dld', 'ldl', 'ddd'], ancla: [1, 13],
  },
  {
    id: 'sable_rojo', nombre: 'Sable Láser Rojo', slot: 'mano', precio: 10, desc: 'El lado oscuro de la fuerza… neta.',
    rows: ['.W.', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'rWr', 'lll', 'dld', 'ldl', 'ddd'], ancla: [1, 13],
  },
  {
    id: 'espada_gigante', nombre: 'Espada del Mercenario', slot: 'mano', precio: 9, desc: 'Más grande que tú. La inercia de esa hoja es enorme.',
    rows: ['.ll.', 'llll', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'lwwl', 'llll', 'yyyyyy', '.nn.', '.nn.', '.yy.'], ancla: [2, 15],
  },
  {
    id: 'martillo_trueno', nombre: 'Martillo del Trueno', slot: 'mano', precio: 9, desc: 'De la mitología nórdica. Sólo lo levanta quien domina F = m·a.',
    rows: ['llllll', 'lwwwwl', 'lwwwwl', 'llllll', '..nn..', '..nn..', '..nn..', '..nn..', '..NN..', '..y...'], ancla: [2, 7],
  },
  {
    id: 'pico', nombre: 'Pico de Minero', slot: 'mano', precio: 5, desc: 'Para picar bloques… y rocas de las criptas.',
    rows: ['.llll..', 'l..n.ll', '...n...', '...n...', '...n...', '...n...', '...n...', '...n...'], ancla: [3, 6],
  },
  {
    id: 'arco', nombre: 'Arco Élfico', slot: 'mano', precio: 7, desc: 'Energía potencial elástica convertida en cinética. Física pura.',
    rows: ['nn..', '.nw.', '..nw', '..nw', '..nw', '..nw', '..nw', '..nw', '.nw.', 'nn..'], ancla: [2, 5],
  },
  {
    id: 'llave_inglesa', nombre: 'Llave Inglesa', slot: 'mano', precio: 4, desc: 'Momento de torsión: M = F·d. Mientras más larga, menos esfuerzo.',
    rows: ['l..l', 'l..l', 'llll', '.ll.', '.ll.', '.ll.', '.ll.', '.ll.', '.ll.'], ancla: [1, 7],
  },
  {
    id: 'varita', nombre: 'Varita Estelar', slot: 'mano', precio: 6, desc: 'Ilumina las fórmulas. No las resuelve por ti.',
    rows: ['.y.', 'yyy', '.y.', '.n.', '.n.', '.n.', '.n.', '.n.'], ancla: [1, 6],
  },
  // ── Día de Muertos (extra) ──
  {
    id: 'mascara_calavera', nombre: 'Máscara de Calavera', slot: 'cara', precio: 5, temporada: 'muertos', desc: 'Calaverita de azúcar con flores.',
    rows: ['.WWWWWWW.', 'WWkWWWkWW', 'WrWWkWWrW', '.WkWkWkW.'], ancla: [4, 1],
  },
  // ── Navidad (extra) ──
  {
    id: 'botas_duende', nombre: 'Botas de Duende', slot: 'pies', precio: 5, temporada: 'navidad', desc: 'Con punta enroscada y cascabel.',
    rows: ['....gy', '.gg.g.', '.ggg..', 'gggggg', 'rrrrrr'], ancla: [3, 5],
  },
];

export const ACC = Object.fromEntries(ACCESORIOS.map((a) => [a.id, a])) as Record<string, Accesorio>;

/** Momentum por jefes vencidos en una expedición (acumulado): Coloso 2, Bruja 3, Hibbelerius 5, AM 5 */
export const MOMENTUM_JEFES = [0, 2, 5, 10, 15];
/** Regalo diario de Layla por entrar al juego */
export const REGALO_DIARIO = 1;
/** Artículos de rotación por semana */
export const ROTACION = 5;

const mmdd = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function temporadaActiva(id: string, hoy = new Date()) {
  const t = TEMPORADAS[id];
  if (!t) return false;
  const x = mmdd(hoy);
  return t.desde <= t.hasta ? x >= t.desde && x <= t.hasta : x >= t.desde || x <= t.hasta;
}

/** Número de semana (lunes a domingo) para la rotación */
export function semana(hoy = new Date()) {
  const d = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
  const dia = (d.getUTCDay() + 6) % 7;
  return Math.floor((d.getTime() / 86400000 - dia + 3) / 7);
}

/** Días que faltan para que cambie la rotación (el lunes) */
export function diasParaRotar(hoy = new Date()) {
  return 7 - ((hoy.getDay() + 6) % 7);
}

/** Lo que vende Layla hoy: rotación semanal + temporada */
export function inventario(hoy = new Date()) {
  const fijos = ACCESORIOS.filter((a) => !a.temporada);
  // barajado determinista por semana (todos los alumnos ven lo mismo)
  let s = semana(hoy) * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const orden = [...fijos].sort(() => rnd() - 0.5);
  const rot = orden.slice(0, ROTACION);
  const temp = ACCESORIOS.filter((a) => a.temporada && temporadaActiva(a.temporada, hoy));
  return { rot, temp };
}

/** Fecha de fin de una temporada, legible */
export function hastaTexto(id: string) {
  const t = TEMPORADAS[id];
  const [m, d] = t.hasta.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d} de ${meses[m - 1]}`;
}

/** Frases de Layla */
export const LAYLA = [
  '«Miau. Sólo acepto Momentum: p = m·v. Lo demás no me interesa.»',
  '«¿Ves mis rayas? Atigrada «caballa». Las tuyas no cuentan, humano.»',
  '«Duermo 16 horas al día. Conservo la energía mejor que cualquier sistema cerrado.»',
  '«Si me empujas de la mesa, caigo con a = g. Como todo. Pero no lo intentes.»',
  '«Mis bigotes miden distancias. Mi cola, el equilibrio. Mi tienda, tu Momentum.»',
  '«Un vaso en el borde de la mesa es energía potencial esperando a ser liberada. Por mí.»',
  '«Los lunes cambio la mercancía. Los martes duermo. Los miércoles también.»',
  '«Hibbelerius me debe tres latas de atún. Si lo ves, recuérdaselo.»',
  '«¿Sabías que salto hasta 6 veces mi altura? Todo es fuerza en las patas traseras.»',
  '«AM me ofreció un pacto. Le respondí con un rasguño. Sin boca, pero no sin uñas.»',
  '«Compra algo bonito. Luego póntelo en «Forjar héroe». Yo no visto a nadie, miau.»',
  '«Ícaro me quiso vender sus alas derretidas. No acepto mercancía usada.»',
  '«La curiosidad mató al gato… pero la física lo trajo de vuelta. Siete veces.»',
  '«Cada lunes traigo mercancía nueva. Si no vienes, otro se la lleva. Miau.»',
  '«¿Ergios? Esos se quedan en las criptas. Aquí se paga con Momentum.»',
  '«Ronroneo a 25 Hz. Es física, no cariño. Bueno… un poco de cariño.»',
  '«Vence jefes y vuelve. Mientras más lejos llegues, más Momentum traes.»',
  '«Caí de un librero y aterricé de pie. Conservación del momento angular, humano.»',
];
