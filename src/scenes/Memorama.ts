import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { Result } from '../data/dilemmas';
import { Game, logEvent, saveLocal, syncRun } from '../state';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';
import { aplicarResultado } from './Dilemma';

/**
 * v0.69 · EL MEMORAMA DE FÓRMULAS (nodo «?», como «Match and Keep!» de Slay the Spire).
 * 12 cartas boca abajo: 6 fórmulas y sus 6 conceptos. Primero las ves 4 segundos; luego se voltean.
 * Tienes 5 intentos: cada par que encuentras te da el premio que traía (¡incluso si es una maldición!).
 */
const PARES: [string, string][] = [
  ['F = m·a', '2ª ley de Newton'],
  ['p = m·v', 'Cantidad de movimiento'],
  ['K = ½·m·v²', 'Energía cinética'],
  ['V = m·g·h', 'Energía potencial'],
  ['U = F·d·cos θ', 'Trabajo'],
  ['P = U / t', 'Potencia'],
  ['I = F·Δt', 'Impulso'],
  ['f = μ·N', 'Fricción'],
  ['aₙ = v² / r', 'Aceleración centrípeta'],
  ['ΣM = I·α', '2ª ley en rotación'],
  ['Vₑ = ½·k·x²', 'Energía elástica'],
  ['H = I·ω', 'Momento angular'],
  ['W = m·g', 'Peso'],
  ['v = v₀ + a·t', 'Velocidad con a constante'],
];
const PREMIOS: { nombre: string; r: Result; malo?: boolean }[] = [
  { nombre: 'Reliquia', r: { text: '', relic: 'random' } },
  { nombre: 'Carta rara', r: { text: '', card: 'rara' } },
  { nombre: '+35 Ergios', r: { text: '', ergios: 35 } },
  { nombre: '+12 de vida', r: { text: '', hp: 12 } },
  { nombre: '+4 Vida máx.', r: { text: '', maxHp: 4 } },
  { nombre: 'Maldición al azar', r: { text: '', maldicion: 'random' }, malo: true }, // v0.71
];
const INTENTOS = 5;
const CW = 170, CH = 108, GAP = 14;

interface Carta {
  par: number;
  cont: Phaser.GameObjects.Container;
  frente: Phaser.GameObjects.Container;
  dorso: Phaser.GameObjects.Container;
  arriba: boolean;
  hecha: boolean;
}

export class MemoramaScene extends Phaser.Scene {
  constructor() { super('Memorama'); }

  create(data: { floor: number }) {
    const run = Game.run!;
    this.cameras.main.fadeIn(400);
    audio.play('calma');
    this.add.rectangle(0, 0, W, H, 0x0a0810).setOrigin(0);
    vignette(this);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);
    title(this, W / 2, 62, 'El Memorama de Fórmulas', 32, '#e8c890');
    const sub = txt(this, W / 2, 84, 'Un espíritu bibliotecario baraja 12 cartas: 6 fórmulas y sus conceptos. Memorízalas…', 16, CSS.dim, { align: 'center', wordWrap: { width: 860 } }).setOrigin(0.5, 0);

    const elegidos = Phaser.Utils.Array.Shuffle([...PARES]).slice(0, 6);
    const premios = Phaser.Utils.Array.Shuffle([...PREMIOS]);
    // 12 cartas: [par, esFormula]
    const orden = Phaser.Utils.Array.Shuffle(elegidos.flatMap((_, i) => [[i, true], [i, false]] as [number, boolean][]));
    const x0 = (W - (4 * CW + 3 * GAP)) / 2 + CW / 2;
    const y0 = 112 + CH / 2;
    const cartas: Carta[] = orden.map(([par, esF], k) => {
      const x = x0 + (k % 4) * (CW + GAP);
      const y = y0 + Math.floor(k / 4) * (CH + GAP);
      const cont = this.add.container(x, y);
      const premio = premios[par];
      // frente
      const fg = this.add.graphics();
      frame(fg, -CW / 2, -CH / 2, CW, CH, esF ? 0x14121c : 0x1a140c, esF ? 0x6a7ab0 : 0xb08a4a, 1);
      const frente = this.add.container(0, 0, [fg]);
      if (esF) {
        frente.add(txt(this, 0, -6, elegidos[par][0], 24, '#c8d8ff').setOrigin(0.5));
        frente.add(txt(this, 0, 34, 'fórmula', 12, CSS.dim).setOrigin(0.5));
      } else {
        frente.add(txt(this, 0, -16, elegidos[par][1], 17, CSS.bone, { align: 'center', wordWrap: { width: CW - 16 } }).setOrigin(0.5));
        frente.add(txt(this, 0, 32, premio.nombre, 13, premio.malo ? '#ff9a9a' : CSS.gold, { align: 'center', wordWrap: { width: CW - 12 } }).setOrigin(0.5));
      }
      // dorso
      const dg = this.add.graphics();
      frame(dg, -CW / 2, -CH / 2, CW, CH, 0x0e0a14, 0x4a3a6a, 1);
      dg.lineStyle(1, 0x3a2a5a, 1).strokeCircle(0, 0, 30).strokeCircle(0, 0, 18);
      const dorso = this.add.container(0, 0, [dg, txt(this, 0, 0, '?', 30, '#8a7ab0').setOrigin(0.5)]).setVisible(false);
      cont.add([frente, dorso]);
      cont.setSize(CW, CH).setInteractive({ useHandCursor: true });
      return { par, cont, frente, dorso, arriba: true, hecha: false };
    });

    const voltear = (c: Carta, arriba: boolean) => new Promise<void>((res) => {
      this.tweens.add({
        targets: c.cont, scaleX: 0, duration: 120, onComplete: () => {
          c.arriba = arriba;
          c.frente.setVisible(arriba);
          c.dorso.setVisible(!arriba);
          this.tweens.add({ targets: c.cont, scaleX: 1, duration: 120, onComplete: () => res() });
        },
      });
    });

    let intentos = INTENTOS;
    let listo = false;
    let elegida: Carta | null = null;
    let ocupado = false;
    const ganados: string[] = [];
    let pares = 0;
    const info = txt(this, W / 2, 486, '', 18, CSS.gold).setOrigin(0.5, 0);
    const pintarInfo = () => info.setText(listo ? `Intentos: ${'◆'.repeat(intentos)}${'◇'.repeat(INTENTOS - intentos)}   ·   Pares: ${pares}/6` : '');

    const terminar = () => {
      listo = false;
      run.floor = data.floor + 1;
      logEvent('memorama', 'Formulas', pares >= 3, { pares });
      saveLocal();
      syncRun('en curso');
      hud.refresh();
      // muestra todas
      cartas.filter((c) => !c.arriba).forEach((c) => voltear(c, true));
      this.time.delayedCall(700, () => {
        const box = this.add.container(0, 0).setDepth(30);
        box.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0));
        const g = this.add.graphics();
        frame(g, W / 2 - 330, 150, 660, 250, 0x0e0a08, pares ? UI.green : 0x9a4040, 0.98);
        box.add(g);
        box.add(title(this, W / 2, 176, pares === 6 ? '¡Memoria perfecta!' : pares ? `Encontraste ${pares} par${pares > 1 ? 'es' : ''}` : 'Ningún par…', 28, pares ? '#9af07a' : '#ff9a9a'));
        box.add(txt(this, W / 2, 210, ganados.length ? ganados.join('\n') : 'El espíritu recoge sus cartas y se desvanece. «Repasa tus fórmulas.»', 17, CSS.bone, { align: 'center', wordWrap: { width: 620 } }).setOrigin(0.5, 0));
        box.add(button(this, W / 2, 370, 220, 40, 'Volver al mapa', () => fadeTo(this, 'Map'), { size: 20, color: UI.gold }));
      });
    };

    const tocar = async (c: Carta) => {
      if (!listo || ocupado || c.hecha || c.arriba) return;
      ocupado = true;
      audio.sfx('card');
      await voltear(c, true);
      if (!elegida) { elegida = c; ocupado = false; return; }
      const a = elegida;
      elegida = null;
      intentos--;
      if (a.par === c.par) {
        a.hecha = c.hecha = true;
        pares++;
        const p = premios[c.par];
        audio.sfx(p.malo ? 'wrong' : 'correct');
        for (const x of [a, c]) {
          const glow = this.add.graphics().setDepth(5);
          glow.lineStyle(3, p.malo ? 0xff6a6a : 0x9af07a, 1).strokeRoundedRect(x.cont.x - CW / 2 - 3, x.cont.y - CH / 2 - 3, CW + 6, CH + 6, 6);
        }
        const out = aplicarResultado(p.r);
        ganados.push(`${elegidos[c.par][0]}  ↔  ${elegidos[c.par][1]}:  ${out.join(' · ')}`);
        hud.refresh();
      } else {
        audio.sfx('wrong');
        await new Promise((r) => this.time.delayedCall(800, r));
        await Promise.all([voltear(a, false), voltear(c, false)]);
      }
      pintarInfo();
      ocupado = false;
      if (pares === 6 || intentos <= 0) terminar();
    };
    cartas.forEach((c) => c.cont.on('pointerdown', () => tocar(c)));

    // memorizar 4 segundos, luego voltear
    let seg = 4;
    const cuenta = txt(this, W / 2, 486, `Memoriza: ${seg}`, 22, '#e8c890').setOrigin(0.5, 0);
    this.time.addEvent({
      delay: 1000, repeat: seg - 1, callback: () => {
        seg--;
        cuenta.setText(seg > 0 ? `Memoriza: ${seg}` : '');
        if (seg === 0) {
          cuenta.destroy();
          cartas.forEach((c) => voltear(c, false));
          sub.setText(`Voltea dos cartas: una fórmula y su concepto. Tienes ${INTENTOS} intentos. Cada par te da su premio (¡aunque sea una maldición!).`);
          listo = true;
          pintarInfo();
        }
      },
    });
  }
}
