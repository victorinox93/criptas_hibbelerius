// ════════════════════════════════════════════════════════════════
//  MINI LECCIONES para el repaso al final de la expedición.
//  Si el alumno falla preguntas de un tema, la pantalla final le
//  muestra su nombre, la fórmula clave y una idea para recordarlo.
//  La clave debe coincidir con el «concept» de las preguntas.
// ════════════════════════════════════════════════════════════════

export interface Leccion {
  nombre: string;
  formula: string;
  idea: string;
}

export const LECCIONES: Record<string, Leccion> = {
  '1a ley': { nombre: '1ª ley de Newton (inercia)', formula: 'ΣF = 0  ⇔  v = constante', idea: 'Sin fuerza neta, un cuerpo no cambia su velocidad: si está quieto sigue quieto; si se mueve, sigue igual.' },
  '2a ley': { nombre: '2ª ley de Newton', formula: 'ΣF = m·a', idea: 'Dibuja el diagrama de cuerpo libre, suma TODAS las fuerzas y divide entre la masa.' },
  '2a ley (sistemas)': { nombre: '2ª ley en sistemas', formula: 'ΣF_externas = (m₁ + m₂)·a', idea: 'Para la aceleración del conjunto, las fuerzas internas (tensiones) se cancelan. Luego aísla un cuerpo para hallar la tensión.' },
  '3a ley': { nombre: '3ª ley de Newton', formula: 'F_AB = −F_BA', idea: 'Acción y reacción actúan sobre cuerpos DISTINTOS; por eso no se cancelan entre sí.' },
  Peso: { nombre: 'Peso y masa', formula: 'W = m·g', idea: 'La masa (kg) no cambia; el peso (N) depende de la gravedad del lugar.' },
  Friccion: { nombre: 'Fricción', formula: 'fₖ = μₖ·N   ·   fₛ ≤ μₛ·N', idea: 'Primero halla la normal N. La fricción estática sólo vale μ_s·N justo antes de deslizar.' },
  'Fuerza normal': { nombre: 'Fuerza normal', formula: 'N = m·g·cosθ  (en una rampa)', idea: 'La normal NO siempre es m·g: sale del equilibrio en la dirección perpendicular a la superficie.' },
  'Plano inclinado': { nombre: 'Plano inclinado', formula: 'a = g·sinθ  (sin fricción)', idea: 'Usa ejes paralelo y perpendicular a la rampa: el peso se divide en m·g·sinθ y m·g·cosθ.' },
  Trabajo: { nombre: 'Trabajo de una fuerza', formula: 'W = F·d·cosθ', idea: 'Sólo la componente de la fuerza en la dirección del movimiento hace trabajo. A 90°, W = 0.' },
  'Energia cinetica': { nombre: 'Energía cinética', formula: 'K = ½·m·v²', idea: 'Depende de v AL CUADRADO: el doble de rapidez es el cuádruple de energía. Nunca es negativa.' },
  'Energia potencial': { nombre: 'Energía potencial', formula: 'U = m·g·h   ·   U = ½·k·x²', idea: 'Sólo importan la altura (o la deformación) inicial y final, no el camino.' },
  Conservacion: { nombre: 'Conservación de la energía', formula: 'K₁ + U₁ = K₂ + U₂', idea: 'Sin fricción, la energía sólo cambia de forma. En una caída: v = √(2gh), sin importar la masa.' },
  'Trabajo-energia': { nombre: 'Teorema trabajo-energía', formula: 'ΣW = ΔK = ½·m·v₂² − ½·m·v₁²', idea: 'Suma el trabajo de TODAS las fuerzas (incluida la fricción) y lo igualas al cambio de energía cinética.' },
  Potencia: { nombre: 'Potencia', formula: 'P = W / t = F·v', idea: 'El mismo trabajo hecho en menos tiempo requiere más potencia (watts).' },
  Impulso: { nombre: 'Impulso', formula: 'I = ∫F dt = F·Δt = Δp', idea: 'El impulso cambia la cantidad de movimiento. Alargar Δt reduce la fuerza promedio.' },
  'Cantidad de movimiento': { nombre: 'Cantidad de movimiento', formula: 'p = m·v   ·   Σp antes = Σp después', idea: 'En choques y explosiones sin fuerzas externas, la cantidad de movimiento TOTAL se conserva.' },
  Choques: { nombre: 'Choques y restitución', formula: 'e = (v₂′ − v₁′) / (v₁ − v₂)', idea: 'p siempre se conserva; la energía cinética sólo si e = 1. Con e = 0 los cuerpos quedan juntos.' },
  'Impulso angular': { nombre: 'Cantidad de movimiento angular', formula: 'H = I·ω   ·   I₁ω₁ = I₂ω₂', idea: 'Sin par externo, si el momento de inercia baja, la rapidez angular sube (como una patinadora).' },
  // Acto IV · el Núcleo del Cálculo
  'Derivada: velocidad': { nombre: 'Derivada: velocidad y potencia', formula: 'v = dx/dt   ·   P = dW/dt', idea: 'Deriva término a término: d/dt(tⁿ) = n·tⁿ⁻¹. Luego sustituye el instante que te piden.' },
  'Derivada: aceleracion': { nombre: 'Derivada: aceleración', formula: 'a = dv/dt = d²x/dt²', idea: 'Si te dan x(t), deriva DOS veces. Si te dan v(t), sólo una.' },
  'Integral: desplazamiento': { nombre: 'Integral: desplazamiento y velocidad', formula: 'Δx = ∫v dt   ·   Δv = ∫a dt', idea: 'Integra término a término: ∫tⁿ dt = tⁿ⁺¹/(n+1). Evalúa en el límite superior y resta el inferior.' },
  'Integral: trabajo': { nombre: 'Integral: trabajo', formula: 'W = ∫F dx   ·   resorte: W = ½k·x²', idea: 'Si la fuerza cambia con la posición, el trabajo es el área bajo F(x).' },
  'Integral: impulso': { nombre: 'Integral: impulso', formula: 'I = ∫F dt = m·Δv', idea: 'Si la fuerza cambia con el tiempo, el impulso es el área bajo F(t). Divídelo entre m para obtener Δv.' },
  Graficas: { nombre: 'Gráficas: pendientes y áreas', formula: 'pendiente = derivada   ·   área = integral', idea: 'x–t: pendiente = v. v–t: pendiente = a, área = Δx. F–t: área = I. F–x: área = W.' },
};
