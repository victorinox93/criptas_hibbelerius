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
  // ── El Abismo de los Ejes (cuerpo rígido) ──
  {
    concept: 'Centroide', title: 'Runa de la Placa Agujerada',
    prompt: 'A una placa cuadrada uniforme le cortas un círculo cerca de su orilla derecha. ¿Hacia dónde se mueve el centroide?',
    correct: 'Hacia la izquierda: el hueco cuenta como área negativa.',
    wrong: ['Hacia la derecha, hacia el hueco.', 'No se mueve: sigue en el centro del cuadrado.', 'Sube, porque se quitó material.'],
    solution: ['x̄ = (A₁x₁ − A₂x₂)/(A₁ − A₂): el hueco resta.', 'Al quitar área de la derecha, el promedio se va a la izquierda.'],
  },
  {
    concept: 'Centro de masa', title: 'Runa de la Torre Inclinada',
    prompt: '¿Cuándo se vuelca un cuerpo apoyado sobre una base?',
    correct: 'Cuando la vertical por su centro de masa sale de la base.',
    wrong: ['Cuando es más alto que ancho.', 'Cuando su masa supera a la de la base.', 'Cuando su centroide queda arriba de su centro de masa.'],
    solution: ['El peso actúa en el centro de masa.', 'Si su línea de acción cae fuera de la base, el peso produce un momento que lo hace girar.'],
  },
  {
    concept: 'Centro de masa', title: 'Runa de la Barra de Dos Metales',
    prompt: 'Una barra es mitad plomo y mitad madera. ¿Coinciden su centroide y su centro de masa?',
    correct: 'No: el centro de masa se corre hacia el lado del plomo.',
    wrong: ['Sí, siempre coinciden.', 'No: el centroide se corre hacia el plomo.', 'Sí, porque la barra es simétrica.'],
    solution: ['El centroide sólo depende de la forma.', 'El centro de masa pondera con la densidad: sólo coinciden si el cuerpo es homogéneo.'],
  },
  {
    concept: 'Momento de inercia', title: 'Runa de los Brazos Abiertos',
    prompt: 'Dos cuerpos tienen la misma masa. ¿Cuál tiene MAYOR momento de inercia respecto a su eje?',
    correct: 'El que tiene la masa más lejos del eje.',
    wrong: ['El más pesado de los dos.', 'Los dos tienen el mismo, porque tienen la misma masa.', 'El que tiene la masa más cerca del eje.'],
    solution: ['I = Σ m·r²: la distancia cuenta AL CUADRADO.', 'Un aro tiene más I que un disco de la misma masa y radio.'],
  },
  {
    concept: 'Ejes paralelos', title: 'Runa de Steiner',
    prompt: 'El teorema de ejes paralelos I = I₀ + m·d² sólo es válido si I₀ es respecto a…',
    correct: 'Un eje que pasa por el centro de masa.',
    wrong: ['Cualquier eje del cuerpo.', 'El eje más alejado del cuerpo.', 'Un eje perpendicular al buscado.'],
    solution: ['I₀ debe calcularse respecto al eje centroidal.', 'Por eso I respecto al centro de masa es el MÍNIMO de todos los ejes paralelos.'],
  },
  {
    concept: 'Radio de giro', title: 'Runa del Aro y el Disco',
    prompt: 'Un aro delgado y un disco macizo tienen la misma masa y el mismo radio R. ¿Quién tiene mayor radio de giro?',
    correct: 'El aro: k = R, contra k = R/√2 del disco.',
    wrong: ['El disco, porque es macizo.', 'Los dos tienen k = R.', 'Ninguno: el radio de giro sólo depende de la masa.'],
    solution: ['k = √(I/m)', 'Aro: I = mR² → k = R.  Disco: I = ½mR² → k = R/√2 ≈ 0.71R.'],
  },
  // ── v0.85 · más preguntas del Abismo (cuerpo rígido) ──
  {
    concept: 'Centroide', title: 'Runa del Triángulo Hundido',
    prompt: '¿A qué altura de su base está el centroide de un triángulo?',
    correct: 'A un tercio de la altura, medido desde la base.',
    wrong: ['A la mitad de la altura.', 'A dos tercios de la altura, desde la base.', 'Depende sólo del ángulo de arriba.'],
    solution: ['El centroide está donde se cruzan las medianas.', 'Queda a h/3 de la base (y a 2h/3 del vértice opuesto).'],
  },
  {
    concept: 'Centroide', title: 'Runa del Espejo',
    prompt: 'Una figura tiene un eje de simetría. ¿Qué puedes asegurar de su centroide?',
    correct: 'Que está sobre el eje de simetría.',
    wrong: ['Que está en el punto más alto del eje.', 'Que siempre queda fuera de la figura.', 'Nada: hay que integrar siempre.'],
    solution: ['Las áreas de cada lado del eje se equilibran.', 'Por eso el centroide cae en el eje: ahorra cálculos.'],
  },
  {
    concept: 'Centroide', title: 'Runa del Anillo Vacío',
    prompt: '¿Puede el centroide de una figura quedar FUERA de ella?',
    correct: 'Sí: en un anillo o en una figura en forma de C, por ejemplo.',
    wrong: ['No, nunca.', 'Sólo si la figura tiene masa negativa.', 'Sólo en cuerpos de tres dimensiones.'],
    solution: ['El centroide es un promedio de posiciones, no un punto de la figura.', 'En un anillo cae justo en el hueco del centro.'],
  },
  {
    concept: 'Centroide', title: 'Runa de la Media Luna',
    prompt: '¿A qué distancia de su diámetro está el centroide de un semicírculo de radio r?',
    correct: 'A 4r/(3π) ≈ 0.42·r del diámetro.',
    wrong: ['A r/2 del diámetro.', 'Sobre el diámetro.', 'A 2r/3 del diámetro.'],
    solution: ['ȳ = 4r / (3π)', 'Queda más cerca del diámetro porque ahí hay más área.'],
  },
  {
    concept: 'Centroide', title: 'Runa de las Partes',
    prompt: 'En x̄ = ΣxᵢAᵢ / ΣAᵢ para una figura compuesta, ¿qué es xᵢ?',
    correct: 'La coordenada del centroide de cada parte.',
    wrong: ['La orilla izquierda de cada parte.', 'El ancho de cada parte.', 'La distancia entre una parte y otra.'],
    solution: ['Cada parte se reemplaza por su área concentrada en su propio centroide.', 'Luego se promedian esas posiciones, pesadas por el área.'],
  },
  {
    concept: 'Centro de masa', title: 'Runa de la Llave Voladora',
    prompt: 'Lanzas una llave inglesa que gira en el aire. ¿Qué punto sigue una parábola perfecta?',
    correct: 'Su centro de masa.',
    wrong: ['El extremo más pesado.', 'El centro geométrico del mango.', 'Ninguno: todos los puntos giran.'],
    solution: ['Las fuerzas externas (el peso) mueven al centro de masa como si toda la masa estuviera ahí.', 'Los demás puntos giran alrededor de él.'],
  },
  {
    concept: 'Centro de masa', title: 'Runa del Cohete Roto',
    prompt: 'Un cohete explota en el aire en muchos pedazos. ¿Qué hace el centro de masa de todos los pedazos?',
    correct: 'Sigue la misma parábola de antes (hasta que tocan el suelo).',
    wrong: ['Se detiene en el lugar de la explosión.', 'Cae en línea recta.', 'Se va hacia el pedazo más grande.'],
    solution: ['La explosión sólo tiene fuerzas internas.', 'Las fuerzas internas no cambian el movimiento del centro de masa.'],
  },
  {
    concept: 'Centro de masa', title: 'Runa del Equilibrista',
    prompt: '¿Por qué un equilibrista lleva una pértiga larga que se curva hacia abajo?',
    correct: 'Baja su centro de masa y le da más inercia de rotación.',
    wrong: ['Para pesar más y no caerse.', 'Para empujar el aire.', 'Para subir su centro de masa.'],
    solution: ['Un centro de masa bajo lo hace más estable.', 'La masa lejos del eje (I grande) hace que gire más lento si se ladea.'],
  },
  {
    concept: 'Centro de masa', title: 'Runa del Aro',
    prompt: '¿Dónde está el centro de masa de un aro delgado?',
    correct: 'En el centro, donde no hay material.',
    wrong: ['En cualquier punto del aro.', 'En el punto más bajo del aro.', 'Un aro no tiene centro de masa.'],
    solution: ['Por simetría, el promedio de todas las posiciones cae en el centro.', 'El centro de masa no tiene que estar sobre el cuerpo.'],
  },
  {
    concept: 'Centro de masa', title: 'Runa de la Base Ancha',
    prompt: '¿Qué hace que un cuerpo apoyado sea MÁS difícil de volcar?',
    correct: 'Una base ancha y el centro de masa bajo.',
    wrong: ['Una base angosta y el centro de masa alto.', 'Poner más masa arriba.', 'Que sea más alto.'],
    solution: ['Se vuelca cuando la vertical por el centro de masa sale de la base.', 'Con base ancha y centro de masa bajo, hace falta inclinarlo mucho más.'],
  },
  {
    concept: 'Momento de inercia', title: 'Runa de la Rueda',
    prompt: '¿De qué depende el momento de inercia de un cuerpo?',
    correct: 'De su masa, de cómo está repartida y del eje de giro.',
    wrong: ['Sólo de su masa.', 'Sólo de su forma.', 'De qué tan rápido gira.'],
    solution: ['I = ∫ r² dm: importa dónde está cada pedacito de masa respecto al eje.', 'El mismo cuerpo tiene distinto I según el eje.'],
  },
  {
    concept: 'Momento de inercia', title: 'Runa del Gemelo',
    prompt: '¿Qué papel juega el momento de inercia I en la rotación?',
    correct: 'El mismo que la masa en la traslación: ΣM = I·α.',
    wrong: ['El mismo que la velocidad.', 'El mismo que la fuerza.', 'Ninguno: sólo importa el torque.'],
    solution: ['ΣF = m·a  ↔  ΣM = I·α', 'I mide qué tanto se resiste un cuerpo a cambiar su giro.'],
  },
  {
    concept: 'Momento de inercia', title: 'Runa de la Patinadora Abierta',
    prompt: 'Una patinadora gira y ABRE los brazos. ¿Qué pasa con su I y su ω?',
    correct: 'I aumenta y ω disminuye (H = I·ω se conserva).',
    wrong: ['I y ω aumentan.', 'I disminuye y ω aumenta.', 'No cambia nada.'],
    solution: ['Sin torque externo, H = I·ω es constante.', 'Más masa lejos del eje → más I → gira más lento.'],
  },
  {
    concept: 'Momento de inercia', title: 'Runa del Volante',
    prompt: 'Los volantes de inercia de las máquinas tienen casi toda la masa en el borde. ¿Por qué?',
    correct: 'Para tener mucho I con poca masa y guardar energía de rotación.',
    wrong: ['Para que giren más fácil.', 'Para que pesen menos.', 'Para bajar su centro de masa.'],
    solution: ['I = Σm·r²: la masa en el borde cuenta mucho más.', 'Con más I guardan más energía: K = ½·I·ω².'],
  },
  {
    concept: 'Momento de inercia', title: 'Runa de las Unidades',
    prompt: '¿En qué unidades se mide el momento de inercia?',
    correct: 'kg·m²',
    wrong: ['kg·m/s', 'N·m', 'kg/m²'],
    solution: ['I = Σ m·r²: masa por distancia al cuadrado.', 'kg·m/s es cantidad de movimiento y N·m es momento de una fuerza.'],
  },
  {
    concept: 'Ejes paralelos', title: 'Runa de la Lanza por la Punta',
    prompt: 'Una varilla de masa m y largo L tiene I = mL²/12 respecto a su centro. ¿Cuánto vale por un extremo?',
    correct: 'mL²/3, porque se suma m·(L/2)².',
    wrong: ['mL²/12: es el mismo valor.', 'mL²/6', 'mL²/2'],
    solution: ['I = I₀ + m·d² con d = L/2', 'mL²/12 + mL²/4 = mL²/3'],
  },
  {
    concept: 'Ejes paralelos', title: 'Runa del Eje Mínimo',
    prompt: 'De todos los ejes paralelos entre sí, ¿respecto a cuál es MÍNIMO el momento de inercia?',
    correct: 'El que pasa por el centro de masa.',
    wrong: ['El más alejado del cuerpo.', 'Todos valen igual.', 'El que toca el borde del cuerpo.'],
    solution: ['I = I₀ + m·d² y m·d² nunca es negativo.', 'El mínimo es cuando d = 0: el eje centroidal.'],
  },
  {
    concept: 'Ejes paralelos', title: 'Runa de la Distancia',
    prompt: 'En I = I₀ + m·d², ¿qué representa d?',
    correct: 'La distancia entre el eje nuevo y el eje paralelo que pasa por el centro de masa.',
    wrong: ['El diámetro del cuerpo.', 'La distancia del eje al borde del cuerpo.', 'Lo que se desplaza el cuerpo.'],
    solution: ['Los dos ejes deben ser paralelos.', 'd se mide perpendicular a ambos ejes.'],
  },
  {
    concept: 'Ejes paralelos', title: 'Runa del Doble',
    prompt: 'Si alejas el eje al doble de distancia d, el término m·d²…',
    correct: 'Se cuadruplica.',
    wrong: ['Se duplica.', 'No cambia.', 'Se reduce a la mitad.'],
    solution: ['(2d)² = 4d²', 'Por eso alejar el eje aumenta I muy rápido.'],
  },
  {
    concept: 'Radio de giro', title: 'Runa del Radio Fantasma',
    prompt: '¿Qué significa el radio de giro k de un cuerpo?',
    correct: 'La distancia a la que pondrías toda su masa para tener el mismo I.',
    wrong: ['El radio exterior del cuerpo.', 'La distancia de su borde al centro de masa.', 'Lo que avanza al dar una vuelta.'],
    solution: ['I = m·k²  →  k = √(I/m)', 'Es como «resumir» toda la masa en un anillo de radio k.'],
  },
  {
    concept: 'Radio de giro', title: 'Runa del Cálculo Rápido',
    prompt: 'Un cuerpo tiene m = 4 kg e I = 16 kg·m². ¿Cuánto vale su radio de giro?',
    correct: '2 m',
    wrong: ['4 m', '0.25 m', '64 m'],
    solution: ['k = √(I/m)', 'k = √(16/4) = √4 = 2 m'],
  },
  {
    concept: 'Radio de giro', title: 'Runa del Doble Radio',
    prompt: 'Dos cuerpos tienen la misma masa, pero el radio de giro del segundo es el doble. Su I es…',
    correct: '4 veces mayor.',
    wrong: ['2 veces mayor.', 'Igual.', 'La mitad.'],
    solution: ['I = m·k²', '(2k)² = 4k²'],
  },
  {
    concept: 'Radio de giro', title: 'Runa de las Cuatro Formas',
    prompt: 'Con la misma masa y el mismo radio R, ¿cuál tiene MENOR radio de giro respecto a su centro?',
    correct: 'La esfera maciza: k ≈ 0.63·R.',
    wrong: ['El aro: k = R.', 'El disco: k ≈ 0.71·R.', 'La esfera hueca: k ≈ 0.82·R.'],
    solution: ['k = √(I/m)', 'Esfera maciza: I = ⅖mR² → k = √0.4·R ≈ 0.63R (su masa está más cerca del centro).'],
  },
  {
    concept: 'Radio de giro', title: 'Runa del Eje Cambiante',
    prompt: 'El radio de giro de un cuerpo…',
    correct: 'Depende del eje respecto al que se calcule.',
    wrong: ['Es una propiedad fija del material.', 'Siempre es igual al radio del cuerpo.', 'No depende de la forma.'],
    solution: ['k = √(I/m) y I cambia con el eje.', 'Una varilla tiene k = L/√12 por su centro y L/√3 por un extremo.'],
  },
];

/** Qué tan seguido sale una pregunta de opción múltiple en vez de un cálculo (0 a 1) */
export const MCQ_SHARE = 0.6;
