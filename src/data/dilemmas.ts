// ════════════════════════════════════════════════════════════════
//  DILEMAS: situaciones de riesgo sin pregunta. El jugador decide
//  cuánto arriesga; algunas opciones dependen del azar y muestran
//  su probabilidad (¡también es física: estadística!).
//
//  Cada opción tiene uno o más resultados con probabilidad p (suman 1).
//  Lo que puede pasar en un resultado (Result):
//    hp        vida (+ cura, − daño; nunca te deja en menos de 1)
//    maxHp     vida máxima (+ o −)
//    ergios    Ergios (+ o −)
//    effect    bendición/maldición de src/data/effects.ts, por 'combats' combates
//    relic     'random' o el id de una reliquia
//    card      'rara' (carta rara de tu clase), 'random' o el id de una carta
//    cardUp    la carta llega mejorada
//    junk      cartas basura que se agregan a tu mazo: { id, n }
//    familiar  'random' o el id de un familiar; famCombats cambia cuánto dura
//    removeRandom  olvidas una carta al azar de tu mazo
//    score     puntos extra
//  'need' bloquea la opción si no tienes suficientes Ergios o vida.
// ════════════════════════════════════════════════════════════════

export interface Result {
  text: string;
  hp?: number;
  maxHp?: number;
  ergios?: number;
  effect?: string;
  combats?: number;
  effects?: [string, number][]; // varios efectos a la vez: [id, combates]
  relic?: string;
  card?: string;
  cardUp?: boolean;
  junk?: { id: string; n: number };
  familiar?: string;
  famCombats?: number;
  removeRandom?: boolean;
  upgradeRandom?: boolean;
  maldicion?: string; // v0.71 · una maldición ('random' o su id) entra a tu mazo // v0.69 · mejora una carta al azar de tu mazo
  score?: number;
  entropia?: number; // Entropía mental (src/data/abismo.ts)
}

export interface Choice {
  label: string;
  risk: string; // lo que se muestra bajo el botón
  need?: { ergios?: number; hp?: number };
  outcomes: { p: number; r: Result }[];
}

export interface DilemmaDef {
  id: string;
  name: string;
  sprite: string;
  tint?: number;
  intro: string;
  choices: Choice[];
  special?: boolean; // no sale en el sorteo normal (lo llama src/scenes/Event.ts)
}

const LEAVE: Choice = { label: 'Seguir mi camino', risk: 'No pasa nada.', outcomes: [{ p: 1, r: { text: 'Te alejas en silencio.' } }] };

export const DILEMMAS: DilemmaDef[] = [
  {
    id: 'pozo', name: 'El Pozo de Energía Potencial', sprite: 'd_pozo',
    intro: 'Al fondo de un pozo seco brilla algo metálico. Bajar con calma cuesta trabajo; saltar es rápido… pero toda esa U = m·g·h se vuelve K al tocar el suelo.',
    choices: [
      {
        label: 'Saltar al fondo', risk: '50 %: una reliquia · 50 %: −12 de vida',
        outcomes: [
          { p: 0.5, r: { text: 'Caes sobre un montón de ceniza que amortigua el golpe. ¡Hay una reliquia!', relic: 'random' } },
          { p: 0.5, r: { text: 'U = m·g·h se convirtió en K… contra el suelo. Y el brillo era una cuchara.', hp: -12 } },
        ],
      },
      {
        label: 'Bajar con la cuerda', risk: 'Seguro: −5 de vida, +35 Ergios',
        outcomes: [{ p: 1, r: { text: 'La cuerda raspa tus manos (trabajo de la fricción), pero encuentras una bolsa de Ergios.', hp: -5, ergios: 35 } }],
      },
      LEAVE,
    ],
  },
  {
    id: 'contrato', name: 'El Notario de la Fricción', sprite: 'npc_notario',
    intro: 'Un hombre gris extiende un pergamino interminable.\n«Firme aquí y le doy una carta excepcional. La letra pequeña dice que también se lleva un poco de… lodo.»',
    choices: [
      {
        label: 'Firmar sin leer', risk: 'Carta rara de tu clase + 2 «Lodo Pegajoso» en tu mazo',
        outcomes: [{ p: 1, r: { text: '«Un placer hacer negocios.» Tu mazo pesa un poco más.', card: 'rara', junk: { id: 'lodoCarta', n: 2 } } }],
      },
      {
        label: 'Leer la letra pequeña', risk: '60 %: carta rara mejorada · 40 %: 2 «Ruido Blanco»',
        outcomes: [
          { p: 0.6, r: { text: 'Encuentras una cláusula a tu favor. El notario frunce el ceño y te da la mejor versión.', card: 'rara', cardUp: true } },
          { p: 0.4, r: { text: 'La letra pequeña era tan pequeña que te mareó. Te llevas su ruido en la cabeza.', junk: { id: 'ruido', n: 2 } } },
        ],
      },
      LEAVE,
    ],
  },
  {
    id: 'reactor', name: 'El Núcleo Inestable', sprite: 'd_reactor',
    intro: 'Una esfera de luz verde zumba en el centro de la cámara. Sientes su calor en la cara.\nAlguien escribió en la pared: «M. C. estuvo aquí».',
    choices: [
      {
        label: 'Absorber su energía', risk: '+1 J por turno (3 combates) y Radiación (3 combates)',
        outcomes: [{ p: 1, r: { text: 'La energía te recorre los brazos. También algo que no deberías haber absorbido.', effects: [['reactor', 3], ['radiacion', 3]] } }],
      },
      {
        label: 'Extraer un fragmento', risk: '70 %: +60 Ergios · 30 %: −6 de vida y Radiación (2 combates)',
        outcomes: [
          { p: 0.7, r: { text: 'El fragmento vale una fortuna en el mercado de las criptas.', ergios: 60 } },
          { p: 0.3, r: { text: 'El fragmento se calienta en tu mano. Lo sueltas, tarde.', hp: -6, effect: 'radiacion', combats: 2 } },
        ],
      },
      LEAVE,
    ],
  },
  {
    id: 'dados', name: 'El Demonio de Laplace', sprite: 'npc_laplace',
    intro: '«Conozco la posición y la velocidad de cada partícula del universo… salvo las de estos dados.\n¿Jugamos? Yo nunca hago trampa. Casi nunca.»',
    choices: [
      {
        label: 'Apostar 30 Ergios', risk: '50 %: ganas 75 · 50 %: los pierdes', need: { ergios: 30 },
        outcomes: [
          { p: 0.5, r: { text: '¡Doble seis! El demonio aplaude con desgana.', ergios: 45 } },
          { p: 0.5, r: { text: '«Qué mala suerte… o qué determinismo.»', ergios: -30 } },
        ],
      },
      {
        label: 'Apostar tu vitalidad', risk: '50 %: +8 Vida máxima · 50 %: −10 de vida', need: { hp: 11 },
        outcomes: [
          { p: 0.5, r: { text: 'Ganas. Te sientes más fuerte que nunca.', maxHp: 8, hp: 8 } },
          { p: 0.5, r: { text: 'Pierdes. El demonio cobra en energía vital.', hp: -10 } },
        ],
      },
      LEAVE,
    ],
  },
  {
    id: 'balanza', name: 'La Balanza Rota', sprite: 'd_balanza',
    intro: 'Una balanza enorme cuelga sobre el vacío. Un platillo está vacío; el otro sostiene un objeto que brilla.\nPara equilibrarla (ΣF = 0) debes poner algo de igual peso.',
    choices: [
      {
        label: 'Dar parte de tu vida', risk: '−8 de Vida máxima → una reliquia',
        outcomes: [{ p: 1, r: { text: 'La balanza se equilibra. El objeto cae en tus manos.', maxHp: -8, relic: 'random' } }],
      },
      {
        label: 'Dar una carta al azar', risk: 'Olvidas una carta al azar → +45 Ergios',
        outcomes: [{ p: 1, r: { text: 'Una carta de tu mazo se desvanece en el platillo. Del otro lado caen Ergios.', removeRandom: true, ergios: 45 } }],
      },
      LEAVE,
    ],
  },
  {
    id: 'criatura', name: 'Algo te Sigue', sprite: 'fam_gato', tint: 0x403848,
    intro: 'Desde hace tres pisos escuchas pasos pequeños detrás de ti. Al voltear, unos ojos brillan en la oscuridad.\nNo parece hostil. Parece… hambriento.',
    choices: [
      {
        label: 'Dejar que te acompañe', risk: 'Un familiar al azar (3 combates)',
        outcomes: [{ p: 1, r: { text: 'La criatura se acerca y camina a tu lado.', familiar: 'random' } }],
      },
      {
        label: 'Compartir tus provisiones', risk: '−20 Ergios → un familiar al azar (5 combates)', need: { ergios: 20 },
        outcomes: [{ p: 1, r: { text: 'Después de comer, la criatura parece decidida a quedarse un buen rato.', ergios: -20, familiar: 'random', famCombats: 5 } }],
      },
      LEAVE,
    ],
  },
  {
    id: 'puente', name: 'El Puente de Cuerda', sprite: 'd_puente',
    intro: 'Un puente de cuerda cruza el abismo. Del otro lado, un atajo. Las cuerdas aguantan una tensión T… tu peso es W = m·g.\n¿Aguantará?',
    choices: [
      {
        label: 'Cruzar corriendo', risk: '65 %: atajo (+40 puntos, +10 de vida) · 35 %: −14 de vida',
        outcomes: [
          { p: 0.65, r: { text: 'Llegas al otro lado y encuentras un manantial tibio.', score: 40, hp: 10 } },
          { p: 0.35, r: { text: 'Una cuerda se rompe: T < W. Te sostienes de milagro.', hp: -14 } },
        ],
      },
      {
        label: 'Aligerar tu carga', risk: '−25 Ergios: cruzas seguro (+40 puntos)', need: { ergios: 25 },
        outcomes: [{ p: 1, r: { text: 'Menos masa, menos peso: el puente apenas cruje.', ergios: -25, score: 40 } }],
      },
      {
        label: 'Dar la vuelta', risk: 'Fatiga (1 combate)',
        outcomes: [{ p: 1, r: { text: 'El rodeo es largo y te cansa.', effect: 'fatiga', combats: 1 } }],
      },
    ],
  },
  // ── v0.69 · encuentros inspirados en Slay the Spire, con su física ──
  {
    id: 'idolo', name: 'El Ídolo y la Roca', sprite: 'd_idolo',
    intro: 'Sobre un pedestal brilla un ídolo dorado. Arriba, en una rampa, una roca enorme espera. Si el pedestal pierde peso, la roca se suelta… y baja ganando energía: m·g·h → ½·m·v².',
    choices: [
      {
        label: 'Tomarlo y correr', risk: '60 %: reliquia · 40 %: reliquia y −14 de vida',
        outcomes: [
          { p: 0.6, r: { text: 'Corres más rápido que la roca: tu ventaja inicial la gana la distancia.', relic: 'random' } },
          { p: 0.4, r: { text: 'La roca gana rapidez cuesta abajo: v = √(2·g·h). Te roza. Duele, pero el ídolo es tuyo.', relic: 'random', hp: -14 } },
        ],
      },
      {
        label: 'Cambiarlo por una bolsa de arena', risk: '−20 Ergios · 50 %: reliquia · 50 %: −8 de vida', need: { ergios: 20 },
        outcomes: [
          { p: 0.5, r: { text: 'La normal del pedestal no cambia: N = m·g. La roca ni se entera. Te llevas el ídolo.', ergios: -20, relic: 'random' } },
          { p: 0.5, r: { text: 'La arena pesaba menos. El pedestal sube, la roca baja, y tú sales sin el ídolo.', ergios: -20, hp: -8 } },
        ],
      },
      LEAVE,
    ],
  },
  {
    id: 'explorador', name: 'El Explorador Caído', sprite: 'd_explorador',
    intro: 'Un explorador quedó recargado contra la pared, con la mochila todavía llena. Algo le dejó marcas de garras en la armadura… y no se ve por ningún lado.',
    choices: [
      {
        label: 'Revisar la mochila con cuidado', risk: '75 %: +45 Ergios · 25 %: −10 de vida',
        outcomes: [
          { p: 0.75, r: { text: 'Entre apuntes húmedos y una brújula rota encuentras su bolsa de Ergios.', ergios: 45 } },
          { p: 0.25, r: { text: 'Un rasguño en la oscuridad. Sales corriendo con las manos vacías.', hp: -10 } },
        ],
      },
      {
        label: 'Revisarlo todo a fondo', risk: '+30 Ergios · 45 %: reliquia · 55 %: −18 de vida',
        outcomes: [
          { p: 0.45, r: { text: 'Bajo la armadura guardaba algo valioso. Te lo llevas antes de que vuelva lo que lo mató.', relic: 'random', ergios: 30 } },
          { p: 0.55, r: { text: 'Tardaste demasiado. La criatura regresa y te ataca; escapas con lo que alcanzaste a tomar.', hp: -18, ergios: 30 } },
        ],
      },
      LEAVE,
    ],
  },
  {
    id: 'biblioteca', name: 'La Biblioteca Hundida', sprite: 'd_biblioteca',
    intro: 'Estantes que llegan hasta donde no alcanza la luz. Libros de mecánica de todas las épocas: Principia, Hibbeler, Beer & Johnston… y uno sin título que respira.',
    choices: [
      {
        label: 'Estudiar un capítulo', risk: 'Una carta rara',
        outcomes: [{ p: 1, r: { text: 'Lees con calma y entiendes algo que antes sólo memorizabas.', card: 'rara' } }],
      },
      {
        label: 'Repasar tus apuntes', risk: 'Mejoras una carta al azar de tu mazo',
        outcomes: [{ p: 1, r: { text: 'Vuelves a hacer un problema que ya habías hecho… y ahora te sale mejor.', upgradeRandom: true } }],
      },
      {
        label: 'Dormir entre los libros', risk: '+20 de vida',
        outcomes: [{ p: 1, r: { text: 'El silencio de una biblioteca es el mejor descanso.', hp: 20 } }],
      },
    ],
  },
  {
    id: 'muro', name: 'El Muro Viviente', sprite: 'd_muro',
    intro: 'Un muro de piedra con tres caras te bloquea el paso. «Para pasar, ofrece algo», dicen al mismo tiempo. Una olvida, otra cambia, otra hace crecer.',
    choices: [
      {
        label: 'La cara que olvida', risk: 'Olvidas una carta al azar de tu mazo',
        outcomes: [{ p: 1, r: { text: 'Sientes un hueco en la memoria… y un mazo más ligero.', removeRandom: true } }],
      },
      {
        label: 'La cara que cambia', risk: 'Olvidas una carta al azar y ganas otra al azar',
        outcomes: [{ p: 1, r: { text: 'Lo que sabías se transforma: la energía no se crea ni se destruye.', removeRandom: true, card: 'random' } }],
      },
      {
        label: 'La cara que hace crecer', risk: 'Mejoras una carta al azar',
        outcomes: [{ p: 1, r: { text: 'Una de tus cartas brilla: ahora entiendes el porqué.', upgradeRandom: true } }],
      },
    ],
  },
  {
    id: 'calavera', name: 'La Calavera Avara', sprite: 'd_calavera',
    intro: 'Una calavera dorada te sonríe. «Cada pregunta que me hagas cuesta sangre. Pero pago bien: la energía se conserva… sólo cambia de manos.»',
    choices: [
      {
        label: 'Una pregunta', risk: '−5 de vida → +35 Ergios',
        outcomes: [{ p: 1, r: { text: '«Justo y conservativo.» Te paga.', hp: -5, ergios: 35 } }],
      },
      {
        label: 'Tres preguntas', risk: '−14 de vida → +100 Ergios · 25 %: y una reliquia',
        outcomes: [
          { p: 0.75, r: { text: 'La calavera ríe con cada pago.', hp: -14, ergios: 100 } },
          { p: 0.25, r: { text: '«Me caes bien.» Además de los Ergios, te da algo de su colección.', hp: -14, ergios: 100, relic: 'random' } },
        ],
      },
      LEAVE,
    ],
  },
  // ── Horror cósmico: el Necronomicón (Actos II y III, rara vez) ──
  {
    id: 'atril', name: 'El Atril sin Lector', sprite: 'd_atril', special: true,
    intro: 'Un libro abierto respira sobre un atril. Sus páginas tienen ejercicios que no deberían existir: «Problema 13-∞», «Problema Ω».\nUn ojo dibujado en el margen te sigue con la mirada.',
    choices: [
      {
        label: 'Tomar el libro', risk: 'Obtienes el Necronomicón. +15 de Locura.',
        outcomes: [{ p: 1, r: { text: 'El libro se cierra solo en tus manos. Está tibio. Pesa más de lo que debería.', relic: 'necronomicon', entropia: 15 } }],
      },
      {
        label: 'Leer sólo una página', risk: '50 %: +60 Ergios · 50 %: −8 de vida. Siempre +10 de Locura.',
        outcomes: [
          { p: 0.5, r: { text: 'La página explica cómo se transmuta la energía en oro. Funciona.', ergios: 60, entropia: 10 } },
          { p: 0.5, r: { text: 'La página te lee a ti. Sangras por la nariz.', hp: -8, entropia: 10 } },
        ],
      },
      {
        label: 'Cerrarlo y rezar a Newton', risk: '−10 de Locura.',
        outcomes: [{ p: 1, r: { text: 'Cierras el libro. El ojo del margen parpadea… y se queda quieto.', entropia: -10 } }],
      },
    ],
  },
];

/** Probabilidad de que un nodo de encuentro sea un dilema en vez de una pregunta */
export const DILEMMA_CHANCE = 0.45;
