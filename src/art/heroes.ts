// ════════════════════════════════════════════════════════════════
//  HÉROES JUGABLES (42×44, el doble de detalle que la versión anterior)
//  Se dibujan por partes con figuras simples (rectángulos, óvalos y
//  líneas) y al final se les pone contorno. Cada opción del creador de
//  avatar cambia una parte. Las letras son colores:
//    c/C capa o túnica (claro/oscuro)   l/g armadura o ribete (claro/oscuro)
//    E brillo del visor/ojos   B brillo del bastón   s/q piel   h cabello
//    y oro   n madera   W blanco   w hueso   d sombra   k contorno
// ════════════════════════════════════════════════════════════════

export const HERO_W = 42;
export const HERO_H = 44;

/** Opciones de personalización (los nombres se muestran en el creador de avatar) */
export const HELMS_K = ['Penacho', 'Cuernos', 'Corona', 'Alas', 'Cresta'];
export const HELMS_M = ['Sombrero', 'Capucha', 'Diadema', 'Cornamenta', 'Engranes'];
export const HELM_IDS = ['penacho', 'cuernos', 'corona', 'alado', 'cerrado'];
export const WEAPONS_K = ['Mazo', 'Espada', 'Hacha', 'Lanza'];
export const WEAPONS_M = ['Orbe', 'Cristal', 'Engrane', 'Calavera'];
export const EXTRAS_K = ['Sin escudo', 'Escudo redondo', 'Escudo de torre'];
export const EXTRAS_M = ['Sin barba', 'Barba corta', 'Barba larga'];
export const HELMS_P = ['Capirote', 'Capucha rota', 'Corona de espinas', 'Velo de hierro', 'Yelmo de bronce'];
export const WEAPONS_P = ['Incensario', 'Lanza ígnea', 'Cadenas', 'Antorcha'];
export const EXTRAS_P = ['Tanque de cobre', 'Tanque doble', 'Alas de hierro'];
export const SKINS: { name: string; s: string; q: string }[] = [
  { name: 'Clara', s: '#f0d0b0', q: '#c8a088' },
  { name: 'Media', s: '#e0b48a', q: '#a8806a' },
  { name: 'Trigueña', s: '#c08a60', q: '#8a6040' },
  { name: 'Morena', s: '#8a5a3a', q: '#5e3a24' },
  { name: 'Oscura', s: '#5a3a28', q: '#3a2418' },
];

/** Figura del héroe: 0 = masculina; 1–5 = femenina con este color de cabello */
export const FIGURAS = ['Masculina', 'Fem. · negro', 'Fem. · castaño', 'Fem. · rubio', 'Fem. · rojizo', 'Fem. · plateado'];
export const CABELLOS = ['#4a3a2e', '#1e1814', '#5a3a22', '#d8b060', '#a8401e', '#c8c8d0'];

export interface HeroLook {
  clase?: string;
  helm: string;
  arma?: number;
  extra?: number;
  figura?: number;
}

type Grid = string[][];

function grid(): Grid {
  return Array.from({ length: HERO_H }, () => Array(HERO_W).fill('.'));
}
function put(g: Grid, x: number, y: number, ch: string) {
  x = Math.round(x); y = Math.round(y);
  if (y >= 0 && y < HERO_H && x >= 0 && x < HERO_W) g[y][x] = ch;
}
function rect(g: Grid, x0: number, y0: number, x1: number, y1: number, ch: string) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch);
}
function oval(g: Grid, cx: number, cy: number, rx: number, ry: number, ch: string) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) put(g, x, y, ch);
}
function line(g: Grid, x0: number, y0: number, x1: number, y1: number, ch: string, th = 1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
    for (let d = 0; d < th; d++) put(g, x + d, y, ch);
  }
}
/** Polígono relleno (scanline sencilla) */
function poly(g: Grid, pts: [number, number][], ch: string) {
  const ys = pts.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x++) put(g, x, y, ch);
  }
}
/** Contorno negro alrededor de todo lo dibujado */
function outline(g: Grid) {
  const src = g.map((r) => r.slice());
  for (let y = 0; y < HERO_H; y++)
    for (let x = 0; x < HERO_W; x++) {
      if (src[y][x] !== '.') continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => src[y + dy]?.[x + dx] && src[y + dy][x + dx] !== '.' && src[y + dy][x + dx] !== 'B');
      if (n) g[y][x] = 'k';
    }
}

// ───────────────────────── CABALLERO ─────────────────────────
function knight(look: HeroLook): Grid {
  const g = grid();
  const arma = look.arma ?? 0, escudo = look.extra ?? 0;
  // lanza: el asta va detrás del cuerpo
  if (arma === 3) {
    line(g, 31, 43, 35, 1, 'n');
    poly(g, [[34, 0], [37, 3], [35, 7], [33, 4]], 'W');
    line(g, 34, 1, 35, 6, 'l');
  }
  // capa ondeando hacia atrás
  poly(g, [[12, 15], [18, 15], [17, 40], [13, 42], [8, 41], [5, 38], [9, 26]], 'c');
  poly(g, [[9, 26], [12, 18], [12, 41], [8, 41], [5, 38]], 'C');
  for (let y = 22; y < 40; y += 5) line(g, 11, y, 9, y + 3, 'C');
  // piernas y botas
  rect(g, 15, 32, 18, 39, 'g');
  rect(g, 20, 32, 23, 39, 'l');
  rect(g, 20, 35, 23, 35, 'g');
  rect(g, 15, 35, 18, 35, 'd');
  rect(g, 14, 40, 18, 42, 'd');
  rect(g, 20, 40, 25, 42, 'g');
  rect(g, 21, 40, 25, 40, 'l');
  const fem = (look.figura ?? 0) > 0;
  // faldar de placas (la guerrera lo lleva más largo, como falda de malla)
  if (fem) {
    poly(g, [[14, 28], [25, 28], [27, 35], [12, 35]], 'g');
    for (let x = 14; x <= 25; x += 3) line(g, x, 29, x + (x - 19.5) * 0.2, 34, 'l');
  } else {
    rect(g, 14, 28, 25, 32, 'g');
    for (let x = 15; x <= 24; x += 3) rect(g, x, 29, x + 1, 32, 'l');
  }
  // torso (peto)
  oval(g, 19.5, 22, 6.5, 7, 'l');
  rect(g, 14, 22, 25, 28, 'l');
  for (let y = 17; y <= 28; y++) { put(g, 24, y, 'g'); put(g, 25, y, 'g'); }
  rect(g, 15, 27, 24, 27, 'g');
  // emblema
  rect(g, 18, 20, 21, 20, 'y'); rect(g, 19, 18, 20, 24, 'y'); put(g, 19, 21, 'E'); put(g, 20, 21, 'E');
  // cinturón
  rect(g, 14, 28, 25, 28, 'n'); rect(g, 19, 28, 20, 28, 'y');
  // hombreras
  oval(g, 13.5, 18, 3.5, 2.6, 'l'); rect(g, 11, 19, 16, 20, 'g');
  oval(g, 25.5, 18, 3.5, 2.6, 'l'); rect(g, 23, 19, 28, 20, 'g');
  put(g, 12, 17, 'W'); put(g, 24, 17, 'W');
  if (fem) {
    // trenza larga que cae por delante del hombro
    line(g, 16, 13, 16, 18, 'h', 2);
    for (const [x, y] of [[16.5, 20], [16.5, 23], [17, 26]] as [number, number][]) oval(g, x, y, 1.6, 1.5, 'h');
    rect(g, 16, 28, 18, 28, 'y');
    rect(g, 16, 29, 17, 30, 'h');
  }
  // brazo trasero y delantero
  rect(g, 11, 21, 13, 27, 'g');
  rect(g, 25, 21, 28, 26, 'l'); rect(g, 27, 21, 28, 26, 'g');
  rect(g, 26, 27, 29, 29, 'g'); rect(g, 26, 27, 28, 27, 'l');
  // yelmo
  oval(g, 19.5, 9, 5, 4, 'l');
  rect(g, 15, 9, 24, 15, 'l');
  rect(g, 23, 8, 24, 15, 'g');
  rect(g, 15, 15, 24, 16, 'g');
  rect(g, 16, 11, 24, 11, 'k'); put(g, 21, 11, 'E'); put(g, 22, 11, 'E'); put(g, 24, 11, 'E');
  put(g, 22, 13, 'k'); put(g, 23, 13, 'k'); put(g, 22, 14, 'k');
  line(g, 19, 5, 19, 10, 'W');
  if (fem) {
    // yelmo de visera abierta: se ve el rostro, con mechones de cabello
    rect(g, 17, 10, 23, 14, 's');
    rect(g, 23, 10, 23, 14, 'q');
    put(g, 21, 11, 'k'); put(g, 22, 11, 'E'); put(g, 22, 10, 'k');
    put(g, 21, 13, 'q');
    rect(g, 17, 10, 18, 11, 'h'); put(g, 17, 12, 'h');
    rect(g, 16, 10, 16, 15, 'g');
  }
  const helm = look.helm;
  if (helm === 'penacho') {
    poly(g, [[18, 5], [21, 3], [17, 1], [11, 2], [8, 6], [13, 5]], 'c');
    line(g, 11, 3, 18, 3, 'C');
    line(g, 9, 6, 13, 4, 'C');
  } else if (helm === 'cuernos') {
    line(g, 15, 9, 12, 6, 'w', 2); line(g, 12, 6, 11, 2, 'w', 2); put(g, 11, 1, 'w');
    line(g, 24, 9, 27, 6, 'w', 2); line(g, 27, 6, 28, 2, 'w', 2); put(g, 28, 1, 'w');
    put(g, 12, 5, 'd'); put(g, 28, 5, 'd');
  } else if (helm === 'corona') {
    rect(g, 15, 5, 24, 6, 'y');
    for (const x of [15, 18, 21, 24]) { put(g, x, 4, 'y'); put(g, x, 3, 'y'); }
    put(g, 19, 5, 'E'); put(g, 20, 5, 'E');
  } else if (helm === 'alado') {
    poly(g, [[15, 9], [10, 3], [8, 4], [10, 7], [7, 7], [10, 10], [14, 11]], 'W');
    line(g, 10, 5, 14, 9, 'w'); line(g, 9, 8, 14, 10, 'w');
    poly(g, [[24, 9], [29, 3], [31, 4], [29, 7], [32, 7], [29, 10], [25, 11]], 'W');
    line(g, 29, 5, 25, 9, 'w');
  } else {
    // cresta
    for (let x = 14; x <= 25; x++) put(g, x, 6 + Math.abs(x - 19.5) * 0.25, 'g');
    poly(g, [[16, 5], [23, 5], [22, 2], [17, 2]], 'c');
    line(g, 17, 3, 22, 3, 'C');
  }
  // escudo
  if (escudo === 1) {
    oval(g, 12, 25, 6, 6, 'c');
    oval(g, 12, 25, 6, 6, 'c');
    for (let a = 0; a < 360; a += 12) put(g, 12 + 6 * Math.cos((a * Math.PI) / 180), 25 + 6 * Math.sin((a * Math.PI) / 180), 'y');
    oval(g, 12, 25, 1.6, 1.6, 'l'); put(g, 11, 24, 'W');
  } else if (escudo === 2) {
    poly(g, [[6, 18], [17, 18], [17, 28], [11.5, 34], [6, 28]], 'c');
    line(g, 6, 18, 17, 18, 'y'); line(g, 6, 18, 6, 28, 'y'); line(g, 17, 18, 17, 28, 'y');
    line(g, 6, 28, 11, 33, 'y'); line(g, 17, 28, 12, 33, 'y');
    rect(g, 11, 20, 12, 30, 'C'); rect(g, 8, 23, 15, 24, 'C');
  }
  // arma en la mano delantera
  if (arma === 0) {
    line(g, 28, 29, 32, 13, 'n');
    oval(g, 33, 11, 3.2, 3.2, 'g'); oval(g, 32.5, 10.5, 1.6, 1.6, 'l');
    for (const [x, y] of [[33, 6], [37, 11], [33, 15], [29, 9], [36, 8], [36, 14]]) put(g, x, y, 'l');
  } else if (arma === 1) {
    line(g, 28, 28, 36, 4, 'W', 2);
    line(g, 29, 28, 37, 4, 'l');
    line(g, 25, 26, 31, 29, 'y');
    put(g, 27, 31, 'y'); put(g, 26, 32, 'y');
  } else if (arma === 2) {
    line(g, 28, 30, 31, 10, 'n');
    poly(g, [[31, 9], [37, 6], [38, 11], [37, 16], [31, 14]], 'l');
    line(g, 37, 7, 37, 15, 'W');
    rect(g, 31, 10, 32, 13, 'g');
  }
  return g;
}

// ───────────────────────── ARCANISTA ─────────────────────────
function mage(look: HeroLook): Grid {
  const g = grid();
  const baston = look.arma ?? 0, barba = look.extra ?? 0;
  // bastón (detrás de la mano); arma −1 = sin bastón (lleva un accesorio de la Tienda de Layla)
  if (baston >= 0) {
    line(g, 31, 43, 31, 9, 'n');
    line(g, 32, 43, 32, 9, 'd');
  }
  // túnica larga
  poly(g, [[15, 17], [24, 17], [29, 42], [9, 42]], 'c');
  poly(g, [[15, 17], [17, 17], [14, 42], [9, 42]], 'C');
  for (let y = 24; y < 42; y += 4) put(g, 12 + (y - 24) * -0.1, y, 'C');
  line(g, 20, 25, 21, 42, 'l');
  line(g, 9, 42, 29, 42, 'l'); line(g, 10, 41, 28, 41, 'g');
  // cinturón
  rect(g, 14, 25, 25, 26, 'n'); rect(g, 19, 25, 21, 26, 'y');
  // mangas: la trasera y la delantera (ancha) que sostiene el bastón
  poly(g, [[14, 18], [16, 19], [13, 28], [10, 28]], 'C');
  poly(g, [[23, 18], [26, 18], [31, 25], [29, 28], [26, 27]], 'c');
  line(g, 26, 27, 30, 26, 'l');
  oval(g, 31, 25.5, 2, 1.6, 's');
  // cuello / ribete
  rect(g, 16, 17, 23, 18, 'l');
  // cabeza
  oval(g, 19.5, 12, 4.5, 4.8, 's');
  rect(g, 22, 10, 23, 15, 'q');
  put(g, 18, 12, 'E'); put(g, 21, 12, 'E');
  put(g, 18, 11, 'h'); put(g, 21, 11, 'h');
  put(g, 20, 14, 'q');
  if ((look.figura ?? 0) > 0) {
    // cabello largo que cae sobre los hombros
    rect(g, 14, 9, 15, 21, 'h'); rect(g, 24, 9, 25, 19, 'h');
    rect(g, 15, 8, 24, 8, 'h'); put(g, 16, 9, 'h'); put(g, 23, 9, 'h');
    put(g, 18, 11, 'k'); put(g, 21, 11, 'k');
  }
  // barba
  if (barba === 1 && !(look.figura ?? 0)) {
    poly(g, [[16, 14], [23, 14], [22, 18], [19.5, 19], [17, 18]], 'h');
    put(g, 19, 15, 'q'); put(g, 20, 15, 'q');
  } else if (barba === 2 && !(look.figura ?? 0)) {
    poly(g, [[16, 14], [23, 14], [23, 19], [20.5, 27], [18.5, 27], [16, 19]], 'W');
    line(g, 18, 17, 19, 25, 'w'); line(g, 21, 17, 21, 25, 'w');
    put(g, 19, 15, 'q'); put(g, 20, 15, 'q');
  }
  const hat = look.helm;
  if (hat === 'penacho') {
    // sombrero puntiagudo con ala ancha
    rect(g, 11, 8, 28, 9, 'c'); rect(g, 12, 9, 27, 9, 'C');
    poly(g, [[14, 8], [25, 8], [21, 3], [16, 0], [13, 1], [17, 4]], 'c');
    line(g, 15, 7, 24, 7, 'y');
    put(g, 19, 6, 'E');
  } else if (hat === 'cuernos') {
    // capucha
    poly(g, [[13, 18], [14, 8], [17, 5], [22, 5], [25, 8], [26, 18]], 'c');
    poly(g, [[13, 18], [14, 8], [17, 5], [16, 18]], 'C');
    oval(g, 19.5, 12.5, 3.8, 4, 's');
    put(g, 18, 12, 'E'); put(g, 21, 12, 'E');
    rect(g, 16, 9, 23, 9, 'd');
  } else if (hat === 'corona') {
    // cabello largo con diadema
    poly(g, [[14, 9], [15, 6], [19, 5], [24, 6], [25, 9], [25, 20], [23, 18], [23, 10], [16, 10], [16, 18], [14, 20]], 'h');
    rect(g, 15, 8, 24, 8, 'y'); put(g, 19, 7, 'E'); put(g, 20, 7, 'E'); put(g, 19, 8, 'B'); put(g, 20, 8, 'B');
  } else if (hat === 'alado') {
    // cornamenta
    rect(g, 15, 7, 24, 8, 'h');
    line(g, 15, 7, 12, 3, 'w', 2); line(g, 12, 3, 9, 3, 'w'); line(g, 12, 3, 12, 0, 'w');
    line(g, 24, 7, 27, 3, 'w', 2); line(g, 27, 3, 30, 3, 'w'); line(g, 27, 3, 27, 0, 'w');
  } else {
    // corona de engranes
    rect(g, 15, 7, 24, 8, 'y');
    for (const x of [15, 18, 21, 24]) { rect(g, x, 5, x, 6, 'y'); put(g, x - 1, 5, 'y'); put(g, x + 1, 5, 'y'); }
    put(g, 18, 6, 'k'); put(g, 21, 6, 'k');
  }
  // remate del bastón
  if (baston < 0) {
    // sin bastón
  } else if (baston === 0) {
    oval(g, 31.5, 6, 3, 3, 'B'); put(g, 30, 5, 'W');
    line(g, 29, 9, 34, 9, 'y'); put(g, 28, 8, 'y'); put(g, 35, 8, 'y');
  } else if (baston === 1) {
    poly(g, [[31.5, 0], [34, 4], [33, 9], [30, 9], [29, 4]], 'B');
    line(g, 31, 1, 30, 7, 'W');
    line(g, 29, 9, 34, 9, 'l');
  } else if (baston === 2) {
    for (let a = 0; a < 360; a += 15) {
      const r = 3.6 + ((a / 45) % 2 < 1 ? 0.9 : 0);
      put(g, 31.5 + r * Math.cos((a * Math.PI) / 180), 5.5 + r * Math.sin((a * Math.PI) / 180), 'y');
    }
    oval(g, 31.5, 5.5, 1.3, 1.3, 'B');
  } else {
    oval(g, 31.5, 5.5, 3, 3, 'w');
    rect(g, 29, 7, 34, 8, 'w');
    put(g, 30, 5, 'k'); put(g, 33, 5, 'k'); put(g, 30, 6, 'E'); put(g, 33, 6, 'E');
    put(g, 30, 8, 'k'); put(g, 32, 8, 'k');
  }
  return g;
}

// ───────────────────────── PENITENTE DEL EMPUJE ─────────────────────────
function penitent(look: HeroLook): Grid {
  const g = grid();
  const arma = look.arma ?? 0, extra = look.extra ?? 0;
  // tanque(s) en la espalda con tobera y llama
  const tanque = (x0: number) => {
    rect(g, x0, 15, x0 + 4, 31, 'l');
    rect(g, x0 + 3, 15, x0 + 4, 31, 'g');
    oval(g, x0 + 2, 15, 2.5, 1.5, 'l');
    rect(g, x0, 19, x0 + 4, 19, 'y'); rect(g, x0, 27, x0 + 4, 27, 'y');
    poly(g, [[x0, 32], [x0 + 4, 32], [x0 + 5, 35], [x0 - 1, 35]], 'g');
    poly(g, [[x0 - 1, 36], [x0 + 5, 36], [x0 + 3, 40], [x0 + 2, 43], [x0 + 1, 40]], 'o');
    poly(g, [[x0 + 1, 36], [x0 + 3, 36], [x0 + 2, 40]], 'y');
    put(g, x0 + 2, 37, 'W');
  };
  if (extra === 2) {
    // alas de hierro (aletas)
    poly(g, [[10, 14], [2, 6], [1, 10], [4, 18], [9, 24]], 'g');
    line(g, 2, 7, 9, 15, 'l'); line(g, 2, 11, 9, 19, 'l');
  }
  tanque(9);
  if (extra === 1) tanque(4);
  // túnica larga de penitente
  poly(g, [[15, 15], [25, 15], [29, 42], [11, 42]], 'c');
  poly(g, [[15, 15], [18, 15], [15, 42], [11, 42]], 'C');
  for (let y = 22; y < 42; y += 4) line(g, 22, y, 23, y + 3, 'C');
  line(g, 11, 42, 29, 42, 'C');
  // cordón en la cintura
  rect(g, 14, 25, 26, 25, 'n'); line(g, 22, 26, 23, 33, 'n'); put(g, 23, 34, 'y');
  // brazo trasero
  poly(g, [[15, 17], [17, 18], [14, 27], [12, 27]], 'C');
  // brazo delantero
  poly(g, [[23, 17], [26, 17], [31, 23], [29, 26], [26, 25]], 'c');
  oval(g, 31, 24, 1.8, 1.5, 's');
  // capucha / tocado
  const helm = look.helm;
  const cara = () => { rect(g, 17, 10, 23, 14, 'd'); put(g, 18, 11, 'E'); put(g, 21, 11, 'E'); if ((look.figura ?? 0) > 0) { rect(g, 16, 12, 16, 22, 'h'); rect(g, 23, 12, 23, 20, 'h'); rect(g, 17, 10, 22, 10, 'h'); } };
  if (helm === 'penacho') {
    // capirote: cono alto
    poly(g, [[14, 16], [26, 16], [24, 8], [21, 0], [19, 0], [16, 8]], 'c');
    poly(g, [[14, 16], [17, 16], [19, 0], [16, 8]], 'C');
    rect(g, 17, 10, 23, 11, 'd'); put(g, 18, 10, 'E'); put(g, 21, 10, 'E');
  } else if (helm === 'cuernos') {
    // capucha rota
    poly(g, [[13, 17], [14, 8], [17, 4], [23, 4], [26, 8], [27, 17]], 'c');
    poly(g, [[13, 17], [14, 8], [17, 4], [16, 17]], 'C');
    for (const x of [14, 17, 20, 23, 26]) put(g, x, 17, '.');
    cara();
  } else if (helm === 'corona') {
    // capucha con corona de espinas
    poly(g, [[13, 17], [14, 8], [17, 5], [23, 5], [26, 8], [27, 17]], 'c');
    poly(g, [[13, 17], [14, 8], [17, 5], [16, 17]], 'C');
    cara();
    line(g, 14, 6, 26, 6, 'n');
    for (const x of [14, 16, 18, 20, 22, 24, 26]) { put(g, x, 5, 'n'); put(g, x + 1, 4, 'n'); }
    put(g, 19, 7, 'r'); put(g, 23, 8, 'r');
  } else if (helm === 'alado') {
    // velo de hierro sobre la cara
    poly(g, [[13, 17], [14, 8], [17, 5], [23, 5], [26, 8], [27, 17]], 'c');
    rect(g, 16, 9, 24, 15, 'l');
    for (let x = 16; x <= 24; x += 2) line(g, x, 9, x, 15, 'g');
    put(g, 18, 11, 'E'); put(g, 22, 11, 'E');
  } else {
    // yelmo de bronce redondo
    oval(g, 20, 10, 6, 6, 'y');
    rect(g, 15, 10, 25, 15, 'y');
    rect(g, 16, 11, 24, 11, 'k'); put(g, 18, 11, 'E'); put(g, 22, 11, 'E');
    line(g, 20, 4, 20, 15, 'n');
  }
  if ((look.figura ?? 0) > 0) {
    // cabello largo que asoma bajo el tocado y cae sobre los hombros
    rect(g, 15, 14, 16, 23, 'h'); rect(g, 23, 14, 24, 21, 'h');
    put(g, 15, 24, 'h'); put(g, 24, 22, 'h');
  }
  // lo que lleva en la mano (−1 = nada: lleva un accesorio de la Tienda de Layla)
  if (arma < 0) {
    // nada
  } else if (arma === 0) {
    // incensario colgando de una cadena
    for (let y = 25; y < 33; y++) put(g, 32, y, y % 2 ? 'l' : 'g');
    oval(g, 32, 35, 3, 2.6, 'y'); rect(g, 30, 35, 34, 35, 'n');
    put(g, 31, 31, 'w'); put(g, 33, 30, 'w'); put(g, 32, 29, 'w');
  } else if (arma === 1) {
    // lanza ígnea
    line(g, 29, 34, 36, 6, 'n');
    poly(g, [[36, 7], [37, 2], [38, 7]], 'l');
    poly(g, [[35, 4], [37, -1], [39, 4], [37, 2]], 'o'); put(g, 37, 1, 'y');
  } else if (arma === 2) {
    // cadenas
    for (let i = 0; i < 12; i++) put(g, 31 + Math.round(Math.sin(i / 2) * 2), 25 + i, i % 2 ? 'l' : 'g');
    for (let i = 0; i < 8; i++) put(g, 29 - i, 26 + i, i % 2 ? 'l' : 'g');
  } else {
    // antorcha
    line(g, 31, 27, 33, 12, 'n');
    poly(g, [[31, 12], [35, 12], [36, 8], [33, 3], [30, 8]], 'o');
    poly(g, [[32, 11], [34, 11], [33, 6]], 'y');
  }
  return g;
}

/** Matriz del héroe según su clase y apariencia */
export function heroMatrix(look: HeroLook): string[] {
  const g = look.clase === 'arcanista' ? mage(look) : look.clase === 'penitente' ? penitent(look) : knight(look);
  outline(g);
  return g.map((r) => r.join(''));
}
