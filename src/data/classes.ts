export interface ClassDef {
  id: string;
  name: string;
  available: boolean;
  concept: string;
  desc: string;
  hp: number;
  energy: number;
}

export const CLASSES: ClassDef[] = [
  { id: 'caballero', name: 'Caballero de la Masa', available: true, concept: 'Leyes de Newton', hp: 70, energy: 3,
    desc: 'Armas pesadas y golpes calculados con F = m·a. Domina la inercia y la reacción.' },
  { id: 'arcanista', name: 'Arcanista Cinético', available: true, concept: 'Energía cinética', hp: 48, energy: 3,
    desc: 'Acumula rapidez (máx. 8 m/s) y la libera: K = ½mv². Doble rapidez, cuádruple daño… pero es frágil.' },
  { id: 'penitente', name: 'Penitente del Empuje', available: true, concept: 'Masa variable', hp: 80, energy: 3,
    desc: 'Quema su propia masa (su vida) para acelerar: Δv = vₑ·ln(m₀/m). Esquiva en vez de bloquear.' },
  // v0.78 · Cuarto personaje, propuesto por un alumno (NullThinker). Se desbloquea al terminar los 2 tramos del Abismo.
  { id: 'espectro', name: 'Espectro de la Energía', available: true, concept: 'Trabajo y energía', hp: 62, energy: 3,
    desc: 'Una armadura vacía. Canaliza formas de energía y absorbe la mitad de cada golpe para liberarla después.' },
];
