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
