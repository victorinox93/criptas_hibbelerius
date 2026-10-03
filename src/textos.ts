// ════════════════════════════════════════════════════════════════
//  TEXTOS DEL JUEGO
//  Edita aquí cualquier palabra o frase que veas en pantalla.
//  Cartas → src/data/cards.ts · Enemigos → src/data/enemies.ts
//  Reliquias → src/data/relics.ts · Problemas → src/data/runes.ts
//  Encuentros con personajes → src/data/events.ts
// ════════════════════════════════════════════════════════════════

export const T = {
  titulo: 'Las Criptas de Hibbelerius',
  subtitulo: 'Un roguelike de Dinámica · Leyes de Newton y Energía',
  moneda: 'Ergios', // moneda del juego (el ergio es una unidad de energía)

  login: {
    entrar: 'Entrar',
    crear: 'Crear cuenta',
    matricula: 'Matrícula',
    matriculaOffline: 'Matrícula (o un alias)',
    contrasena: 'Contraseña',
    confirmar: 'Confirmar contraseña',
    grupo: 'Clave de grupo (te la da tu profesor)',
    botonEntrar: 'Entrar a las criptas',
    botonCrear: 'Crear mi cuenta',
    botonJugar: 'Jugar',
    consultando: 'Consultando el grimorio…',
    notaOffline: 'Modo sin conexión: tu progreso se guarda sólo en este navegador\ny no se reporta al profesor.',
    errMatricula: 'Matrícula inválida (3–12 letras o números).',
    errContrasena: 'La contraseña debe tener al menos 6 caracteres.',
    errNoCoinciden: 'Las contraseñas no coinciden.',
    errGrupo: 'Escribe la clave de grupo.',
  },

  avatar: {
    titulo: 'Forja tu héroe',
    nombre: 'Nombre de tu héroe',
    yelmo: 'Yelmo',
    capa: 'Capa',
    armadura: 'Armadura',
    visor: 'Brillo del visor',
    clase: 'Elige tu clase',
    proximamente: 'Próximamente',
    forjar: 'Forjar héroe',
    errNombre: 'Ponle nombre a tu héroe (mín. 2 letras).',
  },

  menu: {
    lugar: 'El Umbral de las Criptas',
    continuar: 'Continuar expedición',
    nueva: 'Nueva expedición',
    comenzar: 'Comenzar expedición',
    ayuda: 'Cómo se juega',
    editar: 'Editar héroe',
    salir: 'Cerrar sesión',
    conectado: 'Conectado · Grupo',
    desconectado: 'Sin conexión (no se reporta)',
    grimorio: 'Grimorio',
    ranking: 'Ranking',
    creditos: 'Créditos',
    gravedad: 'Elige la gravedad',
    gravedadInfo: 'Más gravedad: enemigos más duros y más puntaje. Peso Muerto usa la g del astro.',
    gravedadBloqueada: 'Vence al Coloso en el nivel anterior para desbloquear.',
    cancelar: 'Cancelar',
    mejorGravedad: 'Gravedad vencida',
    ninguna: 'ninguna aún',
  },

  grimorio: {
    titulo: 'Grimorio',
    tabs: ['Bestiario', 'Personajes', 'Figuras', 'Cartas', 'Reliquias y dones'],
    descubiertos: 'Descubiertos',
    bloqueado: 'Aún no lo descubres.\nSigue explorando las criptas.',
    volver: 'Volver',
    masa: 'Masa',
    peso: 'Peso en la Tierra',
    vida: 'Vida',
    umbral: 'Umbral para detenerlo',
    comun: 'Común',
    epico: 'Épico',
  },

  ranking: {
    titulo: 'Salón de las Leyendas',
    grupo: 'Mi grupo',
    todos: 'Todos',
    cargando: 'Consultando el salón…',
    sinConexion: 'El ranking necesita conexión con el servidor del profesor.\nEntra con tu matrícula y contraseña para aparecer aquí.',
    vacio: 'Aún no hay expediciones registradas.',
    cols: ['#', 'Héroe', 'Grupo', 'Puntaje', 'Piso máx.', 'Victorias'],
    tu: 'tú',
    pagina: 'Página',
  },

  creditos: {
    titulo: 'Créditos',
    filas: [
      ['Juego creado por', 'Victorino Sepúlveda Arróniz'],
      ['Institución', 'Universidad de Monterrey (UDEM)'],
      ['Curso', 'Dinámica · basado en los temas del libro de R. C. Hibbeler'],
      ['Inspirado en', 'Slay the Spire (Mega Crit), Loop Hero (Four Quarters) y Hades (Supergiant Games)'],
      ['Pixel art', 'Diseñado en código por Victorino Sepúlveda Arróniz con asistencia de Claude (Anthropic)'],
      ['Música y sonido', 'Sintetizados en vivo con Web Audio'],
      ['Tecnología', 'Phaser 3 · Vite · Google Apps Script'],
      ['Tipografías', 'VT323 (Peter Hull) y Pirata One (Rodrigo Fuenzalida y Nicolás Massi), licencia SIL OFL'],
    ] as [string, string][],
    nota: 'Hibbelerius y los diálogos de las figuras históricas son ficción con fines educativos.',
    volver: 'Volver',
  },

  ayuda: {
    titulo: 'Cómo se juega',
    tituloPrimera: 'Antes de descender…',
    descender: 'Descender',
    entendido: 'Entendido',
    pie: 'Pasa el cursor sobre cartas, estados y enemigos para ver la física detrás.',
    filas: [
      ['i_bolt', 'Energía en Joules', 'Cada turno tienes 3 J. Jugar una carta cuesta trabajo: gasta Joules.'],
      ['i_combat', 'F = m · a', 'Tus ataques calculan su fuerza: masa del arma (kg) × aceleración (m/s²). El daño es F en newtons.'],
      ['i_shield', 'Bloque', 'Absorbe daño. Se pierde al iniciar tu turno… salvo que la inercia diga lo contrario.'],
      ['i_momentum', 'Inercia (1ª ley)', 'Algunos enemigos avanzan sin detenerse y su golpe crece. Detenlos con UN golpe de F ≥ su umbral.'],
      ['i_shrine', 'Encuentros, ecos y mercader', 'Personajes y figuras históricas te harán preguntas: acierta y recibe bendiciones o dones épicos. El mercader acepta Ergios.'],
      ['i_rune', 'Runas', 'Altares y fogatas te retan con problemas de dinámica. Resuélvelos para ganar poder.'],
    ] as [string, string, string][],
  },

  mapa: {
    titulo: 'Acto I · Las Criptas de la Inercia',
    pisos: 'Pisos',
    clicAvanzar: '▶ Clic para avanzar',
    nodos: {
      combate: ['Combate', 'Criaturas de la cripta. Gana una carta y Ergios.'],
      elite: ['Élite', 'Enemigo con Inercia. Peligroso, pero deja una reliquia.'],
      fogata: ['Fogata', 'Descansa para recuperarte o estudia una runa para mejorar una carta.'],
      runa: ['Altar rúnico', 'Un problema de dinámica. Resuélvelo y obtén una reliquia.'],
      evento: ['Encuentro', 'Alguien te espera en la penumbra. Quizá te ayude… si respondes bien.'],
      mercader: ['Mercader', 'Compra cartas y reliquias con tus Ergios.'],
      santuario: ['Eco del Pasado', 'Una figura histórica de la física te espera. Te ofrecerá un don para toda la expedición.'],
      jefe: ['Coloso Inerte', 'El guardián del Acto I.'],
    } as Record<string, [string, string]>,
  },

  combate: {
    pergamino: 'Pergamino de cálculos',
    finTurno: 'Fin de turno',
    turno: 'Turno',
    robo: 'Robo',
    descarte: 'Descarte',
    joules: 'Joules',
    sinEnergia: 'No tienes suficiente energía (J).',
    eligeObjetivo: 'Elige un objetivo · clic derecho o Esc para cancelar',
    bannerCombate: 'Combate',
    bannerElite: '¡Élite!',
    bannerJefe: '¡El Coloso Inerte!',
    victoria: '¡Victoria!',
    derrota: 'La expedición termina…',
    detenido: '¡DETENIDO!',
    bloqueado: 'Bloqueado',
  },

  botin: { titulo: 'Botín', elige: 'Elige una carta para tu mazo', omitir: 'Omitir', reliquia: 'Reliquia' },

  fogata: {
    titulo: 'Fogata',
    texto: 'El fuego crepita. Por un momento, las criptas guardan silencio.',
    descansar: 'Descansar',
    estudiar: 'Estudiar una runa\n(acierta y mejora una carta)',
  },

  runa: {
    altar: 'Resuélvela y el altar te concederá una reliquia.',
    fogata: 'Resuélvela y podrás mejorar una carta.',
    reglas: 'Usa g = 9.81 m/s². Se acepta un margen de ±2–3 %. Tienes 2 intentos.',
    reintento: 'No es correcto. Revisa tu diagrama de cuerpo libre e inténtalo otra vez.',
    responder: 'Responder',
    correcto: '✔ ¡Correcto! La runa brilla.',
    incorrecto: '✘ La runa se apaga… Así se resolvía:',
    respuesta: 'Respuesta',
    eligeReliquia: 'Elige una reliquia:',
    mejorar: 'Mejorar una carta',
    eligeMejorar: 'Elige una carta para mejorar',
    continuar: 'Continuar',
    tuRespuesta: 'tu respuesta',
  },

  evento: {
    aceptar: 'Aceptar el reto',
    rechazar: 'Seguir mi camino',
    bendicion: 'Bendición',
    maldicion: 'Maldición pasajera',
    siAciertas: 'Si aciertas',
    siFallas: 'Si fallas',
  },

  santuario: {
    responder: 'Responder su pregunta\n(dones ÉPICOS)',
    sinResponder: 'Aceptar sin responder\n(dones comunes)',
    elige: 'Elige un don',
    comun: 'Común',
    epico: 'Épico',
    yaLoTienes: 'Ya lo tienes',
    siAciertas: 'Si aciertas, sus dones serán ÉPICOS.',
    elegirDon: 'Elegir un don',
    sinDones: 'Ya tienes todos sus dones. Te deja 30 Ergios en su lugar.',
    continuar: 'Continuar',
    don: 'Don',
  },

  mercader: {
    titulo: 'El Mercader del Momento',
    saludo: '«Todo tiene un precio, viajero… y todo precio, una masa.»',
    cartas: 'Cartas',
    reliquia: 'Reliquia',
    servicios: 'Servicios',
    olvidar: 'Olvidar una carta',
    olvidarElige: 'Elige una carta para olvidar',
    curar: 'Té de raíz negra (+20 vida)',
    regatear: 'Regatear (resuelve un problema: −30 %)',
    regateado: 'Precios rebajados',
    salir: 'Salir de la tienda',
    sinDinero: 'No te alcanzan los Ergios.',
    vendido: 'Vendido',
  },

  final: {
    victoria: 'Acto I completado',
    victoriaTexto: 'El Coloso Inerte se desmorona. Su inercia, por fin, cede.',
    derrota: 'La expedición termina',
    derrotaTexto: 'Te hizo retroceder',
    cita: '«Interesante… dominas la fuerza.\nVeremos si entiendes la ENERGÍA.»\n— Hibbelerius',
    consejo: 'Consejo del cronista',
    volver: 'Volver al Umbral',
    registrado: 'Tu progreso quedó registrado.',
    local: 'Modo sin conexión: progreso guardado sólo aquí.',
    filas: ['Pisos superados', 'Combates ganados', 'Élites vencidas', 'Runas resueltas', 'Ergios reunidos', 'Puntaje'],
    consejos: [
      'Recuerda: F = m·a. Si quieres más fuerza, sube la masa (Forja) o la aceleración (Carrera).',
      'Para detener a un enemigo con Inercia necesitas UN golpe con F ≥ su umbral: junta tus bonos antes de golpear.',
      'La Embestida te devuelve ¼ de su fuerza: la 3ª ley no perdona. Ten Bloque listo.',
      'El lodo (fricción) resta aceleración. Peso Muerto usa g, que no cambia: ¡ignora la fricción!',
    ],
  },

  hud: { vida: 'Vida', vidaInfo: 'Si llega a 0, la expedición termina. Tu avance queda registrado.', piso: 'Piso', mazo: 'Mazo', menu: 'Menú' },

  ajustes: {
    pantalla: 'Pantalla completa (F11 también funciona)',
    musica: 'Música y sonido',
    niveles: ['Silencio', 'Bajo', 'Medio', 'Alto'],
  },
};
