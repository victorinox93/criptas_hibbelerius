import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { CardInst, CARDS } from '../data/cards';
import {
  abrirSobre, ACTO_ABISMO, DIENTES_INICIO, DIENTES_OFRECIDOS, AUTOR, CartaSobre, CORDURA, EDICIONES, editarAlAzar, ELIGES_POR_SOBRE, mazoCiego, PACTO_CIEGO_CORDURA, PactoDef, PACTOS, PaginaDef, PAGINAS, PROLOGO,
  HOJAS_POR_EXPEDICION, RARAS_ABISMO, sortearMutador, rarezaDe, SobreDef, SOBRES, elegirJefe, escalaDano, escalaTramo, JEFES, multPuntaje, nombreTramo, TRAMOS, PACTOS_OFRECIDOS,
} from '../data/abismo_modo';
import { RUEDA, RUEDA_COSTO, RUEDA_SUBE, ARRANCAR_PARASITO, cristalDe, defDiente, esParasito, HUECOS, nivelDiente, NOMBRE_RAREZA, PROB_PARASITO_SACAMUELAS, ponerDiente, RETIRAR_DIENTES, sortearDientes, sortearParasito } from '../data/dientes';
import { ASTROS } from '../data/astros';
import { ASTRONOMO, ASTRONOMO_MAL, FICHA_LOVECRAFT, FRASES_INFINITO, TELESCOPIO_COMBATES } from '../data/lovecraft';
import { dentaduraView, dibujarDiente, etiquetaDiente, resumenCosmos, textoCristal } from '../ui/dentadura';
import { ENEMIES } from '../data/enemies';
import { ALMAS } from '../data/almas';
import { bonosFinales } from '../data/puntaje';
import { cardView, CW, CH } from '../ui/card';
import { guiaAbismo } from '../ui/guiaAbismo';
import { hojaDiario, hojaPresente } from '../ui/diario';
import { addCard, addEntropia, aplicarSarro, codexFlag, Game, generateMap, logEvent, newRun, otorgarInsigniaAbismo, saveLocal, syncRun, unlock } from '../state';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/**
 * EL ABISMO DE LOS EJES · inicio de la expedición:
 *   1. Prólogo (el diario de Montemayor; se puede saltar)
 *   2. Una página del Necronomicón (modificador para toda la expedición)
 *   3. El Pacto (mazo base) o el Pacto ciego (mazo al azar)
 *   4. Tres sobres (como Pokémon TCG): de cada uno te quedas con 1 carta
 * La primera vez sale la Guía del Abismo (src/ui/guiaAbismo.ts); luego, con el botón «Guía».
 * Por ahora sólo se entra desde el Modo profesor (src/scenes/Debug.ts).
 */
export interface AbismoData {
  clase: string;
  gravedad?: number;
  debug?: boolean;
  tanque?: boolean; // Modo profesor: vida ×10
  saltarPrologo?: boolean;
  fase?: 'tramo' | 'boca' | 'observatorio' | 'colocar' | 'astro';
  astro?: string; // v0.59 · astro vencido (fase 'astro': su sobre de premio)
  nuevo?: boolean; // v0.59 · primera vez que vences a ese astro (ganaste su cosmético) // tramo = entre tramos; boca = Sacamuelas Ciego; observatorio = el Astrónomo de Providence
}

export class AbismoScene extends Phaser.Scene {
  private d!: AbismoData;
  private layer!: Phaser.GameObjects.Container;
  private tip!: Tooltip;
  private pagina: PaginaDef | null = null;
  private elegido: PactoDef | null = null; // null = Pacto ciego
  private mazo: { id: string; up: boolean; ed?: CardInst['ed'] }[] = [];
  private dientesIni: (string | null)[] = []; // la dentadura antes de que exista la expedición
  private giros = 0; // giros de la Rueda de la Fortuna en esta visita al Sacamuelas
  private escritura: Phaser.Time.TimerEvent | null = null; // máquina de escribir del diario
  private gen = 0;
  /** Sobre de premio entre tramos (te quedas con 1); null = los 3 sobres del inicio */
  private premio: { def: SobreDef; alTerminar: () => void; titulo?: string; nota?: string } | null = null;
  private elige() { return this.premio ? 1 : ELIGES_POR_SOBRE; } // cambia en cada pantalla: las animaciones de una pantalla vieja ya no tocan la nueva

  constructor() { super('Abismo'); }

  create(data: AbismoData) {
    this.d = data;
    this.pagina = null;
    this.elegido = null;
    this.mazo = [];
    this.escritura = null;
    this.premio = null;
    this.dientesIni = [];
    Game.preparando = !data.fase; // v0.60 · sin fase = expedición nueva (todavía no hay partida)
    this.events.once('shutdown', () => { Game.preparando = false; });
    this.cameras.main.fadeIn(700);
    audio.play('abismo');
    this.fondo();
    this.tip = new Tooltip(this);
    this.layer = this.add.container(0, 0);
    if (data.fase === 'tramo') this.entreTramos();
    else if (data.fase === 'boca') { this.giros = 0; this.sacamuelas('boca', () => fadeTo(this, 'Map')); }
    else if (data.fase === 'observatorio') { audio.play('abismo2'); this.observatorio(); }
    else if (data.fase === 'colocar') this.sacamuelas('colocar', () => fadeTo(this, 'Map'));
    else if (data.fase === 'astro') {
      // v0.59 · premio de un Astro Ambulante: un sobre (te quedas con 1 carta) y, la primera vez, su cosmético
      const a = ASTROS[data.astro ?? 'mercurio'];
      this.sobrePremio(() => fadeTo(this, 'Map'));
      const corto = a.nombre.split(',')[0];
      this.premio!.titulo = corto.startsWith('El ') ? `Premio del ${corto.slice(3)}` : `Premio de ${corto}`;
      if (data.nuevo) this.premio!.nota = `¡Nuevo en el Vestidor: ${a.premio}!`;
      this.sobre(0);
    }
    else if (data.saltarPrologo) this.necronomicon();
    else this.prologo(0);
  }

  /** Mar oscuro con ondas lentas y burbujas */
  private fondo() {
    const g = this.add.graphics().setDepth(-10);
    for (let i = 0; i < 12; i++) g.fillStyle(Phaser.Display.Color.GetColor(4, 12 + i, 12 + i), 1).fillRect(0, (i * H) / 12, W, H / 12 + 1);
    for (let i = 0; i < 6; i++) {
      const w = this.add.graphics().setDepth(-9);
      w.lineStyle(2, 0x1c3a32, 0.5);
      const y0 = 80 + i * 80;
      w.beginPath();
      for (let x = 0; x <= W; x += 12) w.lineTo(x, y0 + Math.sin(x / 70 + i) * 6);
      w.strokePath();
      this.tweens.add({ targets: w, x: (i % 2 ? -1 : 1) * 40, duration: 6000 + i * 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    // burbujas: muchas chicas y algunas grandes que suben meciéndose
    this.add.particles(0, 0, 'px', {
      x: { min: 0, max: W }, y: H + 10, speedY: { min: -60, max: -20 }, speedX: { min: -8, max: 8 }, lifespan: 11000, frequency: 70,
      scale: { start: 1, end: 2.4 }, alpha: { start: 0.45, end: 0 }, tint: [0x9ad8c8, 0xc8f4ff, 0x6ab8a8],
    }).setDepth(-8);
    this.add.particles(0, 0, 'px', {
      x: { min: 0, max: W }, y: H + 10, speedY: { min: -45, max: -25 }, lifespan: 12000, frequency: 600,
      scale: { start: 3, end: 5 }, alpha: { start: 0.25, end: 0 }, tint: 0xc8f4ff,
    }).setDepth(-8);
    this.criaturas();
    vignette(this);
  }

  /** Siluetas de seres extraños que nadan al fondo (cada uno cruza la pantalla y vuelve a salir) */
  private criaturas() {
    const sombra = 0x174a40;
    // criaturas del juego como siluetas oscuras
    const bichos: [string, number, number][] = [['polipito', 3, 0.6], ['polipo', 2.4, 0.55], ['hidra', 2, 0.45], ['vertice', 2.6, 0.55], ['cultistaEje', 2.2, 0.5], ['profundo', 2.4, 0.5]];
    bichos.forEach(([sp, k, a], i) => {
      const img = this.add.image(-100, 0, sp).setScale(k).setTint(sombra).setAlpha(a).setDepth(-9);
      const nadar = () => {
        const izq = Math.random() < 0.5;
        const y = 90 + Math.random() * (H - 180);
        img.setPosition(izq ? -120 : W + 120, y).setFlipX(!izq);
        this.tweens.add({ targets: img, x: izq ? W + 120 : -120, duration: 18000 + Math.random() * 14000, delay: Math.random() * 6000, onComplete: nadar });
        this.tweens.add({ targets: img, y: y + 14, duration: 1400 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      };
      this.time.delayedCall(i * 2500, nadar);
    });
    // algo enorme pasa muy al fondo de vez en cuando: un ojo y tentáculos que se mecen
    const grande = this.add.container(-400, H / 2).setDepth(-9.5).setAlpha(0.35);
    const g = this.add.graphics();
    g.fillStyle(0x081a17, 1).fillEllipse(0, 0, 360, 150);
    for (let t = 0; t < 7; t++) {
      g.lineStyle(14 - t, 0x081a17, 1);
      g.beginPath();
      for (let k = 0; k <= 12; k++) g.lineTo(-150 - k * 18, -40 + t * 14 + Math.sin(k / 2 + t) * 14);
      g.strokePath();
    }
    const ojo = this.add.circle(120, -10, 16, 0xb8ff9a, 0.55);
    grande.add([g, ojo]);
    this.tweens.add({ targets: ojo, scaleY: 0.1, duration: 140, yoyo: true, repeat: -1, repeatDelay: 3200 });
    const pasar = () => {
      grande.setPosition(-420, 120 + Math.random() * (H - 240));
      this.tweens.add({ targets: grande, x: W + 420, duration: 45000, delay: 4000 + Math.random() * 8000, onComplete: pasar });
    };
    pasar();
  }

  private limpiar() {
    // v0.39.1: detener la máquina de escribir antes de borrar la página. Si seguía escribiendo
    // sobre un texto ya destruido, Phaser lanzaba un error y el juego se congelaba
    // (pasaba al presionar «Saltar prólogo» mientras se escribía el diario).
    this.escritura?.remove(false);
    this.escritura = null;
    this.gen++;
    this.layer.removeAll(true);
    this.tip.hide();
  }

  /** Botón «Guía» en la esquina (abre la Guía del Abismo encima) */
  private botonGuia() {
    this.layer.add(button(this, 70, 26, 110, 32, '? Guía', () => guiaAbismo(this), { size: 18, color: 0x2c5a4e }));
  }

  // ── 1. Prólogo: sólo la primera hoja del diario (las demás se encuentran en el mapa, src/ui/diario.ts) ──
  private prologo(i: number) {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    if (i >= 1) {
      codexFlag('abismo_prologo');
      L(title(this, W / 2, 200, 'El Abismo de los Ejes', 64, '#9ad8c8'));
      L(txt(this, W / 2, 258, 'Bajas por la cueva del Cerro de la Silla, tras los pasos de Ignacio Montemayor.', 22, CSS.bone).setOrigin(0.5));
      L(txt(this, W / 2, 290, 'Una respuesta correcta te devuelve la cordura. Un error te la quita.', 20, CSS.dim).setOrigin(0.5));
      const hallas = (Game.codex.diario ?? 0) + 1;
      L(txt(this, W / 2, 320, `Diario de Montemayor: ${hallas} de ${PROLOGO.length} hojas. Las demás están perdidas allá abajo (son raras).`, 18, '#8a7a5a').setOrigin(0.5));
      L(txt(this, W / 2, 344, 'Cada hoja que encuentras te da un apunte (pista gratis) y Cordura.', 17, '#9ad8c8').setOrigin(0.5));
      const primera = !(Game.codex.flags ?? []).includes('abismo_guia');
      if (primera) {
        // la primera vez se explican las reglas antes de abrir el libro
        L(button(this, W / 2, 392, 340, 44, 'Aprender las reglas del Abismo', () => guiaAbismo(this, () => this.necronomicon()), { color: UI.gold, size: 22 }));
        L(button(this, W / 2, 444, 260, 36, 'Ya las conozco', () => this.necronomicon(), { size: 18 }));
      } else {
        L(button(this, W / 2, 392, 260, 44, 'Abrir el Necronomicón', () => this.necronomicon(), { color: UI.gold, size: 22 }));
        L(button(this, W / 2, 444, 260, 36, 'Repasar las reglas', () => guiaAbismo(this), { size: 18 }));
      }
      L(button(this, W / 2, 492, 260, 36, `Leer el diario (${hallas}/${PROLOGO.length})`, () => this.leerDiario(), { size: 18, color: 0x5a4a2e }));
      return;
    }
    L(hojaDiario(this, 0, () => L(hojaPresente(this, () => this.prologo(1))), false));
  }

  /** El diario de Montemayor: las hojas que ya encontraste (se guardan entre expediciones) */
  private leerDiario() {
    const capa = this.add.container(0, 0).setDepth(930);
    capa.add(this.add.rectangle(0, 0, W, H, 0x020606, 0.9).setOrigin(0).setInteractive());
    const g = this.add.graphics();
    frame(g, W / 2 - 360, 60, 720, 420, 0x16130e, 0x5a4a2e, 0.97);
    capa.add(g);
    capa.add(txt(this, W / 2, 76, `El diario de ${AUTOR}`, 28, '#d8c8a0').setOrigin(0.5, 0));
    const hasta = Game.codex.diario ?? 0;
    capa.add(txt(this, W / 2, 112, `${hasta + 1} de ${PROLOGO.length} hojas encontradas`, 17, '#8a7a5a').setOrigin(0.5, 0));
    PROLOGO.forEach((pg, i) => {
      const x = W / 2 - 255 + (i % 4) * 170, y = 166 + Math.floor(i / 4) * 66;
      const ok = i <= hasta;
      const b = button(this, x, y, 156, 52, ok ? pg.fecha.replace(/^Registro /, 'Reg. ').replace(/ de /, ' ') : '? ? ?', () => { if (ok) capa.add(hojaDiario(this, i, undefined, false)); }, { size: 14, color: ok ? 0x5a4a2e : 0x2a2420 });
      if (!ok) b.setEnabled(false);
      capa.add(b);
    });
    capa.add(button(this, W / 2, 452, 200, 36, 'Cerrar', () => capa.destroy(), { size: 18 }));
  }

  // ── 2. Necronomicón: elige una página ──
  private necronomicon() {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    L(title(this, W / 2, 48, 'El Necronomicón de Hibbelerius', 40, '#c8a8e8'));
    L(txt(this, W / 2, 86, 'El libro se abre solo en tres páginas. Arranca una: te acompañará toda la expedición.', 19, CSS.bone).setOrigin(0.5));
    const libro = L(this.add.image(W / 2, 124, 'i_necro').setScale(4).setAlpha(0.95));
    this.tweens.add({ targets: libro, y: 116, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const opciones = Phaser.Utils.Array.Shuffle([...PAGINAS]).slice(0, 3);
    opciones.forEach((p, i) => {
      const x = W / 2 + (i - 1) * 300, y = 154;
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      frame(g, -135, 0, 270, 300, 0x14101a, 0x5a3a7a, 0.97);
      c.add(g);
      c.add(txt(this, 0, 16, p.nombre, 24, '#d8b8ff', { align: 'center', wordWrap: { width: 240 } }).setOrigin(0.5, 0));
      c.add(txt(this, -118, 74, 'Poder', 16, CSS.dim));
      c.add(txt(this, -118, 94, p.poder, 18, CSS.green, { wordWrap: { width: 236 } }));
      c.add(txt(this, -118, 170, 'Costo', 16, CSS.dim));
      c.add(txt(this, -118, 190, p.costo, 18, '#e08a8a', { wordWrap: { width: 236 } }));
      c.add(txt(this, 0, 284, p.lore, 15, CSS.purple, { align: 'center', wordWrap: { width: 240 } }).setOrigin(0.5, 1));
      c.setSize(270, 300).setInteractive(new Phaser.Geom.Rectangle(-135, 0, 270, 300), Phaser.Geom.Rectangle.Contains);
      c.input!.cursor = 'pointer';
      c.on('pointerover', () => this.tweens.add({ targets: c, y: y - 8, duration: 120 }));
      c.on('pointerout', () => this.tweens.add({ targets: c, y, duration: 120 }));
      c.on('pointerdown', () => {
        audio.sfx('card');
        this.pagina = p;
        this.cameras.main.flash(300, 60, 30, 90);
        this.pacto();
      });
      L(c);
    });
    L(txt(this, W / 2, 476, 'Las páginas cambian en cada expedición.', 17, CSS.dim).setOrigin(0.5));
    this.botonGuia();
  }

  // ── 3. El Pacto: elige tu mazo ──
  private pacto() {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    L(title(this, W / 2, 48, 'El Pacto', 44, '#9ad8c8'));
    L(txt(this, W / 2, 86, `Página: ${this.pagina?.nombre ?? '—'}. El libro te ofrece ${PACTOS_OFRECIDOS} pactos: firma uno. Luego eliges dientes y abres 3 sobres (+${SOBRES.length * ELIGES_POR_SOBRE} cartas).`, 19, CSS.bone, { align: 'center', wordWrap: { width: 860 } }).setOrigin(0.5));
    this.botonGuia();
    const clase = this.d.clase;
    const opciones = Phaser.Utils.Array.Shuffle([...PACTOS]).slice(0, PACTOS_OFRECIDOS);
    opciones.forEach((p, i) => {
      const x = W / 2 + (i - (opciones.length - 1) / 2) * 330, y = 118;
      const ids = p.mazo(clase);
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      frame(g, -135, 0, 270, 280, 0x0c1614, 0x2c5a4e, 0.97);
      c.add(g);
      c.add(txt(this, 0, 14, p.nombre, 24, '#9ad8c8').setOrigin(0.5, 0));
      c.add(txt(this, -118, 52, p.regla, 18, CSS.bone, { wordWrap: { width: 236 } }));
      c.add(txt(this, -118, 160, `Mazo (${ids.length + (p.id === 'hueco' ? 1 : 0)} cartas):`, 16, CSS.dim));
      c.add(txt(this, -118, 180, this.resumen(ids) + (p.id === 'hueco' ? '\n+ 1 carta rara de Lámina' : ''), 15, CSS.gold, { wordWrap: { width: 236 } }));
      c.setSize(270, 280).setInteractive(new Phaser.Geom.Rectangle(-135, 0, 270, 280), Phaser.Geom.Rectangle.Contains);
      c.input!.cursor = 'pointer';
      c.on('pointerover', () => this.tweens.add({ targets: c, y: y - 8, duration: 120 }));
      c.on('pointerout', () => this.tweens.add({ targets: c, y, duration: 120 }));
      c.on('pointerdown', () => this.firmar(p));
      L(c);
    });
    L(button(this, W / 2, 440, 380, 44, `Pacto ciego: mazo al azar y +${PACTO_CIEGO_CORDURA} de Cordura`, () => this.firmar(null), { size: 19, color: UI.border }));
    L(button(this, W / 2, 496, 200, 36, 'Volver al libro', () => this.necronomicon(), { size: 18 }));
  }

  /** «4× Golpe de Mazo, 4× Fuerza Normal…» */
  private resumen(ids: string[]) {
    const n = new Map<string, number>();
    ids.forEach((id) => n.set(id, (n.get(id) ?? 0) + 1));
    return [...n].map(([id, k]) => `${k}× ${CARDS[id].name}`).join(', ');
  }

  /** Firma el Pacto: guarda el mazo base y pasa a los sobres */
  private firmar(p: PactoDef | null) {
    audio.sfx('card');
    this.elegido = p;
    const ids = p ? p.mazo(this.d.clase) : mazoCiego(this.d.clase);
    this.mazo = ids.map((id) => ({ id, up: false }));
    if (p?.id === 'hueco') this.mazo.push({ id: Phaser.Utils.Array.GetRandom(RARAS_ABISMO), up: false, ed: 'lamina' });
    this.cameras.main.flash(250, 20, 60, 50);
    this.dientesIni = Array(HUECOS).fill(null);
    if (p?.id === 'estelar') ponerDiente(this.dientesIni, sortearDientes(1, [], 1000)[0]); // un Astro seguro
    this.sacamuelas('inicio', () => this.sobre(0));
  }

  // ── La Dentadura de Montemayor (src/data/dientes.ts) ──
  /**
   * inicio: salen 3 dientes y te quedas con 1 (2 con el Pacto de la Sonrisa).
   * boca:   el Sacamuelas Ciego (nodo del mapa): 3 dientes, te llevas 1; puedes pagar para volver a tirar.
   * premio: al vencer a un jefe, 3 dientes y te llevas 1.
   * En los tres puedes reacomodar la dentadura (clic en un diente y luego en otro hueco).
   */
  private sacamuelas(modo: 'inicio' | 'boca' | 'premio' | 'acomodar' | 'colocar', alTerminar: () => void) {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const run = Game.run;
    const dent = modo === 'inicio' ? this.dientesIni : (run!.dientes ??= Array(HUECOS).fill(null));
    while (dent.length < HUECOS) dent.push(null);
    const astrosX = (modo === 'inicio' ? this.elegido?.id : run?.pacto) === 'estelar' ? 2 : 1;
    const cuantos = modo === 'inicio' ? this.elegido?.dientes ?? DIENTES_INICIO : modo === 'acomodar' ? 0 : 1;
    const nOpc = modo === 'inicio' ? DIENTES_OFRECIDOS : modo === 'acomodar' || modo === 'colocar' ? 0 : 3;
    const tengo = () => dent.filter((x): x is string => !!x);
    // la carta del Astrónomo cumplida: el trofeo del jefe trae 3 legendarios
    const carta = run?.carta;
    const cartaPremio = modo === 'premio' && !!carta?.hecho && !carta.cobrada;
    const sortear = () => {
      if (cartaPremio) return sortearDientes(nOpc, tengo(), astrosX, { legendario: true });
      const o = sortearDientes(nOpc, tengo(), astrosX);
      // contra un Primigenio, siempre hay un legendario entre las opciones
      if (modo === 'premio' && JEFES[run?.jefe ?? '']?.primigenio && !o.some((id) => defDiente(id).rareza === 'legendario')) o[0] = sortearDientes(1, tengo(), 1, { legendario: true })[0];
      // el Sacamuelas a veces cuela un parásito (tú decides si lo tomas)
      if (modo === 'boca' && Math.random() < PROB_PARASITO_SACAMUELAS) o[o.length - 1] = sortearParasito(dent);
      return o;
    };
    let opciones = nOpc ? sortear() : [];
    if (cartaPremio) { carta!.cobrada = true; saveLocal(); }
    let tomados = 0;
    let sel = -1; // hueco marcado para mover
    let pendiente: string | null = modo === 'colocar' ? run?.dientePendiente ?? null : null; // diente elegido que espera hueco (dentadura llena)
    let arrancando = false; // modo «arrancar un parásito» (Sacamuelas)
    let nota = ''; // mensaje de la última acción
    const titulo = { inicio: 'La Dentadura de Montemayor', boca: 'El Sacamuelas Ciego', premio: 'Trofeo del jefe', acomodar: 'Acomodar la dentadura', colocar: 'Un diente nuevo' }[modo];
    L(title(this, W / 2, 40, titulo, 38, '#f0c8c8'));
    const sub = modo === 'inicio' ? `En la cueva encontraste la dentadura del erudito. Elige ${cuantos} de estos ${nOpc} dientes.`
      : modo === 'boca' ? '«Dientes, dientes frescos… Llévate uno. Y si traes un parásito, te lo arranco. Cobro, claro.»'
        : modo === 'acomodar' ? '«Los astros se ven mejor en fila», dice el astrónomo. Toca un diente y luego otro hueco.'
          : modo === 'colocar' ? 'Ganaste un diente, pero tu dentadura está llena. Toca el diente (marcado) que quieres cambiar, o tíralo.'
          : cartaPremio ? '¡Carta de Providence cumplida! El Astrónomo te manda 3 dientes LEGENDARIOS: elige 1.' : 'Le arrancas un diente al jefe. Elige 1 de 3.';
    L(txt(this, W / 2, 72, sub, 18, cartaPremio ? '#ffd060' : CSS.bone, { align: 'center', wordWrap: { width: 860 } }).setOrigin(0.5, 0));
    const aviso = L(txt(this, W / 2, 98, '', 16, '#ffd060', { align: 'center', wordWrap: { width: 860 } }).setOrigin(0.5, 0));
    this.botonGuia();
    const jaw = dentaduraView(this, W / 2, 196, this.tip, {
      paso: 62, k: 0.85, dent: () => dent, marcado: () => sel,
      resaltar: (i) => !!pendiente && !!dent[i] && !esParasito(dent[i]),
      onHueco: (i) => {
        if (arrancando) {
          if (!esParasito(dent[i])) { nota = 'Ese no es un parásito.'; return pintar(); }
          nota = `El Sacamuelas arranca ${defDiente(dent[i]!).nombre}. ¡Ay! (−${ARRANCAR_PARASITO} Ergios)`;
          run!.ergios -= ARRANCAR_PARASITO;
          dent[i] = null;
          arrancando = false;
          audio.sfx('hit');
          this.cameras.main.shake(200, 0.006);
          return pintar();
        }
        if (pendiente) {
          // reemplaza el diente de ese hueco (los parásitos no se dejan)
          const viejo = dent[i];
          if (esParasito(viejo)) { nota = 'El parásito no se suelta: sólo el Sacamuelas lo arranca.'; return pintar(); }
          dent[i] = pendiente;
          pendiente = null;
          if (run) delete run.dientePendiente;
          tomados++;
          audio.sfx('coin');
          nota = viejo ? `Tiraste ${defDiente(viejo).nombre}.` : '';
          return pintar();
        }
        if (sel < 0) { if (dent[i]) { sel = i; audio.sfx('click'); } }
        else { [dent[sel], dent[i]] = [dent[i], dent[sel]]; sel = -1; audio.sfx('card'); }
        pintar();
      },
    });
    L(jaw.c);
    const opc = this.add.container(0, 0);
    L(opc);
    const pie = this.add.container(0, 0);
    L(pie);
    const pintar = () => {
      jaw.pintar();
      opc.removeAll(true);
      pie.removeAll(true);
      const cos = resumenCosmos(dent, run?.cosmos);
      aviso.setText(arrancando ? 'Toca el parásito que quieres que te arranque.'
        : pendiente ? `Tu dentadura está llena: toca el diente que quieres cambiar por ${defDiente(pendiente).nombre}.`
          : sel >= 0 ? 'Ahora toca otro hueco para mover ahí ese diente.'
            : [nota, cos ? `Cosmos: ${cos}` : 'Tip: toca un diente y luego otro hueco para moverlo. El orden importa.'].filter(Boolean).join('  ·  '));
      nota = '';
      const quedan = cuantos - tomados;
      if (!pendiente) opciones.forEach((id, i) => {
        const d = defDiente(id);
        const rz = NOMBRE_RAREZA[d.rareza];
        const x = W / 2 + (i - (opciones.length - 1) / 2) * 220, y = 262;
        const c = this.add.container(x, y);
        const g = this.add.graphics();
        frame(g, -100, 0, 200, 200, d.tipo === 'parasito' ? 0x0e140a : 0x140a0e, cristalDe(id) !== undefined ? 0xe8fbff : rz.borde, 0.97);
        c.add(g);
        c.add(txt(this, 0, 6, etiquetaDiente(id), 13, rz.css).setOrigin(0.5, 0));
        c.add(dibujarDiente(this, 0, 62, id, 1.0));
        c.add(txt(this, 0, 100, d.nombre, 17, rz.css, { align: 'center', wordWrap: { width: 186 } }).setOrigin(0.5, 0));
        c.add(txt(this, 0, 122, d.texto + (cristalDe(id) !== undefined ? `\n💎 Doble efecto · se rompe en ${cristalDe(id)} combates` : ''), 13, CSS.bone, { align: 'center', wordWrap: { width: 188 } }).setOrigin(0.5, 0));
        c.setSize(200, 200).setInteractive(new Phaser.Geom.Rectangle(-100, 0, 200, 200), Phaser.Geom.Rectangle.Contains);
        c.on('pointerover', () => this.tip.show(x < W / 2 ? x + 110 : x - 420, 160, d.nombre, `${d.texto}${textoCristal(id)}\n${d.lore}`));
        c.on('pointerout', () => this.tip.hide());
        if (quedan > 0 && !pendiente && !arrancando) {
          c.input!.cursor = 'pointer';
          c.on('pointerdown', () => {
            this.tip.hide();
            opciones = opciones.filter((_, k) => k !== i);
            if (ponerDiente(dent, id)) { tomados++; audio.sfx('coin'); nota = `${d.nombre} entra en tu dentadura.`; }
            else if (dent.every(esParasito)) { nota = 'Tu dentadura está llena de parásitos…'; }
            else { pendiente = id; audio.sfx('click'); }
            this.cameras.main.flash(150, d.tipo === 'parasito' ? 120 : 240, 200, d.tipo === 'parasito' ? 80 : 200);
            pintar();
          });
        } else c.setAlpha(0.45);
        opc.add(c);
      });
      if (pendiente) {
        // el diente que espera hueco, a la vista
        const g = this.add.graphics();
        frame(g, W / 2 - 150, 262, 300, 190, 0x1a1408, 0xffd060, 0.97);
        opc.add(g);
        opc.add(txt(this, W / 2, 270, 'Por colocar', 15, '#ffd060').setOrigin(0.5, 0));
        opc.add(dibujarDiente(this, W / 2, 324, pendiente, 1.1));
        const dp = defDiente(pendiente);
        opc.add(txt(this, W / 2, 364, dp.nombre, 18, NOMBRE_RAREZA[dp.rareza].css).setOrigin(0.5, 0));
        opc.add(txt(this, W / 2, 388, dp.texto, 13, CSS.bone, { align: 'center', wordWrap: { width: 280 } }).setOrigin(0.5, 0));
        const pd = pendiente;
        pie.add(button(this, W / 2 - 290, 500, 220, 36, 'Tirar este diente', () => {
          pendiente = null;
          if (run) delete run.dientePendiente;
          tomados = cuantos;
          nota = `Dejaste ${defDiente(pd).nombre} en el camino.`;
          pintar();
        }, { size: 16 }));
      }
      const listo = quedan <= 0 && !pendiente;
      const etiqueta = modo === 'inicio' ? (listo ? 'Listo: abrir los sobres' : `Elige ${quedan} diente(s) más`) : listo ? 'Seguir' : 'Irme sin diente';
      // mientras hay un diente por colocar, sólo se puede colocar (tocando un hueco) o tirarlo
      if (!pendiente) {
        const b = button(this, W / 2, 500, 280, 40, etiqueta, () => alTerminar(), { size: 19, color: listo ? UI.gold : UI.border });
        if (modo === 'inicio' && !listo) b.setEnabled(false);
        pie.add(b);
      }
      if (modo === 'boca' && quedan > 0 && run) {
        const rr = button(this, W / 2 + 290, 500, 230, 36, `Volver a tirar (${RETIRAR_DIENTES} ⛁)`, () => {
          if (run.ergios < RETIRAR_DIENTES) return;
          run.ergios -= RETIRAR_DIENTES;
          opciones = sortear();
          audio.sfx('coin');
          nota = `Pagaste ${RETIRAR_DIENTES} Ergios. Te quedan ${run.ergios}.`;
          pintar();
        }, { size: 16 });
        rr.setEnabled(run.ergios >= RETIRAR_DIENTES);
        pie.add(rr);
      }
      if (modo === 'boca' && run && !pendiente) {
        const costo = RUEDA_COSTO + this.giros * RUEDA_SUBE;
        const rb = button(this, W - 96, 196, 176, 52, `Rueda de la\nFortuna (${costo} ⛁)`, () => {
          if (run.ergios < costo) return;
          run.ergios -= costo;
          this.giros++;
          saveLocal();
          this.rueda(dent, (msg) => { nota = msg; pintar(); });
        }, { size: 16, color: 0x8a3a8a });
        rb.setEnabled(run.ergios >= costo);
        pie.add(rb);
      }
      if (modo === 'boca' && run && !pendiente && dent.some(esParasito)) {
        const ar = button(this, W / 2 - 290, 500, 230, 36, arrancando ? 'Cancelar' : `Arrancar parásito (${ARRANCAR_PARASITO} ⛁)`, () => {
          arrancando = !arrancando;
          pintar();
        }, { size: 16, color: 0x4a6a2a });
        ar.setEnabled(arrancando || run.ergios >= ARRANCAR_PARASITO);
        pie.add(ar);
      }
      if (run) { aplicarSarro(run); saveLocal(); }
    };
    pintar();
  }

  // ── 4. Sobres: rasgas el empaque, se voltean 5 cartas y te quedas con 1 ──
  private sobre(n: number) {
    if (!this.premio && n >= SOBRES.length) return this.empezar();
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const def = this.premio ? this.premio.def : SOBRES[n];
    const enMazo = this.premio ? Game.run!.deck.length : this.mazo.length;
    L(title(this, W / 2, 46, this.premio ? this.premio.titulo ?? 'Premio del tramo' : `Sobre ${n + 1} de ${SOBRES.length}`, 40, '#9ad8c8'));
    L(txt(this, W / 2, 84, `${def.nombre}: ${def.texto} Trae 5 cartas; te quedas con ${this.elige()}. Tu mazo: ${enMazo} cartas.${this.premio?.nota ? `\n${this.premio.nota}` : ''}`, 18, CSS.bone, { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5, 0));
    this.botonGuia();
    const emp = L(this.empaque(def, W / 2, 300));
    this.tweens.add({ targets: emp, y: 292, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // se abre con clic en el sobre, con el botón o con Enter (sólo una vez)
    let abierto = false;
    const abrir = () => { if (abierto || !emp.active) return; abierto = true; this.rasgar(def, emp, n); };
    L(button(this, W / 2, 462, 240, 42, 'Rasgar el sobre', abrir, { size: 21, color: UI.gold }));
    emp.setSize(170, 236).setInteractive({ useHandCursor: true });
    emp.on('pointerdown', abrir);
    this.input.keyboard?.once('keydown-ENTER', abrir);
  }

  /** Dibujo del sobre: empaque metalizado con orillas dentadas y un destello que cruza */
  private empaque(def: SobreDef, x: number, y: number) {
    const c = this.add.container(x, y);
    const w = 170, h = 236;
    const g = this.add.graphics();
    g.fillStyle(def.color, 1).fillRect(-w / 2, -h / 2 + 14, w, h - 28);
    // orillas dentadas (el «sellado» de un sobre de cartas)
    for (const yy of [-h / 2, h / 2 - 14]) for (let xx = -w / 2; xx < w / 2; xx += 10) g.fillStyle(def.brillo, 0.85).fillTriangle(xx, yy + (yy < 0 ? 14 : 0), xx + 10, yy + (yy < 0 ? 14 : 0), xx + 5, yy + (yy < 0 ? 2 : 12));
    g.lineStyle(3, def.brillo, 1).strokeRect(-w / 2, -h / 2 + 14, w, h - 28);
    g.fillStyle(0x000000, 0.35).fillRect(-w / 2 + 12, -h / 2 + 40, w - 24, 110);
    g.lineStyle(1, def.brillo, 0.6).strokeRect(-w / 2 + 12, -h / 2 + 40, w - 24, 110);
    const ic = this.add.image(0, -h / 2 + 95, def.icono).setScale(5);
    const nom = txt(this, 0, h / 2 - 66, def.nombre, 20, '#ffffff', { align: 'center', wordWrap: { width: w - 20 } }).setOrigin(0.5).setStroke('#000', 4);
    const sub = txt(this, 0, h / 2 - 32, '5 cartas', 15, CSS.gold).setOrigin(0.5);
    const shine = this.add.graphics();
    const t = { v: 0 };
    const tw = this.tweens.add({ targets: t, v: 1, duration: 2200, repeat: -1, onUpdate: () => {
      shine.clear();
      const x0 = -w + t.v * w * 2.4;
      for (let k = 0; k < 3; k++) {
        const xx = x0 + k * 10;
        const m = k === 1 ? 8 : 4; // el trazo no se sale del empaque
        const ya = Math.max(-h / 2 + 14 + m, (-w / 2 + m - xx) / 0.5), yb = Math.min(h / 2 - 14 - m, (w / 2 - m - xx) / 0.5);
        if (yb > ya) shine.lineStyle(k === 1 ? 10 : 3, 0xffffff, k === 1 ? 0.18 : 0.35).lineBetween(xx + 0.5 * ya, ya, xx + 0.5 * yb, yb);
      }
    } });
    c.once('destroy', () => tw.stop());
    c.add([g, ic, nom, sub, shine]);
    return c;
  }

  /** Animación de abrir: el sobre tiembla, se rasga la tira de arriba y salen las cartas boca abajo */
  private rasgar(def: SobreDef, emp: Phaser.GameObjects.Container, n: number) {
    audio.sfx('card');
    const gen = this.gen;
    this.tweens.killTweensOf(emp);
    this.tweens.add({ targets: emp, x: emp.x + 5, duration: 45, yoyo: true, repeat: 5, onComplete: () => {
      const tira = this.add.graphics().setPosition(emp.x, emp.y - 104);
      tira.fillStyle(def.brillo, 1).fillRect(-85, -14, 170, 16);
      this.layer.add(tira);
      this.tweens.add({ targets: tira, y: tira.y - 120, angle: -25, alpha: 0, duration: 600, onComplete: () => tira.destroy() });
      this.cameras.main.flash(200, 255, 255, 255);
      this.tweens.add({ targets: emp, y: emp.y + 160, alpha: 0, duration: 500, delay: 150, onComplete: () => { if (gen === this.gen) this.revelar(def, n); } });
    } });
  }

  /** Las 5 cartas aparecen boca abajo y se voltean; eliges 2 */
  private revelar(def: SobreDef, n: number) {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    L(title(this, W / 2, 46, def.nombre, 40, '#9ad8c8'));
    const elige = this.elige();
    const aviso = L(txt(this, W / 2, 84, `Elige ${elige === 1 ? '1 carta' : `${elige} cartas`} para tu mazo (clic para marcar o desmarcar).`, 19, CSS.bone).setOrigin(0.5, 0));
    this.botonGuia();
    const cartas = abrirSobre(def.id, this.d.clase);
    const gen = this.gen;
    const elegidas = new Set<number>();
    const K = 0.82, y = 290;
    const ok = button(this, W / 2, 492, 300, 42, `Quedarme con estas (0/${elige})`, () => {
      if (elegidas.size < elige) return;
      audio.sfx('coin');
      if (this.premio) {
        for (const i of elegidas) addCard(cartas[i].id, cartas[i].up, cartas[i].ed);
        saveLocal();
        return this.premio.alTerminar();
      }
      for (const i of elegidas) this.mazo.push({ id: cartas[i].id, up: cartas[i].up, ed: cartas[i].ed });
      this.sobre(n + 1);
    }, { size: 19, color: UI.gold });
    ok.setEnabled(false);
    L(ok);
    const marcos: Phaser.GameObjects.Graphics[] = [];
    cartas.forEach((cs: CartaSobre, i) => {
      const x = W / 2 + (i - 2) * 176;
      // dorso
      const dorso = this.add.container(W / 2, 520).setScale(0.3);
      const dg = this.add.graphics();
      frame(dg, -CW / 2, -CH / 2, CW, CH, def.color, def.brillo);
      dg.lineStyle(3, def.brillo, 0.8).strokeTriangle(0, -50, -44, 30, 44, 30);
      dg.fillStyle(0xb8ff9a, 0.9).fillCircle(0, 4, 9);
      dorso.add(dg);
      L(dorso);
      this.tweens.add({ targets: dorso, x, y, scale: K, duration: 380, delay: i * 110, ease: 'Back.out', onComplete: () => {
        // se voltea (la brillante, al final y con destello)
        if (gen !== this.gen) return; // ya se cambió de pantalla
        this.tweens.add({ targets: dorso, scaleX: 0, duration: 140, delay: 300 + i * 160 + (cs.brillante ? 300 : 0), onComplete: () => {
          if (gen !== this.gen) return;
          dorso.destroy();
          const v = L(cardView(this, x, y, { uid: -100 - i, id: cs.id, up: cs.up, ed: cs.ed }).setScale(0, K));
          this.tweens.add({ targets: v, scaleX: K, duration: 160 });
          if (cs.brillante) { this.cameras.main.flash(250, 200, 160, 255); audio.sfx('coin'); }
          const rz = rarezaDe(cs.id);
          L(txt(this, x, y + 108, cs.ed ? `${rz.t} · ${EDICIONES[cs.ed].nombre}` : rz.t, 15, cs.ed ? '#e6c8ff' : rz.css).setOrigin(0.5, 0));
          const marco = this.add.graphics();
          marcos[i] = L(marco);
          v.setInteractive({ useHandCursor: true });
          v.on('pointerover', () => {
            const d = CARDS[cs.id];
            this.tip.show(x < W / 2 ? x + 80 : x - 340, 120, cs.ed ? `${d.name} · ${EDICIONES[cs.ed].nombre}` : d.name, `${cs.ed ? `${EDICIONES[cs.ed].texto}\n\n` : ''}${d.concept}: ${d.lore}`);
          });
          v.on('pointerout', () => this.tip.hide());
          v.on('pointerdown', () => {
            if (elegidas.has(i)) elegidas.delete(i);
            else if (elegidas.size < elige) elegidas.add(i);
            else return void this.tweens.add({ targets: v, x: x + 6, duration: 40, yoyo: true, repeat: 3 });
            audio.sfx('click');
            const sel = elegidas.has(i);
            this.tweens.add({ targets: v, y: sel ? y - 18 : y, duration: 120 });
            marco.clear();
            if (sel) marco.lineStyle(4, 0xe8c15a, 1).strokeRect(x - (CW * K) / 2 - 6, y - 18 - (CH * K) / 2 - 6, CW * K + 12, CH * K + 12);
            ok.label.setText(`Quedarme con ${elige === 1 ? 'esta' : 'estas'} (${elegidas.size}/${elige})`);
            ok.setEnabled(elegidas.size === elige);
            aviso.setText(elegidas.size === elige ? '¡Listo! Confirma con el botón de abajo.' : `Elige ${elige - elegidas.size} carta(s) más.`);
          });
        } });
      } });
    });
  }

  // ── Entre tramos: curación, premio y (tras el Primigenio) ¿seguir bajando? ──
  private entreTramos() {
    this.limpiar();
    const run = Game.run!;
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const tramo = run.tramo ?? 1;
    const info = JEFES[run.jefe ?? 'geometra'];
    const jefe = L(this.add.image(W - 170, 330, ENEMIES[run.jefe ?? 'geometra'].sprite).setOrigin(0.5, 1).setScale(3).setTint(0x4a5a58).setAlpha(0.6));
    this.tweens.add({ targets: jefe, alpha: 0.15, y: 350, angle: 8, duration: 2600 });
    // curación: 40 % de la vida perdida
    const cura = Math.ceil((run.maxHp - run.hp) * 0.4);
    if (!(run.seen ?? []).includes(`curaT${tramo}`)) { run.hp = Math.min(run.maxHp, run.hp + cura); (run.seen ??= []).push(`curaT${tramo}`); saveLocal(); }
    // v0.49 · el alma del Abismo se despide aquí
    if (run.aliado === 'remiendos' && run.aliadoTramo !== undefined) {
      // v0.57 · el traidor se va… con un recuerdito
      const clave = `remiendosAdios${tramo}`;
      let robo = 0;
      if (!(run.seen ?? []).includes(clave)) { robo = Math.min(run.ergios, 30); run.ergios -= robo; (run.seen ??= []).push(clave); saveLocal(); }
      L(txt(this, W / 2, 208, `Remiendos desaparece entre las rocas, riendo: «¡Sin rencores, amigo!»${robo ? ` (Te faltan ${robo} Ergios.)` : ''}`, 17, '#ffb040').setOrigin(0.5));
    } else if (run.aliado && run.aliadoTramo !== undefined) L(txt(this, W / 2, 208, `${ALMAS[run.aliado]?.name ?? 'Tu acompañante'} se despide: «Hasta aquí llego. Sigue bajando tú».`, 17, '#e8c15a').setOrigin(0.5));
    // v0.61 · el Prestamista de Ergios cobra lo que le debes (si no alcanza, cobra en vida: 1 de vida por cada 2 Ergios)
    if (run.deuda && run.deuda.tramo === tramo) {
      const { monto } = run.deuda;
      const paga = Math.min(run.ergios, monto);
      const vida = Math.ceil((monto - paga) / 2);
      run.ergios -= paga;
      if (vida) run.hp = Math.max(1, run.hp - vida);
      run.deuda = undefined;
      logEvent('deuda', '', vida === 0, { monto, paga, vida });
      saveLocal();
      L(txt(this, W / 2, 228, `El Prestamista sale de la sombra: «Lo acordado: ${monto} Ergios.» Pagas ${paga}${vida ? ` y te cobra el resto en vida (−${vida})` : ''}.`, 17, vida ? '#ff8a7a' : '#ffd040', { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5));
    }
    if (tramo < TRAMOS) {
      L(title(this, W / 2, 80, `¡Tramo ${tramo} superado!`, 52, '#9ad8c8'));
      L(txt(this, W / 2, 132, `Venciste a ${info.nombre}.${cura ? ` Recuperas ${cura} de vida.` : ''}`, 22, CSS.bone).setOrigin(0.5));
      L(txt(this, W / 2, 168, `Sigue: Tramo ${tramo + 1} · ${nombreTramo(tramo + 1)}${tramo + 1 === TRAMOS ? ' (ahí te espera un Primigenio)' : ''}`, 20, tramo + 1 === TRAMOS ? '#c8a8ff' : CSS.gold).setOrigin(0.5));
      L(txt(this, W / 2, 250, 'Premio: abre un sobre (te quedas con 1 carta) y arráncale un diente al jefe.', 20, CSS.dim).setOrigin(0.5));
      L(button(this, W / 2, 320, 260, 46, 'Abrir el sobre', () => this.sobrePremio(() => this.trofeo()), { color: UI.gold, size: 22 }));
      L(button(this, W / 2, 380, 260, 36, 'Seguir sin sobre', () => this.trofeo(), { size: 18 }));
      return;
    }
    // tramo 4 (Primigenio) o más: victoria y la pregunta
    if (tramo === TRAMOS && info.primigenio) {
      if (!run.debug) otorgarInsigniaAbismo();
      L(title(this, W / 2, 70, `¡Venciste a ${info.nombre}!`, info.nombre.length > 12 ? 44 : 52, '#d8b8ff'));
      L(txt(this, W / 2, 118, 'Un Primigenio cae. Ganas el Ojo del Abismo: un ojo morado junto a tu nombre.', 20, CSS.bone).setOrigin(0.5));
      // el ojo morado (como el rojo de AM)
      const ojo = L(this.add.image(W / 2, 178, 'i_ojo').setScale(5).setTint(0xb070ff));
      this.tweens.add({ targets: ojo, scale: 5.6, alpha: 0.6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      if (run.debug) L(txt(this, W / 2, 214, '(Modo profesor: la insignia no se guarda)', 15, '#e08a8a').setOrigin(0.5));
    } else {
      L(title(this, W / 2, 80, `Profundidad ${tramo} superada`, 48, '#d8b8ff'));
      L(txt(this, W / 2, 130, `Venciste a ${info.nombre}.${cura ? ` Recuperas ${cura} de vida.` : ''}`, 21, CSS.bone).setOrigin(0.5));
    }
    const sig = tramo + 1;
    L(txt(this, W / 2, 252, `¿Seguir bajando? Profundidad ${sig}: vida enemiga ×${escalaTramo(sig).toFixed(2)}, daño ×${escalaDano(sig).toFixed(2)} y puntaje ×${multPuntaje(sig).toFixed(1)}.`, 19, CSS.gold).setOrigin(0.5));
    L(txt(this, W / 2, 280, 'El modo infinito tiene su propio ranking. Si caes, conservas lo que llevas.', 17, CSS.dim).setOrigin(0.5));
    // el Astrónomo de Providence te escribe una línea
    L(this.add.image(W / 2 - 330, 460, 'fig_lovecraft').setScale(3));
    L(txt(this, W / 2 - 290, 436, `${FRASES_INFINITO[(tramo - TRAMOS) % FRASES_INFINITO.length]}\n— ${ASTRONOMO}`, 16, '#d8c8a0', { wordWrap: { width: 640 } }));
    L(button(this, W / 2, 340, 340, 46, 'Seguir bajando (sobre y diente)', () => this.sobrePremio(() => this.trofeo()), { color: 0x9a6ad0, size: 21 }));
    L(button(this, W / 2, 402, 300, 40, 'Retirarte con tu gloria', () => this.retirarse(), { size: 19 }));
  }

  /**
   * v0.46 · Rueda de la Fortuna del Sacamuelas: gira, frena y te da lo que marque la flecha.
   * Si sale un diente y la dentadura está llena, queda pendiente (se acomoda al volver al mapa).
   */
  private rueda(dent: (string | null)[], alTerminar: (msg: string) => void) {
    const run = Game.run!;
    const capa = this.add.container(0, 0).setDepth(950);
    capa.add(this.add.rectangle(0, 0, W, H, 0x050208, 0.88).setOrigin(0).setInteractive());
    capa.add(txt(this, W / 2, 34, 'La Rueda de la Fortuna', 34, '#e8a8ff').setOrigin(0.5, 0));
    capa.add(txt(this, W / 2, 76, '«Gira, gira… lo que marque la flecha es tuyo. Hasta lo malo.»', 17, CSS.dim).setOrigin(0.5, 0));
    const cx = W / 2, cy = 300, R0 = 160;
    const rueda = this.add.container(cx, cy);
    const g = this.add.graphics();
    let a0 = -Math.PI / 2;
    const centros: number[] = [];
    for (const seg of RUEDA) {
      const a1 = a0 + seg.p * Math.PI * 2;
      g.fillStyle(seg.color, 1).slice(0, 0, R0, a0, a1, false).fillPath();
      g.lineStyle(2, 0x000000, 0.8).slice(0, 0, R0, a0, a1, false).strokePath();
      const am = (a0 + a1) / 2;
      centros.push(am);
      const t = txt(this, Math.cos(am) * R0 * 0.62, Math.sin(am) * R0 * 0.62, seg.t, 14, '#ffffff').setOrigin(0.5).setStroke('#000', 4).setRotation(am + Math.PI / 2);
      rueda.add(t);
      a0 = a1;
    }
    rueda.addAt(g, 0);
    g.lineStyle(5, 0xe8c15a, 1).strokeCircle(0, 0, R0);
    g.fillStyle(0x1a0e1a, 1).fillCircle(0, 0, 22);
    capa.add(rueda);
    // flecha arriba
    const fl = this.add.graphics();
    fl.fillStyle(0xffffff, 1).fillTriangle(cx - 14, cy - R0 - 26, cx + 14, cy - R0 - 26, cx, cy - R0 + 6);
    capa.add(fl);
    // sorteo
    let r = Math.random(), k = 0;
    for (; k < RUEDA.length - 1; k++) { if (r < RUEDA[k].p) break; r -= RUEDA[k].p; }
    const seg = RUEDA[k];
    // la flecha está en −90°: girar para que el centro del gajo quede arriba
    const destino = -(centros[k] + Math.PI / 2) + Math.PI * 2 * 6 + (Math.random() - 0.5) * seg.p * Math.PI;
    audio.sfx('card');
    this.tweens.add({ targets: rueda, rotation: destino, duration: 3600, ease: 'Cubic.out', onComplete: () => {
      const tengo = dent.filter((x): x is string => !!x);
      let msg = '';
      const darDiente = (id: string) => {
        if (ponerDiente(dent, id)) return `${defDiente(id).tipo === 'parasito' ? '☣ Se te pega' : 'Ganas'}: ${defDiente(id).nombre}.`;
        run.dientePendiente = id;
        return `Ganas ${defDiente(id).nombre}; tu dentadura está llena: lo acomodas al volver al mapa.`;
      };
      if (seg.id === 'legendario') msg = darDiente(sortearDientes(1, tengo, 1, { legendario: true })[0]);
      else if (seg.id === 'raro') { let id = sortearDientes(1, tengo)[0]; if (defDiente(id).rareza === 'comun') id = sortearDientes(1, tengo)[0]; msg = darDiente(id); }
      else if (seg.id === 'ergios') { run.ergios += 40; msg = '+40 Ergios.'; }
      else if (seg.id === 'cordura') { addEntropia(-12); msg = '+12 de Cordura.'; }
      else if (seg.id === 'apunte') { run.apuntes = (run.apuntes ?? 0) + 1; msg = '+1 apunte de Montemayor (pista gratis).'; }
      else if (seg.id === 'parasito') msg = darDiente(sortearParasito(dent));
      else msg = 'Nada. El Sacamuelas se ríe sin dientes.';
      aplicarSarro(run);
      saveLocal();
      audio.sfx(seg.id === 'nada' || seg.id === 'parasito' ? 'wrong' : 'coin');
      this.cameras.main.flash(250, (seg.color >> 16) & 255, (seg.color >> 8) & 255, seg.color & 255);
      capa.add(txt(this, W / 2, 476, `¡${seg.t}! ${msg}`, 20, '#ffe08a', { align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5, 0));
      capa.add(button(this, W / 2, 516, 200, 34, 'Seguir', () => { capa.destroy(); alTerminar(`Rueda: ${msg}`); }, { size: 18, color: UI.gold }));
    } });
  }

  // ── El Observatorio: el Astrónomo Aficionado de Providence (src/data/lovecraft.ts) ──
  private observatorio() {
    this.limpiar();
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const run = Game.run!;
    // cielo estrellado detrás
    const cielo = this.add.graphics();
    for (let i = 0; i < 120; i++) cielo.fillStyle(0xffffff, Math.random() * 0.7).fillCircle(Math.random() * W, Math.random() * 300, Math.random() < 0.1 ? 2 : 1);
    L(cielo);
    // v0.58 · cuerpo entero leyendo, con tentáculos que se mecen detrás (de lo que lee)
    this.tentaculos(L, 120, 470);
    const por = L(this.add.image(120, 300, 'fig_astronomo').setScale(5));
    this.tweens.add({ targets: por, y: 296, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    L(this.add.image(232, 150, 'i_telescopio').setScale(5));
    L(title(this, W / 2 + 90, 40, 'El Observatorio', 38, '#c8b8ff'));
    L(txt(this, W / 2 + 90, 74, ASTRONOMO, 18, '#8a7a9a').setOrigin(0.5, 0));
    L(txt(this, W / 2 + 90, 100, '«Pase, pase. Desde aquí abajo las estrellas se ven al revés, pero se ven. Elija una constelación y mírela bien: brillará más para usted.»', 17, '#d8c8a0', { align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5, 0));
    const CONST: [string, string, string][] = [
      ['marte', 'ATAQUE', 'Tus Ataques +2 por nivel'], ['luna', 'DEFENSA', 'Tus Defensas +3 de Bloqueo por nivel'],
      ['mercurio', 'HABILIDAD', '+2 Bloqueo y +2 al siguiente ataque por nivel'], ['saturno', 'ABISMO', 'Cartas del Abismo ×1.25 por nivel'],
      ['jupiter', 'GRAVEDAD', '+1 kg (o m/s) al empezar por nivel'], ['neptuno', 'ÓRBITA', '+1 J cada 3 turnos por nivel'],
    ];
    const opciones = Phaser.Utils.Array.Shuffle([...CONST]).slice(0, 3);
    const nivel = (id: string) => nivelDiente(run.dientes, id, run.cosmos);
    let elegida = false;
    const tarjetas: Phaser.GameObjects.Container[] = [];
    const pie = this.add.container(0, 0);
    L(pie);
    opciones.forEach(([id, nom, efecto], i) => {
      const x = W / 2 + 90 + (i - 1) * 205, y = 168;
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      frame(g, -95, 0, 190, 210, 0x0c0a18, 0x6a5ab0, 0.97);
      // la constelación: estrellas unidas con líneas
      const pts = Array.from({ length: 5 }, (_, k) => [-60 + k * 30 + Phaser.Math.Between(-8, 8), 50 + Phaser.Math.Between(-24, 24)]);
      g.lineStyle(1, 0x8a7ad8, 0.8);
      for (let k = 1; k < pts.length; k++) g.lineBetween(pts[k - 1][0], pts[k - 1][1], pts[k][0], pts[k][1]);
      for (const [px, py] of pts) g.fillStyle(0xfff6c0, 1).fillCircle(px, py, 3);
      c.add(g);
      c.add(dibujarDiente(this, 0, 54, id, 0.6).setAlpha(0.9));
      c.add(txt(this, 0, 96, nom, 20, '#ffd060').setOrigin(0.5, 0));
      c.add(txt(this, 0, 122, efecto, 14, CSS.bone, { align: 'center', wordWrap: { width: 176 } }).setOrigin(0.5, 0));
      const nv = txt(this, 0, 176, `Nivel ${nivel(id)} → ${nivel(id) + 1}`, 17, '#c8b8ff').setOrigin(0.5, 0);
      c.add(nv);
      c.setSize(190, 210).setInteractive(new Phaser.Geom.Rectangle(-95, 0, 190, 210), Phaser.Geom.Rectangle.Contains);
      c.input!.cursor = 'pointer';
      c.on('pointerdown', () => {
        if (elegida) return;
        elegida = true;
        (run.cosmos ??= {})[id] = (run.cosmos[id] ?? 0) + 1;
        saveLocal();
        audio.sfx('coin');
        this.cameras.main.flash(400, 200, 190, 255);
        nv.setText(`¡Nivel ${nivel(id)}!`).setColor('#ffd060');
        tarjetas.forEach((t) => { if (t !== c) t.setAlpha(0.4); });
        // v0.58 · después de la constelación, un favor del Astrónomo
        this.time.delayedCall(900, () => {
          tarjetas.forEach((t) => t.destroy());
          this.favoresAstronomo(pie, id, nom);
        });
      });
      tarjetas.push(L(c));
    });
    L(txt(this, W / 2, 486, FICHA_LOVECRAFT, 13, '#6a6a7a', { align: 'center', wordWrap: { width: 880 } }).setOrigin(0.5, 0));
    this.botonGuia();
  }

  /** v0.58 · Tentáculos que salen del suelo detrás del Astrónomo y se mecen (bloques de 4 px, como pixel art) */
  private tentaculos(L: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x0: number, y0: number) {
    const g = L(this.add.graphics());
    const T = [
      { dx: -66, alto: 330, fase: 0, grosor: 13, giro: 1 }, { dx: 70, alto: 360, fase: 2.1, grosor: 14, giro: -1 },
      { dx: -30, alto: 230, fase: 4.0, grosor: 10, giro: -1 }, { dx: 104, alto: 210, fase: 1.2, grosor: 9, giro: 1 },
    ];
    const q = (v: number) => Math.round(v / 3) * 3;
    const dibujar = (t: number) => {
      g.clear();
      for (const k of T) {
        const N = 60;
        const pts: [number, number, number][] = [];
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          // sube ondulando y la punta se enrosca
          const curl = u > 0.75 ? (u - 0.75) * 4 : 0;
          const x = x0 + k.dx + Math.sin(t * 1.3 + k.fase + u * 4.2) * 30 * u + k.giro * Math.sin(curl * 2.6) * 26;
          const y = y0 - u * k.alto + (1 - Math.cos(curl * 2.6)) * 22;
          pts.push([x, y, Math.max(2, k.grosor * (1 - u * 0.88))]);
        }
        for (const [x, y, r] of pts) g.fillStyle(0x0a0610, 1).fillRect(q(x - r - 3), q(y - r - 3), q(2 * r + 6), q(2 * r + 6));
        pts.forEach(([x, y, r], i) => g.fillStyle(i > N * 0.6 ? 0x5a3480 : 0x40225e, 1).fillRect(q(x - r), q(y - r), q(2 * r), q(2 * r)));
        pts.forEach(([x, y, r], i) => { if (i % 6 === 0 && r > 4) g.fillStyle(0xc8a0e0, 0.95).fillRect(q(x + r * 0.3), q(y), 3, 3); }); // ventosas
      }
    };
    dibujar(0);
    const ev = this.time.addEvent({ loop: true, delay: 60, callback: () => { if (!g.active) { ev.remove(); return; } dibujar(this.time.now / 1000); } });
  }

  /** v0.58 · Los favores del Astrónomo (eliges uno): pregunta de órbitas, telescopio prestado o una hoja de Montemayor */
  private favoresAstronomo(pie: Phaser.GameObjects.Container, id: string, nom: string) {
    const run = Game.run!;
    const cx = W / 2 + 90;
    pie.add(txt(this, cx, 168, '«Ya que está aquí… ¿le ayudo con algo más?» (elige uno)', 18, '#c8b8ff').setOrigin(0.5, 0));
    const quedanHojas = (run.diario ?? 0) < HOJAS_POR_EXPEDICION && (Game.codex.diario ?? 0) + 1 < PROLOGO.length && !run.hojaSegura;
    const FAV: { t: string; d: string; ok: boolean; hacer: () => string | void }[] = [
      { t: 'Pregunta de órbitas', d: `Movimiento circular. Si aciertas: ${nom} sube otro nivel. Si fallas: −${ASTRONOMO_MAL} de Cordura.`, ok: true,
        hacer: () => { fadeTo(this, 'Rune', { floor: run.floor ?? 0, source: 'observatorio', constelacion: [id, nom] }); } },
      { t: 'Que te preste el telescopio', d: `En tus ${TELESCOPIO_COMBATES} siguientes combates ves lo que harán los enemigos invisibles, de noche y la Calculadora sin batería.`, ok: true,
        hacer: () => { run.telescopio = (run.telescopio ?? 0) + TELESCOPIO_COMBATES; return '«Cuídelo. Ve más lejos de lo que debería.»'; } },
      { t: 'Una hoja de Montemayor', d: quedanHojas ? 'Te señala dónde cayó una hoja del diario: la encuentras al volver al mapa.' : 'Ya no quedan hojas que señalar en esta expedición.', ok: quedanHojas,
        hacer: () => { run.hojaSegura = true; return '«Por allá, junto a la escalera. La vi caer desde el telescopio.»'; } },
    ];
    const btns: ReturnType<typeof button>[] = [];
    FAV.forEach((f, i) => {
      const x = cx + (i - 1) * 210, y = 214;
      const g = this.add.graphics();
      frame(g, x - 100, y - 10, 200, 160, 0x0c0a18, f.ok ? 0x6a5ab0 : 0x3a3448, 0.97);
      pie.add(g);
      pie.add(txt(this, x, y + 50, f.d, 14, f.ok ? CSS.bone : CSS.dim, { align: 'center', wordWrap: { width: 184 } }).setOrigin(0.5, 0));
      const b = button(this, x, y + 18, 186, 36, f.t, () => {
        btns.forEach((o) => o.setEnabled(false));
        audio.sfx('coin');
        const msg = f.hacer();
        if (msg === undefined) return; // la pregunta cambia de escena
        saveLocal();
        pie.add(txt(this, cx, 392, msg, 18, '#d8c8a0').setOrigin(0.5, 0));
        pie.add(button(this, W / 2 - 40, 440, 260, 40, 'Acomodar mi dentadura', () => this.sacamuelas('acomodar', () => fadeTo(this, 'Map')), { size: 18, color: 0x6a5ab0 }));
        pie.add(button(this, W / 2 + 240, 440, 220, 40, 'Volver al mapa', () => fadeTo(this, 'Map'), { size: 18, color: UI.gold }));
      }, { size: 16, color: 0x3a2a6a });
      if (!f.ok) b.setEnabled(false);
      btns.push(b);
      pie.add(b);
    });
  }

  /** Después del sobre: un diente del jefe y luego el siguiente tramo */
  private trofeo() {
    this.sacamuelas('premio', () => this.siguienteTramo());
  }

  /** Un sobre de premio al azar (te quedas con 1) */
  private sobrePremio(alTerminar: () => void) {
    this.premio = { def: Phaser.Utils.Array.GetRandom(SOBRES), alTerminar: () => { this.premio = null; alTerminar(); } };
    this.sobre(0);
  }

  /** Pasa al siguiente tramo: nuevo mapa y nuevo jefe al azar */
  private siguienteTramo() {
    const run = Game.run!;
    run.tramo = (run.tramo ?? 1) + 1;
    run.jefe = elegirJefe(run.tramo, run.jefesVistos ?? []);
    run.mutador = sortearMutador(run.mutador);
    // v0.49 · el alma del Abismo se despide al cambiar de tramo
    if (run.aliadoTramo !== undefined) { delete run.aliado; delete run.aliadoTramo; }
    if (!run.debug && run.tramo >= 4) codexFlag('logro_abismo_inf'); // logro «Sin fondo»
    (run.jefesVistos ??= []).push(run.jefe);
    run.map = generateMap(ACTO_ABISMO);
    run.pos = -1;
    run.visited = [];
    run.floor = 0;
    saveLocal();
    syncRun('en curso');
    this.cameras.main.flash(400, 20, 60, 50);
    fadeTo(this, 'Map');
  }

  /** Termina la expedición después de vencer a un Primigenio */
  private retirarse() {
    const run = Game.run!;
    run.done = true;
    bonosFinales(run);
    logEvent('acto', '', true, { acto: 5, tramo: run.tramo, modo: 'abismo', retiro: true });
    saveLocal();
    syncRun('victoria', `Se retiró en la profundidad ${run.tramo}`);
    fadeTo(this, 'End', { victory: true, abismo: true });
  }

  /** Crea la expedición del Abismo y baja al mapa */
  private empezar() {
    Game.preparando = false;
    const p = this.elegido;
    const d = this.d;
    // «L-» hace que el servidor la registre aunque no se haya iniciado en línea (src/backend.ts → updateRun)
    const r = newRun(`${d.debug ? 'DBG' : 'L-ABI'}-${Date.now().toString(36)}`, d.gravedad ?? 1, d.clase);
    r.debug = d.debug ?? true;
    r.modo = 'abismo';
    r.acto = ACTO_ABISMO;
    r.map = generateMap(ACTO_ABISMO);
    r.necro = this.pagina?.id;
    r.pacto = p?.id ?? 'ciego';
    r.diario = 0; // hojas encontradas en ESTA expedición (la del cerro se lee siempre al empezar)
    r.tramo = 1;
    r.jefe = elegirJefe(1);
    r.jefesVistos = [r.jefe];
    r.mutador = sortearMutador();
    r.entropia = 100 - CORDURA.inicial;
    let uid = 1;
    r.deck = this.mazo.map((c) => (c.ed ? { uid: uid++, id: c.id, up: c.up, ed: c.ed } : { uid: uid++, id: c.id, up: c.up }));
    r.nextUid = uid;
    if (p?.vidaMax) { r.maxHp += p.vidaMax; r.hp = r.maxHp; }
    r.dientes = [...this.dientesIni];
    while (r.dientes.length < HUECOS) r.dientes.push(null);
    aplicarSarro(r);
    if (!p) r.entropia = Math.max(0, r.entropia - PACTO_CIEGO_CORDURA);
    // efectos iniciales de la página del Necronomicón
    switch (r.necro) {
      case 'geometria': r.maxHp -= 10; r.hp = r.maxHp; break;
      case 'mercader': r.ergios += 100; r.entropia += 15; break;
      case 'confusion': editarAlAzar(r.deck, 'poli', 1); break;
      case 'cristal': editarAlAzar(r.deck, 'cristal', 3); break;
    }
    if (d.tanque) r.maxHp = r.hp = r.maxHp * 10;
    r.relics = ['necronomicon']; // el libro baja contigo
    r.deck.forEach((c) => unlock('cards', c.id));
    unlock('relics', 'necronomicon');
    Game.run = r;
    saveLocal();
    this.cameras.main.flash(400, 20, 60, 50);
    fadeTo(this, 'Map');
  }
}
