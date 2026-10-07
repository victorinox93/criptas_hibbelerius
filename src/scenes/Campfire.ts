import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W } from '../config';
import { audio } from '../audio';
import { T } from '../textos';
import { gravityOf } from '../data/gravity';
import { addCard, addEntropia, Game, logEvent, saveLocal, syncRun } from '../state';
import { ENTROPIA, PROHIBIDO_IDS, PROHIBIDOS } from '../data/abismo';
import { RELICS } from '../data/relics';
import { topBar } from '../ui/hud';
import { button, embers, fadeTo, frame, icon, title, torch, Tooltip, txt, vignette } from '../ui/widgets';

export class CampfireScene extends Phaser.Scene {
  constructor() { super('Campfire'); }

  create(data: { floor: number }) {
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    const run = Game.run!;
    this.add.rectangle(0, 0, W, 540, 0x050407).setOrigin(0);
    for (let i = 0; i < 120; i++) this.add.rectangle(Math.random() * W, Math.random() * 300, 2, 2, 0xd8d0c0, Math.random() * 0.35);
    this.add.ellipse(W / 2, 400, 700, 120, 0x100d14);
    embers(this);
    vignette(this);
    const tip = new Tooltip(this);
    topBar(this, tip);
    title(this, W / 2, 80, T.fogata.titulo, 50);
    txt(this, W / 2, 118, T.fogata.texto, 22, CSS.dim).setOrigin(0.5);

    torch(this, W / 2, 330);
    this.add.image(W / 2, 360, 'i_fire').setScale(7);
    const hero = this.add.image(W / 2 - 150, 340, 'hero').setScale(2.5);
    this.tweens.add({ targets: hero, y: 336, duration: 1100, yoyo: true, repeat: -1 });

    const sinCura = run.relics.includes('agujero');
    const prohib = run.prohibidos ?? [];
    const omega = prohib.includes('p_omega');
    const heal = sinCura ? 0 : Math.round(run.maxHp * gravityOf(run.gravity).heal * (omega ? 0.5 : 1));
    const calma = prohib.includes('p_abismo') ? 0 : ENTROPIA.fogata;
    const libro = run.relics.includes('necronomicon') && PROHIBIDO_IDS.some((id) => !prohib.includes(id));
    // con el Necronomicón hay 3 opciones
    const xs = libro ? [W / 2 - 300, W / 2, W / 2 + 300] : [W / 2 - 170, W / 2 + 170];
    const bw = libro ? 280 : 300;
    const salir = () => {
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      fadeTo(this, 'Map');
    };
    const ent = (run.entropia ?? 0) > 0 && calma ? `, ${calma} Locura` : '';
    button(this, xs[0], 470, bw, 64, sinCura ? `El Agujero Negro\nse traga el descanso${ent ? `\n(${ent.slice(2)})` : ''}` : `${T.fogata.descansar}\n+${Math.min(heal, run.maxHp - run.hp)} de vida${ent}`, () => {
      audio.sfx('heal');
      run.hp = Math.min(run.maxHp, run.hp + heal);
      addEntropia(calma);
      logEvent('fogata', '', '', { opcion: 'descansar' });
      salir();
    }, { color: UI.blood, size: 20 });
    const canUp = run.deck.some((c) => !c.up);
    button(this, xs[1], 470, bw, 64, T.fogata.estudiar, () => {
      fadeTo(this, 'Rune', { floor: data.floor, source: 'fogata' });
    }, { color: 0x8e5bb0, size: 22, enabled: canUp });
    if (libro) {
      const b = button(this, xs[2], 470, bw, 64, `Leer el Necronomicón\n+${ENTROPIA.leer} Locura`, () => this.leer(salir), { color: 0x3d6a22, size: 20 });
      tip.attach(b, RELICS.necronomicon.name, 'Eliges un Problema Prohibido: poder permanente con un costo. Tu Locura sube.');
    }
  }

  /** Lee un Problema Prohibido (elige 1 de 2 al azar) */
  private leer(salir: () => void) {
    const run = Game.run!;
    const prohib = (run.prohibidos ??= []);
    const opts = Phaser.Utils.Array.Shuffle(PROHIBIDO_IDS.filter((id) => !prohib.includes(id))).slice(0, 2);
    audio.sfx('wrong');
    this.cameras.main.shake(400, 0.006);
    const layer = this.add.container(0, 0).setDepth(900);
    layer.add(this.add.rectangle(0, 0, W, 540, 0x030604, 0.96).setOrigin(0).setInteractive());
    layer.add(title(this, W / 2, 56, 'Necronomicón de Hibbeler', 38, '#9bf07a'));
    layer.add(txt(this, W / 2, 92, 'Las páginas pasan solas. Dos problemas te miran. Elige uno… o cierra el libro.', 19, CSS.dim).setOrigin(0.5));
    opts.forEach((id, i) => {
      const d = PROHIBIDOS[id];
      const x = W / 2 + (i - (opts.length - 1) / 2) * 400;
      const g = this.add.graphics();
      const draw = (hi: boolean) => { g.clear(); frame(g, x - 180, 124, 360, 320, 0x070a07, hi ? 0x9bf07a : 0x3d4a22, 0.98); };
      draw(false);
      layer.add([g, icon(this, x, 168, 'i_necro', 5),
        txt(this, x, 204, d.name, 20, '#9bf07a', { align: 'center', wordWrap: { width: 330 } }).setOrigin(0.5, 0),
        txt(this, x, 262, d.poder, 18, CSS.bone, { align: 'center', wordWrap: { width: 330 } }).setOrigin(0.5, 0),
        txt(this, x, 318, `Costo: ${d.costo}`, 17, '#e08a8a', { align: 'center', wordWrap: { width: 330 } }).setOrigin(0.5, 0),
        txt(this, x, 370, d.lore, 15, '#6a7a5a', { align: 'center', wordWrap: { width: 330 } }).setOrigin(0.5, 0)]);
      const z = this.add.zone(x - 180, 124, 360, 320).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerover', () => draw(true));
      z.on('pointerout', () => draw(false));
      z.on('pointerdown', () => {
        prohib.push(id);
        if (id === 'p_infinito') { run.maxHp = Math.max(10, run.maxHp - 10); run.hp = Math.min(run.hp, run.maxHp); }
        if (id === 'p_energia') { addCard('errorSigno'); addCard('errorSigno'); }
        addEntropia(ENTROPIA.leer);
        logEvent('prohibido', '', '', { id, entropia: run.entropia });
        this.cameras.main.flash(500, 60, 200, 80);
        salir();
      });
      layer.add(z);
    });
    layer.add(button(this, W / 2, 486, 220, 40, 'Cerrar el libro', () => layer.destroy(), { size: 19 }));
  }
}
