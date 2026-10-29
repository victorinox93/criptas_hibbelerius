import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CARDS } from '../data/cards';
import { maldicionesEnMazo, quitarDelMazo } from '../data/maldiciones';
import { addEntropia, Game, logEvent, saveLocal, syncRun, unlock } from '../state';
import { T } from '../textos';
import { cardView } from '../ui/card';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/** Ergios que cobra por cada maldición después de la primera (la primera es gratis) */
export const MAXWELL_EXTRA = 20;

/**
 * v0.71 · EL DEMONIO DE MAXWELL (nodo «?», ambos modos).
 * Un diablillo que abre una puertita sólo a las moléculas rápidas: ordena… y así baja la entropía.
 * Aquí ordena tu mazo: te quita maldiciones (la primera gratis). Si no traes ninguna, ordena tus ideas.
 * Después de conocerlo te espera en las fogatas (src/scenes/Campfire.ts), donde cobra por cada una.
 */
export class MaxwellScene extends Phaser.Scene {
  constructor() { super('Maxwell'); }

  create(data: { floor: number }) {
    const run = Game.run!;
    this.cameras.main.fadeIn(400);
    audio.play('calma');
    unlock('npcs', 'maxwell');
    this.add.rectangle(0, 0, W, H, 0x08070c).setOrigin(0);
    // la caja con la puertita: lado caliente (rojo) y lado frío (azul)
    const g = this.add.graphics();
    g.fillStyle(0x2a0e0e, 1).fillRect(60, 170, 200, 260);
    g.fillStyle(0x0e1a2e, 1).fillRect(260, 170, 200, 260);
    g.lineStyle(4, 0x8a8296, 1).strokeRect(60, 170, 400, 260).lineBetween(260, 170, 260, 260).lineBetween(260, 340, 260, 430);
    for (let i = 0; i < 26; i++) {
      const izq = i % 2 === 0;
      const p = this.add.circle(izq ? Phaser.Math.Between(75, 245) : Phaser.Math.Between(275, 445), Phaser.Math.Between(185, 415), 4, izq ? 0xff7a4a : 0x6ab0ff);
      this.tweens.add({ targets: p, x: p.x + Phaser.Math.Between(-30, 30), y: p.y + Phaser.Math.Between(-30, 30), duration: izq ? 600 : 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    const demon = this.add.image(260, 300, 'npc_maxwell').setScale(6);
    this.tweens.add({ targets: demon, y: 294, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    vignette(this);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);
    title(this, W / 2, 70, 'El Demonio de Maxwell', 36, '#e8c890');
    txt(this, 260, 446, 'Lado caliente · lado frío', 15, CSS.dim).setOrigin(0.5, 0);

    const hab = this.add.graphics();
    frame(hab, 500, 112, 420, 118, 0x0e0b12, UI.border, 0.95);
    const habla = txt(this, 516, 124, '', 17, CSS.bone, { wordWrap: { width: 390 }, lineSpacing: 2 });
    const zona = this.add.container(0, 0);
    let gratis = 1;
    let ordeno = false;

    const dibujar = () => {
      zona.removeAll(true);
      const idx = maldicionesEnMazo();
      if (!idx.length) {
        habla.setText(ordeno
          ? '«Listo. Menos desorden, menos entropía. Alguien en el universo pagó por eso… pero no fuiste tú.»'
          : '«Abro la puertita sólo a lo rápido y dejo fuera lo lento. Así baja la entropía. Hoy no traes maldiciones… ¿ordeno tus ideas?»');
        if (!ordeno) {
          const abismo = run.modo === 'abismo';
          zona.add(button(this, 710, 300, 330, 52, abismo ? 'Ordenar tus ideas\n−10 de Locura' : 'Ordenar tus ideas\n+10 de vida', () => {
            ordeno = true;
            if (abismo) addEntropia(-10);
            else run.hp = Math.min(run.maxHp, run.hp + 10);
            audio.sfx('heal');
            logEvent('maxwell', '', '', { opcion: 'ordenar' });
            hud.refresh();
            dibujar();
          }, { size: 19, color: 0x4a6a9a }));
        }
        return;
      }
      habla.setText(`«Uy, cuánto desorden. Traes ${idx.length} maldición(es). La primera te la saco gratis; las demás, ${MAXWELL_EXTRA} ${T.moneda} cada una. La energía no se ordena sola.»`);
      idx.slice(0, 5).forEach((i, k) => {
        const inst = run.deck[i];
        const x = 560 + k * 92;
        const v = cardView(this, x, 330, inst).setScale(0.5);
        v.setInteractive({ useHandCursor: true });
        v.on('pointerover', () => { v.setScale(0.56); tip.show(x, 420, CARDS[inst.id].name, `${CARDS[inst.id].text(CARDS[inst.id].stats(false), { masaBonus: 0, acelBonus: 0, friccion: 0 })}\n\nClic para quitarla${gratis ? ' (gratis)' : ` (${MAXWELL_EXTRA} ${T.moneda})`}.`); });
        v.on('pointerout', () => { v.setScale(0.5); tip.hide(); });
        v.on('pointerdown', () => {
          tip.hide();
          if (!gratis && run.ergios < MAXWELL_EXTRA) { audio.sfx('wrong'); habla.setText(`«Sin ${MAXWELL_EXTRA} ${T.moneda} no hay puertita. Así es la termodinámica.»`); return; }
          if (gratis) gratis--;
          else run.ergios -= MAXWELL_EXTRA;
          const nom = quitarDelMazo(i);
          audio.sfx('heal');
          this.cameras.main.flash(250, 120, 160, 255);
          logEvent('maxwell', '', '', { quita: inst.id });
          hud.refresh();
          dibujar();
          habla.setText(`«Fuera: ${nom}. ¿Otra?»`);
        });
        zona.add(v);
      });
      if (idx.length > 5) zona.add(txt(this, 710, 420, `…y ${idx.length - 5} más`, 16, CSS.dim).setOrigin(0.5, 0));
    };
    dibujar();

    txt(this, W / 2, 468, 'En lo que queda de esta expedición, el Demonio de Maxwell te espera en las fogatas.', 16, '#9ad8f0').setOrigin(0.5);
    button(this, W / 2, 508, 220, 40, 'Volver al mapa', () => {
      run.maxwell = true;
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      fadeTo(this, 'Map');
    }, { size: 20, color: UI.gold });
  }
}
