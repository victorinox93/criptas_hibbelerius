// ════════════════════════════════════════════════════════════════
//  EL ABISMO DE LOS EJES · modo de horror cósmico para quien ya venció a AM
//  (fase 1: sólo se abre desde el Modo profesor)
//
//  Se juega como el «acto 5»: 8 pisos + jefe (el Geómetra No Euclidiano).
//  La Cordura que se ve en pantalla es 100 − Locura (src/data/abismo.ts),
//  así que el Quiebre, la Sombra y las fórmulas borradas siguen igual.
//
//  Para agregar contenido:
//    · Página del Necronomicón → PAGINAS (y su efecto en Combat.ts, busca «necro»)
//    · Pacto (mazo inicial)    → PACTOS
//    · Edición de carta        → EDICIONES (y su efecto en playOn() de Combat.ts)
// ════════════════════════════════════════════════════════════════
import { CardInst, CARDS, Edicion, rewardPool, starterDeck } from './cards';

export const ACTO_ABISMO = 5;

/** Ajustes de Cordura en el Abismo (Cordura = 100 − Locura) */
export const CORDURA = {
  inicial: 70,
  runaBien: 10, // + Cordura al acertar una pregunta
  runaMal: 8, // − Cordura al fallarla
  susurro: 3, // − Cordura por cada Susurro que se queda en tu mano
  ojo: 10, // − Cordura de «El Ojo que Gira»
};

/** Cordura actual (0–100) a partir de la Locura guardada */
export const corduraDe = (locura = 0) => Math.max(0, Math.min(100, 100 - locura));

/** Las 4 luces del semáforo (de arriba abajo) */
export const SEMAFORO = [
  { nombre: 'Lúcido', min: 61, color: 0x4ec46a, css: '#6ee08a', texto: 'Juegas normal.' },
  { nombre: 'Inquieto', min: 31, color: 0xe8c23a, css: '#f0d060', texto: 'Las fórmulas de tus cartas empiezan a borrarse.' },
  { nombre: 'Delirante', min: 1, color: 0xe8782a, css: '#f09a50', texto: 'Visión del Abismo: +2 a tus ataques.' },
  { nombre: 'Quiebre', min: 0, color: 0xd8343a, css: '#ff6a6a', texto: 'Una Sombra aparece en el siguiente combate; luego regresas a 40.' },
];
export function luzDe(cordura: number) {
  return SEMAFORO.findIndex((l) => cordura >= l.min);
}

// ── Prólogo: el diario del profesor Arrieta ──
export const PROLOGO: { fecha: string; texto: string }[] = [
  { fecha: '12 de marzo de 1931', texto: 'En el sótano de la biblioteca encontré un tratado sin fecha ni portada. En el lomo, a mano: «Necronomicón de Hibbelerius».\nSus problemas no traen respuestas al final del libro.' },
  { fecha: '19 de marzo', texto: 'Resolví el primero. Esa noche soñé con una ciudad bajo el mar cuyos muros no tenían centroide.\nAl despertar, mi lápiz había seguido escribiendo solo.' },
  { fecha: '2 de abril', texto: 'Mis alumnos dicen que en clase dibujo ejes donde no hay nada.\nTienen razón a medias: los ejes están ahí. Son ellos quienes no los ven.' },
  { fecha: '30 de abril', texto: 'Ya no sé si el libro me enseña o me reescribe.\nCada problema resuelto me devuelve un poco de mí. Cada error me quita algo.' },
  { fecha: 'Sin fecha', texto: 'Si alguien encuentra este diario: no bajes sin entender la física.\nAllá abajo, lo único que te mantiene cuerdo es una respuesta correcta.\n\n— Último registro del profesor Elías Arrieta' },
];

// ── Páginas del Necronomicón: un modificador para toda la expedición ──
export interface PaginaDef {
  id: string;
  nombre: string;
  poder: string;
  costo: string;
  lore: string;
}
export const PAGINAS: PaginaDef[] = [
  { id: 'geometria', nombre: 'Geometría Imposible', poder: '+2 kg a tus ataques (Arcanista y Penitente: +2 m/s al empezar cada combate).', costo: '−10 de Vida máxima.', lore: 'Las figuras de esta página no cierran. Aun así, pesan.' },
  { id: 'sueno', nombre: 'El Sueño Profundo', poder: '+1 J cada turno.', costo: 'Cada combate mete 1 «Susurro» a tu mazo.', lore: 'Duermes mejor que nunca. Algo habla mientras duermes.' },
  { id: 'angulos', nombre: 'Ángulos que No Suman', poder: 'Robas 1 carta más cada turno.', costo: 'Los enemigos tienen +15 % de vida.', lore: 'Un triángulo de 200°. Lo dibujaste tú.' },
  { id: 'mercader', nombre: 'El Mercader Velado', poder: '+100 Ergios al empezar.', costo: '−15 de Cordura inicial.', lore: 'Paga bien. No preguntes con qué.' },
  { id: 'confusion', nombre: 'La Confusión', poder: 'Robas 1 carta extra al inicio de cada combate y una carta de tu mazo se vuelve Polícroma.', costo: 'Todos tus combates empiezan con Confusión (costos al azar).', lore: 'Los números de la página cambian cada vez que parpadeas.' },
  { id: 'cristal', nombre: 'El Cristal', poder: '3 cartas al azar de tu mazo se vuelven de Cristal (×2).', costo: 'El Cristal se rompe: cada una sirve una sola vez.', lore: 'Translúcidas, frías y perfectas. Hasta que las usas.' },
  { id: 'steiner', nombre: 'Página de Steiner', poder: 'Tu primer ataque de cada combate hace ×2 (I = I₀ + m·d²).', costo: 'Recibes +1 de daño de cada golpe.', lore: 'Lejos del eje todo pesa más. También lo que te golpea.' },
  { id: 'lucido', nombre: 'El Horror Lúcido', poder: 'Ver jefes y élites no te quita Cordura.', costo: 'Las preguntas acertadas devuelven la mitad de Cordura.', lore: 'Ya nada te sorprende. Tampoco te alivia.' },
];
export const PAGINA = (id?: string) => PAGINAS.find((p) => p.id === id);

// ── Pactos: el mazo con el que bajas ──
export interface PactoDef {
  id: string;
  nombre: string;
  regla: string;
  mazo: (clase: string) => string[];
  vidaMax?: number; // cambio de Vida máxima
}
const sinDefensas = (clase: string, n: number) => {
  const d = [...starterDeck(clase)];
  for (let i = 0; i < n; i++) {
    const j = d.findIndex((id) => CARDS[id].type === 'Defensa');
    if (j >= 0) d.splice(j, 1);
  }
  return d;
};
export const PACTOS: PactoDef[] = [
  { id: 'centroide', nombre: 'Pacto del Centroide', regla: 'En tu primer turno de cada combate, la carta más cara de tu mano cuesta 0 J.', mazo: (c) => [...starterDeck(c), 'centroideGolpe'] },
  { id: 'excentrico', nombre: 'Pacto Excéntrico', regla: '+2 kg a todos tus ataques (Arcanista y Penitente: +2 m/s), pero tu mazo trae 2 Defensas menos.', mazo: (c) => [...sinDefensas(c, 2), 'centroideGolpe'] },
  { id: 'volante', nombre: 'Pacto del Volante', regla: 'Los Joules que no uses se guardan para el siguiente turno (máx. 3).', mazo: (c) => [...starterDeck(c), 'radioGiro'] },
  { id: 'hueco', nombre: 'Pacto Hueco', regla: 'Mazo de 8 cartas con una carta rara de Lámina, pero −8 de Vida máxima.', mazo: (c) => [...sinDefensas(c, 2)], vidaMax: -8 },
  { id: 'inercia', nombre: 'Pacto de la Inercia', regla: 'Empiezas cada combate con 6 de Bloqueo y tu mazo trae Momento de Inercia.', mazo: (c) => [...starterDeck(c), 'momentoInercia'] },
];
export const PACTO = (id?: string) => PACTOS.find((p) => p.id === id);
/** Cordura extra por el Pacto ciego (mazo al azar) */
export const PACTO_CIEGO_CORDURA = 15;

/** Mazo al azar del Pacto ciego: 10 cartas de la clase y del Abismo, sin estados */
export function mazoCiego(clase: string): string[] {
  const pool = rewardPool(clase, ACTO_ABISMO, 99, true);
  const d: string[] = [];
  while (d.length < 10) d.push(pool[Math.floor(Math.random() * pool.length)]);
  return d;
}
/** Cartas raras del Abismo (premio del Pacto Hueco y de las élites) */
export const RARAS_ABISMO = Object.values(CARDS).filter((c) => c.abismo && c.rarity === 'rara').map((c) => c.id);

// ── Ediciones (como las de Balatro) ──
export interface EdicionDef { nombre: string; texto: string; color: number; css: string; prob: number }
export const EDICIONES: Record<Edicion, EdicionDef> = {
  lamina: { nombre: 'Lámina', texto: 'Ataque: +5 de daño. Otras cartas: +4 de Bloqueo.', color: 0x9ad8f0, css: '#9ad8f0', prob: 0.08 },
  holo: { nombre: 'Holográfica', texto: 'Recuperas 1 J al jugarla.', color: 0xc88aff, css: '#d0a0ff', prob: 0.05 },
  poli: { nombre: 'Polícroma', texto: 'Ataque: ×1.5. Otras cartas: robas 1.', color: 0xff8ad0, css: '#ff9ad8', prob: 0.03 },
  cristal: { nombre: 'Cristal', texto: 'Ataque: ×2. Otras cartas: +10 de Bloqueo.\nUn solo uso: se rompe y sale de tu mazo.', color: 0xe8fbff, css: '#e8fbff', prob: 0.04 },
};
/** Sortea una edición para una carta de recompensa (la mayoría de las veces, ninguna) */
export function sortearEdicion(bonus = 1): Edicion | undefined {
  let r = Math.random();
  for (const [id, e] of Object.entries(EDICIONES) as [Edicion, EdicionDef][]) {
    if (r < e.prob * bonus) return id;
    r -= e.prob * bonus;
  }
  return undefined;
}
/** Pone una edición a n cartas al azar del mazo que aún no tengan */
export function editarAlAzar(deck: CardInst[], ed: Edicion, n: number) {
  const libres = deck.filter((c) => !c.ed && CARDS[c.id].rarity !== 'estado');
  for (let i = 0; i < n && libres.length; i++) {
    const c = libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
    c.ed = ed;
  }
}
