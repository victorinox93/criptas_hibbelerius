import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H, VERSION_NUM } from '../config';
import { comparaVersion, Novedad, NOVEDADES, novedadesPendientes, ULTIMA_NOVEDAD } from '../data/novedades';
import { Game, saveLocal } from '../state';
import { audio } from '../audio';
import { button, frame, title, txt } from './widgets';

/**
 * v0.87 · Pergamino de novedades.
 *
 * Se abre de dos maneras:
 *  · Solo, la primera vez que el alumno entra después de una actualización
 *    (`avisoDeNovedades`), con las versiones que se perdió.
 *  · A mano desde «★ Novedades» en el menú, con el historial completo.
 *
 * Al cerrarlo se guarda la versión del juego como vista, así que el aviso
 * grande no vuelve a salir hasta la siguiente actualización.
 *
 * Formato de cada punto: si empieza con **algo**, ese arranque se pinta en
 * dorado como encabezado y el resto va debajo. Los demás `**` se quitan.
 */
export function novedades(s: Phaser.Scene, lista: Novedad[] = NOVEDADES, esAviso = false, alCerrar?: () => void) {
  if (!lista.length) { alCerrar?.(); return undefined; }
  const c = s.add.container(0, 0).setDepth(960);
  c.add(s.add.rectangle(0, 0, W, H, 0x050307, 0.96).setOrigin(0).setInteractive());
  const g = s.add.graphics();
  frame(g, 60, 24, W - 120, H - 76, 0x0e0a10, UI.gold, 0.95);
  c.add(g);

  const cab = title(s, W / 2, 44, '', 34, '#ffc080');
  const sub = txt(s, W / 2, 84, '', 20, CSS.dim).setOrigin(0.5, 0);
  c.add([cab, sub]);
  const capa = s.add.container(0, 0);
  c.add(capa);

  const ANCHO = W - 240;
  const Y0 = 126, ALTO = H - 125; // de dónde a dónde se puede escribir

  // Un punto se dibuja como encabezado dorado (si arranca con **…**) y cuerpo.
  const partes = (p: string) => {
    const m = /^\*\*(.+?)\*\*/.exec(p);
    if (!m) return { cabeza: '', cuerpo: p.replace(/\*\*/g, '') };
    // al quitar la coma o el punto que seguían al encabezado, el cuerpo puede
    // quedar empezando en minúscula: se arregla solo
    const cuerpo = p.slice(m[0].length).replace(/^[\s,.:;]+/, '').replace(/\*\*/g, '');
    return { cabeza: m[1], cuerpo: cuerpo.charAt(0).toUpperCase() + cuerpo.slice(1) };
  };
  // mide sin dibujar: crea el texto, lo mide y lo tira
  const alto = (t: string) => {
    if (!t) return 0;
    const o = txt(s, -999, -999, t, 19, CSS.bone, { wordWrap: { width: ANCHO }, lineSpacing: 4 });
    const h = o.height;
    o.destroy();
    return h;
  };

  /**
   * Una versión con muchas novedades no cabe en una pantalla, así que se parte
   * en varias páginas en lugar de cortar la lista (antes se perdían puntos).
   */
  const paginas: { n: Novedad; puntos: string[]; parte: number; total: number }[] = [];
  for (const n of lista) {
    const grupos: string[][] = [];
    let actual: string[] = [], y = Y0;
    for (const p of n.puntos) {
      const { cabeza, cuerpo } = partes(p);
      const h = (cabeza ? alto(cabeza) + 2 : 0) + alto(cuerpo) + 14;
      if (actual.length && y + h > ALTO) { grupos.push(actual); actual = []; y = Y0; }
      actual.push(p);
      y += h;
    }
    if (actual.length) grupos.push(actual);
    grupos.forEach((g, k) => paginas.push({ n, puntos: g, parte: k + 1, total: grupos.length }));
  }

  let i = 0;
  const dibujar = () => {
    capa.removeAll(true);
    const pg = paginas[i];
    cab.setText(esAviso ? '¡Novedades!' : 'Historial de cambios');
    const deParte = pg.total > 1 ? ` (${pg.parte}/${pg.total})` : '';
    const deLista = paginas.length > 1 ? `      ${i + 1} de ${paginas.length}` : '';
    sub.setText(`v${pg.n.v} · ${pg.n.titulo}${deParte}${deLista}`);
    let y = Y0;
    for (const p of pg.puntos) {
      const { cabeza, cuerpo } = partes(p);
      capa.add(txt(s, 88, y, '•', 19, CSS.gold));
      if (cabeza) {
        const t = txt(s, 110, y, cabeza, 19, CSS.gold, { wordWrap: { width: ANCHO }, lineSpacing: 4 });
        capa.add(t);
        y += t.height + 2;
      }
      if (cuerpo) {
        const t = txt(s, 110, y, cuerpo, 19, CSS.bone, { wordWrap: { width: ANCHO }, lineSpacing: 4 });
        capa.add(t);
        y += t.height;
      }
      y += 14;
    }
    if (paginas.length > 1) capa.add(txt(s, W / 2, H - 96, '◀  ▶  o las flechas del teclado', 16, '#5a5468').setOrigin(0.5));
  };

  const ir = (d: number) => { i = (i + paginas.length + d) % paginas.length; audio.sfx('click'); dibujar(); };
  if (paginas.length > 1) {
    c.add(button(s, 110, H - 60, 48, 34, '◀', () => ir(-1), { size: 20 }));
    c.add(button(s, W - 110, H - 60, 48, 34, '▶', () => ir(1), { size: 20 }));
  }
  // se guarda el manejador para quitar SÓLO éste al cerrar
  const alTeclear = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') ir(-1);
    else if (e.key === 'ArrowRight') ir(1);
    else if (e.key === 'Escape' || e.key === 'Enter') cerrar();
  };
  s.input.keyboard?.on('keydown', alTeclear);

  const cerrar = () => {
    if (Game.codex.novedades !== versionVista()) {
      Game.codex.novedades = versionVista();
      saveLocal();
    }
    s.input.keyboard?.off('keydown', alTeclear);
    c.destroy();
    alCerrar?.();
  };
  c.add(button(s, W / 2, H - 60, 260, 38, esAviso ? '¡Entendido!' : 'Volver', cerrar, { color: UI.gold, size: 22 }));
  dibujar();
  return c;
}

/**
 * Qué versión se guarda como «ya vista»: la más alta entre la del juego y la de
 * la novedad más reciente. Así, si alguien olvida subir VERSION_NUM en
 * `config.ts` al agregar una novedad, el aviso sale una vez y no se repite
 * para siempre.
 */
function versionVista() {
  return comparaVersion(ULTIMA_NOVEDAD, VERSION_NUM) > 0 ? ULTIMA_NOVEDAD : VERSION_NUM;
}

/**
 * Aviso de las versiones que el alumno no ha visto. Devuelve true si lo mostró.
 * No sale la primera vez que alguien juega: para él todo es nuevo.
 */
export function avisoDeNovedades(s: Phaser.Scene, primeraVez: boolean, alCerrar?: () => void) {
  const faltan = novedadesPendientes(Game.codex.novedades, primeraVez);
  if (!faltan.length) {
    // quien entra por primera vez queda al día sin ver el aviso
    if (Game.codex.novedades !== versionVista()) { Game.codex.novedades = versionVista(); saveLocal(); }
    return false;
  }
  novedades(s, faltan, true, alCerrar);
  return true;
}
