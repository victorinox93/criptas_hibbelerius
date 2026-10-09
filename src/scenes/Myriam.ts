import Phaser from 'phaser';
import { CSS } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { MYRIAM_DESPEDIDA, MYRIAM_ELIGE, MYRIAM_SALUDOS, tresMaldiciones } from '../data/myriam';
import { Game, logEvent, saveLocal, syncRun, unlock } from '../state';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, icon, title, Tooltip, txt } from '../ui/widgets';

const VIOLETA = '#d07aff';

/** Myriam, la hechicera oscura: sólo maldiciones (datos en src/data/myriam.ts) */
export class MyriamScene extends Phaser.Scene {
  constructor() { super('Myriam'); }

  create(data: { floor: number }) {
    const run = Game.run!;
    this.cameras.main.fadeIn(700);
    audio.play('jefe2');
    unlock('npcs', 'myriam');
    saveLocal();

    this.add.rectangle(0, 0, W, H, 0x07040a).setOrigin(0);
    // círculo ritual que gira
    const circ = this.add.graphics({ x: 200, y: 400 });
    circ.lineStyle(2, 0x9a4ac8, 0.5).strokeEllipse(0, 0, 300, 80).strokeEllipse(0, 0, 250, 64);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; circ.fillStyle(0xd07aff, 0.7).fillCircle(Math.cos(a) * 140, Math.sin(a) * 37, 3); }
    this.tweens.add({ targets: circ, alpha: 0.4, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const glow = this.add.circle(200, 280, 150, 0x9a4ac8, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.16, scale: 1.1, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const myr = this.add.image(200, 400, 'npc_myriam').setOrigin(0.5, 1).setScale(11);
    this.tweens.add({ targets: myr, y: 392, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.particles(200, 300, 'px', {
      x: { min: -110, max: 110 }, y: { min: -60, max: 120 }, speedY: { min: -30, max: -10 }, lifespan: 2600, frequency: 90,
      scale: { start: 2, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: [0xd07aff, 0x6a2a9a, 0xffffff], blendMode: 'ADD',
    });
    txt(this, 200, 430, 'Myriam, la Hechicera Oscura', 20, VIOLETA).setOrigin(0.5);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);

    title(this, 645, 62, 'Myriam', 40, VIOLETA);
    const g = this.add.graphics();
    frame(g, 400, 92, 490, 96, 0x0a0610, 0x6a2a9a, 0.96);
    txt(this, 416, 102, `${Phaser.Utils.Array.GetRandom(MYRIAM_SALUDOS)}\n${MYRIAM_ELIGE}`, 18, '#e8d0f8', { wordWrap: { width: 460 }, lineSpacing: 3 });

    const opciones = tresMaldiciones(run);
    const cartas: Phaser.GameObjects.Container[] = [];
    opciones.forEach((m, i) => {
      const x = 480 + i * 165, y = 300;
      const c = this.add.container(x, y);
      const cg = this.add.graphics();
      const draw = (hi: boolean) => { cg.clear(); frame(cg, -72, -96, 144, 210, hi ? 0x2a1438 : 0x140a1c, hi ? 0xd07aff : 0x6a2a9a, 0.97); };
      draw(false);
      c.add(cg);
      c.add(icon(this, 0, -56, m.icono, 5).setTint(0xd07aff));
      c.add(txt(this, 0, -16, m.nombre, 17, VIOLETA, { align: 'center', wordWrap: { width: 128 } }).setOrigin(0.5, 0));
      c.add(txt(this, 0, 32, m.texto, 15, CSS.bone, { align: 'center', wordWrap: { width: 128 } }).setOrigin(0.5, 0));
      const z = this.add.zone(-72, -96, 144, 210).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerover', () => { draw(true); tip.show(x, y + 124, m.nombre, m.lore); });
      z.on('pointerout', () => { draw(false); tip.hide(); });
      z.on('pointerdown', () => {
        tip.hide();
        cartas.forEach((o) => o.destroy());
        const res = m.aplicar(run);
        (run.seen ??= []).push('myriam');
        logEvent('myriam', '', false, { maldicion: m.id });
        run.floor = data.floor + 1;
        saveLocal();
        syncRun('en curso');
        hud.refresh();
        audio.sfx('wrong');
        this.cameras.main.flash(400, 120, 40, 160);
        this.cameras.main.shake(250, 0.006);
        const g2 = this.add.graphics();
        frame(g2, 410, 220, 470, 170, 0x0a0610, 0x9a4ac8, 0.97);
        txt(this, 645, 240, `Maldición: ${m.nombre}`, 22, VIOLETA).setOrigin(0.5, 0);
        txt(this, 645, 278, res, 18, CSS.bone, { align: 'center', wordWrap: { width: 430 } }).setOrigin(0.5, 0);
        txt(this, 645, 340, Phaser.Utils.Array.GetRandom(MYRIAM_DESPEDIDA), 17, '#b89ad0', { align: 'center' }).setOrigin(0.5, 0);
        button(this, 645, 440, 220, 44, T.runa.continuar, () => fadeTo(this, 'Map'), { size: 21 });
      });
      c.add(z);
      cartas.push(c);
      // entran volteándose
      c.setScale(0, 1);
      this.tweens.add({ targets: c, scaleX: 1, duration: 400, delay: 500 + i * 200, ease: 'Back.out' });
    });
    if (!opciones.length) button(this, 645, 440, 220, 44, T.runa.continuar, () => fadeTo(this, 'Map'), { size: 21 });
  }
}
