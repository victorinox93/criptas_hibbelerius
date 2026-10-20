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
  confusion?: boolean; // El Abismo: te Confunde (tus cartas robadas cuestan 0–3 J al azar)
  aturde?: boolean; // El Abismo: si el golpe te hace daño, pierdes tu siguiente turno
  hemorragia?: number; // El Abismo: N turnos en que cada carta que juegas te quita 1 de vida
  vertigo?: number; // El Abismo: robas N cartas menos en tu siguiente turno
  perfora?: boolean; // v0.51 · su golpe atraviesa tu Bloqueo (Sabueso de Tíndalos)
  inunda?: boolean; // v0.51 · antes del golpe pierdes todo tu Bloqueo (Bokrug)
  radianes?: boolean; // v0.57 · cambia tu calculadora a RAD: tus Ataques ×0.6 hasta que juegues una Habilidad

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
  imparableT?: number; // v0.49 · turnos que le quedan de IMPARABLE (tras ser detenido)
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
  vuelco?: boolean; // El Abismo: si lo golpeas 2 veces en el mismo turno, se vuelca (pierde su turno)
  hueco?: boolean; // El Abismo: área negativa; los golpes a TODOS le hacen la mitad
  oculto?: boolean; // El Abismo: invisible, sus intenciones no se ven (Engendro de Dunwich)
  imparable?: number; // v0.49 · El Abismo: después de que lo detienes, queda IMPARABLE estos turnos (no se le puede volver a detener)
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
  // ════════════ EL ABISMO DE LOS EJES · capa 1: los Muelles Inclinados ════════════
  acolito: {
    id: 'acolito', name: 'Acólito Inclinado', sprite: 'acolito', scale: 5, hp: [30, 34], mass: 60, act: 5, vuelco: true,
    desc: 'Su centro de masa está fuera de su base: vive a punto de caer. Si lo golpeas 2 veces en el mismo turno, se VUELCA y pierde su turno. Cuando se te cae encima te ATURDE (bloquéalo completo para evitarlo).',
    next: (e) => (e.turn % 3 === 2 ? { kind: 'block', block: 9, dmg: 6, label: 'Equilibrio precario' } : e.turn % 3 === 1 ? { kind: 'attack', dmg: 10, aturde: true, label: 'Se te cae encima' } : { kind: 'attack', dmg: 11, label: 'Caída controlada' }),
  },
  polipo: {
    id: 'polipo', name: 'Pólipo Compuesto', sprite: 'polipo', scale: 5, hp: [42, 46], mass: 30, act: 5, split: { id: 'polipito', n: 2 },
    desc: 'Una figura compuesta de tres partes. Al morir se separa: cada parte tiene su propio centroide.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 7, hits: 2, label: 'Tentáculos' } : { kind: 'block', block: 8, add: { id: 'susurro', n: 1, to: 'discard' }, label: 'Murmullo' }),
  },
  polipito: {
    id: 'polipito', name: 'Fragmento de Pólipo', sprite: 'polipito', scale: 4, hp: [12, 14], mass: 10, act: 5,
    desc: 'Un pedazo del Pólipo. Su centroide ya no coincide con el del resto.',
    next: () => ({ kind: 'attack', dmg: 6 }),
  },
  profundo: {
    id: 'profundo', name: 'Profundo Hueco', sprite: 'profundo', scale: 5, hp: [36, 40], mass: 80, act: 5, hueco: true,
    desc: 'Le falta un pedazo del pecho: un área negativa. Los golpes a TODOS le hacen la mitad; los golpes directos, completos. Su arpón te deja con HEMORRAGIA.',
    next: (e) => (e.turn % 3 === 1 ? { kind: 'attack', dmg: 15, hemorragia: 2, label: 'Arpón' } : { kind: 'attack', dmg: 8, friccion: 1, label: 'Red de algas' }),
  },
  cultistaEje: {
    id: 'cultistaEje', name: 'Cultista del Eje', sprite: 'cultistaEje', scale: 5, hp: [34, 38], mass: 55, act: 5,
    desc: 'Gira sin parar y gana rapidez angular ω cada turno. Su golpe vale ½·I·ω². Verlo girar te da VÉRTIGO: robas cartas de menos.',
    next: (e) => {
      if (e.turn % 3 === 0) return { kind: 'block', block: 4, vertigo: 2, charge: true, label: 'Rezo del Eje' };
      if (e.turn % 3 === 1) return { kind: 'block', block: 7, charge: true, label: 'ω aumenta' };
      return { kind: 'attack', dmg: 6 + 5 * e.carga, release: true, label: '½·I·ω²' };
    },
  },
  vigia: {
    id: 'vigia', name: 'El Vigía del Faro Hundido', sprite: 'vigia', scale: 5, hp: [92, 100], mass: 140, umbral: 17, act: 5,
    desc: 'Élite. Una armadura llena de agua que gira la luz del faro: te Confunde y acumula inercia. DETENLO con un golpe de F ≥ umbral.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'attack', dmg: 9, confusion: true, label: 'Haz del faro' };
      if (p === 1) return { kind: 'attack', dmg: 18 + 3 * e.inercia, label: 'Ancla' };
      return { kind: 'block', block: 14, dmg: 8, label: 'Marea' };
    },
  },
  hidra: {
    id: 'hidra', name: 'La Madre Hidra', sprite: 'hidra', scale: 4.4, hp: [88, 96], mass: 200, umbral: 16, act: 5, imparable: 1,
    desc: 'Élite. Invoca Pólipos y los protege. Su centro de masa cambia cada vez que nace una cabeza.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'buff', summon: 'polipito', shieldAll: 6, label: 'Gemación' };
      if (p === 1) return { kind: 'attack', dmg: 9, hits: 2, hemorragia: 2, label: 'Dos cabezas' };
      return { kind: 'attack', dmg: 19 + 3 * e.inercia, add: { id: 'susurro', n: 1, to: 'draw' }, label: 'Canto abisal' };
    },
  },
  vertice: {
    id: 'vertice', name: 'Vértice Errante', sprite: 'vertice', scale: 4, hp: [16, 18], mass: 5, act: 5,
    desc: 'Un vértice que se desprendió del Geómetra. Mientras exista, su figura no cierra.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 6 } : { kind: 'block', block: 6, label: 'Ángulo agudo' }),
  },
  geometra: {
    id: 'geometra', name: 'El Geómetra No Euclidiano', sprite: 'geometra', scale: 3.6, hp: [270, 270], mass: 0, umbral: 19, act: 5, imparable: 1,
    desc: 'Jefe de la capa 1. Una figura cuyos ángulos no suman 180°. Con menos de la mitad de vida suelta Vértices y te Confunde; su golpe crece con la distancia de su centroide.',
    next: (e) => {
      const fase2 = e.hp <= e.maxHp / 2;
      if (fase2) {
        switch (e.turn % 3) {
          case 0: return { kind: 'buff', summon: 'vertice', confusion: true, label: 'Desprender un vértice' };
          case 1: return { kind: 'attack', dmg: 11 + 3 * e.inercia, hits: 2, label: 'x̄ se aleja' };
          default: return { kind: 'block', block: 16, dmg: 10, add: { id: 'susurro', n: 2, to: 'draw' }, label: 'Teorema imposible' };
        }
      }
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 21 + 3 * e.inercia, label: 'Ángulo de 200°' };
        case 1: return { kind: 'block', block: 14, dmg: 6, label: 'Figura compuesta' };
        default: return { kind: 'attack', dmg: 7, hits: 3, vertigo: 1, label: 'Líneas paralelas que se cruzan' };
      }
    },
  },
  // ════════ v0.41 · jefes del Descenso (src/data/abismo_modo.ts → JEFES) ════════
  dagon: {
    id: 'dagon', name: 'Padre Dagón', sprite: 'dagon', scale: 3.6, hp: [270, 270], mass: 900, umbral: 18, act: 5, imparable: 1,
    desc: 'Rey de los Profundos. Su presión crece con la profundidad: P = ρ·g·h. MAREA ALTA: cada 3 turnos tus Bloqueos dan la mitad.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 10 + 2 * e.turn + 2 * e.inercia, label: 'Presión P = ρ·g·h' };
        case 1: return { kind: 'attack', dmg: 8, hits: 2, aturde: true, label: 'Ola que revuelca' };
        default: return { kind: 'block', block: 12, summon: 'polipito', label: 'Llamar a los Profundos' };
      }
    },
  },
  colorCielo: {
    id: 'colorCielo', name: 'El Color que Cayó del Cielo', sprite: 'colorCielo', scale: 3.4, hp: [260, 260], mass: 0, umbral: 17, act: 5, imparable: 1,
    desc: 'Un color que no existe. Se alimenta de energía: te roba 1 J al inicio de cada turno y se cura con lo que absorbe.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 9, calor: 3, label: 'Marchitar' };
        case 1: return { kind: 'block', block: 10, heal: 15, drain: 1, label: 'Absorber' };
        default: return { kind: 'attack', dmg: 20 + 2 * e.inercia, label: 'Rayo de un color imposible' };
      }
    },
  },
  bailarina: {
    id: 'bailarina', name: 'La Bailarina Ahogada', sprite: 'bailarina', scale: 3.6, hp: [270, 270], mass: 55, umbral: 18, act: 5, imparable: 1,
    desc: 'I₁·ω₁ = I₂·ω₂: con los brazos abiertos gira lento y pega fuerte; con los brazos recogidos gira rápido y golpea 4 veces.',
    next: (e) => (e.turn % 2 === 0
      ? { kind: 'attack', dmg: 22 + 2 * e.inercia, aturde: true, label: 'Brazos abiertos (I grande, ω chica)' }
      : { kind: 'attack', dmg: 6, hits: 4, vertigo: 1, label: 'Pirueta (I chica, ω grande)' }),
  },
  dunwich: {
    id: 'dunwich', name: 'El Engendro de Dunwich', sprite: 'dunwich', scale: 3.6, hp: [290, 290], mass: 4000, umbral: 19, act: 5, oculto: true, imparable: 2,
    desc: 'Invisible: no ves sus intenciones, sólo sus huellas. Encuentra su centro de masa por las huellas que deja.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 20 + 2 * e.inercia, label: 'Pisotón' };
        case 1: return { kind: 'attack', dmg: 7, hits: 3, hemorragia: 2, label: 'Tentáculos' };
        default: return { kind: 'block', block: 16, dmg: 8, add: { id: 'susurro', n: 2, to: 'draw' }, label: 'Grito en las colinas' };
      }
    },
  },
  nyarlathotep: {
    id: 'nyarlathotep', name: 'Nyarlathotep', sprite: 'nyarlathotep', scale: 3.4, hp: [320, 320], mass: 0, umbral: 21, act: 5, imparable: 2,
    desc: 'El Caos que Repta. Cambia de forma: compacto (I chica, muchos golpes) o extendido (I grande, un golpe enorme). La primera carta que robas cada turno se descarta.',
    next: (e) => {
      if (e.turn % 3 === 2) return { kind: 'block', block: 14, dmg: 6, confusion: true, label: 'Mil máscaras' };
      return e.turn % 3 === 0 ? { kind: 'attack', dmg: 7, hits: 3, label: 'Forma compacta' } : { kind: 'attack', dmg: 26 + 3 * e.inercia, label: 'Forma extendida' };
    },
  },
  cthulhu: {
    id: 'cthulhu', name: 'Cthulhu', sprite: 'cthulhu', scale: 3.4, hp: [340, 340], mass: 99999, umbral: 22, act: 5, imparable: 2,
    desc: "El Durmiente de R'lyeh. Pierdes 5 de Cordura cada turno. Despierta en 3 fases: ΣM = I·α, R'lyeh se alza, y ya no sueña.",
    next: (e) => {
      const f = e.hp / e.maxHp;
      if (f > 2 / 3) return e.turn % 2 === 0 ? { kind: 'attack', dmg: 14 + 4 * e.inercia, label: 'ΣM = I·α' } : { kind: 'block', block: 16, add: { id: 'susurro', n: 2, to: 'draw' }, label: 'Sueña' };
      if (f > 1 / 3) return e.turn % 2 === 0 ? { kind: 'buff', summon: 'cultistaEje', dmg: 10, label: "R'lyeh se alza" } : { kind: 'attack', dmg: 12, hits: 2, label: 'Garra' };
      return e.turn % 2 === 0 ? { kind: 'attack', dmg: 30 + 3 * e.inercia, aturde: true, label: 'Ya no sueña' } : { kind: 'attack', dmg: 9, hits: 3, label: 'H = I·ω' };
    },
  },
  yogSothoth: {
    id: 'yogSothoth', name: 'Yog-Sothoth', sprite: 'yogSothoth', scale: 3.4, hp: [320, 320], mass: 0, umbral: 21, act: 5, imparable: 2,
    desc: 'La Llave y la Puerta: un amontonamiento de esferas. Sólo robas 4 cartas por turno. Su golpe crece con la distancia al eje: I = I₀ + m·d².',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'block', block: 15, dmg: 8, shieldAll: 6, label: 'Todo en Uno' };
        case 1: return { kind: 'attack', dmg: 8, hits: 3, label: 'Esferas' };
        default: return { kind: 'attack', dmg: 26 + 3 * e.inercia, label: 'La Puerta' };
      }
    },
  },
  hastur: {
    id: 'hastur', name: 'Hastur', sprite: 'hastur', scale: 3.4, hp: [320, 320], mass: 0, umbral: 20, act: 5, imparable: 2,
    desc: 'El Rey de Amarillo. Tus cartas de Ataque cuestan +1 J. Su Signo Amarillo llena tu mazo de Susurros.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 10, add: { id: 'susurro', n: 2, to: 'draw' }, label: 'El Signo Amarillo' };
        case 1: return { kind: 'attack', dmg: 11, hits: 2, label: 'Viento entre las estrellas' };
        default: return { kind: 'attack', dmg: 28 + 3 * e.inercia, calor: 2, label: 'El Que No Debe Ser Nombrado' };
      }
    },
  },
  // ════════ v0.51 · LAS TIERRAS DEL SUEÑO: más criaturas del mythos (cuentos publicados hasta 1930) ════════
  necrofago: {
    id: 'necrofago', name: 'Necrófago', sprite: 'necrofago', scale: 4.4, hp: [36, 40], mass: 70, act: 5,
    desc: '«El modelo de Pickman» (1927). Encorvado, con cara de perro y piel de hule. Roe (HEMORRAGIA) y se cura comiendo. Su mandíbula es una palanca: fuerza pequeña cerca del eje, mordida enorme.',
    next: (e) => (e.turn % 3 === 0 ? { kind: 'attack', dmg: 9, hemorragia: 2, label: 'Roer' } : e.turn % 3 === 1 ? { kind: 'attack', dmg: 13, label: 'Mordida de palanca' } : { kind: 'block', block: 8, heal: 8, label: 'Comer' }),
  },
  martense: {
    id: 'martense', name: 'Engendro de los Martense', sprite: 'martense', scale: 4.4, hp: [20, 24], mass: 40, act: 5,
    desc: '«El miedo que acecha» (1923). Pálidos, simiescos, con un ojo azul y otro café. Nunca vienen solos: cada 3 turnos sale otro de la tierra.',
    next: (e) => (e.turn % 3 === 2 ? { kind: 'buff', summon: 'martense', label: 'Sale otro de la tierra' } : { kind: 'attack', dmg: e.turn % 3 === 0 ? 7 : 5, hits: e.turn % 3 === 0 ? 1 : 2, label: 'Arañazos' }),
  },
  aladoFestival: {
    id: 'aladoFestival', name: 'Dragón Shantak', sprite: 'aladoFestival', scale: 4.2, hp: [30, 34], mass: 25, act: 5,
    desc: 'Un ave enorme cubierta de escamas, con cabeza de caballo, de las Tierras del Sueño («La búsqueda onírica de la desconocida Kadath»). Sube y gana energía potencial (mgh); en la picada la convierte en cinética: ½mv².',
    next: (e) => (e.turn % 3 === 2 ? { kind: 'attack', dmg: 8 + 6 * e.carga, release: true, vertigo: 1, label: 'Picada: mgh → ½mv²' } : { kind: 'block', block: 6, dmg: 4, charge: true, label: 'Sube (h aumenta)' }),
  },
  reptilSinNombre: {
    id: 'reptilSinNombre', name: 'Reptil de la Ciudad sin Nombre', sprite: 'reptilSinNombre', scale: 4, hp: [40, 44], mass: 90, act: 5,
    desc: '«La ciudad sin nombre» (1921). Entre cocodrilo y foca, se arrastra por túneles bajísimos. Su cola te llena de arena: FRICCIÓN.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 8, friccion: 1, label: 'Coletazo de arena' } : { kind: 'attack', dmg: 14, label: 'Embestida rastrera' }),
  },
  wilbur: {
    id: 'wilbur', name: 'Wilbur Whateley', sprite: 'wilbur', scale: 4.6, hp: [90, 98], mass: 130, umbral: 17, act: 5,
    desc: 'Élite. «El horror de Dunwich» (1929). Alto, con abrigo largo… y algo que se mueve debajo. Lee el Necronomicón en voz alta: te llena de Susurros y se protege.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'block', block: 14, add: { id: 'susurro', n: 2, to: 'draw' }, label: 'Lee el Necronomicón' };
      if (p === 1) return { kind: 'attack', dmg: 8, hits: 2, hemorragia: 2, label: 'Lo que hay bajo el abrigo' };
      return { kind: 'attack', dmg: 19 + 3 * e.inercia, label: '¡Yog-Sothoth!' };
    },
  },
  sabueso: {
    id: 'sabueso', name: 'Sabueso de Tíndalos', sprite: 'sabueso', scale: 4, hp: [86, 94], mass: 60, umbral: 16, act: 5,
    desc: 'Élite. «Los perros de Tíndalos», F. B. Long (1929). Vive en los ÁNGULOS del tiempo y sale por las esquinas: sus golpes PERFORAN tu Bloqueo.',
    next: (e) => {
      const p = e.turn % 3;
      if (p === 0) return { kind: 'attack', dmg: 12, perfora: true, label: 'Sale de un ángulo' };
      if (p === 1) return { kind: 'attack', dmg: 6, hits: 3, hemorragia: 2, label: 'Lengua de aguja' };
      return { kind: 'block', block: 14, vertigo: 1, label: 'Se esconde en una esquina de 90°' };
    },
  },
  yig: {
    id: 'yig', name: 'Yig, Padre de las Serpientes', sprite: 'yig', scale: 3.4, hp: [270, 270], mass: 600, umbral: 18, act: 5, imparable: 1,
    desc: 'Jefe del tramo. «La maldición de Yig» (1929). Te aprieta con sus anillos: la fuerza centrípeta F = m·v²/r crece mientras más rápido gira. Cada vez que juegas una Defensa, una serpiente te muerde (−2 de vida).',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 10 + 3 * Math.min(6, e.turn) + 2 * e.inercia, label: 'Abrazo: F = m·v²/r' };
        case 1: return { kind: 'attack', dmg: 11, hits: 2, hemorragia: 3, label: 'Mordida venenosa' };
        default: return { kind: 'block', block: 16, heal: 15, label: 'Muda de piel' };
      }
    },
  },
  cincoCabezas: {
    id: 'cincoCabezas', name: 'El Dios de las Cinco Cabezas', sprite: 'cincoCabezas', scale: 3.2, hp: [280, 280], mass: 8000, umbral: 19, act: 5, imparable: 1,
    desc: 'Jefe del tramo. «Bajo las pirámides» (1924). Bajo la Esfinge vive algo con cinco cabezas. Está en EQUILIBRIO (ΣF = 0, ΣM = 0): al inicio de cada uno de tus turnos gana 6 de Bloqueo.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 5, hits: 5, label: 'Cinco cabezas, cinco mordidas' };
        case 1: return { kind: 'block', block: 18, dmg: 8, label: 'La pirámide encima' };
        default: return { kind: 'attack', dmg: 23 + 3 * e.inercia, aturde: true, label: 'Peso de la piedra' };
      }
    },
  },
  shubNiggurath: {
    id: 'shubNiggurath', name: 'Shub-Niggurath', sprite: 'shubNiggurath', scale: 3.2, hp: [330, 330], mass: 99999, umbral: 21, act: 5, imparable: 2,
    desc: 'La Cabra Negra de los Bosques con Mil Retoños («El horror de Dunwich», 1929). Su MASA CRECE: cada 3 turnos nace un Retoño, y al inicio de su turno se cura 6 por cada Retoño vivo.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'buff', summon: 'retono', shieldAll: 6, label: '¡Iä! Nace un Retoño' };
        case 1: return { kind: 'attack', dmg: 6, hits: 4, label: 'Mil bocas' };
        default: return { kind: 'attack', dmg: 26 + 3 * e.inercia, label: 'Pezuña de la Cabra Negra' };
      }
    },
  },
  retono: {
    id: 'retono', name: 'Retoño de los Mil', sprite: 'retono', scale: 4, hp: [20, 24], mass: 50, act: 5,
    desc: 'Un árbol oscuro que camina sobre pezuñas. Mientras viva, cura a su madre. Derríbalo primero.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 7, label: 'Rama con boca' } : { kind: 'block', block: 6, dmg: 4, label: 'Raíces' }),
  },
  calculadora: {
    id: 'calculadora', name: 'La Calculadora Primigenia', sprite: 'calculadora', scale: 3.2, hp: [270, 270], mass: 0.2, umbral: 18, act: 5, imparable: 1,
    desc: 'Jefe del tramo. La calculadora de Montemayor, que se quedó demasiado tiempo junto al Necronomicón. Cambia tu modo a RADIANES (tus Ataques ×0.6 hasta que juegues una Habilidad para revisar el modo), divide entre cero para protegerse y te regresa con MR lo que le hiciste. Con la batería baja ya no ves sus intenciones.',
    next: (e) => {
      switch (e.turn % 4) {
        case 0: return { kind: 'attack', dmg: 8, radianes: true, label: 'MODE → RAD' };
        case 1: return { kind: 'attack', dmg: 6, hits: 3, label: 'Σ de golpes' };
        case 2: return { kind: 'block', block: 26, label: 'Math ERROR (÷ 0)' };
        default: return { kind: 'attack', dmg: 10 + Math.floor((e.recibido ?? 0) * 0.12), add: { id: 'errorSigno', n: 1, to: 'draw' }, label: 'MR: te regreso lo que me hiciste' };
      }
    },
  },
  // ── v0.59 · Los Astros Errantes (nodos especiales del Abismo: src/data/astros.ts) ──
  astro_mercurio: {
    id: 'astro_mercurio', name: 'Mercurio, el Mensajero Veloz', sprite: 'astro_mercurio', scale: 3.4, hp: [95, 105], mass: 3.3e23, umbral: 15, act: 5,
    desc: 'Astro errante. El planeta más rápido: una vuelta al Sol en 88 días. Pega muchas veces seguidas y te marea. DETENLO con un golpe de F ≥ umbral.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 4, hits: 4, label: 'Órbita de 88 días' };
        case 1: return { kind: 'attack', dmg: 11 + 3 * e.inercia, vertigo: 1, label: 'Perihelio: 47 km/s' };
        default: return { kind: 'block', block: 14, dmg: 6, label: 'Noche de −173 °C' };
      }
    },
  },
  astro_venus: {
    id: 'astro_venus', name: 'Venus, la Nube que Quema', sprite: 'astro_venus', scale: 3.4, hp: [100, 110], mass: 4.9e24, umbral: 16, act: 5,
    desc: 'Astro errante. Lluvia de ácido sulfúrico y 92 atmósferas de presión: antes de su golpe más fuerte pierdes TODO tu Bloqueo. Gira al revés y te confunde.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 7, hemorragia: 3, label: 'Lluvia de ácido' };
        case 1: return { kind: 'block', block: 16, dmg: 6, confusion: true, label: 'Gira al revés' };
        default: return { kind: 'attack', dmg: 16 + 2 * e.inercia, inunda: true, label: 'Presión de 92 atm' };
      }
    },
  },
  astro_marte: {
    id: 'astro_marte', name: 'Marte, el Ojo Rojo', sprite: 'astro_marte', scale: 3.2, hp: [88, 96], mass: 6.4e23, umbral: 17, act: 5,
    desc: 'Astro errante. El dios de la guerra, con sus lunas Fobos (miedo) y Deimos (terror). Mientras nadie lo detenga, su golpe crece cada turno.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 17 + 3 * e.inercia, label: 'Dios de la guerra' };
        case 1: return { kind: 'buff', shieldAll: 10, label: 'Sus lunas lo rodean' };
        default: return { kind: 'attack', dmg: 7, hits: 2, hemorragia: 2, label: 'Tormenta de polvo rojo' };
      }
    },
  },
  astro_fobos: {
    id: 'astro_fobos', name: 'Fobos (el Miedo)', sprite: 'astro_fobos', scale: 3.6, hp: [20, 24], mass: 1.1e16, act: 5,
    desc: 'Luna de Marte. Gira tan cerca que algún día caerá sobre él. Te marea.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 6, vertigo: 1, label: 'Miedo' } : { kind: 'block', block: 8, dmg: 4, label: 'Órbita baja' }),
  },
  astro_deimos: {
    id: 'astro_deimos', name: 'Deimos (el Terror)', sprite: 'astro_deimos', scale: 3.6, hp: [16, 20], mass: 1.5e15, act: 5,
    desc: 'Luna pequeña de Marte. Te confunde con su terror.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 5, confusion: true, label: 'Terror' } : { kind: 'attack', dmg: 7, label: 'Roca' }),
  },
  astro_jupiter: {
    id: 'astro_jupiter', name: 'Júpiter, el Gigante', sprite: 'astro_jupiter', scale: 2.6, hp: [140, 150], mass: 1.9e27, umbral: 22, act: 5, imparable: 2,
    desc: 'Astro errante. 318 veces la masa de la Tierra y una tormenta que es un ojo. Su gravedad (24.8 m/s²) te ATURDE. Después de detenerlo queda IMPARABLE 2 turnos.',
    next: (e) => {
      switch (e.turn % 4) {
        case 0: return { kind: 'attack', dmg: 12, aturde: true, label: 'Gravedad de 24.8 m/s²' };
        case 1: return { kind: 'attack', dmg: 6, hits: 3, label: 'La Gran Mancha Roja' };
        case 2: return { kind: 'block', block: 24, label: 'Campo magnético' };
        default: return { kind: 'attack', dmg: 22 + 3 * e.inercia, label: 'Marea de Ío' };
      }
    },
  },
  astro_saturno: {
    id: 'astro_saturno', name: 'Saturno, el que Devora a sus Hijos', sprite: 'astro_saturno', scale: 2.6, hp: [128, 136], mass: 5.7e26, umbral: 19, act: 5,
    desc: 'Astro errante. Tan poco denso que flotaría en el agua. Sus anillos de dientes lo protegen, se cura devorando una de sus lunas y te roba J.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 9, hits: 2, label: 'Anillo de dientes' };
        case 1: return { kind: 'block', block: 14, heal: 16, label: 'Devora a una de sus lunas' };
        default: return { kind: 'attack', dmg: 18 + 3 * e.inercia, drain: 1, label: 'Hexágono del polo norte' };
      }
    },
  },
  astro_sol: {
    id: 'astro_sol', name: 'El Sol, el Ojo que Arde', sprite: 'astro_sol', scale: 2.6, hp: [165, 175], mass: 2e30, umbral: 22, act: 5, imparable: 1,
    desc: 'Astro errante, el más fuerte. Te transfiere CALOR, sus llamaradas atraviesan tu Bloqueo y se cura con fusión nuclear (E = m·c²).',
    next: (e) => {
      switch (e.turn % 4) {
        case 0: return { kind: 'attack', dmg: 9, calor: 3, label: 'Viento solar' };
        case 1: return { kind: 'attack', dmg: 14, perfora: true, hemorragia: 2, label: 'Llamarada' };
        case 2: return { kind: 'buff', heal: 18, shieldAll: 12, label: 'Fusión: 4 H → He' };
        default: return { kind: 'attack', dmg: 26 + 4 * e.inercia, aturde: true, label: 'Eyección de masa coronal' };
      }
    },
  },
  // ── Criaturas del sueño (sólo en los pesadillas: src/scenes/Sueno.ts) ──
  serIb: {
    id: 'serIb', name: 'Ser de Ib', sprite: 'serIb', scale: 4.4, hp: [26, 30], mass: 60, act: 5,
    desc: '«La perdición que cayó sobre Sarnath» (1920). Verdes como el lago, de ojos saltones y labios fofos. No tienen voz.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 8, label: 'Golpe mudo' } : { kind: 'attack', dmg: 5, vertigo: 1, label: 'Mirada sin párpados' }),
  },
  sombraHypnos: {
    id: 'sombraHypnos', name: 'Lo que Vino de la Corona Boreal', sprite: 'sombraHypnos', scale: 4.2, hp: [34, 38], mass: 0, act: 5, oculto: true,
    desc: '«Hypnos» (1923). Una sombra coronada de siete estrellas. No ves lo que hará: sólo su luz fría.',
    next: (e) => (e.turn % 3 === 2 ? { kind: 'attack', dmg: 6, confusion: true, label: 'Rayo de la Corona' } : { kind: 'attack', dmg: 10, add: { id: 'susurro', n: 1, to: 'discard' }, label: 'Sueño sin fondo' }),
  },
  guardianThalarion: {
    id: 'guardianThalarion', name: 'Guardián de Thalarion', sprite: 'guardianThalarion', scale: 4.2, hp: [40, 44], mass: 70, act: 5,
    desc: '«El barco blanco» (1919). Custodia la Ciudad de las Mil Maravillas, donde nadie que entra vuelve a salir.',
    next: (e) => (e.turn % 2 === 0 ? { kind: 'attack', dmg: 11, label: 'Báculo de luz' } : { kind: 'block', block: 10, heal: 8, label: 'Maravilla prohibida' }),
  },
  bokrug: {
    id: 'bokrug', name: 'Bokrug, el Gran Lagarto de Agua', sprite: 'bokrug', scale: 3.2, hp: [200, 200], mass: 3000, umbral: 18, act: 5, imparable: 1,
    desc: 'Jefe del sueño. El dios de Ib vuelve por Sarnath. Flota en su lago (empuje de Arquímedes: E = ρ·g·V). Cada 3 turnos el lago SUBE: pierdes todo tu Bloqueo antes de su golpe.',
    next: (e) => {
      switch (e.turn % 3) {
        case 0: return { kind: 'attack', dmg: 9, hits: 2, label: 'Coletazo' };
        case 1: return { kind: 'buff', summon: 'serIb', shieldAll: 8, label: 'Llama a los seres de Ib' };
        default: return { kind: 'attack', dmg: 18 + 3 * e.inercia, inunda: true, label: 'El lago sube: E = ρ·g·V' };
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

export const ENCOUNTERS_5 = {
  easy: [['acolito'], ['polipo'], ['cultistaEje'], ['profundo'], ['martense'], ['aladoFestival']],
  normal: [['acolito', 'acolito'], ['polipo', 'acolito'], ['cultistaEje', 'acolito'], ['profundo', 'polipito'], ['cultistaEje', 'profundo'],
    ['polipo', 'cultistaEje'], ['profundo', 'acolito'], ['polipito', 'polipito', 'cultistaEje'],
    // v0.51 · más mythos
    ['necrofago'], ['necrofago', 'acolito'], ['martense', 'martense'], ['aladoFestival', 'profundo'], ['reptilSinNombre'],
    ['reptilSinNombre', 'martense'], ['aladoFestival', 'aladoFestival'], ['necrofago', 'martense']],
  elite: [['vigia'], ['hidra'], ['wilbur'], ['sabueso']],
  // el jefe de cada tramo se sortea (run.jefe, src/data/abismo_modo.ts); esta lista sólo los marca como jefes
  boss: [['geometra'], ['dagon'], ['colorCielo'], ['bailarina'], ['dunwich'], ['yig'], ['cincoCabezas'], ['nyarlathotep'], ['cthulhu'], ['yogSothoth'], ['hastur'], ['shubNiggurath'], ['bokrug'], ['calculadora']],
};

/** v0.51 · pesadillas (src/scenes/Sueno.ts): el sueño decide contra quién peleas */
export const ENCOUNTERS_SUENO: Record<string, string[]> = {
  ib: ['serIb', 'serIb'],
  hypnos: ['sombraHypnos'],
  thalarion: ['guardianThalarion', 'serIb'],
  bokrug: ['bokrug'],
};

export function encounters(acto: number) {
  if (acto === 5) return ENCOUNTERS_5;
  return acto >= 4 ? ENCOUNTERS_4 : acto === 3 ? ENCOUNTERS_3 : acto === 2 ? ENCOUNTERS_2 : ENCOUNTERS;
}

/** v0.59 · Masa legible: los planetas se escriben en notación científica (5.7 × 10²⁶) */
export function masaTexto(m: number) {
  if (m < 1e6) return String(m);
  const e = Math.floor(Math.log10(m));
  const sup = String(e).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('');
  return `${(m / 10 ** e).toFixed(1)} × 10${sup}`;
}

/** Multiplicador global de la vida de los enemigos (v0.12: +20 %) */
export const VIDA_ENEMIGOS = 1.2;

// ── Perillas de dificultad (v0.23.1). 1 = sin cambio. Ej.: VIDA_JEFES = 1.15 → jefes con 15 % más vida ──
/** Por acto (según el «act» del enemigo; sin «act» = Acto I) */
export const VIDA_POR_ACTO: Record<number, number> = { 1: 1.15, 2: 1.15, 3: 1.15, 4: 1.1, 5: 1.15 }; // v0.28: +15 %
/** Jefes de acto */
export const VIDA_JEFES = 1;
/** Élites (enemigos con umbral que no son jefes) */
export const VIDA_ELITES = 1;
/** Daño de los ataques enemigos, por acto (v0.28: +15 %). Se aplica junto con la gravedad. */
export const DANO_POR_ACTO: Record<number, number> = { 1: 1.15, 2: 1.15, 3: 1.15, 4: 1.1, 5: 1.25 }; // v0.44: el Abismo pega un poco más
/** Multiplicador extra de daño para jefes y élites */
export const DANO_JEFES = 1;
export const DANO_ELITES = 1;
/** Multiplicador total de daño para un enemigo */
export function danoDe(def: EnemyDef) {
  const grupos = [ENCOUNTERS, ENCOUNTERS_2, ENCOUNTERS_3, ENCOUNTERS_4, ENCOUNTERS_5];
  const es = (k: 'boss' | 'elite') => grupos.some((g) => g[k].some((e) => e[0] === def.id));
  return (DANO_POR_ACTO[def.act ?? 1] ?? 1) * (es('boss') ? DANO_JEFES : es('elite') ? DANO_ELITES : 1);
}

export function spawn(id: string): EnemyState {
  const def = ENEMIES[id];
  const grupos = [ENCOUNTERS, ENCOUNTERS_2, ENCOUNTERS_3, ENCOUNTERS_4, ENCOUNTERS_5];
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
