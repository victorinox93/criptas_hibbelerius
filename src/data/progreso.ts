// ════════════════════════════════════════════════════════════════
//  PROGRESO ENTRE EXPEDICIONES (como en Slay the Spire)
//  Cada expedición da puntos de CONOCIMIENTO (ganes o pierdas). Al subir
//  de nivel se desbloquean cartas, pociones y cosméticos nuevos.
//  - Una carta con  lock: 3  (src/data/cards.ts) sólo sale desde el nivel 3.
//  - Igual para pociones (src/data/pociones.ts) y colores (src/art/palette.ts).
// ════════════════════════════════════════════════════════════════

/**
 * Conocimiento acumulado necesario para cada nivel (índice 0 = nivel 1).
 * v0.22: la curva es el doble de larga que la original (NIVELES_V1) para que los
 * desbloqueos se repartan en más expediciones (≈ 9 victorias para el nivel 10).
 * Quien ya tenía un nivel con la curva vieja lo conserva (Codex.nivelPiso).
 */
export const NIVELES = [0, 60, 160, 300, 480, 700, 960, 1280, 1640, 2000];
/** Curva original (hasta v0.21), sólo para respetar el nivel que ya tenían los alumnos */
export const NIVELES_V1 = [0, 30, 80, 150, 240, 350, 480, 640, 820, 1000];

export function nivelDeV1(xp = 0): number {
  let n = 1;
  for (let i = 0; i < NIVELES_V1.length; i++) if (xp >= NIVELES_V1[i]) n = i + 1;
  return n;
}

export function nivelDe(xp = 0): number {
  let n = 1;
  for (let i = 0; i < NIVELES.length; i++) if (xp >= NIVELES[i]) n = i + 1;
  return n;
}

/** Conocimiento para el siguiente nivel (o null si ya es el máximo). `nivel` = nivel efectivo si ya se conoce. */
export function siguienteNivel(xp = 0, nivel?: number): number | null {
  const n = nivel ?? nivelDe(xp);
  return n < NIVELES.length ? NIVELES[n] : null;
}

/** Conocimiento ganado en una expedición */
export function conocimientoGanado(r: { pisos: number; runasOk: number; elites: number; victoria: boolean; actos: number }) {
  return r.pisos * 2 + r.runasOk * 3 + r.elites * 5 + (r.actos - 1) * 15 + (r.victoria ? 40 : 0);
}

export interface Desbloqueo {
  nivel: number;
  tipo: 'Carta' | 'Poción' | 'Cosmético';
  nombre: string;
  detalle: string;
}

/** Lo que se desbloquea en cada nivel (sólo informativo: lo que bloquea de verdad es el campo lock) */
export const DESBLOQUEOS: Desbloqueo[] = [
  { nivel: 2, tipo: 'Carta', nombre: 'Apuntes del Profe', detalle: 'Neutral · roba 3 cartas' },
  { nivel: 2, tipo: 'Carta', nombre: 'Metabolismo Forzado', detalle: 'Caballero · vida → energía' },
  { nivel: 2, tipo: 'Carta', nombre: 'Postcombustión', detalle: 'Arcanista · vida → rapidez' },
  { nivel: 2, tipo: 'Poción', nombre: 'Tinta de Hibbelerius', detalle: 'roba 3 cartas' },
  { nivel: 2, tipo: 'Cosmético', nombre: 'Capa Ectoplasma', detalle: 'color de capa' },
  { nivel: 3, tipo: 'Carta', nombre: 'Café de Laboratorio', detalle: 'Neutral · +2 J y robas' },
  { nivel: 3, tipo: 'Carta', nombre: 'Torbellino de Acero', detalle: 'Caballero · gasta toda tu energía' },
  { nivel: 3, tipo: 'Carta', nombre: 'Órbita Cerrada', detalle: 'Arcanista · golpe automático cada turno' },
  { nivel: 3, tipo: 'Poción', nombre: 'Fuego Griego', detalle: 'Calor a todos' },
  { nivel: 3, tipo: 'Cosmético', nombre: 'Armadura Obsidiana Rúnica', detalle: 'armadura / ribete' },
  { nivel: 4, tipo: 'Carta', nombre: 'Entropía', detalle: 'Neutral · vida por energía cada turno' },
  { nivel: 4, tipo: 'Carta', nombre: 'Palanca de Arquímedes', detalle: 'Caballero · el siguiente ataque ×2' },
  { nivel: 4, tipo: 'Carta', nombre: 'Efecto Doppler', detalle: 'Arcanista · a todos si vas rápido' },
  { nivel: 4, tipo: 'Poción', nombre: 'Botella de Leyden', detalle: 'daño a todos' },
  { nivel: 5, tipo: 'Carta', nombre: 'Formulario', detalle: 'Neutral · robas 1 más cada turno' },
  { nivel: 5, tipo: 'Carta', nombre: 'Masa Inamovible', detalle: 'Caballero · la defensa te da masa' },
  { nivel: 5, tipo: 'Carta', nombre: 'Efecto Túnel', detalle: 'Arcanista · atraviesa el Bloqueo' },
  { nivel: 5, tipo: 'Poción', nombre: 'Gas Corrosivo', detalle: 'Fatiga a todos' },
  { nivel: 5, tipo: 'Cosmético', nombre: 'Capa Oro del Tomo', detalle: 'color de capa' },
  { nivel: 6, tipo: 'Carta', nombre: 'Resistencia del Material', detalle: 'Caballero · Bloqueo cada turno' },
  { nivel: 6, tipo: 'Carta', nombre: 'Singularidad', detalle: 'Arcanista · K enorme a todos' },
  { nivel: 6, tipo: 'Poción', nombre: 'Elixir Mayor', detalle: 'cura 30 y +5 vida máx.' },
  { nivel: 7, tipo: 'Cosmético', nombre: 'Brillo Fuego de Hibbelerius', detalle: 'visor / ojos' },
  { nivel: 8, tipo: 'Cosmético', nombre: 'Capa Pergamino Antiguo', detalle: 'color de capa' },
  { nivel: 9, tipo: 'Cosmético', nombre: 'Armadura Ébano del Archimago', detalle: 'armadura / ribete' },
  { nivel: 10, tipo: 'Cosmético', nombre: 'Capa del Archimago', detalle: 'color de capa' },
];
