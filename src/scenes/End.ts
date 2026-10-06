import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { audio } from '../audio';
import { T } from '../textos';
import { addConocimiento, FLOORS, Game, logEvent, nivelActual, saveLocal, TOTAL_PISOS } from '../state';
import { conocimientoGanado, DESBLOQUEOS, nivelDe, siguienteNivel } from '../data/progreso';
import { LECCIONES } from '../data/lecciones';
import { ALMAS } from '../data/almas';
import { button, embers, fadeTo, panel, title, Tooltip, txt, vignette } from '../ui/widgets';
import { gravityOf } from '../data/gravity';

const TIPS = T.final.consejos;

export class EndScene extends Phaser.Scene {
  constructor() { super('End'); }

  /** Ventana de «¡Subiste de nivel!» con lo que se desbloqueó */
  private unlockPopup(nivel: number, all: typeof DESBLOQUEOS) {
    const items = all.slice(0, 10);
    const resto = all.length - items.length;
    audio.sfx('victory');
    const layer = this.add.container(0, 0).setDepth(900);
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setInteractive();
    const g = this.add.graphics();
    const h = 140 + items.length * 30 + (resto > 0 ? 26 : 0);
    const y0 = (H - h) / 2;
    g.fillStyle(0x0b090e, 0.98).fillRect(W / 2 - 280, y0, 560, h);
    g.lineStyle(3, UI.gold, 1).strokeRect(W / 2 - 280, y0, 560, h);
    layer.add([shade, g, title(this, W / 2, y0 + 34, `¡Nivel de Conocimiento ${nivel}!`, 34)]);
    layer.add(txt(this, W / 2, y0 + 66, 'Se desbloqueó para tus próximas expediciones:', 18, CSS.dim).setOrigin(0.5));
    items.forEach((d, i) => {
      layer.add(txt(this, W / 2 - 250, y0 + 90 + i * 30, `◆ ${d.tipo}: ${d.nombre}`, 20, CSS.gold));
      layer.add(txt(this, W / 2 + 250, y0 + 92 + i * 30, d.detalle, 17, CSS.bone).setOrigin(1, 0));
    });
    if (resto > 0) layer.add(txt(this, W / 2, y0 + 92 + items.length * 30, `…y ${resto} más (Grimorio → Progreso)`, 17, CSS.dim).setOrigin(0.5, 0));
    layer.add(button(this, W / 2, y0 + h - 28, 180, 36, '¡Genial!', () => layer.destroy(), { size: 21, color: UI.gold }));
  }

  create(data: { victory: boolean; by?: string }) {
    this.cameras.main.fadeIn(500);
    audio.play('menu');
    const run = Game.run!;
    this.add.rectangle(0, 0, W, H, 0x07060a).setOrigin(0);
    embers(this);
    vignette(this);

    // temas falladas en esta expedición (de peor a mejor)
    const temas = Object.entries(run.temas ?? {})
      .filter(([, t]) => t.ok < t.total)
      .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total || b[1].total - a[1].total)
      .slice(0, 3);
    const repaso = temas.length > 0;
    if (repaso) logEvent('repaso', '', '', { temas: temas.map(([c, t]) => `${c} ${t.ok}/${t.total}`) });

    // ── Conocimiento ganado (desbloqueos entre expediciones) ──
    const pisos = ((run.acto ?? 1) - 1) * (FLOORS + 1) + run.floor;
    const antes = nivelActual();
    const ganado = run.debug ? 0 : conocimientoGanado({ pisos, runasOk: run.stats.runasOk, elites: run.stats.elites, victoria: data.victory, actos: run.acto ?? 1 });
    if (ganado) addConocimiento(ganado);
    const despues = nivelActual();
    const xp = Game.codex.xp ?? 0;
    const sig = siguienteNivel(xp);
    txt(this, W / 2, 136, `+${ganado} de Conocimiento  ·  Nivel ${despues}${sig ? ` (${xp}/${sig})` : ' (máximo)'}`, 19, '#9ad8f0').setOrigin(0.5);
    const nuevos = DESBLOQUEOS.filter((d) => d.nivel > antes && d.nivel <= despues);
    if (nuevos.length) this.time.delayedCall(1600, () => this.unlockPopup(despues, nuevos));
    void nivelDe;

    if (data.victory) {
      title(this, W / 2, 70, T.final.victoria, 54);
      if (Game.codex.victorias === 1 && !run.debug) {
        const u = txt(this, W / 2, 30, '¡Desbloqueaste al Penitente del Empuje! (elígelo en tu avatar)', 20, CSS.green).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: u, alpha: 1, duration: 800, delay: 1200 });
      }
      txt(this, W / 2, 112, T.final.victoriaTexto, 22, CSS.bone).setOrigin(0.5);
      const wz = this.add.image(W - 170, 300, 'hibbelerius').setScale(3.4).setAlpha(0).setTint(0x9a8aa8);
      this.tweens.add({ targets: wz, alpha: repaso ? 0.15 : 0.9, duration: 2500, delay: 800 });
      this.tweens.add({ targets: wz, y: 292, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const alma = run.aliado ? ALMAS[run.aliado] : null;
      if (!repaso && !alma) {
        const q = txt(this, W - 170, 470, T.final.cita, 20, CSS.purple, { align: 'center' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: q, alpha: 1, duration: 1500, delay: 2600 });
      }
      if (alma) {
        const al = txt(this, W - 175, repaso ? 506 : 470, alma.final, repaso ? 16 : 19, CSS.gold, { wordWrap: { width: 320 }, align: 'center' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: al, alpha: 1, duration: 1500, delay: 3200 });
      }
    } else {
      title(this, W / 2, 70, T.final.derrota, 54, '#b8a8c8');
      txt(this, W / 2, 112, `${T.final.derrotaTexto}: ${data.by ?? '—'} · ${T.hud.piso.toLowerCase()} ${run.floor + 1}`, 22, CSS.dim).setOrigin(0.5);
    }

    panel(this, 80, 150, 520, 300);
    const tip = new Tooltip(this);
    const F = T.final.filas;
    const rows: [string, string | number][] = [
      [F[0], `${((run.acto ?? 1) - 1) * (FLOORS + 1) + run.floor}/${TOTAL_PISOS}`],
      [F[1], run.stats.combates],
      [F[2], run.stats.elites],
      [F[3], `${run.stats.runasOk}/${run.stats.runasTotal}`],
      [F[4], run.stats.ergiosTotal ?? 0],
      [F[5], run.score.toLocaleString('es-MX')],
      ['Tiempo de juego', `${Math.round((run.tiempo ?? 0) / 60)} min`],
    ];
    rows.forEach(([k, v], i) => {
      txt(this, 110, 172 + i * 40, k, 26, CSS.dim);
      const t = txt(this, 570, 172 + i * 40, String(v), 28, i === 5 ? CSS.gold : CSS.bone).setOrigin(1, 0);
      if (i === 5) {
        // desglose del puntaje (estilo arcade)
        const d = Object.entries(run.desglose ?? {}).filter(([, n]) => n !== 0).sort((a, b) => b[1] - a[1]);
        const body = d.length ? d.map(([c, n]) => `${c}: ${n > 0 ? '+' : ''}${n.toLocaleString('es-MX')}`).join('\n') : 'Sin puntos todavía.';
        const mul = gravityOf(run.gravity).scoreMul;
        const info = txt(this, 580, 178 + i * 40, 'ⓘ', 20, CSS.dim).setOrigin(0, 0);
        [t, info].forEach((o) => o.setInteractive({ useHandCursor: true })
          .on('pointerover', () => tip.show(600, 120, 'Desglose del puntaje', `${body}${mul !== 1 ? `\n(ya incluye ×${mul} por gravedad)` : ''}`))
          .on('pointerout', () => tip.hide()));
      }
    });
    if (repaso) {
      // ── repaso: los temas que fallaste, con su fórmula clave ──
      panel(this, 620, 150, 320, 330);
      txt(this, 780, 166, 'Temas para repasar', 24, CSS.gold).setOrigin(0.5, 0);
      let y = 200;
      for (const [c, t] of temas) {
        if (y > 390) break;
        const l = LECCIONES[c];
        txt(this, 636, y, l?.nombre ?? c, 20, CSS.bone);
        txt(this, 924, y + 2, `${t.ok}/${t.total}`, 18, '#e08a8a').setOrigin(1, 0);
        if (l) {
          txt(this, 636, y + 24, l.formula, 20, '#9ad8f0');
          const idea = txt(this, 636, y + 48, l.idea, 15, CSS.dim, { wordWrap: { width: 296 } });
          y += 60 + idea.height;
        } else y += 34;
      }
    } else if (!data.victory) {
      txt(this, W - 175, 200, T.final.consejo, 24, CSS.gold).setOrigin(0.5);
      txt(this, W - 175, 226, Phaser.Utils.Array.GetRandom(TIPS), 21, CSS.bone, { wordWrap: { width: 290 }, align: 'center' }).setOrigin(0.5, 0);
    }
    txt(this, 340, 466, Game.profile?.offline ? T.final.local : T.final.registrado, 20, CSS.dim).setOrigin(0.5);
    run.done = true;
    saveLocal();
    Game.run = null;
    saveLocal();
    button(this, 340, 506, 260, 44, T.final.volver, () => fadeTo(this, 'Menu'), { color: UI.gold });
  }
}
