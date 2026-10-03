export interface RelicDef {
  id: string;
  name: string;
  icon: string;
  text: string;
  lore: string;
}

export const RELICS: Record<string, RelicDef> = {
  guante: { id: 'guante', name: 'Guantelete de Newton', icon: 'i_gaunt', text: '+1 m/s² a todos tus ataques.', lore: 'Más aceleración, más fuerza: ΣF = m·a.' },
  yunque: { id: 'yunque', name: 'Yunque Rúnico', icon: 'i_anvil', text: '+1 kg a todos tus ataques.', lore: 'La masa es resistencia a cambiar de movimiento… y también golpe.' },
  coraza: { id: 'coraza', name: 'Coraza Normal', icon: 'i_shield', text: 'Empiezas cada combate con 6 de Bloque.', lore: 'Una superficie que siempre empuja de vuelta.' },
  botas: { id: 'botas', name: 'Botas de Agarre', icon: 'i_boots', text: 'Eres inmune a la Fricción.', lore: 'Con buen agarre, el lodo no roba tu aceleración.' },
  cristal: { id: 'cristal', name: 'Cristal Inercial', icon: 'i_crystal', text: 'Conservas la mitad de tu Bloque entre turnos.', lore: 'Lo que está quieto tiende a seguir quieto.' },
  ascua: { id: 'ascua', name: 'Corazón de Ascua', icon: 'i_heart', text: '+10 Vida máxima (y te cura 10).', lore: 'Energía almacenada para después.' },
  // especial: sólo la da el Profe Victorino (no sale en botines ni en la tienda)
  vidaExtra: { id: 'vidaExtra', name: 'Vida Extra del Profe', icon: 'i_book', text: 'Si tu vida llega a 0, te levantas con la mitad de tu vida máxima. Se gasta al usarla.', lore: '«No le digan a los otros grupos.» — V. S. A.' },
};
export const RELIC_POOL = Object.keys(RELICS).filter((id) => id !== 'vidaExtra');
