// ════════════════════════════════════════════════════════════════
//  v0.71 · MALDICIONES (como en Slay the Spire)
//  Son cartas de tipo «Maldición» (src/data/cards.ts, prefijo m_) que se
//  quedan en tu mazo. Te las dan los pactos del mythos, las reliquias
//  malditas y algunos encuentros. Las quita el Demonio de Maxwell
//  (src/scenes/Maxwell.ts y, después de conocerlo, en las fogatas)
//  y el Mercader («Olvidar una carta»).
// ════════════════════════════════════════════════════════════════
import Phaser from 'phaser';
import { CARDS, cardName } from './cards';
import { addCard, Game } from '../state';

export const MALDICIONES = ['m_arrepentimiento', 'm_dolor', 'm_decaimiento', 'm_duda', 'm_normalidad', 'm_torpeza', 'm_parasito'];
export const esMaldicion = (id: string) => CARDS[id]?.type === 'Maldición';
/** Vida máxima que cuesta quitar un Parásito de Yuggoth */
export const PARASITO_VIDA = 3;
/** Ergios que cobra el Demonio de Maxwell en la fogata */
export const MAXWELL_PRECIO = 25;
/** v0.77 · Ergios que cobra por «ordenar tus ideas» cuando no traes maldiciones */
export const MAXWELL_IDEAS = 15;

/** Índices de las maldiciones del mazo */
export function maldicionesEnMazo(): number[] {
  const r = Game.run;
  return r ? r.deck.map((c, i) => (esMaldicion(c.id) ? i : -1)).filter((i) => i >= 0) : [];
}

/** Agrega una maldición (al azar si no se dice cuál). Devuelve su nombre. */
export function darMaldicion(id?: string): string {
  const m = id ?? Phaser.Utils.Array.GetRandom(MALDICIONES);
  addCard(m);
  return CARDS[m].name;
}

/** Quita la carta i del mazo. Si es un Parásito de Yuggoth, cuesta Vida máxima. Devuelve qué pasó. */
export function quitarDelMazo(i: number): string {
  const r = Game.run!;
  const [c] = r.deck.splice(i, 1);
  if (!c) return '';
  if (c.id === 'm_parasito') {
    r.maxHp = Math.max(10, r.maxHp - PARASITO_VIDA);
    r.hp = Math.min(r.hp, r.maxHp);
    return `${cardName(c)} (al arrancarlo pierdes ${PARASITO_VIDA} de Vida máxima)`;
  }
  return cardName(c);
}
