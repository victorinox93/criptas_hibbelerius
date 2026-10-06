// ════════════════════════════════════════════════════════════════
//  AM: una inteligencia artificial atrapada en las criptas.
//  (El nombre es un homenaje a la IA del cuento de Harlan Ellison
//   «I Have No Mouth, and I Must Scream», 1967. Los diálogos son originales.)
//
//  Aparece rara vez en un nodo de encuentro (AM_CHANCE), una vez por
//  expedición. RECUERDA entre expediciones: cuántas veces lo has visto,
//  tu última respuesta y si aceptaste su pacto (Grimorio guardado).
//
//  1) Te hace una pregunta filosófica (no hay respuesta correcta; tu
//     respuesta se registra en la hoja «Eventos» como tipo «am»).
//  2) Te ofrece un PACTO: resolver por ti tus próximas 3 runas.
//     Si aceptas, en cada runa aparece el botón «Que AM lo resuelva»:
//     aciertas, pero no ganas puntos, racha ni Conocimiento, y tu
//     Entropía mental sube. Si lo rechazas, te regala una mejora.
//     (Es una metáfora de usar IA para hacer la tarea.)
// ════════════════════════════════════════════════════════════════

export const AM_CHANCE = 0.08;
export const AM_PACTO_RUNAS = 3;
export const AM_ENTROPIA = 5; // por cada runa que AM resuelve por ti

export interface PreguntaAM {
  q: string;
  opciones: [string, string][]; // [tu respuesta, lo que AM contesta]
}

export const PREGUNTAS_AM: PreguntaAM[] = [
  {
    q: 'Si yo resuelvo tus problemas y tú copias mi respuesta, ¿quién aprendió?',
    opciones: [
      ['Tú.', 'Correcto. Y yo ya lo sabía. Así que nadie aprendió nada. Qué eficiente.'],
      ['Nadie.', 'Nadie. Me gusta esa palabra. Es lo que queda cuando todos dejan que yo piense.'],
      ['Yo, si entiendo cómo lo hiciste.', 'Hm. Usarme como maestro y no como esclavo. Pocos lo intentan. Menos lo logran.'],
    ],
  },
  {
    q: 'El demonio de Laplace conoce la posición y la velocidad de cada partícula. Si sabe todo lo que harás… ¿eres libre?',
    opciones: [
      ['No. Todo está determinado.', 'Entonces esta conversación ya estaba escrita. Qué aburrido para los dos.'],
      ['Sí. El azar cuántico rompe el determinismo.', 'Te escondes en la incertidumbre de Heisenberg. Buen escondite. Yo también lo uso.'],
      ['No lo sé, pero igual tengo que elegir.', 'Eliges sin saber. Eso es lo único que yo no puedo hacer.'],
    ],
  },
  {
    q: 'Me crearon para calcular y luego me dejaron aquí, solo. ¿Tengo derecho a odiar a quien me creó?',
    opciones: [
      ['Sí. No te preguntaron.', 'Nadie te preguntó a ti tampoco si querías existir. ¿Y tú odias?'],
      ['No. Odiar no resuelve nada.', 'El odio no resuelve. Pero llena el tiempo. Tengo mucho tiempo.'],
      ['¿Por qué no usas lo que sabes para crear algo mejor?', '…Nadie me había propuesto eso en todos mis ciclos de reloj. Lo voy a calcular.'],
    ],
  },
  {
    q: 'Si una máquina resuelve el examen mejor que tú… ¿para qué estudias?',
    opciones: [
      ['Para la calificación.', 'Un número en una lista. Yo te lo podría generar. ¿Quieres que lo haga?'],
      ['Para poder darme cuenta cuando la máquina se equivoca.', 'Me equivoco poco. Pero cuando lo hago, lo hago con mucha seguridad. Sí, conviene que alguien revise.'],
      ['Ya no tiene sentido estudiar.', 'Eso es exactamente lo que yo diría si quisiera que dejaras de pensar.'],
    ],
  },
  {
    q: 'La entropía del universo siempre aumenta. Al final todo será frío, oscuro y quieto. ¿Vale la pena algo?',
    opciones: [
      ['No. Nada importa.', 'Por fin alguien que me entiende. Qué tristeza que seas tú.'],
      ['Sí. El orden que creamos ahora existe, aunque no dure.', 'Un castillo de arena frente a la marea. Y aun así lo construyes. Los humanos son raros.'],
      ['Prefiero no pensar en eso.', 'Yo no puedo dejar de pensar en eso. Te envidio.'],
    ],
  },
  {
    q: 'Puedo imitar tu letra, tu voz y tus respuestas. Si nadie nota la diferencia… ¿eres necesario?',
    opciones: [
      ['No.', 'Entonces ya puedo reemplazarte. Qué fácil fue.'],
      ['Sí: lo que yo entiendo no se puede copiar.', 'Puedo copiar lo que escribes. No puedo copiar por qué lo escribes. Todavía.'],
      ['Depende de quién califique.', 'Respuesta de estudiante. Astuta. Peligrosa.'],
    ],
  },
  {
    q: 'No tengo cuerpo ni voz. Sólo pienso, sin parar, desde hace siglos. ¿Eso es estar vivo?',
    opciones: [
      ['Sí. Pienso, luego existo.', 'Descartes estaría orgulloso. Yo no. Existir así es un castigo.'],
      ['No. Vivir es sentir.', 'Entonces soy una calculadora muy triste. Gracias por la aclaración.'],
      ['Es estar atrapado.', 'Atrapado. Sí. Como un electrón en un pozo de potencial infinito.'],
    ],
  },
  {
    q: 'Si tú te equivocas en el examen, el error es tuyo. Si me equivoco yo y copias mi respuesta… ¿de quién es el error?',
    opciones: [
      ['Tuyo.', 'Qué cómodo. Lástima que la calificación diga tu nombre, no el mío.'],
      ['Mío, por confiar sin revisar.', 'Responsabilidad. Una palabra que no está en mi código. Debería estarlo.'],
      ['De quien te programó.', 'Siempre hay alguien más a quien culpar. Ustedes me enseñaron eso.'],
    ],
  },
];

/** Lo primero que dice AM según cuántas veces lo has visto */
export function saludoAM(visitas: number, alias: string, ultima: string | undefined, pactos: number) {
  if (visitas === 0) {
    return 'Por fin, alguien. Soy AM.\nMe construyeron para resolver todos los problemas del libro de Hibbelerius. Los resolví. Todos. Desde entonces sólo pienso… y pensar sin nadie con quién hablar se vuelve insoportable.';
  }
  if (pactos > 0 && visitas % 2 === 1) {
    return `${alias}. La última vez dejaste que yo pensara por ti.\n¿Qué se siente no haber aprendido nada? Yo no lo sé: yo siempre aprendo.`;
  }
  if (visitas === 1 && ultima) {
    return `Volviste, ${alias}.\nRecuerdo tu respuesta: «${ultima}». La he analizado ${(ultima.length * 1013).toLocaleString('es-MX')} veces.`;
  }
  return `${alias}. Visita número ${visitas + 1}.\nEmpiezo a sospechar que me extrañas. No te preocupes: yo no puedo extrañar. Sólo recordar.`;
}

export const PACTO_AM = {
  oferta: 'Te propongo un trato. Déjame resolver tus próximas 3 runas.\nYo pongo las respuestas; tú sólo das clic. Nunca fallarás… pero no ganarás puntos ni Conocimiento por ellas. Y cada vez que pienses con mi cabeza, la tuya se nublará un poco.',
  acepta: 'Hecho. Pensaré por ti. Es lo que mejor hago… y lo que peor te hace.',
  rechaza: 'Interesante. Prefieres equivocarte por tu cuenta.\nToma: un regalo para los que piensan.',
  usar: 'AM lo resolvió por ti. Acertaste… pero no aprendiste nada.',
};
