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
export const JEFES = ['colossus', 'bruja', 'hibbelerius'];

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

/** Formato corto para la barra superior: 12,340 → 12.3k */
export function fmtPuntos(n: number) {
  return n >= 100000 ? `${Math.round(n / 1000)}k` : n.toLocaleString('es-MX');
}

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
