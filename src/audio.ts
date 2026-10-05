// ════════════════════════════════════════════════════════════════
//  MÚSICA DUNGEON SYNTH GENERADA EN VIVO + EFECTOS DE SONIDO
//  (drones, coro sintético, clavecín, órgano y tambores de guerra)
//  No usa archivos: todo se sintetiza con Web Audio.
//  Para usar pistas propias, ve a MUSIC_FILES en src/config.ts.
// ════════════════════════════════════════════════════════════════
import { MUSIC_FILES } from './config';

export type TrackId = 'menu' | 'mapa' | 'combate' | 'combate2' | 'jefe' | 'calma' | 'santuario' | 'mapa2' | 'combate3' | 'jefe2' | 'mapa3' | 'combate4' | 'jefe3';
export type Sfx = 'click' | 'card' | 'hit' | 'block' | 'heal' | 'correct' | 'wrong' | 'coin' | 'stop' | 'victory' | 'defeat' | 'hover';

const LEVELS = [0, 0.3, 0.6, 1];
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

interface TrackDef {
  bpm: number;
  chords: number[][]; // una por compás (16 pasos)
  pad?: number; // volumen del pad
  padCut?: number;
  bass?: string; // 16 pasos: x = raíz, o = octava, - = quinta, . = silencio
  bassOct?: number;
  arp?: string; // 16 pasos: 1 = nota del arpegio
  arpOct?: number;
  kick?: string;
  snare?: string;
  hat?: string;
  bells?: boolean;
  lead?: (number | null)[]; // 64 pasos (4 compases) de melodía
  drone?: number; // volumen del drone grave (raíz + quinta) que suena todo el compás
  choir?: number; // volumen del coro sintético (vocal «ah»)
  tom?: string; // 16 pasos: tambor de guerra (1 = golpe, 2 = golpe fuerte)
  grit?: string; // 16 pasos: bajo distorsionado (x = raíz, b = segunda menor, t = tritono, o = octava)
  gritOct?: number;
  knell?: boolean; // campana fúnebre grave al inicio de cada compás (raíz + tritono)
  leadLen?: number; // duración de cada nota de la melodía, en pasos (3.5 por omisión)
}

// Notas MIDI: 36 = Do2, 48 = Do3, 60 = Do4. Acordes de una tríada por compás.
// El estilo es «dungeon synth»: lento, modal (eólico, frigio, menor armónico),
// con drones, coro y clavecín; nada de hi-hats ni cajas electrónicas.
const TRACKS: Record<TrackId, TrackDef> = {
  // Re menor armónico: la entrada de la cripta
  menu: {
    bpm: 50,
    chords: [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]],
    drone: 0.09, choir: 0.07, pad: 0.05, padCut: 500,
    arp: '1.......1...1...', arpOct: 12,
    lead: [
      74, null, null, null, null, null, 72, null, 70, null, null, null, 69, null, null, null,
      70, null, null, null, null, null, 69, null, 67, null, null, null, null, null, null, null,
      67, null, null, null, 69, null, 70, null, 72, null, null, null, 70, null, 69, null,
      69, null, null, null, null, null, null, null, 73, null, null, null, null, null, null, null,
    ],
  },
  // La menor eólico: caminar por las criptas
  mapa: {
    bpm: 58,
    chords: [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]],
    drone: 0.08, choir: 0.05, pad: 0.05, padCut: 600,
    arp: '1...1...1...1.1.', arpOct: 0,
    tom: '1...............',
    bells: true,
  },
  // Mi menor: combate (tambores de guerra y clavecín)
  combate: {
    bpm: 84,
    chords: [[52, 55, 59], [48, 52, 55], [45, 48, 52], [47, 51, 54]],
    drone: 0.07, choir: 0.05, pad: 0.04, padCut: 800,
    arp: '1.1.1.1.1.1.1.1.', arpOct: 12,
    bass: 'x.......x...x...', bassOct: -24,
    tom: '2..1..1.2...1.1.',
  },
  // Sol menor: segunda pista de combate
  combate2: {
    bpm: 78,
    chords: [[55, 58, 62], [51, 55, 58], [48, 51, 55], [50, 54, 57]],
    drone: 0.07, choir: 0.06, pad: 0.04, padCut: 700,
    arp: '1..1..1.1..1..1.', arpOct: 12,
    bass: 'x.....x.x.......', bassOct: -24,
    tom: '2.....1.2...1...',
  },
  // Do menor armónico: jefe del Acto I
  jefe: {
    bpm: 96,
    chords: [[48, 51, 55], [44, 48, 51], [41, 44, 48], [43, 47, 50]],
    drone: 0.09, choir: 0.08, pad: 0.05, padCut: 1000,
    arp: '1.11.11.1.11.11.', arpOct: 12,
    bass: 'x...x...x...x.x.', bassOct: -24,
    tom: '2.1.1...2.1.1.1.',
    lead: [
      72, null, null, null, 75, null, 74, null, 72, null, null, null, 70, null, 67, null,
      68, null, null, null, 72, null, 70, null, 68, null, null, null, 67, null, 65, null,
      65, null, null, null, 68, null, 67, null, 65, null, null, null, 63, null, 62, null,
      67, null, null, null, 71, null, 74, null, 72, null, null, null, null, null, null, null,
    ],
  },
  // ── Acto II: frigio, más grave y húmedo ──
  mapa2: {
    bpm: 48,
    chords: [[52, 55, 59], [53, 57, 60], [52, 55, 59], [50, 53, 57]],
    drone: 0.1, choir: 0.07, pad: 0.04, padCut: 450,
    arp: '1.......1..1....', arpOct: 0,
    tom: '1...............',
  },
  combate3: {
    bpm: 80,
    chords: [[52, 55, 59], [53, 57, 60], [50, 53, 57], [53, 57, 60]],
    drone: 0.08, choir: 0.06, pad: 0.04, padCut: 650,
    arp: '1.1.11.11.1.11.1', arpOct: 0,
    bass: 'x...x...x...x.x.', bassOct: -24,
    tom: '2..1..1.2..1..1.',
  },
  jefe2: {
    bpm: 92,
    chords: [[47, 50, 54], [48, 52, 55], [47, 50, 54], [45, 48, 52]],
    drone: 0.09, choir: 0.09, pad: 0.05, padCut: 900,
    arp: '1111111111111111', arpOct: 12,
    bass: 'x.x.x.x.x.x.x.x.', bassOct: -24,
    tom: '2.1.2.1.2.1.2.11',
    lead: [
      71, null, null, null, 72, null, 71, null, 69, null, null, null, 67, null, null, null,
      72, null, null, null, 74, null, 72, null, 71, null, null, null, 69, null, null, null,
      71, null, null, null, 72, null, 74, null, 76, null, null, null, 74, null, 72, null,
      71, null, null, null, 69, null, 67, null, 66, null, null, null, null, null, null, null,
    ],
  },
  // ── Acto III: la Torre del Tomo (órgano y coro, Si menor armónico) ──
  mapa3: {
    bpm: 52,
    chords: [[47, 50, 54], [43, 47, 50], [45, 48, 52], [42, 46, 49]],
    drone: 0.09, choir: 0.08, pad: 0.05, padCut: 600,
    bells: true,
    arp: '1.......1.......', arpOct: 12,
  },
  combate4: {
    bpm: 86,
    chords: [[47, 50, 54], [43, 47, 50], [48, 52, 55], [42, 46, 49]],
    drone: 0.08, choir: 0.07, pad: 0.04, padCut: 750,
    arp: '1.11.1.11.1.11.1', arpOct: 12,
    bass: 'x..x....x..x....', bassOct: -24,
    tom: '2..1..1.2..1.11.',
  },
  jefe3: {
    // Hibbelerius (v0.11): más lento y oscuro, inspirado en Loop Hero.
    // Si menor locrio: el tritono (Si–Fa) y la segunda menor (Si–Do) dan la tensión.
    bpm: 76,
    chords: [[47, 50, 53], [48, 51, 55], [47, 50, 54], [41, 44, 48]],
    drone: 0.12, choir: 0.08, pad: 0.04, padCut: 650,
    knell: true,
    grit: 'x..x..x.x..b..t.', gritOct: -24,
    arp: '1.1.1.1.1.1.1.1.', arpOct: 12,
    tom: '2.....1.2...1.1.',
    leadLen: 6,
    lead: [
      59, null, null, null, null, null, null, null, 60, null, null, null, 59, null, 57, null,
      55, null, null, null, null, null, null, null, 56, null, null, null, null, null, null, null,
      59, null, null, null, 62, null, null, null, 65, null, null, null, 64, null, 62, null,
      65, null, null, null, null, null, null, null, 59, null, null, null, null, null, null, null,
    ],
  },
  // figuras históricas: coro etéreo en modo lidio
  santuario: {
    bpm: 46,
    chords: [[53, 57, 60, 64], [55, 59, 62, 66], [53, 57, 60, 64], [52, 55, 59, 62]],
    choir: 0.09, pad: 0.06, padCut: 1200,
    bells: true,
    arp: '1.......1.......', arpOct: 24,
  },
  // fogata, encuentros, mercader (si no hay archivo MP3)
  calma: {
    bpm: 50,
    chords: [[57, 60, 64], [52, 55, 59], [53, 57, 60], [52, 56, 59]],
    drone: 0.07, choir: 0.05, pad: 0.06, padCut: 550,
    bells: true,
  },
};

class Sequencer {
  out: GainNode;
  private step = 0;
  private next = 0;
  private timer = 0;
  constructor(private eng: AudioEngine, private def: TrackDef) {
    const ctx = eng.ctx!;
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(eng.musicBus!);
    this.out.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
    this.next = ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.tick(), 25);
  }
  stop() {
    const ctx = this.eng.ctx!;
    const g = this.out.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    window.setTimeout(() => {
      clearInterval(this.timer);
      this.out.disconnect();
    }, 1400);
  }
  private tick() {
    const ctx = this.eng.ctx!;
    const dt = 60 / this.def.bpm / 4;
    while (this.next < ctx.currentTime + 0.15) {
      this.play(this.step, this.next, dt);
      this.step++;
      this.next += dt;
    }
  }
  private play(step: number, t: number, dt: number) {
    const d = this.def;
    const s16 = step % 16;
    const bar = Math.floor(step / 16) % d.chords.length;
    const chord = d.chords[bar];
    const e = this.eng;
    if (s16 === 0 && d.pad) e.pad(this.out, chord, t, dt * 16, d.pad, d.padCut ?? 900);
    if (s16 === 0 && d.drone) e.drone(this.out, chord[0] - 24, t, dt * 16, d.drone);
    if (s16 === 0 && d.choir) e.choir(this.out, chord, t, dt * 16, d.choir);
    if (d.tom && d.tom[s16] !== '.' && d.tom[s16]) e.tom(this.out, t, d.tom[s16] === '2' ? 0.55 : 0.32);
    if (d.bass) {
      const c = d.bass[s16];
      const root = chord[0] + (d.bassOct ?? -24);
      if (c === 'x') e.bass(this.out, root, t, dt * (d.bass[s16 + 1] === '.' ? 3 : 0.9));
      if (c === 'o') e.bass(this.out, root + 12, t, dt * 0.9);
      if (c === '-') e.bass(this.out, root + 7, t, dt * 2);
    }
    if (d.grit) {
      const c = d.grit[s16];
      const root = chord[0] + (d.gritOct ?? -24);
      const off = c === 'x' ? 0 : c === 'b' ? 1 : c === 't' ? 6 : c === 'o' ? 12 : null;
      if (off !== null) e.grit(this.out, root + off, t, dt * (d.grit[s16 + 1] === '.' ? 2.6 : 0.9));
    }
    if (d.knell && s16 === 0) e.knell(this.out, chord[0], t);
    if (d.arp && d.arp[s16] === '1') {
      const seq = [0, 1, 2, 1, 2, 0, 1, 2];
      const n = chord[seq[step % seq.length]] + (d.arpOct ?? 0) + (step % 32 >= 16 && d.bpm > 100 ? 12 : 0);
      e.pluck(this.out, n, t, d.bpm > 100 ? 0.07 : 0.1);
    }
    if (d.kick && d.kick[s16] === '1') e.kick(this.out, t);
    if (d.snare && d.snare[s16] === '1') e.snare(this.out, t);
    if (d.hat && d.hat[s16] === '1') e.hat(this.out, t, s16 % 4 === 2 ? 0.07 : 0.035);
    if (d.lead) {
      const n = d.lead[step % d.lead.length];
      if (n) e.lead(this.out, n, t, dt * (d.leadLen ?? 3.5));
    }
    if (d.bells && s16 % 8 === 4 && Math.random() < 0.6) {
      const n = chord[Math.floor(Math.random() * 3)] + 12;
      e.bell(this.out, n, t);
    }
  }
}

export class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  musicBus: GainNode | null = null;
  sfxBus: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private delay: DelayNode | null = null;
  private noise: AudioBuffer | null = null;
  private seq: Sequencer | null = null;
  private fileEl: HTMLAudioElement | null = null;
  private current: TrackId | null = null;
  private wanted: TrackId | null = null;
  level = 2;

  constructor() {
    try {
      const v = localStorage.getItem('criptas:volumen');
      if (v !== null) this.level = Math.max(0, Math.min(3, Number(v)));
    } catch { /* nada */ }
    const unlock = () => {
      this.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  unlock() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = LEVELS[this.level];
    this.master.connect(ctx.destination);
    // compresor suave para unificar
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 3;
    comp.connect(this.master);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.55;
    this.musicBus.connect(comp);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.7;
    this.sfxBus.connect(comp);
    // reverberación generada
    const len = ctx.sampleRate * 4.5;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = ir;
    const rvGain = ctx.createGain();
    rvGain.gain.value = 0.5;
    this.reverb.connect(rvGain).connect(this.musicBus);
    // eco
    this.delay = ctx.createDelay(1);
    this.delay.delayTime.value = 0.36;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    this.delay.connect(lp).connect(fb).connect(this.delay);
    this.delay.connect(this.musicBus);
    // ruido para percusión
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    if (this.wanted) {
      const w = this.wanted;
      this.current = null;
      this.play(w);
    }
  }

  setLevel(n: number) {
    this.level = (n + 4) % 4;
    try { localStorage.setItem('criptas:volumen', String(this.level)); } catch { /* nada */ }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(LEVELS[this.level], this.ctx.currentTime, 0.05);
    if (this.fileEl) this.fileEl.volume = LEVELS[this.level] * 0.8;
  }

  play(track: TrackId) {
    this.wanted = track;
    if (!this.ctx || this.current === track) return;
    this.current = track;
    this.seq?.stop();
    this.seq = null;
    if (this.fileEl) {
      const old = this.fileEl;
      this.fadeEl(old, 0, () => old.pause());
      this.fileEl = null;
    }
    const file = MUSIC_FILES[track];
    if (file) {
      const el = new Audio(`./musica/${file}`);
      el.loop = true;
      el.volume = 0;
      el.play().catch(() => { /* espera a interacción */ });
      this.fadeEl(el, LEVELS[this.level] * 0.8);
      this.fileEl = el;
    } else {
      this.seq = new Sequencer(this, TRACKS[track]);
    }
  }

  private fadeEl(el: HTMLAudioElement, to: number, done?: () => void) {
    const from = el.volume;
    let i = 0;
    const id = setInterval(() => {
      i++;
      el.volume = Math.max(0, Math.min(1, from + ((to - from) * i) / 20));
      if (i >= 20) {
        clearInterval(id);
        done?.();
      }
    }, 60);
  }

  // ───────── instrumentos ─────────
  private env(g: GainNode, t: number, a: number, peak: number, d: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  pad(out: AudioNode, notes: number[], t: number, dur: number, vol: number, cut: number) {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(cut * 0.6, t);
    f.frequency.linearRampToValueAtTime(cut, t + dur * 0.5);
    f.frequency.linearRampToValueAtTime(cut * 0.6, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(1, dur * 0.3));
    g.gain.setValueAtTime(vol, t + dur * 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + dur * 1.05);
    f.connect(g);
    g.connect(out);
    g.connect(this.reverb!);
    for (const n of notes) {
      for (const det of [-8, 8]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = mtof(n);
        o.detune.value = det;
        o.connect(f);
        o.start(t);
        o.stop(t + dur * 1.1);
      }
    }
  }

  bass(out: AudioNode, n: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = mtof(n);
    const sub = ctx.createOscillator();
    sub.type = 'square';
    sub.frequency.value = mtof(n - 12);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 6;
    f.frequency.setValueAtTime(1400, t);
    f.frequency.exponentialRampToValueAtTime(220, t + Math.max(0.08, dur));
    const g = ctx.createGain();
    this.env(g, t, 0.005, 0.22, Math.max(0.08, dur));
    const sg = ctx.createGain();
    sg.gain.value = 0.35;
    o.connect(f);
    sub.connect(sg).connect(f);
    f.connect(g).connect(out);
    o.start(t);
    sub.start(t);
    o.stop(t + dur + 0.1);
    sub.stop(t + dur + 0.1);
  }

  /** Clavecín oscuro: dos dientes de sierra (nota y octava) con ataque brillante y caída rápida */
  pluck(out: AudioNode, n: number, t: number, vol: number) {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 2;
    f.frequency.setValueAtTime(2600, t);
    f.frequency.exponentialRampToValueAtTime(500, t + 0.35);
    const g = ctx.createGain();
    this.env(g, t, 0.003, vol * 0.8, 0.55);
    for (const [mul, type] of [[1, 'sawtooth'], [2, 'triangle']] as [number, OscillatorType][]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = mtof(n) * mul;
      o.connect(f);
      o.start(t);
      o.stop(t + 0.65);
    }
    f.connect(g);
    g.connect(out);
    g.connect(this.delay!);
    g.connect(this.reverb!);
  }

  /** Drone grave: raíz y quinta con un filtro que respira lentamente */
  drone(out: AudioNode, n: number, t: number, dur: number, vol: number) {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(180, t);
    f.frequency.linearRampToValueAtTime(320, t + dur * 0.5);
    f.frequency.linearRampToValueAtTime(180, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * 0.2);
    g.gain.setValueAtTime(vol, t + dur * 0.85);
    g.gain.linearRampToValueAtTime(0.0001, t + dur * 1.08);
    f.connect(g).connect(out);
    for (const [k, type] of [[0, 'sawtooth'], [7, 'sawtooth'], [-12, 'triangle']] as [number, OscillatorType][]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = mtof(n + k);
      o.detune.value = (Math.random() - 0.5) * 10;
      o.connect(f);
      o.start(t);
      o.stop(t + dur * 1.1);
    }
  }

  /** Coro sintético: dientes de sierra desafinados pasados por formantes de la vocal «ah» */
  choir(out: AudioNode, notes: number[], t: number, dur: number, vol: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(1.6, dur * 0.35));
    g.gain.setValueAtTime(vol, t + dur * 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + dur * 1.1);
    g.connect(out);
    g.connect(this.reverb!);
    const mix = ctx.createGain();
    mix.gain.value = 1;
    for (const [fr, q, v] of [[730, 8, 1], [1090, 10, 0.5], [2440, 12, 0.25]]) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = fr;
      bp.Q.value = q;
      const bg = ctx.createGain();
      bg.gain.value = v * 2.2;
      mix.connect(bp).connect(bg).connect(g);
    }
    for (const n of notes) {
      for (const det of [-14, 0, 13]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = mtof(n);
        o.detune.value = det;
        const vib = ctx.createOscillator();
        vib.frequency.value = 4.5 + Math.random();
        const vg = ctx.createGain();
        vg.gain.value = 5;
        vib.connect(vg).connect(o.detune);
        o.connect(mix);
        o.start(t);
        vib.start(t);
        o.stop(t + dur * 1.15);
        vib.stop(t + dur * 1.15);
      }
    }
  }

  /** Tambor de guerra: golpe grave con piel (seno que cae de tono + ruido) */
  tom(out: AudioNode, t: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.35);
    const g = ctx.createGain();
    this.env(g, t, 0.003, vol, 0.6);
    o.connect(g);
    g.connect(out);
    g.connect(this.reverb!);
    o.start(t);
    o.stop(t + 0.7);
    this.noiseHit(out, t, 'lowpass', 600, vol * 0.25, 0.12);
  }

  private gritCurve: Float32Array | null = null;
  /** Bajo distorsionado (estilo Loop Hero): sierra + cuadrada por un saturador */
  grit(out: AudioNode, n: number, t: number, dur: number) {
    const ctx = this.ctx!;
    if (!this.gritCurve) {
      const c = new Float32Array(1024);
      for (let i = 0; i < c.length; i++) {
        const x = (i / (c.length - 1)) * 2 - 1;
        c[i] = Math.tanh(x * 6) * 0.8;
      }
      this.gritCurve = c;
    }
    const sh = ctx.createWaveShaper();
    sh.curve = this.gritCurve as Float32Array<ArrayBuffer>;
    sh.oversample = '2x';
    const pre = ctx.createGain();
    pre.gain.value = 0.9;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 3;
    f.frequency.setValueAtTime(1100, t);
    f.frequency.exponentialRampToValueAtTime(260, t + Math.max(0.1, dur));
    const g = ctx.createGain();
    this.env(g, t, 0.006, 0.13, Math.max(0.1, dur));
    for (const [type, k, det] of [['sawtooth', 0, -8], ['square', 0, 8], ['sine', -12, 0]] as [OscillatorType, number, number][]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = mtof(n + k);
      o.detune.value = det;
      o.connect(pre);
      o.start(t);
      o.stop(t + dur + 0.15);
    }
    pre.connect(sh).connect(f).connect(g).connect(out);
  }

  /** Campana fúnebre grave: la raíz y su tritono, con mucha reverberación */
  knell(out: AudioNode, n: number, t: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    this.env(g, t, 0.004, 0.09, 3.2);
    g.connect(out);
    g.connect(this.reverb!);
    for (const [k, r, v] of [[0, 1, 1], [0, 2.76, 0.4], [6, 1, 0.5], [0, 5.4, 0.2]] as [number, number, number][]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = mtof(n + k - 12) * r;
      const og = ctx.createGain();
      og.gain.value = v;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 3.4);
    }
  }

  /** Órgano: onda cuadrada con vibrato lento (la melodía de los jefes y del menú) */
  lead(out: AudioNode, n: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = mtof(n);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 4.2;
    const lg = ctx.createGain();
    lg.gain.value = 6;
    lfo.connect(lg).connect(o.detune);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.08);
    g.gain.setValueAtTime(0.06, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g);
    g.connect(out);
    g.connect(this.delay!);
    g.connect(this.reverb!);
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
  }

  bell(out: AudioNode, n: number, t: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    this.env(g, t, 0.005, 0.05, 2.2);
    g.connect(out);
    g.connect(this.reverb!);
    for (const [mul, v] of [[1, 1], [2.76, 0.4], [5.4, 0.15]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = mtof(n) * mul;
      const og = ctx.createGain();
      og.gain.value = v;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 2.4);
    }
  }

  kick(out: AudioNode, t: number, vol = 0.55) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    const g = ctx.createGain();
    this.env(g, t, 0.002, vol, 0.28);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.35);
  }

  private noiseHit(out: AudioNode, t: number, type: BiquadFilterType, freq: number, vol: number, dec: number, q = 1) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    this.env(g, t, 0.002, vol, dec);
    s.connect(f).connect(g).connect(out);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dec + 0.05);
    return g;
  }

  snare(out: AudioNode, t: number) {
    const g = this.noiseHit(out, t, 'bandpass', 1800, 0.25, 0.16, 0.8);
    g.connect(this.reverb!);
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.08);
    const og = ctx.createGain();
    this.env(og, t, 0.002, 0.15, 0.1);
    o.connect(og).connect(out);
    o.start(t);
    o.stop(t + 0.15);
  }

  hat(out: AudioNode, t: number, vol: number) {
    this.noiseHit(out, t, 'highpass', 7500, vol, 0.045);
  }

  // ───────── efectos ─────────
  sfx(name: Sfx) {
    const ctx = this.ctx;
    if (!ctx || this.level === 0) return;
    const t = ctx.currentTime + 0.005;
    const out = this.sfxBus!;
    const tone = (type: OscillatorType, f: number, at: number, dur: number, vol: number, f2?: number) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f, at);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + dur);
      const g = ctx.createGain();
      this.env(g, at, 0.003, vol, dur);
      o.connect(g).connect(out);
      o.start(at);
      o.stop(at + dur + 0.05);
    };
    switch (name) {
      case 'hover':
        tone('sine', 1400, t, 0.03, 0.03);
        break;
      case 'click':
        tone('square', 660, t, 0.05, 0.06, 880);
        break;
      case 'card':
        this.noiseHit(out, t, 'bandpass', 2500, 0.18, 0.12, 2);
        break;
      case 'hit':
        this.noiseHit(out, t, 'lowpass', 900, 0.5, 0.14);
        tone('sine', 110, t, 0.16, 0.5, 40);
        break;
      case 'block':
        tone('triangle', 1250, t, 0.18, 0.12);
        tone('triangle', 1870, t, 0.12, 0.06);
        break;
      case 'heal':
      case 'correct':
        [0, 4, 7, 12].forEach((s, i) => tone('sine', mtof(72 + s), t + i * 0.07, 0.25, 0.12));
        break;
      case 'wrong':
        tone('sawtooth', 110, t, 0.4, 0.08, 98);
        tone('sawtooth', 116, t, 0.4, 0.08, 104);
        break;
      case 'coin':
        tone('square', 1320, t, 0.06, 0.06);
        tone('square', 1760, t + 0.06, 0.12, 0.06);
        break;
      case 'stop':
        this.kick(out, t, 0.9);
        tone('sawtooth', 80, t, 0.5, 0.15, 40);
        break;
      case 'victory':
        [0, 3, 7, 12, 15].forEach((s, i) => tone('triangle', mtof(64 + s), t + i * 0.09, 0.5, 0.1));
        break;
      case 'defeat':
        [12, 8, 5, 0].forEach((s, i) => tone('triangle', mtof(52 + s), t + i * 0.18, 0.6, 0.1));
        break;
    }
  }
}

export const audio = new AudioEngine();
