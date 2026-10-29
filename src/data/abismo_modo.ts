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

// ── El diario del erudito Ignacio Montemayor (src/ui/diario.ts) ──
// v0.45: 16 hojas. La primera se lee al empezar; las demás son RARAS: aparecen al azar
// después de algunos nodos y se guardan para siempre (Game.codex.diario), en orden,
// así que la historia de su descenso se completa a lo largo de varias expediciones.
export const AUTOR = 'Ignacio Montemayor';
export const PROLOGO: { fecha: string; texto: string; dibujo?: 'cerro' }[] = [
  { fecha: '12 de marzo de 1931', dibujo: 'cerro', texto: 'Subí al Cerro de la Silla buscando fósiles. Entre las peñas de la silla hallé una cueva que no aparece en ningún mapa.\nAdentro, sobre una piedra seca, un tomo sin portada: «Necronomicón de Hibbelerius».' },
  { fecha: 'Registro 2 · 14 de marzo', texto: 'Volví con cuerda y lámpara de carburo. La cueva baja en espiral.\nMedí la pendiente del túnel: 30° exactos, como en los problemas del libro. Demasiado exactos.' },
  { fecha: 'Registro 3 · 19 de marzo', texto: 'Resolví el primer problema del tomo. Esa noche soñé con una ciudad bajo el mar cuyos muros no tenían centroide.\nAl despertar, mi lápiz había seguido escribiendo solo.' },
  { fecha: 'Registro 4 · 22 de marzo', texto: 'En el suelo de la cueva hay dientes acomodados en fila. Los conté: ocho. Ninguno es humano.\nMe llevé uno en el bolsillo. Esta mañana estaba caliente.' },
  { fecha: 'Registro 5 · 27 de marzo', texto: 'Las piedras de aquí abajo tienen su centro de masa fuera de la base y aun así no se caen.\nEmpujé una. Me empujó de vuelta. «Tercera ley», me dije. No me convencí.' },
  { fecha: 'Registro 6 · 2 de abril', texto: 'El fondo de la cueva ya no es de piedra: es agua negra, y baja más de lo que el cerro mide.\nMis alumnos dicen que en clase dibujo ejes donde no hay nada. Los ejes están ahí. Son ellos quienes no los ven.' },
  { fecha: 'Registro 7 · 9 de abril', texto: 'Dejé de dar clases. El rector me mandó una carta.\nLa usé para calcular el área de una figura del libro. Me salió negativa. La figura sigue ahí.' },
  { fecha: 'Registro 8 · 15 de abril', texto: 'Abajo hay un muelle de piedra inclinado. Unos acólitos le rezan a un eje.\nCuando me vieron, preguntaron si traía la respuesta. Respondí bien. Me dejaron pasar.' },
  { fecha: 'Registro 9 · 20 de abril', texto: 'Un astrónomo aficionado de Providence contestó mi carta. Dice que las estrellas que le describo no existen.\nLe mandé sus coordenadas. Ya no me contesta.' },
  { fecha: 'Registro 10 · 24 de abril', texto: 'Me dolía una muela y me la saqué. En su lugar puse el diente caliente de la cueva.\nYa no me duele nada. Ya no siento frío.' },
  { fecha: 'Registro 11 · 30 de abril', texto: 'Ya no sé si el libro me enseña o me reescribe.\nCada problema resuelto me devuelve un poco de mí. Cada error me quita algo.' },
  { fecha: 'Registro 12 · 5 de mayo', texto: 'Mi reloj se atrasa una hora por cada piso que bajo. Hice la gráfica: es una recta.\nLa pendiente tiene unidades que no conozco.' },
  { fecha: 'Registro 13 · 11 de mayo', texto: 'Vi algo enorme girar allá abajo, sobre un eje que no veo. Calculé su momento de inercia con lo poco que alcancé a ver.\nEl número no cupo en el cuaderno. Seguí escribiendo en la pared.' },
  { fecha: 'Registro 14 · 18 de mayo', texto: 'Ya no subo. Por las noches los dientes de la dentadura hablan entre ellos.\nLos de cristal hablan más fuerte, pero se cansan pronto.' },
  { fecha: 'Registro 15 · 25 de mayo', texto: 'Hoy le respondí al libro sin abrirlo. Acerté.\nAquí abajo, acertar es lo único que me mantiene entero.' },
  { fecha: 'Sin fecha', texto: 'Si alguien encuentra este diario: no bajes sin entender la física.\nAllá abajo, lo único que te mantiene cuerdo es una respuesta correcta.\n\n— Último registro del erudito Ignacio Montemayor' },
];
/** Probabilidad de encontrar una hoja después de cada tipo de nodo (son raras) */
// v0.74 · la mitad que antes: no siempre sale una hoja por expedición
export const PROB_HOJA: Record<string, number> = { combate: 0.035, elite: 0.15, evento: 0.09, runa: 0.08, santuario: 0.05, mercader: 0.02, fogata: 0.05, boca: 0.03, observatorio: 0.06, sueno: 0.1, gabinete: 0.06, jefe: 0.25 };
/** Máximo de hojas por expedición, y con cuántas conoces el punto débil del Primigenio */
export const HOJAS_POR_EXPEDICION = 1; // v0.74 · a lo mucho una hoja por expedición (antes 3)
export const HOJAS_DEBILIDAD = 1;

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
  // v0.73 · más páginas
  { id: 'vacio', nombre: 'El Vacío Perfecto', poder: 'Eres inmune al Calor y a la Fricción de los enemigos.', costo: 'Las fogatas te curan la mitad.', lore: 'Sin aire no hay fricción ni convección. Tampoco hay con qué respirar.' },
  { id: 'eclipse', nombre: 'El Eclipse', poder: '+1 J en tus turnos pares.', costo: 'En tus turnos impares robas 1 carta menos.', lore: 'La Luna tapa al Sol cada tanto. Hay que saber contar los turnos.' },
  { id: 'sangre', nombre: 'Tinta de Sangre', poder: 'Al ganar un combate te curas 6.', costo: '−15 de Vida máxima.', lore: 'La página está escrita con algo rojo. Se regenera. Tú también.' },
  { id: 'abaco', nombre: 'El Ábaco de Hueso', poder: 'Cada 4 cartas que juegas en un turno: +1 J.', costo: 'Cada combate mete 1 «Error de Signo» a tu mazo.', lore: 'Cuentas rápido con las cuentas de hueso. A veces cuentas mal.' },
  { id: 'marea', nombre: 'La Marea de Innsmouth', poder: 'Empiezas cada combate con 10 de Bloqueo.', costo: 'Cada golpe enemigo hace +1 de daño.', lore: 'El agua sube y te protege. Lo que viene con el agua, no.' },
  { id: 'tiempo', nombre: 'El Tiempo Dilatado', poder: 'En tu primer turno de cada combate robas 2 cartas más y ganas +1 J.', costo: 'Los jefes tienen +20 % de vida.', lore: 'Cerca de algo muy masivo el tiempo corre más lento. Para ti, al principio.' },
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
  dientes?: number; // cuántos dientes te quedas al empezar (normal: 1 de 3, v0.53)
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
  // v0.42
  { id: 'pendulo', nombre: 'Pacto del Péndulo', regla: 'Va y viene: en tus turnos impares +1 J; en los pares robas 1 carta más.', mazo: (c) => [...starterDeck(c), 'ejesParalelos'] },
  { id: 'sonrisa', nombre: 'Pacto de la Sonrisa', regla: 'Al empezar te quedas con 3 dientes en lugar de 2, pero −10 de Vida máxima.', mazo: (c) => [...starterDeck(c), 'dclTentaculos'], vidaMax: -10, dientes: 3 },
  { id: 'estelar', nombre: 'Pacto Estelar', regla: 'Empiezas con un Astro en tu dentadura y los Astros te salen el doble de seguido.', mazo: (c) => [...starterDeck(c), 'calamarTorque'] },
  { id: 'palanca', nombre: 'Pacto de la Palanca', regla: 'Brazo largo: tu primer Ataque de cada turno hace +4 de daño.', mazo: (c) => [...starterDeck(c), 'enLibras'] },
  // v0.73 · más pactos
  { id: 'gravitatorio', nombre: 'Pacto Gravitatorio', regla: 'Tus Ataques hacen +1 de daño por cada enemigo vivo.', mazo: (c) => [...starterDeck(c), 'rampaAbisal'] },
  { id: 'calor', nombre: 'Pacto del Calor', regla: 'Cada Ataque que juegas le pone 1 de Calor a su objetivo.', mazo: (c) => [...starterDeck(c), 'friccionArd'] },
  { id: 'resonante', nombre: 'Pacto Resonante', regla: 'La primera carta que juegas cada turno da +1 de Resonancia a todos los enemigos.', mazo: (c) => [...starterDeck(c), 'frecuencia'] },
  { id: 'giroscopio', nombre: 'Pacto del Giróscopo', regla: 'Nada te aturde ni te marea (Vértigo), y empiezas cada combate con 4 de Bloqueo.', mazo: (c) => [...starterDeck(c), 'penduloFisico'] },
  { id: 'minimalista', nombre: 'Pacto Minimalista', regla: 'Mazo de 7 cartas: robas 1 carta menos cada turno, pero ganas +1 J cada turno.', mazo: (c) => sinDefensas(c, 2).slice(1) },
  { id: 'deuda', nombre: 'Pacto de la Deuda', regla: '+150 Ergios al empezar, pero cada combate que ganas te cobra 10 Ergios (si no tienes, 3 de vida).', mazo: (c) => [...starterDeck(c)] },
  { id: 'cafeina', nombre: 'Pacto de la Cafeína', regla: '+1 J en tu primer turno de cada combate. Tu mazo trae 2 Cafés del Abismo.', mazo: (c) => [...starterDeck(c), 'cafeAbismo', 'cafeAbismo'] },
];
/** Cuántos Pactos te ofrece el libro (eliges 1) */
export const PACTOS_OFRECIDOS = 2;
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
  lamina: { nombre: 'Lámina', texto: 'Si es Ataque: cada golpe hace +5 de daño.\nSi es Defensa o Habilidad: te da +4 de Bloqueo extra.', color: 0x9ad8f0, css: '#9ad8f0', prob: 0.08 },
  holo: { nombre: 'Holográfica', texto: 'Al jugarla recuperas 1 J: te sale 1 J más barata.', color: 0xc88aff, css: '#d0a0ff', prob: 0.05 },
  poli: { nombre: 'Polícroma', texto: 'Si es Ataque: su daño se multiplica ×1.5 (ej. 12 → 18).\nSi es Defensa o Habilidad: robas 1 carta.', color: 0xff8ad0, css: '#ff9ad8', prob: 0.03 },
  cristal: { nombre: 'Cristal', texto: 'Si es Ataque: su daño se multiplica ×2 (ej. 12 → 24).\nSi es Defensa o Habilidad: te da +10 de Bloqueo extra.\nFrágil: 1 de cada 4 veces se rompe y sale de tu mazo.', color: 0xe8fbff, css: '#e8fbff', prob: 0.04 },
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

// ── Sobres (como en Pokémon TCG): al empezar abres 3 y te quedas con 1 carta de cada uno (v0.53) ──
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
export const ELIGES_POR_SOBRE = 2; // v0.72 · el Abismo ya es retador: otra vez 2 por sobre (v0.53 había bajado a 1)
/** v0.53 · balance: al empezar salen DIENTES_OFRECIDOS dientes y te quedas con DIENTES_INICIO (antes 2 de 4) */
export const DIENTES_OFRECIDOS = 4; // v0.72 · 2 de 4 (antes 1 de 3)
export const DIENTES_INICIO = 2;
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
  const legs = Object.values(CARDS).filter((c) => c.rarity === 'legendaria' && !c.fusion && !!c.abismo === (tipo === 'abismo') && (tipo !== 'clase' || propia(c.id))).map((c) => c.id);
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
//  EL DESCENSO (v0.42): 2 tramos de 8 pisos. El tramo 1 termina con un jefe
//  sacado al azar; en el tramo 2 te toca un Primigenio. Después: ¿seguir bajando?
//  (modo infinito, ranking propio). Criaturas de cuentos de dominio público
//  (Lovecraft antes de 1929 y R. W. Chambers, 1895); los diseños son nuestros.
// ════════════════════════════════════════════════════════════════
export const TRAMOS = 2;
/** Pisos de cada tramo (sin contar al jefe). También en src/state.ts → PISOS_TRAMO_ABISMO */
export const PISOS_TRAMO = 10; // v0.45: +2 pisos por tramo
export const NOMBRE_TRAMO = ['Los Muelles Inclinados', "R'lyeh Invertida · el Trono de los Primigenios"];
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
  dagon: { nombre: 'Padre Dagón', titulo: 'Jefe del tramo', tema: 'Presión y flotación (P = ρ·g·h)', desventaja: 'MAREA ALTA: cada 3 turnos tus cartas de Bloqueo dan la mitad. Su Ola te ATURDE si te alcanza.', origen: '«Dagon», H. P. Lovecraft (1919)' },
  colorCielo: { nombre: 'El Color que Cayó del Cielo', titulo: 'Jefe del tramo', tema: 'Trabajo y energía', desventaja: 'Te roba 1 J al inicio de cada turno.', origen: '«The Colour Out of Space», H. P. Lovecraft (1927)' },
  bailarina: { nombre: 'La Bailarina Ahogada', titulo: 'Jefe del tramo', tema: 'Momento angular (I₁ω₁ = I₂ω₂)', desventaja: 'Con los brazos abiertos su golpe te ATURDE (pierdes un turno si no lo bloqueas); con los brazos recogidos golpea 4 veces y te da Vértigo.', origen: 'Original de este juego' },
  dunwich: { nombre: 'El Engendro de Dunwich', titulo: 'Jefe del tramo', tema: 'Centro de masa', desventaja: 'Es INVISIBLE: no ves sus intenciones, sólo sus huellas.', origen: '«The Dunwich Horror», H. P. Lovecraft (1929)' },
  nyarlathotep: { nombre: 'Nyarlathotep', titulo: 'Primigenio · el Caos que Repta', tema: 'Momento de inercia', desventaja: 'La primera carta que robas cada turno se descarta. Cambia de forma: compacto (muchos golpes) o extendido (un golpe enorme).', origen: '«Nyarlathotep», H. P. Lovecraft (1920)', primigenio: true },
  cthulhu: { nombre: 'Cthulhu', titulo: "Primigenio · el Durmiente de R'lyeh", tema: 'ΣM = I·α y H = I·ω', desventaja: 'Pierdes 5 de Cordura cada turno. Despierta en 3 fases; en la última, su golpe te ATURDE.', origen: '«The Call of Cthulhu», H. P. Lovecraft (1928)', primigenio: true },
  yogSothoth: { nombre: 'Yog-Sothoth', titulo: 'Primigenio · la Llave y la Puerta', tema: 'Ejes paralelos (I = I₀ + m·d²)', desventaja: 'Sólo robas 4 cartas por turno.', origen: '«The Dunwich Horror», H. P. Lovecraft (1929)', primigenio: true },
  // v0.51 · Las Tierras del Sueño
  yig: { nombre: 'Yig, Padre de las Serpientes', titulo: 'Jefe del tramo', tema: 'Fuerza centrípeta (F = m·v²/r)', desventaja: 'Cada vez que juegas una Defensa, una serpiente te muerde: −2 de vida. Su mordida deja HEMORRAGIA 3.', origen: '«La maldición de Yig», H. P. Lovecraft y Zealia Bishop (1929)' },
  calculadora: { nombre: 'La Calculadora Primigenia', titulo: 'Jefe del tramo', tema: 'Unidades y modos (grados vs. radianes)', desventaja: 'MODE → RAD: tus Ataques hacen ×0.6 hasta que juegues una Habilidad (revisas el modo). Con poca batería (menos de 30 % de vida) no ves sus intenciones.', origen: 'Original de este juego (todos hemos sufrido con la calculadora)' },
  cincoCabezas: { nombre: 'El Dios de las Cinco Cabezas', titulo: 'Jefe del tramo', tema: 'Equilibrio (ΣF = 0 y ΣM = 0)', desventaja: 'Al inicio de cada uno de tus turnos gana 6 de Bloqueo. Su Peso de la Piedra te ATURDE.', origen: '«Bajo las pirámides», H. P. Lovecraft y Harry Houdini (1924)' },
  shubNiggurath: { nombre: 'Shub-Niggurath', titulo: 'Primigenio · la Cabra Negra de los Mil Retoños', tema: 'Masa variable (dm/dt)', desventaja: 'Cada 3 turnos nace un Retoño; al inicio de su turno se cura 6 por cada Retoño vivo.', origen: '«El horror de Dunwich», H. P. Lovecraft (1929)', primigenio: true },
  hastur: { nombre: 'Hastur', titulo: 'Primigenio · el Rey de Amarillo', tema: 'Impulso y cantidad de movimiento', desventaja: 'Tus cartas de Ataque cuestan +1 J.', origen: '«El Rey de Amarillo», R. W. Chambers (1895)', primigenio: true },
};
export const JEFES_TRAMO = ['geometra', 'dagon', 'colorCielo', 'bailarina', 'dunwich', 'yig', 'cincoCabezas', 'calculadora'];
export const PRIMIGENIOS = ['nyarlathotep', 'cthulhu', 'yogSothoth', 'hastur', 'shubNiggurath'];
/** v0.51 · el jefe del sueño: no sale como jefe de tramo, sólo en el sueño de Sarnath (src/scenes/Sueno.ts) */
export const BOKRUG: JefeInfo = { nombre: 'Bokrug, el Gran Lagarto de Agua', titulo: 'Jefe del sueño', tema: 'Flotación (E = ρ·g·V)', desventaja: 'Cada 3 turnos el lago sube: pierdes todo tu Bloqueo antes de su golpe.', origen: '«La perdición que cayó sobre Sarnath», H. P. Lovecraft (1920)' };

/** Elige el jefe de un tramo sin repetir los ya vistos en la partida (si se acaban, se repiten) */
export function elegirJefe(tramo: number, vistos: string[] = []): string {
  const lista = tramo < TRAMOS ? JEFES_TRAMO : tramo === TRAMOS ? PRIMIGENIOS : [...JEFES_TRAMO, ...PRIMIGENIOS];
  const libres = lista.filter((j) => !vistos.includes(j));
  const de = libres.length ? libres : lista;
  return de[Math.floor(Math.random() * de.length)];
}

/**
 * v0.44 · Vida extra de TODO enemigo del Abismo (con dientes y cartas nuevas era muy fácil).
 * Se multiplica además por escalaTramo().
 */
export const VIDA_ABISMO = { normal: 1.5, elite: 1.45, jefe: 1.3 };
/** v0.75 · ajuste de pruebas del profe: vida y daño de TODOS los enemigos del Abismo (1 = sin ajuste) */
export const AJUSTE_ABISMO = { vida: 0.8, dano: 0.8, jefe: 1.1 }; // v0.77 · los jefes ×1.1 encima (quedan en 0.88)
/** Vida enemiga por tramo: tramo 2 ×1.3; en el infinito, ×1.25 más por cada profundidad extra */
export function escalaTramo(t = 1) {
  return t <= TRAMOS ? 1 + 0.3 * (t - 1) : 1.3 * Math.pow(1.25, t - TRAMOS);
}
/** Daño por tramo: sube más despacio que la vida (tramo 2 ×1.15; en el infinito, ×1.15 por profundidad extra) */
export function escalaDano(t = 1) {
  return t <= TRAMOS ? 1 + 0.15 * (t - 1) : 1.15 * Math.pow(1.15, t - TRAMOS);
}
/** Multiplicador de puntaje en el infinito (crece con la profundidad) */
export const multPuntaje = (t = 1) => (t <= TRAMOS ? 1 : 1 + 0.5 * (t - TRAMOS));
/** Profundidad total (para el ranking): pisos de todos los tramos */
export const profundidad = (tramo = 1, piso = 0) => (tramo - 1) * (PISOS_TRAMO + 1) + piso;

// ════════════════════════════════════════════════════════════════
//  v0.46 · MUTADORES DE TRAMO: cada tramo sortea una regla para todos sus combates.
//  Se ven bajo el título del mapa. Sus efectos están en Combat.ts (busca «mutador»).
// ════════════════════════════════════════════════════════════════
export interface MutadorDef { id: string; nombre: string; texto: string; color: string }
export const MUTADORES: MutadorDef[] = [
  { id: 'gravedad', nombre: 'Gravedad Doble', texto: 'g = 19.6 m/s²: tus ataques +3 kg (o +3 m/s), pero los enemigos pegan 20 % más fuerte.', color: '#e0a060' },
  { id: 'noche', nombre: 'Noche sin Estrellas', texto: 'En el primer turno de cada combate no ves las intenciones de los enemigos.', color: '#8a8ab8' },
  { id: 'agua', nombre: 'Fricción del Agua', texto: 'El agua frena: −1 J en tu primer turno, pero robas 1 carta más cada turno.', color: '#6ab8d8' },
  { id: 'despejado', nombre: 'Cielo Despejado', texto: 'Los Astros que tienes en la dentadura cuentan +1 nivel.', color: '#ffd060' },
  { id: 'tormenta', nombre: 'Tormenta de Ergios', texto: 'Los combates dan 50 % más Ergios, pero los enemigos tienen 15 % más vida.', color: '#e8c15a' },
  { id: 'masa', nombre: 'Masa Extra', texto: 'Los enemigos tienen 25 % más vida, pero empiezas cada combate con 8 de Bloqueo.', color: '#b8a088' },
  { id: 'eco', nombre: 'Eco del Abismo', texto: 'Tus Defensas dan +3 de Bloqueo, pero cada combate te mete 1 Susurro.', color: '#c8a8ff' },
];
export const MUTADOR = (id?: string) => MUTADORES.find((m) => m.id === id);
/** Sortea el mutador de un tramo (sin repetir el anterior) */
export function sortearMutador(antes?: string) {
  const de = MUTADORES.filter((m) => m.id !== antes);
  return de[Math.floor(Math.random() * de.length)].id;
}
/** Cuántos dientes muerde (desactiva) cada jefe del Abismo al empezar la pelea */
export const MORDIDAS_JEFE = 1;
export const MORDIDAS_PRIMIGENIO = 2;

/**
 * v0.48 · CONDICIONES DE JEFE: al empezar la pelea, cada jefe del Abismo impone una al azar
 * (se ve en el resumen antes de pelear). Sus efectos están en Combat.ts (busca «condJefe»).
 */
export interface CondicionJefe { id: string; nombre: string; texto: (prim: boolean) => string }
export const CONDICIONES_JEFE: CondicionJefe[] = [
  { id: 'mordida', nombre: 'Mordida', texto: (p) => `Te muerde ${p ? MORDIDAS_PRIMIGENIO : MORDIDAS_JEFE} diente(s) al azar: no funcionan en esta pelea.` },
  { id: 'sinDientes', nombre: 'Boca Cerrada', texto: () => 'NINGÚN diente de tu dentadura funciona en esta pelea.' },
  { id: 'sinDefensa', nombre: 'Sin Defensa', texto: () => 'Tus cartas de Defensa no dan Bloqueo en esta pelea (otros Bloqueos sí).' },
  { id: 'sinHabilidades', nombre: 'Mente en Blanco', texto: () => 'No puedes jugar cartas de Habilidad en esta pelea.' },
  { id: 'sinEdiciones', nombre: 'Opacidad', texto: () => 'Las ediciones de tus cartas (Lámina, Holográfica, Polícroma, Cristal) no hacen nada.' },
];
export const CONDICION_JEFE = (id?: string) => CONDICIONES_JEFE.find((c) => c.id === id);
