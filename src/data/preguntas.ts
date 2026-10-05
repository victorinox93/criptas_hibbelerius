// ════════════════════════════════════════════════════════════════
//  BANCO DE PREGUNTAS DE OPCIÓN MÚLTIPLE (conceptuales)
//  Para agregar una, copia un bloque y cambia los textos:
//    concept   tema (el mismo nombre que usa la hoja «Conceptos»)
//    correct   la respuesta correcta
//    wrong     tres distractores (errores comunes de los alumnos)
//    solution  la explicación que se muestra después de responder
//  El orden de las opciones se revuelve solo. Procura que cada opción
//  quepa en una línea (unos 60 caracteres).
//  Temas disponibles: 1a ley, 2a ley, 3a ley, Peso, Friccion, Fuerza normal,
//  Plano inclinado, 2a ley (sistemas), Trabajo, Energia cinetica,
//  Energia potencial, Conservacion, Trabajo-energia, Potencia,
//  Impulso, Cantidad de movimiento, Choques, Impulso angular.
// ════════════════════════════════════════════════════════════════

export interface MCQ {
  concept: string;
  title: string;
  prompt: string;
  correct: string;
  wrong: [string, string, string];
  solution: string[];
}

export const PREGUNTAS: MCQ[] = [
  // ── 1ª ley ──
  {
    concept: '1a ley', title: 'Runa de la Carreta',
    prompt: 'Viajas en una carreta que frena de golpe y tu cuerpo se va hacia adelante. ¿Por qué?',
    correct: 'Tu cuerpo tiende a conservar su velocidad (inercia).',
    wrong: ['Una fuerza hacia adelante te empuja al frenar.', 'La carreta te repele con su gravedad.', 'Pierdes masa al frenar.'],
    solution: ['1ª ley: sin fuerza neta, un cuerpo conserva su velocidad.', 'La carreta frena; tú sigues moviéndote hasta que algo te detiene.'],
  },
  {
    concept: '1a ley', title: 'Runa del Hielo Eterno',
    prompt: 'Un cofre se desliza a 3 m/s sobre hielo perfectamente liso y nada lo empuja. ¿Qué le pasa?',
    correct: 'Sigue a 3 m/s en línea recta.',
    wrong: ['Se detiene poco a poco.', 'Acelera hasta chocar.', 'Comienza a girar en círculos.'],
    solution: ['Sin fricción ni otras fuerzas, ΣF = 0.', 'Por la 1ª ley, su velocidad no cambia.'],
  },
  // ── 2ª ley ──
  {
    concept: '2a ley', title: 'Runa de las Gárgolas',
    prompt: 'Aplicas la MISMA fuerza neta a dos gárgolas; una tiene el doble de masa. Su aceleración es…',
    correct: 'La mitad que la de la gárgola ligera.',
    wrong: ['El doble que la de la gárgola ligera.', 'Igual a la de la gárgola ligera.', 'Cero, porque es muy pesada.'],
    solution: ['a = ΣF / m', 'Con el doble de masa y la misma fuerza: a se reduce a la mitad.'],
  },
  {
    concept: '2a ley', title: 'Runa del Doble Empuje',
    prompt: 'Si duplicas la fuerza neta sobre un cuerpo de masa constante, su aceleración…',
    correct: 'Se duplica.',
    wrong: ['Se reduce a la mitad.', 'Se cuadruplica.', 'No cambia.'],
    solution: ['ΣF = m·a: a es proporcional a ΣF.', '2·ΣF → 2·a'],
  },
  {
    concept: '2a ley', title: 'Runa del Montacargas',
    prompt: 'Un montacargas sube con rapidez CONSTANTE. La tensión del cable es…',
    correct: 'Igual al peso del montacargas.',
    wrong: ['Mayor que su peso, porque sube.', 'Menor que su peso.', 'Cero.'],
    solution: ['Rapidez constante → a = 0 → ΣF = 0.', 'T − m·g = 0  →  T = m·g'],
  },
  // ── 3ª ley ──
  {
    concept: '3a ley', title: 'Runa del Caballo y la Carreta',
    prompt: 'La carreta jala al caballo con la misma fuerza con que él la jala. ¿Por qué avanzan?',
    correct: 'Las fuerzas actúan sobre cuerpos distintos; no se cancelan.',
    wrong: ['El caballo jala con más fuerza que la carreta.', 'La 3ª ley no aplica a seres vivos.', 'No deberían avanzar: las fuerzas se cancelan.'],
    solution: ['Acción y reacción actúan sobre cuerpos DIFERENTES.', 'El caballo avanza porque el suelo lo empuja (fricción) más de lo que la carreta lo jala.'],
  },
  {
    concept: '3a ley', title: 'Runa del Muro',
    prompt: 'Golpeas un muro de piedra con el puño. La fuerza del muro sobre tu puño es…',
    correct: 'Igual en magnitud y de sentido opuesto.',
    wrong: ['Mayor, porque el muro es más masivo.', 'Menor, porque el muro no se mueve.', 'Cero, porque el muro no hace nada.'],
    solution: ['3ª ley: F(muro→puño) = −F(puño→muro).', 'Por eso duele: el muro te empuja igual de fuerte.'],
  },
  {
    concept: '3a ley', title: 'Runa de la Manzana',
    prompt: 'La Tierra atrae a una manzana con 1 N. ¿Con qué fuerza atrae la manzana a la Tierra?',
    correct: '1 N, dirigida hacia la manzana.',
    wrong: ['Prácticamente 0 N.', 'Más de 1 N, porque la Tierra es grande.', 'Depende de la altura de la manzana.'],
    solution: ['Las fuerzas aparecen en pares iguales y opuestos.', 'La Tierra casi no se mueve porque su masa es enorme (a = F/m).'],
  },
  // ── Peso ──
  {
    concept: 'Peso', title: 'Runa del Yunque Lunar',
    prompt: 'Un yunque pesa 98 N en la Tierra. Si lo llevas a la Luna (g ≈ 1.6 m/s²), su MASA…',
    correct: 'Sigue siendo la misma (unos 10 kg).',
    wrong: ['Es unas 6 veces menor.', 'Se vuelve cero.', 'Aumenta.'],
    solution: ['La masa no depende del lugar.', 'Lo que cambia es el peso: W = m·g ≈ 16 N en la Luna.'],
  },
  {
    concept: 'Peso', title: 'Runa de las Unidades',
    prompt: '¿Cuál es la diferencia entre masa y peso?',
    correct: 'La masa mide inercia (kg); el peso es una fuerza (N).',
    wrong: ['Son lo mismo con distinto nombre.', 'El peso no cambia de un planeta a otro.', 'La masa se mide en newtons.'],
    solution: ['Masa: cantidad de materia / inercia, en kg.', 'Peso: fuerza de gravedad W = m·g, en N.'],
  },
  // ── Fricción ──
  {
    concept: 'Friccion', title: 'Runa del Roce',
    prompt: 'La fricción cinética sobre un bloque que se desliza depende principalmente de…',
    correct: 'El coeficiente μₖ y la fuerza normal: f = μₖ·N.',
    wrong: ['El área de contacto.', 'Qué tan rápido se desliza.', 'El color de la superficie.'],
    solution: ['Modelo de fricción seca: fₖ = μₖ·N.', 'En este modelo no depende del área ni de la rapidez.'],
  },
  {
    concept: 'Friccion', title: 'Runa del Cofre Terco',
    prompt: 'Empujas un cofre con 30 N y NO se mueve. La fricción estática vale…',
    correct: '30 N, igual a tu empuje (sin pasar de μₛ·N).',
    wrong: ['Siempre μₛ·N, sin importar tu empuje.', 'Cero, porque no hay movimiento.', 'Más de 30 N.'],
    solution: ['Si no se mueve, ΣF = 0: la fricción iguala tu empuje.', 'La fricción estática sólo llega a su máximo μₛ·N justo antes de deslizar.'],
  },
  // ── Fuerza normal ──
  {
    concept: 'Fuerza normal', title: 'Runa de la Rampa Quieta',
    prompt: 'Un bloque de masa m descansa sobre una rampa de ángulo θ. La fuerza normal es…',
    correct: 'N = m·g·cosθ',
    wrong: ['N = m·g', 'N = m·g·sinθ', 'N = m·g / cosθ'],
    solution: ['Ejes paralelo y perpendicular a la rampa.', 'Perpendicular: N − m·g·cosθ = 0  →  N = m·g·cosθ'],
  },
  {
    concept: 'Fuerza normal', title: 'Runa del Empuje Hacia Abajo',
    prompt: 'Un cofre está en el suelo y lo empujas verticalmente hacia abajo con 50 N. La normal…',
    correct: 'Aumenta: N = m·g + 50 N.',
    wrong: ['Disminuye en 50 N.', 'No cambia: siempre es m·g.', 'Se vuelve cero.'],
    solution: ['Vertical: N − m·g − 50 = 0.', 'La normal no siempre es m·g: se ajusta a las demás fuerzas.'],
  },
  // ── Plano inclinado ──
  {
    concept: 'Plano inclinado', title: 'Runa de la Pendiente',
    prompt: 'Sin fricción, ¿qué aceleración tiene un bloque que resbala por una rampa de ángulo θ?',
    correct: 'a = g·sinθ',
    wrong: ['a = g·cosθ', 'a = g', 'a = g·tanθ'],
    solution: ['Paralelo a la rampa: m·g·sinθ = m·a', 'a = g·sinθ (no depende de la masa)'],
  },
  {
    concept: 'Plano inclinado', title: 'Runa de la Rampa Empinada',
    prompt: 'Si aumentas el ángulo de una rampa sin fricción, la aceleración del bloque…',
    correct: 'Aumenta, hasta llegar a g cuando θ = 90°.',
    wrong: ['Disminuye.', 'No cambia.', 'Aumenta sin límite.'],
    solution: ['a = g·sinθ y sinθ crece de 0 a 1 entre 0° y 90°.', 'A 90° es caída libre: a = g.'],
  },
  // ── 2ª ley (sistemas) ──
  {
    concept: '2a ley (sistemas)', title: 'Runa del Tren de Cofres',
    prompt: 'Jalas dos cofres atados con una cuerda sobre hielo. ¿Qué masa usas para la aceleración del sistema?',
    correct: 'La suma de las dos masas.',
    wrong: ['Sólo la del cofre que jalas.', 'La diferencia de las masas.', 'El promedio de las masas.'],
    solution: ['Sistema completo: F = (m₁ + m₂)·a', 'La tensión de la cuerda es interna y no entra en la ecuación del sistema.'],
  },
  {
    concept: '2a ley (sistemas)', title: 'Runa de la Polea Gemela',
    prompt: 'En una polea ideal cuelgan dos masas IGUALES. El sistema…',
    correct: 'Tiene aceleración cero.',
    wrong: ['Cae con aceleración g.', 'Acelera a g/2.', 'Siempre cae del lado izquierdo.'],
    solution: ['a = (m₂ − m₁)·g / (m₁ + m₂)', 'Si m₁ = m₂, a = 0 (puede estar quieto o moverse a rapidez constante).'],
  },
  // ── Trabajo ──
  {
    concept: 'Trabajo', title: 'Runa del Cargador',
    prompt: 'Cargas un cofre caminando en horizontal a rapidez constante. ¿Qué trabajo hace tu fuerza VERTICAL sobre el cofre?',
    correct: 'Cero: la fuerza es perpendicular al desplazamiento.',
    wrong: ['m·g·d', 'Negativo.', 'Igual a la energía que gastas al caminar.'],
    solution: ['W = F·d·cosθ', 'Con θ = 90°, cos90° = 0  →  W = 0'],
  },
  {
    concept: 'Trabajo', title: 'Runa del Roce que Quita',
    prompt: 'El trabajo de la fricción cinética sobre un bloque que se desliza es…',
    correct: 'Negativo: se opone al desplazamiento.',
    wrong: ['Positivo.', 'Cero.', 'Positivo si el bloque es pesado.'],
    solution: ['W = f·d·cos180° = −f·d', 'La fricción le quita energía mecánica al bloque.'],
  },
  {
    concept: 'Trabajo', title: 'Runa de las Unidades del Trabajo',
    prompt: '¿En qué unidades se mide el trabajo?',
    correct: 'Joules (1 J = 1 N·m).',
    wrong: ['Newtons.', 'Watts.', 'Newtons por metro.'],
    solution: ['W = F·d  →  N·m = J'],
  },
  // ── Energía cinética ──
  {
    concept: 'Energia cinetica', title: 'Runa de los Carros',
    prompt: 'Dos carros van a la misma rapidez; uno tiene el triple de masa. Su energía cinética es…',
    correct: 'El triple.',
    wrong: ['Nueve veces mayor.', 'La misma.', 'Un tercio.'],
    solution: ['K = ½·m·v²: con la misma v, K es proporcional a m.'],
  },
  {
    concept: 'Energia cinetica', title: 'Runa del Signo',
    prompt: '¿Puede ser negativa la energía cinética?',
    correct: 'No: ½·m·v² nunca es negativa.',
    wrong: ['Sí, si el cuerpo se mueve hacia atrás.', 'Sí, cuando el cuerpo frena.', 'Sólo en caída libre.'],
    solution: ['m > 0 y v² ≥ 0, así que K ≥ 0.', 'La dirección del movimiento no importa: v está al cuadrado.'],
  },
  // ── Energía potencial ──
  {
    concept: 'Energia potencial', title: 'Runa de los Dos Caminos',
    prompt: 'Subes una campana 10 m por una escalera o por una rampa larga. El cambio de U gravitatoria es…',
    correct: 'El mismo: sólo depende de la altura.',
    wrong: ['Mayor por la rampa.', 'Mayor por la escalera.', 'Cero por la rampa.'],
    solution: ['ΔU = m·g·Δh', 'La gravedad es conservativa: no importa el camino, sólo el inicio y el final.'],
  },
  {
    concept: 'Energia potencial', title: 'Runa del Resorte',
    prompt: 'Un resorte de rigidez k se estira una distancia x. Su energía potencial elástica es…',
    correct: 'U = ½·k·x²',
    wrong: ['U = k·x', 'U = ½·k·x', 'U = k·x²'],
    solution: ['El trabajo para estirarlo es el área bajo F = k·x:', '½·(k·x)·x = ½·k·x²'],
  },
  // ── Conservación ──
  {
    concept: 'Conservacion', title: 'Runa del Tobogán',
    prompt: 'Una esfera se suelta desde una altura h por una rampa CURVA sin fricción. Su rapidez abajo depende de…',
    correct: 'Sólo de h: v = √(2·g·h).',
    wrong: ['De la forma de la rampa.', 'De su masa.', 'Del tiempo que tarda en bajar.'],
    solution: ['m·g·h = ½·m·v² (se cancela la masa)', 'La forma de la rampa cambia el tiempo, no la rapidez final.'],
  },
  {
    concept: 'Conservacion', title: 'Runa del Péndulo',
    prompt: 'Un péndulo oscila sin fricción. En el punto MÁS BAJO de su trayectoria…',
    correct: 'K es máxima y U es mínima.',
    wrong: ['U es máxima y K mínima.', 'K y U valen cero.', 'K es mínima.'],
    solution: ['E = K + U se conserva.', 'Abajo la altura es mínima → U mínima → K máxima.'],
  },
  // ── Trabajo-energía ──
  {
    concept: 'Trabajo-energia', title: 'Runa del Teorema',
    prompt: 'El teorema de trabajo y energía dice que…',
    correct: 'El trabajo neto es igual al cambio de energía cinética.',
    wrong: ['El trabajo neto siempre es cero.', 'El trabajo es igual a la energía potencial.', 'La fuerza es igual al trabajo.'],
    solution: ['ΣW = ΔK = ½·m·v₂² − ½·m·v₁²'],
  },
  {
    concept: 'Trabajo-energia', title: 'Runa del Frenado',
    prompt: 'Un carro va al DOBLE de rapidez. Con la misma fuerza de frenado, su distancia para detenerse es…',
    correct: '4 veces mayor.',
    wrong: ['2 veces mayor.', 'La misma.', 'La mitad.'],
    solution: ['f·d = ½·m·v²  →  d ∝ v²', '(2v)² = 4v²  →  4 veces la distancia'],
  },
  // ── Potencia ──
  {
    concept: 'Potencia', title: 'Runa de la Escalera',
    prompt: 'Dos caballeros iguales suben la misma escalera; uno tarda la mitad del tiempo. ¿Qué es cierto?',
    correct: 'Hacen el mismo trabajo; el rápido usa el doble de potencia.',
    wrong: ['El rápido hace el doble de trabajo.', 'Ambos usan la misma potencia.', 'El lento hace más trabajo.'],
    solution: ['W = m·g·h es igual para ambos.', 'P = W/t: la mitad del tiempo → el doble de potencia.'],
  },
  // ── Impulso ──
  {
    concept: 'Impulso', title: 'Runa de la Gráfica',
    prompt: 'En una gráfica de fuerza contra tiempo, el área bajo la curva representa…',
    correct: 'El impulso (el cambio de cantidad de movimiento).',
    wrong: ['El trabajo.', 'La potencia.', 'La aceleración.'],
    solution: ['I = ∫F dt = área bajo F(t)', 'I = Δp = m·v₂ − m·v₁'],
  },
  {
    concept: 'Impulso', title: 'Runa de la Bolsa de Aire',
    prompt: 'Las bolsas de aire de un carruaje protegen al pasajero porque…',
    correct: 'Alargan el impacto y reducen la fuerza promedio.',
    wrong: ['Reducen el cambio de cantidad de movimiento.', 'Aumentan la masa del pasajero.', 'Eliminan el impulso.'],
    solution: ['Δp es el mismo con o sin bolsa.', 'F_prom = Δp/Δt: si Δt crece, F_prom baja.'],
  },
  // ── Cantidad de movimiento ──
  {
    concept: 'Cantidad de movimiento', title: 'Runa del Cañón',
    prompt: 'Un cañón en reposo dispara una bala. En el sistema cañón + bala (sin fuerzas externas horizontales) se conserva…',
    correct: 'La cantidad de movimiento total (que sigue siendo cero).',
    wrong: ['La energía cinética total.', 'La rapidez del cañón.', 'Nada se conserva en una explosión.'],
    solution: ['Antes: p = 0. Después: m_b·v_b − M·V = 0.', 'La energía cinética SÍ aumenta: viene de la pólvora.'],
  },
  {
    concept: 'Cantidad de movimiento', title: 'Runa del Camión y la Bicicleta',
    prompt: 'Un camión y una bicicleta tienen la MISMA cantidad de movimiento. ¿Cuál va más rápido?',
    correct: 'La bicicleta, porque tiene menos masa.',
    wrong: ['El camión.', 'Van igual de rápido.', 'No se puede saber.'],
    solution: ['p = m·v  →  v = p/m', 'Con el mismo p, menos masa significa más rapidez.'],
  },
  // ── Choques ──
  {
    concept: 'Choques', title: 'Runa del Choque Plástico',
    prompt: 'En un choque perfectamente plástico (e = 0)…',
    correct: 'Los cuerpos quedan juntos y se pierde energía cinética.',
    wrong: ['Se conserva la energía cinética.', 'Los cuerpos rebotan con la misma rapidez.', 'No se conserva la cantidad de movimiento.'],
    solution: ['e = 0: velocidad de separación nula → quedan unidos.', 'p se conserva; K no (se va en deformación y calor).'],
  },
  {
    concept: 'Choques', title: 'Runa de la Pelota Perfecta',
    prompt: 'Una pelota con coeficiente de restitución e = 1 cae sobre el piso. Rebota…',
    correct: 'Hasta la misma altura de la que cayó.',
    wrong: ['Hasta la mitad de la altura.', 'No rebota.', 'Más alto que antes.'],
    solution: ['e = v_después / v_antes = 1 → misma rapidez.', 'h₂ = e²·h₁ = h₁'],
  },
  {
    concept: 'Choques', title: 'Runa de Todo Choque',
    prompt: 'En TODO choque entre dos cuerpos aislados se conserva…',
    correct: 'La cantidad de movimiento total.',
    wrong: ['La energía cinética total.', 'La rapidez de cada cuerpo.', 'La energía potencial.'],
    solution: ['Las fuerzas del choque son internas (3ª ley): Σp se conserva.', 'K sólo se conserva si el choque es elástico (e = 1).'],
  },
  // ── Impulso angular ──
  {
    concept: 'Impulso angular', title: 'Runa de la Patinadora',
    prompt: 'Una patinadora gira sobre el hielo y recoge los brazos. ¿Qué le pasa?',
    correct: 'Gira más rápido: I baja y H = I·ω se conserva.',
    wrong: ['Gira más lento.', 'Se detiene.', 'Su rapidez angular no cambia.'],
    solution: ['Sin par externo: I₁·ω₁ = I₂·ω₂', 'Si I disminuye, ω aumenta.'],
  },
];

/** Qué tan seguido sale una pregunta de opción múltiple en vez de un cálculo (0 a 1) */
export const MCQ_SHARE = 0.6;
