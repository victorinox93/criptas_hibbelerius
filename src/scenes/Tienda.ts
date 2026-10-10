import Phaser from 'phaser';
import { enqueue } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { W } from '../config';
import { Accesorio, catalogo, Cat, CATEGORIAS, LAYLA, MOMENTUM_JEFES, NOMBRE_CAT, OFERTA, ofertaDelDia, precioHoy, REGALO_DIARIO } from '../data/tienda';
import { comprar, Game, logEvent, momentum, saveLocal } from '../state';
import { button, dungeonBackground, embers, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';

const CW = 112, CH = 156, GAP = 8, X0 = 350, N = 5;

/** Menú → Tienda de Layla: todo el catálogo por categorías + la oferta del día (−40 %) */
export class TiendaScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private tip!: Tooltip;
  private saldoT!: Phaser.GameObjects.Text;
  private globo!: Phaser.GameObjects.Text;
  private soloNuevo = false;
  private filtroB!: ReturnType<typeof button>;
  private cat: Cat | 'todo' = 'todo';
  private pag = 0;
  private tabs: ReturnType<typeof button>[] = [];

  constructor() { super('Tienda'); }

  create() {
    this.cameras.main.fadeIn(250);
    audio.play('funk');
    dungeonBackground(this, 61, 0x1c1410);
    embers(this);
    this.tip = new Tooltip(this);
    // lámpara cálida y alfombra
    const luz = this.add.circle(180, 300, 170, 0xe8a050, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: luz, alpha: 0.05, duration: 1800, yoyo: true, repeat: -1 });
    this.add.ellipse(180, 352, 260, 34, 0x5a2a1a, 0.9);
    this.add.ellipse(180, 352, 220, 24, 0x7a3a22, 0.9);
    // Layla
    const layla = this.add.image(180, 350, 'layla').setOrigin(0.5, 1).setScale(6);
    this.tweens.add({ targets: layla, scaleY: 6.12, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // parpadeo: dos «párpados» naranjas sobre los ojos
    const ojos = [10, 17].map((ex) => this.add.rectangle(180 - 15 * 6 + (ex - 1) * 6, 350 - 32 * 6 + 8 * 6, 18, 18, 0x8c7f6c).setOrigin(0).setVisible(false));
    this.time.addEvent({ delay: 3200, loop: true, callback: () => { ojos.forEach((o) => o.setVisible(true)); this.time.delayedCall(140, () => ojos.forEach((o) => o.setVisible(false))); } });
    layla.setInteractive({ useHandCursor: true }).on('pointerdown', () => { audio.sfx('coin'); this.hablar(); });
    // globo de diálogo
    const g = this.add.graphics();
    frame(g, 26, 60, 310, 92, 0x0e0b08, 0xc8864a, 0.95);
    this.globo = txt(this, 40, 70, '', 17, CSS.bone, { wordWrap: { width: 284 }, lineSpacing: 2 });
    this.hablar();
    txt(this, 180, 366, 'Layla la comerciante', 18, '#c8b49a').setOrigin(0.5, 0);
    this.saldoT = txt(this, 180, 398, '', 30, CSS.gold).setOrigin(0.5, 0);
    txt(this, 180, 440, `Ganas Momentum venciendo jefes\n(Coloso ${MOMENTUM_JEFES[1]} · Bruja ${MOMENTUM_JEFES[2] - MOMENTUM_JEFES[1]} · Hibbelerius ${MOMENTUM_JEFES[3] - MOMENTUM_JEFES[2]} · AM ${MOMENTUM_JEFES[4] - MOMENTUM_JEFES[3]})\ny Layla te regala ${REGALO_DIARIO} cada día que entras.`, 14, CSS.dim, { align: 'center', lineSpacing: 2 }).setOrigin(0.5, 0);

    title(this, X0 + (N * CW + (N - 1) * GAP) / 2, 26, 'Tienda de Layla', 34, '#f0b070');
    // pestañas: Todo + 9 categorías, en dos filas de 5
    const pest: { id: Cat | 'todo'; nombre: string }[] = [{ id: 'todo', nombre: 'Todo' }, ...CATEGORIAS];
    const TW = (N * CW + (N - 1) * GAP - 4 * 6) / 5;
    this.tabs = pest.map((pc, i) => button(this, X0 + TW / 2 + (i % 5) * (TW + 6), 62 + Math.floor(i / 5) * 28, TW, 24, pc.nombre, () => { this.cat = pc.id; this.pag = 0; this.draw(); }, { size: 13 }));
    this.tabs.forEach((b, i) => b.setData('cat', pest[i].id));
    this.layer = this.add.container(0, 0);
    button(this, X0 + (N * CW + (N - 1) * GAP) / 2, 516, 160, 34, 'Volver', () => fadeTo(this, 'Menu'), { size: 20 });
    this.filtroB = button(this, X0 + N * CW + (N - 1) * GAP - 70, 516, 140, 30, '', () => { this.soloNuevo = !this.soloNuevo; this.pag = 0; this.draw(); }, { size: 15 });
    this.draw();
  }

  private hablar() {
    this.globo.setText(Phaser.Utils.Array.GetRandom(LAYLA));
  }

  private draw() {
    this.layer.removeAll(true);
    this.saldoT.setText(`◈ ${momentum()} Momentum`);
    const compras = Game.codex.compras ?? [];
    this.tabs.forEach((b) => b.label.setColor(b.getData('cat') === this.cat ? '#f0b070' : CSS.dim));
    let lista = catalogo(this.cat);
    if (this.soloNuevo) lista = lista.filter((a) => !compras.includes(a.id));
    this.filtroB.label.setText(this.soloNuevo ? 'Ver todo' : 'Sólo lo nuevo');
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    // oferta del día
    const of = ofertaDelDia();
    const tieneOf = compras.includes(of.id);
    L(txt(this, X0, 112, `★ Oferta del día: ${of.nombre} (${NOMBRE_CAT[of.cat!]}) · −${Math.round(OFERTA * 100)} %${tieneOf ? ' · ya es tuyo' : ''}`, 15, '#f070b0'));
    const porPag = N * 2;
    const pags = Math.max(1, Math.ceil(lista.length / porPag));
    this.pag = Math.min(this.pag, pags - 1);
    lista.slice(this.pag * porPag, (this.pag + 1) * porPag).forEach((a, i) => this.tarjeta(a, X0 + (i % N) * (CW + GAP), 134 + Math.floor(i / N) * (CH + 8)));
    if (!lista.length) L(txt(this, X0, 200, this.soloNuevo ? 'Ya tienes todo lo de esta categoría. ¡Miau!' : 'Nada por aquí.', 17, CSS.dim));
    const tienen = catalogo(this.cat).filter((a) => compras.includes(a.id)).length;
    L(txt(this, X0, 478, `Tienes ${tienen}/${catalogo(this.cat).length}`, 15, CSS.dim));
    if (pags > 1) {
      const cx = X0 + (N * CW + (N - 1) * GAP) / 2;
      L(button(this, cx - 70, 480, 44, 26, '◂', () => { this.pag = (this.pag + pags - 1) % pags; this.draw(); }, { size: 16 }));
      L(txt(this, cx, 480, `${this.pag + 1} / ${pags}`, 16, CSS.bone).setOrigin(0.5));
      L(button(this, cx + 70, 480, 44, 26, '▸', () => { this.pag = (this.pag + 1) % pags; this.draw(); }, { size: 16 }));
    }
  }

  private tarjeta(a: Accesorio, x: number, y: number) {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    const tiene = (Game.codex.compras ?? []).includes(a.id);
    const puesto = av[a.slot] === a.id;
    const precio = precioHoy(a);
    const oferta = precio < a.precio;
    const alcanza = momentum() >= precio;
    const SLOT = { cabeza: 'Cabeza', cara: 'Cara', mano: 'Mano (en vez del arma)', pies: 'Pies' }[a.slot];
    const g = this.add.graphics();
    frame(g, x, y, CW, CH, puesto ? 0x2a1e10 : 0x120e0a, puesto ? UI.gold : oferta ? 0xf070b0 : UI.border, 0.96);
    L(g);
    const key = `tnd_${a.id}`;
    makeHeroFromAvatar(this, { ...av, [a.slot]: a.id }, key);
    L(this.add.image(x + CW / 2, y + 84, key).setOrigin(0.5, 1).setScale(1.8));
    const n = txt(this, x + CW / 2, y + 86, a.nombre, 14, CSS.bone, { align: 'center' }).setOrigin(0.5, 0);
    if (n.width > CW - 8) n.setScale((CW - 8) / n.width, 1);
    L(n);
    L(txt(this, x + CW / 2, y + 104, SLOT, 11, CSS.dim).setOrigin(0.5, 0));
    // en la tienda sólo se compra; se equipa en «Forjar héroe» → Accesorios
    const label = tiene ? (puesto ? '✓ Puesto' : '✓ Es tuyo') : oferta ? `◈ ${precio} (${a.precio})` : `◈ ${precio}`;
    if (oferta && !tiene) L(txt(this, x + CW - 6, y + 6, '−' + Math.round(OFERTA * 100) + '%', 12, '#f070b0').setOrigin(1, 0));
    const b = button(this, x + CW / 2, y + CH - 20, CW - 16, 28, label, () => {
      if (tiene) { this.globo.setText('«Ya es tuyo. Póntelo en «Forjar héroe» → Accesorios. Miau.»'); return; }
      if (!comprar(a.id, precio)) { audio.sfx('wrong'); this.globo.setText('«Te falta Momentum, humano. Vence un jefe y vuelve.»'); return; }
      audio.sfx('coin');
      logEvent('tienda', '', '', { compra: a.id, precio, oferta });
      this.globo.setText(`«${a.nombre}. Buena elección. Póntelo en «Forjar héroe» → Accesorios. Miau.»`);
      void prof; void enqueue; void saveLocal;
      this.draw();
    }, { size: 15, color: tiene ? UI.green : alcanza ? 0xc8864a : UI.border });
    L(b);
    const z = this.add.zone(x, y, CW, CH - 40).setOrigin(0).setInteractive();
    z.on('pointerover', () => this.tip.show(x + CW / 2, y + CH + 4, a.nombre, `${a.desc}\n${NOMBRE_CAT[a.cat!]}${oferta ? ' · ★ oferta del día' : ''}`));
    z.on('pointerout', () => this.tip.hide());
    L(z);
  }
}
