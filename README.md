# Las Criptas de Hibbelerius

Roguelike de cartas en estilo dark fantasy para el curso de **Dinámica**. Los alumnos crean a su héroe, bajan por las criptas y pelean con mecánicas que *son* física: cada golpe calcula **F = m·a**, la energía se paga en **Joules**, los enemigos con **inercia** sólo se detienen con una fuerza neta suficiente, y los altares rúnicos plantean problemas tipo Hibbeler con parámetros aleatorios.

> Versión 0.7 · Expedición completa en 3 actos: Leyes de Newton (I), trabajo y energía (II) e impulso y cantidad de movimiento (III), con **Hibbelerius** como jefe final. Clases: Caballero de la Masa y Arcanista Cinético.
>
> **¿Quieres agregar enemigos, preguntas, figuras históricas o música?** Lee la [Guía para ampliar el juego](docs/GUIA-AMPLIAR.md).

## Qué incluye

| Parte | Detalle |
|---|---|
| Cuentas | Matrícula, contraseña creada por el alumno y clave de grupo que da el profesor |
| Avatar | Héroes de 42×44 píxeles con más detalle. Caballero: yelmo (5), armadura (6), brillo del visor (6), arma (mazo, espada, hacha, lanza), escudo (3) y capa (8). Arcanista: sombrero (5), ribete, color de ojos, bastón (orbe, cristal, engrane, calavera), barba (3), tono de piel (5) y túnica (8). El dibujo está en `src/art/heroes.ts` |
| Mapa | 9 pisos generados al azar: combates, élites, encuentros, ecos del pasado, altares rúnicos, mercader, fogatas y el jefe |
| Ecos del Pasado | Estilo Hades: Newton, Galileo, Émilie du Châtelet, Joule, **Einstein**, **Marie Curie**, **Huygens**, **Hooke**, **Emmy Noether** y **Coriolis** ofrecen dones para toda la expedición; si respondes bien su pregunta, los dones son épicos. Los dones de Einstein y Curie son más fuertes pero cobran **radiación** (daño que ignora el Bloque) |
| Encuentros | Cada nodo «?» se sortea: 5 personajes con pregunta (bendición o maldición pasajera), 7 **dilemas** de riesgo con probabilidades visibles (pozo, notario, núcleo inestable, demonio de Laplace, balanza, criatura, puente) o, rara vez (14 %), **el Profe Victorino**, que regala una vida extra |
| Familiares | Gato de Schrödinger, Lechuza de Minerva, Salamandra Ígnea, Tortuga de Zenón y Cuervo: pelean contigo 3–5 combates. Se consiguen en dilemas, en la tienda o tras una élite |
| Azar | 35 % de los combates traen una **condición de piso** (viento, niebla, lodo, anomalía gravitatoria…); a veces un combate normal suelta una reliquia |
| Acto III | **La Torre del Tomo**: biblioteca gótica con vitral de engrane, 6 enemigos nuevos (Bala de Cañón, Tomo Volador que deja *Tarea Pendiente*, Cohete de Masa Variable, Granada que se divide, Ariete y Giróscopo como élites) y **Hibbelerius** en tres capítulos: Fuerza (13), Energía (14) e Impulso (15). En el último hay que DETENERLO antes de su Impulso Final. Los altares preguntan impulso, choques (e), retroceso y cantidad de movimiento angular |
| Mercader | Cartas, reliquia, a veces un familiar, olvidar una carta y curación, pagando con Ergios. Se puede regatear resolviendo un problema (−30 %) |
| Música | Menú, encuentros y mapa del Acto III: «Cold Soul» de [Lost in The Forest](https://lostintheforest.bandcamp.com/album/cold-soul) (uso libre con atribución). Combates, jefes y santuario: dark synth generado en vivo (13 pistas) |
| Acto II | Al vencer al Coloso la expedición continúa en **Las Galerías de la Fricción**: arte en primera persona inspirado en Wizardry, mapa tipo cuadrícula, 6 enemigos nuevos y la Bruja de la Fricción como jefa. Las preguntas de los altares se enfocan en trabajo y energía |
| Arcanista Cinético | Segunda clase (se desbloquea al vencer al Coloso): acumula rapidez *v* (máx. 8 m/s) y ataca con K = ½·m·v². Tiene 48 de vida; la fricción lo frena. Cartas propias: Chispa, Picada Gravitatoria (v = √(2gh), más fuerte en Júpiter), Torbellino, Cometa, Estela Cinética y Superficie Sin Fricción |
| Modo profesor | Sólo para las matrículas de `ADMINS` en `src/config.ts`: empezar en cualquier acto, saltar al jefe, a una figura, al profesor o a un dilema, desbloquear el Grimorio y ganar un combate con la tecla K. Esas partidas no se registran |
| Portada | Al abrir el juego aparece la ilustración «Las Criptas de Hibbelerius» (`public/portada.jpg`); el primer clic también activa el audio en tablets |
| Repaso final | Al terminar (ganes o pierdas), la pantalla final muestra hasta 3 temas que fallaste con su fórmula clave y una idea para recordarla (`src/data/lecciones.ts`) |
| Pistas | En altares, encuentros y ecos puedes pagar 15 Ergios por una pista: descarta dos opciones incorrectas o muestra la fórmula (`PISTA_COSTO` en `src/config.ts`) |
| Cartas | 38 cartas: neutrales (ganar Joules, robar y descartar, daño igual a tu Bloque), daño elemental físico (Calor, Resonancia, Fatiga del material) y cartas basura que meten los enemigos (Lodo Pegajoso, Ruido Blanco, Error de Signo) |
| Pantalla | Se dibuja al doble de resolución; botón de pantalla completa y control de volumen arriba a la derecha |
| Enemigos | 36 enemigos. Los más duros tienen mecánicas propias: se dividen al morir (Babosa Madre, Gota de Mercurio, Granada, Átomo), invocan aliados (Nigromante, Colmena, Bibliotecario), protegen a todos (Guardián del Índice), te roban Joules y se curan (Sifón Térmico), tienen púas (Armadura de Púas) o explotan al morir (Átomo Inestable) |
| Runas | 26 tipos de problema numérico con datos al azar y **39 preguntas de opción múltiple** conceptuales (`src/data/preguntas.ts`, fáciles de ampliar). Cerca del 60 % de las preguntas son de opción múltiple (`MCQ_SHARE`). Todas muestran la solución paso a paso |
| Registro | Cada alumno, partida, piso alcanzado y respuesta a runas se guarda en Google Sheets |

### Cómo se traduce la física al juego

| Concepto | Mecánica |
|---|---|
| 2ª ley | Daño = F = (masa del arma) × (aceleración). Forja suma kg, Carrera suma m/s² |
| 1ª ley | Élite y jefe acumulan Inercia; un solo golpe con F ≥ umbral los detiene |
| 3ª ley | Embestida devuelve ¼ de su fuerza; Acción-Reacción refleja cada golpe |
| Peso | Peso Muerto usa W = m·g: no depende de tu aceleración e ignora el bloqueo |
| Componentes | Tajo Angulado: θ = 0° → F a uno; θ = 60° → F·cos60° a todos |
| Fricción | El lodo resta m/s² a tus ataques |
| Equilibrio | ΣF = 0 genera bloqueo igual a la fuerza que viene |

## Correr en tu computadora

Requiere [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run dev      # abre http://localhost:5173
```

Sin URL de backend (archivo `src/backend.ts`), el juego entra en **modo sin conexión** (sólo pide matrícula y guarda en el navegador).

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube esta carpeta (sin `node_modules`).
2. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `push` a `main` construye y publica el juego automáticamente (`.github/workflows/deploy.yml`).
4. La dirección será `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

## Backend en Google Sheets

1. Crea una hoja de cálculo nueva en Google Drive.
2. **Extensiones → Apps Script** y pega el contenido de `apps-script/Code.gs`.
3. Ejecuta la función `setup` (acepta los permisos). Se crean las hojas Grupos, Alumnos, Partidas, Eventos, Panel y Conceptos.
4. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: *Yo*. Acceso: *Cualquier usuario*.
5. Copia la URL que termina en `/exec` y pégala en **`src/backend.ts`** → `API_URL`. Haz commit y push. Ese archivo casi nunca cambia: al actualizar el juego, conserva tu versión.
6. En la hoja **Grupos**, da de alta una fila por grupo: `clave` (p. ej. `DIN-OTO26`), `nombre`, `activo = TRUE`. Para cerrar las inscripciones de un grupo, pon `FALSE`.
7. Menú **Criptas → Actualizar panel** (o *Actualizar panel cada hora*).

| Hoja | Para qué sirve |
|---|---|
| Panel | Una fila por alumno: partidas, piso máximo, Acto I superado, puntaje y % de aciertos en runas |
| Conceptos | % de aciertos por grupo y concepto (en rojo los temas que conviene repasar) |
| Partidas / Eventos | Datos crudos para análisis |

**Notas de seguridad.** La contraseña se cifra con SHA-256 en el navegador y otra vez con sal en el servidor; nunca se guarda en texto plano. Aun así, es un sistema escolar, no bancario: pide a los alumnos que no reutilicen contraseñas importantes. Un alumno con conocimientos técnicos podría enviar datos falsos a la API; para un curso basta, y los eventos dejan rastro. Guarda sólo matrícula y alias (sin nombres completos) y comparte un aviso de privacidad breve con el grupo.

Para reiniciar la contraseña de un alumno: borra su fila en la hoja **Alumnos** y pídele que cree su cuenta de nuevo.

## Cambiar textos

Casi todo lo que se lee en pantalla está en **`src/textos.ts`**: menús, botones, mensajes, nombres de lugares, diálogos del mercader y del final. Cambia el texto entre comillas y guarda; no hace falta tocar nada más.

| Qué quieres cambiar | Archivo |
|---|---|
| Menús, botones, mensajes, títulos | `src/textos.ts` |
| Nombre, descripción o explicación física de una carta | `src/data/cards.ts` |
| Enemigos | `src/data/enemies.ts` |
| Reliquias | `src/data/relics.ts` |
| Personajes de los encuentros y sus diálogos | `src/data/events.ts` |
| Figuras históricas y sus dones | `src/data/figures.ts` |
| Bendiciones y maldiciones | `src/data/effects.ts` |
| Problemas de las runas | `src/data/runes.ts` |

## Música

La música se genera en vivo con el navegador (Web Audio): no hay archivos ni licencias de por medio. Las pistas están en `src/audio.ts` (tempo, acordes y patrones de cada una).

Si prefieres usar pistas propias (por ejemplo, música libre de derechos), copia los MP3 a `public/musica/` y escribe el nombre en `MUSIC_FILES` dentro de `src/config.ts`:

```ts
export const MUSIC_FILES = { menu: 'menu.mp3', mapa: '', combate: 'combate.mp3', jefe: 'jefe.mp3', calma: '' };
```

Las pistas que dejes vacías seguirán usando el sintetizador. Revisa siempre la licencia de la música que uses.

## Estructura

```
src/
  backend.ts         URL del backend (Apps Script)
  textos.ts          todos los textos de pantalla
  audio.ts           música dark synth y efectos de sonido
  config.ts          constantes y música opcional en archivo
  data/              cartas, enemigos, reliquias, clases y generador de problemas
  art/               paleta y sprites pixel-art (definidos como matrices en código)
  scenes/            Login, Avatar, Menú, Mapa, Combate, Botín, Runa, Encuentro, Santuario, Mercader, Fogata, Final
  ui/                cartas, barra superior, botones y tooltips
apps-script/Code.gs  backend para Google Sheets
```

Para agregar contenido (enemigos, cartas, preguntas, figuras, encuentros, música) sigue la [Guía para ampliar el juego](docs/GUIA-AMPLIAR.md).

## Créditos de la música

- **«Cold Soul», partes 1–3**, de **Lost in The Forest** — https://lostintheforest.bandcamp.com/album/cold-soul. El artista permite usar su música en cualquier proyecto pidiendo sólo un enlace a su Bandcamp (está en la pantalla de Créditos del juego y aquí).
- Las pistas están en `public/musica/`, recomprimidas a 80 kbps para que pesen ~17 MB en total (GitHub acepta archivos de hasta 25 MB por la web y 100 MB por git).

## Hoja de ruta

- ~~**Acto II · Las Galerías de la Fricción:** trabajo y energía (cap. 14). Arcanista Cinético (½mv²).~~ Listo en la v0.5.
- ~~**Acto III · La Torre del Tomo:** impulso y cantidad de movimiento (cap. 15) con Hibbelerius.~~ Listo en la v0.7.
- Tercera clase (ver propuestas en la conversación: Guardián del Equilibrio, Explorador de Alturas o Duelista del Impulso).
- Más enemigos, encuentros y opciones de personalización (armas, emblemas, retratos).

## Actualizar el backend en la v0.7

La hoja **Panel** ahora dice «Piso máx. (de 27)» y «Expedición completa» sólo cuenta a quien vence a Hibbelerius. Pega el nuevo `apps-script/Code.gs` y crea una **nueva versión** de la implementación (sección *Actualizar el backend*). Si no lo actualizas, el juego funciona igual.
