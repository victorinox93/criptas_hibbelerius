// ════════════════════════════════════════════════════════════════
//  CONDICIONES DEL PISO: modificadores al azar que pueden aparecer
//  al iniciar un combate (no en jefes). Cambian un poco las reglas
//  para que dos combates nunca se jueguen igual.
//  La lógica está en src/scenes/Combat.ts (busca "cond").
// ════════════════════════════════════════════════════════════════

export interface ConditionDef {
  id: string;
  name: string;
  icon: string;
  good: boolean | null; // true = te ayuda, false = te perjudica, null = depende
  text: string;
}

export const CONDITIONS: ConditionDef[] = [
  { id: 'viento', name: 'Corriente de Aire', icon: 'i_wind', good: true, text: 'Una corriente te empuja: +1 m/s² a tus ataques (Arcanista: +1 m/s).' },
  { id: 'cristal', name: 'Veta de Cristal', icon: 'i_crystal', good: true, text: 'Energía en las paredes: +1 J en tu primer turno.' },
  { id: 'ecos', name: 'Ecos de Batalla', icon: 'i_coin', good: true, text: 'Al ganar este combate obtienes +15 Ergios extra.' },
  { id: 'niebla', name: 'Niebla Densa', icon: 'i_fog', good: false, text: 'Robas 1 carta menos en tu primer turno.' },
  { id: 'lodo', name: 'Suelo Fangoso', icon: 'i_mud', good: false, text: 'Empiezas con 2 de Fricción.' },
  { id: 'refuerzo', name: 'Enemigos Atrincherados', icon: 'i_shield', good: false, text: 'Los enemigos empiezan con 8 de Bloqueo.' },
  { id: 'gravedad', name: 'Anomalía Gravitatoria', icon: 'i_mass', good: null, text: 'g se duplica en este combate: Peso Muerto y La Manzana pegan el doble.' },
  { id: 'grieta', name: 'Grieta Volcánica', icon: 'i_fire', good: null, text: 'Todos (tú y los enemigos) empiezan con 3 de Calor.' },
];

/** Probabilidad de que un combate normal o de élite tenga condición */
export const CONDITION_CHANCE = 0.35;
