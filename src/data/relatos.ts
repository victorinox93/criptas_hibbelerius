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
}

export interface OpcionRelato {
  label: string;
  risk: string;
  need?: { ergios?: number };
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
  intro: string;
  opciones: OpcionRelato[];
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
export const RELATO = (id?: string) => RELATOS.find((r) => r.id === id);
