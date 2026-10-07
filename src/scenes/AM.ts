import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { AM_PACTO_RUNAS, PACTO_AM, PREGUNTAS_AM, saludoAM } from '../data/am';
import { cardName } from '../data/cards';
import { addEntropia, Game, logEvent, saveLocal, syncRun, unlock } from '../state';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, Btn, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';

const ROJO = '#ff5a4a';

/** AM: la inteligencia artificial de las criptas (datos y explicación en src/data/am.ts) */
export class AMScene extends Phaser.Scene {
  private hud!: ReturnType<typeof topBar>;
  private texto!: Phaser.GameObjects.Text;
  private btns: Btn[] = [];

  constructor() { super('AM'); }

  create(data: { floor: number }) {
    const run = Game.run!;
    const mem = (Game.codex.am ??= { visitas: 0, pactos: 0, rechazos: 0, vistas: [] });
    this.cameras.main.fadeIn(800);
    audio.play('jefe3');
    unlock('npcs', 'am');
    saveLocal();

    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0);
    // líneas de barrido (monitor viejo)
    const scan = this.add.graphics().setDepth(50);
    for (let y = 0; y < H; y += 4) scan.fillStyle(0x000000, 0.25).fillRect(0, y, W, 2);
    const glow = this.add.circle(220, 300, 160, 0xff2a1a, 0.06).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.14, scale: 1.1, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const mono = this.add.image(220, 440, 'npc_am').setOrigin(0.5, 1).setScale(12);
    this.tweens.add({ targets: mono, alpha: 0.85, duration: 120, yoyo: true, repeat: -1, repeatDelay: 2600 });
    txt(this, 220, 460, 'A M', 26, ROJO).setOrigin(0.5);
    const tip = new Tooltip(this);
    this.hud = topBar(this, tip);
    title(this, W / 2 + 120, 62, 'AM', 40, ROJO);

    const g = this.add.graphics();
    frame(g, 420, 92, 510, 250, 0x080303, 0x6a1a14, 0.96);
    this.texto = txt(this, 438, 102, '', 18, ROJO, { wordWrap: { width: 474 }, lineSpacing: 2 });

    const alias = Game.profile?.avatar?.alias ?? 'humano';
    // pregunta que no hayas visto (o la menos reciente)
    const vistas = mem.vistas ?? [];
    const libres = PREGUNTAS_AM.map((_, i) => i).filter((i) => !vistas.includes(i));
    const qi = libres.length ? Phaser.Utils.Array.GetRandom(libres) : vistas[0];
    const P = PREGUNTAS_AM[qi];

    this.escribir(`${saludoAM(mem.visitas, alias, mem.ultima, mem.pactos)}\n\n«${P.q}»`, () => {
      const orden = Phaser.Utils.Array.Shuffle(P.opciones.map((_, i) => i));
      orden.forEach((i, k) => {
        const b = button(this, 675, 378 + k * 46, 510, 40, P.opciones[i][0], () => {
          this.limpiar();
          mem.visitas++;
          mem.ultima = P.opciones[i][0];
          mem.vistas = [...vistas.filter((v) => v !== qi), qi];
          saveLocal();
          logEvent('am', '', '', { pregunta: P.q, respuesta: P.opciones[i][0], visita: mem.visitas });
          this.escribir(`«${P.opciones[i][1]}»\n\n${PACTO_AM.oferta}`, () => this.pacto(data.floor));
        }, { size: 17 });
        if (b.label.width > 490) b.label.setFontSize(15);
        this.btns.push(b);
      });
    });
  }

  private pacto(floor: number) {
    const run = Game.run!;
    const mem = Game.codex.am!;
    this.btns.push(button(this, 560, 400, 260, 46, 'Aceptar el pacto', () => {
      this.limpiar();
      run.amPacto = (run.amPacto ?? 0) + AM_PACTO_RUNAS;
      mem.pactos++;
      saveLocal();
      logEvent('am_pacto', '', true, { runas: run.amPacto });
      audio.sfx('wrong');
      this.cameras.main.flash(400, 120, 0, 0);
      this.escribir(`${PACTO_AM.acepta}\n\n(En tus próximas ${AM_PACTO_RUNAS} runas aparecerá el botón «Que AM lo resuelva».)`, () => this.salir(floor));
    }, { color: 0x9a2a1a, size: 20 }));
    this.btns.push(button(this, 820, 400, 200, 46, 'Rechazarlo', () => {
      this.limpiar();
      mem.rechazos++;
      // un regalo para los que piensan: mejora una carta y aclara la mente
      const cands = run.deck.filter((c) => !c.up);
      const c = cands.length ? Phaser.Utils.Array.GetRandom(cands) : null;
      if (c) c.up = true;
      addEntropia(-10);
      saveLocal();
      this.hud.refresh();
      logEvent('am_pacto', '', false, { mejora: c?.id ?? '' });
      audio.sfx('correct');
      this.escribir(`${PACTO_AM.rechaza}\n\n${c ? `Tu carta «${cardName(c)}» mejoró.` : ''} −10 de Locura.`, () => this.salir(floor));
    }, { color: UI.green, size: 20 }));
  }

  private salir(floor: number) {
    this.btns.push(button(this, 675, 470, 220, 44, T.runa.continuar, () => {
      const run = Game.run!;
      run.floor = floor + 1;
      saveLocal();
      syncRun('en curso');
      fadeTo(this, 'Map');
    }, { size: 22, color: UI.gold }));
  }

  private limpiar() {
    this.btns.forEach((b) => b.destroy());
    this.btns = [];
  }

  /** Texto que se escribe letra por letra, como en una terminal */
  private escribir(s: string, done: () => void) {
    this.texto.setText('');
    let i = 0;
    const ev = this.time.addEvent({
      delay: 18, repeat: s.length - 1,
      callback: () => {
        i++;
        this.texto.setText(s.slice(0, i) + (i < s.length ? '▌' : ''));
        if (i % 5 === 0) audio.sfx('hover');
        if (i >= s.length) done();
      },
    });
    // clic para mostrar todo de una vez
    this.time.delayedCall(150, () => this.input.once('pointerdown', () => {
      if (i >= s.length) return;
      ev.remove();
      i = s.length;
      this.texto.setText(s);
      done();
    }));
  }
}
