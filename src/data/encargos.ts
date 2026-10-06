// ════════════════════════════════════════════════════════════════
//  ENCARGOS DEL TABLÓN: al empezar cada acto puedes aceptar UN contrato
//  opcional. Si lo cumples en ese acto, recibes una bolsa de Ergios.
//  Dónde se revisa cada uno: busca «completarEncargo» en el código.
// ════════════════════════════════════════════════════════════════
import { addErgios, Game, logEvent, saveLocal } from '../state';

export interface EncargoDef {
  id: string;
  nombre: string;
  texto: string;
  premio: number;
}

export const ENCARGOS: EncargoDef[] = [
  { id: 'elitePerfecta', nombre: 'Sin un rasguño', texto: 'Vence a una élite sin perder vida.', premio: 70 },
  { id: 'detener', nombre: 'Primera ley', texto: 'Detén a un enemigo con un solo golpe (F ≥ umbral).', premio: 45 },
  { id: 'racha3', nombre: 'Racha de sabio', texto: 'Responde bien 3 runas seguidas.', premio: 60 },
  { id: 'jefeRapido', nombre: 'Golpe decisivo', texto: 'Vence al jefe del acto en 6 turnos o menos.', premio: 90 },
  { id: 'duelo', nombre: 'Rey de la taberna', texto: 'Gana un duelo de Tira y Afloja.', premio: 50 },
  { id: 'diana', nombre: 'Ojo de halcón', texto: 'Da en el centro de la diana en el Tiro al Blanco.', premio: 40 },
];

/** Si el encargo activo es «id» y no se ha cumplido, lo cumple y paga. Devuelve el premio (0 si no aplica). */
export function completarEncargo(id: string): number {
  const r = Game.run;
  const e = r?.encargo;
  if (!r || !e || e.hecho || e.id !== id || e.acto !== (r.acto ?? 1)) return 0;
  const def = ENCARGOS.find((x) => x.id === id);
  if (!def) return 0;
  e.hecho = true;
  addErgios(def.premio);
  logEvent('encargo', '', true, { id, premio: def.premio, acto: e.acto });
  saveLocal();
  return def.premio;
}
