import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { RARAS_ABISMO } from '../data/abismo_modo';
import { CARDS } from '../data/cards';
import { base, cristalDe, defDiente, DIENTES, esParasito, HUECOS, ponerDiente, sortearDientes, sortearParasito } from '../data/dientes';
import { Efecto, OpcionRelato, RELATO } from '../data/relatos';
import { EFFECTS } from '../data/effects';
import { FAMILIARS } from '../data/familiars';
import { addCard, addEffect, addFamiliar, addEntropia, aplicarSarro, Game, logEvent, saveLocal, sonarSueno, syncRun } from '../state';
import { topBar } from '../ui/hud';
import { button, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';

/**
 * RELATOS DEL ABISMO (v0.43): encuentros basados en cuentos de Lovecraft.
 * Los datos están en src/data/relatos.ts. Si la opción trae pregunta, se resuelve
 * en la escena Rune (source 'relato') y vuelve a aplicarEfecto().
 */

/** Pone un diente ganado en un relato. Los parásitos se pegan solos (si no hay hueco, desplazan a un diente normal). */
export function darDiente(tipo: string): string {
  const r = Game.run!;
  const dent = (r.dientes ??= Array(HUECOS).fill(null));
  while (dent.length < HUECOS) dent.push(null);
  const tengo = dent.filter((x): x is string => !!x);
  let id: string;
  if (tipo === 'parasito') id = sortearParasito(dent);
  else if (tipo === 'copia') {
    const normales = tengo.filter((x) => !esParasito(x));
    if (!normales.length) return 'No tienes dientes que copiar: el reflejo sólo sonríe.';
    id = base(Phaser.Utils.Array.GetRandom(normales));
  } else if (tipo === 'astro') {
    // v0.51 · un Astro (planeta) al azar; si ya los tienes todos, uno raro
    const astros = Object.values(DIENTES).filter((d) => d.tipo === 'astro' && d.rareza !== 'legendario' && !tengo.map(base).includes(d.id));
    id = astros.length ? Phaser.Utils.Array.GetRandom(astros).id : sortearDientes(1, tengo, 1)[0];
  } else if (tipo === 'raro' || tipo === 'legendario') {
    id = sortearDientes(1, tengo, 1, { legendario: tipo === 'legendario' })[0];
    if (tipo === 'raro' && defDiente(id).rareza === 'comun') id = sortearDientes(1, tengo, 1)[0];
  } else id = tipo;
  const d = defDiente(id);
  if (ponerDiente(dent, id)) return `${d.tipo === 'parasito' ? '☣ Se te pega' : 'Ganas'}: ${d.nombre}${cristalDe(id) !== undefined ? ' (Cristal)' : ''}.`;
  if (d.tipo === 'parasito') {
    const libres = dent.map((x, i) => (x && !esParasito(x) ? i : -1)).filter((i) => i >= 0);
    if (!libres.length) return 'Tu dentadura ya está llena de parásitos. Este se va a buscar otra boca.';
    const i = Phaser.Utils.Array.GetRandom(libres);
    const viejo = defDiente(dent[i]!).nombre;
    dent[i] = id;
    return `☣ ${d.nombre} se pega a tu dentadura y empuja fuera a ${viejo}.`;
  }
  r.dientePendiente = id;
  return `Tu dentadura está llena: al volver al mapa decides qué diente cambiar por ${d.nombre}.`;
}

/** Aplica el efecto de un relato y devuelve el texto de lo que pasó */
export function aplicarEfecto(e: Efecto): string {
  const r = Game.run!;
  const partes: string[] = [];
  if (e.maxHp) { r.maxHp += e.maxHp; partes.push(`${e.maxHp > 0 ? '+' : ''}${e.maxHp} de Vida máxima`); }
  if (e.hp) { r.hp = Math.max(1, Math.min(r.maxHp, r.hp + e.hp)); partes.push(`${e.hp > 0 ? '+' : ''}${e.hp} de vida`); }
  if (e.ergios) { r.ergios = Math.max(0, r.ergios + e.ergios); partes.push(`${e.ergios > 0 ? '+' : ''}${e.ergios} Ergios`); }
  if (e.cordura) { addEntropia(-e.cordura); partes.push(`${e.cordura > 0 ? '+' : ''}${e.cordura} de Cordura`); }
  if (e.diente) partes.push(darDiente(e.diente));
  if (e.reanimar) {
    const rota = r.cristalesRotos?.pop();
    if (rota) { addCard(rota, false, 'cristal'); partes.push(`Revive: ${CARDS[rota].name} (Cristal)`); }
    else {
      const c = r.deck.filter((x) => !x.ed && CARDS[x.id].rarity !== 'estado');
      if (c.length) { const x = Phaser.Utils.Array.GetRandom(c); x.ed = 'cristal'; partes.push(`${CARDS[x.id].name} se vuelve de Cristal`); }
    }
  }
  if (e.retrato || e.retratoMalo) {
    const c = r.deck.filter((x) => CARDS[x.id].rarity !== 'estado');
    if (c.length) {
      const x = Phaser.Utils.Array.GetRandom(c);
      r.deck = r.deck.filter((y) => y !== x);
      if (e.retrato) {
        const nueva = Phaser.Utils.Array.GetRandom(RARAS_ABISMO);
        addCard(nueva, false, 'lamina');
        partes.push(`${CARDS[x.id].name} → ${CARDS[nueva].name} (Lámina)`);
      } else {
        addCard('susurro'); addCard('susurro');
        partes.push(`${CARDS[x.id].name} → 2 Susurros`);
      }
    }
  }
  if (e.familiar) {
    const fid = addFamiliar(e.familiar);
    partes.push(r.familiarOferta?.id === fid ? `${FAMILIARS[fid].name} quiere acompañarte: al volver al mapa eliges con qué familiar te quedas` : `Te acompaña: ${FAMILIARS[fid].name} (${FAMILIARS[fid].combats} combates)`);
  }
  if (e.pierdeDiente) {
    // v0.48 · pierdes dientes al azar (los parásitos no se sueltan)
    const dent = r.dientes ?? [];
    const idx = Phaser.Utils.Array.Shuffle(dent.map((x, i) => (x && !esParasito(x) ? i : -1)).filter((i) => i >= 0)).slice(0, e.pierdeDiente);
    if (idx.length) { partes.push(`Pierdes: ${idx.map((i) => defDiente(dent[i]!).nombre).join(', ')}`); idx.forEach((i) => { dent[i] = null; }); }
    else partes.push('No tenías dientes que perder.');
  }
  if (e.maldicion) {
    addEffect(e.maldicion[0], e.maldicion[1]);
    partes.push(`Maldición: ${EFFECTS[e.maldicion[0]].name} (${e.maldicion[1]} combates)`);
  }
  aplicarSarro(r);
  saveLocal();
  return partes.join('\n');
}

/** Tira el azar de una opción sin pregunta */
export function tirar(o: OpcionRelato): Efecto {
  let x = Math.random();
  for (const s of o.salidas ?? []) { if (x < s.p) return s.e; x -= s.p; }
  return (o.salidas ?? [])[0]?.e ?? { texto: '' };
}

export class RelatoScene extends Phaser.Scene {
  constructor() { super('Relato'); }

  create(data: { floor: number; id: string }) {
    const run = Game.run!;
    const rel = RELATO(data.id)!;
    this.cameras.main.fadeIn(500);
    audio.play('abismo2');
    const sueno = !!rel.sueno; // v0.51 · los sueños se ven violetas y con estrellas
    if (sueno && !run.debug) sonarSueno(rel.id);
    this.add.rectangle(0, 0, W, H, sueno ? 0x0a0618 : 0x04080a).setOrigin(0);
    const niebla = this.add.graphics();
    for (let i = 0; i < 10; i++) niebla.fillStyle(sueno ? 0x2a1a4a : 0x0c1a18, 0.25).fillEllipse(Math.random() * W, 380 + Math.random() * 120, 300, 40);
    if (sueno) for (let i = 0; i < 50; i++) {
      const st = this.add.circle(Math.random() * W, 40 + Math.random() * (H - 60), 1, 0xe8dcff, 0.3 + Math.random() * 0.5);
      this.tweens.add({ targets: st, alpha: 0.1, duration: 900 + Math.random() * 1500, yoyo: true, repeat: -1 });
    }
    vignette(this);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);

    // ilustración: el objeto del cuento, grande y flotando, con un halo
    const halo = this.add.circle(200, 270, 120, rel.tinte, 0.08);
    this.tweens.add({ targets: halo, scale: 1.15, alpha: 0.03, duration: 1800, yoyo: true, repeat: -1 });
    const ic = this.add.image(200, 270, rel.icono).setScale(12).setTint(rel.tinte);
    this.tweens.add({ targets: ic, y: 262, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, 200, 400, rel.propio ? `Del diario de Ignacio Montemayor\n(${rel.anio})` : `${sueno ? 'Sueño basado en' : 'Basado en'} «${rel.obra}»\nH. P. Lovecraft (${rel.anio})`, 15, sueno ? '#9a8ac0' : '#6a8a80', { align: 'center' }).setOrigin(0.5, 0);

    const tt = title(this, W / 2 + 90, 70, rel.titulo, 36, sueno ? '#c8b8ff' : '#9ad8c8');
    if (tt.width > 600) tt.setScale(600 / tt.width);
    const g = this.add.graphics();
    frame(g, 380, 100, 550, 150, sueno ? 0x0e0a1c : 0x080e0e, sueno ? 0x5a4aa8 : 0x2c5a4e, 0.95);
    txt(this, 398, 114, rel.intro, 18, CSS.bone, { wordWrap: { width: 514 }, lineSpacing: 3 });

    const opciones = this.add.container(0, 0);
    const resultado = this.add.container(0, 0);
    const terminar = () => {
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      fadeTo(this, 'Map');
    };
    rel.opciones.forEach((o, i) => {
      const y = 290 + i * 74;
      const falta = o.need?.ergios && run.ergios < o.need.ergios;
      const b = button(this, 655, y, 540, 44, o.label, () => {
        if (falta) return;
        audio.sfx('card');
        if (o.pregunta) {
          logEvent('relato', '', '', { id: rel.id, opcion: i });
          return fadeTo(this, 'Rune', { floor: data.floor, source: 'relato', relatoId: rel.id, opcion: i });
        }
        const e = tirar(o);
        const res = aplicarEfecto(e);
        logEvent('relato', '', '', { id: rel.id, opcion: i, resultado: res });
        hud.refresh();
        opciones.setVisible(false);
        const rg = this.add.graphics();
        frame(rg, 380, 270, 550, 200, 0x0c0a12, UI.gold, 0.97);
        resultado.add(rg);
        resultado.add(txt(this, 400, 286, e.texto, 19, '#d8c8a0', { wordWrap: { width: 510 }, lineSpacing: 3 }));
        resultado.add(txt(this, 400, 370, res, 18, CSS.gold, { wordWrap: { width: 510 } }));
        if (e.combate) {
          // v0.51 · pesadilla: la vida que pierdas allá no es real
          const pelear = () => {
            run.suenoHp = run.hp;
            saveLocal();
            fadeTo(this, 'Combat', { kind: e.combate === 'bokrug' ? 'elite' : 'normal', floor: data.floor, sueno: e.combate });
          };
          resultado.add(button(this, 655, 496, 260, 40, 'Pelear en el sueño', pelear, { size: 20, color: 0x9a6ad0 }));
        } else resultado.add(button(this, 655, 496, 220, 40, sueno ? 'Despertar' : 'Continuar', terminar, { size: 20, color: UI.gold }));
      }, { size: 19, color: i === rel.opciones.length - 1 ? UI.border : 0x2c5a4e });
      if (falta) b.setEnabled(false);
      opciones.add(b);
      opciones.add(txt(this, 655, y + 26, o.risk + (falta ? ` (te faltan Ergios)` : ''), 14, CSS.dim, { align: 'center', wordWrap: { width: 540 } }).setOrigin(0.5, 0));
    });
  }
}
