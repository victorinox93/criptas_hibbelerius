import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { W, H } from '../config';
import { FAMILIARS } from '../data/familiars';
import { Game, saveLocal, unlock } from '../state';
import { button, frame, txt } from './widgets';

/**
 * v0.52 · Ya te acompaña un familiar y llega otro: eliges con cuál te quedas
 * (antes el nuevo reemplazaba al viejo sin preguntar). La oferta queda en
 * run.familiarOferta (src/state.ts → addFamiliar) y se resuelve aquí.
 */
export function elegirFamiliar(s: Phaser.Scene, alTerminar?: () => void) {
  const r = Game.run;
  const nuevo = r?.familiarOferta;
  if (!r || !nuevo) { alTerminar?.(); return; }
  const actual = r.familiar;
  if (!actual || actual.left <= 0 || actual.id === nuevo.id) {
    r.familiar = { ...nuevo };
    r.familiarOferta = undefined;
    saveLocal();
    alTerminar?.();
    return;
  }
  const capa = s.add.container(0, 0).setDepth(950);
  capa.add(s.add.rectangle(0, 0, W, H, 0x05040a, 0.85).setOrigin(0).setInteractive());
  const g = s.add.graphics();
  frame(g, W / 2 - 380, 70, 760, 400, 0x120e1a, 0x8a6ac8, 0.98);
  capa.add(g);
  capa.add(txt(s, W / 2, 88, 'Sólo cabe un familiar', 30, '#c8a8e8').setOrigin(0.5, 0));
  capa.add(txt(s, W / 2, 128, `${FAMILIARS[nuevo.id].name} quiere acompañarte, pero ya te acompaña ${FAMILIARS[actual.id].name}. ¿Con quién te quedas?`, 17, CSS.bone, { align: 'center', wordWrap: { width: 680 } }).setOrigin(0.5, 0));
  const cerrar = () => {
    capa.destroy();
    r.familiarOferta = undefined;
    saveLocal();
    alTerminar?.();
  };
  ([[actual, 'Te acompaña ahora', -190], [nuevo, 'Quiere unirse', 190]] as const).forEach(([f, rotulo, dx]) => {
    const d = FAMILIARS[f.id];
    const x = W / 2 + dx;
    capa.add(txt(s, x, 176, rotulo, 16, CSS.dim).setOrigin(0.5, 0));
    capa.add(s.add.image(x, 236, d.sprite).setScale(4));
    capa.add(txt(s, x, 274, d.name, 20, CSS.gold).setOrigin(0.5, 0));
    capa.add(txt(s, x, 300, `${d.text}\n(${f.left} combate${f.left === 1 ? '' : 's'} ${f === actual ? 'más' : ''})`.replace(' )', ')'), 15, CSS.bone, { align: 'center', wordWrap: { width: 320 } }).setOrigin(0.5, 0));
    capa.add(button(s, x, 432, 300, 42, `Quedarme con ${d.name.split(' ')[0] === 'El' || d.name.split(' ')[0] === 'La' ? d.name.split(' ').slice(0, 2).join(' ') : d.name.split(' ')[0]}`, () => {
      r.familiar = { id: f.id, left: f.left };
      if (f === nuevo) unlock('npcs', `fam_${f.id}`);
      cerrar();
    }, { size: 18, color: f === nuevo ? 0x8a6ac8 : UI.border }));
  });
}
