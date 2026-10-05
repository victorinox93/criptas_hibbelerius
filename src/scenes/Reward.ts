import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W } from '../config';
import { audio } from '../audio';
import { T } from '../textos';
import { CARDS, rewardPool } from '../data/cards';
import { RELIC_POOL, RELICS } from '../data/relics';
import { addCard, addFamiliar, Game, saveLocal, unlock } from '../state';
import { FAMILIARS } from '../data/familiars';
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
}

export function randomRelics(n: number) {
  const owned = Game.run!.relics;
  return Phaser.Utils.Array.Shuffle(RELIC_POOL.filter((x) => !owned.includes(x))).slice(0, n);
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
    // azar: tras una élite, a veces una criatura decide seguirte (30 %)
    if (data.kind === 'elite' && Math.random() < 0.3) {
      const fid = addFamiliar('random');
      const f = FAMILIARS[fid];
      hud.refresh();
      const fi = this.add.image(W / 2 + 280, y0 - 52, f.sprite).setScale(3);
      tip.attach(fi, f.name, f.text);
      txt(this, W / 2 + 280, y0 - 20, `${f.name} te sigue`, 18, '#c8a8e8').setOrigin(0.5);
    }

    txt(this, W / 2, y0, T.botin.elige, 26, CSS.bone).setOrigin(0.5);
    // en el Acto III, las cartas de impulso salen el doble
    const base = rewardPool(Game.run!.clase, Game.run!.acto);
    const weighted = Game.run!.acto >= 3 ? [...base, ...base.filter((id) => CARDS[id].act === 3)] : base;
    const pool = Phaser.Utils.Array.Shuffle(weighted.filter((id) => CARDS[id].rarity !== 'rara' || Math.random() < 0.35));
    const picks = [...new Set(pool)].slice(0, 3);
    picks.forEach((id, i) => {
      const up = Math.random() < (data.kind === 'elite' ? 0.35 : 0.1);
      const v = cardView(this, W / 2 + (i - 1) * 190, y0 + 150, { uid: -1, id, up });
      v.setInteractive({ useHandCursor: true });
      v.on('pointerover', () => {
        v.setScale(1.08);
        tip.show(v.x + 85, v.y - 100, CARDS[id].concept, CARDS[id].lore);
      });
      v.on('pointerout', () => {
        v.setScale(1);
        tip.hide();
      });
      v.on('pointerdown', () => {
        audio.sfx('card');
        addCard(id, up);
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
