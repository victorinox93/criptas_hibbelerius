import { G } from '../config';

// Problemas tipo Hibbeler con parámetros aleatorios.
export interface Problem {
  concept: string; // etiqueta para el registro docente
  title: string;
  prompt: string;
  unit: string;
  answer?: number; // numérico
  tol?: number; // tolerancia relativa
  choices?: string[]; // opción múltiple
  correct?: number; // índice correcto
  solution: string[];
}

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const f2 = (x: number) => Math.round(x * 100) / 100;
const rad = (d: number) => (d * Math.PI) / 180;

function shuffleChoices(choices: string[], correct: number) {
  const idx = choices.map((_, i) => i).sort(() => Math.random() - 0.5);
  return { choices: idx.map((i) => choices[i]), correct: idx.indexOf(correct) };
}

const GENERATORS: (() => Problem)[] = [
  // 2ª ley directa
  () => {
    const m = ri(3, 25), a = f2(ri(5, 40) / 10);
    return {
      concept: '2a ley', title: 'Runa de la Fuerza',
      prompt: `Un caballero empuja un cofre de ${m} kg sobre hielo sin fricción y le imprime una aceleración de ${a} m/s².\n¿Qué fuerza neta ejerce sobre el cofre?`,
      unit: 'N', answer: m * a, tol: 0.02,
      solution: ['ΣF = m·a', `ΣF = (${m} kg)(${a} m/s²)`, `ΣF = ${f2(m * a)} N`],
    };
  },
  // 2ª ley inversa
  () => {
    const m = ri(2, 20), F = ri(10, 120);
    return {
      concept: '2a ley', title: 'Runa de la Aceleración',
      prompt: `Una gárgola de ${m} kg recibe una fuerza neta horizontal de ${F} N.\n¿Cuál es la magnitud de su aceleración?`,
      unit: 'm/s²', answer: F / m, tol: 0.02,
      solution: ['a = ΣF / m', `a = ${F} N / ${m} kg`, `a = ${f2(F / m)} m/s²`],
    };
  },
  // Peso
  () => {
    const m = ri(5, 90);
    return {
      concept: 'Peso', title: 'Runa del Peso',
      prompt: `Un yunque maldito tiene una masa de ${m} kg.\n¿Cuál es su peso? (g = 9.81 m/s²)`,
      unit: 'N', answer: m * G, tol: 0.02,
      solution: ['W = m·g', `W = (${m} kg)(9.81 m/s²)`, `W = ${f2(m * G)} N`],
    };
  },
  // Fricción horizontal
  () => {
    const m = ri(5, 30), mu = pick([0.1, 0.15, 0.2, 0.25, 0.3]);
    const Fmin = Math.ceil(mu * m * G) + 5;
    const F = ri(Fmin, Fmin + 60);
    const a = (F - mu * m * G) / m;
    return {
      concept: 'Friccion', title: 'Runa del Lodo',
      prompt: `Arrastras un sarcófago de ${m} kg con una fuerza horizontal de ${F} N. El coeficiente de fricción cinética con el suelo es μk = ${mu}.\n¿Cuál es la aceleración del sarcófago? (g = 9.81 m/s²)`,
      unit: 'm/s²', answer: a, tol: 0.03,
      solution: [
        'N = m·g  (equilibrio vertical)',
        `Ff = μk·N = ${mu}·${m}·9.81 = ${f2(mu * m * G)} N`,
        'ΣFx = F − Ff = m·a',
        `a = (${F} − ${f2(mu * m * G)}) / ${m} = ${f2(a)} m/s²`,
      ],
    };
  },
  // Plano inclinado sin fricción
  () => {
    const th = pick([15, 20, 25, 30, 35, 40, 45]);
    const a = G * Math.sin(rad(th));
    return {
      concept: 'Plano inclinado', title: 'Runa de la Pendiente',
      prompt: `Una calavera resbala por una rampa de piedra lisa (sin fricción) inclinada ${th}° respecto a la horizontal.\n¿Cuál es su aceleración a lo largo de la rampa? (g = 9.81 m/s²)`,
      unit: 'm/s²', answer: a, tol: 0.02,
      solution: ['ΣF∥ = m·g·sinθ = m·a', 'a = g·sinθ', `a = 9.81·sin(${th}°) = ${f2(a)} m/s²`],
    };
  },
  // Plano con fricción
  () => {
    const th = pick([30, 35, 40, 45]), mu = pick([0.1, 0.2, 0.3]);
    const a = G * (Math.sin(rad(th)) - mu * Math.cos(rad(th)));
    return {
      concept: 'Plano inclinado', title: 'Runa de la Cuesta Áspera',
      prompt: `Un escudo de hierro se desliza hacia abajo por una rampa de ${th}° con μk = ${mu}.\n¿Cuál es su aceleración? (g = 9.81 m/s²)`,
      unit: 'm/s²', answer: a, tol: 0.03,
      solution: ['N = m·g·cosθ', 'ΣF∥ = m·g·sinθ − μk·m·g·cosθ = m·a', 'a = g(sinθ − μk·cosθ)', `a = 9.81(sin${th}° − ${mu}·cos${th}°) = ${f2(a)} m/s²`],
    };
  },
  // Máquina de Atwood
  () => {
    const m1 = ri(4, 12), m2 = ri(1, m1 - 1);
    const a = ((m1 - m2) * G) / (m1 + m2);
    return {
      concept: '2a ley (sistemas)', title: 'Runa de la Polea',
      prompt: `Sobre una polea ideal cuelgan dos jaulas: una de ${m1} kg y otra de ${m2} kg, unidas por una cuerda.\n¿Con qué aceleración se mueve el sistema? (g = 9.81 m/s²)`,
      unit: 'm/s²', answer: a, tol: 0.03,
      solution: ['Jaula pesada: m1·g − T = m1·a', 'Jaula ligera: T − m2·g = m2·a', 'Sumando: a = (m1 − m2)g / (m1 + m2)', `a = (${m1} − ${m2})·9.81 / ${m1 + m2} = ${f2(a)} m/s²`],
    };
  },
  // Elevador (normal)
  () => {
    const m = ri(50, 90), a = pick([1, 1.5, 2, 2.5]);
    const up = Math.random() < 0.5;
    const N = m * (G + (up ? a : -a));
    return {
      concept: 'Fuerza normal', title: 'Runa del Montacargas',
      prompt: `Un hechicero de ${m} kg viaja en una plataforma que ${up ? 'sube' : 'baja'} acelerando a ${a} m/s² (${up ? 'hacia arriba' : 'hacia abajo'}).\n¿Qué fuerza normal ejerce la plataforma sobre él? (g = 9.81 m/s²)`,
      unit: 'N', answer: N, tol: 0.02,
      solution: ['Tomando +↑: N − m·g = m·a', `N = m(g ${up ? '+' : '−'} a)`, `N = ${m}(9.81 ${up ? '+' : '−'} ${a}) = ${f2(N)} N`],
    };
  },
  // 1ª ley conceptual
  () => {
    const s = shuffleChoices(
      [
        'Seguirá moviéndose en línea recta con velocidad constante.',
        'Se detendrá poco a poco porque se le acaba la fuerza.',
        'Se acelerará porque ya no hay nada que lo frene.',
        'Caerá inmediatamente hacia el piso del vacío.',
      ], 0);
    return {
      concept: '1a ley', title: 'Runa de la Inercia',
      prompt: 'En el vacío del Abismo (sin gravedad ni fricción) lanzas una piedra. Una vez que sale de tu mano, ¿qué hace?',
      unit: '', ...s,
      solution: ['Primera ley: si ΣF = 0, la velocidad no cambia.', 'No se necesita fuerza para mantener el movimiento, sólo para cambiarlo.'],
    };
  },
  // 3ª ley conceptual
  () => {
    const s = shuffleChoices(
      [
        'Ambos sienten fuerzas de igual magnitud y sentido opuesto.',
        'El gólem siente más fuerza porque es más pesado.',
        'El caballero siente más fuerza porque es quien empuja.',
        'Sólo el gólem siente fuerza; el caballero no.',
      ], 0);
    return {
      concept: '3a ley', title: 'Runa del Eco',
      prompt: 'Un caballero de 80 kg empuja a un gólem de 800 kg. ¿Qué afirmación es correcta sobre las fuerzas entre ellos?',
      unit: '', ...s,
      solution: ['Tercera ley: F(caballero→gólem) = −F(gólem→caballero).', 'Las aceleraciones sí son distintas (a = F/m), pero las fuerzas son iguales.'],
    };
  },
  // 2ª ley conceptual con masa
  () => {
    const s = shuffleChoices(
      [
        'La mitad: a = F/m, si m se duplica a se reduce a la mitad.',
        'El doble, porque hay más masa.',
        'La misma, la masa no influye.',
        'Una cuarta parte.',
      ], 0);
    return {
      concept: '2a ley', title: 'Runa de la Carga',
      prompt: 'Aplicas la misma fuerza neta a un carro vacío y luego al mismo carro con el doble de masa. ¿Qué aceleración tiene el carro cargado comparada con la del vacío?',
      unit: '', ...s,
      solution: ['a = ΣF / m', 'Con 2m: a\' = ΣF / (2m) = a/2'],
    };
  },
];

export function randomProblem(): Problem {
  return pick(GENERATORS)();
}

export function checkAnswer(p: Problem, value: number | string): boolean {
  if (p.choices) return Number(value) === p.correct;
  const v = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (!isFinite(v) || p.answer === undefined) return false;
  const tol = Math.max(Math.abs(p.answer) * (p.tol ?? 0.02), 0.02);
  return Math.abs(v - p.answer) <= tol;
}
