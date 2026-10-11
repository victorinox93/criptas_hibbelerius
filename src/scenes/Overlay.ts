import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W } from '../config';
import { T } from '../textos';
import { button, frame, icon, Tooltip, txt } from '../ui/widgets';
import { H } from '../config';
import { cuentaTope, MAX_RELIQUIAS, RELICS } from '../data/relics';
import { Game, logEvent, saveLocal } from '../state';
import { descartarRelic } from './Reward';

/** Capa siempre visible: pantalla completa, volumen y (v0.32.2) el descarte de reliquias al pasar el límite */
export class OverlayScene extends Phaser.Scene {
  private descarte: Phaser.GameObjects.Container | null = null;

  constructor() { super('Overlay'); }

  update() {
    // si una reliquia te pasó del límite (venga de donde venga), se abre la ventana de descarte
    const r = Game.run;
    if (!this.descarte && r?.reliquiaNueva && !r.done) this.abrirDescarte();
  }

  private abrirDescarte() {
    const r = Game.run!;
    const nueva = r.reliquiaNueva!;
    const lista = r.relics.filter(cuentaTope);
    this.scene.bringToTop();
    const c = this.add.container(0, 0).setDepth(5000);
    this.descarte = c;
    c.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.82).setOrigin(0).setInteractive());
    const g = this.add.graphics();
    frame(g, 100, 70, W - 200, 400, 0x0c0a10, UI.gold, 0.98);
    c.add(g);
    c.add(txt(this, W / 2, 84, `Cargas demasiadas reliquias (${lista.length}/${MAX_RELIQUIAS})`, 26, CSS.gold).setOrigin(0.5, 0));
    c.add(txt(this, W / 2, 118, 'Tu mochila tiene un límite. Elige una para dejarla en la cripta (puede ser la nueva).', 17, CSS.bone).setOrigin(0.5, 0));
    let elegida: string | null = null;
    const desc = txt(this, W / 2, 380, 'Toca una reliquia para ver qué hace.', 16, CSS.dim, { align: 'center', wordWrap: { width: W - 260 } }).setOrigin(0.5, 0);
    c.add(desc);
    const marcos: { id: string; g: Phaser.GameObjects.Graphics; x: number; y: number }[] = [];
    const N = 5, CW = 140, CH = 100, X0 = W / 2 - (N * CW + (N - 1) * 8) / 2;
    const pintar = () => marcos.forEach((m) => {
      m.g.clear();
      frame(m.g, m.x, m.y, CW, CH, m.id === elegida ? 0x2a1414 : 0x14101a, m.id === elegida ? 0xe05050 : m.id === nueva ? UI.gold : UI.border, 0.97);
    });
    lista.forEach((id, i) => {
      const rel = RELICS[id];
      const x = X0 + (i % N) * (CW + 8), y = 146 + Math.floor(i / N) * (CH + 8);
      const mg = this.add.graphics();
      c.add(mg);
      marcos.push({ id, g: mg, x, y });
      c.add(icon(this, x + CW / 2, y + 30, rel?.icon ?? 'i_bag', 3));
      const n = txt(this, x + CW / 2, y + 56, rel?.name ?? id, 13, CSS.bone, { align: 'center', wordWrap: { width: CW - 10 } }).setOrigin(0.5, 0);
      if (n.height > 36) n.setFontSize(11);
      c.add(n);
      if (id === nueva) c.add(txt(this, x + CW - 6, y + 4, 'NUEVA', 12, CSS.gold).setOrigin(1, 0));
      const z = this.add.zone(x, y, CW, CH).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => {
        elegida = id;
        pintar();
        desc.setText(`${rel?.name ?? id}: ${rel?.text ?? ''}`).setColor(CSS.bone);
        boton.label.setText(`Descartar «${rel?.name ?? id}»`);
        boton.setAlpha(1);
      });
      c.add(z);
    });
    pintar();
    const boton = button(this, W / 2, 440, 340, 40, 'Elige una reliquia', () => {
      if (!elegida) return;
      descartarRelic(elegida);
      logEvent('descarte_reliquia', '', '', { id: elegida, nueva, total: r.relics.filter(cuentaTope).length });
      // ¿sigue sobrando? (p. ej. si ganaste dos de golpe) → se vuelve a abrir
      if (r.relics.filter(cuentaTope).length <= MAX_RELIQUIAS) r.reliquiaNueva = undefined;
      saveLocal();
      audio.sfx('click');
      c.destroy();
      this.descarte = null;
      // que la barra superior de la pantalla actual muestre las reliquias correctas
      for (const s of this.game.scene.getScenes(true)) (s as unknown as { hud?: { refresh?: () => void } }).hud?.refresh?.();
    }, { color: 0xc84a4a, size: 18 });
    boton.setAlpha(0.6);
    c.add(boton);
  }

  create() {
    const tip = new Tooltip(this);
    const mk = (x: number, icon: string, onClick: () => void, head: string, body: () => string) => {
      const c = this.add.container(x, 20);
      const g = this.add.graphics();
      const draw = (h: boolean) => {
        g.clear();
        frame(g, -15, -14, 30, 28, h ? UI.panel2 : UI.panel, h ? UI.gold : UI.border, 0.9);
      };
      draw(false);
      const im = this.add.image(0, 0, icon).setScale(2);
      c.add([g, im]);
      c.setSize(30, 28).setInteractive({ useHandCursor: true });
      c.on('pointerover', (p: Phaser.Input.Pointer) => {
        draw(true);
        tip.show(p.worldX - 260, 44, head, body());
      });
      c.on('pointerout', () => {
        draw(false);
        tip.hide();
      });
      c.on('pointerdown', () => {
        onClick();
        tip.show(W - 300, 44, head, body());
      });
      return { c, im };
    };
    const lvl = txt(this, W - 112, 30, '', 14, CSS.gold).setOrigin(0.5);
    const music = mk(W - 112, 'i_note', () => {
      audio.unlock();
      audio.setLevel(audio.level === 0 ? 3 : audio.level - 1);
      refresh();
    }, T.ajustes.musica, () => `Nivel: ${T.ajustes.niveles[audio.level]}\n(clic para cambiar)`);
    mk(W - 78, 'i_full', () => {
      if (this.scale.isFullscreen) this.scale.stopFullscreen();
      else this.scale.startFullscreen();
    }, T.ajustes.pantalla, () => (this.scale.isFullscreen ? 'Clic para salir' : 'Clic para entrar'));
    const refresh = () => {
      music.im.setAlpha(audio.level === 0 ? 0.35 : 1);
      lvl.setText(audio.level === 0 ? '×' : '');
    };
    refresh();
    this.input.keyboard?.on('keydown-F11', (e: KeyboardEvent) => {
      e.preventDefault();
      if (this.scale.isFullscreen) this.scale.stopFullscreen();
      else this.scale.startFullscreen();
    });
  }
}
