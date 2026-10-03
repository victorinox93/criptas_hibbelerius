export type Intent =
  | { kind: 'attack'; dmg: number; hits?: number; friccion?: number; label?: string }
  | { kind: 'block'; block: number; dmg?: number; label?: string }
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

export function spawn(id: string): EnemyState {
  const def = ENEMIES[id];
  const hp = rnd(def.hp[0], def.hp[1]);
  const e: EnemyState = { def, hp, maxHp: hp, block: 0, turn: 0, inercia: 0, stunned: 0, detenido: false, intent: { kind: 'attack', dmg: 0 } };
  e.intent = def.next(e);
  return e;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
