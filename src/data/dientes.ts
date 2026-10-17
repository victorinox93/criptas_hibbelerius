// ════════════════════════════════════════════════════════════════
//  LA DENTADURA DE MONTEMAYOR · reliquias del Abismo (v0.42)
//  (idea: Sol Cesto, donde los dientes se ponen sobre una dentadura)
//
//  · Al empezar salen 4 dientes al azar y te quedas con 2.
//  · Se ganan más en el nodo «El Sacamuelas Ciego» (mapa) y al vencer a un jefe.
//  · La dentadura tiene 8 huecos y el ORDEN importa:
//      – el Diente Espejo copia al diente de su izquierda;
//      – 3 Astros seguidos = ALINEACIÓN PLANETARIA (tus ataques ×1.5).
//  · Los ASTROS son como los planetas de Balatro: cada uno sube de nivel
//    una «constelación» (Ataques, Defensas, Habilidades, cartas del Abismo…).
//
//  Para agregar un diente: DIENTES (aquí) y su efecto en Combat.ts (busca «diente(»).
// ════════════════════════════════════════════════════════════════

export type TipoDiente = 'normal' | 'astro' | 'maldito';

export interface DienteDef {
  id: string;
  nombre: string;
  texto: string;
  lore: string;
  tipo: TipoDiente;
  color: number; // color del esmalte
  planeta?: number; // color del astro pintado sobre el diente
  peso?: number; // qué tan seguido sale (1 = normal)
}

export const HUECOS = 8;
/** Ergios por volver a tirar en el Sacamuelas (como el «reroll» de Balatro) */
export const RETIRAR_DIENTES = 25;
/** Ataques ×ALINEACION si hay 3 Astros seguidos en la dentadura */
export const ALINEACION = 1.5;

export const DIENTES: Record<string, DienteDef> = {
  // ── dientes comunes ──
  colmillo: { id: 'colmillo', nombre: 'Colmillo de Profundo', tipo: 'normal', color: 0xe8e0c8, texto: 'Tus Ataques hacen +2 de daño.', lore: 'Arrancado de una boca con branquias.' },
  muelaPlomo: { id: 'muelaPlomo', nombre: 'Muela de Plomo', tipo: 'normal', color: 0x9aa0a8, texto: 'Empiezas cada combate con 6 de Bloqueo.', lore: 'Pesa tanto que la quijada no se mueve.' },
  incisivo: { id: 'incisivo', nombre: 'Incisivo del Cultista', tipo: 'normal', color: 0xe8dcb0, texto: 'Robas 1 carta más en tu primer turno de cada combate.', lore: 'Tiene grabado un eje que no apunta a ningún lado.' },
  leche: { id: 'leche', nombre: 'Diente de Leche', tipo: 'normal', color: 0xffffff, texto: 'Al ganar un combate recuperas 4 de vida.', lore: 'Alguien lo dejó bajo la almohada del Abismo. El Abismo pagó.' },
  oro: { id: 'oro', nombre: 'Diente de Oro', tipo: 'normal', color: 0xe8c15a, texto: 'Ganas +20 Ergios al ganar un combate.', lore: 'Brilla como sonrisa de mercader.' },
  juicio: { id: 'juicio', nombre: 'Muela del Juicio', tipo: 'normal', color: 0xd8e8f0, texto: 'Acertar una pregunta te da +5 de Cordura extra.', lore: 'Duele, pero te hace pensar.' },
  tiburon: { id: 'tiburon', nombre: 'Diente de Tiburón', tipo: 'normal', color: 0xd0d8d8, texto: 'Cuando muere un enemigo, ganas 4 de Bloqueo.', lore: 'Se le cae uno y le sale otro. Como a la hidra.' },
  vampiro: { id: 'vampiro', nombre: 'Colmillo Vampiro', tipo: 'normal', color: 0xf0d0d0, texto: 'Cuando muere un enemigo, recuperas 3 de vida.', lore: 'Muerde en la yugular… de la gráfica.' },
  canino: { id: 'canino', nombre: 'Canino Giratorio', tipo: 'normal', color: 0xc8e8d8, texto: 'Cada 3 cartas que juegas en un turno, +1 J.', lore: 'Gira sobre su raíz: ω constante, I pequeñita.' },
  protector: { id: 'protector', nombre: 'Protector Bucal', tipo: 'normal', color: 0x6ab8e8, texto: 'No puedes quedar Aturdido y la Hemorragia te dura la mitad.', lore: 'Reglamentario en el box y en el Abismo.' },
  espejo: { id: 'espejo', nombre: 'Diente Espejo', tipo: 'normal', color: 0xc8f4ff, texto: 'Copia el efecto del diente que tiene a su IZQUIERDA en la dentadura.', lore: 'En el espejo, tu sonrisa sonríe un poco tarde.', peso: 0.7 },
  // ── malditos: muy buenos, con un precio ──
  podrido: { id: 'podrido', nombre: 'Diente Podrido', tipo: 'maldito', color: 0x7a6a3a, texto: '+1 J cada turno, pero pierdes 2 de Cordura cada turno.', lore: 'Huele a página vieja del Necronomicón.', peso: 0.6 },
  // ── ASTROS (como los planetas de Balatro): suben de nivel una constelación ──
  marte: { id: 'marte', nombre: 'Diente de Marte', tipo: 'astro', color: 0xf0e0d0, planeta: 0xd85a3a, texto: 'Constelación de ATAQUE +1 nivel: tus Ataques hacen +3 de daño por nivel.', lore: 'El dios de la guerra también mordía.', peso: 0.7 },
  luna: { id: 'luna', nombre: 'Diente Lunar', tipo: 'astro', color: 0xf0f0f0, planeta: 0xd8d8c8, texto: 'Constelación de DEFENSA +1 nivel: tus Defensas dan +3 de Bloqueo por nivel.', lore: 'Mueve las mareas. Y las encías.', peso: 0.7 },
  mercurio: { id: 'mercurio', nombre: 'Diente de Mercurio', tipo: 'astro', color: 0xe0e8f0, planeta: 0xa8b8c8, texto: 'Constelación de HABILIDAD +1 nivel: tus Habilidades dan +2 de Bloqueo y +2 de daño a tu siguiente ataque por nivel.', lore: 'El planeta más rápido. Muerde y se va.', peso: 0.7 },
  saturno: { id: 'saturno', nombre: 'Diente de Saturno', tipo: 'astro', color: 0xf0e8d0, planeta: 0xe0b860, texto: 'Constelación del ABISMO +1 nivel: las cartas del Abismo hacen ×1.25 de daño (o +3 de Bloqueo) por nivel.', lore: 'Sus anillos tienen un momento de inercia enorme.', peso: 0.6 },
  jupiter: { id: 'jupiter', nombre: 'Diente de Júpiter', tipo: 'astro', color: 0xf0e0c8, planeta: 0xc89a6a, texto: 'Constelación de GRAVEDAD +1 nivel: empiezas cada combate con +1 kg (o +1 m/s) por nivel.', lore: 'g = 24.8 m/s². Hasta morder pesa.', peso: 0.6 },
  sol: { id: 'sol', nombre: 'Diente del Sol Negro', tipo: 'astro', color: 0x2a2a30, planeta: 0xffb030, texto: 'Tus ataques hacen ×1.1 por cada Astro en tu dentadura (contándolo a él).', lore: 'Un sol que no alumbra. Todos los planetas giran a su alrededor.', peso: 0.4 },
};

export const D = (id: string) => DIENTES[id];
export const esAstro = (id?: string) => !!id && DIENTES[id]?.tipo === 'astro';

/** n dientes al azar (sin repetir y sin los que ya tienes, si se puede) */
export function sortearDientes(n: number, ya: string[] = [], astrosX = 1): string[] {
  const out: string[] = [];
  const pool = Object.values(DIENTES).filter((d) => !ya.includes(d.id) || d.tipo === 'astro'); // los astros se pueden repetir (suben más el nivel)
  while (out.length < n && pool.length) {
    const libres = pool.filter((d) => !out.includes(d.id));
    if (!libres.length) break;
    const peso = (d: DienteDef) => (d.peso ?? 1) * (d.tipo === 'astro' ? astrosX : 1);
    const total = libres.reduce((a, d) => a + peso(d), 0);
    let r = Math.random() * total;
    const d = libres.find((x) => (r -= peso(x)) < 0) ?? libres[0];
    out.push(d.id);
  }
  return out;
}

/**
 * Los dientes «efectivos» de la dentadura: cada Diente Espejo se convierte en
 * una copia del diente que tiene a su izquierda (un espejo junto a otro espejo copia la copia).
 */
export function dientesEfectivos(dent: (string | null)[] = []): string[] {
  const out: string[] = [];
  let izq: string | null = null;
  for (const id of dent) {
    if (!id) { izq = null; continue; }
    const real: string | null = id === 'espejo' ? izq : id;
    if (real) out.push(real);
    izq = real;
  }
  return out;
}

/** Nivel (cuántas veces cuenta) de un diente en la dentadura, con espejos */
export const nivelDiente = (dent: (string | null)[] | undefined, id: string) => dientesEfectivos(dent ?? []).filter((x) => x === id).length;

/** ¿Hay 3 Astros seguidos? (Alineación planetaria) */
export function alineacion(dent: (string | null)[] = []): boolean {
  let seguidos = 0;
  let izq: string | null = null;
  for (const id of dent) {
    const real: string | null = id === 'espejo' ? izq : id;
    seguidos = esAstro(real ?? undefined) ? seguidos + 1 : 0;
    if (seguidos >= 3) return true;
    izq = id ? real : null;
  }
  return false;
}

/** Cuántos Astros hay (con espejos) */
export const cuantosAstros = (dent?: (string | null)[]) => dientesEfectivos(dent ?? []).filter(esAstro).length;

/** Pone un diente en el primer hueco libre; regresa false si la dentadura está llena */
export function ponerDiente(dent: (string | null)[], id: string): boolean {
  while (dent.length < HUECOS) dent.push(null);
  const i = dent.indexOf(null);
  if (i < 0) return false;
  dent[i] = id;
  return true;
}
