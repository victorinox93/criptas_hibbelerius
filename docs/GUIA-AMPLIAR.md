# Guía para ampliar Las Criptas de Hibbelerius

Esta guía explica cómo agregar contenido nuevo copiando y adaptando plantillas. Todo el contenido vive en archivos de datos dentro de `src/data/`. En la mayoría de los casos no hay que tocar la lógica del juego.

## Cómo editar sin instalar nada

1. Abre tu repositorio en GitHub y presiona la tecla **`.`** (punto). Se abre **github.dev**, un editor como VS Code dentro del navegador.
2. Edita los archivos que necesites.
3. En el panel izquierdo de *Source Control* (el ícono de ramas) escribe una descripción y da clic en **Commit & Push**.
4. GitHub Actions vuelve a publicar el juego en 1–2 minutos.

Para probar antes de publicar, en tu computadora con Node.js instalado:

```bash
npm install     # sólo la primera vez
npm run dev     # abre http://localhost:5173
```

> Un error de escritura (una coma o comilla de más) hace que la publicación falle. En la pestaña **Actions** de GitHub verás una ✗ roja con el renglón del error. Corrígelo y vuelve a subir.

## Forja de Sprites: ver tu pixel art en vivo

El juego trae su propio editor: **`public/forja-de-sprites.html`**. Una vez publicado, ábrelo en `https://<tu-usuario>.github.io/<tu-repo>/forja-de-sprites.html`.

1. Pega la matriz (por ejemplo `espectro: mirrorHalf([ ... ]),`) en el recuadro **Código**.
2. Mírala en vivo con los colores del juego. Las letras que no existan en la paleta salen en magenta y el editor te avisa.
3. Pinta con el ratón (clic izquierdo pinta, clic derecho borra). Con `mirrorHalf` sólo editas la mitad y la otra se refleja.
4. Da clic en **Copiar código para sprites.ts** y pégalo dentro de `SPRITES` en `src/art/sprites.ts`.

Todo lo que agregues (enemigos, personajes, figuras, cartas, reliquias, dones) aparece solo en el **Grimorio**, bloqueado hasta que el alumno lo encuentre. No hay que registrarlo en otro lado.

---

## 1. Agregar un enemigo

**Archivo:** `src/data/enemies.ts`

### a) Su apariencia (pixel art)

En `src/art/sprites.ts`, dentro de `SPRITES`, agrega una matriz. Cada letra es un color de la paleta (`src/art/palette.ts`) y `.` es transparente. Con `mirrorHalf` dibujas sólo la mitad izquierda y se refleja sola.

```ts
  espectro: mirrorHalf([
    '....kkkk',
    '...kllll',
    '..kllwww',
    '..klwkFw',   // F = ojos rojos, k = contorno
    '..klwwww',
    '..kllwww',
    '...kllll',
    '..kllll.',
    '.kll.ll.',
    '.kl..l..',
  ]),
```

Colores útiles: `k` contorno, `g`/`l` gris, `w` hueso, `p`/`P` púrpura, `L`/`G` verde lodo, `y` oro, `F` ojos rojos, `E` brillo ámbar, `B` azul claro.

### b) Su comportamiento

Dentro de `ENEMIES`:

```ts
  espectro: {
    id: 'espectro', name: 'Espectro Ligero', sprite: 'espectro', scale: 5,
    hp: [18, 22],          // vida mínima y máxima
    mass: 1,               // kg (aparece en la descripción)
    desc: 'Casi no tiene masa: cualquier fuerza lo acelera mucho.',
    next: (e) => {
      // e.turn es el número de turno del enemigo (0, 1, 2…)
      if (e.turn % 2 === 0) return { kind: 'attack', dmg: 5, hits: 2, label: 'Ráfaga' };
      return { kind: 'block', block: 6, label: 'Desvanecerse' };
    },
  },
```

Tipos de intención:

| Intención | Ejemplo |
|---|---|
| Atacar | `{ kind: 'attack', dmg: 7 }` |
| Atacar varias veces | `{ kind: 'attack', dmg: 3, hits: 3 }` |
| Atacar y aplicar fricción | `{ kind: 'attack', dmg: 4, friccion: 1 }` |
| Bloquear | `{ kind: 'block', block: 8 }` |
| Bloquear y atacar | `{ kind: 'block', block: 5, dmg: 4 }` |

Si le pones `umbral: 12`, el enemigo acumula **Inercia** y sólo se detiene con un golpe de F ≥ 12 N (como el Caballero Inerte).

### c) Dónde aparece

Al final del archivo, en `ENCOUNTERS`, agrega grupos que lo incluyan:

```ts
  normal: [..., ['espectro'], ['espectro', 'bat']],
```

`easy` son los primeros pisos, `normal` el resto, `elite` y `boss` los especiales.

---

## 2. Agregar una pregunta (runas, encuentros y figuras)

**Archivo:** `src/data/runes.ts`, dentro de la lista `GENERATORS`.

### Pregunta numérica con datos al azar

```ts
  () => {
    const m = ri(2, 20);            // entero al azar entre 2 y 20
    const v = ri(3, 12);
    const p = m * v;
    return {
      concept: 'Cantidad de movimiento',   // tema: aparece en la hoja "Conceptos"
      title: 'Runa del Ímpetu',
      prompt: `Un ariete de ${m} kg avanza a ${v} m/s.\n¿Cuál es su cantidad de movimiento?`,
      unit: 'kg·m/s',
      answer: p,
      tol: 0.02,                    // margen aceptado (2 %)
      solution: ['p = m·v', `p = (${m})(${v})`, `p = ${f2(p)} kg·m/s`],
    };
  },
```

Utilidades: `ri(a, b)` entero al azar, `pick([...])` elige uno de la lista, `f2(x)` redondea a 2 decimales, `rad(grados)` convierte a radianes, `G` = 9.81.

### Pregunta de opción múltiple

```ts
  () => {
    const s = shuffleChoices([
      'La respuesta correcta va SIEMPRE primero.',
      'Distractor 1',
      'Distractor 2',
      'Distractor 3',
    ], 0);
    return {
      concept: '1a ley', title: 'Runa de la Quietud',
      prompt: '¿Tu pregunta aquí?',
      unit: '', ...s,
      solution: ['Explicación corta.', 'Segunda línea opcional.'],
    };
  },
```

El juego revuelve las opciones solo.

> **Importante:** el texto de `concept` agrupa las respuestas en tu hoja de Google. Usa siempre el mismo nombre para el mismo tema. Los que existen hoy son: `1a ley`, `2a ley`, `3a ley`, `2a ley (sistemas)`, `Peso`, `Friccion`, `Plano inclinado`, `Fuerza normal`, `Trabajo`, `Energia cinetica`, `Energia potencial`, `Conservacion` y `Trabajo-energia`.

---

## 3. Agregar una figura histórica (estilo Hades)

**Archivo:** `src/data/figures.ts`

Una figura tiene un retrato, una pregunta (elegida por temas) y tres dones. Si el alumno responde bien, los dones son **épicos** (nivel 2); si no responde o falla, son **comunes** (nivel 1).

### a) El retrato

En `src/art/sprites.ts`, dentro de `FIG`, copia uno existente y cambia los colores en `ov`:

```ts
  fig_hooke: {
    rows: mirrorHalf([ /* copia las filas de fig_joule y modifícalas */ ]),
    ov: { h: '#2a2420', b: '#3a3028', s: '#e0bea0', q: '#b08e78', c: '#3a2a20', W: '#e8e4dc' },
  },
```

Letras del retrato: `h` cabello, `b` barba, `w` peluca o cabello blanco, `s` piel, `q` sombra de piel, `k` ojos, `c` ropa, `W` cuello blanco, `y` joyería, `R` labios.

### b) La figura y sus dones

```ts
// en BOONS
  h_resorte: {
    id: 'h_resorte', figure: 'hooke', name: 'Ley de Hooke', icon: 'i_crystal',
    text: ['Empiezas cada combate con 4 de Bloque.', 'Empiezas cada combate con 8 de Bloque.'],
    lore: 'F = −k·x: un resorte empuja en proporción a cuánto lo deformas.',
  },

// en FIGURES
  {
    id: 'hooke', name: 'Robert Hooke', years: '1635–1703', epithet: 'El Maestro de los Resortes',
    sprite: 'fig_hooke',
    intro: '«Todo cuerpo elástico responde a la fuerza que lo deforma.\nResponde tú también.»',
    farewell: '«Como el resorte: cede, pero regresa.»',
    concepts: ['2a ley', 'Fuerza normal'],
    boons: ['h_resorte', 'otro_don', 'otro_don'],
  },
```

### c) Que el don haga algo

Los dones se leen en combate con `boonLevel('id')`, que devuelve 0 (no lo tiene), 1 (común) o 2 (épico). Para un don nuevo, agrega una línea en `src/scenes/Combat.ts` en el lugar adecuado. Por ejemplo, para el Bloque inicial, junto a `// dones de figuras históricas`:

```ts
    this.block += 4 * boonLevel('h_resorte');
```

Ganchos ya disponibles:

| Momento | Dónde está en `Combat.ts` | Ejemplo existente |
|---|---|---|
| Inicio del combate | `// dones de figuras históricas` | `j_trabajo` (Bloque inicial) |
| Inicio de cada turno | `startTurn()` | `g_pendulo` (+1 J) |
| Al jugar un ataque | `// Galileo · Plano Inclinado` | `g_plano` |
| Al recibir un golpe | `hurtPlayer()` | `n_reaccion` |
| Al ganar | `checkEnd()` | `c_conserva` (curación) |

Si un don es difícil de programar, pídeselo a Claude describiendo el efecto.

---

## 4. Agregar un encuentro con un personaje

**Archivo:** `src/data/events.ts`

```ts
  {
    id: 'bibliotecaria', name: 'La Bibliotecaria Sin Rostro', npc: 'npc_cartografa', prop: 'i_rune',
    intro: 'Entre estantes infinitos, alguien te ofrece un libro abierto.\n«Lee y responde.»',
    win: '«Has entendido. Llévate esto.»',
    lose: '«Vuelve a leer el capítulo.»',
    bless: { effect: 'vigor', combats: 2 },     // o { ergios: 40 } o { heal: 15 }
    curse: { effect: 'niebla', combats: 1 },    // o { ergios: -15 }
    concepts: ['Trabajo', 'Energia cinetica'],
  },
```

Los efectos disponibles están en `src/data/effects.ts`. Para el personaje puedes reutilizar uno de `NPCS` en `sprites.ts` cambiando sus colores.

---

## 5. Agregar cartas

**Archivo:** `src/data/cards.ts`. Copia una carta parecida, cambia `id`, `name` y números, y agrégala a `REWARD_POOL` para que aparezca como recompensa y en la tienda. Si su efecto es nuevo, añade un `case 'tu_id':` en `playOn()` de `src/scenes/Combat.ts`.

---

## 6. Música

### Opción A · Una pista nueva del sintetizador

En `src/audio.ts`, dentro de `TRACKS`:

```ts
  cripta_profunda: {
    bpm: 90,                                        // velocidad
    chords: [[50, 53, 57], [48, 51, 55], [46, 50, 53], [45, 49, 52]],  // acordes (notas MIDI), uno por compás
    pad: 0.1, padCut: 900,                          // colchón de fondo (volumen y brillo)
    arp: '1.1.1.1.1.1.1.1.', arpOct: 12,            // arpegio: 1 = suena, . = silencio (16 pasos)
    bass: 'x...x...x...x.o.', bassOct: -24,         // bajo: x raíz, o octava, - quinta
    kick: '1.......1.......',                       // bombo
    snare: '....1.......1...',                      // tarola
    hat: '..1...1...1...1.',                        // platillo
  },
```

Notas MIDI de referencia: 48 = Do, 50 = Re, 52 = Mi, 53 = Fa, 55 = Sol, 57 = La, 59 = Si (sube 12 para la octava siguiente). Los acordes menores (raíz, +3, +7) suenan oscuros.

Agrega su nombre a `TrackId` (al inicio de `audio.ts`) y úsalo en una escena con `audio.play('cripta_profunda')`.

### Opción B · Archivos MP3

1. Crea la carpeta `public/musica/` y copia ahí tus MP3.
2. En `src/config.ts`, en `MUSIC_FILES`, escribe el nombre del archivo junto a la pista que quieres reemplazar: `combate: 'batalla.mp3'`.

Usa sólo música con licencia que permita su uso (por ejemplo CC0 o CC-BY con atribución) y anota los créditos en el README.

---

## 7. Niveles de gravedad (dificultad)

**Archivo:** `src/data/gravity.ts`. Cada nivel es un astro con su *g* real y multiplicadores de vida y daño enemigo, curación de fogatas, vida inicial y puntaje. Peso Muerto y la Manzana de Newton usan la *g* del nivel. Un nivel se desbloquea al vencer al Coloso en el anterior. Para agregar uno (por ejemplo Saturno, g = 10.44 m/s²), copia una fila y cambia `id`, `name` y los números.

---

## 8. Lista rápida

| Quiero agregar… | Archivo(s) |
|---|---|
| Enemigo | `src/art/sprites.ts` + `src/data/enemies.ts` |
| Pregunta | `src/data/runes.ts` |
| Figura histórica | `src/art/sprites.ts` + `src/data/figures.ts` (+ `Combat.ts` si el don es nuevo) |
| Encuentro | `src/data/events.ts` |
| Bendición o maldición | `src/data/effects.ts` (+ `Combat.ts`) |
| Carta | `src/data/cards.ts` (+ `Combat.ts` si el efecto es nuevo) |
| Reliquia | `src/data/relics.ts` (+ `Combat.ts`) |
| Música | `src/audio.ts` o `public/musica/` + `src/config.ts` |
| Textos de pantalla y créditos | `src/textos.ts` |
| Niveles de dificultad | `src/data/gravity.ts` |
| Pixel art | Forja de Sprites → `src/art/sprites.ts` |
