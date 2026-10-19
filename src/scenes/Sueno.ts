import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { RELATO, SUENOS, suenosNuevos } from '../data/relatos';
import { codexFlag, Game, logEvent, saveLocal, syncRun } from '../state';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';
import { darDiente } from './Relato';

/**
 * v0.51 · LAS TIERRAS DEL SUEÑO (nodo 🌙 del Abismo).
 *  · fase 'entrar': te quedas dormido y eliges una de tres puertas (cada una es un sueño de
 *    src/data/relatos.ts → SUENOS, que se juega en la escena Relato).
 *  · fase 'despertar': vuelves de una pesadilla (src/scenes/Combat.ts → this.sueno).
 *    La vida que perdiste en el sueño ya se te devolvió; aquí se da el premio.
 */
export class SuenoScene extends Phaser.Scene {
  constructor() { super('Sueno'); }

  create(data: { floor: number; fase?: 'entrar' | 'despertar'; gano?: boolean; combate?: string; recupera?: number }) {
    const run = Game.run!;
    this.cameras.main.fadeIn(600);
    audio.play('abismo2');
    this.fondo();
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);
    if (data.fase === 'despertar') return this.despertar(data, hud);

    title(this, W / 2, 84, 'Las Tierras del Sueño', 40, '#c8b8ff');
    txt(this, W / 2, 124, 'Te quedas dormido junto a la dentadura. Bajas una escalera de mármol que no estaba ahí…\nal fondo hay tres puertas. Detrás de cada una, un sueño.', 18, '#b8a8d8', { align: 'center' }).setOrigin(0.5, 0);
    const vistos = Game.codex.suenos ?? [];
    txt(this, W / 2, 178, `Sueños soñados: ${vistos.length}/${SUENOS.length}   ·   En una pesadilla la vida que pierdes no es real; la Cordura, sí.`, 15, '#8a7ab0').setOrigin(0.5, 0);

    // tres puertas: primero los sueños que nunca has soñado
    const enRun = (run.seen ?? []).filter((x) => x.startsWith('relato_')).map((x) => x.slice(7));
    const nuevos = Phaser.Utils.Array.Shuffle(suenosNuevos(vistos).filter((r) => !enRun.includes(r.id)));
    const resto = Phaser.Utils.Array.Shuffle(SUENOS.filter((r) => !nuevos.includes(r) && !enRun.includes(r.id)));
    const puertas = [...nuevos, ...resto, ...Phaser.Utils.Array.Shuffle([...SUENOS])].filter((r, i, a) => a.indexOf(r) === i).slice(0, 3);
    puertas.forEach((rel, i) => {
      const x = W / 2 + (i - 1) * 270;
      const y = 350;
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      // el arco de la puerta
      g.fillStyle(0x120c22, 0.95).fillRoundedRect(-105, -110, 210, 250, { tl: 100, tr: 100, bl: 6, br: 6 });
      g.lineStyle(3, rel.tinte, 0.9).strokeRoundedRect(-105, -110, 210, 250, { tl: 100, tr: 100, bl: 6, br: 6 });
      g.fillStyle(rel.tinte, 0.08).fillCircle(0, -20, 70);
      const ic = this.add.image(0, -40, rel.icono).setScale(6).setTint(rel.tinte);
      this.tweens.add({ targets: ic, y: -48, duration: 1500 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const t1 = txt(this, 0, 22, rel.titulo, 17, '#e8dcff', { align: 'center', wordWrap: { width: 190 } }).setOrigin(0.5, 0);
      const t2 = txt(this, 0, 22 + t1.height + 6, `«${rel.obra}»\nLovecraft (${rel.anio})`, 14, '#9a8ac0', { align: 'center' }).setOrigin(0.5, 0);
      c.add([g, ic, t1, t2]);
      if (!vistos.includes(rel.id)) c.add(txt(this, 0, -100, '✦ nuevo', 15, CSS.gold).setOrigin(0.5, 0));
      c.setSize(210, 250).setInteractive({ useHandCursor: true });
      c.on('pointerover', () => { audio.sfx('hover'); this.tweens.add({ targets: c, scale: 1.05, duration: 120 }); });
      c.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 120 }));
      c.on('pointerdown', () => {
        audio.sfx('card');
        (run.seen ??= []).push(`relato_${rel.id}`);
        logEvent('sueno', '', true, { id: rel.id, piso: data.floor });
        saveLocal();
        fadeTo(this, 'Relato', { floor: data.floor, id: rel.id });
      });
    });
    void hud;
  }

  /** Cielo nocturno violeta con estrellas que parpadean */
  private fondo() {
    this.add.rectangle(0, 0, W, H, 0x0a0618).setOrigin(0);
    const g = this.add.graphics();
    for (let i = 0; i < 6; i++) g.fillStyle(0x2a1a4a, 0.18).fillEllipse(Math.random() * W, 120 + Math.random() * 360, 380, 60);
    for (let i = 0; i < 70; i++) {
      const s = this.add.circle(Math.random() * W, 50 + Math.random() * (H - 60), Math.random() < 0.15 ? 2 : 1, 0xe8dcff, 0.3 + Math.random() * 0.6);
      this.tweens.add({ targets: s, alpha: 0.1, duration: 800 + Math.random() * 1800, yoyo: true, repeat: -1, delay: Math.random() * 1500 });
    }
    // la escalera de mármol
    const e = this.add.graphics();
    for (let k = 0; k < 7; k++) e.fillStyle(0xd8d0e8, 0.04 + k * 0.012).fillRect(W / 2 - 60 - k * 22, H - 18 - k * 9, 120 + k * 44, 7);
    vignette(this);
  }

  private despertar(data: { floor: number; gano?: boolean; combate?: string; recupera?: number }, hud: { refresh: () => void }) {
    const run = Game.run!;
    title(this, W / 2, 110, data.gano ? 'Despiertas' : 'Despiertas sudando', 42, '#c8b8ff');
    const g = this.add.graphics();
    frame(g, W / 2 - 300, 170, 600, 230, 0x0e0a1c, 0x5a4aa8, 0.96);
    const lineas: string[] = [];
    if (data.gano) {
      lineas.push(data.combate === 'bokrug'
        ? 'Bokrug se hunde en su lago con el ídolo. En tu mano, al despertar, queda algo verde y frío.'
        : 'El sueño se deshace como niebla. Algo que ganaste allá abajo vino contigo.');
      const premio = darDiente(data.combate === 'bokrug' ? 'legendario' : 'raro');
      lineas.push('', premio);
      if (data.combate === 'bokrug' && !run.debug) codexFlag('abismo_vence_bokrug');
    } else {
      lineas.push('Perdiste dentro del sueño… pero sólo era un sueño.', '', 'El susto te cuesta 15 de Cordura.');
    }
    if (data.recupera) lineas.push('', `La vida que perdiste en el sueño no era real: recuperas ${data.recupera}.`);
    txt(this, W / 2, 196, lineas.join('\n'), 19, '#e0d8f0', { align: 'center', wordWrap: { width: 540 }, lineSpacing: 4 }).setOrigin(0.5, 0);
    hud.refresh();
    saveLocal();
    button(this, W / 2, 450, 240, 46, 'Seguir bajando', () => {
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      fadeTo(this, 'Map');
    }, { size: 21, color: UI.gold });
    void RELATO;
  }
}
