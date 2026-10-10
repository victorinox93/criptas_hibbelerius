import Phaser from 'phaser';
import { api, Estadisticas, isOnline } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W } from '../config';
import { ENEMIES } from '../data/enemies';
import { expediciones, Game } from '../state';
import { button, dungeonBackground, fadeTo, frame, title, txt } from '../ui/widgets';

/**
 * Menú → Estadísticas (v0.30). Thomas Bayes analiza tus datos: tiempo, expediciones,
 * derrotas, quién te vence más y qué temas se te complican. Los datos vienen del servidor
 * (hojas Partidas y Eventos); sin conexión se muestra lo que guarda tu Grimorio.
 * Para cada tema estimamos tu probabilidad de acertar con la regla de sucesión de Laplace
 * (prior uniforme): P = (aciertos + 1) / (intentos + 2).
 */
export class EstadisticasScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;

  constructor() { super('Estadisticas'); }

  create() {
    this.cameras.main.fadeIn(250);
    audio.play('santuario');
    dungeonBackground(this, 53, 0x14121a);
    title(this, W / 2, 30, 'Estadísticas', 38);
    // Bayes
    const fig = this.add.image(86, 150, 'fig_bayes').setScale(5);
    this.tweens.add({ targets: fig, y: 146, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, 86, 214, 'Thomas Bayes', 15, CSS.gold).setOrigin(0.5, 0);
    const g = this.add.graphics();
    frame(g, 150, 62, W - 190, 64, 0x0e0b12, UI.border, 0.94);
    txt(this, 166, 70, '«Cada expedición es un dato. Con suficientes datos, ya no adivinamos: estimamos.\nEsto es lo que tus intentos dicen de ti… y lo que conviene repasar.»', 16, CSS.bone, { lineSpacing: 3 });
    this.layer = this.add.container(0, 0);
    button(this, W / 2, 516, 200, 36, 'Volver', () => fadeTo(this, 'Menu'), { size: 21 });
    const prof = Game.profile!;
    if (!prof.offline && isOnline()) {
      const cargando = txt(this, W / 2, 300, 'Bayes está revisando tus datos…', 20, CSS.dim).setOrigin(0.5);
      api.estadisticas(prof.token)
        .then((e) => { cargando.destroy(); if (this.scene.isActive()) this.mostrar(e); })
        .catch(() => { cargando.destroy(); if (this.scene.isActive()) this.mostrar(null); });
    } else this.mostrar(null);
  }

  private mostrar(e: Estadisticas | null) {
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    const c = Game.codex;
    const seg = Math.max(c.tiempo ?? 0, (e?.minutos ?? 0) * 60);
    const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60);
    const partidas = e ? e.partidas : expediciones();
    const vic = e ? e.victorias : c.victorias ?? 0;
    const der = e ? e.derrotas : Math.max(0, partidas - vic);
    // ── columna izquierda: resumen ──
    const g = this.add.graphics();
    L(g);
    frame(g, 40, 240, 330, 260, 0x0e0b12, UI.border, 0.94);
    L(txt(this, 56, 248, 'Tu resumen', 20, CSS.gold));
    const filas: [string, string][] = [
      ['Tiempo jugado', `${h ? `${h} h ` : ''}${m} min`],
      ['Expediciones', `${partidas}`],
      ['Victorias', `${vic}`],
      ['Derrotas', `${der}`],
      ['Tasa de victoria', partidas ? `${Math.round((100 * vic) / partidas)} %` : '—'],
      ...(e ? ([['Mejor acto', e.mejorActo ? `${['I', 'II', 'III', 'IV'][Math.min(3, e.mejorActo - 1)]}` : '—'], ['Abandonadas', `${e.abandonadas}`]] as [string, string][]) : []),
    ];
    filas.forEach(([k, v], i) => {
      L(txt(this, 56, 280 + i * 24, k, 16, CSS.dim));
      L(txt(this, 354, 280 + i * 24, v, 16, CSS.bone).setOrigin(1, 0));
    });
    if (e?.causas.length) {
      const nom = (x: string) => ENEMIES[x]?.name ?? x;
      L(txt(this, 56, 280 + filas.length * 24 + 6, `Te vence más: ${nom(e.causas[0][0])} (${e.causas[0][1]})`, 15, '#e08a8a', { wordWrap: { width: 300 } }));
    }
    // ── columna derecha: temas ──
    frame(g, 390, 140, W - 430, 360, 0x0e0b12, UI.border, 0.94);
    L(txt(this, 406, 148, 'Lo que más se te complica', 20, CSS.gold));
    if (!e) {
      L(txt(this, 406, 190, Game.profile!.offline || !isOnline() ? 'Sin conexión: los temas se calculan con los datos del servidor.\nConéctate para que Bayes los analice.' : 'No se pudieron leer tus datos. Intenta más tarde.', 16, CSS.dim, { wordWrap: { width: W - 470 } }));
      return;
    }
    const temas = e.temas
      .filter(([, , n]) => n > 0)
      .map(([t, ok, n]) => ({ t, ok, n, p: (ok + 1) / (n + 2) }))
      .sort((a, b) => a.p - b.p);
    if (!temas.length) {
      L(txt(this, 406, 190, 'Aún no hay suficientes respuestas. ¡Contesta runas y encuentros!', 16, CSS.dim));
      return;
    }
    temas.slice(0, 9).forEach((x, i) => {
      const y = 186 + i * 30;
      L(txt(this, 406, y, x.t, 15, CSS.bone));
      const x0 = 610, w = 210;
      g.fillStyle(0x1e1a24, 1).fillRect(x0, y + 3, w, 11);
      const col = x.p < 0.5 ? 0xc84a4a : x.p < 0.7 ? 0xe8c15a : 0x7fc87a;
      g.fillStyle(col, 1).fillRect(x0, y + 3, Math.max(3, w * x.p), 11);
      g.lineStyle(1, 0x3a3444, 1).strokeRect(x0, y + 3, w, 11);
      L(txt(this, W - 52, y, `${Math.round(100 * x.p)} % · ${x.ok}/${x.n}`, 14, CSS.dim).setOrigin(1, 0));
    });
    L(txt(this, 406, 462, 'P(acertar) = (aciertos + 1) / (intentos + 2): con pocos datos, Bayes no se precipita.', 13, CSS.dim, { wordWrap: { width: W - 470 } }));
  }
}
