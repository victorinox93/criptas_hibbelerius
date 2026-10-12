// ─────────────────────────────────────────────────────────────
//  RELICARIO-93 · arranque estilo «consola ficticia» (como UFO 50)
//  Capa HTML encima del juego: abres el estuche, metes el disco en la
//  consola, se lee y al presionar INICIAR aparece la portada del juego.
//  Phaser carga por debajo mientras tanto.
//
//  Cuándo sale: ARRANQUE en src/config.ts ('siempre' | 'sesion' | 'nunca').
//  Se puede saltar con el botón «Saltar» o con Esc.
// ─────────────────────────────────────────────────────────────
import './arranque.css';
import { ARRANQUE } from '../config';

const CLAVE = 'criptas:arranque';
const LEVELS = [0, 0.3, 0.6, 1]; // mismos niveles que audio.ts

const HTML = `
<div class="rl-barra">
  <span class="rl-marca-barra">Relicario-93</span>
  <button class="rl-saltar" type="button" data-rl="saltar">Saltar ▸</button>
</div>
<main class="rl-sala">
  <section class="rl-tv" aria-label="Monitor">
    <div class="rl-crt">
      <canvas class="rl-ruido" data-rl="ruido" width="160" height="120" aria-hidden="true"></canvas>
      <div class="rl-capa rl-msg" data-rl="msg"><b>SIN DISCO</b><span>Inserta un disco en el Relicario</span></div>
      <pre class="rl-capa rl-boot" data-rl="boot" hidden></pre>
      <div class="rl-capa rl-titulo" data-rl="titulo" hidden>
        <p class="rl-t-eyebrow">RELICARIO-93 PRESENTA</p>
        <h2 class="rl-t-nombre">Las Criptas de<span>Hibbelerius</span></h2>
        <p class="rl-t-sub">Un roguelike de Dinámica</p>
        <button class="rl-start" type="button" data-rl="iniciar">▶ PRESIONA INICIAR</button>
      </div>
    </div>
    <div class="rl-tv-pie"><span>MONITOR · CANAL 3</span><span class="rl-perillas"><i class="rl-perilla"></i><i class="rl-perilla"></i></span></div>
  </section>

  <section class="rl-mesa" aria-label="Mesa">
    <div class="rl-estuche-zona">
      <div class="rl-estuche" data-rl="estuche" role="button" tabindex="0" aria-label="Estuche del disco. Abrir">
        <div class="rl-bandeja">
          <div class="rl-slot-case" data-rl="slotCase">
            <div class="rl-disco" data-rl="disco" tabindex="-1" role="button" aria-label="Disco: Las Criptas de Hibbelerius. Meter en la consola">
              <canvas data-rl="discoArte" width="512" height="512"></canvas>
            </div>
          </div>
        </div>
        <div class="rl-tapa">
          <div class="rl-cara rl-frente"><canvas data-rl="portada" width="568" height="500"></canvas></div>
          <div class="rl-cara rl-dorso">
            <h3>Manual</h3>
            <ol>
              <li>Saca el disco con cuidado.</li>
              <li>Colócalo en el Relicario.</li>
              <li>Espera a que lea la masa.</li>
            </ol>
            <p>Advertencia: este disco contiene física. ΣF = m·a</p>
          </div>
        </div>
      </div>
    </div>

    <div class="rl-consola" data-rl="consola" aria-label="Consola Relicario-93">
      <div class="rl-pozo">
        <div class="rl-slot-consola" data-rl="slotCon"></div>
        <div class="rl-tapa-consola" aria-hidden="true"></div>
      </div>
      <div class="rl-panel">
        <div class="rl-marca">Relicario<small>MODELO 93</small></div>
        <div class="rl-indicador"><span class="rl-led" data-rl="led"></span>LECTURA</div>
        <button class="rl-btn-consola" type="button" data-rl="abrir" disabled>ABRIR</button>
      </div>
      <div class="rl-puertos" aria-hidden="true"><i></i><i></i></div>
    </div>
  </section>

  <p class="rl-pista" data-rl="pista" aria-live="polite">Toca el estuche para abrirlo</p>
</main>`;

/** ¿Hay que mostrar el arranque esta vez? */
function toca(): boolean {
  if (ARRANQUE === 'nunca') return false;
  if (ARRANQUE === 'siempre') return true;
  try { return sessionStorage.getItem(CLAVE) !== '1'; } catch { return true; }
}

/** Muestra el arranque. La promesa se cumple cuando el jugador entra o lo salta. */
export function mostrarArranque(): Promise<void> {
  if (!toca()) return Promise.resolve();
  return new Promise<void>((resolver) => {
    const raiz = document.createElement('div');
    raiz.id = 'arranque';
    raiz.innerHTML = HTML;
    document.body.appendChild(raiz);
    iniciar(raiz, resolver);
  });
}

type Estado = 'cerrado' | 'abierto' | 'moviendo' | 'leyendo' | 'listo' | 'fin';

function iniciar(raiz: HTMLElement, resolver: () => void) {
  const $ = <T extends HTMLElement>(n: string) => raiz.querySelector(`[data-rl="${n}"]`) as T;
  const estuche = $('estuche'), consola = $('consola'), disco = $('disco');
  const slotCase = $('slotCase'), slotCon = $('slotCon'), pista = $('pista'), led = $('led');
  const btnAbrir = $<HTMLButtonElement>('abrir');
  const msg = $('msg'), boot = $('boot'), titulo = $('titulo');
  const ruido = $<HTMLCanvasElement>('ruido');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = (ms: number) => (reduce ? Math.min(ms, 120) : ms);
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, T(ms)));
  let estado: Estado = 'cerrado';
  let corrida = 0;
  const PISTA_ABIERTO = 'Lleva el disco a la consola (arrástralo o tócalo)';

  // ── sonido: respeta el volumen que el alumno eligió en el juego ──
  let nivel = 2;
  try { const v = localStorage.getItem('criptas:volumen'); if (v !== null) nivel = Math.max(0, Math.min(3, Number(v))); } catch { /* nada */ }
  const vol = LEVELS[nivel] ?? 0.6;
  let ac: AudioContext | null = null;
  const ctx = (): AudioContext | null => {
    if (vol <= 0) return null;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ac = ac || new AC();
      if (ac!.state === 'suspended') ac!.resume();
    } catch { ac = null; }
    return ac;
  };
  const ruidoBuf = (a: AudioContext, dur: number) => {
    const b = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };
  const sfx = {
    clack(f = 1800) {
      const a = ctx(); if (!a) return;
      const s = a.createBufferSource(); s.buffer = ruidoBuf(a, 0.06);
      const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 3;
      const g = a.createGain(); g.gain.setValueAtTime(0.5 * vol, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.06);
      s.connect(bp).connect(g).connect(a.destination); s.start();
    },
    whirr(dur = 2.6) {
      const a = ctx(); if (!a) return;
      const t = a.currentTime;
      const o = a.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(40, t); o.frequency.exponentialRampToValueAtTime(190, t + dur * 0.6);
      const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
      const g = a.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06 * vol, t + 0.3);
      g.gain.linearRampToValueAtTime(0.04 * vol, t + dur * 0.8); g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(lp).connect(g).connect(a.destination); o.start(t); o.stop(t + dur);
      for (let i = 0; i < 6; i++) setTimeout(() => sfx.clack(3200 + Math.random() * 1500), 350 + i * 260);
    },
    acorde() {
      const a = ctx(); if (!a) return;
      const t = a.currentTime;
      const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t); lp.frequency.linearRampToValueAtTime(1400, t + 1.2);
      const g = a.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12 * vol, t + 0.5); g.gain.exponentialRampToValueAtTime(0.001, t + 4.2);
      lp.connect(g).connect(a.destination);
      [45, 52, 57, 60, 64].forEach((m, i) => {
        const o = a.createOscillator(); o.type = i < 2 ? 'sawtooth' : 'triangle';
        o.frequency.value = 440 * Math.pow(2, (m - 69) / 12); o.detune.value = i % 2 ? 6 : -6;
        o.connect(lp); o.start(t + i * 0.06); o.stop(t + 4.3);
      });
    },
  };

  // ── arte: calavera con el mismo truco que mirrorHalf de sprites.ts ──
  const CALAVERA = ['..kkkkk', '.kwwwww', 'kwwwwww', 'kwwwwww', 'kwkkkww', 'kwkFkww', 'kwkkkww', 'kwwwwwk', '.kwwwww', '..kwkwk', '..kwkwk', '...kkkk']
    .map((r) => r + r.split('').reverse().join(''));
  const PAL: Record<string, string> = { k: '#0b0910', w: '#e9e1cc', F: '#d8402f' };
  const pixel = (c: CanvasRenderingContext2D, x: number, y: number, s: number) =>
    CALAVERA.forEach((fila, j) => [...fila].forEach((ch, i) => {
      if (PAL[ch]) { c.fillStyle = PAL[ch]; c.fillRect(Math.round(x + i * s), Math.round(y + j * s), Math.ceil(s), Math.ceil(s)); }
    }));

  function arteDisco() {
    const c = $<HTMLCanvasElement>('discoArte').getContext('2d'); if (!c) return;
    const R = 256, mm = R / 60;
    c.clearRect(0, 0, 512, 512); c.save(); c.translate(R, R);
    const conic = (c as any).createConicGradient ? (c as any).createConicGradient(0, 0, 0) as CanvasGradient : null;
    if (conic) {
      const cols = ['#9fb7c8', '#c9a6d6', '#a8d6c2', '#e0d29a', '#a7c3e6', '#d8a9c0', '#9fb7c8'];
      cols.forEach((col, i) => conic.addColorStop(i / (cols.length - 1), col));
      c.fillStyle = conic;
    } else c.fillStyle = '#a9b3c0';
    c.beginPath(); c.arc(0, 0, 60 * mm, 0, Math.PI * 2); c.fill();
    const rg = c.createRadialGradient(0, -10 * mm, 10 * mm, 0, 0, 58 * mm);
    rg.addColorStop(0, '#3a2142'); rg.addColorStop(1, '#120c16');
    c.fillStyle = rg; c.beginPath(); c.arc(0, 0, 58 * mm, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#c9a24e'; c.lineWidth = 1.2;
    [56, 25].forEach((r) => { c.beginPath(); c.arc(0, 0, r * mm, 0, Math.PI * 2); c.stroke(); });
    c.fillStyle = 'rgba(190,200,210,.55)'; c.beginPath(); c.arc(0, 0, 23 * mm, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 17 * mm, 0, Math.PI * 2); c.stroke();
    c.textAlign = 'center'; c.fillStyle = '#e9e1cc';
    c.font = `${7 * mm}px VT323, monospace`; c.fillText('LAS CRIPTAS DE', 0, -45 * mm);
    c.fillStyle = '#c9a24e'; c.font = `${11.5 * mm}px "Pirata One", Georgia, serif`; c.fillText('Hibbelerius', 0, -31 * mm);
    c.fillStyle = '#e9e1cc'; c.font = `${6 * mm}px VT323, monospace`;
    c.fillText('ΣF = m·a', -41 * mm, 2 * mm); c.fillText('UDEM', 41 * mm, 2 * mm);
    c.font = `${4.6 * mm}px VT323, monospace`; c.fillStyle = '#9a90a3'; c.fillText('DINÁMICA · DISCO 1 DE 1', 0, 53 * mm);
    pixel(c, -7 * mm, 30 * mm, mm);
    c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(0, 0, 7.5 * mm, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function artePortada() {
    const c = $<HTMLCanvasElement>('portada').getContext('2d'); if (!c) return;
    const W = 568, H = 500, cx = W * 0.56, cy = H * 0.5;
    const g = c.createRadialGradient(cx, H * 0.38, 20, cx, H * 0.45, W * 0.7);
    g.addColorStop(0, '#3d2246'); g.addColorStop(0.6, '#1a1020'); g.addColorStop(1, '#08060a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const piedra = (x: number, y: number) => {
      c.fillStyle = '#2b2431'; c.fillRect(x - 15, y - 12, 30, 24);
      c.strokeStyle = '#0b0910'; c.lineWidth = 3; c.strokeRect(x - 15, y - 12, 30, 24);
    };
    for (let a = Math.PI; a <= Math.PI * 2.001; a += Math.PI / 11) {
      c.save(); c.translate(cx + Math.cos(a) * 150, cy + Math.sin(a) * 150); c.rotate(a + Math.PI / 2); piedra(0, 0); c.restore();
    }
    for (const dx of [-150, 150]) for (let y = cy + 12; y < cy + 162; y += 26) piedra(cx + dx, y);
    c.save(); c.shadowColor = 'rgba(216,64,47,.55)'; c.shadowBlur = 40; pixel(c, cx - 84, cy - 108, 12); c.restore();
    c.fillStyle = '#050407'; c.fillRect(0, 0, W * 0.075, H);
    c.save(); c.translate(W * 0.05, H - 20); c.rotate(-Math.PI / 2);
    c.fillStyle = '#c9a24e'; c.font = '22px VT323, monospace'; c.fillText('RELICARIO-93  ·  SERIE DINÁMICA', 0, 0); c.restore();
    c.textAlign = 'center';
    c.fillStyle = '#e9e1cc'; c.font = '34px VT323, monospace'; c.fillText('LAS CRIPTAS DE', cx, H * 0.77);
    c.fillStyle = '#c9a24e'; c.shadowColor = '#000'; c.shadowOffsetY = 3;
    c.font = '78px "Pirata One", Georgia, serif'; c.fillText('Hibbelerius', cx, H * 0.91); c.shadowOffsetY = 0;
    c.fillStyle = '#9a90a3'; c.font = '20px VT323, monospace'; c.fillText('ROGUELIKE DE DINÁMICA · 1 JUGADOR', cx, H * 0.975);
    c.beginPath(); c.arc(W - 46, 46, 28, 0, Math.PI * 2); c.fillStyle = '#b2382c'; c.fill();
    c.fillStyle = '#e9e1cc'; c.font = '30px "Pirata One", serif'; c.fillText('93', W - 46, 56);
  }

  (async () => {
    try {
      await Promise.race([
        Promise.all([document.fonts.load('40px "Pirata One"'), document.fonts.load('40px VT323')]),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
    } catch { /* se dibuja con la tipografía de respaldo */ }
    arteDisco(); artePortada();
  })();

  // ── estática del monitor ──
  const rc = ruido.getContext('2d');
  let ruidoOn = true, cuadro = 0, raf = 0;
  const estatica = () => {
    if (!rc) return;
    const img = rc.createImageData(160, 120), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = (Math.random() * 255) | 0; d[i] = v; d[i + 1] = (v * 0.92) | 0; d[i + 2] = (v * 0.8) | 0; d[i + 3] = 255; }
    rc.putImageData(img, 0, 0);
  };
  const bucle = () => { if (ruidoOn && cuadro++ % 3 === 0) estatica(); raf = requestAnimationFrame(bucle); };
  estatica(); if (!reduce) raf = requestAnimationFrame(bucle);
  const pantalla = (modo: 'sin' | 'boot' | 'titulo') => {
    ruidoOn = modo === 'sin'; ruido.hidden = modo !== 'sin';
    msg.hidden = modo !== 'sin'; boot.hidden = modo !== 'boot'; titulo.hidden = modo !== 'titulo';
    if (modo === 'sin') estatica();
  };

  // ── movimiento del disco ──
  const levantar = () => {
    if (disco.parentElement === raiz) return;
    const r = disco.getBoundingClientRect();
    raiz.appendChild(disco);
    Object.assign(disco.style, { position: 'fixed', inset: 'auto', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    disco.classList.add('rl-volando');
  };
  const posar = (slot: HTMLElement) => { slot.appendChild(disco); disco.removeAttribute('style'); disco.classList.remove('rl-volando'); };
  const volarA = async (slot: HTMLElement, dur: number) => {
    const de = disco.getBoundingClientRect(), a = slot.getBoundingClientRect();
    const dx = a.left - de.left, dy = a.top - de.top, s = a.width / de.width;
    const anim = disco.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)' },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 50}px) scale(1.14) rotate(90deg)` },
      { transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(180deg)` },
    ], { duration: T(dur), easing: 'cubic-bezier(.45,0,.2,1)' });
    await anim.finished;
    posar(slot);
  };

  // ── flujo ──
  function abrirEstuche() {
    if (estado !== 'cerrado') return;
    estado = 'abierto'; estuche.classList.add('rl-abierto'); sfx.clack(1200);
    estuche.setAttribute('aria-label', 'Estuche abierto'); disco.tabIndex = 0; disco.focus({ preventScroll: true });
    pista.textContent = PISTA_ABIERTO;
  }
  async function aterrizar(dur: number) {
    await volarA(slotCon, dur); sfx.clack(2400); await wait(240);
    consola.classList.remove('rl-abierta'); await wait(620); sfx.clack(700);
    arrancar();
  }
  async function insertar() {
    if (estado !== 'abierto') return;
    estado = 'moviendo'; pista.textContent = '';
    levantar();
    consola.classList.add('rl-abierta'); sfx.clack(900); await wait(480);
    await aterrizar(820);
  }
  async function arrancar() {
    const id = ++corrida; estado = 'leyendo';
    led.className = 'rl-led rl-leyendo'; disco.classList.add('rl-girando'); sfx.whirr();
    pista.textContent = 'Leyendo…'; btnAbrir.disabled = false;
    pantalla('boot'); boot.textContent = '';
    const lineas = ['RELICARIO-93  BIOS v0.93', '(c) Taller de Hibbelerius', '', 'Memoria ......... 640 kJ  OK',
      'Inercia ......... CONSERVADA', 'g ............... 9.81 m/s²', 'Fricción ........ μk = 0.30', ''];
    for (const l of lineas) { await wait(170); if (id !== corrida) return; boot.textContent += l + '\n'; }
    boot.textContent += 'Leyendo disco ';
    for (let i = 0; i < 12; i++) { await wait(95); if (id !== corrida) return; boot.textContent += '▮'; }
    await wait(250); if (id !== corrida) return;
    boot.textContent += '\n\nDISCO: LAS CRIPTAS DE HIBBELERIUS\nArrancando…';
    await wait(900); if (id !== corrida) return;
    pantalla('titulo'); sfx.acorde();
    led.className = 'rl-led rl-listo'; estado = 'listo';
    pista.textContent = 'Listo. Presiona iniciar';
    $('iniciar').focus({ preventScroll: true });
  }
  async function expulsar() {
    if (estado !== 'listo' && estado !== 'leyendo') return;
    corrida++; estado = 'moviendo'; btnAbrir.disabled = true;
    disco.classList.remove('rl-girando'); led.className = 'rl-led'; pantalla('sin');
    consola.classList.add('rl-abierta'); sfx.clack(900); await wait(600);
    levantar(); await volarA(slotCase, 820); sfx.clack(1400);
    consola.classList.remove('rl-abierta');
    estado = 'abierto'; pista.textContent = PISTA_ABIERTO;
  }
  function terminar() {
    if (estado === 'fin') return;
    estado = 'fin'; corrida++;
    try { sessionStorage.setItem(CLAVE, '1'); } catch { /* nada */ }
    window.removeEventListener('keydown', teclas, true);
    raiz.classList.add('rl-fuera');
    resolver();
    setTimeout(() => { cancelAnimationFrame(raf); raiz.remove(); ac?.close().catch(() => {}); }, T(750));
  }

  estuche.addEventListener('click', (e) => { if (!disco.contains(e.target as Node)) abrirEstuche(); });
  btnAbrir.addEventListener('click', expulsar);
  $('iniciar').addEventListener('click', terminar);
  $('saltar').addEventListener('click', terminar);

  // Teclado: lo atrapamos en fase de captura para que Phaser (que escucha en window)
  // no reciba teclas mientras el arranque está encima.
  function teclas(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); terminar(); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const foco = document.activeElement as HTMLElement | null;
    e.preventDefault();
    if (foco && raiz.contains(foco) && foco.tagName === 'BUTTON') { foco.click(); return; }
    if (estado === 'cerrado') abrirEstuche();
    else if (estado === 'abierto') insertar();
    else if (estado === 'listo') terminar();
  }
  window.addEventListener('keydown', teclas, true);

  // arrastrar o tocar el disco
  let arr: { x: number; y: number; mov: boolean; ox: number; oy: number } | null = null;
  disco.addEventListener('pointerdown', (e) => {
    if (estado !== 'abierto') return;
    e.stopPropagation();
    arr = { x: e.clientX, y: e.clientY, mov: false, ox: 0, oy: 0 };
    disco.setPointerCapture(e.pointerId);
  });
  disco.addEventListener('pointermove', (e) => {
    if (!arr) return;
    if (!arr.mov && Math.hypot(e.clientX - arr.x, e.clientY - arr.y) > 6) {
      arr.mov = true; levantar();
      const r = disco.getBoundingClientRect(); arr.ox = e.clientX - r.left; arr.oy = e.clientY - r.top;
      consola.classList.add('rl-abierta'); sfx.clack(900);
    }
    if (arr.mov) { disco.style.left = `${e.clientX - arr.ox}px`; disco.style.top = `${e.clientY - arr.oy}px`; }
  });
  const soltar = async () => {
    if (!arr) return;
    const fue = arr; arr = null;
    if (!fue.mov) { insertar(); return; }
    const r = consola.getBoundingClientRect(), d = disco.getBoundingClientRect();
    const cx = d.left + d.width / 2, cy = d.top + d.height / 2;
    estado = 'moviendo';
    if (cx > r.left && cx < r.right && cy > r.top && cy < r.bottom) {
      pista.textContent = '';
      await aterrizar(380);
    } else {
      await volarA(slotCase, 420); consola.classList.remove('rl-abierta');
      estado = 'abierto';
    }
  };
  disco.addEventListener('pointerup', soltar);
  disco.addEventListener('pointercancel', soltar);
  disco.addEventListener('click', (e) => e.stopPropagation());

  estuche.focus({ preventScroll: true });
}
