import { G } from '../config';
import { MCQ_SHARE, PREGUNTAS } from './preguntas';

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
  // ── Energía (cap. 14) ──
  // Trabajo de una fuerza constante
  () => {
    const F = ri(20, 150), d = ri(2, 15), th = pick([0, 20, 30, 45, 60]);
    const Wk = F * d * Math.cos(rad(th));
    return {
      concept: 'Trabajo', title: 'Runa del Trabajo',
      prompt: `Arrastras un cofre ${d} m por el suelo jalando una cuerda con ${F} N, inclinada ${th}° sobre la horizontal.\n¿Cuánto trabajo realiza la fuerza de la cuerda?`,
      unit: 'J', answer: Wk, tol: 0.02,
      solution: ['W = F·d·cosθ', `W = (${F} N)(${d} m)·cos${th}°`, `W = ${f2(Wk)} J`],
    };
  },
  // Energía cinética
  () => {
    const m = ri(2, 40), v = ri(2, 15);
    const K = 0.5 * m * v * v;
    return {
      concept: 'Energia cinetica', title: 'Runa de la Vis Viva',
      prompt: `Un carro de mina de ${m} kg rueda a ${v} m/s.\n¿Cuál es su energía cinética?`,
      unit: 'J', answer: K, tol: 0.02,
      solution: ['K = ½·m·v²', `K = ½(${m} kg)(${v} m/s)²`, `K = ${f2(K)} J`],
    };
  },
  // Energía potencial
  () => {
    const m = ri(2, 50), h = ri(2, 30);
    const U = m * G * h;
    return {
      concept: 'Energia potencial', title: 'Runa de la Altura',
      prompt: `Subes una campana de ${m} kg hasta lo alto de una torre de ${h} m.\n¿Cuánto aumenta su energía potencial gravitatoria? (g = 9.81 m/s²)`,
      unit: 'J', answer: U, tol: 0.02,
      solution: ['ΔU = m·g·h', `ΔU = (${m} kg)(9.81 m/s²)(${h} m)`, `ΔU = ${f2(U)} J`],
    };
  },
  // Conservación de energía: caída libre
  () => {
    const h = ri(2, 40);
    const v = Math.sqrt(2 * G * h);
    return {
      concept: 'Conservacion', title: 'Runa de la Caída',
      prompt: `Una gárgola se suelta desde el reposo a ${h} m de altura. Despreciando el aire,\n¿con qué rapidez llega al suelo? (g = 9.81 m/s²)`,
      unit: 'm/s', answer: v, tol: 0.02,
      solution: ['m·g·h = ½·m·v²  (se conserva la energía)', 'v = √(2·g·h)', `v = √(2·9.81·${h}) = ${f2(v)} m/s`],
    };
  },
  // Teorema trabajo-energía
  () => {
    const m = ri(2, 20), F = ri(10, 80), d = ri(2, 10);
    const v = Math.sqrt((2 * F * d) / m);
    return {
      concept: 'Trabajo-energia', title: 'Runa del Impulso Inicial',
      prompt: `Un trineo de ${m} kg parte del reposo sobre hielo sin fricción. Lo empujas con ${F} N horizontales durante ${d} m.\n¿Qué rapidez alcanza?`,
      unit: 'm/s', answer: v, tol: 0.02,
      solution: ['W = ΔK  →  F·d = ½·m·v²', 'v = √(2·F·d / m)', `v = √(2·${F}·${d} / ${m}) = ${f2(v)} m/s`],
    };
  },
  // Conceptual: K y rapidez
  () => {
    const s = shuffleChoices(
      [
        'Se cuadruplica, porque K depende de v².',
        'Se duplica, porque K es proporcional a v.',
        'No cambia: la masa es la misma.',
        'Se reduce a la mitad.',
      ], 0);
    return {
      concept: 'Energia cinetica', title: 'Runa del Doble Paso',
      prompt: 'Un caballero duplica su rapidez al cargar. ¿Qué le pasa a su energía cinética?',
      unit: '', ...s,
      solution: ['K = ½·m·v²', 'Con 2v: K\' = ½·m·(2v)² = 4·K'],
    };
  },
  // ════════ Acto III · Impulso y cantidad de movimiento (Hibbeler cap. 15) ════════
  // Impulso de una fuerza constante
  () => {
    const F = ri(20, 400), t = f2(ri(2, 30) / 10);
    return {
      concept: 'Impulso', title: 'Runa del Impulso',
      prompt: `Un ariete empuja la puerta de la torre con una fuerza constante de ${F} N durante ${t} s.\n¿Qué impulso le aplica?`,
      unit: 'N·s', answer: F * t, tol: 0.02,
      solution: ['I = F·Δt  (fuerza constante)', `I = (${F} N)(${t} s)`, `I = ${f2(F * t)} N·s`],
    };
  },
  // Principio de impulso y cantidad de movimiento
  () => {
    const m = ri(2, 30), v1 = ri(0, 6), F = ri(10, 120), t = ri(1, 5);
    const v2 = v1 + (F * t) / m;
    return {
      concept: 'Impulso', title: 'Runa del Empujón',
      prompt: `Un carro de libros de ${m} kg se mueve a ${v1} m/s sobre un piso liso. Lo empujas en la misma dirección con ${F} N durante ${t} s.\n¿Qué rapidez tiene al final?`,
      unit: 'm/s', answer: v2, tol: 0.02,
      solution: ['m·v₁ + F·Δt = m·v₂', `v₂ = v₁ + F·Δt/m = ${v1} + (${F})(${t})/${m}`, `v₂ = ${f2(v2)} m/s`],
    };
  },
  // Fuerza promedio en un impacto
  () => {
    const m = f2(ri(2, 20) / 10), v = ri(5, 30), t = f2(ri(2, 20) / 1000);
    const F = (m * v) / t;
    return {
      concept: 'Impulso', title: 'Runa del Impacto',
      prompt: `Una esfera de ${m} kg que viaja a ${v} m/s se detiene por completo al chocar con un muro en ${t} s.\n¿Qué fuerza promedio ejerce el muro sobre ella?`,
      unit: 'N', answer: F, tol: 0.02,
      solution: ['F_prom·Δt = Δp = m·v − 0', `F_prom = m·v/Δt = (${m})(${v})/${t}`, `F_prom = ${f2(F)} N`],
    };
  },
  // Choque plástico (conservación de p)
  () => {
    const m1 = ri(1, 10), v1 = ri(4, 20), m2 = ri(2, 30);
    const v = (m1 * v1) / (m1 + m2);
    return {
      concept: 'Cantidad de movimiento', title: 'Runa del Choque Plástico',
      prompt: `Un proyectil de ${m1} kg a ${v1} m/s se incrusta en un bloque de ${m2} kg en reposo sobre hielo.\n¿Con qué rapidez se mueven juntos después del choque?`,
      unit: 'm/s', answer: v, tol: 0.02,
      solution: ['m₁v₁ + m₂·0 = (m₁ + m₂)·v', `v = (${m1})(${v1}) / (${m1} + ${m2})`, `v = ${f2(v)} m/s`],
    };
  },
  // Retroceso de un cañón
  () => {
    const mb = f2(ri(5, 50) / 10), vb = ri(80, 400), M = ri(100, 1500);
    const V = (mb * vb) / M;
    return {
      concept: 'Cantidad de movimiento', title: 'Runa del Retroceso',
      prompt: `Un cañón de ${M} kg, en reposo y libre de moverse, dispara una bala de ${mb} kg a ${vb} m/s.\n¿Con qué rapidez retrocede el cañón?`,
      unit: 'm/s', answer: V, tol: 0.02,
      solution: ['0 = m_b·v_b − M·V  (se conserva p)', `V = m_b·v_b / M = (${mb})(${vb})/${M}`, `V = ${f2(V)} m/s`],
    };
  },
  // Coeficiente de restitución por alturas de rebote
  () => {
    const h1 = ri(2, 9), e = pick([0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
    const h2 = f2(e * e * h1);
    return {
      concept: 'Choques', title: 'Runa del Rebote',
      prompt: `Una esfera se suelta desde ${h1} m y, tras chocar con el piso, rebota hasta ${h2} m.\n¿Cuál es el coeficiente de restitución e?`,
      unit: '', answer: Math.sqrt(h2 / h1), tol: 0.03,
      solution: ['v = √(2gh) antes y después del choque', 'e = v_después / v_antes = √(h₂/h₁)', `e = √(${h2}/${h1}) = ${f2(Math.sqrt(h2 / h1))}`],
    };
  },
  // Choque central con e (masas iguales)
  () => {
    const v = ri(2, 12), e = pick([0, 0.5, 1]);
    const s1 = shuffleChoices(
      e === 1
        ? ['A se detiene y B sale a ' + v + ' m/s.', 'Ambas siguen juntas a ' + v / 2 + ' m/s.', 'A rebota hacia atrás a ' + v + ' m/s.', 'Ninguna se mueve.']
        : e === 0
          ? ['Ambas siguen juntas a ' + v / 2 + ' m/s.', 'A se detiene y B sale a ' + v + ' m/s.', 'A rebota hacia atrás a ' + v + ' m/s.', 'B sale a ' + 2 * v + ' m/s.']
          : ['A sigue a ' + v / 4 + ' m/s y B sale a ' + (3 * v) / 4 + ' m/s.', 'Ambas siguen juntas a ' + v / 2 + ' m/s.', 'A se detiene y B sale a ' + v + ' m/s.', 'A rebota a ' + v / 2 + ' m/s.'],
      0);
    return {
      concept: 'Choques', title: 'Runa de las Esferas Gemelas',
      prompt: `Dos esferas IGUALES: A viaja a ${v} m/s y choca de frente con B, en reposo. El coeficiente de restitución es e = ${e}.\n¿Qué pasa después del choque?`,
      unit: '', ...s1,
      solution: ['Se conserva p: v_A + v_B = ' + v, 'Restitución: v_B − v_A = e·' + v, `v_A = ${f2((v * (1 - e)) / 2)} m/s,  v_B = ${f2((v * (1 + e)) / 2)} m/s`],
    };
  },
  // Conservación de la cantidad de movimiento angular
  () => {
    const I1 = ri(4, 12), w1 = ri(2, 8), I2 = f2(ri(15, 35) / 10);
    const w2 = (I1 * w1) / I2;
    return {
      concept: 'Impulso angular', title: 'Runa del Giro',
      prompt: `Un hechicero gira sobre un pedestal sin fricción con I = ${I1} kg·m² y ω = ${w1} rad/s. Recoge los brazos y su momento de inercia baja a ${I2} kg·m².\n¿Cuál es su nueva rapidez angular?`,
      unit: 'rad/s', answer: w2, tol: 0.02,
      solution: ['Sin par externo se conserva H = I·ω', `ω₂ = I₁·ω₁ / I₂ = (${I1})(${w1})/${I2}`, `ω₂ = ${f2(w2)} rad/s`],
    };
  },
  // Conceptual: impulso y tiempo de contacto
  () => {
    const s1 = shuffleChoices(
      [
        'Alarga el tiempo de contacto: con el mismo impulso, la fuerza promedio es menor.',
        'Reduce el impulso total que recibes.',
        'Disminuye tu masa durante el choque.',
        'Aumenta tu rapidez final.',
      ], 0);
    return {
      concept: 'Impulso', title: 'Runa del Colchón',
      prompt: 'Saltas desde un librero y caes sobre una pila de pergaminos en vez de sobre la piedra. ¿Por qué duele menos?',
      unit: '', ...s1,
      solution: ['El cambio de cantidad de movimiento Δp es el mismo en ambos casos.', 'F_prom = Δp/Δt: si Δt crece, F_prom disminuye.'],
    };
  },
];

// Las preguntas de opción múltiple de src/data/preguntas.ts se vuelven generadores
for (const q of PREGUNTAS) {
  GENERATORS.push(() => ({
    concept: q.concept, title: q.title, prompt: q.prompt, unit: '',
    ...shuffleChoices([q.correct, ...q.wrong], 0),
    solution: q.solution,
  }));
}

/** Temas del Acto III: no salen en los altares de los actos anteriores */
export const IMPULSE_CONCEPTS = ['Impulso', 'Cantidad de movimiento', 'Choques', 'Impulso angular'];

/**
 * Problema al azar; si se dan conceptos, sólo de esos temas.
 * Con probabilidad MCQ_SHARE prefiere una pregunta de opción múltiple.
 */
export function randomProblem(concepts?: string[]): Problem {
  const okTopic = (p: Problem) => (concepts?.length ? concepts.includes(p.concept) : !IMPULSE_CONCEPTS.includes(p.concept));
  const wantChoice = Math.random() < MCQ_SHARE;
  let fallback: Problem | null = null;
  for (let i = 0; i < 200; i++) {
    const p = pick(GENERATORS)();
    if (!okTopic(p)) continue;
    if (!!p.choices === wantChoice) return p;
    fallback ??= p;
  }
  return fallback ?? GENERATORS[0]();
}

export function checkAnswer(p: Problem, value: number | string): boolean {
  if (p.choices) return Number(value) === p.correct;
  const v = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (!isFinite(v) || p.answer === undefined) return false;
  const tol = Math.max(Math.abs(p.answer) * (p.tol ?? 0.02), 0.02);
  return Math.abs(v - p.answer) <= tol;
}
