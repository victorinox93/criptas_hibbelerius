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
};

// Colores de capa disponibles en el creador de avatar
export const CAPES: { name: string; c: string; C: string }[] = [
  { name: 'Carmesí', c: '#86223a', C: '#4e1222' },
  { name: 'Ceniza', c: '#6e6a78', C: '#403c48' },
  { name: 'Abismo', c: '#2f4f8a', C: '#1b2d52' },
  { name: 'Musgo', c: '#4d6b35', C: '#2c3f1e' },
  { name: 'Ocaso', c: '#b0652a', C: '#6a3a16' },
  { name: 'Ánima', c: '#6d3f8f', C: '#3f2354' },
];

export const ARMORS: { name: string; l: string; g: string }[] = [
  { name: 'Acero', l: '#9a93a8', g: '#5a5468' },
  { name: 'Bronce', l: '#a8834e', g: '#6b4e2b' },
  { name: 'Obsidiana', l: '#55506a', g: '#2e2a3a' },
  { name: 'Plata pálida', l: '#c4c0cc', g: '#7d7889' },
];
export const VISORS: { name: string; c: string }[] = [
  { name: 'Ámbar', c: '#ffd27a' },
  { name: 'Cian', c: '#7fe8ff' },
  { name: 'Verde fatuo', c: '#9bf07a' },
  { name: 'Violeta', c: '#d29bff' },
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
