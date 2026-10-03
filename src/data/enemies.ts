/** Cartas basura que un enemigo mete a tu mazo durante el combate */
export interface AddCards { id: string; n: number; to?: 'draw' | 'discard' }

interface IntentExtras {
  friccion?: number; // te cubre de lodo
  calor?: number; // te aplica Calor
  add?: AddCards; // te mete cartas de estado
  label?: string;
}

export type Intent =
  | ({ kind: 'attack'; dmg: number; hits?: number } & IntentExtras)
  | ({ kind: 'block'; block: number; dmg?: number } & IntentExtras)
  | ({ kind: 'buff'; dmg?: number } & IntentExtras)
  | { kind: 'stunned'; label?: string };

export interface EnemyState {
  def: EnemyDef;
  hp: number;
  maxHp: number;
  block: number;
  turn: number;
  inercia: number; // acumulación de inercia (élite y jefe)
  stunned: number; // turnos aturdido
  detenido: boolean; // recibe x1.5 mientras está detenido
  intent: Intent;
  phase2?: boolean;
  carga: number; // energía almacenada (Muelle)
  calor: number; // daño térmico por turno
  resonancia: number;
  fatiga: number; // recibe +50 % de daño
}

export interface EnemyDef {
  id: string;
  name: string;
  sprite: string;
  scale: number;
  hp: [number, number];
  mass: number; // kg (informativo / tooltip)
  umbral?: number; // N necesarios en un solo golpe para detenerlo
  desc: string;
  act?: number;
  next: (e: EnemyState) => Intent;
}

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

export const ENEMIES: Record<string, EnemyDef> = {
  skeleton: {
    id: 'skeleton', name: 'Esqueleto Errante', sprite: 'skeleton', scale: 5, hp: [20, 24], mass: 2,
    desc: 'Huesos huecos, poca masa. Golpea con una espada oxidada.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 2) return { kind: 'block', block: 6, dmg: 3 };
      return { kind: 'attack', dmg: p === 0 ? 6 : 7 };
    },
  },
  slime: {
    id: 'slime', name: 'Babosa de Lodo', sprite: 'slime', scale: 4, hp: [26, 30], mass: 4,
    desc: 'Su lodo aumenta la fricción: reduce la aceleración de tus ataques.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 4, friccion: 1, label: 'Lodo' } : { kind: 'attack', dmg: 8 }),
  },
  bat: {
    id: 'bat', name: 'Murciélago de Cripta', sprite: 'bat', scale: 4, hp: [12, 15], mass: 0.5,
    desc: 'Muy poca masa: rápido, pero sus golpes son débiles.',
    next: (e) => ({ kind: 'attack', dmg: e.turn % 2 === 0 ? 2 : 3, hits: 2 }),
  },
  gargola: {
    id: 'gargola', name: 'Gárgola de Piedra', sprite: 'gargola', scale: 5, hp: [30, 34], mass: 6,
    desc: 'Pesada y paciente: se cubre de piedra y luego cae con todo su peso.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'block', block: 8, label: 'Petrificarse' };
      if (p === 1) return { kind: 'attack', dmg: 10, label: 'Caída' };
      return { kind: 'block', block: 5, dmg: 5 };
    },
  },
  pendulo: {
    id: 'pendulo', name: 'Péndulo Errante', sprite: 'pendulo', scale: 4, hp: [24, 28], mass: 3,
    desc: 'Oscila sin parar: cuando sube gana energía potencial y cuando baja la convierte en un golpe fuerte (U → K).',
    next: (e) => (e.turn % 2 === 0
      ? { kind: 'block', block: 4, label: 'Sube (gana mgh)' }
      : { kind: 'attack', dmg: 12, label: 'Baja (½mv²)' }),
  },
  inertKnight: {
    id: 'inertKnight', name: 'Caballero Inerte', sprite: 'inertKnight', scale: 5, hp: [48, 52], mass: 8, umbral: 10,
    desc: 'Una armadura que avanza sin detenerse. Cada turno en movimiento su golpe crece.',
    next: (e) => {
      if (e.turn % 3 === 2) return { kind: 'block', block: 8, dmg: 5 + e.inercia, label: 'Avance' };
      return { kind: 'attack', dmg: 6 + 2 * e.inercia, label: 'Carga' };
    },
  },
  // ════════ ACTO II · Galerías de la Fricción ════════
  brea: {
    id: 'brea', name: 'Brea Viviente', sprite: 'brea', scale: 4, hp: [34, 38], mass: 6, act: 2,
    desc: 'Lodo negro y espeso. Te embarra el mazo con cartas que no sirven para nada.',
    next: (e) => (e.turn % 2 === 0
      ? { kind: 'attack', dmg: 6, add: { id: 'lodoCarta', n: 2, to: 'discard' }, label: 'Embarrar' }
      : { kind: 'attack', dmg: 11 }),
  },
  anima: {
    id: 'anima', name: 'Ánima Calórica', sprite: 'anima', scale: 4, hp: [26, 30], mass: 0.2, act: 2,
    desc: 'Energía disipada que tomó forma. Te transfiere calor que te quema turno tras turno.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 3, calor: 3, label: 'Transferir calor' } : { kind: 'attack', dmg: 8 }),
  },
  muelle: {
    id: 'muelle', name: 'Muelle Errante', sprite: 'muelle', scale: 4, hp: [36, 40], mass: 4, act: 2,
    desc: 'Se comprime dos turnos (U = ½kx²) y luego libera toda esa energía de golpe.',
    next: (e) => (e.turn % 3 === 2
      ? { kind: 'attack', dmg: 6 + 5 * e.carga, label: 'Liberar ½kx²' }
      : { kind: 'block', block: 6, label: 'Comprimirse' }),
  },
  minero: {
    id: 'minero', name: 'Minero Espectral', sprite: 'minero', scale: 5, hp: [30, 34], mass: 70, act: 2,
    desc: 'Golpea la roca de las galerías desde hace siglos. Su eco te llena la cabeza de ruido.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'attack', dmg: 9 };
      if (p === 1) return { kind: 'attack', dmg: 5, add: { id: 'ruido', n: 1, to: 'draw' }, label: 'Eco' };
      return { kind: 'block', block: 8 };
    },
  },
  volante: {
    id: 'volante', name: 'Volante de Inercia', sprite: 'volante', scale: 4, hp: [78, 84], mass: 20, umbral: 16, act: 2,
    desc: 'Una rueda de hierro que gira sin parar: guarda energía rotacional y cada vuelta golpea más.',
    next: (e) => {
      if (e.turn % 3 === 2) return { kind: 'block', block: 10, calor: 2, label: 'Fricción del eje' };
      return { kind: 'attack', dmg: 7 + 3 * e.inercia, label: 'Giro' };
    },
  },
  golem: {
    id: 'golem', name: 'Gólem Hidráulico', sprite: 'golem', scale: 4, hp: [88, 92], mass: 90, act: 2,
    desc: 'Una prensa viviente: acumula presión y la descarga. Su vapor nubla tus cálculos.',
    next: (e) => (e.turn % 2 === 0
      ? { kind: 'block', block: 15, add: { id: 'errorSigno', n: 1, to: 'draw' }, label: 'Presurizar' }
      : { kind: 'attack', dmg: 18, label: 'Prensa' }),
  },
  bruja: {
    id: 'bruja', name: 'La Bruja de la Fricción', sprite: 'bruja', scale: 5, hp: [200, 200], mass: 55, act: 2,
    desc: 'Guardiana del Acto II. Todo lo que tocas pierde energía en sus galerías.',
    next: (e) => {
      const bonus = e.phase2 ? 4 : 0;
      switch (e.turn % 4) {
        case 0: return { kind: 'buff', friccion: 2, add: { id: 'lodoCarta', n: 2, to: 'draw' }, label: 'Coeficiente μ' };
        case 1: return { kind: 'attack', dmg: 8 + bonus, calor: 4, label: 'Calor disipado' };
        case 2: return { kind: 'attack', dmg: 16 + bonus, label: 'Embate' };
        default: return { kind: 'block', block: 15, add: { id: 'errorSigno', n: 1, to: 'draw' }, label: 'Disipación' };
      }
    },
  },
  colossus: {
    id: 'colossus', name: 'Coloso Inerte', sprite: 'colossus', scale: 5, hp: [140, 140], mass: 12, umbral: 15,
    desc: 'Guardián del Acto I. Una montaña en movimiento. Sólo una fuerza neta suficiente lo detiene.',
    next: (e) => {
      if (e.turn % 3 === 2) return { kind: 'block', block: 12, dmg: 5, label: 'Pisotón' };
      return { kind: 'attack', dmg: 8 + 3 * e.inercia, label: 'Avalancha' };
    },
  },
};

export const ENCOUNTERS = {
  easy: [['skeleton'], ['bat', 'bat'], ['slime'], ['pendulo']],
  normal: [['skeleton', 'bat'], ['slime', 'bat'], ['skeleton', 'skeleton'], ['slime', 'skeleton'], ['gargola'], ['pendulo', 'bat'], ['gargola', 'skeleton'], ['pendulo']],
  elite: [['inertKnight']],
  boss: [['colossus']],
};

export const ENCOUNTERS_2 = {
  easy: [['brea'], ['anima', 'anima'], ['muelle'], ['minero']],
  normal: [['brea', 'anima'], ['muelle', 'anima'], ['minero', 'brea'], ['minero', 'anima'], ['muelle', 'minero'], ['brea', 'brea']],
  elite: [['volante'], ['golem']],
  boss: [['bruja']],
};

export function encounters(acto: number) {
  return acto === 2 ? ENCOUNTERS_2 : ENCOUNTERS;
}

export function spawn(id: string): EnemyState {
  const def = ENEMIES[id];
  const hp = rnd(def.hp[0], def.hp[1]);
  const e: EnemyState = { def, hp, maxHp: hp, block: 0, turn: 0, inercia: 0, stunned: 0, detenido: false, intent: { kind: 'attack', dmg: 0 }, carga: 0, calor: 0, resonancia: 0, fatiga: 0 };
  e.intent = def.next(e);
  return e;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
