import { G } from '../config';

export type CardType = 'Ataque' | 'Defensa' | 'Habilidad' | 'Poder' | 'Estado';
export type CardClass = 'caballero' | 'arcanista' | 'neutral' | 'estado';

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
  vel?: number; // rapidez del Arcanista (m/s)
  block?: number; // tu Bloque actual
  energy?: number; // Joules disponibles
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
  rarity: 'inicial' | 'común' | 'rara' | 'estado';
  cls?: CardClass; // sin valor = caballero
  unplayable?: boolean;
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

/** Energía cinética del Arcanista: K = ½·m·v² */
export function kinetic(s: CardStats, c: CalcCtx) {
  const m = (s.m ?? 0) + c.masaBonus;
  const v = Math.max(0, c.vel ?? 0);
  return { m, v, K: Math.round(0.5 * m * v * v) };
}
function kText(s: CardStats, c: CalcCtx) {
  const { m, v, K } = kinetic(s, c);
  return `K = ½·${r1(m)}·${r1(v)}²\n= ${K} J`;
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

  // ════════════ NEUTRALES (ambas clases) ════════════
  almacenada: {
    id: 'almacenada', name: 'Energía Almacenada', type: 'Habilidad', icon: 'i_bolt', concept: 'Energía potencial', rarity: 'común', target: 'self', cls: 'neutral', exhaust: true,
    stats: (up) => ({ cost: 0, extra: up ? 3 : 2 }),
    text: (s) => `Gana ${s.extra} J.\nSe agota.`,
    lore: 'La energía potencial es energía guardada esperando convertirse en trabajo.',
  },
  bateria: {
    id: 'bateria', name: 'Batería de Resorte', type: 'Poder', icon: 'i_pend', concept: 'Energía elástica', rarity: 'rara', target: 'self', cls: 'neutral', exhaust: true,
    stats: (up) => ({ cost: up ? 1 : 2, extra: 1 }),
    text: () => `Al inicio de cada turno\ngana +1 J.\nSe agota.`,
    lore: 'Un resorte comprimido almacena U = ½·k·x² y la libera poco a poco.',
  },
  diagrama: {
    id: 'diagrama', name: 'Diagrama de Cuerpo Libre', type: 'Habilidad', icon: 'i_rune', concept: 'Análisis', rarity: 'común', target: 'self', cls: 'neutral',
    stats: (up) => ({ cost: up ? 0 : 1, extra: 2 }),
    text: () => `Roba 2 cartas.\nLuego descarta 1.`,
    lore: 'Antes de resolver, dibuja todas las fuerzas y descarta lo que no importa.',
  },
  rebote: {
    id: 'rebote', name: 'Rebote Elástico', type: 'Ataque', icon: 'i_reflect', concept: 'Choque elástico', rarity: 'común', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: (_s, c) => `Inflige daño igual a\ntu Bloque (${c.block ?? 0}).`,
    lore: 'En un choque elástico la energía no se pierde: la que absorbió tu escudo regresa al enemigo.',
  },
  friccionArd: {
    id: 'friccionArd', name: 'Fricción Ardiente', type: 'Ataque', icon: 'i_fire', concept: 'Calor', rarity: 'común', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 1, extra: up ? 7 : 5 }),
    text: (s) => `Aplica ${s.extra} de Calor.\n(pierde Calor de vida cada\nturno y baja 1)`,
    lore: 'El trabajo de la fricción no desaparece: se convierte en energía térmica.',
  },
  frecuencia: {
    id: 'frecuencia', name: 'Frecuencia Natural', type: 'Ataque', icon: 'i_wind', concept: 'Resonancia', rarity: 'común', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 1, block: 3, extra: up ? 2 : 1 }),
    text: (s) => `Inflige 3 de daño y\n+${s.extra} Resonancia.\nCon 3: estalla por 12.`,
    lore: 'Si empujas un sistema a su frecuencia natural, cada impulso suma y la amplitud crece hasta romperlo.',
  },
  fatigaMat: {
    id: 'fatigaMat', name: 'Fatiga del Material', type: 'Habilidad', icon: 'i_anvil', concept: 'Mecánica de materiales', rarity: 'común', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 1, extra: up ? 3 : 2 }),
    text: (s) => `Aplica ${s.extra} de Fatiga:\nrecibe +50 % de daño\nmientras dure.`,
    lore: 'Cargas repetidas debilitan un material hasta que falla con un esfuerzo menor al de ruptura.',
  },
  potencia: {
    id: 'potencia', name: 'Potencia', type: 'Habilidad', icon: 'i_bolt', concept: 'Potencia', rarity: 'común', target: 'self', cls: 'neutral',
    stats: (up) => ({ cost: 1, extra: up ? 2 : 1 }),
    text: (s) => `P = W/t\nGana ${s.extra! + 1} J y roba ${s.extra} carta${s.extra! > 1 ? 's' : ''}.`,
    lore: 'La potencia es qué tan rápido haces trabajo: P = W/t, en watts.',
  },
  conservacion: {
    id: 'conservacion', name: 'Conservación', type: 'Defensa', icon: 'i_crystal', concept: 'Conservación', rarity: 'rara', target: 'self', cls: 'neutral',
    stats: (up) => ({ cost: 1, extra: up ? 4 : 3 }),
    text: (s, c) => `Gana ${s.extra} de Bloque por\ncada J que te quede\n(${Math.max(0, (c.energy ?? 1) - 1) * s.extra!}).`,
    lore: 'La energía no se crea ni se destruye: la que no usas para atacar te protege.',
  },
  amortiguador: {
    id: 'amortiguador', name: 'Amortiguador', type: 'Defensa', icon: 'i_shield', concept: 'Trabajo y energía', rarity: 'común', target: 'self', cls: 'neutral',
    stats: (up) => ({ cost: 2, block: up ? 17 : 13 }),
    text: (s) => `Gana ${s.block} de Bloque.`,
    lore: 'Un amortiguador hace trabajo negativo sobre el golpe y lo convierte en calor.',
  },

  // ════════════ CABALLERO (extra) ════════════
  martillo: {
    id: 'martillo', name: 'Martillo de Impacto', type: 'Ataque', icon: 'i_anvil', concept: '2ª ley', rarity: 'común', target: 'enemy',
    stats: (up) => ({ cost: 2, m: 5, a: up ? 4 : 3 }),
    text: (s, c) => `${fText(s, c)}\n+1 Fatiga.`,
    lore: 'Un impacto fuerte y repetido fatiga el material del enemigo.',
  },
  muroMasa: {
    id: 'muroMasa', name: 'Muro de Masa', type: 'Defensa', icon: 'i_mass', concept: 'Masa', rarity: 'común', target: 'self',
    stats: (up) => ({ cost: 1, block: up ? 7 : 4 }),
    text: (s, c) => `Gana ${s.block} + 3×(masa extra)\n= ${(s.block ?? 0) + 3 * Math.max(0, c.masaBonus)} de Bloque.`,
    lore: 'Más masa, más inercia: cuesta más moverte.',
  },

  // ════════════ ARCANISTA CINÉTICO ════════════
  proyectil: {
    id: 'proyectil', name: 'Proyectil Arcano', type: 'Ataque', icon: 'i_momentum', concept: 'Energía cinética', rarity: 'inicial', target: 'enemy', cls: 'arcanista',
    stats: (up) => ({ cost: 1, m: up ? 3 : 2 }),
    text: (s, c) => `${kText(s, c)}\nInflige K. Pierdes 1 m/s.`,
    lore: 'K = ½·m·v²: la energía cinética crece con el CUADRADO de la rapidez.',
  },
  escudoE: {
    id: 'escudoE', name: 'Escudo de Energía', type: 'Defensa', icon: 'i_crystal', concept: 'Energía', rarity: 'inicial', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 1, block: up ? 8 : 5 }),
    text: (s) => `Gana ${s.block} de Bloque.`,
    lore: 'Una barrera que absorbe energía antes de que llegue a ti.',
  },
  acelerar: {
    id: 'acelerar', name: 'Acelerar', type: 'Habilidad', icon: 'i_wind', concept: 'Cinemática', rarity: 'inicial', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 1, extra: up ? 3 : 2 }),
    text: (s) => `+${s.extra} m/s de rapidez.\nRoba 1 carta.`,
    lore: 'Más rapidez, mucha más energía: duplicar v cuadruplica K.',
  },
  frenado: {
    id: 'frenado', name: 'Frenado Arcano', type: 'Defensa', icon: 'i_shield', concept: 'Trabajo-energía', rarity: 'inicial', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: up ? 0 : 1, m: 2 }),
    text: (s, c) => {
      const v = c.vel ?? 0, v2 = Math.max(0, v - 2), m = s.m ?? 2;
      return `Pierdes 2 m/s. Bloque =\nΔK = ½·${m}·(${v}² − ${v2}²)\n= ${Math.round(0.5 * m * (v * v - v2 * v2))}`;
    },
    lore: 'Teorema trabajo-energía: frenar quita energía cinética; aquí la conviertes en escudo.',
  },
  choque: {
    id: 'choque', name: 'Choque Elástico', type: 'Ataque', icon: 'i_reflect', concept: 'Energía cinética', rarity: 'común', target: 'enemy', cls: 'arcanista',
    stats: (up) => ({ cost: 1, m: up ? 3 : 2 }),
    text: (s, c) => `${kText(s, c)}\nInflige K. No pierdes rapidez.`,
    lore: 'En un choque perfectamente elástico se conserva la energía cinética.',
  },
  rafaga: {
    id: 'rafaga', name: 'Ráfaga Cinética', type: 'Ataque', icon: 'i_wind', concept: 'Energía cinética', rarity: 'común', target: 'all', cls: 'arcanista',
    stats: (up) => ({ cost: 2, m: up ? 2 : 1.5 }),
    text: (s, c) => `${kText(s, c)}\nK a TODOS. Pierdes 2 m/s.`,
    lore: 'La misma energía repartida en un frente amplio.',
  },
  impulsoCte: {
    id: 'impulsoCte', name: 'Impulso Constante', type: 'Poder', icon: 'i_gaunt', concept: '2ª ley', rarity: 'rara', target: 'self', cls: 'arcanista', exhaust: true,
    stats: (up) => ({ cost: up ? 1 : 2, extra: 1 }),
    text: () => `Al inicio de cada turno\n+1 m/s de rapidez.\nSe agota.`,
    lore: 'Una fuerza constante produce aceleración constante: la rapidez sube cada intervalo.',
  },
  ondaCalor: {
    id: 'ondaCalor', name: 'Onda de Calor', type: 'Ataque', icon: 'i_fire', concept: 'Calor', rarity: 'común', target: 'all', cls: 'arcanista',
    stats: (up) => ({ cost: 1, extra: up ? 4 : 3 }),
    text: (s) => `Aplica ${s.extra} de Calor\na TODOS los enemigos.`,
    lore: 'La energía cinética de tus partículas se disipa como calor.',
  },
  visVivaA: {
    id: 'visVivaA', name: 'Vis Viva', type: 'Habilidad', icon: 'i_bolt', concept: 'Energía cinética', rarity: 'rara', target: 'self', cls: 'arcanista', exhaust: true,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Duplica tu rapidez\n(máx. 12 m/s).\nSe agota.`,
    lore: 'Émilie du Châtelet defendió que la "fuerza viva" va con v²: duplicar v cuadruplica la energía.',
  },
  barrera: {
    id: 'barrera', name: 'Barrera Inercial', type: 'Defensa', icon: 'i_crystal', concept: 'Inercia', rarity: 'común', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 1, extra: up ? 3 : 2 }),
    text: (s, c) => `Bloque = ${s.extra}·v\n= ${(s.extra ?? 2) * Math.round(c.vel ?? 0)}`,
    lore: 'Lo que se mueve rápido es difícil de desviar.',
  },
  sobrecarga: {
    id: 'sobrecarga', name: 'Sobrecarga', type: 'Habilidad', icon: 'i_bolt', concept: 'Trabajo-energía', rarity: 'común', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 0, extra: up ? 2 : 1 }),
    text: (s) => `Gana ${s.extra} J.\nPierdes 1 m/s.`,
    lore: 'Conviertes parte de tu energía cinética en trabajo útil.',
  },

  // ════════════ ESTADOS (cartas basura que dan los enemigos) ════════════
  lodoCarta: {
    id: 'lodoCarta', name: 'Lodo Pegajoso', type: 'Estado', icon: 'i_mud', concept: 'Estado', rarity: 'estado', target: 'self', cls: 'estado', exhaust: true,
    stats: () => ({ cost: 1 }),
    text: () => `No hace nada.\nSe agota al jugarla.`,
    lore: 'Fricción pura: gastas energía sin avanzar.',
  },
  ruido: {
    id: 'ruido', name: 'Ruido Blanco', type: 'Estado', icon: 'i_fog', concept: 'Estado', rarity: 'estado', target: 'self', cls: 'estado', unplayable: true,
    stats: () => ({ cost: 0 }),
    text: () => `Injugable.\nSólo estorba en tu mano.`,
    lore: 'Vibraciones sin frecuencia útil: ocupan espacio y no hacen trabajo.',
  },
  errorSigno: {
    id: 'errorSigno', name: 'Error de Signo', type: 'Estado', icon: 'i_skull', concept: 'Estado', rarity: 'estado', target: 'self', cls: 'estado', unplayable: true,
    stats: () => ({ cost: 0 }),
    text: () => `Injugable.\nAl robarla pierdes 1 J.`,
    lore: 'Un signo mal puesto en el diagrama arruina todo el análisis.',
  },
};

export const STARTER_DECK = ['golpe', 'golpe', 'golpe', 'golpe', 'normal', 'normal', 'normal', 'normal', 'embestida', 'carrera'];
export const STARTER_ARCANISTA = ['proyectil', 'proyectil', 'proyectil', 'proyectil', 'escudoE', 'escudoE', 'escudoE', 'escudoE', 'acelerar', 'frenado'];

export function starterDeck(clase: string) {
  return clase === 'arcanista' ? STARTER_ARCANISTA : STARTER_DECK;
}

/** Cartas que pueden salir de recompensa o en la tienda para cada clase */
export function rewardPool(clase: string): string[] {
  const own = Object.values(CARDS).filter((c) =>
    c.rarity !== 'estado' && (clase === 'arcanista' ? c.cls === 'arcanista' : (c.cls ?? 'caballero') === 'caballero'));
  const neutral = Object.values(CARDS).filter((c) => c.cls === 'neutral');
  return [...own, ...neutral].filter((c) => c.rarity !== 'inicial' || ['embestida', 'carrera', 'acelerar', 'frenado'].includes(c.id)).map((c) => c.id);
}

/** Compatibilidad: pool del caballero */
export const REWARD_POOL = rewardPool('caballero');

export function cardName(ci: CardInst) {
  return CARDS[ci.id].name + (ci.up ? '+' : '');
}
