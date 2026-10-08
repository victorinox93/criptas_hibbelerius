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

export type Slot = 'cabeza' | 'mano';

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
  /** cabeza: centro inferior; mano: punto de agarre [x, y] dentro de la matriz */
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
];

export const ACC = Object.fromEntries(ACCESORIOS.map((a) => [a.id, a])) as Record<string, Accesorio>;

/** Momentum por jefes vencidos en una expedición (acumulado): Coloso 2, Bruja 3, Hibbelerius 5, AM 5 */
export const MOMENTUM_JEFES = [0, 2, 5, 10, 15];
/** Regalo diario de Layla por entrar al juego */
export const REGALO_DIARIO = 1;
/** Artículos de rotación por semana */
export const ROTACION = 4;

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
  '«Cada lunes traigo mercancía nueva. Si no vienes, otro se la lleva. Miau.»',
  '«¿Ergios? Esos se quedan en las criptas. Aquí se paga con Momentum.»',
  '«Ronroneo a 25 Hz. Es física, no cariño. Bueno… un poco de cariño.»',
  '«Vence jefes y vuelve. Mientras más lejos llegues, más Momentum traes.»',
  '«Caí de un librero y aterricé de pie. Conservación del momento angular, humano.»',
];
