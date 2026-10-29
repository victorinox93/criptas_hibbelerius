import { EDICIONES, sortearEdicion } from '../data/abismo_modo';
import Phaser from 'phaser';
import { darMaldicion } from '../data/maldiciones';
import { legendariasDisponibles } from '../data/cards';
import { CSS, UI } from '../art/palette';
import { W } from '../config';
import { audio } from '../audio';
import { T } from '../textos';
import { CARDS, CONJUNTOS, rewardPool } from '../data/cards';
import { RELIC_POOL, RELICS, RELIQUIAS_ABISMO, cuentaTope, MAX_RELIQUIAS } from '../data/relics';
import { addCard, addFamiliar, Game, saveLocal, unlock, nivelActual, amVencido } from '../state';
import { FAMILIARS } from '../data/familiars';
import { MAX_POCIONES, POCIONES, pocionesDisponibles } from '../data/pociones';
import { cardView } from '../ui/card';
import { topBar } from '../ui/hud';
import { button, dungeonBackground, fadeTo, frame, icon, title, Tooltip, txt } from '../ui/widgets';

export function grantRelic(id: string) {
  const r = Game.run!;
  if (r.relics.includes(id)) return;
  r.relics.push(id);
  unlock('relics', id);
  if (id === 'ascua') {
    r.maxHp += 10;
    r.hp = Math.min(r.maxHp, r.hp + 10);
  }
  if (id === 'coloso') {
    r.maxHp += 30;
    r.hp = Math.min(r.maxHp, r.hp + 30);
  }
  if (id === 'llaveRlyeh') { darMaldicion(); darMaldicion(); } // v0.71 · reliquia maldita
  // ¿te pasaste del límite? La capa superior (Overlay) te pide descartar una
  if (r.relics.filter(cuentaTope).length > MAX_RELIQUIAS) r.reliquiaNueva = id;
}

/** Descarta una reliquia y deshace lo que dio al obtenerse */
export function descartarRelic(id: string) {
  const r = Game.run!;
  const i = r.relics.indexOf(id);
  if (i < 0) return;
  r.relics.splice(i, 1);
  const quitar = id === 'ascua' ? 10 : id === 'coloso' ? 30 : 0;
  if (quitar) { r.maxHp -= quitar; r.hp = Math.min(r.hp, r.maxHp); }
}

export function randomRelics(n: number) {
  const owned = Game.run!.relics;
  // v0.83 · en el Abismo también salen sus reliquias propias (con el doble de probabilidad)
  const pool = Game.run!.modo === 'abismo' ? [...RELIC_POOL, ...RELIQUIAS_ABISMO, ...RELIQUIAS_ABISMO] : RELIC_POOL;
  return [...new Set(Phaser.Utils.Array.Shuffle(pool.filter((x) => !owned.includes(x))))].slice(0, n);
}

export class RewardScene extends Phaser.Scene {
  constructor() { super('Reward'); }

  create(data: { kind: string; ergios?: number }) {
    this.cameras.main.fadeIn(300);
    audio.play('mapa');
    dungeonBackground(this, 77, 0x18141e);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);
    title(this, W / 2, 72, T.botin.titulo, 48);
    if (data.ergios) {
      icon(this, W / 2 - 70, 112, 'i_coin', 3);
      txt(this, W / 2 - 52, 112, `+${data.ergios} ${T.moneda}`, 24, CSS.gold).setOrigin(0, 0.5);
      audio.sfx('coin');
    }

    let y0 = 160;
    // azar: una élite siempre da reliquia; un combate normal, a veces (10 %)
    const lucky = data.kind !== 'elite' && Math.random() < 0.1;
    if (data.kind === 'elite' || lucky) {
      const [rid] = randomRelics(1);
      if (rid) {
        grantRelic(rid);
        hud.refresh();
        const rel = RELICS[rid];
        const g = this.add.graphics();
        frame(g, W / 2 - 230, 132, 460, 70, UI.panel, UI.gold);
        icon(this, W / 2 - 196, 167, rel.icon, 4);
        txt(this, W / 2 - 166, 140, `${lucky ? '¡Hallazgo! ' : ''}${T.botin.reliquia}: ${rel.name}`, 24, CSS.gold);
        txt(this, W / 2 - 166, 168, rel.text, 20, CSS.bone);
        y0 = 222;
      }
    }
    // pociones: 40 % tras un combate normal, 75 % tras una élite
    const run = Game.run!;
    run.pociones ??= [];
    if (run.pociones.length < MAX_POCIONES && Math.random() < (data.kind === 'elite' ? 0.75 : 0.4)) {
      const pid = Phaser.Utils.Array.GetRandom(pocionesDisponibles(nivelActual()));
      run.pociones.push(pid);
      hud.refresh();
      const pi = this.add.image(W / 2 - 290, y0 - 52, `pot_${pid}`).setScale(3.4);
      tip.attach(pi, POCIONES[pid].name, POCIONES[pid].text);
      txt(this, W / 2 - 290, y0 - 20, `Poción: ${POCIONES[pid].name}`, 18, CSS.gold).setOrigin(0.5);
    }
    // azar: tras una élite, a veces una criatura decide seguirte (30 %)
    if (data.kind === 'elite' && Math.random() < 0.3) {
      const fid = addFamiliar('random');
      const f = FAMILIARS[fid];
      hud.refresh();
      const fi = this.add.image(W / 2 + 280, y0 - 52, f.sprite).setScale(3);
      tip.attach(fi, f.name, f.text);
      txt(this, W / 2 + 280, y0 - 20, run.familiarOferta?.id === fid ? `${f.name} quiere seguirte` : `${f.name} te sigue`, 18, '#c8a8e8').setOrigin(0.5);
    }

    txt(this, W / 2, y0, T.botin.elige, 26, CSS.bone).setOrigin(0.5);
    // en el Acto III, las cartas de impulso salen el doble
    const base = rewardPool(Game.run!.clase, Game.run!.acto, nivelActual(), amVencido());
    const abismo = Game.run!.modo === 'abismo';
    // en el Abismo, las cartas del Abismo salen el triple
    const weighted = abismo ? [...base, ...base.filter((id) => CARDS[id].abismo), ...base.filter((id) => CARDS[id].abismo)]
      : Game.run!.acto >= 3 ? [...base, ...base.filter((id) => CARDS[id].act === 3)] : base;
    const pool = Phaser.Utils.Array.Shuffle(weighted.filter((id) => CARDS[id].rarity !== 'rara' || Math.random() < 0.35));
    const picks = [...new Set(pool)].slice(0, 3);
    // v0.66 · si ya tienes alguna pieza de un conjunto, a veces sale una de las que te faltan
    const enMazo = new Set(Game.run!.deck.map((c) => c.id));
    const faltantes = Object.values(CONJUNTOS).filter((cj) => (!cj.abismo || abismo) && cj.piezas.some((p) => enMazo.has(p)))
      .flatMap((cj) => cj.piezas.filter((p) => !enMazo.has(p) && !picks.includes(p)));
    if (faltantes.length && Math.random() < 0.6) picks[2] = Phaser.Utils.Array.GetRandom(faltantes);
    // a veces una élite suelta una carta LEGENDARIA (una copia por expedición)
    if (data.kind === 'elite' && Math.random() < 0.15) {
      const [leg] = legendariasDisponibles(Game.run!.deck, 1, abismo);
      if (leg) picks[1] = leg;
    }
    picks.forEach((id, i) => {
      const up = Math.random() < (data.kind === 'elite' ? 0.35 : 0.1);
      // El Abismo: ediciones estilo Balatro (las élites las sueltan el doble)
      const ed = abismo ? sortearEdicion(data.kind === 'elite' ? 2 : 1) : undefined;
      const v = cardView(this, W / 2 + (i - 1) * 190, y0 + 150, ed ? { uid: -1, id, up, ed } : { uid: -1, id, up });
      v.setInteractive({ useHandCursor: true });
      v.on('pointerover', () => {
        v.setScale(1.08);
        tip.show(v.x + 85, v.y - 100, ed ? `${CARDS[id].concept} · ${EDICIONES[ed].nombre}` : CARDS[id].concept, ed ? `${EDICIONES[ed].texto}\n\n${CARDS[id].lore}` : CARDS[id].lore);
      });
      v.on('pointerout', () => {
        v.setScale(1);
        tip.hide();
      });
      v.on('pointerdown', () => {
        audio.sfx('card');
        addCard(id, up, ed);
        this.done();
      });
    });
    button(this, W / 2, 506, 200, 40, T.botin.omitir, () => this.done(), { size: 22 });
  }

  done() {
    saveLocal();
    fadeTo(this, 'Map');
  }
}
