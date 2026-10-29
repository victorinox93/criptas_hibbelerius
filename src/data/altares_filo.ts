// ════════════════════════════════════════════════════════════════
//  v0.84 · ALTARES FILOSÓFICOS (nodo «?» del Abismo)
//  Un altar con una historia corta del mythos y una pregunta sobre la
//  locura, el conocimiento, la identidad o los sueños. No hay respuesta
//  «correcta»: cada postura tiene su recompensa y su costo, y el altar
//  cierra con una reflexión. Escena: src/scenes/AltarFilo.ts.
// ════════════════════════════════════════════════════════════════

/** Probabilidad de un altar filosófico en un «?» del Abismo (cada uno, una vez por expedición) */
export const ALTAR_FILO_CHANCE = 0.22;

export type EfectoAltar =
  | { t: 'locura'; n: number } // + sube la Locura, − la baja
  | { t: 'ergios'; n: number }
  | { t: 'vidaMax'; n: number }
  | { t: 'curar'; frac: number } // fracción de la Vida máxima
  | { t: 'mejorar'; n: number } // mejora N cartas al azar
  | { t: 'rara' } // una carta rara del Abismo
  | { t: 'reliquia' } // una reliquia del Abismo
  | { t: 'diente' } // un diente raro
  | { t: 'maldicion' }
  | { t: 'quitar' } // eliges una carta para quitar
  | { t: 'olvidar' }; // pierdes una carta al azar

export interface OpcionAltar {
  texto: string;
  efectos: EfectoAltar[];
  responde: string; // lo que contesta la figura del altar
}

export interface AltarFiloDef {
  id: string;
  titulo: string;
  quien: string;
  sprite: string;
  escala: number;
  tinte: number;
  historia: string;
  pregunta: string;
  opciones: [OpcionAltar, OpcionAltar, OpcionAltar];
  reflexion: string;
}

export const ALTARES_FILO: AltarFiloDef[] = [
  {
    id: 'azathoth', titulo: 'El Trono del Sultán Ciego', quien: 'Azathoth', sprite: 'atomoAzathoth', escala: 5, tinte: 0xe070d0,
    historia: 'En el centro de todo, más allá del espacio y del tiempo, un dios ciego e idiota burbujea al son de flautas que nadie toca. Dicen que el universo entero es su sueño… y que no sabe que existes.',
    pregunta: '«Si el universo no tiene ningún propósito… ¿vale la pena lo que haces?»',
    opciones: [
      { texto: 'No. Nada importa: hago lo que me conviene.', efectos: [{ t: 'rara' }, { t: 'locura', n: 12 }], responde: 'Las flautas suben de volumen. Algo en el caos se ríe contigo… o de ti.' },
      { texto: 'Sí. El sentido no viene del universo: lo pongo yo.', efectos: [{ t: 'locura', n: -12 }, { t: 'mejorar', n: 2 }], responde: 'Por un instante las flautas se callan, como si el caos te hubiera escuchado.' },
      { texto: 'No lo sé, y está bien no saberlo.', efectos: [{ t: 'locura', n: -5 }, { t: 'ergios', n: 25 }], responde: 'El burbujeo sigue igual. Tú también.' },
    ],
    reflexion: 'Lovecraft imaginó un cosmos indiferente a los humanos («cosmicismo»). Albert Camus pensaba que, aunque la roca de Sísifo siempre vuelva a caer, empujarla puede tener sentido.',
  },
  {
    id: 'yith', titulo: 'La Biblioteca de la Gran Raza', quien: 'Un archivista de Yith', sprite: 'yithiano', escala: 3.4, tinte: 0x9ad070,
    historia: 'La Gran Raza de Yith viaja por el tiempo cambiando de mente con otros seres. Durante años, alguien más vive en su cuerpo mientras ellos estudian el pasado. Este archivista lleva siglos en un cuerpo que no es el suyo.',
    pregunta: '«Si alguien viviera tu vida con tu cuerpo y con todos tus recuerdos… ¿seguiría siendo tú?»',
    opciones: [
      { texto: 'Sí: yo soy mis recuerdos.', efectos: [{ t: 'mejorar', n: 1 }, { t: 'ergios', n: 20 }], responde: '«Entonces guarda bien tus recuerdos. Son lo único que viaja contigo.»' },
      { texto: 'No: soy lo que decido hacer ahora.', efectos: [{ t: 'quitar' }, { t: 'locura', n: -5 }], responde: '«Interesante. Ninguna mente que he ocupado decidía igual que su dueño.»' },
      { texto: 'Soy mi cuerpo: lo demás es prestado.', efectos: [{ t: 'vidaMax', n: 6 }, { t: 'locura', n: 5 }], responde: 'El cono se inclina. Te parece ver tu propia cara en su superficie.' },
    ],
    reflexion: 'John Locke pensaba que la identidad está en la memoria; otros filósofos, en la continuidad del cuerpo o en el carácter. La pregunta del barco de Teseo sigue abierta.',
  },
  {
    id: 'nodens', titulo: 'El Carro de Nodens', quien: 'Nodens, Señor del Gran Abismo', sprite: 'nodens', escala: 3.4, tinte: 0x9ad8f0,
    historia: 'Sobre una concha enorme tirada por delfines llega un anciano de barba gris. Es uno de los pocos dioses del Abismo que a veces ayuda a los humanos. Te ofrece ver, por un momento, cómo es realmente el lugar donde estás.',
    pregunta: '«¿Prefieres una verdad que te duela… o una mentira que te proteja?»',
    opciones: [
      { texto: 'La verdad, aunque duela.', efectos: [{ t: 'reliquia' }, { t: 'locura', n: 15 }], responde: 'Ves el Abismo como es. No lo vas a olvidar. Nodens te da algo para cargar con ello.' },
      { texto: 'La mentira, si me deja dormir.', efectos: [{ t: 'locura', n: -15 }, { t: 'maldicion' }], responde: '«Duerme, pues.» Pero las mentiras pesan: algo se queda contigo.' },
      { texto: 'Una verdad, dicha con cuidado.', efectos: [{ t: 'locura', n: -5 }, { t: 'curar', frac: 0.3 }], responde: 'Nodens sonríe. Te enseña sólo lo que puedes cargar hoy.' },
    ],
    reflexion: '«La llamada de Cthulhu» empieza diciendo que lo más misericordioso del mundo es que la mente humana no pueda unir todo lo que sabe. ¿Tú estás de acuerdo?',
  },
  {
    id: 'sonador', titulo: 'El Altar del Soñador', quien: 'Lo que vino de la Corona Boreal', sprite: 'sombraHypnos', escala: 4, tinte: 0xc8a8ff,
    historia: 'En «Hypnos», dos amigos aprenden a viajar por sueños cada vez más profundos, hasta que ya no saben de qué lado están. La sombra coronada te muestra tu propia cama, vacía, en algún lugar muy lejos de aquí.',
    pregunta: '«Si toda esta vida fuera un sueño… ¿cambiaría lo que haces?»',
    opciones: [
      { texto: 'Sí: en un sueño todo vale.', efectos: [{ t: 'ergios', n: 40 }, { t: 'locura', n: 10 }], responde: 'Los Ergios que tomas brillan un poco raro. Como si no fueran del todo reales.' },
      { texto: 'No: si lo estoy viviendo, me importa.', efectos: [{ t: 'locura', n: -10 }, { t: 'vidaMax', n: 4 }], responde: 'La sombra se aparta. Por primera vez en un rato, te sientes despierto.' },
      { texto: 'De todos modos despertaré: aprovecho el sueño.', efectos: [{ t: 'mejorar', n: 2 }, { t: 'locura', n: 5 }], responde: 'Siete estrellas se encienden sobre tus cartas.' },
    ],
    reflexion: 'El filósofo chino Zhuangzi soñó que era una mariposa. Al despertar no supo si era un hombre que había soñado ser mariposa o una mariposa que soñaba ser hombre.',
  },
  {
    id: 'carter', titulo: 'La Llave de Plata', quien: 'La llave de Randolph Carter', sprite: 'llavePlata', escala: 4, tinte: 0xe8ecf4,
    historia: 'En «La llave de plata» (1929), Randolph Carter, cansado de un mundo que perdió su maravilla, usa una llave antigua para volver a ser el niño que fue. La llave flota frente a ti. Al tocarla, hueles el jardín de la casa de tu infancia.',
    pregunta: '«Si pudieras volver a ser niño para siempre… ¿lo harías?»',
    opciones: [
      { texto: 'Sí: entonces todo era maravilla.', efectos: [{ t: 'curar', frac: 1 }, { t: 'olvidar' }], responde: 'Te sientes ligero, como de ocho años. Al volver, notas que olvidaste algo que habías aprendido.' },
      { texto: 'No: lo que aprendí me costó mucho.', efectos: [{ t: 'vidaMax', n: 8 }, { t: 'mejorar', n: 1 }], responde: 'La llave se oxida un poco, satisfecha. Tus cicatrices también son tuyas.' },
      { texto: 'Me llevaría la maravilla, no la edad.', efectos: [{ t: 'locura', n: -10 }, { t: 'diente' }], responde: 'Te quedas con un diente de leche que no recordabas tener. Brilla.' },
    ],
    reflexion: 'La nostalgia consuela, pero no se puede vivir en ella. Crecer es perder algunas maravillas y ganar otras.',
  },
  {
    id: 'arkham', titulo: 'La Ventana del Sanatorio de Arkham', quien: 'Alguien detrás de los barrotes', sprite: 'arkham', escala: 3.6, tinte: 0xff4a6a,
    historia: 'Muchos personajes de Lovecraft terminan en el sanatorio de Arkham, después de ver algo que nadie más vio. Desde una ventana con barrotes, un ojo te sigue. Una voz tranquila te pregunta algo.',
    pregunta: '«¿La locura es ver lo que otros no ven… o dejar de ver lo que todos ven?»',
    opciones: [
      { texto: 'Ver lo que otros no ven.', efectos: [{ t: 'rara' }, { t: 'locura', n: 10 }], responde: '«Entonces tú también ves.» La voz te pasa algo entre los barrotes.' },
      { texto: 'Dejar de ver lo que todos ven.', efectos: [{ t: 'locura', n: -8 }, { t: 'vidaMax', n: 4 }], responde: '«Mira bien, entonces. Y no dejes de mirar.»' },
      { texto: 'Es sufrir sin que nadie te escuche.', efectos: [{ t: 'locura', n: -15 }, { t: 'curar', frac: 0.2 }], responde: 'El ojo se cierra despacio. «Gracias por escuchar.» La ventana queda en silencio.' },
    ],
    reflexion: 'En los cuentos, quien vio el horror lo carga solo. En la vida real, contarle a alguien de confianza lo que te pesa hace la carga más ligera. La salud mental también es salud.',
  },
];

/** Texto corto de un efecto (para el botón) */
export function textoEfecto(e: EfectoAltar): string {
  switch (e.t) {
    case 'locura': return e.n > 0 ? `+${e.n} Locura` : `${e.n} Locura`;
    case 'ergios': return `+${e.n} Ergios`;
    case 'vidaMax': return `+${e.n} Vida máx.`;
    case 'curar': return e.frac >= 1 ? 'Te curas todo' : `Te curas ${Math.round(e.frac * 100)} %`;
    case 'mejorar': return e.n > 1 ? `Mejora ${e.n} cartas` : 'Mejora 1 carta';
    case 'rara': return 'Una carta rara';
    case 'reliquia': return 'Una reliquia del Abismo';
    case 'diente': return 'Un diente raro';
    case 'maldicion': return 'Una maldición';
    case 'quitar': return 'Quitas 1 carta';
    case 'olvidar': return 'Olvidas 1 carta al azar';
  }
}
