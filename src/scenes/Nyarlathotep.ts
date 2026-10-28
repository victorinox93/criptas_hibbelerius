import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { darMaldicion } from '../data/maldiciones';
import { NYAR_ENTROPIA, NYAR_PACTO_RUNAS, NYAR_RECHAZADO, NYAR_SALUDOS } from '../data/mythos_pactos';
import { RELICS, RELIQUIAS_MALDITAS } from '../data/relics';
import { addEntropia, Game, logEvent, saveLocal, syncRun, unlock } from '../state';
import { topBar } from '../ui/hud';
import { button, Btn, fadeTo, frame, title, Tooltip, txt, vignette } from '../ui/widgets';
import { grantRelic } from './Reward';

/**
 * v0.71 · EL HOMBRE NEGRO (Nyarlathotep): personaje recurrente del Abismo, como AM en el modo normal.
 * Aparece a lo más una vez por tramo. Recuerda entre expediciones cuántas veces lo has visto
 * y cuántas lo rechazaste (Game.codex.nyar). Siempre ofrece ayuda… con un costo.
 */
export class NyarlathotepScene extends Phaser.Scene {
  constructor() { super('Nyarlathotep'); }

  create(data: { floor: number }) {
    const run = Game.run!;
    const mem = (Game.codex.nyar ??= { visitas: 0, rechazos: 0 });
    const ultimaRechazo = (Game.codex.flags ?? []).includes('nyar_rechazo');
    mem.visitas++;
    run.nyarTramo = run.tramo ?? 1;
    unlock('npcs', 'nyarlathotep_hombre');
    this.cameras.main.fadeIn(500);
    audio.play('abismo2');
    this.add.rectangle(0, 0, W, H, 0x050307).setOrigin(0);
    // arena del desierto egipcio bajo un cielo sin estrellas
    const g0 = this.add.graphics();
    g0.fillStyle(0x1a1208, 1).fillRect(0, 380, W, 160);
    g0.fillStyle(0x120c06, 1).fillTriangle(560, 380, 700, 230, 840, 380).fillTriangle(760, 380, 850, 290, 940, 380);
    const npc = this.add.image(220, 330, 'npc_hombreNegro').setScale(7);
    this.tweens.add({ targets: npc, alpha: 0.75, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    vignette(this);
    const tip = new Tooltip(this);
    const hud = topBar(this, tip);
    title(this, W / 2, 66, 'El Hombre Negro', 36, '#d8c8ff');
    txt(this, 220, 420, `Lo has visto ${mem.visitas} ${mem.visitas === 1 ? 'vez' : 'veces'}`, 15, CSS.dim).setOrigin(0.5, 0);
    const saludo = ultimaRechazo ? NYAR_RECHAZADO : NYAR_SALUDOS[Math.min(mem.visitas - 1, NYAR_SALUDOS.length - 1)];
    const g = this.add.graphics();
    frame(g, 430, 100, 500, 110, 0x0a0810, 0x5a4a7a, 0.95);
    const habla = txt(this, 446, 112, `${saludo}\n«¿En qué te ayudo hoy?»`, 17, CSS.bone, { wordWrap: { width: 470 }, lineSpacing: 2 });

    const malditas = RELIQUIAS_MALDITAS.filter((id) => !run.relics.includes(id));
    const bs: Btn[] = [];
    const fin = (dice: string, opcion: string) => {
      bs.forEach((b) => b.destroy());
      habla.setText(dice);
      const f = (Game.codex.flags ??= []);
      const i = f.indexOf('nyar_rechazo');
      if (opcion === 'rechazar') { mem.rechazos++; if (i < 0) f.push('nyar_rechazo'); } else if (i >= 0) f.splice(i, 1);
      logEvent('nyar', '', '', { opcion, visitas: mem.visitas });
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      hud.refresh();
      this.tweens.add({ targets: npc, alpha: 0, duration: 2200, delay: 600 });
      button(this, 680, 470, 240, 42, 'Volver al mapa', () => fadeTo(this, 'Map'), { size: 20, color: UI.gold });
    };
    const opciones: [string, string, () => void, boolean][] = [
      ['«Piensa por mí»', `Resuelve tus próximas ${NYAR_PACTO_RUNAS} preguntas · +${NYAR_ENTROPIA} de Locura y sin puntos cada vez`, () => {
        run.nyarPacto = (run.nyarPacto ?? 0) + NYAR_PACTO_RUNAS;
        fin('«Cuando una pregunta te pese, llámame. Yo pienso, tú… descansas. Eso hacían los faraones, y mira qué pirámides.»', 'pacto');
      }, true],
      ['«Dame un regalo de Egipto»', malditas.length ? 'Una reliquia MALDITA al azar' : 'Ya tienes todas', () => {
        const rid = Phaser.Utils.Array.GetRandom(malditas);
        grantRelic(rid);
        audio.sfx('coin');
        fin(`«Tómala: ${RELICS[rid].name}. ${RELICS[rid].text.replace('\n', ' ')} Los regalos de un dios nunca son gratis.»`, 'regalo');
      }, malditas.length > 0],
      ['«Cúrame»', 'Recuperas toda tu vida · una maldición al azar', () => {
        run.hp = run.maxHp;
        const m = darMaldicion();
        audio.sfx('heal');
        fin(`«Listo. Como nuevo. Bueno… casi.» Recibes la maldición «${m}».`, 'curar');
      }, run.hp < run.maxHp],
      ['«No necesito nada de ti»', `−8 de Locura: rechazarlo te aclara la mente`, () => {
        addEntropia(-8);
        fin('«Orgullo. Me encanta el orgullo: es lo primero que se rompe.» Se ríe, y por un momento el Abismo se ve más claro.', 'rechazar');
      }, true],
    ];
    opciones.forEach(([label, risk, fn, ok], i) => {
      bs.push(button(this, 680, 258 + i * 62, 480, 54, `${label}\n${risk}`, fn, { size: 16, color: i === 3 ? 0x4a4048 : 0x3a2050, enabled: ok }));
    });
  }
}
