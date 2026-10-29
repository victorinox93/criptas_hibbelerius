// ════════════════════════════════════════════════════════════════
//  v0.78 · ESPECTRO DE LA ENERGÍA (cuarto personaje, idea de NullThinker)
//  Trabajo y energía: canaliza FORMAS DE ENERGÍA en ranuras. Cada forma hace
//  algo chico al final de tu turno y algo fuerte cuando la LIBERAS. Si canalizas
//  con las ranuras llenas, la más antigua se libera sola (como los orbes del Defect).
//  Además absorbe la mitad de cada golpe que recibe (Energía Absorbida).
//  Lógica en src/scenes/Combat.ts (busca «Espectro»); cartas en cards.ts (e_*).
// ════════════════════════════════════════════════════════════════

export type FormaTipo = 'cinetica' | 'potencial' | 'termica' | 'elastica';
export const FORMAS_TIPOS: FormaTipo[] = ['cinetica', 'potencial', 'termica', 'elastica'];
/** Ranuras al empezar cada combate y tope con Capacitor */
export const FORMAS_MAX = 3;
export const FORMAS_TOPE = 5;
/** Máximo de Energía Absorbida que puede guardar */
export const EABS_MAX = 40;

/**
 * Las cuatro formas. pasivo/libera reciben x (estiramiento de la Elástica) y el bono:
 *  · Potencial: +1 por cada kg de masa extra (U = m·g·h: más masa, más energía guardada); al liberarla, +2 por kg.
 *  · Cinética: +1 por cada m/s² de aceleración extra, menos la fricción (más a → más v → más K); al liberarla, +2.
 */
export const FORMAS: Record<FormaTipo, { nombre: string; formula: string; letra: string; color: number; pasivo: (x: number, b?: number) => string; libera: (x: number, b?: number) => string }> = {
  cinetica: { nombre: 'Cinética', formula: 'K = ½·m·v²', letra: 'K', color: 0x7fe8d8, pasivo: (_x, b = 0) => `${3 + b} de daño a un enemigo al azar${b ? ` (3 + ${b} por tu aceleración)` : ''}`, libera: (_x, b = 0) => `${8 + 2 * b} de daño a un enemigo al azar` },
  potencial: { nombre: 'Potencial', formula: 'U = m·g·h', letra: 'U', color: 0x6a8fc4, pasivo: (_x, b = 0) => `+${3 + b} de Bloqueo${b ? ` (3 + ${b} por tu masa)` : ''}`, libera: (_x, b = 0) => `+${8 + 2 * b} de Bloqueo` },
  termica: { nombre: 'Térmica', formula: 'Q', letra: 'Q', color: 0xe08a3a, pasivo: () => '+2 de Calor a todos', libera: () => '+5 de Calor a todos' },
  elastica: { nombre: 'Elástica', formula: 'U = ½·k·x²', letra: 'x', color: 0x9af07a, pasivo: (x) => `se estira (x = ${Math.min(5, x + 1)})`, libera: (x) => `2·x² = ${2 * x * x} de daño a un enemigo al azar` },
};
