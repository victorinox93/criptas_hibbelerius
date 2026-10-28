# Historial de versiones

Lo más reciente primero. El resumen del juego está en el [README](README.md).

## v0.75.0 · Abismo en pruebas

- **El portal del Abismo vuelve a cerrarse** para los alumnos mientras el profe sigue probando: sólo se entra con el Modo profesor. Quien ya venció a AM ve «🔒 Próximamente».
- **Enemigos del Abismo −20 % de vida y −20 % de daño** (ajuste de pruebas: `AJUSTE_ABISMO` en src/data/abismo_modo.ts). El modo normal no cambia.

## v0.74.0 · El Abismo se abre

- **El portal del Abismo ya está abierto** en el menú para quien venció a AM (y para el profe). Antes decía «Próximamente». Las partidas del Abismo ahora cuentan: se registran en la hoja, dan logros y entran a su propio ranking. Si tenías una expedición en curso, se abandona al bajar.
- Quien no ha vencido a AM ve en el portal «🔒 Vence a AM» y cómo abrirlo.
- **Hojas del diario más raras:** a lo mucho **1 por expedición** (antes 3) y salen con la mitad de probabilidad, así que no siempre aparece una. Con esa hoja ya conoces el punto débil del Primigenio (antes hacían falta 2). La Bendición (3 hojas) y el Legado (5 hojas) ahora toman varias expediciones.

## v0.73.0 · El Legado (beta)

- **Se desbloquean con las hojas del diario de Montemayor** (se guardan para siempre). La pantalla del Necronomicón muestra cuántas llevas y qué ya abriste.
- **La Bendición de Montemayor** (desde 3 hojas): al empezar el Abismo eliges 1 de hasta 4 bendiciones (2 chicas y 2 grandes). Cada hoja nueva abre más:
  - Chicas: +60 Ergios y +8 de Vida máxima (3 hojas), −15 de Locura (4), 2 Apuntes de Montemayor (5), mejorar 2 cartas al azar (6).
  - Grandes, con costo: quitar 2 cartas (−6 de Vida máxima, 7 hojas), una carta rara del Abismo mejorada (una maldición, 8), un diente legendario (+20 de Locura, 10), una reliquia al azar (−10 de Vida máxima, 12).
- **El Legado** (desde 5 hojas): al terminar una expedición del Abismo se guardan tu mazo y tu dentadura. En la siguiente puedes llevarte UNA carta (las más raras primero) o UN diente, por +10 de Locura.
- **6 páginas nuevas del Necronomicón:** El Vacío Perfecto (inmune a Calor y Fricción; fogatas curan la mitad), El Eclipse (+1 J en turnos pares; −1 carta en impares), Tinta de Sangre (+6 de vida al ganar; −15 de Vida máxima), El Ábaco de Hueso (cada 4 cartas en un turno +1 J; un Error de Signo por combate), La Marea de Innsmouth (10 de Bloqueo al empezar; +1 de daño por golpe enemigo) y El Tiempo Dilatado (+2 cartas y +1 J en el primer turno; jefes con +20 % de vida).
- **6 pactos nuevos:** Gravitatorio (+1 de daño por enemigo vivo), del Calor (cada Ataque pone 1 de Calor), Resonante (tu primera carta del turno da Resonancia a todos), del Giróscopo (no te aturden ni te marean; +4 de Bloqueo), Minimalista (mazo de 7; −1 carta y +1 J por turno) y de la Deuda (+150 Ergios; cada victoria cobra 10).

## v0.72.0 · Recetas (beta)

- **14 recetas nuevas en el Taller de Newton** (ahora son 23 de cartas):
  - Tajo Angulado + ΣF = 0 → **Suma de Vectores** (daño a todos y Bloqueo).
  - Peso Muerto + Muro de Masa → **Caída Libre** (m·g·h → ½·m·v²; ignora el Bloqueo).
  - Fricción Ardiente + Amortiguador → **Frenos de Disco** (Bloqueo y Calor a todos).
  - Batería de Resorte + Energía Almacenada → **Muelle Cargado** (+1 J y Bloqueo cada turno).
  - Impulso Sostenido + Perdigones → **Ráfaga de Impulsos** (5 golpes al azar).
  - Retroceso + Conservación de p → **Ley de Conservación** (daño y el mismo Bloqueo).
  - Acelerar + Ráfaga Cinética → **Haz Relativista** (Arcanista).
  - Barrera Inercial + Escudo de Energía → **Campo de Fuerza** (Arcanista; el Bloqueo se conserva).
  - Tobera Variable + Reabastecer → **Ecuación de Tsiolkovski** (Penitente).
  - Retrocohete + Estela de Plasma → **Escudo Térmico** (Penitente).
  - Frecuencia Natural + Fatiga del Material → **Puente de Tacoma** (Resonancia y Fatiga a todos).
  - Límite + Integral → **Serie Geométrica** (4 golpes que se duplican).
  - Palanca de Arquímedes + Torque Abisal → **Brazo de Palanca** (Abismo).
  - Golpe al Centroide + Momento de Inercia → **I = I_cm + m·d²** (Abismo).
- El Recetario ahora se ve por páginas (8 recetas por página).
- **Abismo:** otra vez eliges **2 cartas por sobre** y **2 dientes de 4** al empezar (el Pacto de la Sonrisa da 3).
- **Guía del Abismo actualizada:** daño al fallar preguntas, dientes y sobres del inicio, y dos páginas nuevas: «Pactos del mythos» (el Hombre Negro, los altares, el Demonio de Maxwell y las reliquias malditas) y «Maldiciones».
- El Peregrino de Yuggoth ya no «zumba»: aletea.

## v0.71.0 · Pactos y Maldiciones (beta)

- **Maldiciones** (como en Slay the Spire): un tipo de carta nuevo, injugable, que se queda en tu mazo hasta que alguien te la quita.
  - Arrepentimiento (pierdes vida por cada carta en tu mano), Dolor Fantasma (cada carta que juegas te quita 1), Decaimiento Radiactivo (−2 de vida si sigue en tu mano), Duda (−1 J el siguiente turno), Normalidad (máximo 3 cartas por turno), Torpeza (estorba y se agota) y Parásito de Yuggoth (quitarlo cuesta 3 de Vida máxima).
  - El Mercader no las compra; sí las puede «olvidar».
- **Reliquias malditas** (sólo en pactos del mythos): Llave de R'lyeh (+1 J cada turno; trae 2 maldiciones), Ojo de Yuggoth (+1 carta cada turno; 25 % de maldición al ganar) e Ídolo de Dagón (+2 kg o +2 m/s; empiezas con 2 Susurros).
- **El Demonio de Maxwell** (encuentro «?», en los dos modos): quita maldiciones (la primera gratis, luego 20 Ergios). Si no traes, ordena tus ideas (−10 Locura en el Abismo, +10 de vida en el modo normal). Después de conocerlo te espera en las fogatas: quita una maldición por 25 Ergios sin gastar la fogata. Es más probable que aparezca si cargas maldiciones.
- **Altares del mythos** (Abismo): Shub-Niggurath, Padre Dagón y Yig piden un sacrificio.
  - 2 cartas que tú eliges → una reliquia.
  - 2 cartas al azar → una reliquia y un diente raro.
  - Tu sangre (−8 Vida máxima) → una reliquia maldita.
  - Negarte → 50 % de recibir una maldición.
- **El Hombre Negro** (Nyarlathotep): personaje recurrente del Abismo, como AM en el modo normal. Aparece a lo más una vez por tramo y recuerda tus visitas y si lo rechazaste. Ofrece pensar por ti (resuelve 3 preguntas, +6 Locura y sin puntos cada vez), un regalo (reliquia maldita), curarte (con una maldición) o, si lo rechazas, −8 Locura.
- **En el Abismo, fallar una pregunta también duele:** además de la Cordura, pierdes 5 de vida (nunca te deja en menos de 1).
- **Resumen del descenso:** al terminar una expedición del Abismo ves tu mazo (con copias y maldiciones), reliquias, dientes, hasta dónde llegaste y tus números, con un botón para **guardar una captura** (PNG).
- El Memorama de Fórmulas ahora da una maldición al azar en su par «malo».

## v0.70.0 · Regios y Ecos (beta)

- **Probador del profe** (sólo administradores): botón «🔒 Probador» en el Vestidor y en la Tienda de Layla. Encendido, TODOS los cosméticos se ven desbloqueados para probarlos. No se guarda nada: al apagarlo o recargar, todo vuelve a como estaba.
- **Tres Ecos Quebrados nuevos** en el Abismo:
  - **Ettore Majorana**, el físico que desapareció: Desaparecer (los primeros golpes no te encuentran), Su Propia Antipartícula (cada Ataque te da Bloqueo) y Retiro en Silencio (+Cordura al empezar cada combate).
  - **Kurt Gödel**, el lógico incompleto: Incompletitud (al bajar de media vida robas cartas y ganas J), Lo Indecidible (enemigos con menos vida) y Rigor Formal (las preguntas falladas quitan menos Cordura).
  - **Évariste Galois**, el joven de la última noche: Teoría de Grupos (3 cartas del mismo tipo → +1 J), La Última Noche (más daño con poca vida) y Simetría de las Raíces (+Cordura si ganas sin perder vida).
- **Enemigos con mecánicas nuevas:**
  - **Escudero de Huesos** (Actos I y II): no ataca, cura y da Bloqueo a su guerrero.
  - **Babosas Trillizas** (Acto I): si al final de tu turno queda alguna viva, las que mataste reviven con la mitad de su vida.
  - **Ratero de Ergios** (Actos I y II): cada golpe te roba 15 Ergios y al cuarto turno huye. Si lo vences antes, recuperas todo.
- **Enemigos regios (élites):**
  - **Horno Alto de Fundidora** (Acto II): aviva el fuego y suelta una colada de arrabio que hace más daño y más Calor con cada carga.
  - **Espíritu del Cerro de la Silla** (Acto III): masa enorme (umbral 26 N). Sentado en su silla se protege; a la mitad de su vida se levanta y pega con todo.
- **Cosméticos nuevos** en la Tienda de Layla:
  - **Armadura Ígnea** y **Capa en Llamas**: la tela arde, las llamas suben y el héroe queda envuelto en fuego, con chispas.
  - **Armaduras medievales que cambian la forma**, no sólo el color: Cota de Malla, Placas Góticas, Templario (sobreveste blanca con cruz roja) y Caballero Negro (ribete rojo).
  - **Yelmo de Cubeta** y **Celada** (accesorios de cabeza).

## v0.69.0 · Segunda Vida (beta)

- **Nueva carta legendaria: Forma de Neutrino** (Poder, 3 J; como Wraith Form de Slay the Spire).
  - Durante 2 turnos (3 mejorada), TODO golpe te hace sólo 1 de daño: los neutrinos casi no interactúan con la materia.
  - El precio: al terminar, tus cartas de Defensa dan −1 de Bloqueo, y empeora 1 más cada turno.
- **Jefes que se levantan** (como el Despierto de Slay the Spire): al llegar a 0, se levantan UNA vez con una fase nueva.
  - **Hibbelerius** (Acto III): «Edición Revisada · Cap. 16: Cuerpo Rígido», con 40 % de su vida (v = ω × r, Centro instantáneo, Rodar sin deslizar).
  - **Cthulhu** (Abismo): «Lo que está muerto puede yacer eternamente», con 40 %.
  - **Nyarlathotep** (Abismo): «La Máscara Siguiente» (el Faraón Negro), con 35 %.
- **13 reliquias nuevas** (inspiradas en Slay the Spire, con su física): Lámpara de Carburo (+1 J el primer turno), Mochila de Apuntes (+2 cartas el primer turno), Ariete (+8 al primer ataque), Contador de Revoluciones (cada 10.º ataque ×2), Abanico de Bernoulli (3 ataques → +4 de Bloqueo), Estrella de Momento (3 ataques → +1 kg o +1 m/s), Escudo de Equilibrio (terminas sin Bloqueo → +6), Péndulo de Foucault (+1 J cada 3 turnos), Reloj de Arena de Mercurio (3 a todos cada turno), Calendario de Kepler (52 a todos al final del turno 7), Barra de Tungsteno (−1 a cada daño), Amortiguador de Hule (golpes de 2 a 5 → 1) y Termo de Caldo (+12 de vida al ganar si tienes 50 % o menos).
- **Encuentros nuevos en los «?»:**
  - **El Memorama de Fórmulas** (como «Match and Keep»): 12 cartas, 6 fórmulas y sus conceptos. Las ves 4 segundos, se voltean y tienes 5 intentos. Cada par te da su premio (reliquia, carta rara, Ergios, vida, vida máxima… o una maldición).
  - **El Ídolo y la Roca** (m·g·h → ½·m·v²), **El Explorador Caído**, **La Biblioteca Hundida**, **El Muro Viviente** (olvida, cambia o hace crecer una carta) y **La Calavera Avara**.
- Modo profesor: botón «Memorama» (el final se sigue probando con «Fin + alma»).

## v0.68.0 · Impacto (beta)

- **Golpes que se sienten:**
  - **Golpe fuerte** (18+ de daño, o una buena parte de la vida del enemigo): número más grande, letrero «¡FUERTE!», una pausa de impacto cortita y temblor.
  - **Golpe brutal** (35+ de daño): número enorme en naranja, «¡BRUTAL!», pausa más larga, destello y chispas.
- **Contador de combo:** al jugar 3 o más Ataques en el mismo turno aparece «COMBO ×3», «×4»… sobre tu héroe, y cada ataque suena más agudo. Se reinicia cada turno.
- **Un sonido para cada tipo de carta:** Ataque (tajo), Defensa (escudo metálico), Habilidad (destello) y Poder (acorde grave que crece). Los golpes fuertes y brutales también tienen su propio sonido.
- **Cordón Umbilical** en la tienda del Mercader: **250 Ergios**, vida extra.
  - Si tu vida llega a 0, te levantas con la mitad de tu vida máxima.
  - Sólo puedes traer uno a la vez.

## v0.67.0 · Dithering (beta)

- **Los astros ahora tienen sombreado en dithering** (patrón de puntos tipo Bayer, como en los juegos de los 90) en vez de la sombra plana en diagonal: se ven redondos y con volumen.
- **La Locura «pixela» el fondo** del combate y del mapa:
  - Locura de 40 a 69: el fondo se redibuja con pocos tonos y un patrón de puntos (verde en el Abismo), cada vez más fuerte.
  - Locura 70+: el fondo se vuelve violeta y el patrón vibra.
  - Sólo afecta el fondo: personajes, cartas, textos y barras siguen nítidos. Necesita WebGL; en computadoras sin WebGL el juego se ve como antes.
- Arreglo: el letrero con el dato de cada astro ya no se sale de la pantalla (el texto se acomoda en dos renglones).

## v0.66.0 · Conjuntos (beta)

- **Cartas en conjunto (como Exodia en Yu-Gi-Oh!).** Cada pieza sola NO se puede jugar. Con todas las piezas de su conjunto en la mano, cualquiera se juega y desata el poder del conjunto (todas se agotan).
  - **Principia** (3 piezas: 1ª, 2ª y 3ª Ley): daño a TODOS (9 + 9 + 9), +15 de Bloqueo y los enemigos (no jefes) quedan detenidos 1 turno.
  - **La Fuerza Resultante** (2 piezas: Componente Fx y Fy): un golpe de R = √(Fx² + Fy²) que ignora el Bloqueo (12 y 16 → 20).
  - **Las Leyes de Kepler** (3 piezas, sólo en el Abismo): jefes, astros y élites pierden 25 % de su vida; los demás quedan detenidos.
  - Si ya tienes una pieza, en las recompensas a veces sale una de las que te faltan.
  - Carta nueva **Repasar los Apuntes**: busca en tu mazo una pieza que te falte.
- Los hermanos del acertijo ahora se llaman **Acción y Reacción**: iguales y opuestos, como en la 3ª ley.

## v0.65.0 · El Taller de Newton (beta)

- El Crisol ahora se llama **Taller de Newton**.
- Al elegir cartas en el Taller se ven las **cartas de verdad** (la primera, la segunda y lo que sale), no sólo sus nombres.
- **Cualquier pareja se puede combinar.** Si no forman una receta secreta, sale una **mezcla intermedia** según el tipo de las dos cartas (superposición: los efectos se suman, pero más débiles que una fusión perfecta). Hay 10 mezclas:

  | Pareja | Mezcla | Efecto |
  |---|---|---|
  | Ataque + Ataque | Golpe Doble | 2 golpes de 6 |
  | Ataque + Defensa | Golpe con Guardia | 8 de daño y +7 de Bloqueo |
  | Ataque + Habilidad | Golpe Calculado | 9 de daño y robas 1 |
  | Ataque + Poder | Golpe Concentrado | 13 de daño (se agota) |
  | Defensa + Defensa | Muralla | +14 de Bloqueo |
  | Defensa + Habilidad | Guardia Ágil | +8 de Bloqueo y robas 1 |
  | Defensa + Poder | Coraza Constante | +3 de Bloqueo cada turno |
  | Habilidad + Habilidad | Doble Truco | Robas 2 y +1 J |
  | Habilidad + Poder | Estudio Constante | Robas 1 más cada turno |
  | Poder + Poder | Motor Perpetuo (casi) | +1 J cada turno |

  - Las mezclas también llevan pregunta: si aciertas, salen mejoradas.
  - Las recetas secretas siguen dando las cartas más fuertes.

## v0.64.0 · El Crisol de Newton (beta)

- **Fusiones de cartas (como en Ball x Pit).** Nueva opción en TODAS las Fogatas: el **Crisol de Newton**.
  - Eliges 2 cartas de tu mazo. Si su física se combina, se funden en una carta nueva y las dos se van.
  - Al fundir hay una pregunta del tema: si aciertas, la carta sale mejorada (+).
  - Si dos cartas no se combinan, no pasa nada y puedes probar otra pareja.
- **9 recetas SECRETAS** (sólo se ve una pista hasta que las descubres):
  - Forja Pesada + Carrera → **Cantidad de Movimiento** (p = m·v: ignora el Bloqueo).
  - Golpe de Mazo + Embestida → **Impulso Brutal** (J = F·Δt: golpea 3 veces).
  - Fuerza Normal + Acción-Reacción → **Tercera Ley Absoluta**.
  - Palanca de Arquímedes + Masa Inamovible → **Momento de Inercia** (I = m·r²).
  - Energía Almacenada + Proyectil Arcano → **Conservación Total** (U → K).
  - Péndulo + Órbita Cerrada → **Péndulo Cósmico** (golpea cada turno, para siempre).
  - Choque Elástico + Coeficiente de Restitución → **Choque Perfecto (e = 1)**.
  - Empuje + Llamarada de Escape → **Ecuación del Cohete**.
  - Derivada + Integral → **Teorema Fundamental**.
- **Fusiones de dientes** (en el Crisol del Abismo, pestaña «Dientes»). El diente fusionado ocupa un solo hueco y cuenta como sus dos ingredientes AL DOBLE:
  - Diente del Eclipse (Marte + Lunar).
  - Diente de la Alineación (Júpiter + Mercurio).
  - Diente de Megalodón (Colmillo + Tiburón).
  - Colmillo del Conde (Vampiro + Oro).
  - Muela Acorazada (Plomo + Protector).
- **Recetario** (en el Crisol y en el Grimorio): las recetas descubiertas, con su fórmula y por qué se combinan. Se guardan para siempre.

## v0.63.0 · Roído (beta)

- El ratón que te persigue ahora se llama **Roído, el Coleccionista de Sonrisas**, y aparece **desde el tramo 2** (en el primero era muy agresivo).
- **Lluvia de Meteoritos:** si mueves al héroe con las flechas, al soltarlas ya no regresa a donde estaba el ratón. El ratón vuelve a mandar en cuanto lo mueves.

## v0.62.0 · Pérez y compañía (beta)

- **Pérez, el Ratón de los Dientes:** te persigue por el mapa en cada tramo.
  - Empieza 3 pisos detrás de ti. Avanza 1 piso por cada nodo que visitas, 2 cuando te detienes a descansar o comprar, y a veces 1 extra (velocidad relativa).
  - Si te alcanza, te arranca un diente; si no tienes, se lleva 20 Ergios. Luego vuelve a empezar 3 pisos atrás.
  - Se ve en el mapa y avisa cuando está a 1 piso.
- **El Cartógrafo Ciego:**
  - Te vende un mapa por 20 Ergios. Casi siempre 2 combates de adelante se vuelven Fogata y Mercader; a veces miente y se vuelven Élites.
  - Si aciertas una pregunta de vectores (suma de desplazamientos), el mapa es verdadero y gratis.
- **El Gemelo de Espejo:**
  - Te regala una copia mejorada de una carta, pero hasta el final del tramo usa tu último golpe contra ti una vez por combate (3ª ley).
  - Si rompes el espejo y aciertas la pregunta de la 3ª ley, te quedas con la carta sin reflejo.
- **El Peregrino de Yuggoth (un Mi-Go):**
  - Lleva tu cerebro en un cilindro: la Cordura no baja el resto del tramo, pero pierdes 15 de Vida máxima (la recuperas al terminar el tramo).
  - Su pregunta de órbitas da un diente de planeta.
- **La Sombra del Alumno Anterior:** el eco de un compañero real que dejó huella en el Abismo. Si ganas su reto, te da su mejor carta (rara, en Lámina).
- **Remiendos y Zurcido:** acertijo de lógica y física. Uno siempre miente: el que dice algo falso de física señala el camino malo. Si aciertas, ganas un tesoro (Ergios y un diente raro); si fallas, Remiendos te roba.
- El Prestamista ya no usa la palabra «chistera» (ahora: sombrero de copa).
- Página nueva en la Guía del Abismo: «Más personajes (y un ratón)».

## v0.61.0 · Lunas, préstamos y meteoritos (beta)

- **Personajes nuevos en los nodos «?» del Abismo:**
  - **El Prestamista de Ergios** (traidor): te presta 60 o 30 Ergios y al terminar el tramo cobra 1.5 veces lo prestado. Si no tienes, cobra el resto en VIDA (1 por cada 2 Ergios). Si revisas sus cuentas (pregunta de trabajo y energía) y aciertas, te paga 25 Ergios para que no lo denuncies.
  - **La Viuda de Arkham** (amable, pero cobra):
    - Cuida a tu familiar (+2 combates) a cambio de una carta de tu mazo.
    - O te da té y descanso por 15 Ergios.
    - Si le preguntas por la caída de su esposo astrónomo (pregunta de energía) y aciertas, te da un diente raro.
- **Fenómenos nuevos:**
  - **Alineación Planetaria:** las gravedades de tres planetas se suman.
    - Si te dejas jalar: +1 J en el primer turno de cada combate del tramo (−6 de Cordura).
    - Si resistes calculando la fuerza total y aciertas, ganas a Caronte.
  - **Lluvia de Meteoritos** (minijuego): esquivas rocas con el ratón o las flechas. Cada roca muestra su masa y rapidez, y si te pega te quita vida según K = ½·m·v². Los fragmentos azules dan Ergios. Al final, una pregunta: ¿cuál pega más fuerte, la pesada y lenta o la ligera y rápida?
- **Lunas familiares:**
  - **Fobos** (lo suelta Marte al vencerlo): cada 2 turnos golpea a un enemigo por 8.
  - **Europa** (la suelta Júpiter): +5 de Bloqueo al empezar cada combate y +6 de vida al ganarlo.
  - **Caronte, el Barquero** (Alineación): si tu vida llega a 0, te levanta con 12 y se va.
- Los personajes y fenómenos nuevos salen con el doble de probabilidad que un relato.
- Página nueva en la Guía del Abismo: «Personajes, lunas y fenómenos».

## v0.60.0 · El Portal del Abismo (beta)

- **Portal del Abismo en el menú** (para todos, bloqueado por ahora): un remolino verde y morado que llama la atención. Al pasar el cursor dice «Próximamente · Sólo para quienes hayan vencido a AM».
- **Arreglo:** al abrir los sobres iniciales del Abismo algunas palabras de las cartas salían borradas, como si tuvieras poca Cordura. Era la Locura de tu partida ANTERIOR; ahora no cuenta mientras armas la expedición.
- **Los Astros Errantes ahora se llaman Astros Ambulantes.**
- **Un casco o escudo por astro** (además de lo que ya daban):
  - Casco Alado de Mercurio.
  - Escudo de las Nubes de Venus.
  - Escudo de Fobos y Deimos.
  - Escudo de los Anillos.
  - Escudo del Ojo Solar.
  - En total los astros dan 12 cosméticos.

## v0.59.0 · Los Astros Errantes (beta) — renombrados «Ambulantes» en la v0.60

- **Nodo nuevo en el Abismo: Astro Errante** (1 o 2 por tramo). Los planetas despertaron y bajaron al Abismo. Son más fuertes que una élite y más débiles que un jefe, y cada uno pelea con su física:
  - **Mercurio, el Mensajero Veloz:** muchos golpes seguidos y te marea (v = 2πr/T).
  - **Venus, la Nube que Quema:** lluvia de ácido (Hemorragia) y la presión de 92 atm te quita todo el Bloqueo.
  - **Marte, el Ojo Rojo:** pelea con sus lunas Fobos (miedo) y Deimos (terror); su golpe crece si no lo detienes.
  - **Júpiter, el Gigante:** gravedad de 24.8 m/s² que te aturde; queda Imparable 2 turnos.
  - **Saturno, el que Devora a sus Hijos:** anillos de dientes; se cura devorando una luna y te roba J.
  - **El Sol, el Ojo que Arde** (desde el tramo 2): Calor, llamaradas que atraviesan tu Bloqueo y fusión que lo cura.
- **Premio:** un sobre (te quedas con 1 carta) y, la primera vez, un cosmético.
  - Sandalias de Mercurio, capa Nube de Venus, Yelmo de Marte, Escudo de la Gran Mancha, Anillos de Saturno y Corona Solar.
  - Si vences a los 6: la capa **Heliosfera** (efecto cósmico).
- Al empezar la pelea sale un dato real del planeta.
- La masa de los enemigos ahora se escribe en notación científica (5.7 × 10²⁶ kg).
- Página nueva en la Guía del Abismo: «Los Astros Errantes».

## v0.58.0 · El Astrónomo de Providence (beta)

- **El Astrónomo, de cuerpo entero:** traje gris, leyendo un libro, con tentáculos que se mecen detrás de él (de lo que está leyendo).
- **Favores del Astrónomo:** después de subir tu constelación, eliges uno.
  - **Pregunta de órbitas** (movimiento circular: a = v²/r, T = m·v²/r, v = 2πr/T). Si aciertas, la constelación sube otro nivel; si fallas, −8 de Cordura.
  - **Que te preste el telescopio:** en tus 2 siguientes combates ves las intenciones ocultas (invisibles, de noche y la Calculadora sin batería).
  - **Una hoja de Montemayor:** te señala dónde cayó; la encuentras al volver al mapa.
- **El efecto infrarrojo ahora se llama «Carcosa»** (la ciudad del Rey de Amarillo): Llama de Carcosa (capa) y Coraza de Carcosa (armadura).
- **Set nuevo en la Tienda de Layla: Cazador de Ecos.** Capucha con broche de plata, antifaz con lentes de latón, ballesta de resorte (E = ½·k·x²) y gabardina de ceniza.

## v0.57.0 · La Calculadora Primigenia (beta)

- **Jefe nuevo de tramo: La Calculadora Primigenia.** La calculadora de Montemayor, con un ojo en la pantalla y tentáculos.
  - **MODE → RAD:** cambia tu calculadora a radianes y tus Ataques hacen ×0.6 hasta que juegues una Habilidad («revisas el modo»).
  - **Math ERROR (÷ 0):** se protege con 26 de Bloqueo.
  - **MR:** te regresa parte de todo el daño que le hiciste y te mete un Error de Signo.
  - **Batería baja:** con menos de 30 % de vida ya no ves sus intenciones.
  - Premio: la **Calculadora Domada** (accesorio de mano).
- **Cartas que hablan** (como en Inscryption): les sale un globo de diálogo cuando las robas, las juegas o se quedan en tu mano.
  - **Pato de Hule Primigenio:** al robarlo te da una pista del turno («Cuac. X te va a pegar 12. ¿Y si bloqueas?»). No revela a los invisibles.
  - **Calculadora de Bolsillo:** tu siguiente Ataque ×1.5… pero 1 de cada 4 veces está en RAD (×0.75).
  - **El Hibbeler Maldito** (Poder): +6 de Bloqueo cada vez que detienes a un enemigo. Si terminas tu turno con 2 J o más sin usar, te regaña (−3 de Cordura).
  - **La Tarea Olvidada:** se queda en tu mano y pega más cada turno (6 + 5 por turno). Mientras no la entregas se queja y te quita 2 de Cordura.
  - **El Diagrama que Habla:** Bloqueo extra por cada enemigo que te va a atacar («¡me olvidaste la fricción!»).
- **Remiendos, el que Siempre Sonríe** (alma traidora del Abismo, homenaje a los traidores de los «Souls»):
  - Se ofrece a ayudarte. Si desconfías de él, se va con 15 de tus Ergios.
  - En élites y jefes, al final de tu turno:
    - 55 %: ataca (7 de daño).
    - 20 %: te roba Ergios.
    - 15 %: te golpea «sin querer».
    - 10 %: te asusta (−8 de Cordura).
  - En el mapa, 3 de cada 10 veces «conoce un atajo» y **elige el camino por ti**.
  - Al terminar el tramo desaparece riendo… con hasta 30 Ergios.

## v0.56.0 · Infrarrojo (beta)

- **ARREGLO IMPORTANTE:** al iniciar sesión se perdían las hojas del diario de Montemayor, las cartas de Providence cumplidas y los sueños soñados. El juego junta lo guardado en el navegador con lo del servidor, y esos tres datos no se incluían en la mezcla. Ahora se conservan; los logros del diario y de los sueños ya se pueden completar.
- **Mapa del Abismo:** la leyenda de abajo va en dos filas y ya no se encima. El aviso del mutador sube un poco.
- **Casco de la Entropía** (cabeza): los bloques amarillos de la escultura del campus. Se gana si tu Locura llega a 100 (Quiebre) en el Abismo.
- **Efecto nuevo «infrarrojo»:** como una cámara térmica (negro → violeta → rojo → amarillo → blanco), con el calor moviéndose por la tela. Tiene que ver con la ley de Wien: lo más caliente brilla más blanco.
  - **Llama Infrarroja** (capa): vence a 3 jefes distintos del Abismo.
  - **Cuerpo Negro** (armadura): vence a 6.

## v0.55.0 · Compañeros (beta)

- **Cosméticos de veterano más exigentes:** el Manto del Desvelado ahora pide **10 horas** jugadas (antes 5) y la Coraza de la Eternidad **15 horas** (antes 10).
- **Compañero (pestaña nueva del Vestidor):** cualquier familiar que ya te acompañó en una expedición se puede quedar contigo **de adorno**.
  - Aparece flotando a tu lado en el menú, en el mapa y en el combate (cuando no llevas un familiar de verdad).
  - También sale junto a tu héroe en la ficha del ranking.
  - Los que no has descubierto salen como «???» con la pista de dónde conseguirlos.
  - Se guarda con tu avatar en el servidor, así que se ve en cualquier computadora.

## v0.54.0 · Veteranos del Abismo (beta)

- **Dragón Shantak:** la Criatura Alada de «El Festival» ahora es el Dragón Shantak, con un dibujo nuevo (ave escamosa con cabeza de caballo y alas de murciélago). Hace lo mismo: sube (mgh) y cae en picada (½mv²).
- **Guía:** «Si mueres soñando» ahora dice «Si caes vencido en el sueño».
- **Gabinete de Montemayor:** en cada visita sólo hay **un** experimento (cambia según el piso y el tramo), no los tres.
- **Ropa del mythos** (pestaña «Abismo ◈»):
  - Túnicas: Túnica de la Orden Esotérica de Dagón, Saco de Tweed de la Miskatonic (8 hojas del diario), Sudario del Faraón Negro (cósmico; Nyarlathotep), Túnica del Soñador de Celephaïs (holográfica; tu primer sueño) y Hábito del Acólito de Yog-Sothoth.
  - Capas: Alas de R'lyeh (Cthulhu), Gabardina de los Whateley (Dunwich) y Manto del Geómetra (holográfico).
- **Efecto nuevo «veterano» por horas de juego:** oro incandescente con un destello que recorre la tela y brasas rojas, distinto a cualquier otro color del juego. **Manto del Desvelado** a las 5 horas jugadas y **Coraza de la Eternidad** a las 10.
- **Ranking:** cada héroe muestra cuántas **partidas** jugó y su **tiempo de juego** (también en su ficha). El grupo ahora va debajo del nombre.
  - **Para el profe:** hay que pegar el `apps-script/Code.gs` nuevo y publicar una nueva versión. Mientras no se publique, el tiempo sale como «—».
- **Arreglado:** en el ranking del Abismo, el tramo se calculaba con los pisos viejos (7); ahora usa los 11 actuales.

## v0.53.0 · El Gabinete de Montemayor (beta)

- **Balance del inicio:** ahora eliges **1 de 3 dientes** (antes 2 de 4; con el Pacto de la Sonrisa, 2) y te quedas con **1 carta de cada sobre** (antes 2). Empiezas más débil y cada decisión pesa más.
- **12 cartas nuevas del Abismo** (de 18 a 30):
  - Ataques: Rodar sin Deslizar, Torque Abisal, Energía de Rotación, Centro de Percusión y Ángulo de 90° de Tíndalos.
  - Rampa del Abismo, Péndulo Físico, Giroscopio de Montemayor, Tren de Engranes y Sueño Profundo.
  - Legendarias: La Llave de Plata y el Necronomicón de Dinámica.
  - Todas tienen su cálculo en la vista previa.
- **Nodo nuevo: El Gabinete de Montemayor** (uno por tramo). Tres minijuegos dibujados, de 3 rondas cada uno:
  - **La Rampa de R'lyeh:** una criatura sobre una pendiente. ¿Qué ángulo θ tiene (con h y b)? ¿Qué ejes conviene usar (x' sobre la rampa, y' perpendicular)? ¿Cuánto vale m·g·senθ o m·g·cosθ? Al contestar se dibujan los ejes y el peso.
  - **El Centroide del Ídolo:** haz clic donde está el centroide de una figura compuesta (incluye figuras con hueco). Se muestra la cuenta x̄ = ΣxA/ΣA.
  - **¿Cuál gira más fácil?:** aros, discos, esferas y varillas. ¿Cuál tiene mayor I? ¿Cuál llega primero rodando?
  - Premios: +15 Ergios por acierto y +8 de Cordura por 3 de 3. Cada respuesta se registra para tus estadísticas.

## v0.52.0 · Pulido del Abismo (beta)

- **Guía · Estados alterados:** ahora va en dos columnas. Ya se ven los 6 estados (antes no se alcanzaban a ver Perfora y El lago sube).
- **Ediciones explicadas mejor** (guía y tooltips):
  - Lámina: si es Ataque, +5 de daño en cada golpe; si es Defensa o Habilidad, +4 de Bloqueo extra.
  - Polícroma: si es Ataque, su daño se multiplica ×1.5 (12 → 18); si no, robas 1 carta.
  - Cristal: ×2 o +10 de Bloqueo.
  - Holográfica: recuperas 1 J.
- **«Combate onírico» ahora se llama «Pesadilla».**
- **Dientes mordidos a la vista:** cuando un jefe te muerde la dentadura, los dientes mordidos aparecen con una ✕ roja y la palabra MORDIDO al abrir la dentadura. También salen en el aviso de la dentadura de la barra de arriba y en un ícono junto a tu vida (pasa el mouse para ver cuáles).
- **Elegir familiar:** si ya te acompaña un familiar y llega otro, ya no se reemplaza solo. Al volver al mapa (o al comprarlo en la tienda) eliges con cuál te quedas.

## v0.51.0 · Las Tierras del Sueño (beta)

Más mythos para que cada expedición sea distinta. Todo sale de cuentos publicados hasta 1930; los textos y los dibujos son nuestros.

- **Criaturas nuevas del Abismo:**
  - Necrófago («El modelo de Pickman», 1927): roe y se cura comiendo.
  - Engendro de los Martense («El miedo que acecha», 1923): nunca viene solo.
  - Criatura alada de «El Festival» (1925): sube (mgh) y cae en picada (½mv²).
  - Reptil de «La ciudad sin nombre» (1921): te llena de arena (Fricción).
  - **Élites:** Wilbur Whateley («El horror de Dunwich») lee el Necronomicón. El **Sabueso de Tíndalos** (F. B. Long, 1929) sale de los ángulos y sus golpes **PERFORAN** tu Bloqueo.
- **Jefes nuevos:**
  - **Yig, Padre de las Serpientes** (jefe de tramo · fuerza centrípeta): cada Defensa que juegas, una serpiente te muerde (−2 de vida).
  - **El Dios de las Cinco Cabezas** («Bajo las pirámides», 1924 · equilibrio ΣF = 0): gana 6 de Bloqueo en cada uno de tus turnos.
  - **Shub-Niggurath**, Primigenio (masa variable): cada 3 turnos nace un Retoño, y cada Retoño vivo la cura 6.
- **Las Tierras del Sueño (nodo 🌙, uno por tramo):**
  - Te quedas dormido y eliges una de 3 puertas.
  - Hay 7 sueños: Celephaïs, El barco blanco, Sarnath, Hypnos, Más allá del muro del sueño, La llave de plata y Polaris.
  - Algunos terminan en un **combate onírico**: la vida que pierdes en el sueño **no es real** (la recuperas al despertar), pero la Cordura sí. Si «mueres» soñando, sólo despiertas sudando (−15 de Cordura, sin gastar la Vida Extra).
  - El jefe del sueño es **Bokrug, el Gran Lagarto de Agua** (flotación): cada 3 turnos el lago sube y te quita todo el Bloqueo. Si lo vences, ganas un diente legendario.
- **Cosméticos nuevos** (pestaña «Abismo ◈» del Vestidor):
  - Cuernos de la Cabra Negra y capa Bosque de los Mil Retoños (Shub-Niggurath).
  - Corona de Serpientes y armadura Escamas de Yig (Yig).
  - Máscara de la Esfinge y armadura Piedra de las Cinco Cabezas (las Cinco Cabezas).
  - Ídolo de Bokrug (Bokrug).
  - Por soñar: Gorro del Soñador (1 sueño), La Llave de Plata y Ojos del Soñador (3 sueños), y la Vela del Barco Blanco (los 7 sueños).
- **Logros nuevos:** vencer a cada jefe nuevo, Bokrug, Soñador, Peregrino del sueño y Señor de las Tierras del Sueño. «Los Mitos completos» ahora pide los 5 Primigenios.
- **Guía del Abismo:** página nueva «Las Tierras del Sueño» y los estados Perfora y El lago sube.

## v0.50.0 · Cálculo de cartas en vivo

- **Vista previa al pasar el mouse por una carta:** abajo del texto de la carta aparece «⚔ Si la juegas ahora», con el cálculo real en ese momento. Funciona en todos los modos; en el Abismo es donde más ayuda.
  - **Ataques:**
    - La base de la carta.
    - Lo que se suma (dientes, Lámina, Polonio, Derivada, pactos…).
    - Lo que multiplica (Cosmos, Polícroma, Cristal, Palanca, Steiner).
    - La cuenta completa, por ejemplo `= (10 + 8) × 2 = 36`.
    - Lo que le pasa a **cada enemigo**: vida que pierde, cuánto se va a su Bloqueo, si lo detienes (umbral), si está IMPARABLE, si lo derrotas, Púas, detenido o fatiga ×1.5, y el área negativa (½).
  - **Defensas:** el Bloqueo total con dientes, mutador y edición. También avisa si el jefe no te deja defenderte o si la Marea Alta de Dagón lo reduce a la mitad.
  - **Habilidades:** Mercurio, Saturno, ediciones y Fotoeléctrico.
  - Avisa si te faltan J, si tienes Hemorragia o si es una Habilidad con «Mente en Blanco».
  - El recuadro se pone **a un lado de la carta** para no taparla.
  - La vista previa sólo lee el combate y no cambia nada. Se probó contra el daño real: coincide.

## v0.49.0 · Acompañantes del Abismo y Vestidor más rápido (beta)

- **Imparables, rebalanceados:** ya ningún enemigo es imparable todo el tiempo. Sí se pueden detener con F ≥ umbral, pero **después quedan IMPARABLES unos turnos** (se ve «IMPARABLE n» junto a su vida): 1 turno los jefes de tramo y la Hidra, 2 turnos los Primigenios y el Engendro de Dunwich. Así no se les puede detener turno tras turno.
- **«Los gatos de Ulthar»:** el texto ya no menciona que los matan; ahora una pareja de ancianos gruñones los perseguía con la escoba. Si les das de comer, un **Gato de Ulthar** se va contigo.
- **Familiares exclusivos del Abismo** (4 combates):
  - Shoggoth Bebé: +4 de Bloqueo cada turno y se come un Susurro de tu mano.
  - Gato de Ulthar: araña al enemigo con más vida (6) y te da +4 de Cordura al ganar.
  - Pez Linterna: robas 1 carta más y ves las intenciones de los invisibles.
  - Se consiguen en el Relato nuevo **«El laboratorio de Montemayor»** (y el gato, en Ulthar).
- **Almas en pena del Abismo:** Ernesto el Buzo de 1931 (arpón de 9 al enemigo con más vida), Rosa la Ayudante de Montemayor (+5 de Bloqueo y +2 de Cordura) y el Acólito Arrepentido (5 a todos, −1 de Cordura). Te acompañan en élites y jefes **hasta el final del tramo**; al pasar al siguiente se despiden y puedes encontrar otra. No cuentan para el logro «Coleccionista de almas».
- **Vestidor:**
  - Pestaña nueva **«Abismo ◈»** con todo lo exclusivo del Abismo (capas, armaduras, ojos y accesorios) en un solo lugar.
  - **Arreglado:** se trababa al pasar páginas. Las vistas previas holográficas o cósmicas dejaban un temporizador encendido que redibujaba cada 90 ms y se acumulaba en cada página; ahora se apagan al cambiar de página.

## v0.48.0 · Imparables, condiciones de jefe y relatos con castigo (beta)

- **Enemigos IMPARABLES:** la Madre Hidra, el Engendro de Dunwich, Cthulhu y Yog-Sothoth tienen Inercia (su golpe crece cada turno) pero ningún golpe los detiene, aunque F ≥ umbral. Hay que matarlos rápido o aguantar con Bloqueo.
- **Condiciones de jefe:** cada jefe del Abismo impone una al azar (se ve en el resumen antes de pelear y se anuncia en grande):
  - Mordida: 1 diente (2 contra Primigenios) no funciona.
  - Boca Cerrada: ningún diente funciona.
  - Sin Defensa: tus cartas de Defensa no dan Bloqueo.
  - Mente en Blanco: no puedes jugar Habilidades.
  - Opacidad: las ediciones de tus cartas no hacen nada.
- **3 Relatos nuevos con castigo** (cuentos de Lovecraft de 1920 y 1924):
  - «El sabueso»: un amuleto que da un diente legendario y la maldición **El Sabueso te sigue** (−5 de vida al empezar cada combate, 4 combates); o una pregunta en la que, si fallas, pierdes un diente.
  - «La declaración de Randolph Carter»: si fallas la pregunta pierdes 2 dientes y 10 de vida; si te quedas arriba, −10 de Cordura y Niebla Mental.
  - «Los gatos de Ulthar»: si los espantas, 50 % de que te roben 2 dientes y te dejen Fatiga.
- **Música del Abismo:** pistas de «Dark Ambient of 2024» de Cryo Chamber (con permiso de los autores), cortadas y comprimidas (≈12 MB en total):
  - Mapa e inicio: «Uncertain Direction» (Tineidae & Sole Massif).
  - Combates (al azar): «After the Annihilation» (Void Stasis) y «Onboard Errors» (Sabled Sun).
  - Jefes: «In the Kingdom of Parasites» (Caldon Glover).
  - Relatos y Observatorio: «Cerulean Depths» (Atrium Carceri & Kammarheit).
  - Están en el Soundtrack y en Créditos (con enlace a cryochamber.bandcamp.com).

## v0.47.0 · Cosméticos del mito de Lovecraft (beta)

Un premio en el Vestidor por **vencer a cada jefe del Abismo** (llegan solos, con letrero dorado; no se venden):

| Jefe | Premio |
|---|---|
| El Geómetra No Euclidiano | Necronomicón de Hibbelerius (en la mano) |
| Padre Dagón | Tridente de Dagón |
| El Color que Cayó del Cielo | capa holográfica Color que Cayó del Cielo |
| La Bailarina Ahogada | capa holográfica Velo de la Bailarina |
| El Engendro de Dunwich | ojos Ojo de Dunwich |
| Nyarlathotep | Tocado del Faraón Negro |
| Cthulhu | Máscara de Cthulhu |
| Yog-Sothoth | Esferas de Yog-Sothoth |
| Hastur | Máscara Pálida, Corona del Rey de Amarillo y capa El Signo Amarillo |
| Los 4 Primigenios | armadura cósmica Coraza de los Primigenios |

Las máscaras (Cthulhu y la Máscara Pálida) cubren toda la cara para que se distingan; la corona, el tocado y las esferas también son más grandes.

## v0.46.0 · Balance de dientes, mutadores, la Rueda de la Fortuna y premios en el Vestidor (beta, sólo Modo profesor)

- **Balance de los dientes:**
  - Los multiplicadores (R'lyeh, Saturno, Sol Negro y Alineación) ahora se **suman** y tienen un **tope de ×2** (antes se multiplicaban entre sí).
  - Marte da +2 por nivel (antes +3). R'lyeh da ×2 al primer ataque (antes ×3). El Diente Espejo ya no copia legendarios ni a otro Espejo.
  - Los dientes de Cristal salen menos (8 %) y duran 2 combates (antes 3).
  - **Los jefes muerden:** al empezar la pelea, cada jefe desactiva 1 diente al azar (los Primigenios, 2) durante esa pelea. Se anuncia en grande.
- **Mutadores de tramo:** cada tramo sortea una regla para todos sus combates (Gravedad Doble, Noche sin Estrellas, Fricción del Agua, Cielo Despejado, Tormenta de Ergios, Masa Extra o Eco del Abismo). Se ve abajo del mapa.
- **Rueda de la Fortuna** en el Sacamuelas: 30 Ergios el primer giro (+15 cada giro más en la misma visita). Puede dar un diente legendario (7 %) o raro, Ergios, Cordura, un apunte… o un parásito o nada.
- **Premios en el Vestidor** por avanzar en el Abismo (no se venden; llegan solos y se anuncian con un letrero dorado):
  - Supera el tramo 1 → capa **Agua Negra**.
  - Vence a un Primigenio → armadura **Escamas de Profundo** y **Casco de Buzo 1931**.
  - Llega a la profundidad 4 → capa cósmica **Abismo sin Fondo**.
  - Encuentra 8 hojas del diario → **Sombrero de Montemayor**; las 16 → **Monóculo de Montemayor** y ojos **Mirada de Montemayor**.
  - Llena los 8 huecos de la dentadura → **Sonrisa de Oro**.
  - Cumple 3 cartas de Providence → **Telescopio de Providence** (en la mano).
  - Estos logros no cuentan para el platino (el Mecha), así que nadie lo pierde.
- La Guía del Abismo tiene una página nueva: «Mutadores, mordidas y la Rueda».

## v0.45.0 · El diario completo y tramos más largos (beta, sólo Modo profesor)

- **16 hojas del diario de Montemayor** (antes 5): son registros de lo que encontró en el Cerro de la Silla y de su descenso a la locura (los dientes en fila, el muelle de los acólitos, la carta al astrónomo de Providence, el reloj que se atrasa…).
- **Son raras:** después de cada nodo hay una probabilidad pequeña de encontrar una (7 % en combates, 30 % en élites, 18 % en encuentros…), con un máximo de 3 por expedición. Se guardan **para siempre** y salen en orden, así que la historia se completa a lo largo de varias expediciones.
- Cada hoja sigue dando un apunte (pista gratis) y +6 de Cordura. Con 2 hojas en la misma expedición conoces el punto débil del Primigenio (−15 % de vida).
- En la pantalla de inicio del Abismo se ve cuántas hojas llevas y hay un botón **«Leer el diario»** para releerlas.
- **Tramos más largos:** 10 pisos antes del jefe (antes 8), con al menos 3 élites, 3 encuentros y 2 altares por tramo.

## v0.44.0 · Más reto, estados visibles y el diario útil (beta, sólo Modo profesor)

- **Más difícil:** los enemigos del Abismo tienen +50 % de vida (élites +45 %, jefes +30 %), el tramo 2 suma otro 30 % y pegan un poco más fuerte (daño ×1.25).
- **Estados que se ven:** al quedar Confundido, Aturdido, con Hemorragia o con Vértigo aparece un anuncio grande en el centro durante 2 segundos, y una insignia sobre tu personaje mientras dure. Aturdido muestra estrellitas girando y un aviso «PIERDES ESTE TURNO».
- **Cartas de Cristal:** al jugarlas, la carta aparece grande en el centro. Si resiste, tiembla y dice «El Cristal resiste»; si se rompe, se agrieta, estalla en pedazos y dice qué carta salió de tu mazo.
- **Dientes:** la zona para tocar cada hueco es más grande y se marca al pasar el mouse. Si ganas un diente con la dentadura llena (por ejemplo en un Relato), ya no se pierde: al volver al mapa eliges qué diente cambiar o lo tiras. Los huecos que puedes cambiar parpadean.
- **El diario de Montemayor sirve:** cada hoja que encuentras da un **apunte** (una pista gratis en una pregunta, en lugar de pagar Ergios) y +6 de Cordura. La última hoja anota el punto débil del Primigenio: empieza con 15 % menos vida.
- **Nueva escena al empezar:** después de la hoja de 1931, «Casi cien años después…»: tú, en una práctica de campo, subes al Cerro de la Silla y encuentras la cueva, el diario, el Necronomicón y la dentadura.
- **Mapa del Abismo:** los nodos se recorren a la derecha para dejar espacio al semáforo, la dentadura y la carta; el botón «Guía» pasó a la esquina derecha (antes tapaba los dones de los Ecos).
- Créditos: nueva línea con Lovecraft, R. W. Chambers, Balatro, Sol Cesto y Returnal. La guía ya no menciona otros juegos y la ficha de Lovecraft es más corta.

## v0.43.0 · El Astrónomo de Providence: rarezas, parásitos y relatos (beta, sólo Modo profesor)

- **Rarezas de dientes:** Comunes (60 %), ★ Raros (30 %, aquí van los Astros) y ★★ Legendarios (10 %, con aro dorado). Ahora hay **32 dientes**: 12 comunes, 10 raros, 4 legendarios (Sol Negro, Muela de Ámbar, Diente de R'lyeh, Diente de Diamante), 7 Astros entre ellos (nuevo: Neptuno, «Órbita») y 6 parásitos.
- **Dientes de Cristal:** cualquier diente puede salir de Cristal (12 %): su efecto cuenta doble, pero se rompe después de 3 combates (el número se ve sobre el diente).
- **Parásitos (como en Returnal):** Diente Podrido, Larva de Shoggoth, Branquia del Profundo, Lombriz de Yuggoth, Ojo Parpadeante y Garrapata de Leng. Tienen algo bueno y algo malo, se pegan solos y sólo el Sacamuelas los arranca (40 Ergios). El Sacamuelas a veces ofrece uno.
- **El Astrónomo Aficionado de Providence** (H. P. Lovecraft, que de joven escribía columnas de astronomía):
  - Nodo nuevo **Observatorio** (telescopio en el mapa): sube 1 nivel una constelación (Ataque, Defensa, Habilidad, Abismo, Gravedad u Órbita) y deja reacomodar la dentadura.
  - **Cartas de Providence:** al empezar cada tramo te manda una misión (vencer una élite sin daño, ganar sin Defensas, 6 cartas en un turno, 2 aciertos seguidos, Alineación, jefe en 6 turnos). Si la cumples, el trofeo del jefe trae 3 dientes legendarios. Se ve bajo la dentadura.
  - Te escribe una frase cada vez que bajas al modo infinito.
- **Relatos del Abismo:** los nodos «?» del Abismo ahora son casi siempre situaciones de 7 cuentos de Lovecraft anteriores a 1929: La música de Erich Zann, Herbert West reanimador, Las ratas en las paredes, Aire frío, El templo, El modelo de Pickman y El extraño. Cada uno trae una pregunta de física o una apuesta con su probabilidad.
- Contra un Primigenio, el trofeo siempre trae al menos un diente legendario.
- La Guía del Abismo tiene 9 páginas (nueva: «El Astrónomo y los Relatos»).

## v0.42.0 · La Dentadura: dientes, cosmos y estados nuevos (beta, sólo Modo profesor)

- **La Dentadura de Montemayor (reliquias):** las reliquias del Abismo son dientes que se ponen en una dentadura de 8 huecos (idea de *Sol Cesto*). Al empezar salen 4 y te quedas con 2. Se consiguen más en el nuevo nodo **Sacamuelas Ciego** (ícono de diente en el mapa; eliges 1 de 3 o pagas 25 Ergios para volver a tirar) y al vencer a un jefe. **El orden importa:** el Diente Espejo copia al de su izquierda. Se ve con el botón de diente bajo el semáforo.
- **El cosmos (como los planetas de Balatro):** los dientes Astro suben de nivel una «constelación»: Marte (Ataques +3 por nivel), Luna (Defensas +3), Mercurio (Habilidades), Saturno (cartas del Abismo ×1.25), Júpiter (masa al empezar) y el Sol Negro (×1.1 por cada Astro). **Tres Astros seguidos = Alineación planetaria: tus ataques ×1.5.**
- **18 dientes** en total, incluido un diente maldito (Diente Podrido: +1 J por turno a cambio de Cordura).
- **Pactos:** ahora son 10 (nuevos: Péndulo, Sonrisa, Estelar, Palanca y Cafeína) y el libro te ofrece **2** para elegir 1.
- **Estados nuevos** y menos Confusión: **Aturdido** (si un golpe aturdidor te hace daño, pierdes tu siguiente turno; bloquéalo completo para evitarlo), **Hemorragia** (cada carta que juegas te quita 1 de vida durante unos turnos) y **Vértigo** (robas cartas de menos). La Confusión queda en el Vigía, el Geómetra herido, Nyarlathotep y la página «La Confusión».
- **Más corto antes del infinito:** 2 tramos de 8 pisos (antes 4 de 6). El tramo 1 termina con un jefe al azar y el tramo 2 con un Primigenio. El diario aparece a mitad de cada tramo, al empezar el tramo 2 y antes del Primigenio.
- **Arreglado:** con poca Cordura, las cartas de los sobres se veían como una raya ilegible (el efecto de «letras borradas» fallaba con las cartas de muestra y reemplazaba todo el texto).
- La Guía del Abismo tiene una página nueva («La Dentadura») y «Estados alterados» en lugar de «Confusión».

## v0.41.1 · Arreglo: «Lock timeout» al entrar

- Corregido: al entrar (o al guardar), a veces salía «Lock timeout: another process was holding the lock for too long». Cada petición tomaba el candado del servidor mientras leía hojas completas; con muchos alumnos jugando a la vez, algunas esperaban demasiado.
- El servidor (`apps-script/Code.gs`) ahora: no toma el candado en las consultas que sólo leen (ranking, huellas, avisos, estadísticas); al entrar lo suelta en cuanto guarda la sesión; y si está ocupado responde un mensaje claro.
- El juego reintenta solo hasta 3 veces cuando el servidor está ocupado, antes de mostrar un aviso en español.
- *Requiere pegar la nueva versión de `apps-script/Code.gs` y publicar una nueva versión de la implementación* (el mismo paso sirve para el ranking del Abismo).

## v0.41.0 · El Descenso: tramos, Primigenios y modo infinito (beta, sólo Modo profesor)

- **4 tramos de 6 pisos.** Cada tramo termina con un **jefe sacado al azar** (no se repiten en la misma partida): el Geómetra No Euclidiano, Padre Dagón, el Color que Cayó del Cielo, la Bailarina Ahogada o el Engendro de Dunwich. Cada tramo es 10 % más fuerte que el anterior.
- **Primigenios en el tramo 4**, al azar: Nyarlathotep, Cthulhu, Yog-Sothoth o Hastur. Cada jefe tiene una **desventaja** que te estorba toda la pelea (marea que corta tu Bloqueo, −1 J por turno, intenciones invisibles, carta descartada, −5 Cordura por turno, sólo 4 cartas, Ataques +1 J).
- **Resumen antes de cada jefe:** retrato, tema de física, desventaja y de qué cuento viene.
- **Entre tramos:** recuperas 40 % de la vida perdida y abres un sobre de premio (te quedas con 1).
- **¿Seguir bajando?** Al vencer al Primigenio puedes retirarte o entrar al **modo infinito**: cada profundidad extra hace a los enemigos ×1.2 más fuertes y multiplica tu puntaje.
- **Ojo del Abismo:** vencer a un Primigenio da un ojo morado junto al nombre (al lado del rojo de AM), en el menú y el ranking.
- **Ranking del Abismo:** botón «Abismo ◈» en el Ranking. Las partidas del Abismo ya no se mezclan con el ranking normal. *Requiere pegar la nueva versión de `apps-script/Code.gs` y publicar una nueva versión de la implementación.*
- **Nueva historia:** el erudito **Ignacio Montemayor** encontró el tomo en una cueva del **Cerro de la Silla** (la primera hoja del diario trae un dibujo del cerro con la cueva). Ahora encuentras una hoja al empezar cada tramo y la última antes del Primigenio.
- Modo profesor: botón «Jefe: …» para probar cualquier jefe del Abismo.

## v0.40.0 · Abismo más loco (beta, sólo Modo profesor)

- **Fondo vivo:** en las pantallas de inicio del Abismo hay muchas más burbujas y siluetas de criaturas que nadan; de vez en cuando pasa algo enorme con un ojo que parpadea.
- **8 cartas nuevas** más locas (y algunas chistosas): Calamar de Torque, Gato de Schrödinger Ahogado, Café del Abismo, Llamada Perdida de R'lyeh, DCL de un Tentáculo, Lo Calculé en Libras, La Tercera Mano de Arrieta y Pato de Hule Primigenio. Ahora hay 18 cartas del Abismo.
- **Confusión más visible:** la gema de costo se vuelve naranja y aparece un «?» amarillo que tiembla (antes era un violeta difícil de ver).
- **El diario por partes:** al empezar sólo lees la primera hoja; las otras 4 aparecen en el mapa conforme bajas (pisos 2, 4, 6 y antes del jefe).
- **Enemigos más peligrosos:** las élites ya sueltan golpes de 20 a 30 (Ancla, Canto abisal) y el Geómetra abre con 24.
- Guía: la página 4 ahora se llama «Tipos de carta» y explica rarezas y ediciones.

## v0.39.1 · Arreglo: el Abismo se congelaba

- Corregido: si presionabas «Saltar prólogo» mientras el diario se estaba escribiendo, el juego se congelaba en la portada del Abismo y ningún botón respondía (la máquina de escribir seguía escribiendo sobre una página ya borrada).
- Misma protección para las animaciones de los sobres y para los epílogos de las almas en pena.

## v0.39.0 · Sobres y Guía del Abismo (beta, sólo Modo profesor)

- **Sobres** (como Pokémon TCG): después del Pacto abres 3 sobres (de tu Clase, del Abismo y de los Ecos). Cada uno trae 5 cartas: 3 comunes, 1 rara (a veces legendaria) y 1 **brillante con edición garantizada**. Te quedas con 2 de cada uno, así que empiezas con unas 16 cartas en vez de 10.
- **Guía del Abismo**: 7 páginas ilustradas con cartas y criaturas reales (el viaje, Cordura, Confusión, ediciones, cartas nuevas, criaturas y Ecos Quebrados). Sale la primera vez y luego con el botón «? Guía» en el inicio, en los sobres y en el mapa. Se navega con las flechas.
- **Ediciones más visibles**: ahora tiñen toda la carta y tienen su propio brillo animado (Lámina con destello blanco, Holográfica con arcoíris suave, Polícroma con franjas de colores y Cristal helado con facetas y chispas), más una cinta con su nombre. El tooltip de la carta en combate explica la edición.
- **Cristal menos castigador**: como en Balatro, sólo se rompe 1 de cada 4 veces que lo juegas (`ROMPER_CRISTAL` en `src/data/abismo_modo.ts`). Si resiste, regresa al descarte.

## v0.38.0 · El Abismo de los Ejes (beta, sólo Modo profesor)

- Nuevo modo de **horror cósmico** para quien ya venció a AM. Por ahora sólo se abre desde el **Modo profesor → Abismo (beta)** para probarlo.
- **Prólogo:** el diario del profesor Elías Arrieta (1931), que encontró el *Necronomicón de Hibbelerius* y fue perdiendo la cordura. Se puede saltar.
- **Una página del Necronomicón por expedición:** eliges 1 de 3 modificadores con poder y costo (Geometría Imposible, El Sueño Profundo, Ángulos que No Suman, El Mercader Velado, La Confusión, El Cristal, Página de Steiner y El Horror Lúcido).
- **El Pacto:** eliges 1 de 3 mazos temáticos (Centroide, Excéntrico, Volante, Hueco, Inercia) o el **Pacto ciego** (mazo al azar y +15 de Cordura).
- **Cordura con semáforo:** siempre visible a la izquierda (verde, amarillo, naranja, rojo). Es 100 − Locura: aciertas y sube 10, fallas y baja 8.
- **Confusión** (como en Slay the Spire): las cartas robadas cuestan 0–3 J al azar; la gema se pinta de violeta.
- **Ediciones** (como en Balatro): Lámina, Holográfica, Polícroma y **Cristal** (×2, un solo uso: se rompe y sale del mazo). Salen en las recompensas del Abismo.
- **11 cartas del Abismo:** Golpe al Centroide, Momento de Inercia, Radio de Giro, Ejes Paralelos, Pirueta, Volante Abisal, Geometría Imposible, El Ojo que Gira, Teorema de Steiner y Despertar al Durmiente (legendarias), más el estado Susurro.
- **Capa 1, los Muelles Inclinados:** Acólito Inclinado (se vuelca con 2 golpes), Pólipo Compuesto (se divide), Profundo Hueco (área negativa), Cultista del Eje (te Confunde), élites Vigía del Faro Hundido y Madre Hidra, y el jefe **El Geómetra No Euclidiano**.
- **Ecos Quebrados:** Isaac Newton en 1693, Georg Cantor y Ludwig Boltzmann, presentados con respeto y con un mensaje sobre salud mental.
- **Preguntas nuevas:** centroides, centro de masa, momento de inercia, ejes paralelos y radio de giro (numéricas con datos al azar y conceptuales). El 40 % repasa temas de los actos anteriores.
- Música nueva (frigia, muy grave) y fondo de ciudad hundida. Sprites generados con `tools/arte/abismo.py`.

## v0.37.0 · Relicario-93

- Nuevo **arranque estilo consola** (inspirado en UFO 50): antes de la portada aparece el Relicario-93. Abres el estuche, sacas el disco (arrastrándolo o tocándolo), lo metes en la consola, se lee con un BIOS de física y al presionar **Iniciar** aparece el juego.
- Se puede **saltar** con el botón «Saltar» o con Esc. Por defecto sale una vez cada que se abre el juego (`ARRANQUE` en `src/config.ts`: `'sesion'`, `'siempre'` o `'nunca'`).
- Se puede jugar sólo con teclado (Enter avanza cada paso) y respeta el volumen elegido en el juego.
- Phaser carga por debajo y se pausa mientras el arranque está en pantalla, así no gasta CPU.

## v0.36.0 · Sets de la Tienda de Layla

- Nueva pestaña **Sets**: piezas + una capa exclusiva con 25 % de descuento sobre lo que te falte (si ya tienes una pieza, no se cobra).
  - Góticos: **Doctor de la Peste**, **Sepulturero**, **Caballero de Péndulo**, **Monje de la Campana** y **Conde de las Criptas**.
  - Otros: **Alquimista de Vapor**, **Astronauta de las Criptas** y **Luchador**.
- 17 piezas nuevas (también se venden sueltas): máscara de pico, sombrero de ala ancha, farol, bombín, pala, lápida (escudo), corona de engranes, maza de péndulo, escudo de reloj, capucha de monje, campana, goggles, matraz, bandera, cinturón de campeón, colmillos y candelabro.
- 8 capas que sólo vienen en los sets: Cera Negra, Tierra de Tumba, Latón Viejo, Hábito Gris, Terciopelo Sangre, Cobre, Traje Espacial y Lentejuela Dorada (holográfica).
- Corregido: 16 accesorios usaban colores sin definir y se veían con huecos (Máscara de Layla, Réplica de La Entropía, Termo, Vela de Ofrenda, Calaverita, etc.).
- La oferta del día ya no cae en un set.

## v0.35.1 · Diagnóstico final en la cuenta del profesor

- La cuenta del profesor (ADMINS) ya puede hacer el diagnóstico final: al tener 6 expediciones aparece el aviso en el menú y se abre al tocar «Expedición». No se le exige el inicial.
- Su resultado se guarda en su Grimorio (desbloquea la Capa UDEM) pero **no** se registra en Eventos, así que no altera la ganancia de Hake del grupo.
- Si no hubo diagnóstico inicial, la pantalla final ya no muestra «0/8» ni calcula g.
- Corregido: quien sacaba 0 en un diagnóstico podía repetirlo como si fuera la primera vez.

## v0.35.0 · Colores nuevos y colores cósmicos

- **Por nivel de Conocimiento:** 7 capas (Rosa Mexicano, Cempasúchil, Jade Olmeca, Vino Tinto, Talavera, Verde Bandera, Bata de Laboratorio), 4 armaduras (Cobre Oxidado, Oro Rosa, Titanio Azul, Grafito) y 4 visores neón (Lima, Naranja, Rosa, Rojo Láser), repartidos entre los niveles 2 y 10.
- **Capa UDEM** (amarillo y negro): regalo por completar el diagnóstico final (logro «Orgullo UDEM», no cuenta para el platino del mecha).
- **Tienda de Layla → Colores:** Capa Cósmica y Armadura Nebulosa (15, nuevo efecto: nebulosa en movimiento con estrellas que titilan), Capa Aurora Boreal, Lava Volcánica y Arcoíris, Armadura Cromo Arcoíris (holográficas), Capa Rosa Chicle y Mezclilla, y visores Púlsar y Supernova.
- Para agregar más: en `src/art/palette.ts` un color con `lock` sale por nivel; con `id` y `tienda: precio` se vende en la tienda; `holo` lo hace holográfico y `cosmos: true` lo hace cósmico.
- Las muestras de capa en «Forjar héroe» van en dos filas de 16; en el Grimorio los colores de cada nivel van en una línea.

## v0.34.0 · Escudos chistosos

- Nuevo espacio de accesorio **Escudo** y nueva categoría en la Tienda de Layla con 11 escudos: Pizza, Tortilla de Harina, Concha de Vainilla, Tapa de Olla Exprés, Señal de ALTO, El Hibbeler (14ª ed.), Vinilo de Synth Funk, Galleta Gigante, Rebanada de Sandía, Tupper de la Abuela y Cartón del Proyecto Final (3–9 de Momentum).
- Se equipan en «Forjar héroe» → Accesorios. El caballero cambia su escudo normal por el chistoso; el arcanista y el penitente lo cargan en la otra mano.
- Las pestañas de la tienda ahora van en dos filas de 6. El ranking muestra el escudo en la ficha del héroe.

## v0.33.2 · Ficha de héroe en el ranking

- En el Salón de las Leyendas los héroes se ven más grandes (6 por página).
- Al tocar una fila se abre la **ficha del héroe**: el personaje en grande con todos sus cosméticos, clase, grupo, lugar, puntaje, piso máximo, victorias con su gravedad, la insignia de AM y la lista de su equipo (capa, armadura, visor y accesorios de la Tienda de Layla).

## v0.33.1 · Epílogos de las seis almas nuevas

Al vencer a Hibbelerius con una de ellas, su epílogo ahora tiene escena animada:
- **Fray Histéresis** dibuja su curva σ–ε: al descargar no vuelve al origen y queda la «huella» (deformación residual).
- **Sir Cebollín** empuja su proyecto: la fuerza crece y no pasa nada hasta superar μs·N; entonces se desliza y le ponen el sello «ENTREGADO».
- **Sir Helios**: sale un sol detrás de él y los Joules sobrantes vuelan hacia él.
- **Parches** abre su cofre y te regresa 38 de 40 Ergios; una moneda vuelve a su bolsillo.
- **Hanbei**: tres vasijas de energía suben y bajan, pero ΣE = 90 J siempre; caen pétalos.
- **Gough** dispara a 45°; la flecha sigue la parábola de alcance máximo y da en el blanco.

## v0.33.0 · Seis almas nuevas inspiradas en los «Souls»

- **Fray Histéresis** (Gascoigne): alterna humano (+6 Bloqueo, +2 vida) y bestia (9 de daño a todos, pero −2 vida a ti) cada 2 turnos, o se transforma si pierdes 12+ de vida. Concepto: histéresis y límite elástico.
- **Sir Cebollín** (Siegmeyer): acumula fuerza 4 por turno y no actúa hasta superar μs·N (12); luego golpea 10. Concepto: μs > μk.
- **Sir Helios** (Solaire): convierte tus Joules sin usar en daño (5·E + 3). Concepto: conservación de la energía.
- **Parches** (Patches): pega 12, cobra hasta 10 Ergios al inicio de élites y jefes y a veces la reacción te alcanza (3 de daño). Concepto: 3ª ley.
- **Hanbei** (Sekiro): absorbe 1/3 del daño que recibes y lo devuelve al enemigo más sano. Concepto: la energía no se pierde.
- **Gough** (arquero ciego): dispara con θ al azar; daño = 16·sen 2θ. Concepto: alcance máximo a 45°.
- El logro «Coleccionista de almas» ahora pide las 16 (afecta también al platino del mecha).
- Los textos flotantes del combate ya no se salen de la pantalla.

## v0.32.2 · Límite de reliquias

- Puedes cargar a lo más **8 reliquias** (`MAX_RELIQUIAS` en `src/data/relics.ts`); las especiales del Profe (Vida Extra, Necronomicón) no cuentan. Al ganar la novena, venga de donde venga (botín, tienda, altar, dilema, jefe), se abre una ventana para elegir cuál dejar en la cripta, incluida la nueva. Al descartar el Corazón de Ascua o el del Coloso se quita la vida máxima que daban. Se registra en Eventos (`descarte_reliquia`).

## v0.32.1 · Arreglos

- **Menú:** al regresar de una expedición ya no se abre otra vez la ventana de dificultad (el menú «recordaba» que venías del diagnóstico).
- **Lápidas:** a lo más 3 por acto y una por compañero (las más recientes).
- **Hoja Alumnos:** las columnas **Ganado** y **Gastado** (Momentum) ahora las escribe el servidor cada vez que se guarda el Grimorio; no hacen falta fórmulas. Las filas sin matrícula ya no cuentan como alumnos en el Panel. Nueva opción del menú Criptas: **«Reparar hoja Alumnos»** (quita filas vacías o con fórmulas copiadas hacia abajo, que hacían que los alumnos nuevos se agregaran hasta el final, y rellena Ganado/Gastado; con respaldo).

## v0.32.0 · Diagnóstico inicial y final

- **8 preguntas conceptuales** (~4 min, sin cálculos, distintas de las del juego): inercia, 2ª y 3ª ley, fricción, trabajo, energía, impulso y cantidad de movimiento. Opciones barajadas y botón «No lo sé». Se editan en `src/data/diagnostico.ts`.
- **Inicial:** obligatorio antes de la primera expedición, sin mostrar resultados. **Final:** las mismas preguntas, obligatorio al cumplir 6 expediciones (`DIAG_POST_EXPEDICIONES`); al terminarlo el alumno ve su inicial, su final y su ganancia g. Cada uno da +2 ◈ Momentum por completarlo.
- **Hoja «Diagnóstico»** (menú Criptas → «Calcular ganancia de aprendizaje (Hake)», y también al actualizar el panel): por grupo, <g> de Hake con los promedios y el promedio de g individuales; % de aciertos por pregunta antes y después; y una fila por alumno con g y su nivel (baja < 0.3 ≤ media < 0.7 ≤ alta).
- El modo profesor puede probarlo («Diag. inicial» / «Diag. final») sin que se registre.

## v0.31.2 · Estadísticas más útiles

- **Estadísticas de Bayes en tres columnas:** resumen (ahora con combates ganados, élites y enemigos vencidos), **jefes derrotados** con su conteo (Coloso, Bruja, Hibbelerius y AM, que sigue oculto hasta abrir el Núcleo), **quién te ha vencido más** (top 3) y **a quién has vencido más** (top 3), y los temas.
- **Temas:** sólo cuentan preguntas reales (runas, encuentros y «¿Más o menos?»); antes se colaban los nombres de los ecos al elegir un don. Los temas se muestran con nombres legibles («Fricción», «Conservación de la energía», «2ª ley de Newton»).
- El Grimorio cuenta los enemigos vencidos por tipo (`codex.bajas`), desde esta versión.
- Requiere publicar el nuevo `Code.gs` (endpoint `estadisticas`).

## v0.31.1 · Dones legibles

- Santuario: el nombre, la etiqueta, el efecto, la radiación y la cita de cada don se apilan según su alto real y se encogen si hace falta; si aun así no cabe, la cita queda sólo en el tooltip. Ya no se salen de la caja (p. ej. con Bayes o con 4 opciones por un dúo).

## v0.31.0 · Mecha «Inercia-01», créditos y README

- **Último desbloqueable:** armadura completa **Mecha «Inercia-01»** (diseño original: cresta de una aleta, visor horizontal, propulsores, escudo con anillo y rifle de haz). Reemplaza todo el cuerpo del héroe y conserva el color de capa y de visor del alumno; los accesorios se le acomodan. Se desbloquea con el logro platino **«Piloto de élite»: conseguir todos los demás logros**. Se equipa en Vestidor → Armaduras. Arte en `src/art/mecha.ts` (generador `tools/arte/mecha.py`).
- **Créditos:** se agregan la saga «Souls» de FromSoftware (Demon’s Souls, Dark Souls, Bloodborne y Elden Ring) como inspiración y el cuento «I Have No Mouth, and I Must Scream» (1967) de Harlan Ellison como origen de AM. Aviso de que las referencias son homenajes sin afiliación.
- **Limpieza de la hoja:** se quita la opción duplicada «Limpiar datos de prueba…»; las opciones «Borrar datos de un alumno / de un grupo / TODO» (con respaldo automático) ahora incluyen la hoja Huellas.
- README reescrito y más corto; el historial de versiones pasa a este archivo.

## v0.30.0 · Lápidas y signos, Thomas Bayes y La Entropía

- **Huellas entre compañeros (estilo Souls, asíncrono, sólo dentro del mismo grupo y con alias):**
  - **Lápidas:** al morir dejas una lápida en tu acto y piso. Tus compañeros la ven en su mapa (hasta 6 por acto), con quién te venció y el último concepto que fallaste. Honrarla da +6 Ergios (una vez por expedición).
  - **Signos dorados:** al vencer a un jefe dejas tu signo (uno por jefe; se actualiza). Antes de ese jefe, un compañero puede invocar tu fantasma (hasta 3 opciones): pelea a su lado y golpea al final de cada turno. Si ganan, recibes +1 ◈ Momentum por ayuda (tope 5 por aviso) y un aviso en el menú con quién te invocó.
  - Hoja nueva **Huellas** (se crea sola). Endpoints: `dejarHuella`, `huellas`, `usarHuella`, `avisos`.
- **Thomas Bayes** (eco): aparece en los santuarios cuando el alumno lleva **5 expediciones**. Dones: Prior Informativo (robas más en el primer turno), Actualización Bayesiana (fallar no reinicia la racha; nivel 2: +10 Ergios por acierto) y Distribución Posterior (curación al ganar según tus aciertos).
- **Estadísticas** (menú, se abre a las 5 expediciones): tiempo, expediciones, victorias, derrotas, tasa de victoria, mejor acto, el enemigo que más te vence y los temas que más se complican, con la estimación bayesiana P = (aciertos + 1)/(intentos + 2). Datos del servidor (`estadisticas`, a partir de Partidas y Eventos).
- **La Entropía (UDEM):** carta rara neutral («Revuelve tu descarte dentro de tu mazo y roba 2/3; se agota») inspirada en la escultura amarilla del campus, y dos accesorios: Réplica de La Entropía y Papas a la Entropía.
- **Cosméticos de cabeza completa:** Cabeza de Calabaza, Escafandra de Astronauta, Cabeza de Robot, Máscara de Luchador, Calavera, Vendas de Momia, Visor Cyberpunk ancho y la nueva Máscara de Layla. Vistas previas más grandes en la tienda y el vestidor.
- **Música de la tienda:** «Kitty Paw» de Shook (álbum «Synth Funk», 2024 · shook.bandcamp.com/album/synth-funk), en créditos y en el Soundtrack. El botón del menú dice «Tienda de Layla».
- **Limpieza:** «Borrar datos de un alumno / de un grupo / TODO» (menú Criptas) ahora también borran las lápidas y los signos.

## v0.29.0 · Sir Dextro, Hibbelerius clásico y la nueva tienda

- **Hibbelerius** vuelve a su diseño original (archimago con cuernos, báculo y tomo).
- **Nueva alma en pena: Sir Dextro, el Caballero sin Diestra.** Perdió la mano derecha y con ella «la regla de la mano derecha». Si le enseñas que el producto cruz se calcula con un determinante, se vuelve tu aliado: cada turno calcula r × F = rx·Fy − ry·Fx con vectores al azar; si sale positivo (sale del plano) golpea, si sale negativo te da Bloqueo. Epílogo: escribe el determinante en su escudo. Su sprite no tiene mano (muñón vendado).
- **Tienda de Layla:**
  - Cerrada (🔒) hasta terminar la primera expedición; el regalo diario también empieza ahí.
  - Música propia: funk synth en Mi dórico (bajo slap, acordes staccato, palmadas y un sinte brillante).
  - Ya no hay temporadas ni rotación: **todo el catálogo (92 artículos) está siempre a la venta**, en 9 categorías: Clásicos, Armas, UDEM, México, Halloween, Día de Muertos, Navidad, Ciencia ficción y De las Criptas (objetos de ecos, almas, Myriam, AM y Hibbelerius).
  - Lo que antes era de temporada ahora cuesta más (8–16 ◈).
  - **Oferta del día:** un artículo con −40 %, igual para todo el grupo, cambia a medianoche.
- **Menú:** el panel del alumno muestra sus **expediciones** terminadas. Al iniciar sesión, el servidor las cuenta en la hoja Partidas (requiere publicar la nueva versión de `Code.gs`; sin eso se estima con el progreso guardado).

## v0.28.0 · Castillo y balance

- **Acto II:** las peleas ocurren en el salón de un castillo (muros de sillares, ventanales con luna, pilares, estandartes, antorchas y alfombra). Contra la Bruja aparece su trono, la luna se vuelve roja y los estandartes morados.
- **Balance:** enemigos con **+15 % de vida y +15 % de daño** en los Actos I–III (+10 % en el Núcleo). Se suma a la gravedad (Neptuno/Júpiter).
- Perillas en `src/data/enemies.ts`: `VIDA_POR_ACTO`, `VIDA_JEFES`, `VIDA_ELITES`, y las nuevas `DANO_POR_ACTO`, `DANO_JEFES`, `DANO_ELITES` (1 = sin cambio). El número que ve el alumno en la intención del enemigo ya incluye el ajuste.

## v0.27.1 · Ajustes de texto

- Encuentros: al responder, el mensaje del NPC y la recompensa/castigo se apilan y se encogen solos para no quedar debajo del botón «Continuar». La solución de la izquierda también se ajusta.
- Grimorio: los nombres largos (p. ej. «Hibbelerius, el Autor Eterno») se reducen para caber en un renglón y la ficha (masa, peso, vida) se acomoda debajo, sin encimarse. Igual en las cartas.

## v0.27.0 · Myriam, la Hechicera Oscura

- Nuevo encuentro: **Myriam**. En cada nodo de encuentro (desde el piso 3) hay **15 %** de probabilidad de toparte con ella, una sola vez por expedición.
- No regala nada: muestra **3 maldiciones** al azar (sólo las que pueden aplicarse) y debes aceptar una. Lo único que decides es cuál duele menos.
- Maldiciones: Entropía Creciente (−3 cartas al azar), Masa Perdida (−8 Vida máx.), Impuesto de Fricción (−½ Ergios), Ruido Térmico (+2 Ruido Blanco), Fatiga del Material (2 cartas pierden su mejora), Mirada del Abismo (+20 Locura), Pies de Lodo, Arma Hueca, Frascos Rotos (pierdes pociones), Hurto Arcano (roba una reliquia común).
- Se registra en el Grimorio (NPCs) y en Sheets (`myriam`, con la maldición elegida).
- Ajustes en `src/data/myriam.ts` (`MYRIAM_CHANCE`, lista `MALDICIONES`). Modo profesor: salto «Myriam».

## v0.26.0 · Layla atigrada, accesorios en «Forjar héroe» y más artículos

- **Layla** ahora es una atigrada gris-café (como la foto de referencia): rayas oscuras, hocico y pecho blancos, ojos gris verdoso. Tiene 19 frases (clic en ella para que hable) y se presenta como «Layla la comerciante».
- **Los accesorios se equipan en «Forjar héroe» → ✦ Accesorios** (botón junto a la vista previa): un selector por ranura con lo que ya compraste. En la tienda sólo se compra; lo tuyo aparece como «✓ Es tuyo».
- **Ranuras nuevas:** Cabeza, Cara, Mano (reemplaza al arma) y Pies.
- **Filtro en la tienda:** «Sólo lo nuevo» oculta lo que ya tienes. La rotación semanal ahora muestra 5 artículos.
- **25 artículos nuevos:** cascos (vikingo, espartano, astronauta, minero, kabuto, corona real), cara (lentes de sol, lentes de pasta, monóculo, parche, bigote), pies (botas vaqueras, tenis rojos, pantuflas de gato, botas lunares), armas con guiños a otros juegos y películas (sable láser azul y rojo, espada del mercenario, martillo del trueno, pico de minero, arco élfico, llave inglesa, varita estelar) y de temporada (máscara de calavera en Día de Muertos, botas de duende en Navidad).

## v0.25.0 · Momentum y la Tienda de Layla

- **Momentum (◈, p = m·v):** nueva moneda que se conserva entre expediciones (en el Grimorio, se sincroniza con la hoja como `mGanado`/`mGastado`). Se gana al vencer jefes en una expedición —Coloso 2, Bruja +3, Hibbelerius +5, AM +5 (máximo 15)— y **Layla regala 1 cada día** que entras al juego.
- **Tienda de Layla** (botón «Layla ◈N» en el menú): una gata atigrada que vende **accesorios para cualquier clase** (cabeza o mano; los de mano reemplazan al arma). Todo lo comprado es permanente y se equipa en la tienda o en Vestidor → Accesorios.
  - **Rotación semanal:** 4 artículos que cambian cada lunes, iguales para todos (orejas de gato, sombrero de copa, laurel, birrete, látigo, vaso de matcha, tridente, guadaña, espada de madera, calculadora).
  - **Temporada (tiempo limitado):** Día de Muertos del 1 oct al 5 nov (corona de cempasúchil, sombrero de Catrina, pan de muerto, calabaza), Navidad del 1 dic al 6 ene (gorro navideño, bastón de caramelo) y 14 de febrero (rosa).
  - Para agregar artículos: `src/data/tienda.ts` (cada uno es una matriz de pixeles pequeña con su precio, ranura y temporada). Layla: `tools/arte/layla.py`.
- «Créditos» pasó a un botón pequeño arriba a la izquierda del menú. Modo profesor: «Desbloquear todo» da 50 ◈.

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

## v0.23.1 · Formulario, evidencia y perillas de dificultad

- **`apps-script/Formulario.gs`** (pégalo como archivo NUEVO en el mismo proyecto de Apps Script; también pega el `Code.gs` actualizado para que aparezcan las opciones en el menú «Criptas»; no requiere nueva implementación):
  - **Crear formulario de retroalimentación:** genera un Google Form (experiencia, dificultad, qué te ayudó a aprender por tema, confianza antes/después, ideas de personaje, enemigo, carta, alma o eco, errores, recomendación 0–10 y consentimiento para uso anónimo). Las respuestas llegan a una pestaña de la misma hoja. Pega el enlace en `FORM_URL` (`src/config.ts`) para que aparezca el botón «✎ Tu opinión».
  - **Generar evidencia:** pestaña «Evidencia» con alumnos activos, horas jugadas, problemas respondidos, % de aciertos, **curva de aprendizaje** (aciertos en las primeras 5 vs. últimas 5 respuestas de cada alumno), aciertos por tema (1ª vs. 2ª mitad) con gráfica, y tabla por alumno.
- **Perillas de vida** en `src/data/enemies.ts`: `VIDA_POR_ACTO`, `VIDA_JEFES` y `VIDA_ELITES` (todas en 1 = sin cambio), además de `VIDA_ENEMIGOS` (1.2).

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

## v0.22.0 · Sir Autocompleto, Asimov y Turing, cosméticos holográficos

- **Nueva alma en pena: Sir Autocompleto, de la Llama Delirante.** Un guerrero que dejó que una llama amarilla en su yelmo pensara por él (la llama le dijo que K = m·v² y le creyó). Su pregunta: «si la llama ya sabe todas las respuestas, ¿para qué aprender yo?»; la respuesta compasiva es usarla si quieres, pero entender tú el problema para saber cuándo se equivoca. Como aliado, al final de tu turno su llama golpea a TODOS (7), pero 1 de cada 4 veces «alucina»: no le pega a nadie y te sube 3 de Locura. Epílogo: apaga la llama y escribe la solución a mano («Lo verifiqué yo»). En el modo profesor: «Fin + Autocomp.».
- **Ecos del Núcleo** (sólo aparecen en el Acto IV, y ahí salen más seguido; sus preguntas son de cálculo):
  - **Isaac Asimov**, el Padre de los Robots: *Primera Ley* (Bloqueo al iniciar cada combate), *Tercera Ley* (Bloqueo la primera vez que bajas de la mitad de vida) y *Psicohistoria* (robas más cartas en el primer turno).
  - **Alan Turing**, el Descifrador: *Máquina de Turing* (si juegas 4 cartas en un turno, +1 J en el siguiente), *Descifrar Enigma* (los enemigos empiezan con Fatiga) y *Test de Turing* (+3/+6 de daño contra autómatas y AM).
- **Cosméticos de AM, ahora holográficos y animados:** capa «Holograma de AM», armadura «Cromo Holográfico» y ojos «Ojo Holográfico». El color recorre el arcoíris por pixel y con el tiempo (`makeTextureHolo` en `src/art/sprites.ts`). Quien ya tenía las versiones anteriores las conserva, ahora animadas.
- **Curva de niveles el doble de larga** (`NIVELES` en `src/data/progreso.ts`: 2000 de Conocimiento para el nivel 10, ≈ 9 victorias). Nadie pierde lo que ya desbloqueó: el nivel que tenía con la curva anterior queda como piso (`Codex.nivelPiso`) y desde ahí sigue con la curva nueva.
- **Menú:** la etiqueta «Vencedor de AM» aparece arriba del panel y ya no tapa «Conocimiento: nivel…».

## v0.21.0 · Premios por vencer a AM y panel de avance

- **Al vencer a AM** (bandera `acto4` del Grimorio; la pantalla final avisa la primera vez):
  - **Cartas de cálculo** (neutrales, raras; desde entonces salen en recompensas, tienda y dilemas de cualquier clase):
    - **Derivada** (1 J): roba 1 carta y tu siguiente ataque gana +2 por cada ataque que ya jugaste este turno (mín. +4; mejorada +3/+6).
    - **Integral** (2 J, mejorada 1 J): inflige todo el daño que ya hiciste este turno (∫ daño dt, máx. 40).
    - **Límite** (1 J, se agota): si al enemigo le queda 25 % de vida o menos (mejorada 30 %; jefes 10 %), lo derrota; si no, 6 de daño (9) y Fatiga 1.
  - **Cosméticos de latón:** capa «Circuitos de AM», armadura «Latón del Núcleo» y ojos «Ojo de AM» (con 🔒 «Vence a AM» mientras no lo vences).
  - **Insignia «Vencedor de AM»:** un ojo rojo que late junto al nombre en el menú y en el Ranking. Viaja dentro del avatar, así que **no requiere cambiar `Code.gs`**. En el Ranking, quien llegó al Núcleo ve «39 +IV» en la columna de pisos.
- **Panel «Tu avance» en el menú:** barras de Grimorio (%), jefes vencidos (3, o 4 cuando el Núcleo ya se abrió), almas encontradas (8), figuras y cartas descubiertas.

## v0.20.2

- La portada, el inicio de sesión y los créditos muestran sólo el número de versión (p. ej. «v0.20.2»). La descripción de cambios sigue en `VERSION` de `src/config.ts` y en este README.

## v0.20.1 · Música sci-fi del Núcleo y epílogo del alma

- **Música del Acto IV, nueva:** más lenta y tétrica, estilo sci-fi. Cuatro voces nuevas en el sintetizador (`src/audio.ts`): pad analógico con filtro resonante que abre y cierra (`sweep`), sub grave que «respira» (`throb`), pings de sonar con eco (`sonar`) y chasquidos digitales (`glitch`). Mapa a 54 bpm, combate a 76 bpm con pulso claro (bombo, caja y bajo) y AM a 66 bpm, pesado, con campana y una melodía de notas largas.
- **Epílogo del alma a pantalla completa:** al ganar con un alma aliada aparece primero su escena animada en grande y luego las estadísticas. Antes, si el alumno tenía temas para repasar, el panel de repaso ocupaba ese lugar y sólo se veía el texto.
- **Modo profesor:** el botón «Fin + alma» abre el final con un alma aliada; cada clic pasa a la siguiente (Ícaro → Ayudante → … → Duda). Los saltos ahora van en 7 columnas.

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

## v0.19.0 · Locura, el Autor Eterno y epílogos ilustrados

- **Mapa más claro:** el camino recorrido se dibuja con una línea dorada continua; los caminos que todavía puedes tomar se ven más brillantes que los cerrados. Al pasar el cursor sobre cualquier nodo alcanzable (aunque esté 2 o 3 pisos adelante) se ilumina en azul la ruta para llegar.
- **Entropía mental → Locura** en todos los textos (barra superior, fogata, Necronomicón, dilemas, AM, glosario). El glosario explica que la Locura es «la entropía de tu mente: siempre tiende a subir». La carta **Entropía** (2ª ley de la termodinámica) conserva su nombre.
- **Hibbelerius, el Autor Eterno** (antes «la Parca del Tomo»): mismo diseño, nuevo título en el combate, el mapa y el soundtrack.
- **Epílogos ilustrados** (`src/art/epilogos.ts`): si vences a Hibbelerius con un alma aliada, la pantalla final muestra una escena animada distinta por alma: el examen de Ícaro con un 10, la calculadora de Sir Radián marcando 1, la tesis APROBADA del Doctorando, el pizarrón con g = 9.81 m/s² de la Dama, la máquina de Bernoulli girando, el reloj de Sir Mañana, la vela de la Ayudante y el foco del Encadenado.
- **Arreglos visuales:** «Servicios» ya no queda tapado en el Mercader; en los Encuentros el recuadro de información se cierra al elegir la respuesta; el puntaje se separó de los Ergios en la barra superior.

## v0.18.2 · Arreglos a partir de la hoja y la reseña

- **Partidas duplicadas:** al elegir la gravedad, el juego esperaba al servidor sin avisar y cada clic extra creaba otra expedición. Ahora aparece «Abriendo las criptas…» y se ignoran los clics repetidos.
- **Partidas que no quedaban en la hoja:** si el servidor tardaba al iniciar, la partida se jugaba con un id local (`L-…`) y sus avances se perdían. Ahora `updateRun` **crea la fila** si no existe. ⚠️ Requiere pegar el `Code.gs` nuevo y crear una **nueva versión** de la implementación.
- **Penitente:** si tu Bloqueo alcanza para el golpe, se usa el Bloqueo y **no** pierdes rapidez esquivando. La primera vez que lo juegas aparece una explicación corta de cómo acelerar y esquivar.

## v0.18.1 · «¿Más o menos?» reemplaza al Tira y Afloja

- En la Taberna, el **Tira y Afloja** (difícil de entender) se cambió por **«¿Más o menos?»** (`src/data/masmenos.ts`): aparecen dos cosas con su masa y rapidez (una bala, un elefante, Usain Bolt…) y eliges cuál tiene más **energía cinética** (K = ½mv²) o más **cantidad de movimiento** (p = m·v). Cada acierto duplica la apuesta (hasta 5 rondas); puedes retirarte cuando quieras. 4 de cada 10 pares son «tramposos»: uno gana en K y el otro en p. Al responder se muestran las cuentas.
- El Tira y Afloja sigue disponible sólo en el Modo profesor. El encargo «Rey de la taberna» cambió a «Acierta 4 seguidas en ¿Más o menos?».

## Novedades de la v0.18 · Economía y minijuegos

- **Tienda más presente:** cada acto garantiza 2 mercaderes (uno a mitad del camino y otro cerca del jefe), y el mercader ya puede quedar junto a fogatas o ecos. Siempre hay una **oferta del día** (−30 %) y puedes **vender hasta 2 cartas** por visita (común 14 · rara 25 · legendaria 45, +8 si está mejorada). A veces aparece un **Mercader Ambulante** en un encuentro, con precios rebajados.
- **La Taberna del Abismo** (nodo nuevo, 1–2 por acto) con dos minijuegos (`src/scenes/TiroBlanco.ts`, `src/scenes/TiraAfloja.ts`):
  - **Tiro al Blanco:** eliges θ y v₀; el proyectil cae en R = v₀²·sen2θ/g con la gravedad del astro. 3 tiros; hasta 25 Ergios por tiro.
  - **Tira y Afloja de Newton** (estilo Gwent, reglas en `src/data/tira.ts`): apuestas 10/25/50 Ergios y juegas al mejor de 3 rondas con 10 cartas de fuerza en tres filas (Jalón F, Rampa F·cosθ, Polea F×2) y especiales (Lodo, Acción-Reacción, Cuerda Rota, Masa Inamovible). Si ganas, recibes el doble.
- **Tablón de encargos** (`src/data/encargos.ts`): al empezar cada acto eliges un contrato opcional (p. ej. «vence una élite sin perder vida», «gana un duelo en la taberna»). Si lo cumples, te pagan; se ve arriba a la derecha.
- **Modo profesor:** saltos directos a Taberna, Tiro al blanco, Tira y Afloja, Mercader ambulante, Tablón y Vender cartas. Todo se registra en «Eventos» (`minijuego`, `minijuego_fin`, `venta`, `encargo`).

## Novedades de la v0.17 (reseña de un jugador de Slay the Spire)

- **Opciones explicadas antes de elegir:** en dilemas y encuentros, las opciones con ⓘ muestran al pasar el cursor qué es cada carta, efecto, reliquia o familiar que puede salir (p. ej. «Ruido Blanco: carta basura, injugable»).
- **Arcanista más amable al inicio:** empieza cada combate a 4 m/s (antes 3) y su mazo inicial trae 2 Acelerar (antes 1).
- **Consejos para principiantes:** nueva pestaña «Consejos» en el Glosario y un consejo al azar al empezar cada acto. En la **primera expedición** de cada alumno, los combates fáciles de los primeros pisos tienen 30 % menos vida.
- **Jefes que se adaptan:** cada vez que detienes a un jefe (1ª ley), su umbral sube ×1.5 (`UMBRAL_JEFE_MUL` en `src/scenes/Combat.ts`), para que no se pueda dejarlo sin turno todo el combate.

## Novedades de la v0.16

- **AM** (`src/data/am.ts`): una inteligencia artificial atrapada en las criptas (homenaje al cuento de Harlan Ellison; diálogos originales). Aparece rara vez desde el piso 4, **recuerda entre expediciones** (visitas, tu última respuesta, pactos) y te hace una pregunta filosófica sin respuesta correcta (se registra en «Eventos» como `am`). Luego ofrece un **pacto**: resolver por ti tus próximas 3 runas. Si aceptas, aparece el botón «Que AM lo resuelva»: aciertas, pero sin puntos, racha ni Conocimiento, y sube tu Entropía mental (las runas resueltas por AM se registran como `am_runa` y NO cuentan como aciertos del alumno). Si lo rechazas, mejora una carta.
- **Glosario** en el menú (`src/data/glosario.ts`): tipos de ataque, estados (Calor, Resonancia, Fatiga…), efectos y el abismo (Entropía, Necronomicón).
- **Soundtrack** en el menú: se desbloquea al vencer a Hibbelerius; las 13 pistas con su nombre.
- **3 almas en pena nuevas:** Sir Mañana el Procrastinador, la Dama de los Decimales y el Encadenado de la Duda. Las opciones de las almas ahora salen en orden al azar.
- **Familiar nuevo:** Dragón de Carnot (3 de Calor a todos cada turno).
- **7 cartas:** Reacción Normal, Perdigones, (F = m·a)², Descarga Total, Fractura Frágil, Golpe de Gracia y la Palanca de Arquímedes ahora es para todas las clases.
- **Grimorio:** los perfiles de Einstein, Curie y Oppenheimer ya no se enciman; el jefe de cada acto aparece en el Bestiario en cuanto lo ves en el mapa.

## Novedades de la v0.15

- **Portada en alta definición:** la ilustración original se reescaló al doble con una red de superresolución (EDSR) y se limpió el ruido del JPG; ahora se muestra a 1080 px sin verse borrosa.
- **Pergamino de cálculos:** las líneas largas se ajustan al cuadro (letra más chica o «…»). Pasa el cursor por el pergamino para leer los últimos 8 cálculos completos.
- **Cuarto personaje «¿?»:** queda como *Próximamente* para que lo propongan los alumnos.
- **Botón de retroalimentación:** pega la liga de tu formulario en `FORM_URL` (`src/config.ts`) y aparece «✎ Tu opinión» en el menú y «✎ Danos tu opinión» al terminar cada expedición.

## Novedades de la v0.14

- **Tercer personaje: el Penitente del Empuje** (se desbloquea al vencer a Hibbelerius). Su vida es su **masa**: las cartas de Empuje queman kilos y lo aceleran con la ecuación del cohete, **Δv = vₑ·ln(m₀/m₁)** (con poca masa acelera muchísimo más). Golpea con **p = m·v**, no tiene Bloqueo y **esquiva** si va a 6 m/s o más (perdiendo 3 m/s). El aire lo frena 2 m/s por turno y recupera masa al derrotar enemigos. 13 cartas propias en `src/data/cards.ts` (busca «PENITENTE»).
- **8 cartas legendarias** (marco dorado, una copia por expedición): Venganza de Newton, Tiro Parabólico (eliges el ángulo θ y ves el alcance R = v₀²·sen2θ/g), Péndulo, Patinadora, Resorte Comprimido, Dolor Resonante, Honda de David y Fuego Amigo. Se eligen tras vencer al jefe de los Actos I y II, y a veces salen tras una élite.
- **Hibbelerius rediseñado (antes «la Parca del Tomo», hoy «el Autor Eterno»)**: encapuchado, esquelético, flotando, con guadaña y su tomo encadenado; lanza hoces giratorias al atacar (`tools/arte/hib2.py`).

## Novedades de la v0.13 · Horror cósmico

- **Entropía mental** (0–100, el ojo verde arriba a la derecha): sube al empezar combates contra jefes (+8) y élites (+3) y al leer el Necronomicón (+20). Baja al descansar en la fogata (−20), al hablar con los Ecos (−10) y con cada runa bien resuelta (−3).
  - **40+ Inquieto:** las fórmulas de tus cartas se van tapando con símbolos. Nunca se muestran fórmulas incorrectas, sólo borrosas.
  - **70+ Delirante:** «Visión del Abismo», tus ataques hacen +2.
  - **100 Quiebre:** en el siguiente combate aparece una **Sombra del Abismo** que mete Ruido Blanco a tu mazo; después la Entropía baja a 60.
- **El Necronomicón de Hibbeler:** dilema raro en los Actos II y III («El Atril sin Lector»). Con él, en cada fogata puedes **leer un Problema Prohibido** en vez de descansar: 13-∞ (más cartas, menos vida máxima), 14-0 (más energía, Errores de Signo), 15-(−1) Masa Negativa, Ω Universo Cerrado y Mirar de Vuelta. Todos los valores están en `src/data/abismo.ts`.
- **Code.gs:** no cambió en esta versión; las lecturas del Necronomicón y los Quiebres se registran en la hoja «Eventos» como `prohibido` y `quiebre`.

## Novedades de la v0.12

- **Ecos nuevos:** **Nikola Tesla** (rayos que dañan a todos los enemigos), **J. Robert Oppenheimer** (la carta «Trinity», que se usa una sola vez: destruye a todos los enemigos y a los jefes les quita 30–40 % de vida; reacción en cadena; todo con radiación) y **Charles Darwin** (una carta EVOLUCIONA 3 niveles —+2 kg o +3 de Bloqueo por nivel, se marca con ✦— y más vida máxima).
- **Reliquias de jefe:** al vencer al jefe del Acto I y del Acto II eliges 1 de 3: Reactor de Fisión, Agujero Negro de Bolsillo, Tomo Prohibido de Hibbeler, Corazón del Coloso o Volante de Inercia. Son muy fuertes, pero cada una tiene un costo (`src/data/relics.ts`).
- **Almas en pena nuevas:** **Sir Radián, el Mal Configurado** (su calculadora está en RAD: a veces pega fuerte, a veces te da Bloqueo, a veces «Math ERROR») y **el Doctorando Eterno** (pone Fatiga a todos los enemigos).
- **Enemigos con 20 % más de vida** (`VIDA_ENEMIGOS` en `src/data/enemies.ts`).
- **Mapas más variados:** nunca hay dos lugares de descanso seguidos (ecos, fogatas o mercaderes) y cada mapa tiene un tope al azar de cada uno (2–3).

## Novedades de la v0.11

- **Puntaje estilo arcade** (`src/data/puntaje.ts`): cada enemigo vale su vida máxima × 10 (×1.5 élite, ×2 jefe); combate sin perder vida +500 (élite/jefe +1,000); runa correcta +300 con **racha** de hasta ×2; pista −100; acto superado +2,000 × acto; vencer a Hibbelerius +10,000. Al terminar: +20 por vida restante, +3,000 si no usaste la Vida Extra, +200 por poción y +5 por Ergio. Todo ×gravedad. En la pantalla final, pasa el cursor sobre el puntaje para ver el desglose.
- **El profe de mal humor** (5 % de los encuentros, una vez por expedición, nunca si ya viste al profe amable): te avienta el Hibbeler y pierdes la mitad de la vida. Si contestas bien: +60 Ergios y +8 de vida; si fallas: 2 «Tarea Pendiente».
- **Almas en pena** (`src/data/almas.ts`): Ícaro el Recursador, la Ayudante Sin Nombre y Sir Bernoulli el Errante. Si les ayudas o contestas su pregunta con compasión, se vuelven tu **aliado** y pelean a tu lado en élites y jefes. Sólo un aliado por expedición.
- **Música de Hibbelerius** más lenta y oscura (bajo distorsionado, campana con tritono).
- **Tiempo jugado total** en el menú.

