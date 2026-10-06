// ════════════════════════════════════════════════════════════════
//  FIGURAS HISTÓRICAS ("Ecos del Pasado") Y SUS DONES
//  Al llegar a un santuario aparece una figura. Si respondes bien su
//  pregunta, sus dones son ÉPICOS (nivel 2); si no, COMUNES (nivel 1).
//  Los dones duran toda la expedición.
//  Los diálogos son ficción del juego, no citas textuales.
// ════════════════════════════════════════════════════════════════

export interface BoonDef {
  id: string;
  figure: string;
  name: string;
  icon: string;
  text: [string, string]; // [común, épico]
  lore: string;
}

export interface FigureDef {
  id: string;
  name: string;
  years: string;
  epithet: string;
  sprite: string;
  intro: string;
  farewell: string;
  concepts: string[]; // temas de su pregunta (ver "concept" en src/data/runes.ts)
  boons: string[];
}

export const BOONS: Record<string, BoonDef> = {
  // ── Isaac Newton ──
  n_principia: {
    id: 'n_principia', figure: 'newton', name: 'Principia', icon: 'i_gaunt',
    text: ['+1 m/s² a todos tus ataques.', '+2 m/s² a todos tus ataques.'],
    lore: 'ΣF = m·a: con la misma masa, más aceleración es más fuerza.',
  },
  n_manzana: {
    id: 'n_manzana', figure: 'newton', name: 'La Manzana', icon: 'i_apple',
    text: ['Al iniciar cada combate cae una manzana de 1 kg sobre cada enemigo: W = m·g ≈ 10 N.', 'Cae una de 2 kg: W = m·g ≈ 20 N a cada enemigo.'],
    lore: 'El peso es la fuerza de gravedad: W = m·g.',
  },
  n_reaccion: {
    id: 'n_reaccion', figure: 'newton', name: 'Acción y Reacción', icon: 'i_reflect',
    text: ['Cuando bloqueas por completo un golpe, el atacante recibe 3 N.', 'El atacante recibe 6 N.'],
    lore: 'Tercera ley: las fuerzas siempre aparecen en pares iguales y opuestos.',
  },
  // ── Galileo Galilei ──
  g_plano: {
    id: 'g_plano', figure: 'galileo', name: 'Plano Inclinado', icon: 'i_angle',
    text: ['Tu primer ataque de cada turno gana +2 m/s².', 'Tu primer ataque de cada turno gana +4 m/s².'],
    lore: 'En un plano inclinado, la componente del peso g·sinθ acelera los cuerpos.',
  },
  g_caida: {
    id: 'g_caida', figure: 'galileo', name: 'Caída Libre', icon: 'i_feather',
    text: ['Robas 1 carta más en tu primer turno de cada combate.', 'Robas 2 cartas más en tu primer turno.'],
    lore: 'Sin aire, todos los cuerpos caen con la misma aceleración.',
  },
  g_pendulo: {
    id: 'g_pendulo', figure: 'galileo', name: 'Péndulo Isócrono', icon: 'i_pend',
    text: ['Cada 3 turnos ganas +1 J.', 'Cada 2 turnos ganas +1 J.'],
    lore: 'El periodo de un péndulo casi no depende de qué tanto oscile.',
  },
  // ── Émilie du Châtelet ──
  c_visviva: {
    id: 'c_visviva', figure: 'chatelet', name: 'Vis Viva', icon: 'i_wind',
    text: ['Carrera y Segunda Ley dan +1 m/s² adicional.', 'Carrera y Segunda Ley dan +2 m/s² adicionales.'],
    lore: 'La "fuerza viva" crece con el cuadrado de la rapidez: K = ½·m·v².',
  },
  c_conserva: {
    id: 'c_conserva', figure: 'chatelet', name: 'Conservación', icon: 'i_heart',
    text: ['Al ganar un combate recuperas 5 de vida.', 'Al ganar un combate recuperas 10 de vida.'],
    lore: 'La energía no se crea ni se destruye: se transforma.',
  },
  c_traductora: {
    id: 'c_traductora', figure: 'chatelet', name: 'Traductora de los Principia', icon: 'i_rune',
    text: ['Cada problema que resuelves bien te da +15 Ergios.', 'Cada problema bien resuelto te da +30 Ergios.'],
    lore: 'Entender a fondo una teoría también es un acto de creación.',
  },
  // ── James Prescott Joule ──
  j_equivalente: {
    id: 'j_equivalente', figure: 'joule', name: 'Equivalente Mecánico', icon: 'i_bolt',
    text: ['+1 J en tu primer turno de cada combate.', '+1 J en tus turnos 1, 3 y 5.'],
    lore: 'Trabajo y calor son formas de la misma energía, medida en joules.',
  },
  j_calor: {
    id: 'j_calor', figure: 'joule', name: 'Calor por Fricción', icon: 'i_fire',
    text: ['Cada vez que te aplican Fricción, ganas 4 de Bloqueo.', 'Cada vez que te aplican Fricción, ganas 8 de Bloqueo.'],
    lore: 'La fricción convierte energía mecánica en calor.',
  },
  j_trabajo: {
    id: 'j_trabajo', figure: 'joule', name: 'Trabajo Acumulado', icon: 'i_shield',
    text: ['Empiezas cada combate con 5 de Bloqueo.', 'Empiezas cada combate con 10 de Bloqueo.'],
    lore: 'El trabajo realizado sobre un sistema se queda en él como energía.',
  },
  // ── Albert Einstein (dones poderosos con RADIACIÓN: daño que ignora tu Bloqueo) ──
  e_mc2: {
    id: 'e_mc2', figure: 'einstein', name: 'E = mc²', icon: 'i_rad',
    text: ['+1 J al inicio de cada turno.\nRadiación: pierdes 2 de vida cada turno.', '+1 J al inicio de cada turno.\nRadiación: pierdes 1 de vida cada turno.'],
    lore: 'Una masa diminuta equivale a una energía enorme. Esa energía también te quema.',
  },
  e_marco: {
    id: 'e_marco', figure: 'einstein', name: 'Marco de Referencia', icon: 'i_crystal',
    text: ['El primer golpe que recibes en cada combate no te afecta.\nRadiación: pierdes 4 de vida al iniciar cada combate.', 'Los 2 primeros golpes de cada combate no te afectan.\nRadiación: pierdes 3 de vida al iniciar cada combate.'],
    lore: 'El movimiento depende de quién lo observa. En tu marco de referencia, ese golpe nunca llegó.',
  },
  e_foton: {
    id: 'e_foton', figure: 'einstein', name: 'Efecto Fotoeléctrico', icon: 'i_bolt',
    text: ['Cada Habilidad que juegas lanza un fotón: 4 de daño a un enemigo al azar.\nRadiación: 1 de daño por fotón.', 'Cada fotón hace 7 de daño.\nRadiación: 1 de daño por fotón.'],
    lore: 'La luz llega en paquetes de energía E = h·f que pueden arrancar electrones. (Premio Nobel de 1921.)',
  },
  // ── Marie Curie ──
  m_radio: {
    id: 'm_radio', figure: 'curie', name: 'Radio', icon: 'i_fire',
    text: ['Al iniciar cada combate, todos los enemigos reciben 4 de Calor.\nRadiación: tú recibes 2 de Calor.', 'Los enemigos reciben 7 de Calor.\nRadiación: tú recibes 1 de Calor.'],
    lore: 'El radio emite energía sin parar: un gramo calienta su entorno por siglos.',
  },
  m_polonio: {
    id: 'm_polonio', figure: 'curie', name: 'Polonio', icon: 'i_skull',
    text: ['Tus ataques infligen +3 de daño.\nRadiación: cada carta de ataque te hace 1 de daño.', 'Tus ataques infligen +5 de daño.\nRadiación: cada carta de ataque te hace 1 de daño.'],
    lore: 'Curie lo nombró por Polonia, su país. Es tan radiactivo que brilla en la oscuridad.',
  },
  m_vidamedia: {
    id: 'm_vidamedia', figure: 'curie', name: 'Vida Media', icon: 'i_heart',
    text: ['Al ganar un combate, +2 de Vida máxima.\nRadiación: pierdes 3 de vida al iniciar cada combate.', 'Al ganar un combate, +3 de Vida máxima.\nRadiación: pierdes 2 de vida al iniciar cada combate.'],
    lore: 'En cada vida media decae la mitad de los núcleos. Lo que hoy te desgasta, mañana te hace más resistente.',
  },
  // ── Christiaan Huygens ──
  h_reloj: {
    id: 'h_reloj', figure: 'huygens', name: 'Reloj de Péndulo', icon: 'i_pend',
    text: ['En tus turnos pares robas 1 carta más.', 'Desde tu segundo turno robas 1 carta más cada turno.'],
    lore: 'Huygens inventó el reloj de péndulo: un ritmo regular y preciso, como tu mano de cartas.',
  },
  h_elastico: {
    id: 'h_elastico', figure: 'huygens', name: 'Choque Elástico', icon: 'i_reflect',
    text: ['Cuando tu Bloqueo absorbe por completo un golpe, recuperas 2 de vida.', 'Recuperas 4 de vida.'],
    lore: 'Huygens describió los choques elásticos: si nada se deforma, la energía cinética no se pierde.',
  },
  h_centripeta: {
    id: 'h_centripeta', figure: 'huygens', name: 'Fuerza Centrípeta', icon: 'i_wind',
    text: ['Tu primer ataque de cada combate inflige +6 de daño.', 'Tu primer ataque de cada combate inflige +12 de daño.'],
    lore: 'Al girar, a = v²/r: Huygens fue de los primeros en calcularlo. Gira antes de golpear.',
  },
  // ── Robert Hooke ──
  k_resorte: {
    id: 'k_resorte', figure: 'hooke', name: 'Ut tensio, sic vis', icon: 'i_pend',
    text: ['Al inicio de cada turno ganas 2 de Bloqueo.', 'Al inicio de cada turno ganas 4 de Bloqueo.'],
    lore: '«Como la extensión, así la fuerza»: F = k·x. Un resorte siempre empuja de vuelta.',
  },
  k_retorno: {
    id: 'k_retorno', figure: 'hooke', name: 'Retorno Elástico', icon: 'i_reflect',
    text: ['El primer golpe que te hace daño en cada combate regresa a la mitad al atacante.', 'Regresa completo al atacante.'],
    lore: 'Lo que deforma un material elástico, el material lo devuelve al recuperar su forma.',
  },
  k_micro: {
    id: 'k_micro', figure: 'hooke', name: 'Micrographia', icon: 'i_crystal',
    text: ['Cada enemigo empieza el combate con 1 de Fatiga (+50 % de daño).', 'Cada enemigo empieza con 2 de Fatiga.'],
    lore: 'Hooke vio con el microscopio las celdas y grietas de los materiales. Ahora tú también ves sus puntos débiles.',
  },
  // ── Emmy Noether ──
  y_tiempo: {
    id: 'y_tiempo', figure: 'noether', name: 'Simetría en el Tiempo', icon: 'i_bolt',
    text: ['Hasta 1 J que no gastes en un turno pasa al siguiente.', 'Hasta 2 J que no gastes pasan al siguiente.'],
    lore: 'Teorema de Noether: si las leyes no cambian con el tiempo, la ENERGÍA se conserva.',
  },
  y_espacio: {
    id: 'y_espacio', figure: 'noether', name: 'Simetría en el Espacio', icon: 'i_momentum',
    text: ['Cuando matas a un enemigo, el daño sobrante pasa a otro enemigo.', 'El daño sobrante pasa ×1.5 a otro enemigo.'],
    lore: 'Si las leyes son iguales en todo lugar, la CANTIDAD DE MOVIMIENTO se conserva: nada se pierde, se transfiere.',
  },
  y_rotacion: {
    id: 'y_rotacion', figure: 'noether', name: 'Simetría de Rotación', icon: 'i_pend',
    text: ['Cada 3 cartas que juegues en un turno, robas 1.', 'Cada 2 cartas que juegues en un turno, robas 1.'],
    lore: 'Si las leyes son iguales en toda dirección, la CANTIDAD DE MOVIMIENTO ANGULAR se conserva.',
  },
  // ── Gaspard-Gustave Coriolis ──
  co_travail: {
    id: 'co_travail', figure: 'coriolis', name: 'Travail', icon: 'i_anvil',
    text: ['Cada ataque inflige +1 por cada ataque que ya jugaste este turno.', 'Cada ataque inflige +2 por cada ataque que ya jugaste este turno.'],
    lore: 'Coriolis bautizó el «trabajo» (travail): el esfuerzo se acumula, golpe tras golpe.',
  },
  co_medio: {
    id: 'co_medio', figure: 'coriolis', name: 'El ½ de ½mv²', icon: 'i_mass',
    text: ['Caballero: +1 kg a tus ataques. Arcanista: empiezas cada combate con +1 m/s.', 'Caballero: +2 kg. Arcanista: +2 m/s.'],
    lore: 'Coriolis puso el ½ en la energía cinética para que trabajo y energía cuadraran: W = ΔK = ½mv₂² − ½mv₁².',
  },
  co_desvio: {
    id: 'co_desvio', figure: 'coriolis', name: 'Efecto Coriolis', icon: 'i_wind',
    text: ['El primer golpe enemigo de cada turno se desvía: recibes 3 menos.', 'Recibes 5 menos.'],
    lore: 'En un marco que gira, lo que se mueve parece desviarse. Los golpes, también.',
  },
  // ── Nikola Tesla: electricidad que salta a TODOS los enemigos ──
  t_bobina: {
    id: 't_bobina', figure: 'tesla', name: 'Bobina de Tesla', icon: 'i_bolt',
    text: ['Cada carta de Ataque suelta un arco eléctrico: 2 de daño a todos los enemigos.', 'Cada arco hace 4 de daño a todos los enemigos.'],
    lore: 'Un transformador resonante: millones de volts saltando por el aire.',
  },
  t_alterna: {
    id: 't_alterna', figure: 'tesla', name: 'Corriente Alterna', icon: 'i_pend',
    text: ['Al inicio de tus turnos impares, un rayo hace 4 de daño a todos los enemigos.', 'Al inicio de CADA turno, un rayo hace 4 de daño a todos los enemigos.'],
    lore: 'La corriente cambia de sentido 60 veces por segundo.',
  },
  t_torre: {
    id: 't_torre', figure: 'tesla', name: 'Torre Wardenclyffe', icon: 'i_crystal',
    text: ['Al iniciar cada combate, 8 de daño a todos los enemigos.', 'Al iniciar cada combate, 14 de daño a todos los enemigos.'],
    lore: 'Iba a transmitir energía sin cables. Nunca se terminó.',
  },
  // ── J. Robert Oppenheimer (dones enormes con RADIACIÓN) ──
  o_trinity: {
    id: 'o_trinity', figure: 'oppenheimer', name: 'Trinity', icon: 'i_rad',
    text: ['Recibes la carta «Trinity»: destruye a todos los enemigos (jefes: −30 %). Un solo uso.\nRadiación: 10 al usarla.', 'Recibes «Trinity+» (jefes: −40 %). Un solo uso.\nRadiación: 10 al usarla.'],
    lore: '«Ahora me he convertido en la Muerte, el destructor de mundos.» Él mismo citó el Bhagavad Gita al recordar la prueba.',
  },
  o_cadena: {
    id: 'o_cadena', figure: 'oppenheimer', name: 'Reacción en Cadena', icon: 'i_fire',
    text: ['Cuando un enemigo muere, libera energía: 5 de daño a los demás.\nRadiación: pierdes 1 de vida por cada explosión.', 'Cada muerte hace 9 de daño a los demás.\nRadiación: pierdes 1 de vida por cada explosión.'],
    lore: 'Cada fisión libera neutrones que provocan más fisiones: la masa crítica.',
  },
  o_manhattan: {
    id: 'o_manhattan', figure: 'oppenheimer', name: 'Proyecto Manhattan', icon: 'i_bolt',
    text: ['+1 J y +1 carta en tu primer turno de cada combate.\nRadiación: pierdes 3 de vida al iniciar cada combate.', '+2 J y +1 carta en tu primer turno.\nRadiación: pierdes 2 de vida al iniciar cada combate.'],
    lore: 'Miles de científicos en Los Álamos, trabajando contra reloj en secreto.',
  },
  // ── Charles Darwin: adaptarse para sobrevivir ──
  d_seleccion: {
    id: 'd_seleccion', figure: 'darwin', name: 'Selección Natural', icon: 'i_heart',
    text: ['Una carta de ataque o defensa EVOLUCIONA 3 niveles. +5 Vida máxima.', 'Evoluciona 3 niveles y además se mejora. +10 Vida máxima.'],
    lore: 'Sobrevive el que mejor se adapta, no el más fuerte.',
  },
  d_adaptacion: {
    id: 'd_adaptacion', figure: 'darwin', name: 'Adaptación', icon: 'i_shield',
    text: ['+12 Vida máxima (y te cura 12).', '+20 Vida máxima (y te cura 20).'],
    lore: 'Pinzones de Galápagos: un pico distinto para cada comida.',
  },
  d_apto: {
    id: 'd_apto', figure: 'darwin', name: 'El Más Apto', icon: 'i_apple',
    text: ['Si ganas un combate con menos de la mitad de tu vida, +3 Vida máxima.', 'Si ganas con menos de la mitad de tu vida, +5 Vida máxima.'],
    lore: 'Lo que no te elimina te deja mejor adaptado.',
  },
};

/** Dones con efecto secundario de radiación (se marcan en verde en el santuario) */
export const RADIOACTIVE = ['e_mc2', 'e_marco', 'e_foton', 'm_radio', 'm_polonio', 'm_vidamedia'];

export const FIGURES: FigureDef[] = [
  {
    id: 'newton', name: 'Isaac Newton', years: '1643–1727', epithet: 'El Señor de las Tres Leyes', sprite: 'fig_newton',
    intro: '«Tres leyes bastan para mover los astros, joven caballero.\nDemuéstrame que comprendes al menos una y te prestaré mi fuerza.»',
    farewell: '«Si llegas lejos, será sobre hombros de gigantes. Ve.»',
    concepts: ['1a ley', '2a ley', '3a ley', 'Peso'],
    boons: ['n_principia', 'n_manzana', 'n_reaccion'],
  },
  {
    id: 'galileo', name: 'Galileo Galilei', years: '1564–1642', epithet: 'El Observador de la Caída', sprite: 'fig_galileo',
    intro: '«Medí cómo ruedan las esferas por una rampa y cómo oscila una lámpara.\nResponde mi pregunta y caerás con más gracia que ellas.»',
    farewell: '«Y sin embargo, se mueve. Sigue adelante.»',
    concepts: ['Plano inclinado', 'Conservacion', '2a ley (sistemas)'],
    boons: ['g_plano', 'g_caida', 'g_pendulo'],
  },
  {
    id: 'chatelet', name: 'Émilie du Châtelet', years: '1706–1749', epithet: 'La Guardiana de la Vis Viva', sprite: 'fig_chatelet',
    intro: '«Traduje los Principia y defendí que la energía crece con el cuadrado de la rapidez.\n¿Sabes por qué eso importa? Contesta y te lo mostraré.»',
    farewell: '«Nada se pierde; todo se transforma. Tú también.»',
    concepts: ['Energia cinetica', 'Trabajo-energia'],
    boons: ['c_visviva', 'c_conserva', 'c_traductora'],
  },
  {
    id: 'joule', name: 'James Prescott Joule', years: '1818–1889', epithet: 'El Medidor del Calor', sprite: 'fig_joule',
    intro: '«El trabajo y el calor son la misma moneda con distinta cara.\nMide con cuidado, viajero, y te daré energía para el camino.»',
    farewell: '«Cada joule cuenta. No los desperdicies.»',
    concepts: ['Trabajo', 'Energia potencial', 'Friccion'],
    boons: ['j_equivalente', 'j_calor', 'j_trabajo'],
  },
  {
    id: 'einstein', name: 'Albert Einstein', years: '1879–1955', epithet: 'El Relojero de la Relatividad', sprite: 'fig_einstein',
    intro: '«Masa y energía son lo mismo, viajero; sólo cambia el tipo de cambio: c².\nMis dones son poderosos, pero todo poder tiene un costo. ¿Te atreves?»',
    farewell: '«La imaginación es más importante que el conocimiento… pero no te olvides de las unidades.»',
    concepts: ['Energia cinetica', 'Conservacion', 'Trabajo-energia'],
    boons: ['e_mc2', 'e_marco', 'e_foton'],
  },
  {
    id: 'curie', name: 'Marie Curie', years: '1867–1934', epithet: 'La Dama del Radio', sprite: 'fig_curie',
    intro: '«Descubrí dos elementos y gané dos premios Nobel. Mis cuadernos todavía brillan.\nLo que te ofrezco es energía pura… y la energía pura deja huella.»',
    farewell: '«En la vida no hay que temer nada, sólo comprenderlo. Ahora, sigue.»',
    concepts: ['Energia potencial', 'Trabajo', 'Conservacion'],
    boons: ['m_radio', 'm_polonio', 'm_vidamedia'],
  },
  {
    id: 'huygens', name: 'Christiaan Huygens', years: '1629–1695', epithet: 'El Relojero de los Choques', sprite: 'fig_huygens',
    intro: '«Medí el tiempo con un péndulo y descubrí qué se conserva cuando dos esferas chocan.\nResponde, y tu ritmo será tan preciso como mis relojes.»',
    farewell: '«Que tus choques sean elásticos y tus péndulos, isócronos.»',
    concepts: ['Choques', 'Cantidad de movimiento', 'Conservacion'],
    boons: ['h_reloj', 'h_elastico', 'h_centripeta'],
  },
  {
    id: 'hooke', name: 'Robert Hooke', years: '1635–1703', epithet: 'El Maestro de los Resortes', sprite: 'fig_hooke',
    intro: '«No queda ningún retrato mío, viajero; sólo mis resortes y mis dibujos al microscopio.\nResponde y te prestaré su elasticidad.»',
    farewell: '«Cede como el resorte… y regresa con fuerza.»',
    concepts: ['Energia potencial', 'Trabajo', '2a ley'],
    boons: ['k_resorte', 'k_retorno', 'k_micro'],
  },
  {
    id: 'noether', name: 'Emmy Noether', years: '1882–1935', epithet: 'La Guardiana de las Simetrías', sprite: 'fig_noether',
    intro: '«Toda simetría de la naturaleza esconde algo que se conserva: el tiempo, la energía; el espacio, el momento.\nDemuéstrame que entiendes qué se conserva.»',
    farewell: '«Busca la simetría y encontrarás la ley.»',
    concepts: ['Conservacion', 'Cantidad de movimiento', 'Impulso angular'],
    boons: ['y_tiempo', 'y_espacio', 'y_rotacion'],
  },
  {
    id: 'coriolis', name: 'Gaspard-Gustave Coriolis', years: '1792–1843', epithet: 'El que Nombró al Trabajo', sprite: 'fig_coriolis',
    intro: '«Yo le puse nombre al trabajo y el ½ a la energía cinética.\nSi sabes cuánto trabajo cuesta mover algo, te enseñaré a desviar los golpes.»',
    farewell: '«W = ΔK. No lo olvides en el examen.»',
    concepts: ['Trabajo', 'Trabajo-energia', 'Energia cinetica'],
    boons: ['co_travail', 'co_medio', 'co_desvio'],
  },
  {
    id: 'tesla', name: 'Nikola Tesla', years: '1856–1943', epithet: 'El Señor del Rayo', sprite: 'fig_tesla',
    intro: '«Si quieres entender el universo, piensa en energía, frecuencia y vibración.\nResponde bien y mis rayos caerán sobre todos tus enemigos a la vez.»',
    farewell: '«El presente es de ellos; el futuro, por el que tanto trabajé, es mío.»',
    concepts: ['Potencia', 'Trabajo', 'Energia cinetica'],
    boons: ['t_bobina', 't_alterna', 't_torre'],
  },
  {
    id: 'oppenheimer', name: 'J. Robert Oppenheimer', years: '1904–1967', epithet: 'El Destructor de Mundos', sprite: 'fig_oppenheimer',
    intro: '«Dirigí a los que liberaron la energía del núcleo. Funcionó… y desde entonces cargo con ello.\nTe daré ese poder, viajero. Úsalo una vez, y úsalo bien.»',
    farewell: '«Los físicos conocimos el pecado. Que tú conozcas también la responsabilidad.»',
    concepts: ['Conservacion', 'Energia cinetica', 'Trabajo-energia'],
    boons: ['o_trinity', 'o_cadena', 'o_manhattan'],
  },
  {
    id: 'darwin', name: 'Charles Darwin', years: '1809–1882', epithet: 'El Naturalista del Beagle', sprite: 'fig_darwin',
    intro: '«No soy físico, viajero, pero cinco años en el Beagle me enseñaron que todo cambia… poco a poco.\nResponde, y tus cartas evolucionarán.»',
    farewell: '«Hay grandeza en esta visión de la vida. Sigue adaptándote.»',
    concepts: ['Energia potencial', 'Peso', '2a ley'],
    boons: ['d_seleccion', 'd_adaptacion', 'd_apto'],
  },
];
