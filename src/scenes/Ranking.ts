import Phaser from 'phaser';
import { PISOS_TRAMO, TRAMOS } from '../data/abismo_modo';
import { api, isOnline, RankRow } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { H, W } from '../config';
import { ARMORS, CAPES, VISORS } from '../art/palette';
import { CLASSES } from '../data/classes';
import { ACC } from '../data/tienda';
import { gravityOf } from '../data/gravity';
import { Game, TOTAL_PISOS } from '../state';
import { T } from '../textos';
import { button, Btn, dungeonBackground, embers, fadeTo, frame, title, txt } from '../ui/widgets';

const PER_PAGE = 6;
const ROW_H = 53;
/** v0.54 · 135 → «2 h 15 min» */
function tiempoJugado(min: number) {
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}
const COLS = [56, 100, 150, 420, 560, 680, 800];

export class RankingScene extends Phaser.Scene {
  private list: RankRow[] = [];
  private page = 0;
  private scope: 'grupo' | 'todos' = 'grupo';
  private modo: 'normal' | 'abismo' = 'normal'; // v0.41: ranking propio del Abismo (modo infinito)
  private modoBtn!: Btn;
  private rows!: Phaser.GameObjects.Container;
  private msg!: Phaser.GameObjects.Text;
  private tabs: Btn[] = [];
  private pageT!: Phaser.GameObjects.Text;

  constructor() { super('Ranking'); }

  create() {
    this.cameras.main.fadeIn(250);
    audio.play('menu');
    dungeonBackground(this, 61, 0x18141e);
    embers(this);
    title(this, W / 2, 40, T.ranking.titulo, 44);
    this.tabs = [
      button(this, W / 2 - 90, 88, 170, 34, T.ranking.grupo, () => this.fetchRank('grupo'), { size: 21 }),
      button(this, W / 2 + 90, 88, 170, 34, T.ranking.todos, () => this.fetchRank('todos'), { size: 21 }),
    ];
    this.modoBtn = button(this, W - 120, 88, 170, 34, 'Abismo ◈', () => {
      this.modo = this.modo === 'normal' ? 'abismo' : 'normal';
      this.modoBtn.label.setText(this.modo === 'abismo' ? 'Expedición' : 'Abismo ◈');
      this.fetchRank(this.scope);
    }, { size: 19, color: 0x6a3a9a });
    const g = this.add.graphics();
    frame(g, 30, 112, W - 60, 366, 0x0e0b12, UI.border, 0.92);
    const HX = [56, 150, 420, 560, 680, 800];
    T.ranking.cols.forEach((c, i) => txt(this, HX[i], 124, c, 19, CSS.dim));
    g.fillStyle(UI.border, 1).fillRect(44, 148, W - 88, 2);
    this.rows = this.add.container(0, 0);
    this.msg = txt(this, W / 2, 290, '', 22, CSS.dim, { align: 'center' }).setOrigin(0.5);
    this.pageT = txt(this, W / 2, 494, '', 19, CSS.dim).setOrigin(0.5);
    txt(this, W - 40, 518, 'Toca a un héroe para ver su ficha', 17, CSS.dim).setOrigin(1, 0.5);
    button(this, W / 2 - 150, 494, 44, 30, '‹', () => this.turn(-1), { size: 22 });
    button(this, W / 2 + 150, 494, 44, 30, '›', () => this.turn(1), { size: 22 });
    button(this, 110, 518, 160, 34, T.grimorio.volver, () => fadeTo(this, 'Menu'), { size: 21 });

    if (!isOnline() || !Game.profile || Game.profile.offline) {
      this.msg.setText(T.ranking.sinConexion);
      this.tabs.forEach((t) => t.setEnabled(false));
      return;
    }
    this.fetchRank('grupo');
  }

  private turn(d: number) {
    const pages = Math.max(1, Math.ceil(this.list.length / PER_PAGE));
    this.page = Phaser.Math.Clamp(this.page + d, 0, pages - 1);
    this.render();
  }

  private async fetchRank(scope: 'grupo' | 'todos') {
    this.scope = scope;
    this.tabs.forEach((t, i) => t.label.setColor((i === 0) === (scope === 'grupo') ? CSS.gold : CSS.dim));
    this.rows.removeAll(true);
    this.msg.setText(T.ranking.cargando);
    try {
      const r = await api.leaderboard(Game.profile!.token, scope, this.modo);
      if (this.modo === 'abismo' && r.modo !== 'abismo') throw new Error('El ranking del Abismo necesita la versión nueva del servidor:\npega apps-script/Code.gs y publica una nueva versión.');
      if (!this.scene.isActive()) return;
      this.list = r.lista;
      const mine = this.list.findIndex((x) => x.yo);
      this.page = mine >= 0 ? Math.floor(mine / PER_PAGE) : 0;
      this.msg.setText(this.list.length ? '' : T.ranking.vacio);
      this.render();
    } catch (e) {
      this.msg.setText((e as Error).message || 'No se pudo conectar.');
    }
  }

  private render() {
    this.rows.removeAll(true);
    const pages = Math.max(1, Math.ceil(this.list.length / PER_PAGE));
    this.pageT.setText(this.list.length ? `${T.ranking.pagina} ${this.page + 1} / ${pages}` : '');
    const slice = this.list.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE);
    slice.forEach((p, i) => {
      const y = 154 + i * ROW_H + 5; // las filas originales median 42; se centra el contenido en 53
      const R = (o: Phaser.GameObjects.GameObject) => this.rows.add(o);
      if (p.yo) {
        const hl = this.add.graphics();
        hl.fillStyle(0x2a2233, 1).fillRect(44, y - 6, W - 88, ROW_H - 2);
        hl.lineStyle(1, UI.gold, 0.8).strokeRect(44, y - 6, W - 88, ROW_H - 2);
        R(hl);
      }
      // toda la fila se puede tocar para abrir la ficha del héroe
      const zona = this.add.rectangle(44, y - 6, W - 88, ROW_H - 2, 0xe8c15a, 0).setOrigin(0).setInteractive({ useHandCursor: true });
      zona.on('pointerover', () => zona.setFillStyle(0xe8c15a, 0.07));
      zona.on('pointerout', () => zona.setFillStyle(0xe8c15a, 0));
      R(zona);
      const medal = p.lugar === 1 ? CSS.gold : p.lugar === 2 ? '#c8c8d8' : p.lugar === 3 ? '#c8875a' : CSS.bone;
      R(txt(this, COLS[0], y + 8, `${p.lugar}`, 26, medal));
      // avatar dibujado con sus colores
      let av: { insignia?: string; insignia2?: string; helm?: string; cape?: number; armor?: number; visor?: number; clase?: string; arma?: number; extra?: number; piel?: number } = {};
      try { av = p.avatar ? JSON.parse(p.avatar) : {}; } catch { av = {}; }
      const key = `rk_${this.scope}_${this.page}_${i}`;
      makeHeroFromAvatar(this, { ...av, helm: av.helm ?? 'penacho', cape: av.cape ?? 0 }, key);
      R(this.add.image(COLS[1] + 20, y + 21, key).setScale(1.12));
      zona.on('pointerup', () => this.ficha(p, av, key));
      const name = txt(this, COLS[2], y + 2, p.alias + (p.yo ? ` (${T.ranking.tu})` : ''), 26, p.yo ? CSS.gold : CSS.bone);
      if (name.width > 250) name.setScale(250 / name.width, 1);
      R(name);
      // insignias: ojo rojo (venció a AM) y ojo morado (venció a un Primigenio del Abismo)
      let ox = COLS[2] + name.displayWidth + 18;
      if (av.insignia === 'am') {
        const ojo = this.add.image(ox, y + 20, 'i_ojo').setScale(2).setTint(0xff3a3a);
        R(ojo);
        this.tweens.add({ targets: ojo, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
        ox += 26;
      }
      if (av.insignia2 === 'abismo') {
        const ojo2 = this.add.image(ox, y + 20, 'i_ojo').setScale(2).setTint(0xb070ff);
        R(ojo2);
        this.tweens.add({ targets: ojo2, alpha: 0.5, duration: 1100, yoyo: true, repeat: -1 });
      }
      // v0.54 · partidas y tiempo jugado (el grupo pasa debajo del nombre)
      R(txt(this, COLS[2], y + 32, p.grupo, 14, CSS.dim));
      R(txt(this, COLS[3], y + 4, `${p.partidas} partida${p.partidas === 1 ? '' : 's'}`, 19, CSS.bone));
      R(txt(this, COLS[3], y + 26, p.minutos === undefined ? '—' : tiempoJugado(p.minutos), 16, '#9ad8c8'));
      R(txt(this, COLS[4], y + 8, `✦ ${Number(p.puntaje).toLocaleString('es-MX')}`, 24, CSS.gold));
      if (this.modo === 'abismo') {
        // profundidad: tramo alcanzado (5+ = modo infinito)
        const tramo = Math.floor(p.piso / (PISOS_TRAMO + 1)) + 1; // v0.54 · tramos de 10 pisos + jefe
        R(txt(this, COLS[5], y + 8, tramo > TRAMOS ? `∞ ${tramo}` : `Tramo ${tramo}`, 24, tramo > TRAMOS ? '#c8a8ff' : CSS.bone));
      } else R(txt(this, COLS[5], y + 8, p.piso > TOTAL_PISOS ? `${TOTAL_PISOS} +IV` : `${p.piso}/${TOTAL_PISOS}`, 24, p.piso > TOTAL_PISOS ? '#e0a860' : CSS.bone));
      const g = p.victorias ? ` · ${gravityOf(p.gravedad || 1).name}` : '';
      R(txt(this, COLS[6], y + 10, `${p.victorias}${g}`, 20, p.victorias ? CSS.green : CSS.dim));
    });
  }

  /** Ficha grande del héroe: el personaje en grande con su clase, cosméticos y logros */
  private ficha(p: RankRow, av: { insignia?: string; insignia2?: string; cape?: number; armor?: number; visor?: number; clase?: string; cabeza?: string; cara?: string; mano?: string; pies?: string; escudo?: string }, key: string) {
    audio.sfx?.('click');
    const L = this.add.container(0, 0).setDepth(900);
    const fondo = this.add.rectangle(0, 0, W, H, 0x050407, 0.85).setOrigin(0).setInteractive();
    L.add(fondo);
    const pw = 700, ph = 400, px0 = (W - pw) / 2, py0 = (H - ph) / 2;
    const g = this.add.graphics();
    frame(g, px0, py0, pw, ph, 0x100c14, UI.gold, 0.98);
    L.add(g);
    // pedestal con luz y el héroe en grande
    const cx = px0 + 170, piso = py0 + ph - 46;
    L.add(this.add.ellipse(cx, piso - 120, 250, 300, 0xe8c15a, 0.06));
    L.add(this.add.ellipse(cx, piso + 4, 190, 26, 0x000000, 0.55));
    const heroe = this.add.image(cx, piso + 8, key).setOrigin(0.5, 1).setScale(6.4);
    L.add(heroe);
    this.tweens.add({ targets: heroe, y: piso + 2, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // datos
    const x = px0 + 345;
    let y = py0 + 26;
    const nombre = txt(this, x, y, p.alias, 38, CSS.gold);
    if (nombre.width > pw - 370) nombre.setScale((pw - 370) / nombre.width, 1);
    L.add(nombre);
    y += 46;
    const clase = CLASSES.find((c) => c.id === (av.clase ?? 'caballero'));
    L.add(txt(this, x, y, `${clase?.name ?? 'Héroe'} · ${p.grupo}`, 21, CSS.dim));
    y += 34;
    const medal = p.lugar === 1 ? CSS.gold : p.lugar === 2 ? '#c8c8d8' : p.lugar === 3 ? '#c8875a' : CSS.bone;
    L.add(txt(this, x, y, `Lugar ${p.lugar}`, 24, medal));
    L.add(txt(this, x + 140, y, `✦ ${Number(p.puntaje).toLocaleString('es-MX')}`, 24, CSS.gold));
    y += 30;
    const piso2 = p.piso > TOTAL_PISOS ? `${TOTAL_PISOS} + Acto IV` : `${p.piso}/${TOTAL_PISOS}`;
    L.add(txt(this, x, y, `Piso máx. ${piso2}`, 21, CSS.bone));
    y += 26;
    const vic = p.victorias ? `${p.victorias} victoria${p.victorias === 1 ? '' : 's'} · gravedad máx. ${gravityOf(p.gravedad || 1).name}` : 'Aún sin victorias';
    L.add(txt(this, x, y, vic, 21, p.victorias ? CSS.green : CSS.dim, { wordWrap: { width: pw - 370 } }));
    y += 30;
    L.add(txt(this, x, y, `${p.partidas} partida${p.partidas === 1 ? '' : 's'}${p.minutos === undefined ? '' : ` · ${tiempoJugado(p.minutos)} jugando`}`, 19, '#9ad8c8'));
    y += 30;
    if (av.insignia === 'am') {
      const ojo = this.add.image(x + 10, y + 11, 'i_ojo').setScale(2).setTint(0xff3a3a);
      L.add([ojo, txt(this, x + 28, y, 'Venció a AM', 21, '#ff6a5a')]);
      this.tweens.add({ targets: ojo, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
      y += 30;
    }
    if (av.insignia2 === 'abismo') {
      const ojo2 = this.add.image(x + 10, y + 11, 'i_ojo').setScale(2).setTint(0xb070ff);
      L.add([ojo2, txt(this, x + 28, y, 'Venció a un Primigenio', 21, '#c8a8ff')]);
      this.tweens.add({ targets: ojo2, alpha: 0.5, duration: 1100, yoyo: true, repeat: -1 });
      y += 30;
    }
    g.fillStyle(UI.border, 1).fillRect(x, y + 2, pw - 370, 2);
    y += 12;
    L.add(txt(this, x, y, 'Equipo', 19, CSS.dim));
    y += 24;
    const equipo = [
      ['Capa', CAPES[av.cape ?? 0]?.name],
      ['Armadura', ARMORS[av.armor ?? 0]?.name],
      ['Visor', VISORS[av.visor ?? 0]?.name],
      ...(['cabeza', 'cara', 'mano', 'pies', 'escudo'] as const).filter((k) => av[k] && ACC[av[k]!]).map((k) => [k[0].toUpperCase() + k.slice(1), ACC[av[k]!].nombre]),
    ].filter((e): e is [string, string] => !!e[1]);
    equipo.forEach(([k, v], i) => {
      const col = i % 2, fila = Math.floor(i / 2);
      const t = txt(this, x + col * 170, y + fila * 22, `${k}: ${v}`, 17, CSS.bone);
      if (t.width > 164) t.setScale(164 / t.width, 1);
      L.add(t);
    });
    const cerrar = () => L.destroy();
    L.add(button(this, px0 + pw - 70, py0 + ph - 30, 110, 32, 'Cerrar', cerrar, { size: 20 }));
    fondo.on('pointerup', cerrar);
    L.setAlpha(0);
    this.tweens.add({ targets: L, alpha: 1, duration: 200 });
  }
}
