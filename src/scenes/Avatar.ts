import Phaser from 'phaser';
import { api } from '../api';
import { CAPES, CSS, UI } from '../art/palette';
import { makeKnight } from '../art/sprites';
import { W } from '../config';
import { CLASSES } from '../data/classes';
import { Game, saveLocal, rememberSession } from '../state';
import { button, dungeonBackground, embers, fadeTo, frame, panel, title, txt } from '../ui/widgets';

const HELMS = [
  { id: 'penacho', name: 'Penacho' },
  { id: 'cuernos', name: 'Cuernos' },
  { id: 'corona', name: 'Corona' },
];

export class AvatarScene extends Phaser.Scene {
  constructor() { super('Avatar'); }

  create() {
    this.cameras.main.fadeIn(300);
    dungeonBackground(this, 23);
    embers(this);
    const prof = Game.profile!;
    const av = prof.avatar ?? { alias: '', clase: 'caballero', helm: 'penacho', cape: 0 };
    let helmIdx = Math.max(0, HELMS.findIndex((h) => h.id === av.helm));
    let cape = av.cape;
    let clase = av.clase;

    title(this, W / 2, 40, 'Forja tu héroe', 46);

    // ── Vista previa ──
    panel(this, 28, 78, 320, 440);
    const ped = this.add.graphics();
    ped.fillStyle(0x0d0b10, 1).fillEllipse(188, 318, 170, 30);
    ped.fillStyle(0x2a2433, 1).fillEllipse(188, 314, 150, 22);
    const glow = this.add.circle(188, 240, 90, 0xe8c15a, 0.06).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.12, duration: 1400, yoyo: true, repeat: -1 });
    const hero = this.add.image(188, 230, 'hero').setScale(7);
    this.tweens.add({ targets: hero, y: 226, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const redraw = () => {
      makeKnight(this, 'hero', HELMS[helmIdx].id, CAPES[cape]);
      hero.setTexture('hero');
    };
    redraw();

    const aliasDom = this.add.dom(188, 108).createFromHTML(
      `<div class="alias"><input id="alias" maxlength="16" placeholder="Nombre de tu héroe" value="${av.alias.replace(/"/g, '')}"/></div>`,
    );

    txt(this, 50, 334, 'Yelmo', 22, CSS.dim);
    const helmT = txt(this, 188, 382, '', 24, CSS.bone).setOrigin(0.5);
    const setHelm = (d: number) => {
      helmIdx = (helmIdx + d + HELMS.length) % HELMS.length;
      helmT.setText(HELMS[helmIdx].name);
      redraw();
    };
    button(this, 80, 382, 44, 34, '‹', () => setHelm(-1));
    button(this, 296, 382, 44, 34, '›', () => setHelm(1));
    setHelm(0);

    txt(this, 50, 412, 'Capa', 22, CSS.dim);
    const sw: Phaser.GameObjects.Rectangle[] = [];
    const capeT = txt(this, 188, 494, '', 20, CSS.dim).setOrigin(0.5);
    CAPES.forEach((c, i) => {
      const r = this.add
        .rectangle(68 + i * 48, 458, 36, 36, Phaser.Display.Color.HexStringToColor(c.c).color)
        .setStrokeStyle(3, 0x0d0b10)
        .setInteractive({ useHandCursor: true });
      r.on('pointerdown', () => {
        cape = i;
        sw.forEach((s, j) => s.setStrokeStyle(3, j === i ? UI.gold : 0x0d0b10));
        capeT.setText(c.name);
        redraw();
      });
      sw.push(r);
    });
    sw[cape].emit('pointerdown');

    // ── Clases ──
    txt(this, 372, 78, 'Elige tu clase', 26, CSS.gold);
    const cards: Phaser.GameObjects.Graphics[] = [];
    CLASSES.forEach((c, i) => {
      const x = 370 + (i % 2) * 284, y = 112 + Math.floor(i / 2) * 182;
      const g = this.add.graphics();
      const draw = () => {
        g.clear();
        frame(g, x, y, 272, 170, c.available ? UI.panel : 0x110e14, clase === c.id ? UI.gold : UI.border);
      };
      draw();
      cards.push(g);
      const img = this.add.image(x + 46, y + 74, c.available ? 'hero' : 'inertKnight').setScale(3.4);
      if (!c.available) img.setTint(0x000000).setAlpha(0.7);
      const nm = txt(this, x + 92, y + 14, c.name, 23, c.available ? CSS.bone : CSS.dim);
      if (nm.width > 170) nm.setScale(170 / nm.width, 1);
      txt(this, x + 92, y + 38, c.concept, 19, c.available ? CSS.gold : '#5a5468');
      txt(this, x + 92, y + 60, c.desc, 18, c.available ? CSS.dim : '#4a4256', { wordWrap: { width: 170 } });
      txt(this, x + 14, y + 140, c.available ? `♥ ${c.hp}   ⚡ ${c.energy} J` : '🔒 Próximamente', 19, c.available ? CSS.bone : '#5a5468');
      const zone = this.add.zone(x, y, 272, 170).setOrigin(0).setInteractive({ useHandCursor: c.available });
      zone.on('pointerdown', () => {
        if (!c.available) return;
        clase = c.id;
        cards.forEach((gg) => gg.emit('redraw'));
      });
      g.on('redraw', draw);
    });

    const msg = txt(this, 650, 478, '', 20, CSS.blood).setOrigin(0.5);
    button(this, 650, 512, 300, 44, 'Forjar héroe', async () => {
      const input = (aliasDom.node as HTMLElement).querySelector('#alias') as HTMLInputElement;
      const alias = input.value.trim().slice(0, 16);
      if (alias.length < 2) return msg.setText('Ponle nombre a tu héroe (mín. 2 letras).');
      prof.avatar = { alias, clase, helm: HELMS[helmIdx].id, cape };
      saveLocal();
      rememberSession();
      if (!prof.offline) {
        api.saveProfile(prof.token, alias, JSON.stringify(prof.avatar)).catch((e) => console.warn(e));
      }
      fadeTo(this, 'Menu');
    }, { color: UI.blood });
  }
}
