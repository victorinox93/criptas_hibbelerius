import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { Game, saveLocal, syncRun, unlock } from '../state';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, embers, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/** La Taberna del Abismo: minijuegos para ganar Ergios (cada uno una vez por visita) */
export class TabernaScene extends Phaser.Scene {
  constructor() { super('Taberna'); }

  create(data: { floor: number }) {
    const run = Game.run!;
    const seen = (run.seen ??= []);
    const k = (j: string) => `${j}_${run.pos}`;
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    unlock('npcs', 'taberna');
    this.add.rectangle(0, 0, W, H, 0x120c08).setOrigin(0);
    const g = this.add.graphics();
    g.fillStyle(0x2a1a10, 1).fillRect(0, 330, W, H - 330); // piso de madera
    for (let x = 0; x < W; x += 60) g.lineStyle(1, 0x1a1008, 1).lineBetween(x, 330, x, H);
    g.fillStyle(0x3a2414, 1).fillRect(40, 300, 360, 30); // barra
    for (const x of [120, 520, 840]) {
      const l = this.add.circle(x, 120, 90, 0xe8a050, 0.06).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: l, alpha: 0.12, duration: 1200 + x, yoyo: true, repeat: -1 });
      this.add.image(x, 120, 'i_lantern').setScale(3.5);
    }
    embers(this);
    vignette(this);
    const tip = new Tooltip(this);
    topBar(this, tip);
    const npc = this.add.image(200, 300, 'npc_cartografa').setOrigin(0.5, 1).setScale(6).setTint(0xffd8b0);
    this.tweens.add({ targets: npc, y: 296, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.image(320, 296, 'i_jarra').setOrigin(0.5, 1).setScale(4);
    title(this, 640, 70, 'La Taberna del Abismo', 38, '#e8b070');
    txt(this, 640, 106, '«Pasa, viajero. Aquí la física se juega por monedas.»', 19, CSS.dim).setOrigin(0.5);

    const opcion = (y: number, nombre: string, desc: string, clave: string, escena: string) => {
      const hecho = seen.includes(k(clave));
      const fr = this.add.graphics();
      frame(fr, 430, y - 46, 480, 92, 0x1a120c, hecho ? UI.border : 0xd89a4a, 0.95);
      txt(this, 450, y - 36, nombre, 22, hecho ? CSS.dim : '#e8b070');
      txt(this, 450, y - 8, desc, 16, hecho ? '#5a5048' : CSS.bone, { wordWrap: { width: 300 } });
      button(this, 830, y, 130, 44, hecho ? 'Jugado' : 'Jugar', () => {
        seen.push(k(clave));
        saveLocal();
        fadeTo(this, escena, { floor: data.floor, volver: 'Taberna' });
      }, { size: 20, enabled: !hecho, color: UI.gold });
    };
    opcion(200, 'Tiro al Blanco', 'Elige ángulo y rapidez: R = v₀²·sen2θ/g. Gratis; hasta 75 Ergios si das en la diana.', 'tiro', 'TiroBlanco');
    opcion(310, 'Tira y Afloja de Newton', 'Duelo de cartas de fuerza al mejor de 3. Apuesta y gana el doble.', 'tira', 'TiraAfloja');

    button(this, 640, 470, 220, 44, 'Seguir mi camino', () => {
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      fadeTo(this, 'Map');
    }, { size: 21 });
    void T;
  }
}
