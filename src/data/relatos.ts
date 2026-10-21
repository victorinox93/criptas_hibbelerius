// ════════════════════════════════════════════════════════════════
//  RELATOS DEL ABISMO (v0.43): encuentros basados en cuentos de
//  H. P. Lovecraft publicados antes de 1929 (dominio público). Los textos
//  del juego son nuestros; sólo toman la situación del cuento.
//  Salen en los nodos «?» del Abismo (src/scenes/Event.ts → escena Relato).
//
//  Cada opción puede:
//    · hacer una pregunta (pregunta.concepts) con un premio y un castigo, o
//    · tirar el azar (salidas: [{ p, e }], las p suman 1).
//  Efecto (Efecto): texto, hp, maxHp, ergios, cordura (+ sube / − baja),
//  diente ('raro' | 'legendario' | 'parasito' | 'copia' o un id),
//  reanimar (revive una carta de Cristal rota), retrato / retratoMalo (Pickman).
// ════════════════════════════════════════════════════════════════

export interface Efecto {
  texto: string;
  hp?: number;
  maxHp?: number;
  ergios?: number;
  cordura?: number;
  diente?: 'raro' | 'legendario' | 'parasito' | 'copia' | string;
  reanimar?: boolean;
  retrato?: boolean;
  retratoMalo?: boolean;
  familiar?: string; // v0.49 · una criatura te acompaña (src/data/familiars.ts)
  pierdeDiente?: number; // v0.48 · pierdes N dientes al azar (no parásitos)
  maldicion?: [string, number]; // v0.48 · maldición de src/data/effects.ts por N combates
  combate?: string; // v0.51 · sólo en sueños: empieza una pesadilla (src/data/enemies.ts → ENCOUNTERS_SUENO)
  prestamo?: number; // v0.61 · el Prestamista te da N Ergios; al final del tramo cobra N × INTERES_PRESTAMO
  familiarExtra?: number; // v0.61 · tu familiar se queda N combates más
  quitarCarta?: boolean; // v0.61 · alguien se lleva una carta de tu mazo (la elige al azar)
  alineacion?: boolean; // v0.61 · +1 J en el primer turno de cada combate, hasta el final del tramo
  meteoritos?: boolean; // v0.61 · empieza el minijuego de la Lluvia de Meteoritos (src/scenes/Meteoritos.ts)
}

export interface OpcionRelato {
  label: string;
  risk: string;
  need?: { ergios?: number; familiar?: boolean };
  pregunta?: { concepts: string[]; bien: Efecto; mal: Efecto };
  salidas?: { p: number; e: Efecto }[];
}

export interface RelatoDef {
  id: string;
  titulo: string; // nombre del lugar
  obra: string; // cuento de Lovecraft
  anio: number;
  icono: string;
  tinte: number;
  propio?: boolean; // v0.49 · no viene de un cuento: es del diario de Montemayor
  sueno?: boolean; // v0.51 · es un SUEÑO: sólo sale en el nodo 🌙 (src/scenes/Sueno.ts), no en los «?»
  intro: string;
  opciones: OpcionRelato[];
  npc?: string; // v0.61 · retrato del personaje (textura) en lugar del ícono
  pie?: string; // v0.61 · texto bajo el retrato (en lugar de «Basado en…»)
  peso?: number; // v0.61 · probabilidad relativa de salir en un «?» (1 si no se dice)
}

/** Probabilidad de que un nodo «?» del Abismo sea un Relato (si quedan sin ver) */
export const RELATO_CHANCE = 0.75;

const IRSE: OpcionRelato = { label: 'Seguir mi camino', risk: 'No pasa nada.', salidas: [{ p: 1, e: { texto: 'Te alejas sin mirar atrás. Casi.' } }] };

export const RELATOS: RelatoDef[] = [
  {
    id: 'zann', titulo: "La calle d'Auseil", obra: 'La música de Erich Zann', anio: 1922, icono: 'i_note', tinte: 0xc8b8ff,
    intro: 'En una calle tan empinada que parece escalera, un violinista mudo toca cada noche más rápido frente a una ventana cerrada. Algo empuja la ventana desde afuera. Las bisagras crujen.',
    opciones: [
      {
        label: 'Ayudarle a trabar la ventana', risk: 'Pregunta: la ventana gira sobre sus bisagras (momento de inercia).',
        pregunta: {
          concepts: ['Momento de inercia', 'Radio de giro'],
          bien: { texto: 'La ventana se queda cerrada. Zann, sin dejar de tocar, te da un diente que guardaba en el estuche.', diente: 'raro', cordura: 8 },
          mal: { texto: 'La ventana se abre un instante y ves lo que hay afuera. Algo se te mete en la boca.', cordura: -12, diente: 'parasito' },
        },
      },
      { label: 'Pedirle que toque más fuerte', risk: '60 %: +35 Ergios · 40 %: −10 de Cordura', salidas: [
        { p: 0.6, e: { texto: 'La música tapa el ruido. Los vecinos te pagan para que te lleves al violinista a otra parte.', ergios: 35 } },
        { p: 0.4, e: { texto: 'Una cuerda revienta. El silencio que sigue es peor que la música.', cordura: -10 } },
      ] },
      IRSE,
    ],
  },
  {
    id: 'west', titulo: 'El laboratorio de Arkham', obra: 'Herbert West, reanimador', anio: 1922, icono: 'i_bolt', tinte: 0x9aff7a,
    intro: 'Un joven médico de lentes redondos sostiene una jeringa con un líquido verde que brilla. «Puedo devolver a la vida lo que se rompió. Sólo necesito un poco de su cordura.»',
    opciones: [
      { label: 'Dejar que reanime algo', risk: '−12 de Cordura: revive tu última carta de Cristal rota (si no hay, una carta tuya se vuelve de Cristal).', salidas: [
        { p: 1, e: { texto: 'La carta tiembla, brilla… y vuelve. No se ve igual que antes.', cordura: -12, reanimar: true } },
      ] },
      {
        label: 'Revisar su fórmula', risk: 'Pregunta de energía. Si aciertas: +8 de Vida máxima. Si fallas: un parásito.',
        pregunta: {
          concepts: ['Energia cinetica', 'Trabajo-energia'],
          bien: { texto: 'Corriges su cálculo. Agradecido, te inyecta un tónico (el bueno).', maxHp: 8, hp: 8 },
          mal: { texto: 'La fórmula estaba bien; el error era tuyo. Te inyecta «para practicar».', diente: 'parasito' },
        },
      },
      IRSE,
    ],
  },
  {
    id: 'ratas', titulo: 'El Priorato de Exham', obra: 'Las ratas en las paredes', anio: 1924, icono: 'i_skull', tinte: 0xd8b8a0,
    intro: 'Detrás del muro de piedra se oye una estampida de ratas que bajan, y bajan, y siguen bajando. El ruido se mueve: si encuentras su centro de masa, encontrarás el pasadizo.',
    opciones: [
      {
        label: 'Seguir el ruido', risk: 'Pregunta de centro de masa. Si aciertas: un diente LEGENDARIO. Si fallas: −12 de vida y un parásito.',
        pregunta: {
          concepts: ['Centro de masa', 'Centroide'],
          bien: { texto: 'Hallas el pasadizo. Al fondo, en un nicho, un diente antiguo que nadie ha tocado en siglos.', diente: 'legendario' },
          mal: { texto: 'Las ratas te encuentran a ti primero.', hp: -12, diente: 'parasito' },
        },
      },
      { label: 'Tapar el hueco', risk: '−20 Ergios y +12 de Cordura', need: { ergios: 20 }, salidas: [
        { p: 1, e: { texto: 'Tapias el muro con todo lo que traes. Silencio. Por fin.', ergios: -20, cordura: 12 } },
      ] },
      IRSE,
    ],
  },
  {
    id: 'aireFrio', titulo: 'El cuarto del Dr. Muñoz', obra: 'Aire frío', anio: 1928, icono: 'i_wind', tinte: 0x9ad8f0,
    intro: 'En una pensión de Nueva York, el Dr. Muñoz vive encerrado en un cuarto helado. Su máquina de enfriamiento está fallando y el doctor… se está ablandando. «¡Calcule cuánto trabajo necesita la bomba, rápido!»',
    opciones: [
      {
        label: 'Calcular el trabajo de la bomba', risk: 'Pregunta de trabajo y potencia. Si aciertas: +50 Ergios y +6 de Cordura.',
        pregunta: {
          concepts: ['Trabajo', 'Potencia'],
          bien: { texto: 'La máquina vuelve a enfriar. El doctor te paga con monedas heladas.', ergios: 50, cordura: 6 },
          mal: { texto: 'La máquina se apaga. Mejor no mires lo que queda del doctor.', cordura: -12, hp: -6 },
        },
      },
      { label: 'Apagar la máquina y llevarte sus Ergios', risk: '+70 Ergios · 50 %: también un parásito', salidas: [
        { p: 0.5, e: { texto: 'Te llevas sus monedas. Nadie te detiene. Nadie podría.', ergios: 70 } },
        { p: 0.5, e: { texto: 'Te llevas sus monedas… y algo que se te pega a la encía.', ergios: 70, diente: 'parasito' } },
      ] },
      IRSE,
    ],
  },
  {
    id: 'templo', titulo: 'El submarino hundido', obra: 'El templo', anio: 1925, icono: 'i_shield', tinte: 0x6ab8a8,
    intro: 'Un submarino descansa sobre las escaleras de un templo bajo el mar. Dentro del templo se mueve una luz. El casco cruje con el peso del agua.',
    opciones: [
      {
        label: 'Calcular si el casco aguanta', risk: 'Pregunta de peso y fuerza normal. Si aciertas: un diente raro y +6 de Vida máxima.',
        pregunta: {
          concepts: ['Peso', 'Fuerza normal'],
          bien: { texto: 'El casco aguanta. Sobre el altar del templo hay un diente que brilla.', diente: 'raro', maxHp: 6, hp: 6 },
          mal: { texto: 'El casco cede. Sales nadando sin aire.', hp: -15 },
        },
      },
      { label: 'Subir a la superficie', risk: '+15 de vida y +5 de Cordura', salidas: [
        { p: 1, e: { texto: 'Respiras aire de verdad. Arriba, el cielo sigue en su lugar.', hp: 15, cordura: 5 } },
      ] },
      IRSE,
    ],
  },
  {
    id: 'pickman', titulo: 'El sótano del North End', obra: 'El modelo de Pickman', anio: 1927, icono: 'i_book', tinte: 0xb8a088,
    intro: 'Un pintor de Boston te invita a su sótano. Sus cuadros son tan reales que parecen pintados del natural. «Le hago un retrato. A cambio, me quedo con una de sus cartas como modelo.»',
    opciones: [
      { label: 'Posar para el retrato', risk: '75 %: una carta tuya se vuelve una carta rara del Abismo de Lámina · 25 %: se vuelve 2 Susurros', salidas: [
        { p: 0.75, e: { texto: 'El retrato es perfecto. Demasiado perfecto.', retrato: true } },
        { p: 0.25, e: { texto: 'Lo que pintó no eras tú. Ahora vive en tu mazo.', retratoMalo: true } },
      ] },
      { label: 'Comprar un cuadro', risk: '−40 Ergios y +15 de Cordura', need: { ergios: 40 }, salidas: [
        { p: 1, e: { texto: 'Cuelgas el cuadro al revés. Así da menos miedo.', ergios: -40, cordura: 15 } },
      ] },
      IRSE,
    ],
  },
  {
    id: 'extrano', titulo: 'El salón del espejo', obra: 'El extraño', anio: 1921, icono: 'i_crystal', tinte: 0xe8fbff,
    intro: 'Sales de una cripta a un salón iluminado. Todos huyen al verte. Al fondo hay un espejo enorme; algo en el reflejo sonríe con tus dientes.',
    opciones: [
      { label: 'Tocar el espejo', risk: '70 %: copia uno de tus dientes · 30 %: un parásito', salidas: [
        { p: 0.7, e: { texto: 'Tu reflejo te devuelve un diente igualito al tuyo.', diente: 'copia' } },
        { p: 0.3, e: { texto: 'El reflejo te muerde.', diente: 'parasito' } },
      ] },
      { label: 'Romper el espejo', risk: '−8 de vida y +10 de Cordura', salidas: [
        { p: 1, e: { texto: 'Mil pedazos. En ninguno estás tú. Mejor así.', hp: -8, cordura: 10 } },
      ] },
      IRSE,
    ],
  },
];
// v0.48 · relatos con castigos: perder dientes y maldiciones
RELATOS.push(
  {
    id: 'sabueso', titulo: 'La tumba holandesa', obra: 'El sabueso', anio: 1924, icono: 'i_skull', tinte: 0x7ad88a,
    intro: 'En una tumba abierta, sobre un esqueleto, brilla un amuleto de jade verde con forma de perro alado. A lo lejos, algo aúlla. El amuleto pesa más de lo que debería.',
    opciones: [
      { label: 'Llevarte el amuleto', risk: 'Un diente LEGENDARIO… y la maldición «El Sabueso te sigue» (−5 de vida al empezar cada combate, 4 combates)', salidas: [
        { p: 1, e: { texto: 'El jade está tibio. El aullido ya no se oye lejano.', diente: 'legendario', maldicion: ['sabueso', 4] } },
      ] },
      {
        label: 'Calcular si la losa aguanta', risk: 'Pregunta de equilibrio. Si aciertas: +40 Ergios. Si fallas: la losa te cae encima y pierdes un diente.',
        pregunta: {
          concepts: ['Fuerza normal', 'Peso'],
          bien: { texto: 'La losa aguanta. Entre las piedras hay monedas viejas.', ergios: 40 },
          mal: { texto: 'La losa cae. Te levantas escupiendo un diente.', hp: -8, pierdeDiente: 1 },
        },
      },
      IRSE,
    ],
  },
  {
    id: 'carter', titulo: 'El cementerio del pantano', obra: 'La declaración de Randolph Carter', anio: 1920, icono: 'i_note', tinte: 0x9a9ab8,
    intro: 'Tu compañero bajó por una escalera bajo una lápida y se lleva el teléfono de campo. Desde abajo, su voz se oye cada vez más rara. Luego, otra voz contesta.',
    opciones: [
      {
        label: 'Bajar a buscarlo', risk: 'Pregunta de energía. Si aciertas: un diente raro. Si fallas: pierdes 2 dientes y 10 de vida.',
        pregunta: {
          concepts: ['Energia potencial', 'Conservacion'],
          bien: { texto: 'Lo sacas a tiempo. Al subir, tu bolsillo pesa un diente más.', diente: 'raro' },
          mal: { texto: 'Algo te muerde en la oscuridad. Sales con la boca sangrando.', hp: -10, pierdeDiente: 2 },
        },
      },
      { label: 'Quedarte arriba con el teléfono', risk: '−10 de Cordura y la maldición «Niebla Mental» (2 combates)', salidas: [
        { p: 1, e: { texto: '«¡Estás loco, Warren está muerto!», dice la voz. No era Warren.', cordura: -10, maldicion: ['niebla', 2] } },
      ] },
      IRSE,
    ],
  },
  {
    id: 'ulthar', titulo: 'Las calles de Ulthar', obra: 'Los gatos de Ulthar', anio: 1920, icono: 'i_paw', tinte: 0xd8b878,
    intro: 'En Ulthar los gatos son sagrados. Una pareja de ancianos gruñones los perseguía con la escoba por todo el pueblo, y desde que llegaste, cien gatos te siguen en silencio. Esperan algo de ti.',
    opciones: [
      { label: 'Darles de comer', risk: '−20 Ergios: +15 de vida, +8 de Cordura y un Gato de Ulthar te acompaña', need: { ergios: 20 }, salidas: [
        { p: 1, e: { texto: 'Los gatos ronronean. Esa noche duermes como nunca, y en la mañana uno decide seguirte.', ergios: -20, hp: 15, cordura: 8, familiar: 'gatoUlthar' } },
      ] },
      { label: 'Espantarlos', risk: '50 %: no pasa nada · 50 %: se llevan 2 dientes y te dejan Fatiga (3 combates)', salidas: [
        { p: 0.5, e: { texto: 'Los gatos se van, ofendidos.' } },
        { p: 0.5, e: { texto: 'En la mañana te faltan dos dientes. Los gatos te miran desde el tejado.', pierdeDiente: 2, maldicion: ['fatiga', 3] } },
      ] },
      IRSE,
    ],
  },
);
// v0.49 · familiares del Abismo
RELATOS.push({
  id: 'pecera', titulo: 'El laboratorio de Montemayor', obra: 'Diario de Ignacio Montemayor', anio: 1931, propio: true, icono: 'i_lantern', tinte: 0x7ad8c8,
  intro: 'Encuentras el laboratorio improvisado del erudito: frascos con agua negra y criaturas que todavía se mueven. Una nota dice: «No son peligrosos. Creo». Dos frascos tiemblan cuando te acercas.',
  opciones: [
    { label: 'Abrir el frasco del blob con ojos', risk: 'Un Shoggoth Bebé te acompaña 4 combates (+4 de Bloqueo cada turno y se come tus Susurros)', salidas: [
      { p: 1, e: { texto: 'Algo pequeño, negro y lleno de ojos se te sube al hombro. Hace «tekeli-li» y se acurruca.', familiar: 'shoggoth' } },
    ] },
    { label: 'Abrir el frasco del pez que brilla', risk: 'Un Pez Linterna te acompaña 4 combates (robas 1 carta más y ves a los enemigos invisibles)', salidas: [
      { p: 1, e: { texto: 'Un pez con una lucecita en la frente flota en el aire junto a ti. Ilumina lo que nadie más ve.', familiar: 'pezLinterna' } },
    ] },
    IRSE,
  ],
});

/** v0.61 · El Prestamista cobra esto por cada Ergio prestado al final del tramo */
export const INTERES_PRESTAMO = 1.5;

// ════════════════════════════════════════════════════════════════
//  v0.61 · PERSONAJES Y FENÓMENOS DEL ABISMO (originales, no vienen de un cuento)
//  Salen en los nodos «?» con más probabilidad que los relatos (peso 2).
// ════════════════════════════════════════════════════════════════
RELATOS.push(
  {
    id: 'prestamista', titulo: 'La mesa del Prestamista', obra: '', anio: 0, icono: 'i_bag', tinte: 0xffd040, npc: 'fig_prestamista', pie: 'Personaje del Abismo\n(traidor)', peso: 2,
    intro: 'Detrás de una mesa con una balanza, un hombre de chistera cuenta monedas con demasiados dedos. «¿Le faltan Ergios? Le presto. Me paga cuando termine el tramo… con un pequeño interés. Firme aquí.»',
    opciones: [
      { label: 'Pedir el préstamo grande (+60 Ergios)', risk: `Al terminar el tramo te cobra ${Math.round(60 * 1.5)}. Si no los tienes, te cobra el resto en VIDA.`, salidas: [
        { p: 1, e: { texto: '«Excelente decisión.» Las monedas están tibias. La tinta del contrato todavía se mueve.', prestamo: 60 } },
      ] },
      { label: 'Pedir el préstamo chico (+30 Ergios)', risk: `Al terminar el tramo te cobra ${Math.round(30 * 1.5)}.`, salidas: [
        { p: 1, e: { texto: '«Prudente. Me gusta la gente prudente: tarda más en arruinarse.»', prestamo: 30 } },
      ] },
      {
        label: 'Revisar las cuentas del contrato', risk: 'Pregunta de trabajo y energía. Si aciertas, encuentras la trampa: te da 25 Ergios sin interés para que no lo denuncies. Si fallas: −8 de Cordura.',
        pregunta: {
          concepts: ['Trabajo', 'Trabajo-energia', 'Potencia'],
          bien: { texto: 'Las cuentas no cuadran y se lo demuestras. El Prestamista suda. «Tome, tome… un regalo. Aquí no pasó nada.»', ergios: 25 },
          mal: { texto: 'Los números se mueven en el papel mientras los lees. Te da dolor de cabeza y el Prestamista se ríe.', cordura: -8 },
        },
      },
      IRSE,
    ],
  },
  {
    id: 'viuda', titulo: 'La casa de la Viuda de Arkham', obra: '', anio: 0, icono: 'i_fire', tinte: 0xc8c4d8, npc: 'fig_viuda', pie: 'Personaje del Abismo\n(amable, pero cobra)', peso: 2,
    intro: 'En una casa torcida, una mujer de velo negro te abre la puerta. «Mi esposo era astrónomo; se cayó del observatorio una noche sin luna. Pasa. Sé curar criaturas… pero todo tiene un precio.»',
    opciones: [
      { label: 'Que cuide a tu familiar', need: { familiar: true }, risk: 'Tu familiar se queda 2 combates más. Ella se queda con una carta de tu mazo (la elige ella).', salidas: [
        { p: 1, e: { texto: 'Le da a tu familiar un caldo que huele a estrellas. Luego mira tu mazo y saca una carta sin preguntar: «Ésta me la llevo.»', familiarExtra: 2, quitarCarta: true } },
      ] },
      { label: 'Tomar té y descansar (15 Ergios)', need: { ergios: 15 }, risk: '+15 de vida y +6 de Cordura.', salidas: [
        { p: 1, e: { texto: 'El té está tibio y la silla es cómoda. Por un rato, el Abismo parece muy lejos.', ergios: -15, hp: 15, cordura: 6 } },
      ] },
      {
        label: 'Preguntarle por la caída de su esposo', risk: 'Pregunta de energía. Si aciertas: un diente raro y +6 de Cordura. Si fallas: −8 de Cordura.',
        pregunta: {
          concepts: ['Energia potencial', 'Conservacion', 'Trabajo-energia'],
          bien: { texto: 'Le explicas qué tan rápido cayó. Ella llora un poco y te da algo que él guardaba: un diente que brilla como estrella.', diente: 'raro', cordura: 6 },
          mal: { texto: '«No, no fue así.» Se queda callada mirando la ventana. Tú también ves algo en la ventana.', cordura: -8 },
        },
      },
      IRSE,
    ],
  },
  {
    id: 'alineacion', titulo: 'La Alineación Planetaria', obra: '', anio: 0, icono: 'i_astro', tinte: 0xffd080, npc: 'fig_alineacion', pie: 'Fenómeno del Abismo', peso: 2,
    intro: 'El techo del Abismo se abre y ves tres planetas en fila, como cuentas de un collar. Sus gravedades tiran en la misma dirección: las fuerzas se SUMAN. Sientes que todo tu cuerpo se inclina hacia ellos.',
    opciones: [
      { label: 'Dejar que te jalen', risk: '+1 J en el primer turno de cada combate hasta el final del tramo. −6 de Cordura.', salidas: [
        { p: 1, e: { texto: 'Te dejas llevar. La fuerza de los tres planetas te empuja: cada combate empiezas con más energía. Pero algo en ti ya no está alineado.', alineacion: true, cordura: -6 } },
      ] },
      {
        label: 'Resistir: calcular la fuerza total', risk: 'Pregunta de fuerzas. Si aciertas: Caronte, el Barquero, te acompaña (te salva una vez de morir). Si fallas: −12 de vida.',
        pregunta: {
          concepts: ['2a ley', '1a ley', '2a ley (sistemas)'],
          bien: { texto: 'Sumas las fuerzas, te plantas con los pies firmes y no te mueves. Desde muy lejos, una lunita encapuchada se acerca a ver quién resistió: Caronte.', familiar: 'caronte', cordura: 4 },
          mal: { texto: 'La suma de fuerzas te gana: sales volando y caes de espaldas.', hp: -12 },
        },
      },
      IRSE,
    ],
  },
  {
    id: 'meteoritos', titulo: 'Lluvia de Meteoritos', obra: '', anio: 0, icono: 'i_fire', tinte: 0xff8a2a, npc: 'fig_meteoro', pie: 'Fenómeno del Abismo', peso: 2,
    intro: 'Un silbido. Luego otro. Del techo del Abismo caen rocas encendidas de todos los tamaños. Algunas son pequeñas y rapidísimas; otras, enormes y lentas. ¿Cuál pega más fuerte? Depende de su energía cinética: K = ½·m·v².',
    opciones: [
      { label: 'Esquivarlos (minijuego)', risk: 'Muévete con el ratón o las flechas. Recoge fragmentos brillantes (Ergios); cada golpe te quita vida según su ½·m·v².', salidas: [
        { p: 1, e: { texto: '¡Ahí vienen!', meteoritos: true } },
      ] },
      { label: 'Cubrirte bajo una roca', risk: 'A veces sales ileso; a veces un meteorito pega cerca (−10 de vida) y deja fragmentos (+20 Ergios).', salidas: [
        { p: 0.6, e: { texto: 'Esperas a que pase. Cuando sales, sólo hay humo.' } },
        { p: 0.4, e: { texto: 'Uno cae justo al lado. Te zumban los oídos, pero entre el polvo brillan fragmentos de metal.', hp: -10, ergios: 20 } },
      ] },
    ],
  },
);

// ════════════════════════════════════════════════════════════════
//  v0.51 · LAS TIERRAS DEL SUEÑO: sueños basados en el «ciclo del sueño»
//  de Lovecraft (cuentos publicados hasta 1930). Salen en el nodo 🌙.
//  En una pesadilla (efecto «combate») la vida que pierdes no es real:
//  al despertar la recuperas. La Cordura que pierdes sí cuenta.
// ════════════════════════════════════════════════════════════════
const DESPERTAR: OpcionRelato = { label: 'Despertar', risk: 'Abres los ojos. No pasa nada.', salidas: [{ p: 1, e: { texto: 'Te despiertas con la mejilla pegada a la dentadura. Sólo fue un sueño. Casi.' } }] };

export const SUENOS: RelatoDef[] = [
  {
    id: 'celephais', sueno: true, titulo: 'Celephaïs, en el valle de Ooth-Nargai', obra: 'Celephaïs', anio: 1922, icono: 'i_shrine', tinte: 0xffd8a0,
    intro: 'Bajas a un valle donde una ciudad de mármol brilla junto a un mar quieto. Un hombre con corona te saluda: es Kuranes, que soñó tanto con Celephaïs que ahora es su rey. En el puerto, galeras doradas zarpan… hacia el cielo, justo donde el mar toca las nubes.',
    opciones: [
      { label: 'Quedarte una noche en Celephaïs', risk: '+20 de vida y +12 de Cordura', salidas: [
        { p: 1, e: { texto: 'En Celephaïs nadie envejece y nada se rompe. Duermes dentro del sueño, y descansas de verdad.', hp: 20, cordura: 12 } },
      ] },
      {
        label: 'Subir a la galera que navega al cielo', risk: 'Pregunta de energía potencial. Si aciertas: un diente raro y +6 de Cordura. Si fallas: −10 de vida.',
        pregunta: {
          concepts: ['Energia potencial', 'Trabajo-energia'],
          bien: { texto: 'Calculas cuánta energía necesita subir la galera y Kuranes te deja timonear. En las nubes encuentras un diente que brilla como estrella.', diente: 'raro', cordura: 6 },
          mal: { texto: 'La galera sube… y tú no. Caes entre las nubes y despiertas antes de tocar el suelo, con el golpe todavía en el cuerpo.', hp: -10 },
        },
      },
      DESPERTAR,
    ],
  },
  {
    id: 'barcoBlanco', sueno: true, titulo: 'El puente de luz de luna', obra: 'El barco blanco', anio: 1919, icono: 'i_wind', tinte: 0xd8e8ff,
    intro: 'Eres el guardián de un faro. Una noche de luna llena, un barco blanco llega caminando sobre un puente de luz. Su capitán, un anciano de barba larga, te invita a subir. Te ofrece tres destinos: la tranquila Sona-Nyl, la ciudad de las mil maravillas, Thalarion… o seguir al pájaro celeste hasta Cathuria, la Tierra de la Esperanza.',
    opciones: [
      { label: 'Desembarcar en Sona-Nyl', risk: '+12 de vida y +10 de Cordura', salidas: [
        { p: 1, e: { texto: 'En Sona-Nyl no hay dolor ni prisa. Te quedas lo que en el sueño parecen años.', hp: 12, cordura: 10 } },
      ] },
      { label: 'Entrar a Thalarion', risk: 'PESADILLA: peleas contra el Guardián de Thalarion. Si ganas: un diente raro. (La vida que pierdas en el sueño no es real.)', salidas: [
        { p: 1, e: { texto: 'Las puertas de la ciudad se cierran detrás de ti. Nadie que entra a Thalarion vuelve a salir… a menos que venza a su Guardián.', combate: 'thalarion' } },
      ] },
      { label: 'Seguir al pájaro celeste hasta Cathuria', risk: '50 %: un diente LEGENDARIO · 50 %: −15 de vida y −10 de Cordura', salidas: [
        { p: 0.5, e: { texto: 'Más allá de las Columnas de Basalto, el pájaro deja caer algo en tu mano antes de desaparecer.', diente: 'legendario' } },
        { p: 0.5, e: { texto: 'Tras las Columnas no hay ninguna tierra: sólo una catarata sin fondo. El barco cae, y caes con él.', hp: -15, cordura: -10 } },
      ] },
    ],
  },
  {
    id: 'sarnath', sueno: true, titulo: 'El banquete de Sarnath', obra: 'La perdición que cayó sobre Sarnath', anio: 1920, icono: 'i_skull', tinte: 0x7ae0a0,
    intro: 'Hace mil años, la orgullosa Sarnath destruyó la ciudad de Ib y se robó el ídolo verde de su dios, Bokrug, el Gran Lagarto de Agua. Hoy Sarnath celebra el aniversario con un banquete enorme. En el lago, algo verde se mueve bajo la luna.',
    opciones: [
      { label: 'Robar el ídolo de Bokrug del templo', risk: 'PESADILLA: peleas contra BOKRUG (jefe del sueño). Si ganas: un diente LEGENDARIO y su trofeo para el Vestidor.', salidas: [
        { p: 1, e: { texto: 'Tomas el ídolo. El lago entero se levanta: Bokrug viene por lo que es suyo.', combate: 'bokrug' } },
      ] },
      { label: 'Sentarte al banquete', risk: '60 %: +40 Ergios y +10 de vida · 40 %: −12 de Cordura', salidas: [
        { p: 0.6, e: { texto: 'Comes manjares de mil años. Al irte, te llenan los bolsillos de monedas de Sarnath.', ergios: 40, hp: 10 } },
        { p: 0.4, e: { texto: 'A media cena ves que los invitados tienen la piel verde y los labios fofos. Nadie habla. Nadie parpadea.', cordura: -12 } },
      ] },
      { label: 'Bajar a las ruinas de Ib', risk: 'PESADILLA: peleas contra dos Seres de Ib. Si ganas: un diente raro.', salidas: [
        { p: 1, e: { texto: 'Entre las piedras de Ib te esperan dos de sus habitantes. No hacen ningún ruido al acercarse.', combate: 'ib' } },
      ] },
    ],
  },
  {
    id: 'hypnos', sueno: true, titulo: 'El estudio del escultor', obra: 'Hypnos', anio: 1923, icono: 'i_ojo', tinte: 0xc8b8ff,
    intro: 'Tu amigo, un escultor de rostro perfecto, viaja contigo cada noche por sueños cada vez más hondos. Ahora tiene miedo y no deja que abras la cortina: allá afuera, en el cielo, brilla la Corona Boreal.',
    opciones: [
      {
        label: 'Seguir a tu amigo más hondo', risk: 'Pregunta de conservación de la energía. Si aciertas: un diente raro y +10 de Cordura. Si fallas: −15 de Cordura y un parásito.',
        pregunta: {
          concepts: ['Conservacion', 'Energia potencial'],
          bien: { texto: 'Bajan tan hondo que el sueño se vuelve transparente. Tu amigo te regala algo que encontró ahí.', diente: 'raro', cordura: 10 },
          mal: { texto: 'Te pierdes en un sueño sin fondo. Al volver, algo vino contigo.', cordura: -15, diente: 'parasito' },
        },
      },
      { label: 'Abrir la cortina', risk: 'PESADILLA: peleas contra Lo que Vino de la Corona Boreal (invisible). Si ganas: un diente raro.', salidas: [
        { p: 1, e: { texto: 'Abres la cortina. De la Corona Boreal baja una luz fría… y luego una sombra.', combate: 'hypnos' } },
      ] },
      DESPERTAR,
    ],
  },
  {
    id: 'muroSueno', sueno: true, titulo: 'El pabellón del hospital', obra: 'Más allá del muro del sueño', anio: 1919, icono: 'i_star', tinte: 0xfff0a0,
    intro: 'Un paciente del hospital, Joe Slater, habla en sueños con una voz que no es suya. Esta noche lo sueñas tú también: a través de él te habla un ser de pura luz, prisionero en su cuerpo. «Mañana verás una estrella nueva cerca de Algol», dice.',
    opciones: [
      {
        label: 'Escuchar al ser de luz', risk: 'Pregunta de energía. Si aciertas: un diente ASTRO y +10 de Cordura. Si fallas: −10 de Cordura.',
        pregunta: {
          concepts: ['Energia cinetica', 'Trabajo'],
          bien: { texto: 'Entiendes de qué está hecho: luz que viaja sin detenerse. Antes de irse, deja un pequeño planeta en tu boca.', diente: 'astro', cordura: 10 },
          mal: { texto: 'La voz habla demasiado rápido. Te quedas con el zumbido en los oídos.', cordura: -10 },
        },
      },
      { label: 'Ayudarlo a escapar del cuerpo', risk: '+15 de Cordura y +4 de Vida máxima', salidas: [
        { p: 1, e: { texto: '«Nos veremos en el fulgor de Algol.» Al día siguiente, de verdad aparece una estrella nueva en el cielo. (La Nova de Perseo existió: se vio en 1901.)', cordura: 15, maxHp: 4 } },
      ] },
      DESPERTAR,
    ],
  },
  {
    id: 'llavePlata', sueno: true, titulo: 'El desván de la infancia', obra: 'La llave de plata', anio: 1929, icono: 'i_rune', tinte: 0xe0e0f0,
    intro: 'Randolph Carter perdió la llave de los sueños a los treinta años. Esta noche, en el desván de su vieja casa, encuentras una caja de roble con una llave de plata enorme y llena de jeroglíficos. Si la giras, dicen, uno vuelve a ser niño.',
    opciones: [
      { label: 'Girar la llave de plata', risk: '+10 de Cordura y recuperas tu última carta de Cristal rota (si no hay, una carta tuya se vuelve de Cristal)', salidas: [
        { p: 1, e: { texto: 'Vuelves a tener diez años. Lo que habías perdido está otra vez en tu bolsillo, como si nunca se hubiera roto.', cordura: 10, reanimar: true } },
      ] },
      { label: 'Guardar la llave para después', risk: '+45 Ergios', salidas: [
        { p: 1, e: { texto: 'Al despertar ya no tienes la llave, pero tus bolsillos pesan más.', ergios: 45 } },
      ] },
      DESPERTAR,
    ],
  },
  {
    id: 'polaris', sueno: true, titulo: 'La atalaya de Olathoë', obra: 'Polaris', anio: 1920, icono: 'i_star', tinte: 0xa0c8ff,
    intro: 'Sueñas que eres el vigía de una torre en la ciudad de Olathoë. Tienes que dar la alarma si algo se acerca por el valle. Pero la Estrella Polar, que nunca se mueve, te mira desde el cielo y canta: «Duerme, vigía…»',
    opciones: [
      {
        label: 'Mantenerte despierto en la atalaya', risk: 'Pregunta de equilibrio (1ª ley). Si aciertas: +8 de Vida máxima y +6 de Cordura. Si fallas: −8 de Cordura y Fatiga (2 combates).',
        pregunta: {
          concepts: ['1a ley', 'Fuerza normal'],
          bien: { texto: 'Te mantienes firme como la torre: ΣF = 0. La ciudad está a salvo esta noche.', maxHp: 8, hp: 8, cordura: 6 },
          mal: { texto: 'Cierras los ojos «sólo un momento». La estrella se ríe. Al despertar sigues cansado.', cordura: -8, maldicion: ['fatiga', 2] },
        },
      },
      { label: 'Escuchar el canto de la Estrella Polar', risk: '50 %: un diente raro · 50 %: −12 de Cordura', salidas: [
        { p: 0.5, e: { texto: 'La estrella te enseña cómo gira el cielo a su alrededor. Te deja un recuerdo.', diente: 'raro' } },
        { p: 0.5, e: { texto: 'Los versos de la estrella se te quedan pegados. Los vas a oír toda la expedición.', cordura: -12 } },
      ] },
      DESPERTAR,
    ],
  },
];
RELATOS.push(...SUENOS);
export const RELATO = (id?: string) => RELATOS.find((r) => r.id === id);
/** Sueños que te faltan por soñar (codex.suenos), o todos si ya los soñaste */
export const suenosNuevos = (vistos: string[] = []) => SUENOS.filter((r) => !vistos.includes(r.id));
