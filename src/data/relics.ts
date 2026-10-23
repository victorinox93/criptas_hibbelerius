export interface RelicDef {
  id: string;
  name: string;
  icon: string;
  text: string;
  lore: string;
  jefe?: boolean; // reliquia de jefe: muy poderosa, con una desventaja
  especial?: boolean; // no sale en botines ni en la tienda
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

export const RELIC_POOL = Object.keys(RELICS).filter((id) => !RELICS[id].especial && !RELICS[id].jefe);
export const BOSS_RELICS = Object.keys(RELICS).filter((id) => RELICS[id].jefe);
