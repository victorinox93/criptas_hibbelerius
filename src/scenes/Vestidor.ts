import Phaser from 'phaser';
import { comprasVisibles, probador, setProbador } from '../ui/probador';
import { isAdmin } from '../state';
import { enqueue } from '../api';
import { ARMORS, CAPES, Cosmetico, CSS, UI, VISORS } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { FAMILIARS } from '../data/familiars';
import { mascotaDesbloqueada } from '../ui/mascota';
import { W } from '../config';
import { Game, nivelActual, saveLocal } from '../state';
import { button, Btn, dungeonBackground, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';
import { bloqueado, comoDesbloquear } from './Avatar';
import { LOGROS } from '../data/logros';
import { ACCESORIOS as TODO_TIENDA, NOMBRE_CAT } from '../data/tienda';
const ACCESORIOS = TODO_TIENDA.filter((a) => !a.color && !a.set); // los colores salen en sus pestañas

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
    // v0.49: 5 pestañas (la última, «Abismo», junta lo exclusivo del Abismo de los Ejes)
    // v0.55: 6 pestañas (la última, «Compañero», elige un familiar que te acompaña de adorno)
    this.tabs = [...PARTES.map((p) => p.nombre), 'Accesorios', 'Abismo', 'Compañero'].map((_, i) => button(this, W / 2 + (i - 2.5) * 152, 98, 146, 32, '', () => { this.tab = i; this.pag = 0; this.draw(); }, { size: 15 }));
    this.events.once('shutdown', () => this.pararAnimaciones());
    button(this, W / 2, 516, 200, 36, 'Volver', () => fadeTo(this, 'Menu'), { size: 21 });
    // v0.70 · Probador del profe: todo desbloqueado para ver cómo se ve (no se guarda)
    if (isAdmin()) {
      const pb = button(this, 104, 516, 190, 32, '', () => { setProbador(!probador()); pintaPb(); this.draw(); }, { size: 15, color: 0x9a4040 });
      const pintaPb = () => pb.label.setText(probador() ? '🔓 Probador: ON' : '🔒 Probador: OFF');
      pintaPb();
    }
    this.draw();
  }

  /** v0.49 · Todo lo exclusivo del Abismo (capas, armaduras, ojos y accesorios ganados con logros) */
  private itemsAbismo() {
    const nivel = nivelActual();
    const compras = comprasVisibles();
    type It = { nombre: string; tiene: boolean; como: string; parte: Parte | 'acc'; idx?: number; acc?: (typeof ACCESORIOS)[number] };
    const out: It[] = [];
    PARTES.forEach((p) => p.lista.forEach((c, i) => {
      if (c.logro?.startsWith('abismo_')) out.push({ nombre: c.name, tiene: !bloqueado(c, nivel), como: comoDesbloquear(c), parte: p.id, idx: i });
    }));
    ACCESORIOS.filter((a) => a.logro?.startsWith('abismo_')).forEach((a) => out.push({ nombre: a.nombre, tiene: compras.includes(a.id), como: LOGROS[a.logro!]?.como ?? '', parte: 'acc', acc: a }));
    return out;
  }

  private drawAbismo(items: ReturnType<VestidorScene['itemsAbismo']>) {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const porPag = COLS * FILAS;
    const pags = Math.ceil(items.length / porPag);
    items.slice(this.pag * porPag, (this.pag + 1) * porPag).forEach((it, k) => {
      const x = X0 + (k % COLS) * (CW + GAP), y = 124 + Math.floor(k / COLS) * (CH + 8);
      const puesto = it.parte === 'acc' ? av[it.acc!.slot] === it.acc!.id : (av[it.parte] ?? 0) === it.idx;
      const g = this.add.graphics();
      frame(g, x, y, CW, CH, puesto ? 0x1e1430 : 0x0e0b12, puesto ? 0xc8a8ff : it.tiene ? 0x7a5aa8 : UI.border, 0.95);
      this.layer.add(g);
      const key = `vab_${it.parte}_${it.idx ?? it.acc!.id}`;
      makeHeroFromAvatar(this, it.parte === 'acc' ? { ...av, [it.acc!.slot]: it.acc!.id } : { ...av, [it.parte]: it.idx }, key);
      const im = this.add.image(x + CW / 2, y + 71, key).setOrigin(0.5, 1).setScale(1.5);
      if (!it.tiene) im.setTint(0x2a2630);
      this.layer.add(im);
      const nombre = txt(this, x + CW / 2, y + 72, it.nombre, 15, it.tiene ? CSS.bone : '#6a6478', { align: 'center' }).setOrigin(0.5, 0);
      if (nombre.width > CW - 10) nombre.setScale((CW - 10) / nombre.width, 1);
      this.layer.add(nombre);
      const et = txt(this, x + CW / 2, y + 92, !it.tiene ? `🔒 ${it.como}` : puesto ? '✓ Puesto · clic para quitar' : 'Clic para ponértelo', 12, !it.tiene ? '#8a7a6a' : puesto ? CSS.green : CSS.dim, { align: 'center', wordWrap: { width: CW - 10 } }).setOrigin(0.5, 0);
      if (et.height > 22) et.setScale(Math.min(1, 22 / et.height));
      this.layer.add(et);
      const z = this.add.zone(x, y, CW, CH).setOrigin(0).setInteractive({ useHandCursor: it.tiene });
      z.on('pointerover', () => this.tip.show(x + CW / 2, y + CH + 4, it.nombre, it.tiene ? (it.acc?.desc ?? 'Premio del Abismo.') : `Bloqueado. ${it.como}.`));
      z.on('pointerout', () => this.tip.hide());
      z.on('pointerdown', () => {
        if (!it.tiene) { audio.sfx('wrong'); return; }
        if (it.parte === 'acc') av[it.acc!.slot] = puesto ? undefined : it.acc!.id;
        else (av as unknown as Record<string, number>)[it.parte] = puesto ? 0 : it.idx!;
        saveLocal();
        if (!prof.offline) enqueue('saveProfile', { token: prof.token, alias: av.alias, avatar: JSON.stringify(av) });
        makeHeroFromAvatar(this, av);
        audio.sfx('click');
        this.draw();
      });
      this.layer.add(z);
    });
    if (pags > 1) this.layer.add(button(this, W - 90, 516, 120, 32, this.pag + 1 < pags ? 'Más ▸' : '◂ Inicio', () => { this.pag = (this.pag + 1) % pags; this.draw(); }, { size: 17 }));
  }

  /** Accesorios de la Tienda de Layla: los comprados se equipan aquí */
  /** v0.55 · Compañero: un familiar que ya conociste te acompaña (sólo de adorno) */
  private drawCompanero() {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const ids = Object.keys(FAMILIARS);
    const porPag = COLS * FILAS;
    const pags = Math.ceil(ids.length / porPag);
    this.layer.add(txt(this, W / 2, 516 - 34, 'Los familiares que ya te acompañaron en una expedición se pueden quedar contigo (sólo de adorno).', 14, CSS.dim).setOrigin(0.5));
    ids.slice(this.pag * porPag, (this.pag + 1) * porPag).forEach((id, k) => {
      const f = FAMILIARS[id];
      const x = X0 + (k % COLS) * (CW + GAP), y = 124 + Math.floor(k / COLS) * (CH + 8);
      const tiene = mascotaDesbloqueada(id);
      const puesto = av.mascota === id;
      const g = this.add.graphics();
      frame(g, x, y, CW, CH, puesto ? 0x142a20 : 0x0e0b12, puesto ? 0x9af0c8 : tiene ? 0x4a8a74 : UI.border, 0.95);
      this.layer.add(g);
      const im = this.add.image(x + CW / 2, y + 66, f.sprite).setOrigin(0.5, 1).setScale(3);
      if (!tiene) im.setTint(0x1a1820);
      else this.tweens.add({ targets: im, y: y + 62, duration: 900 + k * 40, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.layer.add(im);
      const nombre = txt(this, x + CW / 2, y + 70, tiene ? f.name : '???', 15, tiene ? CSS.bone : '#6a6478', { align: 'center' }).setOrigin(0.5, 0);
      if (nombre.width > CW - 10) nombre.setScale((CW - 10) / nombre.width, 1);
      this.layer.add(nombre);
      const estado = !tiene ? `🔒 Consíguelo en una expedición${f.abismo ? ' del Abismo' : ''}` : puesto ? '✓ Contigo · clic para quitar' : 'Clic para llevarlo';
      this.layer.add(txt(this, x + CW / 2, y + 92, estado, 12, !tiene ? '#8a7a6a' : puesto ? CSS.green : CSS.dim, { align: 'center', wordWrap: { width: CW - 10 } }).setOrigin(0.5, 0));
      const z = this.add.zone(x, y, CW, CH).setOrigin(0).setInteractive({ useHandCursor: tiene });
      z.on('pointerover', () => this.tip.show(x + CW / 2, y + CH + 4, tiene ? f.name : 'Familiar sin descubrir', tiene ? `${f.text}\n${f.lore}\n\nComo compañero sólo te acompaña de adorno.` : 'Cuando un familiar te acompañe en una expedición, podrás llevarlo aquí.'));
      z.on('pointerout', () => this.tip.hide());
      z.on('pointerdown', () => {
        if (!tiene) { audio.sfx('wrong'); return; }
        av.mascota = puesto ? undefined : id;
        saveLocal();
        if (!prof.offline) enqueue('saveProfile', { token: prof.token, alias: av.alias, avatar: JSON.stringify(av) });
        audio.sfx('click');
        this.draw();
      });
      this.layer.add(z);
    });
    if (pags > 1) this.layer.add(button(this, W - 90, 516, 120, 32, this.pag + 1 < pags ? 'Más ▸' : '◂ Inicio', () => { this.pag = (this.pag + 1) % pags; this.draw(); }, { size: 17 }));
  }

  private drawAcc() {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const compras = comprasVisibles();
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
      const im = this.add.image(x + CW / 2, y + 71, key).setOrigin(0.5, 1).setScale(1.5);
      if (!tiene) im.setTint(0x2a2630);
      this.layer.add(im);
      const nombre = txt(this, x + CW / 2, y + 72, a.nombre, 15, tiene ? CSS.bone : '#6a6478', { align: 'center' }).setOrigin(0.5, 0);
      if (nombre.width > CW - 10) nombre.setScale((CW - 10) / nombre.width, 1);
      this.layer.add(nombre);
      const estado = !tiene ? (a.logro ? `🔒 ${LOGROS[a.logro]?.como ?? ''}` : `🔒 Tienda de Layla (${NOMBRE_CAT[a.cat!]})`) : puesto ? '✓ Puesto · clic para quitar' : 'Clic para ponértelo';
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

  /**
   * v0.49 · Las vistas previas holográficas o cósmicas tienen un temporizador que redibuja la textura.
   * Antes no se detenían al cambiar de página y se acumulaban (el Vestidor se trababa). Aquí se paran.
   */
  private pararAnimaciones() {
    const sc = this as unknown as Record<string, Phaser.Time.TimerEvent | undefined>;
    for (const k of Object.keys(sc)) {
      if (k.startsWith('__holo_v')) { sc[k]?.remove(false); delete sc[k]; }
    }
  }

  private draw() {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const nivel = nivelActual();
    this.pararAnimaciones();
    this.tweens.killTweensOf(this.layer.list); // v0.55 · los compañeros flotan con tweens
    this.layer.removeAll(true);
    PARTES.forEach((p, i) => {
      const n = p.lista.filter((c) => !bloqueado(c, nivel)).length;
      this.tabs[i].label.setText(`${p.nombre} ${n}/${p.lista.length}`).setColor(i === this.tab ? CSS.gold : CSS.dim);
    });
    const compras = comprasVisibles();
    this.tabs[3].label.setText(`Accesorios ${ACCESORIOS.filter((a) => compras.includes(a.id)).length}/${ACCESORIOS.length}`).setColor(this.tab === 3 ? CSS.gold : CSS.dim);
    const items = this.itemsAbismo();
    this.tabs[4].label.setText(`Abismo ◈ ${items.filter((x) => x.tiene).length}/${items.length}`).setColor(this.tab === 4 ? '#c8a8ff' : CSS.dim);
    const fams = Object.keys(FAMILIARS);
    this.tabs[5].label.setText(`Compañero ${fams.filter(mascotaDesbloqueada).length}/${fams.length}`).setColor(this.tab === 5 ? '#9af0c8' : CSS.dim);
    if (this.tab === 5) return this.drawCompanero();
    if (this.tab === 3) return this.drawAcc();
    if (this.tab === 4) return this.drawAbismo(items);
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
      const im = this.add.image(x + CW / 2, y + 71, key).setOrigin(0.5, 1).setScale(1.5);
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
