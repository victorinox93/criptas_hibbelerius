import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { RARAS_ABISMO } from '../data/abismo_modo';
import { ALTARES_FILO, EfectoAltar, textoEfecto } from '../data/altares_filo';
import { CARDS } from '../data/cards';
import { darMaldicion, quitarDelMazo } from '../data/maldiciones';
import { RELICS, RELIQUIAS_ABISMO } from '../data/relics';
import { addCard, addEntropia, addErgios, Game, logEvent, saveLocal, syncRun } from '../state';
import { T } from '../textos';
import { deckOverlay, topBar } from '../ui/hud';
import { button, Btn, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';
import { darDiente } from './Relato';
import { grantRelic } from './Reward';

/**
 * v0.84 · ALTARES FILOSÓFICOS (src/data/altares_filo.ts): una historia del mythos y una pregunta
 * sobre la locura, el conocimiento, la identidad o los sueños. Cada respuesta tiene su recompensa
 * y su costo (no hay una «correcta»), y al final una reflexión.
 */
export class AltarFiloScene extends Phaser.Scene {
  constructor() { super('AltarFilo'); }

  create(data: { floor: number; id?: string }) {
    const run = Game.run!;
    const a = ALTARES_FILO.find((x) => x.id === data.id) ?? Phaser.Utils.Array.GetRandom(ALTARES_FILO);
    this.cameras.main.fadeIn(500);
    audio.play('abismo2');
    this.add.rectangle(0, 0, W, H, 0x05060a).setOrigin(0);
    const glow = this.add.circle(200, 300, 160, a.tinte, 0.07).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.13, scale: 1.08, duration: 2000, yoyo: true, repeat: -1 });
    const fig = this.add.image(200, 390, a.sprite).setOrigin(0.5, 1).setScale(a.escala);
    this.tweens.add({ targets: fig, y: 384, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, 200, 404, a.quien, 17, '#c8b8ff', { align: 'center', wordWrap: { width: 300 } }).setOrigin(0.5, 0);
    vignette(this);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);
    title(this, W / 2, 64, a.titulo, 32, '#d8c8ff');
    const g = this.add.graphics();
    frame(g, 400, 96, 540, 150, 0x0a0810, 0x5a4a7a, 0.95);
    const historia = txt(this, 416, 106, a.historia, 16, CSS.bone, { wordWrap: { width: 508 }, lineSpacing: 2 });
    const pregunta = txt(this, 670, 258, a.pregunta, 18, CSS.gold, { align: 'center', wordWrap: { width: 540 } }).setOrigin(0.5, 0);

    const bs: Btn[] = [];
    const elegir = (k: number) => {
      const op = a.opciones[k];
      bs.forEach((b) => b.destroy());
      const res = op.efectos.map((e) => this.aplicar(e)).filter(Boolean);
      logEvent('altarFilo', a.id, '', { opcion: k, texto: op.texto });
      (run.seen ??= []).push(`filo_${a.id}`);
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      hud.refresh();
      audio.sfx('coin');
      this.cameras.main.flash(300, 80, 60, 120);
      historia.setText(`«${op.texto}»\n\n${op.responde}`);
      pregunta.setText(res.join(' · ')).setColor('#9af0c8');
      const gg = this.add.graphics();
      frame(gg, 400, 300, 540, 120, 0x0c0a14, 0x3a3a5a, 0.95);
      txt(this, 416, 310, a.reflexion, 16, '#c8d8f0', { wordWrap: { width: 508 }, lineSpacing: 2 });
      button(this, 670, 470, 240, 42, 'Volver al mapa', () => fadeTo(this, 'Map'), { size: 20, color: UI.gold });
    };
    a.opciones.forEach((op, k) => {
      const costo = op.efectos.map(textoEfecto).join(' · ');
      bs.push(button(this, 670, 318 + k * 62, 540, 54, `${op.texto}\n${costo}`, () => elegir(k), { size: 15, color: 0x3a2a5a }));
    });
  }

  /** Aplica un efecto y regresa su texto */
  private aplicar(e: EfectoAltar): string {
    const run = Game.run!;
    switch (e.t) {
      case 'locura': addEntropia(e.n); return textoEfecto(e);
      case 'ergios': addErgios(e.n); return textoEfecto(e);
      case 'vidaMax': run.maxHp += e.n; run.hp += e.n; return textoEfecto(e);
      case 'curar': { const n = Math.min(run.maxHp - run.hp, Math.round(run.maxHp * e.frac)); run.hp += n; return `+${n} de vida`; }
      case 'mejorar': {
        const ok = Phaser.Utils.Array.Shuffle(run.deck.filter((c) => !c.up && CARDS[c.id] && CARDS[c.id].rarity !== 'estado')).slice(0, e.n);
        ok.forEach((c) => (c.up = true));
        return ok.length ? `Mejoras: ${ok.map((c) => CARDS[c.id].name).join(', ')}` : 'Ya no hay cartas que mejorar';
      }
      case 'rara': { const id = Phaser.Utils.Array.GetRandom(RARAS_ABISMO); addCard(id); return `Carta: ${CARDS[id].name}`; }
      case 'reliquia': {
        const libres = RELIQUIAS_ABISMO.filter((id) => !run.relics.includes(id));
        if (!libres.length) { addErgios(60); return `+60 ${T.moneda}`; }
        const id = Phaser.Utils.Array.GetRandom(libres);
        grantRelic(id);
        return `Reliquia: ${RELICS[id].name}`;
      }
      case 'diente': return darDiente('raro');
      case 'maldicion': return `Maldición: ${darMaldicion()}`;
      case 'olvidar': {
        const idx = run.deck.map((c, i) => (CARDS[c.id] && CARDS[c.id].rarity !== 'estado' ? i : -1)).filter((i) => i >= 0);
        if (run.deck.length <= 5 || !idx.length) return 'No olvidas nada';
        return `Olvidas: ${quitarDelMazo(Phaser.Utils.Array.GetRandom(idx))}`;
      }
      case 'quitar':
        if (run.deck.length <= 5) return 'Tu mazo ya es muy pequeño';
        this.time.delayedCall(400, () => deckOverlay(this, 'Elige una carta para dejar atrás', run.deck, (i) => { quitarDelMazo(i); saveLocal(); }));
        return 'Eliges una carta para dejar atrás';
    }
  }
}
