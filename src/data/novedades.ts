// ════════════════════════════════════════════════════════════════
//  NOVEDADES · lo que se le avisa al alumno cuando entra después de
//  una actualización. Es el CHANGELOG contado en corto y sin tecnicismos:
//  el historial completo para quien programa sigue en CHANGELOG.md.
//
//  CÓMO AGREGAR UNA VERSIÓN
//  1. Pon la entrada nueva ARRIBA de la lista (lo más reciente primero).
//  2. Su `v` debe ser igual al VERSION_NUM de `src/config.ts`; si no coincide,
//     el aviso no se muestra.
//  3. De 3 a 6 puntos, cortos y en segunda persona («ya puedes…», «ahora…»).
//     Los `**negritas**` resaltan en dorado.
//  Al entrar al menú, el juego muestra en grande todo lo que el alumno no
//  haya visto y guarda la versión; después queda en «★ Novedades».
// ════════════════════════════════════════════════════════════════

export interface Novedad {
  v: string; // igual al VERSION_NUM de config.ts
  titulo: string;
  puntos: string[];
}

export const NOVEDADES: Novedad[] = [
  {
    v: '0.87.0',
    titulo: 'Cada personaje, lo suyo',
    puntos: [
      '**El juego estaba cargado al Caballero de la Masa.** Me lo dijeron ustedes y tenían razón: las reliquias y los dones estaban hechos para sus kilogramos. Esto es el arreglo.',
      '**6 reliquias nuevas que sólo le salen a su personaje.** Arcanista: Rueda de Maxwell y Casco del Túnel de Viento. Penitente: Tobera de Laval y Tanque de Lastre. Espectro: Bobina de Inducción y Dinamo de Mano.',
      '**7 cartas nuevas.** El Penitente tenía una sola Defensa y ahora tiene tres (Maniobra Evasiva, Escudo Ablativo y Expulsión de Masa). El Arcanista estrena Fricción Controlada y Choque Inelástico, que le quita al enemigo el impulso que lleva acumulado. El Espectro, Trabajo Oblicuo y Pozo de Potencial.',
      '**Los dones de los ecos ya le sirven a los cuatro.** Un don de «+1 kg» se vuelve rapidez si peleas con ½mv² o con p = m·v. Vis Viva ahora también mejora al Penitente y al Espectro, y los dones de aceleración de +1 ya no se perdían en el camino.',
      '**Puedes elegir la gravedad al bajar al Abismo.** Multiplica la vida y el daño de lo que encuentres… y también tu puntaje en el ranking.',
      '**El Grimorio se puede filtrar por personaje.** Y los puntajes grandes ya se leen con prefijos del SI: 1.2 G en lugar de 1,200,000,000.',
    ],
  },
  {
    v: '0.86.0',
    titulo: 'Sin topes en el Abismo',
    puntos: [
      'En el Abismo **ningún personaje se topa**: la rapidez del Arcanista pasa de 8 m/s, la del Penitente de 14 y la Energía Absorbida del Espectro de 40.',
      'El portal del Abismo y «Nueva expedición» **avisan antes de abandonar** una partida en curso.',
      'El ranking muestra una columna con tu **porcentaje de aciertos**.',
    ],
  },
  {
    v: '0.85.0',
    titulo: 'Más preguntas y la Carrera de R\'lyeh',
    puntos: [
      '**24 preguntas nuevas de cuerpo rígido**: centroide, centro de masa, momento de inercia, ejes paralelos y radio de giro.',
      '**6 problemas nuevos** donde escribes el número, con datos distintos cada vez.',
      '2 minijuegos en el Gabinete: **la Carrera de R\'lyeh** (quién rueda más rápido por la rampa) y **la Balanza del Ídolo** (ΣM = 0).',
    ],
  },
  {
    v: '0.84.0',
    titulo: 'Altares filosóficos',
    puntos: [
      '**6 altares filosóficos** en los «?» del Abismo, con una historia del mythos, una pregunta y tres posturas. Ninguna es la correcta: cada una tiene su recompensa y su costo.',
      'Azathoth y el sinsentido, la Gran Raza y la identidad, el Carro de Nodens y la verdad incómoda, el sueño de Zhuangzi, la Llave de Plata y la ventana de Arkham.',
    ],
  },
  {
    v: '0.83.0',
    titulo: 'Reliquias del Abismo',
    puntos: [
      '**10 reliquias que sólo salen en el Abismo**, de cuerpo rígido y del mythos: la Plomada de Montemayor, el Girocompás, la Llave de los Ejes Paralelos, la Regla de Pappus y el Corazón de Shoggoth, entre otras.',
    ],
  },
  {
    v: '0.82.0',
    titulo: 'Cartas de cada personaje',
    puntos: [
      'Cada personaje tiene **su propio juego de cartas** en el Abismo, hecho para su física.',
      'Las cartas raras que dan los relatos y los pactos ya no son de otro personaje.',
    ],
  },
];

/** La versión que el aviso grande debe mostrar (la más reciente de la lista) */
export const ULTIMA_NOVEDAD = NOVEDADES[0]?.v ?? '';

/**
 * Versiones que el alumno no ha visto todavía.
 * `visto` es el VERSION_NUM que vio la última vez (undefined = nunca ha visto ninguna).
 *  · Quien entra por primera vez NO recibe el aviso: para él todo es nuevo.
 *  · Quien ya jugaba antes de que existieran los avisos ve sólo la versión más
 *    reciente, no seis pantallas de historia vieja.
 */
export function novedadesPendientes(visto: string | undefined, primeraVez: boolean): Novedad[] {
  if (primeraVez || !NOVEDADES.length) return [];
  if (!visto) return [NOVEDADES[0]];
  return NOVEDADES.filter((n) => comparaVersion(n.v, visto) > 0);
}

/** Compara «0.87.0» con «0.9.0» por número, no por texto (−1, 0, 1) */
export function comparaVersion(a: string, b: string) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}
