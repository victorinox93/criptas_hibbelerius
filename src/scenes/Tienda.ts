import Phaser from 'phaser';
import { enqueue } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { W } from '../config';
import { Accesorio, diasParaRotar, hastaTexto, inventario, LAYLA, MOMENTUM_JEFES, REGALO_DIARIO, TEMPORADAS } from '../data/tienda';
import { comprar, Game, logEvent, momentum, saveLocal } from '../state';
import { button, dungeonBackground, embers, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';

const CW = 136, CH = 156, GAP = 10, X0 = 352;

/** Menú → Tienda de Layla: accesorios por Momentum (rotación semanal + temporada) */
export class TiendaScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private tip!: Tooltip;
  private saldoT!: Phaser.GameObjects.Text;
  private globo!: Phaser.GameObjects.Text;

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
    const ojos = [10, 17].map((ex) => this.add.rectangle(180 - 15 * 6 + (ex - 1) * 6, 350 - 32 * 6 + 9 * 6, 18, 12, 0xe8913a).setOrigin(0).setVisible(false));
    this.time.addEvent({ delay: 3200, loop: true, callback: () => { ojos.forEach((o) => o.setVisible(true)); this.time.delayedCall(140, () => ojos.forEach((o) => o.setVisible(false))); } });
    layla.setInteractive({ useHandCursor: true }).on('pointerdown', () => { audio.sfx('coin'); this.hablar(); });
    // globo de diálogo
    const g = this.add.graphics();
    frame(g, 26, 60, 310, 92, 0x0e0b08, 0xc8864a, 0.95);
    this.globo = txt(this, 40, 70, '', 17, CSS.bone, { wordWrap: { width: 284 }, lineSpacing: 2 });
    this.hablar();
    txt(this, 180, 366, 'Layla · gata atigrada y comerciante', 16, '#c8a07a').setOrigin(0.5, 0);
    this.saldoT = txt(this, 180, 398, '', 30, CSS.gold).setOrigin(0.5, 0);
    txt(this, 180, 440, `Ganas Momentum venciendo jefes\n(Coloso ${MOMENTUM_JEFES[1]} · Bruja ${MOMENTUM_JEFES[2] - MOMENTUM_JEFES[1]} · Hibbelerius ${MOMENTUM_JEFES[3] - MOMENTUM_JEFES[2]} · AM ${MOMENTUM_JEFES[4] - MOMENTUM_JEFES[3]})\ny Layla te regala ${REGALO_DIARIO} cada día que entras.`, 14, CSS.dim, { align: 'center', lineSpacing: 2 }).setOrigin(0.5, 0);

    title(this, X0 + (4 * CW + 3 * GAP) / 2, 34, 'Tienda de Layla', 38, '#f0b070');
    this.layer = this.add.container(0, 0);
    button(this, X0 + (4 * CW + 3 * GAP) / 2, 516, 200, 36, 'Volver', () => fadeTo(this, 'Menu'), { size: 21 });
    this.draw();
  }

  private hablar() {
    this.globo.setText(Phaser.Utils.Array.GetRandom(LAYLA));
  }

  private draw() {
    this.layer.removeAll(true);
    this.saldoT.setText(`◈ ${momentum()} Momentum`);
    const { rot, temp } = inventario();
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    const d = diasParaRotar();
    L(txt(this, X0, 64, `Esta semana · mercancía nueva en ${d} día${d === 1 ? '' : 's'}`, 18, CSS.bone));
    rot.forEach((a, i) => this.tarjeta(a, X0 + i * (CW + GAP), 88));
    if (temp.length) {
      const t = TEMPORADAS[temp[0].temporada!];
      L(txt(this, X0, 262, `⏳ Temporada: ${t.nombre} · sólo hasta el ${hastaTexto(temp[0].temporada!)}`, 18, '#f0a050'));
      temp.slice(0, 4).forEach((a, i) => this.tarjeta(a, X0 + i * (CW + GAP), 286));
    } else {
      L(txt(this, X0, 262, '⏳ No hay artículos de temporada por ahora. Vuelve en Día de Muertos, Navidad o el 14 de febrero.', 16, CSS.dim, { wordWrap: { width: 4 * CW + 3 * GAP } }));
    }
  }

  private tarjeta(a: Accesorio, x: number, y: number) {
    const prof = Game.profile!;
    const av = prof.avatar!;
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    const tiene = (Game.codex.compras ?? []).includes(a.id);
    const puesto = av[a.slot] === a.id;
    const alcanza = momentum() >= a.precio;
    const g = this.add.graphics();
    frame(g, x, y, CW, CH, puesto ? 0x2a1e10 : 0x120e0a, puesto ? UI.gold : a.temporada ? 0xf0a050 : UI.border, 0.96);
    L(g);
    const key = `tnd_${a.id}`;
    makeHeroFromAvatar(this, { ...av, [a.slot]: a.id }, key);
    L(this.add.image(x + CW / 2, y + 48, key).setScale(1.5));
    const n = txt(this, x + CW / 2, y + 86, a.nombre, 15, CSS.bone, { align: 'center' }).setOrigin(0.5, 0);
    if (n.width > CW - 8) n.setScale((CW - 8) / n.width, 1);
    L(n);
    L(txt(this, x + CW / 2, y + 104, a.slot === 'cabeza' ? 'Cabeza' : 'Mano (reemplaza el arma)', 11, CSS.dim).setOrigin(0.5, 0));
    const label = puesto ? '✓ Quitar' : tiene ? 'Equipar' : `◈ ${a.precio}`;
    const b = button(this, x + CW / 2, y + CH - 20, CW - 20, 28, label, () => {
      if (!tiene) {
        if (!comprar(a.id, a.precio)) { audio.sfx('wrong'); this.globo.setText('«Te falta Momentum, humano. Vence un jefe y vuelve.»'); return; }
        audio.sfx('coin');
        logEvent('tienda', '', '', { compra: a.id, precio: a.precio });
        this.globo.setText(`«${a.nombre}. Buena elección. Miau.»`);
        av[a.slot] = a.id; // se equipa al comprarlo
      } else {
        av[a.slot] = puesto ? undefined : a.id;
        audio.sfx('click');
      }
      saveLocal();
      if (!prof.offline) enqueue('saveProfile', { token: prof.token, alias: av.alias, avatar: JSON.stringify(av) });
      makeHeroFromAvatar(this, av);
      this.draw();
    }, { size: 16, color: puesto ? UI.gold : tiene ? UI.green : alcanza ? 0xc8864a : UI.border });
    L(b);
    const z = this.add.zone(x, y, CW, CH - 40).setOrigin(0).setInteractive();
    z.on('pointerover', () => this.tip.show(x + CW / 2, y + CH + 4, a.nombre, `${a.desc}${a.temporada ? `\nTemporada: ${TEMPORADAS[a.temporada].nombre}` : ''}`));
    z.on('pointerout', () => this.tip.hide());
    L(z);
  }
}
