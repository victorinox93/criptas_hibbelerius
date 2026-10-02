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
  { id: 'arcanista', name: 'Arcanista Cinético', available: false, concept: 'Energía cinética', hp: 55, energy: 3,
    desc: 'Acumula velocidad y la libera: K = ½mv². Doble rapidez, cuádruple daño.' },
  { id: 'explorador', name: 'Explorador de Alturas', available: false, concept: 'Energía potencial', hp: 60, energy: 3,
    desc: 'Escala, almacena mgh y conviértela en caídas devastadoras.' },
  { id: 'guardian', name: 'Guardián del Equilibrio', available: false, concept: 'Trabajo y equilibrio', hp: 80, energy: 3,
    desc: 'ΣF = 0. Contrarresta, refleja y convierte el trabajo enemigo en tuyo.' },
];
