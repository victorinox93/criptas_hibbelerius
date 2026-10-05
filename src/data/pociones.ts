// ════════════════════════════════════════════════════════════════
//  POCIONES (consumibles): se guardan en 3 frascos arriba de la pantalla.
//  Se consiguen al ganar combates y en la tienda. Clic en un frasco
//  para usarla o tirarla. Lo que hace cada una está en Combat.ts
//  (busca «usePotion»); la de vida también se puede usar en el mapa.
// ════════════════════════════════════════════════════════════════

export interface PocionDef {
  id: string;
  name: string;
  color: string; // color del líquido en el frasco
  text: string;
  lore: string;
  combate: boolean; // true = sólo se puede usar en combate
  lock?: number; // nivel de Conocimiento necesario (src/data/progreso.ts)
}

export const POCIONES: Record<string, PocionDef> = {
  vida: { id: 'vida', name: 'Elixir Rojo', color: '#c43a3a', combate: false, text: 'Recupera 15 de vida.', lore: 'Energía química convertida en reparación de tejidos.' },
  energia: { id: 'energia', name: 'Vial de Joules', color: '#6ad0e8', combate: true, text: '+2 J este turno.', lore: 'Energía embotellada: listo para hacer trabajo.' },
  bloqueo: { id: 'bloqueo', name: 'Agua Pesada', color: '#7aa0d0', combate: true, text: 'Gana 12 de Bloqueo.', lore: 'D₂O: tan densa que detiene golpes.' },
  masa: { id: 'masa', name: 'Frasco de Plomo', color: '#9a93a8', combate: true, text: '+2 kg a tus ataques este combate (Arcanista: +2 m/s).', lore: 'ΣF = m·a: más masa, más fuerza.' },
  aceite: { id: 'aceite', name: 'Aceite Lubricante', color: '#e8c15a', combate: true, text: 'Quita tu Fricción y +3 m/s² este turno (Arcanista: +2 m/s).', lore: 'μ ≈ 0: nada se opone a tu movimiento.' },
  tinta: { id: 'tinta', name: 'Tinta de Hibbelerius', color: '#6a3f8a', combate: true, lock: 2, text: 'Roba 3 cartas.', lore: 'Con ella se escribieron todos los problemas del libro.' },
  fuego: { id: 'fuego', name: 'Fuego Griego', color: '#c87533', combate: true, lock: 3, text: '6 de Calor a todos los enemigos.', lore: 'Una reacción química que sigue ardiendo turno tras turno.' },
  leyden: { id: 'leyden', name: 'Botella de Leyden', color: '#9bf07a', combate: true, lock: 4, text: '10 de daño a todos los enemigos.', lore: 'El primer capacitor: guarda carga eléctrica y la suelta de golpe.' },
  corrosivo: { id: 'corrosivo', name: 'Gas Corrosivo', color: '#8a9a3a', combate: true, lock: 5, text: '2 de Fatiga a todos (+50 % de daño).', lore: 'La corrosión debilita el material desde adentro.' },
  mayor: { id: 'mayor', name: 'Elixir Mayor', color: '#ff7a9a', combate: false, lock: 6, text: 'Recupera 30 de vida y +5 de vida máxima.', lore: 'Destilado en la torre. Huele a pergamino.' },
};

export const MAX_POCIONES = 3;

/** Pociones disponibles según el nivel de Conocimiento */
export function pocionesDisponibles(nivel: number) {
  return Object.values(POCIONES).filter((p) => (p.lock ?? 0) <= nivel).map((p) => p.id);
}
