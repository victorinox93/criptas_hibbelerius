import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { ALMA_CONSUELO, ALMAS } from '../data/almas';
import { PUNTOS, sumar } from '../data/puntaje';
import { addErgios, Game, logEvent, saveLocal, syncRun, unlock } from '../state';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, Btn, embers, fadeTo, frame, mist, title, Tooltip, txt, vignette } from '../ui/widgets';

/**
 * Alma en pena (estilo «Souls»): cuenta su historia y te hace una pregunta
 * filosófica. Si contestas con compasión o le ayudas, se vuelve tu aliado
 * (sólo uno por expedición). Datos en src/data/almas.ts.
 */
export class AlmaScene extends Phaser.Scene {
  private hud!: ReturnType<typeof topBar>;

  constructor() { super('Alma'); }

  create(data: { floor: number; id: string }) {
    const a = ALMAS[data.id] ?? Object.values(ALMAS)[0];
    const run = Game.run!;
    this.cameras.main.fadeIn(600);
    audio.play('calma');
    unlock('npcs', `alma_${a.id}`);
    saveLocal();

    this.add.rectangle(0, 0, W, H, 0x040306).setOrigin(0);
    const fl = this.add.graphics();
    fl.fillStyle(0x0c0a10, 1).fillEllipse(220, 392, 380, 70);
    const glow = this.add.circle(240, 300, 130, 0xc8b070, 0.05).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.11, duration: 2200, yoyo: true, repeat: -1 });
    mist(this, 360);
    embers(this);
    vignette(this);
    const tip = new Tooltip(this);
    this.hud = topBar(this, tip);

    // el fantasma: translúcido, con un halo dorado como las señales de invocación
    const ghost = this.add.image(250, 388, `alma_${a.id}`).setOrigin(0.5, 1).setScale(4).setAlpha(0.78);
    const halo = this.add.image(250, 388, `alma_${a.id}`).setOrigin(0.5, 1).setScale(4.15).setTintFill(0xe8c15a).setAlpha(0.12).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: [ghost, halo], y: 380, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: ghost, alpha: 0.6, duration: 1300, yoyo: true, repeat: -1 });
    const hero = this.add.image(80, 390, 'hero').setOrigin(0.5, 1).setScale(2);
    this.tweens.add({ targets: hero, y: 387, duration: 1100, yoyo: true, repeat: -1 });
    txt(this, 250, 410, 'Alma en pena', 17, CSS.dim).setOrigin(0.5);

    title(this, W / 2, 62, a.name, 38, '#d8c8a0');
    const g = this.add.graphics();
    frame(g, 450, 96, 480, 158, 0x0b090e, UI.border, 0.95);
    txt(this, 466, 106, a.intro, 17, CSS.bone, { wordWrap: { width: 448 }, lineSpacing: 1 });
    const q = txt(this, 690, 264, a.pregunta, 19, CSS.gold, { wordWrap: { width: 470 }, align: 'center' }).setOrigin(0.5, 0);

    const btns: Btn[] = [];
    const done = (ok: boolean, via: string) => {
      btns.forEach((b) => b.destroy());
      q.setAlpha(0.5);
      this.resolve(a.id, ok, via, data.floor);
    };
    // las opciones salen en orden al azar
    const orden = Phaser.Utils.Array.Shuffle(a.opciones.map((_, i) => i));
    orden.forEach((i, k) => {
      const op = a.opciones[i];
      const b = button(this, 690, 334 + k * 48, 480, 42, '', () => done(i === a.correcta, `respuesta ${i + 1}`), { size: 17 });
      b.label.setText(op).setWordWrapWidth(460).setAlign('center');
      if (b.label.height > 40) b.label.setFontSize(15);
      btns.push(b);
    });
    const h = a.ayuda;
    const puede = (h.ergios ?? 0) <= run.ergios && (h.hp ?? 0) < run.hp && (!h.pocion || (run.pociones ?? []).length > 0);
    const help = button(this, 600, 492, 300, 40, h.label, () => {
      if (h.ergios) addErgios(-h.ergios);
      if (h.hp) run.hp -= h.hp;
      if (h.pocion) run.pociones!.splice(0, 1);
      done(true, 'ayuda');
    }, { size: 16, enabled: puede, color: UI.gold });
    btns.push(help);
    btns.push(button(this, 850, 492, 150, 40, 'Seguir', () => {
      logEvent('alma', '', '', { id: a.id, via: 'ignorada' });
      this.leave(data.floor);
    }, { size: 18 }));
    void tip;
  }

  private resolve(id: string, ok: boolean, via: string, floor: number) {
    const a = ALMAS[id];
    const run = Game.run!;
    let msg: string;
    let extra = '';
    if (!ok) {
      msg = a.triste;
      audio.sfx('wrong');
    } else if (run.aliado) {
      msg = a.yaTienes;
      addErgios(ALMA_CONSUELO);
      extra = `+${ALMA_CONSUELO} ${T.moneda}`;
      audio.sfx('coin');
    } else {
      run.aliado = id;
      msg = a.gracias;
      extra = `¡${a.name} es tu aliado!\nPelea a tu lado en élites y jefes: ${a.habilidad}\n(Sólo puedes tener un aliado en toda la expedición.)`;
      sumar(run, 'Almas en pena', PUNTOS.alma);
      audio.sfx('victory');
      this.cameras.main.flash(500, 232, 193, 90);
    }
    logEvent('alma', '', ok, { id, via, aliado: run.aliado ?? '' });
    this.hud.refresh();
    const g = this.add.graphics();
    frame(g, 450, 320, 480, 150, 0x0b090e, ok ? 0xc8a050 : 0x6a5a6a, 0.95);
    txt(this, 466, 330, msg, 17, ok ? CSS.bone : CSS.dim, { wordWrap: { width: 448 }, lineSpacing: 1 });
    if (extra) txt(this, 466, 400, extra, 16, CSS.gold, { wordWrap: { width: 448 } });
    button(this, 690, 500, 220, 42, T.runa.continuar, () => this.leave(floor), { size: 22, color: UI.gold });
  }

  private leave(floor: number) {
    const run = Game.run!;
    run.floor = floor + 1;
    saveLocal();
    syncRun('en curso');
    fadeTo(this, 'Map');
  }
}
void H;
