// ════════════════════════════════════════════════════════════════
//  v0.73 · EL LEGADO y LA BENDICIÓN DE MONTEMAYOR (inicio del Abismo)
//  Se desbloquean con las hojas del diario de Montemayor que has
//  encontrado (Game.codex.diario, se guardan para siempre):
//   · La Bendición: desde HOJAS_BENDICION hojas. Cada hoja más abre
//     bendiciones nuevas (las chicas primero, las grandes con costo después).
//   · El Legado: desde HOJAS_LEGADO hojas. Al terminar una expedición del
//     Abismo se guarda tu mazo y tu dentadura; en la siguiente puedes
//     llevarte UNA carta o UN diente, a cambio de Locura.
//  Se usa en src/scenes/Abismo.ts (después de los sobres).
// ════════════════════════════════════════════════════════════════
import Phaser from 'phaser';
import { CARDS, Edicion } from './cards';
import { base } from './dientes';
import { Game, Run } from '../state';

export const HOJAS_BENDICION = 3;
export const HOJAS_LEGADO = 5;
/** Locura que cuesta traer algo de la expedición anterior */
export const LEGADO_LOCURA = 10;
/** Hojas del diario encontradas (la primera, la del Cerro, siempre cuenta) */
export const hojasDiario = () => (Game.codex.diario ?? 0) + 1;

export interface BendicionDef {
  id: string;
  nombre: string;
  texto: string;
  costo?: string;
  hoja: number; // hojas del diario que se necesitan
  grande?: boolean;
}

export const BENDICIONES: BendicionDef[] = [
  // chicas: gratis
  { id: 'ergios', nombre: 'Bolsa del Erudito', texto: '+60 Ergios.', hoja: 3 },
  { id: 'vida', nombre: 'Pulso Firme', texto: '+8 de Vida máxima.', hoja: 3 },
  { id: 'cordura', nombre: 'Mente Clara', texto: '−15 de Locura al empezar.', hoja: 4 },
  { id: 'apuntes', nombre: 'Apuntes al Margen', texto: '2 Apuntes de Montemayor (pistas gratis en las preguntas).', hoja: 5 },
  { id: 'mejora', nombre: 'Repaso Nocturno', texto: 'Mejora 2 cartas al azar de tu mazo.', hoja: 6 },
  // grandes: con costo
  { id: 'quitar', nombre: 'Olvido Selectivo', texto: 'Quita 2 cartas de tu mazo (tú eliges).', costo: '−6 de Vida máxima', hoja: 7, grande: true },
  { id: 'rara', nombre: 'La Página Arrancada', texto: 'Una carta rara del Abismo, mejorada.', costo: 'Una maldición al azar', hoja: 8, grande: true },
  { id: 'diente', nombre: 'El Diente de la Cueva', texto: 'Un diente legendario.', costo: '+20 de Locura', hoja: 10, grande: true },
  { id: 'reliquia', nombre: 'El Hallazgo de Montemayor', texto: 'Una reliquia al azar.', costo: '−10 de Vida máxima', hoja: 12, grande: true },
];

/** Las bendiciones que se ofrecen hoy: hasta 2 chicas y 2 grandes de las ya desbloqueadas */
export function bendicionesOfrecidas(): BendicionDef[] {
  const h = hojasDiario();
  const ok = BENDICIONES.filter((b) => b.hoja <= h);
  const chicas = Phaser.Utils.Array.Shuffle(ok.filter((b) => !b.grande)).slice(0, 2);
  const grandes = Phaser.Utils.Array.Shuffle(ok.filter((b) => b.grande)).slice(0, 2);
  return [...chicas, ...grandes];
}

export interface LegadoGuardado { cartas: { id: string; up: boolean; ed?: Edicion }[]; dientes: string[]; tramo: number }

/** Al terminar una expedición del Abismo: guarda lo que llevabas para el Legado */
export function guardarLegado(r: Run) {
  // v0.74 · compacto: sólo las 12 cartas más raras (el Grimorio se guarda en una celda de la hoja)
  const peso = (id: string) => ({ legendaria: 4, rara: 3, común: 2, inicial: 0 } as Record<string, number>)[CARDS[id]?.rarity ?? 'inicial'] ?? 0;
  const cartas = r.deck.filter((c) => CARDS[c.id] && CARDS[c.id].rarity !== 'estado' && !CARDS[c.id].pieza)
    .sort((a, b) => peso(b.id) - peso(a.id)).slice(0, 12)
    .map((c) => (c.ed ? { id: c.id, up: c.up, ed: c.ed } : { id: c.id, up: c.up }));
  const dientes = (r.dientes ?? []).filter((d): d is string => !!d).map(base);
  if (!cartas.length && !dientes.length) return;
  Game.codex.legado = { cartas, dientes, tramo: r.tramo ?? 1 };
}

/** Lo que se ofrece del Legado: hasta 4 cartas (las más raras primero) y hasta 2 dientes */
export function ofertaLegado(): { cartas: LegadoGuardado['cartas']; dientes: string[] } | null {
  const l = Game.codex.legado;
  if (!l) return null;
  const peso = (id: string) => ({ legendaria: 4, rara: 3, común: 2, inicial: 0 } as Record<string, number>)[CARDS[id]?.rarity ?? 'inicial'] ?? 0;
  const unicas = [...new Map(l.cartas.filter((c) => CARDS[c.id]).map((c) => [`${c.id}${c.up ? '+' : ''}${c.ed ?? ''}`, c])).values()];
  const cartas = Phaser.Utils.Array.Shuffle(unicas).sort((a, b) => peso(b.id) - peso(a.id) + (a.up === b.up ? 0 : a.up ? -0.5 : 0.5)).slice(0, 4);
  const dientes = Phaser.Utils.Array.Shuffle([...new Set(l.dientes)]).slice(0, 2);
  return cartas.length || dientes.length ? { cartas, dientes } : null;
}
