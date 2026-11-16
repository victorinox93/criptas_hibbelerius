// ════════════════════════════════════════════════════════════════
//  v0.89 · RETO DE LA SEMILLA
//
//  Todo el azar del juego sale de Math.random (y Phaser lo usa por dentro
//  para barajar y sortear). En una partida «con semilla» se cambia
//  Math.random por un generador que siempre da la misma secuencia, y se
//  vuelve a sembrar en cada punto donde se reparte algo:
//
//      semilla del reto | tramo | nodo del mapa | escena | (sub-clave)
//
//  Así el mapa, los jefes, los enemigos de cada nodo, las tiendas, los
//  encuentros, las recompensas y el primer barajeo de cada pelea son
//  IGUALES para todos los alumnos, sin importar en qué orden den clic.
//
//  Lo que NO se siembra, a propósito:
//    · las preguntas (Rune) y los minijuegos: si los datos del problema
//      fueran siempre los mismos, bastaría memorizar la respuesta;
//    · lo que pasa DENTRO de una pelea después del primer barajeo (el
//      segundo barajeo del mazo, golpes al azar…): depende del ritmo de
//      cada quien y no se puede igualar.
//
//  Las partidas normales no se tocan: ahí Math.random sigue siendo el original.
// ════════════════════════════════════════════════════════════════
import { Game } from './state';

const nativo = Math.random;
let sembrado = false;

/** Convierte un texto en un entero de 32 bits (xmur3) */
function hash(txt: string) {
  let h = 1779033703 ^ txt.length;
  for (let i = 0; i < txt.length; i++) {
    h = Math.imul(h ^ txt.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Generador con semilla (mulberry32): rápido y suficiente para un juego */
function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Escenas donde se reparte algo que debe ser igual para todos */
const SEMBRADAS = new Set(['Map', 'Combat', 'Reward', 'Event', 'Shop', 'Sanctuary', 'Campfire', 'Abismo', 'Relato', 'Sueno',
  'Dilemma', 'Alma', 'AltarFilo', 'Sacrificio', 'Nyarlathotep', 'Maxwell', 'Crisol']);
/** Escenas que corren encima de otra: no deben tocar el azar de la que está debajo */
const ENCIMA = new Set(['Overlay', 'Boot', 'Title']);

/** Siembra el azar con una semilla y una clave cualesquiera (para armar el reto antes de que exista la partida) */
export function sembrarCon(semilla: number, clave: string) {
  Math.random = mulberry32(hash(`${semilla}|${clave}`));
  sembrado = true;
}

/** Devuelve Math.random al original */
export function soltar() {
  if (!sembrado) return;
  Math.random = nativo;
  sembrado = false;
}

/** ¿La partida actual es un Reto de la Semilla? */
export function conSemilla() {
  const r = Game.run;
  return !!r && r.semilla !== undefined && !r.done;
}

/**
 * Siembra el azar para un punto de la partida. No hace nada (y suelta el azar)
 * si la partida no es un reto. La clave lleva el tramo y el nodo, así que cada
 * lugar del mapa tiene su propia secuencia.
 */
export function sembrar(clave: string) {
  const r = Game.run;
  if (!conSemilla() || !r) return soltar();
  sembrarCon(r.semilla!, `${r.tramo ?? 1}|${r.pos}|${clave}`);
}

/** Lo llama main.ts cada vez que arranca una escena */
export function alArrancarEscena(key: string) {
  if (ENCIMA.has(key)) return;
  if (SEMBRADAS.has(key)) sembrar(key);
  else soltar();
}
