import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { alineacion, ALINEACION, cuantosAstros, DIENTES, dientesEfectivos, HUECOS } from '../data/dientes';
import { Game } from '../state';
import { button, frame, Tooltip, txt } from './widgets';

// ════════════════════════════════════════════════════════════════
//  Dibujo de los dientes y de la dentadura (src/data/dientes.ts)
// ════════════════════════════════════════════════════════════════

/** Un diente dibujado a mano: corona, dos raíces y (si es Astro) su planeta */
export function dibujarDiente(s: Phaser.Scene, x: number, y: number, id: string | null, k = 1) {
  const c = s.add.container(x, y).setScale(k);
  const g = s.add.graphics();
  c.add(g);
  if (!id) {
    // hueco vacío: una encía con un agujero oscuro
    g.fillStyle(0x1a0608, 1).fillEllipse(0, 8, 30, 20);
    g.lineStyle(2, 0x5a2028, 1).strokeEllipse(0, 8, 30, 20);
    return c;
  }
  const d = DIENTES[id];
  const sombra = Phaser.Display.Color.IntegerToColor(d.color).darken(35).color;
  // raíces (hacia abajo)
  g.fillStyle(sombra, 1).fillTriangle(-14, 8, -4, 8, -10, 34).fillTriangle(4, 8, 14, 8, 10, 34);
  // corona
  g.fillStyle(0x000000, 1).fillRoundedRect(-19, -26, 38, 38, 10);
  g.fillStyle(d.color, 1).fillRoundedRect(-17, -24, 34, 34, 9);
  g.fillStyle(0xffffff, 0.45).fillRoundedRect(-12, -20, 8, 16, 4); // brillo del esmalte
  if (id === 'colmillo' || id === 'canino' || id === 'vampiro' || id === 'tiburon') g.fillStyle(d.color, 1).fillTriangle(-17, -14, 17, -14, 0, -40); // punta
  if (id === 'vampiro') g.fillStyle(0xc83a3a, 1).fillCircle(0, -30, 3);
  if (d.tipo === 'maldito') { g.fillStyle(0x3a2a10, 0.9).fillCircle(6, -6, 5).fillCircle(-6, 2, 3); }
  if (id === 'oro') g.lineStyle(2, 0xfff0a0, 0.9).strokeRoundedRect(-14, -21, 28, 28, 7);
  if (id === 'protector') g.fillStyle(0x2a6aa8, 0.85).fillRoundedRect(-19, -10, 38, 14, 4);
  if (id === 'espejo') { g.lineStyle(3, 0xffffff, 0.8).lineBetween(-10, 6, 8, -20); g.lineStyle(2, 0x6ab8e8, 0.8).lineBetween(-4, 8, 12, -14); }
  if (d.planeta !== undefined) {
    g.fillStyle(d.planeta, 1).fillCircle(0, -7, 9);
    g.lineStyle(2, 0x000000, 0.6).strokeCircle(0, -7, 9);
    if (id === 'saturno') g.lineStyle(2, 0x8a6a30, 1).strokeEllipse(0, -7, 30, 8);
    if (id === 'sol') g.lineStyle(2, 0xffd060, 0.8).strokeCircle(0, -7, 13);
    // estrellita del Astro
    g.fillStyle(0xfff6c0, 1).fillCircle(12, -20, 2).fillCircle(-13, -17, 1.5);
  }
  return c;
}

/** Posición de cada hueco: una sonrisa (arco) de 8 dientes */
export function posHueco(i: number, cx: number, cy: number, paso = 70) {
  const dx = (i - (HUECOS - 1) / 2) * paso;
  return { x: cx + dx, y: cy - 0.0006 * dx * dx * (70 / paso) };
}

/**
 * La dentadura completa. onHueco (opcional) se llama al hacer clic en un hueco.
 * Regresa el contenedor y una función para volver a pintarla.
 */
export function dentaduraView(s: Phaser.Scene, cx: number, cy: number, tip: Tooltip, opts: { paso?: number; k?: number; onHueco?: (i: number) => void; marcado?: () => number; dent?: () => (string | null)[] } = {}) {
  const c = s.add.container(0, 0);
  const paso = opts.paso ?? 70, k = opts.k ?? 1;
  let brillo: Phaser.Tweens.Tween | null = null;
  const pintar = () => {
    brillo?.stop();
    brillo = null;
    c.removeAll(true);
    const dent = opts.dent?.() ?? Game.run?.dientes ?? [];
    // encía
    const g = s.add.graphics();
    g.lineStyle(40 * k, 0x5a1a24, 1);
    g.beginPath();
    for (let i = 0; i <= 40; i++) { const t = i / 40; const p = posHueco(t * (HUECOS - 1), cx, cy, paso); g.lineTo(p.x, p.y + 12 * k); }
    g.strokePath();
    g.lineStyle(4, 0x8a3040, 0.8);
    g.beginPath();
    for (let i = 0; i <= 40; i++) { const t = i / 40; const p = posHueco(t * (HUECOS - 1), cx, cy, paso); g.lineTo(p.x, p.y - 6 * k); }
    g.strokePath();
    c.add(g);
    let izq: string | null = null;
    for (let i = 0; i < HUECOS; i++) {
      const id = dent[i] ?? null;
      const p = posHueco(i, cx, cy, paso);
      const v = dibujarDiente(s, p.x, p.y, id, k);
      c.add(v);
      if (opts.marcado?.() === i) {
        const m = s.add.graphics();
        m.lineStyle(3, 0xe8c15a, 1).strokeRoundedRect(p.x - 26 * k, p.y - 46 * k, 52 * k, 86 * k, 8);
        c.add(m);
      }
      const z = s.add.zone(p.x, p.y, 56 * k, 80 * k).setInteractive({ useHandCursor: !!opts.onHueco });
      if (id) {
        const d = DIENTES[id];
        const copia = id === 'espejo' ? izq : null;
        const tipo = d.tipo === 'astro' ? 'Astro' : d.tipo === 'maldito' ? 'Maldito' : 'Diente';
        tip.attach(z, `${d.nombre} · ${tipo}`, `${d.texto}${id === 'espejo' ? `\nAhora copia: ${copia ? DIENTES[copia].nombre : 'nada (pon un diente a su izquierda)'}` : ''}\n${d.lore}`, 20);
      } else tip.attach(z, `Hueco ${i + 1}`, 'Vacío. Consigue dientes en el Sacamuelas Ciego o al vencer a un jefe.', 20);
      if (opts.onHueco) z.on('pointerdown', () => opts.onHueco!(i));
      c.add(z);
      izq = id ? (id === 'espejo' ? izq : id) : null;
    }
    // alineación planetaria
    if (alineacion(dent)) {
      const t = txt(s, cx, cy + 46 * k + 6, `✦ ALINEACIÓN PLANETARIA: tus ataques ×${ALINEACION} ✦`, Math.round(16 * Math.max(0.9, k)), '#ffd060').setOrigin(0.5, 0).setStroke('#000', 4);
      c.add(t);
      brillo = s.tweens.add({ targets: t, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
    }
  };
  pintar();
  c.once('destroy', () => brillo?.stop());
  return { c, pintar };
}

/** Texto corto del poder cósmico (niveles de constelación) */
export function resumenCosmos(dent: (string | null)[] = []) {
  const ef = dientesEfectivos(dent);
  const n = (id: string) => ef.filter((x) => x === id).length;
  const partes: string[] = [];
  if (n('marte')) partes.push(`Ataque nv ${n('marte')}`);
  if (n('luna')) partes.push(`Defensa nv ${n('luna')}`);
  if (n('mercurio')) partes.push(`Habilidad nv ${n('mercurio')}`);
  if (n('saturno')) partes.push(`Abismo nv ${n('saturno')}`);
  if (n('jupiter')) partes.push(`Gravedad nv ${n('jupiter')}`);
  if (n('sol')) partes.push(`Sol Negro ×${Math.pow(1.1, cuantosAstros(dent) * n('sol')).toFixed(2)}`);
  if (alineacion(dent)) partes.push(`Alineación ×${ALINEACION}`);
  return partes.join(' · ');
}

/** Ventana con la dentadura (desde el botón del HUD); sólo para ver */
export function dentaduraOverlay(s: Phaser.Scene) {
  const capa = s.add.container(0, 0).setDepth(930);
  capa.add(s.add.rectangle(0, 0, W, H, 0x020606, 0.82).setOrigin(0).setInteractive());
  const g = s.add.graphics();
  frame(g, W / 2 - 360, 90, 720, 330, 0x140a0e, 0x8a3040, 0.97);
  capa.add(g);
  capa.add(txt(s, W / 2, 104, 'La Dentadura de Montemayor', 30, '#f0c8c8').setOrigin(0.5, 0));
  const dent = Game.run?.dientes ?? [];
  const cos = resumenCosmos(dent);
  capa.add(txt(s, W / 2, 146, cos ? `Cosmos: ${cos}` : 'Pasa el mouse sobre un diente para ver qué hace. El orden importa.', 17, cos ? '#ffd060' : CSS.dim, { align: 'center', wordWrap: { width: 660 } }).setOrigin(0.5, 0));
  const tip = new Tooltip(s);
  const { c } = dentaduraView(s, W / 2, 290, tip);
  capa.add(c);
  capa.add(button(s, W / 2, 392, 180, 36, 'Cerrar', () => { tip.hide(); capa.destroy(); }, { size: 19, color: UI.border }));
  return capa;
}
