// ════════════════════════════════════════════════════════════════
//  v0.89 · EL RETO DE LA SEMILLA
//
//  Un descenso al Abismo donde TODOS empiezan igual (mismo personaje, misma
//  página del Necronomicón, mismo pacto, mismas cartas y mismos dientes) y el
//  Abismo se sortea igual para todos (src/semilla.ts): mismo mapa, mismos
//  jefes, mismos enemigos, mismas tiendas. Tiene su propio ranking.
//
//  PARA CAMBIAR EL RETO (por ejemplo, el próximo semestre):
//    1. Cambia `id` (así empieza un ranking nuevo; los puntajes del reto
//       anterior se quedan en la hoja, pero ya no se mezclan).
//    2. Cambia `semilla` por cualquier número: sale otro Abismo.
//    3. Cambia el personaje, la página, el pacto, las cartas o los dientes.
//       Los ids están en src/data/classes.ts, abismo_modo.ts (PAGINAS y
//       PACTOS), cards.ts y dientes.ts. Un id que no exista se ignora.
//  Si cambias el `id`, cámbialo también en apps-script/Code.gs → PREMIOS.reto
//  (sólo lo usa «Calcular premios»; el ranking del juego funciona sin tocar Code.gs).
// ════════════════════════════════════════════════════════════════
export interface RetoDef {
  id: string; // letras y números, sin espacios ni guiones, máx. 5 caracteres: va dentro del runId («L-SEM-<id>-…»)
  nombre: string;
  semilla: number;
  clase: string; // 'caballero' | 'arcanista' | 'penitente' | 'espectro'
  gravedad: number; // 1 = Tierra
  pagina: string; // página del Necronomicón (PAGINAS)
  pacto: string; // pacto: define el mazo base (PACTOS)
  cartas: string[]; // cartas extra (lo que saldría de los 3 sobres)
  dientes: string[]; // dientes con los que empiezas
}

export const RETO: RetoDef = {
  id: 'OTO26',
  nombre: 'El Reto de la Semilla',
  semilla: 20261122,
  clase: 'arcanista',
  gravedad: 1,
  pagina: 'tiempo',
  pacto: 'volante',
  cartas: ['choque', 'rafaga', 'barrera', 'ab_rodadura', 'momentoInercia', 'visVivaA'],
  dientes: ['incisivo', 'leche'],
};

/** Prefijo del runId de las partidas de un reto (el servidor las separa del ranking del Abismo con él) */
export const prefijoReto = (id = RETO.id) => `L-SEM-${id}-`;
