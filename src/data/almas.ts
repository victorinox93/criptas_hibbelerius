// ════════════════════════════════════════════════════════════════
//  ALMAS EN PENA (inspiradas en los NPC de los juegos «Souls»).
//  Aparecen muy rara vez en los nodos de encuentro (ALMA_CHANCE),
//  cada una a lo más una vez por expedición. Si las ayudas o contestas
//  su pregunta con compasión, se vuelven tu ALIADO: un fantasma que
//  pelea a tu lado en élites y jefes. Sólo puedes tener UN aliado en
//  toda la expedición (los 3 actos), así que son raros.
//  Lo que hace cada aliado en combate está en Combat.ts (busca «aliado»).
// ════════════════════════════════════════════════════════════════

export interface AlmaDef {
  id: string;
  name: string;
  /** apariencia de su fantasma (usa el generador de héroes) */
  look: { clase: 'caballero' | 'arcanista'; helm: string; arma: number; extra: number };
  pal: Record<string, string>; // colores apagados del sprite
  intro: string; // su historia, en sus palabras
  pregunta: string; // pregunta filosófica
  opciones: string[];
  correcta: number; // la respuesta compasiva / esperanzadora
  ayuda: { label: string; ergios?: number; hp?: number; pocion?: boolean }; // ayudarle directamente
  gracias: string; // si le ayudas o contestas bien
  triste: string; // si contestas mal
  yaTienes: string; // si ya caminas con otro aliado
  habilidad: string; // texto de su habilidad en combate
  final: string; // lo que dice si vencen juntos a Hibbelerius
}

export const ALMAS: Record<string, AlmaDef> = {
  icaro: {
    id: 'icaro',
    name: 'Ícaro, el Recursador',
    look: { clase: 'caballero', helm: 'penacho', arma: 1, extra: 0 },
    pal: { c: '#5a5a66', C: '#34343e', l: '#7a7684', g: '#4a4656', E: '#e8c15a', B: '#e8c15a', s: '#b8a08a', q: '#8a7a6a' },
    intro: 'Un caballero con las alas derretidas está sentado junto a un examen tachado en rojo.\n«Es la tercera vez que curso Dinámica. Las dos anteriores volé demasiado cerca del final y me quemé. Mis compañeros ya se graduaron… yo sigo aquí, en la misma cripta.»',
    pregunta: '«Dime, viajero: ¿vale la pena seguir intentando algo en lo que ya fallaste dos veces?»',
    opciones: [
      'No. Si fallaste dos veces, no es lo tuyo.',
      'Sí, pero cambiando cómo lo intentas: cada error es información.',
      'Sí: repítelo igual, tarde o temprano saldrá.',
    ],
    correcta: 1,
    ayuda: { label: 'Explicarle tus apuntes (−40 Ergios)', ergios: 40 },
    gracias: '«…Información. Nunca lo había visto así. Si me lo permites, volaré contigo — esta vez, más bajo.»',
    triste: '«Sí… eso mismo me dije las otras dos veces.» Ícaro baja la mirada y se queda junto a su examen.',
    yaTienes: '«Ya caminas con alguien. Bien. Nadie debería cursar esto solo.» Te da unos Ergios que tenía guardados.',
    habilidad: 'Al final de tu turno ataca a un enemigo al azar (6 a 14 de daño).',
    final: 'Ícaro levanta su examen: esta vez, en la esquina, hay un 10.',
  },
  ayudante: {
    id: 'ayudante',
    name: 'La Ayudante Sin Nombre',
    look: { clase: 'arcanista', helm: 'cuernos', arma: 1, extra: 0 },
    pal: { c: '#4a4a5e', C: '#2a2a3a', l: '#6a6a7a', g: '#3a3a4a', E: '#9ad8f0', B: '#9ad8f0', s: '#c8b8a8', q: '#9a8a7a' },
    intro: 'Una figura encapuchada califica una pila infinita de exámenes con una pluma que ya no tiene tinta.\n«He revisado tantos diagramas de cuerpo libre que olvidé mi propio nombre. Los alumnos me dicen “oiga”. Los profesores, “la ayudante”.»',
    pregunta: '«Si nadie recuerda tu nombre… ¿valió algo tu trabajo?»',
    opciones: [
      'No: si no te recuerdan, es como si no hubieras estado.',
      'Sí: cada alumno que entendió algo lleva un poco de ti.',
      'Da igual, nada importa en esta cripta.',
    ],
    correcta: 1,
    ayuda: { label: 'Ayudarle a calificar (−10 de vida)', hp: 10 },
    gracias: '«…Un poco de mí. Qué idea tan rara y tan bonita. Déjame acompañarte: sé curar a los que se equivocan.»',
    triste: '«Ah. Ya veo.» Vuelve a su pila de exámenes. La pluma sigue sin tinta.',
    yaTienes: '«Ya tienes quien te cuide. Toma, a mí ya no me sirve.» Te deja unos Ergios sobre la mesa.',
    habilidad: 'Al final de tu turno te da 6 de Bloqueo y te cura 2.',
    final: 'La ayudante sonríe: «Me llamo…» y por primera vez en siglos, lo recuerda.',
  },
  bernoulli: {
    id: 'bernoulli',
    name: 'Sir Bernoulli el Errante',
    look: { clase: 'caballero', helm: 'cerrado', arma: 0, extra: 1 },
    pal: { c: '#6a5a3a', C: '#3a3020', l: '#8a8070', g: '#5a5040', E: '#c8f070', B: '#c8f070', s: '#b8a08a', q: '#8a7a6a' },
    intro: 'Un caballero en armadura redonda ronca junto a un artefacto de ruedas y canicas que no se mueve.\n«¡Mmmh! ¡Oh, hola! Llevo cuarenta años buscando la máquina de movimiento perpetuo. Esta casi funciona. Casi. Siempre casi…»',
    pregunta: '«Si al final la máquina es imposible… ¿fue inútil buscarla?»',
    opciones: [
      'Sí, perdiste cuarenta años.',
      'No: buscándola se descubrió que la energía se conserva.',
      'No, seguro algún día funciona si la empujas más fuerte.',
    ],
    correcta: 1,
    ayuda: { label: 'Darle una poción para el camino', pocion: true },
    gracias: '«¡La energía se conserva! ¡Entonces mi esfuerzo tampoco se perdió! ¡Jajá! Iré contigo, amigo, ¡a probar esa ley en batalla!»',
    triste: '«Mmmh… quizá.» Sir Bernoulli vuelve a dormirse junto a su máquina.',
    yaTienes: '«¡Ya tienes compañero! ¡Espléndido! Toma esto, me sobra.» Te regala unos Ergios.',
    habilidad: 'Al final de tu turno hace 5 de daño a todos los enemigos.',
    final: 'Sir Bernoulli ríe tan fuerte que su máquina, por un instante, da una vuelta completa.',
  },
};

export const ALMA_IDS = Object.keys(ALMAS);
/** Probabilidad de encontrar un alma en pena en un nodo de encuentro */
export const ALMA_CHANCE = 0.1;
/** Ergios de consuelo si ya tienes aliado */
export const ALMA_CONSUELO = 40;
