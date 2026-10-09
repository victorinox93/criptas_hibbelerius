// ════════════════════════════════════════════════════════════════
//  MYRIAM, LA HECHICERA OSCURA (encuentro)
//  Aparece en un nodo de encuentro con probabilidad MYRIAM_CHANCE
//  (una vez por expedición, desde el piso 3). No regala nada:
//  te muestra TRES maldiciones y tienes que aceptar una.
//  Lo único que puedes decidir es cuál duele menos.
// ════════════════════════════════════════════════════════════════
import { CARDS } from './cards';
import { RELICS } from './relics';
import { addCard, addEffect, addEntropia, addErgios, Game, Run } from '../state';

export const MYRIAM_CHANCE = 0.15;

export interface Maldicion {
  id: string;
  nombre: string;
  icono: string;
  texto: string;
  lore: string;
  puede: (r: Run) => boolean;
  aplicar: (r: Run) => string; // devuelve lo que pasó
}

const azar = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export const MALDICIONES: Maldicion[] = [
  {
    id: 'robo', nombre: 'Entropía Creciente', icono: 'i_fog',
    texto: 'Pierdes 3 cartas al azar de tu mazo.', lore: 'El orden tiende al desorden. Tu mazo también.',
    puede: (r) => r.deck.length > 8,
    aplicar: (r) => {
      const ido: string[] = [];
      for (let i = 0; i < 3; i++) {
        const k = Math.floor(Math.random() * r.deck.length);
        ido.push(CARDS[r.deck[k].id]?.name ?? r.deck[k].id);
        r.deck.splice(k, 1);
      }
      return `Se desvanecen: ${ido.join(', ')}.`;
    },
  },
  {
    id: 'vida', nombre: 'Masa Perdida', icono: 'i_heart',
    texto: '−8 de Vida máxima.', lore: 'Myriam se lleva un poco de ti. No dice para qué.',
    puede: (r) => r.maxHp > 30,
    aplicar: (r) => { r.maxHp -= 8; r.hp = Math.min(r.hp, r.maxHp); return 'Tu Vida máxima baja 8.'; },
  },
  {
    id: 'dinero', nombre: 'Impuesto de Fricción', icono: 'i_coin',
    texto: 'Pierdes la mitad de tus Ergios.', lore: 'Toda transacción disipa energía. Esta, la tuya.',
    puede: (r) => r.ergios >= 20,
    aplicar: (r) => { const n = Math.ceil(r.ergios / 2); addErgios(-n); return `Pierdes ${n} Ergios.`; },
  },
  {
    id: 'ruido', nombre: 'Ruido Térmico', icono: 'i_fog',
    texto: '2 cartas «Ruido Blanco» entran a tu mazo.', lore: 'Agitación molecular: inútil y siempre presente.',
    puede: () => !!CARDS.ruido,
    aplicar: () => { addCard('ruido'); addCard('ruido'); return '2 «Ruido Blanco» a tu mazo.'; },
  },
  {
    id: 'desgaste', nombre: 'Fatiga del Material', icono: 'i_anvil',
    texto: '2 cartas mejoradas pierden su mejora.', lore: 'Ciclos de carga y descarga… hasta que el metal cede.',
    puede: (r) => r.deck.filter((c) => c.up).length >= 1,
    aplicar: (r) => {
      const ups = r.deck.filter((c) => c.up).sort(() => Math.random() - 0.5).slice(0, 2);
      ups.forEach((c) => (c.up = false));
      return `Pierden su mejora: ${ups.map((c) => CARDS[c.id]?.name ?? c.id).join(', ')}.`;
    },
  },
  {
    id: 'locura', nombre: 'Mirada del Abismo', icono: 'i_ojo',
    texto: '+20 de Locura.', lore: 'Myriam te mira a los ojos. Algo de ella se queda.',
    puede: (r) => (r.entropia ?? 0) < 80,
    aplicar: () => { addEntropia(20); return 'Tu Locura sube 20.'; },
  },
  {
    id: 'lodo', nombre: 'Pies de Lodo', icono: 'i_mud',
    texto: 'Empiezas los próximos 3 combates con 2 de Fricción.', lore: 'El suelo se vuelve barro bajo tus botas.',
    puede: () => true,
    aplicar: () => { addEffect('lodo', 3); return 'Pies de Lodo por 3 combates.'; },
  },
  {
    id: 'hueca', nombre: 'Arma Hueca', icono: 'i_feather',
    texto: '−1 kg a tus ataques por 3 combates.', lore: 'Menos masa, menos fuerza con la misma aceleración.',
    puede: () => true,
    aplicar: () => { addEffect('hueca', 3); return 'Arma Hueca por 3 combates.'; },
  },
  {
    id: 'pociones', nombre: 'Frascos Rotos', icono: 'i_crystal',
    texto: 'Se rompen todas tus pociones.', lore: 'Un chasquido de dedos y el vidrio estalla.',
    puede: (r) => (r.pociones ?? []).length > 0,
    aplicar: (r) => { const n = (r.pociones ?? []).length; r.pociones = []; return `Se rompen ${n} poción(es).`; },
  },
  {
    id: 'reliquia', nombre: 'Hurto Arcano', icono: 'i_bag',
    texto: 'Myriam se queda con una de tus reliquias.', lore: '«Bonita. Ahora es mía.»',
    puede: (r) => r.relics.some((id) => !RELICS[id]?.especial && !RELICS[id]?.jefe),
    aplicar: (r) => {
      const opc = r.relics.filter((id) => !RELICS[id]?.especial && !RELICS[id]?.jefe);
      const id = azar(opc);
      r.relics.splice(r.relics.indexOf(id), 1);
      return `Se lleva: ${RELICS[id]?.name ?? id}.`;
    },
  },
];

/** Tres maldiciones posibles para esta expedición */
export function tresMaldiciones(r: Run) {
  return MALDICIONES.filter((m) => m.puede(r)).sort(() => Math.random() - 0.5).slice(0, 3);
}

export const MYRIAM_SALUDOS = [
  '«Soy Myriam. No vendo, no regalo, no pregunto. Sólo cobro.»',
  '«Otro viajero que creyó que todos los encuentros eran amables. Qué ternura.»',
  '«Hibbelerius escribe problemas. Yo los provoco.»',
];
export const MYRIAM_ELIGE = 'Te dejo elegir cuál de estas maldiciones llevarás. Es lo único amable que hago.';
export const MYRIAM_DESPEDIDA = ['«Hasta la próxima… si es que hay próxima.»', '«No me agradezcas. Nadie lo hace.»', '«Corre. La entropía siempre gana.»'];

void Game;
