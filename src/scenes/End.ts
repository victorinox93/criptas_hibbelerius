import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { Game, saveLocal } from '../state';
import { button, embers, fadeTo, panel, title, txt, vignette } from '../ui/widgets';

const TIPS = [
  'Recuerda: F = m·a. Si quieres más fuerza, sube la masa (Forja) o la aceleración (Carrera).',
  'Para detener a un enemigo con Inercia necesitas UN golpe con F ≥ su umbral: junta tus bonos antes de golpear.',
  'La Embestida te devuelve ¼ de su fuerza: la 3ª ley no perdona. Ten Bloque listo.',
  'El lodo (fricción) resta aceleración. Peso Muerto usa g, que no cambia: ¡ignora la fricción!',
];

export class EndScene extends Phaser.Scene {
  constructor() { super('End'); }

  create(data: { victory: boolean; by?: string }) {
    this.cameras.main.fadeIn(500);
    const run = Game.run!;
    this.add.rectangle(0, 0, W, H, 0x07060a).setOrigin(0);
    embers(this);
    vignette(this);

    if (data.victory) {
      title(this, W / 2, 70, 'Acto I completado', 54);
      txt(this, W / 2, 112, 'El Coloso Inerte se desmorona. Su inercia, por fin, cede.', 22, CSS.bone).setOrigin(0.5);
      const wz = this.add.image(W - 170, 300, 'wizard').setScale(7).setAlpha(0);
      this.tweens.add({ targets: wz, alpha: 0.9, duration: 2500, delay: 800 });
      this.tweens.add({ targets: wz, y: 292, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const q = txt(this, W - 170, 470, '«Interesante… dominas la fuerza.\nVeremos si entiendes la ENERGÍA.»\n— Hibbelerius', 20, CSS.purple, { align: 'center' }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: q, alpha: 1, duration: 1500, delay: 2600 });
    } else {
      title(this, W / 2, 70, 'Has caído', 54, CSS.blood);
      txt(this, W / 2, 112, `Derrotado por: ${data.by ?? '—'} · piso ${run.floor + 1}`, 22, CSS.dim).setOrigin(0.5);
    }

    panel(this, 80, 150, 520, 300);
    const rows: [string, string | number][] = [
      ['Pisos superados', `${run.floor}/9`],
      ['Combates ganados', run.stats.combates],
      ['Élites derrotadas', run.stats.elites],
      ['Runas resueltas', `${run.stats.runasOk}/${run.stats.runasTotal}`],
      ['Cartas en el mazo', run.deck.length],
      ['Puntaje', run.score],
    ];
    rows.forEach(([k, v], i) => {
      txt(this, 110, 172 + i * 40, k, 26, CSS.dim);
      txt(this, 570, 172 + i * 40, String(v), 28, i === rows.length - 1 ? CSS.gold : CSS.bone).setOrigin(1, 0);
    });
    if (!data.victory) {
      txt(this, W - 300, 220, 'Consejo del cronista', 24, CSS.gold).setOrigin(0.5);
      txt(this, W - 300, 250, Phaser.Utils.Array.GetRandom(TIPS), 21, CSS.bone, { wordWrap: { width: 300 }, align: 'center' }).setOrigin(0.5, 0);
    }
    txt(this, 340, 466, Game.profile?.offline ? 'Modo sin conexión: progreso guardado sólo aquí.' : 'Tu progreso quedó registrado.', 20, CSS.dim).setOrigin(0.5);
    run.done = true;
    saveLocal();
    Game.run = null;
    saveLocal();
    button(this, 340, 506, 260, 44, 'Volver al Umbral', () => fadeTo(this, 'Menu'), { color: UI.gold });
  }
}
