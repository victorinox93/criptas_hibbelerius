// ════════════════════════════════════════════════════════════════
//  HORROR CÓSMICO: la ENTROPÍA MENTAL (cordura) y el NECRONOMICÓN DE HIBBELER.
//
//  Entropía mental (0–100): sube al ver jefes, leer el Necronomicón o
//  pelear contra las Sombras; baja al descansar, al hablar con los Ecos
//  y al resolver bien las runas.
//    40+  Inquieto: las fórmulas de tus cartas empiezan a borrarse.
//    70+  Delirante: «Visión del Abismo», tus ataques hacen +2.
//    100  Quiebre: en el siguiente combate aparece una Sombra que sólo tú ves.
//  Nota pedagógica: el juego NUNCA muestra fórmulas incorrectas; sólo
//  las tapa con símbolos. Así nadie aprende algo mal.
//
//  Necronomicón: reliquia especial (dilema «El Atril sin Lector», Actos II y III).
//  En cada fogata puedes leer un Problema Prohibido: poder permanente + costo.
// ════════════════════════════════════════════════════════════════

export const ENTROPIA = {
  max: 100,
  inquieto: 40,
  delirante: 70,
  jefe: 8, // al empezar un combate contra jefe
  elite: 3, // al empezar contra una élite
  leer: 20, // por cada Problema Prohibido
  tomarLibro: 15,
  fogata: -20, // descansar
  eco: -10, // hablar con una figura histórica
  runa: -3, // cada runa bien resuelta
  trasQuiebre: 60, // a cuánto baja después de que aparece la Sombra
  vision: 2, // daño extra de la Visión del Abismo
};

export interface ProhibidoDef {
  id: string;
  name: string;
  poder: string;
  costo: string;
  lore: string;
}

export const PROHIBIDOS: Record<string, ProhibidoDef> = {
  p_infinito: {
    id: 'p_infinito', name: 'Problema 13-∞: La Serie que no Converge',
    poder: 'Robas 1 carta más cada turno.', costo: '−10 de Vida máxima.',
    lore: 'La suma no termina nunca. Cada término te pide un poco más.',
  },
  p_energia: {
    id: 'p_energia', name: 'Problema 14-0: La Energía que no se Conserva',
    poder: '+1 J cada turno.', costo: '2 «Error de Signo» permanentes en tu mazo.',
    lore: 'ΔE ≠ 0. Alguien (o algo) está metiendo energía desde fuera del sistema.',
  },
  p_masaneg: {
    id: 'p_masaneg', name: 'Problema 15-(−1): Masa Negativa',
    poder: '+3 kg a tus ataques (Arcanista: empiezas cada combate con +3 m/s).', costo: 'Cada golpe que recibes hace +2 de daño.',
    lore: 'Si m < 0, la fuerza y la aceleración apuntan en sentidos opuestos. Empujas y te viene encima.',
  },
  p_omega: {
    id: 'p_omega', name: 'Problema Ω: El Universo Cerrado',
    poder: 'Los enemigos empiezan cada combate con 15 % menos vida.', costo: 'Las fogatas curan la mitad.',
    lore: 'Si la densidad supera la crítica, todo se contrae. También tus fuerzas.',
  },
  p_abismo: {
    id: 'p_abismo', name: 'Problema del Abismo: Mirar de Vuelta',
    poder: 'Tus ataques hacen +1 por cada 20 de Locura (máx. +5).', costo: 'Las fogatas ya no bajan tu Locura.',
    lore: 'Cuando miras largo tiempo al abismo, el abismo resuelve el problema por ti.',
  },
};

export const PROHIBIDO_IDS = Object.keys(PROHIBIDOS);

/** Murmullos que aparecen en combate cuando la Entropía es alta */
export const SUSURROS = [
  '«…las unidades no cuadran…»',
  '«…¿y si g fuera negativa?…»',
  '«…el diagrama de cuerpo libre tiene una fuerza de más…»',
  '«…el problema 13-∞ te está esperando…»',
  '«…ΣF = 0… ΣF = 0… ΣF = 0…»',
  '«…la entropía siempre aumenta…»',
  '«…Hibbelerius no escribió el último capítulo. Lo SOÑÓ…»',
];

/** Símbolos con los que se tapan las fórmulas al estar Inquieto */
const GLIFOS = ['?', '¿', 'Ω', '∞', 'ψ', '#', '∴'];

export function nivelEntropia(e: number) {
  if (e >= ENTROPIA.max) return { nombre: 'Quiebre', color: '#c84aff' };
  if (e >= ENTROPIA.delirante) return { nombre: 'Delirante', color: '#9bf07a' };
  if (e >= ENTROPIA.inquieto) return { nombre: 'Inquieto', color: '#c8b070' };
  return { nombre: 'Lúcido', color: '#9ab8c8' };
}

/** Tapa algunos caracteres del texto (más mientras más Entropía). Nunca cambia un número por otro. */
export function borrarTexto(s: string, e: number, semilla = 1) {
  if (e < ENTROPIA.inquieto) return s;
  const p = Math.min(0.35, (e - ENTROPIA.inquieto + 10) / 200);
  let x = (semilla * 9301 + 49297) % 233280; // azar fijo por carta (no parpadea)
  const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  return s.replace(/[^\s\n]/g, (c) => (rnd() < p ? GLIFOS[Math.floor(rnd() * GLIFOS.length)] : c));
}
