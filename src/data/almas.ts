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
  look: { clase: 'caballero' | 'arcanista' | 'penitente'; helm: string; arma: number; extra: number };
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
  radian: {
    id: 'radian',
    name: 'Sir Radián, el Mal Configurado',
    look: { clase: 'caballero', helm: 'corona', arma: 3, extra: 2 },
    pal: { c: '#3a4a5a', C: '#222c38', l: '#8a8a96', g: '#5a5a66', E: '#ff7a5a', B: '#ff7a5a', s: '#c8b0a0', q: '#9a8478' },
    intro: 'Un caballero teclea furioso en una calculadora antiquísima. En la pantalla dice «RAD».\n«sin(30) = −0.988. ¡OTRA VEZ! Llevo siglos resolviendo el mismo plano inclinado y mi bloque siempre sube la rampa solo.»',
    pregunta: '«Viajero… ¿de quién es la culpa cuando todo sale mal: de la calculadora o mía?»',
    opciones: [
      'De la calculadora: está maldita, tírala.',
      'De nadie: revisar el modo (DEG/RAD) es parte de resolver. Un error se corrige, no te define.',
      'Tuya: si no lo has resuelto en siglos, ya no lo harás.',
    ],
    correcta: 1,
    ayuda: { label: 'Cambiarle la calculadora a DEG (−30 Ergios)', ergios: 30 },
    gracias: '«…¿DEG? ¿Había un botón? sin(30) = 0.5. ¡¡0.5!! Te seguiré hasta el fin de la torre… aunque a veces olvidaré cambiar el modo.»',
    triste: '«Sí… claro.» Vuelve a teclear. En la pantalla aparece «Math ERROR».',
    yaTienes: '«¿Ya tienes compañero? Toma estas monedas. Las conté en radianes, así que quizá sean más… o menos.»',
    habilidad: 'Al final de tu turno calcula sin(θ) en el modo que le toque: a veces golpea fuerte (hasta 18 a un enemigo), a veces te da Bloqueo, a veces… nada.',
    final: 'Sir Radián teclea sin(90) en DEG. La pantalla dice 1. Llora de alegría.',
  },
  doctorando: {
    id: 'doctorando',
    name: 'El Doctorando Eterno',
    look: { clase: 'arcanista', helm: 'penacho', arma: 2, extra: 2 },
    pal: { c: '#4a3a2a', C: '#2a2018', l: '#6a5a4a', g: '#3a3020', E: '#e8e0a0', B: '#e8e0a0', s: '#c8b8a8', q: '#9a8a7a' },
    intro: 'Entre montañas de artículos subrayados, una figura con ojeras eternas escribe y borra el mismo párrafo.\n«Mi tesis va al 90 %. Llevo así once años. Cada vez que la termino, sale un artículo nuevo y tengo que revisar el estado del arte.»',
    pregunta: '«¿Algún día algo está realmente terminado?»',
    opciones: [
      'No. Si no es perfecto, no vale la pena entregarlo.',
      'Sí: terminado es mejor que perfecto. Entregar también es parte del trabajo.',
      'Cuando el asesor deje de contestar los correos.',
    ],
    correcta: 1,
    ayuda: { label: 'Revisar su capítulo 3 (−8 de vida)', hp: 8 },
    gracias: '«…Terminado es mejor que perfecto. Lo voy a imprimir. ¡Hoy! Pero primero… déjame acompañarte, tengo bibliografía para todos tus enemigos.»',
    triste: '«Mmm… lo anoto para la discusión.» Abre otro artículo. Ya van 4,312.',
    yaTienes: '«Ah, ya tienes coautor. Toma, era el dinero de mi beca. Ya no lo necesito… creo.»',
    habilidad: 'Al final de tu turno revisa la literatura: 2 de Fatiga a todos los enemigos (reciben +50 % de daño).',
    final: 'El Doctorando entrega su tesis en el escritorio de Hibbelerius. Aprobada, sin cambios.',
  },
  procrastinador: {
    id: 'procrastinador',
    name: 'Sir Mañana, el Procrastinador',
    look: { clase: 'caballero', helm: 'alado', arma: 2, extra: 0 },
    pal: { c: '#4a4a3a', C: '#2a2a20', l: '#7a7a6a', g: '#4a4a3a', E: '#c8c8a0', B: '#c8c8a0', s: '#c8b8a0', q: '#9a8a78' },
    intro: 'Un caballero dormita sobre una pila de tareas sin abrir. Cada hoja dice «para mañana».\n«Llevo siglos aquí. Mañana empiezo, de verdad. El examen es… ¿hoy? No, no puede ser hoy. Hoy nunca es el día.»',
    pregunta: '«Si puedo hacerlo mañana… ¿para qué hacerlo hoy?»',
    opciones: [
      'Tienes razón: mañana siempre habrá tiempo.',
      'Porque mañana traerá su propio trabajo: lo de hoy se acumula como la inercia.',
      'Mejor no lo hagas nunca y así no hay problema.',
    ],
    correcta: 1,
    ayuda: { label: 'Hacerle un plan de estudio (−35 Ergios)', ergios: 35 },
    gracias: '«…Se acumula. Como mi armadura oxidada. Está bien: te acompaño HOY. Bueno, cada dos turnos, pero con todo.»',
    triste: '«Exacto. Mañana lo pienso mejor.» Vuelve a dormirse sobre sus tareas.',
    yaTienes: '«¿Ya tienes compañero? Qué alivio, una cosa menos. Toma, esto lo iba a gastar… mañana.»',
    habilidad: 'Un turno no hace nada («mañana lo hago»); al siguiente suelta TODO lo acumulado: 10 de daño a todos.',
    final: 'Sir Mañana entrega su tarea a tiempo por primera vez en la historia. Hibbelerius no lo puede creer.',
  },
  decimales: {
    id: 'decimales',
    name: 'La Dama de los Decimales',
    look: { clase: 'arcanista', helm: 'corona', arma: 1, extra: 0 },
    pal: { c: '#5a4a6a', C: '#3a2a4a', l: '#8a7a9a', g: '#5a4a6a', E: '#f0e8ff', B: '#f0e8ff', s: '#d8c8c0', q: '#a89890' },
    intro: 'Una dama escribe cifras en el aire con una pluma de cristal: 9.80665, 9.806650, 9.8066500…\n«Nunca entregué mi examen. Siempre le faltaba un decimal más para estar perfecto. Ya van 4,000 decimales y sigo sin entregar.»',
    pregunta: '«¿Cuántos decimales necesita una respuesta para estar bien?»',
    opciones: [
      'Todos los posibles: si no es perfecta, está mal.',
      'Las que permiten tus datos (cifras significativas). Entregada vale más que perfecta en tu cabeza.',
      'Ninguno, redondea todo a 10.',
    ],
    correcta: 1,
    ayuda: { label: 'Revisar sus cifras significativas (−6 de vida)', hp: 6 },
    gracias: '«Tres cifras significativas… 9.81. ¡Qué ligereza! Te acompaño: mis golpes serán exactos, ni uno más ni uno menos.»',
    triste: '«…9.806650000001.» Sigue escribiendo. No te mira.',
    yaTienes: '«Ya tienes aliado. Toma estos Ergios: son exactamente los que necesitas. Los conté.»',
    habilidad: 'Al final de tu turno golpea al enemigo con menos vida: si le quedan 12 o menos, lo remata exacto; si no, le hace 6.',
    final: 'La Dama escribe «9.81 m/s²» y, por fin, firma su examen.',
  },
  duda: {
    id: 'duda',
    name: 'El Encadenado de la Duda',
    look: { clase: 'penitente', helm: 'cuernos', arma: 2, extra: 0 },
    pal: { c: '#3a3a4a', C: '#20202a', l: '#6a6a7a', g: '#3a3a4a', E: '#9ad8f0', B: '#9ad8f0', s: '#b8b0a8', q: '#8a8078' },
    intro: 'Un hombre arrastra una cadena atada a una piedra enorme con un «?» tallado.\n«En la clase 2 tuve una duda y no levanté la mano: me dio pena. La duda creció. Ahora pesa ochenta kilos y no me deja avanzar.»',
    pregunta: '«¿Preguntar en clase te hace ver tonto?»',
    opciones: [
      'Sí, mejor quédate callado y búscalo después.',
      'No: las dudas se acumulan. Preguntar es la forma más rápida de aprender (y alguien más tenía la misma).',
      'Sólo si la pregunta es muy fácil.',
    ],
    correcta: 1,
    ayuda: { label: 'Resolverle la duda tú mismo (−30 Ergios)', ergios: 30 },
    gracias: 'Hace la pregunta en voz alta. La piedra se parte en dos. «…¡Era eso! Te acompaño: entre dos, las dudas pesan la mitad.»',
    triste: '«…No, mejor no pregunto.» Sigue arrastrando su piedra.',
    yaTienes: '«¿Ya vas acompañado? Qué bueno. Toma, y… si tienes una duda, pregúntala.»',
    habilidad: 'Robas 1 carta más cada turno, y al final de tu turno lanza su cadena: 4 de daño a un enemigo al azar.',
    final: 'El Encadenado levanta la mano al final de la clase de Hibbelerius. Esta vez, la respuesta llega.',
  },
  // Un guerrero que dejó de pensar por sí mismo: la llama amarilla de su yelmo le «dictaba» todo
  autocompleto: {
    id: 'autocompleto',
    name: 'Sir Autocompleto, de la Llama Delirante',
    look: { clase: 'caballero', helm: 'cerrado', arma: 2, extra: 2 },
    pal: { c: '#5a4a1e', C: '#2e240c', l: '#8a8060', g: '#4a4430', E: '#ffd21a', B: '#ffd21a', s: '#c8b890', q: '#8a7a5a' },
    intro: 'Un guerrero arrodillado arde por dentro: por las rendijas de su yelmo sale una llama amarilla que no calienta.\n«La llama me dictaba cada respuesta, cada fórmula, cada paso. Sonaba tan segura… Un día me dijo que K = m·v² y le creí. Ya no sé cuál de mis pensamientos es mío.»',
    pregunta: '«Dime, viajero: si la llama ya sabe todas las respuestas, ¿para qué aprender yo?»',
    opciones: [
      'No hace falta: si la máquina lo sabe, tú no necesitas saberlo.',
      'Úsala si quieres, pero entiende tú el problema: si no, nunca sabrás cuándo se equivoca.',
      'Nunca la uses: es hacer trampa, y punto.',
    ],
    correcta: 1,
    ayuda: { label: 'Resolver con él un problema a mano (−8 de vida)', hp: 8 },
    gracias: '«…Cuándo se equivoca. Nunca me lo pregunté. Déjame pelear a tu lado: la llama propone, y yo verifico.»',
    triste: '«Eso mismo me susurra la llama.» El guerrero vuelve a inclinar la cabeza hacia el fuego amarillo.',
    yaTienes: '«Ya caminas con alguien que piensa por sí mismo. Bien.» Te da unos Ergios que la llama le dijo que guardara.',
    habilidad: 'Al final de tu turno su llama golpea a TODOS los enemigos (7). Pero 1 de cada 4 veces «alucina»: no le pega a nadie y te sube 3 de Locura.',
    final: 'Sir Autocompleto apaga la llama de su yelmo y escribe la solución a mano. Abajo firma: «Lo verifiqué yo.»',
  },
};

export const ALMA_IDS = Object.keys(ALMAS);
/** Probabilidad de encontrar un alma en pena en un nodo de encuentro */
export const ALMA_CHANCE = 0.1;
/** Ergios de consuelo si ya tienes aliado */
export const ALMA_CONSUELO = 40;
