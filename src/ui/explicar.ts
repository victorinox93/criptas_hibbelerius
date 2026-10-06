// Explica, en una línea cada una, las cartas, efectos, reliquias y familiares
// que menciona una opción (dilemas, encuentros). Así el alumno sabe qué es
// «Ruido Blanco» o «Radiación» ANTES de elegir.
import { CARDS } from '../data/cards';
import { EFFECTS } from '../data/effects';
import { FAMILIARS } from '../data/familiars';
import { RELICS } from '../data/relics';
import { NO_CTX } from './card';

export interface Refs {
  cards?: (string | undefined)[];
  effects?: (string | undefined)[];
  relics?: (string | undefined)[];
  familiars?: (string | undefined)[];
}

const una = (s: string) => s.replace(/\s*\n\s*/g, ' ').trim();

export function explicar(r: Refs): string {
  const out: string[] = [];
  const vistos = new Set<string>();
  const add = (k: string, s: string) => { if (!vistos.has(k)) { vistos.add(k); out.push(s); } };
  for (const id of r.cards ?? []) {
    if (!id) continue;
    if (id === 'rara') add('c:rara', '◆ Carta rara: una carta poco común de tu clase, al azar.');
    else if (id === 'random') add('c:random', '◆ Carta al azar de tu clase.');
    else if (CARDS[id]) {
      const d = CARDS[id];
      add(`c:${id}`, `◆ ${d.name} (${d.type === 'Estado' ? 'carta basura' : d.type}): ${una(d.text(d.stats(false), NO_CTX))}`);
    }
  }
  for (const id of r.effects ?? []) {
    if (id && EFFECTS[id]) add(`e:${id}`, `◆ ${EFFECTS[id].name} (${EFFECTS[id].good ? 'bendición' : 'maldición'}): ${una(EFFECTS[id].text)}`);
  }
  for (const id of r.relics ?? []) {
    if (!id) continue;
    if (id === 'random') add('r:random', '◆ Reliquia al azar: un objeto con un efecto permanente.');
    else if (RELICS[id]) add(`r:${id}`, `◆ ${RELICS[id].name} (reliquia): ${una(RELICS[id].text)}`);
  }
  for (const id of r.familiars ?? []) {
    if (!id) continue;
    if (id === 'random') add('f:random', '◆ Familiar al azar: una criatura que pelea contigo unos combates.');
    else if (FAMILIARS[id]) add(`f:${id}`, `◆ ${FAMILIARS[id].name} (familiar): ${una(FAMILIARS[id].text)}`);
  }
  return out.join('\n');
}
