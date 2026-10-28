// ════════════════════════════════════════════════════════════════
//  v0.64 · EL CRISOL DE NEWTON: FUSIONES (como en Ball x Pit)
//  En la Fogata eliges 2 cartas; si su física se combina, nace una carta
//  nueva (las dos se van). Las recetas son SECRETAS: en el Recetario
//  (src/ui/recetario.ts) sólo se ve una pista hasta que las descubres.
//  Al fusionar hay una pregunta del tema: si aciertas, la carta sale mejorada.
//  En el Abismo también se fusionan DIENTES: el diente fusionado ocupa un
//  solo hueco y cuenta como sus dos ingredientes AL DOBLE.
//  Las cartas fusionadas están en src/data/cards.ts (fusion: true) y su
//  efecto en src/scenes/Combat.ts (busca «v0.64»).
// ════════════════════════════════════════════════════════════════
import { Game } from '../state';

export interface Receta {
  id: string;
  a: string; // ingrediente (carta o diente)
  b: string;
  res: string; // resultado
  formula: string; // la física que las une
  pista: string; // lo único que se ve antes de descubrirla
  explica: string; // por qué se combinan
  concepts?: string[]; // pregunta al fusionar (sólo cartas)
}

export const RECETAS_CARTAS: Receta[] = [
  { id: 'momentum', a: 'forja', b: 'carrera', res: 'f_momentum', formula: 'p = m·v', concepts: ['Cantidad de movimiento', 'Impulso'],
    pista: 'Lo que tiene masa, cuando además se mueve…', explica: 'Masa (Forja Pesada) por velocidad (Carrera) es cantidad de movimiento: algo pesado y rápido es muy difícil de detener.' },
  { id: 'impulso', a: 'golpe', b: 'embestida', res: 'f_impulso', formula: 'J = F·Δt', concepts: ['Impulso', 'Cantidad de movimiento'],
    pista: 'Una fuerza que no se queda un instante, sino un buen rato…', explica: 'Si una fuerza actúa durante más tiempo, el impulso J = F·Δt crece: por eso el golpe se repite.' },
  { id: 'tercera', a: 'normal', b: 'accion', res: 'f_tercera', formula: 'F₁₂ = −F₂₁', concepts: ['3a ley'],
    pista: 'Si el suelo te empuja hacia arriba… ¿quién empuja a quién?', explica: 'La Fuerza Normal ES una reacción: el suelo te regresa lo que tú le haces. Juntas, son la 3ª ley completa.' },
  { id: 'inercia', a: 'palanca', b: 'inerciaPura', res: 'f_inercia', formula: 'I = m·r²', concepts: ['Momento de inercia', 'Radio de giro'],
    pista: 'Mucha masa, lejos del eje de giro…', explica: 'La palanca habla de distancia al eje y la masa inamovible de masa: juntas forman el momento de inercia I = m·r².' },
  { id: 'conservacion', a: 'almacenada', b: 'proyectil', res: 'f_conservacion', formula: 'U → K', concepts: ['Conservacion', 'Energia potencial', 'Energia cinetica'],
    pista: 'Lo guardado se vuelve movimiento, sin perder nada…', explica: 'La energía potencial almacenada se convierte en cinética: la energía total se conserva.' },
  { id: 'pendulo', a: 'pendulo', b: 'orbita', res: 'f_pendulo', formula: 'T = 2π√(L/g)', concepts: ['Movimiento circular'],
    pista: 'Ir y volver, ir y volver… para siempre.', explica: 'El péndulo y la órbita son movimientos periódicos: vuelven al mismo punto cada periodo T.' },
  { id: 'choque', a: 'choque', b: 'restitucion', res: 'f_choque', formula: 'e = 1', concepts: ['Choques'],
    pista: 'Un choque en el que no se pierde ni un poquito de energía…', explica: 'Con coeficiente de restitución e = 1 el choque es perfectamente elástico: todo rebota.' },
  { id: 'cohete', a: 'empuje', b: 'llamarada', res: 'f_cohete', formula: 'F = v·dm/dt', concepts: ['Impulso', '3a ley'],
    pista: 'Lo que expulsas te empuja… y lo que expulsas, quema.', explica: 'Un cohete se empuja expulsando masa (3ª ley) y esa masa sale caliente: empuje y calor a la vez.' },
  { id: 'teorema', a: 'derivada', b: 'integral', res: 'f_teorema', formula: '∫ f′(x) dx = f(x)', concepts: ['Derivada: velocidad', 'Integral: desplazamiento'],
    pista: 'Una deshace lo que hace la otra…', explica: 'Teorema fundamental del cálculo: derivar e integrar son operaciones inversas.' },

  // v0.72 · más recetas
  { id: 'vectores', a: 'tajo', b: 'equilibrio', res: 'f_vectores', formula: 'R = √(Fx² + Fy²)', concepts: ['Vectores', '1a ley'],
    pista: 'Lo que se descompone en x y en y… también se puede volver a sumar.', explica: 'El Tajo Angulado descompone la fuerza y ΣF = 0 la equilibra: juntas son la suma de vectores, que golpea a todos y te protege.' },
  { id: 'caida', a: 'pesoMuerto', b: 'muroMasa', res: 'f_caida', formula: 'm·g·h = ½·m·v²', concepts: ['Energia potencial', 'Conservacion'],
    pista: 'Mucha masa, bien alto… y luego la sueltas.', explica: 'Peso Muerto y Muro de Masa: una gran masa en altura guarda V = m·g·h, que al caer se vuelve energía cinética.' },
  { id: 'frenos', a: 'friccionArd', b: 'amortiguador', res: 'f_frenos', formula: 'U = f·d → calor', concepts: ['Friccion', 'Trabajo-energia'],
    pista: 'Lo que detiene un auto se pone muy caliente.', explica: 'El Amortiguador absorbe energía y la Fricción la vuelve calor: así funcionan los frenos de disco.' },
  { id: 'muelle', a: 'bateria', b: 'almacenada', res: 'f_muelle', formula: 'U = ½·k·x²', concepts: ['Energia potencial'],
    pista: 'Comprimir… y guardar para después.', explica: 'La Batería de Resorte y la Energía Almacenada son la misma idea: energía potencial elástica lista para soltarse poco a poco.' },
  { id: 'metralla', a: 'impulsoSost', b: 'perdigones', res: 'f_metralla', formula: 'I = Σ F·Δt', concepts: ['Impulso'],
    pista: 'Muchos empujoncitos pequeños…', explica: 'El impulso total es la suma de todos los impulsos pequeños: muchos perdigones en un impulso sostenido.' },
  { id: 'conservP', a: 'retroceso', b: 'conservP', res: 'f_retro', formula: 'm₁v₁ = m₂v₂', concepts: ['Cantidad de movimiento'],
    pista: 'Si empujas algo, algo te empuja a ti con la misma cantidad de movimiento.', explica: 'Retroceso y Conservación de p: la cantidad de movimiento total se conserva, así que el golpe también te protege.' },
  { id: 'haz', a: 'acelerar', b: 'rafaga', res: 'f_haz', formula: 'K = ½·m·v²', concepts: ['Energia cinetica'],
    pista: 'Primero rapidez, luego todo de golpe.', explica: 'Acelerar sube v y la Ráfaga reparte K = ½mv² a todos: un haz de partículas rápidas.' },
  { id: 'campo', a: 'barrera', b: 'escudoE', res: 'f_campo', formula: 'ΣF = 0 → v constante', concepts: ['1a ley'],
    pista: 'Un escudo que se resiste a cambiar…', explica: 'La Barrera Inercial y el Escudo de Energía: por la 1ª ley, una barrera sin fuerzas que la deshagan se mantiene.' },
  { id: 'tsiolkovski', a: 'tobera', b: 'reabastecer', res: 'f_tsiolkovski', formula: 'Δv = vₑ·ln(m₀/m)', concepts: ['Impulso'],
    pista: 'Cargar combustible y saber cómo quemarlo.', explica: 'La ecuación del cohete de Tsiolkovski: el cambio de velocidad depende de qué tan rápido expulsas la masa y de cuánta cargas.' },
  { id: 'escudoTermico', a: 'retro', b: 'estelaPlasma', res: 'f_escudoTermico', formula: 'Fricción → calor', concepts: ['Friccion', 'Impulso'],
    pista: 'Lo que protege a una nave al volver a la Tierra.', explica: 'Retrocohete y Estela de Plasma: al frenar contra el aire, el escudo térmico absorbe el calor de la fricción.' },
  { id: 'tacoma', a: 'frecuencia', b: 'fatigaMat', res: 'f_tacoma', formula: 'ω = ωₙ', concepts: ['Trabajo-energia'],
    pista: 'Un puente famoso que bailó hasta romperse.', explica: 'Frecuencia Natural y Fatiga del Material: cuando la excitación coincide con la frecuencia natural, la amplitud crece hasta la falla (Tacoma, 1940).' },
  { id: 'serie', a: 'limite', b: 'integral', res: 'f_serie', formula: 'Σ a·rⁿ', concepts: ['Integral: desplazamiento'],
    pista: 'Sumar y sumar, cada vez el doble…', explica: 'El Límite y la Integral son sumas infinitas: con razón r = 2, la serie geométrica crece en cada término.' },
  { id: 'brazo', a: 'palanca', b: 'torqueAbisal', res: 'f_brazo', formula: 'τ = r × F', concepts: ['Vectores', 'Impulso angular'],
    pista: 'Un punto de apoyo y una barra larga.', explica: 'La Palanca de Arquímedes y el Torque Abisal: el momento crece con el brazo de palanca, y nada lo detiene.' },
  { id: 'ejesI', a: 'centroideGolpe', b: 'momentoInercia', res: 'f_ejesI', formula: 'I = I_cm + m·d²', concepts: ['Ejes paralelos', 'Momento de inercia'],
    pista: 'Mover el eje lejos del centro siempre cuesta más.', explica: 'Golpe al Centroide y Momento de Inercia: el teorema de los ejes paralelos (Steiner) suma m·d² al momento de inercia del centroide.' },
];

export const RECETAS_DIENTES: Receta[] = [
  { id: 'd_eclipse', a: 'marte', b: 'luna', res: 'fu_eclipse', formula: 'Ataque + Defensa',
    pista: 'Cuando un astro tapa al otro…', explica: 'El Diente de Marte (ataque) y el Lunar (defensa) se alinean: un eclipse.' },
  { id: 'd_alineacion', a: 'jupiter', b: 'mercurio', res: 'fu_alineacion', formula: 'ΣF',
    pista: 'El más grande y el más rápido, en fila…', explica: 'Júpiter (gravedad) y Mercurio (rapidez) alineados suman sus fuerzas.' },
  { id: 'd_megalodon', a: 'colmillo', b: 'tiburon', res: 'fu_megalodon', formula: 'Más dientes',
    pista: 'Un pez muy antiguo, con dientes del tamaño de tu mano…', explica: 'El Colmillo de Profundo y el Diente de Tiburón forman al tiburón más grande que existió.' },
  { id: 'd_conde', a: 'vampiro', b: 'oro', res: 'fu_conde', formula: 'Vida + Ergios',
    pista: 'Un aristócrata que muerde… y cobra.', explica: 'El Colmillo Vampiro y el Diente de Oro: un conde que se alimenta de sus enemigos y de su fortuna.' },
  { id: 'd_acorazada', a: 'muelaPlomo', b: 'protector', res: 'fu_acorazada', formula: 'Masa = protección',
    pista: 'Pesada y bien protegida…', explica: 'La Muela de Plomo (bloqueo) con el Protector Bucal (sin aturdirte): nada te mueve.' },
];

/** Busca la receta que forman dos ingredientes (en cualquier orden) */
export function buscarReceta(lista: Receta[], a: string, b: string): Receta | undefined {
  return lista.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
}
/** ¿Ya descubriste esta receta? (se guarda en el Grimorio como bandera) */
export const recetaConocida = (id: string) => (Game.codex.flags ?? []).includes(`receta_${id}`);
export const marcarReceta = (id: string) => {
  const f = (Game.codex.flags ??= []);
  if (!f.includes(`receta_${id}`)) f.push(`receta_${id}`);
};
