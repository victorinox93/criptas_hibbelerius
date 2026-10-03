// ════════════════════════════════════════════════════════════════
//  FAMILIARES: criaturas que te acompañan unos cuantos combates.
//  Sólo puedes llevar uno a la vez; uno nuevo reemplaza al anterior.
//  Lo que hace cada uno está programado en src/scenes/Combat.ts
//  (busca "familiar"). Su dibujo está en src/art/sprites.ts (fam_*).
// ════════════════════════════════════════════════════════════════

export interface FamiliarDef {
  id: string;
  name: string;
  sprite: string;
  text: string; // qué hace en combate
  lore: string; // la física (o la leyenda) detrás
  combats: number; // cuántos combates se queda contigo
}

export const FAMILIARS: Record<string, FamiliarDef> = {
  gato: {
    id: 'gato', name: 'Gato de Schrödinger', sprite: 'fam_gato', combats: 3,
    text: 'Al inicio de tu turno, al azar (50 %): te da 5 de Bloque o araña a un enemigo por 5.',
    lore: 'Mientras nadie lo observa, está en superposición: escudo y ataque a la vez. Al mirarlo, la moneda cae.',
  },
  lechuza: {
    id: 'lechuza', name: 'Lechuza de Minerva', sprite: 'fam_lechuza', combats: 3,
    text: 'Robas 1 carta más cada turno.',
    lore: 'Ve en la oscuridad lo que tú no ves. Más información, mejores decisiones.',
  },
  salamandra: {
    id: 'salamandra', name: 'Salamandra Ígnea', sprite: 'fam_salamandra', combats: 3,
    text: 'Al final de tu turno aplica 3 de Calor a un enemigo al azar.',
    lore: 'Las leyendas dicen que vive en el fuego. Aquí, transfiere energía térmica a quien la moleste.',
  },
  tortuga: {
    id: 'tortuga', name: 'Tortuga de Zenón', sprite: 'fam_tortuga', combats: 3,
    text: 'Al inicio de tu turno ganas 4 de Bloque.',
    lore: 'Zenón decía que Aquiles nunca alcanza a la tortuga. Los golpes, al parecer, tampoco.',
  },
  cuervo: {
    id: 'cuervo', name: 'Cuervo de las Criptas', sprite: 'fam_cuervo', combats: 3,
    text: 'Al final de tu turno picotea al enemigo con menos vida (4 de daño). Al ganar, trae +6 Ergios.',
    lore: 'Junta todo lo que brilla, incluso los joules que se te caen.',
  },
};

export const FAMILIAR_POOL = Object.keys(FAMILIARS);
