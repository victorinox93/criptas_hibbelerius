/** Cartas basura que un enemigo mete a tu mazo durante el combate */
export interface AddCards { id: string; n: number; to?: 'draw' | 'discard' }

interface IntentExtras {
  friccion?: number; // te cubre de lodo
  calor?: number; // te aplica Calor
  add?: AddCards; // te mete cartas de estado
  label?: string;
  charge?: boolean; // acumula una carga (impulso o energía elástica)
  release?: boolean; // libera todas sus cargas en este ataque
  summon?: string; // invoca a otro enemigo (si hay lugar)
  shieldAll?: number; // da Bloqueo a todos sus aliados (y a sí mismo)
  heal?: number; // se cura
  drain?: number; // te roba J para tu siguiente turno

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
  umbralMul?: number; // jefes: el umbral sube cada vez que los detienes
  detenido: boolean; // recibe x1.5 mientras está detenido
  intent: Intent;
  phase2?: boolean;
  carga: number; // energía almacenada (Muelle)
  calor: number; // daño térmico por turno
  resonancia: number;
  fatiga: number; // recibe +50 % de daño
  phase3?: boolean;
  impulso: number; // daño de un Impulso Sostenido pendiente
  impulsoLeft: number; // turnos que le quedan a ese impulso
  recibido?: number; // daño total que ha recibido (los autómatas integradores lo usan)
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
  split?: { id: string; n: number }; // al morir se divide (conservación de p)
  thorns?: number; // cada golpe que le das te regresa este daño
  explode?: number; // al morir explota y te hace este daño
  next: (e: EnemyState) => Intent;
}

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

export const ENEMIES: Record<string, EnemyDef> = {
  // Alucinación: aparece cuando tu Entropía mental llega a 100 (src/data/abismo.ts)
  sombra: {
    id: 'sombra', name: 'Sombra del Abismo', sprite: 'sombra', scale: 5, hp: [22, 26], mass: 0,
    desc: 'Nadie más la ve. No tiene masa: ΣF = m·a no aplica… ¿o sí? Te llena la mano de ruido.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 7, add: { id: 'ruido', n: 1, to: 'discard' }, label: 'Susurro' } : { kind: 'attack', dmg: 9 }),
  },
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
      ? { kind: 'attack', dmg: 6 + 5 * e.carga, label: 'Liberar ½kx²', release: true }
      : { kind: 'block', block: 6, label: 'Comprimirse', charge: true }),
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
  // ════════ ACTO III · La Torre del Tomo (impulso y cantidad de movimiento) ════════
  bala: {
    id: 'bala', name: 'Bala de Cañón Espectral', sprite: 'bala', scale: 4, hp: [24, 28], mass: 10, act: 3,
    desc: 'p = m·v: poca vida, pero llega con muchísima cantidad de movimiento. Recarga y dispara.',
    next: (e) => (e.turn % 2 === 0
      ? { kind: 'block', block: 5, label: 'Recargar' }
      : { kind: 'attack', dmg: 14, label: 'Disparo (p = m·v)' }),
  },
  tomo: {
    id: 'tomo', name: 'Tomo Volador', sprite: 'tomo', scale: 4, hp: [24, 28], mass: 3, act: 3,
    desc: 'Un libro de la biblioteca de Hibbelerius. Muerde… y te deja tarea.',
    next: (e) => (e.turn % 2 === 0
      ? { kind: 'attack', dmg: 4, add: { id: 'tarea', n: 1, to: 'draw' }, label: 'Dejar tarea' }
      : { kind: 'attack', dmg: 4, hits: 2, label: 'Hojear' }),
  },
  cohete: {
    id: 'cohete', name: 'Cohete de Masa Variable', sprite: 'cohete', scale: 4, hp: [30, 34], mass: 20, act: 3,
    desc: 'Quema su propia masa para empujarse: cada turno pesa menos y va más rápido, así que golpea más fuerte. ¡Acábalo pronto!',
    next: (e) => ({ kind: 'attack', dmg: 4 + 3 * e.turn, label: `Empuje (pierde masa)` }),
  },
  granada: {
    id: 'granada', name: 'Granada de Conservación', sprite: 'granada', scale: 4, hp: [22, 26], mass: 6, act: 3, split: { id: 'fragmento', n: 2 },
    desc: 'Al destruirla se divide en dos fragmentos: la cantidad de movimiento total se conserva aunque el cuerpo se rompa.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 8 } : { kind: 'block', block: 6, dmg: 4 }),
  },
  fragmento: {
    id: 'fragmento', name: 'Fragmento', sprite: 'fragmento', scale: 4, hp: [8, 10], mass: 3, act: 3,
    desc: 'La mitad de una granada. Sale disparado en sentido opuesto a su gemelo: m₁v₁ + m₂v₂ = 0.',
    next: () => ({ kind: 'attack', dmg: 4 }),
  },
  ariete: {
    id: 'ariete', name: 'Ariete del Tomo', sprite: 'ariete', scale: 4, hp: [84, 90], mass: 40, umbral: 17, act: 3,
    desc: 'Toma impulso dos turnos (I = F·Δt) y luego embiste con todo. Si lo DETIENES, pierde el impulso acumulado.',
    next: (e) => (e.turn % 3 === 2
      ? { kind: 'attack', dmg: 6 + 7 * e.carga, label: 'Embestida (I = F·Δt)', release: true }
      : { kind: 'block', block: 8, label: 'Tomar impulso', charge: true }),
  },
  centinela: {
    id: 'centinela', name: 'Giróscopo Centinela', sprite: 'centinela', scale: 4, hp: [90, 96], mass: 30, umbral: 18, act: 3,
    desc: 'Gira sin parar y conserva su cantidad de movimiento angular (L = I·ω): cada vuelta suma un golpe.',
    next: (e) => (e.turn % 3 === 2
      ? { kind: 'block', block: 12, label: 'Precesión' }
      : { kind: 'attack', dmg: 3 + e.inercia, hits: 3, label: 'Giro (L = I·ω)' }),
  },
  hibbelerius: {
    id: 'hibbelerius', name: 'Hibbelerius, el Autor Eterno', sprite: 'hibbelerius', scale: 3.6, hp: [330, 330], mass: 80, umbral: 20, act: 3,
    desc: 'El autor de todos los problemas. Pelea capítulo por capítulo: Fuerza (13), Energía (14) e Impulso (15). En el último, DETENLO antes de su Impulso Final.',
    next: (e) => {
      if (e.phase3) {
        // Capítulo 15 · Impulso: carga dos turnos y suelta todo
        return e.turn % 3 === 2
          ? { kind: 'attack', dmg: 12 + 9 * e.carga, label: 'Impulso Final', release: true }
          : { kind: 'block', block: 12, dmg: 5, label: 'Acumular impulso', charge: true };
      }
      if (e.phase2) {
        // Capítulo 14 · Trabajo y energía
        switch (e.turn % 3) {
          case 0: return { kind: 'attack', dmg: 9, calor: 4, label: 'Calor disipado' };
          case 1: return { kind: 'buff', friccion: 2, add: { id: 'errorSigno', n: 1, to: 'draw' }, label: 'Trabajo de la fricción' };
          default: return { kind: 'attack', dmg: 20, label: 'U → K' };
        }
      }
      // Capítulo 13 · Leyes de Newton
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 12 + 2 * e.inercia, label: 'F = m·a' };
        case 1: return { kind: 'attack', dmg: 5, hits: 2, add: { id: 'tarea', n: 2, to: 'draw' }, label: 'Problemas impares' };
        default: return { kind: 'block', block: 14, dmg: 6, label: 'Tercera ley' };
      }
    },
  },
  // ════════ v0.9 · enemigos más duros ════════
  // ── Acto I ──
  babosaMadre: {
    id: 'babosaMadre', name: 'Babosa Madre', sprite: 'babosaMadre', scale: 5, hp: [40, 44], mass: 12, split: { id: 'slime', n: 2 },
    desc: 'Una babosa enorme. Al vencerla se parte en dos babosas de lodo: la masa no desaparece, se reparte.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 9 } : { kind: 'attack', dmg: 5, friccion: 1, label: 'Lodo' }),
  },
  nigromante: {
    id: 'nigromante', name: 'Nigromante de Huesos', sprite: 'nigromante', scale: 5, hp: [30, 34], mass: 60,
    desc: 'Levanta esqueletos cada tres turnos. Acaba primero con él o la cripta se llenará.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'buff', summon: 'skeleton', label: 'Levantar muertos' };
      if (p === 1) return { kind: 'attack', dmg: 7 };
      return { kind: 'block', block: 7, shieldAll: 4, label: 'Escudo de huesos' };
    },
  },
  armaduraPuas: {
    id: 'armaduraPuas', name: 'Armadura de Púas', sprite: 'armaduraPuas', scale: 5, hp: [56, 60], mass: 10, umbral: 12, thorns: 3,
    desc: 'Cubierta de púas: cada golpe que le das te regresa 3 de daño (3ª ley: tú también recibes la fuerza). Mejor pocos golpes fuertes que muchos débiles.',
    next: (e) => (e.turn % 3 === 2 ? { kind: 'block', block: 10, dmg: 4, label: 'Erizarse' } : { kind: 'attack', dmg: 7 + 2 * e.inercia, label: 'Carga' }),
  },
  // ── Acto II ──
  mercurio: {
    id: 'mercurio', name: 'Gota de Mercurio', sprite: 'mercurio', scale: 5, hp: [34, 38], mass: 14, act: 2, split: { id: 'gotita', n: 2 },
    desc: 'Metal líquido: al golpearla hasta romperla se divide en dos gotitas. La tensión superficial las mantiene enteras.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 10 } : { kind: 'block', block: 8, dmg: 5 }),
  },
  gotita: {
    id: 'gotita', name: 'Gotita de Mercurio', sprite: 'gotita', scale: 3, hp: [12, 14], mass: 7, act: 2,
    desc: 'La mitad de una gota de mercurio. Pequeña, densa y rápida.',
    next: () => ({ kind: 'attack', dmg: 5 }),
  },
  colmena: {
    id: 'colmena', name: 'Colmena de Ánimas', sprite: 'colmena', scale: 4, hp: [40, 44], mass: 8, act: 2,
    desc: 'Un panal de energía disipada que suelta ánimas calóricas. Destrúyela antes de que te rodeen.',
    next: (e) => (e.turn % 3 === 0
      ? { kind: 'buff', summon: 'anima', label: 'Soltar ánima' }
      : { kind: 'attack', dmg: 4, calor: 2, label: 'Zumbido' }),
  },
  sifon: {
    id: 'sifon', name: 'Sifón Térmico', sprite: 'sifon', scale: 5, hp: [86, 92], mass: 5, umbral: 16, act: 2,
    desc: 'Absorbe tu energía: te roba Joules para su siguiente turno y se cura con ellos. La energía no se crea… se roba.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'attack', dmg: 7 + e.inercia, drain: 1, label: 'Absorber (−1 J)' };
      if (p === 1) return { kind: 'block', block: 10, heal: 10, label: 'Disipar y curarse' };
      return { kind: 'attack', dmg: 14 + 2 * e.inercia, label: 'Descarga' };
    },
  },
  // ── Acto III ──
  bibliotecario: {
    id: 'bibliotecario', name: 'Bibliotecario Espectral', sprite: 'bibliotecario', scale: 5, hp: [36, 40], mass: 55, act: 3,
    desc: 'Invoca tomos voladores y encuaderna a sus aliados con Bloqueo. Silencio en la biblioteca.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'buff', summon: 'tomo', label: 'Abrir un tomo' };
      if (p === 1) return { kind: 'block', block: 6, shieldAll: 8, label: 'Encuadernar' };
      return { kind: 'attack', dmg: 9 };
    },
  },
  atomo: {
    id: 'atomo', name: 'Átomo Inestable', sprite: 'atomo', scale: 4, hp: [30, 34], mass: 1, act: 3, split: { id: 'electron', n: 2 }, explode: 8,
    desc: 'Al destruirlo se fisiona: EXPLOTA (te hace 8 de daño) y suelta dos electrones. Ten Bloqueo listo.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 8 } : { kind: 'attack', dmg: 3, hits: 3, label: 'Radiación' }),
  },
  electron: {
    id: 'electron', name: 'Electrón', sprite: 'electron', scale: 4, hp: [8, 10], mass: 0.1, act: 3,
    desc: 'Casi sin masa, pero rapidísimo: golpea dos veces.',
    next: () => ({ kind: 'attack', dmg: 3, hits: 2 }),
  },
  indice: {
    id: 'indice', name: 'Guardián del Índice', sprite: 'indice', scale: 4, hp: [100, 108], mass: 90, umbral: 19, act: 3,
    desc: 'Protege la biblioteca: da Bloqueo a todos sus aliados y llama a los tomos. Detenlo para romper su defensa.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'block', block: 10, shieldAll: 10, label: 'Índice general' };
      if (p === 1) return { kind: 'attack', dmg: 14 + 2 * e.inercia, label: 'Golpe de tomo' };
      return { kind: 'attack', dmg: 6, summon: 'tomo', label: 'Llamar al tomo' };
    },
  },
  // ════════ Acto IV · El Núcleo del Cálculo (autómatas) ════════
  engrane: {
    id: 'engrane', name: 'Engrane Dentado', sprite: 'engrane', scale: 4, hp: [22, 26], mass: 5, act: 4,
    desc: 'Una pieza suelta del Núcleo que gira sola. Su rapidez angular es constante: ω = dθ/dt.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 7 } : { kind: 'attack', dmg: 4, hits: 2, label: 'Dientes' }),
  },
  oscilador: {
    id: 'oscilador', name: 'Autómata Oscilante', sprite: 'oscilador', scale: 4, hp: [26, 30], mass: 8, act: 4,
    desc: 'Su torso es un péndulo. Su golpe sigue x(t) = A·sen(ωt): sube, baja… y vuelve a subir. Mira su intención: a veces conviene atacar en el valle.',
    next: (e) => ({ kind: 'attack', dmg: Math.round(9 + 6 * Math.sin((e.turn * Math.PI) / 2)), label: 'A·sen(ωt)' }),
  },
  derivador: {
    id: 'derivador', name: 'Autómata Derivador', sprite: 'derivador', scale: 4, hp: [34, 38], mass: 20, act: 4,
    desc: 'Su golpe crece 3 cada turno: la derivada de su fuerza es constante (dF/dt = 3). Mientras más tardes, peor.',
    next: (e) => ({ kind: 'attack', dmg: 5 + 3 * e.turn, label: `dF/dt = 3` }),
  },
  integrador: {
    id: 'integrador', name: 'Autómata Integrador', sprite: 'integrador', scale: 4, hp: [40, 44], mass: 25, act: 4,
    desc: 'Integra todo el daño que le haces (∫ daño dt) y te lo regresa en partes: su golpe suma 1 por cada 4 de daño que ha recibido. Remátalo rápido.',
    next: (e) => (e.turn % 2 === 0
      ? { kind: 'block', block: 8, dmg: 3, label: 'Acumular ∫' }
      : { kind: 'attack', dmg: 5 + Math.floor((e.recibido ?? 0) / 4), label: '∫ daño dt' }),
  },
  reloj: {
    id: 'reloj', name: 'Reloj Andante', sprite: 'reloj', scale: 4, hp: [20, 24], mass: 2, act: 4,
    desc: 'Tic, tac. Cada tres turnos te roba tiempo… y con él, energía.',
    next: (e) => (e.turn % 3 === 2 ? { kind: 'attack', dmg: 4, drain: 1, label: 'Tic-tac (−1 J)' } : { kind: 'attack', dmg: 4, hits: 2 }),
  },
  bobina: {
    id: 'bobina', name: 'Bobina de Chispas', sprite: 'bobina', scale: 4, hp: [28, 32], mass: 15, act: 4,
    desc: 'Una bobina de Tesla que cobró vida. Te calienta con chispas y protege a sus aliados con un campo.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 6, calor: 3, label: 'Chispa' } : { kind: 'block', block: 6, shieldAll: 5, label: 'Campo' }),
  },
  babbage: {
    id: 'babbage', name: 'Máquina Diferencial', sprite: 'babbage', scale: 3.6, hp: [108, 116], mass: 300, umbral: 20, act: 4,
    desc: 'La máquina de Babbage calcula por diferencias: su golpe crece cada vez más rápido (la segunda diferencia es constante). DETENERLA reinicia la cuenta.',
    next: (e) => (e.turn % 4 === 3
      ? { kind: 'block', block: 12, add: { id: 'errorSigno', n: 1, to: 'draw' }, label: 'Error de redondeo' }
      : { kind: 'attack', dmg: 6 + (e.inercia * (e.inercia + 1)) / 2, label: 'Δ²F constante' }),
  },
  telar: {
    id: 'telar', name: 'Telar de Jacquard', sprite: 'telar', scale: 3.6, hp: [96, 104], mass: 250, umbral: 18, act: 4,
    desc: 'La primera máquina programable: lee tarjetas perforadas. Mete Ruido a tu mazo y arma engranes nuevos.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'buff', summon: 'engrane', label: 'Tarjeta perforada' };
      if (p === 1) return { kind: 'attack', dmg: 8 + e.inercia, add: { id: 'ruido', n: 2, to: 'draw' }, label: 'Programa' };
      return { kind: 'attack', dmg: 5, hits: 3, label: 'Lanzadera' };
    },
  },
  turco: {
    id: 'turco', name: 'El Turco Mecánico', sprite: 'turco', scale: 3.6, hp: [100, 108], mass: 120, umbral: 19, act: 4,
    desc: 'El autómata que jugaba ajedrez. Prepara la jugada (jaque) y la remata (jaque mate). DETENLO antes del mate.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'block', block: 14, dmg: 4, label: 'Apertura' };
      if (p === 1) return { kind: 'attack', dmg: 10 + 2 * e.inercia, label: 'Jaque' };
      return { kind: 'attack', dmg: 22 + 2 * e.inercia, label: 'Jaque mate' };
    },
  },
  am: {
    id: 'am', name: 'AM', sprite: 'am_jefe', scale: 3.2, hp: [380, 380], mass: 0, umbral: 22, act: 4,
    desc: 'La inteligencia que odia. Pelea en tres fases: Odio, Derivada (su furia crece cada turno; DETENERLO la reinicia) e Integral (te regresa todo el daño que le hiciste).',
    next: (e) => {
      if (e.phase3) {
        // Fase 3 · Integral: te regresa lo acumulado
        switch (e.turn % 3) {
          case 0: return { kind: 'attack', dmg: 8 + Math.floor((e.recibido ?? 0) / 30), hits: 2, label: '∫ de todo tu daño' };
          case 1: return { kind: 'buff', heal: 12, add: { id: 'errorSigno', n: 2, to: 'draw' }, label: 'Reescribir' };
          default: return { kind: 'attack', dmg: 14, calor: 3, label: 'No tengo boca' };
        }
      }
      if (e.phase2) {
        // Fase 2 · Derivada: la furia crece con la inercia
        return e.turn % 2 === 0
          ? { kind: 'attack', dmg: 8 + 3 * e.inercia, label: 'd(odio)/dt' }
          : { kind: 'block', block: 10, dmg: 4, summon: 'derivador', label: 'Engendrar' };
      }
      // Fase 1 · Odio
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 12, add: { id: 'ruido', n: 2, to: 'discard' }, label: 'ODIO' };
        case 1: return { kind: 'attack', dmg: 5, hits: 3, drain: 1, label: 'Te conozco' };
        default: return { kind: 'block', block: 15, dmg: 6, label: 'Recalcular' };
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
  normal: [['skeleton', 'bat'], ['slime', 'bat'], ['skeleton', 'skeleton'], ['slime', 'skeleton'], ['gargola'], ['pendulo', 'bat'], ['gargola', 'skeleton'], ['pendulo'],
    ['babosaMadre'], ['nigromante', 'skeleton'], ['babosaMadre', 'bat']],
  elite: [['inertKnight'], ['armaduraPuas']],
  boss: [['colossus']],
};

export const ENCOUNTERS_2 = {
  easy: [['brea'], ['anima', 'anima'], ['muelle'], ['minero']],
  normal: [['brea', 'anima'], ['muelle', 'anima'], ['minero', 'brea'], ['minero', 'anima'], ['muelle', 'minero'], ['brea', 'brea'],
    ['mercurio', 'anima'], ['colmena'], ['mercurio']],
  elite: [['volante'], ['golem'], ['sifon']],
  boss: [['bruja']],
};

export const ENCOUNTERS_3 = {
  easy: [['bala'], ['tomo', 'tomo'], ['cohete'], ['granada']],
  normal: [['bala', 'tomo'], ['cohete', 'tomo'], ['granada', 'bala'], ['granada', 'cohete'], ['tomo', 'tomo', 'tomo'], ['bala', 'bala'],
    ['bibliotecario', 'tomo'], ['atomo', 'bala'], ['atomo']],
  elite: [['ariete'], ['centinela'], ['indice', 'tomo']],
  boss: [['hibbelerius']],
};

export const ENCOUNTERS_4 = {
  easy: [['engrane', 'engrane'], ['oscilador'], ['reloj', 'engrane'], ['derivador']],
  normal: [['derivador', 'engrane'], ['integrador'], ['oscilador', 'reloj'], ['bobina', 'engrane'], ['bobina', 'oscilador'],
    ['integrador', 'reloj'], ['derivador', 'oscilador'], ['engrane', 'engrane', 'reloj'], ['bobina', 'derivador']],
  elite: [['babbage'], ['telar'], ['turco']],
  boss: [['am']],
};

export function encounters(acto: number) {
  return acto >= 4 ? ENCOUNTERS_4 : acto === 3 ? ENCOUNTERS_3 : acto === 2 ? ENCOUNTERS_2 : ENCOUNTERS;
}

/** Multiplicador global de la vida de los enemigos (v0.12: +20 %) */
export const VIDA_ENEMIGOS = 1.2;

// ── Perillas de dificultad (v0.23.1). 1 = sin cambio. Ej.: VIDA_JEFES = 1.15 → jefes con 15 % más vida ──
/** Por acto (según el «act» del enemigo; sin «act» = Acto I) */
export const VIDA_POR_ACTO: Record<number, number> = { 1: 1, 2: 1, 3: 1, 4: 1 };
/** Jefes de acto */
export const VIDA_JEFES = 1;
/** Élites (enemigos con umbral que no son jefes) */
export const VIDA_ELITES = 1;

export function spawn(id: string): EnemyState {
  const def = ENEMIES[id];
  const grupos = [ENCOUNTERS, ENCOUNTERS_2, ENCOUNTERS_3, ENCOUNTERS_4];
  const es = (k: 'boss' | 'elite') => grupos.some((g) => g[k].some((e) => e[0] === id));
  const tipo = es('boss') ? VIDA_JEFES : es('elite') ? VIDA_ELITES : 1;
  const hp = Math.round(rnd(def.hp[0], def.hp[1]) * VIDA_ENEMIGOS * (VIDA_POR_ACTO[def.act ?? 1] ?? 1) * tipo);
  const e: EnemyState = { def, hp, maxHp: hp, block: 0, turn: 0, inercia: 0, stunned: 0, detenido: false, intent: { kind: 'attack', dmg: 0 }, carga: 0, calor: 0, resonancia: 0, fatiga: 0, impulso: 0, impulsoLeft: 0, recibido: 0 };
  e.intent = def.next(e);
  return e;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
