export const PAL: Record<string, string> = {
  k: '#0d0b10', // contorno
  d: '#2a2433', // sombra
  g: '#5a5468', // metal medio / piedra
  l: '#9a93a8', // metal claro
  w: '#d8d0c0', // hueso
  r: '#8b1e2b', // sangre
  R: '#c43a3a',
  o: '#c87533', // fuego
  y: '#e8c15a', // oro
  b: '#3b5a8a',
  B: '#6a8fc4',
  L: '#6b7a3a', // lodo claro
  G: '#3d4a22', // lodo oscuro
  n: '#6b4a2b', // madera
  p: '#4a2a5e', // púrpura
  P: '#8e5bb0',
  E: '#ffd27a', // brillo de ojos
  F: '#ff5a3a', // ojos rojos
  s: '#e0b48a',
  q: '#a8806a', // sombra de piel
  h: '#4a3a2e', // cabello
  W: '#f0ece4', // blanco (cuellos)
};

// Colores de capa disponibles en el creador de avatar
// lock = nivel de Conocimiento necesario para usarlo (src/data/progreso.ts)
/** Cosmético: lock = nivel de Conocimiento; logro = reto de src/data/logros.ts; holo = tono inicial animado (rango = amplitud del tono) */
export interface Cosmetico { name: string; lock?: number; logro?: string; holo?: number; rango?: number }
export const CAPES: (Cosmetico & { c: string; C: string })[] = [
  { name: 'Carmesí', c: '#86223a', C: '#4e1222' },
  { name: 'Ceniza', c: '#6e6a78', C: '#403c48' },
  { name: 'Abismo', c: '#2f4f8a', C: '#1b2d52' },
  { name: 'Musgo', c: '#4d6b35', C: '#2c3f1e' },
  { name: 'Ocaso', c: '#b0652a', C: '#6a3a16' },
  { name: 'Ánima', c: '#6d3f8f', C: '#3f2354' },
  { name: 'Medianoche', c: '#262a3a', C: '#14161f' },
  { name: 'Hueso', c: '#a89a7e', C: '#6a5e4a' },
  { name: 'Ectoplasma', c: '#3a8a6a', C: '#1e4a3a', lock: 2 },
  { name: 'Oro del Tomo', c: '#b8902a', C: '#6a4e14', lock: 5 },
  { name: 'Pergamino Antiguo', c: '#c8b890', C: '#8a7a5a', lock: 8 },
  { name: 'Capa del Archimago', c: '#4a1f5e', C: '#1e0c28', lock: 10 },
  // holo = desfase de tono: el color cambia como un holograma (animado en makeHeroFromAvatar)
  { name: 'Holograma de AM', c: '#7fe8ff', C: '#3a6aff', logro: 'am', holo: 0 },
  // v0.23 · capas por logros
  { name: 'Piedra del Coloso', c: '#6e6c5c', C: '#3a3a30', logro: 'coloso' },
  { name: 'Bruma de la Bruja', c: '#6a8a2a', C: '#34461a', logro: 'bruja' },
  { name: 'Tinta de Hibbeler', c: '#24346a', C: '#101a38', logro: 'erudito' },
  { name: 'Velo de las Almas', c: '#9ab8ff', C: '#5a4aa8', logro: 'alma', holo: 200, rango: 80 },
  { name: 'Llama de Júpiter', c: '#ff8a3a', C: '#a83a1a', logro: 'jupiter', holo: 0, rango: 45 },
];

export const ARMORS: (Cosmetico & { l: string; g: string })[] = [
  { name: 'Acero', l: '#9a93a8', g: '#5a5468' },
  { name: 'Bronce', l: '#a8834e', g: '#6b4e2b' },
  { name: 'Obsidiana', l: '#55506a', g: '#2e2a3a' },
  { name: 'Plata pálida', l: '#c4c0cc', g: '#7d7889' },
  { name: 'Hierro negro', l: '#4a4652', g: '#26232c' },
  { name: 'Oro viejo', l: '#c8a050', g: '#7a5a28' },
  { name: 'Obsidiana Rúnica', l: '#4e3e6a', g: '#22182e', lock: 3 },
  { name: 'Ébano del Archimago', l: '#6a5a3a', g: '#2a1e10', lock: 9 },
  { name: 'Cromo Holográfico', l: '#e0e8ff', g: '#8a90c8', logro: 'am', holo: 120 },
  { name: 'Pergamino Dorado', l: '#e8d8a0', g: '#a89060', logro: 'hibbelerius' },
  { name: 'Diamante', l: '#d0f4ff', g: '#7ab0c8', logro: 'intacto' },
  { name: 'Cromo Dorado', l: '#f0d070', g: '#a8802a', logro: 'grimorio', holo: 28, rango: 30 },
];
export const VISORS: (Cosmetico & { c: string })[] = [
  { name: 'Ámbar', c: '#ffd27a' },
  { name: 'Cian', c: '#7fe8ff' },
  { name: 'Verde fatuo', c: '#9bf07a' },
  { name: 'Violeta', c: '#d29bff' },
  { name: 'Carmesí', c: '#ff5a4a' },
  { name: 'Blanco espectral', c: '#f0f4ff' },
  { name: 'Fuego de Hibbelerius', c: '#ff3a1a', lock: 7 },
  { name: 'Ojo Holográfico', c: '#ff3aff', logro: 'am', holo: 240 },
  { name: 'Lucidez', c: '#7fffe8', logro: 'lucido', holo: 165, rango: 35 },
  { name: 'Ánima Dorada', c: '#ffe07a', logro: 'almas', holo: 38, rango: 22 },
  { name: 'Aurora de Neptuno', c: '#7affc8', logro: 'neptuno', holo: 140, rango: 120 },
];

// UI
export const UI = {
  bg: 0x0d0b10,
  panel: 0x17131c,
  panel2: 0x221c2a,
  border: 0x4a3f55,
  gold: 0xe8c15a,
  blood: 0xc43a3a,
  bone: 0xd8d0c0,
  dim: 0x8a8296,
  energy: 0x6ad0e8,
  block: 0x7aa0d0,
  green: 0x7aa64a,
};
export const CSS = {
  gold: '#e8c15a', bone: '#d8d0c0', dim: '#8a8296', blood: '#e05050', energy: '#6ad0e8',
  block: '#8fb4e6', green: '#9bc96a', purple: '#b88ad8',
};
