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

## Novedades de la v0.14

- **Tercer personaje: el Penitente del Empuje** (se desbloquea al vencer a Hibbelerius). Su vida es su **masa**: las cartas de Empuje queman kilos y lo aceleran con la ecuación del cohete, **Δv = vₑ·ln(m₀/m₁)** (con poca masa acelera muchísimo más). Golpea con **p = m·v**, no tiene Bloqueo y **esquiva** si va a 6 m/s o más (perdiendo 3 m/s). El aire lo frena 2 m/s por turno y recupera masa al derrotar enemigos. 13 cartas propias en `src/data/cards.ts` (busca «PENITENTE»).
- **8 cartas legendarias** (marco dorado, una copia por expedición): Venganza de Newton, Tiro Parabólico (eliges el ángulo θ y ves el alcance R = v₀²·sen2θ/g), Péndulo, Patinadora, Resorte Comprimido, Dolor Resonante, Honda de David y Fuego Amigo. Se eligen tras vencer al jefe de los Actos I y II, y a veces salen tras una élite.
- **Hibbelerius rediseñado (antes «la Parca del Tomo», hoy «el Autor Eterno»)**: encapuchado, esquelético, flotando, con guadaña y su tomo encadenado; lanza hoces giratorias al atacar (`tools/arte/hib2.py`).

## Novedades de la v0.15

- **Portada en alta definición:** la ilustración original se reescaló al doble con una red de superresolución (EDSR) y se limpió el ruido del JPG; ahora se muestra a 1080 px sin verse borrosa.
- **Pergamino de cálculos:** las líneas largas se ajustan al cuadro (letra más chica o «…»). Pasa el cursor por el pergamino para leer los últimos 8 cálculos completos.
- **Cuarto personaje «¿?»:** queda como *Próximamente* para que lo propongan los alumnos.
- **Botón de retroalimentación:** pega la liga de tu formulario en `FORM_URL` (`src/config.ts`) y aparece «✎ Tu opinión» en el menú y «✎ Danos tu opinión» al terminar cada expedición.

## Novedades de la v0.16

- **AM** (`src/data/am.ts`): una inteligencia artificial atrapada en las criptas (homenaje al cuento de Harlan Ellison; diálogos originales). Aparece rara vez desde el piso 4, **recuerda entre expediciones** (visitas, tu última respuesta, pactos) y te hace una pregunta filosófica sin respuesta correcta (se registra en «Eventos» como `am`). Luego ofrece un **pacto**: resolver por ti tus próximas 3 runas. Si aceptas, aparece el botón «Que AM lo resuelva»: aciertas, pero sin puntos, racha ni Conocimiento, y sube tu Entropía mental (las runas resueltas por AM se registran como `am_runa` y NO cuentan como aciertos del alumno). Si lo rechazas, mejora una carta.
- **Glosario** en el menú (`src/data/glosario.ts`): tipos de ataque, estados (Calor, Resonancia, Fatiga…), efectos y el abismo (Entropía, Necronomicón).
- **Soundtrack** en el menú: se desbloquea al vencer a Hibbelerius; las 13 pistas con su nombre.
- **3 almas en pena nuevas:** Sir Mañana el Procrastinador, la Dama de los Decimales y el Encadenado de la Duda. Las opciones de las almas ahora salen en orden al azar.
- **Familiar nuevo:** Dragón de Carnot (3 de Calor a todos cada turno).
- **7 cartas:** Reacción Normal, Perdigones, (F = m·a)², Descarga Total, Fractura Frágil, Golpe de Gracia y la Palanca de Arquímedes ahora es para todas las clases.
- **Grimorio:** los perfiles de Einstein, Curie y Oppenheimer ya no se enciman; el jefe de cada acto aparece en el Bestiario en cuanto lo ves en el mapa.

## Novedades de la v0.17 (reseña de un jugador de Slay the Spire)

- **Opciones explicadas antes de elegir:** en dilemas y encuentros, las opciones con ⓘ muestran al pasar el cursor qué es cada carta, efecto, reliquia o familiar que puede salir (p. ej. «Ruido Blanco: carta basura, injugable»).
- **Arcanista más amable al inicio:** empieza cada combate a 4 m/s (antes 3) y su mazo inicial trae 2 Acelerar (antes 1).
- **Consejos para principiantes:** nueva pestaña «Consejos» en el Glosario y un consejo al azar al empezar cada acto. En la **primera expedición** de cada alumno, los combates fáciles de los primeros pisos tienen 30 % menos vida.
- **Jefes que se adaptan:** cada vez que detienes a un jefe (1ª ley), su umbral sube ×1.5 (`UMBRAL_JEFE_MUL` en `src/scenes/Combat.ts`), para que no se pueda dejarlo sin turno todo el combate.

## Novedades de la v0.18 · Economía y minijuegos

- **Tienda más presente:** cada acto garantiza 2 mercaderes (uno a mitad del camino y otro cerca del jefe), y el mercader ya puede quedar junto a fogatas o ecos. Siempre hay una **oferta del día** (−30 %) y puedes **vender hasta 2 cartas** por visita (común 14 · rara 25 · legendaria 45, +8 si está mejorada). A veces aparece un **Mercader Ambulante** en un encuentro, con precios rebajados.
- **La Taberna del Abismo** (nodo nuevo, 1–2 por acto) con dos minijuegos (`src/scenes/TiroBlanco.ts`, `src/scenes/TiraAfloja.ts`):
  - **Tiro al Blanco:** eliges θ y v₀; el proyectil cae en R = v₀²·sen2θ/g con la gravedad del astro. 3 tiros; hasta 25 Ergios por tiro.
  - **Tira y Afloja de Newton** (estilo Gwent, reglas en `src/data/tira.ts`): apuestas 10/25/50 Ergios y juegas al mejor de 3 rondas con 10 cartas de fuerza en tres filas (Jalón F, Rampa F·cosθ, Polea F×2) y especiales (Lodo, Acción-Reacción, Cuerda Rota, Masa Inamovible). Si ganas, recibes el doble.
- **Tablón de encargos** (`src/data/encargos.ts`): al empezar cada acto eliges un contrato opcional (p. ej. «vence una élite sin perder vida», «gana un duelo en la taberna»). Si lo cumples, te pagan; se ve arriba a la derecha.
- **Modo profesor:** saltos directos a Taberna, Tiro al blanco, Tira y Afloja, Mercader ambulante, Tablón y Vender cartas. Todo se registra en «Eventos» (`minijuego`, `minijuego_fin`, `venta`, `encargo`).

## v0.18.1 · «¿Más o menos?» reemplaza al Tira y Afloja

- En la Taberna, el **Tira y Afloja** (difícil de entender) se cambió por **«¿Más o menos?»** (`src/data/masmenos.ts`): aparecen dos cosas con su masa y rapidez (una bala, un elefante, Usain Bolt…) y eliges cuál tiene más **energía cinética** (K = ½mv²) o más **cantidad de movimiento** (p = m·v). Cada acierto duplica la apuesta (hasta 5 rondas); puedes retirarte cuando quieras. 4 de cada 10 pares son «tramposos»: uno gana en K y el otro en p. Al responder se muestran las cuentas.
- El Tira y Afloja sigue disponible sólo en el Modo profesor. El encargo «Rey de la taberna» cambió a «Acierta 4 seguidas en ¿Más o menos?».

## v0.18.2 · Arreglos a partir de la hoja y la reseña

- **Partidas duplicadas:** al elegir la gravedad, el juego esperaba al servidor sin avisar y cada clic extra creaba otra expedición. Ahora aparece «Abriendo las criptas…» y se ignoran los clics repetidos.
- **Partidas que no quedaban en la hoja:** si el servidor tardaba al iniciar, la partida se jugaba con un id local (`L-…`) y sus avances se perdían. Ahora `updateRun` **crea la fila** si no existe. ⚠️ Requiere pegar el `Code.gs` nuevo y crear una **nueva versión** de la implementación.
- **Penitente:** si tu Bloqueo alcanza para el golpe, se usa el Bloqueo y **no** pierdes rapidez esquivando. La primera vez que lo juegas aparece una explicación corta de cómo acelerar y esquivar.

## v0.19.0 · Locura, el Autor Eterno y epílogos ilustrados

- **Mapa más claro:** el camino recorrido se dibuja con una línea dorada continua; los caminos que todavía puedes tomar se ven más brillantes que los cerrados. Al pasar el cursor sobre cualquier nodo alcanzable (aunque esté 2 o 3 pisos adelante) se ilumina en azul la ruta para llegar.
- **Entropía mental → Locura** en todos los textos (barra superior, fogata, Necronomicón, dilemas, AM, glosario). El glosario explica que la Locura es «la entropía de tu mente: siempre tiende a subir». La carta **Entropía** (2ª ley de la termodinámica) conserva su nombre.
- **Hibbelerius, el Autor Eterno** (antes «la Parca del Tomo»): mismo diseño, nuevo título en el combate, el mapa y el soundtrack.
- **Epílogos ilustrados** (`src/art/epilogos.ts`): si vences a Hibbelerius con un alma aliada, la pantalla final muestra una escena animada distinta por alma: el examen de Ícaro con un 10, la calculadora de Sir Radián marcando 1, la tesis APROBADA del Doctorando, el pizarrón con g = 9.81 m/s² de la Dama, la máquina de Bernoulli girando, el reloj de Sir Mañana, la vela de la Ayudante y el foco del Encadenado.
- **Arreglos visuales:** «Servicios» ya no queda tapado en el Mercader; en los Encuentros el recuadro de información se cierra al elegir la respuesta; el puntaje se separó de los Ergios en la barra superior.

## v0.20.0 · Acto IV secreto: el Núcleo del Cálculo

- **Cómo se abre:** al vencer a Hibbelerius por **segunda vez** (contador `hib` en el Grimorio; quien ya lo había vencido antes de esta versión cuenta con 1), su tomo se abre y aparece una grieta. Puedes **entrar al Núcleo** (reliquia de jefe + legendaria + 75 % de curación) o **terminar la expedición** ahí. La partida ya queda como «victoria» en la hoja desde que vences a Hibbelerius; si caes en el Núcleo, se registra como «Cayó en el Núcleo: …». Tras la primera victoria, la cita final deja una pista: «Detrás del tomo, algo hace tic-tac…».
- **Mapa corto y difícil:** 8 pisos + AM, con fondo de engranes que giran y fórmulas de cálculo. Música nueva en vivo: «El Núcleo del Cálculo», «Relojería» y «No tengo boca» (aparecen en el Soundtrack cuando se abre el Núcleo).
- **Autómatas** (`src/data/enemies.ts`, arte en `tools/arte/en4.py` → `src/art/act4.ts`):
  - Engrane Dentado, Reloj Andante (roba 1 J), Bobina de Chispas (Calor y escudo).
  - **Autómata Oscilante:** su golpe sigue A·sen(ωt): sube y baja.
  - **Autómata Derivador:** su golpe crece 3 cada turno (dF/dt = 3).
  - **Autómata Integrador:** golpea con 1 extra por cada 4 de daño que ha recibido (∫ daño dt).
  - Élites: **Máquina Diferencial** de Babbage (crecimiento cuadrático; detenerla lo reinicia), **Telar de Jacquard** (mete Ruido y arma engranes) y **El Turco Mecánico** (Jaque → Jaque mate).
- **AM, jefe final** (456 de vida; +40 si alguna vez hiciste un pacto con él), tres fases: **Odio** (Ruido y robo de energía), **Derivada** (su furia crece cada turno; DETENERLO la reinicia; invoca Derivadores) e **Integral** (te regresa el daño acumulado que le hiciste). Dispara un rayo rojo desde su ojo. Final propio: «¡AM ha caído!» (+20,000 puntos).
- **Preguntas de cálculo** (sólo en el Núcleo, `CALCULO_CONCEPTS` en `src/data/runes.ts`): v = dx/dt, a = dv/dt = d²x/dt², altura máxima (dy/dt = 0), P = dW/dt, Δx = ∫v dt, Δv = ∫a dt, W = ∫F dx (resorte y fuerza lineal), I = ∫F dt → Δv, y 8 de opción múltiple sobre pendientes y áreas de gráficas. Con sus mini lecciones para el repaso final.
- **Modo profesor:** botón «Acto IV (Núcleo)», salto «Grieta III→IV», «Jefe» en el Acto IV = AM, y «Desbloquear todo» abre el Núcleo.
- **Arreglo:** si la partida se cerraba en el nodo del jefe, al continuar el mapa quedaba sin salida. Ahora retoma la pelea, o pasa al siguiente acto si el jefe ya había caído.

## v0.20.1 · Música sci-fi del Núcleo y epílogo del alma

- **Música del Acto IV, nueva:** más lenta y tétrica, estilo sci-fi. Cuatro voces nuevas en el sintetizador (`src/audio.ts`): pad analógico con filtro resonante que abre y cierra (`sweep`), sub grave que «respira» (`throb`), pings de sonar con eco (`sonar`) y chasquidos digitales (`glitch`). Mapa a 54 bpm, combate a 76 bpm con pulso claro (bombo, caja y bajo) y AM a 66 bpm, pesado, con campana y una melodía de notas largas.
- **Epílogo del alma a pantalla completa:** al ganar con un alma aliada aparece primero su escena animada en grande y luego las estadísticas. Antes, si el alumno tenía temas para repasar, el panel de repaso ocupaba ese lugar y sólo se veía el texto.
- **Modo profesor:** el botón «Fin + alma» abre el final con un alma aliada; cada clic pasa a la siguiente (Ícaro → Ayudante → … → Duda). Los saltos ahora van en 7 columnas.

## v0.20.2

- La portada, el inicio de sesión y los créditos muestran sólo el número de versión (p. ej. «v0.20.2»). La descripción de cambios sigue en `VERSION` de `src/config.ts` y en este README.

## v0.21.0 · Premios por vencer a AM y panel de avance

- **Al vencer a AM** (bandera `acto4` del Grimorio; la pantalla final avisa la primera vez):
  - **Cartas de cálculo** (neutrales, raras; desde entonces salen en recompensas, tienda y dilemas de cualquier clase):
    - **Derivada** (1 J): roba 1 carta y tu siguiente ataque gana +2 por cada ataque que ya jugaste este turno (mín. +4; mejorada +3/+6).
    - **Integral** (2 J, mejorada 1 J): inflige todo el daño que ya hiciste este turno (∫ daño dt, máx. 40).
    - **Límite** (1 J, se agota): si al enemigo le queda 25 % de vida o menos (mejorada 30 %; jefes 10 %), lo derrota; si no, 6 de daño (9) y Fatiga 1.
  - **Cosméticos de latón:** capa «Circuitos de AM», armadura «Latón del Núcleo» y ojos «Ojo de AM» (con 🔒 «Vence a AM» mientras no lo vences).
  - **Insignia «Vencedor de AM»:** un ojo rojo que late junto al nombre en el menú y en el Ranking. Viaja dentro del avatar, así que **no requiere cambiar `Code.gs`**. En el Ranking, quien llegó al Núcleo ve «39 +IV» en la columna de pisos.
- **Panel «Tu avance» en el menú:** barras de Grimorio (%), jefes vencidos (3, o 4 cuando el Núcleo ya se abrió), almas encontradas (8), figuras y cartas descubiertas.

## v0.22.0 · Sir Autocompleto, Asimov y Turing, cosméticos holográficos

- **Nueva alma en pena: Sir Autocompleto, de la Llama Delirante.** Un guerrero que dejó que una llama amarilla en su yelmo pensara por él (la llama le dijo que K = m·v² y le creyó). Su pregunta: «si la llama ya sabe todas las respuestas, ¿para qué aprender yo?»; la respuesta compasiva es usarla si quieres, pero entender tú el problema para saber cuándo se equivoca. Como aliado, al final de tu turno su llama golpea a TODOS (7), pero 1 de cada 4 veces «alucina»: no le pega a nadie y te sube 3 de Locura. Epílogo: apaga la llama y escribe la solución a mano («Lo verifiqué yo»). En el modo profesor: «Fin + Autocomp.».
- **Ecos del Núcleo** (sólo aparecen en el Acto IV, y ahí salen más seguido; sus preguntas son de cálculo):
  - **Isaac Asimov**, el Padre de los Robots: *Primera Ley* (Bloqueo al iniciar cada combate), *Tercera Ley* (Bloqueo la primera vez que bajas de la mitad de vida) y *Psicohistoria* (robas más cartas en el primer turno).
  - **Alan Turing**, el Descifrador: *Máquina de Turing* (si juegas 4 cartas en un turno, +1 J en el siguiente), *Descifrar Enigma* (los enemigos empiezan con Fatiga) y *Test de Turing* (+3/+6 de daño contra autómatas y AM).
- **Cosméticos de AM, ahora holográficos y animados:** capa «Holograma de AM», armadura «Cromo Holográfico» y ojos «Ojo Holográfico». El color recorre el arcoíris por pixel y con el tiempo (`makeTextureHolo` en `src/art/sprites.ts`). Quien ya tenía las versiones anteriores las conserva, ahora animadas.
- **Curva de niveles el doble de larga** (`NIVELES` en `src/data/progreso.ts`: 2000 de Conocimiento para el nivel 10, ≈ 9 victorias). Nadie pierde lo que ya desbloqueó: el nivel que tenía con la curva anterior queda como piso (`Codex.nivelPiso`) y desde ahí sigue con la curva nueva.
- **Menú:** la etiqueta «Vencedor de AM» aparece arriba del panel y ya no tapa «Conocimiento: nivel…».

## v0.23.0 · Guerrera, Vestidor y logros

- **Figura femenina** (editor del héroe → «Figura»): Masculina, o Femenina con cabello negro, castaño, rubio, rojizo o plateado. La caballera lleva yelmo de visera abierta (se le ve el rostro), trenza sobre el hombro y faldar largo; la arcanista, cabello largo (y sin barba); la penitente, cabello que asoma bajo el tocado.
- **Vestidor** (nuevo botón en el menú): todas las capas, armaduras y ojos con una vista previa de TU héroe. Clic para equipar; los bloqueados dicen cómo conseguirlos.
- **Logros** (`src/data/logros.ts`) que desbloquean cosméticos nuevos:
  - Capas: *Piedra del Coloso* (vence al Coloso), *Bruma de la Bruja* (vence a la Bruja), *Tinta de Hibbeler* (15 runas bien en una expedición), *Velo de las Almas* ✦ (vence a Hibbelerius con un alma aliada), *Llama de Júpiter* ✦ (vence a la Bruja en Júpiter).
  - Armaduras: *Pergamino Dorado* (vence a Hibbelerius), *Diamante* (vence a un jefe sin perder vida), *Cromo Dorado* ✦ (descubre el 75 % del Grimorio).
  - Ojos: *Lucidez* ✦ (gana sin llegar a 40 de Locura), *Ánima Dorada* ✦ (encuentra a todas las almas), *Aurora de Neptuno* ✦ (vence a la Bruja en Neptuno).
  - Los de AM (Holograma, Cromo Holográfico, Ojo Holográfico) pasan a ser el logro «Sin boca».
  - ✦ = holográfico: el tono se mueve dentro de su propia gama (fuego, aurora, oro…), no sólo en arcoíris.
- **Simulador de expediciones** (`tools/simular_expediciones.mjs`): un bot juega expediciones completas de un Caballero sin desbloqueos con los combates reales (los nodos sin combate se resuelven con reglas simples y 75 % de aciertos). Requiere el servidor de desarrollo en el puerto 5175 y Playwright; uso: `node tools/simular_expediciones.mjs base 10 2` (o `menos` para probar el mazo inicial sin una Fuerza Normal).

## v0.23.1 · Formulario, evidencia y perillas de dificultad

- **`apps-script/Formulario.gs`** (pégalo como archivo NUEVO en el mismo proyecto de Apps Script; también pega el `Code.gs` actualizado para que aparezcan las opciones en el menú «Criptas»; no requiere nueva implementación):
  - **Crear formulario de retroalimentación:** genera un Google Form (experiencia, dificultad, qué te ayudó a aprender por tema, confianza antes/después, ideas de personaje, enemigo, carta, alma o eco, errores, recomendación 0–10 y consentimiento para uso anónimo). Las respuestas llegan a una pestaña de la misma hoja. Pega el enlace en `FORM_URL` (`src/config.ts`) para que aparezca el botón «✎ Tu opinión».
  - **Generar evidencia:** pestaña «Evidencia» con alumnos activos, horas jugadas, problemas respondidos, % de aciertos, **curva de aprendizaje** (aciertos en las primeras 5 vs. últimas 5 respuestas de cada alumno), aciertos por tema (1ª vs. 2ª mitad) con gráfica, y tabla por alumno.
- **Perillas de vida** en `src/data/enemies.ts`: `VIDA_POR_ACTO`, `VIDA_JEFES` y `VIDA_ELITES` (todas en 1 = sin cambio), además de `VIDA_ENEMIGOS` (1.2).

## v0.24.0 · Relaciones entre ecos (inspirado en Hades)

Todo está en `src/data/relaciones.ts` (datos e historia real) y `src/scenes/Sanctuary.ts` (reglas).

- **Rivalidades** (Newton ⚔ Hooke, Newton ⚔ Huygens, Hooke ⚔ Huygens, Tesla ⚔ Einstein): si en la expedición aceptaste un don del rival, el eco llega **💢 molesto** y te lo reclama. Puedes **reconciliarte** respondiendo su pregunta (si aciertas: dones épicos y se le pasa; si fallas: se va sin darte nada) o **aceptar sin responder** (sólo 2 dones comunes).
- **Dones dúo** (✦): si tienes un don de un eco y encuentras a su pareja, aparece un cuarto don más fuerte, con diálogo entre los dos:
  - Galileo + Newton · *Hombros de Gigantes*: +1 kg y +1 m/s² (épico +2 kg).
  - Châtelet + Coriolis · *Teorema Trabajo-Energía*: cada enemigo derrotado devuelve 1 J (2).
  - Einstein + Curie · *Congreso Solvay*: la radiación que recibes también daña a los enemigos ×2 (×3).
  - Noether + Einstein · *Simetría del Espacio-tiempo*: tu primer ataque de cada turno hace el doble (+1 carta).
  - Huygens + Galileo · *Simpatía de Péndulos*: cada 3 turnos (2) +1 J y 1 carta.
  - Joule + Tesla · *Efecto Joule*: tus rayos aplican 2 de Calor (4).
  - Asimov + Turing · *El Robot Pensante*: un autómata ataca al final de tu turno (6, o 9 y 3 de Bloqueo).
  - Oppenheimer + Einstein · *La Carta a Roosevelt*: 20 (30) de daño a todos al iniciar cada combate, con 4 de radiación.
- **Afinidad:** cada eco recuerda cuántas veces lo elegiste (en el Grimorio, entre expediciones). Se ve como ❤ ×N y, desde 3, te saluda distinto.
- **Grimorio → Relaciones:** rivalidades con su historia real y lista de dúos; se descubren al conocer a ambos ecos.
- **Modo profesor:** saltos «Eco molesto» (Newton con un don de Hooke) y «Eco dúo» (Newton con un don de Galileo).

## v0.25.0 · Momentum y la Tienda de Layla

- **Momentum (◈, p = m·v):** nueva moneda que se conserva entre expediciones (en el Grimorio, se sincroniza con la hoja como `mGanado`/`mGastado`). Se gana al vencer jefes en una expedición —Coloso 2, Bruja +3, Hibbelerius +5, AM +5 (máximo 15)— y **Layla regala 1 cada día** que entras al juego.
- **Tienda de Layla** (botón «Layla ◈N» en el menú): una gata atigrada que vende **accesorios para cualquier clase** (cabeza o mano; los de mano reemplazan al arma). Todo lo comprado es permanente y se equipa en la tienda o en Vestidor → Accesorios.
  - **Rotación semanal:** 4 artículos que cambian cada lunes, iguales para todos (orejas de gato, sombrero de copa, laurel, birrete, látigo, vaso de matcha, tridente, guadaña, espada de madera, calculadora).
  - **Temporada (tiempo limitado):** Día de Muertos del 1 oct al 5 nov (corona de cempasúchil, sombrero de Catrina, pan de muerto, calabaza), Navidad del 1 dic al 6 ene (gorro navideño, bastón de caramelo) y 14 de febrero (rosa).
  - Para agregar artículos: `src/data/tienda.ts` (cada uno es una matriz de pixeles pequeña con su precio, ranura y temporada). Layla: `tools/arte/layla.py`.
- «Créditos» pasó a un botón pequeño arriba a la izquierda del menú. Modo profesor: «Desbloquear todo» da 50 ◈.

## v0.26.0 · Layla atigrada, accesorios en «Forjar héroe» y más artículos

- **Layla** ahora es una atigrada gris-café (como la foto de referencia): rayas oscuras, hocico y pecho blancos, ojos gris verdoso. Tiene 19 frases (clic en ella para que hable) y se presenta como «Layla la comerciante».
- **Los accesorios se equipan en «Forjar héroe» → ✦ Accesorios** (botón junto a la vista previa): un selector por ranura con lo que ya compraste. En la tienda sólo se compra; lo tuyo aparece como «✓ Es tuyo».
- **Ranuras nuevas:** Cabeza, Cara, Mano (reemplaza al arma) y Pies.
- **Filtro en la tienda:** «Sólo lo nuevo» oculta lo que ya tienes. La rotación semanal ahora muestra 5 artículos.
- **25 artículos nuevos:** cascos (vikingo, espartano, astronauta, minero, kabuto, corona real), cara (lentes de sol, lentes de pasta, monóculo, parche, bigote), pies (botas vaqueras, tenis rojos, pantuflas de gato, botas lunares), armas con guiños a otros juegos y películas (sable láser azul y rojo, espada del mercenario, martillo del trueno, pico de minero, arco élfico, llave inglesa, varita estelar) y de temporada (máscara de calavera en Día de Muertos, botas de duende en Navidad).

## v0.27.0 · Myriam, la Hechicera Oscura

- Nuevo encuentro: **Myriam**. En cada nodo de encuentro (desde el piso 3) hay **15 %** de probabilidad de toparte con ella, una sola vez por expedición.
- No regala nada: muestra **3 maldiciones** al azar (sólo las que pueden aplicarse) y debes aceptar una. Lo único que decides es cuál duele menos.
- Maldiciones: Entropía Creciente (−3 cartas al azar), Masa Perdida (−8 Vida máx.), Impuesto de Fricción (−½ Ergios), Ruido Térmico (+2 Ruido Blanco), Fatiga del Material (2 cartas pierden su mejora), Mirada del Abismo (+20 Locura), Pies de Lodo, Arma Hueca, Frascos Rotos (pierdes pociones), Hurto Arcano (roba una reliquia común).
- Se registra en el Grimorio (NPCs) y en Sheets (`myriam`, con la maldición elegida).
- Ajustes en `src/data/myriam.ts` (`MYRIAM_CHANCE`, lista `MALDICIONES`). Modo profesor: salto «Myriam».

## v0.27.1 · Ajustes de texto

- Encuentros: al responder, el mensaje del NPC y la recompensa/castigo se apilan y se encogen solos para no quedar debajo del botón «Continuar». La solución de la izquierda también se ajusta.
- Grimorio: los nombres largos (p. ej. «Hibbelerius, el Autor Eterno») se reducen para caber en un renglón y la ficha (masa, peso, vida) se acomoda debajo, sin encimarse. Igual en las cartas.
