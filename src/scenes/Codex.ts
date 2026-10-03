import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { G, W, H } from '../config';
import { CARDS } from '../data/cards';
import { EFFECTS } from '../data/effects';
import { ENEMIES } from '../data/enemies';
import { EVENTS } from '../data/events';
import { BOONS, FIGURES } from '../data/figures';
import { RELICS } from '../data/relics';
import { CodexKind, Game } from '../state';
import { T } from '../textos';
import { cardView } from '../ui/card';
import { button, Btn, dungeonBackground, fadeTo, frame, title, txt } from '../ui/widgets';
import { describeOutcome } from './Rune';

interface Entry {
  kind: CodexKind;
  id: string;
  tex: string;
  name: string;
  detail: (c: Phaser.GameObjects.Container) => void;
}

const DX = 488; // panel de detalle
const DW = 436;

export class CodexScene extends Phaser.Scene {
  private tab = 0;
  private grid!: Phaser.GameObjects.Container;
  private detail!: Phaser.GameObjects.Container;
  private tabs: Btn[] = [];
  private countT!: Phaser.GameObjects.Text;

  constructor() { super('Codex'); }

  create(data: { tab?: number }) {
    this.cameras.main.fadeIn(250);
    audio.play('menu');
    dungeonBackground(this, 41, 0x16121c);
    title(this, W / 2, 40, T.grimorio.titulo, 44);
    this.countT = txt(this, 30, 518, '', 20, CSS.dim).setOrigin(0, 0.5);
    this.tabs = T.grimorio.tabs.map((name, i) =>
      button(this, 40 + 88 + i * 176, 92, 168, 36, name, () => this.show(i), { size: 21 }));
    const g = this.add.graphics();
    frame(g, 24, 120, 448, 380, 0x0e0b12, UI.border, 0.9);
    frame(g, DX - 8, 120, DW + 16, 380, 0x0e0b12, UI.border, 0.9);
    this.grid = this.add.container(0, 0);
    this.detail = this.add.container(0, 0);
    button(this, W / 2, 518, 200, 36, T.grimorio.volver, () => fadeTo(this, 'Menu'), { size: 22 });
    this.show(data.tab ?? 0);
  }

  private has(kind: CodexKind, id: string) {
    return Game.codex[kind].includes(id);
  }

  private entries(tab: number): Entry[] {
    const L = (c: Phaser.GameObjects.Container, o: Phaser.GameObjects.GameObject) => c.add(o);
    const head = (c: Phaser.GameObjects.Container, tex: string, name: string, sub: string, scale: number) => {
      const img = this.add.image(DX + 70, 210, tex);
      img.setScale(Math.min(scale, 120 / img.height, 120 / img.width));
      L(c, img);
      L(c, txt(this, DX + 150, 150, name, 28, CSS.gold, { wordWrap: { width: DW - 160 } }));
      L(c, txt(this, DX + 150, 188, sub, 19, CSS.dim, { wordWrap: { width: DW - 160 }, lineSpacing: 2 }));
    };
    const body = (c: Phaser.GameObjects.Container, y: number, s: string, color = CSS.bone, size = 20) =>
      L(c, txt(this, DX + 8, y, s, size, color, { wordWrap: { width: DW - 16 }, lineSpacing: 2 }));

    switch (tab) {
      case 0:
        return Object.values(ENEMIES).map((e) => ({
          kind: 'enemies', id: e.id, tex: e.sprite, name: e.name,
          detail: (c) => {
            head(c, e.sprite, e.name, `${T.grimorio.masa}: ${e.mass} kg\n${T.grimorio.peso}: ${Math.round(e.mass * G)} N\n${T.grimorio.vida}: ${e.hp[0]}–${e.hp[1]}`, 5);
            body(c, 290, e.desc);
            if (e.umbral) body(c, 380, `${T.grimorio.umbral}: F ≥ ${e.umbral} N en un solo golpe (1ª ley).`, CSS.gold);
          },
        }));
      case 1: {
        const list: Entry[] = EVENTS.map((ev) => ({
          kind: 'npcs', id: ev.id, tex: ev.npc, name: ev.name,
          detail: (c) => {
            head(c, ev.npc, ev.name, 'Encuentro', 5);
            body(c, 290, ev.intro, CSS.bone, 19);
            body(c, 410, `${T.evento.siAciertas}: ${describeOutcome(ev.bless)}`, CSS.green, 18);
            body(c, 452, `${T.evento.siFallas}: ${describeOutcome(ev.curse)}`, '#e08a8a', 18);
          },
        }));
        list.push({
          kind: 'npcs', id: 'mercader', tex: 'npc_mercader', name: T.mercader.titulo,
          detail: (c) => {
            head(c, 'npc_mercader', T.mercader.titulo, T.mapa.nodos.mercader[1], 5);
            body(c, 290, T.mercader.saludo);
          },
        });
        return list;
      }
      case 2:
        return FIGURES.map((f) => ({
          kind: 'figures', id: f.id, tex: f.sprite, name: f.name,
          detail: (c) => {
            head(c, f.sprite, f.name, `${f.years}\n${f.epithet}`, 6);
            body(c, 290, f.intro, CSS.bone, 19);
            f.boons.forEach((bid, i) => {
              const b = BOONS[bid];
              const known = this.has('boons', bid);
              body(c, 380 + i * 36, known ? `◆ ${b.name}: ${b.text[0]}` : '◆ ???', known ? CSS.gold : CSS.dim, 17);
            });
          },
        }));
      case 3:
        return Object.values(CARDS).map((cd) => ({
          kind: 'cards', id: cd.id, tex: cd.icon, name: cd.name,
          detail: (c) => {
            L(c, cardView(this, DX + 90, 280, { uid: -1, id: cd.id, up: false }));
            L(c, txt(this, DX + 185, 150, cd.name, 26, CSS.gold, { wordWrap: { width: DW - 190 } }));
            L(c, txt(this, DX + 185, 186, `${cd.type} · ${cd.concept}\n${cd.rarity}`, 19, CSS.dim));
            L(c, txt(this, DX + 185, 250, cd.lore, 19, CSS.bone, { wordWrap: { width: DW - 190 }, lineSpacing: 2 }));
          },
        }));
      default: {
        const rel: Entry[] = Object.values(RELICS).map((r) => ({
          kind: 'relics', id: r.id, tex: r.icon, name: r.name,
          detail: (c) => {
            head(c, r.icon, r.name, 'Reliquia', 9);
            body(c, 290, r.text, CSS.gold);
            body(c, 340, r.lore);
          },
        }));
        const boons: Entry[] = Object.values(BOONS).map((b) => ({
          kind: 'boons', id: b.id, tex: b.icon, name: b.name,
          detail: (c) => {
            const fig = FIGURES.find((f) => f.id === b.figure);
            head(c, b.icon, b.name, `Don de ${fig?.name ?? ''}`, 9);
            body(c, 290, `${T.grimorio.comun}: ${b.text[0]}`, '#b8c0d0');
            body(c, 340, `${T.grimorio.epico}: ${b.text[1]}`, CSS.gold);
            body(c, 400, b.lore);
          },
        }));
        const fx: Entry[] = Object.values(EFFECTS).map((e) => ({
          kind: 'effects', id: e.id, tex: e.icon, name: e.name,
          detail: (c) => {
            head(c, e.icon, e.name, e.good ? T.evento.bendicion : T.evento.maldicion, 9);
            body(c, 290, e.text, e.good ? CSS.green : '#e08a8a');
            body(c, 340, e.lore);
          },
        }));
        return [...rel, ...boons, ...fx];
      }
    }
  }

  private show(tab: number) {
    this.tab = tab;
    audio.sfx('click');
    this.tabs.forEach((b, i) => b.label.setColor(i === tab ? CSS.gold : CSS.dim));
    this.grid.removeAll(true);
    this.detail.removeAll(true);
    const list = this.entries(tab);
    const known = list.filter((e) => this.has(e.kind, e.id)).length;
    this.countT.setText(`${T.grimorio.descubiertos}: ${known} / ${list.length}`);

    const many = list.length > 30;
    const cols = many ? 8 : 6, size = many ? 48 : 62, gap = many ? 6 : 8, x0 = 44, y0 = 140;
    let selected: Phaser.GameObjects.Graphics | null = null;
    list.forEach((e, i) => {
      const x = x0 + (i % cols) * (size + gap), y = y0 + Math.floor(i / cols) * (size + gap);
      const unlocked = this.has(e.kind, e.id);
      const g = this.add.graphics();
      const draw = (on: boolean) => {
        g.clear();
        g.fillStyle(on ? 0x2a2233 : 0x15111a, 1).fillRect(x, y, size, size);
        g.lineStyle(2, on ? UI.gold : unlocked ? UI.border : 0x221c2a, 1).strokeRect(x, y, size, size);
      };
      draw(false);
      const img = this.add.image(x + size / 2, y + size / 2, e.tex);
      img.setScale(Math.min(5, (size - 12) / img.width, (size - 12) / img.height));
      if (!unlocked) img.setTintFill(0x000000).setAlpha(0.65);
      const q = unlocked ? null : txt(this, x + size / 2, y + size / 2, '?', 28, '#4a3f55').setOrigin(0.5);
      const z = this.add.zone(x, y, size, size).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => {
        audio.sfx('hover');
        if (selected) selected.emit('off');
        selected = g;
        draw(true);
        this.detail.removeAll(true);
        if (unlocked) e.detail(this.detail);
        else {
          const sil = this.add.image(DX + 70, 210, e.tex).setTintFill(0x000000).setAlpha(0.7);
          sil.setScale(Math.min(8, 120 / sil.height, 120 / sil.width));
          this.detail.add([sil, txt(this, DX + 150, 150, '???', 30, CSS.dim), txt(this, DX + 8, 300, T.grimorio.bloqueado, 22, CSS.dim)]);
        }
      });
      g.on('off', () => draw(false));
      this.grid.add([g, img, z]);
      if (q) this.grid.add(q);
      if (i === 0) z.emit('pointerdown');
    });
  }
}
