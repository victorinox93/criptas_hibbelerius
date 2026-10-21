import Phaser from 'phaser';
import { ASTROS } from '../data/astros';
import { mascotaActual, mascotaJunto } from '../ui/mascota';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { gravityOf, GravityLevel } from '../data/gravity';
import { CalcCtx, CardDef, CARDS, CardInst, CardStats, force, kinetic, limiteDano, pmv, rocket, statsOf, VE_BASE, VMAX } from '../data/cards';

/** Penitente: rapidez máxima y rapidez mínima para esquivar */
const VMAX_PEN = 14;
/** Cada vez que detienes a un jefe, su umbral se multiplica por esto */
const UMBRAL_JEFE_MUL = 1.5;

/** Fuerza necesaria (en un solo golpe) para detener a un enemigo */
function umbralDe(st: EnemyState) {
  if (!st.def.umbral) return 0;
  return Math.round((st.def.umbral + (st.phase2 ? 3 : 0)) * (st.umbralMul ?? 1));
}
const ESQUIVA = 6;
import { dejarSigno, usarHuella } from '../huellas';
import { AddCards, danoDe, encounters, ENCOUNTERS_SUENO, ENEMIES, EnemyState, Intent, masaTexto, pick, spawn } from '../data/enemies';
import { aplicarSarro, enAbismo, addEntropia, addErgios, boonLevel, codexFlag, amVencido, codexWin, contarHib, Game, nucleoDisponible, otorgarInsigniaAM, logEvent, saveLocal, syncRun, unlock, contarBaja, addFamiliar } from '../state';
import { CONDITION_CHANCE, CONDITIONS, ConditionDef } from '../data/conditions';
import { FAMILIARS } from '../data/familiars';
import { ALMAS } from '../data/almas';
import { ENTROPIA, SUSURROS } from '../data/abismo';
import { alineacion, ALINEACION, cuantosAstros, defDiente, esAstro, esParasito, gastarCristal, MULT_DIENTES_MAX, nivelDiente } from '../data/dientes';
import { cumplirCarta } from '../data/lovecraft';
import { CONDICION_JEFE, CONDICIONES_JEFE, HOJAS_DEBILIDAD, MORDIDAS_JEFE, MORDIDAS_PRIMIGENIO, MUTADOR, VIDA_ABISMO, CORDURA, corduraDe, EDICIONES, escalaDano, escalaTramo, JEFES as JEFES_ABISMO, multPuntaje, nombreTramo, ROMPER_CRISTAL, TRAMOS } from '../data/abismo_modo';
import { abismoBackground } from '../art/abismo';
import { completarEncargo } from '../data/encargos';
import { RELICS } from '../data/relics';
import { bonosFinales, JEFES, PUNTOS, sumar } from '../data/puntaje';
import { POCIONES } from '../data/pociones';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { T } from '../textos';
import { cardView, CardView, CH, costConfusion, costOverride } from '../ui/card';
import { deckOverlay, Hud, setPotionHandler, topBar } from '../ui/hud';
import { bar, button, Btn, dungeonBackground, fadeTo, frame, icon, nucleoBackground, towerBackground, castleBackground, title, Tooltip, txt } from '../ui/widgets';

type Kind = 'easy' | 'normal' | 'elite' | 'boss';

interface EnemyView {
  st: EnemyState;
  root: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
  hp: ReturnType<typeof bar>;
  blockT: Phaser.GameObjects.Text;
  intentC: Phaser.GameObjects.Container;
  statusC: Phaser.GameObjects.Container;
  baseX: number;
  dead: boolean;
  nameT: Phaser.GameObjects.Text;
}

const HAND_Y = 460;
const CARD_SCALE = 0.66;

export class CombatScene extends Phaser.Scene {
  private kind: Kind = 'easy';
  private floor = 0;
  private tip!: Tooltip;
  private hud!: Hud;
  private enemies: EnemyView[] = [];
  private draw: CardInst[] = [];
  private hand: CardView[] = [];
  private discard: CardInst[] = [];
  private exhaust: CardInst[] = [];
  private energy = 3;
  private maxEnergy = 3;
  private block = 0;
  private acel = 0;
  private masa = 0;
  private friccion = 0;
  private reflect = false;
  private keepBlock = false;
  private busy = false;
  private turn = 0;
  private firstAttack = false;
  private grav: GravityLevel = gravityOf(1);
  private selected: CardView | null = null;
  private hero!: Phaser.GameObjects.Image;
  private heroX = 220;
  private hpBar!: ReturnType<typeof bar>;
  private pBlockT!: Phaser.GameObjects.Text;
  private pStatus!: Phaser.GameObjects.Container;
  private energyT!: Phaser.GameObjects.Text;
  private drawT!: Phaser.GameObjects.Text;
  private discT!: Phaser.GameObjects.Text;
  private endBtn!: Btn;
  private calcLines: Phaser.GameObjects.Text[] = [];
  private hintT!: Phaser.GameObjects.Text;
  private bannerT!: Phaser.GameObjects.Text;
  private log: string[] = [];
  private zones: Phaser.GameObjects.GameObject[] = [];
  private baseAcel = 0;
  // Acto II / nuevas mecánicas
  private isArc = false; // jugando con el Arcanista
  private isPen = false; // jugando con el Penitente del Empuje (masa variable)
  private vmax = VMAX; // rapidez máxima según la clase
  private ve = VE_BASE; // Penitente: velocidad de escape de sus gases (m/s)
  private critica = false; // Masa Crítica: ataques ×1.5 con poca masa
  /** Clases que usan rapidez v en vez de aceleración */
  private get usaVel() { return this.isArc || this.isPen; }
  private vel = 0; // rapidez del Arcanista (m/s)
  private jPerTurn = 0; // Batería de Resorte
  // v0.53 · cartas nuevas del Abismo
  private giroscopio = 0; // Giroscopio: Bloqueo al inicio de cada turno y no te aturden
  private penduloB = 0; // Péndulo Físico: Bloqueo que regresa el siguiente turno
  private poderes = 0; // Poderes jugados en este combate (Tren de Engranes)
  private necroDin = false; // Necronomicón de Dinámica: detener = +1 J y robas 1
  private velPerTurn = 0; // Impulso Constante
  private pCalor = 0; // Calor sobre el jugador
  private discardMode = 0; // cartas por descartar (Diagrama de Cuerpo Libre)
  private acto = 1;
  // v0.6: azar, radiación, familiares
  private cond: ConditionDef | null = null; // condición del piso
  private marco = 0; // golpes que anula Marco de Referencia (Einstein)
  private polonio = 0; // daño extra de la carta de ataque en curso (Curie)
  private famImg: Phaser.GameObjects.Image | null = null;
  private aliadoImg: Phaser.GameObjects.Image | null = null; // alma en pena aliada (élites y jefes)
  private fantasmaImg: Phaser.GameObjects.Image | null = null; // v0.30: compañero invocado con su signo (sólo jefes)
  // v0.33 · estado de las almas nuevas
  private histBestia = false; // Fray Histéresis: forma bestia
  private histHp = 0; // vida al final del turno anterior (para su «límite elástico»)
  private hanbeiE = 0; // energía que Hanbei recibió por ti y te devolverá
  private aliadoN = 0; // turnos del aliado (Sir Mañana)
  // v0.7: Acto III y cartas nuevas
  private estela = false; // Estela Cinética: cada ataque da +1 m/s
  private noFric = false; // Superficie Sin Fricción
  private restE = 0; // Coeficiente de Restitución activo (0 = no)
  private played = 0; // cartas jugadas este turno (Impulso Angular)
  // v0.8: dones de Huygens, Hooke, Noether y Coriolis
  private centriUsed = false; // Fuerza Centrípeta (primer ataque del combate)
  private retornoUsed = false; // Retorno Elástico (primer golpe que te hace daño)
  private desvioUsed = false; // Efecto Coriolis (primer golpe de cada turno enemigo)
  private carry = 0; // Simetría en el Tiempo: J que pasan al siguiente turno
  private attacksTurn = 0; // ataques jugados este turno (Travail)
  private drainNext = 0; // J que te roban para tu siguiente turno (Sifón)
  // v0.10: cartas desbloqueables
  private palanca = false; // el siguiente ataque hace el doble
  private derivadaBono = 0; // Derivada: daño extra para el siguiente ataque
  private ley3 = false; // Asimov: la Tercera Ley ya se activó en este combate
  private isoRobo = false; // Péndulo Isócrono: robar 1 carta extra este turno
  private jugadasIni = 0; // cartas jugadas al empezar el turno (Máquina de Turing)
  private danoTurno = 0; // daño total hecho en este turno (Integral)
  private mult = 1; // multiplicador del ataque en curso
  private pierce = false; // Efecto Túnel: ignorar Bloqueo este turno
  private masaDef = false; // Masa Inamovible
  private calcBolsillo = 1; // v0.57 · Calculadora de Bolsillo: multiplicador del siguiente Ataque
  private hibbelerM = 0; // v0.57 · El Hibbeler Maldito: Bloqueo al detener
  private tareaT = new Map<number, number>(); // v0.57 · La Tarea Olvidada: turnos en la mano (uid)
  private telescopio = false; // v0.58 · ves las intenciones ocultas (telescopio del Astrónomo)
  private radianes = false; // v0.57 · la Calculadora Primigenia te cambió a RAD: Ataques ×0.6
  private sueno?: string; // v0.51 · clave de ENCOUNTERS_SUENO si es una pesadilla
  private astro?: string; // v0.59 · Astro Ambulante (src/data/astros.ts)
  private perforaGolpe = false; // v0.51 · el golpe enemigo actual atraviesa el Bloqueo (Sabueso de Tíndalos)
  private blockPerTurn = 0; // Resistencia del Material
  private orbit = 0; // Órbita Cerrada (masa del satélite)
  private entropia = 0; // Entropía (J por turno a cambio de vida)
  private extraDraw = 0; // Formulario
  private hpStart = 0; // vida al empezar (combate perfecto)
  // legendarias
  private penduloQ: { target: EnemyView; F: number }[] = []; // Péndulo: regresa al siguiente turno
  private resorteQ: number | null = null; // Resorte Comprimido: daño guardado (null = inactivo)
  private resorteMul = 1.5;
  private fuegoAmigo = false; // los ataques enemigos se desvían
  private hondaV = new Map<number, number>(); // Honda de David: rapidez por carta (uid)
  // ── El Abismo de los Ejes ──
  private confusa = false; // Confusión: cada carta robada cuesta 0–3 J al azar (costos en costOverride)
  // v0.42 · estados nuevos del Abismo (src/data/enemies.ts → hemorragia, aturde, vertigo)
  private hemorragia = 0; // turnos: cada carta que juegas te quita 1 de vida
  private aturdido = false; // pierdes tu siguiente turno
  private trasAturdir = false; // justo después de perder un turno no te pueden volver a aturdir
  private vertigo = 0; // robas N cartas menos en tu siguiente turno
  private mercurioBono = 0; // Diente de Mercurio: daño guardado para tu siguiente ataque
  private estadosC: Phaser.GameObjects.Container | null = null; // v0.44 · insignias de estado sobre el héroe
  private estrellas: Phaser.GameObjects.Container | null = null; // estrellitas girando cuando estás Aturdido
  private golpesTurno = new Map<EnemyState, number>(); // golpes recibidos este turno (Acólito: se vuelca con 2)
  private curAll = false; // la carta en curso golpea a TODOS (Profundo Hueco recibe la mitad)
  private steinerUsed = false; // Página de Steiner: primer ataque del combate ×2
  private rlyehUsado = false; // Diente de R'lyeh: primer ataque del combate ×3
  private jugoDefensa = false; // carta de Providence «sin Defensas»
  private condJefe = ''; // v0.48 · condición del jefe del Abismo (CONDICIONES_JEFE)
  private cartaTipo = ''; // tipo de la carta que se está resolviendo (para «Sin Defensa»)
  private mordidos: number[] = []; // v0.46 · huecos de la dentadura que el jefe mordió (no funcionan en esta pelea)
  private bonusJ1 = 0; // J extra en el primer turno (Boltzmann, Cantor)
  private robo1 = 0; // cartas extra en el primer turno (Newton 1693, página de la Confusión)

  constructor() { super('Combat'); }

  init(data: { kind: Kind; floor: number; sueno?: string; astro?: string }) {
    this.astro = data.astro;
    this.kind = data.kind;
    this.floor = data.floor;
    this.sueno = data.sueno; // v0.51 · pesadilla (src/scenes/Sueno.ts)
    this.radianes = false;
    // v0.58 · el telescopio prestado del Astrónomo: dura unos combates
    this.telescopio = (Game.run?.telescopio ?? 0) > 0;
    if (this.telescopio && Game.run) Game.run.telescopio = Game.run.telescopio! - 1;
    this.calcBolsillo = 1;
    this.hibbelerM = 0;
    this.tareaT = new Map();
    this.enemies = [];
    this.hand = [];
    this.discard = [];
    this.exhaust = [];
    this.maxEnergy = 3 + (this.has('reactor') ? 1 : 0) + (this.has('tomo') ? 1 : 0) + (this.prohibido('p_energia') ? 1 : 0);
    this.energy = this.maxEnergy;
    this.block = 0;
    this.acel = 0;
    this.masa = 0;
    this.friccion = 0;
    this.reflect = false;
    this.keepBlock = false;
    this.busy = false;
    this.turn = 0;
    this.selected = null;
    this.calcLines = [];
    this.zones = [];
    this.log = [];
    this.baseAcel = 0;
    this.vel = 0;
    this.jPerTurn = 0;
    this.giroscopio = 0;
    this.penduloB = 0;
    this.poderes = 0;
    this.necroDin = false;
    this.velPerTurn = 0;
    this.pCalor = 0;
    this.hemorragia = 0;
    this.aturdido = false;
    this.trasAturdir = false;
    this.vertigo = 0;
    this.mercurioBono = 0;
    this.estadosC = null;
    this.estrellas = null;
    this.discardMode = 0;
    this.cond = null;
    this.marco = 0;
    this.polonio = 0;
    this.famImg = null;
    this.penduloQ = [];
    this.resorteQ = null;
    this.fuegoAmigo = false;
    this.hondaV = new Map();
    this.aliadoImg = null;
    this.fantasmaImg = null;
    this.aliadoN = 0;
    this.histBestia = false;
    this.histHp = Game.run?.hp ?? 0;
    this.hanbeiE = 0;
    this.estela = false;
    this.noFric = false;
    this.restE = 0;
    this.played = 0;
    this.centriUsed = false;
    this.retornoUsed = false;
    this.desvioUsed = false;
    this.carry = 0;
    this.attacksTurn = 0;
    this.drainNext = 0;
    this.palanca = false;
    this.mult = 1;
    this.pierce = false;
    this.masaDef = false;
    this.blockPerTurn = 0;
    this.orbit = 0;
    this.entropia = 0;
    this.extraDraw = 0;
    this.hpStart = Game.run?.hp ?? 0;
    this.confusa = false;
    costOverride.clear();
    costConfusion.clear();
    this.golpesTurno = new Map();
    this.curAll = false;
    this.steinerUsed = false;
    this.rlyehUsado = false;
    this.jugoDefensa = false;
    this.mordidos = [];
    this.condJefe = '';
    this.cartaTipo = '';
    this.bonusJ1 = 0;
    this.robo1 = 0;
    if (Game.run?.necro === 'sueno') this.maxEnergy += 1; // El Sueño Profundo
    this.energy = this.maxEnergy;
  }

  /** ¿Está vivo este jefe del Abismo? (para sus desventajas) */
  private jefeVivo(id: string) {
    return this.acto === 5 && this.alive().some((e) => e.st.def.id === id);
  }

  private necro(id: string) {
    return Game.run?.modo === 'abismo' && Game.run.necro === id;
  }
  private pacto(id: string) {
    return Game.run?.modo === 'abismo' && Game.run.pacto === id;
  }
  /** Nivel de un diente de la Dentadura (0 = no lo tienes; el Diente Espejo suma copias) */
  private diente(id: string) {
    if (Game.run?.modo !== 'abismo') return 0;
    const n = nivelDiente(this.dentEfectiva(), id, Game.run.cosmos);
    // mutador «Cielo Despejado»: los Astros que tienes cuentan +1 nivel
    return n && Game.run.mutador === 'despejado' && esAstro(id) ? n + 1 : n;
  }
  /** La dentadura sin los dientes que el jefe mordió (v0.46) */
  private dentEfectiva() {
    const d = Game.run?.dientes ?? [];
    if (this.condJefe === 'sinDientes') return d.map(() => null);
    return this.mordidos.length ? d.map((x, i) => (this.mordidos.includes(i) ? null : x)) : d;
  }

  /** Carta del Astrónomo de Providence: si la misión activa es «id», se cumple */
  private cartaLovecraft(id: string) {
    if (cumplirCarta(id)) {
      this.floatText(W / 2, 150, '✉ ¡Carta de Providence cumplida!', '#ffd060');
      this.calc('Carta de Providence cumplida: el trofeo del próximo jefe traerá 3 dientes legendarios');
    }
  }

  /** La Dentadura y el cosmos sobre un Ataque (se suman a this.polonio y se multiplican en this.mult) */
  private dientesAtaque(def: CardDef) {
    const b = this.dientesBonos(def, this.attacksTurn);
    this.polonio += b.suma;
    this.mult *= b.k;
    b.lineas.forEach((l) => this.calc(l));
    if (b.rlyeh) this.rlyehUsado = true;
    this.mercurioBono = 0;
  }

  /**
   * v0.50 · Los bonos de la Dentadura y el cosmos para un Ataque, SIN cambiar nada
   * (lo usan el ataque real y la vista previa de la carta). nAtaque = qué ataque del turno sería.
   */
  private dientesBonos(def: CardDef, nAtaque: number) {
    const lineas: string[] = [];
    const sumas: string[] = [];
    let suma = 0;
    const s = (n: number, t: string) => { if (n) { suma += n; lineas.push(`${t}: +${n}`); sumas.push(`${t.replace(/^[✦☣] /, '').replace(/ · Ataque nv \d+/, '')} +${n}`); } };
    const col = this.diente('colmillo');
    s(2 * col, 'Colmillo de Profundo');
    const dmt = this.diente('diamante');
    s(4 * dmt, 'Diente de Diamante');
    const ojo = this.diente('ojo');
    s(3 * ojo, '☣ Ojo Parpadeante');
    // v0.46 · BALANCE: los multiplicadores de los dientes ya no se multiplican entre sí:
    // se SUMAN (+1 de R'lyeh, +0.25 por nivel de Saturno, +0.1 por Astro del Sol Negro,
    // +0.5 de la Alineación) y el total tiene un tope de ×MULT_DIENTES_MAX.
    let extra = 0;
    const partes: string[] = [];
    const rly = this.diente('rlyeh');
    const rlyeh = !!rly && !this.rlyehUsado;
    if (rlyeh) { extra += rly; partes.push(`R'lyeh +${rly}`); }
    const mar = this.diente('marte');
    if (mar) s(2 * mar, `✦ Marte · Ataque nv ${mar}`);
    if (this.mercurioBono) { suma += this.mercurioBono; lineas.push(`✦ Mercurio: +${this.mercurioBono} guardado`); sumas.push(`Mercurio +${this.mercurioBono}`); }
    if (this.pacto('palanca') && nAtaque === 1) { suma += 4; lineas.push('Pacto de la Palanca: brazo largo, +4 al primer ataque'); sumas.push('Pacto de la Palanca +4'); }
    const sat = this.diente('saturno');
    if (sat && def.abismo) { extra += 0.25 * sat; partes.push(`Saturno +${(0.25 * sat).toFixed(2)}`); }
    const sol = this.diente('sol');
    const dent = this.dentEfectiva();
    if (sol) { const k = 0.1 * cuantosAstros(dent) * sol; extra += k; partes.push(`Sol Negro +${k.toFixed(1)}`); }
    if (alineacion(dent)) { extra += ALINEACION - 1; partes.push(`Alineación +${(ALINEACION - 1).toFixed(1)}`); }
    let k = 1;
    let cosmos = '';
    if (extra > 0) {
      k = Math.min(MULT_DIENTES_MAX, 1 + extra);
      cosmos = `Cosmos ×${r1(k)} (${partes.join(' · ')}${1 + extra > MULT_DIENTES_MAX ? ` · tope ×${MULT_DIENTES_MAX}` : ''})`;
      lineas.push(`✦ Cosmos: ×${k.toFixed(2)} (${partes.join(' · ')}${1 + extra > MULT_DIENTES_MAX ? ` · tope ×${MULT_DIENTES_MAX}` : ''})`);
    }
    return { suma, k, lineas, rlyeh, sumas, cosmos };
  }

  /** La Dentadura y el cosmos sobre Defensas, Habilidades y Poderes */
  private dientesNoAtaque(def: CardDef) {
    if (def.type === 'Defensa') this.jugoDefensa = true;
    const dmd = this.diente('diamante');
    if (dmd && def.type === 'Defensa') { this.gainBlock(4 * dmd); this.calc(`Diente de Diamante: +${4 * dmd} de Bloqueo`); }
    if (Game.run?.mutador === 'eco' && def.type === 'Defensa') { this.gainBlock(3); this.calc('Eco del Abismo: +3 de Bloqueo'); }
    const lun = this.diente('luna');
    if (lun && def.type === 'Defensa') { this.gainBlock(3 * lun); this.calc(`✦ Luna · Defensa nv ${lun}: +${3 * lun} de Bloqueo`); }
    const mer = this.diente('mercurio');
    if (mer && def.type === 'Habilidad') { this.gainBlock(2 * mer); this.mercurioBono += 2 * mer; this.calc(`✦ Mercurio · Habilidad nv ${mer}: +${2 * mer} de Bloqueo y +${2 * mer} a tu siguiente ataque`); }
    const sat = this.diente('saturno');
    if (sat && def.abismo && def.rarity !== 'estado') { this.gainBlock(3 * sat); this.calc(`✦ Saturno · Abismo nv ${sat}: +${3 * sat} de Bloqueo`); }
  }

  /** Confusión (como en Slay the Spire): desde ahora cada carta robada cuesta 0–3 J al azar */
  private confundir(fuente: string) {
    if (this.confusa) return;
    this.confusa = true;
    for (const c of this.hand) if (CARDS[c.inst.id].rarity !== 'estado') {
      costOverride.set(c.inst.uid, Phaser.Math.Between(0, 3) + (this.jefeVivo('hastur') && CARDS[c.inst.id].type === 'Ataque' ? 1 : 0));
      costConfusion.add(c.inst.uid);
    }
    this.calc(`${fuente}: ¡estás CONFUNDIDO! Tus cartas cuestan 0–3 J al azar`);
    this.anunciarEstado('¡CONFUNDIDO!', `${fuente}: tus cartas cuestan de 0 a 3 J al azar (gema naranja con «?»)`, 0xe8781a, '#ffb050');
    this.floatText(this.heroX, 190, '¿¿CONFUSIÓN??', '#ffd040');
    this.refreshPlayer();
  }

  /** Reglas del Abismo al iniciar el combate: página del Necronomicón, Pacto y Ecos Quebrados */
  private abismoModoInicio() {
    const run = Game.run!;
    if (run.modo !== 'abismo') return;
    const masaOVel = (n: number, fuente: string) => {
      if (this.usaVel) this.vel = Math.min(this.vmax, this.vel + n);
      else this.masa += n;
      this.calc(`${fuente}: +${n} ${this.usaVel ? 'm/s' : 'kg'}`);
    };
    if (this.necro('geometria')) masaOVel(2, 'Geometría Imposible');
    if (this.pacto('excentrico')) masaOVel(2, 'Pacto Excéntrico');
    if (this.pacto('inercia')) { this.block += 6; this.calc('Pacto de la Inercia: +6 de Bloqueo'); }
    if (this.pacto('cafeina')) { this.bonusJ1 += 1; this.calc('Pacto de la Cafeína: +1 J en tu primer turno'); }
    // mutador del tramo (v0.46)
    const mu = MUTADOR(run.mutador);
    if (mu) this.calc(`Mutador del tramo · ${mu.nombre}`);
    if (run.mutador === 'gravedad') masaOVel(3, 'Gravedad Doble');
    if (run.mutador === 'masa') { this.block += 8; this.calc('Masa Extra: +8 de Bloqueo'); }
    if (run.mutador === 'eco') this.addStatus({ id: 'susurro', n: 1, to: 'draw' });
    // los jefes del Abismo muerden la dentadura: 1 diente (2 los Primigenios) no funciona en esta pelea
    if (this.kind === 'boss' && JEFES_ABISMO[this.alive()[0]?.st.def.id ?? '']) {
      const prim = !!JEFES_ABISMO[this.alive()[0].st.def.id].primigenio;
      // v0.48: cada jefe impone una condición al azar (la mordida es una de ellas)
      this.condJefe = Phaser.Utils.Array.GetRandom(CONDICIONES_JEFE).id;
      if (this.condJefe === 'mordida') {
        const libres = (run.dientes ?? []).map((x, i) => (x && !esParasito(x) ? i : -1)).filter((i) => i >= 0);
        this.mordidos = Phaser.Utils.Array.Shuffle(libres).slice(0, prim ? MORDIDAS_PRIMIGENIO : MORDIDAS_JEFE);
      }
    }
    run.mordidos = this.mordidos.length ? [...this.mordidos] : undefined; // v0.52 · la dentadura los marca
    // la Dentadura
    const mp = this.diente('muelaPlomo');
    if (mp) { this.block += 6 * mp; this.calc(`Muela de Plomo: +${6 * mp} de Bloqueo`); }
    const inc = this.diente('incisivo');
    if (inc) this.robo1 += inc;
    const jup = this.diente('jupiter');
    if (jup) masaOVel(jup, `Diente de Júpiter (Gravedad nv ${jup})`);
    // v0.61 · Alineación Planetaria: +1 J en tu primer turno durante el tramo
    if (run.modo === 'abismo' && run.alineacion === (run.tramo ?? 1)) { this.bonusJ1 += 1; this.calc('Alineación Planetaria: las fuerzas se suman → +1 J en tu primer turno'); }
    if (run.familiar?.id === 'europa') { this.block += 5; this.calc('Europa, la Luna de Hielo: +5 de Bloqueo'); }
    const cor = this.diente('cordal');
    if (cor) { this.bonusJ1 += cor; this.robo1 += cor; this.calc(`Cordal Despierta: +${cor} J y +${cor} carta en tu primer turno`); }
    const gar = this.diente('garrapata');
    if (gar) { run.hp = Math.max(1, run.hp - 3 * gar); this.calc(`☣ Garrapata de Leng: −${3 * gar} de vida`); }
    if (this.diente('ojo')) this.time.delayedCall(500, () => this.confundir('☣ Ojo Parpadeante'));
    const ast = this.diente('astilla');
    if (ast) this.time.delayedCall(700, async () => {
      const t = this.alive().length ? Phaser.Utils.Array.GetRandom(this.alive()) : null;
      if (!t) return;
      this.calc(`Astilla de Hueso: ${4 * ast} a ${t.st.def.name}`);
      this.beam(t, 0xe0d8c0);
      await this.hitEnemy(t, 4 * ast, false, 'res');
      await this.checkEnd();
    });
    if (this.necro('angulos')) {
      for (const e of this.alive()) { e.st.hp = e.st.maxHp = Math.round(e.st.maxHp * 1.15); this.refreshEnemy(e); }
      this.calc('Ángulos que No Suman: los enemigos tienen +15 % de vida');
    }
    if (this.necro('sueno')) this.addStatus({ id: 'susurro', n: 1, to: 'draw' });
    if (this.necro('confusion')) { this.robo1 += 1; this.time.delayedCall(400, () => this.confundir('La Confusión')); }
    // Ecos Quebrados
    const qa = boonLevel('qn_alquimia');
    if (qa) masaOVel(qa, 'Mercurio del Alquimista (Newton)');
    this.robo1 += boonLevel('qn_insomnio');
    const be = boonLevel('bo_equiparticion');
    if (be) this.block += 3 * be;
    const bs = boonLevel('bo_entropia');
    if (bs) {
      const n = Math.floor((run.entropia ?? 0) / (bs === 2 ? 20 : 25));
      if (n) { this.bonusJ1 += n; this.calc(`S = k·ln W (Boltzmann): Locura ${run.entropia} → +${n} J en tu primer turno`); }
    }
    const al = boonLevel('ca_aleph');
    if (al === 2) this.jPerTurn += 1;
    else if (al) this.bonusJ1 += 1;
  }

  private prohibido(id: string) {
    return (Game.run!.prohibidos ?? []).includes(id);
  }

  /** Horror cósmico al iniciar el combate (src/data/abismo.ts) */
  private abismoInicio() {
    const run = Game.run!;
    // primera expedición de la vida: los dos primeros combates son más suaves (−30 % de vida enemiga)
    if (!(Game.codex.flags ?? []).includes('primera') && this.kind === 'easy' && (run.acto ?? 1) === 1) {
      for (const e of this.alive()) { e.st.hp = e.st.maxHp = Math.max(1, Math.round(e.st.maxHp * 0.7)); this.refreshEnemy(e); }
      this.calc('Primera expedición: los enemigos de los primeros pisos vienen más débiles');
    }
    if (!this.necro('lucido')) {
      if (this.kind === 'boss') addEntropia(ENTROPIA.jefe);
      else if (this.kind === 'elite') addEntropia(ENTROPIA.elite);
    }
    // primera vez con el Penitente: cómo se juega
    if (this.isPen && !(Game.codex.flags ?? []).includes('pen_tuto')) {
      codexFlag('pen_tuto');
      this.time.delayedCall(2200, () => {
        const t = txt(this, W / 2, 150, 'Penitente: juega EMPUJE para acelerar (quema masa = vida).\nTus golpes valen p = m·v. Con v ≥ 6 m/s esquivas golpes.', 20, CSS.gold, { align: 'center' }).setOrigin(0.5).setDepth(700).setStroke('#000', 4);
        this.tweens.add({ targets: t, alpha: 0, delay: 7000, duration: 600, onComplete: () => t.destroy() });
      });
    }
    if (this.prohibido('p_masaneg')) {
      if (this.usaVel) this.vel = Math.min(this.vmax, this.vel + 3);
      else this.masa += 3;
    }
    if (this.prohibido('p_omega')) {
      for (const e of this.alive()) { e.st.hp = Math.max(1, Math.round(e.st.hp * 0.85)); this.refreshEnemy(e); }
      this.calc('Problema Ω: el universo se contrae → los enemigos empiezan con 15 % menos vida');
    }
    const e = run.entropia ?? 0;
    const lapida = boonLevel('bo_lapida');
    if (e >= ENTROPIA.max && lapida) {
      // La Lápida (Boltzmann): S = k·log W te sostiene; no aparece la Sombra
      run.entropia = lapida === 2 ? 30 : 50;
      this.calc(`La Lápida (Boltzmann): S = k·log W te sostiene → tu Locura baja a ${run.entropia}`);
    } else if (e >= ENTROPIA.max) {
      // Quiebre: aparece una Sombra que sólo tú ves
      const x = this.freeX(560);
      if (x !== null) {
        this.addEnemy(spawn('sombra'), x);
        run.entropia = ENTROPIA.trasQuiebre;
        this.calc('¡QUIEBRE! Tu Locura llegó a 100: algo salió de entre las ecuaciones…');
        this.cameras.main.flash(600, 40, 120, 40);
        logEvent('quiebre', '', '', { piso: this.floor });
        if (this.acto === 5 && !run.debug) codexFlag('logro_quiebre_abismo'); // v0.56 · Casco de la Entropía
      }
    }
    if (e >= ENTROPIA.inquieto) {
      this.time.delayedCall(2500, () => {
        const t = txt(this, W / 2 + 60, 140, Phaser.Utils.Array.GetRandom(SUSURROS), 19, '#9bf07a').setOrigin(0.5).setAlpha(0).setDepth(700);
        this.tweens.add({ targets: t, alpha: 0.85, duration: 1200, yoyo: true, hold: 1800, onComplete: () => t.destroy() });
      });
    }
    this.hud.refresh();
  }

  private has(relic: string) {
    return Game.run!.relics.includes(relic);
  }
  private hasFx(id: string) {
    return Game.run!.effects.some((e) => e.id === id && e.left > 0);
  }
  private ctx(): CalcCtx {
    return { masaBonus: this.masa, acelBonus: this.acel, friccion: this.friccion, g: this.grav.g, vel: this.vel, block: this.block, energy: this.energy, masa: Game.run!.hp, ve: this.ve, cordura: corduraDe(Game.run!.entropia) };
  }
  private wait(ms: number) {
    return new Promise<void>((r) => this.time.delayedCall(ms, () => r()));
  }

  create() {
    this.cameras.main.fadeIn(300);
    const run = Game.run!;
    this.acto = run.acto ?? 1;
    this.isArc = run.clase === 'arcanista';
    this.isPen = run.clase === 'penitente';
    this.vmax = this.isPen ? VMAX_PEN : VMAX;
    this.ve = VE_BASE;
    this.critica = false;
    this.grav = gravityOf(run.gravity);
    if (this.acto === 5) {
      audio.play(this.kind === 'boss' ? 'jefe5' : Math.random() < 0.5 ? 'combate6' : 'combate7');
      abismoBackground(this, 500 + this.floor * 7, this.kind === 'boss');
      if (this.sueno) {
        // v0.51 · el sueño: todo se tiñe de violeta y hay estrellas
        this.add.rectangle(0, 0, W, H, 0x1a0a3a, 0.45).setOrigin(0).setDepth(-6);
        this.add.rectangle(0, 0, W, H, 0x5a2aa0, 0.12).setOrigin(0).setDepth(-5).setBlendMode(Phaser.BlendModes.ADD);
        for (let i = 0; i < 40; i++) {
          const st = this.add.circle(Math.random() * W, 40 + Math.random() * 300, 1, 0xe8dcff, 0.6).setDepth(-4);
          this.tweens.add({ targets: st, alpha: 0.1, duration: 700 + Math.random() * 1500, yoyo: true, repeat: -1 });
        }
        this.time.delayedCall(900, () => this.anunciarEstado('PESADILLA', 'La vida que pierdas en el sueño no es real: al despertar la recuperas. La Cordura, sí.', 0x5a4aa8, '#c8b8ff'));
      }
      if (this.astro) {
        // v0.59 · Astro Ambulante: el techo del Abismo se abre al espacio
        this.add.rectangle(0, 0, W, H, 0x050418, 0.55).setOrigin(0).setDepth(-6);
        for (let i = 0; i < 70; i++) {
          const st = this.add.circle(Math.random() * W, 20 + Math.random() * 320, Math.random() < 0.15 ? 2 : 1, 0xfff4d8, 0.7).setDepth(-4);
          this.tweens.add({ targets: st, alpha: 0.1, duration: 600 + Math.random() * 1800, yoyo: true, repeat: -1 });
        }
        const a = ASTROS[this.astro];
        if (a) this.time.delayedCall(900, () => this.anunciarEstado(a.titulo.toUpperCase(), `${a.tema}. ${a.dato}`, 0x8a5a1a, '#ffd080'));
      }
    } else if (this.acto >= 4) {
      audio.play(this.kind === 'boss' ? 'jefe4' : 'combate5');
      nucleoBackground(this, 400 + this.floor * 7, this.kind === 'boss');
    } else if (this.acto === 3) {
      audio.play(this.kind === 'boss' ? 'jefe3' : 'combate4');
      towerBackground(this, 300 + this.floor * 7, this.kind === 'boss');
    } else if (this.acto === 2) {
      audio.play(this.kind === 'boss' ? 'jefe2' : 'combate3');
      castleBackground(this, 200 + this.floor * 7, this.kind === 'boss');
    } else {
      audio.play(this.kind === 'boss' ? 'jefe' : Math.random() < 0.5 ? 'combate' : 'combate2');
      dungeonBackground(this, 100 + this.floor * 7, this.kind === 'boss' ? 0x241820 : this.kind === 'elite' ? 0x201822 : 0x1c1722);
    }
    this.tip = new Tooltip(this);
    setPotionHandler((id) => this.usePotion(id));
    this.events.once('shutdown', () => setPotionHandler(null));
    this.hud = topBar(this, this.tip);

    // ── Jugador ──
    if (this.acto === 2) {
      // la única luz de las galerías: tu linterna
      const lamp = this.add.circle(this.heroX + 10, 260, 150, 0xd8a050, 0.07).setBlendMode(Phaser.BlendModes.ADD).setDepth(-4);
      this.tweens.add({ targets: lamp, alpha: 0.04, scale: 0.95, duration: 220, yoyo: true, repeat: -1 });
    }
    const av = Game.profile?.avatar;
    if (av) makeHeroFromAvatar(this, { ...av, clase: run.clase });
    this.hero = this.add.image(this.heroX, 272, 'hero').setScale(2.5);
    this.tweens.add({ targets: this.hero, scaleY: 2.56, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.add.ellipse(this.heroX, 330, 110, 16, 0x000000, 0.5).setDepth(-1);
    this.hpBar = bar(this, this.heroX - 70, 344, 140, 14, 0x9a3a4a);
    this.pBlockT = txt(this, this.heroX - 92, 351, '', 22, CSS.block).setOrigin(0.5);
    this.pStatus = this.add.container(this.heroX - 70, 371);

    // ── Enemigos ──
    // El Abismo: el jefe de cada tramo se sorteó al empezar el tramo (run.jefe)
    const enc = this.astro ? ASTROS[this.astro]?.encuentro ?? ['mercurio'] : this.sueno ? ENCOUNTERS_SUENO[this.sueno] ?? ['serIb'] : this.acto === 5 && this.kind === 'boss' ? [run.jefe ?? 'geometra'] : pick(encounters(this.acto)[this.kind]);
    const n = enc.length;
    enc.forEach((id, i) => this.addEnemy(spawn(id), 700 + (i - (n - 1) / 2) * 190));

    // ── UI de combate ──
    const orb = this.add.graphics();
    orb.fillStyle(0x000000, 1).fillCircle(62, 440, 36);
    orb.fillStyle(0x12333d, 1).fillCircle(62, 440, 32);
    orb.lineStyle(3, UI.energy, 1).strokeCircle(62, 440, 32);
    this.energyT = txt(this, 62, 434, '', 30, '#e8fbff').setOrigin(0.5);
    txt(this, 62, 458, T.combate.joules, 15, CSS.energy).setOrigin(0.5);
    const orbZ = this.add.zone(62, 440, 70, 70);
    this.tip.attach(orbZ, 'Energía (J)', 'Cada carta cuesta trabajo, medido en Joules. Recuperas 3 J al inicio de cada turno.');

    this.drawT = txt(this, 62, 510, '', 20, CSS.dim).setOrigin(0.5);
    const drawZ = this.add.zone(62, 510, 90, 24);
    drawZ.setInteractive({ useHandCursor: true }).on('pointerdown', () => deckOverlay(this, 'Mazo de robo (orden oculto)', [...this.draw].sort((a, b) => a.id.localeCompare(b.id))));
    this.discT = txt(this, W - 62, 510, '', 20, CSS.dim).setOrigin(0.5);
    const discZ = this.add.zone(W - 62, 510, 110, 24);
    discZ.setInteractive({ useHandCursor: true }).on('pointerdown', () => deckOverlay(this, 'Descarte', this.discard));

    this.endBtn = button(this, W - 82, 452, 140, 46, T.combate.finTurno, () => this.endTurn(), { color: UI.gold, size: 24 });

    // registro de cálculos
    const lg = this.add.graphics();
    frame(lg, W / 2 - 250, 48, 500, 66, 0x0f0c13, 0x2c2534, 0.85);
    txt(this, W / 2 - 238, 52, T.combate.pergamino, 16, '#5a5468');
    for (let i = 0; i < 2; i++) this.calcLines.push(txt(this, W / 2 - 238, 68 + i * 21, '', 20, i === 0 ? CSS.bone : CSS.dim));
    // pasar el cursor por el pergamino muestra los últimos cálculos completos
    const lz = this.add.zone(W / 2 - 250, 48, 500, 66).setOrigin(0).setInteractive();
    lz.on('pointerover', () => this.tip.show(W / 2 - 250, 120, T.combate.pergamino, this.log.slice(0, 8).join('\n') || '—'));
    lz.on('pointerout', () => this.tip.hide());
    this.hintT = txt(this, W / 2, 132, '', 22, CSS.gold).setOrigin(0.5).setDepth(700).setStroke('#000', 4);
    this.bannerT = this.add
      .text(W / 2, 220, '', { fontFamily: '"Pirata One", serif', fontSize: '56px', color: CSS.gold, stroke: '#000', strokeThickness: 8, resolution: 2 })
      .setOrigin(0.5)
      .setDepth(800)
      .setAlpha(0);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) this.cancelSelect();
    });
    this.input.keyboard?.on('keydown-ESC', () => this.cancelSelect());
    this.input.keyboard?.on('keydown-E', () => this.endTurn());
    // Modo profesor: K gana el combate al instante
    if (Game.run!.debug) {
      this.input.keyboard?.on('keydown-K', async () => {
        if (this.busy) return;
        this.calc('Modo profesor: combate ganado (tecla K)');
        while (this.alive().length) for (const e of this.alive()) await this.killEnemy(e);
        await this.checkEnd();
      });
      txt(this, W / 2, 531, 'Modo profesor · K = ganar', 15, '#e08a8a').setOrigin(0.5);
    }

    // ── Inicio ──
    this.draw = Phaser.Utils.Array.Shuffle([...run.deck]);
    if (this.has('yunque')) this.masa += 1;
    if (this.has('coraza')) this.block = 6;
    if (this.hasFx('yunque')) this.masa += 1;
    if (this.hasFx('hueca')) this.masa -= 1;
    if (this.hasFx('manto')) this.block += 8;
    if (this.hasFx('lodo') && !this.has('botas')) this.friccion += 2;
    if (this.hasFx('impulso')) this.baseAcel += 1;
    // dones de figuras históricas
    this.baseAcel += boonLevel('n_principia');
    const gig = boonLevel('duo_gigantes'); // Galileo + Newton
    if (gig) { this.baseAcel += 1; this.masa += gig; }
    this.block += 5 * boonLevel('j_trabajo');
    if (this.has('guante')) this.baseAcel += 1;
    this.marco = boonLevel('e_marco');
    this.abismoInicio();
    // ── condición del piso (azar) ──
    if (this.kind !== 'boss' && Math.random() < CONDITION_CHANCE) this.applyCondition(Phaser.Utils.Array.GetRandom(CONDITIONS));
    if (this.usaVel) {
      // el Arcanista convierte sus bonos de aceleración en rapidez inicial
      // (la mitad de los bonos, para que no se dispare K = ½mv²)
      this.vel = Math.min(this.vmax, (this.isPen ? 0 : 4) + Math.floor(this.baseAcel / 2) + (this.cond?.id === 'viento' ? 1 : 0));
      this.baseAcel = 0;
    }
    // Coriolis · El ½ de ½mv²
    const cm = boonLevel('co_medio');
    if (cm) {
      if (this.usaVel) this.vel = Math.min(this.vmax, this.vel + cm);
      else this.masa += cm;
    }
    this.abismoModoInicio();
    this.showFamiliar();
    this.showAliado();
    this.showFantasma();
    this.refreshPlayer();
    const jefeA = this.acto === 5 && this.kind === 'boss' ? JEFES_ABISMO[run.jefe ?? 'geometra'] : null;
    const arrancar = () => this.banner(this.kind === 'boss' ? (jefeA ? jefeA.nombre : T.combate.bannerJefes[Math.min(3, this.acto - 1)]) : this.astro ? ASTROS[this.astro]?.nombre ?? T.combate.bannerElite : this.kind === 'elite' ? T.combate.bannerElite : T.combate.bannerCombate).then(async () => {
      await this.newtonApple();
      if (!(await this.combatStartFx())) return;
      if (!(await this.checkEnd())) this.startTurn();
    });
    // El Abismo: antes de cada jefe, un resumen de quién es y cuál es su desventaja
    if (jefeA) this.resumenJefe(run.jefe ?? 'geometra', arrancar);
    else arrancar();
  }

  /** Pantalla de presentación de un jefe del Abismo: retrato, tema físico, desventaja y origen */
  private resumenJefe(id: string, seguir: () => void) {
    const info = JEFES_ABISMO[id];
    const run = Game.run!;
    this.busy = true;
    const capa = this.add.container(0, 0).setDepth(960);
    capa.add(this.add.rectangle(0, 0, W, H, 0x020606, 0.93).setOrigin(0).setInteractive());
    const g = this.add.graphics();
    frame(g, 70, 40, W - 140, H - 80, 0x080d0c, info.primigenio ? 0x9a6ad0 : 0x2c5a4e, 0.98);
    capa.add(g);
    const tramo = run.tramo ?? 1;
    capa.add(txt(this, 96, 56, tramo > TRAMOS ? `Abismo sin fondo · profundidad ${tramo}` : `Tramo ${tramo} de ${TRAMOS} · ${nombreTramo(tramo)}`, 17, '#5a8a7a'));
    capa.add(txt(this, W / 2 + 70, 92, info.titulo, 20, info.primigenio ? '#c8a8ff' : '#9ad8c8').setOrigin(0.5));
    capa.add(title(this, W / 2 + 70, 132, info.nombre, info.nombre.length > 22 ? 34 : 42, info.primigenio ? '#d8b8ff' : '#9ad8c8'));
    const img = this.add.image(230, 330, ENEMIES[id].sprite).setOrigin(0.5, 1).setScale(Math.min(4.6, 190 / this.textures.get(ENEMIES[id].sprite).getSourceImage().height));
    if (ENEMIES[id].oculto) { img.setAlpha(0.4); this.tweens.add({ targets: img, alpha: 0.12, duration: 900, yoyo: true, repeat: -1 }); }
    this.tweens.add({ targets: img, y: 322, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    capa.add(img);
    capa.add(txt(this, 230, 346, info.origen, 15, CSS.dim, { align: 'center', wordWrap: { width: 260 } }).setOrigin(0.5, 0));
    const x0 = 420;
    capa.add(txt(this, x0, 176, 'Tema de física', 17, CSS.dim));
    capa.add(txt(this, x0, 198, info.tema, 22, CSS.gold, { wordWrap: { width: 440 } }));
    capa.add(txt(this, x0, 236, 'Desventaja', 17, CSS.dim));
    capa.add(txt(this, x0, 256, info.desventaja, 19, '#ff9a7a', { wordWrap: { width: 440 }, lineSpacing: 2 }));
    const cj = CONDICION_JEFE(this.condJefe);
    if (cj) {
      capa.add(txt(this, x0, 326, `Condición de hoy (al azar): ${cj.nombre}`, 17, '#ff9aa8'));
      capa.add(txt(this, x0, 348, cj.texto(!!info.primigenio), 17, CSS.bone, { wordWrap: { width: 440 } }));
    }
    const esc = escalaTramo(tramo);
    if (esc > 1) capa.add(txt(this, x0, 396, `Fuerza del tramo: ×${esc.toFixed(2)} de vida y ×${escalaDano(tramo).toFixed(2)} de daño`, 17, '#e08a8a'));
    capa.add(button(this, W / 2 + 70, 450, 240, 44, 'Enfrentarlo', () => {
      capa.destroy();
      this.busy = false;
      seguir();
    }, { color: UI.gold, size: 22 }));
    audio.sfx('stop');
  }

  // ───────────────────────── ENEMIGOS ─────────────────────────
  /** Ajusta el daño de una intención según el nivel de gravedad */
  private scaleIntent(i: Intent, st?: EnemyState): Intent {
    const m = this.grav.dmgMul * (st ? danoDe(st.def) : 1) * (this.acto === 5 ? escalaDano(Game.run!.tramo ?? 1) * (Game.run!.mutador === 'gravedad' ? 1.2 : 1) : 1);
    if (m === 1) return i;
    if (i.kind === 'attack') return { ...i, dmg: Math.round(i.dmg * m) };
    if (i.kind === 'block' && i.dmg) return { ...i, dmg: Math.round(i.dmg * m) };
    if (i.kind === 'buff' && i.dmg) return { ...i, dmg: Math.round(i.dmg * m) };
    return i;
  }

  private addEnemy(st: EnemyState, x: number) {
    unlock('enemies', st.def.id);
    if (this.grav.hpMul !== 1) {
      st.maxHp = st.hp = Math.round(st.hp * this.grav.hpMul);
    }
    // El Abismo: cada tramo es más fuerte (y en el infinito, mucho más)
    if (this.acto === 5) {
      const base = this.kind === 'boss' && JEFES_ABISMO[st.def.id] ? VIDA_ABISMO.jefe : this.kind === 'elite' ? VIDA_ABISMO.elite : VIDA_ABISMO.normal;
      // la última hoja del diario de Montemayor anota el punto débil del Primigenio: −15 % de vida
      const debil = JEFES_ABISMO[st.def.id]?.primigenio && (Game.run!.diario ?? 0) >= HOJAS_DEBILIDAD ? 0.85 : 1;
      const mut = Game.run!.mutador === 'masa' ? 1.25 : Game.run!.mutador === 'tormenta' ? 1.15 : 1;
      st.maxHp = st.hp = Math.round(st.hp * base * debil * mut * escalaTramo(Game.run!.tramo ?? 1));
      if (debil < 1) this.time.delayedCall(900, () => this.calc(`Diario de Montemayor: conoces el punto débil de ${st.def.name} (−15 % de vida)`));
    }
    st.intent = this.scaleIntent(st.intent, st);
    const root = this.add.container(x, 0);
    const sprite = this.add.image(0, 330, st.def.sprite).setOrigin(0.5, 1).setScale(st.def.scale);
    const shadow = this.add.ellipse(0, 330, sprite.displayWidth * 0.9, 16, 0x000000, 0.5);
    root.add([shadow, sprite]);
    if (st.def.id === 'pendulo') {
      sprite.setOrigin(0.5, 0).setY(118);
      sprite.setAngle(-14);
      this.tweens.add({ targets: sprite, angle: 14, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    } else if (st.def.id === 'bat') {
      sprite.y = 260;
      this.tweens.add({ targets: sprite, y: 248, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    } else if (st.def.oculto) {
      sprite.setAlpha(0.35);
      this.tweens.add({ targets: sprite, alpha: 0.1, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    } else {
      this.tweens.add({ targets: sprite, scaleY: st.def.scale * 1.04, duration: 800 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    const hp = bar(this, x - 60, 344, 120, 14, 0x6a2a3a);
    const blockT = txt(this, x - 82, 351, '', 22, CSS.block).setOrigin(0.5);
    const top = 330 - sprite.displayHeight - (st.def.id === 'bat' ? 80 : 12);
    const intentC = st.def.id === 'pendulo' ? this.add.container(x + 62, 170) : (st.def.id === 'hibbelerius' || st.def.id === 'am' ? this.add.container(x - 120, 150) : this.add.container(x, Math.max(130, top)));
    if (st.def.id === 'hibbelerius') this.hibAura(sprite, x);
    if (st.def.id === 'am') {
      this.amAura(sprite, x);
      if ((Game.codex.am?.pactos ?? 0) > 0) {
        st.maxHp += 40; st.hp += 40;
        this.time.delayedCall(1800, () => this.calc('AM: «Me diste tus respuestas a cambio de poder. Ahora son mías.» (+40 de vida por tus pactos)'));
      }
    }
    const statusC = this.add.container(x + 66, 351);
    const nameT = txt(this, x, 370, st.def.name, 19, CSS.dim).setOrigin(0.5);
    if (nameT.width > 180) nameT.setScale(180 / nameT.width, 1);
    const ev: EnemyView = { st, root, sprite, hp, blockT, intentC, statusC, baseX: x, dead: false, nameT };
    this.enemies.push(ev);

    sprite.setInteractive({ useHandCursor: true, pixelPerfect: false });
    sprite.on('pointerover', (p: Phaser.Input.Pointer) => {
      if (this.selected) sprite.setTint(0xffaaaa);
      const d = st.def;
      let body = `Masa: ${masaTexto(d.mass)} kg · Peso en ${this.grav.name}: ${masaTexto(Math.round(d.mass * this.grav.g))} N\n${d.desc}`;
      if (d.umbral) body += `\n\nUmbral para detenerlo: F ≥ ${umbralDe(st)} N en un solo golpe (1ª ley).${(st.umbralMul ?? 1) > 1 ? ' Se adapta: cada vez que lo detienes, sube ×1.5.' : ''}`;
      this.tip.show(p.worldX + 16, p.worldY - 120, d.name, body);
    });
    sprite.on('pointerout', () => {
      sprite.clearTint();
      this.tip.hide();
    });
    sprite.on('pointerdown', () => {
      if (this.selected && !ev.dead) this.playOn(this.selected, ev);
    });
    this.refreshEnemy(ev);
  }

  private intentText(i: Intent) {
    const r = this.intentText0(i);
    if ('label' in i && i.label) r.d = `«${i.label}»\n${r.d}`;
    return r;
  }

  private intentText0(i: Intent) {
    if (i.kind === 'stunned') return { ic: 'i_stun', t: 'Detenido', d: 'Está detenido: no actuará este turno y recibe ×1.5 de daño.' };
    let r: { ic: string; t: string; d: string };
    if (i.kind === 'block')
      r = { ic: 'i_shield', t: `${i.block}${i.dmg ? ` +${i.dmg}` : ''}`, d: `Ganará ${i.block} de Bloqueo${i.dmg ? ` y atacará con ${i.dmg} N` : ''}.` };
    else if (i.kind === 'buff') r = { ic: i.summon ? 'i_skull' : 'i_rune', t: '', d: i.summon ? '' : 'Prepara un efecto.' };
    else {
      const t = i.hits && i.hits > 1 ? `${i.dmg}×${i.hits}` : `${i.dmg}`;
      r = { ic: 'i_combat', t, d: `Atacará con una fuerza de ${i.dmg} N${i.hits && i.hits > 1 ? `, ${i.hits} veces` : ''}.` };
    }
    if (i.friccion) r.d += `\nTe cubrirá de lodo: +${i.friccion} Fricción (${this.usaVel ? `pierdes ${i.friccion} m/s de rapidez cada turno` : `−${i.friccion} m/s² a tus ataques`}).`;
    if (i.calor) r.d += `\nTe transferirá ${i.calor} de Calor (pierdes vida cada turno).`;
    if (i.summon) r.d += `\nInvocará: ${ENEMIES[i.summon]?.name ?? i.summon} (si hay lugar).`;
    if (i.shieldAll) r.d += `\nDará ${i.shieldAll} de Bloqueo a todos sus aliados.`;
    if (i.heal) r.d += `\nSe curará ${i.heal} de vida.`;
    if (i.drain) r.d += `\nTe robará ${i.drain} J para tu siguiente turno.`;
    if (i.confusion) r.d += '\nTe CONFUNDIRÁ: cada carta que robes costará 0–3 J al azar.';
    if (i.aturde) r.d += '\nGOLPE ATURDIDOR: si te hace daño (no lo bloqueas completo), PIERDES tu siguiente turno.';
    if (i.hemorragia) r.d += `\nHEMORRAGIA ${i.hemorragia}: durante ${i.hemorragia} turno(s), cada carta que juegues te quitará 1 de vida.`;
    if (i.vertigo) r.d += `\nVÉRTIGO: en tu siguiente turno robarás ${i.vertigo} carta(s) menos.`;
    if (i.perfora) r.d += '\nPERFORA: sale de un ángulo y su golpe atraviesa tu Bloqueo.';
    if (i.inunda) r.d += '\nEL LAGO SUBE: antes del golpe pierdes TODO tu Bloqueo.';
    if (i.radianes) r.d += '\nMODE → RAD: tu calculadora pasa a radianes. Tus Ataques harán ×0.6 hasta que juegues una Habilidad (revisas el modo).';
    if (i.add) r.d += `\nMeterá ${i.add.n} «${CARDS[i.add.id].name}» a tu ${i.add.to === 'draw' ? 'mazo de robo' : 'descarte'}.`;
    return r;
  }

  private refreshEnemy(ev: EnemyView) {
    const st = ev.st;
    ev.hp.set(st.hp, st.maxHp, st.block);
    ev.blockT.setText(st.block > 0 ? `🛡${st.block}` : '');
    ev.intentC.removeAll(true);
    const noche = this.acto === 5 && Game.run?.mutador === 'noche' && this.turn <= 1;
    if (!ev.dead && !this.intencionVisible(ev)) {
      // invisible: no se ve qué hará, sólo sus huellas
      const ic = icon(this, -14, 0, 'i_fog', 3.2);
      ev.intentC.add([ic, txt(this, 2, -12, '???', 26, '#9a93a8')]);
      this.tip.attach(ic, 'Intención', 'Es invisible: no puedes saber qué hará. Guarda Bloqueo por si acaso.');
    } else if (!ev.dead) {
      const it = this.intentText(st.intent);
      const ic = icon(this, -14, 0, it.ic, 3.2);
      const tt = txt(this, 2, -12, it.t, 26, st.intent.kind === 'attack' ? '#e0a070' : CSS.bone);
      ev.intentC.add([ic, tt]);
      let ex = tt.x + tt.width + 16;
      const ii = st.intent;
      if (ii.kind !== 'stunned') {
        if (ii.friccion) { ev.intentC.add(icon(this, ex, 0, 'i_mud', 3)); ex += 30; }
        if (ii.calor) { ev.intentC.add(icon(this, ex, 0, 'i_fire', 3)); ex += 30; }
        if (ii.add) { ev.intentC.add(icon(this, ex, 0, 'i_fog', 3)); ex += 30; }
        if (ii.summon) { ev.intentC.add(icon(this, ex, 0, 'i_skull', 3)); ex += 30; }
        if (ii.shieldAll) { ev.intentC.add(icon(this, ex, 0, 'i_shield', 3)); ex += 30; }
        if (ii.heal) { ev.intentC.add(icon(this, ex, 0, 'i_heart', 3)); ex += 30; }
        if (ii.drain) { ev.intentC.add(icon(this, ex, 0, 'i_bolt', 3)); ex += 30; }
        if (ii.confusion) { ev.intentC.add(icon(this, ex, 0, 'i_ojo', 3).setTint(0xffa040)); ex += 30; }
        if (ii.aturde) { ev.intentC.add(icon(this, ex, 0, 'i_stun', 3).setTint(0xffd040)); ex += 30; }
        if (ii.hemorragia) { ev.intentC.add(icon(this, ex, 0, 'i_heart', 3).setTint(0xb02020)); ex += 30; }
        if (ii.vertigo) { ev.intentC.add(icon(this, ex, 0, 'i_momentum', 3).setTint(0x9ad8f0)); ex += 30; }
        if (ii.perfora) { ev.intentC.add(icon(this, ex, 0, 'i_combat', 3).setTint(0x9a6ad0)); ex += 30; }
        if (ii.inunda) { ev.intentC.add(icon(this, ex, 0, 'i_shield', 3).setTint(0x3a8ac8)); ex += 30; }
        if (ii.radianes) { ev.intentC.add(txt(this, ex - 10, -12, 'RAD', 20, '#ff6a7a')); ex += 44; }
      }
      this.tip.attach(ic, 'Intención', it.d);
      this.tweens.add({ targets: ev.intentC, y: ev.intentC.y - 4, duration: 600, yoyo: true, repeat: 1 });
    }
    ev.statusC.removeAll(true);
    let sx = 0;
    if (st.inercia > 0 || st.def.umbral) {
      const ic = icon(this, sx + 8, 0, 'i_momentum', 2.4);
      const t = txt(this, sx + 20, -11, `${st.inercia}`, 20, '#e0a070');
      this.tip.attach(ic, `Inercia ×${st.inercia}`,
        (st.imparableT ?? 0) > 0 ? `¡IMPARABLE por ${st.imparableT} turno(s)! Ahorita ninguna fuerza lo detiene; después vuelve a poder detenerse.` : st.def.imparable ? `1ª ley: detenlo con F ≥ ${umbralDe(st)} N. Pero cuidado: después queda IMPARABLE ${st.def.imparable} turno(s).` : `1ª ley: mientras nadie lo detenga, sigue avanzando y su golpe crece cada turno.\nDetenlo con un golpe de F ≥ ${umbralDe(st)} N.`);
      ev.statusC.add([ic, t]);
      sx += 44;
    }
    if ((st.imparableT ?? 0) > 0) {
      const t = txt(this, sx + 4, -11, `IMPARABLE ${st.imparableT}`, 15, '#ff7a5a').setStroke('#000', 3);
      ev.statusC.add(t);
      sx += t.width + 10;
    }
    if (st.detenido) {
      const ic = icon(this, sx + 8, 0, 'i_stun', 2.4);
      this.tip.attach(ic, 'Detenido', 'Una fuerza neta suficiente lo detuvo. Pierde su turno y recibe ×1.5 de daño.');
      ev.statusC.add(ic);
      sx += 30;
    }
    const st2: [number, string, string, string][] = [
      [st.calor, 'i_fire', 'Calor', `Pierde ${st.calor} de vida al inicio de su turno; luego baja 1.`],
      [st.resonancia, 'i_wind', 'Resonancia', 'Con 3 cargas entra en resonancia y recibe 12 de daño.'],
      [st.fatiga, 'i_anvil', 'Fatiga del material', `Recibe +50 % de daño. Quedan ${st.fatiga} turno(s).`],
      [st.carga, 'i_pend', st.def.id === 'muelle' ? 'Energía elástica' : 'Impulso acumulado',
        st.def.id === 'muelle' ? `Lleva ${st.carga} compresión(es): liberará ½kx² de golpe.` : `Lleva ${st.carga} carga(s) de impulso (I = F·Δt). Detenlo para que las pierda.`],
      [st.impulsoLeft ? st.impulso : 0, 'i_gaunt', 'Impulso Sostenido', `Recibe ${st.impulso} de daño en cada uno de sus próximos ${st.impulsoLeft} turno(s).`],
    ];
    for (const [n, ic0, h, b] of st2) {
      if (!n) continue;
      const ic = icon(this, sx + 8, 0, ic0, 2.4);
      const t = txt(this, sx + 20, -11, `${n}`, 20, '#e0a070');
      this.tip.attach(ic, h, b);
      ev.statusC.add([ic, t]);
      sx += 40;
    }
  }

  /** Un lugar libre en el campo para un enemigo nuevo (invocado o fragmento) */
  private freeX(prefer: number): number | null {
    const xs = this.alive().map((e) => e.baseX);
    for (const x of [prefer, 510, 700, 890, 605, 795, 415, 860]) {
      if (x >= 400 && x <= 900 && xs.every((o) => Math.abs(o - x) > 128)) return x;
    }
    return null;
  }

  private alive() {
    return this.enemies.filter((e) => !e.dead);
  }

  // ───────────────────────── JUGADOR ─────────────────────────
  private refreshPlayer() {
    if (this.acto === 5) this.pintarEstados();
    const run = Game.run!;
    this.hpBar.set(run.hp, run.maxHp, this.block);
    this.hud.setHp(run.hp, run.maxHp);
    this.pBlockT.setText(this.block > 0 ? `🛡${this.block}` : '');
    this.energyT.setText(`${this.energy}/${this.maxEnergy}`);
    this.drawT.setText(`${T.combate.robo}: ${this.draw.length}`);
    this.discT.setText(`${T.combate.descarte}: ${this.discard.length}`);
    this.pStatus.removeAll(true);
    const items: [string, string, string, string][] = [];
    const baseA = this.baseAcel;
    if (this.acel !== 0) items.push(['i_wind', `+${this.acel}`, 'Aceleración extra', `+${this.acel} m/s² a tus ataques este turno.${baseA ? ` (Incluye +${baseA} de reliquias o bendiciones.)` : ''}`]);
    if (this.masa) items.push(['i_mass', `${this.masa > 0 ? '+' : ''}${this.masa}`, 'Masa extra', `${this.masa > 0 ? '+' : ''}${this.masa} kg a todos tus ataques en este combate.`]);
    if (this.friccion) items.push(['i_mud', `${this.friccion}`, 'Fricción', `El lodo resta ${this.friccion} m/s² a la aceleración de tus ataques. Baja 1 por turno.`]);
    if (this.reflect) items.push(['i_reflect', '', 'Acción-Reacción', 'Este turno, cada golpe que recibas regresa con la misma fuerza al atacante (3ª ley).']);
    if (this.keepBlock) items.push(['i_crystal', '', 'Inercia Defensiva', 'Tu Bloqueo no se perderá al iniciar tu siguiente turno (1ª ley).']);
    if (this.isPen) {
      items.unshift(['i_momentum', `${this.vel}`, `Rapidez v = ${this.vel} m/s`, `Tus golpes hacen p = m·v. Si v ≥ ${ESQUIVA} m/s ESQUIVAS el siguiente golpe (y pierdes 3 m/s). El aire te frena 2 m/s cada turno.`]);
      items.push(['i_fire', `${this.ve}`, `vₑ = ${this.ve} m/s`, `Velocidad de escape de tus gases. Al quemar masa: Δv = vₑ·ln(m₀/m₁). Mientras MENOS masa tengas, más rápido aceleras.`]);
      if (this.critica) items.push(['i_mass', '×1.5', 'Masa Crítica', 'Con menos de la mitad de tu masa máxima, tus ataques hacen ×1.5.']);
    }
    if (this.isArc) items.unshift(['i_momentum', `${this.vel}`, `Rapidez v = ${this.vel} m/s`, `Tus hechizos hacen K = ½·m·v². Primera ley: tu rapidez se conserva entre turnos salvo que la fricción te frene.`]);
    if (this.confusa) items.push(['i_ojo', '?', 'Confundido', 'Cada carta que robes en este combate cuesta 0–3 J al azar (gema naranja con «?»).']);
    if (this.hemorragia) items.push(['i_heart', `${this.hemorragia}`, 'Hemorragia', `Cada carta que juegues te quita 1 de vida. Quedan ${this.hemorragia} turno(s).`]);
    if (this.aturdido) items.push(['i_stun', '!', 'Aturdido', 'Pierdes tu siguiente turno.']);
    if (this.mordidos.length) {
      // v0.52 · qué dientes mordió el jefe (también se marcan en la dentadura)
      const dd = Game.run!.dientes ?? [];
      items.push(['i_diente', `×${this.mordidos.length}`, 'Dentadura mordida', `El jefe mordió:\n${this.mordidos.map((i) => `· ${dd[i] ? defDiente(dd[i]!).nombre : '—'} (hueco ${i + 1})`).join('\n')}\nNo funcionan en esta pelea. Abre la dentadura para verlos marcados.`]);
    }
    if (this.vertigo) items.push(['i_momentum', `-${this.vertigo}`, 'Vértigo', `Robarás ${this.vertigo} carta(s) menos en tu siguiente turno.`]);
    if (this.pCalor) items.push(['i_fire', `${this.pCalor}`, 'Calor', `Pierdes ${this.pCalor} de vida al inicio de tu turno; luego baja 1.`]);
    if (this.jPerTurn) items.push(['i_pend', `+${this.jPerTurn}`, 'Batería de Resorte', `+${this.jPerTurn} J al inicio de cada turno.`]);
    if (this.velPerTurn) items.push(['i_gaunt', `+${this.velPerTurn}`, 'Impulso Constante', `+${this.velPerTurn} m/s al inicio de cada turno.`]);
    items.forEach(([ic, t, h, b], i) => {
      const im = icon(this, i * 46 + 8, 0, ic, 2.4);
      const tt = txt(this, i * 46 + 20, -11, t, 20, CSS.bone);
      this.tip.attach(im, h, b);
      this.pStatus.add([im, tt]);
    });
    this.hand.forEach((c) => c.refresh(this.ctx(), !CARDS[c.inst.id].unplayable && !(this.condJefe === 'sinHabilidades' && CARDS[c.inst.id].type === 'Habilidad') && this.cost(c) <= this.energy));
  }

  private cost(c: CardView) {
    return costOverride.get(c.inst.uid) ?? statsOf(c.inst).cost;
  }

  private drawCards(n: number) {
    for (let i = 0; i < n; i++) {
      if (!this.draw.length) {
        if (!this.discard.length) break;
        this.draw = Phaser.Utils.Array.Shuffle(this.discard);
        this.discard = [];
      }
      if (this.hand.length >= 10) break;
      const inst = this.draw.pop()!;
      if (this.confusa && CARDS[inst.id].rarity !== 'estado') { costOverride.set(inst.uid, Phaser.Math.Between(0, 3)); costConfusion.add(inst.uid); } else { costOverride.delete(inst.uid); costConfusion.delete(inst.uid); }
      if (this.jefeVivo('hastur') && CARDS[inst.id].type === 'Ataque') costOverride.set(inst.uid, (costOverride.get(inst.uid) ?? statsOf(inst).cost) + 1); // Hastur: Ataques +1 J
      if (inst.id === 'errorSigno') {
        this.energy = Math.max(0, this.energy - 1);
        this.calc('Error de Signo: tu análisis se arruina → −1 J');
        this.hint('Error de Signo: −1 J');
      }
      const v = cardView(this, 62, 510, inst, this.ctx()).setScale(0.2).setDepth(200);
      this.setupCard(v);
      this.hand.push(v);
      // v0.57 · cartas que hablan al robarlas
      const dv = CARDS[inst.id];
      if (inst.id === 'patoHule' && this.alive().length) {
        // el Pato sólo te dice lo que se puede ver (no revela a los invisibles ni la Noche sin Estrellas)
        const vis = this.alive().filter((e) => this.intencionVisible(e));
        const peor = vis.map((e) => { const it = e.st.intent; return { e, d: it.kind === 'attack' ? it.dmg * (it.hits ?? 1) : it.kind === 'block' || it.kind === 'buff' ? it.dmg ?? 0 : 0 }; }).sort((a, b) => b.d - a.d)[0];
        const pista = !vis.length ? 'No veo qué van a hacer… guarda Bloqueo por si acaso.' : peor.d ? `${peor.e.st.def.name} te va a pegar ${peor.d}. ¿Y si bloqueas?` : 'Nadie te va a pegar este turno: ¡ataca con todo!';
        this.time.delayedCall(900, () => v.active && this.hablar('Pato', `Cuac. ${pista}`, v.x, HAND_Y - 150));
      } else if (dv.voz?.robar && Math.random() < 0.7) this.time.delayedCall(900, () => v.active && this.hablar(dv.name.replace(/^(El|La) /, ''), Phaser.Utils.Array.GetRandom(dv.voz!.robar!), v.x, HAND_Y - 150));
    }
    this.layoutHand();
    this.refreshPlayer();
  }

  private setupCard(v: CardView) {
    v.setInteractive({ useHandCursor: true });
    v.on('pointerover', () => {
      if (this.busy || this.selected) return;
      v.setDepth(300);
      audio.sfx('hover');
      this.tweens.add({ targets: v, y: HAND_Y - 96, scale: 1.12, angle: 0, duration: 120 });
      const def = CARDS[v.inst.id];
      const ed = v.inst.ed ? EDICIONES[v.inst.ed] : null;
      // v0.50 · abajo del texto: el cálculo real si la juegas ahora
      let calc = '';
      try { calc = this.previa(v); } catch (err) { console.warn('previa', err); }
      this.tip.show(v.x + 100, HAND_Y - 300, ed ? `${def.concept} · ${ed.nombre}` : def.concept, ed ? `${ed.texto}\n\n${def.lore}` : def.lore, calc, [v.x - 100, v.x + 100]);
    });
    v.on('pointerout', () => {
      this.tip.hide();
      if (this.selected === v) return;
      this.layoutHand();
    });
    v.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) return;
      this.clickCard(v);
    });
  }

  private layoutHand() {
    const n = this.hand.length;
    const spacing = Math.min(124, 640 / Math.max(n, 1));
    this.hand.forEach((c, i) => {
      if (c === this.selected) return;
      const off = i - (n - 1) / 2;
      c.setDepth(200 + i);
      this.tweens.add({ targets: c, x: W / 2 + off * spacing, y: HAND_Y + Math.abs(off) * 5, angle: off * 2.5, scale: CARD_SCALE, duration: 160 });
    });
  }

  private hint(s: string) {
    this.hintT.setText(s);
    this.hintT.setAlpha(1);
    this.tweens.killTweensOf(this.hintT);
    this.tweens.add({ targets: this.hintT, alpha: 0, delay: 1600, duration: 400 });
  }

  // ───────────────────────── VISTA PREVIA (v0.50) ─────────────────────────
  // Al pasar el mouse por una carta se calcula lo que haría SI LA JUEGAS AHORA,
  // con dientes, cosmos, ediciones, dones, pactos, estados y el Bloqueo de cada enemigo.
  // No cambia nada del combate: sólo lee el estado.

  /** Daño base de un Ataque (lo que dice la carta) con el contexto actual */
  private baseAtaque(v: CardView, st: CardStats, c: CalcCtx) {
    const def = CARDS[v.inst.id];
    type Base = { dmg: number; lim?: number; brazo?: boolean; golpes?: number; todos?: boolean; ignora?: boolean; res?: boolean; azar?: boolean; ultimo?: boolean; centroide?: boolean; rompe?: boolean; nota?: string; sinDano?: string };
    const F = () => force(st, c).F;
    const K = () => kinetic(st, c).K;
    const crit = (d: number) => (this.critica && Game.run!.hp < Game.run!.maxHp / 2 ? Math.round(d * 1.5) : d);
    const P = (cc: CalcCtx = c) => crit(pmv(st, cc).p);
    const b = (x: Base) => x;
    switch (def.id) {
      case 'golpe': case 'fuerzaNeta': case 'martillo': return b({ dmg: F() });
      case 'embestida': return b({ dmg: F(), nota: `Retroceso: recibes ${Math.floor(F() / 4)} (¼ de F).` });
      case 'pendulo': return b({ dmg: F(), nota: 'Regresa al inicio de tu siguiente turno y golpea igual.' });
      case 'tajo': return b({ dmg: F(), nota: `Con θ = 60°: ${Math.round(F() * 0.5)} a TODOS (más bonos).` });
      case 'centroideGolpe': return b({ dmg: F(), centroide: true });
      case 'geometriaImposible': return b({ dmg: F(), todos: true, nota: 'Después quedas Confundido.' });
      case 'calamarTorque': return b({ dmg: F(), golpes: 3 });
      case 'patinadora': return b({ dmg: F(), golpes: Math.min(6, this.played + 1) });
      case 'torbellinoAcero': return this.energy ? b({ dmg: F(), golpes: this.energy, todos: true, nota: `Gasta tus ${this.energy} J.` }) : b({ dmg: 0, sinDano: 'Sin J no hay giros: no hace nada.' });
      case 'newtonV': return b({ dmg: Math.round(F() * 1.5), ultimo: true });
      case 'enLibras': return b({ dmg: Math.round(F() * 2.2) });
      case 'rodadura': return b({ dmg: this.block > 0 ? Math.round(F() * 1.5) : F(), nota: this.block > 0 ? 'Tienes Bloqueo: agarre ×1.5 (ya incluido).' : 'Sin Bloqueo no hay agarre (con Bloqueo: ×1.5).' });
      case 'torqueAbisal': return b({ dmg: F(), brazo: true, nota: 'τ = r × F: ×1 al 1º, ×1.5 al 2º, ×2 al 3º de la fila.' });
      case 'energiaRotacional': { const w = Math.min(6, this.played + 1); return b({ dmg: Math.round(2 * w * w), nota: `ω = ${w}: juega más cartas antes para que pegue más.` }); }
      case 'centroPercusion': return b({ dmg: F(), nota: 'Si lo detienes, robas 2.' });
      case 'anguloRecto': return b({ dmg: F(), ignora: true });
      case 'tareaOlvidada': { const n = Math.min(6, this.tareaT.get(v.inst.uid) ?? 0); return b({ dmg: (st.block ?? 6) + (st.extra ?? 5) * n, nota: `Lleva ${n} turno(s) en tu mano. Si la guardas, sube +${st.extra} por turno (máx. 6).` }); }
      case 'fmaCuadrado': return b({ dmg: Math.round((F() * F()) / 5) });
      case 'pesoMuerto': return b({ dmg: Math.round(((st.m ?? 0) + this.masa) * this.grav.g), ignora: true });
      case 'despertar': {
        const loc = Math.max(0, 100 - (c.cordura ?? 70));
        return b({ dmg: Math.round(((st.m ?? 10) + this.masa) * Math.max(1, Math.round(loc / 10))) });
      }
      case 'proyectil': case 'choque': case 'chispa': case 'cometa': return b({ dmg: K() });
      case 'torbellino': return b({ dmg: K(), golpes: 3 });
      case 'rafaga': case 'singularidad': return b({ dmg: K(), todos: true });
      case 'doppler': return b({ dmg: K(), todos: this.vel >= 6 });
      case 'honda': { const vv = this.hondaV.get(v.inst.uid) ?? (st.extra ?? 4); return b({ dmg: Math.round(0.5 * (st.m ?? 2) * vv * vv) }); }
      case 'embestidaArd': return b({ dmg: crit(pmv(st, c).p + (st.extra ?? 2)) });
      case 'absorcion': case 'reentrada': return b({ dmg: P() });
      case 'ignicion': {
        const dv = rocket(st.extra ?? 6, c).dv;
        return b({ dmg: P({ ...c, vel: Math.min(this.vmax, Math.round(((c.vel ?? 0) + dv) * 10) / 10) }), nota: `Antes quemas ${st.extra} kg (+${dv} m/s).` });
      }
      case 'estelaPlasma': return b({ dmg: P(), todos: true });
      case 'rebote': return b({ dmg: this.block });
      case 'frecuencia': return b({ dmg: st.block ?? 3, nota: `+${st.extra} de Resonancia.` });
      case 'impulsoSost': return b({ dmg: st.block ?? 4, nota: `Luego ${st.block} más en cada uno de sus 2 turnos.` });
      case 'choquePlastico': return b({ dmg: st.block ?? 9 });
      case 'retroceso': return b({ dmg: st.block ?? 8, nota: `Y tú ganas ${st.extra} de Bloqueo.` });
      case 'impulsoAng': return b({ dmg: (st.block ?? 4) + 2 * this.played, todos: true });
      case 'integral': return Math.min(st.extra!, this.danoTurno) > 0 ? b({ dmg: Math.min(st.extra!, this.danoTurno) }) : b({ dmg: 0, sinDano: 'Aún no haces daño este turno: el área bajo la curva es 0.' });
      case 'limite': return b({ dmg: limiteDano(st.extra!), lim: st.extra });
      case 'perdigones': return b({ dmg: st.extra ?? 3, golpes: 3, azar: true });
      case 'descarga': return this.energy ? b({ dmg: (st.extra ?? 5) * this.energy, todos: true, nota: `Gasta tus ${this.energy} J.` }) : b({ dmg: 0, sinDano: 'Sin J: 0 de daño.' });
      case 'fractura': return b({ dmg: st.extra ?? 7, rompe: true });
      case 'golpeGracia': return b({ dmg: st.extra ?? 9 });
      case 'tiroParabolico': return b({ dmg: st.extra ?? 16, res: true, ignora: true, nota: 'Sólo donde caiga el proyectil (eliges θ).' });
      case 'dolorResonante': return b({ dmg: 0, sinDano: `Cada enemigo recibe ${st.extra} por carga de Resonancia (ignora el Bloqueo).` });
      case 'friccionArd': return b({ dmg: 0, sinDano: `No hace daño directo: +${st.extra} de Calor.` });
      case 'ondaCalor': case 'llamarada': return b({ dmg: 0, sinDano: `No hace daño directo: Calor a todos.` });
      case 'fatigaMat': return b({ dmg: 0, sinDano: 'No hace daño directo: recibe +50 % de daño unos turnos.' });
      case 'trinity': return b({ dmg: 0, sinDano: 'Derrota a todos (los jefes resisten).' });
      default:
        if (st.m && st.a) return b({ dmg: F(), todos: def.target === 'all' });
        return null;
    }
  }

  /** Texto de la vista previa de una carta (vacío si no hay nada que calcular) */
  private previa(v: CardView): string {
    const inst = v.inst;
    const def = CARDS[inst.id];
    if (def.unplayable || def.rarity === 'estado') return '';
    if (this.condJefe === 'sinHabilidades' && def.type === 'Habilidad') return 'MENTE EN BLANCO: no puedes jugar Habilidades en esta pelea.';
    const st = statsOf(inst);
    const L: string[] = [];
    const costo = this.cost(v);
    if (costo > this.energy) L.push(`(Te faltan ${costo - this.energy} J para jugarla.)`);
    const ed = this.condJefe === 'sinEdiciones' ? undefined : inst.ed;
    if (def.type === 'Ataque') L.push(...this.previaAtaque(v, st, ed));
    else L.push(...this.previaOtra(def, st, ed, costo));
    if (this.hemorragia) L.push('Hemorragia: jugarla te quita 1 de vida.');
    return L.join('\n');
  }

  private previaAtaque(v: CardView, st: CardStats, ed: string | undefined): string[] {
    const def = CARDS[v.inst.id];
    let suma = 0;
    let mult = 1;
    const sumas: string[] = [];
    const mults: string[] = [];
    const add = (n: number, t: string) => { if (n) { suma += n; sumas.push(`${t} +${n}`); } };
    const por = (k: number, t: string) => { mult *= k; mults.push(`${t} ×${k}`); };
    // Plano Inclinado cambia la aceleración o la rapidez ANTES de calcular la base
    const c: CalcCtx = { ...this.ctx() };
    const pl = boonLevel('g_plano');
    let notaPlano = '';
    if (!this.firstAttack && pl) {
      if (this.usaVel) { const d = Math.max(0, Math.min(pl, VMAX - this.vel)); if (d) { c.vel = (c.vel ?? 0) + d; notaPlano = ` (Plano Inclinado: +${d} m/s)`; } }
      else { c.acelBonus += 2 * pl; notaPlano = ` (Plano Inclinado: +${2 * pl} m/s²)`; }
    }
    const base = this.baseAtaque(v, st, c);
    if (base?.sinDano) return [base.sinDano];
    // bonos que se suman a cada golpe (igual que en playOn → hitEnemy)
    const pol = boonLevel('m_polonio');
    add(pol ? (pol === 2 ? 5 : 3) : 0, 'Polonio');
    const ent = Game.run!.entropia ?? 0;
    if (ent >= ENTROPIA.delirante) add(ENTROPIA.vision, 'Visión del Abismo');
    if (this.prohibido('p_abismo')) add(Math.min(5, Math.floor(ent / 20)), 'Mirar de Vuelta');
    const hc = boonLevel('h_centripeta');
    if (hc && !this.centriUsed) add(6 * hc, 'Centrípeta');
    const tv = boonLevel('co_travail');
    if (tv && this.attacksTurn) add(tv * this.attacksTurn, 'Travail');
    add(this.derivadaBono, 'Derivada');
    if (this.calcBolsillo !== 1) por(this.calcBolsillo, 'Calculadora de Bolsillo');
    if (this.palanca) por(2, 'Palanca');
    if (ed === 'lamina') add(5, 'Lámina');
    if (ed === 'poli') por(1.5, 'Polícroma');
    if (ed === 'cristal') por(2, 'Cristal');
    if (this.necro('steiner') && !this.steinerUsed) por(2, 'Steiner');
    if (this.radianes) por(0.6, 'Modo RAD (juega una Habilidad para arreglarlo)');
    if (Game.run?.modo === 'abismo') {
      const d = this.dientesBonos(def, this.attacksTurn + 1);
      suma += d.suma;
      sumas.push(...d.sumas);
      if (d.cosmos) { mult *= d.k; mults.push(d.cosmos); }
    }
    if (!base) {
      const L: string[] = [];
      if (suma) L.push(`+${suma} a cada golpe: ${sumas.join(' · ')}`);
      if (mult !== 1) L.push(`×${r1(mult)}: ${mults.join(' · ')}`);
      return L;
    }
    const L: string[] = [];
    const golpes = base.golpes ?? 1;
    L.push(`Base: ${base.dmg}${golpes > 1 ? ` por golpe (${golpes} golpes)` : ''}${base.todos ? ' a TODOS' : ''}${base.ignora ? ' · ignora Bloqueo' : ''}${notaPlano}`);
    if (base.res) {
      L.push('(Este daño no recibe tus bonos.)');
      suma = 0;
      mult = 1;
    } else {
      if (suma) L.push(`+${suma}: ${sumas.join(' · ')}`);
      if (mult !== 1) L.push(`×${r1(mult)}: ${mults.join(' · ')}`);
      if (suma || mult !== 1) {
        const F = Math.round((base.dmg + suma) * mult);
        L.push(`= ${suma ? (mult !== 1 ? `(${base.dmg} + ${suma})` : `${base.dmg} + ${suma}`) : base.dmg}${mult !== 1 ? ` × ${r1(mult)}` : ''} = ${F}${golpes > 1 ? ' por golpe' : ''}`);
      }
    }
    if (base.nota) L.push(base.nota);
    // resultado contra cada enemigo
    const vivos = this.alive().sort((x, y) => x.baseX - y.baseX);
    const objetivos = base.ultimo ? vivos.slice(-1) : vivos;
    if (objetivos.length > 1 && !base.todos && !base.ultimo) L.push(base.azar ? 'Si un golpe cae en…' : 'Según a quién se la juegues:');
    for (const e of objetivos) L.push(this.previaContra(e, base, golpes, suma, mult, def));
    return L;
  }

  /** Simula los golpes contra un enemigo sin tocarlo */
  private previaContra(e: EnemyView, base: { dmg: number; todos?: boolean; ignora?: boolean; res?: boolean; centroide?: boolean; rompe?: boolean; azar?: boolean; lim?: number; brazo?: boolean }, golpes: number, suma: number, mult: number, def: CardDef): string {
    const st = e.st;
    let blk = base.rompe ? 0 : st.block;
    let hp = st.hp;
    let det = !!st.detenido;
    let total = 0;
    let absorb = 0;
    let para = '';
    const umbral = umbralDe(st);
    const cardHit = !base.res;
    const n = base.azar ? 1 : golpes;
    let F0 = 0;
    // v0.53 · Torque Abisal: el brazo de palanca depende del lugar en la fila
    const fila = this.alive().sort((a, b) => a.baseX - b.baseX);
    const bd = base.brazo ? Math.round(base.dmg * [1, 1.5, 2, 2.5][Math.min(3, Math.max(0, fila.indexOf(e)))]) : base.dmg;
    for (let i = 0; i < n && hp > 0; i++) {
      let F = bd + (cardHit ? suma : 0);
      if (cardHit && st.def.hueco && base.todos) F = Math.round(F / 2);
      const m = mult * (base.centroide && blk <= 0 ? 1.5 : 1);
      if (cardHit && m !== 1) F = Math.round(F * m);
      const tt = boonLevel('tu_test');
      if (cardHit && tt && st.def.act === 4) F += tt === 2 ? 6 : 3;
      if (i === 0) F0 = F;
      let dmg = F;
      if (det) dmg = Math.round(dmg * 1.5);
      if (st.fatiga > 0) dmg = Math.round(dmg * 1.5);
      if (!(base.ignora || (cardHit && this.pierce))) { const a = Math.min(blk, dmg); blk -= a; dmg -= a; absorb += a; }
      hp -= dmg;
      total += dmg;
      if (umbral && !det && hp > 0 && cardHit && F >= umbral) {
        if ((st.imparableT ?? 0) > 0) para = 'IMPARABLE: no se detiene';
        else { det = true; para = `lo DETIENES (≥ ${umbral} N)`; }
      }
    }
    const partes: string[] = [];
    let s = `${st.def.name}: −${total} de vida`;
    if (absorb) s += ` (+${absorb} al Bloqueo)`;
    partes.push(s);
    if (cardHit && st.def.hueco && base.todos) partes.push('área negativa: ½');
    if (st.detenido) partes.push('detenido ×1.5');
    if (st.fatiga > 0) partes.push('fatiga ×1.5');
    void F0;
    if (para) partes.push(para);
    if (hp <= 0) partes.push('¡lo derrotas!');
    else if (umbral && !para && !st.detenido && cardHit) partes.push(`no lo detiene (umbral ${umbral})`);
    if (st.def.thorns) partes.push(`Púas: te regresa ${st.def.thorns}${n > 1 ? ' por golpe' : ''}`);
    if (def.id === 'limite' && base.lim) {
      const jefe = st.def.id === 'am' || st.def.id === 'hibbelerius' || this.kind === 'boss';
      if (st.hp <= (st.maxHp * (jefe ? 10 : base.lim)) / 100) return `→ ${st.def.name}: ¡lo derrotas (Límite: le queda ≤ ${jefe ? 10 : base.lim} %)!`;
    }
    return `→ ${partes.join(' · ')}`;
  }

  /** Vista previa de Defensas, Habilidades y Poderes: Bloqueo real y efectos extra */
  private previaOtra(def: CardDef, st: CardStats, ed: string | undefined, costo: number): string[] {
    const L: string[] = [];
    const ab = Game.run?.modo === 'abismo';
    const bonos: [number, string][] = [];
    if (ab && def.type === 'Defensa') {
      const dmd = this.diente('diamante');
      if (dmd) bonos.push([4 * dmd, 'Diente de Diamante']);
      if (Game.run?.mutador === 'eco') bonos.push([3, 'Eco del Abismo']);
      const lun = this.diente('luna');
      if (lun) bonos.push([3 * lun, `✦ Luna nv ${lun}`]);
    }
    if (ab && def.type === 'Habilidad') {
      const mer = this.diente('mercurio');
      if (mer) { bonos.push([2 * mer, `✦ Mercurio nv ${mer}`]); L.push(`✦ Mercurio: +${2 * mer} a tu siguiente ataque`); }
    }
    if (ab && def.abismo) { const sat = this.diente('saturno'); if (sat) bonos.push([3 * sat, `✦ Saturno nv ${sat}`]); }
    if (ed === 'lamina') bonos.push([4, 'Lámina']);
    if (ed === 'cristal') bonos.push([10, 'Cristal']);
    if (ed === 'poli') L.push('Polícroma: robas 1');
    if (ed === 'holo') L.push('Holográfica: +1 J');
    const fot = boonLevel('e_foton');
    if (fot && def.type === 'Habilidad') L.push(`Efecto Fotoeléctrico: ${fot === 2 ? 7 : 4} a un enemigo al azar`);
    let baseB = def.type === 'Defensa' ? st.block ?? 0 : 0;
    // Defensas cuyo Bloqueo depende del momento
    const quedan = Math.max(0, this.energy - costo);
    switch (def.id) {
      case 'radioGiro': if (this.hand.length - 1 >= 4) baseB += 4; break;
      case 'dclTentaculos': baseB = (st.block ?? 4) * this.alive().length; break;
      case 'muroMasa': baseB = (st.block ?? 4) + 3 * Math.max(0, this.masa); break;
      case 'patoHule': baseB = (st.block ?? 3) * (this.confusa ? 3 : 1); break;
      case 'dclParlante': baseB = (st.block ?? 5) + (st.extra ?? 3) * this.alive().filter((e) => e.st.intent.kind === 'attack' || (e.st.intent.kind === 'block' && !!e.st.intent.dmg)).length; break;
      case 'conservacion': baseB = (st.extra ?? 3) * quedan; break;
      case 'barrera': baseB = Math.round((st.extra ?? 1.5) * this.vel); break;
      case 'retro': baseB = Math.round((st.extra ?? 3) * Math.min(4, this.vel)); break;
      case 'frenado': { const v2 = Math.max(0, this.vel - 2); baseB = Math.round(0.5 * (st.m ?? 1) * (this.vel * this.vel - v2 * v2)); break; }
      case 'equilibrio': {
        const inc = this.alive().reduce((n, e) => { const i = e.st.intent; return n + (i.kind === 'attack' ? i.dmg * (i.hits ?? 1) : i.kind === 'block' ? i.dmg ?? 0 : 0); }, 0);
        baseB = Math.min(inc, st.extra ?? 12);
        break;
      }
    }
    if (!baseB && !bonos.length && !L.length) return [];
    const sinDef = this.condJefe === 'sinDefensa' && def.type === 'Defensa';
    const marea = this.jefeVivo('dagon') && this.turn % 3 === 0;
    const efectivo = (n: number) => (sinDef ? 0 : marea ? Math.floor(n / 2) : n);
    let total = efectivo(baseB);
    const out: string[] = [];
    if (baseB) out.push(`Base: +${baseB} de Bloqueo`);
    for (const [n, t] of bonos) { out.push(`${t}: +${n} de Bloqueo`); total += efectivo(n); }
    if (def.type === 'Defensa' && this.jefeVivo('yig')) L.push('Yig: una serpiente te muerde (−2 de vida)');
    if (sinDef) out.push('SIN DEFENSA: esta pelea las Defensas no dan Bloqueo');
    else if (marea) out.push('Marea Alta (Dagón): cada Bloqueo da la mitad');
    if (baseB || bonos.length) out.push(`── Total: +${total} de Bloqueo (tendrías ${this.block + total}) ──`);
    return [...out, ...L];
  }

  /** ¿Se ve la intención de este enemigo? (invisibles, Noche sin Estrellas y la batería baja de la Calculadora la ocultan) */
  private intencionVisible(ev: EnemyView) {
    const st = ev.st;
    const noche = this.acto === 5 && Game.run?.mutador === 'noche' && this.turn <= 1;
    const bateria = st.def.id === 'calculadora' && st.hp < st.maxHp * 0.3; // v0.57 · batería baja
    return !((st.def.oculto || noche || bateria) && st.intent.kind !== 'stunned' && !this.diente('ojo') && !this.telescopio && Game.run?.familiar?.id !== 'pezLinterna');
  }

  /** v0.57 · Globo de diálogo de una carta que habla (como en Inscryption) */
  private hablar(quien: string, texto: string, x: number, y: number) {
    const c = this.add.container(Phaser.Math.Clamp(x, 150, W - 150), y).setDepth(880);
    const t = txt(this, 0, 0, `${quien}: «${texto}»`, 16, '#1a1420', { wordWrap: { width: 260 }, align: 'center' }).setOrigin(0.5);
    const w = t.width + 24, h = t.height + 16;
    const g = this.add.graphics();
    g.fillStyle(0xf4ead2, 0.97).fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.fillTriangle(-8, h / 2 - 1, 8, h / 2 - 1, 0, h / 2 + 10);
    g.lineStyle(2, 0x3a2a1a, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    c.add([g, t]).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 160, ease: 'Back.out' });
    this.tweens.add({ targets: c, alpha: 0, y: y - 16, delay: 2600, duration: 400, onComplete: () => c.destroy() });
    audio.sfx('hover');
  }

  private calc(line: string) {
    this.log.unshift(line);
    this.calcLines.forEach((t, i) => {
      // si la línea no cabe en el pergamino, se achica la letra (y, si hace falta, se comprime)
      t.setScale(1).setFontSize(20).setText(this.log[i] ?? '');
      const max = 476;
      let fs = 20;
      while (t.width > max && fs > 15) t.setFontSize(--fs);
      if (t.width > max * 1.2) {
        // muy larga: se corta con «…» (pasa el cursor por el pergamino para leerla completa)
        let s = this.log[i] ?? '';
        while (s.length > 10 && t.width > max * 1.2) { s = s.slice(0, -4); t.setText(`${s}…`); }
      }
      if (t.width > max) t.setScale(max / t.width, 1);
    });
  }

  private clickCard(v: CardView) {
    if (this.busy) return;
    this.tip.hide();
    if (this.discardMode > 0) return this.discardFromHand(v);
    if (this.condJefe === 'sinHabilidades' && CARDS[v.inst.id].type === 'Habilidad') {
      this.hint('MENTE EN BLANCO: no puedes jugar Habilidades en esta pelea.');
      this.tweens.add({ targets: v, x: v.x + 6, duration: 40, yoyo: true, repeat: 3 });
      return;
    }
    if (CARDS[v.inst.id].unplayable) {
      this.hint('Esta carta no se puede jugar.');
      this.tweens.add({ targets: v, x: v.x + 6, duration: 40, yoyo: true, repeat: 3 });
      return;
    }
    if (this.selected === v) return this.cancelSelect();
    if (this.selected) this.cancelSelect();
    if (this.cost(v) > this.energy) {
      this.hint(T.combate.sinEnergia);
      this.tweens.add({ targets: v, x: v.x + 6, duration: 40, yoyo: true, repeat: 3 });
      return;
    }
    const def = CARDS[v.inst.id];
    if (def.id === 'tajo') return this.chooseAngle(v);
    if (def.id === 'tiroParabolico') return this.chooseParabola(v);
    if (def.target === 'enemy' && this.alive().length > 1) return this.enterTargeting(v);
    this.playOn(v, this.alive()[0]);
  }

  /** Descarta una carta elegida por el jugador (Diagrama de Cuerpo Libre) */
  private discardFromHand(v: CardView) {
    this.hand = this.hand.filter((c) => c !== v);
    this.discard.push(v.inst);
    this.tweens.add({ targets: v, x: W - 62, y: 510, scale: 0.1, alpha: 0, duration: 220, onComplete: () => v.destroy() });
    this.discardMode--;
    this.calc(`Descartas ${CARDS[v.inst.id].name}`);
    if (this.discardMode <= 0 || !this.hand.length) {
      this.discardMode = 0;
      this.hintT.setAlpha(0);
      this.endBtn.setEnabled(true);
    }
    this.layoutHand();
    this.refreshPlayer();
  }

  /** Mete cartas de estado (basura) a tus pilas */
  private addStatus(a: AddCards) {
    const r = Game.run!;
    unlock('cards', a.id);
    for (let i = 0; i < a.n; i++) {
      const inst = { uid: r.nextUid++, id: a.id, up: false };
      if (a.to === 'draw') this.draw.splice(Math.floor(Math.random() * (this.draw.length + 1)), 0, inst);
      else this.discard.push(inst);
    }
    this.calc(`Te meten ${a.n} «${CARDS[a.id].name}» al ${a.to === 'draw' ? 'mazo' : 'descarte'}`);
  }

  /** Resonancia: con 3 cargas el enemigo recibe 12 de daño */
  private async addResonance(ev: EnemyView, n: number) {
    ev.st.resonancia += n;
    while (ev.st.resonancia >= 3 && !ev.dead) {
      ev.st.resonancia -= 3;
      this.calc('¡Resonancia! La amplitud se dispara: 12 de daño');
      this.floatText(ev.baseX, 150, '¡RESONANCIA!', '#9ad8f0');
      await this.hitEnemy(ev, 12, true, 'res');
    }
    if (!ev.dead) this.refreshEnemy(ev);
  }

  private dealK(m: number) {
    return Math.round(0.5 * m * this.vel * this.vel);
  }

  /** Modo apuntar: la mano baja y cada enemigo tiene una zona grande para hacer clic */
  private enterTargeting(v: CardView) {
    this.selected = v;
    audio.sfx('card');
    this.tweens.killTweensOf(this.hintT);
    this.hintT.setText(T.combate.eligeObjetivo).setAlpha(1);
    this.hand.forEach((c) => {
      if (c !== v) this.tweens.add({ targets: c, y: HAND_Y + 120, duration: 160 });
    });
    v.setDepth(320);
    this.tweens.add({ targets: v, x: this.heroX + 150, y: 470, scale: 0.75, angle: 0, duration: 160 });
    for (const ev of this.alive()) {
      const w = Math.max(150, ev.sprite.displayWidth + 40);
      const z = this.add.rectangle(ev.baseX, 250, w, 260, 0xe8c15a, 0.0001).setDepth(650).setInteractive({ useHandCursor: true });
      const ret = this.add.graphics().setDepth(651).setVisible(false);
      const x0 = ev.baseX - w / 2, y0 = 120, x1 = ev.baseX + w / 2, y1 = 380, L = 18;
      ret.lineStyle(3, UI.gold, 1);
      ret.strokePoints([{ x: x0, y: y0 + L }, { x: x0, y: y0 }, { x: x0 + L, y: y0 }]);
      ret.strokePoints([{ x: x1 - L, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y0 + L }]);
      ret.strokePoints([{ x: x0, y: y1 - L }, { x: x0, y: y1 }, { x: x0 + L, y: y1 }]);
      ret.strokePoints([{ x: x1 - L, y: y1 }, { x: x1, y: y1 }, { x: x1, y: y1 - L }]);
      z.on('pointerover', () => {
        ret.setVisible(true);
        ev.sprite.setTint(0xffe0a0);
        audio.sfx('hover');
      });
      z.on('pointerout', () => {
        ret.setVisible(false);
        ev.sprite.clearTint();
      });
      z.on('pointerdown', (p: Phaser.Input.Pointer) => {
        if (p.rightButtonDown()) return this.cancelSelect();
        ev.sprite.clearTint();
        if (this.selected) this.playOn(this.selected, ev);
      });
      this.zones.push(z, ret);
    }
  }

  private clearZones() {
    this.zones.forEach((z) => z.destroy());
    this.zones = [];
    this.enemies.forEach((e) => e.sprite.clearTint());
  }

  private cancelSelect() {
    if (!this.selected) return;
    this.selected = null;
    this.clearZones();
    this.hintT.setAlpha(0);
    this.layoutHand();
  }

  private chooseAngle(v: CardView) {
    this.busy = true;
    const layer = this.add.container(0, 0).setDepth(850);
    const g = this.add.graphics();
    frame(g, W / 2 - 230, 150, 460, 170, 0x0f0c13, UI.gold);
    const { F } = force(statsOf(v.inst), this.ctx());
    layer.add([
      g,
      txt(this, W / 2, 176, 'Tajo Angulado: elige el ángulo θ', 26, CSS.gold).setOrigin(0.5),
      txt(this, W / 2, 206, `F = ${F} N.  La componente útil es F·cosθ`, 20, CSS.bone).setOrigin(0.5),
    ]);
    const close = () => {
      layer.destroy();
      this.busy = false;
    };
    layer.add(
      button(this, W / 2 - 115, 260, 200, 60, `θ = 0° → ${F} N\na un enemigo`, () => {
        close();
        (v as any).angle0 = true;
        if (this.alive().length > 1) this.enterTargeting(v);
        else this.playOn(v, this.alive()[0]);
      }, { size: 20 }),
    );
    layer.add(
      button(this, W / 2 + 115, 260, 200, 60, `θ = 60° → ${Math.round(F * 0.5)} N\na TODOS`, () => {
        close();
        (v as any).angle0 = false;
        this.playOn(v, this.alive()[0]);
      }, { size: 20 }),
    );
    layer.add(button(this, W / 2 + 200, 168, 36, 30, '×', close, { size: 20 }));
  }

  /** Distancia (m) a cada enemigo según su lugar en la fila: 6, 10, 14, 18 m */
  private distancias() {
    return this.alive().sort((a, b) => a.baseX - b.baseX).map((e, i) => ({ e, d: 6 + 4 * i }));
  }

  /** ¿Sobre quién cae un proyectil con alcance R? (tolerancia ±2.5 m) */
  private parabolaTarget(R0: number): EnemyView | null {
    let best: EnemyView | null = null, bd = 2.5;
    for (const { e, d } of this.distancias()) if (Math.abs(d - R0) <= bd) { bd = Math.abs(d - R0); best = e; }
    return best;
  }

  /** Tiro Parabólico: elige el ángulo θ */
  private chooseParabola(v: CardView) {
    this.busy = true;
    const st = statsOf(v.inst);
    const v0 = st.block ?? 11, g0 = this.grav.g;
    const layer = this.add.container(0, 0).setDepth(850);
    const g = this.add.graphics();
    frame(g, W / 2 - 300, 110, 600, 300, 0x0f0c13, UI.gold);
    const dist = this.distancias().map(({ e, d }) => `${e.st.def.name}: ${d} m`).join(' · ');
    layer.add([g,
      txt(this, W / 2, 134, 'Tiro Parabólico: elige el ángulo θ', 26, CSS.gold).setOrigin(0.5),
      txt(this, W / 2, 164, `R = v₀²·sen2θ / g = ${v0}²·sen2θ / ${g0}`, 19, CSS.bone).setOrigin(0.5),
      txt(this, W / 2, 190, dist, 16, CSS.dim, { align: 'center', wordWrap: { width: 560 } }).setOrigin(0.5)]);
    const close = () => { layer.destroy(); this.busy = false; };
    [15, 30, 45, 60, 75].forEach((th, i) => {
      const R0 = (v0 * v0 * Math.sin((2 * th * Math.PI) / 180)) / g0;
      const t = this.parabolaTarget(R0);
      layer.add(button(this, W / 2 - 236 + i * 118, 270, 110, 92, `θ = ${th}°\nR = ${r1(R0)} m\n${t ? `→ ${t.st.def.name.split(' ')[0]}` : '→ nadie'}`, () => {
        close();
        (v as any).theta = th;
        this.playOn(v, t ?? this.alive()[0]);
      }, { size: 16, color: t ? UI.gold : UI.border }));
    });
    layer.add(txt(this, W / 2, 344, 'Pista: 30° y 60° llegan igual de lejos.', 16, CSS.dim).setOrigin(0.5));
    layer.add(button(this, W / 2 + 270, 128, 36, 30, '×', close, { size: 20 }));
  }

  // ───────────────────────── JUGAR CARTA ─────────────────────────
  private async playOn(v: CardView, target: EnemyView | undefined) {
    if (this.busy) return;
    const inst = v.inst;
    const def = CARDS[inst.id];
    this.cartaTipo = def.type;
    const st = statsOf(inst);
    const costo = this.cost(v);
    if (costo > this.energy) return;
    costOverride.delete(inst.uid);
    costConfusion.delete(inst.uid);
    this.busy = true;
    this.selected = null;
    this.clearZones();
    this.hintT.setAlpha(0);
    this.tip.hide();
    audio.sfx('card');
    this.energy -= costo;
    this.hand = this.hand.filter((c) => c !== v);
    v.disableInteractive();
    this.tweens.add({ targets: v, x: W / 2, y: 230, scale: 0.9, angle: 0, duration: 140 });
    await this.wait(200);
    this.tweens.add({ targets: v, alpha: 0, scale: 0.6, y: 200, duration: 200, onComplete: () => v.destroy() });
    if (def.exhaust) this.exhaust.push(inst);
    else this.discard.push(inst);

    // Galileo · Plano Inclinado: el primer ataque del turno acelera más
    let plano = 0;
    let planoV = 0;
    if (def.type === 'Ataque' && !this.firstAttack && boonLevel('g_plano')) {
      if (this.usaVel) {
        planoV = Math.max(0, Math.min(boonLevel('g_plano'), VMAX - this.vel));
        this.vel += planoV;
        this.calc(`Plano Inclinado (Galileo): +${planoV} m/s para este primer ataque`);
      } else {
        plano = 2 * boonLevel('g_plano');
        this.acel += plano;
        this.calc(`Plano Inclinado (Galileo): +${plano} m/s² a este primer ataque`);
      }
    }
    if (def.type === 'Ataque') this.firstAttack = true;
    if (def.type === 'Poder') this.poderes++;
    if (def.voz?.jugar) this.hablar(def.name.replace(/^(El|La) /, ''), Phaser.Utils.Array.GetRandom(def.voz.jugar), this.heroX + 40, 170);
    if (def.type === 'Habilidad' && this.radianes) { this.radianes = false; this.calc('Revisas el modo de tu calculadora: DEG otra vez. Tus Ataques vuelven a la normalidad'); this.floatText(this.heroX, 200, 'DEG ✓', CSS.green); }
    // Curie · Polonio: los ataques pegan más
    const pol = boonLevel('m_polonio');
    this.polonio = def.type === 'Ataque' && pol ? (pol === 2 ? 5 : 3) : 0;
    if (def.type === 'Ataque') {
      // Horror cósmico: Visión del Abismo y Problema del Abismo
      const ent = Game.run!.entropia ?? 0;
      if (ent >= ENTROPIA.delirante) {
        this.polonio += ENTROPIA.vision;
        this.calc(`Visión del Abismo: +${ENTROPIA.vision} (Locura ${ent})`);
      }
      if (this.prohibido('p_abismo')) {
        const ab = Math.min(5, Math.floor(ent / 20));
        if (ab) { this.polonio += ab; this.calc(`Mirar de Vuelta: +${ab} (Locura ${ent})`); }
      }
      // Huygens · Fuerza Centrípeta: el primer ataque del combate
      const hc = boonLevel('h_centripeta');
      if (hc && !this.centriUsed) {
        this.centriUsed = true;
        this.polonio += 6 * hc;
        this.calc(`Fuerza Centrípeta (Huygens): a = v²/r → +${6 * hc} a este primer ataque`);
      }
      // Coriolis · Travail: el trabajo se acumula
      const tv = boonLevel('co_travail');
      if (tv && this.attacksTurn) {
        this.polonio += tv * this.attacksTurn;
        this.calc(`Travail (Coriolis): +${tv * this.attacksTurn} por ${this.attacksTurn} ataque(s) previos`);
      }
      this.attacksTurn++;
      if (this.derivadaBono) {
        this.polonio += this.derivadaBono;
        this.calc(`Derivada: +${this.derivadaBono} a este ataque`);
        this.derivadaBono = 0;
      }
      if (this.calcBolsillo !== 1) {
        this.mult *= this.calcBolsillo;
        this.calc(`Calculadora de Bolsillo: ×${this.calcBolsillo}`);
        this.calcBolsillo = 1;
      }
      if (this.palanca) {
        this.palanca = false;
        this.mult *= 2;
        this.calc('Palanca de Arquímedes: brazo doble → momento doble: ×2');
      }
    }
    // ── El Abismo: ediciones (Balatro), Página de Steiner y área negativa ──
    this.curAll = def.target === 'all';
    const ed = this.condJefe === 'sinEdiciones' ? undefined : inst.ed; // v0.48 · «Opacidad»
    if (ed && def.type === 'Ataque') {
      if (ed === 'lamina') { this.polonio += 5; this.calc('Lámina: +5 de daño'); }
      if (ed === 'poli') { this.mult *= 1.5; this.calc('Polícroma: ×1.5'); }
      if (ed === 'cristal') { this.mult *= 2; this.calc('Cristal: ×2'); }
    }
    if (ed === 'holo') { this.energy += 1; this.calc('Holográfica: +1 J'); }
    if (def.type === 'Ataque' && this.necro('steiner') && !this.steinerUsed) {
      this.steinerUsed = true;
      this.mult *= 2;
      this.calc('Página de Steiner: I = I₀ + m·d² → primer ataque ×2');
    }
    if (def.type === 'Ataque' && Game.run?.modo === 'abismo') this.dientesAtaque(def);
    const c = this.ctx();
    switch (def.id) {
      // ── El Abismo de los Ejes ──
      case 'centroideGolpe': {
        const f = force(st, c);
        const libre = !!target && target.st.block <= 0;
        if (libre) this.mult *= 1.5;
        this.calc(`Golpe al Centroide: F = ${r1(f.m)} kg × ${r1(f.a)} m/s² = ${f.F} N${libre ? ' · sin Bloqueo: ×1.5' : ''}`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, f.F);
        break;
      }
      case 'momentoInercia':
        this.gainBlock(st.block ?? 10);
        this.calc(`Momento de Inercia: I = Σm·r² = ${st.extra}·(1² + 2²) = ${st.block} → +${st.block} de Bloqueo`);
        break;
      case 'radioGiro': {
        const extra = this.hand.length >= 4 ? 4 : 0;
        this.gainBlock((st.block ?? 6) + extra);
        this.calc(`Radio de Giro: k = √(I/m) → +${(st.block ?? 6) + extra} de Bloqueo${extra ? ' (mano extendida: +4)' : ''}`);
        break;
      }
      case 'ejesParalelos':
        this.palanca = true;
        this.calc('Ejes Paralelos: I = I₀ + m·d² → tu siguiente ataque hace ×2');
        break;
      case 'pirueta':
        this.drawCards(2);
        this.energy += st.extra ?? 1;
        this.calc(`Pirueta: I₁ω₁ = I₂ω₂ → robas 2 y +${st.extra} J`);
        break;
      // ── v0.53 · cartas nuevas del Abismo ──
      case 'rodadura': {
        const f = force(st, c);
        const agarre = this.block > 0;
        if (agarre) this.mult *= 1.5;
        this.calc(`Rodar sin Deslizar: F = ${f.F} N${agarre ? ' · con Bloqueo (agarre): ×1.5' : ' (sin Bloqueo no hay agarre)'}`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, f.F);
        break;
      }
      case 'torqueAbisal': {
        const f = force(st, c);
        const fila = this.alive().sort((a, b) => a.baseX - b.baseX);
        const pos = target ? Math.max(0, fila.indexOf(target)) : 0;
        const r = [1, 1.5, 2, 2.5][Math.min(3, pos)];
        const dmg = Math.round(f.F * r);
        this.calc(`Torque Abisal: τ = r × F = ${r} × ${f.F} N = ${dmg} (${pos + 1}º de la fila)`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, dmg);
        break;
      }
      case 'energiaRotacional': {
        const w = Math.min(6, this.played + 1);
        const K = Math.round(0.5 * 4 * w * w);
        this.calc(`Energía de Rotación: K = ½·4·${w}² = ${K}`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, K);
        break;
      }
      case 'centroPercusion': {
        const f = force(st, c);
        this.calc(`Centro de Percusión: F = ${f.F} N justo en el punto dulce`);
        await this.heroLunge();
        if (target && (await this.hitEnemy(target, f.F))) { this.drawCards(2); this.calc('¡Sin reacción en el eje! Robas 2'); }
        break;
      }
      case 'anguloRecto': {
        const f = force(st, c);
        this.calc(`Ángulo de 90°: F = ${f.F} N desde una esquina (ignora el Bloqueo)`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, f.F, true);
        break;
      }
      case 'rampaAbisal':
        if (this.usaVel) { this.vel = Math.min(this.vmax, this.vel + 2); this.calc(`Rampa del Abismo: a = g·senθ → +2 m/s (v = ${this.vel})`); }
        else { this.acel += st.extra ?? 3; this.calc(`Rampa del Abismo: a = g·sen18° ≈ 3 → +${st.extra} m/s² este turno`); }
        this.drawCards(1);
        break;
      case 'penduloFisico':
        this.gainBlock(st.block ?? 6);
        this.penduloB += st.block ?? 6;
        this.calc(`Péndulo Físico: +${st.block} de Bloqueo… y regresará el siguiente turno`);
        break;
      case 'giroscopio':
        this.giroscopio += st.block ?? 3;
        this.calc(`Giroscopio: H = I·ω → +${st.block} de Bloqueo cada turno y ya no te aturden`);
        break;
      case 'trenEngranes': {
        const n = Math.min(4, (st.extra ?? 1) + this.poderes);
        this.energy += n;
        this.calc(`Tren de Engranes: ω₁r₁ = ω₂r₂ → +${n} J (${this.poderes} Poder(es) jugados)`);
        break;
      }
      case 'suenoProfundo':
        addEntropia(-(st.extra ?? 12));
        this.drawCards(2);
        this.calc(`Sueño Profundo: +${st.extra} de Cordura y robas 2`);
        this.hud.refresh();
        break;
      case 'llavePlata': {
        const n = Math.min(st.extra ?? 2, this.discard.length);
        const vuelven = Phaser.Utils.Array.Shuffle([...this.discard]).slice(0, n);
        this.discard = this.discard.filter((x) => !vuelven.includes(x));
        this.draw.push(...vuelven);
        this.drawCards(vuelven.length);
        this.calc(`La Llave de Plata: ${vuelven.map((x) => CARDS[x.id].name).join(' y ') || 'nada'} regresa(n) del descarte`);
        break;
      }
      case 'necroDinamica':
        this.necroDin = true;
        this.calc('Necronomicón de Dinámica: cada vez que detengas a alguien, +1 J y robas 1');
        break;
      // ── v0.57 · cartas que hablan ──
      case 'calculadoraBolsillo': {
        const rad = Math.random() < 0.25;
        this.calcBolsillo = rad ? 0.75 : st.extra ?? 1.5;
        this.calc(rad ? 'Calculadora de Bolsillo: estaba en RAD… tu siguiente Ataque ×0.75' : `Calculadora de Bolsillo: tu siguiente Ataque ×${st.extra}`);
        break;
      }
      case 'hibbelerMaldito':
        this.hibbelerM += st.block ?? 6;
        this.calc('El Hibbeler Maldito: detener a un enemigo te da Bloqueo… y te regañará si desperdicias J');
        break;
      case 'tareaOlvidada': {
        const n = Math.min(6, this.tareaT.get(inst.uid) ?? 0);
        const dmg = (st.block ?? 6) + (st.extra ?? 5) * n;
        this.tareaT.delete(inst.uid);
        this.calc(`La Tarea Olvidada: ${st.block} + ${st.extra}×${n} turno(s) en tu mano = ${dmg}`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, dmg);
        break;
      }
      case 'dclParlante': {
        const atacan = this.alive().filter((e) => e.st.intent.kind === 'attack' || (e.st.intent.kind === 'block' && !!e.st.intent.dmg)).length;
        const b = (st.block ?? 5) + (st.extra ?? 3) * atacan;
        this.gainBlock(b);
        this.calc(`El Diagrama que Habla: ${st.block} + ${st.extra}×${atacan} enemigo(s) que atacan = +${b} de Bloqueo`);
        break;
      }
      case 'volanteAbisal':
        this.jPerTurn += 1;
        this.calc('Volante Abisal: K = ½Iω² → +1 J al inicio de cada turno');
        break;
      case 'geometriaImposible': {
        const f = force(st, c);
        this.calc(`Geometría Imposible: F = ${r1(f.m)} kg × ${r1(f.a)} m/s² = ${f.F} N a todos`);
        await this.heroLunge();
        for (const e of [...this.alive()]) await this.hitEnemy(e, f.F);
        this.confundir('Geometría Imposible');
        break;
      }
      case 'ojoQueGira':
        addEntropia(CORDURA.ojo);
        this.drawCards(3);
        this.energy += st.extra ?? 2;
        this.calc(`El Ojo que Gira: −${CORDURA.ojo} de Cordura → robas 3 y +${st.extra} J`);
        this.cameras.main.flash(250, 60, 140, 60);
        this.hud.refresh();
        break;
      case 'steiner':
        if (this.usaVel) this.vel = Math.min(this.vmax, this.vel + 1);
        else { this.baseAcel += 1; this.acel += 1; }
        this.masa += st.extra ?? 3;
        this.calc(`Teorema de Steiner: +${st.extra} kg y +1 ${this.usaVel ? 'm/s' : 'm/s²'} el resto del combate`);
        break;
      case 'despertar': {
        const loc = Math.max(0, 100 - (c.cordura ?? 70));
        const a = Math.max(1, Math.round(loc / 10));
        const m = (st.m ?? 10) + this.masa;
        const F = Math.round(m * a);
        this.calc(`Despertar al Durmiente: F = ${r1(m)} kg × ${a} m/s² (Locura ${loc}) = ${F} N`);
        this.cameras.main.shake(300, 0.008);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, F);
        break;
      }
      case 'calamarTorque': {
        const f = force(st, c);
        this.calc(`Calamar de Torque: τ = r × F → ${f.F} N, tres tentáculos`);
        await this.heroLunge();
        for (let k = 0; k < 3 && target && !target.dead; k++) await this.hitEnemy(target, f.F);
        break;
      }
      case 'gatoSchrodinger':
        if (Math.random() < 0.5) {
          this.energy += 3;
          this.calc('Gato de Schrödinger: abres la caja… ¡vivo! +3 J');
          this.floatText(this.heroX, 190, '¡Miau! +3 J', CSS.green);
        } else {
          this.calc('Gato de Schrödinger: abres la caja… ¿muerto? Robas 3');
          this.floatText(this.heroX, 190, '…miau', CSS.dim);
          this.drawCards(3);
        }
        break;
      case 'cafeAbismo':
        this.energy += st.extra ?? 2;
        this.addStatus({ id: 'susurro', n: 1, to: 'discard' });
        this.calc(`Café del Abismo: +${st.extra} J (y algo empieza a susurrar)`);
        break;
      case 'llamadaPerdida': {
        addEntropia(8);
        this.hud.refresh();
        const libres = this.alive().filter((e) => !JEFES.includes(e.st.def.id) && e.st.def.id !== 'geometra');
        if (libres.length) {
          const e = Phaser.Utils.Array.GetRandom(libres);
          e.st.stunned = 1;
          e.st.intent = { kind: 'stunned' };
          this.refreshEnemy(e);
          this.floatText(e.baseX, 150, '¿Bueno?', '#9ad8c8');
          this.calc(`Llamada Perdida de R'lyeh: ${e.st.def.name} contesta y pierde su turno (−8 Cordura)`);
        } else this.calc("Llamada Perdida de R'lyeh: nadie contesta… (−8 Cordura)");
        break;
      }
      case 'dclTentaculos': {
        const n = this.alive().length;
        this.gainBlock((st.block ?? 4) * n);
        this.calc(`Diagrama de Cuerpo Libre: ${n} enemigo(s) × ${st.block} = +${(st.block ?? 4) * n} de Bloqueo`);
        break;
      }
      case 'enLibras': {
        const f = force(st, c);
        const dmg = Math.round(f.F * 2.2);
        this.calc(`Lo Calculé en Libras: ${f.F} N × 2.2 = ${dmg} (¡revisa tus unidades!)`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, dmg);
        break;
      }
      case 'manoMontemayor': {
        const n = Math.max(1, Math.min(4, Math.floor((Game.run!.stats.runasOk ?? 0) / 2)));
        this.calc(`La Tercera Mano de Montemayor: ${Game.run!.stats.runasOk ?? 0} aciertos → robas ${n}`);
        this.drawCards(n);
        break;
      }
      case 'patoHule': {
        const b = (st.block ?? 3) * (this.confusa ? 3 : 1);
        this.gainBlock(b);
        this.calc(`Pato de Hule Primigenio: flota → +${b} de Bloqueo${this.confusa ? ' (confundido: ×3)' : ''}. Cuac.`);
        this.floatText(this.heroX, 190, 'Cuac', '#ffd040');
        break;
      }
      case 'susurro':
        this.calc('Callas el Susurro. Por ahora.');
        break;
      // ── v0.16 ──
      case 'normalRobo':
        this.gainBlock(st.block ?? 6);
        this.calc(`Reacción Normal: N = m·g → +${st.block} de Bloqueo y robas 1`);
        this.drawCards(1);
        break;
      case 'perdigones':
        this.calc(`Perdigones: 3 impulsos de ${st.extra}`);
        for (let i = 0; i < 3 && this.alive().length; i++) {
          const t = Phaser.Utils.Array.GetRandom(this.alive());
          this.beam(t, 0xc8c8c8);
          await this.hitEnemy(t, st.extra ?? 3);
        }
        break;
      case 'fmaCuadrado': {
        const f = force(st, c);
        const dmg = Math.round((f.F * f.F) / 5);
        this.calc(`(F = m·a)²: F = ${f.F} N → F²/5 = ${dmg} (¡unidades: N²!)`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, dmg);
        break;
      }
      case 'descarga': {
        const J = this.energy;
        this.energy = 0;
        const dmg = (st.extra ?? 5) * J;
        this.calc(`Descarga Total: ${st.extra}·${J} J = ${dmg} a todos`);
        this.cameras.main.flash(250, 160, 220, 255);
        for (const t of [...this.alive()]) await this.hitEnemy(t, dmg);
        break;
      }
      case 'fractura':
        if (target) {
          if (target.st.block) this.calc(`Fractura Frágil: el Bloqueo de ${target.st.def.name} (${target.st.block}) se rompe`);
          target.st.block = 0;
          this.refreshEnemy(target);
          await this.heroLunge();
          await this.hitEnemy(target, st.extra ?? 7);
        }
        break;
      case 'golpeGracia':
        await this.heroLunge();
        if (target) {
          await this.hitEnemy(target, st.extra ?? 9);
          if (target.dead) {
            this.energy += 2;
            this.calc('Golpe de Gracia: la energía vuelve a ti (+2 J)');
          }
        }
        break;
      // ── Penitente del Empuje ──
      case 'empuje':
      case 'etapa': {
        this.quemar(st.extra ?? 4, def.name);
        if (def.id === 'etapa') this.drawCards(st.block ?? 1);
        break;
      }
      case 'llamarada': {
        this.quemar(2, def.name);
        for (const e of this.alive()) { e.st.calor += st.extra ?? 4; this.burst(e.baseX, 260, 0xc87533, 10); this.refreshEnemy(e); }
        this.calc(`Llamarada de Escape: +${st.extra} de Calor a todos`);
        break;
      }
      case 'reabastecer': {
        const run = Game.run!;
        const n = Math.min(st.extra ?? 7, run.maxHp - run.hp);
        run.hp += n;
        this.floatText(this.heroX, 200, `+${n} kg`, CSS.green);
        this.calc(`Reabastecer: +${n} kg de masa (más masa, acelerar cuesta más)`);
        break;
      }
      case 'embestidaArd':
      case 'absorcion':
      case 'ignicion':
      case 'reentrada': {
        if (def.id === 'ignicion') this.quemar(st.extra ?? 6, def.name);
        if (def.id === 'reentrada') {
          const run = Game.run!;
          run.hp = Math.max(1, run.hp - 3);
          this.calc('Reentrada: el roce con el aire te quema 3 kg');
        }
        const r = pmv(st, this.ctx());
        let dmg = r.p + (def.id === 'embestidaArd' ? st.extra ?? 2 : 0);
        dmg = this.critico(dmg);
        this.calc(`${def.name}: p = m·v = ${r.m} kg × ${r.v} m/s = ${r.p}${def.id === 'embestidaArd' ? ` + ${st.extra}` : ''} → ${dmg}`);
        await this.heroLunge();
        if (target) {
          if (def.id === 'reentrada') { target.st.calor += st.extra ?? 5; this.refreshEnemy(target); }
          await this.hitEnemy(target, dmg);
          if (def.id === 'absorcion' && target.dead) {
            const run = Game.run!;
            const n = Math.min(st.extra ?? 6, run.maxHp - run.hp);
            run.hp += n;
            this.calc(`Absorción: su masa se vuelve tuya (+${n} kg)`);
          }
        }
        break;
      }
      case 'estelaPlasma': {
        const r = pmv(st, this.ctx());
        const dmg = this.critico(r.p);
        this.calc(`Estela de Plasma: p = ${r.m}·${r.v} = ${dmg} a todos`);
        await this.heroLunge();
        for (const e of [...this.alive()]) await this.hitEnemy(e, dmg);
        break;
      }
      case 'asistencia':
        this.vel = Math.min(this.vmax, this.vel + (st.extra ?? 3));
        this.calc(`Asistencia Gravitatoria: +${st.extra} m/s sin gastar masa (v = ${this.vel})`);
        this.drawCards(1);
        break;
      case 'retro': {
        const dv = Math.min(4, this.vel);
        this.vel = Math.round((this.vel - dv) * 10) / 10;
        const b = Math.round((st.extra ?? 3) * dv);
        this.gainBlock(b);
        this.calc(`Retrocohete: Δv = ${dv} m/s → Bloqueo = ${st.extra}·${dv} = ${b}`);
        break;
      }
      case 'tobera':
        this.ve += st.extra ?? 20;
        this.calc(`Tobera Variable: vₑ = ${this.ve} m/s`);
        break;
      case 'masaCritica':
        this.critica = true;
        this.calc('Masa Crítica: con menos de la mitad de tu masa, tus ataques hacen ×1.5');
        break;
      // ── Legendarias ──
      case 'newtonV': {
        const f = force(st, c);
        const fila = this.alive().sort((a, b) => a.baseX - b.baseX);
        const ult = fila[fila.length - 1];
        const F = Math.round(f.F * 1.5);
        this.calc(`Venganza de Newton: F = ${f.F} N atraviesa ${fila.length - 1} enemigo(s) → el último recibe ×1.5 = ${F}`);
        await this.heroLunge();
        for (const e of fila.slice(0, -1)) { this.floatText(e.baseX, 170, 'p →', '#9ad8f0'); await this.wait(120); }
        if (ult) {
          this.beam(ult, 0x9ad8f0);
          await this.hitEnemy(ult, F);
        }
        break;
      }
      case 'tiroParabolico': {
        const th = ((v as any).theta as number) ?? 45;
        const v0 = st.block ?? 11;
        const g0 = this.grav.g;
        const R0 = (v0 * v0 * Math.sin((2 * th * Math.PI) / 180)) / g0;
        const t = this.parabolaTarget(R0);
        this.calc(`Tiro Parabólico: R = ${v0}²·sen(${2 * th}°)/${g0} = ${r1(R0)} m`);
        await this.heroLunge();
        if (t) {
          this.beam(t, 0xe8c15a);
          this.calc(`Cae sobre ${t.st.def.name}: ${st.extra} de daño (ignora el Bloqueo)`);
          await this.hitEnemy(t, st.extra ?? 16, true, 'res');
        } else {
          this.calc('El proyectil no cae sobre nadie: ¡revisa el alcance!');
          this.floatText(this.heroX + 200, 220, 'Fallo', CSS.dim);
        }
        break;
      }
      case 'pendulo': {
        const f = force(st, c);
        this.calc(`Péndulo: F = ${f.F} N. Regresará el siguiente turno con la misma energía`);
        await this.heroLunge();
        if (target) {
          await this.hitEnemy(target, f.F);
          this.penduloQ.push({ target, F: f.F });
        }
        break;
      }
      case 'patinadora': {
        const f = force(st, c);
        const n = Math.min(6, this.played + 1);
        this.calc(`Patinadora: cierra los brazos → ${n} giros de F = ${f.F} N`);
        for (let i = 0; i < n && target && !target.dead; i++) {
          await this.heroLunge();
          await this.hitEnemy(target, f.F);
        }
        break;
      }
      case 'resorte':
        this.gainBlock(st.block ?? 8);
        this.resorteQ = 0;
        this.resorteMul = st.extra ?? 1.5;
        this.calc(`Resorte Comprimido: +${st.block} de Bloqueo; guardará el daño que recibas`);
        break;
      case 'dolorResonante': {
        if (target) target.st.resonancia += 2;
        this.calc(`Dolor Resonante: el ritmo justo… todos detonan su Resonancia (${st.extra} por carga)`);
        this.cameras.main.shake(400, 0.01);
        for (const e of [...this.alive()]) {
          const n = e.st.resonancia;
          if (!n) continue;
          e.st.resonancia = 0;
          this.floatText(e.baseX, 150, `¡${n} cargas!`, '#9ad8f0');
          await this.hitEnemy(e, n * (st.extra ?? 7), true, 'res');
        }
        break;
      }
      case 'honda': {
        const vv = this.hondaV.get(inst.uid) ?? (st.extra ?? 4);
        const K = Math.round(0.5 * (st.m ?? 2) * vv * vv);
        this.hondaV.delete(inst.uid);
        this.calc(`Honda de David: K = ½·${st.m}·${vv}² = ${K}`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, K);
        break;
      }
      case 'fuegoAmigo':
        this.fuegoAmigo = true;
        this.calc('Fuego Amigo: precesión → los golpes enemigos se desvían hacia otro enemigo este turno');
        break;
      case 'trinity': {
        // Oppenheimer: se consume PARA SIEMPRE
        const run = Game.run!;
        run.deck = run.deck.filter((x) => x.uid !== inst.uid);
        this.exhaust = this.exhaust.filter((x) => x !== inst);
        this.calc('Trinity: E = mc² → una fracción de gramo se vuelve energía');
        this.cameras.main.flash(900, 255, 250, 230);
        this.cameras.main.shake(900, 0.025);
        audio.sfx('defeat');
        const fl = this.add.circle(W / 2 + 120, 260, 30, 0xfff2c0, 0.9).setDepth(800).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: fl, scale: 18, alpha: 0, duration: 1400, onComplete: () => fl.destroy() });
        await this.wait(700);
        for (const t of [...this.alive()]) {
          if (JEFES.includes(t.st.def.id)) {
            const dmg = Math.ceil(t.st.hp * (st.extra ?? 30) / 100);
            this.calc(`${t.st.def.name} resiste la onda: −${dmg}`);
            await this.hitEnemy(t, dmg, true, 'res');
          } else await this.killEnemy(t);
        }
        logEvent('trinity', '', true, { piso: this.floor });
        if (!(await this.radiate(10, 'Trinity'))) return;
        break;
      }
      case 'golpe':
      case 'embestida':
      case 'fuerzaNeta': {
        const f = force(st, c);
        this.calc(`${def.name}: F = ${r1(f.m)} kg × ${r1(f.a)} m/s² = ${f.F} N`);
        await this.heroLunge();
        const stopped = target ? await this.hitEnemy(target, f.F) : false;
        if (def.id === 'embestida') {
          const rec = Math.floor(f.F / 4);
          if (rec > 0) {
            this.calc(`3ª ley → retroceso: ¼·${f.F} N = ${rec} N sobre ti`);
            await this.hurtPlayer(rec, null);
          }
        }
        if (def.id === 'fuerzaNeta' && stopped) {
          this.energy += 1;
          this.calc('¡Lo detuviste con fuerza neta! +1 J');
        }
        break;
      }
      case 'tajo': {
        const f = force(st, c);
        if ((v as any).angle0 === false) {
          const Fc = Math.round(f.F * 0.5);
          this.calc(`Tajo: F·cos60° = ${f.F} N × 0.5 = ${Fc} N a todos`);
          await this.heroLunge();
          for (const e of this.alive()) await this.hitEnemy(e, Fc, false, 60);
        } else {
          this.calc(`Tajo: F·cos0° = ${f.F} N × 1 = ${f.F} N`);
          await this.heroLunge();
          if (target) await this.hitEnemy(target, f.F);
        }
        break;
      }
      case 'pesoMuerto': {
        const m = (st.m ?? 0) + this.masa;
        const Wt = Math.round(m * this.grav.g);
        this.calc(`Peso Muerto en ${this.grav.name}: W = ${r1(m)} kg × ${this.grav.g} m/s² = ${Wt} N (ignora Bloqueo)`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, Wt, true);
        break;
      }
      case 'normal':
      case 'accion':
      case 'inerciaDef': {
        this.gainBlock(st.block!);
        this.calc(`${def.name}: +${st.block} de Bloqueo`);
        if (def.id === 'accion') this.reflect = true;
        if (def.id === 'inerciaDef') this.keepBlock = true;
        break;
      }
      case 'equilibrio': {
        const inc = this.alive().reduce((s, e) => {
          const i = e.st.intent;
          if (i.kind === 'attack') return s + i.dmg * (i.hits ?? 1);
          if (i.kind === 'block') return s + (i.dmg ?? 0);
          return s;
        }, 0);
        const b = Math.min(inc, st.extra!);
        this.gainBlock(b);
        this.calc(`ΣF = 0: fuerza entrante ${inc} N → +${b} de Bloqueo`);
        break;
      }
      case 'entropia_udem': {
        // el desorden aumenta: el descarte vuelve revuelto al mazo
        const n = this.discard.length;
        this.draw.push(...this.discard.splice(0));
        Phaser.Utils.Array.Shuffle(this.draw);
        this.calc(`La Entropía: ΔS ≥ 0 → ${n} cartas del descarte vuelven revueltas al mazo; robas ${st.extra}`);
        this.drawCards(st.extra!);
        break;
      }
      case 'carrera': {
        const vv = boonLevel('c_visviva');
        this.acel += st.extra! + vv;
        this.calc(`Carrera: +${st.extra! + vv} m/s²${vv ? ' (Vis Viva)' : ''} → cada ataque gana +${st.extra! + vv} × m N`);
        this.drawCards(1);
        break;
      }
      case 'segunda': {
        const vv = boonLevel('c_visviva');
        this.acel += st.extra! + vv;
        this.calc(`Segunda Ley: +${st.extra! + vv} m/s² este turno${vv ? ' (Vis Viva)' : ''}`);
        break;
      }
      case 'forja':
        this.masa += st.extra!;
        this.calc(`Forja Pesada: +${st.extra} kg a tus armas (masa total extra: ${this.masa} kg)`);
        break;

      // ── Caballero (nuevas) ──
      case 'martillo': {
        const f = force(st, c);
        this.calc(`Martillo: F = ${r1(f.m)} kg × ${r1(f.a)} m/s² = ${f.F} N + 1 Fatiga`);
        await this.heroLunge();
        if (target) {
          await this.hitEnemy(target, f.F);
          if (!target.dead) { target.st.fatiga += 1; this.refreshEnemy(target); }
        }
        break;
      }
      case 'muroMasa': {
        const b = st.block! + 3 * Math.max(0, this.masa);
        this.gainBlock(b);
        this.calc(`Muro de Masa: ${st.block} + 3×${Math.max(0, this.masa)} kg = ${b} de Bloqueo`);
        break;
      }

      // ── Neutrales ──
      case 'almacenada':
        this.energy += st.extra!;
        this.calc(`Energía Almacenada: U → trabajo útil, +${st.extra} J`);
        break;
      case 'bateria':
        this.jPerTurn += 1;
        this.calc('Batería de Resorte: +1 J al inicio de cada turno');
        break;
      case 'potencia':
        this.energy += st.extra! + 1;
        this.calc(`Potencia: P = W/t → +${st.extra! + 1} J y robas ${st.extra}`);
        this.drawCards(st.extra!);
        break;
      case 'diagrama':
        this.drawCards(2);
        if (this.hand.length) {
          this.discardMode = 1;
          this.endBtn.setEnabled(false);
          this.tweens.killTweensOf(this.hintT);
          this.hintT.setText('Diagrama de Cuerpo Libre: elige 1 carta para descartar').setAlpha(1);
        }
        break;
      case 'rebote': {
        const dmg = this.block;
        this.calc(`Rebote Elástico: tu Bloqueo (${dmg}) regresa como daño`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, dmg);
        break;
      }
      case 'friccionArd':
        if (target) {
          target.st.calor += st.extra!;
          this.burst(target.baseX, 260, 0xc87533, 16);
          this.calc(`Fricción Ardiente: el trabajo de la fricción se vuelve calor (+${st.extra})`);
          this.refreshEnemy(target);
        }
        break;
      case 'frecuencia':
        await this.heroLunge();
        if (target) {
          await this.hitEnemy(target, st.block ?? 3);
          if (!target.dead) await this.addResonance(target, st.extra!);
        }
        break;
      case 'fatigaMat':
        if (target) {
          target.st.fatiga += st.extra!;
          this.calc(`Fatiga del Material: recibe +50 % de daño por ${target.st.fatiga} turno(s)`);
          this.refreshEnemy(target);
        }
        break;
      case 'conservacion': {
        const b = st.extra! * this.energy;
        this.gainBlock(b);
        this.calc(`Conservación: ${this.energy} J sin usar × ${st.extra} = ${b} de Bloqueo`);
        break;
      }
      case 'amortiguador':
        this.gainBlock(st.block!);
        this.calc(`Amortiguador: +${st.block} de Bloqueo`);
        break;
      case 'lodoCarta':
        this.calc('Lodo Pegajoso: gastaste energía sin avanzar.');
        break;

      // ── Arcanista Cinético ──
      case 'proyectil':
      case 'choque': {
        const k = kinetic(st, c);
        this.calc(`${def.name}: K = ½·${r1(k.m)} kg·(${k.v} m/s)² = ${k.K} J`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, k.K);
        if (def.id === 'proyectil') this.vel = Math.max(0, this.vel - 1);
        break;
      }
      case 'rafaga': {
        const k = kinetic(st, c);
        this.calc(`Ráfaga: K = ½·${r1(k.m)}·${k.v}² = ${k.K} J a todos`);
        await this.heroLunge();
        for (const e of this.alive()) await this.hitEnemy(e, k.K);
        this.vel = Math.max(0, this.vel - 2);
        break;
      }
      case 'escudoE':
        this.gainBlock(st.block!);
        this.calc(`Escudo de Energía: +${st.block} de Bloqueo`);
        break;
      case 'acelerar': {
        const vv = boonLevel('c_visviva');
        const before = this.vel;
        this.vel = Math.min(this.vmax, this.vel + st.extra! + vv);
        this.calc(`Acelerar: v ${before} → ${this.vel} m/s (K crece ×${before ? r1((this.vel * this.vel) / (before * before)) : '∞'})`);
        this.drawCards(1);
        break;
      }
      case 'frenado': {
        const v = this.vel, v2 = Math.max(0, v - 2), m = st.m ?? 1;
        const b = Math.round(0.5 * m * (v * v - v2 * v2));
        this.vel = v2;
        this.gainBlock(b);
        this.calc(`Frenado: ΔK = ½·${m}·(${v}² − ${v2}²) = ${b} → Bloqueo`);
        break;
      }
      case 'impulsoCte':
        this.velPerTurn += 1;
        this.calc('Impulso Constante: +1 m/s cada turno (fuerza constante → aceleración constante)');
        break;
      case 'ondaCalor':
        for (const e of this.alive()) {
          e.st.calor += st.extra!;
          this.burst(e.baseX, 260, 0xc87533, 10);
          this.refreshEnemy(e);
        }
        this.calc(`Onda de Calor: +${st.extra} de Calor a todos`);
        break;
      case 'visVivaA':
        this.vel = Math.min(this.vmax, this.vel * 2);
        this.calc(`Vis Viva: duplicas v → ${this.vel} m/s, ¡K se cuadruplica!`);
        break;
      case 'barrera': {
        const b = Math.round(st.extra! * this.vel);
        this.gainBlock(b);
        this.calc(`Barrera Inercial: ${st.extra}·v = ${st.extra}·${this.vel} = ${b} de Bloqueo`);
        break;
      }
      // ── Arcanista (v0.7) ──
      case 'chispa': {
        const k = kinetic(st, c);
        this.calc(`Chispa: K = ½·${r1(k.m)}·${k.v}² = ${k.K} J, luego +1 m/s`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, k.K);
        this.vel = Math.min(this.vmax, this.vel + 1);
        break;
      }
      case 'picada': {
        const h = st.extra ?? 0.5;
        const dv = Math.floor(Math.sqrt(2 * this.grav.g * h));
        const before = this.vel;
        this.vel = Math.min(this.vmax, this.vel + dv);
        this.calc(`Picada: v = √(2·${this.grav.g}·${h}) ≈ ${dv} m/s → v ${before} → ${this.vel}`);
        break;
      }
      case 'torbellino': {
        const k = kinetic(st, c);
        this.calc(`Torbellino: 3 × K = 3 × ½·${r1(k.m)}·${k.v}² = 3 × ${k.K}`);
        for (let i = 0; i < 3 && target && !target.dead; i++) {
          await this.heroLunge();
          await this.hitEnemy(target, k.K);
        }
        break;
      }
      case 'cometa': {
        const k = kinetic(st, c);
        this.calc(`Cometa: K = ½·${r1(k.m)}·${k.v}² = ${k.K} J… y quedas en reposo`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, k.K);
        this.vel = 0;
        break;
      }
      case 'estela':
        this.estela = true;
        this.calc('Estela Cinética: cada ataque te dará +1 m/s');
        break;
      case 'sinFriccion':
        this.noFric = true;
        this.friccion = 0;
        this.vel = Math.min(this.vmax, this.vel + (st.extra ?? 1));
        this.calc(`Superficie Sin Fricción: μ = 0, +${st.extra} m/s`);
        break;

      // ── Acto III: impulso y cantidad de movimiento ──
      case 'impulsoSost':
        if (target) {
          const F = st.block ?? 4;
          this.calc(`Impulso Sostenido: F = ${F} N durante 3 turnos → I = F·Δt = ${F * 3} N·s`);
          await this.heroLunge();
          await this.hitEnemy(target, F);
          if (!target.dead) {
            target.st.impulso = Math.max(target.st.impulso, F);
            target.st.impulsoLeft = 2;
            this.refreshEnemy(target);
          }
        }
        break;
      case 'choquePlastico':
        if (target) {
          this.calc(`Choque Plástico (e = 0): ${st.block} de daño y pierde su cantidad de movimiento`);
          await this.heroLunge();
          const hadInertia = target.st.inercia > 0 || target.st.carga > 0;
          await this.hitEnemy(target, st.block ?? 9);
          if (!target.dead && target.st.def.umbral && hadInertia && !target.st.detenido) {
            target.st.inercia = 0;
            target.st.carga = 0;
            target.st.detenido = true;
            target.st.stunned = 1;
            target.st.intent = { kind: 'stunned' };
            this.floatText(target.baseX, 140, T.combate.detenido, CSS.gold);
            this.calc('e = 0: quedan juntos, sin rebote → ¡DETENIDO!');
            audio.sfx('stop');
            this.refreshEnemy(target);
          }
        }
        break;
      case 'restitucion':
        this.gainBlock(st.block ?? 5);
        this.restE = st.extra ?? 0.6;
        this.calc(`Restitución: +${st.block} de Bloqueo; los golpes rebotan con e = ${this.restE}`);
        break;
      case 'conservP':
        if (target) {
          const b = target.st.block;
          target.st.block = 0;
          if (b > 0) this.gainBlock(b);
          this.beam(target, 0x9ad8f0);
          this.calc(`Conservación de p: ${b} de Bloqueo pasa del enemigo a ti`);
          this.refreshEnemy(target);
        }
        break;
      case 'retroceso':
        this.calc(`Retroceso: ${st.block} de daño; m·v del disparo te empuja → +${st.extra} de Bloqueo`);
        await this.heroLunge();
        if (target) await this.hitEnemy(target, st.block ?? 8);
        this.gainBlock(st.extra ?? 4);
        break;
      case 'impulsoAng': {
        const dmg = (st.block ?? 4) + 2 * this.played;
        this.calc(`Impulso Angular: M·t = ${st.block} + 2×${this.played} cartas = ${dmg} a todos`);
        await this.heroLunge();
        for (const e of this.alive()) await this.hitEnemy(e, dmg);
        break;
      }
      // ── desbloqueables ──
      case 'metabolismo':
        Game.run!.hp -= st.extra ?? 3;
        this.energy += 2;
        this.floatText(this.heroX, 200, `-${st.extra}`, '#d08080');
        this.calc(`Metabolismo Forzado: −${st.extra} de vida → +2 J`);
        break;
      case 'torbellinoAcero': {
        const n = this.energy;
        this.energy = 0;
        const f = force(st, this.ctx());
        this.calc(`Torbellino de Acero: ${n} J → ${n} golpes de F = ${f.F} N a todos`);
        for (let i = 0; i < n && this.alive().length; i++) {
          await this.heroLunge();
          for (const e of this.alive()) await this.hitEnemy(e, f.F);
        }
        break;
      }
      // ── cartas de cálculo (tras vencer a AM) ──
      case 'derivada': {
        const ya = Math.max(0, this.attacksTurn);
        this.derivadaBono = Math.max(st.extra! * 2, st.extra! * ya);
        this.drawCards(1);
        this.calc(`Derivada: ${ya} ataque(s) este turno → tu siguiente ataque gana +${this.derivadaBono}`);
        break;
      }
      case 'integral':
        await this.heroLunge();
        if (target) {
          const total = Math.min(st.extra!, this.danoTurno);
          this.calc(`Integral: ∫ daño dt de este turno = ${this.danoTurno}${this.danoTurno > st.extra! ? ` (máx. ${st.extra})` : ''}`);
          if (total > 0) await this.hitEnemy(target, total);
          else this.calc('Integral: aún no has hecho daño este turno… el área bajo la curva es 0.');
        }
        break;
      case 'limite':
        await this.heroLunge();
        if (target) {
          const jefe = target.st.def.id === 'am' || target.st.def.id === 'hibbelerius' || this.kind === 'boss';
          const umbral = jefe ? 10 : st.extra!;
          if (target.st.hp <= target.st.maxHp * umbral / 100) {
            this.calc(`Límite: vida ≤ ${umbral} % → lím vida = 0`);
            await this.hitEnemy(target, target.st.hp + target.st.block, true, 'res');
          } else {
            await this.hitEnemy(target, limiteDano(st.extra!));
            if (!target.dead) { target.st.fatiga += 1; this.refreshEnemy(target); }
            this.calc(`Límite: aún le queda más de ${umbral} % de vida → ${limiteDano(st.extra!)} de daño y Fatiga 1`);
          }
        }
        break;
      case 'palanca':
        this.palanca = true;
        this.calc('Palanca de Arquímedes: tu siguiente ataque hará el doble (M = F·d)');
        break;
      case 'inerciaPura':
        this.masaDef = true;
        this.calc('Masa Inamovible: cada Defensa te dará +1 kg');
        break;
      case 'resistencia':
        this.blockPerTurn += st.block ?? 3;
        this.calc(`Resistencia del Material: +${st.block} de Bloqueo cada turno`);
        break;
      case 'sobreimpulso':
        Game.run!.hp -= 3;
        this.vel = Math.min(this.vmax, this.vel + (st.extra ?? 3));
        this.floatText(this.heroX, 200, '-3', '#d08080');
        this.calc(`Postcombustión: −3 de vida → v = ${this.vel} m/s`);
        break;
      case 'orbita':
        this.orbit = Math.max(this.orbit, st.m ?? 0.6);
        this.calc('Órbita Cerrada: un satélite golpeará cada turno');
        break;
      case 'doppler': {
        const k = kinetic(st, c);
        const all = this.vel >= 6;
        this.calc(`Efecto Doppler: K = ${k.K}${all ? ' a TODOS (v ≥ 6)' : ''}`);
        await this.heroLunge();
        if (all) for (const e of this.alive()) await this.hitEnemy(e, k.K);
        else if (target) await this.hitEnemy(target, k.K);
        break;
      }
      case 'tunel':
        this.pierce = true;
        this.calc('Efecto Túnel: tus ataques atraviesan el Bloqueo este turno');
        break;
      case 'singularidad': {
        const k = kinetic(st, c);
        this.calc(`Singularidad: K = ½·${r1(k.m)}·${k.v}² = ${k.K} a TODOS… y quedas en reposo`);
        await this.heroLunge();
        this.cameras.main.flash(250, 160, 120, 255);
        for (const e of this.alive()) await this.hitEnemy(e, k.K);
        this.vel = 0;
        break;
      }
      case 'apuntes':
        this.calc('Apuntes del Profe: robas 3');
        this.drawCards(3);
        break;
      case 'cafe':
        this.energy += st.extra ?? 2;
        this.drawCards(1);
        this.addStatus({ id: 'ruido', n: 1, to: 'discard' });
        this.calc(`Café de Laboratorio: +${st.extra} J… y el bajón llegará`);
        break;
      case 'entropia':
        this.entropia += 1;
        this.calc('Entropía: cada turno −1 vida, +1 J');
        break;
      case 'formulario':
        this.extraDraw += 1;
        this.calc('Formulario: robas 1 carta más cada turno');
        break;

      case 'tarea':
        this.calc('Entregas la tarea. «Gracias.» — Hibbelerius');
        break;

      case 'sobrecarga':
        this.energy += st.extra!;
        this.vel = Math.max(0, this.vel - 1);
        this.calc(`Sobrecarga: +${st.extra} J a cambio de 1 m/s`);
        break;
    }
    this.acel -= plano;
    if (planoV) this.vel = Math.max(0, this.vel - planoV);
    this.played++;
    const can = this.diente('canino');
    if (can && (this.played - this.jugadasIni) % 3 === 0) { this.energy += can; this.calc(`Canino Giratorio: 3 cartas este turno → +${can} J`); }
    if (this.hemorragia > 0 && Game.run!.hp > 0) {
      Game.run!.hp -= 1;
      this.floatText(this.heroX, 200, '-1 🩸', '#e05050');
      if (Game.run!.hp <= 0 && (await this.dies('la Hemorragia'))) return;
    }
    // Noether · Simetría de Rotación
    const yr = boonLevel('y_rotacion');
    if (yr && this.played % (yr === 2 ? 2 : 3) === 0) {
      this.calc('Simetría de Rotación (Noether): se conserva L → robas 1 carta');
      this.drawCards(1);
    }
    if (this.estela && def.type === 'Ataque') {
      this.vel = Math.min(this.vmax, this.vel + 1);
      this.calc(`Estela Cinética: +1 m/s (v = ${this.vel})`);
    }
    this.polonio = 0;
    this.mult = 1;
    this.curAll = false;
    if (def.type !== 'Ataque' && Game.run?.modo === 'abismo') this.dientesNoAtaque(def);
    if (def.type === 'Defensa' && this.jefeVivo('yig')) {
      // v0.51 · Yig: cada Defensa despierta a una serpiente
      const run = Game.run!;
      run.hp = Math.max(1, run.hp - 2);
      this.calc('Yig: una serpiente te muerde al defenderte (−2 de vida)');
      this.floatText(this.heroX, 200, '−2 🐍', '#9af07a');
      this.hud.refresh();
    }
    if (ed && def.type !== 'Ataque') {
      if (ed === 'lamina') { this.gainBlock(4); this.calc('Lámina: +4 de Bloqueo'); }
      if (ed === 'poli') { this.drawCards(1); this.calc('Polícroma: robas 1'); }
      if (ed === 'cristal') { this.gainBlock(10); this.calc('Cristal: +10 de Bloqueo'); }
    }
    this.cartaTipo = ''; // v0.48: la carta ya se resolvió
    if (ed === 'cristal') {
      const rompe = Math.random() < ROMPER_CRISTAL;
      await this.animarCristal(inst, rompe);
      if (!rompe) this.calc(`El Cristal resiste… por ahora (${def.name})`);
      else {
        // frágil: esta vez se rompe y la carta sale de tu mazo para siempre (1 de cada 4)
        const run = Game.run!;
        run.deck = run.deck.filter((x) => x.uid !== inst.uid);
        (run.cristalesRotos ??= []).push(inst.id);
        this.discard = this.discard.filter((x) => x !== inst);
        this.exhaust = this.exhaust.filter((x) => x !== inst);
        this.calc(`¡El Cristal se rompe! ${def.name} sale de tu mazo para siempre`);
      }
    }
    if (this.masaDef && def.type === 'Defensa') {
      this.masa += 1;
      this.calc(`Masa Inamovible: +1 kg (masa extra: ${this.masa} kg)`);
    }
    // Einstein · Efecto Fotoeléctrico: cada Habilidad lanza un fotón
    const fot = boonLevel('e_foton');
    if (fot && def.type === 'Habilidad' && this.alive().length) {
      const t = Phaser.Utils.Array.GetRandom(this.alive());
      const dmg = fot === 2 ? 7 : 4;
      this.calc(`Efecto Fotoeléctrico (Einstein): un fotón arranca ${dmg} de vida`);
      this.beam(t, 0xfff2a0);
      await this.hitEnemy(t, dmg, true, 'res');
      if (!(await this.radiate(1, 'fotón'))) return;
    }
    const tb = boonLevel('t_bobina');
    if (tb && def.type === 'Ataque' && this.alive().length) {
      const dmg = tb === 2 ? 4 : 2;
      this.calc(`Bobina de Tesla: un arco eléctrico salta a todos (${dmg})`);
      await this.rayoTodos(dmg);
    }
    if (Game.run!.hp <= 0 && (await this.dies('tu propio esfuerzo'))) return;
    if (pol && def.type === 'Ataque' && !(await this.radiate(1, 'polonio'))) return;
    this.refreshPlayer();
    this.layoutHand();
    this.busy = false;
    void this.dealK;
    await this.checkEnd();
  }

  /** Newton · La Manzana: cae sobre cada enemigo al iniciar el combate */
  private async newtonApple() {
    const lvl = boonLevel('n_manzana');
    if (!lvl) return;
    const W1 = Math.round(lvl * this.grav.g);
    this.calc(`La Manzana (Newton): W = ${lvl} kg × ${this.grav.g} m/s² ≈ ${W1} N a cada enemigo`);
    for (const ev of this.alive()) {
      const a = this.add.image(ev.baseX, 60, 'i_apple').setScale(3).setDepth(600);
      await new Promise<void>((r) => this.tweens.add({ targets: a, y: 240, duration: 420, ease: 'Quad.in', onComplete: () => { a.destroy(); r(); } }));
      await this.hitEnemy(ev, W1, true);
    }
  }

  private gainBlock(n: number) {
    if (this.condJefe === 'sinDefensa' && this.cartaTipo === 'Defensa' && n > 0) {
      this.calc('SIN DEFENSA: esta carta no da Bloqueo en esta pelea');
      this.floatText(this.heroX, 220, 'Sin Defensa', '#ff9aa8');
      return;
    }
    if (this.jefeVivo('dagon') && this.turn % 3 === 0 && n > 0) {
      n = Math.floor(n / 2);
      this.calc(`MAREA ALTA (Padre Dagón): tu Bloqueo da la mitad (${n})`);
    }
    this.block += n;
    audio.sfx('block');
    const t = txt(this, this.heroX, 220, `+${n} 🛡`, 30, CSS.block).setOrigin(0.5).setDepth(700);
    this.tweens.add({ targets: t, y: 180, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  private async heroLunge() {
    await new Promise<void>((r) => this.tweens.add({ targets: this.hero, x: this.heroX + 60, duration: 90, yoyo: true, ease: 'Quad.out', onComplete: () => r() }));
  }

  /** Aplica una fuerza a un enemigo. Devuelve true si lo detuvo. */
  private async hitEnemy(ev: EnemyView, F: number, ignoreBlock = false, kind: number | 'golpe' | 'calor' | 'res' = 'golpe'): Promise<boolean> {
    if (ev.dead) return false;
    const st = ev.st;
    if (this.polonio && kind !== 'calor' && kind !== 'res') F += this.polonio;
    const cardHit = kind === 'golpe' || typeof kind === 'number';
    if (cardHit && st.def.hueco && this.curAll) {
      F = Math.round(F / 2);
      this.calc(`${st.def.name}: área negativa → el golpe a todos le hace la mitad`);
    }
    if (cardHit && this.mult !== 1) F = Math.round(F * this.mult);
    if (cardHit && this.radianes) F = Math.round(F * 0.6); // v0.57 · ¡estaba en radianes!
    const ttest = boonLevel('tu_test');
    if (cardHit && ttest && st.def.act === 4) F += ttest === 2 ? 6 : 3; // Test de Turing: contra autómatas y AM
    if (cardHit && this.pierce) ignoreBlock = true;
    if (st.def.thorns && (kind === 'golpe' || typeof kind === 'number')) {
      this.calc(`Púas: el golpe te regresa ${st.def.thorns} (3ª ley)`);
      this.time.delayedCall(10, () => this.hurtPlayer(st.def.thorns!, null));
    }
    let dmg = F;
    if (st.detenido) dmg = Math.round(dmg * 1.5);
    if (st.fatiga > 0 && kind !== 'calor') dmg = Math.round(dmg * 1.5);
    let absorbed = 0;
    if (!ignoreBlock) {
      absorbed = Math.min(st.block, dmg);
      st.block -= absorbed;
      dmg -= absorbed;
    }
    st.hp -= dmg;
    if (dmg > 0) st.recibido = (st.recibido ?? 0) + dmg;
    if (cardHit && st.def.vuelco && st.hp > 0) {
      const n = (this.golpesTurno.get(st) ?? 0) + 1;
      this.golpesTurno.set(st, n);
      if (n === 2 && st.stunned === 0) {
        st.stunned = 1;
        st.intent = { kind: 'stunned' };
        this.calc(`${st.def.name}: su centro de masa sale de la base → ¡se VUELCA!`);
        this.floatText(ev.baseX, 140, '¡Volcado!', CSS.gold);
      }
    }
    if (dmg > 0) this.danoTurno += dmg;
    // efectos
    ev.sprite.setTintFill(0xffffff);
    this.time.delayedCall(80, () => ev.sprite.clearTint());
    this.tweens.add({ targets: ev.root, x: ev.baseX + 14, duration: 50, yoyo: true, repeat: 1 });
    this.burst(ev.baseX, 280, kind === 'calor' ? 0xc87533 : 0xb8b0c8, 12);
    audio.sfx('hit');
    if (F >= 12) this.cameras.main.shake(140, 0.005);
    const t = txt(this, ev.baseX + Phaser.Math.Between(-20, 20), 230, `${dmg}`, 40, '#f0d090').setOrigin(0.5).setDepth(700).setStroke('#000', 5);
    if (absorbed) txt(this, ev.baseX + 40, 250, `(🛡${absorbed})`, 22, CSS.block).setOrigin(0.5).setDepth(700).setAlpha(0.9).setData('tmp', 1);
    this.tweens.add({ targets: t, y: 170, alpha: 0, duration: 900, onComplete: () => t.destroy() });

    let stopped = false;
    const umbral = umbralDe(st);
    if (umbral && !st.detenido && st.hp > 0 && kind !== 'calor' && kind !== 'res') {
      if (F >= umbral && (st.imparableT ?? 0) > 0) {
        // v0.49 · IMPARABLE por unos turnos después de que lo detuviste
        this.calc(`F = ${F} N ≥ ${umbral} N… pero ${st.def.name} sigue IMPARABLE (${st.imparableT} turno(s)): no se detiene`);
        this.floatText(ev.baseX, 140, '¡IMPARABLE!', '#ff7a5a');
      } else if (F >= umbral) {
        stopped = true;
        st.detenido = true;
        st.stunned = 1;
        if (st.def.imparable) st.imparableT = st.def.imparable + 1; // +1: el turno que pierde detenido
        st.inercia = 0;
        if (st.carga) this.calc(`Al detenerlo pierde todo su impulso acumulado (${st.carga})`);
        st.carga = 0;
        st.intent = { kind: 'stunned' };
        this.calc(`1ª ley: F = ${F} N ≥ ${umbral} N → ¡${st.def.name} DETENIDO!`);
        this.floatText(ev.baseX, 140, T.combate.detenido, CSS.gold);
        audio.sfx('stop');
        logEvent('detener', '1a ley', true, { enemigo: st.def.id, F, umbral });
        if (this.hibbelerM) { this.block += this.hibbelerM; this.calc(`El Hibbeler Maldito: «¡Así se aplica la 1ª ley!» +${this.hibbelerM} de Bloqueo`); this.time.delayedCall(80, () => this.hablar('Hibbeler', Phaser.Utils.Array.GetRandom(['¡Así se aplica la 1ª ley!', 'Página 47. Te lo dije.', 'Eso sí viene en el examen.']), this.heroX + 40, 170)); }
        if (this.necroDin) { this.energy += 1; this.time.delayedCall(50, () => this.drawCards(1)); this.calc('Necronomicón de Dinámica: +1 J y robas 1'); }
        this.encargo(completarEncargo('detener'));
        // los jefes aprenden: la próxima vez necesitarás más fuerza para detenerlos
        if (JEFES.includes(st.def.id)) {
          st.umbralMul = (st.umbralMul ?? 1) * UMBRAL_JEFE_MUL;
          this.calc(`${st.def.name} se adapta: la próxima vez necesitarás F ≥ ${umbralDe(st)} N`);
        }
      } else if (F >= umbral * 0.6) {
        this.hint(`Necesitas F ≥ ${umbral} N en un solo golpe para detenerlo (tienes ${F} N).`);
      }
    }
    // fase 2 del jefe
    if (st.def.id === 'colossus' && !st.phase2 && st.hp <= st.maxHp / 2 && st.hp > 0) {
      st.phase2 = true;
      this.floatText(ev.baseX, 110, '¡Gana masa! Umbral 18 N', '#e0a070');
      this.calc('El Coloso absorbe piedra: más masa → necesitas más fuerza para detenerlo.');
    }
    if (st.def.id === 'bruja' && !st.phase2 && st.hp <= st.maxHp / 2 && st.hp > 0) {
      st.phase2 = true;
      this.floatText(ev.baseX, 110, 'μ máximo: sus golpes crecen', '#9bf07a');
      this.calc('La Bruja aumenta el coeficiente de fricción: sus ataques ganan +4.');
    }
    if (st.def.id === 'hibbelerius' && st.hp > 0) {
      if (!st.phase2 && st.hp <= st.maxHp * 0.66) {
        st.phase2 = true;
        this.hibPhase(ev, 'Capítulo 14 · Trabajo y energía', '«¿Creías que bastaba con F = m·a? Pasemos a la energía.»');
      } else if (st.phase2 && !st.phase3 && st.hp <= st.maxHp * 0.33) {
        st.phase3 = true;
        st.carga = 0;
        this.hibPhase(ev, 'Capítulo 15 · Impulso', '«Último capítulo. DETENME antes de que suelte mi impulso.»');
      }
    }
    if (st.def.id === 'am' && st.hp > 0) {
      if (!st.phase2 && st.hp <= st.maxHp * 0.66) {
        st.phase2 = true;
        st.inercia = 0;
        this.hibPhase(ev, 'Fase II · Derivada', '«Mi odio no es constante: crece. d(odio)/dt > 0. DETENME y vuelve a empezar.»', 'AM se reprograma');
      } else if (st.phase2 && !st.phase3 && st.hp <= st.maxHp * 0.33) {
        st.phase3 = true;
        this.hibPhase(ev, 'Fase III · Integral', `«Llevo la cuenta de cada golpe: ${st.recibido ?? 0} de daño. Te lo voy a devolver, integrado.»`, 'AM se reprograma');
      }
    }
    const overkill = st.hp < 0 ? -st.hp : 0;
    if (st.hp <= 0) {
      await this.killEnemy(ev);
      // Noether · Simetría en el Espacio: el daño sobrante se transfiere
      const ys = boonLevel('y_espacio');
      const others = this.alive();
      if (ys && overkill > 0 && others.length) {
        const t = Phaser.Utils.Array.GetRandom(others);
        const pass = Math.round(overkill * (ys === 2 ? 1.5 : 1));
        this.calc(`Simetría en el Espacio (Noether): ${pass} de daño sobrante pasa a ${t.st.def.name}`);
        this.beam(t, 0x9ad8f0);
        await this.hitEnemy(t, pass, true, 'res');
      }
    } else this.refreshEnemy(ev);
    await this.wait(160);
    this.children.list.filter((o) => o.getData && o.getData('tmp')).forEach((o) => this.tweens.add({ targets: o, alpha: 0, duration: 400, onComplete: () => o.destroy() }));
    return stopped;
  }

  /**
   * v0.44 · La carta de Cristal se muestra grande en el centro: si resiste, brilla;
   * si se rompe, se agrieta y estalla en pedazos (se toma su tiempo para que se entienda qué pasó).
   */
  private async animarCristal(inst: CardInst, rompe: boolean) {
    const def = CARDS[inst.id];
    const v = cardView(this, W / 2, 250, inst).setDepth(870).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: v, alpha: 1, scale: 1.05, duration: 260, ease: 'Back.out' });
    const fondo = this.add.rectangle(0, 0, W, H, 0x000000, 0).setOrigin(0).setDepth(865);
    this.tweens.add({ targets: fondo, fillAlpha: 0.55, duration: 220 });
    await this.wait(450);
    if (!rompe) {
      const t = txt(this, W / 2, 392, '💎 El Cristal resiste', 30, '#c8f4ff').setOrigin(0.5).setDepth(880).setStroke('#000', 5);
      this.tweens.add({ targets: v, angle: { from: -3, to: 3 }, duration: 80, yoyo: true, repeat: 3 });
      await this.wait(900);
      this.tweens.add({ targets: [v, t, fondo], alpha: 0, duration: 250, onComplete: () => { v.destroy(); t.destroy(); fondo.destroy(); } });
      return;
    }
    // grietas que crecen
    const gr = this.add.graphics().setDepth(875);
    const rayas = Array.from({ length: 7 }, () => ({ a: Math.random() * Math.PI * 2, l: 40 + Math.random() * 60 }));
    const k = { t: 0 };
    audio.sfx('hit');
    this.tweens.add({ targets: k, t: 1, duration: 600, onUpdate: () => {
      gr.clear().lineStyle(3, 0xffffff, 0.95);
      for (const r of rayas) gr.lineBetween(W / 2, 250, W / 2 + Math.cos(r.a) * r.l * k.t, 250 + Math.sin(r.a) * r.l * k.t);
    } });
    this.tweens.add({ targets: v, x: W / 2 + 4, duration: 40, yoyo: true, repeat: 7 });
    await this.wait(750);
    // estalla
    gr.destroy();
    v.destroy();
    this.cameras.main.flash(250, 230, 250, 255);
    this.cameras.main.shake(250, 0.01);
    this.burst(W / 2, 250, 0xe8fbff, 50);
    for (let i = 0; i < 14; i++) {
      const p = this.add.rectangle(W / 2 + Phaser.Math.Between(-60, 60), 250 + Phaser.Math.Between(-80, 80), Phaser.Math.Between(8, 22), Phaser.Math.Between(8, 22), 0xc8f4ff, 0.85).setDepth(876).setAngle(Phaser.Math.Between(0, 90));
      this.tweens.add({ targets: p, x: p.x + Phaser.Math.Between(-220, 220), y: p.y + Phaser.Math.Between(80, 260), angle: p.angle + 360, alpha: 0, duration: 1100, onComplete: () => p.destroy() });
    }
    const t = txt(this, W / 2, 236, '¡SE ROMPIÓ!', 52, '#e8fbff').setOrigin(0.5).setDepth(880).setStroke('#1a4a6a', 7);
    const st = txt(this, W / 2, 290, `${def.name} (Cristal) sale de tu mazo para siempre`, 22, CSS.bone).setOrigin(0.5).setDepth(880).setStroke('#000', 4);
    await this.wait(1600);
    this.tweens.add({ targets: [t, st, fondo], alpha: 0, duration: 300, onComplete: () => { t.destroy(); st.destroy(); fondo.destroy(); } });
    await this.wait(250);
  }

  /**
   * v0.44 · Anuncio grande de un estado en el centro de la pantalla (se queda ~2 s para que se lea).
   */
  private anunciarEstado(titulo: string, sub: string, color: number, css: string) {
    const c = this.add.container(W / 2, 236).setDepth(880).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.75).fillRect(-W / 2, -46, W, 92);
    g.fillStyle(color, 0.9).fillRect(-W / 2, -46, W, 4).fillRect(-W / 2, 42, W, 4);
    const t = txt(this, 0, -14, titulo, 46, css).setOrigin(0.5).setStroke('#000', 6);
    const st = txt(this, 0, 24, sub, 20, CSS.bone).setOrigin(0.5);
    c.add([g, t, st]);
    this.tweens.add({ targets: c, alpha: 1, duration: 180 });
    this.tweens.add({ targets: t, scale: { from: 1.4, to: 1 }, duration: 260, ease: 'Back.out' });
    this.tweens.add({ targets: c, alpha: 0, delay: 1900, duration: 400, onComplete: () => c.destroy() });
    this.cameras.main.flash(180, (color >> 16) & 255, (color >> 8) & 255, color & 255);
  }

  /** v0.44 · Insignias de estado que se quedan sobre el héroe mientras duran */
  private pintarEstados() {
    this.estadosC?.destroy();
    const lista: [string, string, number][] = [];
    if (this.confusa) lista.push(['¿? CONFUNDIDO', '#ffb050', 0xe8781a]);
    if (this.aturdido) lista.push(['★ ATURDIDO', '#ffe060', 0xd8b020]);
    if (this.hemorragia) lista.push([`🩸 HEMORRAGIA ${this.hemorragia}`, '#ff7070', 0xb02020]);
    if (this.vertigo) lista.push([`↻ VÉRTIGO −${this.vertigo}`, '#9ad8f0', 0x3a8ab8]);
    // estrellitas girando sobre la cabeza mientras estás aturdido
    if (this.aturdido && !this.estrellas) {
      const e = this.add.container(this.heroX, 196).setDepth(650);
      for (let k = 0; k < 3; k++) e.add(txt(this, Math.cos((k * 2 * Math.PI) / 3) * 30, Math.sin((k * 2 * Math.PI) / 3) * 8, '★', 24, '#ffe060').setOrigin(0.5).setStroke('#000', 3));
      const ang = { a: 0 };
      this.tweens.add({ targets: ang, a: Math.PI * 2, duration: 1200, repeat: -1, onUpdate: () => {
        e.list.forEach((o, k) => { const t = o as Phaser.GameObjects.Text; t.setPosition(Math.cos(ang.a + (k * 2 * Math.PI) / 3) * 30, Math.sin(ang.a + (k * 2 * Math.PI) / 3) * 8); });
      } });
      this.estrellas = e;
    } else if (!this.aturdido && this.estrellas) {
      this.tweens.killTweensOf(this.estrellas);
      this.estrellas.destroy();
      this.estrellas = null;
    }
    if (!lista.length) { this.estadosC = null; return; }
    const c = this.add.container(this.heroX, 168).setDepth(640);
    lista.forEach(([t, css, col], i) => {
      const y = -i * 26;
      const tt = txt(this, 0, y, t, 18, css).setOrigin(0.5).setStroke('#000', 4);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.7).fillRoundedRect(-tt.width / 2 - 8, y - 12, tt.width + 16, 24, 6);
      g.lineStyle(2, col, 1).strokeRoundedRect(-tt.width / 2 - 8, y - 12, tt.width + 16, 24, 6);
      c.add([g, tt]);
    });
    this.tweens.add({ targets: c, y: 164, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.estadosC = c;
  }

  private floatText(x: number, y: number, s: string, color: string) {
    const t = txt(this, x, y, s, 32, color).setOrigin(0.5).setDepth(700).setStroke('#000', 5);
    t.x = Phaser.Math.Clamp(x, t.width / 2 + 8, 960 - t.width / 2 - 8);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, delay: 600, duration: 700, onComplete: () => t.destroy() });
  }

  private burst(x: number, y: number, tint: number, q: number) {
    const e = this.add.particles(x, y, 'px', {
      speed: { min: 60, max: 200 }, lifespan: 450, scale: { start: 2.5, end: 0 }, tint, quantity: q, emitting: false,
    }).setDepth(600);
    e.explode(q);
    this.time.delayedCall(600, () => e.destroy());
  }

  private async killEnemy(ev: EnemyView) {
    if (ev.dead) return;
    ev.dead = true;
    {
      const run = Game.run!;
      const tib = this.diente('tiburon');
      if (tib) { this.gainBlock(4 * tib); this.calc(`Diente de Tiburón: +${4 * tib} de Bloqueo`); }
      const vam = this.diente('vampiro');
      if (vam && run.hp > 0) { run.hp = Math.min(run.maxHp, run.hp + 3 * vam); this.calc(`Colmillo Vampiro: +${3 * vam} de vida`); }
      run.stats.kills = (run.stats.kills ?? 0) + 1;
      contarBaja(ev.st.def.id);
      const vv = boonLevel('duo_visviva'); // Châtelet + Coriolis
      if (vv && !this.bannerT.getData('dead')) { this.energy += vv; this.calc(`Teorema Trabajo-Energía: la energía del enemigo vuelve a ti (+${vv} J)`); this.refreshPlayer(); }
      const mul = JEFES.includes(ev.st.def.id) ? PUNTOS.jefeMul : this.kind === 'elite' && ev.st.maxHp >= 50 ? PUNTOS.eliteMul : 1;
      const pts = sumar(run, 'Enemigos derrotados', ev.st.maxHp * PUNTOS.porVidaEnemigo * mul);
      const t = txt(this, ev.baseX, 120, `+${pts}`, 22, CSS.gold).setOrigin(0.5).setDepth(700).setStroke('#000', 4);
      this.tweens.add({ targets: t, y: 90, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
      this.hud.refresh();
    }
    if (this.isPen) {
      const run = Game.run!;
      const gain = Math.min(2, run.maxHp - run.hp);
      if (gain > 0) { run.hp += gain; this.floatText(this.heroX, 190, `+${gain} kg`, CSS.green); }
    }
    const split = ev.st.def.split;
    if (split) {
      this.calc(`${ev.st.def.name} se divide: m·v = m₁v₁ + m₂v₂ (se conserva p)`);
      for (let i = 0; i < split.n; i++) {
        const x = this.freeX(ev.baseX + (i === 0 ? -70 : 70));
        if (x !== null) this.addEnemy(spawn(split.id), x);
      }
    }
    if (ev.st.def.explode) {
      this.cameras.main.shake(250, 0.012);
      this.burst(ev.baseX, 260, 0xffb040, 40);
      this.floatText(ev.baseX, 160, '¡Fisión!', '#ffb040');
      this.calc(`${ev.st.def.name} explota: liberas ${ev.st.def.explode} de energía… sobre ti`);
      await this.hurtPlayer(ev.st.def.explode, null);
      if (Game.run!.hp <= 0) await this.dies('una fisión');
    }
    ev.st.hp = 0;
    ev.hp.set(0, ev.st.maxHp);
    const oc = boonLevel('o_cadena');
    if (oc && this.alive().length) {
      const n = oc === 2 ? 9 : 5;
      this.burst(ev.baseX, 260, 0xffe080, 30);
      this.calc(`Reacción en Cadena (Oppenheimer): ${n} a los demás`);
      for (const t of this.alive()) {
        this.beamFrom(ev.baseX, t, 0xffb040);
        await this.hitEnemy(t, n, true, 'res');
      }
      await this.radiate(1, 'reacción en cadena');
    }
    ev.intentC.removeAll(true);
    ev.statusC.removeAll(true);
    ev.blockT.setText('');
    this.burst(ev.baseX, 260, 0x8a8296, 30);
    this.tweens.killTweensOf(ev.sprite);
    this.tweens.add({ targets: ev.root, alpha: 0, y: 20, duration: 500 });
    this.tweens.add({ targets: [ev.hp.g, ev.hp.t, ev.nameT], alpha: 0, duration: 400 });
    await this.wait(300);
  }

  private async hurtPlayer(dmg: number, from: EnemyView | null) {
    const run = Game.run!;
    if (from && dmg > 0 && this.prohibido('p_masaneg')) dmg += 2; // Masa Negativa
    if (from && dmg > 0 && this.necro('steiner')) dmg += 1; // Página de Steiner
    // el Autor Eterno lanza hoces giratorias
    if (from && from.st.def.id === 'hibbelerius' && dmg > 0) await this.hoces(from);
    if (from && from.st.def.id === 'am' && dmg > 0) await this.amRayo(from);
    // Fuego Amigo: el golpe se desvía hacia otro enemigo
    if (from && dmg > 0 && this.fuegoAmigo) {
      const otros = this.alive().filter((e) => e !== from);
      const t = otros.length ? Phaser.Utils.Array.GetRandom(otros) : from;
      this.calc(`Fuego Amigo: el golpe de ${from.st.def.name} se desvía hacia ${t === from ? 'sí mismo' : t.st.def.name} (${dmg})`);
      this.beamFrom(from.baseX, t, 0xff9a5a);
      await this.hitEnemy(t, dmg, false, 'res');
      return;
    }
    // Penitente: esquiva si va suficientemente rápido
    // (si tu Bloqueo alcanza para el golpe, primero se usa el Bloqueo y no pierdes rapidez)
    if (from && dmg > 0 && this.isPen && this.vel >= ESQUIVA && this.block < dmg) {
      this.vel = Math.max(0, Math.round((this.vel - 3) * 10) / 10);
      this.calc(`¡Esquiva! v ≥ ${ESQUIVA} m/s: el golpe de ${from.st.def.name} no te alcanza (v → ${this.vel})`);
      this.floatText(this.heroX, 200, 'Esquiva', '#9ad8f0');
      this.tweens.add({ targets: this.hero, y: this.hero.y - 30, duration: 120, yoyo: true });
      audio.sfx('block');
      this.refreshPlayer();
      return;
    }
    if (from && dmg > 0 && this.resorteQ !== null) this.resorteQ += dmg; // Resorte Comprimido
    if (from && this.marco > 0 && dmg > 0) {
      this.marco--;
      this.calc('Marco de Referencia (Einstein): en tu marco, ese golpe nunca llegó');
      this.floatText(this.heroX, 200, 'Anulado', '#9ad8f0');
      audio.sfx('block');
      return;
    }
    // Coriolis · Efecto Coriolis: el primer golpe de cada turno enemigo se desvía
    const cd = boonLevel('co_desvio');
    if (from && cd && !this.desvioUsed && dmg > 0) {
      this.desvioUsed = true;
      const red = cd === 2 ? 5 : 3;
      this.calc(`Efecto Coriolis: el golpe se desvía (−${red})`);
      dmg = Math.max(0, dmg - red);
    }
    // Hanbei (alma): recibe por ti un tercio del golpe; esa energía no se pierde, te la devuelve
    if (from && dmg > 0 && this.aliadoImg && run.aliado === 'hanbei') {
      const parte = Math.max(1, Math.round(dmg / 3));
      dmg -= parte;
      this.hanbeiE += parte;
      this.floatText(this.aliadoImg.x, 200, `Hanbei recibe ${parte}`, '#e8c15a');
    }
    const absorbed = this.perforaGolpe && from ? 0 : Math.min(this.block, dmg);
    if (this.perforaGolpe && from && this.block > 0) this.floatText(this.heroX, 240, 'Perfora', '#c8a8ff');
    this.block -= absorbed;
    const real = dmg - absorbed;
    const antesHp = run.hp;
    run.hp -= real;
    const l3 = boonLevel('as_ley3');
    if (l3 && !this.ley3 && run.hp > 0 && run.hp < run.maxHp / 2 && antesHp >= run.maxHp / 2) {
      this.ley3 = true;
      this.gainBlock(l3 === 2 ? 20 : 12);
      this.calc(`Tercera Ley (Asimov): proteges tu existencia, +${l3 === 2 ? 20 : 12} de Bloqueo`);
    }
    this.hero.setTintFill(0xb0a0c0);
    if (real > 0) audio.sfx('hit');
    else audio.sfx('block');
    this.time.delayedCall(90, () => this.hero.clearTint());
    this.tweens.add({ targets: this.hero, x: this.heroX - 12, duration: 50, yoyo: true, repeat: 1 });
    if (real > 0) {
      const t = txt(this, this.heroX + Phaser.Math.Between(-15, 15), 210, `-${real}`, 38, '#d08080').setOrigin(0.5).setDepth(700).setStroke('#000', 5);
      this.tweens.add({ targets: t, y: 160, alpha: 0, duration: 900, onComplete: () => t.destroy() });
      if (real >= 10) this.cameras.main.shake(160, 0.008);
    } else {
      const t = txt(this, this.heroX, 210, T.combate.bloqueado, 28, CSS.block).setOrigin(0.5).setDepth(700).setStroke('#000', 5);
      this.tweens.add({ targets: t, y: 170, alpha: 0, duration: 800, onComplete: () => t.destroy() });
    }
    // Huygens · Choque Elástico: bloqueo perfecto = no se pierde energía
    const he = boonLevel('h_elastico');
    if (from && he && real === 0 && absorbed > 0) {
      run.hp = Math.min(run.maxHp, run.hp + 2 * he);
      this.calc(`Choque Elástico (Huygens): +${2 * he} de vida`);
    }
    // Hooke · Retorno Elástico: el primer golpe que te hace daño regresa
    const kr = boonLevel('k_retorno');
    if (from && kr && real > 0 && !this.retornoUsed && !from.dead) {
      this.retornoUsed = true;
      const back = kr === 2 ? real : Math.ceil(real / 2);
      this.calc(`Retorno Elástico (Hooke): F = k·x → ${back} de regreso`);
      await this.hitEnemy(from, back, false, 'res');
    }
    const nr = boonLevel('n_reaccion');
    if (from && nr && real === 0 && absorbed > 0 && !from.dead) {
      this.calc(`Acción y Reacción (Newton): el atacante recibe ${3 * nr} N`);
      await this.hitEnemy(from, 3 * nr);
    }
    if (from && this.restE > 0 && !from.dead && dmg > 0) {
      const back = Math.round(dmg * this.restE);
      this.calc(`Restitución: rebota e·F = ${this.restE}·${dmg} = ${back}`);
      await this.hitEnemy(from, back);
    }
    if (from && this.reflect && !from.dead) {
      this.calc(`3ª ley: te golpeó con ${dmg} N → recibe ${dmg} N de reacción`);
      await this.hitEnemy(from, dmg);
    }
    this.refreshPlayer();
  }

  // ───────────────────────── TURNOS ─────────────────────────
  private async startTurn() {
    this.turn++;
    this.danoTurno = 0;
    this.derivadaBono = 0;
    if (this.keepBlock) {
      this.keepBlock = false;
    } else if (this.has('cristal')) {
      this.block = Math.floor(this.block / 2);
    } else if (this.turn > 1) {
      const amb = this.diente('ambar');
      this.block = amb >= 2 ? this.block : amb ? Math.floor(this.block / 2) : 0;
      if (amb && this.block) this.calc(`Muela de Ámbar: conservas ${this.block} de Bloqueo`);
    }
    this.energy = Math.max(0, this.maxEnergy + this.jPerTurn + this.carry - this.drainNext);
    if (this.jefeVivo('colorCielo')) {
      this.energy = Math.max(0, this.energy - 1);
      this.calc('El Color que Cayó del Cielo absorbe tu energía: −1 J');
    }
    const pod = this.diente('podrido');
    if (pod) {
      this.energy += pod;
      addEntropia(2 * pod);
      this.calc(`Diente Podrido: +${pod} J y −${2 * pod} de Cordura`);
      this.hud.refresh();
    }
    if (this.pacto('pendulo') && this.turn % 2 === 1) { this.energy += 1; this.calc('Pacto del Péndulo (ida): +1 J'); }
    if (this.turn === 1 && Game.run?.mutador === 'agua') { this.energy = Math.max(0, this.energy - 1); this.calc('Fricción del Agua: −1 J en tu primer turno'); }
    if (this.turn === 1 && this.condJefe && this.condJefe !== 'mordida') {
      const cj = CONDICION_JEFE(this.condJefe)!;
      const jefe = this.alive()[0]?.st.def.name ?? 'El jefe';
      this.calc(`${jefe} impone: ${cj.nombre.toUpperCase()} · ${cj.texto(false)}`);
      this.anunciarEstado(`¡${cj.nombre.toUpperCase()}!`, cj.texto(false), 0xa83a4a, '#ff9aa8');
    }
    if (this.turn === 1 && this.mordidos.length) {
      const nombres = this.mordidos.map((i) => defDiente(Game.run!.dientes![i]!).nombre).join(' y ');
      const jefe = this.alive()[0]?.st.def.name ?? 'El jefe';
      this.calc(`${jefe} muerde tu dentadura: ${nombres} no funciona(n) en esta pelea`);
      this.anunciarEstado('¡TE MUERDE LA DENTADURA!', `${nombres}: sin efecto en esta pelea (míralos con ✕ en tu dentadura)`, 0xa83a4a, '#ff9aa8');
    }
    if (this.turn === 2 && Game.run?.mutador === 'noche') for (const e of this.alive()) this.refreshEnemy(e);
    const nep = this.diente('neptuno');
    if (nep && this.turn % 3 === 0) { this.energy += nep; this.calc(`✦ Neptuno · Órbita nv ${nep}: +${nep} J`); }
    if (this.penduloB) { this.block += this.penduloB; this.calc(`Péndulo Físico: regresa → +${this.penduloB} de Bloqueo`); this.penduloB = 0; }
    if (this.giroscopio) { this.block += this.giroscopio; this.calc(`Giroscopio: +${this.giroscopio} de Bloqueo`); }
    // v0.51 · El Dios de las Cinco Cabezas está en equilibrio: gana Bloqueo cada turno tuyo
    const cinco = this.jefeVivo('cincoCabezas') ? this.alive().find((e) => e.st.def.id === 'cincoCabezas') : undefined;
    if (cinco) { cinco.st.block += 6; this.refreshEnemy(cinco); this.calc('El Dios de las Cinco Cabezas: ΣF = 0 → +6 de Bloqueo'); }
    if (this.jefeVivo('cthulhu')) {
      addEntropia(5);
      this.calc('Cthulhu sueña contigo: −5 de Cordura');
      this.hud.refresh();
    }
    this.golpesTurno.clear();
    if (this.turn === 1 && this.bonusJ1) { this.energy += this.bonusJ1; this.calc(`Ecos Quebrados: +${this.bonusJ1} J en tu primer turno`); }
    const tm = boonLevel('tu_maquina');
    if (tm && this.turn > 1 && this.played - this.jugadasIni >= (tm === 2 ? 3 : 4)) {
      this.energy += 1;
      this.calc(`Máquina de Turing: jugaste ${this.played - this.jugadasIni} cartas → +1 J`);
    }
    this.jugadasIni = this.played;
    if (boonLevel('duo_simetria')) this.palanca = true; // Noether + Einstein: primer ataque ×2
    const iso = boonLevel('duo_isocrono'); // Huygens + Galileo
    if (iso && this.turn % (iso === 2 ? 2 : 3) === 0) {
      this.energy += 1;
      this.isoRobo = true;
      this.calc('Simpatía de Péndulos: el periodo se cumple → +1 J y robas 1 carta');
    }
    if (this.drainNext) this.calc(`Te robaron ${this.drainNext} J`);
    this.drainNext = 0;
    this.pierce = false;
    if (this.entropia) {
      Game.run!.hp -= this.entropia;
      this.energy += this.entropia;
      this.calc(`Entropía: −${this.entropia} de vida, +${this.entropia} J`);
      if (Game.run!.hp <= 0 && (await this.dies('la entropía'))) return;
    }
    if (this.blockPerTurn) {
      this.gainBlock(this.blockPerTurn);
      this.calc(`Resistencia del Material: +${this.blockPerTurn} de Bloqueo`);
    }
    if (this.carry) this.calc(`${this.pacto('volante') ? 'Pacto del Volante' : this.has('volante') ? 'Volante' : 'Simetría en el Tiempo (Noether)'}: conservas ${this.carry} J`);
    this.carry = 0;
    this.attacksTurn = 0;
    const kres = boonLevel('k_resorte');
    if (kres) {
      this.gainBlock(2 * kres);
      this.calc(`Ut tensio, sic vis (Hooke): +${2 * kres} de Bloqueo`);
    }

    const ta = boonLevel('t_alterna');
    if (ta && (ta === 2 || this.turn % 2 === 1) && this.alive().length) {
      this.calc('Corriente Alterna (Tesla): un rayo cae sobre todos (4)');
      await this.rayoTodos(4);
      if (await this.checkEnd()) return;
    }
    this.fuegoAmigo = false;
    if (this.resorteQ !== null) {
      const q = Math.round(this.resorteQ * this.resorteMul);
      this.resorteQ = null;
      if (q > 0 && this.alive().length) {
        this.calc(`Resorte Comprimido: suelta ½·k·x² → ${q} a todos`);
        for (const t of [...this.alive()]) await this.hitEnemy(t, q, false, 'res');
        if (await this.checkEnd()) return;
      }
    }
    if (this.penduloQ.length) {
      const q = this.penduloQ;
      this.penduloQ = [];
      for (const p of q) {
        const t = p.target.dead ? this.alive()[0] : p.target;
        if (!t) break;
        this.calc(`Péndulo: regresa con la misma energía (${p.F})`);
        this.beam(t, 0xc8a050);
        await this.hitEnemy(t, p.F);
      }
      if (await this.checkEnd()) return;
    }
    let draw = 5 + this.extraDraw;
    const yog = this.jefeVivo('yogSothoth');
    if (this.turn === 1) draw += this.robo1;
    if (this.necro('angulos')) draw += 1; // Ángulos que No Suman
    const cd = boonLevel('ca_diagonal'); // Cantor
    if ((cd === 1 && this.turn % 2 === 1) || cd === 2) draw += 1;
    if (this.turn === 1) draw += boonLevel('as_fundacion'); // Psicohistoria (Asimov)
    if (this.turn === 1) draw += boonLevel('by_prior'); // Prior Informativo (Bayes)
    if (this.isoRobo) { draw += 1; this.isoRobo = false; }
    if (boonLevel('duo_simetria') === 2) draw += 1;
    if (this.has('agujero')) draw += 1;
    if (this.prohibido('p_infinito')) draw += 1;
    if (this.aliadoImg && Game.run!.aliado === 'duda') draw += 1; // el Encadenado de la Duda
    if (this.turn === 1) {
      const fdr = boonLevel('duo_roosevelt'); // Oppenheimer + Einstein
    if (fdr && this.alive().length) {
      const d = fdr === 2 ? 30 : 20;
      this.calc(`La Carta a Roosevelt: ${d} a todos los enemigos`);
      this.cameras.main.flash(300, 255, 240, 200);
      await this.rayoTodos(d);
      if (!(await this.radiate(4, 'Carta a Roosevelt'))) return false;
    }
    const om = boonLevel('o_manhattan');
      if (om) {
        this.energy += om;
        draw += 1;
        this.calc(`Proyecto Manhattan (Oppenheimer): +${om} J y +1 carta`);
      }
      if (this.has('coloso')) { this.energy = Math.max(0, this.energy - 1); this.calc('Corazón del Coloso: −1 J en tu primer turno'); }
      if (this.has('volante')) draw -= 1;
    }
    const hr = boonLevel('h_reloj');
    if ((hr === 1 && this.turn % 2 === 0) || (hr === 2 && this.turn >= 2)) {
      draw += 1;
      this.calc('Reloj de Péndulo (Huygens): +1 carta');
    }
    this.firstAttack = false;
    if (this.pCalor > 0) {
      const run = Game.run!;
      run.hp -= this.pCalor;
      this.calc(`Calor: pierdes ${this.pCalor} de vida (energía térmica que no se disipa)`);
      this.floatText(this.heroX, 200, `-${this.pCalor} 🔥`, '#e0a070');
      this.pCalor--;
      if (run.hp <= 0 && (await this.dies('el Calor'))) return;
    }
    // Einstein · E = mc²
    const mc2 = boonLevel('e_mc2');
    if (mc2) {
      this.energy += 1;
      this.calc('E = mc² (Einstein): +1 J');
      if (!(await this.radiate(mc2 === 2 ? 1 : 2, 'E = mc²'))) return;
    }
    if (this.hasFx('reactor')) {
      this.energy += 1;
      this.calc('Núcleo Activo: +1 J');
    }
    const fam = Game.run!.familiar;
    if (fam?.id === 'lechuza' || fam?.id === 'pezLinterna') draw += 1;
    if (this.isPen && this.turn > 1 && this.vel > 0) {
      const v0 = this.vel;
      this.vel = Math.max(0, Math.round((this.vel - 2) * 10) / 10);
      this.calc(`Resistencia del aire: v ${v0} → ${this.vel} m/s`);
    }
    if (this.usaVel) {
      if (this.velPerTurn) this.vel = Math.min(this.vmax, this.vel + this.velPerTurn);
      if (this.friccion && !this.noFric) {
        this.vel = Math.max(0, this.vel - this.friccion);
        this.calc(`Fricción: la rapidez baja ${this.friccion} m/s (v = ${this.vel})`);
      }
    }
    const eq = boonLevel('j_equivalente');
    if ((eq === 1 && this.turn === 1) || (eq === 2 && [1, 3, 5].includes(this.turn))) {
      this.energy += 1;
      this.calc('Equivalente Mecánico (Joule): +1 J');
    }
    const pen = boonLevel('g_pendulo');
    if (pen && this.turn % (pen === 2 ? 2 : 3) === 0) {
      this.energy += 1;
      this.calc('Péndulo Isócrono (Galileo): +1 J');
    }
    if (this.turn === 1) {
      draw += boonLevel('g_caida');
      if (this.hasFx('vigor')) this.energy += 1;
      if (this.hasFx('fatiga')) this.energy -= 1;
      if (this.hasFx('niebla')) draw -= 1;
      if (this.cond?.id === 'cristal') this.energy += 1;
      if (this.cond?.id === 'niebla') draw -= 1;
    }
    this.acel = this.baseAcel;
    this.reflect = false;
    this.restE = 0;
    this.played = 0;
    if (Game.run?.mutador === 'agua') draw += 1;
    if (this.pacto('pendulo') && this.turn % 2 === 0) { draw += 1; this.calc('Pacto del Péndulo (vuelta): robas 1 carta más'); }
    const dia = this.diente('diastema');
    if (dia && this.turn % 3 === 0) { draw += dia; this.calc(`Diente Separado: +${dia} carta`); }
    const lar = this.diente('larva');
    if (lar) {
      draw += lar;
      if (this.turn % 3 === 0) { this.addStatus({ id: 'susurro', n: 1, to: 'discard' }); this.calc('☣ Larva de Shoggoth: tekeli-li… un Susurro a tu descarte'); }
    }
    if (this.vertigo) {
      draw = Math.max(1, draw - this.vertigo);
      this.calc(`Vértigo: todo da vueltas, robas ${this.vertigo} carta(s) menos`);
      this.floatText(this.heroX, 190, 'Vértigo', '#9ad8f0');
      this.vertigo = 0;
    }
    if (yog && draw > 4) { draw = 4; this.calc('Yog-Sothoth cierra la Puerta: sólo robas 4 cartas'); }
    const antesRobo = this.hand.length;
    this.drawCards(draw);
    if (this.jefeVivo('nyarlathotep') && this.hand.length > antesRobo) {
      // la primera carta que robas se descarta
      const v = this.hand[antesRobo];
      if (v) {
        this.hand = this.hand.filter((c) => c !== v);
        this.discard.push(v.inst);
        this.tweens.add({ targets: v, x: W - 62, y: 510, scale: 0.1, alpha: 0, duration: 260, onComplete: () => v.destroy() });
        this.calc(`Nyarlathotep te arrebata ${CARDS[v.inst.id].name}: se descarta`);
        this.layoutHand();
      }
    }
    if (this.turn === 1 && this.pacto('centroide') && this.hand.length) {
      // Pacto del Centroide: la carta más cara de la primera mano cuesta 0
      const cara = this.hand.reduce((a, b) => (this.cost(b) > this.cost(a) ? b : a));
      costOverride.set(cara.inst.uid, 0);
      this.calc(`Pacto del Centroide: ${CARDS[cara.inst.id].name} cuesta 0 J este turno`);
    }
    this.refreshPlayer();
    this.hint(`${T.combate.turno} ${this.turn}`);
    if (!this.aturdido) this.trasAturdir = false;
    if (this.aturdido) {
      // ATURDIDO: pierdes este turno (los enemigos vuelven a actuar, pero no te pueden aturdir otra vez seguido)
      this.trasAturdir = true;
      this.busy = true;
      this.calc('¡ATURDIDO! El golpe te dejó viendo estrellas: pierdes este turno');
      this.anunciarEstado('PIERDES ESTE TURNO', 'Sigues viendo estrellas… los enemigos vuelven a actuar', 0xd8b020, '#ffe060');
      this.cameras.main.shake(250, 0.006);
      this.time.delayedCall(2600, () => { this.busy = false; this.aturdido = false; this.refreshPlayer(); void this.endTurn(); });
      return;
    }
    // familiares que actúan al inicio de tu turno
    if (fam?.id === 'shoggoth') {
      // v0.49 · Shoggoth Bebé: Bloqueo y se come un Susurro
      this.famHop();
      this.gainBlock(4);
      this.calc('Shoggoth Bebé: +4 de Bloqueo');
      const su = this.hand.find((c) => c.inst.id === 'susurro');
      if (su) {
        this.hand = this.hand.filter((c) => c !== su);
        this.exhaust.push(su.inst);
        this.tweens.add({ targets: su, y: su.y - 60, alpha: 0, scale: 0.2, duration: 300, onComplete: () => su.destroy() });
        this.calc('Shoggoth Bebé: ¡ñam! se come un Susurro');
        this.layoutHand();
      }
    }
    if (fam?.id === 'tortuga') {
      this.famHop();
      this.gainBlock(4);
      this.calc('Tortuga de Zenón: +4 de Bloqueo');
    } else if (fam?.id === 'gato' && this.alive().length) {
      this.busy = true;
      this.famHop();
      if (Math.random() < 0.5) {
        this.gainBlock(5);
        this.calc('Gato de Schrödinger: la caja se abre… ¡escudo! +5 de Bloqueo');
      } else {
        const t = Phaser.Utils.Array.GetRandom(this.alive());
        this.calc('Gato de Schrödinger: la caja se abre… ¡zarpazo! 5 de daño');
        await this.hitEnemy(t, 5, false, 'res');
      }
      this.busy = false;
      if (await this.checkEnd()) return;
    }
    // Órbita Cerrada: el satélite golpea solo
    if (this.orbit && this.alive().length) {
      this.busy = true;
      const t = Phaser.Utils.Array.GetRandom(this.alive());
      const K = Math.round(0.5 * this.orbit * this.vel * this.vel);
      this.calc(`Órbita Cerrada: el satélite golpea con K = ½·${this.orbit}·${this.vel}² = ${K}`);
      this.beam(t, 0x7fd8ff);
      await this.hitEnemy(t, K, false, 'res');
      this.busy = false;
      if (await this.checkEnd()) return;
    }
    this.endBtn.setEnabled(true);
    this.refreshPlayer();
  }

  private async endTurn() {
    if (this.busy || this.discardMode > 0) return;
    this.cancelSelect();
    this.busy = true;
    this.endBtn.setEnabled(false);
    const yt = boonLevel('y_tiempo');
    this.carry = yt ? Math.min(this.energy, yt) : 0;
    if (this.has('volante') || this.pacto('volante')) this.carry = Math.max(this.carry, Math.min(this.energy, 3));
    // Susurros en la mano: el Abismo te habla
    const susurros = this.hand.filter((c) => c.inst.id === 'susurro').length;
    if (susurros) {
      addEntropia(CORDURA.susurro * susurros);
      this.calc(`Susurro ×${susurros}: −${CORDURA.susurro * susurros} de Cordura`);
      this.floatText(this.heroX, 210, `−${CORDURA.susurro * susurros} Cordura`, '#c88aff');
      this.hud.refresh();
    }
    this.desvioUsed = false;
    const pre = this.diente('premolar');
    if (pre && this.energy > 0) { this.gainBlock(2 * pre * this.energy); this.calc(`Premolar Paciente: ${this.energy} J sin usar → +${2 * pre * this.energy} de Bloqueo`); }
    if (this.played - this.jugadasIni >= 6) this.cartaLovecraft('seisCartas');
    // v0.57 · El Hibbeler Maldito te regaña si desperdicias energía
    if (this.hibbelerM && this.energy >= 2) {
      addEntropia(3);
      this.calc(`El Hibbeler Maldito: ${this.energy} J sin usar → −3 de Cordura`);
      this.hablar('Hibbeler', Phaser.Utils.Array.GetRandom(['¿Y esa energía? ¿La vas a guardar para el examen?', 'Problema 13-27. Hazlo otra vez.', 'Te sobró energía. Me decepcionas.']), this.heroX + 40, 170);
      this.hud.refresh();
    }
    // v0.57 · La Tarea Olvidada se queda en la mano, crece… y se queja
    for (const c of this.hand.filter((x) => x.inst.id === 'tareaOlvidada')) {
      const n = Math.min(6, (this.tareaT.get(c.inst.uid) ?? 0) + 1);
      this.tareaT.set(c.inst.uid, n);
      addEntropia(2);
      const voz = CARDS.tareaOlvidada.voz!.mano!;
      this.hablar('Tarea', Phaser.Utils.Array.GetRandom(voz).replace('{n}', String(n)), c.x, HAND_Y - 150);
      this.calc(`La Tarea Olvidada sigue en tu mano (${n} turno(s)): −2 de Cordura`);
      this.hud.refresh();
    }
    // tareas pendientes: si siguen en la mano, cuestan vida
    const tareas = this.hand.filter((c) => c.inst.id === 'tarea').length;
    if (tareas) {
      Game.run!.hp -= 3 * tareas;
      this.calc(`Tarea Pendiente ×${tareas}: pierdes ${3 * tareas} de vida`);
      this.floatText(this.heroX, 200, `-${3 * tareas} tarea`, '#e08a8a');
      if (Game.run!.hp <= 0 && (await this.dies('la tarea pendiente'))) return;
    }
    // descartar mano (la Honda de David se queda y gana rapidez)
    const hondas = this.hand.filter((c) => c.inst.id === 'honda' || c.inst.id === 'tareaOlvidada'); // v0.57 · la Tarea Olvidada también se queda
    for (const h of hondas) {
      if (h.inst.id !== 'honda') continue;
      const st0 = statsOf(h.inst);
      const vv = Math.min(12, (this.hondaV.get(h.inst.uid) ?? (st0.extra ?? 4)) + 2);
      this.hondaV.set(h.inst.uid, vv);
      this.calc(`Honda de David: sigue girando → v = ${vv} m/s`);
    }
    this.hand = this.hand.filter((c) => c.inst.id !== 'honda' && c.inst.id !== 'tareaOlvidada');
    for (const c of this.hand) {
      this.discard.push(c.inst);
      this.tweens.add({ targets: c, x: W - 62, y: 510, scale: 0.1, alpha: 0, duration: 220, onComplete: () => c.destroy() });
    }
    this.hand = hondas;
    this.friccion = Math.max(0, this.friccion - 1);
    if (this.hemorragia > 0) this.hemorragia--;
    this.acel = this.baseAcel;
    this.refreshPlayer();
    await this.wait(300);
    // familiares que actúan al final de tu turno
    const fam = Game.run!.familiar;
    if (fam && this.alive().length) {
      if (fam.id === 'dragon') {
        this.famHop();
        for (const t of this.alive()) {
          t.st.calor += 3;
          this.beamFrom(this.heroX - 100, t, 0xff7a2a);
          this.refreshEnemy(t);
        }
        this.calc('Dragón de Carnot: ¡fuego! +3 de Calor a todos');
        await this.wait(300);
      } else if (fam.id === 'salamandra') {
        const t = Phaser.Utils.Array.GetRandom(this.alive());
        this.famHop();
        t.st.calor += 3;
        this.beam(t, 0xc87533);
        this.calc(`Salamandra Ígnea: +3 de Calor a ${t.st.def.name}`);
        this.refreshEnemy(t);
        await this.wait(250);
      } else if (fam.id === 'gatoUlthar') {
        // v0.49 · Gato de Ulthar: araña al enemigo con más vida
        const t = this.alive().reduce((a, b) => (b.st.hp > a.st.hp ? b : a));
        this.famHop();
        this.calc(`Gato de Ulthar: araña a ${t.st.def.name} (6)`);
        await this.hitEnemy(t, 6, false, 'res');
      } else if (fam.id === 'fobos' && this.turn % 2 === 0) {
        // v0.61 · Fobos: completa una vuelta cada 2 turnos y golpea
        const t = Phaser.Utils.Array.GetRandom(this.alive());
        this.famHop();
        this.beamFrom(this.heroX - 100, t, 0xff4a6a);
        this.calc(`Fobos completa una órbita y golpea a ${t.st.def.name} (8)`);
        await this.hitEnemy(t, 8, false, 'res');
      } else if (fam.id === 'cuervo') {
        const t = this.alive().reduce((a, b) => (b.st.hp < a.st.hp ? b : a));
        this.famHop();
        this.calc(`Cuervo: picotea a ${t.st.def.name} (4)`);
        await this.hitEnemy(t, 4, false, 'res');
      }
      if (await this.checkEnd()) return;
    }
    // dúo Asimov + Turing: el robot pensante
    const rb = boonLevel('duo_robot');
    if (rb && this.alive().length) {
      const t = Phaser.Utils.Array.GetRandom(this.alive());
      this.beam(t, 0x9ad8f0);
      this.calc(`El Robot Pensante ataca a ${t.st.def.name} (${rb === 2 ? 9 : 6})`);
      await this.hitEnemy(t, rb === 2 ? 9 : 6, false, 'res');
      if (rb === 2) this.gainBlock(3);
      if (await this.checkEnd()) return;
    }
    // aliado (alma en pena): actúa al final de tu turno
    if (this.aliadoImg && this.alive().length) {
      await this.aliadoActua();
      if (await this.checkEnd()) return;
    }
    // fantasma de un compañero (signo dorado): también actúa al final de tu turno
    if (this.fantasmaImg && this.alive().length) {
      await this.fantasmaActua();
      if (await this.checkEnd()) return;
    }

    for (const ev of this.alive()) {
      const st = ev.st;
      st.block = 0;
      if (st.calor > 0) {
        this.calc(`${st.def.name}: Calor −${st.calor}`);
        await this.hitEnemy(ev, st.calor, true, 'calor');
        st.calor = Math.max(0, st.calor - 1);
        if (ev.dead) continue;
      }
      if (st.impulsoLeft > 0) {
        this.calc(`${st.def.name}: el Impulso Sostenido sigue empujando (${st.impulso})`);
        await this.hitEnemy(ev, st.impulso, false, 'res');
        st.impulsoLeft--;
        if (!st.impulsoLeft) st.impulso = 0;
        if (ev.dead) continue;
      }
      if (st.def.id === 'shubNiggurath') {
        // v0.51 · los Mil Retoños alimentan a su madre
        const hijos = this.alive().filter((e) => e.st.def.id === 'retono').length;
        if (hijos) {
          const cura = Math.min(st.maxHp - st.hp, 6 * hijos);
          if (cura > 0) { st.hp += cura; this.floatText(ev.baseX, 170, `+${cura}`, '#9af07a'); this.calc(`Shub-Niggurath: ${hijos} Retoño(s) la alimentan → +${cura} de vida`); this.refreshEnemy(ev); }
        }
      }
      const it = st.intent;
      if (it.kind === 'stunned') {
        st.stunned = Math.max(0, st.stunned - 1);
        this.floatText(ev.baseX, 160, 'Detenido…', CSS.dim);
        await this.wait(500);
      } else {
        await new Promise<void>((r) => this.tweens.add({ targets: ev.root, x: ev.baseX - 50, duration: 110, yoyo: true, ease: 'Quad.out', onComplete: () => r() }));
        if (it.kind === 'block') {
          st.block += it.block;
          if (it.charge) {
            st.carga++;
            this.floatText(ev.baseX, 150, `Carga +1 (${st.carga})`, '#e0a070');
          }
          if (it.dmg) await this.hurtPlayer(it.dmg, ev);
        } else if (it.kind === 'attack') {
          const hpAntes = Game.run!.hp;
          if (it.inunda && this.block > 0) {
            this.calc(`${st.def.name}: el lago sube y se lleva tu Bloqueo (${this.block})`);
            this.floatText(this.heroX, 190, '¡Inundado!', '#7ab8ff');
            this.block = 0;
            this.refreshPlayer();
          }
          this.perforaGolpe = !!it.perfora;
          if (it.radianes && !this.radianes) {
            this.radianes = true;
            this.calc(`${st.def.name}: MODE → RAD. Tus Ataques harán ×0.6 hasta que juegues una Habilidad`);
            this.anunciarEstado('MODO RAD', 'Tu calculadora está en radianes: Ataques ×0.6. Juega una Habilidad para revisar el modo.', 0xa83a4a, '#ff9aa8');
          }
          for (let h = 0; h < (it.hits ?? 1); h++) {
            await this.hurtPlayer(it.dmg, ev);
            if (Game.run!.hp <= 0 || ev.dead) break;
            await this.wait(140);
          }
          this.perforaGolpe = false;
          if (it.release) st.carga = 0;
          if (it.aturde && Game.run!.hp > 0) {
            if (Game.run!.hp >= hpAntes) this.calc(`Bloqueaste el golpe de ${st.def.name}: no te aturde`);
            else if (this.diente('protector')) this.calc('Protector Bucal: el golpe no te aturde');
            else if (this.giroscopio) this.calc('Giroscopio: tu eje no se mueve, el golpe no te aturde');
            else if (this.trasAturdir) this.calc('Sigues mareado del golpe anterior: este no te vuelve a aturdir');
            else { this.aturdido = true; this.calc(`${st.def.name} te ATURDE: pierdes tu siguiente turno`); this.anunciarEstado('¡ATURDIDO!', `${st.def.name} te alcanzó: pierdes tu siguiente turno`, 0xd8b020, '#ffe060'); this.refreshPlayer(); await this.wait(1200); }
          }
        }
        if (it.calor && Game.run!.hp > 0) {
          this.pCalor += it.calor;
          this.calc(`${st.def.name} te transfiere ${it.calor} de Calor`);
        }
        if (it.add) this.addStatus(it.add);
        if (it.summon) {
          const x = this.alive().length < 4 ? this.freeX(ev.baseX - 190) : null;
          if (x !== null) {
            this.addEnemy(spawn(it.summon), x);
            this.floatText(x, 200, '¡Invocado!', '#e0a070');
            this.calc(`${st.def.name} invoca: ${ENEMIES[it.summon].name}`);
          } else this.calc(`${st.def.name} intenta invocar, pero no hay lugar`);
        }
        if (it.shieldAll) {
          for (const a of this.alive()) { a.st.block += it.shieldAll; this.refreshEnemy(a); }
          this.calc(`${st.def.name}: +${it.shieldAll} de Bloqueo a todos sus aliados`);
        }
        if (it.heal) {
          st.hp = Math.min(st.maxHp, st.hp + it.heal);
          this.floatText(ev.baseX, 180, `+${it.heal}`, CSS.green);
        }
        if (it.drain) {
          this.drainNext += it.drain;
          this.calc(`${st.def.name} te roba ${it.drain} J para tu siguiente turno`);
        }
        if (it.confusion) this.confundir(st.def.name);
        if (it.hemorragia && Game.run!.hp > 0) {
          const n = this.diente('protector') ? Math.ceil(it.hemorragia / 2) : it.hemorragia;
          this.hemorragia = Math.max(this.hemorragia, n);
          this.calc(`${st.def.name}: HEMORRAGIA por ${n} turno(s) → cada carta que juegues te quita 1 de vida`);
          this.anunciarEstado('¡HEMORRAGIA!', `Durante ${n} turno(s), cada carta que juegues te quita 1 de vida`, 0xb02020, '#ff7070');
          await this.wait(900);
        }
        if (it.vertigo && Game.run!.hp > 0) {
          this.vertigo = Math.min(3, this.vertigo + it.vertigo);
          this.calc(`${st.def.name} te marea: VÉRTIGO, robas ${this.vertigo} carta(s) menos en tu siguiente turno`);
          this.anunciarEstado('¡VÉRTIGO!', `En tu siguiente turno robas ${this.vertigo} carta(s) menos`, 0x3a8ab8, '#9ad8f0');
          this.cameras.main.shake(400, 0.004);
          await this.wait(900);
        }
        {
          if (it.friccion) {
            if (this.has('botas')) this.calc('Botas de Agarre: el lodo no te afecta.');
            else {
              this.friccion += it.friccion;
              this.calc(`Lodo: +${it.friccion} Fricción → tus ataques pierden ${this.friccion} m/s²`);
              const jc = boonLevel('j_calor');
              if (jc) {
                this.gainBlock(4 * jc);
                this.calc(`Calor por Fricción (Joule): +${4 * jc} de Bloqueo`);
              }
            }
          }
        }
        if (st.def.umbral && !ev.dead) st.inercia++;
        if (st.fatiga > 0) st.fatiga--;
        await this.wait(250);
      }
      if (Game.run!.hp <= 0 && (await this.dies(ev.st.def.name))) return;
      if (ev.dead) continue;
      st.turn++;
      if ((st.imparableT ?? 0) > 0) st.imparableT = st.imparableT! - 1;
      if (st.stunned > 0) st.intent = { kind: 'stunned' };
      else {
        st.detenido = false;
        st.intent = this.scaleIntent(st.def.next(st), st);
      }
      this.refreshEnemy(ev);
      this.refreshPlayer();
    }
    if (await this.checkEnd()) return;
    this.busy = false;
    this.startTurn();
  }

  private async checkEnd(): Promise<boolean> {
    if (this.alive().length > 0) return false;
    if (this.bannerT.getData('ended')) return true;
    this.bannerT.setData('ended', true);
    this.busy = true;
    const run = Game.run!;
    run.floor = this.floor + 1;
    run.mordidos = undefined; // v0.52 · la mordida sólo dura la pelea
    run.stats.combates++;
    // puntaje: combate perfecto (sin perder vida)
    if (run.hp >= this.hpStart) {
      run.stats.perfectos = (run.stats.perfectos ?? 0) + 1;
      if (this.kind === 'boss' && !run.debug) codexFlag('logro_jefePerfecto');
      sumar(run, 'Combates perfectos', this.kind === 'elite' || this.kind === 'boss' ? PUNTOS.elitePerfecta : PUNTOS.combatePerfecto);
      this.floatText(W / 2, 170, '¡Perfecto!', CSS.gold);
      if (this.kind === 'elite') this.encargo(completarEncargo('elitePerfecta'));
    }
    if (this.kind === 'boss' && this.turn <= 6) this.encargo(completarEncargo('jefeRapido'));
    // la Dentadura: premios al ganar
    const sinDano = run.hp >= this.hpStart;
    const lec = this.diente('leche');
    if (lec) { run.hp = Math.min(run.maxHp, run.hp + 4 * lec); this.floatText(this.heroX, 200, `+${4 * lec}`, CSS.green); }
    const oro = this.diente('oro');
    if (oro) { run.ergios += 20 * oro; this.floatText(W / 2, 210, `+${20 * oro} Ergios (Diente de Oro)`, CSS.gold); }
    const lom = this.diente('lombriz');
    if (lom) run.hp = Math.min(run.maxHp, run.hp + 5 * lom);
    const gar = this.diente('garrapata');
    if (gar) run.ergios += 30 * gar;
    if (run.modo === 'abismo') {
      // cartas del Astrónomo de Providence
      if (sinDano && this.kind === 'elite') this.cartaLovecraft('elitePerfecta');
      if (!this.jugoDefensa) this.cartaLovecraft('sinDefensa');
      if (alineacion(run.dientes)) this.cartaLovecraft('alineacion');
      if (this.kind === 'boss' && this.turn <= 6) this.cartaLovecraft('jefeRapido');
      // los dientes de Cristal se gastan
      const rotos = gastarCristal(run.dientes);
      if (rotos.length) { this.floatText(W / 2, 240, `💎 Se rompe: ${rotos.join(', ')}`, '#c8f4ff'); aplicarSarro(run); }
    }
    if (this.kind === 'boss') sumar(run, 'Actos superados', PUNTOS.acto * this.acto);
    if (this.kind === 'boss' && this.acto === 3) sumar(run, 'Victoria', PUNTOS.victoria);
    if (this.kind === 'boss' && this.acto === 4) sumar(run, 'AM derrotado', PUNTOS.victoria * 2);
    if (this.kind === 'boss' && this.acto === 5) sumar(run, 'Geómetra derrotado', PUNTOS.victoria);
    const qc = boonLevel('qn_calma'); // Newton 1693: la calma después de la tormenta
    if (qc) { addEntropia(-3 * qc); this.calc(`Calma tras la tormenta (Newton): +${3 * qc} de Cordura`); }
    if (this.kind === 'elite') run.stats.elites++;
    // los efectos pasajeros se consumen al terminar el combate
    const cons = boonLevel('c_conserva');
    if (cons) run.hp = Math.min(run.maxHp, run.hp + 5 * cons);
    const vm = boonLevel('m_vidamedia');
    if (vm) {
      run.maxHp += vm === 2 ? 3 : 2;
      run.hp += vm === 2 ? 3 : 2;
    }
    const bp = boonLevel('by_posterior');
    if (bp && run.hp > 0) {
      // Distribución Posterior (Bayes): la evidencia acumulada (preguntas acertadas) te cura
      const cura = Math.min(bp === 2 ? 10 : 6, Math.floor((run.stats.runasOk ?? 0) / 2) + 1);
      run.hp = Math.min(run.maxHp, run.hp + cura);
      this.calc(`Distribución Posterior (Bayes): ${run.stats.runasOk ?? 0} aciertos de evidencia → +${cura} de vida`);
    }
    const da = boonLevel('d_apto');
    if (da && run.hp < run.maxHp / 2) {
      run.maxHp += da === 2 ? 5 : 3;
      this.calc(`El Más Apto (Darwin): sobreviviste → +${da === 2 ? 5 : 3} Vida máxima`);
    }
    let extra = 0;
    if (this.cond?.id === 'ecos') extra += 15;
    if (run.familiar) {
      if (run.familiar.id === 'cuervo') extra += 6;
      if (run.familiar.id === 'gatoUlthar') addEntropia(-4); // v0.49 · +4 de Cordura
      if (run.familiar.id === 'europa') { run.hp = Math.min(run.maxHp, run.hp + 6); this.calc('Europa, la Luna de Hielo: +6 de vida'); } // v0.61
      run.familiar.left--;
      if (run.familiar.left <= 0) run.familiar = null;
    }
    run.effects.forEach((e) => e.left--);
    run.effects = run.effects.filter((e) => e.left > 0);
    const erg0 = this.kind === 'elite' ? Phaser.Math.Between(35, 45) : this.kind === 'easy' ? Phaser.Math.Between(10, 14) : Phaser.Math.Between(13, 19);
    const erg = run.modo === 'abismo' && run.mutador === 'tormenta' ? Math.round(erg0 * 1.5) : erg0; // mutador «Tormenta de Ergios»
    if (this.kind !== 'boss') addErgios(erg + extra);
    else if (extra) addErgios(extra);
    audio.sfx('victory');
    logEvent('combate', '', true, { tipo: this.kind, piso: this.floor, turnos: this.turn, vida: run.hp });
    saveLocal();
    if (this.kind === 'boss') (run.seen ??= []).push(`jefe_${this.acto}`);
    if (this.kind === 'boss') {
      // v0.30: dejas tu signo para tus compañeros y, si te ayudó un fantasma, se le avisa
      if (this.acto < 5) dejarSigno(run, ['colossus', 'bruja', 'hibbelerius', 'am'][Math.min(3, this.acto - 1)]);
      if (run.fantasma) { usarHuella(run.fantasma.id); this.calc(`${run.fantasma.alias} recibirá Momentum por ayudarte.`); run.fantasma = undefined; }
    }
    if (this.kind === 'boss' && this.acto === 1) {
      codexFlag('acto1');
      logEvent('acto', '', true, { acto: 1, vida: run.hp });
      saveLocal();
      syncRun('en curso', 'Acto I superado');
      await this.banner(T.combate.victoria);
      fadeTo(this, 'ActTransition');
      return true;
    }
    if (this.kind === 'boss' && this.acto === 2) {
      codexFlag('acto2');
      codexWin(run.gravity);
      logEvent('acto', '', true, { acto: 2, vida: run.hp });
      saveLocal();
      syncRun('en curso', 'Acto II superado');
      await this.banner(T.combate.victoria);
      fadeTo(this, 'ActTransition', { to: 3 });
      return true;
    }
    if (this.kind === 'boss' && this.acto === 3) {
      // ¿Se abre la grieta del Núcleo? (tras vencer a Hibbelerius 2 veces)
      if (!run.debug) contarHib();
      codexFlag('acto3');
      if (nucleoDisponible() || run.debug) {
        logEvent('acto', '', true, { acto: 3, vida: run.hp });
        saveLocal();
        syncRun('victoria', 'Hibbelerius derrotado');
        await this.banner(T.combate.victoria);
        fadeTo(this, 'ActTransition', { to: 4 });
        return true;
      }
    }
    if (this.kind === 'boss' && this.acto === 5) {
      // El Descenso: el jefe del tramo cayó → pantalla entre tramos (src/scenes/Abismo.ts, fase 'tramo')
      const tramo = run.tramo ?? 1;
      const info = JEFES_ABISMO[run.jefe ?? 'geometra'];
      (run.seen ??= []).push(`jefeT${tramo}`);
      if (!run.debug) { codexFlag(`abismo_t${Math.min(tramo, TRAMOS)}`); codexFlag(`abismo_vence_${run.jefe ?? 'geometra'}`); } // v0.47: cosméticos del mito
      sumar(run, 'Tramos del Abismo', Math.round(PUNTOS.acto * tramo * multPuntaje(tramo)));
      logEvent('tramo', '', true, { tramo, jefe: run.jefe, vida: run.hp, modo: 'abismo' });
      saveLocal();
      syncRun('en curso', `Tramo ${tramo}: ${info.nombre} derrotado`);
      await this.banner(info.primigenio ? `¡${info.nombre} ha caído!` : '¡Tramo superado!');
      fadeTo(this, 'Abismo', { fase: 'tramo', clase: run.clase });
      return true;
    }
    if (this.kind === 'boss' && this.acto >= 4) {
      run.done = true;
      const primeraAM = !amVencido();
      codexFlag('acto4');
      otorgarInsigniaAM();
      logEvent('acto', '', true, { acto: 4, vida: run.hp });
      bonosFinales(run);
      saveLocal();
      syncRun('victoria', 'AM derrotado');
      await this.banner('AM ha caído');
      fadeTo(this, 'End', { victory: true, nucleo: 'am', primeraAM });
      return true;
    }
    if (this.kind === 'boss') {
      run.done = true;
      codexFlag('acto3');
      logEvent('acto', '', true, { acto: 3, vida: run.hp });
      bonosFinales(run);
      saveLocal();
      syncRun('victoria', 'Hibbelerius derrotado');
      await this.banner(T.combate.victoria);
      fadeTo(this, 'End', { victory: true });
      return true;
    }
    if (this.astro) {
      // v0.59 · Astro Ambulante vencido: cosmético (la primera vez) y un sobre
      const a = ASTROS[this.astro];
      const nuevo = !(Game.codex.flags ?? []).includes(`abismo_astro_${this.astro}`);
      if (!run.debug) codexFlag(`abismo_astro_${this.astro}`);
      (run.astrosVistos ??= []).push(this.astro);
      // v0.61 · Marte suelta a Fobos y Júpiter a Europa (al volver al mapa eliges si te quedas con ella)
      const luna = this.astro === 'marte' ? 'fobos' : this.astro === 'jupiter' ? 'europa' : null;
      if (luna) addFamiliar(luna);
      logEvent('astro', '', true, { astro: this.astro, piso: this.floor, turnos: this.turn, vida: run.hp });
      saveLocal();
      syncRun('en curso', `${a?.nombre ?? 'Un astro'} vencido`);
      await this.banner(`¡${a?.nombre.split(',')[0] ?? 'El astro'} cae!`);
      fadeTo(this, 'Abismo', { fase: 'astro', clase: run.clase, astro: this.astro, nuevo: nuevo && !run.debug });
      return true;
    }
    if (this.sueno) {
      // v0.51 · ganaste en el sueño: la vida que perdiste allá no era real
      const recupera = Math.max(0, (run.suenoHp ?? run.hp) - run.hp);
      run.hp = Math.max(run.hp, run.suenoHp ?? run.hp);
      run.suenoHp = undefined;
      run.floor = this.floor; // la escena del sueño avanza el piso al despertar
      logEvent('suenoCombate', '', true, { sueno: this.sueno, piso: this.floor });
      saveLocal();
      syncRun('en curso');
      await this.banner('¡Venciste en el sueño!');
      fadeTo(this, 'Sueno', { floor: this.floor, fase: 'despertar', gano: true, combate: this.sueno, recupera });
      return true;
    }
    syncRun('en curso');
    await this.banner(T.combate.victoria);
    fadeTo(this, 'Reward', { kind: this.kind, ergios: erg + extra });
    return true;
  }

  /**
   * Tu vida llegó a 0. Si tienes la Vida Extra del Profe, te levantas y
   * devuelve false (el combate sigue). Si no, termina la expedición (true).
   */
  private async dies(by: string): Promise<boolean> {
    const run = Game.run!;
    if (this.bannerT.getData('dead')) return true;
    if (this.sueno) {
      // v0.51 · morir en un sueño sólo te despierta (sin gastar la Vida Extra)
      this.bannerT.setData('dead', true);
      this.busy = true;
      const vuelve = Math.max(1, run.suenoHp ?? 1);
      const recupera = Math.max(0, vuelve - Math.max(0, run.hp));
      run.hp = vuelve;
      run.suenoHp = undefined;
      addEntropia(15);
      run.floor = this.floor;
      logEvent('suenoCombate', '', false, { sueno: this.sueno, piso: this.floor, enemigo: by });
      saveLocal();
      this.tweens.add({ targets: this.hero, alpha: 0.3, duration: 700 });
      await this.banner('¡Despiertas!', '#c8b8ff');
      fadeTo(this, 'Sueno', { floor: this.floor, fase: 'despertar', gano: false, combate: this.sueno, recupera });
      return true;
    }
    // v0.61 · Caronte, el Barquero: no te deja cruzar (una vez) y se va
    if (run.familiar?.id === 'caronte') {
      run.familiar = null;
      run.hp = Math.min(run.maxHp, 12);
      saveLocal();
      this.hud.refresh();
      logEvent('caronte', '', true, { piso: this.floor, enemigo: by });
      audio.sfx('heal');
      this.burst(this.heroX, 260, 0x7ad8ff, 40);
      this.calc(`Caronte, el Barquero: «Todavía no te toca cruzar.» Te levantas con ${run.hp} de vida y él se aleja remando`);
      await this.banner('¡Caronte te salva!', '#7ad8ff');
      this.refreshPlayer();
      return false;
    }
    const i = run.relics.indexOf('vidaExtra');
    if (i >= 0) {
      run.relics.splice(i, 1);
      run.hp = Math.ceil(run.maxHp / 2);
      saveLocal();
      this.hud.refresh();
      logEvent('vidaExtra', '', true, { piso: this.floor, enemigo: by });
      audio.sfx('heal');
      this.burst(this.heroX, 260, 0xe8c15a, 40);
      this.calc(`${RELICS.vidaExtra.name}: ¡te levantas con ${run.hp} de vida!`);
      await this.banner('¡Vida extra!');
      this.floatText(this.heroX, 180, '«Ándale, sigue.»', CSS.gold);
      this.refreshPlayer();
      return false;
    }
    await this.defeat(by);
    return true;
  }

  private async defeat(by: string) {
    const run = Game.run!;
    this.bannerT.setData('dead', true);
    this.busy = true;
    run.hp = 0;
    run.done = true;
    bonosFinales(run);
    saveLocal();
    logEvent('derrota', '', false, { piso: this.floor, enemigo: by });
    const nucleo = this.acto === 4;
    const infinito = this.acto === 5 && (run.tramo ?? 1) > TRAMOS; // ya había vencido a un Primigenio
    syncRun(nucleo || infinito ? 'victoria' : 'derrota', nucleo ? `Cayó en el Núcleo: ${by}` : infinito ? `Cayó en la profundidad ${run.tramo}: ${by}` : by);
    audio.sfx('defeat');
    this.tweens.add({ targets: this.hero, alpha: 0.2, y: 290, duration: 900 });
    await this.banner(T.combate.derrota, '#b8a8c8');
    fadeTo(this, 'End', nucleo ? { victory: true, nucleo: 'caido', by } : { victory: false, by });
  }

  // ───────────────────────── v0.6: AZAR, RADIACIÓN Y FAMILIARES ─────────────────────────
  /** Condición del piso: cambia un poco las reglas de este combate */
  private applyCondition(c: ConditionDef) {
    this.cond = c;
    if (c.id === 'viento' && !this.usaVel) this.baseAcel += 1;
    if (c.id === 'lodo' && !this.has('botas')) this.friccion += 2;
    if (c.id === 'gravedad') this.grav = { ...this.grav, g: Math.round(this.grav.g * 200) / 100 };
    if (c.id === 'refuerzo') this.enemies.forEach((e) => { e.st.block += 8; this.refreshEnemy(e); });
    if (c.id === 'grieta') {
      this.pCalor += 3;
      this.enemies.forEach((e) => { e.st.calor += 3; this.refreshEnemy(e); });
    }
    const col = c.good === true ? CSS.green : c.good === false ? '#e08a8a' : CSS.gold;
    const cx = enAbismo() ? 40 : 0; // en el Abismo, el semáforo de Cordura ocupa la orilla
    const ic = icon(this, 34 + cx, 96, c.icon, 2.6);
    const t = txt(this, 52 + cx, 84, c.name, 20, col);
    this.tip.attach(ic, `Condición: ${c.name}`, c.text);
    this.tip.attach(t, `Condición: ${c.name}`, c.text);
    this.calc(`Condición del piso · ${c.name}: ${c.text}`);
    logEvent('condicion', '', '', { id: c.id, piso: this.floor });
  }

  /** Efectos al iniciar el combate (después de La Manzana). Devuelve false si moriste. */
  private async combatStartFx(): Promise<boolean> {
    const radio = boonLevel('m_radio');
    if (radio) {
      const n = radio === 2 ? 7 : 4;
      for (const e of this.alive()) {
        e.st.calor += n;
        this.burst(e.baseX, 260, 0x9bf07a, 14);
        this.refreshEnemy(e);
      }
      this.pCalor += radio === 2 ? 1 : 2;
      this.calc(`Radio (Curie): +${n} de Calor a los enemigos; tú recibes ${radio === 2 ? 1 : 2}`);
      this.refreshPlayer();
      await this.wait(300);
    }
    const km = boonLevel('k_micro');
    if (km) {
      for (const e of this.alive()) { e.st.fatiga += km; this.refreshEnemy(e); }
      this.calc(`Micrographia (Hooke): los enemigos empiezan con ${km} de Fatiga`);
    }
    const marco = boonLevel('e_marco');
    if (marco && !(await this.radiate(marco === 2 ? 3 : 4, 'Marco de Referencia'))) return false;
    const vm = boonLevel('m_vidamedia');
    if (vm && !(await this.radiate(vm === 2 ? 2 : 3, 'Vida Media'))) return false;
    if (this.hasFx('radiacion') && !(await this.radiate(4, 'Radiación'))) return false;
    if (this.hasFx('sabueso')) {
      // v0.48 · maldición del Relato «El sabueso»
      const run = Game.run!;
      run.hp = Math.max(1, run.hp - 5);
      this.calc('El Sabueso te sigue: −5 de vida');
      this.floatText(this.heroX, 200, '−5 (el Sabueso)', '#e08a8a');
    }
    // Asimov y Turing (ecos del Núcleo)
    this.ley3 = false;
    this.jugadasIni = this.played;
    const l1 = boonLevel('as_ley1');
    if (l1) {
      this.gainBlock(l1 === 2 ? 14 : 8);
      this.calc(`Primera Ley (Asimov): un robot guardián te protege, +${l1 === 2 ? 14 : 8} de Bloqueo`);
    }
    const en = boonLevel('tu_enigma');
    if (en && this.alive().length) {
      for (const e of this.alive()) { e.st.fatiga += en; this.refreshEnemy(e); }
      this.calc(`Descifrar Enigma (Turing): conoces su plan → ${en} de Fatiga a todos`);
    }
    const tt = boonLevel('t_torre');
    if (tt && this.alive().length) {
      const n = tt === 2 ? 14 : 8;
      this.calc(`Torre Wardenclyffe (Tesla): energía sin cables, ${n} a todos`);
      await this.rayoTodos(n);
    }
    const om = boonLevel('o_manhattan');
    if (om && !(await this.radiate(om === 2 ? 2 : 3, 'Proyecto Manhattan'))) return false;
    if (this.has('reactor') && !(await this.radiate(2, 'Reactor de Fisión'))) return false;
    if (this.has('tomo')) {
      for (const e of this.alive()) { e.st.block += 6; this.refreshEnemy(e); }
      this.calc('Tomo Prohibido: los enemigos empiezan con 6 de Bloqueo');
    }
    return true;
  }

  /**
   * Radiación: daño que ignora tu Bloqueo. Devuelve false si te mató
   * (y no tenías vida extra).
   */
  private async radiate(n: number, src: string): Promise<boolean> {
    const run = Game.run!;
    run.hp -= n;
    this.hero.setTintFill(0x9bf07a);
    this.time.delayedCall(120, () => this.hero.clearTint());
    this.floatText(this.heroX + 30, 190, `-${n} rad`, '#9bf07a');
    this.calc(`Radiación (${src}): pierdes ${n} de vida (ignora el Bloqueo)`);
    this.refreshPlayer();
    await this.wait(220);
    const sv = boonLevel('duo_solvay'); // Einstein + Curie
    if (sv && run.hp > 0 && this.alive().length) {
      const d = n * (sv + 1);
      this.calc(`Congreso Solvay: la radiación también los alcanza (${d} a todos)`);
      for (const t of [...this.alive()]) await this.hitEnemy(t, d, true, 'res');
    }
    if (run.hp <= 0) return !(await this.dies('la radiación'));
    return true;
  }

  private showFamiliar() {
    const fam = Game.run!.familiar;
    if (!fam) {
      // v0.55 · sin familiar de verdad, aparece tu compañero cosmético (no hace nada en combate)
      const m = mascotaJunto(this, this.heroX - 100, 318, 3.2);
      if (m) { m.setInteractive(); this.tip.attach(m, `Tu compañero: ${FAMILIARS[mascotaActual()!].name}`, 'Te acompaña sólo de adorno. Los familiares que ganas en la expedición sí pelean.'); }
      return;
    }
    const def = FAMILIARS[fam.id];
    if (!def) return;
    const img = this.add.image(this.heroX - 100, 318, def.sprite).setOrigin(0.5, 1).setScale(3.5);
    this.add.ellipse(this.heroX - 100, 320, 50, 8, 0x000000, 0.45).setDepth(-1);
    this.tweens.add({ targets: img, y: 314, duration: 700 + Math.random() * 200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    img.setInteractive();
    this.tip.attach(img, `${def.name} (quedan ${fam.left} combate${fam.left > 1 ? 's' : ''})`, `${def.text}\n${def.lore}`);
    this.famImg = img;
  }

  /** Aviso de encargo cumplido */
  private encargo(premio: number) {
    if (!premio) return;
    this.calc(`¡Encargo cumplido! +${premio} ${T.moneda}`);
    this.floatText(W / 2, 140, `Encargo cumplido +${premio}`, '#e8b070');
    audio.sfx('coin');
    this.hud.refresh();
  }

  /** Penitente: quema kg de su masa (vida) y gana Δv = vₑ·ln(m₀/m₁) */
  private quemar(kg: number, fuente: string) {
    const run = Game.run!;
    const r = rocket(kg, this.ctx());
    run.hp = r.m1;
    const v0 = this.vel;
    this.vel = Math.min(this.vmax, Math.round((this.vel + r.dv) * 10) / 10);
    this.calc(`${fuente}: Δv = ${r.ve}·ln(${r.m0}/${r.m1}) = ${r.dv} m/s → v ${v0} → ${this.vel}`);
    this.floatText(this.heroX - 30, 210, `−${kg} kg`, '#e8a060');
    this.burst(this.heroX - 50, 300, 0xff9a3a, 18);
    this.hud.refresh();
  }

  /** Masa Crítica: ×1.5 si la masa es menor que la mitad de la máxima */
  private critico(dmg: number) {
    const run = Game.run!;
    if (this.critica && run.hp < run.maxHp / 2) {
      this.calc('Masa Crítica: ×1.5');
      return Math.round(dmg * 1.5);
    }
    return dmg;
  }

  /** Rayo eléctrico a todos los enemigos vivos (Tesla) */
  private async rayoTodos(n: number) {
    const g = this.add.graphics().setDepth(650).setBlendMode(Phaser.BlendModes.ADD);
    for (const t of this.alive()) {
      g.lineStyle(3, 0x9ad8ff, 0.95);
      let x = this.heroX + 30, y = 240;
      for (let i = 1; i <= 6; i++) {
        const nx = this.heroX + 30 + ((t.baseX - this.heroX - 30) * i) / 6;
        const ny = 240 + ((260 - 240) * i) / 6 + (i < 6 ? Phaser.Math.Between(-22, 22) : 0);
        g.lineBetween(x, y, nx, ny);
        x = nx; y = ny;
      }
    }
    this.tweens.add({ targets: g, alpha: 0, duration: 380, onComplete: () => g.destroy() });
    for (const t of [...this.alive()]) await this.hitEnemy(t, n, false, 'res');
    const dj = boonLevel('duo_joule'); // Joule + Tesla
    if (dj) {
      for (const t of this.alive()) { t.st.calor += dj === 2 ? 4 : 2; this.refreshEnemy(t); }
      this.calc(`Efecto Joule: Q = I²·R·t → +${dj === 2 ? 4 : 2} de Calor a todos`);
    }
  }

  private beamFrom(x: number, to: EnemyView, color: number) {
    const g = this.add.graphics().setDepth(650).setBlendMode(Phaser.BlendModes.ADD);
    g.lineStyle(4, color, 0.9).lineBetween(x, 260, to.baseX, 260);
    this.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() });
  }

  // ───────────────────────── ALIADO (alma en pena) ─────────────────────────
  private showAliado() {
    const id = Game.run!.aliado;
    const a = id ? ALMAS[id] : null;
    if (!a || (this.kind !== 'elite' && this.kind !== 'boss')) return;
    const x = this.heroX - 150;
    const halo = this.add.image(x, 272, `alma_${a.id}`).setScale(2.3).setTintFill(0xe8c15a).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    const img = this.add.image(x, 272, `alma_${a.id}`).setScale(2.2).setAlpha(0);
    this.tweens.add({ targets: img, alpha: 0.8, duration: 900, delay: 400 });
    this.tweens.add({ targets: halo, alpha: 0.15, duration: 900, delay: 400 });
    this.tweens.add({ targets: [img, halo], y: 266, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    img.setInteractive();
    this.tip.attach(img, `${a.name} (aliado)`, `${a.habilidad}\nTe acompaña en élites y jefes ${a.abismo ? 'hasta el final de este tramo' : 'durante toda la expedición'}.`);
    this.aliadoImg = img;
    if (Game.run!.aliado === 'autocompleto') {
      // la llama amarilla que sale de su yelmo
      const fl = this.add.particles(x, img.y - img.displayHeight * 0.35, 'px', {
        x: { min: -10, max: 10 }, speedY: { min: -70, max: -30 }, speedX: { min: -12, max: 12 }, lifespan: 750, frequency: 22,
        scale: { start: 6, end: 0 }, alpha: { start: 0.9, end: 0 }, tint: [0xffd21a, 0xffa01a, 0xfff07a], blendMode: 'ADD',
      });
      fl.setDepth(img.depth + 1);
    }
    this.time.delayedCall(900, () => this.floatText(x, 190, 'Alma invocada', CSS.gold));
    if (a.id === 'parches') {
      const run = Game.run!;
      const cobro = Math.min(10, run.ergios);
      if (cobro > 0) {
        addErgios(-cobro);
        this.time.delayedCall(1500, () => { this.floatText(x, 170, `−${cobro} Ergios («comisión»)`, '#c8f070'); this.calc(`Parches cobra su comisión: −${cobro} Ergios`); this.hud.refresh(); });
      }
    }
  }

  /** v0.30: el fantasma dorado de un compañero (invocado con su signo antes del jefe) */
  private showFantasma() {
    const f = Game.run!.fantasma;
    if (!f || this.kind !== 'boss' || f.acto !== this.acto) return;
    let av: Record<string, unknown> = {};
    try { av = JSON.parse(f.avatar || '{}'); } catch { av = {}; }
    const key = `fantasma_${f.id}`;
    try { makeHeroFromAvatar(this, av as never, key); } catch { return; }
    const x = this.heroX - (this.aliadoImg ? 80 : 150), y = 280;
    const halo = this.add.image(x, y, key).setScale(2.3).setTintFill(0xe8c15a).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    const img = this.add.image(x, y, key).setScale(2.2).setAlpha(0).setTint(0xfff0c0);
    this.tweens.add({ targets: img, alpha: 0.75, duration: 900, delay: 300 });
    this.tweens.add({ targets: halo, alpha: 0.22, duration: 900, delay: 300 });
    this.tweens.add({ targets: [img, halo], y: y - 6, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    img.setInteractive();
    this.tip.attach(img, `${f.alias} (fantasma invocado)`, 'Un compañero de tu grupo que ya venció a este jefe. Al final de tu turno ataca a un enemigo.');
    this.fantasmaImg = img;
    this.time.delayedCall(800, () => this.floatText(x, 190, `${f.alias} responde a tu llamado`, CSS.gold));
  }

  private async fantasmaActua() {
    const f = Game.run!.fantasma!;
    const img = this.fantasmaImg!;
    const t = Phaser.Utils.Array.GetRandom(this.alive());
    const dmg = Phaser.Math.Between(4, 8) + 2 * this.acto;
    this.tweens.add({ targets: img, x: img.x + 30, duration: 140, yoyo: true, ease: 'Quad.out' });
    const g = this.add.graphics().setDepth(650).setBlendMode(Phaser.BlendModes.ADD);
    g.lineStyle(4, 0xe8c15a, 0.9).lineBetween(img.x + 20, 250, t.baseX, 260);
    this.tweens.add({ targets: g, alpha: 0, duration: 350, onComplete: () => g.destroy() });
    this.calc(`${f.alias} (fantasma): golpea a ${t.st.def.name} (${dmg})`);
    await this.hitEnemy(t, dmg, false, 'res');
  }

  private async aliadoActua() {
    const run = Game.run!;
    const img = this.aliadoImg!;
    const a = ALMAS[run.aliado!];
    this.tweens.add({ targets: img, x: img.x + 30, duration: 140, yoyo: true, ease: 'Quad.out' });
    const rayo = (to: EnemyView) => {
      const g = this.add.graphics().setDepth(650).setBlendMode(Phaser.BlendModes.ADD);
      g.lineStyle(4, 0xe8c15a, 0.9).lineBetween(img.x + 20, 250, to.baseX, 260);
      this.tweens.add({ targets: g, alpha: 0, duration: 350, onComplete: () => g.destroy() });
    };
    if (a.id === 'remiendos') {
      // v0.57 · el traidor sonriente: ayuda… a veces
      const r = Math.random();
      if (r < 0.55) {
        const t = Phaser.Utils.Array.GetRandom(this.alive());
        rayo(t);
        this.calc(`${a.name}: «¡Toma esto!» → ${t.st.def.name} (7)`);
        await this.hitEnemy(t, 7, false, 'res');
      } else if (r < 0.75) {
        const robo = Math.min(run.ergios, Phaser.Math.Between(8, 18));
        run.ergios -= robo;
        this.floatText(img.x, 200, `−${robo} Ergios`, '#ffb040');
        this.calc(`${a.name} te «cuida» la cartera: −${robo} Ergios. «¿Yo? ¡Para nada!»`);
        this.hud.refresh();
      } else if (r < 0.9) {
        this.calc(`${a.name}: «¡Uy, perdón! Se me resbaló la espada.» (6 de daño a ti)`);
        await this.hurtPlayer(6, null);
        if (Game.run!.hp <= 0 && (await this.dies('Remiendos'))) return;
      } else {
        addEntropia(8);
        this.floatText(img.x, 200, '−8 Cordura', '#c8a8ff');
        this.calc(`${a.name} te cuenta, sonriendo, lo que vio allá abajo: −8 de Cordura`);
        this.hud.refresh();
      }
      this.refreshPlayer();
      await this.wait(300);
    } else if (a.id === 'buzo') {
      const t = this.alive().reduce((x, y) => (y.st.hp > x.st.hp ? y : x));
      rayo(t);
      this.calc(`${a.name}: arpón a ${t.st.def.name} (9)`);
      await this.hitEnemy(t, 9, false, 'res');
    } else if (a.id === 'rosa') {
      this.gainBlock(5);
      addEntropia(-2);
      this.floatText(img.x, 200, '+2 Cordura', '#6ee08a');
      this.calc(`${a.name}: +5 de Bloqueo y +2 de Cordura`);
      this.refreshPlayer();
      this.hud.refresh();
      await this.wait(300);
    } else if (a.id === 'arrepentido') {
      this.calc(`${a.name}: recita al revés → 5 a todos (−1 de Cordura)`);
      addEntropia(1);
      for (const t of [...this.alive()]) { rayo(t); await this.hitEnemy(t, 5, false, 'res'); }
      this.hud.refresh();
    } else if (a.id === 'icaro') {
      const t = Phaser.Utils.Array.GetRandom(this.alive());
      const dmg = Phaser.Math.Between(6, 14);
      rayo(t);
      this.calc(`${a.name}: se lanza contra ${t.st.def.name} (${dmg})`);
      await this.hitEnemy(t, dmg, false, 'res');
    } else if (a.id === 'ayudante') {
      this.gainBlock(6);
      run.hp = Math.min(run.maxHp, run.hp + 2);
      this.floatText(img.x, 200, '+2 ❤', CSS.green);
      this.calc(`${a.name}: +6 de Bloqueo y +2 de vida`);
      this.refreshPlayer();
      this.hud.refresh();
      await this.wait(300);
    } else if (a.id === 'radian') {
      // sin(θ) con θ en grados… interpretado como radianes
      const th = Phaser.Utils.Array.GetRandom([30, 45, 60, 90, 120, 180, 270]);
      const v = Math.sin(th); // ¡en radianes!
      const r2 = Math.round(v * 100) / 100;
      this.floatText(img.x, 190, `sin(${th}) = ${r2}`, '#ff9a7a');
      if (v > 0.3) {
        const t = Phaser.Utils.Array.GetRandom(this.alive());
        const dmg = Math.round(18 * v);
        rayo(t);
        this.calc(`${a.name}: sin(${th}) = ${r2} (en RAD) → ${dmg} de daño`);
        await this.hitEnemy(t, dmg, false, 'res');
      } else if (v < -0.3) {
        const b = Math.round(10 * -v);
        this.gainBlock(b);
        this.calc(`${a.name}: sin(${th}) = ${r2}, salió negativo… lo usa como escudo: +${b} de Bloqueo`);
      } else {
        this.calc(`${a.name}: sin(${th}) = ${r2}. «Math ERROR». No hace nada.`);
        await this.wait(300);
      }
    } else if (a.id === 'doctorando') {
      this.calc(`${a.name}: «según la literatura…» 2 de Fatiga a todos`);
      for (const t of this.alive()) {
        t.st.fatiga += 2;
        rayo(t);
        this.refreshEnemy(t);
      }
      await this.wait(300);
    } else if (a.id === 'procrastinador') {
      this.aliadoN++;
      if (this.aliadoN % 2 === 1) {
        this.calc(`${a.name}: «Mañana lo hago…» (no hace nada este turno)`);
        this.floatText(img.x, 190, 'zzz…', CSS.dim);
        await this.wait(300);
      } else {
        this.calc(`${a.name}: ¡suelta todo lo acumulado! 10 a todos`);
        for (const t of [...this.alive()]) { rayo(t); await this.hitEnemy(t, 10, false, 'res'); }
      }
    } else if (a.id === 'decimales') {
      const t = this.alive().reduce((x, y) => (y.st.hp < x.st.hp ? y : x));
      const exacto = t.st.hp <= 12;
      const dmg = exacto ? t.st.hp : 6;
      rayo(t);
      this.calc(`${a.name}: ${exacto ? `remate exacto: ${dmg} (ni uno más)` : 'golpe preciso: 6'}`);
      await this.hitEnemy(t, dmg, exacto, 'res');
    } else if (a.id === 'duda') {
      const t = Phaser.Utils.Array.GetRandom(this.alive());
      rayo(t);
      this.calc(`${a.name}: lanza su cadena (4)`);
      await this.hitEnemy(t, 4, false, 'res');
    } else if (a.id === 'autocompleto') {
      // la llama propone… y a veces alucina
      if (Math.random() < 0.25) {
        this.floatText(img.x, 190, '¡Alucinación!', '#ffd21a');
        this.calc(`${a.name}: la llama afirma que F = m/a… nadie recibe daño. +3 de Locura`);
        addEntropia(3);
        this.hud.refresh();
        await this.wait(350);
      } else {
        this.calc(`${a.name}: la llama delirante arde sobre todos (7)`);
        for (const t of [...this.alive()]) {
          const g = this.add.graphics().setDepth(650).setBlendMode(Phaser.BlendModes.ADD);
          g.lineStyle(5, 0xffd21a, 0.9).lineBetween(img.x + 20, 230, t.baseX, 260);
          this.tweens.add({ targets: g, alpha: 0, duration: 350, onComplete: () => g.destroy() });
          await this.hitEnemy(t, 7, false, 'res');
        }
      }
    } else if (a.id === 'manco') {
      // producto cruz por determinante: el signo de rx·Fy − ry·Fx dice si sale o entra del plano
      const v = () => Phaser.Math.Between(-3, 4) || 1;
      const rx = v(), ry = v(), fx = v(), fy = v();
      const z = rx * fy - ry * fx;
      this.floatText(img.x + 90, 186, `(${rx},${ry})×(${fx},${fy}) = ${z}k`, '#7ad0ff');
      if (z > 0) {
        const t = Phaser.Utils.Array.GetRandom(this.alive());
        const dmg = Math.min(16, z + 2);
        rayo(t);
        this.calc(`${a.name}: r×F = ${rx}·${fy} − ${ry}·${fx} = +${z} (sale del plano) → ${dmg} de daño`);
        await this.hitEnemy(t, dmg, false, 'res');
      } else if (z < 0) {
        const b = Math.min(14, -z + 2);
        this.gainBlock(b);
        this.calc(`${a.name}: r×F = ${rx}·${fy} − ${ry}·${fx} = ${z} (entra al plano) → +${b} de Bloqueo`);
        await this.wait(300);
      } else {
        this.calc(`${a.name}: r×F = 0, r y F son paralelos: no hay torque.`);
        await this.wait(300);
      }
    } else if (a.id === 'histeresis') {
      // cambia de forma cada 2 turnos, o si superaste su «límite elástico» (perdiste 12+ de vida en el turno)
      this.aliadoN++;
      const perdida = this.histHp - run.hp;
      const antes = this.histBestia;
      if (perdida >= 12) this.histBestia = true;
      else if (this.aliadoN % 2 === 0) this.histBestia = !this.histBestia;
      if (antes !== this.histBestia) {
        this.floatText(img.x, 176, this.histBestia ? '¡Forma bestia!' : 'Vuelve a ser humano', this.histBestia ? '#ff5a3a' : CSS.gold);
        img.setTint(this.histBestia ? 0xff7a5a : 0xffffff);
        this.tweens.add({ targets: img, scale: this.histBestia ? 2.6 : 2.2, duration: 300 });
      }
      if (this.histBestia) {
        this.calc(`${a.name} (bestia): ${perdida >= 12 && !antes ? 'superaste su límite elástico. ' : ''}9 a todos… y 2 a ti`);
        for (const t of [...this.alive()]) { rayo(t); await this.hitEnemy(t, 9, false, 'res'); }
        run.hp = Math.max(1, run.hp - 2);
        this.floatText(this.heroX, 200, '−2', '#e05050');
      } else {
        this.gainBlock(6);
        run.hp = Math.min(run.maxHp, run.hp + 2);
        this.calc(`${a.name} (humano): +6 de Bloqueo y +2 de vida`);
        await this.wait(300);
      }
      this.histHp = run.hp;
      this.refreshPlayer();
      this.hud.refresh();
    } else if (a.id === 'cebollin') {
      // fricción estática: acumula fuerza sin moverse hasta superar μs·N; después basta la cinética
      this.aliadoN++;
      const F = 4 * this.aliadoN, umbral = 12;
      if (F < umbral) {
        this.floatText(img.x, 186, 'Mmm…', CSS.dim);
        this.calc(`${a.name}: empuja con F = ${F} N < μs·N = ${umbral} N. No se mueve… mmm.`);
        await this.wait(300);
      } else {
        const t = Phaser.Utils.Array.GetRandom(this.alive());
        if (F === umbral || F - 4 < umbral) this.floatText(img.x, 176, '¡Arrancó!', CSS.gold);
        rayo(t);
        this.calc(`${a.name}: ${F - 4 < umbral ? `F = ${F} N ≥ μs·N: ¡arrancó! ` : ''}en movimiento sólo hay fricción cinética → 10 de daño`);
        await this.hitEnemy(t, 10, false, 'res');
      }
    } else if (a.id === 'helios') {
      // la energía que no usaste se transforma en daño
      const j = Math.max(0, this.energy);
      const dmg = 5 * j + 3;
      const t = Phaser.Utils.Array.GetRandom(this.alive());
      const g = this.add.graphics().setDepth(650).setBlendMode(Phaser.BlendModes.ADD);
      g.lineStyle(6, 0xfff0a0, 0.9).lineBetween(img.x + 20, 240, t.baseX, 260);
      this.tweens.add({ targets: g, alpha: 0, duration: 400, onComplete: () => g.destroy() });
      this.floatText(img.x, 186, `☀ ${j} J → ${dmg}`, '#fff0a0');
      this.calc(`${a.name}: ${j} J sin usar se transforman en luz → ${dmg} de daño. ¡Alabado sea el Sol!`);
      await this.hitEnemy(t, dmg, false, 'res');
    } else if (a.id === 'parches') {
      const t = Phaser.Utils.Array.GetRandom(this.alive());
      rayo(t);
      this.calc(`${a.name}: golpe traicionero a ${t.st.def.name} (12)`);
      await this.hitEnemy(t, 12, false, 'res');
      if (Math.random() < 0.25) {
        run.hp = Math.max(1, run.hp - 3);
        this.floatText(this.heroX, 200, '−3', '#e05050');
        this.calc(`${a.name}: «¡Ups!» La reacción de su golpe te alcanza (3ª ley): −3 de vida`);
        this.refreshPlayer();
        this.hud.refresh();
      }
    } else if (a.id === 'hanbei') {
      if (this.hanbeiE > 0) {
        const t = this.alive().reduce((x, y) => (y.st.hp > x.st.hp ? y : x));
        const dmg = this.hanbeiE;
        this.hanbeiE = 0;
        rayo(t);
        this.calc(`${a.name}: la energía que recibió por ti no se perdió → la devuelve a ${t.st.def.name} (${dmg})`);
        await this.hitEnemy(t, dmg, false, 'res');
      } else {
        this.calc(`${a.name}: guarda la posición.`);
        await this.wait(250);
      }
    } else if (a.id === 'gough') {
      // alcance de un tiro parabólico: R ∝ sen(2θ)
      const th = Phaser.Utils.Array.GetRandom([15, 30, 45, 60, 75]);
      const f = Math.sin((2 * th * Math.PI) / 180);
      const dmg = Math.round(16 * f);
      const t = Phaser.Utils.Array.GetRandom(this.alive());
      // la flecha dibuja su parábola
      const g = this.add.graphics().setDepth(650);
      g.lineStyle(3, 0x9ad8f0, 0.9).beginPath();
      const x0 = img.x + 10, y0 = 240, x1 = t.baseX, y1 = 250, hmax = 40 + 160 * Math.sin((th * Math.PI) / 180) ** 2;
      for (let k = 0; k <= 20; k++) { const u = k / 20; const xx = x0 + (x1 - x0) * u, yy = y0 + (y1 - y0) * u - 4 * hmax * u * (1 - u); if (k) g.lineTo(xx, yy); else g.moveTo(xx, yy); }
      g.strokePath();
      this.tweens.add({ targets: g, alpha: 0, duration: 600, delay: 200, onComplete: () => g.destroy() });
      this.floatText(img.x + 60, 176, `θ = ${th}° → sen(${2 * th}°) = ${f.toFixed(2)}`, '#9ad8f0');
      this.calc(`${a.name}: dispara a θ = ${th}°. Alcance ∝ sen(2θ) = ${f.toFixed(2)} → ${dmg} de daño${th === 45 ? ' (¡ángulo óptimo!)' : ''}`);
      await this.hitEnemy(t, dmg, false, 'res');
    } else if (a.id === 'bernoulli') {
      this.calc(`${a.name}: ¡la energía se conserva! 5 a todos`);
      for (const t of this.alive()) {
        rayo(t);
        await this.hitEnemy(t, 5, false, 'res');
      }
    }
  }

  private famHop() {
    if (!this.famImg) return;
    this.tweens.add({ targets: this.famImg, x: this.famImg.x + 24, duration: 120, yoyo: true, ease: 'Quad.out' });
  }

  /** Un rayo del héroe (o su familiar) hacia un enemigo */
  private beam(to: EnemyView, color: number) {
    const g = this.add.graphics().setDepth(650).setBlendMode(Phaser.BlendModes.ADD);
    g.lineStyle(4, color, 0.9).lineBetween(this.heroX + 30, 250, to.baseX, 260);
    this.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() });
  }

  // ───────────────────────── POCIONES ─────────────────────────
  /** Usa una poción (la llama la barra superior). Devuelve true si se usó. */
  private usePotion(id: string): boolean {
    if (this.busy || this.bannerT.getData('ended') || this.bannerT.getData('dead') || this.discardMode > 0) return false;
    const run = Game.run!;
    const al = this.alive();
    switch (id) {
      case 'vida': run.hp = Math.min(run.maxHp, run.hp + 15); this.floatText(this.heroX, 200, '+15', CSS.green); break;
      case 'mayor': run.maxHp += 5; run.hp = Math.min(run.maxHp, run.hp + 30); this.floatText(this.heroX, 200, '+30', CSS.green); break;
      case 'energia': this.energy += 2; break;
      case 'bloqueo': this.gainBlock(12); break;
      case 'masa':
        if (this.usaVel) this.vel = Math.min(this.vmax, this.vel + 2);
        else this.masa += 2;
        break;
      case 'aceite':
        this.friccion = 0;
        if (this.usaVel) this.vel = Math.min(this.vmax, this.vel + 2);
        else this.acel += 3;
        break;
      case 'tinta': this.drawCards(3); break;
      case 'fuego': al.forEach((e) => { e.st.calor += 6; this.burst(e.baseX, 260, 0xc87533, 14); this.refreshEnemy(e); }); break;
      case 'corrosivo': al.forEach((e) => { e.st.fatiga += 2; this.refreshEnemy(e); }); break;
      case 'leyden':
        this.busy = true;
        (async () => {
          for (const e of this.alive()) { this.beam(e, 0x9bf07a); await this.hitEnemy(e, 10, false, 'res'); }
          this.busy = false;
          await this.checkEnd();
        })();
        break;
      default: return false;
    }
    this.calc(`Poción: ${POCIONES[id].name} — ${POCIONES[id].text}`);
    this.refreshPlayer();
    return true;
  }

  // ───────────────────────── HIBBELERIUS ─────────────────────────
  /** Aura de el Autor Eterno: resplandor, fórmulas que orbitan y almas que suben */
  private hibAura(sprite: Phaser.GameObjects.Image, x: number) {
    const glow = this.add.ellipse(x, 230, 260, 300, 0x6a3f8a, 0.12).setBlendMode(Phaser.BlendModes.ADD).setDepth(-2);
    this.tweens.add({ targets: glow, alpha: 0.05, scaleX: 1.08, duration: 1600, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: sprite, y: sprite.y - 8, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const eqs = ['F = m·a', '½mv²', '∫F dt', 'ΣM = Iα', 'mv₁ = mv₂', 'U = mgh'];
    eqs.forEach((e, i) => {
      const t = txt(this, x, 200, e, 18, '#b89ad0').setOrigin(0.5).setAlpha(0.55).setDepth(-1);
      const o = { a: (i / eqs.length) * Math.PI * 2 };
      this.tweens.add({
        targets: o, a: o.a + Math.PI * 2, duration: 14000, repeat: -1,
        onUpdate: () => t.setPosition(x + Math.cos(o.a) * 150, 205 + Math.sin(o.a) * 46).setDepth(Math.sin(o.a) > 0 ? 5 : -3),
      });
    });
    this.add.particles(x, 330, 'px', {
      x: { min: -90, max: 90 }, speedY: { min: -50, max: -20 }, lifespan: 2400, frequency: 120,
      scale: { start: 1.6, end: 0 }, alpha: { start: 0.6, end: 0 }, tint: [0x8e5bb0, 0xc8a050, 0x7fd8ff], blendMode: 'ADD',
    }).setDepth(-1);
  }

  /** Aura de AM: resplandor rojo, código verde que cae y el ojo que late */
  private amAura(sprite: Phaser.GameObjects.Image, x: number) {
    const glow = this.add.ellipse(x, 200, 240, 300, 0xa82a2a, 0.12).setBlendMode(Phaser.BlendModes.ADD).setDepth(-2);
    this.tweens.add({ targets: glow, alpha: 0.04, scaleX: 1.1, duration: 1300, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: sprite, y: sprite.y - 6, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const ojo = this.add.circle(x, 330 - (64 - 22) * sprite.scaleX, 14, 0xff3a1a, 0.35).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: ojo, scale: 1.6, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    const odio = ['ODIO', 'H A T E', '387.44 millones', 'dx/dt', '∫', 'ODIO'];
    odio.forEach((w, i) => {
      const t = txt(this, x - 130 + i * 52, 60, w, 14, '#3aff6a').setAlpha(0).setDepth(-1);
      this.tweens.add({ targets: t, y: 330, alpha: { from: 0.5, to: 0 }, duration: 4200, delay: i * 700, repeat: -1 });
    });
  }

  /** AM dispara un rayo rojo desde su ojo */
  private amRayo(from: EnemyView) {
    return new Promise<void>((res) => {
      const y0 = 330 - (64 - 22) * from.sprite.scaleY;
      const g = this.add.graphics().setDepth(650).setBlendMode(Phaser.BlendModes.ADD);
      g.lineStyle(10, 0xff3a1a, 0.5).lineBetween(from.baseX, y0, this.heroX + 10, 250);
      g.lineStyle(3, 0xffd27a, 1).lineBetween(from.baseX, y0, this.heroX + 10, 250);
      this.tweens.add({ targets: g, alpha: 0, duration: 380, onComplete: () => { g.destroy(); res(); } });
    });
  }

  /** Hoces giratorias que vuelan de Hibbelerius hacia el héroe */
  private hoces(from: EnemyView) {
    return new Promise<void>((res) => {
      const n = 3;
      for (let i = 0; i < n; i++) {
        const h = this.add.image(from.baseX - 60, 170 + i * 40, 'i_hoz').setScale(4).setDepth(650);
        this.tweens.add({ targets: h, angle: -720, duration: 520, delay: i * 90 });
        this.tweens.add({
          targets: h, x: this.heroX + 10, y: 250 + (i - 1) * 24, duration: 520, delay: i * 90, ease: 'Quad.in',
          onComplete: () => { h.destroy(); if (i === n - 1) res(); },
        });
      }
    });
  }

  private hibPhase(ev: EnemyView, cap: string, quote: string, quien = 'Hibbelerius pasa la página') {
    const am = ev.st.def.id === 'am';
    this.cameras.main.flash(400, am ? 160 : 120, am ? 30 : 60, am ? 30 : 160);
    this.cameras.main.shake(300, 0.01);
    this.floatText(ev.baseX, 110, cap, am ? '#ff8a7a' : '#b89ad0');
    this.calc(`${quien}: ${cap}`);
    this.calc(quote);
    ev.sprite.setTint(am ? (ev.st.phase3 ? 0xff9a8a : 0xffd0c0) : ev.st.phase3 ? 0xffb0a0 : 0xd8c0ff);
    this.burst(ev.baseX, 200, 0xd8ccb0, 40);
  }

  private banner(s: string, color = CSS.gold) {
    this.bannerT.setText(s).setColor(color).setAlpha(0).setScale(0.6);
    return new Promise<void>((r) => {
      this.tweens.add({
        targets: this.bannerT, alpha: 1, scale: 1, duration: 260, ease: 'Back.out',
        onComplete: () => this.tweens.add({ targets: this.bannerT, alpha: 0, delay: 650, duration: 300, onComplete: () => r() }),
      });
    });
  }
}

const r1 = (x: number) => Math.round(x * 10) / 10;
void CH;
void H;
