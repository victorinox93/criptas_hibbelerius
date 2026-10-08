// ════════════════════════════════════════════════════════════════
//  RELACIONES ENTRE ECOS (inspirado en Hades, con historia real)
//  · Rivalidades: si aceptaste un don de su rival en esta expedición,
//    el eco llega MOLESTO: sin responder sólo ofrece 2 dones comunes;
//    puede reconciliarse si respondes bien su pregunta (si fallas, se va).
//  · Dones dúo: si ya tienes un don de un eco y encuentras a su pareja,
//    aparece un cuarto don, más fuerte, que combina a los dos.
//  · Afinidad: cada eco recuerda cuántas veces lo elegiste (entre expediciones).
//  Los efectos de los dúos en combate están en Combat.ts (busca «duo_»).
// ════════════════════════════════════════════════════════════════
import { BoonDef } from './figures';

export interface Rivalidad {
  a: string;
  b: string;
  titulo: string;
  historia: string; // lo que pasó de verdad (se ve en el Grimorio)
  queja: Record<string, string>; // lo que dice cada uno si elegiste al otro
}

export const RIVALIDADES: Rivalidad[] = [
  {
    a: 'newton', b: 'hooke', titulo: 'La ley del inverso del cuadrado',
    historia: 'Hooke le escribió a Newton en 1679 sugiriendo que la gravedad disminuye con el cuadrado de la distancia, y después reclamó el crédito. Newton borró casi todas las menciones a Hooke de los Principia y, se dice, hasta un retrato suyo desapareció de la Royal Society.',
    queja: {
      newton: '«¿Aceptaste algo de HOOKE? Ese hombre dice que la ley del inverso del cuadrado fue idea suya. Demuéstrame que piensas por ti mismo.»',
      hooke: '«Así que vienes de con Newton… Él se llevó el crédito de MI ley. Veamos si tú sí sabes quién merece qué.»',
    },
  },
  {
    a: 'newton', b: 'huygens', titulo: '¿Partícula u onda?',
    historia: 'Newton defendía que la luz está hecha de partículas («corpúsculos»); Huygens, que es una onda. Durante un siglo ganó Newton por su prestigio… hasta que Young y Fresnel mostraron la interferencia. Hoy sabemos que la luz es ambas cosas.',
    queja: {
      newton: '«Huygens y sus ondas… La luz son corpúsculos, viajero. Si llevas sus dones, convénceme de que razonas bien.»',
      huygens: '«Traes los dones de Newton. Su fama no le da la razón sobre la luz. Responde, y hablaremos.»',
    },
  },
  {
    a: 'hooke', b: 'huygens', titulo: 'El resorte del reloj',
    historia: 'En 1675 Huygens presentó el reloj con resorte espiral. Hooke acusó a la Royal Society de filtrarle su invento: él decía tenerlo desde 1660. La disputa nunca se resolvió del todo.',
    queja: {
      hooke: '«¿Huygens? ¡Ese reloj con resorte era MÍO! F = −k·x lo escribí yo.»',
      huygens: '«Hooke reclama todo lo que yo invento. ¿Tú también llevas sus dones?»',
    },
  },
  {
    a: 'tesla', b: 'einstein', titulo: 'El espacio no se curva',
    historia: 'Tesla rechazó públicamente la relatividad general: decía que el espacio no puede curvarse porque «no tiene propiedades». Einstein nunca le respondió, y los experimentos le dieron la razón a Einstein.',
    queja: {
      tesla: '«¿Te dejaste convencer por Einstein? El espacio no se curva, viajero. Demuéstrame que aún puedes pensar con claridad.»',
      einstein: '«Llevas los rayos de Tesla. Brillante inventor… pero el espacio-tiempo sí se curva. Hablemos.»',
    },
  },
];

export interface Duo {
  id: string;
  figs: [string, string];
  dialogo: [string, string]; // una línea de cada uno al conseguirlo
}

export const DUOS: Duo[] = [
  { id: 'duo_gigantes', figs: ['galileo', 'newton'], dialogo: ['Galileo: «Medí cómo caen los cuerpos…»', 'Newton: «…y yo expliqué por qué. Vi más lejos subido en hombros de gigantes.»'] },
  { id: 'duo_visviva', figs: ['chatelet', 'coriolis'], dialogo: ['Émilie: «Demostré que la energía crece con v², no con v…»', 'Coriolis: «…y yo le puse el ½ y la llamé trabajo.»'] },
  { id: 'duo_solvay', figs: ['einstein', 'curie'], dialogo: ['Marie: «En Solvay, Albert y yo discutimos la radiación…»', 'Einstein: «…y la convertimos en tu arma.»'] },
  { id: 'duo_simetria', figs: ['noether', 'einstein'], dialogo: ['Einstein: «Me impresiona que estas cosas se puedan entender desde un punto de vista tan general.»', 'Emmy: «Cada simetría esconde una ley de conservación.»'] },
  { id: 'duo_isocrono', figs: ['huygens', 'galileo'], dialogo: ['Galileo: «Dicen que vi oscilar una lámpara en la catedral de Pisa…»', 'Huygens: «…y yo construí el primer reloj de péndulo.»'] },
  { id: 'duo_joule', figs: ['joule', 'tesla'], dialogo: ['Joule: «Cada corriente que pasa calienta: Q = I²·R·t.»', 'Tesla: «Entonces mis rayos también quemarán.»'] },
  { id: 'duo_robot', figs: ['asimov', 'turing'], dialogo: ['Turing: «¿Puede pensar una máquina?»', 'Asimov: «Si obedece las tres leyes, que pelee a tu lado.»'] },
  { id: 'duo_roosevelt', figs: ['oppenheimer', 'einstein'], dialogo: ['Einstein: «Firmé la carta a Roosevelt. Me arrepentí toda la vida.»', 'Oppenheimer: «Y yo construí lo que esa carta pedía.»'] },
];

/** Dones dúo (se agregan a BOONS en figures.ts) */
export const DUO_BOONS: Record<string, BoonDef> = {
  duo_gigantes: { id: 'duo_gigantes', figure: 'duo', duo: ['galileo', 'newton'], name: 'Hombros de Gigantes', icon: 'i_gaunt',
    text: ['+1 kg y +1 m/s² a todos tus ataques.', '+2 kg y +1 m/s² a todos tus ataques.'],
    lore: '«Si he visto más lejos es porque estoy subido en hombros de gigantes.» Newton, 1675 (en una carta… a Hooke).' },
  duo_visviva: { id: 'duo_visviva', figure: 'duo', duo: ['chatelet', 'coriolis'], name: 'Teorema Trabajo-Energía', icon: 'i_bolt',
    text: ['Cada enemigo que derrotas te devuelve 1 J.', 'Cada enemigo que derrotas te devuelve 2 J.'],
    lore: 'K = ½·m·v²: la «fuerza viva» de Leibniz y Châtelet, con el ½ que añadió Coriolis.' },
  duo_solvay: { id: 'duo_solvay', figure: 'duo', duo: ['einstein', 'curie'], name: 'Congreso Solvay', icon: 'i_rad',
    text: ['Cada vez que recibes radiación, los enemigos reciben el doble.', 'Los enemigos reciben el triple de la radiación que recibes.'],
    lore: 'En 1911, Curie y Einstein coincidieron en el primer Congreso Solvay en Bruselas. Fueron amigos toda la vida.' },
  duo_simetria: { id: 'duo_simetria', figure: 'duo', duo: ['noether', 'einstein'], name: 'Simetría del Espacio-tiempo', icon: 'i_reflect',
    text: ['Tu primer ataque de cada turno hace el DOBLE.', 'Tu primer ataque de cada turno hace el DOBLE y robas 1 carta.'],
    lore: 'El teorema de Noether (1918) une simetrías y conservación. Einstein elogió su trabajo y, en 1935, le dedicó una carta póstuma en el New York Times.' },
  duo_isocrono: { id: 'duo_isocrono', figure: 'duo', duo: ['huygens', 'galileo'], name: 'Simpatía de Péndulos', icon: 'i_pend',
    text: ['Cada 3 turnos ganas +1 J y robas 1 carta.', 'Cada 2 turnos ganas +1 J y robas 1 carta.'],
    lore: 'En 1665 Huygens notó que dos relojes de péndulo colgados de la misma viga terminaban oscilando sincronizados: la «extraña simpatía». T = 2π√(L/g) no depende (casi) de la amplitud.' },
  duo_joule: { id: 'duo_joule', figure: 'duo', duo: ['joule', 'tesla'], name: 'Efecto Joule', icon: 'i_fire',
    text: ['Tus rayos eléctricos también aplican 2 de Calor.', 'Tus rayos aplican 4 de Calor.'],
    lore: 'La corriente eléctrica disipa energía como calor: Q = I²·R·t.' },
  duo_robot: { id: 'duo_robot', figure: 'duo', duo: ['asimov', 'turing'], name: 'El Robot Pensante', icon: 'i_shield',
    text: ['Un autómata aliado ataca al final de tu turno (6 de daño).', 'El autómata hace 9 de daño y te da 3 de Bloqueo.'],
    lore: 'Una máquina que piensa y obedece las tres leyes: el sueño de Asimov y la pregunta de Turing.' },
  duo_roosevelt: { id: 'duo_roosevelt', figure: 'duo', duo: ['oppenheimer', 'einstein'], name: 'La Carta a Roosevelt', icon: 'i_rad',
    text: ['Al iniciar cada combate, 20 de daño a todos los enemigos.\nRadiación: 4 al iniciar cada combate.', 'Al iniciar cada combate, 30 de daño a todos.\nRadiación: 4 al iniciar cada combate.'],
    lore: 'En 1939 Einstein firmó la carta que inició el Proyecto Manhattan. Años después dijo que fue el gran error de su vida.' },
};

/** Rivales de un eco */
export function rivalesDe(fig: string) {
  return RIVALIDADES.filter((r) => r.a === fig || r.b === fig).map((r) => ({ rival: r.a === fig ? r.b : r.a, r }));
}

/** Dúos en los que participa un eco */
export function duosDe(fig: string) {
  return DUOS.filter((d) => d.figs.includes(fig));
}
