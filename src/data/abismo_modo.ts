// ════════════════════════════════════════════════════════════════
//  EL ABISMO DE LOS EJES · modo de horror cósmico para quien ya venció a AM
//  (fase 1: sólo se abre desde el Modo profesor)
//
//  Se juega como el «acto 5»: 8 pisos + jefe (el Geómetra No Euclidiano).
//  La Cordura que se ve en pantalla es 100 − Locura (src/data/abismo.ts),
//  así que el Quiebre, la Sombra y las fórmulas borradas siguen igual.
//
//  Para agregar contenido:
//    · Página del Necronomicón → PAGINAS (y su efecto en Combat.ts, busca «necro»)
//    · Pacto (mazo inicial)    → PACTOS
//    · Edición de carta        → EDICIONES (y su efecto en playOn() de Combat.ts)
// ════════════════════════════════════════════════════════════════
import { CardInst, CARDS, Edicion, rewardPool, starterDeck } from './cards';

export const ACTO_ABISMO = 5;

/** Ajustes de Cordura en el Abismo (Cordura = 100 − Locura) */
/** Probabilidad de que una carta de Cristal se rompa al jugarla (en Balatro, 1 de cada 4) */
export const ROMPER_CRISTAL = 0.25;

export const CORDURA = {
  inicial: 70,
  runaBien: 10, // + Cordura al acertar una pregunta
  runaMal: 8, // − Cordura al fallarla
  susurro: 3, // − Cordura por cada Susurro que se queda en tu mano
  ojo: 10, // − Cordura de «El Ojo que Gira»
};

/** Cordura actual (0–100) a partir de la Locura guardada */
export const corduraDe = (locura = 0) => Math.max(0, Math.min(100, 100 - locura));

/** Las 4 luces del semáforo (de arriba abajo) */
export const SEMAFORO = [
  { nombre: 'Lúcido', min: 61, color: 0x4ec46a, css: '#6ee08a', texto: 'Juegas normal.' },
  { nombre: 'Inquieto', min: 31, color: 0xe8c23a, css: '#f0d060', texto: 'Las fórmulas de tus cartas empiezan a borrarse.' },
  { nombre: 'Delirante', min: 1, color: 0xe8782a, css: '#f09a50', texto: 'Visión del Abismo: +2 a tus ataques.' },
  { nombre: 'Quiebre', min: 0, color: 0xd8343a, css: '#ff6a6a', texto: 'Una Sombra aparece en el siguiente combate; luego regresas a 40.' },
];
export function luzDe(cordura: number) {
  return SEMAFORO.findIndex((l) => cordura >= l.min);
}

// ── Prólogo: el diario del erudito Ignacio Montemayor (una hoja por tramo, src/ui/diario.ts) ──
export const AUTOR = 'Ignacio Montemayor';
export const PROLOGO: { fecha: string; texto: string; dibujo?: 'cerro' }[] = [
  { fecha: '12 de marzo de 1931', dibujo: 'cerro', texto: 'Subí al Cerro de la Silla buscando fósiles. Entre las peñas de la silla hallé una cueva que no aparece en ningún mapa.\nAdentro, sobre una piedra seca, un tomo sin portada: «Necronomicón de Hibbelerius».' },
  { fecha: '19 de marzo', texto: 'Resolví el primer problema del tomo. Esa noche soñé con una ciudad bajo el mar cuyos muros no tenían centroide.\nAl despertar, mi lápiz había seguido escribiendo solo.' },
  { fecha: '2 de abril', texto: 'Volví a la cueva. El fondo ya no es de piedra: es agua negra, y baja más de lo que el cerro mide.\nMis alumnos dicen que en clase dibujo ejes donde no hay nada. Los ejes están ahí. Son ellos quienes no los ven.' },
  { fecha: '30 de abril', texto: 'Ya no sé si el libro me enseña o me reescribe.\nCada problema resuelto me devuelve un poco de mí. Cada error me quita algo. Abajo, algo enorme da vueltas sobre un eje que no veo.' },
  { fecha: 'Sin fecha', texto: 'Si alguien encuentra este diario: no bajes sin entender la física.\nAllá abajo, lo único que te mantiene cuerdo es una respuesta correcta.\n\n— Último registro del erudito Ignacio Montemayor' },
];

// ── Páginas del Necronomicón: un modificador para toda la expedición ──
export interface PaginaDef {
  id: string;
  nombre: string;
  poder: string;
  costo: string;
  lore: string;
}
export const PAGINAS: PaginaDef[] = [
  { id: 'geometria', nombre: 'Geometría Imposible', poder: '+2 kg a tus ataques (Arcanista y Penitente: +2 m/s al empezar cada combate).', costo: '−10 de Vida máxima.', lore: 'Las figuras de esta página no cierran. Aun así, pesan.' },
  { id: 'sueno', nombre: 'El Sueño Profundo', poder: '+1 J cada turno.', costo: 'Cada combate mete 1 «Susurro» a tu mazo.', lore: 'Duermes mejor que nunca. Algo habla mientras duermes.' },
  { id: 'angulos', nombre: 'Ángulos que No Suman', poder: 'Robas 1 carta más cada turno.', costo: 'Los enemigos tienen +15 % de vida.', lore: 'Un triángulo de 200°. Lo dibujaste tú.' },
  { id: 'mercader', nombre: 'El Mercader Velado', poder: '+100 Ergios al empezar.', costo: '−15 de Cordura inicial.', lore: 'Paga bien. No preguntes con qué.' },
  { id: 'confusion', nombre: 'La Confusión', poder: 'Robas 1 carta extra al inicio de cada combate y una carta de tu mazo se vuelve Polícroma.', costo: 'Todos tus combates empiezan con Confusión (costos al azar).', lore: 'Los números de la página cambian cada vez que parpadeas.' },
  { id: 'cristal', nombre: 'El Cristal', poder: '3 cartas al azar de tu mazo se vuelven de Cristal (×2).', costo: 'Cada vez que juegas una, 1 de cada 4 veces se rompe y sale de tu mazo.', lore: 'Translúcidas, frías y perfectas. Hasta que las usas.' },
  { id: 'steiner', nombre: 'Página de Steiner', poder: 'Tu primer ataque de cada combate hace ×2 (I = I₀ + m·d²).', costo: 'Recibes +1 de daño de cada golpe.', lore: 'Lejos del eje todo pesa más. También lo que te golpea.' },
  { id: 'lucido', nombre: 'El Horror Lúcido', poder: 'Ver jefes y élites no te quita Cordura.', costo: 'Las preguntas acertadas devuelven la mitad de Cordura.', lore: 'Ya nada te sorprende. Tampoco te alivia.' },
];
export const PAGINA = (id?: string) => PAGINAS.find((p) => p.id === id);

// ── Pactos: el mazo con el que bajas ──
export interface PactoDef {
  id: string;
  nombre: string;
  regla: string;
  mazo: (clase: string) => string[];
  vidaMax?: number; // cambio de Vida máxima
}
const sinDefensas = (clase: string, n: number) => {
  const d = [...starterDeck(clase)];
  for (let i = 0; i < n; i++) {
    const j = d.findIndex((id) => CARDS[id].type === 'Defensa');
    if (j >= 0) d.splice(j, 1);
  }
  return d;
};
export const PACTOS: PactoDef[] = [
  { id: 'centroide', nombre: 'Pacto del Centroide', regla: 'En tu primer turno de cada combate, la carta más cara de tu mano cuesta 0 J.', mazo: (c) => [...starterDeck(c), 'centroideGolpe'] },
  { id: 'excentrico', nombre: 'Pacto Excéntrico', regla: '+2 kg a todos tus ataques (Arcanista y Penitente: +2 m/s), pero tu mazo trae 2 Defensas menos.', mazo: (c) => [...sinDefensas(c, 2), 'centroideGolpe'] },
  { id: 'volante', nombre: 'Pacto del Volante', regla: 'Los Joules que no uses se guardan para el siguiente turno (máx. 3).', mazo: (c) => [...starterDeck(c), 'radioGiro'] },
  { id: 'hueco', nombre: 'Pacto Hueco', regla: 'Mazo de 8 cartas con una carta rara de Lámina, pero −8 de Vida máxima.', mazo: (c) => [...sinDefensas(c, 2)], vidaMax: -8 },
  { id: 'inercia', nombre: 'Pacto de la Inercia', regla: 'Empiezas cada combate con 6 de Bloqueo y tu mazo trae Momento de Inercia.', mazo: (c) => [...starterDeck(c), 'momentoInercia'] },
];
export const PACTO = (id?: string) => PACTOS.find((p) => p.id === id);
/** Cordura extra por el Pacto ciego (mazo al azar) */
export const PACTO_CIEGO_CORDURA = 15;

/** Mazo al azar del Pacto ciego: 10 cartas de la clase y del Abismo, sin estados */
export function mazoCiego(clase: string): string[] {
  const pool = rewardPool(clase, ACTO_ABISMO, 99, true);
  const d: string[] = [];
  while (d.length < 10) d.push(pool[Math.floor(Math.random() * pool.length)]);
  return d;
}
/** Cartas raras del Abismo (premio del Pacto Hueco y de las élites) */
export const RARAS_ABISMO = Object.values(CARDS).filter((c) => c.abismo && c.rarity === 'rara').map((c) => c.id);

// ── Ediciones (como las de Balatro) ──
export interface EdicionDef { nombre: string; texto: string; color: number; css: string; prob: number }
export const EDICIONES: Record<Edicion, EdicionDef> = {
  lamina: { nombre: 'Lámina', texto: 'Ataque: +5 de daño. Otras cartas: +4 de Bloqueo.', color: 0x9ad8f0, css: '#9ad8f0', prob: 0.08 },
  holo: { nombre: 'Holográfica', texto: 'Recuperas 1 J al jugarla.', color: 0xc88aff, css: '#d0a0ff', prob: 0.05 },
  poli: { nombre: 'Polícroma', texto: 'Ataque: ×1.5. Otras cartas: robas 1.', color: 0xff8ad0, css: '#ff9ad8', prob: 0.03 },
  cristal: { nombre: 'Cristal', texto: 'Ataque: ×2. Otras cartas: +10 de Bloqueo.\nFrágil: 1 de cada 4 veces se rompe y sale de tu mazo.', color: 0xe8fbff, css: '#e8fbff', prob: 0.04 },
};
/** Sortea una edición para una carta de recompensa (la mayoría de las veces, ninguna) */
export function sortearEdicion(bonus = 1): Edicion | undefined {
  let r = Math.random();
  for (const [id, e] of Object.entries(EDICIONES) as [Edicion, EdicionDef][]) {
    if (r < e.prob * bonus) return id;
    r -= e.prob * bonus;
  }
  return undefined;
}
/** Pone una edición a n cartas al azar del mazo que aún no tengan */
export function editarAlAzar(deck: CardInst[], ed: Edicion, n: number) {
  const libres = deck.filter((c) => !c.ed && CARDS[c.id].rarity !== 'estado');
  for (let i = 0; i < n && libres.length; i++) {
    const c = libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
    c.ed = ed;
  }
}

// ── Sobres (como en Pokémon TCG): al empezar abres 3 y te quedas con 2 cartas de cada uno ──
export interface SobreDef {
  id: string;
  nombre: string;
  texto: string;
  color: number; // color del empaque
  brillo: number; // color del metalizado
  icono: string;
}
export const SOBRES: SobreDef[] = [
  { id: 'clase', nombre: 'Sobre de tu Clase', texto: 'Cartas de tu clase para reforzar tu estilo.', color: 0x5a1e2a, brillo: 0xe8c15a, icono: 'i_sword' },
  { id: 'abismo', nombre: 'Sobre del Abismo', texto: 'Cartas que sólo existen aquí: centroides, inercia y horror.', color: 0x1c3a4a, brillo: 0x7fe8d8, icono: 'i_ojo' },
  { id: 'ecos', nombre: 'Sobre de los Ecos', texto: 'Cartas neutrales de todos los actos.', color: 0x3a2458, brillo: 0xc8a8ff, icono: 'i_shrine' },
];
/** Cartas por sobre y cuántas te quedas */
export const CARTAS_POR_SOBRE = 5;
export const ELIGES_POR_SOBRE = 2;
/** Edición del espacio brillante de cada sobre (siempre trae una) */
const BRILLANTE: [Edicion, number][] = [['lamina', 0.45], ['holo', 0.35], ['poli', 0.12], ['cristal', 0.08]];

export interface CartaSobre { id: string; up: boolean; ed?: Edicion; brillante?: boolean }

/** Arma un sobre: 3 comunes, 1 rara (a veces legendaria) y 1 brillante con edición */
export function abrirSobre(tipo: string, clase: string): CartaSobre[] {
  const pool = rewardPool(clase, ACTO_ABISMO, 99, true);
  const propia = (id: string) => (CARDS[id].cls ?? 'caballero') === (clase || 'caballero');
  const filtro = tipo === 'clase' ? (id: string) => propia(id) && !CARDS[id].abismo
    : tipo === 'abismo' ? (id: string) => !!CARDS[id].abismo
      : (id: string) => CARDS[id].cls === 'neutral' && !CARDS[id].abismo;
  const del = pool.filter(filtro);
  const comunes = del.filter((id) => CARDS[id].rarity !== 'rara');
  const raras = del.filter((id) => CARDS[id].rarity === 'rara');
  const usadas = new Set<string>();
  const saca = (lista: string[]) => {
    const libres = lista.filter((id) => !usadas.has(id));
    const id = (libres.length ? libres : lista.length ? lista : del)[Math.floor(Math.random() * (libres.length || lista.length || del.length))];
    usadas.add(id);
    return id;
  };
  const out: CartaSobre[] = [];
  for (let i = 0; i < 3; i++) out.push({ id: saca(comunes), up: Math.random() < 0.15 });
  // espacio raro: 12 % legendaria (del Abismo en su sobre; de las demás en los otros)
  const legs = Object.values(CARDS).filter((c) => c.rarity === 'legendaria' && !!c.abismo === (tipo === 'abismo') && (tipo !== 'clase' || propia(c.id))).map((c) => c.id);
  out.push({ id: legs.length && Math.random() < 0.12 ? saca(legs) : saca(raras.length ? raras : comunes), up: false });
  // espacio brillante: cualquier carta del sobre con edición garantizada
  let r = Math.random(), ed: Edicion = 'lamina';
  for (const [e, p] of BRILLANTE) { if (r < p) { ed = e; break; } r -= p; }
  out.push({ id: saca(Math.random() < 0.4 ? raras.length ? raras : del : del), up: false, ed, brillante: true });
  return out;
}

/** Texto corto de rareza para mostrar debajo de una carta */
export function rarezaDe(id: string) {
  const r = CARDS[id].rarity;
  return r === 'legendaria' ? { t: '★★ Legendaria', css: '#e8c15a' } : r === 'rara' ? { t: '★ Rara', css: '#c8a8ff' } : { t: 'Común', css: '#9a93a8' };
}

// ════════════════════════════════════════════════════════════════
//  EL DESCENSO (v0.41): 4 tramos de 6 pisos. Cada tramo termina con un jefe
//  sacado al azar; en el tramo 4 te toca un Primigenio. Después: ¿seguir bajando?
//  (modo infinito, ranking propio). Criaturas de cuentos de dominio público
//  (Lovecraft antes de 1929 y R. W. Chambers, 1895); los diseños son nuestros.
// ════════════════════════════════════════════════════════════════
export const TRAMOS = 4;
export const PISOS_TRAMO = 6;
export const NOMBRE_TRAMO = ['Los Muelles Inclinados', 'La Catedral del Volante', "R'lyeh Invertida", 'El Trono de los Primigenios'];
export const nombreTramo = (t: number) => (t <= TRAMOS ? NOMBRE_TRAMO[t - 1] : `El Abismo sin Fondo · profundidad ${t}`);

export interface JefeInfo {
  nombre: string;
  titulo: string;
  tema: string; // concepto físico de la pelea
  desventaja: string; // la regla que te estorba toda la pelea (como las «boss blinds» de Balatro)
  origen: string; // de dónde viene la criatura
  primigenio?: boolean;
}
export const JEFES: Record<string, JefeInfo> = {
  geometra: { nombre: 'El Geómetra No Euclidiano', titulo: 'Jefe del tramo', tema: 'Centroides', desventaja: 'Con menos de la mitad de vida suelta Vértices y te CONFUNDE.', origen: 'Original de este juego' },
  dagon: { nombre: 'Padre Dagón', titulo: 'Jefe del tramo', tema: 'Presión y flotación (P = ρ·g·h)', desventaja: 'MAREA ALTA: cada 3 turnos tus cartas de Bloqueo dan la mitad.', origen: '«Dagon», H. P. Lovecraft (1919)' },
  colorCielo: { nombre: 'El Color que Cayó del Cielo', titulo: 'Jefe del tramo', tema: 'Trabajo y energía', desventaja: 'Te roba 1 J al inicio de cada turno.', origen: '«The Colour Out of Space», H. P. Lovecraft (1927)' },
  bailarina: { nombre: 'La Bailarina Ahogada', titulo: 'Jefe del tramo', tema: 'Momento angular (I₁ω₁ = I₂ω₂)', desventaja: 'Cuando recoge los brazos gira más rápido y golpea 4 veces seguidas.', origen: 'Original de este juego' },
  dunwich: { nombre: 'El Engendro de Dunwich', titulo: 'Jefe del tramo', tema: 'Centro de masa', desventaja: 'Es INVISIBLE: no ves sus intenciones, sólo sus huellas.', origen: '«The Dunwich Horror», H. P. Lovecraft (1929)' },
  nyarlathotep: { nombre: 'Nyarlathotep', titulo: 'Primigenio · el Caos que Repta', tema: 'Momento de inercia', desventaja: 'La primera carta que robas cada turno se descarta. Cambia de forma: compacto (muchos golpes) o extendido (un golpe enorme).', origen: '«Nyarlathotep», H. P. Lovecraft (1920)', primigenio: true },
  cthulhu: { nombre: 'Cthulhu', titulo: "Primigenio · el Durmiente de R'lyeh", tema: 'ΣM = I·α y H = I·ω', desventaja: 'Pierdes 5 de Cordura cada turno. Despierta en 3 fases.', origen: '«The Call of Cthulhu», H. P. Lovecraft (1928)', primigenio: true },
  yogSothoth: { nombre: 'Yog-Sothoth', titulo: 'Primigenio · la Llave y la Puerta', tema: 'Ejes paralelos (I = I₀ + m·d²)', desventaja: 'Sólo robas 4 cartas por turno.', origen: '«The Dunwich Horror», H. P. Lovecraft (1929)', primigenio: true },
  hastur: { nombre: 'Hastur', titulo: 'Primigenio · el Rey de Amarillo', tema: 'Impulso y cantidad de movimiento', desventaja: 'Tus cartas de Ataque cuestan +1 J.', origen: '«El Rey de Amarillo», R. W. Chambers (1895)', primigenio: true },
};
export const JEFES_TRAMO = ['geometra', 'dagon', 'colorCielo', 'bailarina', 'dunwich'];
export const PRIMIGENIOS = ['nyarlathotep', 'cthulhu', 'yogSothoth', 'hastur'];

/** Elige el jefe de un tramo sin repetir los ya vistos en la partida (si se acaban, se repiten) */
export function elegirJefe(tramo: number, vistos: string[] = []): string {
  const lista = tramo < TRAMOS ? JEFES_TRAMO : tramo === TRAMOS ? PRIMIGENIOS : [...JEFES_TRAMO, ...PRIMIGENIOS];
  const libres = lista.filter((j) => !vistos.includes(j));
  const de = libres.length ? libres : lista;
  return de[Math.floor(Math.random() * de.length)];
}

/** Dificultad por tramo: +10 % por tramo hasta el 4; en el infinito, ×1.2 por cada tramo extra */
export function escalaTramo(t = 1) {
  return t <= TRAMOS ? 1 + 0.1 * (t - 1) : 1.3 * Math.pow(1.2, t - TRAMOS);
}
/** Daño por tramo: sube más despacio que la vida (+5 % por tramo; en el infinito, ×1.15 por tramo extra) */
export function escalaDano(t = 1) {
  return t <= TRAMOS ? 1 + 0.05 * (t - 1) : 1.15 * Math.pow(1.15, t - TRAMOS);
}
/** Multiplicador de puntaje en el infinito (crece con la profundidad) */
export const multPuntaje = (t = 1) => (t <= TRAMOS ? 1 : 1 + 0.5 * (t - TRAMOS));
/** Profundidad total (para el ranking): pisos de todos los tramos */
export const profundidad = (tramo = 1, piso = 0) => (tramo - 1) * (PISOS_TRAMO + 1) + piso;
