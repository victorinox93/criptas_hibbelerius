export interface RelicDef {
  id: string;
  name: string;
  icon: string;
  text: string;
  lore: string;
  jefe?: boolean; // reliquia de jefe: muy poderosa, con una desventaja
  especial?: boolean; // no sale en botines ni en la tienda
  maldita?: boolean; // v0.71 · reliquia maldita: muy poderosa, pero trae maldiciones (sólo de pactos del mythos)
  abismo?: boolean; // v0.82 · sólo sale en El Abismo de los Ejes
}

export const RELICS: Record<string, RelicDef> = {
  guante: { id: 'guante', name: 'Guantelete de Newton', icon: 'i_gaunt', text: '+1 m/s² a todos tus ataques.', lore: 'Más aceleración, más fuerza: ΣF = m·a.' },
  yunque: { id: 'yunque', name: 'Yunque Rúnico', icon: 'i_anvil', text: '+1 kg a todos tus ataques.', lore: 'La masa es resistencia a cambiar de movimiento… y también golpe.' },
  coraza: { id: 'coraza', name: 'Coraza Normal', icon: 'i_shield', text: 'Empiezas cada combate con 6 de Bloqueo.', lore: 'Una superficie que siempre empuja de vuelta.' },
  botas: { id: 'botas', name: 'Botas de Agarre', icon: 'i_boots', text: 'Eres inmune a la Fricción.', lore: 'Con buen agarre, el lodo no roba tu aceleración.' },
  cristal: { id: 'cristal', name: 'Cristal Inercial', icon: 'i_crystal', text: 'Conservas la mitad de tu Bloqueo entre turnos.', lore: 'Lo que está quieto tiende a seguir quieto.' },
  ascua: { id: 'ascua', name: 'Corazón de Ascua', icon: 'i_heart', text: '+10 Vida máxima (y te cura 10).', lore: 'Energía almacenada para después.' },
  // ── v0.69 · inspiradas en Slay the Spire, con su física ──
  lampara: { id: 'lampara', name: 'Lámpara de Carburo', icon: 'i_lantern', text: '+1 J en tu primer turno de cada combate.', lore: 'CaC₂ + agua → acetileno: la energía química de los mineros, lista desde el primer momento.' },
  mochila: { id: 'mochila', name: 'Mochila de Apuntes', icon: 'i_bag', text: 'Robas 2 cartas más en tu primer turno de cada combate.', lore: 'Traes tus apuntes. Bien hecho: así sí se llega a un examen.' },
  ariete: { id: 'ariete', name: 'Ariete', icon: 'i_momentum', text: 'Tu primer ataque de cada combate hace +8 de daño.', lore: 'p = m·v: un tronco pesado a buena velocidad abre cualquier puerta… una vez.' },
  contador: { id: 'contador', name: 'Contador de Revoluciones', icon: 'i_rune', text: 'Cada 10.º ataque que juegas (en toda la partida) hace el DOBLE de daño.', lore: 'Un tacómetro: cuenta vueltas. A la décima, ω ya acumuló suficiente.' },
  abanico: { id: 'abanico', name: 'Abanico de Bernoulli', icon: 'i_wind', text: 'Cada vez que juegas 3 ataques en un turno, ganas 4 de Bloqueo.', lore: 'Donde el aire va más rápido, la presión baja: P + ½ρv² = constante.' },
  estrella: { id: 'estrella', name: 'Estrella de Momento', icon: 'i_star', text: 'Cada 3 ataques en un turno: +1 kg (o +1 m/s) para el resto del combate.', lore: 'Un shuriken: masa en el borde, mucho momento angular.' },
  oricalco: { id: 'oricalco', name: 'Escudo de Equilibrio', icon: 'i_shield', text: 'Si terminas tu turno con 0 de Bloqueo, ganas 6.', lore: 'ΣF = 0: si nadie te sostiene, la estructura se sostiene sola.' },
  foucault: { id: 'foucault', name: 'Péndulo de Foucault', icon: 'i_pend', text: 'Cada 3 turnos: +1 J.', lore: 'Su plano de oscilación gira con la Tierra: prueba de que el mundo da vueltas… con calma.' },
  mercurio: { id: 'mercurio', name: 'Reloj de Arena de Mercurio', icon: 'i_fog', text: 'Al empezar cada turno, haces 3 de daño a TODOS los enemigos.', lore: 'Mercurio: 13.6 veces más denso que el agua. Cae poco… pero pesa.' },
  calendario: { id: 'calendario', name: 'Calendario de Kepler', icon: 'i_astro', text: 'Al terminar tu 7.º turno, haces 52 de daño a TODOS los enemigos.', lore: 'T² ∝ a³: si conoces la órbita, sabes exactamente cuándo llega el golpe.' },
  tungsteno: { id: 'tungsteno', name: 'Barra de Tungsteno', icon: 'i_mass', text: 'Pierdes 1 de vida menos cada vez que te hacen daño.', lore: 'El metal con el punto de fusión más alto: 3422 °C. No cede fácil.' },
  hule: { id: 'hule', name: 'Amortiguador de Hule', icon: 'i_reflect', text: 'Si un golpe te iba a hacer entre 2 y 5 de daño, sólo te hace 1.', lore: 'Más tiempo de contacto, menos fuerza: F = Δp / Δt.' },
  termo: { id: 'termo', name: 'Termo de Caldo', icon: 'i_jarra', text: 'Al ganar un combate, si tienes 50 % de vida o menos, te curas 12.', lore: 'Un buen aislante térmico: la energía se queda donde la necesitas.' },
  // ── v0.83 · Reliquias del ABISMO: sólo salen en El Abismo de los Ejes (cuerpo rígido y mythos) ──
  plomada: { id: 'plomada', abismo: true, name: 'Plomada de Montemayor', icon: 'i_pend', text: 'Al empezar cada combate: +5 de Bloqueo y −3 de Locura.', lore: 'Una plomada siempre apunta al centro de la Tierra. Montemayor la usaba para saber dónde estaba «abajo» cuando el Abismo lo mareaba.' },
  girocompas: { id: 'girocompas', abismo: true, name: 'Girocompás', icon: 'i_rune', text: 'Nada te aturde ni te da Vértigo.', lore: 'Un giroscopio que gira rápido conserva su eje: L = I·ω no cambia de dirección sin un torque.' },
  llaveEjes: { id: 'llaveEjes', abismo: true, name: 'Llave de los Ejes Paralelos', icon: 'i_anvil', text: 'Tus Ataques contra cualquier enemigo que no sea el primero de la fila hacen +4.', lore: 'I = I₀ + m·d²: lejos del eje, la misma masa pesa más.' },
  volanteHueso: { id: 'volanteHueso', abismo: true, name: 'Volante de Hueso', icon: 'i_momentum', text: 'Cada vez que juegas un Poder: +5 de Bloqueo.', lore: 'Un volante guarda energía de rotación. Éste es de hueso, y nadie sabe de quién.' },
  estatuillaAngell: { id: 'estatuillaAngell', abismo: true, name: 'Estatuilla del Profesor Angell', icon: 'i_ojo', text: 'Si tu Locura es 50 o más: +1 J cada turno.', lore: 'La figura de arcilla que el profesor Angell guardaba en su caja («La llamada de Cthulhu», 1928). Te da poder… a cambio de lo que ya perdiste.' },
  tiaraInnsmouth: { id: 'tiaraInnsmouth', abismo: true, name: 'Tiara de Innsmouth', icon: 'i_star', text: 'Al ganar un combate: +15 Ergios y +2 de Locura.', lore: 'Oro de un tono extraño, con figuras de peces y ranas. Los Marsh la vendieron… o eso dijeron.' },
  reglaPappus: { id: 'reglaPappus', abismo: true, name: 'Regla de Pappus', icon: 'i_shield', text: 'Tus cartas de Defensa dan +2 de Bloqueo.', lore: 'Teoremas de Pappus-Guldinus: el volumen de un sólido de revolución es su área por la distancia que recorre su centroide.' },
  lenteGeometra: { id: 'lenteGeometra', abismo: true, name: 'Lente del Geómetra', icon: 'i_crystal', text: 'Ves las intenciones de los enemigos invisibles, de noche y con la batería baja.', lore: 'Corrige los ángulos que no suman 180°. Con ella, lo imposible se ve… casi bien.' },
  corazonShoggoth: { id: 'corazonShoggoth', abismo: true, name: 'Corazón de Shoggoth', icon: 'i_heart', text: 'Al empezar cada combate te curas 4 de vida.', lore: 'Protoplasma que se regenera solo. Late con un ritmo que suena a «tekeli-li».' },
  esferaYog: { id: 'esferaYog', abismo: true, name: 'Esfera de Yog-Sothoth', icon: 'i_astro', text: 'En tus turnos pares robas 1 carta más.', lore: 'Una de las esferas iridiscentes de la Llave y la Puerta. Por un momento ves todos los tiempos a la vez.' },
  // ── v0.71 · Reliquias MALDITAS: sólo las dan los pactos del mythos (sacrificios y el Hombre Negro) ──
  llaveRlyeh: { id: 'llaveRlyeh', maldita: true, name: "Llave de R'lyeh", icon: 'i_rune', text: '+1 J cada turno.\nMaldita: al tomarla entran 2 maldiciones al azar a tu mazo.', lore: 'Abre la ciudad hundida. Lo que sale por la puerta no pide permiso.' },
  ojoYuggoth: { id: 'ojoYuggoth', maldita: true, name: 'Ojo de Yuggoth', icon: 'i_ojo', text: 'Robas 1 carta más cada turno.\nMaldito: al ganar un combate, 25 % de que entre una maldición a tu mazo.', lore: 'Los Mi-Go ven en longitudes de onda que tú no. A veces ves lo que ellos ven.' },
  idoloDagon: { id: 'idoloDagon', maldita: true, name: 'Ídolo de Dagón', icon: 'i_mass', text: '+2 kg a tus ataques (Arcanista y Penitente: +2 m/s).\nMaldito: empiezas cada combate con 2 Susurros en tu mazo.', lore: 'Pesa más de lo que debería. La densidad del agua negra de Innsmouth.' },
  // especial: sólo la da el Profe Victorino (no sale en botines ni en la tienda)
  necronomicon: { id: 'necronomicon', especial: true, name: 'Necronomicón de Hibbeler', icon: 'i_necro', text: 'En cada fogata puedes leer un Problema Prohibido: un poder permanente con un costo. Cada lectura: +20 de Locura.', lore: 'Una edición que nunca se publicó. Los ejercicios impares no tienen respuesta al final del libro. Los pares, tampoco.' },
  // v0.68 · se compra con el Mercader (250 Ergios): otra vida extra
  cordon: { id: 'cordon', especial: true, name: 'Cordón Umbilical', icon: 'i_heart', text: 'Si tu vida llega a 0, te reconecta con la vida: te levantas con la mitad de tu vida máxima. Se gasta al usarla.', lore: 'Lo que te une a la vida… literalmente. El Mercader no dice de dónde lo sacó.' },
  vidaExtra: { id: 'vidaExtra', especial: true, name: 'Vida Extra del Profe', icon: 'i_book', text: 'Si tu vida llega a 0, te levantas con la mitad de tu vida máxima. Se gasta al usarla.', lore: '«No le digan a los otros grupos.» — V. S. A.' },
  // ── Reliquias de JEFE: se elige una al vencer al jefe del Acto I y del Acto II. Poderosas, pero con costo. ──
  reactor: { id: 'reactor', jefe: true, name: 'Reactor de Fisión', icon: 'i_rad', text: '+1 J cada turno.\nCosto: pierdes 2 de vida (radiación) al iniciar cada combate.', lore: 'Energía nuclear portátil. ¿Qué podría salir mal?' },
  agujero: { id: 'agujero', jefe: true, name: 'Agujero Negro de Bolsillo', icon: 'i_fog', text: 'Robas 1 carta más cada turno.\nCosto: las fogatas ya no te curan.', lore: 'Nada escapa a su atracción… ni siquiera el descanso.' },
  tomo: { id: 'tomo', jefe: true, name: 'Tomo Prohibido de Hibbeler', icon: 'i_book', text: '+1 J cada turno.\nCosto: los enemigos empiezan cada combate con 6 de Bloqueo.', lore: 'Una edición que trae TODAS las respuestas… y también las preguntas más difíciles.' },
  coloso: { id: 'coloso', jefe: true, name: 'Corazón del Coloso', icon: 'i_heart', text: '+30 Vida máxima.\nCosto: −1 J en tu primer turno de cada combate.', lore: 'Late lento, como una montaña. Mucha masa: mucha inercia.' },
  volante: { id: 'volante', jefe: true, name: 'Volante de Inercia', icon: 'i_pend', text: 'Los J que no uses pasan al siguiente turno (máx. 3).\nCosto: robas 1 carta menos en tu primer turno.', lore: 'Guarda energía cinética de rotación para soltarla después.' },
};
/** Máximo de reliquias que puedes cargar (las especiales del Profe no cuentan). Al pasarte, eliges una para descartar. */
export const MAX_RELIQUIAS = 5;
export const cuentaTope = (id: string) => !RELICS[id]?.especial;

export const RELIC_POOL = Object.keys(RELICS).filter((id) => !RELICS[id].especial && !RELICS[id].jefe && !RELICS[id].maldita && !RELICS[id].abismo);
/** v0.83 · Reliquias que sólo salen en El Abismo */
export const RELIQUIAS_ABISMO = Object.keys(RELICS).filter((id) => RELICS[id].abismo);
export const RELIQUIAS_MALDITAS = Object.keys(RELICS).filter((id) => RELICS[id].maldita);
export const BOSS_RELICS = Object.keys(RELICS).filter((id) => RELICS[id].jefe);
