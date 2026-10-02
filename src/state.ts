import Phaser from 'phaser';
import { CardInst, STARTER_DECK } from './data/cards';
import { enqueue, isOnline } from './api';

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

export type NodeType = 'combate' | 'elite' | 'fogata' | 'runa' | 'evento' | 'mercader' | 'jefe';

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
  ergios: number;
  effects: Effect[];
  shop?: ShopState;
  nextUid: number;
  done: boolean;
}

export interface ShopItem {
  price: number;
  sold: boolean;
}
export interface ShopState {
  node: number;
  cards: (ShopItem & { id: string; up: boolean })[];
  relic: (ShopItem & { id: string }) | null;
  heal: ShopItem;
  remove: ShopItem;
  discount: boolean;
  haggled: boolean;
}

export const FLOORS = 8; // pisos antes del jefe
export const LANES = 5;

export const Game = {
  profile: null as Profile | null,
  run: null as Run | null,
};

// ── almacenamiento local (siempre protegido) ──
const key = () => `criptas:${Game.profile?.matricula ?? 'invitado'}`;

export function saveLocal() {
  try {
    localStorage.setItem(key(), JSON.stringify({ avatar: Game.profile?.avatar, run: Game.run }));
  } catch { /* sin almacenamiento disponible */ }
}

export function loadLocal(): { avatar: Avatar | null; run: Run | null } {
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
export function generateMap(): MapNode[] {
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
    else if (n.floor <= 2) n.type = r < 0.5 ? 'combate' : r < 0.72 ? 'evento' : r < 0.88 ? 'runa' : 'fogata';
    else n.type = r < 0.38 ? 'combate' : r < 0.55 ? 'elite' : r < 0.72 ? 'evento' : r < 0.82 ? 'runa' : r < 0.9 ? 'mercader' : 'fogata';
  }
  // garantías: una élite, una runa, dos encuentros y un mercader alcanzables
  const by = (f: (n: MapNode) => boolean) => Phaser.Utils.Array.Shuffle(list.filter(f));
  const ensure = (type: NodeType, count: number, floors: [number, number]) => {
    const have = list.filter((n) => n.type === type).length;
    const cands = by((n) => n.floor >= floors[0] && n.floor <= floors[1] && n.type === 'combate');
    for (let i = have; i < count && cands.length; i++) cands.pop()!.type = type;
  };
  ensure('elite', 1, [3, 6]);
  ensure('runa', 1, [1, 5]);
  ensure('evento', 2, [1, 6]);
  ensure('mercader', 1, [3, 5]);
  return [...list, boss];
}

export function newRun(runId: string): Run {
  let uid = 1;
  return {
    runId,
    acto: 1,
    hp: 70,
    maxHp: 70,
    deck: STARTER_DECK.map((id) => ({ uid: uid++, id, up: false })),
    relics: [],
    map: generateMap(),
    pos: -1,
    visited: [],
    floor: 0,
    score: 0,
    stats: { combates: 0, elites: 0, runasOk: 0, runasTotal: 0, ergiosTotal: 0 },
    ergios: 25,
    effects: [],
    nextUid: uid,
    done: false,
  };
}

export function addCard(id: string, up = false) {
  const r = Game.run!;
  r.deck.push({ uid: r.nextUid++, id, up });
}

// ── registro docente ──
export function logEvent(tipo: string, concepto = '', correcto: boolean | '' = '', detalle: Record<string, unknown> = {}) {
  if (!Game.profile || Game.profile.offline || !isOnline()) return;
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
  if (!r || !Game.profile || Game.profile.offline || !isOnline()) return;
  enqueue('updateRun', {
    token: Game.profile.token,
    runId: r.runId,
    acto: r.acto,
    piso: r.floor,
    vida: r.hp,
    puntaje: r.score,
    resultado,
    causa,
    combates: r.stats.combates,
    elites: r.stats.elites,
    runasOk: r.stats.runasOk,
    runasTotal: r.stats.runasTotal,
    mazo: r.deck.length,
  });
}

export function addErgios(n: number) {
  const r = Game.run!;
  r.ergios += n;
  if (n > 0) r.stats.ergiosTotal = (r.stats.ergiosTotal ?? 0) + n;
}

export function addEffect(id: string, combats: number) {
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
  return r;
}
