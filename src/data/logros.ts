// ════════════════════════════════════════════════════════════════
//  LOGROS (retos) que desbloquean cosméticos especiales.
//  Un cosmético con  logro: 'id'  (src/art/palette.ts) se desbloquea
//  cuando check() es verdadero. Casi todos se guardan como bandera del
//  Grimorio ('logro_…' o 'actoN'); otros se calculan con lo descubierto.
//  En el menú, «Vestidor» muestra todos y cómo conseguirlos.
// ════════════════════════════════════════════════════════════════
import { ALMA_IDS } from './almas';
import { Game } from '../state';

export interface Logro {
  id: string;
  nombre: string;
  como: string; // cómo se consigue (se muestra con el candado)
  check: () => boolean;
}

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
  grimorio: { id: 'grimorio', nombre: 'Bibliotecario', como: 'Descubre el 75 % del Grimorio', check: () => flag('logro_grimorio') },
  // v0.31 · el último desbloqueable (Mecha «Inercia-01»): todos los demás logros
  mecha: {
    id: 'mecha', nombre: 'Piloto de élite (platino)', como: 'Consigue TODOS los demás logros',
    check: () => Object.values(LOGROS).filter((l) => l.id !== 'mecha').every((l) => l.check()),
  },
};

export function logroHecho(id?: string) {
  return !!id && !!LOGROS[id]?.check();
}
