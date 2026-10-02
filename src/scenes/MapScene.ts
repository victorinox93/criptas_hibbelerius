import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { FLOORS, Game, MapNode, NodeType, saveLocal } from '../state';
import { topBar } from '../ui/hud';
import { embers, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

const NODE_INFO: Record<NodeType, { icon: string; name: string; desc: string; color: number }> = {
  combate: { icon: 'i_combat', name: 'Combate', desc: 'Criaturas de la cripta. Gana una carta.', color: 0x8a8296 },
  elite: { icon: 'i_elite', name: 'Élite', desc: 'Enemigo con Inercia. Peligroso, pero deja una reliquia.', color: 0xc43a3a },
  fogata: { icon: 'i_fire', name: 'Fogata', desc: 'Descansa para curarte o estudia una runa para mejorar una carta.', color: 0xc87533 },
  runa: { icon: 'i_rune', name: 'Altar rúnico', desc: 'Un problema de dinámica. Resuélvelo y obtén una reliquia.', color: 0x8e5bb0 },
  jefe: { icon: 'i_boss', name: 'Coloso Inerte', desc: 'El guardián del Acto I.', color: 0xe8c15a },
};

export const nodeXY = (n: MapNode) => ({
  x: n.type === 'jefe' ? 878 : 80 + n.floor * 96,
  y: n.type === 'jefe' ? 280 : 112 + n.lane * 82,
});

export class MapScene extends Phaser.Scene {
  constructor() { super('Map'); }

  create() {
    this.cameras.main.fadeIn(300);
    const run = Game.run!;
    const tip = new Tooltip(this);

    // fondo: pergamino oscuro
    const bg = this.add.graphics().setDepth(-10);
    bg.fillStyle(0x0d0b10, 1).fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) {
      bg.fillStyle(0x1a1520, Math.random() * 0.8).fillRect(Math.random() * W, 44 + Math.random() * (H - 44), 3 + Math.random() * 10, 2 + Math.random() * 4);
    }
    embers(this);
    vignette(this);

    topBar(this, tip, { onMenu: () => fadeTo(this, 'Menu') });
    title(this, 300, 70, 'Acto I · Las Criptas de la Inercia', 30).setOrigin(0, 0.5).setX(20);

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
      const info = NODE_INFO[n.type];
      const size = n.type === 'jefe' ? 76 : 46;
      const g = this.add.graphics();
      const isAvail = available.has(n.id);
      const isPast = n.floor < (current ? current.floor : 0) || (current && n.id === current.id);
      frame(g, x - size / 2, y - size / 2, size, size, isAvail ? 0x261e2c : 0x141017, isAvail ? info.color : 0x2c2534);
      const im = this.add.image(x, y, info.icon).setScale(n.type === 'jefe' ? 6 : 3.4);
      if (!isAvail && !(current && n.id === current.id)) im.setAlpha(isPast ? 0.25 : 0.55);
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
      z.on('pointerover', () => tip.show(x + 30, y - 20, info.name, info.desc + (isAvail ? '\n▶ Clic para avanzar' : '')));
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
    const types: NodeType[] = ['combate', 'elite', 'runa', 'fogata', 'jefe'];
    types.forEach((t, i) => {
      const x = 40 + i * 175;
      this.add.image(x, H - 22, NODE_INFO[t].icon).setScale(2.6);
      txt(this, x + 18, H - 34, NODE_INFO[t].name, 20, CSS.dim);
    });
    txt(this, W - 16, 70, `Pisos: ${Math.min(run.floor, FLOORS + 1)}/${FLOORS + 1}`, 22, CSS.dim).setOrigin(1, 0.5);
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
    }
  }
}
