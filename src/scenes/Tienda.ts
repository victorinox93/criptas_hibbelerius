import Phaser from 'phaser';
import { enqueue } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { W } from '../config';
import { Accesorio, diasParaRotar, hastaTexto, inventario, LAYLA, MOMENTUM_JEFES, REGALO_DIARIO, TEMPORADAS } from '../data/tienda';
import { comprar, Game, logEvent, momentum, saveLocal } from '../state';
import { button, dungeonBackground, embers, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';

const CW = 112, CH = 156, GAP = 8, X0 = 350, N = 5;

/** Menú → Tienda de Layla: accesorios por Momentum (rotación semanal + temporada) */
export class TiendaScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private tip!: Tooltip;
  private saldoT!: Phaser.GameObjects.Text;
  private globo!: Phaser.GameObjects.Text;
  private soloNuevo = false;
  private filtroB!: ReturnType<typeof button>;

  constructor() { super('Tienda'); }

  create() {
    this.cameras.main.fadeIn(250);
    audio.play('calma');
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

    title(this, X0 + (N * CW + (N - 1) * GAP) / 2, 30, 'Tienda de Layla', 36, '#f0b070');
    this.layer = this.add.container(0, 0);
    button(this, X0 + (N * CW + (N - 1) * GAP) / 2, 516, 200, 36, 'Volver', () => fadeTo(this, 'Menu'), { size: 21 });
    this.filtroB = button(this, X0 + N * CW + (N - 1) * GAP - 70, 516, 140, 30, '', () => { this.soloNuevo = !this.soloNuevo; this.draw(); }, { size: 15 });
    this.draw();
  }

  private hablar() {
    this.globo.setText(Phaser.Utils.Array.GetRandom(LAYLA));
  }

  private draw() {
    this.layer.removeAll(true);
    this.saldoT.setText(`◈ ${momentum()} Momentum`);
    const { rot: rot0, temp: temp0 } = inventario();
    const compras = Game.codex.compras ?? [];
    const filtra = (l: Accesorio[]) => (this.soloNuevo ? l.filter((a) => !compras.includes(a.id)) : l);
    const rot = filtra(rot0), temp = filtra(temp0);
    this.filtroB.label.setText(this.soloNuevo ? 'Ver todo' : 'Sólo lo nuevo');
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    const d = diasParaRotar();
    L(txt(this, X0, 60, `Esta semana · mercancía nueva en ${d} día${d === 1 ? '' : 's'}`, 18, CSS.bone));
    rot.forEach((a, i) => this.tarjeta(a, X0 + i * (CW + GAP), 84));
    if (!rot.length) L(txt(this, X0, 140, 'Ya tienes todo lo de esta semana. ¡Vuelve el lunes!', 17, CSS.dim));
    if (temp0.length) {
      const t = TEMPORADAS[temp0[0].temporada!];
      L(txt(this, X0, 258, `⏳ Temporada: ${t.nombre} · sólo hasta el ${hastaTexto(temp0[0].temporada!)}`, 18, '#f0a050'));
      temp.slice(0, N).forEach((a, i) => this.tarjeta(a, X0 + i * (CW + GAP), 282));
      if (!temp.length) L(txt(this, X0, 340, 'Ya tienes todo lo de esta temporada.', 17, CSS.dim));
    } else {
      L(txt(this, X0, 258, '⏳ No hay artículos de temporada por ahora. Vuelve en Día de Muertos, Navidad o el 14 de febrero.', 16, CSS.dim, { wordWrap: { width: N * CW + (N - 1) * GAP } }));
    }
  }

  private tarjeta(a: Accesorio, x: number, y: number) {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    const tiene = (Game.codex.compras ?? []).includes(a.id);
    const puesto = av[a.slot] === a.id;
    const alcanza = momentum() >= a.precio;
    const SLOT = { cabeza: 'Cabeza', cara: 'Cara', mano: 'Mano (en vez del arma)', pies: 'Pies' }[a.slot];
    const g = this.add.graphics();
    frame(g, x, y, CW, CH, puesto ? 0x2a1e10 : 0x120e0a, puesto ? UI.gold : a.temporada ? 0xf0a050 : UI.border, 0.96);
    L(g);
    const key = `tnd_${a.id}`;
    makeHeroFromAvatar(this, { ...av, [a.slot]: a.id }, key);
    L(this.add.image(x + CW / 2, y + 48, key).setScale(1.4));
    const n = txt(this, x + CW / 2, y + 86, a.nombre, 14, CSS.bone, { align: 'center' }).setOrigin(0.5, 0);
    if (n.width > CW - 8) n.setScale((CW - 8) / n.width, 1);
    L(n);
    L(txt(this, x + CW / 2, y + 104, SLOT, 11, CSS.dim).setOrigin(0.5, 0));
    // en la tienda sólo se compra; se equipa en «Forjar héroe» → Accesorios
    const label = tiene ? (puesto ? '✓ Puesto' : '✓ Es tuyo') : `◈ ${a.precio}`;
    const b = button(this, x + CW / 2, y + CH - 20, CW - 16, 28, label, () => {
      if (tiene) { this.globo.setText('«Ya es tuyo. Póntelo en «Forjar héroe» → Accesorios. Miau.»'); return; }
      if (!comprar(a.id, a.precio)) { audio.sfx('wrong'); this.globo.setText('«Te falta Momentum, humano. Vence un jefe y vuelve.»'); return; }
      audio.sfx('coin');
      logEvent('tienda', '', '', { compra: a.id, precio: a.precio });
      this.globo.setText(`«${a.nombre}. Buena elección. Póntelo en «Forjar héroe» → Accesorios. Miau.»`);
      void prof; void enqueue; void saveLocal;
      this.draw();
    }, { size: 15, color: tiene ? UI.green : alcanza ? 0xc8864a : UI.border });
    L(b);
    const z = this.add.zone(x, y, CW, CH - 40).setOrigin(0).setInteractive();
    z.on('pointerover', () => this.tip.show(x + CW / 2, y + CH + 4, a.nombre, `${a.desc}${a.temporada ? `\nTemporada: ${TEMPORADAS[a.temporada].nombre}` : ''}`));
    z.on('pointerout', () => this.tip.hide());
    L(z);
  }
}
