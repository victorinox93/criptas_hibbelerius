import Phaser from 'phaser';
import { api, isOnline, RankRow } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { W } from '../config';
import { gravityOf } from '../data/gravity';
import { Game, TOTAL_PISOS } from '../state';
import { T } from '../textos';
import { button, Btn, dungeonBackground, embers, fadeTo, frame, title, txt } from '../ui/widgets';

const PER_PAGE = 7;
const COLS = [56, 100, 150, 420, 560, 680, 800];

export class RankingScene extends Phaser.Scene {
  private list: RankRow[] = [];
  private page = 0;
  private scope: 'grupo' | 'todos' = 'grupo';
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
    const g = this.add.graphics();
    frame(g, 30, 112, W - 60, 366, 0x0e0b12, UI.border, 0.92);
    const HX = [56, 150, 420, 560, 680, 800];
    T.ranking.cols.forEach((c, i) => txt(this, HX[i], 124, c, 19, CSS.dim));
    g.fillStyle(UI.border, 1).fillRect(44, 148, W - 88, 2);
    this.rows = this.add.container(0, 0);
    this.msg = txt(this, W / 2, 290, '', 22, CSS.dim, { align: 'center' }).setOrigin(0.5);
    this.pageT = txt(this, W / 2, 494, '', 19, CSS.dim).setOrigin(0.5);
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
      const r = await api.leaderboard(Game.profile!.token, scope);
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
      const y = 158 + i * 45;
      const R = (o: Phaser.GameObjects.GameObject) => this.rows.add(o);
      if (p.yo) {
        const hl = this.add.graphics();
        hl.fillStyle(0x2a2233, 1).fillRect(44, y - 2, W - 88, 42);
        hl.lineStyle(1, UI.gold, 0.8).strokeRect(44, y - 2, W - 88, 42);
        R(hl);
      }
      const medal = p.lugar === 1 ? CSS.gold : p.lugar === 2 ? '#c8c8d8' : p.lugar === 3 ? '#c8875a' : CSS.bone;
      R(txt(this, COLS[0], y + 8, `${p.lugar}`, 26, medal));
      // avatar dibujado con sus colores
      let av: { helm?: string; cape?: number; armor?: number; visor?: number; clase?: string; arma?: number; extra?: number; piel?: number } = {};
      try { av = p.avatar ? JSON.parse(p.avatar) : {}; } catch { av = {}; }
      const key = `rk_${this.scope}_${this.page}_${i}`;
      makeHeroFromAvatar(this, { ...av, helm: av.helm ?? 'penacho', cape: av.cape ?? 0 }, key);
      R(this.add.image(COLS[1] + 18, y + 19, key).setScale(0.8));
      const name = txt(this, COLS[2], y + 6, p.alias + (p.yo ? ` (${T.ranking.tu})` : ''), 26, p.yo ? CSS.gold : CSS.bone);
      if (name.width > 250) name.setScale(250 / name.width, 1);
      R(name);
      R(txt(this, COLS[3], y + 10, p.grupo, 20, CSS.dim));
      R(txt(this, COLS[4], y + 8, `✦ ${p.puntaje}`, 24, CSS.gold));
      R(txt(this, COLS[5], y + 8, `${Math.min(p.piso, TOTAL_PISOS)}/${TOTAL_PISOS}`, 24, CSS.bone));
      const g = p.victorias ? ` · ${gravityOf(p.gravedad || 1).name}` : '';
      R(txt(this, COLS[6], y + 10, `${p.victorias}${g}`, 20, p.victorias ? CSS.green : CSS.dim));
    });
  }
}
