// ════════════════════════════════════════════════════════════════
//  v0.71 · PACTOS DEL MYTHOS (El Abismo de los Ejes)
//  · Altares de sacrificio: un Primigenio te pide 2 cartas o tu sangre
//    (src/scenes/Sacrificio.ts).
//  · El Hombre Negro (Nyarlathotep): personaje recurrente, como AM en el
//    modo normal. Recuerda cuántas veces lo has visto y qué le contestaste,
//    y te ofrece ayuda… con un costo (src/scenes/Nyarlathotep.ts).
//  · El Demonio de Maxwell quita maldiciones (src/scenes/Maxwell.ts).
// ════════════════════════════════════════════════════════════════

/** Vida que quita fallar una pregunta en el Abismo (además de la Cordura) */
export const RUNA_DANO_ABISMO = 5;
/** Locura que sube cada vez que el Hombre Negro piensa por ti */
export const NYAR_ENTROPIA = 6;
/** Preguntas que el Hombre Negro resuelve por ti si aceptas su pacto */
export const NYAR_PACTO_RUNAS = 3;
/** Probabilidades en un nodo «?» */
export const NYAR_CHANCE = 0.22; // el Hombre Negro (máx. una vez por tramo, desde el piso 2)
export const SACRIFICIO_CHANCE = 0.2; // un altar del mythos (El Abismo)
export const MAXWELL_CHANCE = 0.1; // el Demonio de Maxwell (más si cargas maldiciones)
export const MAXWELL_CHANCE_MALDITO = 0.35;
/** Vida máxima que pide un altar a cambio de una reliquia maldita */
export const SACRIFICIO_SANGRE = 8;

export interface AltarDef {
  id: string;
  titulo: string;
  quien: string; // el Primigenio que habla
  sprite: string; // textura (enemigo del Abismo)
  tinte: number;
  intro: string;
  acepta: string; // lo que dice al recibir el sacrificio
  rechazo: string; // lo que dice si te niegas
}

export const ALTARES: AltarDef[] = [
  {
    id: 'shub', titulo: 'El Altar de los Mil Retoños', quien: 'Shub-Niggurath', sprite: 'shubNiggurath', tinte: 0x9ad070,
    intro: 'Un altar de raíces negras late como un corazón. Mil bocas pequeñas susurran a la vez: «La vida pide vida. Dame algo tuyo: lo que sabes… o lo que sangras.»',
    acepta: '«Crece… crece… lo que diste brotará de otra forma.»',
    rechazo: 'Las raíces se retiran despacio. Una se queda enredada en tu tobillo un rato más de lo necesario.',
  },
  {
    id: 'dagon', titulo: 'La Marea de Dagón', quien: 'Padre Dagón', sprite: 'dagon', tinte: 0x7ab8c8,
    intro: 'El agua negra sube hasta tus rodillas. Algo enorme respira bajo la superficie. «Todo lo que flota debe pagar su empuje. Ofrece algo… o hundiré tu barca.»',
    acepta: '«El mar devuelve lo que se le da. A su manera.»',
    rechazo: 'La marea baja. Cuando miras tus botas, están llenas de escamas.',
  },
  {
    id: 'yig', titulo: 'El Nido de Yig', quien: 'Yig, Padre de las Serpientes', sprite: 'yig', tinte: 0xc8b060,
    intro: 'Cientos de serpientes forman un círculo perfecto a tu alrededor. En el centro, una más grande levanta la cabeza. «Muda la piel, viajero. Deja algo atrás y te daré algo nuevo.»',
    acepta: '«Así se crece: dejando la piel vieja.»',
    rechazo: 'Las serpientes se abren para dejarte pasar. Todas te siguen con la mirada.',
  },
];

/** Lo que dice el Hombre Negro según cuántas veces lo has visto (la última se repite al azar) */
export const NYAR_SALUDOS: string[] = [
  '«Ah, un estudiante. Yo también enseño, ¿sabes? A los faraones les enseñé a construir pirámides. Mira cómo terminaron.»',
  '«Otra vez tú. Me alegra. Las otras caras que uso se aburren de esperar.»',
  '«Tres veces. Ya casi somos amigos. Los amigos se ayudan… y luego se cobran.»',
  '«Siempre bajas un poco más. Me gusta verte caer… quiero decir, avanzar.»',
];
/** Lo que dice si la última vez lo rechazaste */
export const NYAR_RECHAZADO = '«La última vez no quisiste nada de mí. Qué orgullo tan humano. A ver si hoy aguanta.»';
