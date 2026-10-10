import Phaser from 'phaser';
import { enqueue } from '../api';
import { ARMORS, CAPES, Cosmetico, CSS, UI, VISORS } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { W } from '../config';
import { Game, nivelActual, saveLocal } from '../state';
import { button, Btn, dungeonBackground, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';
import { bloqueado, comoDesbloquear } from './Avatar';
import { ACCESORIOS, NOMBRE_CAT } from '../data/tienda';

type Parte = 'cape' | 'armor' | 'visor';
const PARTES: { id: Parte; nombre: string; lista: Cosmetico[] }[] = [
  { id: 'cape', nombre: 'Capas', lista: CAPES },
  { id: 'armor', nombre: 'Armaduras', lista: ARMORS },
  { id: 'visor', nombre: 'Ojos y visor', lista: VISORS },
];
const COLS = 6, FILAS = 3, CW = 140, CH = 114, GAP = 10;
const X0 = (W - (COLS * CW + (COLS - 1) * GAP)) / 2;

/** Menú → Vestidor: todos los cosméticos, cuáles tienes y cómo conseguir los demás. Clic para equipar. */
export class VestidorScene extends Phaser.Scene {
  private tab = 0;
  private pag = 0;
  private layer!: Phaser.GameObjects.Container;
  private tabs: Btn[] = [];
  private tip!: Tooltip;

  constructor() { super('Vestidor'); }

  create() {
    this.cameras.main.fadeIn(250);
    audio.play('menu');
    dungeonBackground(this, 41, 0x16121c);
    title(this, W / 2, 34, 'Vestidor', 42);
    txt(this, W / 2, 66, 'Clic en un cosmético desbloqueado para equiparlo. Los demás dicen cómo conseguirlos.', 16, CSS.dim).setOrigin(0.5);
    this.tip = new Tooltip(this);
    this.layer = this.add.container(0, 0);
    this.tabs = [...PARTES.map((p) => p.nombre), 'Accesorios'].map((_, i) => button(this, W / 2 + (i - 1.5) * 200, 98, 190, 32, '', () => { this.tab = i; this.pag = 0; this.draw(); }, { size: 18 }));
    button(this, W / 2, 516, 200, 36, 'Volver', () => fadeTo(this, 'Menu'), { size: 21 });
    this.draw();
  }

  /** Accesorios de la Tienda de Layla: los comprados se equipan aquí */
  private drawAcc() {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const compras = Game.codex.compras ?? [];
    const porPag = COLS * FILAS;
    const pags = Math.ceil(ACCESORIOS.length / porPag);
    ACCESORIOS.slice(this.pag * porPag, (this.pag + 1) * porPag).forEach((a, k) => {
      const x = X0 + (k % COLS) * (CW + GAP), y = 124 + Math.floor(k / COLS) * (CH + 8);
      const tiene = compras.includes(a.id);
      const puesto = av[a.slot] === a.id;
      const g = this.add.graphics();
      frame(g, x, y, CW, CH, puesto ? 0x2a2014 : 0x0e0b12, puesto ? UI.gold : tiene ? 0xc8864a : UI.border, 0.95);
      this.layer.add(g);
      const key = `vacc_${a.id}`;
      makeHeroFromAvatar(this, { ...av, [a.slot]: a.id }, key);
      const im = this.add.image(x + CW / 2, y + 40, key).setScale(1.35);
      if (!tiene) im.setTint(0x2a2630);
      this.layer.add(im);
      const nombre = txt(this, x + CW / 2, y + 72, a.nombre, 15, tiene ? CSS.bone : '#6a6478', { align: 'center' }).setOrigin(0.5, 0);
      if (nombre.width > CW - 10) nombre.setScale((CW - 10) / nombre.width, 1);
      this.layer.add(nombre);
      const estado = !tiene ? `🔒 Tienda de Layla (${NOMBRE_CAT[a.cat!]})` : puesto ? '✓ Puesto · clic para quitar' : 'Clic para ponértelo';
      const et = txt(this, x + CW / 2, y + 92, estado, 12, !tiene ? '#8a7a6a' : puesto ? CSS.green : CSS.dim, { align: 'center', wordWrap: { width: CW - 10 } }).setOrigin(0.5, 0);
      this.layer.add(et);
      const z = this.add.zone(x, y, CW, CH).setOrigin(0).setInteractive({ useHandCursor: tiene });
      z.on('pointerover', () => this.tip.show(x + CW / 2, y + CH + 4, a.nombre, a.desc));
      z.on('pointerout', () => this.tip.hide());
      z.on('pointerdown', () => {
        if (!tiene) { audio.sfx('wrong'); return; }
        av[a.slot] = puesto ? undefined : a.id;
        saveLocal();
        if (!prof.offline) enqueue('saveProfile', { token: prof.token, alias: av.alias, avatar: JSON.stringify(av) });
        makeHeroFromAvatar(this, av);
        audio.sfx('click');
        this.draw();
      });
      this.layer.add(z);
    });
    if (pags > 1) {
      this.layer.add(button(this, W - 90, 516, 120, 32, this.pag + 1 < pags ? 'Más ▸' : '◂ Inicio', () => { this.pag = (this.pag + 1) % pags; this.draw(); }, { size: 17 }));
    }
  }

  private draw() {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const nivel = nivelActual();
    this.layer.removeAll(true);
    PARTES.forEach((p, i) => {
      const n = p.lista.filter((c) => !bloqueado(c, nivel)).length;
      this.tabs[i].label.setText(`${p.nombre} ${n}/${p.lista.length}`).setColor(i === this.tab ? CSS.gold : CSS.dim);
    });
    const compras = Game.codex.compras ?? [];
    this.tabs[3].label.setText(`Accesorios ${ACCESORIOS.filter((a) => compras.includes(a.id)).length}/${ACCESORIOS.length}`).setColor(this.tab === 3 ? CSS.gold : CSS.dim);
    if (this.tab === 3) return this.drawAcc();
    const parte = PARTES[this.tab];
    const porPag = COLS * FILAS;
    const pags = Math.ceil(parte.lista.length / porPag);
    parte.lista.slice(this.pag * porPag, (this.pag + 1) * porPag).forEach((c, k) => {
      const i = this.pag * porPag + k;
      const x = X0 + (k % COLS) * (CW + GAP), y = 124 + Math.floor(k / COLS) * (CH + 8);
      const locked = bloqueado(c, nivel);
      const puesto = (av[parte.id] ?? 0) === i;
      const g = this.add.graphics();
      frame(g, x, y, CW, CH, puesto ? 0x2a2014 : 0x0e0b12, puesto ? UI.gold : c.holo !== undefined && !locked ? 0x9ad8f0 : UI.border, 0.95);
      this.layer.add(g);
      // vista previa: tu héroe con este cosmético
      const key = `vest_${parte.id}_${i}`;
      makeHeroFromAvatar(this, { ...av, [parte.id]: i }, key);
      const im = this.add.image(x + CW / 2, y + 40, key).setScale(1.35);
      if (locked) im.setTint(0x2a2630);
      this.layer.add(im);
      const nombre = txt(this, x + CW / 2, y + 72, c.name, 15, locked ? '#6a6478' : CSS.bone, { align: 'center' }).setOrigin(0.5, 0);
      if (nombre.width > CW - 10) nombre.setScale((CW - 10) / nombre.width, 1);
      this.layer.add(nombre);
      const estado = locked ? `🔒 ${comoDesbloquear(c)}` : puesto ? '✓ Equipado' : c.holo !== undefined ? '✦ holográfico' : 'Clic para equipar';
      const et = txt(this, x + CW / 2, y + 92, estado, 12, locked ? '#8a7a6a' : puesto ? CSS.green : c.holo !== undefined ? '#9ad8f0' : CSS.dim, { align: 'center', wordWrap: { width: CW - 10 } }).setOrigin(0.5, 0);
      if (et.height > 22) et.setScale(Math.min(1, 22 / et.height));
      this.layer.add(et);
      if (locked) this.layer.add(txt(this, x + CW - 14, y + 10, '🔒', 14, CSS.dim).setOrigin(0.5));
      const z = this.add.zone(x, y, CW, CH).setOrigin(0).setInteractive({ useHandCursor: !locked });
      z.on('pointerover', () => this.tip.show(x + CW / 2, y + CH + 4, c.name, locked ? `Bloqueado. ${comoDesbloquear(c)}.` : c.holo !== undefined ? 'Cosmético holográfico: cambia de color con el tiempo.' : 'Desbloqueado.'));
      z.on('pointerout', () => this.tip.hide());
      z.on('pointerdown', () => {
        if (locked) { audio.sfx('wrong'); return; }
        (av as unknown as Record<string, number>)[parte.id] = i;
        saveLocal();
        if (!prof.offline) enqueue('saveProfile', { token: prof.token, alias: av.alias, avatar: JSON.stringify(av) });
        makeHeroFromAvatar(this, av);
        audio.sfx('click');
        this.draw();
      });
      this.layer.add(z);
    });
    if (pags > 1) {
      this.layer.add(button(this, W - 90, 516, 120, 32, this.pag + 1 < pags ? 'Más ▸' : '◂ Inicio', () => { this.pag = (this.pag + 1) % pags; this.draw(); }, { size: 17 }));
    }
  }
}
