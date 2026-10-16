import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { AUTOR, PROLOGO } from '../data/abismo_modo';
import { button, frame, txt } from './widgets';

// ════════════════════════════════════════════════════════════════
//  EL DIARIO DEL PROFESOR ARRIETA, por partes.
//  La hoja 1 se lee al empezar; las otras aparecen en el mapa al
//  empezar cada tramo y antes del Primigenio (paginasHasta). El texto
//  está en PROLOGO (src/data/abismo_modo.ts).
// ════════════════════════════════════════════════════════════════

/**
 * Cuántas hojas debería haber leído el jugador: la 1 al empezar, una al empezar cada
 * tramo (2, 3 y 4) y la última justo antes del Primigenio (tramo 4, antes del jefe).
 */
export function paginasHasta(tramo: number, piso: number, pisosTramo = 6) {
  const n = Math.min(4, Math.max(1, tramo)) + (tramo >= 4 && piso >= pisosTramo ? 1 : 0);
  return Math.min(PROLOGO.length, n);
}

/**
 * Dibujo a tinta del Cerro de la Silla (la «silla» entre los dos picos) con la cueva marcada.
 * x, y = centro de la base del dibujo.
 */
function dibujoCerro(s: Phaser.Scene, x: number, y: number) {
  const c = s.add.container(x, y);
  const g = s.add.graphics();
  const tinta = 0x6a5636, sombra = 0x3a2e1c;
  // silueta: sube al pico norte, baja a la silla, sube al segundo pico y baja con lomas
  const perfil: [number, number][] = [[-270, 0], [-230, -14], [-190, -40], [-160, -62], [-138, -92], [-118, -104], [-104, -96], [-86, -80],
    [-60, -62], [-34, -54], [-10, -56], [14, -66], [38, -84], [54, -96], [66, -90], [84, -74], [110, -62], [128, -66], [150, -52], [180, -40], [210, -24], [240, -14], [270, 0]];
  // relleno tenue y sombreado con rayas (como grabado)
  g.fillStyle(0x2a2216, 0.35).fillPoints(perfil.map(([a, b]) => new Phaser.Math.Vector2(a, b)), true);
  for (let k = -260; k < 260; k += 9) {
    const i = perfil.findIndex(([a]) => a >= k);
    if (i <= 0) continue;
    const [x0, y0] = perfil[i - 1], [x1, y1] = perfil[i];
    const yy = y0 + ((k - x0) / (x1 - x0)) * (y1 - y0);
    g.lineStyle(1, sombra, 0.6).lineBetween(k, yy + 6, k - 8, Math.min(0, yy + 30));
  }
  g.lineStyle(3, tinta, 1).strokePoints(perfil.map(([a, b]) => new Phaser.Math.Vector2(a, b)), false);
  g.lineStyle(2, tinta, 0.8).lineBetween(-290, 0, 290, 0);
  // la cueva, abajo de la silla, con un brillo verde
  g.fillStyle(0x0a0806, 1).fillEllipse(-22, -30, 22, 16);
  g.lineStyle(2, tinta, 1).strokeEllipse(-22, -30, 22, 16);
  const brillo = s.add.circle(-22, -30, 9, 0xb8ff9a, 0.35);
  s.tweens.add({ targets: brillo, alpha: 0.08, duration: 900, yoyo: true, repeat: -1 });
  // flecha y anotación a mano
  g.lineStyle(2, 0x8a3a2a, 0.9).lineBetween(-120, -10, -36, -26).lineBetween(-36, -26, -46, -18).lineBetween(-36, -26, -44, -34);
  const nota = txt(s, -238, -14, 'la cueva', 17, '#8a3a2a');
  const nombre = txt(s, 150, -118, 'Cerro de la Silla, 1931', 16, '#8a7a5a').setOrigin(0.5);
  c.add([g, brillo, nota, nombre]);
  c.once('destroy', () => s.tweens.killTweensOf(brillo));
  return c;
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
  capa.add(txt(s, W / 2 - 300, 86, `Diario de ${AUTOR} · página ${i + 1}/${PROLOGO.length}`, 17, '#8a7a5a'));
  capa.add(txt(s, W / 2 + 300, 86, pg.fecha, 17, '#8a7a5a').setOrigin(1, 0));
  const t = txt(s, W / 2, pg.dibujo ? 116 : 140, '', pg.dibujo ? 21 : 24, '#d8c8a0', { align: 'center', wordWrap: { width: 580 }, lineSpacing: 4 }).setOrigin(0.5, 0);
  capa.add(t);
  if (pg.dibujo === 'cerro') capa.add(dibujoCerro(s, W / 2, 398));
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
