// ════════════════════════════════════════════════════════════════
//  NIVELES DE GRAVEDAD (dificultad)
//  Cada nivel es un astro con su g real. Más gravedad = enemigos más
//  resistentes y golpes más fuertes… pero Peso Muerto y la Manzana de
//  Newton usan la g del nivel, así que también pegan más fuerte.
//  Se desbloquea el siguiente nivel al vencer al jefe en el anterior.
// ════════════════════════════════════════════════════════════════
export interface GravityLevel {
  id: number;
  name: string;
  g: number; // m/s²
  hpMul: number; // vida de enemigos
  dmgMul: number; // daño de enemigos
  heal: number; // fracción que cura la fogata
  startHp: number;
  scoreMul: number;
  desc: string;
}

export const GRAVITY: GravityLevel[] = [
  { id: 1, name: 'Tierra', g: 9.81, hpMul: 1, dmgMul: 1, heal: 0.3, startHp: 70, scoreMul: 1,
    desc: 'La gravedad de siempre. Ideal para aprender.' },
  { id: 2, name: 'Neptuno', g: 11.15, hpMul: 1.15, dmgMul: 1.15, heal: 0.25, startHp: 70, scoreMul: 1.5,
    desc: 'Enemigos con +15 % de vida y daño. Las fogatas curan 25 %.' },
  { id: 3, name: 'Júpiter', g: 24.79, hpMul: 1.3, dmgMul: 1.3, heal: 0.2, startHp: 65, scoreMul: 2,
    desc: 'Para leyendas: enemigos con +30 % de vida y daño, 65 de vida inicial y fogatas al 20 %.' },
];

export function gravityOf(id: number | undefined): GravityLevel {
  return GRAVITY[Math.max(0, Math.min(GRAVITY.length - 1, (id ?? 1) - 1))];
}
