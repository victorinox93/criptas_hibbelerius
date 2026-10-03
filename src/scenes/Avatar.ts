import Phaser from 'phaser';
import { api } from '../api';
import { ARMORS, CAPES, CSS, UI, VISORS } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { W } from '../config';
import { CLASSES } from '../data/classes';
import { arcanistaUnlocked, Avatar, Game, saveLocal, rememberSession } from '../state';
import { T } from '../textos';
import { button, dungeonBackground, embers, fadeTo, frame, panel, TextField, title, txt } from '../ui/widgets';

const HELMS = [
  { id: 'penacho', name: 'Penacho', mage: 'Sombrero' },
  { id: 'cuernos', name: 'Cuernos', mage: 'Capucha' },
  { id: 'corona', name: 'Corona', mage: 'Diadema' },
];

export class AvatarScene extends Phaser.Scene {
  constructor() { super('Avatar'); }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play('menu');
    dungeonBackground(this, 23);
    embers(this);
    const prof = Game.profile!;
    const av: Avatar = { alias: '', clase: 'caballero', helm: 'penacho', cape: 0, armor: 0, visor: 0, ...(prof.avatar ?? {}) };
    let helmIdx = Math.max(0, HELMS.findIndex((h) => h.id === av.helm));
    const st = { cape: av.cape, armor: av.armor ?? 0, visor: av.visor ?? 0 };
    let clase = av.clase;

    title(this, W / 2, 40, T.avatar.titulo, 46);

    // ── Vista previa ──
    panel(this, 28, 78, 320, 446);
    const alias = new TextField(this, 188, 112, 290, { placeholder: T.avatar.nombre, maxLength: 16, value: av.alias, center: true, color: CSS.gold, size: 26 });
    const ped = this.add.graphics();
    ped.fillStyle(0x060508, 1).fillEllipse(188, 286, 170, 28);
    ped.fillStyle(0x1e1926, 1).fillEllipse(188, 282, 150, 20);
    const glow = this.add.circle(188, 214, 80, 0xe8c15a, 0.04).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.09, duration: 1400, yoyo: true, repeat: -1 });
    const hero = this.add.image(188, 210, 'hero').setScale(6);
    this.tweens.add({ targets: hero, y: 206, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const refreshers: (() => void)[] = [];
    const redraw = () => {
      const look = { helm: HELMS[helmIdx].id, cape: st.cape, armor: st.armor, visor: st.visor };
      makeHeroFromAvatar(this, { ...look, clase });
      makeHeroFromAvatar(this, { ...look, clase: 'caballero' }, 'cls_caballero');
      makeHeroFromAvatar(this, { ...look, clase: 'arcanista' }, 'cls_arcanista');
      hero.setTexture('hero');
      refreshers.forEach((f) => f());
    };

    const selector = (y: number, label: string, get: () => string, step: (d: number) => void) => {
      txt(this, 46, y - 12, label, 21, CSS.dim);
      const v = txt(this, 262, y, '', 22, CSS.bone).setOrigin(0.5);
      const upd = () => v.setText(get());
      refreshers.push(upd);
      button(this, 196, y, 32, 30, '‹', () => { step(-1); upd(); redraw(); }, { size: 22 });
      button(this, 328, y, 32, 30, '›', () => { step(1); upd(); redraw(); }, { size: 22 });
      upd();
    };
    const cyc = (n: number, d: number, len: number) => (n + d + len) % len;
    selector(322, T.avatar.yelmo, () => (clase === 'arcanista' ? HELMS[helmIdx].mage : HELMS[helmIdx].name), (d) => (helmIdx = cyc(helmIdx, d, HELMS.length)));
    selector(360, T.avatar.armadura, () => ARMORS[st.armor].name, (d) => (st.armor = cyc(st.armor, d, ARMORS.length)));
    selector(398, T.avatar.visor, () => VISORS[st.visor].name, (d) => (st.visor = cyc(st.visor, d, VISORS.length)));

    txt(this, 46, 422, T.avatar.capa, 21, CSS.dim);
    const sw: Phaser.GameObjects.Rectangle[] = [];
    const capeT = txt(this, 188, 498, '', 20, CSS.dim).setOrigin(0.5);
    CAPES.forEach((c, i) => {
      const r = this.add
        .rectangle(68 + i * 48, 466, 34, 34, Phaser.Display.Color.HexStringToColor(c.c).color)
        .setStrokeStyle(3, 0x0d0b10)
        .setInteractive({ useHandCursor: true });
      r.on('pointerdown', () => {
        st.cape = i;
        sw.forEach((s, j) => s.setStrokeStyle(3, j === i ? UI.gold : 0x0d0b10));
        capeT.setText(c.name);
        redraw();
        audio.sfx('click');
      });
      sw.push(r);
    });
    sw[st.cape].emit('pointerdown');

    // ── Clases ──
    txt(this, 372, 78, T.avatar.clase, 26, CSS.gold);
    const cards: Phaser.GameObjects.Graphics[] = [];
    CLASSES.forEach((c, i) => {
      const ok = c.id === 'caballero' || (c.id === 'arcanista' && arcanistaUnlocked());
      const lockText = c.id === 'arcanista' ? 'Vence al Coloso Inerte' : T.avatar.proximamente;
      const x = 370 + (i % 2) * 284, y = 112 + Math.floor(i / 2) * 182;
      const g = this.add.graphics();
      const draw = () => {
        g.clear();
        frame(g, x, y, 272, 170, ok ? UI.panel : 0x0c0a0f, clase === c.id ? UI.gold : UI.border);
      };
      draw();
      cards.push(g);
      const img = this.add.image(x + 46, y + 74, c.id === 'arcanista' ? 'cls_arcanista' : c.id === 'caballero' ? 'cls_caballero' : 'inertKnight').setScale(3.4);
      if (!ok) img.setTint(0x000000).setAlpha(0.7);
      const nm = txt(this, x + 92, y + 14, c.name, 23, ok ? CSS.bone : CSS.dim);
      if (nm.width > 170) nm.setScale(170 / nm.width, 1);
      txt(this, x + 92, y + 38, c.concept, 19, ok ? CSS.gold : '#5a5468');
      txt(this, x + 92, y + 60, c.desc, 18, ok ? CSS.dim : '#4a4256', { wordWrap: { width: 170 } });
      txt(this, x + 14, y + 140, ok ? `♥ ${c.hp}   ⚡ ${c.energy} J` : `🔒 ${lockText}`, 19, ok ? CSS.bone : '#5a5468');
      const zone = this.add.zone(x, y, 272, 170).setOrigin(0).setInteractive({ useHandCursor: ok });
      zone.on('pointerdown', () => {
        if (!ok) return;
        clase = c.id;
        cards.forEach((gg) => gg.emit('redraw'));
        redraw();
      });
      g.on('redraw', draw);
    });

    const msg = txt(this, 650, 478, '', 20, CSS.blood).setOrigin(0.5);
    button(this, 650, 512, 300, 44, T.avatar.forjar, async () => {
      const name = alias.value.trim().slice(0, 16);
      if (name.length < 2) {
        msg.setText(T.avatar.errNombre);
        alias.focus();
        return;
      }
      prof.avatar = { alias: name, clase, helm: HELMS[helmIdx].id, cape: st.cape, armor: st.armor, visor: st.visor };
      saveLocal();
      rememberSession();
      if (!prof.offline) api.saveProfile(prof.token, name, JSON.stringify(prof.avatar)).catch((e) => console.warn(e));
      fadeTo(this, 'Menu');
    }, { color: UI.blood });
  }
}
