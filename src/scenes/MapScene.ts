import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { T } from '../textos';
import { W, H } from '../config';
import { FLOORS, Game, MapNode, NodeType, saveLocal, unlock } from '../state';
import { topBar } from '../ui/hud';
import { button, embers, engraneGfx, fadeTo, frame, icon, title, Tooltip, txt, vignette } from '../ui/widgets';
import { CONSEJOS } from '../data/glosario';
import { ENCARGOS } from '../data/encargos';

const NODE_STYLE: Record<NodeType, { icon: string; color: number }> = {
  combate: { icon: 'i_combat', color: 0x8a8296 },
  elite: { icon: 'i_elite', color: 0xa84a4a },
  fogata: { icon: 'i_fire', color: 0xc87533 },
  runa: { icon: 'i_rune', color: 0x8e5bb0 },
  evento: { icon: 'i_event', color: 0x6a8fc4 },
  mercader: { icon: 'i_bag', color: 0xe8c15a },
  santuario: { icon: 'i_shrine', color: 0x7fd8ff },
  taberna: { icon: 'i_jarra', color: 0xd89a4a },
  jefe: { icon: 'i_boss', color: 0xe8c15a },
};
const NODE_INFO = Object.fromEntries(
  Object.entries(NODE_STYLE).map(([k, v]) => [k, { ...v, name: T.mapa.nodos[k][0], desc: T.mapa.nodos[k][1] }]),
) as Record<NodeType, { icon: string; color: number; name: string; desc: string }>;

/** Posición de un nodo; el ancho entre pisos se ajusta a cuántos pisos tiene el mapa */
export const nodeAt = (n: MapNode, maxFloor = FLOORS) => ({
  x: n.type === 'jefe' ? 884 : 60 + n.floor * (790 / maxFloor),
  y: n.type === 'jefe' ? 280 : 112 + n.lane * 82,
});

export class MapScene extends Phaser.Scene {
  constructor() { super('Map'); }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play((Game.run?.acto ?? 1) >= 4 ? 'mapa4' : (Game.run?.acto ?? 1) === 3 ? 'mapa3' : (Game.run?.acto ?? 1) === 2 ? 'mapa2' : 'mapa');
    const run = Game.run!;
    const tip = new Tooltip(this);

    // fondo: pergamino oscuro
    const bg = this.add.graphics().setDepth(-10);
    const act2 = (run.acto ?? 1) === 2;
    const act3 = (run.acto ?? 1) === 3;
    const act4 = (run.acto ?? 1) >= 4;
    bg.fillStyle(act2 ? 0x020203 : act3 ? 0x050307 : act4 ? 0x070605 : 0x060508, 1).fillRect(0, 0, W, H);
    if (act4) {
      // plano de la fábrica: engranes que giran detrás del mapa y fórmulas de cálculo
      const gears: [number, number, number][] = [[120, 200, 110], [W - 140, 360, 130], [W / 2 + 40, 470, 90], [W / 2 - 160, 90, 60]];
      gears.forEach(([x, y, r], i) => {
        const e = engraneGfx(this, x, y, r, 0x1a1610, 1, Math.round(r / 8)).setDepth(-9);
        this.tweens.add({ targets: e, angle: i % 2 ? -360 : 360, duration: r * 300, repeat: -1 });
      });
      const eqs = ['v = dx/dt', 'a = dv/dt', 'x = ∫v dt', 'W = ∫F·dx', 'I = ∫F dt', 'P = dW/dt', 'd/dt(t²) = 2t', '∫2t dt = t²'];
      eqs.forEach((e, i) => {
        const t = txt(this, 50 + (i % 4) * 240 + Math.random() * 40, 100 + Math.floor(i / 4) * 330 + Math.random() * 40, e, 24, '#3a3020').setDepth(-9);
        this.tweens.add({ targets: t, alpha: 0.4, duration: 2000 + i * 300, yoyo: true, repeat: -1 });
      });
    }
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
    for (let i = 0; i < (act2 || act3 || act4 ? 0 : 260); i++) {
      bg.fillStyle(0x15111a, Math.random() * 0.7).fillRect(Math.random() * W, 44 + Math.random() * (H - 44), 3 + Math.random() * 10, 2 + Math.random() * 4);
    }
    embers(this);
    vignette(this);

    topBar(this, tip, { onMenu: () => fadeTo(this, 'Menu') });
    title(this, W / 2, 66, act4 ? T.mapa.titulo4 : act3 ? T.mapa.titulo3 : act2 ? T.mapa.titulo2 : T.mapa.titulo, 28, act4 ? '#e0a860' : act3 ? '#b89ad0' : act2 ? '#9ab8c8' : undefined);

    const byId = new Map(run.map.map((n) => [n.id, n]));
    const maxF = Math.max(...run.map.map((n) => n.floor)) || FLOORS;
    const nodeXY = (n: MapNode) => nodeAt(n, maxF);
    const current = run.pos >= 0 ? byId.get(run.pos)! : null;
    // si la partida se cerró en el nodo del jefe: retoma la pelea o el paso al siguiente acto
    if (current?.type === 'jefe' && !run.done) {
      const acto = run.acto ?? 1;
      if (!(run.seen ?? []).includes(`jefe_${acto}`)) return void fadeTo(this, 'Combat', { kind: 'boss', floor: current.floor });
      if (acto < 4) return void fadeTo(this, 'ActTransition', { to: acto + 1 });
    }
    const available = new Set<number>(current ? current.next : run.map.filter((n) => n.floor === 0).map((n) => n.id));
    const visited = new Set<number>(run.visited ?? []);
    if (current) visited.add(current.id);

    // caminos
    // nodos alcanzables desde donde estás (todo lo que aún puedes recorrer)
    const alcanzable = new Set<number>();
    const pila = [...available];
    while (pila.length) {
      const id = pila.pop()!;
      if (alcanzable.has(id)) continue;
      alcanzable.add(id);
      pila.push(...(byId.get(id)?.next ?? []));
    }
    const lines = this.add.graphics();
    const punteado = (g: Phaser.GameObjects.Graphics, a: { x: number; y: number }, b: { x: number; y: number }, color: number, sz = 4) => {
      const d = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      const steps = Math.floor(d / 12);
      g.fillStyle(color, 1);
      for (let i = 2; i < steps - 1; i++) {
        const t = i / steps;
        g.fillRect(a.x + (b.x - a.x) * t - sz / 2, a.y + (b.y - a.y) * t - sz / 2, sz, sz);
      }
    };
    for (const n of run.map) {
      const a = nodeXY(n);
      for (const nid of n.next) {
        const b = nodeXY(byId.get(nid)!);
        const travelled = visited.has(n.id) && visited.has(nid);
        const from = current?.id === n.id && available.has(nid);
        const futuro = alcanzable.has(n.id) && alcanzable.has(nid);
        if (travelled) {
          // el camino que ya recorriste: línea dorada continua
          lines.lineStyle(4, UI.gold, 0.85).lineBetween(a.x, a.y, b.x, b.y);
        } else punteado(lines, a, b, from ? 0xe8d8b0 : futuro ? 0x8a7a9a : 0x2a2433, from ? 5 : 4);
      }
    }
    // al pasar el cursor sobre un nodo alcanzable, se ilumina el camino hasta él
    const ruta = this.add.graphics();
    const rutaHasta = (destino: number) => {
      ruta.clear();
      if (!alcanzable.has(destino)) return;
      // búsqueda hacia atrás: de qué nodo (alcanzable o actual) se llega
      const prev = new Map<number, number>();
      const cola = current ? [current.id] : [];
      const inicio = current ? [] : [...available];
      for (const s0 of inicio) prev.set(s0, -1);
      cola.push(...inicio);
      while (cola.length) {
        const id = cola.shift()!;
        if (id === destino) break;
        for (const nx of byId.get(id)?.next ?? []) if (!prev.has(nx)) { prev.set(nx, id); cola.push(nx); }
      }
      let k = destino;
      while (prev.has(k) && prev.get(k)! >= 0) {
        const p0 = prev.get(k)!;
        ruta.lineStyle(5, 0x9ad8f0, 0.8).lineBetween(nodeXY(byId.get(p0)!).x, nodeXY(byId.get(p0)!).y, nodeXY(byId.get(k)!).x, nodeXY(byId.get(k)!).y);
        k = p0;
      }
    };

    // el jefe del acto se ve en el mapa: ya cuenta para el Bestiario
    unlock('enemies', act4 ? 'am' : act3 ? 'hibbelerius' : act2 ? 'bruja' : 'colossus');
    // nodos
    for (const n of run.map) {
      const { x, y } = nodeXY(n);
      const jt = act4 ? T.mapa.jefe4 : act3 ? T.mapa.jefe3 : T.mapa.jefe2;
      const info = n.type === 'jefe' && (act2 || act3 || act4) ? { ...NODE_INFO.jefe, name: jt[0], desc: jt[1] } : NODE_INFO[n.type];
      const size = n.type === 'jefe' ? 76 : 42;
      const g = this.add.graphics();
      const isAvail = available.has(n.id);
      const isPast = n.floor < (current ? current.floor : 0) || (current && n.id === current.id);
      frame(g, x - size / 2, y - size / 2, size, size, isAvail ? 0x261e2c : 0x141017, isAvail ? info.color : 0x3a3244);
      const im = n.type === 'jefe' && act4 ? this.add.image(x, y, 'am_jefe').setScale(1.05) : n.type === 'jefe' && act3 ? this.add.image(x, y, 'hibbelerius').setScale(1.1) : this.add.image(x, y, info.icon).setScale(n.type === 'jefe' ? 6 : 3.1);
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
      z.on('pointerover', () => { rutaHasta(n.id); tip.show(x + 30, y - 20, info.name, info.desc + (isAvail ? '\n' + T.mapa.clicAvanzar : '')); });
      z.on('pointerout', () => { ruta.clear(); tip.hide(); });
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
    const hero = this.add.image(hp.x, hp.y - 46, 'hero').setScale(1);
    this.tweens.add({ targets: hero, y: hero.y - 4, duration: 500, yoyo: true, repeat: -1 });

    // leyenda
    const types: NodeType[] = ['combate', 'elite', 'evento', 'santuario', 'runa', 'mercader', 'taberna', 'fogata', 'jefe'];
    types.forEach((t, i) => {
      const x = 22 + i * 105;
      this.add.image(x, H - 22, NODE_INFO[t].icon).setScale(2.6);
      const lt = txt(this, x + 16, H - 33, t === 'jefe' && act4 ? 'AM' : t === 'jefe' && act3 ? 'Hibbelerius' : t === 'jefe' && act2 ? T.mapa.jefe2[0] : NODE_INFO[t].name, 18, CSS.dim);
      if (lt.width > 84) lt.setScale(84 / lt.width, 1);
    });

    // al empezar cada acto: un consejo para quien no ha jugado este tipo de juegos
    if (run.pos === -1) {
      if (!run.encargo || run.encargo.acto !== (run.acto ?? 1)) this.tablon(() => this.consejo());
      else this.consejo();
    }
  }

  /** Tablón de encargos: elige un contrato opcional para este acto (src/data/encargos.ts) */
  private tablon(despues: () => void) {
    const run = Game.run!;
    const opts = Phaser.Utils.Array.Shuffle([...ENCARGOS]).slice(0, 2);
    const c = this.add.container(0, 0).setDepth(900);
    c.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setInteractive());
    const g = this.add.graphics();
    frame(g, W / 2 - 300, 120, 600, 300, 0x120c08, 0xd89a4a, 0.98);
    c.add([g, title(this, W / 2, 152, 'Tablón de Encargos', 32, '#e8b070'),
      txt(this, W / 2, 184, 'Acepta un contrato opcional para este acto. Si lo cumples, te pagan.', 17, CSS.dim).setOrigin(0.5)]);
    const cerrar = (id: string | null) => {
      run.encargo = { id: id ?? '', acto: run.acto ?? 1, hecho: !id };
      saveLocal();
      c.destroy();
      this.scene.restart(); // al reiniciar ya aparece el consejo y el encargo en la barra
      void despues;
    };
    opts.forEach((e, i) => {
      const y = 240 + i * 70;
      const b = button(this, W / 2, y, 540, 60, '', () => cerrar(e.id), { size: 19, color: 0xd89a4a });
      b.label.setText(`${e.nombre} · +${e.premio} ${T.moneda}`).setY(-11);
      b.add(txt(this, 0, 13, e.texto, 16, CSS.dim).setOrigin(0.5));
      c.add(b);
    });
    c.add(button(this, W / 2, 386, 200, 34, 'Ninguno', () => cerrar(null), { size: 18 }));
  }

  /** Ventanita con un consejo al azar (src/data/glosario.ts → CONSEJOS); clic para cerrarla */
  private consejo() {
    const [ic, h, b] = Phaser.Utils.Array.GetRandom(CONSEJOS);
    const c = this.add.container(W / 2, H - 92).setDepth(800).setAlpha(0);
    const g = this.add.graphics();
    frame(g, -300, -38, 600, 76, 0x0b090e, UI.gold, 0.96);
    const t = txt(this, -238, -28, `Consejo · ${h}`, 19, CSS.gold);
    const d = txt(this, -238, -4, b, 16, CSS.bone, { wordWrap: { width: 520 } });
    if (d.height > 40) d.setFontSize(14);
    c.add([g, icon(this, -268, 0, ic, 4), t, d]);
    this.tweens.add({ targets: c, alpha: 1, duration: 500, delay: 600 });
    const cerrar = () => this.tweens.add({ targets: c, alpha: 0, duration: 400, onComplete: () => c.destroy() });
    this.time.delayedCall(12000, cerrar);
    g.setInteractive(new Phaser.Geom.Rectangle(-300, -38, 600, 76), Phaser.Geom.Rectangle.Contains).on('pointerdown', cerrar);
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
      case 'taberna':
        return fadeTo(this, 'Taberna', { floor: n.floor });
    }
  }
}
