export { API_URL } from './backend';
import { T } from './textos';

export const GAME_TITLE = T.titulo;
export const VERSION = '0.82.0 · Cartas de cada personaje';
/** Sólo el número (lo que ve el alumno); la descripción de cambios queda en el README */
export const VERSION_NUM = VERSION.split(' · ')[0];
export const W = 960; // tamaño lógico (todo el juego se diseña a 960×540)
export const H = 540;
// Se dibuja al doble de resolución para verse nítido.
// En computadoras muy lentas se puede abrir el juego con ?res=1 al final de la dirección.
export const RES = (() => {
  try {
    return new URLSearchParams(location.search).get('res') === '1' ? 1 : 2;
  } catch {
    return 2;
  }
})();
export const G = 9.81; // m/s²

// ─────────────────────────────────────────────────────────────
//  MÚSICA OPCIONAL EN ARCHIVO
//  Por defecto la música se genera en vivo (sintetizador).
//  Si prefieres pistas propias, ponlas en public/musica/ y escribe
//  aquí el nombre del archivo. Ej.: combate: 'combate.mp3'
// ─────────────────────────────────────────────────────────────
// Pistas de «Cold Soul» de Lost in The Forest (uso libre con atribución):
// https://lostintheforest.bandcamp.com/album/cold-soul
export const MUSIC_FILES: Record<string, string> = {
  menu: 'cold-soul-1.mp3',
  mapa: '',
  combate: '',
  combate2: '',
  jefe: '',
  calma: 'cold-soul-2.mp3',
  santuario: '',
  mapa2: '',
  combate3: '',
  jefe2: '',
  mapa3: 'cold-soul-3.mp3',
  combate4: '',
  jefe3: '',
  mapa4: '',
  combate5: '',
  jefe4: '',
  // Tienda de Layla: «Kitty Paw» de Shook (álbum «Synth Funk», 2024) · https://shook.bandcamp.com/album/synth-funk
  funk: 'kitty-paw.mp3',
  // El Abismo de los Ejes (v0.48): «Dark Ambient of 2024» de Cryo Chamber (con permiso de los autores)
  // https://cryochamber.bandcamp.com/album/dark-ambient-of-2024 · cortadas en pistas de ~4–6 min
  abismo: 'abismo-uncertain-direction.mp3', // Tineidae & Sole Massif · Uncertain Direction
  combate6: 'abismo-after-annihilation.mp3', // Void Stasis · After the Annihilation
  combate7: 'abismo-onboard-errors.mp3', // Sabled Sun · Onboard Errors
  jefe5: 'abismo-kingdom-parasites.mp3', // Caldon Glover · In the Kingdom of Parasites
  abismo2: 'abismo-cerulean-depths.mp3', // Atrium Carceri & Kammarheit · Cerulean Depths
};

// ─────────────────────────────────────────────────────────────
//  ADMINISTRADORES: estas matrículas ven el «Modo profesor»
//  (depuración: saltar a cualquier acto, jefe, figura o encuentro).
//  Sólo funciona con sesión en línea (protegida por contraseña).
// ─────────────────────────────────────────────────────────────
export const ADMINS = ['237440'];

/** Costo en Ergios de una pista en los altares y encuentros */
// Arranque «Relicario-93» (abrir el estuche y meter el disco antes del juego):
// 'sesion' = una vez cada que se abre el juego · 'siempre' · 'nunca'
export const ARRANQUE: 'siempre' | 'sesion' | 'nunca' = 'sesion';

export const PISTA_COSTO = 15;

/**
 * Formulario de retroalimentación (Google Forms, etc.). Pega aquí su liga y
 * aparecerá el botón «Danos tu opinión» al terminar cada expedición y en el menú.
 * Vacío = el botón no aparece.
 */
export const FORM_URL = '';
