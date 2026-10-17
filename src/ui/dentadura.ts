import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { alineacion, ALINEACION, base, cristalDe, cuantosAstros, defDiente, DIENTES, dientesEfectivos, HUECOS, NOMBRE_RAREZA } from '../data/dientes';
import { Game } from '../state';
import { button, frame, Tooltip, txt } from './widgets';

// ════════════════════════════════════════════════════════════════
//  Dibujo de los dientes y de la dentadura (src/data/dientes.ts)
// ════════════════════════════════════════════════════════════════

/** Un diente dibujado a mano: corona, dos raíces y (si es Astro) su planeta */
export function dibujarDiente(s: Phaser.Scene, x: number, y: number, id0: string | null, k = 1) {
  const c = s.add.container(x, y).setScale(k);
  const g = s.add.graphics();
  c.add(g);
  const id = id0 ? base(id0) : null;
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
  if (d.tipo === 'parasito') {
    // parásito: manchas y un tentaculito que se asoma
    g.fillStyle(0x2a3a10, 0.9).fillCircle(7, -4, 5).fillCircle(-6, 3, 3);
    g.lineStyle(3, 0x8ab84a, 1).beginPath();
    for (let t = 0; t <= 8; t++) g.lineTo(15 + t * 1.6, -18 - t * 2 + Math.sin(t) * 3);
    g.strokePath();
  }
  if (id === 'ojo') { g.fillStyle(0xffffff, 1).fillCircle(0, -8, 8); g.fillStyle(0x3a8a3a, 1).fillCircle(1, -8, 4); g.fillStyle(0x000000, 1).fillCircle(1, -8, 2); }
  if (id === 'ambar') g.fillStyle(0x3a2010, 0.8).fillCircle(2, -8, 3); // el mosquito
  if (id === 'diamante') g.lineStyle(2, 0xffffff, 0.9).lineBetween(-10, -16, 0, -2).lineBetween(0, -2, 10, -16).lineBetween(-10, -16, 10, -16);
  if (id === 'rlyeh') g.lineStyle(2, 0x0a3a2a, 1).strokeTriangle(-9, 2, 9, 2, 3, -18);
  // legendario: aro dorado
  if (d.rareza === 'legendario') g.lineStyle(3, 0xffd060, 1).strokeRoundedRect(-21, -28, 42, 42, 11);
  else if (d.rareza === 'raro') g.lineStyle(2, 0x8ab8f0, 0.9).strokeRoundedRect(-20, -27, 40, 40, 10);
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
  const cr = cristalDe(id0);
  if (cr !== undefined) {
    // CRISTAL: velo azulado, rayas de brillo y los combates que le quedan
    g.fillStyle(0xc8f4ff, 0.35).fillRoundedRect(-19, -26, 38, 38, 10);
    g.lineStyle(2, 0xffffff, 0.9).lineBetween(-12, 8, 6, -22).lineBetween(-4, 10, 12, -14);
    g.lineStyle(2, 0xe8fbff, 1).strokeRoundedRect(-19, -26, 38, 38, 10);
    const n = txt(s, 16, -36, `${cr}`, 15, '#e8fbff').setOrigin(0.5).setStroke('#2a6a8a', 4);
    c.add(n);
  }
  return c;
}

/** «★ Raro · Astro · Cristal» */
export function etiquetaDiente(id: string) {
  const d = defDiente(id);
  return [NOMBRE_RAREZA[d.rareza].t, d.tipo === 'astro' ? '✦ Astro' : '', cristalDe(id) !== undefined ? 'Cristal' : ''].filter(Boolean).join(' · ');
}
/** Aviso del Cristal para los textos */
export const textoCristal = (id: string) => (cristalDe(id) !== undefined ? `\n💎 CRISTAL: su efecto cuenta doble. Se rompe en ${cristalDe(id)} combate(s).` : '');

/** Posición de cada hueco: una sonrisa (arco) de 8 dientes */
export function posHueco(i: number, cx: number, cy: number, paso = 70) {
  const dx = (i - (HUECOS - 1) / 2) * paso;
  return { x: cx + dx, y: cy - 0.0006 * dx * dx * (70 / paso) };
}

/**
 * La dentadura completa. onHueco (opcional) se llama al hacer clic en un hueco.
 * Regresa el contenedor y una función para volver a pintarla.
 */
export function dentaduraView(s: Phaser.Scene, cx: number, cy: number, tip: Tooltip, opts: { paso?: number; k?: number; onHueco?: (i: number) => void; marcado?: () => number; dent?: () => (string | null)[]; resaltar?: (i: number) => boolean } = {}) {
  const c = s.add.container(0, 0);
  const paso = opts.paso ?? 70, k = opts.k ?? 1;
  let brillo: Phaser.Tweens.Tween | null = null;
  const pintar = () => {
    brillo?.stop();
    brillo = null;
    c.list.forEach((o) => s.tweens.killTweensOf(o));
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
      // v0.44: zona de clic más grande (todo el ancho del hueco) y un marco al pasar el mouse
      const zw = paso - 4, zh = 104 * k;
      if (opts.resaltar?.(i)) {
        const rs = s.add.graphics();
        rs.lineStyle(3, 0xffd060, 1).strokeRoundedRect(p.x - zw / 2 + 2, p.y - 50 * k, zw - 4, zh - 4, 8);
        c.add(rs);
        s.tweens.add({ targets: rs, alpha: 0.25, duration: 450, yoyo: true, repeat: -1 });
      }
      const hover = s.add.graphics().setVisible(false);
      hover.lineStyle(2, 0xffffff, 0.7).strokeRoundedRect(p.x - zw / 2 + 2, p.y - 50 * k, zw - 4, zh - 4, 8);
      c.add(hover);
      const z = s.add.zone(p.x, p.y + 2 * k, zw, zh).setInteractive({ useHandCursor: !!opts.onHueco });
      if (opts.onHueco) { z.on('pointerover', () => hover.setVisible(true)); z.on('pointerout', () => hover.setVisible(false)); }
      if (id) {
        const d = defDiente(id);
        const copia = d.id === 'espejo' ? izq : null;
        tip.attach(z, `${d.nombre} · ${etiquetaDiente(id)}`, `${d.texto}${d.id === 'espejo' ? `\nAhora copia: ${copia ? DIENTES[copia].nombre : 'nada (pon un diente a su izquierda)'}` : ''}${textoCristal(id)}\n${d.lore}`, 20);
      } else tip.attach(z, `Hueco ${i + 1}`, 'Vacío. Consigue dientes en el Sacamuelas Ciego o al vencer a un jefe.', 20);
      if (opts.onHueco) z.on('pointerdown', () => opts.onHueco!(i));
      c.add(z);
      izq = id ? (base(id) === 'espejo' ? izq : base(id)) : null;
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
export function resumenCosmos(dent: (string | null)[] = [], cosmos?: Record<string, number>) {
  const ef = dientesEfectivos(dent);
  const n = (id: string) => ef.filter((x) => x === id).length + (cosmos?.[id] ?? 0);
  const partes: string[] = [];
  if (n('marte')) partes.push(`Ataque nv ${n('marte')}`);
  if (n('luna')) partes.push(`Defensa nv ${n('luna')}`);
  if (n('mercurio')) partes.push(`Habilidad nv ${n('mercurio')}`);
  if (n('saturno')) partes.push(`Abismo nv ${n('saturno')}`);
  if (n('jupiter')) partes.push(`Gravedad nv ${n('jupiter')}`);
  if (n('neptuno')) partes.push(`Órbita nv ${n('neptuno')}`);
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
  const cos = resumenCosmos(dent, Game.run?.cosmos);
  capa.add(txt(s, W / 2, 146, cos ? `Cosmos: ${cos}` : 'Pasa el mouse sobre un diente para ver qué hace. El orden importa.', 17, cos ? '#ffd060' : CSS.dim, { align: 'center', wordWrap: { width: 660 } }).setOrigin(0.5, 0));
  const tip = new Tooltip(s);
  const { c } = dentaduraView(s, W / 2, 290, tip);
  capa.add(c);
  capa.add(button(s, W / 2, 392, 180, 36, 'Cerrar', () => { tip.hide(); capa.destroy(); }, { size: 19, color: UI.border }));
  return capa;
}
