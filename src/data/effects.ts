// Bendiciones y maldiciones pasajeras: duran un número de combates.
export interface EffectDef {
  id: string;
  name: string;
  good: boolean;
  icon: string;
  text: string;
  lore: string;
}

export const EFFECTS: Record<string, EffectDef> = {
  impulso: { id: 'impulso', name: 'Impulso del Péndulo', good: true, icon: 'i_wind', text: '+1 m/s² a tus ataques.', lore: 'Más aceleración, más fuerza: ΣF = m·a.' },
  manto: { id: 'manto', name: 'Manto de la Normal', good: true, icon: 'i_shield', text: 'Empiezas cada combate con 8 de Bloque.', lore: 'El suelo te sostiene: la normal siempre empuja de vuelta.' },
  vigor: { id: 'vigor', name: 'Vigor Cinético', good: true, icon: 'i_bolt', text: '+1 J en tu primer turno.', lore: 'Energía extra para hacer más trabajo.' },
  yunque: { id: 'yunque', name: 'Bendición del Yunque', good: true, icon: 'i_mass', text: '+1 kg a tus ataques.', lore: 'A igual aceleración, más masa es más fuerza.' },
  reactor: { id: 'reactor', name: 'Núcleo Activo', good: true, icon: 'i_rad', text: '+1 J al inicio de cada turno.', lore: 'Un poco de masa convertida en mucha energía: E = mc².' },
  lodo: { id: 'lodo', name: 'Pies de Lodo', good: false, icon: 'i_mud', text: 'Empiezas cada combate con 2 de Fricción.', lore: 'La fricción se opone al movimiento y te roba aceleración.' },
  fatiga: { id: 'fatiga', name: 'Fatiga', good: false, icon: 'i_tired', text: '−1 J en tu primer turno.', lore: 'Sin energía no hay trabajo.' },
  hueca: { id: 'hueca', name: 'Arma Hueca', good: false, icon: 'i_feather', text: '−1 kg a tus ataques.', lore: 'Menos masa, menos fuerza con la misma aceleración.' },
  niebla: { id: 'niebla', name: 'Niebla Mental', good: false, icon: 'i_fog', text: 'Robas 1 carta menos en tu primer turno.', lore: 'Respira. Dibuja el diagrama de cuerpo libre.' },
  radiacion: { id: 'radiacion', name: 'Radiación', good: false, icon: 'i_rad', text: 'Al iniciar cada combate pierdes 4 de vida.', lore: 'La radiación ionizante deposita energía en tu cuerpo, aunque no la veas.' },
};
