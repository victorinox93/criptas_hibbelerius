// Encuentros con personajes en el camino. Cada uno plantea un problema de física.
// bless / curse: efecto (src/data/effects.ts) y cuántos combates dura.
// ergios: Ergios que gana (positivo) o pierde (negativo) en vez de un efecto.

export interface Outcome {
  effect?: string;
  combats?: number;
  ergios?: number;
  heal?: number;
  relic?: string; // id de reliquia (src/data/relics.ts)
}

export interface EventDef {
  id: string;
  name: string;
  npc: string; // textura del personaje
  prop?: string; // ícono a su lado
  intro: string;
  win: string; // lo que dice si aciertas
  lose: string; // lo que dice si fallas
  bless: Outcome;
  curse: Outcome;
  concepts?: string[]; // temas de la pregunta (ver "concept" en src/data/runes.ts)
  special?: boolean; // no sale en el sorteo normal (p. ej. el profe)
}

export const EVENTS: EventDef[] = [
  {
    id: 'ermitano', name: 'El Ermitaño del Péndulo', npc: 'npc_ermitano', prop: 'i_lantern',
    intro: 'Un anciano balancea un péndulo de plomo frente a una vela.\n«El péndulo nunca miente, viajero. ¿Y tú? Responde y te prestaré su ritmo.»',
    win: '«Bien. Que tu brazo oscile con la precisión del péndulo.»',
    lose: '«El péndulo se detiene… y tú con él, por un tiempo.»',
    bless: { effect: 'impulso', combats: 2 }, curse: { effect: 'fatiga', combats: 2 }, concepts: ['Plano inclinado', '2a ley (sistemas)'],
  },
  {
    id: 'cartografa', name: 'La Cartógrafa Ciega', npc: 'npc_cartografa',
    intro: 'Dibuja mapas con los dedos sobre la ceniza.\n«Conozco cada pendiente de estas criptas. Respóndeme y te enseñaré dónde pisar firme.»',
    win: '«Pisarás donde la normal te sostenga.»',
    lose: '«Ay… acabas de pisar el pantano. Se te pegará un rato.»',
    bless: { effect: 'manto', combats: 2 }, curse: { effect: 'lodo', combats: 2 }, concepts: ['Friccion', 'Plano inclinado', 'Fuerza normal'],
  },
  {
    id: 'herrero', name: 'El Herrero de las Brasas Frías', npc: 'npc_herrero', prop: 'i_anvil',
    intro: 'Un herrero golpea un yunque que no suena.\n«Un arma vale por su masa. Demuéstrame que lo entiendes y templaré la tuya.»',
    win: '«Toma. Ahora pesa lo que debe pesar.»',
    lose: '«Mmm. Le quité un poco de hierro. Vuelve cuando sepas.»',
    bless: { effect: 'yunque', combats: 2 }, curse: { effect: 'hueca', combats: 1 }, concepts: ['2a ley', 'Peso'],
  },
  {
    id: 'estatua', name: 'La Estatua que Susurra', npc: 'npc_estatua',
    intro: 'Una estatua de mármol gira la cabeza hacia ti. Su voz suena como viento entre columnas.\n«Yo no me muevo desde hace siglos. ¿Sabes por qué?»',
    win: '«Exacto. Llévate un poco de mi energía; a mí no me hace falta.»',
    lose: '«Tus pensamientos se nublan como mi mármol.»',
    bless: { effect: 'vigor', combats: 2 }, curse: { effect: 'niebla', combats: 2 }, concepts: ['1a ley'],
  },
  {
    id: 'coleccionista', name: 'El Coleccionista de Ecos', npc: 'npc_coleccionista', prop: 'i_coin',
    intro: 'Un personaje envuelto en terciopelo guarda ecos en frascos de vidrio.\n«Pago bien por las respuestas correctas… y cobro por las equivocadas.»',
    win: '«Un eco precioso. Aquí tienes tu pago.»',
    lose: '«Ese eco no vale nada. Me quedo con algo a cambio.»',
    bless: { ergios: 45 }, curse: { ergios: -20 }, concepts: ['3a ley', '2a ley'],
  },
  // ── Encuentro especial: aparece rara vez (ver PROFE_CHANCE) y una sola vez por expedición ──
  {
    id: 'victorino', name: 'El Profesor', npc: 'npc_victorino', prop: 'i_book', special: true,
    intro: 'Un académico con lentes revisa exámenes a la luz de una vela.\n«¡Ah, alguien llegó hasta acá! Yo también me perdí buscando el salón… Contéstame una y te doy una vida extra. Si fallas… bueno, también te la doy, pero con tarea.»',
    win: '«¡Eso! Ese diagrama de cuerpo libre me hizo llorar. Toma tu vida extra y unos Ergios para el camino.»',
    lose: '«Mmm… no. Pero como soy buena onda, toma tu vida extra. Y repasa ese tema para el examen, Te encargo el Avanza»',
    bless: { relic: 'vidaExtra', ergios: 30 }, curse: { relic: 'vidaExtra' },
    concepts: ['Friccion', '3a ley', 'Trabajo-energia', 'Plano inclinado'],
  },
];

/** Probabilidad de encontrar al profe en un nodo de encuentro (si aún no lo viste en esta expedición) */
export const PROFE_CHANCE = 0.14;
