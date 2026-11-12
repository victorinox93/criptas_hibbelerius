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

> **Lo más fácil (v0.8):** las preguntas de opción múltiple están en `src/data/preguntas.ts`. Copia un bloque, escribe la respuesta correcta en `correct` y tres distractores en `wrong`; el juego revuelve el orden solo. Usa como distractores los errores típicos de tus alumnos: así la pregunta también sirve de diagnóstico en la hoja «Conceptos». `MCQ_SHARE` (0 a 1) controla qué tan seguido salen frente a los cálculos.

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
| Al iniciar el combate (después de La Manzana) | `combatStartFx()` | `m_radio` (Calor a todos) |
| Al jugar una Habilidad | `// Einstein · Efecto Fotoeléctrico` | `e_foton` |

**Dones con costo (radiación).** Para que un don cobre vida, usa `await this.radiate(n, 'nombre')`: quita *n* de vida ignorando el Bloque, lo anota en el Pergamino y, si el héroe muere, revisa la Vida Extra del Profe. Escribe el costo en el texto del don después de `\nRadiación:` y el santuario lo pintará en verde. Ejemplos: los seis dones de Einstein y Curie.

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

`bless` y `curse` también aceptan `relic: 'id'` (así funciona la Vida Extra del Profe). Un encuentro con `special: true` no sale en el sorteo normal; el del profe se sortea aparte con `PROFE_CHANCE`.

### ¿Qué sale en un nodo «?»?

`src/scenes/Event.ts` sortea: primero el profe (14 %, una vez por expedición), luego un **dilema** (`DILEMMA_CHANCE` = 45 %) y si no, un personaje con pregunta. Nunca se repite lo que ya viste en la misma expedición.

---

## 4b. Agregar un dilema (situación de riesgo)

**Archivo:** `src/data/dilemmas.ts`. Un dilema no hace pregunta: ofrece opciones con costo o con azar, y el botón muestra la probabilidad.

```ts
  {
    id: 'espejo', name: 'El Espejo de la Tercera Ley', sprite: 'npc_estatua',
    intro: 'Tu reflejo te imita… con un instante de retraso.',
    choices: [
      {
        label: 'Golpear el espejo', risk: '50 %: +60 Ergios · 50 %: −10 de vida',
        outcomes: [
          { p: 0.5, r: { text: 'Se rompe y caen monedas.', ergios: 60 } },
          { p: 0.5, r: { text: 'Te devuelve el golpe (3ª ley).', hp: -10 } },
        ],
      },
      { label: 'Irte', risk: 'No pasa nada.', outcomes: [{ p: 1, r: { text: 'Tu reflejo se despide.' } }] },
    ],
  },
```

Lo que puede dar un resultado: `hp`, `maxHp`, `ergios`, `score`, `effect` + `combats`, `effects: [['reactor', 3], ['radiacion', 3]]`, `relic` (`'random'` o un id), `card` (`'rara'`, `'random'` o un id) con `cardUp`, `junk: { id: 'lodoCarta', n: 2 }`, `familiar` (`'random'` o un id) con `famCombats`, y `removeRandom`. Con `need: { ergios: 30 }` la opción se desactiva si no alcanza. La vida nunca baja de 1 en un dilema.

---

## 4c. Agregar un familiar

**Archivos:** `src/data/familiars.ts` (nombre, texto y cuántos combates dura) y su dibujo en `FAMS` dentro de `src/art/sprites.ts`. Lo que hace en combate se programa en `src/scenes/Combat.ts`:

| Momento | Dónde | Ejemplo |
|---|---|---|
| Inicio de tu turno | `startTurn()`, busca `familiares que actúan al inicio` | Tortuga (+4 Bloque), Gato (azar) |
| Robar cartas | `startTurn()`, `fam?.id === 'lechuza'` | Lechuza |
| Final de tu turno | `endTurn()`, busca `familiares que actúan al final` | Salamandra, Cuervo |
| Al ganar | `checkEnd()` | Cuervo (+6 Ergios) |

Se consiguen en el dilema «Algo te Sigue», en la tienda (60 % de las veces) y tras una élite (30 %).

---

## 4d. Condiciones de piso (azar en combate)

**Archivo:** `src/data/conditions.ts`. Un 35 % (`CONDITION_CHANCE`) de los combates normales y de élite trae una condición. Su efecto se programa en `applyCondition()` de `Combat.ts`.

---

## 5. Agregar cartas

**Archivo:** `src/data/cards.ts`. Cada carta tiene `cls`, que define quién puede obtenerla:

| `cls` | Aparece para |
|---|---|
| (sin valor) | Caballero de la Masa |
| `'arcanista'` | Arcanista Cinético |
| `'neutral'` | Ambas clases |
| `'estado'` | Nadie la gana: sólo la meten los enemigos |

Ganchos que ya existen y puedes reutilizar en `playOn()` de `src/scenes/Combat.ts`: `this.energy` (Joules), `this.drawCards(n)`, `this.discardMode = 1` (el jugador elige qué descartar), `this.gainBlock(n)`, `this.hitEnemy(enemigo, daño)`, `enemigo.st.calor`, `enemigo.st.fatiga`, `this.addResonance(enemigo, n)` y, para el Arcanista, `this.vel` (rapidez).

### Cartas basura de los enemigos

En la intención de un enemigo agrega `add: { id: 'lodoCarta', n: 2, to: 'discard' }` (o `to: 'draw'`). Otras opciones de intención: `calor: 3` (te quema 3, 2, 1…) y `friccion: 1`.

### Enemigos del Acto II

Van en `ENCOUNTERS_2` dentro de `src/data/enemies.ts`, con la misma estructura que los del Acto I.

## 5b. Agregar cartas (detalle)

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


---

## 9. Acto III y Modo profesor (v0.7)

**Enemigos del Acto III** (`src/data/enemies.ts`, sección `ACTO III`). Novedades que puedes reutilizar:

| Campo | Qué hace | Ejemplo |
|---|---|---|
| `charge: true` en una intención | suma 1 a `e.carga` (impulso acumulado) | Ariete: «Tomar impulso» |
| `release: true` | el ataque usa y vacía `e.carga`; si lo DETIENES antes, pierde todo | Ariete, Hibbelerius |
| `split: { id, n }` en el enemigo | al morir se divide en *n* enemigos | Granada → 2 Fragmentos |
| `add: { id: 'tarea', n }` | mete «Tarea Pendiente» (−3 de vida si sigue en tu mano) | Tomo Volador |

Las fases de Hibbelerius están en `next()` (usa `e.phase2` y `e.phase3`) y los cambios de capítulo en `hitEnemy()` de `Combat.ts` (busca `hibbelerius`).

**Su dibujo** se genera con `python3 tools/arte/hib.py` (y los enemigos con `tools/arte/en3.py`): son dibujos hechos con figuras (círculos, líneas) que se exportan a matrices en `src/art/act3.ts`. Cambia colores en `pal` o formas en el script y vuelve a correrlo.

**Cartas de un acto.** Una carta con `act: 3` sólo sale como recompensa desde el Acto III (en ese acto salen el doble).

**Problemas de impulso** (`src/data/runes.ts`, sección `Acto III`): conceptos `Impulso`, `Cantidad de movimiento`, `Choques` e `Impulso angular`. No aparecen en los altares de los actos I y II.

**Modo profesor.** Agrega matrículas a `ADMINS` en `src/config.ts`. Sólo funciona con sesión en línea (protegida por contraseña) o en `npm run dev`.


**Música en archivo.** Para cambiar qué pista suena en cada momento, edita `MUSIC_FILES` en `src/config.ts` (las pistas van en `public/musica/`). Si una pista pesa mucho, comprímela: `ffmpeg -i original.mp3 -b:a 80k nueva.mp3`.


---

## 10. Mecánicas de enemigos (v0.9)

| Campo | Dónde | Qué hace | Ejemplo |
|---|---|---|---|
| `summon: 'id'` | intención | invoca a otro enemigo si hay lugar (máx. 4 en pantalla) | Nigromante, Colmena |
| `shieldAll: n` | intención | da *n* de Bloqueo a todos sus aliados | Guardián del Índice |
| `heal: n` | intención | se cura *n* | Sifón Térmico |
| `drain: n` | intención | te roba *n* J de tu siguiente turno | Sifón Térmico |
| `split: { id, n }` | enemigo | al morir se divide | Babosa Madre → 2 Babosas |
| `thorns: n` | enemigo | cada golpe que le das te regresa *n* | Armadura de Púas |
| `explode: n` | enemigo | al morir te hace *n* de daño | Átomo Inestable |

Para que aparezca, agrégalo a `ENCOUNTERS`, `ENCOUNTERS_2` o `ENCOUNTERS_3`. Muchos sprites nuevos son el de otro enemigo con otros colores (`makeTexture(scene, 'nuevo', SPRITES.slime, { L: '#...' })` en `generateAllTextures`).

## 11. Héroes, repaso y pistas (v0.9)

- **Héroes:** `src/art/heroes.ts` los dibuja por partes (capa, piernas, peto, yelmo, arma, escudo…). Para una opción nueva, agrega su nombre a la lista (`WEAPONS_K`, `HELMS_M`, etc.) y un `if` con su dibujo en `knight()` o `mage()`.
- **Repaso final:** `src/data/lecciones.ts` tiene la fórmula y la idea clave de cada tema.
- **Pistas:** el costo está en `PISTA_COSTO` (`src/config.ts`).
- **Portada:** reemplaza `public/portada.jpg` por otra imagen (cualquier tamaño; se ajusta sola).


## 12. Progreso, cartas desbloqueables, pociones y música (v0.10)

- **Niveles de Conocimiento:** `src/data/progreso.ts`. `NIVELES` dice cuánto Conocimiento pide cada nivel y `conocimientoGanado()` cuánto da una expedición. `DESBLOQUEOS` es la lista que ven los alumnos.
- **Carta desbloqueable:** agrega `lock: 4` a su definición en `src/data/cards.ts` (sólo saldrá desde el nivel 4) y anótala en `DESBLOQUEOS`.
- **Poción nueva:** agrégala a `POCIONES` en `src/data/pociones.ts` (con su color) y programa su efecto en `usePotion()` de `src/scenes/Combat.ts`.
- **Cosmético desbloqueable:** agrega `lock: n` a un color en `CAPES`, `ARMORS` o `VISORS` (`src/art/palette.ts`).
- **Pisos por acto:** `FLOORS` en `src/state.ts` (ahora 12 + el jefe).
- **Música dungeon synth:** en `src/audio.ts` cada pista tiene `drone` (volumen del drone grave), `choir` (coro), `arp` (clavecín, 16 pasos), `tom` (tambor de guerra: 1 = golpe, 2 = fuerte) y `lead` (órgano, 64 pasos con notas MIDI). Para algo más oscuro: baja `bpm`, sube `drone`/`choir` y usa acordes menores o frigios.


## 13. Arranque Relicario-93 (v0.37)

Antes de la portada sale una consola ficticia: el alumno abre el estuche y mete el disco. Todo vive en `src/consola/`.

| Quiero… | Dónde |
|---|---|
| Que salga siempre, una vez por sesión o nunca | `ARRANQUE` en `src/config.ts` (`'siempre'`, `'sesion'`, `'nunca'`) |
| Cambiar los textos del BIOS | `lineas` dentro de `arrancar()` en `src/consola/arranque.ts` |
| Cambiar el arte del disco o de la portada del estuche | `arteDisco()` y `artePortada()` en `arranque.ts` (se dibujan en canvas; la calavera usa el mismo truco que `mirrorHalf`) |
| Cambiar colores, tamaños o la consola | `src/consola/arranque.css` (variables al inicio, en `#arranque`) |
| Cambiar los sonidos | `sfx` en `arranque.ts` (`clack`, `whirr`, `acorde`) |

Para verlo de nuevo en la misma pestaña mientras pruebas, pon `ARRANQUE = 'siempre'` o abre el juego en una pestaña nueva.

---

## 13. El Abismo de los Ejes (v0.38, beta)

Por ahora se abre sólo desde el **Modo profesor → Abismo (beta)**. Se juega como el «acto 5»: 2 tramos de 8 pisos (jefe al azar y Primigenio) y luego el modo infinito.

| Quiero agregar… | Dónde |
|---|---|
| Página del Necronomicón | `PAGINAS` en `src/data/abismo_modo.ts`; su efecto en `Combat.ts` (busca `this.necro('…')`) |
| Pacto (mazo inicial) | `PACTOS` en `src/data/abismo_modo.ts`; su regla en `Combat.ts` (busca `this.pacto('…')`) |
| Edición de carta | `EDICIONES` en `abismo_modo.ts` (probabilidad y texto), color en `src/ui/card.ts` y efecto en `playOn()` de `Combat.ts` |
| Carta del Abismo | `src/data/cards.ts` con `abismo: true` (sólo sale en el Abismo) + su `case` en `playOn()` |
| Enemigo del Abismo | `src/data/enemies.ts` con `act: 5` + `ENCOUNTERS_5`; el dibujo en `tools/arte/abismo.py` (corre `python3 tools/arte/abismo.py`) |
| Eco Quebrado | `src/data/figures.ts` con `act: 5`; el retrato en `FIG_ABISMO` de `src/art/abismo.ts` |
| Pregunta de cuerpo rígido | `ABISMO_GEN` en `src/data/runes.ts` o un bloque en `preguntas.ts` con los conceptos de `ABISMO_CONCEPTS` |
| Texto del prólogo | `PROLOGO` en `abismo_modo.ts` |
| Cordura (cuánto sube o baja) | `CORDURA` en `abismo_modo.ts` |
| Sobre nuevo o sus probabilidades | `SOBRES`, `abrirSobre()` y `BRILLANTE` en `abismo_modo.ts` |
| Qué tan seguido se rompe el Cristal | `ROMPER_CRISTAL` en `abismo_modo.ts` |
| Página de la Guía del Abismo | `PAGINAS_GUIA` en `src/ui/guiaAbismo.ts` |
| Jefe nuevo del Abismo | su ficha en `JEFES` de `abismo_modo.ts` (nombre, tema, desventaja, origen) y en `JEFES_TRAMO` o `PRIMIGENIOS`; sus ataques en `src/data/enemies.ts` (con `act: 5`); su desventaja en `Combat.ts` (busca `jefeVivo('…')`); su dibujo en `tools/arte/abismo.py` |
| Número de tramos, pisos o dificultad | `TRAMOS`, `PISOS_TRAMO`, `escalaTramo()`, `escalaDano()` y `multPuntaje()` en `abismo_modo.ts` (si cambias los pisos, cambia también `PISOS_TRAMO_ABISMO` en `src/state.ts`) |
| Diente (reliquia del Abismo) | `DIENTES` en `src/data/dientes.ts` (tipo `normal`, `astro` o `maldito`; `peso` = qué tan seguido sale); su efecto en `Combat.ts` (busca `this.diente('…')`, `dientesAtaque()` o `dientesNoAtaque()`); su dibujo en `dibujarDiente()` de `src/ui/dentadura.ts` |
| Cuántos huecos, precio de volver a tirar, fuerza de la Alineación | `HUECOS`, `RETIRAR_DIENTES` y `ALINEACION` en `src/data/dientes.ts` |
| Rareza, Cristal, parásitos | `PROB_RAREZA`, `PROB_CRISTAL`, `CRISTAL_COMBATES`, `PROB_PARASITO_SACAMUELAS` y `ARRANCAR_PARASITO` en `src/data/dientes.ts` |
| Relato del Abismo (cuento de Lovecraft) | `RELATOS` en `src/data/relatos.ts` (opciones con pregunta o con azar); la escena es `src/scenes/Relato.ts` |
| Carta del Astrónomo de Providence | `CARTAS` en `src/data/lovecraft.ts`; dónde se cumple: busca `cartaLovecraft(` en `Combat.ts` y `cumplirCarta(` en `Rune.ts` |
| Constelaciones del Observatorio | `observatorio()` en `src/scenes/Abismo.ts` (los niveles se guardan en `run.cosmos`) |
| Cuántos pactos ofrece el libro | `PACTOS_OFRECIDOS` en `abismo_modo.ts` |
| Nombre de un tramo | `NOMBRE_TRAMO` en `abismo_modo.ts` |
| Hoja del diario de Montemayor | `PROLOGO` en `abismo_modo.ts` (en orden; se guardan en `Game.codex.diario`); qué tan seguido salen, `PROB_HOJA`, `HOJAS_POR_EXPEDICION` y `HOJAS_DEBILIDAD` en el mismo archivo |
| Ranking del Abismo | `leaderboard` en `apps-script/Code.gs` (las partidas con acto 5 son del Abismo) |
| Cómo se ve una edición | `edicionVisual()` en `src/ui/card.ts` |

Mecánicas nuevas de enemigos: `confusion: true` en una intención (te Confunde), `vuelco: true` (se vuelca con 2 golpes en el mismo turno) y `hueco: true` (los golpes a TODOS le hacen la mitad).

Estados del Abismo en una intención (v0.42): `aturde: true` (si el golpe te hace daño pierdes tu siguiente turno), `hemorragia: N` (N turnos en que cada carta jugada te quita 1 de vida) y `vertigo: N` (robas N cartas menos el siguiente turno, máximo 3).



### Vista previa de cartas (v0.50)

Al pasar el mouse por una carta, `Combat.previa(v)` arma el texto «⚔ Si la juegas ahora», que el `Tooltip` muestra abajo de la explicación. Ese texto sale de tres funciones:

- `baseAtaque()`: el daño base de cada Ataque (golpes, a todos, ignora Bloqueo…).
- `previaAtaque()` / `previaContra()`: los bonos y el resultado contra cada enemigo.
- `previaOtra()`: el Bloqueo de Defensas y Habilidades.

Los bonos de los dientes salen de `dientesBonos()`, que es la misma función que usa el ataque real. Así la vista previa no se desfasa.

**Si agregas una carta de Ataque con una regla especial**, agrega su `case` en `baseAtaque()`. Si no lo haces, la vista previa usará F = m·a.

**Si agregas un bono nuevo** dentro de `playOn`/`hitEnemy`, agrégalo también en `previaAtaque()`.


### Las Tierras del Sueño (v0.51)

- **Sueños:** viven en `src/data/relatos.ts → SUENOS`. Son Relatos con `sueno: true`, así que no salen en los «?». Para agregar uno, copia uno existente.
  - Si quieres que una salida empiece una pesadilla, usa el efecto `combate: '<clave>'`. La clave debe existir en `src/data/enemies.ts → ENCOUNTERS_SUENO`.
  - En una pesadilla la vida que pierdes se devuelve al despertar (`run.suenoHp`). Morir sólo despierta al jugador (`Combat.dies`).
- **Escena:** `src/scenes/Sueno.ts`.
  - Fase `entrar`: las 3 puertas. Primero salen los sueños que el jugador no ha soñado (`codex.suenos`).
  - Fase `despertar`: entrega el premio después de una pesadilla.
- **Criaturas nuevas:**
  - Los dibujos están en `tools/arte/mythos.py`. Corre `python3 tools/arte/mythos.py` y se escribe `src/art/mythos_sprites.ts`.
  - Los datos van en `src/data/enemies.ts`.
  - Intenciones nuevas: `perfora` (atraviesa el Bloqueo) e `inunda` (te quita el Bloqueo antes del golpe).
- **Jefes:**
  - Los jefes de tramo y los Primigenios se registran en `JEFES`, `JEFES_TRAMO` y `PRIMIGENIOS` (`abismo_modo.ts`). Al estar en `JEFES`, cada uno crea solo su logro `abismo_<id>`.
  - Sus reglas especiales están en `Combat.ts`; busca `yig`, `cincoCabezas` y `shubNiggurath`.


### El Gabinete de Montemayor (v0.53)

Los minijuegos de física del Abismo están en `src/scenes/Gabinete.ts`, un método por juego: `rampa()`, `centroide()` e `inercia()`.

- **Para agregar figuras al centroide:** agrégalas a la lista `figuras`. Las piezas pueden ser `rect`, `tri` o `hueco` (el hueco cuenta con área negativa).
- **Para agregar cuerpos al juego de inercia:** agrégalos a la lista `C`. El campo `k` es el factor de I = k·m·R².
- **Premios:** se ajustan en `ERGIOS_ACIERTO` y `CORDURA_PERFECTO`.


---

## 13. Contenido por clase y gravedad del Abismo (v0.87)

### Reliquias de una sola clase

En `src/data/relics.ts` una reliquia puede llevar `cls` con el id de la clase
(`'arcanista'`, `'penitente'` o `'espectro'`). Esa reliquia **sólo sale en los botines
de quien juega con esa clase**, y lo hace con el doble de probabilidad que las demás,
porque son pocas:

```ts
  maxwell: { id: 'maxwell', cls: 'arcanista', name: 'Rueda de Maxwell', icon: 'i_pend',
    text: 'Empiezas cada combate con 3 m/s de rapidez.', lore: '…' },
```

El filtro vive en `randomRelics()` (`src/scenes/Reward.ts`) y usa `reliquiasDeClase(clase)`.
Las del Caballero no llevan `cls`: son las de siempre (Yunque, Guantelete, Coraza…),
porque viven de F = m·a y del Bloqueo, que es justo su física.

### Que un bono le sirva a las cuatro clases

Un bono de «+N kg a tus ataques» no le sirve igual a todos: el Arcanista pega con
½mv² y el Penitente con p = m·v. Para eso está `this.masaOVel(n, fuente)` en
`Combat.ts`, que traduce el bono a lo que cada clase aprovecha:

| Clase | Recibe |
|---|---|
| Caballero | +n kg (entra directo en F = m·a) |
| Arcanista y Penitente | +n m/s |
| Espectro | +n kg, que alimentan su energía Potencial (U = m·g·h) |

**Usa `masaOVel` en cualquier reliquia, don, página o pacto nuevo que dé masa o
aceleración.** Si lo escribes como `this.masa += n`, las cuatro clases lo reciben,
pero tres de ellas lo aprovechan a la mitad o nada.

Dos recordatorios al poner números en una carta del Penitente:

- Δv = vₑ·ln(m₀/m₁) **se dispara cuando le queda poca masa** (con 12 kg, quemar 4 da
  casi 40 m/s). Si vas a convertir ese Δv en Bloqueo o en daño plano, tópalo: ve
  `dvEscudo()` y `DV_ESCUDO` en `cards.ts` (el Escudo Ablativo daba 150 de Bloqueo
  sin ese tope).
- `quemar()` nunca lo mata: la masa no baja de 1 kg.

### Cartas nuevas de clase

El `cls` de la carta decide en qué mazo de recompensas cae; `rewardPool()` las toma
solas, no hay que registrarlas en otro lado. Si la carta es una **Defensa cuyo
Bloqueo depende del momento** (de la rapidez, de las formas canalizadas, del Δv),
agrégala también al `switch` de la vista previa en `Combat.ts` (busca
`Defensas cuyo Bloqueo depende del momento`), si no el alumno no ve el número
antes de jugarla. Lo mismo para los **Ataques** con daño calculado: van en el
`switch` de arriba (busca `case 'pesoMuerto'`).

### Gravedad en el Abismo

El portal del Abismo (en `Menu.ts`) ahora abre el mismo selector de gravedad que una
expedición normal: `pickGravity(onPick, info)` recibe qué hacer con el nivel elegido.
El nivel viaja en `fadeTo(this, 'Abismo', { gravedad })` y de ahí a `newRun()`, así que
multiplica vida y daño de los enemigos **además** de la escala del tramo, y multiplica
el puntaje del ranking (`scoreMul` en `src/data/gravity.ts`). La pantalla de entrada
del Abismo muestra con qué gravedad vas a bajar.

Para agregar un astro nuevo como nivel de dificultad, copia una fila de `GRAVITY`
(`src/data/gravity.ts`): sirve igual para las expediciones normales y para el Abismo.

---

## 14. Avisos de novedades, filtros del Grimorio y puntajes (v0.87)

### Avisar de una actualización

El contenido de los avisos vive en **`src/data/novedades.ts`**, aparte del
`CHANGELOG.md`: el changelog es para quien programa y las novedades son para el
alumno, contadas en corto.

Al publicar una versión nueva:

1. Sube `VERSION` en `src/config.ts` (por ejemplo a `'0.88.0 · …'`).
2. Agrega la entrada **arriba** de `NOVEDADES`, con el mismo número de versión:

```ts
  {
    v: '0.88.0',
    titulo: 'Lo que sea que hayas hecho',
    puntos: [
      '**Un encabezado corto.** La explicación va después del punto y sale en gris.',
      'Un punto sin encabezado también funciona.',
    ],
  },
```

De 3 a 6 puntos, en segunda persona. Lo que va entre `**dobles asteriscos**` al
**inicio** del punto se pinta en dorado como encabezado; si una versión trae
muchos puntos, el pergamino se parte solo en varias páginas.

Quién ve el aviso:

| Alumno | Qué pasa |
|---|---|
| Ya jugaba y se perdió versiones | Ve el pergamino con todas las que le faltan |
| Ya jugaba pero nunca vio un aviso | Ve sólo la versión más reciente |
| Entra por primera vez | No ve nada (para él todo es nuevo) y queda al día |

Al cerrarlo se guarda la versión en `Game.codex.novedades` y no vuelve a salir
hasta la próxima. Siempre se puede volver a leer en **★ Novedades** del menú.
Si se te olvida subir `VERSION_NUM`, el aviso sale una vez y se calla: se guarda
la más alta entre la del juego y la de la lista.

> El aviso se llama directo al final de `create()` del menú, **sin
> `delayedCall`**: así no depende de que el reloj de la escena esté corriendo.

### Filtros del Grimorio

Están en `FILTROS` (`src/scenes/Codex.ts`), una lista por número de pestaña:

```ts
  3: [
    { nombre: 'Todas', pasa: () => true },
    { nombre: 'Arcanista', pasa: (e) => CARDS[e.id]?.cls === 'arcanista' },
  ],
```

`pasa` recibe la entrada de la cuadrícula (trae `kind` e `id`), así que se puede
filtrar por lo que sea del dato. Una pestaña con filtros pierde un renglón de la
cuadrícula, que se descuenta solo. Para agregar filtros a otra pestaña basta con
ponerla en `FILTROS` con su número.

### Puntajes grandes

`fmtPuntos()` (`src/data/puntaje.ts`) escribe los números con **prefijos del
SI**: hasta 100 000 va completo (`12,340`) y de ahí en adelante `128 k`,
`1.20 M`, `1.20 G`, `1.20 T`. Se usan los prefijos del SI y no «billones»
porque significan cosas distintas en español y en inglés —y porque es un curso
de física—. `fmtPuntosExacto()` da el número completo, para donde sí quepa: hoy
se usa en el desglose de la pantalla final.

**Úsalo en cualquier pantalla nueva que muestre puntaje.** En el infinito del
Abismo la vida de los enemigos crece exponencialmente y los puntajes llegan a
trece dígitos.

---

## 15. Papeles de combate: proteger, marcar, reordenar y atacar la cordura (v0.88)

Los enemigos ya no sólo pegan y bloquean. Estos campos nuevos dan papeles al
estilo de «Darkest Dungeon», cada uno atado a la física del Abismo.

### En el enemigo (`EnemyDef`)

| Campo | Qué hace | Ejemplo |
|---|---|---|
| `protege: true` | Recibe los golpes DIRIGIDOS a sus compañeros mientras siga en pie. Los golpes a TODOS sí le llegan a cada quien, que es la forma de rodearlo. | Cariátide del Pórtico |

El desvío está al principio de `hitEnemy()`. Si pones dos enemigos con
`protege` en el mismo grupo, el primero de la fila se queda con todo: es
preferible uno solo por encuentro.

### En la intención (`IntentExtras`)

| Campo | Qué hace | Ejemplo |
|---|---|---|
| `locura: n` | Sube la Locura del alumno (le baja la Cordura). El Bloqueo no protege de esto. | Coro de Hastur |
| `marca: n` | Lo MARCA n turnos: mientras dure, TODOS los enemigos le pegan `MARCA_MUL` veces más (1.5). Se gasta al inicio de cada turno suyo. | Topógrafo de Ejes |
| `reordena: true` | Revuelve los lugares de la fila y le da a cada quien Bloqueo según su NUEVA distancia al eje (d/2, o sea 3, 5, 7 y 9). | Agrimensor de Leng |

`reordena` usa `reordenarFila()`, que mueve a cada enemigo con todo y su barra
de vida, su nombre y su intención (`moverEnemigo()`). Como las distancias
(6, 10, 14 y 18 m) salen del orden de la fila, reordenar también le mueve el
piso al Tiro Parabólico del alumno.

### Dejar un cadáver

No hace falta un campo nuevo: se reutiliza `split`. La Carroña de Shoggoth
muere con `split: { id: 'cadaver', n: 1 }` y deja una **Masa Muerta**, un
enemigo cuya intención es siempre `{ kind: 'stunned', label: 'Masa muerta' }`.

> Una intención `stunned` **con `label`** es algo que nunca actúa y así se lo
> explica al alumno; sin `label` sigue siendo «Detenido», el enemigo al que
> acabas de frenar. Las dos reciben ×1.5 de daño.

El cadáver ocupa un lugar de los cuatro, así que estorba las invocaciones
(`summon` busca lugar libre) y corre la distancia d de los demás.

### El arte

Los siete sprites están en `tools/arte/abismo.py`, que se dibuja con figuras
(`disc`, `poly`, `line`, `rect`, `shade`, `outline`) y exporta matrices de
letras. Se corre con `python3 tools/arte/abismo.py`: reescribe
`src/art/abismo_sprites.ts` **completo** y deja una vista previa en
`/tmp/abismo.png`, así que agrega tus sprites al script, nunca al `.ts`.
Las texturas se registran solas desde `ABISMO_SPRITES`.

> Los nombres largos se cortan en el lugar de la derecha de la fila: conviene
> dejarlos en unos 20 caracteres («Cariátide del Pórtico», no «Cariátide del
> Pórtico Hundido»).

### Jefes que llegan acompañados (v0.88)

Un jefe del Abismo normalmente pelea solo: el combate arma el grupo con
`[run.jefe]`. Para los que necesitan compañía está **`JEFE_GRUPO`**
(`src/data/enemies.ts`):

```ts
export const JEFE_GRUPO: Record<string, string[]> = {
  centroInstantaneo: ['brazoCir', 'centroInstantaneo', 'brazoCir'],
  parFuerzas: ['parFuerzas', 'parGemelo'],
};
```

El orden es el de la fila, así que el jefe puede ir en medio. Los
acompañantes **no** van en `JEFES` de `abismo_modo.ts`: así reciben vida de
enemigo normal y no de jefe.

> Si agregas uno, acuérdate de que el combate ya no puede suponer que el jefe
> es el primer enemigo vivo. Para eso está `jefeDelCombate()`, que busca al que
> sí está en `JEFES`; úsalo en cualquier código nuevo que necesite «el jefe de
> esta pelea» (la condición del jefe y la mordida de la dentadura ya lo usan).

Los dos jefes nuevos, como ejemplo de lo que se puede armar con esto:

- **El Centro Instantáneo** (v = ω·r). Su `next()` escribe en `e.cir` sobre qué
  lugar de la fila pasa el eje este turno. Después de repartir las intenciones,
  `aplicarCir()` le cambia la intención a ese cuerpo por un bloqueo (r = 0: no
  se mueve) y `hitEnemy()` ajusta el daño por distancia al pivote: ×0.25 encima
  del eje, normal al lado y ×1.5 en la punta.
- **El Par de Fuerzas** (ΣF = 0, ΣM ≠ 0). Dos cuerpos que se curan con
  `healAll`. En `killEnemy()`, cuando cae uno, el otro recibe `furia = true` y
  su `next()` cambia a los golpes grandes.

---

## 16. La pelea en curso: por qué recargar ya no sirve de nada (v0.88)

**El agujero.** `run.floor` sólo avanza **al ganar** un combate. Como la partida
se guarda en `localStorage`, cerrar la pestaña a medio combate devolvía al
alumno justo antes de pelear… y todo se volvía a sortear: los enemigos, la
condición del piso y, sobre todo, la **condición del jefe**. Varios alumnos lo
usaban para esquivar «Mente en Blanco».

**El parche.** `run.combate` (en `state.ts`) guarda la pelea tal como quedó
sorteada:

```ts
combate?: {
  piso: number; kind: string; nodo?: number;
  enc: string[]; cond?: string; condJefe?: string; mordidos?: number[];
  veces: number;
};
```

- `guardarPelea()` lo escribe al entrar; `olvidarPelea()` lo borra al ganar, y
  el camino de la muerte lo borra también.
- Al entrar, si `run.combate` corresponde a **esta misma** pelea (mismo nodo del
  mapa, o mismo piso y tipo si no hay nodo), se restauran los enemigos y las dos
  condiciones en lugar de sortear.
- `veces` cuenta los reingresos y se manda a la hoja en el evento `pelea`.

> **Importante para quien agregue algo que se sortee al empezar un combate:**
> guárdalo en `run.combate` y restáuralo, o volverá a ser re-sorteable. Y
> `guardarPelea()` tiene que quedarse **después** de `abismoModoInicio()`, que es
> quien elige la condición del jefe: si se llama antes, se guarda a medias y el
> agujero sigue abierto (pasó al escribir esto).

**Detectarlo en la hoja.** Cada entrada a un combate deja un evento `pelea` con
`{piso, tipo, veces, cond, condJefe}`. Un alumno que recarga a propósito aparece
con `veces` mayor que 1 muchas veces. Para verlo por alumno:

```
=QUERY(Eventos!A:H,"select C, B, count(A) where E = 'pelea' and H like '%\"veces\":2%' group by C, B order by count(A) desc",1)
```

Eso no castiga a nadie solo: una recarga suelta también puede ser que se cayera
el internet. Lo que delata es el patrón.

**Condiciones de jefe** (`CONDICIONES_JEFE` en `abismo_modo.ts`): ya son nueve.
Las nuevas se enganchan en un solo lugar cada una — `usePotion()` (Frasco
Sellado), el robo de `startTurn()` (Mano Corta), `const fam = …` (Soledad) y la
energía del primer turno (Arranque Lento).
