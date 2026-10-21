import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { addEntropia, addErgios, Game, logEvent, saveLocal, syncRun } from '../state';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/**
 * v0.61 · LLUVIA DE METEORITOS (fenómeno del Abismo; sale desde un nodo «?», src/data/relatos.ts).
 * Minijuego de esquivar: el héroe se mueve con el ratón o con ← →.
 *   · Cada meteorito muestra su masa y su rapidez. Si te pega, el daño sale de su
 *     energía cinética: K = ½·m·v² (1 de vida por cada K_POR_VIDA joules, máximo DANO_MAX).
 *   · Los fragmentos brillantes dan Ergios.
 *   · Al final, una pregunta: ¿cuál de dos meteoritos pega más fuerte? (la rapidez va al cuadrado).
 */
const DURACION = 20; // segundos
const K_POR_VIDA = 40;
const DANO_MAX = 10;
const ERGIOS_FRAGMENTO = 3;
const CORDURA_BIEN = 6;
const ERGIOS_BIEN = 10;
const SUELO = 470;
const MASAS = [1, 2, 4, 8];

interface Roca { o: Phaser.GameObjects.Container; m: number; v: number; r: number; vx: number; vy: number; frag: boolean }

export class MeteoritosScene extends Phaser.Scene {
  private floor = 0;
  private hud!: { refresh: () => void };
  private heroe!: Phaser.GameObjects.Image;
  private rocas: Roca[] = [];
  private jugando = false;
  private t = 0;
  private inicio = 0; // momento real en que empezó (el tiempo de juego no depende de los fps)
  private siguiente = 0;
  private golpes: { m: number; v: number; K: number; d: number }[] = [];
  private fragmentos = 0;
  private reloj!: Phaser.GameObjects.Text;
  private teclas?: Phaser.Types.Input.Keyboard.CursorKeys;
  private capa!: Phaser.GameObjects.Container;
  private sigueRaton = true; // v0.63 · false al usar el teclado; vuelve a true cuando mueves el ratón

  constructor() { super('Meteoritos'); }

  create(data: { floor: number }) {
    this.floor = data.floor;
    this.rocas = [];
    this.golpes = [];
    this.fragmentos = 0;
    this.jugando = false;
    this.t = 0;
    this.siguiente = 0;
    this.cameras.main.fadeIn(300);
    audio.play('abismo2');
    // cielo del Abismo abierto: negro con estrellas y un suelo de roca
    this.add.rectangle(0, 0, W, H, 0x05040c).setOrigin(0);
    for (let i = 0; i < 90; i++) {
      const s = this.add.circle(Math.random() * W, 60 + Math.random() * 380, Math.random() < 0.15 ? 2 : 1, 0xfff4d8, 0.6);
      this.tweens.add({ targets: s, alpha: 0.1, duration: 600 + Math.random() * 1800, yoyo: true, repeat: -1 });
    }
    const suelo = this.add.graphics();
    suelo.fillStyle(0x1a1410, 1).fillRect(0, SUELO + 22, W, H - SUELO - 22);
    suelo.lineStyle(2, 0x3a2a1a, 1).lineBetween(0, SUELO + 22, W, SUELO + 22);
    vignette(this);
    const tip = new Tooltip(this);
    this.hud = topBar(this, tip);
    this.heroe = this.add.image(W / 2, SUELO, 'hero').setScale(1.4).setDepth(5);
    this.teclas = this.input.keyboard?.createCursorKeys();
    this.sigueRaton = true;
    this.input.on('pointermove', () => { this.sigueRaton = true; });
    this.capa = this.add.container(0, 0).setDepth(20);
    this.instrucciones();
  }

  private instrucciones() {
    const c = this.capa;
    c.removeAll(true);
    const g = this.add.graphics();
    frame(g, 150, 90, W - 300, 290, 0x0c0a14, 0xff8a2a, 0.96);
    c.add(g);
    c.add(title(this, W / 2, 124, 'Lluvia de Meteoritos', 38, '#ffb060'));
    c.add(txt(this, W / 2, 162,
      'Muévete con el ratón o con las flechas ← →. Esquiva las rocas encendidas.\n'
      + `Cada roca dice su masa y su rapidez. Si te pega, te quita vida según su energía cinética:\nK = ½·m·v²  (1 de vida por cada ${K_POR_VIDA} J)\n`
      + `Los fragmentos azules que brillan dan +${ERGIOS_FRAGMENTO} Ergios. Dura ${DURACION} segundos.\n\n`
      + 'Piensa: ¿qué es más peligroso, una roca pesada y lenta o una ligera y rápida?',
      17, CSS.bone, { align: 'center', wordWrap: { width: W - 340 }, lineSpacing: 4 }).setOrigin(0.5, 0));
    c.add(button(this, W / 2, 352, 240, 44, '¡Empezar!', () => this.empezar(), { color: 0xc8541a, size: 22 }));
  }

  private empezar() {
    this.capa.removeAll(true);
    this.jugando = true;
    this.t = 0;
    this.inicio = this.time.now;
    this.siguiente = 0.4;
    this.reloj = txt(this, W - 30, 70, '', 22, '#ffd080').setOrigin(1, 0).setDepth(10);
  }

  private nuevaRoca(frag = false) {
    const m = frag ? 0.5 : Phaser.Utils.Array.GetRandom(MASAS);
    const v = frag ? 5 : Phaser.Math.Between(4, 14);
    const r = frag ? 7 : 8 + m * 1.8;
    const x = Phaser.Math.Between(40, W - 40);
    const o = this.add.container(x, 60).setDepth(4);
    const g = this.add.graphics();
    if (frag) {
      g.fillStyle(0x7ad8ff, 0.3).fillCircle(0, 0, r + 6);
      g.fillStyle(0xc8f4ff, 1).fillRect(-4, -4, 8, 8);
      g.fillStyle(0xffffff, 1).fillRect(-1, -6, 2, 12).fillRect(-6, -1, 12, 2);
    } else {
      // estela de fuego hacia arriba y la roca
      g.fillStyle(0xff8a2a, 0.35).fillTriangle(-r * 0.8, -r * 0.2, r * 0.8, -r * 0.2, 0, -r * 3.2);
      g.fillStyle(0xffe070, 0.5).fillTriangle(-r * 0.4, -r * 0.4, r * 0.4, -r * 0.4, 0, -r * 2.2);
      g.fillStyle(0x5a4a4a, 1).fillCircle(0, 0, r);
      g.fillStyle(0x8a7a6a, 1).fillCircle(-r * 0.25, -r * 0.25, r * 0.6);
      g.fillStyle(0x2a2020, 1).fillCircle(r * 0.3, r * 0.2, r * 0.22);
    }
    o.add(g);
    if (!frag) o.add(txt(this, 0, -r - 34, `${m} kg\n${v} m/s`, 13, '#ffe0b0', { align: 'center' }).setOrigin(0.5, 0).setStroke('#000', 3));
    // la rapidez en pantalla es proporcional a la real (22 px/s por cada m/s)
    const vy = v * 22, vx = Phaser.Math.Between(-30, 30);
    this.rocas.push({ o, m, v, r, vx, vy, frag });
  }

  update(_t: number, dtMs: number) {
    if (!this.jugando) return;
    const dt = Math.min(0.1, dtMs / 1000);
    this.t = (this.time.now - this.inicio) / 1000;
    this.reloj.setText(`${Math.max(0, Math.ceil(DURACION - this.t))} s`);
    // movimiento del héroe: flechas o ratón
    const p = this.input.activePointer;
    let x = this.heroe.x;
    if (this.teclas?.left.isDown) { x -= 380 * dt; this.sigueRaton = false; }
    else if (this.teclas?.right.isDown) { x += 380 * dt; this.sigueRaton = false; }
    else if (this.sigueRaton && p.x > 0) x += (p.x - x) * Math.min(1, dt * 9);
    this.heroe.x = Phaser.Math.Clamp(x, 40, W - 40);
    // nuevas rocas: cada vez más seguido
    this.siguiente -= dt;
    if (this.siguiente <= 0 && this.t < DURACION - 1) {
      this.nuevaRoca(Math.random() < 0.18);
      this.siguiente = Math.max(0.28, 0.75 - this.t * 0.022);
    }
    for (const r of [...this.rocas]) {
      r.o.x += r.vx * dt;
      r.o.y += r.vy * dt;
      const dx = r.o.x - this.heroe.x, dy = r.o.y - (SUELO - 20);
      if (Math.abs(dx) < r.r + 16 && Math.abs(dy) < r.r + 24) { this.choque(r); continue; }
      if (r.o.y > SUELO + 20) {
        if (!r.frag) { this.cameras.main.shake(60, 0.002 * r.m); this.polvo(r.o.x); }
        this.quitar(r);
      }
    }
    if (this.t >= DURACION && !this.rocas.length) this.terminar();
  }

  private quitar(r: Roca) {
    r.o.destroy();
    this.rocas = this.rocas.filter((x) => x !== r);
  }

  private polvo(x: number) {
    for (let i = 0; i < 6; i++) {
      const d = this.add.circle(x, SUELO + 18, 3, 0x8a7a6a, 0.8).setDepth(3);
      this.tweens.add({ targets: d, x: x + Phaser.Math.Between(-30, 30), y: SUELO - Phaser.Math.Between(4, 24), alpha: 0, duration: 400, onComplete: () => d.destroy() });
    }
  }

  private choque(r: Roca) {
    const run = Game.run!;
    if (r.frag) {
      this.fragmentos++;
      addErgios(ERGIOS_FRAGMENTO);
      audio.sfx('coin');
      this.flotar(r.o.x, r.o.y - 20, `+${ERGIOS_FRAGMENTO} Ergios`, '#9ad8ff');
    } else {
      const K = 0.5 * r.m * r.v * r.v;
      const d = Math.min(DANO_MAX, Math.max(1, Math.round(K / K_POR_VIDA)));
      run.hp = Math.max(1, run.hp - d);
      this.golpes.push({ m: r.m, v: r.v, K, d });
      audio.sfx('hit');
      this.cameras.main.shake(120, 0.006);
      this.heroe.setTint(0xff8a8a);
      this.time.delayedCall(150, () => this.heroe.clearTint());
      this.flotar(this.heroe.x, SUELO - 70, `K = ½·${r.m}·${r.v}² = ${K} J → −${d}`, '#ff9a7a');
    }
    this.hud.refresh();
    this.quitar(r);
  }

  private flotar(x: number, y: number, s: string, color: string) {
    const t = txt(this, x, y, s, 16, color).setOrigin(0.5).setStroke('#000', 4).setDepth(12);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 1400, onComplete: () => t.destroy() });
  }

  private terminar() {
    this.jugando = false;
    this.reloj.destroy();
    const dano = this.golpes.reduce((a, g) => a + g.d, 0);
    saveLocal();
    const c = this.capa;
    const g = this.add.graphics();
    frame(g, 150, 80, W - 300, 380, 0x0c0a14, 0xff8a2a, 0.97);
    c.add(g);
    c.add(title(this, W / 2, 110, 'Pasó la lluvia', 34, '#ffb060'));
    const peor = this.golpes.reduce<{ m: number; v: number; K: number; d: number } | null>((a, b) => (!a || b.K > a.K ? b : a), null);
    c.add(txt(this, W / 2, 140,
      `Golpes: ${this.golpes.length} (−${dano} de vida) · Fragmentos: ${this.fragmentos} (+${this.fragmentos * ERGIOS_FRAGMENTO} Ergios)`
      + (peor ? `\nEl golpe más fuerte: ${peor.m} kg a ${peor.v} m/s → K = ${peor.K} J` : '\n¡Ni un rasguño!'),
      17, CSS.bone, { align: 'center' }).setOrigin(0.5, 0));
    // la pregunta: ¿cuál pega más fuerte?
    let a: [number, number], b: [number, number];
    do {
      a = [Phaser.Utils.Array.GetRandom([6, 8, 10]), Phaser.Math.Between(3, 6)]; // pesado y lento
      b = [Phaser.Utils.Array.GetRandom([1, 2, 3]), Phaser.Math.Between(8, 14)]; // ligero y rápido
    } while (Math.abs(0.5 * a[0] * a[1] ** 2 - 0.5 * b[0] * b[1] ** 2) < 10);
    const Ka = 0.5 * a[0] * a[1] ** 2, Kb = 0.5 * b[0] * b[1] ** 2;
    c.add(txt(this, W / 2, 200, `Pregunta del Astrónomo: ¿cuál de estos dos meteoritos pega más fuerte?\nA: ${a[0]} kg a ${a[1]} m/s      B: ${b[0]} kg a ${b[1]} m/s`, 18, '#ffe0b0', { align: 'center' }).setOrigin(0.5, 0));
    const correcta = Ka > Kb ? 0 : 1;
    const ops = ['A (el pesado y lento)', 'B (el ligero y rápido)'];
    const bs = ops.map((o, i) => button(this, W / 2 - 150 + i * 300, 280, 270, 42, o, () => {
      bs.forEach((x) => x.setEnabled(false));
      const ok = i === correcta;
      if (ok) { addEntropia(-CORDURA_BIEN); addErgios(ERGIOS_BIEN); audio.sfx('coin'); } else audio.sfx('wrong');
      logEvent('meteoritos', 'Energia cinetica', ok, { golpes: this.golpes.length, dano, fragmentos: this.fragmentos, a, b });
      saveLocal();
      this.hud.refresh();
      c.add(txt(this, W / 2, 334,
        `${ok ? `¡Correcto! +${CORDURA_BIEN} de Cordura y +${ERGIOS_BIEN} Ergios.` : 'No: fíjate en la rapidez, que va AL CUADRADO.'}\n`
        + `K_A = ½·${a[0]}·${a[1]}² = ${Ka} J      K_B = ½·${b[0]}·${b[1]}² = ${Kb} J\n`
        + 'Duplicar la masa duplica la energía; duplicar la rapidez la CUADRUPLICA.',
        16, ok ? CSS.green : '#ff9a7a', { align: 'center', wordWrap: { width: W - 340 } }).setOrigin(0.5, 0));
      c.add(button(this, W / 2, 428, 220, 40, 'Volver al mapa', () => {
        const run = Game.run!;
        run.floor = this.floor + 1;
        saveLocal();
        syncRun('en curso');
        fadeTo(this, 'Map');
      }, { color: UI.gold, size: 20 }));
    }, { size: 18, color: 0x5a2a1a }));
    bs.forEach((x) => c.add(x));
  }
}
