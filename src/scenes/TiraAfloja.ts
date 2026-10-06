import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { aporte, CartaTira, ESPECIALES, Fila, FILAS, nombreCarta, repartir, Rival, RIVALES } from '../data/tira';
import { addErgios, Game, logEvent, saveLocal } from '../state';
import { completarEncargo } from '../data/encargos';
import { T } from '../textos';
import { topBar } from '../ui/hud';
import { button, Btn, fadeTo, frame, title, Tooltip, txt } from '../ui/widgets';

interface Lado {
  mano: CartaTira[];
  filas: Record<Fila, CartaTira[]>;
  lodo: number; // cartas de Lodo que le jugaron esta ronda
  masa: boolean; // Masa Inamovible esta ronda
  paso: boolean;
  rondas: number;
}

const FILAS_ORDEN: Fila[] = ['h', 'r', 'p'];
const nuevoLado = (mano: CartaTira[]): Lado => ({ mano, filas: { h: [], r: [], p: [] }, lodo: 0, masa: false, paso: false, rondas: 0 });

/** Tira y Afloja de Newton (reglas en src/data/tira.ts) */
export class TiraAflojaScene extends Phaser.Scene {
  private yo!: Lado;
  private el!: Lado;
  private rival!: Rival;
  private apuesta = 0;
  private turnoYo = true;
  private ronda = 1;
  private layer!: Phaser.GameObjects.Container;
  private msgT!: Phaser.GameObjects.Text;
  private tip!: Tooltip;
  private hud!: ReturnType<typeof topBar>;
  private ocupado = false;
  private volver = 'Taberna';
  private floor = 0;

  constructor() { super('TiraAfloja'); }

  create(data: { floor: number; volver?: string }) {
    this.floor = data.floor;
    this.volver = data.volver ?? 'Taberna';
    this.cameras.main.fadeIn(300);
    audio.play('calma');
    this.add.rectangle(0, 0, W, H, 0x0c0907).setOrigin(0);
    this.tip = new Tooltip(this);
    this.hud = topBar(this, this.tip);
    this.rival = Phaser.Utils.Array.GetRandom(RIVALES);
    this.elegirApuesta();
  }

  // ───────── apuesta ─────────
  private elegirApuesta() {
    const run = Game.run!;
    const c = this.add.container(0, 0);
    c.add(title(this, W / 2, 70, 'Tira y Afloja de Newton', 40));
    const img = this.add.image(W / 2, 200, this.rival.sprite).setScale(this.rival.sprite.startsWith('alma_') ? 2.4 : 6);
    c.add([img, txt(this, W / 2, 268, `${this.rival.nombre}: ${this.rival.saludo}`, 19, CSS.bone, { align: 'center', wordWrap: { width: 700 } }).setOrigin(0.5, 0)]);
    c.add(txt(this, W / 2, 320, 'Gana quien tenga mayor ΣF en 2 de 3 rondas. Tienes 10 cartas para TODO el duelo.\nJalón = F · Rampa = F·cosθ · Polea = F×2 (máx. 2). Si ganas, recibes el doble de tu apuesta.', 17, CSS.dim, { align: 'center' }).setOrigin(0.5, 0));
    c.add(txt(this, W / 2, 380, '¿Cuánto apuestas?', 22, CSS.gold).setOrigin(0.5));
    [10, 25, 50].forEach((n, i) => {
      c.add(button(this, W / 2 + (i - 1) * 170, 430, 150, 46, `${n} ${T.moneda}`, () => {
        this.apuesta = n;
        addErgios(-n);
        this.hud.refresh();
        c.destroy();
        this.empezar();
      }, { size: 22, color: UI.gold, enabled: run.ergios >= n }));
    });
    c.add(button(this, W / 2, 500, 200, 36, 'Mejor no', () => this.salir(), { size: 19 }));
  }

  private empezar() {
    this.yo = nuevoLado(repartir(0, null));
    this.el = nuevoLado(repartir(this.rival.extra, this.rival.prefer));
    this.layer = this.add.container(0, 0);
    this.msgT = txt(this, W / 2, 372, '', 20, CSS.gold).setOrigin(0.5).setDepth(20).setStroke('#000', 4);
    logEvent('minijuego', '', '', { juego: 'tira', rival: this.rival.id, apuesta: this.apuesta });
    this.dibujar();
    this.msg('Ronda 1: empiezas tú.');
  }

  // ───────── reglas ─────────
  private totalFila(l: Lado, f: Fila) {
    let t = l.filas[f].reduce((s, c) => s + aporte(c), 0);
    if (f === 'h' && l.lodo && !l.masa) t = l.filas.h.reduce((s, c) => s + Math.max(0, aporte(c) - 2 * l.lodo), 0);
    return t;
  }
  private total(l: Lado) {
    return FILAS_ORDEN.reduce((s, f) => s + this.totalFila(l, f), 0);
  }
  private masFuerte(l: Lado): { f: Fila; c: CartaTira } | null {
    let best: { f: Fila; c: CartaTira } | null = null;
    for (const f of FILAS_ORDEN) for (const c of l.filas[f]) if (!best || aporte(c) > aporte(best.c)) best = { f, c };
    return best;
  }
  private puedeJugar(l: Lado, c: CartaTira) {
    return !(c.fila === 'p' && l.filas.p.length >= 2);
  }

  /** Juega una carta del lado l (contra el lado o) */
  private jugar(l: Lado, o: Lado, c: CartaTira): string {
    l.mano = l.mano.filter((x) => x !== c);
    const quien = l === this.yo ? 'Tú' : this.rival.nombre;
    if (!c.esp) {
      l.filas[c.fila!].push(c);
      return `${quien}: ${nombreCarta(c)} (+${aporte(c)} N)`;
    }
    switch (c.esp) {
      case 'lodo':
        o.lodo++;
        return `${quien}: ¡Lodo! El Jalón del otro lado pierde 2 por carta`;
      case 'masa':
        l.masa = true;
        return `${quien}: Masa Inamovible. Nada baja su fuerza esta ronda`;
      case 'reaccion': {
        const m = this.masFuerte(o);
        if (!m) return `${quien}: Acción-Reacción… pero no había nada que copiar`;
        l.filas[m.f].push({ ...m.c, uid: -m.c.uid });
        return `${quien}: Acción-Reacción copia ${nombreCarta(m.c)} (+${aporte(m.c)} N)`;
      }
      case 'cuerda': {
        for (const s of [l, o]) {
          if (s.masa) continue;
          const m = this.masFuerte(s);
          if (m) s.filas[m.f] = s.filas[m.f].filter((x) => x !== m.c);
        }
        return `${quien}: ¡Cuerda Rota! Se pierde la carta más fuerte de cada lado`;
      }
    }
    return '';
  }

  // ───────── turnos ─────────
  private clicCarta(c: CartaTira) {
    if (this.ocupado || !this.turnoYo || this.yo.paso) return;
    if (!this.puedeJugar(this.yo, c)) return this.msg('La Polea ya tiene 2 cartas.');
    audio.sfx('card');
    this.msg(this.jugar(this.yo, this.el, c));
    this.siguiente('yo');
  }

  private pasar() {
    if (this.ocupado || !this.turnoYo || this.yo.paso) return;
    this.yo.paso = true;
    this.msg('Pasas. Ya no jugarás más cartas esta ronda.');
    this.siguiente('yo');
  }

  /** Pasa el turno después de que jugó (o pasó) «de» */
  private siguiente(de: 'yo' | 'el') {
    const fuera = (l: Lado) => l.paso || !l.mano.length;
    if (fuera(this.yo) && fuera(this.el)) {
      this.turnoYo = false;
      this.dibujar();
      return void this.time.delayedCall(900, () => this.cerrarRonda());
    }
    let toca: 'yo' | 'el' = de === 'yo' ? 'el' : 'yo';
    if (toca === 'el' && fuera(this.el)) toca = 'yo';
    if (toca === 'yo' && fuera(this.yo)) toca = 'el';
    this.turnoYo = toca === 'yo';
    this.ocupado = toca === 'el';
    this.dibujar();
    if (toca === 'el') this.time.delayedCall(900, () => this.turnoRival());
  }

  /** IA sencilla: guarda cartas si va ganando, gasta lo justo para pasar al frente */
  private turnoRival() {
    this.ocupado = false;
    const el = this.el, yo = this.yo;
    const tE = this.total(el), tY = this.total(yo);
    const fuerzas = el.mano.filter((c) => !c.esp && this.puedeJugar(el, c)).sort((a, b) => aporte(a) - aporte(b));
    const esp = (e: string) => el.mano.find((c) => c.esp === e);
    let jugada: CartaTira | undefined;
    if (yo.paso && tE > tY) jugada = undefined; // ya ganó la ronda
    else if (!yo.paso && tE > tY + 8) jugada = undefined; // va muy arriba: ahorra cartas
    else {
      const m = this.masFuerte(yo);
      if (esp('lodo') && yo.filas.h.length >= 2 && !yo.masa) jugada = esp('lodo');
      else if (esp('cuerda') && m && aporte(m.c) >= 9 && !yo.masa) jugada = esp('cuerda');
      else if (esp('reaccion') && m && aporte(m.c) >= 8) jugada = esp('reaccion');
      else if (esp('masa') && tE >= tY && Math.random() < 0.3) jugada = esp('masa');
      else {
        // la carta más chica que lo ponga al frente; si ninguna basta, la más grande
        jugada = fuerzas.find((c) => tE + aporte(c) > tY) ?? fuerzas[fuerzas.length - 1];
        // si ya ganó una ronda y la diferencia es enorme, mejor rendirse en esta
        const posible = fuerzas.slice(-3).reduce((s, c) => s + aporte(c), 0);
        if (el.rondas === 1 && yo.rondas === 0 && tY - tE > posible) jugada = undefined;
      }
    }
    if (!jugada) {
      el.paso = true;
      this.msg(`${this.rival.nombre} pasa.`);
    } else {
      audio.sfx('card');
      this.msg(this.jugar(el, yo, jugada));
    }
    this.siguiente('el');
  }

  private cerrarRonda() {
    const tY = this.total(this.yo), tE = this.total(this.el);
    let r: string;
    if (tY > tE) { this.yo.rondas++; r = `Ganas la ronda ${this.ronda}: ΣF ${tY} N contra ${tE} N`; audio.sfx('correct'); }
    else if (tE > tY) { this.el.rondas++; r = `${this.rival.nombre} gana la ronda ${this.ronda}: ${tE} N contra ${tY} N`; audio.sfx('wrong'); }
    else { this.yo.rondas++; this.el.rondas++; r = `Empate en la ronda ${this.ronda} (${tY} N): punto para los dos`; }
    this.msg(r);
    const fin = this.yo.rondas >= 2 || this.el.rondas >= 2 || this.ronda >= 3;
    this.time.delayedCall(1600, () => {
      if (fin) return this.final();
      // nueva ronda: se limpian las filas; empieza quien perdió
      this.ronda++;
      for (const l of [this.yo, this.el]) { l.filas = { h: [], r: [], p: [] }; l.lodo = 0; l.masa = false; l.paso = false; }
      const empiezoYo = tE >= tY;
      this.msg(`Ronda ${this.ronda}: ${empiezoYo ? 'empiezas tú' : `empieza ${this.rival.nombre}`}. Te quedan ${this.yo.mano.length} cartas.`);
      this.siguiente(empiezoYo ? 'el' : 'yo');
    });
  }

  private final() {
    const gane = this.yo.rondas > this.el.rondas;
    const empate = this.yo.rondas === this.el.rondas;
    const premio = gane ? this.apuesta * 2 : empate ? this.apuesta : 0;
    if (premio) addErgios(premio);
    const enc = gane ? completarEncargo('duelo') : 0;
    saveLocal();
    this.hud.refresh();
    logEvent('minijuego_fin', '', gane, { juego: 'tira', rival: this.rival.id, apuesta: this.apuesta, premio });
    this.layer.removeAll(true);
    const g = this.add.graphics().setDepth(30);
    frame(g, W / 2 - 260, 160, 520, 200, 0x0b090e, gane ? UI.gold : UI.border, 0.97);
    title(this, W / 2, 200, gane ? '¡Ganaste el duelo!' : empate ? 'Empate' : 'Perdiste el duelo', 36, gane ? CSS.gold : CSS.dim).setDepth(31);
    txt(this, W / 2, 250, gane ? `+${premio} ${T.moneda} (el doble de tu apuesta)` : empate ? `Recuperas tu apuesta (${premio} ${T.moneda})` : `${this.rival.nombre} se queda con tus ${this.apuesta} ${T.moneda}.`, 21, CSS.bone).setOrigin(0.5).setDepth(31);
    this.msgT.setText(enc ? `¡Encargo cumplido! +${enc} ${T.moneda}` : '');
    button(this, W / 2, 320, 220, 44, T.runa.continuar, () => this.salir(), { size: 22, color: UI.gold }).setDepth(31);
    audio.sfx(gane ? 'victory' : 'defeat');
  }

  private salir() {
    fadeTo(this, this.volver, { floor: this.floor });
  }

  private msg(s: string) {
    this.msgT.setText(s).setAlpha(1);
  }

  // ───────── dibujo ─────────
  private dibujar() {
    this.layer.removeAll(true);
    const L = (o: Phaser.GameObjects.GameObject) => this.layer.add(o);
    const tY = this.total(this.yo), tE = this.total(this.el);
    // marcador
    L(txt(this, 20, 50, `${this.rival.nombre}  ${'●'.repeat(this.el.rondas)}${'○'.repeat(2 - Math.min(2, this.el.rondas))}${this.el.paso ? '  (pasó)' : ''}  · cartas: ${this.el.mano.length}`, 18, '#e08a8a'));
    L(txt(this, 20, 338, `Tú  ${'●'.repeat(this.yo.rondas)}${'○'.repeat(2 - Math.min(2, this.yo.rondas))}${this.yo.paso ? '  (pasaste)' : ''}  · Ronda ${this.ronda} de 3 · apuesta ${this.apuesta} ${T.moneda}`, 18, CSS.green));
    // filas
    const fila = (l: Lado, f: Fila, y: number, rival: boolean) => {
      const g = this.add.graphics();
      frame(g, 100, y - 16, 640, 32, rival ? 0x1a0e0e : 0x0e1a10, 0x3a3030, 0.9);
      L(g);
      const lt = txt(this, 108, y, `${FILAS[f].nombre}${f === 'h' && l.lodo && !l.masa ? ` (lodo −${2 * l.lodo})` : ''}`, 16, CSS.dim).setOrigin(0, 0.5);
      lt.setInteractive();
      this.tip.attach(lt, FILAS[f].nombre, FILAS[f].info);
      L(lt);
      l.filas[f].forEach((c, i) => {
        const x = 250 + i * 54;
        const cg = this.add.graphics();
        cg.fillStyle(rival ? 0x4a2020 : 0x204a2a, 1).fillRect(x - 24, y - 13, 48, 26);
        L(cg);
        L(txt(this, x, y, `${aporte(c)}`, 18, CSS.bone).setOrigin(0.5));
      });
      L(txt(this, 732, y, `${this.totalFila(l, f)}`, 20, rival ? '#e08a8a' : CSS.green).setOrigin(1, 0.5));
    };
    FILAS_ORDEN.forEach((f, i) => fila(this.el, f, 92 + i * 36, true));
    FILAS_ORDEN.forEach((f, i) => fila(this.yo, f, 240 + i * 36, false));
    if (this.el.masa) L(txt(this, 748, 128, '🛡 Masa', 15, '#e08a8a').setOrigin(0, 0.5));
    if (this.yo.masa) L(txt(this, 748, 276, '🛡 Masa', 15, CSS.green).setOrigin(0, 0.5));
    // la cuerda
    const rg = this.add.graphics();
    rg.lineStyle(4, 0xa89070, 1).lineBetween(100, 200, 740, 200);
    const dx = Phaser.Math.Clamp((tY - tE) * 6, -300, 300);
    rg.fillStyle(0xe8c15a, 1).fillCircle(420 + dx, 200, 9);
    rg.lineStyle(1, 0x5a4a3a, 1).lineBetween(420, 188, 420, 212);
    L(rg);
    L(txt(this, 760, 200, `ΣF: ${tY} vs ${tE}`, 19, tY > tE ? CSS.green : tY < tE ? '#e08a8a' : CSS.bone).setOrigin(0, 0.5));
    // tu mano
    this.yo.mano.forEach((c, i) => {
      const x = 58 + i * 92, y = 448;
      const ok = this.turnoYo && !this.yo.paso && !this.ocupado && this.puedeJugar(this.yo, c);
      const b: Btn = button(this, x, y, 86, 74, '', () => this.clicCarta(c), { size: 15, enabled: ok, color: c.esp ? 0x8e5bb0 : c.fila === 'p' ? 0x3f6aa8 : c.fila === 'r' ? 0x4f8a3a : 0xa8323e, silent: true });
      b.label.setText(c.esp ? `${nombreCarta(c)}` : `${nombreCarta(c)}\n${c.fila === 'r' ? `${c.F}·cos${c.theta}°` : c.fila === 'p' ? `${c.F}×2` : `F = ${c.F}`}\n= ${aporte(c)} N`).setWordWrapWidth(80);
      if (c.esp) this.tip.attach(b, ESPECIALES[c.esp].nombre, ESPECIALES[c.esp].info);
      else this.tip.attach(b, nombreCarta(c), FILAS[c.fila!].info);
      L(b);
    });
    const pb = button(this, W - 80, 510, 140, 40, 'Pasar', () => this.pasar(), { size: 20, enabled: this.turnoYo && !this.yo.paso && !this.ocupado });
    L(pb);
  }
}
