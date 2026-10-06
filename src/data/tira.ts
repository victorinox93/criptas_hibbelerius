// ════════════════════════════════════════════════════════════════
//  TIRA Y AFLOJA DE NEWTON (minijuego de la Taberna, estilo Gwent)
//  Dos jugadores jalan una cuerda. Gana la ronda quien tenga mayor ΣF;
//  gana el duelo quien gane 2 rondas. Cada jugador tiene 10 cartas para
//  TODO el duelo (no se reparten más): hay que administrarlas.
//  Filas: Jalón (F completa) · Rampa (F·cosθ) · Polea (F×2, máx. 2 cartas).
// ════════════════════════════════════════════════════════════════

export type Fila = 'h' | 'r' | 'p';
export type Especial = 'lodo' | 'reaccion' | 'cuerda' | 'masa';

export interface CartaTira {
  uid: number;
  fila?: Fila; // las especiales no van en una fila
  F: number;
  theta?: number; // sólo en Rampa
  esp?: Especial;
}

export const FILAS: Record<Fila, { nombre: string; info: string }> = {
  h: { nombre: 'Jalón', info: 'Jalas en línea recta: cuenta toda la fuerza F.' },
  r: { nombre: 'Rampa', info: 'Jalas desde una rampa: sólo cuenta la componente F·cosθ.' },
  p: { nombre: 'Polea', info: 'Una polea móvil duplica la fuerza: F × 2. Máximo 2 cartas por lado.' },
};

export const ESPECIALES: Record<Especial, { nombre: string; info: string }> = {
  lodo: { nombre: 'Lodo', info: 'Fricción: cada carta del Jalón del rival vale 2 menos esta ronda.' },
  reaccion: { nombre: 'Acción-Reacción', info: '3ª ley: copias la carta más fuerte del rival en tu misma fila.' },
  cuerda: { nombre: 'Cuerda Rota', info: 'Quita la carta más fuerte de CADA lado.' },
  masa: { nombre: 'Masa Inamovible', info: 'Esta ronda nada puede bajar tu fuerza (ni Lodo ni Cuerda Rota).' },
};

export interface Rival {
  id: string;
  nombre: string;
  sprite: string;
  saludo: string;
  extra: number; // fuerza extra en sus cartas
  prefer: Fila | 'lodo';
}

export const RIVALES: Rival[] = [
  { id: 'bernoulli', nombre: 'Sir Bernoulli', sprite: 'alma_bernoulli', saludo: '«¡Un duelo! Mis poleas nunca fallan… casi nunca.»', extra: 0, prefer: 'p' },
  { id: 'notario', nombre: 'El Notario', sprite: 'npc_notario', saludo: '«Lea la letra pequeña: el que pierde, paga. Y yo traigo lodo.»', extra: 0, prefer: 'lodo' },
  { id: 'herrero', nombre: 'La Herrera', sprite: 'npc_herrero', saludo: '«Brazos de yunque. Jalo derecho, sin trucos.»', extra: 1, prefer: 'h' },
  { id: 'profe', nombre: 'El Profe (día libre)', sprite: 'npc_victorino', saludo: '«Ah, ¿me retas a mí? Esto va a contar para la calificación… es broma. O no.»', extra: 2, prefer: 'r' },
];

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
let uid = 1;

/** Reparte las 10 cartas de un jugador */
export function repartir(extra = 0, prefer: Rival['prefer'] | null = null): CartaTira[] {
  const out: CartaTira[] = [];
  const n = { h: 4, r: 3, p: 2 };
  if (prefer === 'p') { n.p = 3; n.h = 3; }
  if (prefer === 'h') { n.h = 5; n.r = 2; }
  if (prefer === 'r') { n.r = 4; n.h = 3; }
  for (let i = 0; i < n.h; i++) out.push({ uid: uid++, fila: 'h', F: ri(3, 8) + extra });
  for (let i = 0; i < n.r; i++) out.push({ uid: uid++, fila: 'r', F: ri(6, 11) + extra, theta: pick([30, 45, 60]) });
  for (let i = 0; i < n.p; i++) out.push({ uid: uid++, fila: 'p', F: ri(2, 5) + Math.floor(extra / 2) });
  const esp: Especial[] = prefer === 'lodo' ? ['lodo', 'lodo'] : [pick(['lodo', 'reaccion', 'cuerda', 'masa'] as Especial[])];
  for (const e of esp) out.push({ uid: uid++, F: 0, esp: e });
  while (out.length > 10) out.splice(Math.floor(Math.random() * 9), 1);
  return out.sort((a, b) => (a.esp ? 1 : 0) - (b.esp ? 1 : 0) || (a.fila ?? '').localeCompare(b.fila ?? '') || a.F - b.F);
}

/** Lo que aporta una carta jugada (sin modificadores) */
export function aporte(c: CartaTira) {
  if (c.fila === 'r') return Math.round(c.F * Math.cos(((c.theta ?? 0) * Math.PI) / 180));
  if (c.fila === 'p') return c.F * 2;
  return c.F;
}

export function nombreCarta(c: CartaTira) {
  if (c.esp) return ESPECIALES[c.esp].nombre;
  if (c.fila === 'r') return `Rampa ${c.theta}°`;
  return FILAS[c.fila!].nombre;
}
