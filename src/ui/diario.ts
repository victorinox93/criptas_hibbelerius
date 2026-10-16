import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { PROLOGO } from '../data/abismo_modo';
import { button, frame, txt } from './widgets';

// ════════════════════════════════════════════════════════════════
//  EL DIARIO DEL PROFESOR ARRIETA, por partes.
//  La página 1 se lee al empezar. Las demás aparecen en el mapa
//  conforme bajas (pisos en PISO_DIARIO). El texto está en PROLOGO
//  (src/data/abismo_modo.ts).
// ════════════════════════════════════════════════════════════════

/** Piso completado a partir del cual aparece cada página (índice = página − 1) */
export const PISO_DIARIO = [0, 2, 4, 6, 8];

/** Cuántas páginas debería haber leído el jugador al llegar a este piso */
export function paginasHasta(piso: number) {
  return PISO_DIARIO.filter((p) => piso >= p).length;
}

/**
 * Muestra una hoja del diario encima de la escena. El texto se escribe letra por letra;
 * el primer clic lo completa y el segundo cierra la hoja.
 */
export function hojaDiario(s: Phaser.Scene, i: number, onClose?: () => void, encontrada = true) {
  const pg = PROLOGO[i];
  const capa = s.add.container(0, 0).setDepth(940);
  capa.add(s.add.rectangle(0, 0, W, H, 0x020606, 0.85).setOrigin(0).setInteractive());
  const g = s.add.graphics();
  frame(g, W / 2 - 330, 70, 660, 340, 0x16130e, 0x5a4a2e, 0.97);
  g.lineStyle(1, 0x3a3020, 0.6);
  for (let y = 130; y < 400; y += 26) g.lineBetween(W / 2 - 300, y, W / 2 + 300, y); // renglones del cuaderno
  capa.add(g);
  if (encontrada) capa.add(txt(s, W / 2, 46, 'Encuentras una hoja mojada entre las piedras…', 19, CSS.gold).setOrigin(0.5));
  capa.add(txt(s, W / 2 - 300, 86, `Diario del profesor Elías Arrieta · página ${i + 1}/${PROLOGO.length}`, 17, '#8a7a5a'));
  capa.add(txt(s, W / 2 + 300, 86, pg.fecha, 17, '#8a7a5a').setOrigin(1, 0));
  const t = txt(s, W / 2, 140, '', 24, '#d8c8a0', { align: 'center', wordWrap: { width: 580 }, lineSpacing: 6 }).setOrigin(0.5, 0);
  capa.add(t);
  let n = 0;
  // la máquina de escribir se detiene si la hoja se cierra (si no, escribiría sobre un texto borrado y congelaría el juego)
  const ev = s.time.addEvent({ delay: 22, repeat: pg.texto.length - 1, callback: () => { if (t.active) t.setText(pg.texto.slice(0, ++n)); } });
  capa.once('destroy', () => ev.remove(false));
  const cerrar = () => { capa.destroy(); onClose?.(); };
  const seguir = () => {
    if (n < pg.texto.length) { ev.remove(false); t.setText(pg.texto); n = pg.texto.length; return; }
    audio.sfx('click');
    cerrar();
  };
  capa.add(button(s, W / 2 + 120, 450, 200, 40, 'Seguir', seguir, { color: UI.gold, size: 21 }));
  capa.add(button(s, W / 2 - 120, 450, 200, 40, 'Guardar la hoja', cerrar, { size: 19 }));
  return capa;
}
