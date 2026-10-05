import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W } from '../config';
import { T } from '../textos';
import { frame, Tooltip, txt } from '../ui/widgets';
import { grabadoOn, toggleGrabado } from '../fx/grabado';

/** Capa siempre visible: pantalla completa y volumen */
export class OverlayScene extends Phaser.Scene {
  constructor() { super('Overlay'); }

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
    const brush = mk(W - 146, 'i_feather', () => {
      toggleGrabado(this.game);
      refresh();
    }, 'Estilo grabado (experimental)', () => `Filtro de tinta y tramado, estilo grimorio.\nAhora: ${grabadoOn() ? 'activado' : 'desactivado'} (clic para cambiar)`);
    const refresh = () => {
      brush.im.setAlpha(grabadoOn() ? 1 : 0.4);
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
