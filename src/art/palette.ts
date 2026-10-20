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
export interface Cosmetico {
  name: string; lock?: number; logro?: string; holo?: number; rango?: number; mecha?: boolean;
  /** v0.35 · se compra en la Tienda de Layla: id del artículo y precio en Momentum */
  id?: string; tienda?: number;
  /** v0.35 · efecto «cósmico»: nebulosa que se mueve y estrellas que titilan */
  cosmos?: boolean;
  /** v0.54 · efecto «veterano»: oro incandescente con un destello que recorre la tela y brasas (por horas de juego) */
  veterano?: boolean;
  /** v0.56 · efecto «infrarrojo»: como una cámara térmica (negro → violeta → rojo → amarillo → blanco), con calor que se mueve */
  infrarrojo?: boolean;
  /** v0.36 · sólo se consigue con un set de la Tienda de Layla (no sale suelto en «Colores») */
  enSet?: boolean;
}
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
  // v0.35 · por nivel de Conocimiento
  { name: 'Rosa Mexicano', c: '#d0207a', C: '#7a0f46', lock: 2 },
  { name: 'Cempasúchil', c: '#f0a020', C: '#a8600e', lock: 3 },
  { name: 'Jade Olmeca', c: '#2fa88a', C: '#17604e', lock: 4 },
  { name: 'Vino Tinto', c: '#6a1428', C: '#3a0a16', lock: 6 },
  { name: 'Talavera', c: '#2aa8c8', C: '#14607a', lock: 7 },
  { name: 'Verde Bandera', c: '#1f7a3a', C: '#0f4220', lock: 8 },
  { name: 'Bata de Laboratorio', c: '#e8e8ec', C: '#a8a8b4', lock: 9 },
  // v0.35 · regalo por completar el diagnóstico final
  { name: 'UDEM', c: '#f2c21b', C: '#141414', logro: 'udem' },
  // v0.35 · se compran en la Tienda de Layla
  { name: 'Cósmica', c: '#1a1446', C: '#0a0820', cosmos: true, id: 'col_capa_cosmos', tienda: 15 },
  { name: 'Aurora Boreal', c: '#5affb0', C: '#2a8a6a', holo: 110, rango: 150, id: 'col_capa_aurora', tienda: 10 },
  { name: 'Lava Volcánica', c: '#ff5a1a', C: '#8a1a0a', holo: 0, rango: 30, id: 'col_capa_lava', tienda: 8 },
  { name: 'Arcoíris', c: '#ff5a5a', C: '#a83a3a', holo: 0, id: 'col_capa_arcoiris', tienda: 12 },
  { name: 'Rosa Chicle', c: '#f07ab0', C: '#a84a7a', id: 'col_capa_chicle', tienda: 4 },
  { name: 'Mezclilla', c: '#3a5a8a', C: '#1e3252', id: 'col_capa_mezclilla', tienda: 4 },
  // v0.36 · capas de los sets de la Tienda de Layla
  { name: 'Cera Negra', c: '#2a2622', C: '#120f0d', id: 'col_capa_cera', tienda: 6, enSet: true },
  { name: 'Tierra de Tumba', c: '#4a3a2a', C: '#261c12', id: 'col_capa_tumba', tienda: 6, enSet: true },
  { name: 'Latón Viejo', c: '#8a6a30', C: '#4a3818', id: 'col_capa_laton', tienda: 6, enSet: true },
  { name: 'Hábito Gris', c: '#5a5650', C: '#2e2c28', id: 'col_capa_habito', tienda: 6, enSet: true },
  { name: 'Terciopelo Sangre', c: '#6a0a1a', C: '#2a0410', id: 'col_capa_terciopelo', tienda: 6, enSet: true },
  { name: 'Cobre', c: '#b06a3a', C: '#6a3a1a', id: 'col_capa_cobre', tienda: 6, enSet: true },
  { name: 'Traje Espacial', c: '#e0e0e8', C: '#9a9aa8', id: 'col_capa_espacial', tienda: 6, enSet: true },
  { name: 'Lentejuela Dorada', c: '#ffd040', C: '#a87a10', holo: 45, rango: 20, id: 'col_capa_lentejuela', tienda: 6, enSet: true },
  // v0.58 · set del Cazador de Ecos
  { name: 'Gabardina de Ceniza', c: '#3a404c', C: '#181b22', id: 'col_capa_ceniza', tienda: 6, enSet: true },
  // v0.46 · El Abismo de los Ejes (logros)
  { name: 'Agua Negra', c: '#0e3a36', C: '#06201e', logro: 'abismo_tramo' },
  { name: 'Abismo sin Fondo', c: '#2a1a4a', C: '#0a0618', cosmos: true, logro: 'abismo_infinito' },
  // v0.47 · el mito de Lovecraft (un premio por jefe del Abismo)
  { name: 'El Signo Amarillo', c: '#d8b020', C: '#6a5010', logro: 'abismo_hastur' },
  { name: 'Color que Cayó del Cielo', c: '#d070ff', C: '#5a2a8a', logro: 'abismo_colorCielo', holo: 280, rango: 120 },
  { name: 'Velo de la Bailarina', c: '#8ac8d8', C: '#3a6a7a', logro: 'abismo_bailarina', holo: 180, rango: 30 },
  // v0.51 · Las Tierras del Sueño
  { name: 'Bosque de los Mil Retoños', c: '#2a1a2a', C: '#0a060a', logro: 'abismo_shubNiggurath' },
  { name: 'Vela del Barco Blanco', c: '#e8ecff', C: '#9aa8d8', holo: 220, rango: 20, logro: 'abismo_suenos' },
  // v0.54 · más ropa del mythos y el premio por horas de juego
  { name: "Alas de R'lyeh", c: '#1e5a3a', C: '#0a2a1a', logro: 'abismo_cthulhu' },
  { name: 'Gabardina de los Whateley', c: '#6a7a3a', C: '#2a3418', logro: 'abismo_dunwich' },
  { name: 'Manto del Geómetra', c: '#9a6ad0', C: '#3a2458', holo: 260, rango: 60, logro: 'abismo_geometra' },
  { name: 'Manto del Desvelado (veterano)', c: '#e8b030', C: '#6a3a08', veterano: true, logro: 'abismo_veterano5' },
  // v0.56 · efecto infrarrojo (ley de Wien: lo más caliente brilla más blanco); v0.58 · se llama «Carcosa»,
  // la ciudad del Rey de Amarillo, donde arden soles negros
  { name: 'Llama de Carcosa', c: '#ff5a1a', C: '#5a0a3a', infrarrojo: true, logro: 'abismo_calor3' },
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
  // v0.31 · el último desbloqueable: armadura completa de mecha (logro platino)
  { name: 'Mecha «Inercia-01»', l: '#e8ecf0', g: '#9aa4b4', logro: 'mecha', mecha: true },
  // v0.35 · por nivel de Conocimiento
  { name: 'Cobre Oxidado', l: '#5aa88a', g: '#2e6a54', lock: 4 },
  { name: 'Oro Rosa', l: '#e8b0a0', g: '#a8706a', lock: 6 },
  { name: 'Titanio Azul', l: '#8aa0d8', g: '#4a5a8a', lock: 7 },
  { name: 'Grafito', l: '#3a3a40', g: '#1c1c22', lock: 10 },
  // v0.35 · Tienda de Layla
  { name: 'Nebulosa', l: '#2a2060', g: '#120c30', cosmos: true, id: 'col_arm_cosmos', tienda: 15 },
  { name: 'Cromo Arcoíris', l: '#e0e0ff', g: '#8080c8', holo: 0, id: 'col_arm_arcoiris', tienda: 12 },
  // v0.46 · El Abismo de los Ejes (logros)
  { name: 'Escamas de Profundo', l: '#6a9a8a', g: '#2a4a40', logro: 'abismo_primigenio' },
  { name: 'Coraza de los Primigenios', l: '#3a2a5a', g: '#140a24', cosmos: true, logro: 'abismo_mitos' },
  // v0.51 · Las Tierras del Sueño
  { name: 'Escamas de Yig', l: '#5aa86a', g: '#1e4a2a', logro: 'abismo_yig' },
  { name: 'Piedra de las Cinco Cabezas', l: '#8a8478', g: '#3a362e', logro: 'abismo_cincoCabezas' },
  // v0.54 · túnicas y ropa del mythos
  { name: 'Túnica de la Orden Esotérica de Dagón', l: '#2a6a6a', g: '#0e2a2a', logro: 'abismo_dagon' },
  { name: 'Saco de Tweed de la Miskatonic', l: '#8a6a44', g: '#3e2c1a', logro: 'abismo_diario8' },
  { name: 'Sudario del Faraón Negro', l: '#2a2030', g: '#08060c', cosmos: true, logro: 'abismo_nyarlathotep' },
  { name: 'Túnica del Soñador de Celephaïs', l: '#d8c8ff', g: '#6a5ab8', holo: 250, rango: 50, logro: 'abismo_sueno1' },
  { name: 'Hábito del Acólito de Yog-Sothoth', l: '#5a4a9a', g: '#241a4a', logro: 'abismo_yogSothoth' },
  { name: 'Coraza de la Eternidad (veterano)', l: '#f0c040', g: '#7a4010', veterano: true, logro: 'abismo_veterano10' },
  { name: 'Coraza de Carcosa (cuerpo negro)', l: '#ff8a2a', g: '#3a0a4a', infrarrojo: true, logro: 'abismo_calor6' },
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
  // v0.35 · por nivel de Conocimiento
  { name: 'Lima Neón', c: '#c8ff3a', lock: 2 },
  { name: 'Naranja Neón', c: '#ff9a2a', lock: 3 },
  { name: 'Rosa Neón', c: '#ff6ad0', lock: 5 },
  { name: 'Rojo Láser', c: '#ff2a2a', lock: 8 },
  // v0.35 · Tienda de Layla
  { name: 'Púlsar', c: '#a0d8ff', holo: 190, rango: 50, id: 'col_vis_pulsar', tienda: 6 },
  { name: 'Supernova', c: '#ffb03a', holo: 15, rango: 50, id: 'col_vis_supernova', tienda: 6 },
  // v0.46 · El Abismo de los Ejes (logros)
  { name: 'Mirada de Montemayor', c: '#b8ff9a', holo: 100, rango: 25, logro: 'abismo_diario' },
  { name: 'Ojo de Dunwich', c: '#e0ffa0', holo: 60, rango: 90, logro: 'abismo_dunwich' },
  // v0.51 · Las Tierras del Sueño
  { name: 'Ojos del Soñador', c: '#c8a8ff', holo: 260, rango: 40, logro: 'abismo_sueno3' },
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
