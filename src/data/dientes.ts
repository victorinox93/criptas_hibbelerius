// ════════════════════════════════════════════════════════════════
//  LA DENTADURA DE MONTEMAYOR · reliquias del Abismo (v0.42–v0.43)
//  (idea: Sol Cesto, donde los dientes se ponen sobre una dentadura)
//
//  · Al empezar salen 3 dientes al azar y te quedas con 1 (v0.53).
//  · Se ganan más en el Sacamuelas Ciego (mapa), en los Relatos y al vencer a un jefe.
//  · La dentadura tiene 8 huecos y el ORDEN importa:
//      – el Diente Espejo copia al diente de su izquierda;
//      – 3 Astros seguidos = ALINEACIÓN PLANETARIA (tus ataques ×1.5).
//  · RAREZA: común (60 %), raro (30 %, aquí están los Astros) y legendario (10 %).
//  · PARÁSITOS (como en Returnal): un beneficio y un perjuicio. Sólo el Sacamuelas te los quita.
//  · CRISTAL: cualquier diente puede salir de Cristal: su efecto cuenta DOBLE,
//    pero se rompe después de CRISTAL_COMBATES combates. En la dentadura se guarda
//    como «id~N» (N = combates que le quedan); usa base() y cristalDe().
//  · Los ASTROS son como los planetas de Balatro: cada uno sube de nivel
//    una «constelación» (Ataques, Defensas, Habilidades, cartas del Abismo…).
//    El Astrónomo de Providence (nodo Observatorio) también sube niveles: run.cosmos.
//
//  Para agregar un diente: DIENTES (aquí) y su efecto en Combat.ts (busca «diente(»).
// ════════════════════════════════════════════════════════════════

export type TipoDiente = 'normal' | 'astro' | 'parasito';
export type RarezaDiente = 'comun' | 'raro' | 'legendario' | 'parasito';

export interface DienteDef {
  id: string;
  nombre: string;
  texto: string;
  lore: string;
  tipo: TipoDiente;
  rareza: RarezaDiente;
  color: number; // color del esmalte
  planeta?: number; // color del astro pintado sobre el diente
  peso?: number; // qué tan seguido sale dentro de su rareza (1 = normal)
  fusion?: [string, string]; // v0.64 · diente fusionado: cuenta como estos dos, al doble (no sale al azar)
}

/** Probabilidad de cada rareza al sortear un diente */
export const PROB_RAREZA: Record<Exclude<RarezaDiente, 'parasito'>, number> = { comun: 0.6, raro: 0.3, legendario: 0.1 };
export const NOMBRE_RAREZA: Record<RarezaDiente, { t: string; css: string; borde: number }> = {
  comun: { t: 'Común', css: '#d8d0c0', borde: 0x8a3040 },
  raro: { t: '★ Raro', css: '#a8d0ff', borde: 0x6a9ad8 },
  legendario: { t: '★★ Legendario', css: '#ffd060', borde: 0xe8c15a },
  parasito: { t: '☣ Parásito', css: '#b8e070', borde: 0x6a8a2a },
};
/** Probabilidad de que un diente ofrecido salga de Cristal, y cuántos combates dura */
export const PROB_CRISTAL = 0.08;
export const CRISTAL_COMBATES = 2; // v0.46: antes 3
/** Probabilidad de que el Sacamuelas meta un parásito entre sus 3 dientes */
export const PROB_PARASITO_SACAMUELAS = 0.3;
/** Ergios por arrancar un parásito en el Sacamuelas */
export const ARRANCAR_PARASITO = 40;

/** v0.46 · Rueda de la Fortuna del Sacamuelas: costo del primer giro y cuánto sube cada giro */
export const RUEDA_COSTO = 30;
export const RUEDA_SUBE = 15;
/** Gajos de la rueda (p = probabilidad; suman 1) */
export const RUEDA: { id: string; t: string; p: number; color: number }[] = [
  { id: 'legendario', t: '★★ Diente', p: 0.07, color: 0xe8c15a },
  { id: 'raro', t: '★ Diente', p: 0.18, color: 0x6a9ad8 },
  { id: 'ergios', t: '+40 Ergios', p: 0.15, color: 0xb8902a },
  { id: 'cordura', t: '+12 Cordura', p: 0.15, color: 0x4ec46a },
  { id: 'apunte', t: 'Apunte', p: 0.1, color: 0x9a7a5a },
  { id: 'parasito', t: '☣ Parásito', p: 0.17, color: 0x6a8a2a },
  { id: 'nada', t: 'Nada', p: 0.18, color: 0x3a3440 },
];

export const HUECOS = 8;
/** Ergios por volver a tirar en el Sacamuelas (como el «reroll» de Balatro) */
export const RETIRAR_DIENTES = 25;
/** Ataques ×ALINEACION si hay 3 Astros seguidos en la dentadura */
export const ALINEACION = 1.5;
/** v0.46 · tope de los multiplicadores de los dientes (se suman y no pasan de aquí) */
export const MULT_DIENTES_MAX = 2;

export const DIENTES: Record<string, DienteDef> = {
  // ── dientes comunes ──
  colmillo: { id: 'colmillo', rareza: 'comun', nombre: 'Colmillo de Profundo', tipo: 'normal', color: 0xe8e0c8, texto: 'Tus Ataques hacen +2 de daño.', lore: 'Arrancado de una boca con branquias.' },
  muelaPlomo: { id: 'muelaPlomo', rareza: 'comun', nombre: 'Muela de Plomo', tipo: 'normal', color: 0x9aa0a8, texto: 'Empiezas cada combate con 6 de Bloqueo.', lore: 'Pesa tanto que la quijada no se mueve.' },
  incisivo: { id: 'incisivo', rareza: 'comun', nombre: 'Incisivo del Cultista', tipo: 'normal', color: 0xe8dcb0, texto: 'Robas 1 carta más en tu primer turno de cada combate.', lore: 'Tiene grabado un eje que no apunta a ningún lado.' },
  leche: { id: 'leche', rareza: 'comun', nombre: 'Diente de Leche', tipo: 'normal', color: 0xffffff, texto: 'Al ganar un combate recuperas 4 de vida.', lore: 'Alguien lo dejó bajo la almohada del Abismo. El Abismo pagó.' },
  oro: { id: 'oro', rareza: 'comun', nombre: 'Diente de Oro', tipo: 'normal', color: 0xe8c15a, texto: 'Ganas +20 Ergios al ganar un combate.', lore: 'Brilla como sonrisa de mercader.' },
  juicio: { id: 'juicio', rareza: 'comun', nombre: 'Muela del Juicio', tipo: 'normal', color: 0xd8e8f0, texto: 'Acertar una pregunta te da +5 de Cordura extra.', lore: 'Duele, pero te hace pensar.' },
  tiburon: { id: 'tiburon', rareza: 'comun', nombre: 'Diente de Tiburón', tipo: 'normal', color: 0xd0d8d8, texto: 'Cuando muere un enemigo, ganas 4 de Bloqueo.', lore: 'Se le cae uno y le sale otro. Como a la hidra.' },
  vampiro: { id: 'vampiro', rareza: 'raro', nombre: 'Colmillo Vampiro', tipo: 'normal', color: 0xf0d0d0, texto: 'Cuando muere un enemigo, recuperas 3 de vida.', lore: 'Muerde en la yugular… de la gráfica.' },
  canino: { id: 'canino', rareza: 'comun', nombre: 'Canino Giratorio', tipo: 'normal', color: 0xc8e8d8, texto: 'Cada 3 cartas que juegas en un turno, +1 J.', lore: 'Gira sobre su raíz: ω constante, I pequeñita.' },
  protector: { id: 'protector', rareza: 'raro', nombre: 'Protector Bucal', tipo: 'normal', color: 0x6ab8e8, texto: 'No puedes quedar Aturdido y la Hemorragia te dura la mitad.', lore: 'Reglamentario en el box y en el Abismo.' },
  espejo: { id: 'espejo', rareza: 'raro', nombre: 'Diente Espejo', tipo: 'normal', color: 0xc8f4ff, texto: 'Copia el efecto del diente que tiene a su IZQUIERDA (no copia legendarios ni otros espejos).', lore: 'En el espejo, tu sonrisa sonríe un poco tarde.', peso: 0.7 },
  // v0.43 · más comunes
  astilla: { id: 'astilla', rareza: 'comun', nombre: 'Astilla de Hueso', tipo: 'normal', color: 0xe0d8c0, texto: 'Al empezar cada combate, 4 de daño a un enemigo al azar.', lore: 'Sale disparada cuando aprietas la quijada.' },
  premolar: { id: 'premolar', rareza: 'comun', nombre: 'Premolar Paciente', tipo: 'normal', color: 0xd8d8c8, texto: 'Al terminar tu turno, +2 de Bloqueo por cada J que no usaste.', lore: 'Mastica despacio. Ahorra energía.' },
  sarro: { id: 'sarro', rareza: 'comun', nombre: 'Diente con Sarro', tipo: 'normal', color: 0xc8b878, texto: '+8 de Vida máxima mientras lo tengas.', lore: 'Nadie se lavó los dientes en R\'lyeh.' },
  diastema: { id: 'diastema', rareza: 'comun', nombre: 'Diente Separado', tipo: 'normal', color: 0xe8e8d8, texto: 'Cada 3 turnos robas 1 carta más.', lore: 'Por el hueco se cuela una carta de vez en cuando.' },
  // v0.43 · raro
  cordal: { id: 'cordal', rareza: 'raro', nombre: 'Cordal Despierta', tipo: 'normal', color: 0xf0e8d8, texto: 'En tu primer turno de cada combate: +1 J y robas 1 carta.', lore: 'Salió tarde, pero salió con ganas.' },
  // ── LEGENDARIOS ──
  ambar: { id: 'ambar', rareza: 'legendario', nombre: 'Muela de Ámbar', tipo: 'normal', color: 0xe8a040, texto: 'Conservas la mitad de tu Bloqueo de un turno al siguiente.', lore: 'Atrapó un mosquito hace 300 millones de años. Y no lo suelta.' },
  rlyeh: { id: 'rlyeh', rareza: 'legendario', nombre: "Diente de R'lyeh", tipo: 'normal', color: 0x6ad8a8, texto: 'Tu primer ataque de cada combate hace ×2.', lore: 'Tiene ángulos que no deberían caber en una boca.' },
  diamante: { id: 'diamante', rareza: 'legendario', nombre: 'Diente de Diamante', tipo: 'normal', color: 0xd8f8ff, texto: 'Tus Ataques hacen +4 y tus Defensas dan +4 de Bloqueo.', lore: 'Dureza 10 en la escala de Mohs. Muerde lo que sea.' },
  // ── PARÁSITOS (como en Returnal): un beneficio y un perjuicio ──
  podrido: { id: 'podrido', rareza: 'parasito', nombre: 'Diente Podrido', tipo: 'parasito', color: 0x7a6a3a, texto: '+1 J cada turno.\n☣ Pierdes 2 de Cordura cada turno.', lore: 'Huele a página vieja del Necronomicón.' },
  larva: { id: 'larva', rareza: 'parasito', nombre: 'Larva de Shoggoth', tipo: 'parasito', color: 0x5a7a3a, texto: 'Robas 1 carta más cada turno.\n☣ Cada 3 turnos te mete un Susurro.', lore: 'Tekeli-li. Tekeli-li. (Se mueve cuando no la ves.)' },
  branquia: { id: 'branquia', rareza: 'parasito', nombre: 'Branquia del Profundo', tipo: 'parasito', color: 0x6a9a8a, texto: '+12 de Vida máxima.\n☣ Las fogatas te curan la mitad.', lore: 'Respiras mejor bajo el agua. Arriba, ya no tanto.' },
  lombriz: { id: 'lombriz', rareza: 'parasito', nombre: 'Lombriz de Yuggoth', tipo: 'parasito', color: 0xb86a8a, texto: 'Recuperas 5 de vida al ganar un combate.\n☣ Fallar una pregunta te quita el doble de Cordura.', lore: 'Viene de un planeta en la orilla del sistema solar. Tiene hambre.' },
  ojo: { id: 'ojo', rareza: 'parasito', nombre: 'Ojo Parpadeante', tipo: 'parasito', color: 0xe8e0a0, texto: 'Ves las intenciones de los enemigos invisibles y tus Ataques hacen +3.\n☣ Empiezas cada combate Confundido.', lore: 'Te mira desde la encía. Parpadea cuando tú no.' },
  garrapata: { id: 'garrapata', rareza: 'parasito', nombre: 'Garrapata de Leng', tipo: 'parasito', color: 0x8a5a3a, texto: '+30 Ergios al ganar un combate.\n☣ Pierdes 3 de vida al empezar cada combate.', lore: 'Se alimenta de ti y escupe monedas. Negocio redondo (para ella).' },
  // ── ASTROS (como los planetas de Balatro): suben de nivel una constelación ──
  marte: { id: 'marte', rareza: 'raro', nombre: 'Diente de Marte', tipo: 'astro', color: 0xf0e0d0, planeta: 0xd85a3a, texto: 'Constelación de ATAQUE +1 nivel: tus Ataques hacen +2 de daño por nivel.', lore: 'El dios de la guerra también mordía.', peso: 0.7 },
  luna: { id: 'luna', rareza: 'raro', nombre: 'Diente Lunar', tipo: 'astro', color: 0xf0f0f0, planeta: 0xd8d8c8, texto: 'Constelación de DEFENSA +1 nivel: tus Defensas dan +3 de Bloqueo por nivel.', lore: 'Mueve las mareas. Y las encías.', peso: 0.7 },
  mercurio: { id: 'mercurio', rareza: 'raro', nombre: 'Diente de Mercurio', tipo: 'astro', color: 0xe0e8f0, planeta: 0xa8b8c8, texto: 'Constelación de HABILIDAD +1 nivel: tus Habilidades dan +2 de Bloqueo y +2 de daño a tu siguiente ataque por nivel.', lore: 'El planeta más rápido. Muerde y se va.', peso: 0.7 },
  saturno: { id: 'saturno', rareza: 'raro', nombre: 'Diente de Saturno', tipo: 'astro', color: 0xf0e8d0, planeta: 0xe0b860, texto: 'Constelación del ABISMO +1 nivel: las cartas del Abismo hacen ×1.25 de daño (o +3 de Bloqueo) por nivel.', lore: 'Sus anillos tienen un momento de inercia enorme.', peso: 0.6 },
  jupiter: { id: 'jupiter', rareza: 'raro', nombre: 'Diente de Júpiter', tipo: 'astro', color: 0xf0e0c8, planeta: 0xc89a6a, texto: 'Constelación de GRAVEDAD +1 nivel: empiezas cada combate con +1 kg (o +1 m/s) por nivel.', lore: 'g = 24.8 m/s². Hasta morder pesa.', peso: 0.6 },
  neptuno: { id: 'neptuno', rareza: 'raro', nombre: 'Diente de Neptuno', tipo: 'astro', color: 0xe0f0f8, planeta: 0x3a6ad8, texto: 'Constelación de ÓRBITA +1 nivel: cada 3 turnos ganas +1 J por nivel.', lore: 'Lo encontraron con lápiz y papel antes que con telescopio (Le Verrier, 1846).', peso: 0.6 },
  sol: { id: 'sol', rareza: 'legendario', nombre: 'Diente del Sol Negro', tipo: 'astro', color: 0x2a2a30, planeta: 0xffb030, texto: 'Tus ataques hacen +10 % por cada Astro en tu dentadura (contándolo a él).', lore: 'Un sol que no alumbra. Todos los planetas giran a su alrededor.', peso: 0.4 },
};

// v0.64 · dientes FUSIONADOS (Crisol de Newton, src/data/fusiones.ts): ocupan un hueco y cuentan como sus dos ingredientes AL DOBLE
Object.assign(DIENTES, {
  fu_eclipse: { id: 'fu_eclipse', rareza: 'legendario', nombre: 'Diente del Eclipse', tipo: 'astro', color: 0x2a2a3a, planeta: 0xd85a3a, fusion: ['marte', 'luna'], texto: 'Fusión: Diente de Marte + Diente Lunar, los dos AL DOBLE (Ataque +4 y Defensa +6 por nivel).', lore: 'Cuando la Luna tapa a Marte, la guerra y la marea se vuelven una sola mordida.' },
  fu_alineacion: { id: 'fu_alineacion', rareza: 'legendario', nombre: 'Diente de la Alineación', tipo: 'astro', color: 0xf0e0b0, planeta: 0xc89a5a, fusion: ['jupiter', 'mercurio'], texto: 'Fusión: Diente de Júpiter + Diente de Mercurio, los dos AL DOBLE.', lore: 'El planeta más grande y el más rápido, en fila: sus fuerzas se suman.' },
  fu_megalodon: { id: 'fu_megalodon', rareza: 'legendario', nombre: 'Diente de Megalodón', tipo: 'normal', color: 0xb8c8c8, fusion: ['colmillo', 'tiburon'], texto: 'Fusión: Colmillo de Profundo + Diente de Tiburón, los dos AL DOBLE (+4 de daño; +8 de Bloqueo cuando muere un enemigo).', lore: 'El tiburón más grande que existió tenía dientes del tamaño de una mano.' },
  fu_conde: { id: 'fu_conde', rareza: 'legendario', nombre: 'Colmillo del Conde', tipo: 'normal', color: 0xf0c8a0, fusion: ['vampiro', 'oro'], texto: 'Fusión: Colmillo Vampiro + Diente de Oro, los dos AL DOBLE (+6 de vida por enemigo vencido; +40 Ergios por combate).', lore: 'Un aristócrata que muerde… y cobra.' },
  fu_acorazada: { id: 'fu_acorazada', rareza: 'legendario', nombre: 'Muela Acorazada', tipo: 'normal', color: 0x7a90a8, fusion: ['muelaPlomo', 'protector'], texto: 'Fusión: Muela de Plomo + Protector Bucal, los dos AL DOBLE (12 de Bloqueo al empezar; no te aturden).', lore: 'Pesada y bien protegida: nada la mueve.' },
} as Record<string, DienteDef>);

export const D = (id: string) => DIENTES[id];
/** Id sin la marca de Cristal («marte~3» → «marte») */
export const base = (id: string) => id.split('~')[0];
/** Combates que le quedan a un diente de Cristal (undefined = no es de Cristal) */
export const cristalDe = (id?: string | null) => (id && id.includes('~') ? Number(id.split('~')[1]) : undefined);
/** Ficha de un diente aunque traiga la marca de Cristal */
export const defDiente = (id: string) => DIENTES[base(id)];
export const esAstro = (id?: string) => !!id && DIENTES[base(id)]?.tipo === 'astro';
export const esParasito = (id?: string | null) => !!id && DIENTES[base(id)]?.tipo === 'parasito';

/**
 * n dientes al azar (sin repetir y sin los que ya tienes, salvo Astros). Cada uno sortea su rareza
 * (60/30/10) y a veces sale de Cristal (marcado «id~3»). Los parásitos no salen aquí (ver sortearParasito).
 * astrosX multiplica qué tan seguido salen los Astros; legendario = todos legendarios.
 */
export function sortearDientes(n: number, ya: string[] = [], astrosX = 1, opts: { legendario?: boolean; sinCristal?: boolean } = {}): string[] {
  const out: string[] = [];
  const tengo = ya.map(base);
  for (let k = 0; k < n; k++) {
    let r = Math.random();
    const rz: RarezaDiente = opts.legendario ? 'legendario' : r < PROB_RAREZA.legendario ? 'legendario' : r < PROB_RAREZA.legendario + PROB_RAREZA.raro ? 'raro' : 'comun';
    let libres = Object.values(DIENTES).filter((d) => !d.fusion && d.rareza === rz && !out.some((o) => base(o) === d.id) && (!tengo.includes(d.id) || d.tipo === 'astro'));
    if (!libres.length) libres = Object.values(DIENTES).filter((d) => !d.fusion && d.rareza !== 'parasito' && !out.some((o) => base(o) === d.id));
    if (!libres.length) break;
    const peso = (d: DienteDef) => (d.peso ?? 1) * (d.tipo === 'astro' ? astrosX : 1);
    const total = libres.reduce((a, d) => a + peso(d), 0);
    r = Math.random() * total;
    const d = libres.find((x) => (r -= peso(x)) < 0) ?? libres[0];
    out.push(!opts.sinCristal && Math.random() < PROB_CRISTAL ? `${d.id}~${CRISTAL_COMBATES}` : d.id);
  }
  return out;
}

/** Un parásito al azar que no tengas */
export function sortearParasito(ya: (string | null)[] = []): string {
  const tengo = ya.filter((x): x is string => !!x).map(base);
  const libres = Object.values(DIENTES).filter((d) => d.tipo === 'parasito' && !tengo.includes(d.id));
  const de = libres.length ? libres : Object.values(DIENTES).filter((d) => d.tipo === 'parasito');
  return de[Math.floor(Math.random() * de.length)].id;
}

/**
 * Los dientes «efectivos» de la dentadura: cada Diente Espejo se convierte en
 * una copia del diente que tiene a su izquierda (un espejo junto a otro espejo copia la copia).
 */
export function dientesEfectivos(dent: (string | null)[] = []): string[] {
  const out: string[] = [];
  let izq: string | null = null;
  for (const id0 of dent) {
    if (!id0) { izq = null; continue; }
    const id = base(id0);
    // v0.46: el Espejo no copia legendarios ni a otro Espejo (izq = null después de un espejo)
    const real: string | null = id === 'espejo' ? (izq && DIENTES[izq]?.rareza !== 'legendario' ? izq : null) : id;
    const fu = real ? DIENTES[real]?.fusion : undefined;
    if (fu) { for (const x of fu) out.push(x, x); } // v0.64 · fusionado: sus dos ingredientes, al doble
    else if (real) { out.push(real); if (cristalDe(id0) !== undefined) out.push(real); } // el Cristal cuenta doble
    izq = id === 'espejo' ? null : real;
  }
  return out;
}

/** Nivel (cuántas veces cuenta) de un diente en la dentadura, con espejos, Cristal y (para Astros) los niveles del Observatorio */
export const nivelDiente = (dent: (string | null)[] | undefined, id: string, cosmos?: Record<string, number>) =>
  dientesEfectivos(dent ?? []).filter((x) => x === id).length + (cosmos?.[id] ?? 0);

/** ¿Hay 3 Astros seguidos? (Alineación planetaria) */
export function alineacion(dent: (string | null)[] = []): boolean {
  let seguidos = 0;
  let izq: string | null = null;
  for (const id0 of dent) {
    const id = id0 ? base(id0) : null;
    const real: string | null = id === 'espejo' ? (izq && DIENTES[izq]?.rareza !== 'legendario' ? izq : null) : id;
    seguidos = esAstro(real ?? undefined) ? seguidos + 1 : 0;
    if (seguidos >= 3) return true;
    izq = id && id !== 'espejo' ? real : null;
  }
  return false;
}

/** Cuántos Astros hay (con espejos) */
export const cuantosAstros = (dent?: (string | null)[]) => dientesEfectivos(dent ?? []).filter(esAstro).length;

/**
 * Después de cada combate: los dientes de Cristal pierden 1 uso y se rompen al llegar a 0.
 * Regresa los nombres de los que se rompieron.
 */
export function gastarCristal(dent: (string | null)[] | undefined): string[] {
  const rotos: string[] = [];
  if (!dent) return rotos;
  dent.forEach((id, i) => {
    const n = cristalDe(id);
    if (n === undefined || !id) return;
    if (n <= 1) { rotos.push(DIENTES[base(id)].nombre); dent[i] = null; }
    else dent[i] = `${base(id)}~${n - 1}`;
  });
  return rotos;
}

/** Pone un diente en el primer hueco libre; regresa false si la dentadura está llena */
export function ponerDiente(dent: (string | null)[], id: string): boolean {
  while (dent.length < HUECOS) dent.push(null);
  const i = dent.indexOf(null);
  if (i < 0) return false;
  dent[i] = id;
  return true;
}
