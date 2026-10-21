import Phaser from 'phaser';
import { nivelDiente } from './data/dientes';
import { CardInst, starterDeck } from './data/cards';
import { CLASSES } from './data/classes';
import { enqueue, isOnline } from './api';
import { gravityOf } from './data/gravity';
import { FAMILIAR_POOL, FAMILIARS } from './data/familiars';
import { ADMINS } from './config';
import { nivelDe, nivelDeV1 } from './data/progreso';

export interface Avatar {
  alias: string;
  insignia?: string; // 'am' = venció a AM (se ve en el ranking y el menú)
  insignia2?: string; // 'abismo' = venció a un Primigenio en el Abismo (ojo morado junto al de AM)
  figura?: number; // 0 = masculina; 1–5 = femenina (color de cabello)
  cabeza?: string; // accesorio de cabeza (Tienda de Layla)
  mano?: string; // accesorio de mano (reemplaza al arma)
  cara?: string; // accesorio de cara
  pies?: string; // accesorio de pies
  escudo?: string; // escudo de la Tienda de Layla (v0.34)
  clase: string;
  helm: string;
  cape: number;
  armor?: number;
  visor?: number;
  arma?: number; // arma (caballero) o bastón (arcanista)
  extra?: number; // escudo (caballero) o barba (arcanista)
  piel?: number; // tono de piel
  mascota?: string; // v0.55 · compañero cosmético: id de un familiar que ya conociste (src/ui/mascota.ts)
}

export interface Profile {
  matricula: string;
  grupo: string;
  token: string;
  offline: boolean;
  avatar: Avatar | null;
}

export type NodeType = 'combate' | 'elite' | 'fogata' | 'runa' | 'evento' | 'mercader' | 'santuario' | 'taberna' | 'jefe' | 'boca' | 'observatorio' | 'sueno' | 'gabinete' | 'astro'; // sueno = las Tierras del Sueño (v0.51); gabinete = minijuegos de física del Abismo (v0.53) // boca = el Sacamuelas Ciego; observatorio = el Astrónomo de Providence (sólo en el Abismo)

/** Efecto temporal (bendición o maldición) que dura N combates */
export interface Effect {
  id: string;
  left: number;
}

export interface MapNode {
  id: number;
  floor: number;
  lane: number;
  type: NodeType;
  next: number[];
  astro?: string; // v0.59 · nodo «astro»: qué planeta espera ahí (src/data/astros.ts)
}

export interface Run {
  runId: string;
  acto: number;
  hp: number;
  maxHp: number;
  deck: CardInst[];
  relics: string[];
  map: MapNode[];
  pos: number; // id del nodo actual, -1 = inicio
  visited: number[];
  floor: number; // pisos completados
  score: number;
  stats: { combates: number; elites: number; runasOk: number; runasTotal: number; ergiosTotal?: number; kills?: number; racha?: number; rachaMax?: number; perfectos?: number };
  gravity: number; // nivel de gravedad (1 = Tierra)
  clase: string; // 'caballero' | 'arcanista' | 'penitente'
  ergios: number;
  effects: Effect[];
  shop?: ShopState;
  encargo?: { id: string; acto: number; hecho: boolean }; // contrato del tablón (src/data/encargos.ts)
  boons: { id: string; epic: boolean }[]; // dones de figuras históricas
  met: string[]; // figuras ya encontradas en esta expedición
  seen?: string[]; // encuentros y dilemas ya vistos en esta expedición
  familiar?: { id: string; left: number } | null; // criatura que te acompaña
  familiarOferta?: { id: string; left: number }; // v0.52 · otro familiar quiere unirse: el jugador elige (src/ui/familiarElegir.ts)
  nextUid: number;
  done: boolean;
  debug?: boolean; // partida de prueba del Modo profesor: no se registra
  pociones?: string[]; // frascos (máx. 3)
  temas?: Record<string, { ok: number; total: number }>; // aciertos por concepto (para el repaso final)
  entropia?: number; // Entropía mental 0–100 (src/data/abismo.ts)
  entropiaMax?: number; // la Locura más alta de la expedición (logros)
  prohibidos?: string[]; // Problemas Prohibidos leídos del Necronomicón
  amPacto?: number; // runas que AM puede resolver por ti
  aliado?: string; // alma en pena que te acompaña (src/data/almas.ts); sólo una por expedición
  /** v0.30 · huellas de compañeros del grupo para el acto actual (lápidas y signos) */
  huellas?: { acto: number; lapidas: import('./api').Huella[]; signos: import('./api').Huella[]; honradas: number[] };
  /** v0.30 · fantasma de un compañero invocado para el jefe del acto */
  fantasma?: { id: number; alias: string; avatar: string; acto: number };
  /** último concepto que fallaste (se escribe en tu lápida) */
  ultimoFallo?: string;
  /** v0.32.2: reliquia recién ganada que te pasó del límite (se elige cuál descartar en la capa superior) */
  reliquiaNueva?: string;
  finalizado?: boolean; // ya se sumaron los bonos finales
  desglose?: Record<string, number>; // de dónde salió el puntaje (src/data/puntaje.ts)
  tiempo?: number; // segundos de juego activo (para la hoja «Resumen» y «Actividad»)
  /** El Abismo de los Ejes (acto 5): modo aparte, por ahora sólo en el Modo profesor */
  modo?: 'abismo';
  necro?: string; // página del Necronomicón elegida al inicio (src/data/abismo_modo.ts)
  pacto?: string; // mazo inicial elegido (Pacto)
  diario?: number; // hojas del diario de Montemayor ya leídas en esta expedición (src/ui/diario.ts)
  tramo?: number; // El Descenso: tramo actual (1–4; 5+ = modo infinito)
  jefe?: string; // jefe del tramo actual (sacado al azar)
  jefesVistos?: string[]; // jefes que ya salieron en esta partida (para no repetir)
  cosmos?: Record<string, number>; // v0.43 · niveles de constelación del Observatorio (astro → niveles extra)
  carta?: { id: string; tramo: number; hecho?: boolean; cobrada?: boolean }; // v0.43 · carta del Astrónomo de Providence
  deuda?: { monto: number; tramo: number }; // v0.61 · préstamo del Prestamista: se cobra al terminar el tramo
  alineacion?: number; // v0.61 · tramo con Alineación Planetaria (+1 J en el primer turno de cada combate)
  astrosVistos?: string[]; // v0.59 · astros ambulantes ya enfrentados en esta partida (no se repiten)
  telescopio?: number; // v0.58 · combates que te quedan con el telescopio prestado del Astrónomo (ves las intenciones ocultas)
  hojaSegura?: boolean; // v0.58 · el Astrónomo te señaló una hoja de Montemayor: la encuentras al volver al mapa
  bonoDientesHp?: number; // v0.43 · vida máxima que dan los dientes (Sarro, Branquia), para ajustarla al cambiar la dentadura
  cristalesRotos?: string[]; // v0.43 · cartas de Cristal que se rompieron (Herbert West las reanima)
  apuntes?: number; // v0.44 · pistas gratis que dan las hojas del diario de Montemayor
  aliadoTramo?: number; // v0.49 · el aliado es un alma del Abismo: se va al terminar este tramo
  mordidos?: number[]; // v0.52 · huecos de la dentadura mordidos por el jefe en la pelea actual (para verlos en la dentadura)
  suenoHp?: number; // v0.51 · vida al entrar a una pesadilla (al despertar se recupera)
  mutador?: string; // v0.46 · regla especial del tramo actual (src/data/abismo_modo.ts → MUTADORES)
  dientePendiente?: string; // v0.44 · diente ganado con la dentadura llena: se acomoda al volver al mapa
  dientes?: (string | null)[]; // v0.42 · la Dentadura de Montemayor (8 huecos, el orden importa; src/data/dientes.ts)
}

export interface ShopItem {
  price: number;
  sold: boolean;
}
export interface ShopState {
  node: number;
  cards: (ShopItem & { id: string; up: boolean })[];
  relic: (ShopItem & { id: string }) | null;
  familiar?: (ShopItem & { id: string }) | null;
  pociones?: (ShopItem & { id: string })[];
  heal: ShopItem;
  remove: ShopItem;
  discount: boolean;
  haggled: boolean;
  vendidas?: number; // cartas que le vendiste en esta visita (máx. 2)
  ambulante?: boolean; // mercader ambulante (encuentro)
}

export const FLOORS = 12; // pisos antes del jefe (cada acto tiene FLOORS + 1 nodos de profundidad)
export const LANES = 5;

/** Lo descubierto por el alumno (persiste entre expediciones) */
export interface Codex {
  enemies: string[];
  npcs: string[];
  figures: string[];
  cards: string[];
  relics: string[];
  boons: string[];
  effects: string[];
  gravedadMax: number; // nivel de gravedad más alto vencido (0 = ninguno)
  victorias: number;
  flags?: string[]; // logros: 'acto1' (venció al Coloso), 'acto2'
  xp?: number; // Conocimiento acumulado (desbloqueos entre expediciones)
  tiempo?: number; // segundos de juego activo en total (se muestra en el menú)
  am?: { visitas: number; pactos: number; rechazos: number; ultima?: string; vistas?: number[] }; // lo que AM recuerda de ti
  hib?: number; // veces que ha vencido a Hibbelerius (con 2 se abre el Núcleo del Cálculo)
  curva?: number; // versión de la curva de niveles con la que se guardó (2 = v0.22)
  nivelPiso?: number; // nivel que ya tenía con la curva anterior (nunca se pierde)
  afinidad?: Record<string, number>; // veces que elegiste a cada eco (relaciones)
  mGanado?: number; // Momentum ganado en total (Tienda de Layla)
  mGastado?: number; // Momentum gastado en total
  compras?: string[]; // accesorios y cosméticos comprados a Layla
  regalo?: string; // último día (AAAA-MM-DD) en que Layla dio su regalo diario
  expediciones?: number; // expediciones terminadas (muerte o victoria); abre la Tienda de Layla
  bajas?: Record<string, number>; // v0.31.2: enemigos vencidos por id (pantalla de Estadísticas)
  diag?: { pre?: number; post?: number; total?: number; version?: number }; // v0.32: diagnóstico inicial y final (aciertos)
  cartasProvidence?: number; // v0.46: cartas del Astrónomo de Providence cumplidas (logro)
  suenos?: string[]; // v0.51: sueños distintos que has soñado (src/data/relatos.ts → SUENOS)
  diario?: number; // v0.45: última hoja del diario de Montemayor encontrada (índice en PROLOGO; la 0 se lee al empezar)
}
export type CodexKind = 'enemies' | 'npcs' | 'figures' | 'cards' | 'relics' | 'boons' | 'effects';

export function emptyCodex(): Codex {
  return { enemies: [], npcs: [], figures: [], cards: [], relics: [], boons: [], effects: [], gravedadMax: 0, victorias: 0, flags: [] };
}

export function mergeCodex(a: Partial<Codex> | null | undefined, b: Partial<Codex> | null | undefined): Codex {
  const c = emptyCodex();
  for (const k of ['enemies', 'npcs', 'figures', 'cards', 'relics', 'boons', 'effects'] as CodexKind[]) {
    c[k] = [...new Set([...(a?.[k] ?? []), ...(b?.[k] ?? [])])];
  }
  c.gravedadMax = Math.max(a?.gravedadMax ?? 0, b?.gravedadMax ?? 0);
  c.victorias = Math.max(a?.victorias ?? 0, b?.victorias ?? 0);
  c.flags = [...new Set([...(a?.flags ?? []), ...(b?.flags ?? [])])];
  c.xp = Math.max(a?.xp ?? 0, b?.xp ?? 0);
  c.tiempo = Math.max(a?.tiempo ?? 0, b?.tiempo ?? 0);
  const hib = Math.max(a?.hib ?? 0, b?.hib ?? 0);
  const af: Record<string, number> = { ...(a?.afinidad ?? {}) };
  for (const [k, v] of Object.entries(b?.afinidad ?? {})) af[k] = Math.max(af[k] ?? 0, v);
  if (Object.keys(af).length) c.afinidad = af;
  // Momentum: ganado y gastado sólo crecen, así que se combinan con el máximo
  c.mGanado = Math.max(a?.mGanado ?? 0, b?.mGanado ?? 0);
  c.mGastado = Math.max(a?.mGastado ?? 0, b?.mGastado ?? 0);
  c.expediciones = Math.max(a?.expediciones ?? 0, b?.expediciones ?? 0);
  const bajas: Record<string, number> = { ...(a?.bajas ?? {}) };
  for (const [k, v] of Object.entries(b?.bajas ?? {})) bajas[k] = Math.max(bajas[k] ?? 0, v);
  if (Object.keys(bajas).length) c.bajas = bajas;
  if (a?.diag || b?.diag) c.diag = { ...(b?.diag ?? {}), ...(a?.diag ?? {}) }; // el primer registro manda
  c.compras = [...new Set([...(a?.compras ?? []), ...(b?.compras ?? [])])];
  const rg = [a?.regalo ?? '', b?.regalo ?? ''].sort().pop();
  if (rg) c.regalo = rg;
  // curva de niveles v0.22: quien ya tenía un nivel con la curva vieja lo conserva
  const piso = (x: Partial<Codex> | null | undefined) => (!x ? 0 : Math.max(x.nivelPiso ?? 0, (x.curva ?? 1) < 2 ? nivelDeV1(x.xp ?? 0) : 0));
  const np = Math.max(piso(a), piso(b));
  if (np > 1) c.nivelPiso = np;
  c.curva = 2;
  if (hib) c.hib = hib;
  const am = (a?.am?.visitas ?? 0) >= (b?.am?.visitas ?? 0) ? a?.am : b?.am;
  if (am) c.am = am;
  // v0.56 · ARREGLO: estos campos del Abismo no se combinaban y se perdían al iniciar sesión
  const diario = Math.max(a?.diario ?? 0, b?.diario ?? 0);
  if (diario) c.diario = diario;
  const cp = Math.max(a?.cartasProvidence ?? 0, b?.cartasProvidence ?? 0);
  if (cp) c.cartasProvidence = cp;
  const sueños = [...new Set([...(a?.suenos ?? []), ...(b?.suenos ?? [])])];
  if (sueños.length) c.suenos = sueños;
  return c;
}

export const Game = {
  profile: null as Profile | null,
  run: null as Run | null,
  codex: emptyCodex(),
  /** v0.60 · armando una expedición nueva (sobres, pactos): Game.run todavía es la partida anterior, así que su Locura no cuenta */
  preparando: false,
};

let codexDirty = false;

/** Marca algo como descubierto en el Grimorio */
export function unlock(kind: CodexKind, id: string) {
  const list = Game.codex[kind];
  if (!list.includes(id)) {
    list.push(id);
    codexDirty = true;
  }
}

export function codexFlag(flag: string) {
  const f = (Game.codex.flags ??= []);
  if (!f.includes(flag)) {
    f.push(flag);
    codexDirty = true;
  }
}

/** Nivel de Conocimiento del alumno (desbloqueos) */
export function nivelActual() {
  return Math.max(nivelDe(Game.codex.xp ?? 0), Game.codex.nivelPiso ?? 0);
}

/** Suma Conocimiento y marca el Grimorio para sincronizar */
export function addConocimiento(n: number) {
  Game.codex.xp = (Game.codex.xp ?? 0) + n;
  codexDirty = true;
}

/** ¿El usuario actual es administrador (Modo profesor)? Requiere sesión en línea. */
export function isAdmin() {
  const p = Game.profile;
  return !!p && ADMINS.includes(String(p.matricula).trim()) && (!p.offline || import.meta.env.DEV);
}

/** Total de pisos de la expedición (3 actos de 9) */
export const TOTAL_PISOS = 3 * (FLOORS + 1);
export const ROMAN = ['I', 'II', 'III', 'IV', 'Ab'];

/** Victorias sobre Hibbelerius necesarias para que se abra el Núcleo del Cálculo (Acto IV) */
export const NUCLEO_VICTORIAS = 2;
/** Pisos del Acto IV (más corto, pero más difícil) */
export const PISOS_NUCLEO = 8;
/** Pisos antes del jefe en cada acto */
export function pisosDe(acto = 1) {
  return acto === 5 ? PISOS_TRAMO_ABISMO : acto >= 4 ? PISOS_NUCLEO : FLOORS;
}
/** Pisos de cada tramo del Abismo (= PISOS_TRAMO de src/data/abismo_modo.ts) */
export const PISOS_TRAMO_ABISMO = 10;
/** Expediciones terminadas. Para cuentas anteriores a v0.29 (sin contador) se estima con lo que ya hay. */
export function expediciones() {
  const c = Game.codex;
  if (c.expediciones !== undefined) return c.expediciones;
  return Math.max(c.victorias ?? 0, (c.xp ?? 0) > 0 || (c.mGanado ?? 0) > 0 ? 1 : 0);
}
/** Un enemigo vencido más (no cuenta en el modo profesor) */
export function contarBaja(id: string) {
  if (Game.run?.debug) return;
  const b = (Game.codex.bajas ??= {});
  b[id] = (b[id] ?? 0) + 1;
  codexDirty = true;
}
export function contarExpedicion() {
  Game.codex.expediciones = expediciones() + 1;
  codexDirty = true;
}
/** La Tienda de Layla abre cuando regresas de tu primera expedición */
export const tiendaAbierta = () => expediciones() > 0 || isAdmin();
/** Momentum disponible (Tienda de Layla) */
export function momentum() {
  return Math.max(0, (Game.codex.mGanado ?? 0) - (Game.codex.mGastado ?? 0));
}
export function ganarMomentum(n: number) {
  if (n <= 0) return;
  Game.codex.mGanado = (Game.codex.mGanado ?? 0) + n;
  codexDirty = true;
}
/** Compra a Layla: descuenta Momentum y guarda el artículo. Devuelve false si no alcanza. */
export function comprar(id: string, precio: number) {
  if (momentum() < precio || (Game.codex.compras ?? []).includes(id)) return false;
  Game.codex.mGastado = (Game.codex.mGastado ?? 0) + precio;
  (Game.codex.compras ??= []).push(id);
  codexDirty = true;
  saveLocal();
  return true;
}
/** v0.36 · agrega artículos ya pagados (las piezas de un set) */
export function otorgar(ids: string[]) {
  const c = (Game.codex.compras ??= []);
  for (const id of ids) if (!c.includes(id)) c.push(id);
  codexDirty = true;
  saveLocal();
}
/** Regalo diario de Layla: devuelve cuánto dio (0 si ya lo dio hoy) */
export function regaloDiario(n: number) {
  const d = new Date();
  const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (Game.codex.regalo === hoy) return 0;
  Game.codex.regalo = hoy;
  ganarMomentum(n);
  saveLocal();
  return n;
}

/** El eco recuerda que lo elegiste (afinidad entre expediciones) */
export function sumarAfinidad(fig: string) {
  const af = (Game.codex.afinidad ??= {});
  af[fig] = (af[fig] ?? 0) + 1;
  codexDirty = true;
}
/** Cuenta una victoria sobre Hibbelerius (los que lo vencieron antes de v0.20 cuentan como 1) */
/** v0.45 · Siguiente hoja del diario que falta encontrar (null si ya están todas) y la marca como encontrada */
export function encontrarHoja(total: number): number | null {
  const i = (Game.codex.diario ?? 0) + 1;
  if (i >= total) return null;
  Game.codex.diario = i;
  codexDirty = true;
  return i;
}

/** v0.46 · Da un artículo del Vestidor sin pasar por la tienda (premios por logros) */
export function darCompra(id: string) {
  const c = (Game.codex.compras ??= []);
  if (!c.includes(id)) { c.push(id); codexDirty = true; }
}
/** v0.46 · Una carta de Providence cumplida más (logro «Corresponsal») */
export function contarCartaProvidence() {
  Game.codex.cartasProvidence = (Game.codex.cartasProvidence ?? 0) + 1;
  codexDirty = true;
}

export function contarHib() {
  Game.codex.hib = (Game.codex.hib ?? ((Game.codex.flags ?? []).includes('acto3') ? 1 : 0)) + 1;
  codexDirty = true;
}
/** ¿Ya venció a AM? (desbloquea las cartas de cálculo, cosméticos de latón y la insignia) */
export function amVencido() {
  return (Game.codex.flags ?? []).includes('acto4');
}
/** Guarda la insignia de AM en el avatar (viaja al ranking con el avatar; no requiere cambiar Code.gs) */
export function otorgarInsigniaAM() {
  const p = Game.profile;
  if (!p?.avatar || p.avatar.insignia === 'am') return;
  p.avatar.insignia = 'am';
  saveLocal();
  if (!p.offline) enqueue('saveProfile', { token: p.token, alias: p.avatar.alias, avatar: JSON.stringify(p.avatar) });
}
/** Ojo morado: venció a un Primigenio en el Abismo (viaja al ranking con el avatar) */
export function otorgarInsigniaAbismo() {
  codexFlag('abismo_primigenio');
  const p = Game.profile;
  if (!p?.avatar || p.avatar.insignia2 === 'abismo') return;
  p.avatar.insignia2 = 'abismo';
  saveLocal();
  if (!p.offline) enqueue('saveProfile', { token: p.token, alias: p.avatar.alias, avatar: JSON.stringify(p.avatar) });
}

/** ¿Ya puede entrar al Núcleo? (venció a Hibbelerius al menos NUCLEO_VICTORIAS veces) */
export function nucleoDisponible() {
  return (Game.codex.hib ?? 0) >= NUCLEO_VICTORIAS;
}

/** ¿El Arcanista está desbloqueado? (al vencer al Coloso al menos una vez) */
export function arcanistaUnlocked() {
  return (Game.codex.flags ?? []).includes('acto1') || Game.codex.victorias > 0;
}

/** ¿El Penitente del Empuje está desbloqueado? (al vencer a Hibbelerius al menos una vez) */
export function penitenteUnlocked() {
  return Game.codex.victorias > 0;
}

/** Clase con la que se puede jugar (si la elegida aún está bloqueada, Caballero) */
export function claseJugable(clase?: string) {
  if (clase === 'arcanista' && arcanistaUnlocked()) return 'arcanista';
  if (clase === 'penitente' && penitenteUnlocked()) return 'penitente';
  return 'caballero';
}

export function codexWin(gravedad: number) {
  Game.codex.victorias++;
  Game.codex.gravedadMax = Math.max(Game.codex.gravedadMax, gravedad);
  codexDirty = true;
}

/** Envía el Grimorio al servidor si cambió (se llama al guardar) */
function syncCodex() {
  if (!codexDirty || !Game.profile || Game.profile.offline || !isOnline()) return;
  codexDirty = false;
  enqueue('saveCodex', { token: Game.profile.token, grimorio: JSON.stringify(Game.codex) });
}

// ── almacenamiento local (siempre protegido) ──
const key = () => `criptas:${Game.profile?.matricula ?? 'invitado'}`;

export function saveLocal() {
  try {
    localStorage.setItem(key(), JSON.stringify({ avatar: Game.profile?.avatar, run: Game.run, codex: Game.codex }));
  } catch { /* sin almacenamiento disponible */ }
  syncCodex();
}

export function loadLocal(): { avatar: Avatar | null; run: Run | null; codex?: Codex } {
  try {
    const raw = localStorage.getItem(key());
    if (raw) {
      const d = JSON.parse(raw);
      d.run = migrateRun(d.run);
      return d;
    }
  } catch { /* nada */ }
  return { avatar: null, run: null };
}

export function rememberSession() {
  try {
    if (Game.profile) sessionStorage.setItem('criptas:session', JSON.stringify(Game.profile));
  } catch { /* nada */ }
}
export function restoreSession(): Profile | null {
  try {
    const raw = sessionStorage.getItem('criptas:session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function clearSession() {
  try { sessionStorage.removeItem('criptas:session'); } catch { /* nada */ }
}

// ── mapa ──
export function generateMap(acto = 1): MapNode[] {
  const FLOORS = pisosDe(acto); // el Acto IV es más corto
  const nodes = new Map<string, MapNode>();
  let id = 0;
  const get = (f: number, l: number) => {
    const k = `${f}:${l}`;
    if (!nodes.has(k)) nodes.set(k, { id: id++, floor: f, lane: l, type: 'combate', next: [] });
    return nodes.get(k)!;
  };
  const starts = new Set<number>();
  while (starts.size < 3) starts.add(Math.floor(Math.random() * LANES));
  const paths = [...starts, Math.floor(Math.random() * LANES)];
  for (const s of paths) {
    let lane = s;
    let prev: MapNode | null = null;
    for (let f = 0; f < FLOORS; f++) {
      const n = get(f, lane);
      if (prev && !prev.next.includes(n.id)) prev.next.push(n.id);
      prev = n;
      lane = Math.max(0, Math.min(LANES - 1, lane + Math.floor(Math.random() * 3) - 1));
    }
  }
  const boss: MapNode = { id: id++, floor: FLOORS, lane: 2, type: 'jefe', next: [] };
  const list = [...nodes.values()];
  for (const n of list) if (n.floor === FLOORS - 1) n.next = [boss.id];
  // vecinos (padres e hijos) para no poner dos lugares de descanso seguidos
  const byId = new Map(list.map((n) => [n.id, n]));
  const parents = new Map<number, MapNode[]>();
  for (const n of list) for (const c of n.next) if (byId.has(c)) (parents.get(c) ?? parents.set(c, []).get(c)!).push(n);
  const vecinos = (n: MapNode) => [...(parents.get(n.id) ?? []), ...n.next.map((c) => byId.get(c)).filter((x): x is MapNode => !!x)];
  // «descanso»: ecos, fogatas y mercaderes. Nunca dos seguidos en un camino.
  const DESCANSO: NodeType[] = ['santuario', 'fogata']; // (el mercader y la taberna ya pueden quedar junto a ellos)
  const choca = (n: MapNode, t: NodeType) => DESCANSO.includes(t) && vecinos(n).some((v) => DESCANSO.includes(v.type));
  // topes por mapa (un poco al azar para que cada mapa sea distinto)
  const tope: Partial<Record<NodeType, number>> = {
    santuario: 2 + (Math.random() < 0.35 ? 1 : 0),
    fogata: 2 + (Math.random() < 0.5 ? 1 : 0), // sin contar la fila de fogatas antes del jefe
    mercader: acto === 5 ? 2 : 3,
    taberna: 2,
    elite: acto === 5 ? 4 : acto >= 2 ? 5 : 4,
  };
  const cuenta = (t: NodeType) => list.filter((n) => n.type === t && !(t === 'fogata' && n.floor === FLOORS - 1)).length;
  for (const n of list) n.type = n.floor === FLOORS - 1 ? 'fogata' : 'combate';
  // se reparte en orden aleatorio, respetando topes y vecinos
  for (const n of Phaser.Utils.Array.Shuffle([...list])) {
    if (n.floor === 0 || n.floor === FLOORS - 1) continue;
    const r = Math.random();
    let t: NodeType;
    if (n.floor <= 3) t = r < 0.52 ? 'combate' : r < 0.72 ? 'evento' : r < 0.8 ? 'santuario' : r < 0.92 ? 'runa' : 'fogata';
    else t = r < 0.36 ? 'combate' : r < 0.52 ? 'elite' : r < 0.66 ? 'evento' : r < 0.74 ? 'runa' : r < 0.82 ? 'mercader' : r < 0.86 ? 'taberna' : r < 0.93 ? 'santuario' : 'fogata';
    if (t === 'fogata' && n.floor < 3) t = 'evento';
    if (t === 'fogata' && n.floor === FLOORS - 2) t = 'combate'; // ya hay fogatas justo antes del jefe
    if ((tope[t] !== undefined && cuenta(t) >= tope[t]!) || choca(n, t)) t = Math.random() < 0.6 ? 'combate' : 'evento';
    n.type = t;
  }
  // garantías mínimas (sólo sobre combates que no queden pegados a otro descanso)
  const ensure = (type: NodeType, count: number, floors: [number, number]) => {
    const cands = Phaser.Utils.Array.Shuffle(list.filter((n) => n.floor >= floors[0] && n.floor <= floors[1] && n.type === 'combate'));
    for (const n of cands) {
      if (cuenta(type) >= count) break;
      if (!choca(n, type)) n.type = type;
    }
  };
  if (acto === 5) {
    // tramos del Abismo (8 pisos): sin taberna; en su lugar, el Sacamuelas Ciego (dientes)
    for (const n of list) if (n.type === 'taberna') n.type = 'boca';
    ensure('elite', 3, [3, FLOORS - 2]);
    // v0.59 · Astros Ambulantes (1 o 2 por tramo); van antes que los demás para que siempre quepan
    ensure('astro', Math.random() < 0.5 ? 2 : 1, [2, FLOORS - 2]);
    ensure('runa', 2, [1, FLOORS - 3]);
    ensure('evento', 3, [1, FLOORS - 2]);
    ensure('mercader', 1, [2, FLOORS - 2]);
    ensure('santuario', 1, [1, FLOORS - 3]);
    ensure('boca', 1, [2, FLOORS - 2]);
    ensure('observatorio', 1, [3, FLOORS - 2]);
    ensure('sueno', 1, [2, FLOORS - 2]); // v0.51 · las Tierras del Sueño
    ensure('gabinete', 1, [1, FLOORS - 2]); // v0.53 · el Gabinete de Montemayor (minijuegos)
    return [...list, boss];
  }
  ensure('elite', acto >= 2 ? 3 : 2, [5, FLOORS - 2]);
  ensure('runa', 2, [1, FLOORS - 3]);
  ensure('evento', 3, [1, FLOORS - 2]);
  ensure('mercader', 1, [3, 6]); // una tienda a mitad del camino…
  ensure('mercader', 2, [7, FLOORS - 2]); // …y otra cerca del jefe
  ensure('taberna', 1, [2, FLOORS - 3]); // la Taberna de los minijuegos
  ensure('santuario', 1, [2, FLOORS - 3]);
  ensure('fogata', 1, [5, FLOORS - 3]);
  return [...list, boss];
}

/** v0.43 · Ajusta la Vida máxima según los dientes que la cambian (Diente con Sarro +8, Branquia del Profundo +12) */
export function aplicarSarro(r: Run) {
  // logro «Sonrisa completa»: los 8 huecos llenos
  if (!r.debug && (r.dientes ?? []).filter(Boolean).length >= 8) codexFlag('logro_dentadura');
  const quiere = 8 * nivelDiente(r.dientes, 'sarro') + 12 * nivelDiente(r.dientes, 'branquia');
  const delta = quiere - (r.bonoDientesHp ?? 0);
  if (!delta) return;
  r.bonoDientesHp = quiere;
  r.maxHp += delta;
  r.hp = Math.max(1, Math.min(r.maxHp, r.hp + Math.max(0, delta)));
}

export function newRun(runId: string, gravity = 1, clase = 'caballero'): Run {
  const baseHp = (CLASSES.find((c) => c.id === clase)?.hp ?? 70) + (gravityOf(gravity).startHp - 70);
  let uid = 1;
  return {
    runId,
    acto: 1,
    hp: baseHp,
    maxHp: baseHp,
    deck: starterDeck(clase).map((id) => ({ uid: uid++, id, up: false })),
    relics: [],
    map: generateMap(),
    pos: -1,
    visited: [],
    floor: 0,
    score: 0,
    stats: { combates: 0, elites: 0, runasOk: 0, runasTotal: 0, ergiosTotal: 0 },
    gravity,
    clase,
    ergios: 25,
    effects: [],
    boons: [],
    met: [],
    seen: [],
    familiar: null,
    nextUid: uid,
    done: false,
  };
}

export function addCard(id: string, up = false, ed?: import('./data/cards').Edicion) {
  const r = Game.run!;
  unlock('cards', id);
  r.deck.push(ed ? { uid: r.nextUid++, id, up, ed } : { uid: r.nextUid++, id, up });
}

/** ¿La partida actual es de El Abismo de los Ejes? */
export function enAbismo() {
  return Game.run?.modo === 'abismo';
}

// ── registro docente ──
export function logEvent(tipo: string, concepto = '', correcto: boolean | '' = '', detalle: Record<string, unknown> = {}) {
  if (!Game.profile || Game.profile.offline || !isOnline() || Game.run?.debug) return;
  enqueue('logEvent', {
    token: Game.profile.token,
    runId: Game.run?.runId ?? '',
    tipo,
    concepto,
    correcto,
    detalle: JSON.stringify(detalle),
  });
}

export function syncRun(resultado: 'en curso' | 'derrota' | 'victoria' | 'abandonada', causa = '') {
  const r = Game.run;
  if (!r || !Game.profile || Game.profile.offline || !isOnline() || r.debug) return;
  enqueue('updateRun', {
    token: Game.profile.token,
    runId: r.runId,
    acto: r.acto,
    piso: r.modo === 'abismo' ? ((r.tramo ?? 1) - 1) * (PISOS_TRAMO_ABISMO + 1) + r.floor : (r.acto - 1) * (FLOORS + 1) + r.floor,
    vida: r.hp,
    puntaje: r.score,
    resultado,
    causa,
    combates: r.stats.combates,
    elites: r.stats.elites,
    runasOk: r.stats.runasOk,
    runasTotal: r.stats.runasTotal,
    mazo: r.deck.length,
    gravedad: r.gravity,
    minutos: Math.round((r.tiempo ?? 0) / 6) / 10,
    clase: r.clase, // por si la partida no se registró al iniciar (el servidor la crea)
  });
}

/** Sube o baja la Entropía mental (0–100). Devuelve el cambio real. */
export function addEntropia(n: number) {
  const r = Game.run;
  if (!r) return 0;
  const antes = r.entropia ?? 0;
  r.entropia = Math.max(0, Math.min(100, antes + n));
  r.entropiaMax = Math.max(r.entropiaMax ?? 0, r.entropia); // logro «Mente lúcida»
  return r.entropia - antes;
}

export function addErgios(n: number) {
  const r = Game.run!;
  r.ergios += n;
  if (n > 0) r.stats.ergiosTotal = (r.stats.ergiosTotal ?? 0) + n;
}

/** Nivel de un don: 0 = no lo tienes, 1 = común, 2 = épico */
export function boonLevel(id: string): number {
  const b = Game.run?.boons.find((x) => x.id === id);
  return b ? (b.epic ? 2 : 1) : 0;
}

export function addEffect(id: string, combats: number) {
  unlock('effects', id);
  const r = Game.run!;
  const e = r.effects.find((x) => x.id === id);
  if (e) e.left += combats;
  else r.effects.push({ id, left: combats });
}

/** Normaliza partidas guardadas con versiones anteriores */
export function migrateRun(r: Run | null): Run | null {
  if (!r) return r;
  r.ergios ??= 25;
  r.effects ??= [];
  r.visited ??= [];
  r.boons ??= [];
  r.gravity ??= 1;
  r.clase ??= 'caballero';
  r.acto ??= 1;
  r.met ??= [];
  r.seen ??= [];
  r.temas ??= {};
  r.pociones ??= [];
  r.familiar ??= null;
  return r;
}

/** Te acompaña una criatura (reemplaza a la anterior). id 'random' = al azar */
export function addFamiliar(id: string, combats?: number): string {
  const r = Game.run!;
  const pool = FAMILIAR_POOL.filter((f) => f !== r.familiar?.id);
  const fid = id === 'random' ? pool[Math.floor(Math.random() * pool.length)] : id;
  const left = combats ?? FAMILIARS[fid].combats;
  if (r.familiar && r.familiar.left > 0 && r.familiar.id !== fid) {
    // v0.52 · ya tienes uno: no se reemplaza solo, el jugador elige al volver al mapa
    r.familiarOferta = { id: fid, left };
    return fid;
  }
  r.familiar = { id: fid, left };
  unlock('npcs', `fam_${fid}`);
  return fid;
}

/** v0.51 · Anota un sueño soñado (para los logros y cosméticos del sueño) */
export function sonarSueno(id: string) {
  const v = (Game.codex.suenos ??= []);
  if (!v.includes(id)) v.push(id);
  saveLocal();
}
