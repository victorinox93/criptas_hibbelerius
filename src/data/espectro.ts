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

export const FORMAS: Record<FormaTipo, { nombre: string; formula: string; letra: string; color: number; pasivo: (x: number) => string; libera: (x: number) => string }> = {
  cinetica: { nombre: 'Cinética', formula: 'K = ½·m·v²', letra: 'K', color: 0x7fe8d8, pasivo: () => '3 de daño a un enemigo al azar', libera: () => '8 de daño a un enemigo al azar' },
  potencial: { nombre: 'Potencial', formula: 'U = m·g·h', letra: 'U', color: 0x6a8fc4, pasivo: () => '+3 de Bloqueo', libera: () => '+8 de Bloqueo' },
  termica: { nombre: 'Térmica', formula: 'Q', letra: 'Q', color: 0xe08a3a, pasivo: () => '+2 de Calor a todos', libera: () => '+5 de Calor a todos' },
  elastica: { nombre: 'Elástica', formula: 'U = ½·k·x²', letra: 'x', color: 0x9af07a, pasivo: (x) => `se estira (x = ${Math.min(5, x + 1)})`, libera: (x) => `2·x² = ${2 * x * x} de daño a un enemigo al azar` },
};
