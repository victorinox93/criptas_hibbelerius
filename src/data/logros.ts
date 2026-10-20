// ════════════════════════════════════════════════════════════════
//  LOGROS (retos) que desbloquean cosméticos especiales.
//  Un cosmético con  logro: 'id'  (src/art/palette.ts) se desbloquea
//  cuando check() es verdadero. Casi todos se guardan como bandera del
//  Grimorio ('logro_…' o 'actoN'); otros se calculan con lo descubierto.
//  En el menú, «Vestidor» muestra todos y cómo conseguirlos.
// ════════════════════════════════════════════════════════════════
import { ALMA_IDS } from './almas';
import { codexFlag, darCompra, Game } from '../state';
import { ARMORS, CAPES, VISORS } from '../art/palette';
import { ACCESORIOS } from './tienda';
import { JEFES, PRIMIGENIOS } from './abismo_modo';
import { SUENOS } from './relatos';

export interface Logro {
  id: string;
  nombre: string;
  como: string; // cómo se consigue (se muestra con el candado)
  check: () => boolean;
}

/** «El Geómetra» → «al Geómetra», «La Bailarina» → «a la Bailarina», «Cthulhu» → «a Cthulhu» */
const aQuien = (n: string) => (n.startsWith('El ') ? `al ${n.slice(3)}` : n.startsWith('La ') ? `a la ${n.slice(3)}` : `a ${n}`);
const flag = (f: string) => (Game.codex.flags ?? []).includes(f);

export const LOGROS: Record<string, Logro> = {
  coloso: { id: 'coloso', nombre: 'Inercia vencida', como: 'Vence al Coloso Inerte', check: () => flag('acto1') },
  bruja: { id: 'bruja', nombre: 'Sin fricción', como: 'Vence a la Bruja de la Fricción', check: () => flag('acto2') || Game.codex.victorias > 0 },
  hibbelerius: { id: 'hibbelerius', nombre: 'Último capítulo', como: 'Vence a Hibbelerius', check: () => flag('acto3') },
  am: { id: 'am', nombre: 'Sin boca', como: 'Vence a AM en el Núcleo del Cálculo', check: () => flag('acto4') },
  neptuno: { id: 'neptuno', nombre: 'Marea de Neptuno', como: 'Vence a la Bruja con gravedad de Neptuno', check: () => Game.codex.gravedadMax >= 2 },
  jupiter: { id: 'jupiter', nombre: 'Tormenta de Júpiter', como: 'Vence a la Bruja con gravedad de Júpiter', check: () => Game.codex.gravedadMax >= 3 },
  alma: { id: 'alma', nombre: 'Nadie cursa solo', como: 'Vence a Hibbelerius con un alma aliada', check: () => flag('logro_alma') },
  lucido: { id: 'lucido', nombre: 'Mente lúcida', como: 'Gana una expedición sin llegar a 40 de Locura', check: () => flag('logro_lucido') },
  erudito: { id: 'erudito', nombre: 'Erudito', como: 'Resuelve 15 runas bien en una sola expedición', check: () => flag('logro_erudito') },
  intacto: { id: 'intacto', nombre: 'Intocable', como: 'Vence a un jefe sin perder vida', check: () => flag('logro_jefePerfecto') },
  almas: { id: 'almas', nombre: 'Coleccionista de almas', como: `Encuentra a las ${ALMA_IDS.length} almas en pena`, check: () => ALMA_IDS.every((a) => Game.codex.npcs.includes(`alma_${a}`)) },
  // v0.35 · regalo (no cuenta para el platino): completar el diagnóstico final
  udem: { id: 'udem', nombre: 'Orgullo UDEM', como: 'Completa el diagnóstico final', check: () => Game.codex.diag?.post !== undefined },
  grimorio: { id: 'grimorio', nombre: 'Bibliotecario', como: 'Descubre el 75 % del Grimorio', check: () => flag('logro_grimorio') },
  // v0.46 · El Abismo de los Ejes (no cuentan para el platino)
  abismo_tramo: { id: 'abismo_tramo', nombre: 'Bajo el Cerro', como: 'Abismo: supera el tramo 1', check: () => flag('abismo_t1') || flag('abismo_t2') },
  abismo_primigenio: { id: 'abismo_primigenio', nombre: 'Ojo del Abismo', como: 'Abismo: vence a un Primigenio', check: () => flag('abismo_t2') || Game.profile?.avatar?.insignia2 === 'abismo' },
  abismo_infinito: { id: 'abismo_infinito', nombre: 'Sin fondo', como: 'Abismo: llega a la profundidad 4 del modo infinito', check: () => flag('logro_abismo_inf') },
  abismo_diario8: { id: 'abismo_diario8', nombre: 'Lector de Montemayor', como: 'Abismo: encuentra 8 hojas del diario', check: () => (Game.codex.diario ?? 0) >= 7 },
  abismo_diario: { id: 'abismo_diario', nombre: 'El diario completo', como: 'Abismo: encuentra las 16 hojas del diario', check: () => (Game.codex.diario ?? 0) >= 15 },
  abismo_dentadura: { id: 'abismo_dentadura', nombre: 'Sonrisa completa', como: 'Abismo: llena los 8 huecos de la dentadura', check: () => flag('logro_dentadura') },
  abismo_providence: { id: 'abismo_providence', nombre: 'Corresponsal', como: 'Abismo: cumple 3 cartas de Providence', check: () => (Game.codex.cartasProvidence ?? 0) >= 3 },
  // v0.47 · el mito: vencer a cada jefe del Abismo (y a los 4 Primigenios)
  ...Object.fromEntries(Object.entries(JEFES).map(([id, j]) => [`abismo_${id}`, {
    id: `abismo_${id}`, nombre: `Vencer ${aQuien(j.nombre)}`, como: `Abismo: vence ${aQuien(j.nombre)}`, check: () => flag(`abismo_vence_${id}`),
  }])),
  abismo_mitos: { id: 'abismo_mitos', nombre: 'Los Mitos completos', como: `Abismo: vence a los ${PRIMIGENIOS.length} Primigenios`, check: () => PRIMIGENIOS.every((p) => flag(`abismo_vence_${p}`)) },
  // v0.51 · Las Tierras del Sueño
  abismo_bokrug: { id: 'abismo_bokrug', nombre: 'Vencer a Bokrug', como: 'Abismo: vence a Bokrug en el sueño de Sarnath', check: () => flag('abismo_vence_bokrug') },
  // v0.54 · premio por dedicarle tiempo (cuenta todo el tiempo de juego, en cualquier modo)
  abismo_veterano5: { id: 'abismo_veterano5', nombre: 'Desvelado', como: 'Juega 10 horas en total', check: () => (Game.codex.tiempo ?? 0) >= 10 * 3600 }, // v0.55: antes 5 h
  abismo_veterano10: { id: 'abismo_veterano10', nombre: 'Veterano de las Criptas', como: 'Juega 15 horas en total', check: () => (Game.codex.tiempo ?? 0) >= 15 * 3600 }, // v0.55: antes 10 h
  abismo_sueno1: { id: 'abismo_sueno1', nombre: 'Soñador', como: 'Abismo: sueña tu primer sueño (nodo 🌙)', check: () => (Game.codex.suenos ?? []).length >= 1 },
  abismo_sueno3: { id: 'abismo_sueno3', nombre: 'Peregrino del sueño', como: 'Abismo: sueña 3 sueños distintos', check: () => (Game.codex.suenos ?? []).length >= 3 },
  abismo_suenos: { id: 'abismo_suenos', nombre: 'Señor de las Tierras del Sueño', como: `Abismo: sueña los ${SUENOS.length} sueños`, check: () => (Game.codex.suenos ?? []).length >= SUENOS.length },
  // v0.31 · el último desbloqueable (Mecha «Inercia-01»): todos los demás logros
  mecha: {
    id: 'mecha', nombre: 'Piloto de élite (platino)', como: 'Consigue TODOS los demás logros',
    check: () => Object.values(LOGROS).filter((l) => l.id !== 'mecha' && l.id !== 'udem' && !l.id.startsWith('abismo_')).every((l) => l.check()),
  },
};

export function logroHecho(id?: string) {
  return !!id && !!LOGROS[id]?.check();
}

/**
 * v0.46 · Revisa los logros del Abismo: entrega los accesorios que se ganan con ellos y
 * regresa los avisos nuevos («Logro: … · Nuevo en el Vestidor: …») para mostrarlos una sola vez.
 */
export function premiosNuevosAbismo(): string[] {
  const avisos: string[] = [];
  for (const l of Object.values(LOGROS)) {
    if (!l.id.startsWith('abismo_') || !l.check()) continue;
    const accs = ACCESORIOS.filter((a) => a.logro === l.id);
    accs.forEach((a) => darCompra(a.id));
    if (flag(`aviso_${l.id}`)) continue;
    codexFlag(`aviso_${l.id}`);
    const nombres = [
      ...CAPES.filter((c) => c.logro === l.id).map((c) => `capa ${c.name}`),
      ...ARMORS.filter((c) => c.logro === l.id).map((c) => `armadura ${c.name}`),
      ...VISORS.filter((c) => c.logro === l.id).map((c) => `ojos ${c.name}`),
      ...accs.map((a) => a.nombre),
    ];
    avisos.push(`Logro «${l.nombre}» · Nuevo en el Vestidor: ${nombres.join(', ')}`);
  }
  return avisos;
}
