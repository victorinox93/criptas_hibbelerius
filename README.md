# Las Criptas de Hibbelerius

Roguelike de cartas en estilo dark fantasy para el curso de **Dinámica**. Los alumnos crean a su héroe, bajan por las criptas y pelean con mecánicas que *son* física: cada golpe calcula **F = m·a**, la energía se paga en **Joules**, los enemigos con **inercia** sólo se detienen con una fuerza neta suficiente, y los altares rúnicos plantean problemas tipo Hibbeler con parámetros aleatorios.

> Versión 0.3 · Acto I (Leyes de Newton y energía). Clase jugable: Caballero de la Masa.
>
> **¿Quieres agregar enemigos, preguntas, figuras históricas o música?** Lee la [Guía para ampliar el juego](docs/GUIA-AMPLIAR.md).

## Qué incluye

| Parte | Detalle |
|---|---|
| Cuentas | Matrícula, contraseña creada por el alumno y clave de grupo que da el profesor |
| Avatar | Nombre, yelmo (3), armadura (4), brillo del visor (4) y capa (6). Las clases Arcanista, Explorador y Guardián aparecen bloqueadas para los actos siguientes |
| Mapa | 9 pisos generados al azar: combates, élites, encuentros, ecos del pasado, altares rúnicos, mercader, fogatas y el jefe |
| Ecos del Pasado | Estilo Hades: Newton, Galileo, Émilie du Châtelet y Joule ofrecen dones para toda la expedición; si respondes bien su pregunta, los dones son épicos |
| Encuentros | 5 personajes que hacen una pregunta de física: si aciertas, bendición; si fallas, maldición pasajera (dura 1–2 combates) |
| Mercader | Cartas, reliquia, olvidar una carta y curación, pagando con Ergios. Se puede regatear resolviendo un problema (−30 %) |
| Música | Dark synth generada en vivo (sin archivos): 7 pistas (menú, mapa, dos de combate, jefe, calma y santuario) y efectos de sonido |
| Pantalla | Se dibuja al doble de resolución; botón de pantalla completa y control de volumen arriba a la derecha |
| Combate | 12 cartas, 7 enemigos (incluye la Gárgola de Piedra y el Péndulo Errante, que convierte U en K), Pergamino de cálculos que muestra la física de cada acción |
| Runas | 17 tipos de problema: leyes de Newton, peso, fricción, plano inclinado, polea, montacargas, trabajo, energía cinética y potencial, conservación y teorema trabajo-energía, con solución paso a paso |
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

## Hoja de ruta

- **Acto II · El Pantano de la Fricción:** trabajo y energía (cap. 14). Arcanista Cinético (½mv²) y Explorador de Alturas (mgh).
- **Acto III · La Torre del Tomo:** impulso y cantidad de movimiento (cap. 15). Jefe final: Hibbelerius, el Archimago del Tomo.
- Más enemigos, encuentros y opciones de personalización (armas, emblemas, retratos).
