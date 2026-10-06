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
  // Cuarto personaje: lo propondrán los alumnos (formulario de retroalimentación)
  { id: 'misterio', name: '¿?', available: false, concept: 'Tú lo diseñas', hp: 0, energy: 3,
    desc: '¿Qué física debería dominar el próximo héroe? Déjanos tu idea en el formulario.' },
];
