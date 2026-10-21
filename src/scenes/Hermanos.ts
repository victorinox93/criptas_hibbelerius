import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { addEntropia, Game, logEvent, saveLocal, syncRun } from '../state';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';
import { darDiente } from './Relato';

/**
 * v0.62 · REMIENDOS Y ZURCIDO (acertijo de un nodo «?» del Abismo, src/data/relatos.ts → 'hermanos').
 * Dos hermanos idénticos: uno SIEMPRE miente (Remiendos) y el otro NUNCA (Zurcido).
 * Cada uno dice una frase de física y señala un camino. El que dice la frase FALSA es el mentiroso,
 * así que su camino es el malo: hay que saber física para saber en quién confiar.
 */
const FRASES: [string, string, string][] = [
  // [verdadera, falsa, por qué]
  ['En el vacío, una pluma y un martillo caen con la misma aceleración.', 'En el vacío, un objeto pesado cae más rápido que uno ligero.', 'Sin aire, todo cae con la misma aceleración g (lo comprobó un astronauta en la Luna en 1971).'],
  ['Si la fuerza neta es cero, un cuerpo en movimiento sigue a velocidad constante.', 'Si un cuerpo se mueve, tiene que haber una fuerza empujándolo todo el tiempo.', '1ª ley de Newton: sin fuerza neta, la velocidad no cambia (no hace falta una fuerza para seguir moviéndose).'],
  ['En la Luna tu peso cambia, pero tu masa es la misma.', 'En la Luna tu masa es menor que en la Tierra.', 'La masa es cuánta materia tienes; el peso es m·g, y g cambia de lugar en lugar.'],
  ['En un movimiento circular, la aceleración centrípeta apunta hacia el centro.', 'En un movimiento circular, la aceleración apunta hacia afuera del círculo.', 'a = v²/r apunta siempre hacia el centro; la «fuerza centrífuga» no existe en un marco inercial.'],
  ['Si duplicas la rapidez, la energía cinética se cuadruplica.', 'Si duplicas la rapidez, la energía cinética se duplica.', 'K = ½·m·v²: la rapidez va al cuadrado, así que (2v)² = 4v².'],
  ['La fuerza de reacción es igual en magnitud a la de acción.', 'La fuerza de reacción siempre es más pequeña que la de acción.', '3ª ley de Newton: acción y reacción son iguales en magnitud y opuestas en dirección.'],
  ['Un aro gira más difícil que un disco de la misma masa y radio.', 'Un disco gira más difícil que un aro de la misma masa y radio.', 'El aro tiene toda su masa lejos del eje: I = m·r², contra ½·m·r² del disco.'],
  ['El impulso es igual al cambio de cantidad de movimiento.', 'El impulso es igual a la energía cinética del cuerpo.', 'Teorema del impulso: F·Δt = Δp = m·Δv.'],
];
const ERGIOS_TESORO = 25;
const ROBO = 30;

export class HermanosScene extends Phaser.Scene {
  constructor() { super('Hermanos'); }

  create(data: { floor: number }) {
    const run = Game.run!;
    this.cameras.main.fadeIn(400);
    audio.play('abismo2');
    this.add.rectangle(0, 0, W, H, 0x0a0806).setOrigin(0);
    // dos caminos que se separan
    const g = this.add.graphics();
    g.fillStyle(0x1c1610, 1).fillTriangle(W / 2 - 40, H, W / 2 + 40, H, 180, 300).fillTriangle(W / 2 - 40, H, W / 2 + 40, H, W - 180, 300);
    vignette(this);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);
    title(this, W / 2, 70, 'Remiendos y Zurcido', 34, '#e8c890');
    txt(this, W / 2, 98, 'Uno SIEMPRE miente y el otro NUNCA. El que dice algo FALSO de física es el mentiroso… y su camino es el malo.', 16, CSS.dim, { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5, 0);

    // ¿quién está a la izquierda?, ¿dónde está el tesoro?
    const [verdad, falsa, porque] = Phaser.Utils.Array.GetRandom(FRASES);
    const honestoIzq = Math.random() < 0.5;
    const tesoroIzq = Math.random() < 0.5;
    const camino = (izq: boolean) => (izq ? 'el camino de la IZQUIERDA' : 'el camino de la DERECHA');
    // el honesto dice la verdad y señala el tesoro; el mentiroso dice algo falso y señala el otro camino
    const dice = (honesto: boolean) => `«${honesto ? verdad : falsa}\nY el tesoro está por ${camino(honesto ? tesoroIzq : !tesoroIzq)}.»`;
    const lados: [number, boolean][] = [[W / 2 - 230, honestoIzq], [W / 2 + 230, !honestoIzq]];
    lados.forEach(([x, honesto], i) => {
      const im = this.add.image(x, 230, 'fig_hermano').setScale(6);
      if (i === 1) im.setFlipX(true);
      this.tweens.add({ targets: im, y: 226, duration: 1300 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      txt(this, x, 306, i === 0 ? 'El hermano de la izquierda' : 'El hermano de la derecha', 16, '#c8a060').setOrigin(0.5, 0);
      const bg = this.add.graphics();
      frame(bg, x - 200, 330, 400, 92, 0x120e0a, 0x6a5a3a, 0.95);
      txt(this, x, 340, dice(honesto), 15, CSS.bone, { align: 'center', wordWrap: { width: 380 } }).setOrigin(0.5, 0);
    });

    const elegir = (izq: boolean) => {
      bs.forEach((b) => b.setEnabled(false));
      const ok = izq === tesoroIzq;
      let res: string;
      if (ok) {
        run.ergios += ERGIOS_TESORO;
        res = `¡El tesoro! +${ERGIOS_TESORO} Ergios. ${darDiente('raro')}`;
        addEntropia(-4);
        audio.sfx('coin');
      } else {
        const r = Math.min(run.ergios, ROBO);
        run.ergios -= r;
        res = `El camino termina en una pared. Cuando regresas, Remiendos se ríe: te faltan ${r} Ergios.`;
        addEntropia(4);
        audio.sfx('wrong');
      }
      logEvent('hermanos', 'Logica y fisica', ok, { frase: verdad });
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      hud.refresh();
      const c = this.add.container(0, 0).setDepth(20);
      const fg = this.add.graphics();
      frame(fg, W / 2 - 360, 150, 720, 250, 0x0e0a08, ok ? UI.green : 0x9a4040, 0.98);
      c.add(fg);
      c.add(title(this, W / 2, 176, ok ? '¡Elegiste bien!' : 'Te engañaron', 30, ok ? '#9af07a' : '#ff9a9a'));
      c.add(txt(this, W / 2, 210, `${res}\n\nLa frase falsa era: «${falsa}»\n${porque}`, 16, CSS.bone, { align: 'center', wordWrap: { width: 680 } }).setOrigin(0.5, 0));
      c.add(button(this, W / 2, 370, 220, 40, 'Volver al mapa', () => fadeTo(this, 'Map'), { size: 20, color: UI.gold }));
    };
    const bs = [
      button(this, W / 2 - 230, 470, 300, 44, '← Tomar el camino izquierdo', () => elegir(true), { size: 18, color: 0x5a4a2a }),
      button(this, W / 2 + 230, 470, 300, 44, 'Tomar el camino derecho →', () => elegir(false), { size: 18, color: 0x5a4a2a }),
    ];
  }
}
