// ════════════════════════════════════════════════════════════════
//  v0.59 · LOS ASTROS AMBULANTES (sólo en el Abismo)
//  Nodos especiales del mapa (1 o 2 por tramo): los planetas despertaron
//  y bajaron al Abismo. Son más fuertes que una élite y más débiles que
//  un jefe. Cada uno pelea con su física (gravedad, presión, órbita…).
//  Premio: un sobre (te quedas con 1 carta) y, la primera vez, un
//  cosmético (logro abismo_astro_<id>, src/data/logros.ts).
//  Arte: tools/arte/astros.py → src/art/astros_sprites.ts
//  Enemigos: src/data/enemies.ts (astro_mercurio, astro_venus, astro_marte + astro_fobos y astro_deimos, astro_jupiter, astro_saturno, astro_sol)
// ════════════════════════════════════════════════════════════════
import { Game } from '../state';

export interface AstroInfo {
  id: string;
  nombre: string;
  titulo: string;
  tema: string; // la física de su pelea
  dato: string; // dato real del planeta
  mecanica: string; // qué hace en el combate
  premio: string; // nombre del cosmético que da la primera vez
  /** enemigos del combate (src/data/enemies.ts, con prefijo astro_) */
  encuentro: string[];
  /** tramo mínimo en el que puede salir */
  desde?: number;
}

export const ASTROS: Record<string, AstroInfo> = {
  mercurio: {
    id: 'mercurio', nombre: 'Mercurio, el Mensajero Veloz', titulo: 'Astro ambulante', tema: 'Rapidez y periodo orbital (v = 2πr/T)',
    dato: 'Es el planeta más rápido: da una vuelta al Sol en sólo 88 días, a unos 47 km/s.',
    mecanica: 'Pega muchas veces seguidas y te marea (robas menos cartas).', premio: 'Casco Alado y Sandalias de Mercurio', encuentro: ['astro_mercurio'],
  },
  venus: {
    id: 'venus', nombre: 'Venus, la Nube que Quema', titulo: 'Astro ambulante', tema: 'Presión (P = F/A)',
    dato: 'Su atmósfera aplasta con 92 veces la presión de la Tierra y llueve ácido sulfúrico. Gira al revés que casi todos los planetas.',
    mecanica: 'Su lluvia de ácido te da HEMORRAGIA y su presión de 92 atm te quita todo el Bloqueo antes del golpe.', premio: 'Escudo de las Nubes y capa Nube de Venus', encuentro: ['astro_venus'],
  },
  marte: {
    id: 'marte', nombre: 'Marte, el Ojo Rojo', titulo: 'Astro ambulante', tema: 'Peso en otro planeta (g = 3.71 m/s²)',
    dato: 'En Marte pesas sólo el 38 % de lo que pesas en la Tierra. Sus lunas se llaman Fobos (miedo) y Deimos (terror).',
    mecanica: 'Pelea con sus lunas Fobos y Deimos, que lo protegen. Si no lo detienes, su golpe crece cada turno.', premio: 'Yelmo de Marte y Escudo de Fobos y Deimos', encuentro: ['astro_fobos', 'astro_marte', 'astro_deimos'],
  },
  jupiter: {
    id: 'jupiter', nombre: 'Júpiter, el Gigante', titulo: 'Astro ambulante', tema: 'Gravedad (g = 24.8 m/s²)',
    dato: 'Su masa es 318 veces la de la Tierra. La Gran Mancha Roja es una tormenta más grande que nuestro planeta.',
    mecanica: 'Mucha vida. Su gravedad te ATURDE y es IMPARABLE 2 turnos después de detenerlo.', premio: 'Escudo de la Gran Mancha', encuentro: ['astro_jupiter'],
  },
  saturno: {
    id: 'saturno', nombre: 'Saturno, el que Devora a sus Hijos', titulo: 'Astro ambulante', tema: 'Densidad (ρ = m/V)',
    dato: 'Es tan poco denso (0.69 g/cm³) que flotaría en una alberca gigante. Su nombre viene del dios que se comía a sus hijos.',
    mecanica: 'Sus anillos lo protegen y se cura devorando una de sus lunas. Te roba J.', premio: 'Anillos y Escudo de los Anillos', encuentro: ['astro_saturno'],
  },
  sol: {
    id: 'sol', nombre: 'El Sol, el Ojo que Arde', titulo: 'Astro ambulante · el más fuerte', tema: 'Energía (E = m·c²)',
    dato: 'Cada segundo convierte 4 millones de toneladas de masa en energía. Su luz tarda 8 minutos y 20 segundos en llegar a la Tierra.',
    mecanica: 'Te quema con CALOR, sus llamaradas atraviesan tu Bloqueo y se cura con fusión nuclear. Sólo sale desde el tramo 2.', premio: 'Corona Solar y Escudo del Ojo Solar', encuentro: ['astro_sol'], desde: 2,
  },
};
export const ASTRO_IDS = Object.keys(ASTROS);

/** Elige el astro de un nodo: no repite los que ya viste en la partida (si se acaban, se repiten) */
export function elegirAstro(): string {
  const run = Game.run;
  const tramo = run?.tramo ?? 1;
  const posibles = ASTRO_IDS.filter((id) => (ASTROS[id].desde ?? 1) <= tramo);
  const enMapa = (run?.map ?? []).map((n) => n.astro).filter(Boolean);
  const libres = posibles.filter((id) => !(run?.astrosVistos ?? []).includes(id) && !enMapa.includes(id));
  const de = libres.length ? libres : posibles.filter((id) => !enMapa.includes(id));
  const id = (de.length ? de : posibles)[Math.floor(Math.random() * (de.length ? de : posibles).length)];
  return id;
}
