export { API_URL } from './backend';
import { T } from './textos';

export const GAME_TITLE = T.titulo;
export const VERSION = '0.5.0 · Actos I y II';
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
export const MUSIC_FILES: Record<string, string> = {
  menu: '',
  mapa: '',
  combate: '',
  combate2: '',
  jefe: '',
  calma: '',
  santuario: '',
  mapa2: '',
  combate3: '',
  jefe2: '',
};
