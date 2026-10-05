import Phaser from 'phaser';
import { CardInst, starterDeck } from './data/cards';
import { CLASSES } from './data/classes';
import { enqueue, isOnline } from './api';
import { gravityOf } from './data/gravity';
import { FAMILIAR_POOL, FAMILIARS } from './data/familiars';
import { ADMINS } from './config';

export interface Avatar {
  alias: string;
  clase: string;
  helm: string;
  cape: number;
  armor?: number;
  visor?: number;
}

export interface Profile {
  matricula: string;
  grupo: string;
  token: string;
  offline: boolean;
  avatar: Avatar | null;
}

export type NodeType = 'combate' | 'elite' | 'fogata' | 'runa' | 'evento' | 'mercader' | 'santuario' | 'jefe';

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
  stats: { combates: number; elites: number; runasOk: number; runasTotal: number; ergiosTotal?: number };
  gravity: number; // nivel de gravedad (1 = Tierra)
  clase: string; // 'caballero' | 'arcanista'
  ergios: number;
  effects: Effect[];
  shop?: ShopState;
  boons: { id: string; epic: boolean }[]; // dones de figuras históricas
  met: string[]; // figuras ya encontradas en esta expedición
  seen?: string[]; // encuentros y dilemas ya vistos en esta expedición
  familiar?: { id: string; left: number } | null; // criatura que te acompaña
  nextUid: number;
  done: boolean;
  debug?: boolean; // partida de prueba del Modo profesor: no se registra
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
  heal: ShopItem;
  remove: ShopItem;
  discount: boolean;
  haggled: boolean;
}

export const FLOORS = 8; // pisos antes del jefe
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
  return c;
}

export const Game = {
  profile: null as Profile | null,
  run: null as Run | null,
  codex: emptyCodex(),
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

/** ¿El usuario actual es administrador (Modo profesor)? Requiere sesión en línea. */
export function isAdmin() {
  const p = Game.profile;
  return !!p && ADMINS.includes(String(p.matricula).trim()) && (!p.offline || import.meta.env.DEV);
}

/** Total de pisos de la expedición (3 actos de 9) */
export const TOTAL_PISOS = 27;
export const ROMAN = ['I', 'II', 'III'];

/** ¿El Arcanista está desbloqueado? (al vencer al Coloso al menos una vez) */
export function arcanistaUnlocked() {
  return (Game.codex.flags ?? []).includes('acto1') || Game.codex.victorias > 0;
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
  for (const n of list) {
    if (n.floor === FLOORS - 1) n.next = [boss.id];
    const r = Math.random();
    if (n.floor === 0) n.type = 'combate';
    else if (n.floor === FLOORS - 1) n.type = 'fogata';
    else if (n.floor <= 2) n.type = r < 0.45 ? 'combate' : r < 0.63 ? 'evento' : r < 0.75 ? 'santuario' : r < 0.88 ? 'runa' : 'fogata';
    else n.type = r < 0.36 ? 'combate' : r < 0.52 ? 'elite' : r < 0.66 ? 'evento' : r < 0.75 ? 'runa' : r < 0.83 ? 'mercader' : r < 0.92 ? 'santuario' : 'fogata';
  }
  // garantías: una élite, una runa, dos encuentros y un mercader alcanzables
  const by = (f: (n: MapNode) => boolean) => Phaser.Utils.Array.Shuffle(list.filter(f));
  const ensure = (type: NodeType, count: number, floors: [number, number]) => {
    const have = list.filter((n) => n.type === type).length;
    const cands = by((n) => n.floor >= floors[0] && n.floor <= floors[1] && n.type === 'combate');
    for (let i = have; i < count && cands.length; i++) cands.pop()!.type = type;
  };
  ensure('elite', acto >= 2 ? 2 : 1, [3, 6]);
  ensure('runa', 1, [1, 5]);
  ensure('evento', 2, [1, 6]);
  ensure('mercader', 1, [3, 5]);
  ensure('santuario', 2, [1, 6]);
  return [...list, boss];
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

export function addCard(id: string, up = false) {
  const r = Game.run!;
  unlock('cards', id);
  r.deck.push({ uid: r.nextUid++, id, up });
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
    piso: (r.acto - 1) * (FLOORS + 1) + r.floor,
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
  });
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
  r.familiar ??= null;
  return r;
}

/** Te acompaña una criatura (reemplaza a la anterior). id 'random' = al azar */
export function addFamiliar(id: string, combats?: number): string {
  const r = Game.run!;
  const pool = FAMILIAR_POOL.filter((f) => f !== r.familiar?.id);
  const fid = id === 'random' ? pool[Math.floor(Math.random() * pool.length)] : id;
  r.familiar = { id: fid, left: combats ?? FAMILIARS[fid].combats };
  unlock('npcs', `fam_${fid}`);
  return fid;
}
