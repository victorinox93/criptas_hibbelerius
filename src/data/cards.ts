import { G } from '../config';

export type CardType = 'Ataque' | 'Defensa' | 'Habilidad' | 'Poder';

export interface CardInst {
  uid: number;
  id: string;
  up: boolean; // mejorada
}

/** Contexto de combate necesario para calcular números en vivo */
export interface CalcCtx {
  masaBonus: number; // kg extra (Forja Pesada, reliquias)
  acelBonus: number; // m/s² extra este turno
  friccion: number; // reduce aceleración (Babosa de Lodo)
  g?: number; // gravedad del nivel (m/s²)
}

export interface CardStats {
  cost: number;
  m?: number;
  a?: number;
  block?: number;
  extra?: number;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  icon: string;
  concept: string; // concepto físico
  rarity: 'inicial' | 'común' | 'rara';
  target: 'enemy' | 'all' | 'self';
  exhaust?: boolean;
  stats: (up: boolean) => CardStats;
  text: (s: CardStats, c: CalcCtx) => string;
  lore: string; // explicación física corta (tooltip)
}

const r1 = (x: number) => Math.round(x * 10) / 10;

/** Aceleración efectiva y fuerza F = m·a de una carta de ataque */
export function force(s: CardStats, c: CalcCtx) {
  const m = (s.m ?? 0) + c.masaBonus;
  const a = Math.max(0, (s.a ?? 0) + c.acelBonus - c.friccion);
  return { m, a, F: Math.round(m * a) };
}

function fText(s: CardStats, c: CalcCtx) {
  const { m, a, F } = force(s, c);
  return `F = ${r1(m)} kg × ${r1(a)} m/s²\n= ${F} N`;
}

export const CARDS: Record<string, CardDef> = {
  golpe: {
    id: 'golpe', name: 'Golpe de Mazo', type: 'Ataque', icon: 'i_combat', concept: '2ª ley', rarity: 'inicial', target: 'enemy',
    stats: (up) => ({ cost: 1, m: 3, a: up ? 3 : 2 }),
    text: (s, c) => `${fText(s, c)}\nInflige F de daño.`,
    lore: 'Segunda ley de Newton: la fuerza neta es masa por aceleración (ΣF = m·a). Más masa o más aceleración = más fuerza.',
  },
  normal: {
    id: 'normal', name: 'Fuerza Normal', type: 'Defensa', icon: 'i_shield', concept: 'Fuerza normal', rarity: 'inicial', target: 'self',
    stats: (up) => ({ cost: 1, block: up ? 8 : 5 }),
    text: (s) => `Gana ${s.block} de Bloque.`,
    lore: 'La fuerza normal es la que una superficie ejerce perpendicular a ella para impedir que la atravieses.',
  },
  embestida: {
    id: 'embestida', name: 'Embestida', type: 'Ataque', icon: 'i_momentum', concept: '3ª ley', rarity: 'inicial', target: 'enemy',
    stats: (up) => ({ cost: 2, m: up ? 7 : 6, a: 2 }),
    text: (s, c) => `${fText(s, c)}\nRetroceso: recibes ¼ de F\n(3ª ley).`,
    lore: 'Tercera ley: si empujas al enemigo con F, él te empuja con F en sentido opuesto. Tu armadura absorbe ¾; el resto lo sientes tú.',
  },
  carrera: {
    id: 'carrera', name: 'Carrera', type: 'Habilidad', icon: 'i_wind', concept: '2ª ley', rarity: 'inicial', target: 'self',
    stats: (up) => ({ cost: 1, extra: up ? 3 : 2 }),
    text: (s) => `+${s.extra} m/s² a tus ataques\neste turno. Roba 1 carta.`,
    lore: 'Con la misma masa, aumentar la aceleración aumenta proporcionalmente la fuerza: F ∝ a.',
  },
  segunda: {
    id: 'segunda', name: 'Segunda Ley', type: 'Habilidad', icon: 'i_bolt', concept: '2ª ley', rarity: 'común', target: 'self',
    stats: (up) => ({ cost: 0, extra: up ? 2 : 1 }),
    text: (s) => `+${s.extra} m/s² a tus ataques\neste turno.`,
    lore: 'ΣF = m·a. Si la masa no cambia, cada m/s² extra suma "m" newtons a cada golpe.',
  },
  forja: {
    id: 'forja', name: 'Forja Pesada', type: 'Poder', icon: 'i_anvil', concept: 'Masa', rarity: 'común', target: 'self', exhaust: true,
    stats: (up) => ({ cost: 1, extra: up ? 2 : 1 }),
    text: (s) => `+${s.extra} kg a todos tus\nataques este combate.\nSe agota.`,
    lore: 'La masa es la medida de la inercia de un cuerpo. A igual aceleración, un arma más masiva ejerce más fuerza.',
  },
  fuerzaNeta: {
    id: 'fuerzaNeta', name: 'Fuerza Neta', type: 'Ataque', icon: 'i_stun', concept: '1ª ley', rarity: 'común', target: 'enemy',
    stats: (up) => ({ cost: 1, m: 2, a: up ? 5 : 4 }),
    text: (s, c) => `${fText(s, c)}\nSi DETIENES a un enemigo\n(F ≥ su umbral), recupera 1 J.`,
    lore: 'Primera ley: un cuerpo en movimiento sigue igual a menos que una fuerza neta externa actúe sobre él. Aquí, esa fuerza eres tú.',
  },
  tajo: {
    id: 'tajo', name: 'Tajo Angulado', type: 'Ataque', icon: 'i_angle', concept: 'Componentes', rarity: 'común', target: 'enemy',
    stats: (up) => ({ cost: 1, m: up ? 5 : 4, a: 2 }),
    text: (s, c) => `${fText(s, c)}\nElige θ: 0° → F·cos0° a uno\n60° → F·cos60° a TODOS`,
    lore: 'Sólo la componente de la fuerza en la dirección del movimiento hace trabajo: F·cosθ. A 60°, cos θ = 0.5.',
  },
  accion: {
    id: 'accion', name: 'Acción-Reacción', type: 'Defensa', icon: 'i_reflect', concept: '3ª ley', rarity: 'común', target: 'self',
    stats: (up) => ({ cost: 1, block: up ? 7 : 4 }),
    text: (s) => `Gana ${s.block} de Bloque.\nEste turno, cada golpe que\nrecibas regresa al atacante.`,
    lore: 'Tercera ley: las fuerzas aparecen en pares iguales y opuestos. Si te golpean con F, tú los golpeas con F.',
  },
  inerciaDef: {
    id: 'inerciaDef', name: 'Inercia Defensiva', type: 'Defensa', icon: 'i_crystal', concept: '1ª ley', rarity: 'común', target: 'self',
    stats: (up) => ({ cost: 2, block: up ? 13 : 9 }),
    text: (s) => `Gana ${s.block} de Bloque.\nTu Bloque NO se pierde\nal iniciar el siguiente turno.`,
    lore: 'Primera ley: sin fuerza neta, el estado no cambia. Tu postura se mantiene mientras nada la altere.',
  },
  pesoMuerto: {
    id: 'pesoMuerto', name: 'Peso Muerto', type: 'Ataque', icon: 'i_mass', concept: 'Peso', rarity: 'común', target: 'enemy',
    stats: (up) => ({ cost: 2, m: up ? 1.5 : 1.2 }),
    text: (s, c) => {
      const m = (s.m ?? 0) + c.masaBonus;
      const g = c.g ?? G;
      return `W = m·g = ${r1(m)} kg × ${g}\n= ${Math.round(m * g)} N\nIgnora Bloque.`;
    },
    lore: 'El peso es la fuerza de gravedad: W = m·g, con g = 9.81 m/s². No importa qué tan rápido te muevas: g es la misma.',
  },
  equilibrio: {
    id: 'equilibrio', name: 'ΣF = 0', type: 'Defensa', icon: 'i_shield', concept: 'Equilibrio', rarity: 'rara', target: 'self',
    stats: (up) => ({ cost: 1, extra: up ? 18 : 12 }),
    text: (s) => `Gana Bloque igual a la fuerza\ntotal que los enemigos planean\nhacerte (máx. ${s.extra}).`,
    lore: 'Equilibrio: si la suma de fuerzas sobre ti es cero, no hay aceleración. Contrarrestas exactamente lo que viene.',
  },
};

export const STARTER_DECK = ['golpe', 'golpe', 'golpe', 'golpe', 'normal', 'normal', 'normal', 'normal', 'embestida', 'carrera'];

export const REWARD_POOL = ['segunda', 'forja', 'fuerzaNeta', 'tajo', 'accion', 'inerciaDef', 'pesoMuerto', 'equilibrio', 'embestida', 'carrera'];

export function cardName(ci: CardInst) {
  return CARDS[ci.id].name + (ci.up ? '+' : '');
}
