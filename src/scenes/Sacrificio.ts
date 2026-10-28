import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { darMaldicion, quitarDelMazo } from '../data/maldiciones';
import { ALTARES, SACRIFICIO_SANGRE } from '../data/mythos_pactos';
import { RELICS, RELIQUIAS_MALDITAS } from '../data/relics';
import { addErgios, addEntropia, Game, logEvent, saveLocal, syncRun } from '../state';
import { T } from '../textos';
import { deckOverlay, topBar } from '../ui/hud';
import { button, Btn, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';
import { darDiente } from './Relato';
import { grantRelic, randomRelics } from './Reward';

/** Cartas que debe conservar el mazo después del sacrificio */
const MAZO_MIN = 5;

/**
 * v0.71 · ALTARES DEL MYTHOS (nodo «?» del Abismo, src/data/mythos_pactos.ts).
 * Un Primigenio pide un sacrificio: 2 cartas que tú eliges, 2 que elige él (al azar) o tu sangre.
 * Mientras más control le cedes, mejor paga. Negarte puede costarte una maldición.
 */
export class SacrificioScene extends Phaser.Scene {
  constructor() { super('Sacrificio'); }

  create(data: { floor: number; id?: string }) {
    const run = Game.run!;
    const a = ALTARES.find((x) => x.id === data.id) ?? Phaser.Utils.Array.GetRandom(ALTARES);
    this.cameras.main.fadeIn(400);
    audio.play('abismo2');
    this.add.rectangle(0, 0, W, H, 0x06080a).setOrigin(0);
    const glow = this.add.circle(220, 320, 170, a.tinte, 0.06).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.12, scale: 1.08, duration: 1800, yoyo: true, repeat: -1 });
    const npc = this.add.image(220, 400, a.sprite).setOrigin(0.5, 1).setScale(3);
    this.tweens.add({ targets: npc, y: 394, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, 220, 414, a.quien, 18, '#c8b8ff').setOrigin(0.5, 0);
    vignette(this);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);
    title(this, W / 2, 66, a.titulo, 34, '#c8b8ff');
    const g = this.add.graphics();
    frame(g, 430, 104, 500, 132, 0x0a0810, 0x5a4a7a, 0.95);
    txt(this, 446, 116, a.intro, 17, CSS.bone, { wordWrap: { width: 470 }, lineSpacing: 2 });

    const puedeCartas = run.deck.length >= MAZO_MIN + 2;
    const malditas = RELIQUIAS_MALDITAS.filter((id) => !run.relics.includes(id));
    const bs: Btn[] = [];
    const fin = (titulo: string, texto: string, bueno: boolean, opcion: string) => {
      bs.forEach((b) => b.setEnabled(false));
      logEvent('sacrificio', '', '', { altar: a.id, opcion, resultado: texto });
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      hud.refresh();
      const c = this.add.container(0, 0).setDepth(20);
      c.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0));
      const fg = this.add.graphics();
      frame(fg, W / 2 - 360, 150, 720, 260, 0x0a0810, bueno ? 0x8a6ac8 : 0x9a4040, 0.98);
      c.add(fg);
      c.add(title(this, W / 2, 176, titulo, 28, bueno ? '#d8b8ff' : '#ff9a9a'));
      c.add(txt(this, W / 2, 212, texto, 17, CSS.bone, { align: 'center', wordWrap: { width: 680 }, lineSpacing: 3 }).setOrigin(0.5, 0));
      c.add(button(this, W / 2, 376, 220, 40, 'Volver al mapa', () => fadeTo(this, 'Map'), { size: 20, color: UI.gold }));
    };
    const quitarUid = (uid: number) => {
      const i = run.deck.findIndex((x) => x.uid === uid);
      return i >= 0 ? quitarDelMazo(i) : '';
    };
    const premioReliquia = () => {
      const [rid] = randomRelics(1);
      if (!rid) { addErgios(60); return `+60 ${T.moneda} (ya tienes todas las reliquias)`; }
      grantRelic(rid);
      return `Reliquia: ${RELICS[rid].name} — ${RELICS[rid].text}`;
    };

    const opciones: [string, string, () => void, boolean][] = [
      ['Ofrecer 2 cartas (tú eliges)', 'Pierdes 2 cartas de tu mazo → una reliquia', () => {
        const elegidas: string[] = [];
        const pedir = (n: number) => {
          deckOverlay(this, `${a.quien} pide una carta (${n} de 2). Elige cuál ofreces.`, run.deck, (i) => {
            elegidas.push(quitarDelMazo(i));
            if (n < 2) pedir(n + 1);
            else fin('El sacrificio fue aceptado', `${a.acepta}\n\nOfreciste: ${elegidas.join(' y ')}.\n${premioReliquia()}`, true, 'elegir');
          }, n === 2 ? () => {
            // «Al azar»: la segunda la elige él
            elegidas.push(quitarDelMazo(Math.floor(Math.random() * run.deck.length)));
            fin('El sacrificio fue aceptado', `${a.acepta}\n\nOfreciste: ${elegidas.join(' y ')}.\n${premioReliquia()}`, true, 'elegir');
          } : undefined);
        };
        pedir(1);
      }, puedeCartas],
      ['Que elija él (2 cartas al azar)', 'Pierdes 2 cartas al azar → una reliquia y un diente raro', () => {
        const uids = Phaser.Utils.Array.Shuffle([...run.deck]).slice(0, 2).map((c) => c.uid);
        const nombres = uids.map(quitarUid);
        this.cameras.main.shake(400, 0.008);
        fin('Tomó lo que quiso', `${a.acepta}\n\n${a.quien} se llevó: ${nombres.join(' y ')}.\n${premioReliquia()}\n${darDiente('raro')}`, true, 'azar');
      }, puedeCartas],
      [`Ofrecer tu sangre (−${SACRIFICIO_SANGRE} Vida máxima)`, malditas.length ? 'Una reliquia MALDITA: muy poderosa, con un costo' : 'Ya tienes todas las reliquias malditas → +60 Ergios', () => {
        run.maxHp = Math.max(10, run.maxHp - SACRIFICIO_SANGRE);
        run.hp = Math.min(run.hp, run.maxHp);
        this.cameras.main.flash(400, 120, 0, 0);
        audio.sfx('hit');
        let premio: string;
        if (malditas.length) {
          const rid = Phaser.Utils.Array.GetRandom(malditas);
          grantRelic(rid);
          premio = `Reliquia maldita: ${RELICS[rid].name} — ${RELICS[rid].text}`;
        } else { addErgios(60); premio = `+60 ${T.moneda}`; }
        fin('La sangre fue aceptada', `${a.acepta}\n\nPierdes ${SACRIFICIO_SANGRE} de Vida máxima.\n${premio}`, true, 'sangre');
      }, run.maxHp > SACRIFICIO_SANGRE + 10],
      ['Negarte', '50 %: te deja ir · 50 %: una maldición', () => {
        if (Math.random() < 0.5) { addEntropia(3); fin('Te dejó ir', `${a.rechazo}\n\n+3 de Locura.`, false, 'negarse'); return; }
        const m = darMaldicion();
        audio.sfx('wrong');
        fin('No se perdona un desaire', `${a.rechazo}\n\nRecibes la maldición «${m}». El Demonio de Maxwell podría quitártela.`, false, 'negarse');
      }, true],
    ];
    opciones.forEach(([label, risk, fn, ok], i) => {
      const y = 280 + i * 62;
      const b = button(this, 680, y, 480, 54, `${label}\n${risk}`, fn, { size: 16, color: i === 3 ? 0x4a4048 : 0x4a3a6a, enabled: ok });
      bs.push(b);
    });
    if (!puedeCartas) txt(this, 680, 528, `Tu mazo es muy pequeño para ofrecer cartas (mínimo ${MAZO_MIN + 2}).`, 14, CSS.dim).setOrigin(0.5, 1);
  }
}
