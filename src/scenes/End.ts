import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { FORM_URL, W, H } from '../config';
import { audio } from '../audio';
import { T } from '../textos';
import { MOMENTUM_JEFES } from '../data/tienda';
import { addConocimiento, codexFlag, contarExpedicion, expediciones, ganarMomentum, FLOORS, Game, logEvent, nivelActual, PISOS_NUCLEO, saveLocal, TOTAL_PISOS } from '../state';
import { conocimientoGanado, DESBLOQUEOS, nivelDe, siguienteNivel } from '../data/progreso';
import { LECCIONES } from '../data/lecciones';
import { ALMAS } from '../data/almas';
import { epilogoAlma } from '../art/epilogos';
import { button, embers, fadeTo, panel, title, Tooltip, txt, vignette } from '../ui/widgets';
import { gravityOf } from '../data/gravity';

const TIPS = T.final.consejos;

export class EndScene extends Phaser.Scene {
  constructor() { super('End'); }

  /** Epílogo del alma aliada a pantalla completa (sale siempre que ganas con un alma, también con repaso) */
  private epilogo(id: string, nombre: string, final: string, despues: () => void) {
    const layer = this.add.container(0, 0).setDepth(850);
    layer.add(this.add.rectangle(0, 0, W, H, 0x050407, 0.97).setOrigin(0).setInteractive());
    layer.add(txt(this, W / 2, 46, 'Epílogo', 22, CSS.dim).setOrigin(0.5));
    layer.add(title(this, W / 2, 86, nombre, 38));
    const k = 1.5, x = W / 2, y = 330;
    const c = epilogoAlma(this, id, x, y);
    if (c) { c.setScale(k).setPosition(x - k * x, y - k * y + 10); layer.add(c); }
    const t = txt(this, W / 2, 400, final, 22, CSS.gold, { align: 'center', wordWrap: { width: 720 } }).setOrigin(0.5, 0).setAlpha(0);
    layer.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 1200, delay: 2600 });
    const b = button(this, W / 2, 500, 220, 42, T.runa.continuar, () => { layer.destroy(); despues(); }, { size: 21, color: UI.gold });
    b.setAlpha(0);
    layer.add(b);
    this.tweens.add({ targets: b, alpha: 1, duration: 600, delay: 3000 });
  }

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

  create(data: { victory: boolean; by?: string; nucleo?: 'am' | 'caido'; primeraAM?: boolean }) {
    this.cameras.main.fadeIn(500);
    audio.play('menu');
    const run = Game.run!;
    codexFlag('primera'); // ya terminó (o perdió) su primera expedición
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
    const sig = siguienteNivel(xp, nivelActual());
    txt(this, W / 2, 136, `+${ganado} de Conocimiento  ·  Nivel ${despues}${sig ? ` (${xp}/${sig})` : ' (máximo)'}`, 19, '#9ad8f0').setOrigin(0.5);
    const nuevos = DESBLOQUEOS.filter((d) => d.nivel > antes && d.nivel <= despues);
    // si hay epílogo de alma, el aviso de nivel espera a que lo cierres
    const almaFin = data.victory && run.aliado ? ALMAS[run.aliado] : null;
    const popup = () => { if (nuevos.length) this.time.delayedCall(almaFin ? 400 : 1600, () => this.unlockPopup(despues, nuevos)); };
    if (!almaFin) popup();
    void nivelDe;

    // ── contador de expediciones (la primera abre la Tienda de Layla) ──
    const primera = !run.debug && expediciones() === 0;
    if (!run.debug) contarExpedicion();
    if (primera) {
      const lt = txt(this, 340, 470, '🐾 Layla abrió su tienda en el menú principal', 17, '#f0b070').setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: lt, alpha: 1, duration: 800, delay: 2400 });
    }
    // ── Momentum (Tienda de Layla): por jefes vencidos en esta expedición ──
    const jefes = data.victory ? (data.nucleo === 'am' ? 4 : 3) : Math.max(0, (run.acto ?? 1) - 1);
    const mom = run.debug ? 0 : MOMENTUM_JEFES[Math.min(4, jefes)] ?? 0;
    if (mom) {
      ganarMomentum(mom);
      const mt = txt(this, 340, 446, `+${mom} ◈ Momentum para la Tienda de Layla`, 18, '#f0b070').setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: mt, alpha: 1, duration: 800, delay: 1800 });
    }
    // ── logros (cosméticos del Vestidor) ──
    if (!run.debug) {
      if (run.stats.runasOk >= 15) codexFlag('logro_erudito');
      if (data.victory && run.aliado) codexFlag('logro_alma');
      if (data.victory && (run.entropiaMax ?? run.entropia ?? 0) < 40) codexFlag('logro_lucido');
    }
    if (data.victory) {
      const nuc = data.nucleo;
      title(this, W / 2, 70, nuc === 'am' ? '¡AM ha caído!' : nuc === 'caido' ? 'Venciste a Hibbelerius…' : T.final.victoria, 54, nuc === 'caido' ? '#e0a070' : undefined);
      if (data.primeraAM) {
        const u = txt(this, W / 2, 26, '¡Desbloqueaste: cartas de cálculo (Derivada, Integral, Límite), cosméticos de latón e insignia de AM!', 17, CSS.green, { align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: u, alpha: 1, duration: 800, delay: 1200 });
      } else if (Game.codex.victorias === 1 && !run.debug) {
        const u = txt(this, W / 2, 30, '¡Desbloqueaste al Penitente del Empuje! (elígelo en tu avatar)', 20, CSS.green).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: u, alpha: 1, duration: 800, delay: 1200 });
      }
      txt(this, W / 2, 112, nuc === 'am' ? 'Los engranes del Núcleo se detienen. Por primera vez, AM no calcula nada.'
        : nuc === 'caido' ? `…pero el Núcleo del Cálculo te consumió (${data.by ?? 'AM'}).` : T.final.victoriaTexto, 22, nuc === 'caido' ? CSS.dim : CSS.bone).setOrigin(0.5);
      const alma = run.aliado ? ALMAS[run.aliado] : null;
      const wz = this.add.image(W - 170, nuc ? 330 : 300, nuc ? 'am_jefe' : 'hibbelerius').setScale(3.4).setAlpha(0).setTint(0x9a8aa8);
      this.tweens.add({ targets: wz, alpha: repaso ? 0.15 : alma ? 0.22 : 0.9, duration: 2500, delay: 800 });
      this.tweens.add({ targets: wz, y: 292, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      // epílogo ilustrado del alma aliada
      if (alma) this.epilogo(alma.id, alma.name, alma.final, popup);
      if (alma && !repaso) epilogoAlma(this, alma.id, W - 175, 412);
      if (nuc === 'am') wz.setTint(0x6a5a5a);
      if (!repaso && !alma) {
        const cita = nuc === 'am' ? '«Odio… odio… od…»\n— AM, por última vez' : nuc === 'caido' ? '«Ahora eres mío.\nTenemos toda la eternidad\npara repasar.»\n— AM' : (Game.codex.hib ?? 0) === 1 && !run.debug ? `${T.final.cita}\n\nDetrás del tomo, algo hace tic-tac…` : T.final.cita;
        const q = txt(this, W - 170, cita.split('\n').length > 5 ? 432 : 470, cita, 20, CSS.purple, { align: 'center' }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: q, alpha: 1, duration: 1500, delay: 2600 });
      }
      if (alma && !(repaso && FORM_URL)) {
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
      [F[0], (run.acto ?? 1) >= 4 ? `${TOTAL_PISOS}/${TOTAL_PISOS} + Núcleo ${run.floor + 1}/${PISOS_NUCLEO + 1}` : `${((run.acto ?? 1) - 1) * (FLOORS + 1) + run.floor}/${TOTAL_PISOS}`],
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
    if (FORM_URL) {
      button(this, W - 175, 506, 280, 40, '✎ Danos tu opinión', () => window.open(FORM_URL, '_blank'), { size: 20, color: UI.green });
    }
  }
}
