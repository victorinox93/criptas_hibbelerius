// ════════════════════════════════════════════════════════════════
//  «¿MÁS O MENOS?» (minijuego de la Taberna, doble o nada)
//  Aparecen dos cosas con su masa y su rapidez. Eliges cuál tiene MÁS
//  energía cinética (K = ½·m·v²) o MÁS cantidad de movimiento (p = m·v).
//  Cada acierto duplica tu apuesta; puedes retirarte cuando quieras.
//  Para agregar objetos: copia una línea [nombre, masa en kg, rapidez en m/s].
//  (Valores aproximados, del orden de magnitud real.)
// ════════════════════════════════════════════════════════════════

export type Objeto = [string, number, number];

export const OBJETOS: Objeto[] = [
  ['Una bala de 9 mm', 0.008, 360],
  ['Un balón de fútbol pateado', 0.43, 25],
  ['Una pelota de béisbol lanzada', 0.145, 40],
  ['Una pelota de ping-pong en un remate', 0.0027, 30],
  ['Una persona corriendo', 70, 5],
  ['Usain Bolt a toda velocidad', 94, 12.4],
  ['Un auto a 10 km/h', 1200, 2.8],
  ['Un auto en carretera (100 km/h)', 1200, 27.8],
  ['Un elefante caminando', 5000, 1.4],
  ['Un ciclista', 80, 8],
  ['Un granizo grande cayendo', 0.03, 30],
  ['Una flecha de arco', 0.025, 70],
  ['Un martillo golpeando un clavo', 0.5, 8],
  ['Un vagón de metro a 40 km/h', 30000, 11],
  ['Un caracol', 0.005, 0.001],
  ['Una bola de boliche', 7, 8],
  ['Una gota de lluvia', 0.00003, 9],
  ['Una mosca volando', 0.00001, 2],
  ['Un tiburón blanco nadando', 1100, 7],
  ['Un halcón peregrino en picada', 1, 90],
  ['Un esqueleto de las criptas corriendo', 12, 4],
  ['El Coloso Inerte caminando', 900, 0.8],
  ['Un tomo de Hibbeler que se cae del estante', 2.4, 4],
];

export type Magnitud = 'K' | 'p';

export const MAGNITUDES: Record<Magnitud, { nombre: string; formula: string; unidad: string; calc: (m: number, v: number) => number }> = {
  K: { nombre: 'energía cinética', formula: 'K = ½·m·v²', unidad: 'J', calc: (m, v) => 0.5 * m * v * v },
  p: { nombre: 'cantidad de movimiento', formula: 'p = m·v', unidad: 'kg·m/s', calc: (m, v) => m * v },
};

/** Formato legible de números muy grandes o muy chicos (notación científica con superíndices) */
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export function fmt(x: number) {
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 10000 || a < 0.01) {
    const [m, e] = x.toExponential(1).split('e');
    return `${m}×10${e.replace('+', '').split('').map((c) => SUP[c] ?? c).join('')}`;
  }
  return (a >= 100 ? Math.round(x) : Math.round(x * 100) / 100).toLocaleString('es-MX');
}

/**
 * Elige un par con diferencia clara pero no absurda (entre ×1.4 y ×60).
 * 4 de cada 10 veces busca un par «tramposo»: uno gana en K y el otro en p
 * (como la bala contra el balón), que es donde más se aprende.
 */
export function parAzar(): { a: Objeto; b: Objeto; mag: Magnitud } {
  const tramposo = Math.random() < 0.4;
  for (let i = 0; i < 400; i++) {
    const a = OBJETOS[Math.floor(Math.random() * OBJETOS.length)];
    const b = OBJETOS[Math.floor(Math.random() * OBJETOS.length)];
    if (a === b) continue;
    const mag: Magnitud = Math.random() < 0.5 ? 'K' : 'p';
    const va = MAGNITUDES[mag].calc(a[1], a[2]), vb = MAGNITUDES[mag].calc(b[1], b[2]);
    const r = Math.max(va, vb) / Math.min(va, vb);
    if (r < 1.4 || r > 60) continue;
    const ka = MAGNITUDES.K.calc(a[1], a[2]) > MAGNITUDES.K.calc(b[1], b[2]);
    const pa = MAGNITUDES.p.calc(a[1], a[2]) > MAGNITUDES.p.calc(b[1], b[2]);
    if (tramposo && i < 300 && ka === pa) continue;
    return { a, b, mag };
  }
  return { a: OBJETOS[0], b: OBJETOS[1], mag: 'K' };
}
