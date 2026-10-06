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
| Mapa | 13 pisos por acto (39 en total), generados al azar: combates, élites, encuentros, ecos del pasado, altares rúnicos, mercaderes, fogatas y el jefe |
| Ecos del Pasado | Estilo Hades: Newton, Galileo, Émilie du Châtelet, Joule, **Einstein**, **Marie Curie**, **Huygens**, **Hooke**, **Emmy Noether** y **Coriolis** ofrecen dones para toda la expedición; si respondes bien su pregunta, los dones son épicos. Los dones de Einstein y Curie son más fuertes pero cobran **radiación** (daño que ignora el Bloque) |
| Encuentros | Cada nodo «?» se sortea: 5 personajes con pregunta (bendición o maldición pasajera), 7 **dilemas** de riesgo con probabilidades visibles (pozo, notario, núcleo inestable, demonio de Laplace, balanza, criatura, puente) o, rara vez (14 %), **el Profe Victorino**, que regala una vida extra |
| Familiares | Gato de Schrödinger, Lechuza de Minerva, Salamandra Ígnea, Tortuga de Zenón y Cuervo: pelean contigo 3–5 combates. Se consiguen en dilemas, en la tienda o tras una élite |
| Azar | 35 % de los combates traen una **condición de piso** (viento, niebla, lodo, anomalía gravitatoria…); a veces un combate normal suelta una reliquia |
| Acto III | **La Torre del Tomo**: biblioteca gótica con vitral de engrane, 6 enemigos nuevos (Bala de Cañón, Tomo Volador que deja *Tarea Pendiente*, Cohete de Masa Variable, Granada que se divide, Ariete y Giróscopo como élites) y **Hibbelerius** en tres capítulos: Fuerza (13), Energía (14) e Impulso (15). En el último hay que DETENERLO antes de su Impulso Final. Los altares preguntan impulso, choques (e), retroceso y cantidad de movimiento angular |
| Mercader | Cartas, reliquia, a veces un familiar, olvidar una carta y curación, pagando con Ergios. Se puede regatear resolviendo un problema (−30 %) |
| Música | Menú, encuentros y mapa del Acto III: «Cold Soul» de [Lost in The Forest](https://lostintheforest.bandcamp.com/album/cold-soul) (uso libre con atribución). Combates, jefes y santuario: **dungeon synth** generado en vivo (drones, coro sintético, clavecín, órgano y tambores de guerra) |
| Acto II | Al vencer al Coloso la expedición continúa en **Las Galerías de la Fricción**: arte en primera persona inspirado en Wizardry, mapa tipo cuadrícula, 6 enemigos nuevos y la Bruja de la Fricción como jefa. Las preguntas de los altares se enfocan en trabajo y energía |
| Arcanista Cinético | Segunda clase (se desbloquea al vencer al Coloso): acumula rapidez *v* (máx. 8 m/s) y ataca con K = ½·m·v². Tiene 48 de vida; la fricción lo frena. Cartas propias: Chispa, Picada Gravitatoria (v = √(2gh), más fuerte en Júpiter), Torbellino, Cometa, Estela Cinética y Superficie Sin Fricción |
| Modo profesor | Sólo para las matrículas de `ADMINS` en `src/config.ts`: empezar en cualquier acto, saltar al jefe, a una figura, al profesor o a un dilema, desbloquear el Grimorio y ganar un combate con la tecla K. Esas partidas no se registran |
| Portada | Al abrir el juego aparece la ilustración «Las Criptas de Hibbelerius» (`public/portada.jpg`); el primer clic también activa el audio en tablets |
| Repaso final | Al terminar (ganes o pierdas), la pantalla final muestra hasta 3 temas que fallaste con su fórmula clave y una idea para recordarla (`src/data/lecciones.ts`) |
| Pistas | En altares, encuentros y ecos puedes pagar 15 Ergios por una pista: descarta dos opciones incorrectas o muestra la fórmula (`PISTA_COSTO` en `src/config.ts`) |
| Progreso entre expediciones | Cada expedición da **Conocimiento** (pisos, runas, élites, actos, victoria). Hay 10 niveles: desbloquean 14 cartas nuevas (p. ej. Metabolismo Forzado: vida → energía; Torbellino de Acero; Singularidad), pociones y cosméticos. Se ve en el menú y en Grimorio → Progreso (`src/data/progreso.ts`) |
| Pociones | Hasta 3 frascos arriba de la pantalla (clic para usar o tirar): vida, energía, Bloqueo, masa, aceite, tinta, fuego griego, botella de Leyden, gas corrosivo y elixir mayor. Salen al ganar combates y en la tienda (`src/data/pociones.ts`) |
| Tiempo de juego | Se mide el tiempo ACTIVO de cada partida (pestaña visible y con actividad en los últimos 2 min) y se guarda en la hoja |
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

## Actualizar el backend en la v0.10

Pega el nuevo `apps-script/Code.gs`, ejecuta **`setup`** (agrega la columna `minutos` y las hojas nuevas sin borrar datos) y crea una **nueva versión** de la implementación (sección *Actualizar el backend*). Novedades:

| Hoja | Qué muestra |
|---|---|
| Panel | Ahora incluye **Minutos jugados** y **Min. por partida** de cada alumno |
| Resumen | Una fila por grupo: alumnos registrados y que jugaron, partidas, **horas jugadas**, min. por partida y por alumno, expediciones completas, piso promedio y % de aciertos |
| Actividad | Una fila por día y grupo: partidas, alumnos distintos y minutos jugados (para ver cuándo jugaron y si la actividad funcionó) |

### Si un alumno olvida su contraseña

Menú **Criptas → Reiniciar contraseña de un alumno…**, escribe su matrícula. Luego el alumno entra con **Entrar** escribiendo una contraseña NUEVA: esa queda guardada. No pierde su avatar, su Grimorio ni sus partidas. (La pantalla de inicio de sesión ya les explica esto.)

## Novedades de la v0.11

- **Puntaje estilo arcade** (`src/data/puntaje.ts`): cada enemigo vale su vida máxima × 10 (×1.5 élite, ×2 jefe); combate sin perder vida +500 (élite/jefe +1,000); runa correcta +300 con **racha** de hasta ×2; pista −100; acto superado +2,000 × acto; vencer a Hibbelerius +10,000. Al terminar: +20 por vida restante, +3,000 si no usaste la Vida Extra, +200 por poción y +5 por Ergio. Todo ×gravedad. En la pantalla final, pasa el cursor sobre el puntaje para ver el desglose.
- **El profe de mal humor** (5 % de los encuentros, una vez por expedición, nunca si ya viste al profe amable): te avienta el Hibbeler y pierdes la mitad de la vida. Si contestas bien: +60 Ergios y +8 de vida; si fallas: 2 «Tarea Pendiente».
- **Almas en pena** (`src/data/almas.ts`): Ícaro el Recursador, la Ayudante Sin Nombre y Sir Bernoulli el Errante. Si les ayudas o contestas su pregunta con compasión, se vuelven tu **aliado** y pelean a tu lado en élites y jefes. Sólo un aliado por expedición.
- **Música de Hibbelerius** más lenta y oscura (bajo distorsionado, campana con tritono).
- **Tiempo jugado total** en el menú.

## Limpiar la hoja (pruebas y beta testers)

En el menú **Criptas** del Google Sheet (pega el `Code.gs` nuevo y recarga la hoja; no hace falta nueva implementación para el menú, pero sí para el juego si cambiaste algo más):

| Opción | Qué hace |
|---|---|
| Borrar datos de un alumno… | Quita una matrícula (cuenta, partidas y eventos). Útil si un amigo probó en el grupo real. |
| Borrar datos de un grupo… | Quita todo lo de una clave (p. ej. `BETA`). La clave sigue en «Grupos». |
| Borrar TODO y empezar de cero… | Deja Alumnos, Partidas y Eventos vacías (los grupos se conservan). Pide escribir BORRAR. |

Antes de borrar, siempre se guarda una **copia de respaldo** de la hoja en tu Drive («Respaldo Criptas fecha»). Recomendación: da a tus amigos una clave aparte, por ejemplo `BETA`, y bórrala con «Borrar datos de un grupo…» antes de empezar con alumnos.

## Novedades de la v0.12

- **Ecos nuevos:** **Nikola Tesla** (rayos que dañan a todos los enemigos), **J. Robert Oppenheimer** (la carta «Trinity», que se usa una sola vez: destruye a todos los enemigos y a los jefes les quita 30–40 % de vida; reacción en cadena; todo con radiación) y **Charles Darwin** (una carta EVOLUCIONA 3 niveles —+2 kg o +3 de Bloqueo por nivel, se marca con ✦— y más vida máxima).
- **Reliquias de jefe:** al vencer al jefe del Acto I y del Acto II eliges 1 de 3: Reactor de Fisión, Agujero Negro de Bolsillo, Tomo Prohibido de Hibbeler, Corazón del Coloso o Volante de Inercia. Son muy fuertes, pero cada una tiene un costo (`src/data/relics.ts`).
- **Almas en pena nuevas:** **Sir Radián, el Mal Configurado** (su calculadora está en RAD: a veces pega fuerte, a veces te da Bloqueo, a veces «Math ERROR») y **el Doctorando Eterno** (pone Fatiga a todos los enemigos).
- **Enemigos con 20 % más de vida** (`VIDA_ENEMIGOS` en `src/data/enemies.ts`).
- **Mapas más variados:** nunca hay dos lugares de descanso seguidos (ecos, fogatas o mercaderes) y cada mapa tiene un tope al azar de cada uno (2–3).

## Novedades de la v0.13 · Horror cósmico

- **Entropía mental** (0–100, el ojo verde arriba a la derecha): sube al empezar combates contra jefes (+8) y élites (+3) y al leer el Necronomicón (+20). Baja al descansar en la fogata (−20), al hablar con los Ecos (−10) y con cada runa bien resuelta (−3).
  - **40+ Inquieto:** las fórmulas de tus cartas se van tapando con símbolos. Nunca se muestran fórmulas incorrectas, sólo borrosas.
  - **70+ Delirante:** «Visión del Abismo», tus ataques hacen +2.
  - **100 Quiebre:** en el siguiente combate aparece una **Sombra del Abismo** que mete Ruido Blanco a tu mazo; después la Entropía baja a 60.
- **El Necronomicón de Hibbeler:** dilema raro en los Actos II y III («El Atril sin Lector»). Con él, en cada fogata puedes **leer un Problema Prohibido** en vez de descansar: 13-∞ (más cartas, menos vida máxima), 14-0 (más energía, Errores de Signo), 15-(−1) Masa Negativa, Ω Universo Cerrado y Mirar de Vuelta. Todos los valores están en `src/data/abismo.ts`.
- **Code.gs:** no cambió en esta versión; las lecturas del Necronomicón y los Quiebres se registran en la hoja «Eventos» como `prohibido` y `quiebre`.
