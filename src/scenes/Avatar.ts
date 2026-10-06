import Phaser from 'phaser';
import { api } from '../api';
import { ARMORS, CAPES, CSS, UI, VISORS } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { EXTRAS_K, EXTRAS_M, EXTRAS_P, HELM_IDS, HELMS_K, HELMS_M, HELMS_P, SKINS, WEAPONS_K, WEAPONS_M, WEAPONS_P } from '../art/heroes';
import { W } from '../config';
import { CLASSES } from '../data/classes';
import { arcanistaUnlocked, penitenteUnlocked, Avatar, Game, nivelActual, saveLocal, rememberSession } from '../state';
import { T } from '../textos';
import { button, dungeonBackground, embers, fadeTo, frame, panel, TextField, title, txt } from '../ui/widgets';

const cyc = (n: number, d: number, len: number) => (n + d + len) % len;
/** Avanza en una lista saltando lo que aún está bloqueado por nivel */
const cycOk = (list: { lock?: number }[], n: number, d: number, nivel: number) => {
  let i = n;
  for (let k = 0; k < list.length; k++) {
    i = cyc(i, d, list.length);
    if ((list[i].lock ?? 0) <= nivel) return i;
  }
  return n;
};

export class AvatarScene extends Phaser.Scene {
  constructor() { super('Avatar'); }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play('menu');
    dungeonBackground(this, 23);
    embers(this);
    const prof = Game.profile!;
    const av: Avatar = { alias: '', clase: 'caballero', helm: 'penacho', cape: 0, armor: 0, visor: 0, arma: 0, extra: 0, piel: 1, ...(prof.avatar ?? {}) };
    const st = {
      helm: Math.max(0, HELM_IDS.indexOf(av.helm)), cape: av.cape, armor: av.armor ?? 0, visor: av.visor ?? 0,
      arma: av.arma ?? 0, extra: av.extra ?? 0, piel: av.piel ?? 1,
    };
    let clase = av.clase;
    const look = () => ({ helm: HELM_IDS[st.helm], cape: st.cape, armor: st.armor, visor: st.visor, arma: st.arma, extra: st.extra, piel: st.piel });

    title(this, W / 2, 40, T.avatar.titulo, 46);

    // ── Vista previa ──
    panel(this, 28, 78, 320, 446);
    const alias = new TextField(this, 188, 108, 290, { placeholder: T.avatar.nombre, maxLength: 16, value: av.alias, center: true, color: CSS.gold, size: 26 });
    const ped = this.add.graphics();
    ped.fillStyle(0x060508, 1).fillEllipse(188, 266, 170, 26);
    ped.fillStyle(0x1e1926, 1).fillEllipse(188, 262, 150, 18);
    const glow = this.add.circle(188, 196, 80, 0xe8c15a, 0.04).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.09, duration: 1400, yoyo: true, repeat: -1 });
    const hero = this.add.image(188, 262, 'hero').setOrigin(0.5, 1).setScale(3);
    this.tweens.add({ targets: hero, scaleY: 3.06, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const refreshers: (() => void)[] = [];
    const redraw = () => {
      makeHeroFromAvatar(this, { ...look(), clase });
      makeHeroFromAvatar(this, { ...look(), clase: 'caballero' }, 'cls_caballero');
      makeHeroFromAvatar(this, { ...look(), clase: 'arcanista' }, 'cls_arcanista');
      makeHeroFromAvatar(this, { ...look(), clase: 'penitente' }, 'cls_penitente');
      hero.setTexture('hero');
      refreshers.forEach((f) => f());
    };

    const mage = () => clase === 'arcanista';
    const pen = () => clase === 'penitente';
    /** Etiqueta y opciones según la clase: [caballero, arcanista, penitente] */
    const por = <T,>(k: T, m: T, p: T) => (pen() ? p : mage() ? m : k);
    const selector = (y: number, label: () => string, get: () => string, step: (d: number) => void) => {
      const lt = txt(this, 44, y - 11, '', 19, CSS.dim);
      const v = txt(this, 262, y, '', 19, CSS.bone).setOrigin(0.5);
      const upd = () => {
        lt.setText(label());
        v.setText(get()).setScale(1);
        if (v.width > 96) v.setScale(96 / v.width, 1);
      };
      refreshers.push(upd);
      button(this, 198, y, 30, 26, '‹', () => { step(-1); redraw(); audio.sfx('click'); }, { size: 20, silent: true });
      button(this, 326, y, 30, 26, '›', () => { step(1); redraw(); audio.sfx('click'); }, { size: 20, silent: true });
      upd();
    };
    selector(290, () => por(T.avatar.yelmo, 'Sombrero', 'Tocado'), () => por(HELMS_K, HELMS_M, HELMS_P)[st.helm], (d) => (st.helm = cyc(st.helm, d, HELM_IDS.length)));
    const nivel = nivelActual();
    selector(321, () => por(T.avatar.armadura, 'Ribete', 'Tanque'), () => ARMORS[st.armor].name, (d) => (st.armor = cycOk(ARMORS, st.armor, d, nivel)));
    selector(352, () => por(T.avatar.visor, 'Ojos', 'Ojos'), () => VISORS[st.visor].name, (d) => (st.visor = cycOk(VISORS, st.visor, d, nivel)));
    selector(383, () => por('Arma', 'Bastón', 'En la mano'), () => por(WEAPONS_K, WEAPONS_M, WEAPONS_P)[st.arma], (d) => (st.arma = cyc(st.arma, d, 4)));
    selector(414, () => por('Escudo', 'Barba', 'Espalda'), () => por(EXTRAS_K, EXTRAS_M, EXTRAS_P)[st.extra], (d) => (st.extra = cyc(st.extra, d, 3)));
    selector(445, () => por('Piel (arcanista)', 'Piel', 'Piel'), () => SKINS[st.piel].name, (d) => (st.piel = cyc(st.piel, d, SKINS.length)));

    txt(this, 44, 470, T.avatar.capa, 19, CSS.dim);
    const sw: Phaser.GameObjects.Rectangle[] = [];
    const capeT = txt(this, 330, 470, '', 18, CSS.dim).setOrigin(1, 0);
    CAPES.forEach((c, i) => {
      const locked = (c.lock ?? 0) > nivel;
      const r = this.add
        .rectangle(56 + i * 24.5, 504, 20, 26, Phaser.Display.Color.HexStringToColor(c.c).color)
        .setStrokeStyle(3, 0x0d0b10)
        .setInteractive({ useHandCursor: !locked });
      if (locked) {
        r.setAlpha(0.35);
        txt(this, 56 + i * 24.5, 504, '🔒', 12, CSS.dim).setOrigin(0.5);
        r.on('pointerdown', () => capeT.setText(`Nivel ${c.lock}`));
        sw.push(r);
        return;
      }
      r.on('pointerdown', () => {
        st.cape = i;
        sw.forEach((s, j) => s.setStrokeStyle(3, j === i ? UI.gold : 0x0d0b10));
        capeT.setText(c.name);
        redraw();
        audio.sfx('click');
      });
      sw.push(r);
    });
    sw[Math.min(st.cape, CAPES.length - 1)].emit('pointerdown');

    // ── Clases ──
    txt(this, 372, 78, T.avatar.clase, 26, CSS.gold);
    const cards: Phaser.GameObjects.Graphics[] = [];
    CLASSES.forEach((c, i) => {
      const ok = c.id === 'caballero' || (c.id === 'arcanista' && arcanistaUnlocked()) || (c.id === 'penitente' && penitenteUnlocked());
      const lockText = c.id === 'arcanista' ? 'Vence al Coloso Inerte' : c.id === 'penitente' ? 'Vence a Hibbelerius' : T.avatar.proximamente;
      const x = 370 + (i % 2) * 284, y = 112 + Math.floor(i / 2) * 182;
      const g = this.add.graphics();
      const draw = () => {
        g.clear();
        frame(g, x, y, 272, 170, ok ? UI.panel : 0x0c0a0f, clase === c.id ? UI.gold : UI.border);
      };
      draw();
      cards.push(g);
      const real = ['caballero', 'arcanista', 'penitente'].includes(c.id);
      const img = this.add.image(x + 46, y + 74, real ? `cls_${c.id}` : 'inertKnight').setScale(real ? 1.7 : 3.4);
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
      prof.avatar = { alias: name, clase, ...look() };
      saveLocal();
      rememberSession();
      if (!prof.offline) api.saveProfile(prof.token, name, JSON.stringify(prof.avatar)).catch((e) => console.warn(e));
      fadeTo(this, 'Menu');
    }, { color: UI.blood });
  }
}
