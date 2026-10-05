import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { T } from '../textos';
import { W, H } from '../config';
import { Game, MapNode, NodeType, saveLocal } from '../state';
import { topBar } from '../ui/hud';
import { embers, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

const NODE_STYLE: Record<NodeType, { icon: string; color: number }> = {
  combate: { icon: 'i_combat', color: 0x8a8296 },
  elite: { icon: 'i_elite', color: 0xa84a4a },
  fogata: { icon: 'i_fire', color: 0xc87533 },
  runa: { icon: 'i_rune', color: 0x8e5bb0 },
  evento: { icon: 'i_event', color: 0x6a8fc4 },
  mercader: { icon: 'i_bag', color: 0xe8c15a },
  santuario: { icon: 'i_shrine', color: 0x7fd8ff },
  jefe: { icon: 'i_boss', color: 0xe8c15a },
};
const NODE_INFO = Object.fromEntries(
  Object.entries(NODE_STYLE).map(([k, v]) => [k, { ...v, name: T.mapa.nodos[k][0], desc: T.mapa.nodos[k][1] }]),
) as Record<NodeType, { icon: string; color: number; name: string; desc: string }>;

export const nodeXY = (n: MapNode) => ({
  x: n.type === 'jefe' ? 878 : 80 + n.floor * 96,
  y: n.type === 'jefe' ? 280 : 112 + n.lane * 82,
});

export class MapScene extends Phaser.Scene {
  constructor() { super('Map'); }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play((Game.run?.acto ?? 1) >= 3 ? 'mapa3' : (Game.run?.acto ?? 1) === 2 ? 'mapa2' : 'mapa');
    const run = Game.run!;
    const tip = new Tooltip(this);

    // fondo: pergamino oscuro
    const bg = this.add.graphics().setDepth(-10);
    const act2 = (run.acto ?? 1) === 2;
    const act3 = (run.acto ?? 1) >= 3;
    bg.fillStyle(act2 ? 0x020203 : act3 ? 0x050307 : 0x060508, 1).fillRect(0, 0, W, H);
    if (act3) {
      // plano de la torre: círculos rúnicos concéntricos y engranes, como en un grimorio
      for (let r = 60; r < 620; r += 70) {
        bg.lineStyle(1, 0x2a1e34, 0.9).strokeCircle(W / 2, H / 2 + 20, r);
      }
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        bg.lineStyle(1, 0x1e1626, 0.9).lineBetween(W / 2 + Math.cos(a) * 60, H / 2 + 20 + Math.sin(a) * 60, W / 2 + Math.cos(a) * 640, H / 2 + 20 + Math.sin(a) * 640);
      }
      const eqs = ['F = m·a', '∫F dt = Δp', '½mv²', 'm₁v₁ = m₂v₂', 'e = v′/v', 'H = I·ω', 'ΣM = I·α', 'T = Iω²/2'];
      eqs.forEach((e, i) => {
        const t = txt(this, 60 + (i % 4) * 240 + Math.random() * 40, 90 + Math.floor(i / 4) * 360 + Math.random() * 40, e, 26, '#3a2a48').setDepth(-9);
        this.tweens.add({ targets: t, alpha: 0.4, duration: 2000 + i * 300, yoyo: true, repeat: -1 });
      });
    }
    if (act2) {
      // mapa estilo calabozo de Wizardry: cuadrícula de líneas frías
      bg.lineStyle(1, 0x1c2630, 0.9);
      for (let x = 0; x <= W; x += 24) bg.lineBetween(x, 44, x, H);
      for (let y = 44; y <= H; y += 24) bg.lineBetween(0, y, W, y);
      bg.lineStyle(1, 0x2a3846, 0.9);
      for (let x = 0; x <= W; x += 96) bg.lineBetween(x, 44, x, H);
      for (let y = 44; y <= H; y += 96) bg.lineBetween(0, y, W, y);
    }
    for (let i = 0; i < (act2 || act3 ? 0 : 260); i++) {
      bg.fillStyle(0x15111a, Math.random() * 0.7).fillRect(Math.random() * W, 44 + Math.random() * (H - 44), 3 + Math.random() * 10, 2 + Math.random() * 4);
    }
    embers(this);
    vignette(this);

    topBar(this, tip, { onMenu: () => fadeTo(this, 'Menu') });
    title(this, W / 2, 66, act3 ? T.mapa.titulo3 : act2 ? T.mapa.titulo2 : T.mapa.titulo, 28, act3 ? '#b89ad0' : act2 ? '#9ab8c8' : undefined);

    const byId = new Map(run.map.map((n) => [n.id, n]));
    const current = run.pos >= 0 ? byId.get(run.pos)! : null;
    const available = new Set<number>(current ? current.next : run.map.filter((n) => n.floor === 0).map((n) => n.id));
    const visited = new Set<number>(run.visited ?? []);
    if (current) visited.add(current.id);

    // caminos
    const lines = this.add.graphics();
    for (const n of run.map) {
      const a = nodeXY(n);
      for (const nid of n.next) {
        const b = nodeXY(byId.get(nid)!);
        const travelled = visited.has(n.id) && visited.has(nid);
        const from = current?.id === n.id && available.has(nid);
        const d = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
        const steps = Math.floor(d / 12);
        for (let i = 2; i < steps - 1; i++) {
          const t = i / steps;
          lines.fillStyle(travelled ? UI.gold : from ? 0xb8a890 : 0x3a3244, 1);
          lines.fillRect(a.x + (b.x - a.x) * t - 2, a.y + (b.y - a.y) * t - 2, 4, 4);
        }
      }
    }

    // nodos
    for (const n of run.map) {
      const { x, y } = nodeXY(n);
      const info = n.type === 'jefe' && (act2 || act3) ? { ...NODE_INFO.jefe, name: (act3 ? T.mapa.jefe3 : T.mapa.jefe2)[0], desc: (act3 ? T.mapa.jefe3 : T.mapa.jefe2)[1] } : NODE_INFO[n.type];
      const size = n.type === 'jefe' ? 76 : 46;
      const g = this.add.graphics();
      const isAvail = available.has(n.id);
      const isPast = n.floor < (current ? current.floor : 0) || (current && n.id === current.id);
      frame(g, x - size / 2, y - size / 2, size, size, isAvail ? 0x261e2c : 0x141017, isAvail ? info.color : 0x3a3244);
      const im = n.type === 'jefe' && act3 ? this.add.image(x, y, 'hibbelerius').setScale(1.1) : this.add.image(x, y, info.icon).setScale(n.type === 'jefe' ? 6 : 3.4);
      if (!isAvail && !(current && n.id === current.id)) im.setAlpha(isPast ? 0.3 : 0.75);
      if (visited.has(n.id)) {
        const mark = this.add.graphics();
        mark.lineStyle(3, UI.gold, 0.9).strokeCircle(x, y, size / 2 + 4);
      }
      if (isAvail) {
        const glow = this.add.rectangle(x, y, size + 10, size + 10).setStrokeStyle(2, info.color, 1);
        this.tweens.add({ targets: glow, alpha: 0.2, scale: 1.12, duration: 700, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: im, scale: im.scale * 1.12, duration: 700, yoyo: true, repeat: -1 });
      }
      const z = this.add.zone(x, y, size, size).setInteractive({ useHandCursor: isAvail });
      z.on('pointerover', () => tip.show(x + 30, y - 20, info.name, info.desc + (isAvail ? '\n' + T.mapa.clicAvanzar : '')));
      z.on('pointerout', () => tip.hide());
      z.on('pointerdown', () => {
        if (!isAvail) return;
        run.visited = [...(run.visited ?? []), n.id];
        run.pos = n.id;
        saveLocal();
        this.enter(n);
      });
    }

    // héroe en el mapa
    const hp = current ? nodeXY(current) : { x: 30, y: 280 };
    const hero = this.add.image(hp.x, hp.y - 46, 'hero').setScale(2);
    this.tweens.add({ targets: hero, y: hero.y - 4, duration: 500, yoyo: true, repeat: -1 });

    // leyenda
    const types: NodeType[] = ['combate', 'elite', 'evento', 'santuario', 'runa', 'mercader', 'fogata', 'jefe'];
    types.forEach((t, i) => {
      const x = 24 + i * 118;
      this.add.image(x, H - 22, NODE_INFO[t].icon).setScale(2.6);
      const lt = txt(this, x + 16, H - 33, t === 'jefe' && act3 ? 'Hibbelerius' : t === 'jefe' && act2 ? T.mapa.jefe2[0] : NODE_INFO[t].name, 18, CSS.dim);
      if (lt.width > 96) lt.setScale(96 / lt.width, 1);
    });
  }

  enter(n: MapNode) {
    switch (n.type) {
      case 'combate':
        return fadeTo(this, 'Combat', { kind: n.floor <= 1 ? 'easy' : 'normal', floor: n.floor });
      case 'elite':
        return fadeTo(this, 'Combat', { kind: 'elite', floor: n.floor });
      case 'jefe':
        return fadeTo(this, 'Combat', { kind: 'boss', floor: n.floor });
      case 'fogata':
        return fadeTo(this, 'Campfire', { floor: n.floor });
      case 'runa':
        return fadeTo(this, 'Rune', { floor: n.floor, source: 'altar' });
      case 'evento':
        return fadeTo(this, 'Event', { floor: n.floor });
      case 'mercader':
        return fadeTo(this, 'Shop', { floor: n.floor });
      case 'santuario':
        return fadeTo(this, 'Sanctuary', { floor: n.floor });
    }
  }
}
