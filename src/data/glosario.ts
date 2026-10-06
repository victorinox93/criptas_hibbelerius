// ════════════════════════════════════════════════════════════════
//  GLOSARIO (Menú → Glosario): qué significa cada mecánica del juego.
//  Cada pestaña es una lista de [ícono, título, explicación].
//  Para agregar una entrada, copia una línea y cambia el texto.
// ════════════════════════════════════════════════════════════════

export type Entrada = [string, string, string];

/** Consejos para quien nunca ha jugado un «roguelike» de cartas (también salen al empezar cada acto) */
export const CONSEJOS: Entrada[] = [
  ['i_heart', 'Cuida tu vida', 'No sabes cuándo encontrarás una fogata. Un poco de Bloqueo a tiempo vale más que un golpe extra.'],
  ['i_skull', 'Si tu vida llega a 0…', '…la expedición termina y empiezas desde el principio. Pero conservas lo que aprendiste: Conocimiento, Grimorio y desbloqueos.'],
  ['i_crystal', 'Busca sinergias', 'Elige cartas que se ayuden entre sí: masa con aceleración, Calor con golpes a todos, rapidez con ½mv².'],
  ['i_book', 'Puedes saltarte una carta', 'Si ninguna de las tres le sirve a tu estrategia, «Omitir» es una buena decisión: un mazo grande roba menos tus mejores cartas.'],
  ['i_coin', 'Quitar cartas también suma', 'Olvidar cartas débiles con el Mercader hace que tus cartas fuertes salgan más seguido.'],
  ['i_event', 'Planea tu camino', 'Mira el mapa antes de avanzar: ¿necesitas una fogata? ¿te sientes fuerte para una élite? Cada ruta tiene otro riesgo.'],
  ['i_rune', 'Las runas te hacen fuerte', 'Cada respuesta correcta da recompensas y racha. Si dudas, la pista cuesta Ergios pero te acerca a la respuesta.'],
  ['i_momentum', 'Pasa el cursor sobre todo', 'Cartas, enemigos, estados y opciones muestran qué hacen y la física detrás. Leer con calma es tu mejor arma.'],
];

export const GLOSARIO: { tab: string; items: Entrada[] }[] = [
  { tab: 'Consejos', items: CONSEJOS },
  {
    tab: 'Ataques',
    items: [
      ['i_combat', 'Fuerza · F = m·a', 'Caballero: el daño es la masa del arma por su aceleración. Forja Pesada suma kg; Carrera suma m/s².'],
      ['i_momentum', 'Energía cinética · K = ½·m·v²', 'Arcanista: el daño crece con el CUADRADO de la rapidez. Duplicar v cuadruplica el daño.'],
      ['i_fire', 'Cantidad de movimiento · p = m·v', 'Penitente: golpea con su rapidez. Gana rapidez quemando su propia masa: Δv = vₑ·ln(m₀/m₁).'],
      ['i_mass', 'Peso · W = m·g', 'Peso Muerto y La Manzana usan la gravedad del astro: en Júpiter pegan 2.5 veces más. Ignoran el Bloqueo.'],
      ['i_angle', 'Componentes · F·cosθ', 'Tajo Angulado: con θ = 0° toda la fuerza va a un enemigo; con 60° la mitad le llega a todos.'],
      ['i_angle', 'Proyectiles · R = v₀²·sen2θ/g', 'Tiro Parabólico: el ángulo decide dónde cae. 30° y 60° llegan igual de lejos; 45° es el máximo alcance.'],
      ['i_wind', 'Golpes a todos', 'Algunas cartas pegan a todos los enemigos (Ráfaga, Estela de Plasma, Bobina de Tesla…). Suelen hacer menos daño por enemigo.'],
      ['i_crystal', 'Ignora el Bloqueo', 'Calor, Resonancia, radiación y algunos ataques (Tiro Parabólico, Efecto Túnel) atraviesan el Bloqueo.'],
    ],
  },
  {
    tab: 'Estados',
    items: [
      ['i_shield', 'Bloqueo', 'Absorbe daño antes que tu vida. Se pierde al empezar tu turno (salvo Inercia Defensiva o el Cristal Inercial).'],
      ['i_stun', 'Inercia y umbral (1ª ley)', 'Élites y jefes acumulan inercia y su golpe crece. Un SOLO golpe con F ≥ umbral los detiene.'],
      ['i_fire', 'Calor', 'Quien lo tiene pierde esa vida al inicio de su turno y luego baja 1. Ignora el Bloqueo.'],
      ['i_wind', 'Resonancia', 'Cada carga acerca al enemigo a vibrar a su frecuencia natural: con 3 cargas recibe 12 de daño. Dolor Resonante las detona todas.'],
      ['i_anvil', 'Fatiga del material', 'El enemigo recibe +50 % de daño mientras dure: su estructura ya no aguanta igual.'],
      ['i_mud', 'Fricción', 'El lodo resta m/s² a tus ataques (al Arcanista y al Penitente les quita rapidez). Baja 1 por turno.'],
      ['i_pend', 'Impulso acumulado', 'Algunos enemigos cargan energía elástica o impulso y la sueltan de golpe. ¡Detenlos antes!'],
      ['i_momentum', 'Esquiva (Penitente)', 'Si vas a 6 m/s o más, el siguiente golpe no te alcanza, pero pierdes 3 m/s.'],
    ],
  },
  {
    tab: 'Efectos',
    items: [
      ['i_event', 'Bendiciones y maldiciones', 'Efectos que duran algunos combates (los ves arriba a la derecha). Salen de encuentros y dilemas.'],
      ['i_rad', 'Radiación', 'Daño que ignora tu Bloqueo. Es el precio de los dones de Einstein, Curie y Oppenheimer, y de algunas reliquias.'],
      ['i_fog', 'Condición del piso', 'A veces un combate trae viento, niebla, lodo o una anomalía gravitatoria que cambia las reglas.'],
      ['i_paw', 'Familiares', 'Criaturas que pelean a tu lado unos combates: gato, lechuza, salamandra, tortuga, cuervo y dragón.'],
      ['i_shrine', 'Ecos del Pasado', 'Figuras históricas que te dan dones para toda la expedición. Si respondes bien, el don es épico.'],
      ['i_heart', 'Almas en pena', 'Personajes con historias tristes. Si les ayudas o contestas con compasión, uno pelea contigo en élites y jefes (sólo uno por expedición).'],
      ['i_coin', 'Pociones', 'Hasta 3 frascos arriba de la pantalla. Haz clic para usarlos o tirarlos.'],
      ['i_book', 'Reliquias de jefe y legendarias', 'Tras vencer a un jefe eliges una reliquia poderosa (con costo) y una carta legendaria (una copia por expedición).'],
    ],
  },
  {
    tab: 'Abismo',
    items: [
      ['i_ojo', 'Entropía mental', 'Tu cordura (0–100). Sube al ver jefes y leer el Necronomicón; baja al descansar, con los Ecos y al resolver runas.'],
      ['i_ojo', '40+ Inquieto', 'Las fórmulas de tus cartas se borran con símbolos (nunca muestran algo falso). Oyes susurros.'],
      ['i_ojo', '70+ Delirante', 'Visión del Abismo: tus ataques hacen +2.'],
      ['i_skull', '100 Quiebre', 'En el siguiente combate aparece una Sombra del Abismo que sólo tú ves. Luego la Entropía baja a 60.'],
      ['i_necro', 'Necronomicón de Hibbeler', 'En cada fogata puedes leer un Problema Prohibido: un poder para siempre con un costo para siempre.'],
      ['i_bolt', 'Joules (J)', 'Tu energía por turno: cada carta cuesta trabajo. Empiezas cada turno con 3 J.'],
      ['i_rune', 'Racha y puntaje', 'Cada respuesta correcta seguida sube el multiplicador hasta ×2. Fallar lo reinicia; usar una pista resta puntos.'],
      ['i_crystal', 'Conocimiento', 'Lo ganas en cada expedición. Sube de nivel y desbloquea cartas, pociones y cosméticos.'],
    ],
  },
];
