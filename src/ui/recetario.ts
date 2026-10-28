import Phaser from 'phaser';
import { CSS } from '../art/palette';
import { W, H } from '../config';
import { CARDS } from '../data/cards';
import { DIENTES } from '../data/dientes';
import { Receta, RECETAS_CARTAS, RECETAS_DIENTES, recetaConocida } from '../data/fusiones';
import { button, frame, title, txt } from './widgets';

/**
 * v0.64 · El Recetario del Taller de Newton: las recetas son SECRETAS.
 * Antes de descubrirlas sólo se ve una pista («???»); al fundirlas una vez, se ven completas.
 * Se abre desde el Crisol (Fogata) y desde el Grimorio.
 */
export function recetario(s: Phaser.Scene, alCerrar?: () => void) {
  const c = s.add.container(0, 0).setDepth(960);
  c.add(s.add.rectangle(0, 0, W, H, 0x050307, 0.96).setOrigin(0).setInteractive());
  const total = RECETAS_CARTAS.length + RECETAS_DIENTES.length;
  const sabidas = [...RECETAS_CARTAS, ...RECETAS_DIENTES].filter((r) => recetaConocida(r.id)).length;
  c.add(title(s, W / 2, 34, 'Recetario del Taller de Newton', 32, '#ffc080'));
  c.add(txt(s, W / 2, 62, `Descubiertas: ${sabidas} de ${total}. Las secretas sólo muestran una pista. Cualquier otra pareja de cartas da una mezcla intermedia.`, 15, CSS.dim, { align: 'center' }).setOrigin(0.5, 0));
  // v0.72 · ya son muchas recetas de cartas: se ven por páginas (8 por página)
  const POR_PAG = 8;
  const columna = (x: number, nombre: string, lista: Receta[], nombreDe: (id: string) => string) => {
    const g = s.add.graphics();
    frame(g, x - 4, 86, 452, 400, 0x0e0a10, 0x6a4a2a, 0.95);
    c.add(g);
    const pags = Math.max(1, Math.ceil(lista.length / POR_PAG));
    const cab = txt(s, x + 222, 92, nombre, 19, CSS.gold).setOrigin(0.5, 0);
    c.add(cab);
    const capa = s.add.container(0, 0);
    c.add(capa);
    let pag = 0;
    const dibujar = () => {
      capa.removeAll(true);
      cab.setText(pags > 1 ? `${nombre} · ${pag + 1}/${pags}` : nombre);
      const trozo = lista.slice(pag * POR_PAG, (pag + 1) * POR_PAG);
      trozo.forEach((r, i) => {
        const y = 120 + i * 43;
        const ok = recetaConocida(r.id);
        capa.add(txt(s, x + 8, y, ok ? `${nombreDe(r.a)} + ${nombreDe(r.b)} → ${nombreDe(r.res)}` : '??? + ??? → ???', 14, ok ? '#ffe0a0' : '#8a7a6a'));
        const d = txt(s, x + 8, y + 17, ok ? `${r.formula} · ${r.explica}` : `Pista: ${r.pista}`, 12, ok ? CSS.bone : '#b8a0d0', { wordWrap: { width: 436 } });
        d.setMaxLines(2);
        capa.add(d);
      });
    };
    dibujar();
    if (pags > 1) {
      c.add(button(s, x + 30, 470, 44, 26, '◂', () => { pag = (pag + pags - 1) % pags; dibujar(); }, { size: 16 }));
      c.add(button(s, x + 414, 470, 44, 26, '▸', () => { pag = (pag + 1) % pags; dibujar(); }, { size: 16 }));
    }
  };
  columna(24, 'Cartas', RECETAS_CARTAS, (id) => CARDS[id]?.name ?? id);
  columna(492, 'Dientes (sólo en el Abismo)', RECETAS_DIENTES, (id) => DIENTES[id]?.nombre ?? id);
  c.add(button(s, W / 2, 510, 200, 36, 'Cerrar', () => { c.destroy(); alCerrar?.(); }, { size: 20 }));
  return c;
}
