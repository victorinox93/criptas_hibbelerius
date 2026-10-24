import { ARMORS, CAPES, VISORS } from '../art/palette';
import { ACCESORIOS } from '../data/tienda';
import { Game, isAdmin } from '../state';

/**
 * v0.70 · PROBADOR DEL PROFE: con sesión de administrador se puede encender en el Vestidor
 * o en la Tienda de Layla. Mientras está encendido, TODOS los cosméticos (capas, armaduras,
 * ojos, accesorios, sets y compañeros) se ven desbloqueados para probarlos.
 * No se guarda nada en el Grimorio: al apagarlo (o al recargar la página) todo vuelve a como estaba.
 */
let encendido = false;
export const probador = () => encendido && isAdmin();
export function setProbador(v: boolean) { encendido = v && isAdmin(); }

/** Lo comprado en la Tienda de Layla… o TODO, si el probador está encendido */
export function comprasVisibles(): string[] {
  const c = Game.codex.compras ?? [];
  if (!probador()) return c;
  return [...c, ...ACCESORIOS.map((a) => a.id), ...[...CAPES, ...ARMORS, ...VISORS].map((x) => x.id).filter((id): id is string => !!id)];
}
