export interface RelicDef {
  id: string;
  name: string;
  icon: string;
  text: string;
  lore: string;
  jefe?: boolean; // reliquia de jefe: muy poderosa, con una desventaja
}

export const RELICS: Record<string, RelicDef> = {
  guante: { id: 'guante', name: 'Guantelete de Newton', icon: 'i_gaunt', text: '+1 m/s² a todos tus ataques.', lore: 'Más aceleración, más fuerza: ΣF = m·a.' },
  yunque: { id: 'yunque', name: 'Yunque Rúnico', icon: 'i_anvil', text: '+1 kg a todos tus ataques.', lore: 'La masa es resistencia a cambiar de movimiento… y también golpe.' },
  coraza: { id: 'coraza', name: 'Coraza Normal', icon: 'i_shield', text: 'Empiezas cada combate con 6 de Bloqueo.', lore: 'Una superficie que siempre empuja de vuelta.' },
  botas: { id: 'botas', name: 'Botas de Agarre', icon: 'i_boots', text: 'Eres inmune a la Fricción.', lore: 'Con buen agarre, el lodo no roba tu aceleración.' },
  cristal: { id: 'cristal', name: 'Cristal Inercial', icon: 'i_crystal', text: 'Conservas la mitad de tu Bloqueo entre turnos.', lore: 'Lo que está quieto tiende a seguir quieto.' },
  ascua: { id: 'ascua', name: 'Corazón de Ascua', icon: 'i_heart', text: '+10 Vida máxima (y te cura 10).', lore: 'Energía almacenada para después.' },
  // especial: sólo la da el Profe Victorino (no sale en botines ni en la tienda)
  vidaExtra: { id: 'vidaExtra', name: 'Vida Extra del Profe', icon: 'i_book', text: 'Si tu vida llega a 0, te levantas con la mitad de tu vida máxima. Se gasta al usarla.', lore: '«No le digan a los otros grupos.» — V. S. A.' },
  // ── Reliquias de JEFE: se elige una al vencer al jefe del Acto I y del Acto II. Poderosas, pero con costo. ──
  reactor: { id: 'reactor', jefe: true, name: 'Reactor de Fisión', icon: 'i_rad', text: '+1 J cada turno.\nCosto: pierdes 2 de vida (radiación) al iniciar cada combate.', lore: 'Energía nuclear portátil. ¿Qué podría salir mal?' },
  agujero: { id: 'agujero', jefe: true, name: 'Agujero Negro de Bolsillo', icon: 'i_fog', text: 'Robas 1 carta más cada turno.\nCosto: las fogatas ya no te curan.', lore: 'Nada escapa a su atracción… ni siquiera el descanso.' },
  tomo: { id: 'tomo', jefe: true, name: 'Tomo Prohibido de Hibbeler', icon: 'i_book', text: '+1 J cada turno.\nCosto: los enemigos empiezan cada combate con 6 de Bloqueo.', lore: 'Una edición que trae TODAS las respuestas… y también las preguntas más difíciles.' },
  coloso: { id: 'coloso', jefe: true, name: 'Corazón del Coloso', icon: 'i_heart', text: '+30 Vida máxima.\nCosto: −1 J en tu primer turno de cada combate.', lore: 'Late lento, como una montaña. Mucha masa: mucha inercia.' },
  volante: { id: 'volante', jefe: true, name: 'Volante de Inercia', icon: 'i_pend', text: 'Los J que no uses pasan al siguiente turno (máx. 3).\nCosto: robas 1 carta menos en tu primer turno.', lore: 'Guarda energía cinética de rotación para soltarla después.' },
};
export const RELIC_POOL = Object.keys(RELICS).filter((id) => id !== 'vidaExtra' && !RELICS[id].jefe);
export const BOSS_RELICS = Object.keys(RELICS).filter((id) => RELICS[id].jefe);
