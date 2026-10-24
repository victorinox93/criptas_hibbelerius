import Phaser from 'phaser';
import { FAMILIARS } from '../data/familiars';
import { Game } from '../state';
import { probador } from './probador';

/**
 * v0.55 · COMPAÑERO (cosmético): un familiar que ya conociste te acompaña a tu lado
 * en el menú, el mapa, el combate y tu ficha del ranking. No hace nada en combate:
 * es sólo de adorno. Se elige en el Vestidor (pestaña «Compañero»).
 */
export const mascotaDesbloqueada = (id: string) => probador() || (Game.codex.npcs ?? []).includes(`fam_${id}`);

/** Id del compañero que lleva puesto el jugador (si lo tiene desbloqueado) */
export function mascotaActual(av: { mascota?: string } | null | undefined = Game.profile?.avatar): string | null {
  const id = av?.mascota;
  return id && FAMILIARS[id] && mascotaDesbloqueada(id) ? id : null;
}

/** Dibuja el compañero (con sombra y flotando). x, y = pies del compañero. */
export function mascotaJunto(s: Phaser.Scene, x: number, y: number, escala: number, id = mascotaActual()) {
  if (!id) return null;
  const def = FAMILIARS[id];
  s.add.ellipse(x, y + 2, 16 * escala, 3 * escala, 0x000000, 0.4);
  const img = s.add.image(x, y, def.sprite).setOrigin(0.5, 1).setScale(escala);
  s.tweens.add({ targets: img, y: y - 1.5 * escala, duration: 800 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return img;
}
