import { ALMAS } from '../data/almas';
import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { G, W, H } from '../config';
import { CARDS } from '../data/cards';
import { EFFECTS } from '../data/effects';
import { ENEMIES, VIDA_ENEMIGOS } from '../data/enemies';
import { EVENTS } from '../data/events';
import { DILEMMAS } from '../data/dilemmas';
import { FAMILIARS } from '../data/familiars';
import { BOONS, FIGURES } from '../data/figures';
import { DUOS, RIVALIDADES } from '../data/relaciones';
import { RELICS } from '../data/relics';
import { CodexKind, Game, nivelActual } from '../state';
import { DESBLOQUEOS, NIVELES, nivelDe, siguienteNivel } from '../data/progreso';
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
  private pag = 0; // página de la cuadrícula

  constructor() { super('Codex'); }

  create(data: { tab?: number }) {
    this.cameras.main.fadeIn(250);
    audio.play('menu');
    dungeonBackground(this, 41, 0x16121c);
    title(this, W / 2, 40, T.grimorio.titulo, 44);
    this.countT = txt(this, 30, 518, '', 20, CSS.dim).setOrigin(0, 0.5);
    this.tabs = T.grimorio.tabs.map((name, i) =>
      button(this, 30 + 64 + i * 130, 92, 126, 36, name, () => this.show(i), { size: name.length > 12 ? 15 : 18 }));
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
      // nombres largos (p. ej. «Hibbelerius, …»): se encogen para caber en un renglón
      // y el subtítulo se acomoda debajo, sin encimarse
      const nt = txt(this, DX + 150, 150, name, 28, CSS.gold);
      for (let f = 27; nt.width > DW - 160 && f >= 18; f--) nt.setFontSize(f);
      if (nt.width > DW - 160) nt.setWordWrapWidth(DW - 160);
      L(c, nt);
      L(c, txt(this, DX + 150, Math.max(188, nt.y + nt.height + 6), sub, 19, CSS.dim, { wordWrap: { width: DW - 160 }, lineSpacing: 2 }));
    };
    const body = (c: Phaser.GameObjects.Container, y: number, s: string, color = CSS.bone, size = 20) =>
      L(c, txt(this, DX + 8, y, s, size, color, { wordWrap: { width: DW - 16 }, lineSpacing: 2 }));

    switch (tab) {
      case 0:
        return Object.values(ENEMIES).map((e) => ({
          kind: 'enemies', id: e.id, tex: e.sprite, name: e.name,
          detail: (c) => {
            head(c, e.sprite, e.name, `${T.grimorio.masa}: ${e.mass} kg\n${T.grimorio.peso}: ${Math.round(e.mass * G)} N\n${T.grimorio.vida}: ${Math.round(e.hp[0] * VIDA_ENEMIGOS)}–${Math.round(e.hp[1] * VIDA_ENEMIGOS)}`, 5);
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
        for (const d of DILEMMAS) {
          list.push({
            kind: 'npcs', id: `dil_${d.id}`, tex: d.sprite, name: d.name,
            detail: (c) => {
              head(c, d.sprite, d.name, 'Dilema (situación de riesgo)', 5);
              body(c, 290, d.intro, CSS.bone, 18);
              d.choices.forEach((ch, i) => body(c, 400 + i * 30, `◆ ${ch.label}: ${ch.risk}`, CSS.gold, 16));
            },
          });
        }
        for (const f of Object.values(FAMILIARS)) {
          list.push({
            kind: 'npcs', id: `fam_${f.id}`, tex: f.sprite, name: f.name,
            detail: (c) => {
              head(c, f.sprite, f.name, `Familiar · te acompaña ${f.combats} combates`, 6);
              body(c, 290, f.text, CSS.gold);
              body(c, 370, f.lore);
            },
          });
        }
        for (const a of Object.values(ALMAS)) {
          list.push({
            kind: 'npcs', id: `alma_${a.id}`, tex: `alma_${a.id}`, name: a.name,
            detail: (c) => {
              head(c, `alma_${a.id}`, a.name, 'Alma en pena · posible aliado', 2);
              body(c, 290, a.intro, CSS.bone, 17);
              body(c, 430, `Como aliado: ${a.habilidad}`, CSS.gold, 17);
            },
          });
        }
        list.push({
          kind: 'npcs', id: 'myriam', tex: 'npc_myriam', name: 'Myriam',
          detail: (c) => {
            head(c, 'npc_myriam', 'Myriam, la Hechicera Oscura', 'Encuentro raro · sólo maldiciones', 6);
            body(c, 290, 'No vende, no regala, no pregunta: sólo cobra. Te muestra tres maldiciones y debes aceptar una. Lo único que decides es cuál duele menos.', CSS.bone, 18);
            body(c, 400, 'Puede quitarte cartas, Vida máxima, Ergios, reliquias o pociones, degradar tus mejoras, subir tu Locura o ensuciar tus próximos combates.', '#d07aff', 16);
          },
        });
        list.push({
          kind: 'npcs', id: 'am', tex: 'npc_am', name: 'AM',
          detail: (c) => {
            head(c, 'npc_am', 'AM', 'Inteligencia artificial · recuerda cada visita', 6);
            body(c, 290, 'Lo construyeron para resolver todos los problemas del libro. Los resolvió. Ahora sólo piensa… y te hace preguntas. Si aceptas su pacto, resolverá runas por ti: acertarás, pero no aprenderás nada.', CSS.bone, 18);
            const m = Game.codex.am;
            if (m) body(c, 430, `Visitas: ${m.visitas} · Pactos aceptados: ${m.pactos} · Rechazados: ${m.rechazos}`, '#ff8a7a', 17);
          },
        });
        return list;
      }
      case 2:
        return FIGURES.map((f) => ({
          kind: 'figures', id: f.id, tex: f.sprite, name: f.name,
          detail: (c) => {
            head(c, f.sprite, f.name, `${f.years}\n${f.epithet}`, 6);
            // todo se acomoda hacia abajo según lo que mida cada texto (los dones con radiación son largos)
            const draw = (fs: number) => {
              const objs: Phaser.GameObjects.Text[] = [];
              const put = (y: number, s: string, color: string, size: number) => {
                const t = txt(this, DX + 8, y, s, size, color, { wordWrap: { width: DW - 16 }, lineSpacing: 1 });
                objs.push(t);
                return y + t.height + 4;
              };
              let y = put(272, f.intro.replace(/\n/g, ' '), CSS.bone, fs);
              y += 4;
              for (const bid of f.boons) {
                const b = BOONS[bid];
                if (!this.has('boons', bid)) { y = put(y, '◆ ???', CSS.dim, fs - 2); continue; }
                const [good, rad] = b.text[0].split('\nRadiación:');
                y = put(y, `◆ ${b.name}: ${good}`, CSS.gold, fs - 2);
                if (rad) y = put(y - 2, `   Radiación:${rad}`, '#9bf07a', fs - 3);
              }
              return { objs, y };
            };
            let fs = 18, r = draw(fs);
            while (r.y > 496 && fs > 13) { r.objs.forEach((o) => o.destroy()); r = draw(--fs); }
            r.objs.forEach((o) => L(c, o));
          },
        }));
      case 3:
        return Object.values(CARDS).map((cd) => ({
          kind: 'cards', id: cd.id, tex: cd.icon, name: cd.name,
          detail: (c) => {
            L(c, cardView(this, DX + 90, 280, { uid: -1, id: cd.id, up: false }));
            const ct = txt(this, DX + 185, 150, cd.name, 26, CSS.gold);
            for (let f = 25; ct.width > DW - 190 && f >= 18; f--) ct.setFontSize(f);
            if (ct.width > DW - 190) ct.setWordWrapWidth(DW - 190);
            L(c, ct);
            L(c, txt(this, DX + 185, Math.max(186, ct.y + ct.height + 4), `${cd.type} · ${cd.concept}\n${cd.rarity}`, 19, CSS.dim));
            L(c, txt(this, DX + 185, 250, cd.lore, 19, CSS.bone, { wordWrap: { width: DW - 190 }, lineSpacing: 2 }));
            if (cd.lock) L(c, txt(this, DX + 185, 440, `Desbloqueable: nivel ${cd.lock} de Conocimiento`, 17, '#9ad8f0', { wordWrap: { width: DW - 190 } }));
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
            head(c, b.icon, b.name, b.duo ? `Don dúo de ${b.duo.map((f) => FIGURES.find((x) => x.id === f)?.name ?? f).join(' y ')}` : `Don de ${fig?.name ?? ''}`, 9);
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

  /** Pestaña «Progreso»: nivel de Conocimiento y lo que desbloquea cada nivel */
  /** Rivalidades y dúos entre ecos (se descubren al conocer a ambos) */
  private showRelaciones() {
    const c = this.grid;
    const g = this.add.graphics();
    frame(g, 24, 120, W - 48, 380, 0x0e0b12, UI.border, 0.98);
    c.add(g);
    const conoce = (id: string) => Game.codex.figures.includes(id);
    const nom = (id: string) => (conoce(id) ? FIGURES.find((f) => f.id === id)?.name.split(' ').slice(-1)[0] ?? id : '???');
    c.add(txt(this, 44, 130, '⚔ Rivalidades', 22, '#e08a8a'));
    let y = 160;
    for (const r of RIVALIDADES) {
      const ok = conoce(r.a) && conoce(r.b);
      c.add(txt(this, 44, y, `${nom(r.a)} ⚔ ${nom(r.b)}${ok ? ` · ${r.titulo}` : ''}`, 17, ok ? CSS.bone : '#5a5468'));
      const h = txt(this, 56, y + 20, ok ? r.historia : 'Conoce a ambos ecos para descubrir su historia.', 13, ok ? CSS.dim : '#4a4458', { wordWrap: { width: 400 } });
      c.add(h);
      y += 26 + Math.min(h.height, 52);
    }
    c.add(txt(this, 490, 130, '✦ Dones dúo', 22, CSS.gold));
    DUOS.forEach((d, i) => {
      const ok = conoce(d.figs[0]) && conoce(d.figs[1]);
      const b = BOONS[d.id];
      const tiene = Game.codex.boons.includes(d.id);
      const yy = 160 + i * 40;
      c.add(txt(this, 490, yy, `${nom(d.figs[0])} + ${nom(d.figs[1])}${ok ? ` → ${b.name}` : ''}${tiene ? '  ✓' : ''}`, 16, ok ? (tiene ? CSS.green : CSS.bone) : '#5a5468'));
      if (ok) c.add(txt(this, 502, yy + 18, b.text[0].split('\n')[0], 13, CSS.dim, { wordWrap: { width: 430 } }));
    });
    const af = Object.entries(Game.codex.afinidad ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 4);
    this.countT.setText(af.length ? `❤ Afinidad: ${af.map(([f, n]) => `${nom(f)} ×${n}`).join(' · ')}` : 'Elige dones de los ecos para ganar su afinidad.');
  }

  private showProgress() {
    const xp = Game.codex.xp ?? 0;
    const lv = nivelActual();
    const sig = siguienteNivel(xp, nivelActual());
    const c = this.grid;
    const g = this.add.graphics();
    frame(g, 24, 120, W - 48, 380, 0x0e0b12, UI.border, 0.98);
    c.add(g);
    c.add(txt(this, 44, 132, `Nivel de Conocimiento ${lv}`, 26, CSS.gold));
    c.add(txt(this, 44, 162, 'Ganas Conocimiento en cada expedición (pisos, runas, élites, actos y victoria). Cada nivel desbloquea cosas nuevas.', 17, CSS.dim, { wordWrap: { width: 600 } }));
    // barra de avance
    const prev = NIVELES[lv - 1];
    const frac = sig ? (xp - prev) / (sig - prev) : 1;
    g.fillStyle(0x1a1520, 1).fillRect(W - 330, 138, 280, 16);
    g.fillStyle(0x6ad0e8, 1).fillRect(W - 330, 138, 280 * frac, 16);
    g.lineStyle(2, UI.border, 1).strokeRect(W - 330, 138, 280, 16);
    c.add(txt(this, W - 50, 160, sig ? `${xp} / ${sig}` : `${xp} (máximo)`, 17, CSS.bone).setOrigin(1, 0));
    // lista en dos columnas
    let col = 0, y = 196;
    for (let n = 2; n <= NIVELES.length; n++) {
      const items = DESBLOQUEOS.filter((d) => d.nivel === n);
      if (!items.length) continue;
      if (y + 22 + items.length * 19 > 494) { col++; y = 196; }
      const x = 44 + col * 300;
      const got = n <= lv;
      c.add(txt(this, x, y, `Nivel ${n}${got ? '  ✓' : ''}`, 19, got ? CSS.green : CSS.dim));
      y += 22;
      for (const d of items) {
        const t = txt(this, x + 12, y, `${d.tipo}: ${d.nombre}`, 16, got ? CSS.bone : '#5a5468');
        if (t.width > 282) t.setScale(282 / t.width, 1);
        c.add(t);
        y += 19;
      }
      y += 6;
    }
    this.countT.setText(`Nivel ${lv}`);
  }

  private show(tab: number, mismaPestana = false) {
    if (!mismaPestana) this.pag = 0;
    this.tab = tab;
    audio.sfx('click');
    this.tabs.forEach((b, i) => b.label.setColor(i === tab ? CSS.gold : CSS.dim));
    this.grid.removeAll(true);
    this.detail.removeAll(true);
    if (tab === 5) return this.showProgress();
    if (tab === 6) return this.showRelaciones();
    const list = this.entries(tab);
    const known = list.filter((e) => this.has(e.kind, e.id)).length;
    this.countT.setText(`${T.grimorio.descubiertos}: ${known} / ${list.length}`);

    // cuadrícula: si hay muchas entradas se divide en páginas (◀ ▶)
    const many = list.length > 30;
    const cols = many ? 8 : 6, size = many ? 44 : 62, gap = many ? 6 : 8, x0 = 40, y0 = 136;
    const porPag = many ? cols * 6 : 30;
    const pags = Math.max(1, Math.ceil(list.length / porPag));
    this.pag = Math.min(this.pag, pags - 1);
    if (pags > 1) {
      const pt = txt(this, 248, 470, `${this.pag + 1} / ${pags}`, 18, CSS.dim).setOrigin(0.5);
      const prev = button(this, 190, 470, 40, 26, '◀', () => { this.pag = (this.pag + pags - 1) % pags; this.show(tab, true); }, { size: 16 });
      const next = button(this, 306, 470, 40, 26, '▶', () => { this.pag = (this.pag + 1) % pags; this.show(tab, true); }, { size: 16 });
      this.grid.add([pt, prev, next]);
    }
    const desde = this.pag * porPag;
    let selected: Phaser.GameObjects.Graphics | null = null;
    list.slice(desde, desde + porPag).forEach((e, i) => {
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
          const lk = e.kind === 'cards' ? CARDS[e.id]?.lock : undefined;
          if (lk) this.detail.add(txt(this, DX + 8, 370, `Se desbloquea en el nivel ${lk} de Conocimiento.`, 20, '#9ad8f0'));
        }
      });
      g.on('off', () => draw(false));
      this.grid.add([g, img, z]);
      if (q) this.grid.add(q);
      if (i === 0) z.emit('pointerdown');
    });
  }
}

/** Avance del Grimorio por pestaña (para el panel de progreso del menú) */
export function progresoGrimorio() {
  const sc = new CodexScene() as unknown as { entries: (t: number) => Entry[] };
  const out: { known: number; total: number }[] = [];
  for (let tab = 0; tab < 5; tab++) {
    const list = sc.entries(tab);
    out.push({ known: list.filter((e) => Game.codex[e.kind].includes(e.id)).length, total: list.length });
  }
  const known = out.reduce((a, b) => a + b.known, 0), total = out.reduce((a, b) => a + b.total, 0);
  return { known, total, tabs: out };
}

