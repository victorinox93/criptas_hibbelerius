// ════════════════════════════════════════════════════════════════
//  FIGURAS HISTÓRICAS ("Ecos del Pasado") Y SUS DONES
//  Al llegar a un santuario aparece una figura. Si respondes bien su
//  pregunta, sus dones son ÉPICOS (nivel 2); si no, COMUNES (nivel 1).
//  Los dones duran toda la expedición.
//  Los diálogos son ficción del juego, no citas textuales.
// ════════════════════════════════════════════════════════════════

export interface BoonDef {
  id: string;
  figure: string;
  name: string;
  icon: string;
  text: [string, string]; // [común, épico]
  lore: string;
}

export interface FigureDef {
  id: string;
  name: string;
  years: string;
  epithet: string;
  sprite: string;
  intro: string;
  farewell: string;
  concepts: string[]; // temas de su pregunta (ver "concept" en src/data/runes.ts)
  boons: string[];
}

export const BOONS: Record<string, BoonDef> = {
  // ── Isaac Newton ──
  n_principia: {
    id: 'n_principia', figure: 'newton', name: 'Principia', icon: 'i_gaunt',
    text: ['+1 m/s² a todos tus ataques.', '+2 m/s² a todos tus ataques.'],
    lore: 'ΣF = m·a: con la misma masa, más aceleración es más fuerza.',
  },
  n_manzana: {
    id: 'n_manzana', figure: 'newton', name: 'La Manzana', icon: 'i_apple',
    text: ['Al iniciar cada combate cae una manzana de 1 kg sobre cada enemigo: W = m·g ≈ 10 N.', 'Cae una de 2 kg: W = m·g ≈ 20 N a cada enemigo.'],
    lore: 'El peso es la fuerza de gravedad: W = m·g.',
  },
  n_reaccion: {
    id: 'n_reaccion', figure: 'newton', name: 'Acción y Reacción', icon: 'i_reflect',
    text: ['Cuando bloqueas por completo un golpe, el atacante recibe 3 N.', 'El atacante recibe 6 N.'],
    lore: 'Tercera ley: las fuerzas siempre aparecen en pares iguales y opuestos.',
  },
  // ── Galileo Galilei ──
  g_plano: {
    id: 'g_plano', figure: 'galileo', name: 'Plano Inclinado', icon: 'i_angle',
    text: ['Tu primer ataque de cada turno gana +2 m/s².', 'Tu primer ataque de cada turno gana +4 m/s².'],
    lore: 'En un plano inclinado, la componente del peso g·sinθ acelera los cuerpos.',
  },
  g_caida: {
    id: 'g_caida', figure: 'galileo', name: 'Caída Libre', icon: 'i_feather',
    text: ['Robas 1 carta más en tu primer turno de cada combate.', 'Robas 2 cartas más en tu primer turno.'],
    lore: 'Sin aire, todos los cuerpos caen con la misma aceleración.',
  },
  g_pendulo: {
    id: 'g_pendulo', figure: 'galileo', name: 'Péndulo Isócrono', icon: 'i_pend',
    text: ['Cada 3 turnos ganas +1 J.', 'Cada 2 turnos ganas +1 J.'],
    lore: 'El periodo de un péndulo casi no depende de qué tanto oscile.',
  },
  // ── Émilie du Châtelet ──
  c_visviva: {
    id: 'c_visviva', figure: 'chatelet', name: 'Vis Viva', icon: 'i_wind',
    text: ['Carrera y Segunda Ley dan +1 m/s² adicional.', 'Carrera y Segunda Ley dan +2 m/s² adicionales.'],
    lore: 'La "fuerza viva" crece con el cuadrado de la rapidez: K = ½·m·v².',
  },
  c_conserva: {
    id: 'c_conserva', figure: 'chatelet', name: 'Conservación', icon: 'i_heart',
    text: ['Al ganar un combate recuperas 5 de vida.', 'Al ganar un combate recuperas 10 de vida.'],
    lore: 'La energía no se crea ni se destruye: se transforma.',
  },
  c_traductora: {
    id: 'c_traductora', figure: 'chatelet', name: 'Traductora de los Principia', icon: 'i_rune',
    text: ['Cada problema que resuelves bien te da +15 Ergios.', 'Cada problema bien resuelto te da +30 Ergios.'],
    lore: 'Entender a fondo una teoría también es un acto de creación.',
  },
  // ── James Prescott Joule ──
  j_equivalente: {
    id: 'j_equivalente', figure: 'joule', name: 'Equivalente Mecánico', icon: 'i_bolt',
    text: ['+1 J en tu primer turno de cada combate.', '+1 J en tus turnos 1, 3 y 5.'],
    lore: 'Trabajo y calor son formas de la misma energía, medida en joules.',
  },
  j_calor: {
    id: 'j_calor', figure: 'joule', name: 'Calor por Fricción', icon: 'i_fire',
    text: ['Cada vez que te aplican Fricción, ganas 4 de Bloque.', 'Cada vez que te aplican Fricción, ganas 8 de Bloque.'],
    lore: 'La fricción convierte energía mecánica en calor.',
  },
  j_trabajo: {
    id: 'j_trabajo', figure: 'joule', name: 'Trabajo Acumulado', icon: 'i_shield',
    text: ['Empiezas cada combate con 5 de Bloque.', 'Empiezas cada combate con 10 de Bloque.'],
    lore: 'El trabajo realizado sobre un sistema se queda en él como energía.',
  },
};

export const FIGURES: FigureDef[] = [
  {
    id: 'newton', name: 'Isaac Newton', years: '1643–1727', epithet: 'El Señor de las Tres Leyes', sprite: 'fig_newton',
    intro: '«Tres leyes bastan para mover los astros, joven caballero.\nDemuéstrame que comprendes al menos una y te prestaré mi fuerza.»',
    farewell: '«Si llegas lejos, será sobre hombros de gigantes. Ve.»',
    concepts: ['1a ley', '2a ley', '3a ley', 'Peso'],
    boons: ['n_principia', 'n_manzana', 'n_reaccion'],
  },
  {
    id: 'galileo', name: 'Galileo Galilei', years: '1564–1642', epithet: 'El Observador de la Caída', sprite: 'fig_galileo',
    intro: '«Medí cómo ruedan las esferas por una rampa y cómo oscila una lámpara.\nResponde mi pregunta y caerás con más gracia que ellas.»',
    farewell: '«Y sin embargo, se mueve. Sigue adelante.»',
    concepts: ['Plano inclinado', 'Conservacion', '2a ley (sistemas)'],
    boons: ['g_plano', 'g_caida', 'g_pendulo'],
  },
  {
    id: 'chatelet', name: 'Émilie du Châtelet', years: '1706–1749', epithet: 'La Guardiana de la Vis Viva', sprite: 'fig_chatelet',
    intro: '«Traduje los Principia y defendí que la energía crece con el cuadrado de la rapidez.\n¿Sabes por qué eso importa? Contesta y te lo mostraré.»',
    farewell: '«Nada se pierde; todo se transforma. Tú también.»',
    concepts: ['Energia cinetica', 'Trabajo-energia'],
    boons: ['c_visviva', 'c_conserva', 'c_traductora'],
  },
  {
    id: 'joule', name: 'James Prescott Joule', years: '1818–1889', epithet: 'El Medidor del Calor', sprite: 'fig_joule',
    intro: '«El trabajo y el calor son la misma moneda con distinta cara.\nMide con cuidado, viajero, y te daré energía para el camino.»',
    farewell: '«Cada joule cuenta. No los desperdicies.»',
    concepts: ['Trabajo', 'Energia potencial', 'Friccion'],
    boons: ['j_equivalente', 'j_calor', 'j_trabajo'],
  },
];
