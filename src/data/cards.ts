import { G } from '../config';

export type CardType = 'Ataque' | 'Defensa' | 'Habilidad' | 'Poder' | 'Estado';
export type CardClass = 'caballero' | 'arcanista' | 'penitente' | 'neutral' | 'estado';

export interface CardInst {
  uid: number;
  id: string;
  up: boolean; // mejorada
  evo?: number; // niveles de evolución extra (Darwin): +2 kg (Arcanista +0.5 kg) y +3 de Bloqueo por nivel
  ed?: Edicion; // El Abismo de los Ejes: edición estilo Balatro (src/data/abismo_modo.ts)
}

/** Ediciones de carta (El Abismo de los Ejes): lámina, holográfica, polícroma y cristal (un solo uso) */
export type Edicion = 'lamina' | 'holo' | 'poli' | 'cristal';

/** Contexto de combate necesario para calcular números en vivo */
export interface CalcCtx {
  masaBonus: number; // kg extra (Forja Pesada, reliquias)
  acelBonus: number; // m/s² extra este turno
  friccion: number; // reduce aceleración (Babosa de Lodo)
  g?: number; // gravedad del nivel (m/s²)
  vel?: number; // rapidez del Arcanista (m/s)
  block?: number; // tu Bloqueo actual
  energy?: number; // Joules disponibles
  masa?: number; // masa actual del Penitente (= su vida, kg)
  ve?: number; // velocidad de escape de sus gases (m/s)
  cordura?: number; // El Abismo de los Ejes: 100 − Locura
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
  rarity: 'inicial' | 'común' | 'rara' | 'legendaria' | 'estado';
  cls?: CardClass; // sin valor = caballero
  unplayable?: boolean;
  target: 'enemy' | 'all' | 'self';
  exhaust?: boolean;
  act?: number; // sólo aparece como recompensa a partir de este acto
  lock?: number; // nivel de Conocimiento necesario para que aparezca (src/data/progreso.ts)
  am?: boolean; // sólo aparece en las recompensas después de vencer a AM (cartas de cálculo)
  abismo?: boolean; // sólo sale en El Abismo de los Ejes (acto 5)
  /** v0.57 · cartas que HABLAN (como en Inscryption): frases al robarla, al jugarla o si se queda en tu mano */
  voz?: { robar?: string[]; jugar?: string[]; mano?: string[] };
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

/** Rapidez máxima del Arcanista (m/s) */
export const VMAX = 8;

/** Energía cinética del Arcanista: K = ½·m·v². La masa extra (reliquias) cuenta a la mitad. */
export function kinetic(s: CardStats, c: CalcCtx) {
  const m = (s.m ?? 0) + c.masaBonus * 0.5;
  const v = Math.max(0, c.vel ?? 0);
  return { m, v, K: Math.round(0.5 * m * v * v) };
}
/** Penitente del Empuje: ecuación del cohete Δv = vₑ·ln(m₀/m₁) al quemar kg de su propia masa */
export const VE_BASE = 65;
export function rocket(kg: number, c: CalcCtx) {
  const m0 = Math.max(1, c.masa ?? 80);
  const m1 = Math.max(1, m0 - kg);
  const ve = c.ve ?? VE_BASE;
  return { m0, m1, ve, dv: Math.round(ve * Math.log(m0 / m1) * 10) / 10 };
}
function rText(kg: number, c: CalcCtx) {
  const r = rocket(kg, c);
  return `Quema ${kg} kg: Δv = ${r.ve}·ln(${r.m0}/${r.m1})\n= ${r.dv} m/s`;
}
/** Golpe del Penitente: p = m·v */
export function pmv(s: CardStats, c: CalcCtx) {
  const m = (s.m ?? 0) + c.masaBonus * 0.5;
  const v = Math.max(0, c.vel ?? 0);
  return { m, v, p: Math.round(m * v) };
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
    text: (s) => `Gana ${s.block} de Bloqueo.`,
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
  // v0.30 · inspirada en «La Entropía», la escultura amarilla del campus UDEM (dicen que parecen papas)
  entropia_udem: {
    id: 'entropia_udem', name: 'La Entropía', type: 'Habilidad', icon: 'i_entropia', concept: 'Entropía', rarity: 'rara', cls: 'neutral', target: 'self', exhaust: true,
    stats: (up) => ({ cost: up ? 0 : 1, extra: up ? 3 : 2 }),
    text: (s) => `Revuelve tu descarte\ndentro de tu mazo.\nRoba ${s.extra} cartas. Se agota.`,
    lore: 'Segunda ley de la termodinámica: en un sistema aislado la entropía (el desorden) nunca disminuye. Como la escultura del campus: bloques que parecen caer… o papas a la francesa.',
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
    text: (s) => `Gana ${s.block} de Bloqueo.\nEste turno, cada golpe que\nrecibas regresa al atacante.`,
    lore: 'Tercera ley: las fuerzas aparecen en pares iguales y opuestos. Si te golpean con F, tú los golpeas con F.',
  },
  inerciaDef: {
    id: 'inerciaDef', name: 'Inercia Defensiva', type: 'Defensa', icon: 'i_crystal', concept: '1ª ley', rarity: 'común', target: 'self',
    stats: (up) => ({ cost: 2, block: up ? 13 : 9 }),
    text: (s) => `Gana ${s.block} de Bloqueo.\nTu Bloqueo NO se pierde\nal iniciar el siguiente turno.`,
    lore: 'Primera ley: sin fuerza neta, el estado no cambia. Tu postura se mantiene mientras nada la altere.',
  },
  pesoMuerto: {
    id: 'pesoMuerto', name: 'Peso Muerto', type: 'Ataque', icon: 'i_mass', concept: 'Peso', rarity: 'común', target: 'enemy',
    stats: (up) => ({ cost: 2, m: up ? 1.5 : 1.2 }),
    text: (s, c) => {
      const m = (s.m ?? 0) + c.masaBonus;
      const g = c.g ?? G;
      return `W = m·g = ${r1(m)} kg × ${g}\n= ${Math.round(m * g)} N\nIgnora Bloqueo.`;
    },
    lore: 'El peso es la fuerza de gravedad: W = m·g, con g = 9.81 m/s². No importa qué tan rápido te muevas: g es la misma.',
  },
  equilibrio: {
    id: 'equilibrio', name: 'ΣF = 0', type: 'Defensa', icon: 'i_shield', concept: 'Equilibrio', rarity: 'rara', target: 'self',
    stats: (up) => ({ cost: 1, extra: up ? 18 : 12 }),
    text: (s) => `Gana Bloqueo igual a la fuerza\ntotal que los enemigos planean\nhacerte (máx. ${s.extra}).`,
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
    text: (_s, c) => `Inflige daño igual a\ntu Bloqueo (${c.block ?? 0}).`,
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
    text: (s, c) => `Gana ${s.extra} de Bloqueo por\ncada J que te quede\n(${Math.max(0, (c.energy ?? 1) - 1) * s.extra!}).`,
    lore: 'La energía no se crea ni se destruye: la que no usas para atacar te protege.',
  },
  amortiguador: {
    id: 'amortiguador', name: 'Amortiguador', type: 'Defensa', icon: 'i_shield', concept: 'Trabajo y energía', rarity: 'común', target: 'self', cls: 'neutral',
    stats: (up) => ({ cost: 2, block: up ? 17 : 13 }),
    text: (s) => `Gana ${s.block} de Bloqueo.`,
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
    text: (s, c) => `Gana ${s.block} + 3×(masa extra)\n= ${(s.block ?? 0) + 3 * Math.max(0, c.masaBonus)} de Bloqueo.`,
    lore: 'Más masa, más inercia: cuesta más moverte.',
  },

  // ════════════ ARCANISTA CINÉTICO ════════════
  proyectil: {
    id: 'proyectil', name: 'Proyectil Arcano', type: 'Ataque', icon: 'i_momentum', concept: 'Energía cinética', rarity: 'inicial', target: 'enemy', cls: 'arcanista',
    stats: (up) => ({ cost: 1, m: up ? 1.6 : 1.2 }),
    text: (s, c) => `${kText(s, c)}\nInflige K. Pierdes 1 m/s.`,
    lore: 'K = ½·m·v²: la energía cinética crece con el CUADRADO de la rapidez.',
  },
  escudoE: {
    id: 'escudoE', name: 'Escudo de Energía', type: 'Defensa', icon: 'i_crystal', concept: 'Energía', rarity: 'inicial', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 1, block: up ? 8 : 5 }),
    text: (s) => `Gana ${s.block} de Bloqueo.`,
    lore: 'Una barrera que absorbe energía antes de que llegue a ti.',
  },
  acelerar: {
    id: 'acelerar', name: 'Acelerar', type: 'Habilidad', icon: 'i_wind', concept: 'Cinemática', rarity: 'inicial', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 1, extra: up ? 3 : 2 }),
    text: (s) => `+${s.extra} m/s de rapidez\n(máx. ${VMAX}). Roba 1 carta.`,
    lore: 'Más rapidez, mucha más energía: duplicar v cuadruplica K.',
  },
  frenado: {
    id: 'frenado', name: 'Frenado Arcano', type: 'Defensa', icon: 'i_shield', concept: 'Trabajo-energía', rarity: 'inicial', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: up ? 0 : 1, m: 1 }),
    text: (s, c) => {
      const v = c.vel ?? 0, v2 = Math.max(0, v - 2), m = s.m ?? 1;
      return `Pierdes 2 m/s. Bloqueo =\nΔK = ½·${m}·(${v}² − ${v2}²)\n= ${Math.round(0.5 * m * (v * v - v2 * v2))}`;
    },
    lore: 'Teorema trabajo-energía: frenar quita energía cinética; aquí la conviertes en escudo.',
  },
  choque: {
    id: 'choque', name: 'Choque Elástico', type: 'Ataque', icon: 'i_reflect', concept: 'Energía cinética', rarity: 'común', target: 'enemy', cls: 'arcanista',
    stats: (up) => ({ cost: 1, m: up ? 1.6 : 1.2 }),
    text: (s, c) => `${kText(s, c)}\nInflige K. No pierdes rapidez.`,
    lore: 'En un choque perfectamente elástico se conserva la energía cinética.',
  },
  rafaga: {
    id: 'rafaga', name: 'Ráfaga Cinética', type: 'Ataque', icon: 'i_wind', concept: 'Energía cinética', rarity: 'común', target: 'all', cls: 'arcanista',
    stats: (up) => ({ cost: 2, m: up ? 1.2 : 0.8 }),
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
    stats: (up) => ({ cost: up ? 1 : 2 }),
    text: () => `Duplica tu rapidez\n(máx. ${VMAX} m/s).\nSe agota.`,
    lore: 'Émilie du Châtelet defendió que la "fuerza viva" va con v²: duplicar v cuadruplica la energía.',
  },
  barrera: {
    id: 'barrera', name: 'Barrera Inercial', type: 'Defensa', icon: 'i_crystal', concept: 'Inercia', rarity: 'común', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 1, extra: up ? 2 : 1.5 }),
    text: (s, c) => `Bloqueo = ${s.extra}·v\n= ${Math.round((s.extra ?? 1.5) * (c.vel ?? 0))}`,
    lore: 'Lo que se mueve rápido es difícil de desviar.',
  },
  sobrecarga: {
    id: 'sobrecarga', name: 'Sobrecarga', type: 'Habilidad', icon: 'i_bolt', concept: 'Trabajo-energía', rarity: 'común', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 0, extra: up ? 2 : 1 }),
    text: (s) => `Gana ${s.extra} J.\nPierdes 1 m/s.`,
    lore: 'Conviertes parte de tu energía cinética en trabajo útil.',
  },

  // ── Arcanista: más formas de ganar rapidez y de atacar ──
  chispa: {
    id: 'chispa', name: 'Chispa Cinética', type: 'Ataque', icon: 'i_bolt', concept: 'Energía cinética', rarity: 'inicial', target: 'enemy', cls: 'arcanista',
    stats: (up) => ({ cost: 0, m: up ? 0.8 : 0.5 }),
    text: (s, c) => `${kText(s, c)}\nInflige K. Luego +1 m/s.`,
    lore: 'Un golpe ligero que, por reacción, te empuja hacia adelante.',
  },
  picada: {
    id: 'picada', name: 'Picada Gravitatoria', type: 'Habilidad', icon: 'i_feather', concept: 'Conservación', rarity: 'común', target: 'self', cls: 'arcanista',
    stats: (up) => ({ cost: 1, extra: up ? 1 : 0.5 }),
    text: (s, c) => {
      const dv = Math.floor(Math.sqrt(2 * (c.g ?? G) * (s.extra ?? 0.5)));
      return `Caes h = ${s.extra} m:\nv = √(2gh) → +${dv} m/s\n(¡más en Júpiter!)`;
    },
    lore: 'Conservación de la energía: m·g·h = ½·m·v², así que v = √(2gh). Más gravedad, más rapidez.',
  },
  torbellino: {
    id: 'torbellino', name: 'Torbellino', type: 'Ataque', icon: 'i_wind', concept: 'Energía cinética', rarity: 'común', target: 'enemy', cls: 'arcanista',
    stats: (up) => ({ cost: 1, m: up ? 0.45 : 0.3 }),
    text: (s, c) => `${kText(s, c)}\nInflige K tres veces.`,
    lore: 'Tres masas pequeñas a la misma rapidez: la energía se reparte en varios impactos.',
  },
  cometa: {
    id: 'cometa', name: 'Cometa', type: 'Ataque', icon: 'i_fire', concept: 'Energía cinética', rarity: 'rara', target: 'enemy', cls: 'arcanista',
    stats: (up) => ({ cost: 2, m: up ? 2.5 : 2 }),
    text: (s, c) => `${kText(s, c)}\nInflige K. Tu rapidez\nqueda en 0.`,
    lore: 'Toda tu energía cinética en un solo choque: al final no queda nada en movimiento.',
  },
  estela: {
    id: 'estela', name: 'Estela Cinética', type: 'Poder', icon: 'i_momentum', concept: '2ª ley', rarity: 'rara', target: 'self', cls: 'arcanista', exhaust: true,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Cada ataque que juegues\nte da +1 m/s.\nSe agota.`,
    lore: 'Cada impulso suma: la rapidez crece golpe a golpe.',
  },
  sinFriccion: {
    id: 'sinFriccion', name: 'Superficie Sin Fricción', type: 'Poder', icon: 'i_boots', concept: 'Fricción', rarity: 'común', target: 'self', cls: 'arcanista', exhaust: true,
    stats: (up) => ({ cost: 1, extra: up ? 2 : 1 }),
    text: (s) => `La fricción ya no\nte frena. +${s.extra} m/s.\nSe agota.`,
    lore: 'Sin fricción no hay fuerza que se oponga: por la 1ª ley, tu rapidez se conserva.',
  },

  // ════════════ ACTO III · IMPULSO Y CANTIDAD DE MOVIMIENTO (ambas clases) ════════════
  impulsoSost: {
    id: 'impulsoSost', name: 'Impulso Sostenido', type: 'Ataque', icon: 'i_gaunt', concept: 'Impulso', rarity: 'común', target: 'enemy', cls: 'neutral', act: 3,
    stats: (up) => ({ cost: 1, block: up ? 6 : 4, extra: 3 }),
    text: (s) => `F = ${s.block} N durante Δt = 3:\n${s.block} ahora y ${s.block} en cada uno\nde sus 2 turnos. I = ${(s.block ?? 4) * 3} N·s`,
    lore: 'Impulso: I = F·Δt. Una fuerza pequeña que dura mucho produce el mismo cambio de movimiento que una grande que dura poco.',
  },
  choquePlastico: {
    id: 'choquePlastico', name: 'Choque Plástico', type: 'Ataque', icon: 'i_stun', concept: 'Choques', rarity: 'común', target: 'enemy', cls: 'neutral', act: 3,
    stats: (up) => ({ cost: 2, block: up ? 12 : 9 }),
    text: (s) => `e = 0: inflige ${s.block}.\nSi tiene Inercia, se la\nquita toda y lo DETIENE.`,
    lore: 'En un choque perfectamente plástico (e = 0) los cuerpos quedan juntos: no hay rebote y se pierde la mayor parte de la energía.',
  },
  restitucion: {
    id: 'restitucion', name: 'Coeficiente de Restitución', type: 'Defensa', icon: 'i_reflect', concept: 'Choques', rarity: 'común', target: 'self', cls: 'neutral', act: 3,
    stats: (up) => ({ cost: 1, block: up ? 8 : 5, extra: up ? 0.9 : 0.6 }),
    text: (s) => `Gana ${s.block} de Bloqueo.\nEste turno los golpes que\nrecibas rebotan ×e = ${s.extra}.`,
    lore: 'e = (velocidad de separación)/(velocidad de acercamiento). Con e = 1 el rebote es perfecto; con e = 0 no hay rebote.',
  },
  conservP: {
    id: 'conservP', name: 'Conservación de p', type: 'Habilidad', icon: 'i_crystal', concept: 'Cantidad de movimiento', rarity: 'rara', target: 'enemy', cls: 'neutral', act: 3,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `El Bloqueo del enemigo\npasa a ti.\n(lo que uno pierde, otro lo gana)`,
    lore: 'En un sistema aislado la cantidad de movimiento total se conserva: Σ m·v antes = Σ m·v después.',
  },
  retroceso: {
    id: 'retroceso', name: 'Retroceso', type: 'Ataque', icon: 'i_momentum', concept: 'Cantidad de movimiento', rarity: 'común', target: 'enemy', cls: 'neutral', act: 3,
    stats: (up) => ({ cost: 1, block: up ? 11 : 8, extra: up ? 6 : 4 }),
    text: (s) => `Inflige ${s.block}.\nEl retroceso te da\n${s.extra} de Bloqueo.`,
    lore: 'Al disparar, m_bala·v_bala = m_cañón·V_cañón: el cañón retrocede. Aquí el retroceso te pone en guardia.',
  },
  impulsoAng: {
    id: 'impulsoAng', name: 'Impulso Angular', type: 'Ataque', icon: 'i_pend', concept: 'Impulso angular', rarity: 'rara', target: 'all', cls: 'neutral', act: 3,
    stats: (up) => ({ cost: 2, block: up ? 6 : 4 }),
    text: (s) => `Inflige ${s.block} a TODOS,\n+2 por cada carta que\njugaste este turno.`,
    lore: 'Un par M aplicado durante un tiempo t produce un impulso angular M·t: entre más tiempo giras, más fuerte golpeas.',
  },

  // ════════════ DESBLOQUEABLES (nivel de Conocimiento) ════════════
  // ── Caballero ──
  metabolismo: {
    id: 'metabolismo', name: 'Metabolismo Forzado', type: 'Habilidad', icon: 'i_heart', concept: 'Energía', rarity: 'común', target: 'self', lock: 2,
    stats: (up) => ({ cost: 0, extra: up ? 2 : 3, block: 2 }),
    text: (s) => `Pierdes ${s.extra} de vida.\nGana 2 J.`,
    lore: 'Tu cuerpo convierte energía química en trabajo… a costa de desgastarse.',
  },
  torbellinoAcero: {
    id: 'torbellinoAcero', name: 'Torbellino de Acero', type: 'Ataque', icon: 'i_wind', concept: '2ª ley', rarity: 'rara', target: 'all', lock: 3,
    stats: (up) => ({ cost: 0, m: up ? 3 : 2, a: 3 }),
    text: (s, c) => `Gasta TODA tu energía.\nPor cada J: F = ${r1((s.m ?? 2) + c.masaBonus)} kg × ${Math.max(0, 3 + c.acelBonus - c.friccion)} m/s²\na todos.`,
    lore: 'Giras con todo lo que tienes: cada joule invertido es un golpe más.',
  },
  // ════════ Cartas de cálculo (se desbloquean al vencer a AM en el Núcleo) ════════
  derivada: {
    id: 'derivada', name: 'Derivada', type: 'Habilidad', icon: 'i_momentum', concept: 'Derivada', rarity: 'rara', target: 'self', cls: 'neutral', am: true,
    stats: (up) => ({ cost: 1, extra: up ? 3 : 2 }),
    text: (s) => `Roba 1 carta.\nTu siguiente ataque gana\n+${s.extra} por cada ataque que\nya jugaste este turno\n(mín. +${s.extra! * 2}).`,
    lore: 'La derivada mide qué tan rápido cambia algo. Mientras más ataques encadenas, más rápido crece el siguiente.',
  },
  integral: {
    id: 'integral', name: 'Integral', type: 'Ataque', icon: 'i_combat', concept: 'Integral', rarity: 'rara', target: 'enemy', cls: 'neutral', am: true,
    stats: (up) => ({ cost: up ? 1 : 2, extra: 40 }),
    text: (s) => `Inflige TODO el daño\nque ya hiciste este turno\n(∫ daño dt, máx. ${s.extra}).`,
    lore: 'Integrar es sumar todo lo acumulado: el área bajo la curva de tu daño en este turno.',
  },
  limite: {
    id: 'limite', name: 'Límite', type: 'Ataque', icon: 'i_skull', concept: 'Límite', rarity: 'rara', target: 'enemy', cls: 'neutral', exhaust: true, am: true,
    stats: (up) => ({ cost: 1, extra: up ? 30 : 25 }),
    text: (s) => `Si al enemigo le queda\n${s.extra} % de vida o menos,\nlo derrotas (jefes: 10 %).\nSi no: inflige ${limiteDano(s.extra!)} y\nFatiga 1. Se agota.`,
    lore: 'lím (vida) cuando t → final = 0. Cuando algo ya casi llega a cero, el límite termina el trabajo.',
  },
  palanca: {
    id: 'palanca', name: 'Palanca de Arquímedes', type: 'Habilidad', icon: 'i_angle', concept: 'Momento de una fuerza', rarity: 'común', target: 'self', cls: 'neutral', lock: 2,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Tu siguiente ataque\neste turno inflige\nel DOBLE (M = F·d).`,
    lore: '«Dadme un punto de apoyo y moveré el mundo.» Duplicar el brazo de palanca duplica el momento.',
  },
  inerciaPura: {
    id: 'inerciaPura', name: 'Masa Inamovible', type: 'Poder', icon: 'i_mass', concept: 'Masa', rarity: 'rara', target: 'self', exhaust: true, lock: 5,
    stats: (up) => ({ cost: up ? 1 : 2 }),
    text: () => `Cada Defensa que juegues\nte da +1 kg a tus ataques.\nSe agota.`,
    lore: 'Mientras más resistes, más masa acumulas… y más pega tu siguiente golpe.',
  },
  resistencia: {
    id: 'resistencia', name: 'Resistencia del Material', type: 'Poder', icon: 'i_shield', concept: 'Mecánica de materiales', rarity: 'común', target: 'self', exhaust: true, lock: 6,
    stats: (up) => ({ cost: 1, block: up ? 5 : 3 }),
    text: (s) => `Al inicio de cada turno\nganas ${s.block} de Bloqueo.\nSe agota.`,
    lore: 'Un material bien elegido aguanta el esfuerzo una y otra vez sin fallar.',
  },
  // ── Arcanista ──
  sobreimpulso: {
    id: 'sobreimpulso', name: 'Postcombustión', type: 'Habilidad', icon: 'i_fire', concept: 'Cinemática', rarity: 'común', target: 'self', cls: 'arcanista', lock: 2,
    stats: (up) => ({ cost: 0, extra: up ? 4 : 3 }),
    text: (s) => `Pierdes 3 de vida.\n+${s.extra} m/s.`,
    lore: 'Quemar de más da empuje extra… y calienta el motor.',
  },
  orbita: {
    id: 'orbita', name: 'Órbita Cerrada', type: 'Poder', icon: 'i_pend', concept: 'Movimiento circular', rarity: 'rara', target: 'self', cls: 'arcanista', exhaust: true, lock: 3,
    stats: (up) => ({ cost: up ? 0 : 1, m: 0.6 }),
    text: (s, c) => `Al inicio de cada turno un\nsatélite golpea a un enemigo\ncon K = ½·${s.m}·v² (${Math.round(0.5 * (s.m ?? 0.6) * (c.vel ?? 0) ** 2)}). Se agota.`,
    lore: 'Algo en órbita conserva su energía y vuelve una y otra vez al mismo punto.',
  },
  doppler: {
    id: 'doppler', name: 'Efecto Doppler', type: 'Ataque', icon: 'i_wind', concept: 'Ondas', rarity: 'común', target: 'enemy', cls: 'arcanista', lock: 4,
    stats: (up) => ({ cost: 1, m: up ? 1.2 : 1 }),
    text: (s, c) => `${kText(s, c)}\nSi v ≥ 6: golpea a TODOS.`,
    lore: 'Al acercarte rápido, tu frente de onda se comprime y alcanza a todos.',
  },
  tunel: {
    id: 'tunel', name: 'Efecto Túnel', type: 'Habilidad', icon: 'i_crystal', concept: 'Energía', rarity: 'rara', target: 'self', cls: 'arcanista', exhaust: true, lock: 5,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Tus ataques de este turno\nignoran el Bloqueo.\nSe agota.`,
    lore: 'En el mundo cuántico, a veces una partícula atraviesa una barrera que no podría saltar.',
  },
  singularidad: {
    id: 'singularidad', name: 'Singularidad', type: 'Ataque', icon: 'i_rad', concept: 'Energía cinética', rarity: 'rara', target: 'all', cls: 'arcanista', lock: 6,
    stats: (up) => ({ cost: 3, m: up ? 2 : 1.5 }),
    text: (s, c) => `${kText(s, c)}\nK a TODOS. Tu rapidez\nqueda en 0.`,
    lore: 'Toda tu energía cinética colapsa en un solo punto… y explota.',
  },
  // ── Neutrales ──
  apuntes: {
    id: 'apuntes', name: 'Apuntes del Profe', type: 'Habilidad', icon: 'i_book', concept: 'Análisis', rarity: 'común', target: 'self', cls: 'neutral', exhaust: true, lock: 2,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Roba 3 cartas.\nSe agota.`,
    lore: 'Todo lo que necesitas ya lo dijo el profe en clase. Sólo hay que releerlo.',
  },
  cafe: {
    id: 'cafe', name: 'Café de Laboratorio', type: 'Habilidad', icon: 'i_bolt', concept: 'Energía', rarity: 'común', target: 'self', cls: 'neutral', exhaust: true, lock: 3,
    stats: (up) => ({ cost: 0, extra: up ? 3 : 2 }),
    text: (s) => `Gana ${s.extra} J y roba 1.\nMete 1 «Ruido Blanco»\na tu descarte. Se agota.`,
    lore: 'Energía rápida… y luego el bajón.',
  },
  entropia: {
    id: 'entropia', name: 'Entropía', type: 'Poder', icon: 'i_fog', concept: '2ª ley de la termodinámica', rarity: 'rara', target: 'self', cls: 'neutral', exhaust: true, lock: 4,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Al inicio de cada turno\npierdes 1 de vida y\nganas 1 J. Se agota.`,
    lore: 'Ningún proceso es perfecto: al convertir energía, algo siempre se desordena… y se pierde.',
  },
  formulario: {
    id: 'formulario', name: 'Formulario', type: 'Poder', icon: 'i_rune', concept: 'Análisis', rarity: 'rara', target: 'self', cls: 'neutral', exhaust: true, lock: 5,
    stats: (up) => ({ cost: up ? 1 : 2 }),
    text: () => `Robas 1 carta más\ncada turno.\nSe agota.`,
    lore: 'Con las fórmulas a la mano, cada turno ves más opciones.',
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
  // ════════ v0.16: cartas sugeridas por el profe ════════
  normalRobo: {
    id: 'normalRobo', name: 'Reacción Normal', type: 'Defensa', icon: 'i_shield', concept: 'Fuerza normal', rarity: 'común', target: 'self', cls: 'neutral',
    stats: (up) => ({ cost: 1, block: up ? 9 : 6 }),
    text: (s) => `Gana ${s.block} de Bloqueo.\nRoba 1 carta.`,
    lore: 'El suelo empuja hacia arriba con la misma fuerza con que lo empujas: N = m·g en una superficie horizontal.',
  },
  perdigones: {
    id: 'perdigones', name: 'Perdigones', type: 'Ataque', icon: 'i_momentum', concept: 'Impulso', rarity: 'común', target: 'all', cls: 'neutral',
    stats: (up) => ({ cost: 1, extra: up ? 4 : 3 }),
    text: (s) => `3 golpes de ${s.extra}\na enemigos al azar.`,
    lore: 'Muchos impulsos pequeños: J = F·Δt, uno tras otro. La suma también cuenta.',
  },
  fmaCuadrado: {
    id: 'fmaCuadrado', name: '(F = m·a)²', type: 'Ataque', icon: 'i_gaunt', concept: 'Análisis dimensional', rarity: 'rara', target: 'enemy',
    stats: (up) => ({ cost: up ? 1 : 2, m: 2, a: 2 }),
    text: (s, c) => { const { F } = force(s, c); return `F = ${F} N\nInflige F²/5 = ${Math.round((F * F) / 5)}.\n(¡Crece con TUS bonos!)`; },
    lore: 'Dimensionalmente no tiene sentido: N² no es una fuerza. Pero a los monstruos nadie les revisa las unidades.',
  },
  descarga: {
    id: 'descarga', name: 'Descarga Total', type: 'Ataque', icon: 'i_bolt', concept: 'Trabajo y energía', rarity: 'rara', target: 'all', cls: 'neutral',
    stats: (up) => ({ cost: 0, extra: up ? 7 : 5 }),
    text: (s, c) => `Gasta TODOS tus J:\n${s.extra}·J a todos\n= ${(s.extra ?? 5) * (c.energy ?? 0)}.`,
    lore: 'Todo el trabajo disponible, liberado de golpe. Después, a esperar a que vuelva la energía.',
  },
  fractura: {
    id: 'fractura', name: 'Fractura Frágil', type: 'Ataque', icon: 'i_crystal', concept: 'Mecánica de materiales', rarity: 'común', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 1, extra: up ? 10 : 7 }),
    text: (s) => `Rompe TODO el Bloqueo\ndel enemigo y le hace ${s.extra}.`,
    lore: 'Un material frágil no se deforma: se rompe de golpe cuando el esfuerzo supera su resistencia.',
  },
  golpeGracia: {
    id: 'golpeGracia', name: 'Golpe de Gracia', type: 'Ataque', icon: 'i_combat', concept: 'Conservación de la energía', rarity: 'común', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 1, extra: up ? 12 : 9 }),
    text: (s) => `Inflige ${s.extra}.\nSi lo derrotas, recuperas 2 J.`,
    lore: 'La energía no se pierde: la que le quitas al enemigo vuelve a ti.',
  },
  // ════════ PENITENTE DEL EMPUJE (masa variable: su vida es su combustible) ════════
  embestidaArd: {
    id: 'embestidaArd', name: 'Embestida Ardiente', type: 'Ataque', icon: 'i_fire', concept: 'Cantidad de movimiento', rarity: 'inicial', target: 'enemy', cls: 'penitente',
    stats: (up) => ({ cost: 1, m: up ? 4 : 3, extra: 2 }),
    text: (s, c) => { const r = pmv(s, c); return `p = m·v = ${r.m}·${r.v}\nInflige p + ${s.extra} = ${r.p + (s.extra ?? 0)}.`; },
    lore: 'Mientras más rápido vas, más cantidad de movimiento llevas: p = m·v.',
  },
  empuje: {
    id: 'empuje', name: 'Empuje', type: 'Habilidad', icon: 'i_momentum', concept: 'Masa variable', rarity: 'inicial', target: 'self', cls: 'penitente',
    stats: (up) => ({ cost: up ? 0 : 1, extra: 4 }),
    text: (s, c) => rText(s.extra ?? 4, c),
    lore: 'Ecuación del cohete: lo que expulsas hacia atrás te empuja hacia adelante. Mientras menos masa te quede, más rápido aceleras.',
  },
  llamarada: {
    id: 'llamarada', name: 'Llamarada de Escape', type: 'Ataque', icon: 'i_fire', concept: 'Masa variable', rarity: 'inicial', target: 'all', cls: 'penitente',
    stats: (up) => ({ cost: 1, extra: up ? 6 : 4 }),
    text: (s, c) => `${rText(2, c)}\nTus gases: ${s.extra} de Calor\na todos.`,
    lore: 'Los gases de escape salen a miles de grados. Lo que te impulsa a ti, quema a los demás.',
  },
  reabastecer: {
    id: 'reabastecer', name: 'Reabastecer', type: 'Habilidad', icon: 'i_heart', concept: 'Masa variable', rarity: 'inicial', target: 'self', cls: 'penitente', exhaust: true,
    stats: (up) => ({ cost: 1, extra: up ? 10 : 7 }),
    text: (s) => `Recupera ${s.extra} kg de masa\n(vida).\nSe agota.`,
    lore: 'Más combustible = más masa = acelerar cuesta más. Todo cohete vive con ese dilema.',
  },
  etapa: {
    id: 'etapa', name: 'Separación de Etapa', type: 'Habilidad', icon: 'i_rad', concept: 'Masa variable', rarity: 'rara', target: 'self', cls: 'penitente', exhaust: true,
    stats: (up) => ({ cost: 0, extra: up ? 10 : 12, block: up ? 2 : 1 }),
    text: (s, c) => `${rText(s.extra ?? 12, c)}\nRoba ${s.block}. Se agota.`,
    lore: 'Los cohetes sueltan sus tanques vacíos: menos masa muerta, más Δv.',
  },
  ignicion: {
    id: 'ignicion', name: 'Ignición Total', type: 'Ataque', icon: 'i_fire', concept: 'Masa variable', rarity: 'rara', target: 'enemy', cls: 'penitente',
    stats: (up) => ({ cost: 2, m: up ? 5 : 4, extra: 6 }),
    text: (s, c) => `${rText(s.extra ?? 6, c)}\nLuego golpea con p = ${s.m}·v.`,
    lore: 'Todo el combustible de golpe: un impulso enorme en muy poco tiempo.',
  },
  asistencia: {
    id: 'asistencia', name: 'Asistencia Gravitatoria', type: 'Habilidad', icon: 'i_pend', concept: 'Conservación de la energía', rarity: 'común', target: 'self', cls: 'penitente',
    stats: (up) => ({ cost: 1, extra: up ? 4 : 3 }),
    text: (s) => `+${s.extra} m/s SIN quemar masa.\nRoba 1 carta.`,
    lore: 'Las sondas Voyager robaron rapidez a Júpiter y Saturno al pasar cerca: honda gravitatoria.',
  },
  retro: {
    id: 'retro', name: 'Retrocohete', type: 'Defensa', icon: 'i_shield', concept: 'Impulso', rarity: 'común', target: 'self', cls: 'penitente',
    stats: (up) => ({ cost: 1, extra: up ? 4 : 3 }),
    text: (s, c) => { const dv = Math.min(4, c.vel ?? 0); return `Frena hasta 4 m/s y gana\nBloqueo = ${s.extra}·Δv = ${Math.round((s.extra ?? 3) * dv)}.`; },
    lore: 'Impulso = cambio de cantidad de movimiento: F·Δt = m·Δv. Frenar también es una fuerza.',
  },
  estelaPlasma: {
    id: 'estelaPlasma', name: 'Estela de Plasma', type: 'Ataque', icon: 'i_wind', concept: 'Cantidad de movimiento', rarity: 'común', target: 'all', cls: 'penitente',
    stats: (up) => ({ cost: 1, m: up ? 2 : 1.5 }),
    text: (s, c) => { const r = pmv(s, c); return `p = ${r.m}·${r.v} = ${r.p}\na TODOS los enemigos.`; },
    lore: 'Pasas tan rápido que tu estela golpea a todos los que dejaste atrás.',
  },
  absorcion: {
    id: 'absorcion', name: 'Absorción', type: 'Ataque', icon: 'i_skull', concept: 'Masa variable', rarity: 'común', target: 'enemy', cls: 'penitente',
    stats: (up) => ({ cost: 1, m: up ? 3 : 2, extra: up ? 8 : 6 }),
    text: (s, c) => { const r = pmv(s, c); return `p = ${r.m}·${r.v} = ${r.p}.\nSi lo derrotas, ganas\n${s.extra} kg de masa.`; },
    lore: 'Un sistema de masa variable también puede GANAR masa: como una gota que crece en la nube.',
  },
  tobera: {
    id: 'tobera', name: 'Tobera Variable', type: 'Poder', icon: 'i_crystal', concept: 'Masa variable', rarity: 'común', target: 'self', cls: 'penitente', exhaust: true,
    stats: (up) => ({ cost: 1, extra: up ? 30 : 20 }),
    text: (s) => `vₑ +${s.extra} m/s este combate:\ncada kg quemado empuja más.`,
    lore: 'Mientras más rápido salen los gases, más Δv obtienes por cada kilo.',
  },
  masaCritica: {
    id: 'masaCritica', name: 'Masa Crítica', type: 'Poder', icon: 'i_mass', concept: 'Masa variable', rarity: 'rara', target: 'self', cls: 'penitente', exhaust: true,
    stats: (up) => ({ cost: up ? 1 : 2 }),
    text: () => `Mientras tu masa sea MENOR\nque la mitad de tu máxima,\ntus ataques hacen ×1.5.`,
    lore: 'a = F/m: con muy poca masa, cualquier fuerza te vuelve un proyectil.',
  },
  reentrada: {
    id: 'reentrada', name: 'Reentrada', type: 'Ataque', icon: 'i_fire', concept: 'Fricción y calor', rarity: 'rara', target: 'enemy', cls: 'penitente', act: 2,
    stats: (up) => ({ cost: 2, m: 6, extra: up ? 7 : 5 }),
    text: (s, c) => { const r = pmv(s, c); return `p = ${r.m}·${r.v} = ${r.p} y ${s.extra}\nde Calor. El roce te quema\n3 kg (sin ganar rapidez).`; },
    lore: 'Al volver a la atmósfera, la fricción con el aire convierte la energía cinética en calor.',
  },
  // ════════ LEGENDARIAS: una copia por expedición. Salen tras vencer a un jefe
  //          (elige 1 de 3) o, a veces, en el botín de una élite. ════════
  newtonV: {
    id: 'newtonV', name: 'Venganza de Newton', type: 'Ataque', icon: 'i_momentum', concept: 'Cantidad de movimiento', rarity: 'legendaria', target: 'all', cls: 'neutral',
    stats: (up) => ({ cost: 2, m: 4, a: up ? 4 : 3 }),
    text: (s, c) => `${fText(s, c)}\nAtraviesa la fila: el ÚLTIMO\nenemigo recibe F × 1.5.`,
    lore: 'Cuna de Newton: las esferas de en medio no se mueven; la cantidad de movimiento pasa completa a la última.',
  },
  tiroParabolico: {
    id: 'tiroParabolico', name: 'Tiro Parabólico', type: 'Ataque', icon: 'i_angle', concept: 'Movimiento de proyectiles', rarity: 'legendaria', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 1, extra: up ? 22 : 16, block: up ? 13 : 11 }),
    text: (s) => `v₀ = ${s.block} m/s. Elige θ:\nR = v₀²·sen2θ / g.\nDonde cae: ${s.extra} de daño\n(ignora el Bloqueo).`,
    lore: '30° y 60° llegan igual de lejos: son ángulos complementarios. El máximo alcance es con 45°.',
  },
  pendulo: {
    id: 'pendulo', name: 'Péndulo', type: 'Ataque', icon: 'i_pend', concept: 'Conservación de la energía', rarity: 'legendaria', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 1, m: 3, a: up ? 4 : 3 }),
    text: (s, c) => `${fText(s, c)}\nAl inicio de tu siguiente\nturno REGRESA y vuelve\na golpear igual.`,
    lore: 'Sin fricción, el péndulo vuelve a la misma altura: la energía se conserva.',
  },
  patinadora: {
    id: 'patinadora', name: 'Patinadora', type: 'Ataque', icon: 'i_wind', concept: 'Cantidad de movimiento angular', rarity: 'legendaria', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 1, m: 2, a: up ? 4 : 3 }),
    text: (s, c) => `${fText(s, c)}\nGolpea 1 vez por cada carta\njugada este turno (máx. 6).`,
    lore: 'I·ω = constante: al cerrar los brazos, I baja y ω sube. Gira más rápido sin que nadie la empuje.',
  },
  resorte: {
    id: 'resorte', name: 'Resorte Comprimido', type: 'Defensa', icon: 'i_shield', concept: 'Energía elástica', rarity: 'legendaria', target: 'self', cls: 'neutral',
    stats: (up) => ({ cost: 1, block: up ? 12 : 8, extra: 1.5 }),
    text: (s) => `Gana ${s.block} de Bloqueo.\nGuarda el daño que recibas\neste turno y al siguiente lo\nsuelta ×${s.extra} a todos.`,
    lore: 'Ley de Hooke: F = −k·x. Lo que comprimes se guarda como ½·k·x² y regresa.',
  },
  dolorResonante: {
    id: 'dolorResonante', name: 'Dolor Resonante', type: 'Ataque', icon: 'i_crystal', concept: 'Resonancia', rarity: 'legendaria', target: 'enemy', cls: 'neutral', exhaust: true,
    stats: (up) => ({ cost: up ? 1 : 2, extra: 7 }),
    text: (s) => `+2 de Resonancia al objetivo.\nLuego TODOS detonan su\nResonancia: ${s.extra} por carga.\nSe agota.`,
    lore: 'El puente de Tacoma (1940) no cayó por un viento fuerte, sino por uno que empujaba al ritmo justo.',
  },
  honda: {
    id: 'honda', name: 'Honda de David', type: 'Ataque', icon: 'i_momentum', concept: 'Movimiento circular', rarity: 'legendaria', target: 'enemy', cls: 'neutral',
    stats: (up) => ({ cost: 0, m: up ? 2.5 : 2, extra: 4 }),
    text: (s) => `K = ½·${s.m}·v². Empieza con\nv = ${s.extra} m/s y gana +2 m/s por\ncada turno que la guardes\nen la mano (máx. 12).`,
    lore: 'Mientras gira, a = v²/r la mantiene en círculo. Al soltarla, sale en línea recta: 1ª ley.',
  },
  fuegoAmigo: {
    id: 'fuegoAmigo', name: 'Fuego Amigo', type: 'Habilidad', icon: 'i_reflect', concept: 'Giróscopo', rarity: 'legendaria', target: 'self', cls: 'neutral', exhaust: true,
    stats: (up) => ({ cost: up ? 1 : 2 }),
    text: () => `Este turno, los ataques\nenemigos se desvían y le\npegan a OTRO enemigo.\nSe agota.`,
    lore: 'Precesión: un giróscopo no cae hacia donde lo empujas, sino 90° de lado.',
  },
  // especial: la da Oppenheimer (Trinity). Se usa UNA vez y desaparece de tu mazo.
  trinity: {
    id: 'trinity', name: 'Trinity', type: 'Habilidad', icon: 'i_rad', concept: 'E = mc²', rarity: 'estado', target: 'all', cls: 'neutral', exhaust: true,
    stats: (up) => ({ cost: 0, extra: up ? 40 : 30 }),
    text: (s) => `Destruye a todos los enemigos\n(a los jefes: ${s.extra} % de su vida).\nRadiación: 10 de daño.\nSe consume para siempre.`,
    lore: '16 de julio de 1945: una fracción de gramo de masa se volvió la energía de 21,000 toneladas de TNT.',
  },
  tarea: {
    id: 'tarea', name: 'Tarea Pendiente', type: 'Estado', icon: 'i_book', concept: 'Estado', rarity: 'estado', target: 'self', cls: 'estado', exhaust: true,
    stats: () => ({ cost: 1 }),
    text: () => `Si sigue en tu mano al\nterminar el turno, pierdes\n3 de vida. Jugarla la entrega.`,
    lore: '«Problema 15-23. Para el lunes.» — Hibbelerius',
  },
  // ════════════ EL ABISMO DE LOS EJES (sólo salen en ese modo) ════════════
  centroideGolpe: {
    id: 'centroideGolpe', name: 'Golpe al Centroide', type: 'Ataque', icon: 'i_angle', concept: 'Centroide', rarity: 'común', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, m: 4, a: up ? 4 : 3 }),
    text: (s, c) => `${fText(s, c)}\n×1.5 si el enemigo\nno tiene Bloqueo.`,
    lore: 'El centroide es el «punto promedio» de una figura: x̄ = ΣxᵢAᵢ / ΣAᵢ. Un golpe ahí no hace girar al cuerpo: toda la fuerza lo traslada.',
  },
  momentoInercia: {
    id: 'momentoInercia', name: 'Momento de Inercia', type: 'Defensa', icon: 'i_crystal', concept: 'Momento de inercia', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 2, block: up ? 15 : 10, extra: up ? 3 : 2 }),
    text: (s) => `I = Σm·r² =\n${s.extra}·(1² + 2²) = ${s.block}\nGana ${s.block} de Bloqueo.`,
    lore: 'El momento de inercia mide qué tanto se resiste un cuerpo a girar. La masa lejos del eje cuenta al cuadrado de la distancia.',
  },
  radioGiro: {
    id: 'radioGiro', name: 'Radio de Giro', type: 'Defensa', icon: 'i_shield', concept: 'Radio de giro', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, block: up ? 8 : 6 }),
    text: (s) => `Gana ${s.block} de Bloqueo.\n+4 si tienes 5 o más\ncartas en la mano.`,
    lore: 'k = √(I/m): la distancia a la que tendrías que concentrar toda la masa para que gire igual. Mientras más extendido, más difícil de girar.',
  },
  ejesParalelos: {
    id: 'ejesParalelos', name: 'Ejes Paralelos', type: 'Habilidad', icon: 'i_angle', concept: 'Ejes paralelos', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `I = I₀ + m·d²\nTu siguiente ataque\neste turno hace ×2.`,
    lore: 'Teorema de Steiner: si mueves el eje una distancia d del centro de masa, el momento de inercia crece m·d². Lejos del eje, todo pesa más.',
  },
  pirueta: {
    id: 'pirueta', name: 'Pirueta', type: 'Habilidad', icon: 'i_wind', concept: 'Momento angular', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: 0, extra: up ? 2 : 1 }),
    text: (s) => `I₁ω₁ = I₂ω₂: recoges\nlos brazos y giras más.\nRobas 2 y ganas ${s.extra} J.\nSe agota.`,
    lore: 'Sin par externo el momento angular H = I·ω se conserva. Si I baja a la mitad, ω se duplica: así gira una patinadora (o una bailarina ahogada).',
  },
  volanteAbisal: {
    id: 'volanteAbisal', name: 'Volante Abisal', type: 'Poder', icon: 'i_pend', concept: 'Energía rotacional', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: up ? 1 : 2 }),
    text: () => `K = ½·I·ω²\n+1 J al inicio de cada\nturno de este combate.`,
    lore: 'Un volante guarda energía en su giro y la entrega poco a poco. Mientras más masa lejos del eje, más energía cabe.',
  },
  geometriaImposible: {
    id: 'geometriaImposible', name: 'Geometría Imposible', type: 'Ataque', icon: 'i_fog', concept: 'Centroide', rarity: 'rara', target: 'all', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 2, m: up ? 6 : 5, a: 4 }),
    text: (s, c) => `${fText(s, c)}\na TODOS. Los ángulos\nno suman 180°: quedas\nConfundido.`,
    lore: 'En la ciudad sumergida los triángulos no suman 180° y las figuras no tienen centroide. Golpear ahí desordena también tu cabeza.',
  },
  ojoQueGira: {
    id: 'ojoQueGira', name: 'El Ojo que Gira', type: 'Habilidad', icon: 'i_ojo', concept: 'Horror', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 0, extra: up ? 3 : 2 }),
    text: (s) => `Miras al abismo:\n−10 de Cordura.\nRobas 3 y ganas ${s.extra} J.`,
    lore: 'Hay cosas que se aprenden más rápido mirándolas de frente. El precio se paga en cordura.',
  },
  steiner: {
    id: 'steiner', name: 'Teorema de Steiner', type: 'Poder', icon: 'i_anvil', concept: 'Ejes paralelos', rarity: 'legendaria', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: up ? 1 : 2, extra: up ? 4 : 3 }),
    text: (s) => `I = I₀ + m·d²\n+${s.extra} kg y +1 m/s² a tus\nataques el resto del\ncombate.`,
    lore: 'Jakob Steiner demostró que basta conocer I respecto al centro de masa para calcularlo respecto a CUALQUIER eje paralelo.',
  },
  despertar: {
    id: 'despertar', name: 'Despertar al Durmiente', type: 'Ataque', icon: 'i_necro', concept: '2ª ley', rarity: 'legendaria', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: up ? 1 : 2, m: 10 }),
    text: (s, c) => {
      const loc = Math.max(0, 100 - (c.cordura ?? 70));
      const a = Math.max(1, Math.round(loc / 10));
      return `m = ${r1((s.m ?? 0) + c.masaBonus)} kg\na = Locura/10 = ${a} m/s²\nMás loco, más fuerte.`;
    },
    lore: 'El Durmiente no sueña con nosotros: sueña con ecuaciones. Mientras menos cordura te queda, más de su fuerza pasa por ti.',
  },
  // ── v0.40 · cartas más locas (y algunas chistosas) ──
  calamarTorque: {
    id: 'calamarTorque', name: 'Calamar de Torque', type: 'Ataque', icon: 'i_hoz', concept: 'Momento de una fuerza', rarity: 'común', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, m: 2, a: up ? 3 : 2 }),
    text: (s, c) => { const { F } = force(s, c); return `Tres tentáculos golpean:\nF = ${F} N, tres veces.\n(Los otros 5 descansan.)`; },
    lore: 'Tiene ocho brazos, pero sólo tres tienen ganas de trabajar. τ = r × F: con brazos tan largos, hasta un empujón gira mucho.',
  },
  gatoSchrodinger: {
    id: 'gatoSchrodinger', name: 'Gato de Schrödinger Ahogado', type: 'Habilidad', icon: 'i_paw', concept: 'Probabilidad', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Abres la caja:\n50 %: +3 J\n50 %: robas 3 cartas.`,
    lore: 'Mientras nadie abre la caja, está vivo y muerto a la vez. Y además, empapado. Muy molesto.',
  },
  cafeAbismo: {
    id: 'cafeAbismo', name: 'Café del Abismo', type: 'Habilidad', icon: 'i_jarra', concept: 'Energía', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 0, extra: up ? 3 : 2 }),
    text: (s) => `+${s.extra} J.\nMete 1 «Susurro»\na tu descarte.`,
    lore: 'Huele a tinta de calamar. Te despierta… demasiado. Ahora escuchas cosas.',
  },
  llamadaPerdida: {
    id: 'llamadaPerdida', name: "Llamada Perdida de R'lyeh", type: 'Habilidad', icon: 'i_note', concept: 'Ondas', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Un enemigo al azar (no\njefe) pierde su siguiente\nturno. −8 de Cordura.\nSe agota.`,
    lore: '«Ph\'nglui… ¿bueno? ¿Bueno? Se cortó.» Las ondas tardan mucho en subir desde el fondo del mar.',
  },
  dclTentaculos: {
    id: 'dclTentaculos', name: 'DCL de un Tentáculo', type: 'Defensa', icon: 'i_shield', concept: 'Diagrama de cuerpo libre', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, block: up ? 6 : 4 }),
    text: (s) => `Gana ${s.block} de Bloqueo\npor cada enemigo vivo.`,
    lore: 'Dibujar todas las fuerzas de un ser con 40 tentáculos lleva su tiempo. Mientras tanto, te cubres detrás del pizarrón.',
  },
  enLibras: {
    id: 'enLibras', name: 'Lo Calculé en Libras', type: 'Ataque', icon: 'i_mass', concept: 'Unidades', rarity: 'común', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, m: 3, a: up ? 3 : 2 }),
    text: (s, c) => { const { F } = force(s, c); return `F = ${F} N… pero en libras:\n×2.2 = ${Math.round(F * 2.2)} de daño.\nPor accidente, funciona.`; },
    lore: '1 kg = 2.2 lb. Te equivocaste de unidades… y el enemigo también. En el examen no tendrás tanta suerte.',
  },
  manoMontemayor: {
    id: 'manoMontemayor', name: 'La Tercera Mano de Montemayor', type: 'Habilidad', icon: 'i_book', concept: 'Estudio', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: up ? 0 : 1 }),
    text: () => `Robas 1 carta por cada 2\npreguntas que acertaste en\nesta expedición (1 a 4).\nSe agota.`,
    lore: 'Escribía con la izquierda. Luego con las dos. Luego con una tercera mano que no recuerda haber tenido.',
  },
  patoHule: {
    id: 'patoHule', name: 'Pato de Hule Primigenio', type: 'Defensa', icon: 'i_feather', concept: 'Flotación', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 0, block: up ? 5 : 3 }),
    text: (s) => `Gana ${s.block} de Bloqueo.\nSi estás Confundido: ×3.\nCuac.`,
    lore: 'Principio de Arquímedes: desaloja su propio peso en agua y flota. Siempre flota. Incluso en el abismo. Nadie sabe de dónde salió.',
    voz: { jugar: ['Cuac.', 'Cuac. Flotar también es un plan.', 'Cuac cuac. (Eso fue Arquímedes.)'] }, // al robarlo te da una pista (Combat.ts)
  },
  // ════════ v0.53 · más cartas del Abismo: dinámica del cuerpo rígido y las Tierras del Sueño ════════
  rodadura: {
    id: 'rodadura', name: 'Rodar sin Deslizar', type: 'Ataque', icon: 'i_momentum', concept: 'Rodadura', rarity: 'común', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, m: 3, a: up ? 4 : 3 }),
    text: (s, c) => `${fText(s, c)}\nSi tienes Bloqueo: ×1.5\n(el agarre: v = ω·r).`,
    lore: 'Una rueda rueda sin deslizar cuando el punto de contacto no resbala: v = ω·r. Sin fricción (agarre) sólo patinaría.',
  },
  torqueAbisal: {
    id: 'torqueAbisal', name: 'Torque Abisal', type: 'Ataque', icon: 'i_angle', concept: 'Momento de una fuerza', rarity: 'común', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, m: 3, a: up ? 3 : 2 }),
    text: (s, c) => `${fText(s, c)}\nτ = r × F: ×1 al primero,\n×1.5 al 2º, ×2 al 3º de la fila.`,
    lore: 'El momento (torque) de una fuerza es τ = r × F: la misma fuerza hace girar más mientras más lejos del eje se aplique. Por eso las manijas van lejos de las bisagras.',
  },
  energiaRotacional: {
    id: 'energiaRotacional', name: 'Energía de Rotación', type: 'Ataque', icon: 'i_pend', concept: 'Energía rotacional', rarity: 'rara', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: up ? 1 : 2, extra: 2 }),
    text: () => `K = ½·I·ω² con I = 4.\nω = cartas que ya jugaste\neste turno + 1 (máx. 6).`,
    lore: 'Un cuerpo que gira guarda energía cinética K = ½·I·ω². Como ω va al cuadrado, girar el doble de rápido guarda cuatro veces más energía.',
  },
  centroPercusion: {
    id: 'centroPercusion', name: 'Centro de Percusión', type: 'Ataque', icon: 'i_combat', concept: 'Centro de percusión', rarity: 'común', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, m: up ? 3 : 2, a: 4 }),
    text: (s, c) => `${fText(s, c)}\nSi lo DETIENES:\nrobas 2 cartas.`,
    lore: 'Si golpeas un bate justo en su centro de percusión, el mango no te «pica» la mano: no hay reacción en el eje. Es el punto dulce.',
  },
  anguloRecto: {
    id: 'anguloRecto', name: 'Ángulo de 90° de Tíndalos', type: 'Ataque', icon: 'i_angle', concept: 'Componentes de una fuerza', rarity: 'rara', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, m: 3, a: up ? 4 : 3 }),
    text: (s, c) => `${fText(s, c)}\nSale de una esquina:\nIGNORA el Bloqueo.`,
    lore: 'Toda fuerza se descompone en dos componentes perpendiculares (a 90°): Fx = F·cosθ y Fy = F·senθ. El Sabueso de Tíndalos sólo conoce los ángulos rectos.',
  },
  rampaAbisal: {
    id: 'rampaAbisal', name: 'Rampa del Abismo', type: 'Habilidad', icon: 'i_wind', concept: 'Plano inclinado', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: up ? 0 : 1, extra: 3 }),
    text: () => `a = g·senθ (θ = 18°):\n+3 m/s² a tus ataques\neste turno (o +2 m/s). Roba 1.`,
    lore: 'En un plano inclinado sin fricción, la componente del peso a lo largo de la rampa es m·g·senθ, así que el cuerpo acelera con a = g·senθ.',
  },
  penduloFisico: {
    id: 'penduloFisico', name: 'Péndulo Físico', type: 'Defensa', icon: 'i_pend', concept: 'Péndulo físico', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, block: up ? 8 : 6 }),
    text: (s) => `Gana ${s.block} de Bloqueo.\nOscila: al inicio de tu\nsiguiente turno, ${s.block} más.`,
    lore: 'Un péndulo físico (un cuerpo rígido que cuelga) oscila con periodo T = 2π·√(I / m·g·d). Va y regresa: lo que da, lo vuelve a dar.',
  },
  giroscopio: {
    id: 'giroscopio', name: 'Giroscopio de Montemayor', type: 'Poder', icon: 'i_rune', concept: 'Giroscopio', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: up ? 0 : 1, block: 3 }),
    text: (s) => `Precesión: al inicio de\ncada turno +${s.block} de Bloqueo\ny ya no te ATURDEN.`,
    lore: 'Un giroscopio que gira rápido conserva la dirección de su eje (momento angular H = I·ω). En lugar de caerse, precesa. Montemayor lo usaba para no marearse.',
  },
  trenEngranes: {
    id: 'trenEngranes', name: 'Tren de Engranes', type: 'Habilidad', icon: 'i_bolt', concept: 'Engranes', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 0, extra: up ? 2 : 1 }),
    text: (s) => `ω₁·r₁ = ω₂·r₂:\n+${s.extra} J, +1 por cada Poder\nque jugaste (máx. +4).`,
    lore: 'En dos engranes que se tocan, la velocidad del punto de contacto es igual: ω₁·r₁ = ω₂·r₂. El engrane chico gira más rápido.',
  },
  suenoProfundo: {
    id: 'suenoProfundo', name: 'Sueño Profundo', type: 'Habilidad', icon: 'i_sueno', concept: 'Equilibrio', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: 1, extra: up ? 16 : 12 }),
    text: (s) => `Bajas los escalones del\nsueño: +${s.extra} de Cordura\ny robas 2. Se agota.`,
    lore: 'Kuranes soñó tanto con Celephaïs que se quedó a vivir ahí. Un rato de sueño profundo también equilibra tu mente (ΣF = 0).',
  },
  llavePlata: {
    id: 'llavePlata', name: 'La Llave de Plata', type: 'Habilidad', icon: 'i_rune', concept: 'Simetría temporal', rarity: 'legendaria', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: 0, extra: up ? 3 : 2 }),
    text: (s) => `Regresa el tiempo: ${s.extra} cartas\nde tu descarte vuelven\na tu mano. Se agota.`,
    lore: 'Las leyes de Newton no distinguen el pasado del futuro: si inviertes t, siguen funcionando. Randolph Carter giró la llave y volvió a ser niño.',
  },
  necroDinamica: {
    id: 'necroDinamica', name: 'Necronomicón de Dinámica', type: 'Poder', icon: 'i_book', concept: '1ª ley', rarity: 'legendaria', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: up ? 1 : 2 }),
    text: () => `Cada vez que DETIENES\na un enemigo: +1 J\ny robas 1 carta.`,
    lore: 'El capítulo prohibido del Hibbeler: «un cuerpo en movimiento sigue en movimiento… a menos que tú lo detengas». Cada vez que lo logras, el libro te premia.',
  },
  // ════════ v0.57 · CARTAS QUE HABLAN ════════
  calculadoraBolsillo: {
    id: 'calculadoraBolsillo', name: 'Calculadora de Bolsillo', type: 'Habilidad', icon: 'i_bolt', concept: 'Unidades', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 0, extra: up ? 1.75 : 1.5 }),
    text: (s) => `Tu siguiente Ataque ×${s.extra}.\nPero 1 de cada 4 veces\nestá en RAD: ×0.75.`,
    lore: 'Siempre revisa el modo antes de un examen: sen(30) en radianes da −0.99, no 0.5. La calculadora no se equivoca… tú sí.',
    voz: { jugar: ['Beep. Según mis cálculos… da 42.', '¿Grados o radianes? Mejor no preguntes.', 'Error de sintaxis. Es broma. ¿O no?', 'Ya calculé. Tú confía.'] },
  },
  hibbelerMaldito: {
    id: 'hibbelerMaldito', name: 'El Hibbeler Maldito', type: 'Poder', icon: 'i_book', concept: '1ª ley', rarity: 'rara', target: 'self', cls: 'neutral', abismo: true, exhaust: true,
    stats: (up) => ({ cost: up ? 0 : 1, block: 6 }),
    text: (s) => `Cada vez que DETIENES\na un enemigo: +${s.block} Bloqueo.\nSi acabas tu turno con 2+ J\nsin usar: −3 Cordura.`,
    lore: 'El libro de texto del curso, poseído. Te premia cuando aplicas bien la 1ª ley y te regaña cuando desperdicias energía.',
    voz: { jugar: ['Ábreme en la página 47.', 'Otra vez tú. ¿Ya hiciste los problemas impares?'] },
  },
  tareaOlvidada: {
    id: 'tareaOlvidada', name: 'La Tarea Olvidada', type: 'Ataque', icon: 'i_note', concept: 'Impulso', rarity: 'rara', target: 'enemy', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, block: up ? 9 : 6, extra: 5 }),
    text: (s) => `Inflige ${s.block} + ${s.extra} por cada\nturno que lleva en tu mano\n(máx. 6). Se queda en la mano;\nmientras, −2 Cordura por turno.`,
    lore: 'Como el impulso (I = F·Δt): mientras más tiempo acumula, más pega. Pero mientras no la entregas, te pesa en la conciencia.',
    voz: { robar: ['Hola. Soy la tarea que olvidaste.', 'La fecha límite era ayer.'], jugar: ['¡Por fin! Entregada.', 'Tarde, pero entregada.', '¿Ves? No era tan difícil.'], mano: ['Llevo {n} turno(s) aquí…', '¿Me vas a entregar o no?', 'El profe preguntó por mí.'] },
  },
  dclParlante: {
    id: 'dclParlante', name: 'El Diagrama que Habla', type: 'Defensa', icon: 'i_shield', concept: 'Diagrama de cuerpo libre', rarity: 'común', target: 'self', cls: 'neutral', abismo: true,
    stats: (up) => ({ cost: 1, block: up ? 7 : 5, extra: 3 }),
    text: (s) => `Gana ${s.block} de Bloqueo\n+${s.extra} por cada enemigo\nque te va a atacar.`,
    lore: 'Antes de calcular, dibuja todas las fuerzas: peso, normal, fricción, tensiones. Lo que no dibujas, no existe… hasta que te pega.',
    voz: { jugar: ['Peso hacia abajo, normal hacia arriba… ¿y la fricción? ¡Me olvidaste la fricción!', 'Primero me dibujas, luego calculas. ¡Siempre!', 'Flechas, flechas, flechas. Así me gusta.'] },
  },
  susurro: {
    id: 'susurro', name: 'Susurro', type: 'Estado', icon: 'i_fog', concept: 'Estado', rarity: 'estado', target: 'self', cls: 'estado', exhaust: true,
    stats: () => ({ cost: 1 }),
    text: () => `Si sigue en tu mano al\nterminar el turno:\n−3 de Cordura.\nJugarla la calla.`,
    lore: '«…los ejes están ahí, pero ellos no los ven…» — diario de Ignacio Montemayor',
  },
};

export const STARTER_DECK = ['golpe', 'golpe', 'golpe', 'golpe', 'normal', 'normal', 'normal', 'normal', 'embestida', 'carrera'];
// v0.17: 2 Acelerar en el mazo inicial (antes 1) para que el Arcanista no se quede sin rapidez en su primer combate
export const STARTER_ARCANISTA = ['proyectil', 'proyectil', 'proyectil', 'proyectil', 'escudoE', 'escudoE', 'chispa', 'acelerar', 'acelerar', 'frenado'];

export const STARTER_PENITENTE = ['embestidaArd', 'embestidaArd', 'embestidaArd', 'embestidaArd', 'empuje', 'empuje', 'empuje', 'llamarada', 'reabastecer', 'reabastecer'];

export function starterDeck(clase: string) {
  return clase === 'arcanista' ? STARTER_ARCANISTA : clase === 'penitente' ? STARTER_PENITENTE : STARTER_DECK;
}

/** Cartas que pueden salir de recompensa o en la tienda para cada clase */
export function rewardPool(clase: string, acto = 1, nivel = 99, am = false): string[] {
  const ok = (c: CardDef) => (c.act ?? 1) <= acto && (c.lock ?? 0) <= nivel && (!c.am || am) && (!c.abismo || acto === 5);
  const own = Object.values(CARDS).filter((c) => ok(c) &&
    c.rarity !== 'estado' && c.rarity !== 'legendaria' && (c.cls ?? 'caballero') === (clase || 'caballero'));
  const neutral = Object.values(CARDS).filter((c) => c.cls === 'neutral' && c.rarity !== 'estado' && c.rarity !== 'legendaria' && ok(c));
  return [...own, ...neutral].filter((c) => c.rarity !== 'inicial' || ['embestida', 'carrera', 'acelerar', 'frenado', 'empuje'].includes(c.id)).map((c) => c.id);
}

/** Daño de Límite cuando no remata (6, o 9 mejorada) */
export function limiteDano(umbral: number) {
  return umbral >= 30 ? 9 : 6;
}

/** Cartas legendarias */
export const LEGENDARIAS = Object.values(CARDS).filter((c) => c.rarity === 'legendaria').map((c) => c.id);

/** Legendarias que aún no tienes en el mazo (una copia por expedición) */
export function legendariasDisponibles(deck: CardInst[], n = 3, abismo = false) {
  const own = new Set(deck.map((c) => c.id));
  return LEGENDARIAS.filter((id) => !own.has(id) && !!CARDS[id].abismo === abismo).sort(() => Math.random() - 0.5).slice(0, n);
}

/** Nombre corto de cada edición */
export const NOMBRE_EDICION: Record<Edicion, string> = { lamina: 'Lámina', holo: 'Holográfica', poli: 'Polícroma', cristal: 'Cristal' };

/** Compatibilidad: pool del caballero */
export const REWARD_POOL = rewardPool('caballero');

export function cardName(ci: CardInst) {
  return CARDS[ci.id].name + (ci.up ? '+' : '') + (ci.evo ? ` ✦${ci.evo}` : '') + (ci.ed ? ` (${NOMBRE_EDICION[ci.ed]})` : '');
}

/** Estadísticas de una carta concreta (mejora + evolución de Darwin) */
export function statsOf(ci: CardInst): CardStats {
  const s = CARDS[ci.id].stats(ci.up);
  const n = ci.evo ?? 0;
  if (!n) return s;
  const dm = CARDS[ci.id].cls === 'arcanista' ? 0.5 : 2; // en ½mv² la masa pesa mucho más
  return { ...s, m: s.m !== undefined ? s.m + dm * n : s.m, block: s.block !== undefined ? s.block + 3 * n : s.block };
}

/** ¿Se puede evolucionar? (tiene masa o Bloqueo) */
export function evolucionable(ci: CardInst) {
  const s = CARDS[ci.id].stats(ci.up);
  return CARDS[ci.id].rarity !== 'estado' && (s.m !== undefined || s.block !== undefined);
}
