// ════════════════════════════════════════════════════════════════
//  PUNTAJE estilo «shoot 'em up»: cada acción suma puntos y al final
//  hay bonos por lo que te queda. Todo se multiplica por la gravedad
//  (Tierra ×1, Neptuno ×1.5, Júpiter ×2). Cambia aquí los valores.
//  En la pantalla final, pasa el cursor sobre el puntaje para ver el desglose.
// ════════════════════════════════════════════════════════════════
import { gravityOf } from './gravity';

export const PUNTOS = {
  porVidaEnemigo: 10, // cada enemigo derrotado da (su vida máxima × 10)
  eliteMul: 1.5, // … ×1.5 si es élite
  jefeMul: 2, // … ×2 si es jefe
  combatePerfecto: 500, // ganar un combate sin perder vida
  elitePerfecta: 1000, // ganar contra una élite o jefe sin perder vida
  runa: 300, // pregunta correcta (×racha)
  rachaPaso: 0.25, // cada acierto seguido suma ×0.25 al multiplicador…
  rachaMax: 2, // … hasta ×2
  pista: -100, // usar una pista
  acto: 2000, // superar un acto (×número de acto)
  dilema: 10,
  alma: 500, // ganarte a un alma en pena como aliado // los puntos de un dilema se multiplican por esto
  // bonos finales
  vidaFinal: 20, // por cada punto de vida que te quede
  vidaExtra: 3000, // si no usaste la Vida Extra del Profesor
  pocion: 200, // por cada poción sin usar
  ergio: 5, // por cada Ergio que te quede
  victoria: 10000, // vencer a Hibbelerius
};

/** Jefes (para el multiplicador) */
export const JEFES = ['colossus', 'bruja', 'hibbelerius',
  // El Abismo (v0.41): jefes de tramo y Primigenios
  'geometra', 'dagon', 'colorCielo', 'bailarina', 'dunwich', 'nyarlathotep', 'cthulhu', 'yogSothoth', 'hastur',
  // v0.51 · Las Tierras del Sueño
  'yig', 'cincoCabezas', 'shubNiggurath', 'bokrug', 'calculadora'];

interface RunLike {
  score: number;
  gravity: number;
  desglose?: Record<string, number>;
}

/** Suma puntos (ya multiplicados por la gravedad) y los anota en el desglose */
export function sumar(run: RunLike, concepto: string, n: number) {
  const pts = Math.round(n * gravityOf(run.gravity).scoreMul);
  run.score = Math.max(0, run.score + pts);
  const d = (run.desglose ??= {});
  d[concepto] = (d[concepto] ?? 0) + pts;
  return pts;
}

/** Multiplicador por racha de aciertos seguidos */
export function multRacha(racha: number) {
  return Math.min(PUNTOS.rachaMax, 1 + PUNTOS.rachaPaso * Math.max(0, racha - 1));
}

/**
 * v0.87 · Formato corto de puntajes, con PREFIJOS DEL SI.
 *
 * En el infinito del Abismo la vida de los enemigos crece exponencialmente y
 * los puntajes llegan a trece dígitos: 1,204,573,900,000 no se lee ni se
 * compara. Se usan los prefijos del SI (k, M, G, T, P) en lugar de «billones»,
 * que además significa distinto en español y en inglés —y, siendo un curso de
 * física, son los que los alumnos ya conocen.
 *
 *   999 → 999        ·  12 340 → 12,340   ·  128 400 → 128 k
 *   1 204 000 → 1.20 M  ·  1.2e9 → 1.20 G  ·  1.2e12 → 1.20 T
 *
 * Hasta 100 000 se escribe completo, para que los puntajes de una expedición
 * normal se sigan viendo exactos.
 */
const PREFIJOS: [number, string][] = [[1e15, 'P'], [1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k']];

export function fmtPuntos(n: number) {
  const neg = n < 0 ? '−' : '';
  const a = Math.abs(Math.round(n));
  if (a < 100000) return neg + a.toLocaleString('es-MX');
  for (const [escala, p] of PREFIJOS) {
    // el 0.9995 evita «1000 k»: 999 999 ya se muestra como 1.00 M
    if (a < escala * 0.9995) continue;
    const v = a / escala;
    // 3 cifras significativas: 1.20 G, 12.3 G, 123 G
    const dec = v < 10 ? 2 : v < 100 ? 1 : 0;
    return `${neg}${v.toFixed(dec)} ${p}`;
  }
  return neg + a.toLocaleString('es-MX');
}

/** El número completo, con separadores de miles (para donde sí quepa) */
export const fmtPuntosExacto = (n: number) => Math.round(n).toLocaleString('es-MX');

interface RunFinal extends RunLike {
  hp: number;
  ergios: number;
  relics: string[];
  pociones?: string[];
  finalizado?: boolean;
}

/** Bonos al terminar la expedición (se aplican una sola vez) */
export function bonosFinales(run: RunFinal) {
  if (run.finalizado) return;
  run.finalizado = true;
  if (run.hp > 0) sumar(run, 'Bono: vida restante', run.hp * PUNTOS.vidaFinal);
  if (run.relics.includes('vidaExtra')) sumar(run, 'Bono: vida extra sin usar', PUNTOS.vidaExtra);
  const p = (run.pociones ?? []).filter(Boolean).length;
  if (p) sumar(run, 'Bono: pociones sin usar', p * PUNTOS.pocion);
  if (run.ergios > 0) sumar(run, 'Bono: Ergios guardados', run.ergios * PUNTOS.ergio);
}
