// ════════════════════════════════════════════════════════════════
//  EL ASTRÓNOMO AFICIONADO DE PROVIDENCE (v0.43)
//  H. P. Lovecraft (1890–1937) escribió de joven columnas de astronomía para
//  periódicos de Providence y, toda su vida, miles de cartas. En el Abismo:
//    · Nodo «Observatorio»: mirar por su telescopio sube de nivel una
//      constelación (run.cosmos) y deja reacomodar la dentadura.
//    · Cartas: al empezar cada tramo te manda una misión. Si la cumples,
//      el trofeo del jefe de ese tramo trae 3 dientes legendarios.
//    · Frases al bajar al modo infinito.
//  Las cartas se revisan en Combat.ts y Rune.ts (busca «cumplirCarta»).
// ════════════════════════════════════════════════════════════════
import { contarCartaProvidence, Game, saveLocal } from '../state';

export const ASTRONOMO = 'El Astrónomo Aficionado de Providence';
/** v0.58 · Cordura que pierdes si fallas su pregunta de órbitas */
export const ASTRONOMO_MAL = 8;
/** v0.58 · combates en que el telescopio prestado te deja ver las intenciones ocultas */
export const TELESCOPIO_COMBATES = 2;

/** Una línea de contexto (se muestra en el Observatorio) */
export const FICHA_LOVECRAFT = 'H. P. Lovecraft (1890–1937), escritor de Providence, EE. UU. De joven escribió columnas de astronomía para los periódicos y toda su vida escribió miles de cartas.';

export interface CartaDef { id: string; titulo: string; mision: string; texto: string }

export const CARTAS: CartaDef[] = [
  { id: 'elitePerfecta', titulo: 'Sobre la paciencia', mision: 'Vence a una élite sin perder vida.', texto: 'Estimado colega: las estrellas no se apuran ni se lastiman. Le propongo lo mismo frente a una de esas criaturas grandes.' },
  { id: 'sinDefensa', titulo: 'Sobre la audacia', mision: 'Gana un combate sin jugar cartas de Defensa.', texto: 'Querido amigo: un cometa no se cubre; sólo sigue su órbita. ¿Se atrevería a pelear así una vez?' },
  { id: 'seisCartas', titulo: 'Sobre la prisa', mision: 'Juega 6 cartas o más en un solo turno.', texto: 'Mi estimado: Mercurio da la vuelta al Sol en 88 días. Usted puede ser más rápido que eso. Seis movimientos en un suspiro.' },
  { id: 'racha2', titulo: 'Sobre la razón', mision: 'Acierta 2 preguntas seguidas.', texto: 'Apreciable corresponsal: allá abajo sólo la razón lo mantiene cuerdo. Demuéstremelo dos veces seguidas.' },
  { id: 'alineacion', titulo: 'Sobre los planetas', mision: 'Gana un combate con una Alineación planetaria (3 Astros seguidos).', texto: 'Querido colega: anoche Marte, Júpiter y Saturno casi se alinearon. Si usted lo logra en su dentadura, le mandaré algo especial.' },
  { id: 'jefeRapido', titulo: 'Sobre el tiempo', mision: 'Vence al jefe del tramo en 6 turnos o menos.', texto: 'Estimado: el tiempo allá abajo no corre igual. Termine con la bestia antes de que dé seis vueltas.' },
];
export const CARTA = (id?: string) => CARTAS.find((c) => c.id === id);

/** Le asigna una carta nueva al tramo actual (sin repetir la anterior) */
export function nuevaCarta(): CartaDef {
  const r = Game.run!;
  const de = CARTAS.filter((c) => c.id !== r.carta?.id);
  const c = de[Math.floor(Math.random() * de.length)];
  r.carta = { id: c.id, tramo: r.tramo ?? 1 };
  saveLocal();
  return c;
}

/** Si la carta activa es «id» y no se ha cumplido, la cumple. Devuelve true si se acaba de cumplir. */
export function cumplirCarta(id: string): boolean {
  const r = Game.run;
  const c = r?.carta;
  if (!r || r.modo !== 'abismo' || !c || c.hecho || c.id !== id || c.tramo !== (r.tramo ?? 1)) return false;
  c.hecho = true;
  if (!r.debug) contarCartaProvidence();
  saveLocal();
  return true;
}

/** Lo que dice el Astrónomo al bajar al modo infinito (la primera es de su ensayo de 1927) */
export const FRASES_INFINITO = [
  '«La emoción más antigua y más fuerte de la humanidad es el miedo, y el miedo más antiguo y más fuerte es el miedo a lo desconocido.» (1927)',
  '«Desde mi telescopio, ninguna estrella está quieta. Usted tampoco debería estarlo.»',
  '«Más abajo el cielo se invierte: las constelaciones quedan bajo sus pies.»',
  '«Le escribo desde muy lejos. O desde muy abajo. Ya no estoy seguro.»',
  '«Cada profundidad es una órbita más. No olvide volver a casa.»',
];
