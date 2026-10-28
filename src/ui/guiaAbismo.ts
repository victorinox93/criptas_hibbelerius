import Phaser from 'phaser';
import { HOJAS_BENDICION, HOJAS_LEGADO } from '../data/legado';
import { PARASITO_VIDA, MAXWELL_PRECIO } from '../data/maldiciones';
import { NYAR_ENTROPIA, NYAR_PACTO_RUNAS, RUNA_DANO_ABISMO, SACRIFICIO_SANGRE } from '../data/mythos_pactos';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { Edicion } from '../data/cards';
import { CONDICIONES_JEFE, CORDURA, DIENTES_INICIO, DIENTES_OFRECIDOS, ELIGES_POR_SOBRE, EDICIONES, MUTADORES, PISOS_TRAMO, ROMPER_CRISTAL, SEMAFORO, TRAMOS } from '../data/abismo_modo';
import { defDiente, HUECOS, MULT_DIENTES_MAX, NOMBRE_RAREZA } from '../data/dientes';
import { dibujarDiente } from './dentadura';
import { codexFlag } from '../state';
import { cardView, costConfusion, costOverride } from './card';
import { button, frame, title, txt } from './widgets';

// ════════════════════════════════════════════════════════════════
//  GUÍA DEL ABISMO: explica las reglas nuevas con ejemplos del juego.
//  Sale sola la primera vez y se puede abrir con el botón «Guía».
//  Para agregar o cambiar una página, edita PAGINAS_GUIA (abajo).
// ════════════════════════════════════════════════════════════════

type Pintor = (s: Phaser.Scene, L: <T extends Phaser.GameObjects.GameObject>(o: T) => T) => void;
interface PaginaGuia { titulo: string; texto: string; dibujo: Pintor }

const UID_EJEMPLO = -9000; // uids de las cartas de muestra (no chocan con las del mazo)

/** Una fila de cartas de muestra a escala chica, con una etiqueta debajo de cada una */
function muestra(s: Phaser.Scene, L: <T extends Phaser.GameObjects.GameObject>(o: T) => T, cartas: { id: string; ed?: Edicion; up?: boolean; conf?: number }[], etiquetas: string[], y = 318, k = 0.7) {
  const n = cartas.length, paso = Math.min(190, 760 / n);
  cartas.forEach((c, i) => {
    const uid = UID_EJEMPLO - i;
    if (c.conf !== undefined) costOverride.set(uid, c.conf);
    const x = W / 2 + (i - (n - 1) / 2) * paso;
    L(cardView(s, x, y, c.ed ? { uid, id: c.id, up: !!c.up, ed: c.ed } : { uid, id: c.id, up: !!c.up }).setScale(k));
    if (etiquetas[i]) L(txt(s, x, y + 120 * k + 12, etiquetas[i], 16, CSS.gold, { align: 'center', wordWrap: { width: paso - 10 } }).setOrigin(0.5, 0));
  });
}

const PAGINAS_GUIA: PaginaGuia[] = [
  {
    titulo: 'El viaje',
    texto: `Arrancas una página del Necronomicón, firmas un Pacto, eliges dientes y abres 3 sobres. Luego bajas ${TRAMOS} tramos de ${PISOS_TRAMO} pisos: el primero termina con un jefe al azar y el segundo con un Primigenio. Después puedes seguir bajando sin fin. Con ${HOJAS_BENDICION} hojas del diario se abre la Bendición de Montemayor y con ${HOJAS_LEGADO}, el Legado (traer 1 carta o 1 diente de tu expedición anterior).`,
    dibujo: (s, L) => {
      const pasos = ['Página del\nNecronomicón', 'Pacto\n(tu mazo base)', `Dentadura\n(${DIENTES_INICIO} de ${DIENTES_OFRECIDOS} dientes)`, `3 sobres\n(+${3 * ELIGES_POR_SOBRE} cartas)`, `${TRAMOS} tramos\n+ Primigenio`];
      const notas = ['Un poder y un costo\npara toda la partida', 'Eliges 1 de 2 mazos\no el Pacto ciego', 'Reliquias: el orden\nimporta', `De cada sobre te\nquedas con ${ELIGES_POR_SOBRE} cartas`, 'Jefe al azar; luego,\n¿infinito?'];
      const u = pasos.length - 1;
      pasos.forEach((p, i) => {
        const x = 108 + i * 186, y = 300;
        const g = s.add.graphics();
        frame(g, x - 80, y - 50, 160, 100, 0x0c1614, i === u ? UI.gold : 0x2c5a4e, 0.97);
        L(g);
        L(txt(s, x, y, p, 18, i === u ? CSS.gold : '#9ad8c8', { align: 'center' }).setOrigin(0.5));
        L(txt(s, x, y + 66, notas[i], 14, CSS.dim, { align: 'center' }).setOrigin(0.5, 0));
        if (i < u) L(txt(s, x + 93, y, '▶', 20, '#2c5a4e').setOrigin(0.5));
      });
    },
  },
  {
    titulo: 'La Cordura (el semáforo)',
    texto: `A la izquierda de la pantalla siempre ves tu Cordura. Aciertas una pregunta: +${CORDURA.runaBien}. Fallas: −${CORDURA.runaMal} de Cordura y −${RUNA_DANO_ABISMO} de vida (nunca te deja en menos de 1). Los jefes, las élites y los Susurros también te la bajan.`,
    dibujo: (s, L) => {
      const g = s.add.graphics();
      frame(g, 150, 190, 64, 250, 0x07090a, 0x2a3a34, 0.95);
      L(g);
      SEMAFORO.forEach((l, i) => {
        const y = 222 + i * 60;
        L(s.add.circle(182, y, 20, l.color, 1).setStrokeStyle(3, 0x000000, 0.8));
        L(txt(s, 240, y - 22, `${l.nombre}  (${l.min === 61 ? '61–100' : l.min === 31 ? '31–60' : l.min === 1 ? '1–30' : '0'})`, 21, l.css));
        L(txt(s, 240, y + 2, l.texto, 17, CSS.bone));
      });
      L(txt(s, W - 110, 300, 'Poca cordura\n= golpes más fuertes,\npero juegas a ciegas.', 18, CSS.purple, { align: 'center' }).setOrigin(0.5));
    },
  },
  {
    titulo: 'Estados alterados',
    texto: 'Las criaturas te pueden dejar en mal estado. Fíjate en los íconos junto a su intención (pasa el mouse para leerlos) y prepárate.',
    dibujo: (s, L) => {
      const estados: [string, number, string, string][] = [
        ['i_ojo', 0xffa040, 'Confusión', 'Tus cartas cuestan 0–3 J al azar (gema naranja con «?»). La usan el Vigía y el Geómetra herido.'],
        ['i_stun', 0xffd040, 'Aturdido', 'Golpe aturdidor: si te hace daño, PIERDES tu siguiente turno. Bloquéalo completo y no pasa nada.'],
        ['i_heart', 0xb02020, 'Hemorragia', 'Durante unos turnos, cada carta que juegas te quita 1 de vida. Juega pocas y fuertes.'],
        ['i_momentum', 0x9ad8f0, 'Vértigo', 'En tu siguiente turno robas cartas de menos. Lo causan los que giran.'],
        ['i_combat', 0x9a6ad0, 'Perfora', 'El Sabueso de Tíndalos sale de un ángulo: su golpe atraviesa tu Bloqueo.'],
        ['i_shield', 0x3a8ac8, 'El lago sube', 'Bokrug inunda todo: antes de su golpe pierdes TODO tu Bloqueo.'],
      ];
      // v0.52 · dos columnas de 3 (con 6 estados la lista ya no cabía)
      estados.forEach(([ic, tint, nom, d], i) => {
        const x = i < 3 ? 90 : W / 2 + 20;
        const y = 196 + (i % 3) * 82;
        L(s.add.image(x + 16, y + 14, ic).setScale(3.4).setTint(tint));
        L(txt(s, x + 48, y, nom, 20, CSS.gold));
        L(txt(s, x + 48, y + 24, d, 15, CSS.bone, { wordWrap: { width: 330 } }));
      });
    },
  },
  {
    titulo: 'Tipos de carta',
    texto: 'Cualquier carta puede salir con una EDICIÓN que la hace brillar. «+5» se SUMA a cada golpe; «×1.5» MULTIPLICA el daño (12 → 18). En las Defensas y Habilidades la edición da Bloqueo extra o robas una carta.',
    dibujo: (s, L) => {
      const eds: Edicion[] = ['lamina', 'holo', 'poli', 'cristal'];
      const corto: Record<Edicion, string> = {
        lamina: 'Ataque: +5 de daño\nDefensa/Habilidad: +4 Bloqueo',
        holo: 'Recuperas 1 J\nal jugarla',
        poli: 'Ataque: daño ×1.5\nDefensa/Habilidad: robas 1',
        cristal: 'Ataque: daño ×2\nDefensa/Habilidad: +10 Bloqueo',
      };
      muestra(s, L, eds.map((ed) => ({ id: 'golpe', ed })), eds.map((ed) => `${EDICIONES[ed].nombre}\n${corto[ed]}`), 262, 0.68);
      L(txt(s, W / 2, 436, `El Cristal es frágil: cada vez que lo juegas hay ${Math.round(ROMPER_CRISTAL * 100)} % de probabilidad de que se rompa y salga de tu mazo.`, 16, '#c8f4ff', { align: 'center', wordWrap: { width: 780 } }).setOrigin(0.5, 0));
    },
  },
  {
    titulo: 'La Dentadura (reliquias)',
    texto: `Las reliquias del Abismo son dientes: Comunes, ★ Raros y ★★ Legendarios. Al empezar eliges ${DIENTES_INICIO} de ${DIENTES_OFRECIDOS}; ganas más con el Sacamuelas Ciego, los Relatos y al vencer a un jefe. Tienes ${HUECOS} huecos y el ORDEN importa.`,
    dibujo: (s, L) => {
      const ej: [string, string][] = [['colmillo', 'Común\n+2 a ataques'], ['espejo', '★ Raro · Espejo:\ncopia al de su izq.'], ['marte~3', '✦ Marte de Cristal\n×2, dura 2 combates'], ['rlyeh', "★★ R'lyeh\n1er ataque ×2"], ['larva', '☣ Parásito: bueno\ny malo a la vez']];
      ej.forEach(([id, t], i) => {
        const x = W / 2 + (i - 2) * 150;
        L(dibujarDiente(s, x, 236, id, 1.4));
        L(txt(s, x, 290, t, 15, NOMBRE_RAREZA[defDiente(id).rareza].css, { align: 'center' }).setOrigin(0.5, 0));
      });
      L(txt(s, W / 2, 350, 'EL COSMOS: los Astros suben de nivel una constelación de cartas.\nTres Astros seguidos forman una ALINEACIÓN PLANETARIA: tus ataques hacen ×1.5.', 17, '#ffd060', { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5, 0));
      L(txt(s, W / 2, 410, 'Los PARÁSITOS se pegan solos y sólo el Sacamuelas te los arranca, cobrando. Los de CRISTAL valen doble pero se rompen.', 15, '#b8e070', { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5, 0));
    },
  },
  {
    titulo: 'Mutadores, jefes y la Rueda',
    texto: 'Cada tramo trae una regla distinta (se ve abajo del mapa). Cada jefe impone una condición, y el Sacamuelas tiene una ruleta.',
    dibujo: (s, L) => {
      const filas: [string, string, string][] = [
        ['i_rune', 'Mutador del tramo', MUTADORES.map((m) => m.nombre).join(' · ') + '. Cambia en cada tramo.'],
        ['i_diente', 'Condición del jefe', `Cada jefe impone una al azar: ${CONDICIONES_JEFE.map((c) => c.nombre).join(', ')}. Tras detenerlos, quedan IMPARABLES 1 o 2 turnos.`],
        ['i_coin', 'Rueda de la Fortuna', 'En el Sacamuelas: diente legendario o raro, Ergios, Cordura, un apunte… o un parásito o nada. Cada giro cuesta más.'],
        ['i_skull', 'Tope del cosmos', `Los multiplicadores de los dientes (R'lyeh, Saturno, Sol Negro y Alineación) se suman y no pasan de ×${MULT_DIENTES_MAX}.`],
      ];
      filas.forEach(([ic, nom, d], i) => {
        const y = 186 + i * 68;
        L(s.add.image(W / 2 - 330, y + 16, ic).setScale(3.2));
        L(txt(s, W / 2 - 296, y, nom, 20, CSS.gold));
        L(txt(s, W / 2 - 296, y + 26, d, 15, CSS.bone, { wordWrap: { width: 640 } }));
      });
    },
  },
  {
    titulo: 'El Astrónomo y los Relatos',
    texto: 'El Astrónomo Aficionado de Providence (H. P. Lovecraft, que de joven escribía columnas de astronomía) te ayuda desde arriba. En los nodos «?» te esperan situaciones de sus cuentos.',
    dibujo: (s, L) => {
      L(s.add.image(150, 300, 'fig_astronomo').setScale(3.6));
      const filas: [string, string, string][] = [
        ['i_telescopio', 'Observatorio', 'Sube 1 nivel una constelación. Luego elige un favor: una pregunta de órbitas (otro nivel), su telescopio (ves lo oculto) o una hoja de Montemayor.'],
        ['i_book', 'Cartas de Providence', 'Cada tramo te manda una misión. Si la cumples, el trofeo del jefe trae 3 dientes legendarios.'],
        ['i_note', 'Relatos', 'La música de Erich Zann, Herbert West, Las ratas en las paredes, Aire frío, El templo, El modelo de Pickman, El sabueso, Los gatos de Ulthar…'],
      ];
      filas.forEach(([ic, nom, d], i) => {
        const y = 200 + i * 80;
        L(s.add.image(290, y + 16, ic).setScale(3.2));
        L(txt(s, 324, y, nom, 20, CSS.gold));
        L(txt(s, 324, y + 26, d, 15, CSS.bone, { wordWrap: { width: 560 } }));
      });
    },
  },
  {
    titulo: 'Los Astros Ambulantes',
    texto: 'Los planetas despertaron y bajaron al Abismo. En cada tramo hay 1 o 2 nodos de planeta: son más fuertes que una élite. Si ganas abres un sobre y, la primera vez, te llevas su cosmético.',
    dibujo: (s, L) => {
      const ast: [string, number, number, number][] = [['astro_mercurio', 100, 226, 1.3], ['astro_venus', 220, 226, 1.1], ['astro_marte', 340, 226, 1.1], ['astro_jupiter', 470, 226, 0.9], ['astro_saturno', 630, 226, 1], ['astro_sol', 800, 226, 0.9]];
      ast.forEach(([k, x, y, e]) => L(s.add.image(x, y, k).setScale(e)));
      const filas: [string, string][] = [
        ['Mercurio · Venus · Marte', 'Rapidez orbital, presión de 92 atm y el peso en otro planeta (Marte trae a sus lunas Fobos y Deimos).'],
        ['Júpiter · Saturno · el Sol', 'Gravedad de 24.8 m/s², densidad (flotaría en agua) y E = m·c². El Sol sólo sale desde el tramo 2.'],
        ['Premio', 'Un sobre (te quedas con 1 carta). La primera vez, su casco o escudo (y algo más): casco alado, yelmo, anillos, corona y 4 escudos. Si vences a los 6: la capa Heliosfera.'],
      ];
      filas.forEach(([nom, d], i) => {
        const y = 292 + i * 64;
        L(txt(s, 90, y, nom, 19, CSS.gold));
        L(txt(s, 90, y + 24, d, 15, CSS.bone, { wordWrap: { width: 780 } }));
      });
    },
  },
  {
    titulo: 'Personajes, lunas y fenómenos',
    texto: 'En los nodos «?» ahora también te esperan personajes que ayudan (o engañan) y fenómenos del cielo. Algunas lunas te acompañan como familiares.',
    dibujo: (s, L) => {
      const filas: [string, string, string, number][] = [
        ['fig_prestamista', 'El Prestamista de Ergios', 'Te presta Ergios… y al terminar el tramo cobra 1.5 veces lo prestado. Si no tienes, cobra en vida.', 3.4],
        ['fig_viuda', 'La Viuda de Arkham', 'Cuida a tu familiar (2 combates más) a cambio de una carta, o te da té y descanso.', 3.4],
        ['fig_alineacion', 'Alineación Planetaria', 'Las gravedades se suman: +1 J al inicio de cada combate del tramo, o resiste y gana a Caronte.', 4],
        ['fig_meteoro', 'Lluvia de Meteoritos', 'Minijuego: esquiva rocas. Cada golpe quita vida según K = ½·m·v².', 4],
        ['fam_fobos', 'Lunas familiares', 'Fobos (lo suelta Marte): golpea cada 2 turnos. Europa (Júpiter): Bloqueo y cura. Caronte: te salva de morir una vez.', 4],
      ];
      filas.forEach(([k, nom, d, e], i) => {
        const y = 196 + i * 56;
        L(s.add.image(120, y + 18, k).setScale(e * 0.8));
        L(txt(s, 170, y, nom, 19, CSS.gold));
        L(txt(s, 170, y + 24, d, 15, CSS.bone, { wordWrap: { width: 700 } }));
      });
    },
  },
  {
    titulo: 'Más personajes (y un ratón)',
    texto: 'Algunos ayudan, otros engañan. Y desde el tramo 2, Roído, el Coleccionista de Sonrisas, te persigue por el mapa.',
    dibujo: (s, L) => {
      const filas: [string, string, string, number, number?][] = [
        ['fig_perez', 'Roído, el Coleccionista de Sonrisas', 'Desde el tramo 2. Empieza 3 pisos detrás de ti. Avanza 2 cuando descansas o compras. Si te alcanza, te arranca un diente.', 2.4],
        ['fig_cartografo', 'El Cartógrafo Ciego', 'Te vende un mapa: casi siempre marca Fogata y Mercader… a veces, Élites. Si sumas bien vectores, no te engaña.', 2.6],
        ['hero', 'El Gemelo de Espejo', 'Te regala una carta mejorada, pero una vez por combate usa tu último golpe contra ti (3ª ley).', 1.1, 0x8ab8ff],
        ['fig_migo', 'El Peregrino de Yuggoth', 'Lleva tu cerebro en un cilindro: la Cordura no baja todo el tramo, pero pierdes Vida máxima.', 2.6],
        ['hero', 'La Sombra del Alumno Anterior', 'El eco de un compañero que bajó antes que tú. Gánale su reto y te da su mejor carta.', 1.1, 0x3a4a6a],
        ['fig_hermano', 'Acción y Reacción', 'Hermanos iguales y opuestos: uno siempre miente. Descubre cuál dice algo falso de física y elige el camino correcto.', 2.6],
      ];
      filas.forEach(([k, nom, d, e, tinte], i) => {
        const y = 178 + i * 46;
        const im = L(s.add.image(120, y + 16, k).setScale(e * 0.8));
        if (tinte !== undefined) im.setTint(tinte);
        L(txt(s, 170, y, nom, 18, CSS.gold));
        L(txt(s, 170, y + 22, d, 14, CSS.bone, { wordWrap: { width: 720 } }));
      });
    },
  },
  {
    titulo: 'Pactos del mythos',
    texto: 'Algunos nodos «?» esconden pactos: siempre te dan algo… y siempre cobran. Lo que cobran suele ser una maldición (la siguiente página).',
    dibujo: (s, L) => {
      const filas: [string, string, string, number][] = [
        ['npc_hombreNegro', 'El Hombre Negro (Nyarlathotep)', `Aparece a lo más una vez por tramo y recuerda tus visitas. Piensa por ti (resuelve ${NYAR_PACTO_RUNAS} preguntas, +${NYAR_ENTROPIA} de Locura y sin puntos cada vez), te regala una reliquia maldita, te cura con una maldición… o, si lo rechazas, −8 de Locura.`, 3],
        ['shubNiggurath', 'Altares de Shub-Niggurath, Dagón y Yig', `Piden un sacrificio: 2 cartas que tú eliges (reliquia), 2 al azar (reliquia y diente raro) o tu sangre, −${SACRIFICIO_SANGRE} de Vida máxima (reliquia maldita). Si te niegas, 50 % de maldición.`, 0.9],
        ['npc_maxwell', 'El Demonio de Maxwell', `Ordena tu mazo: te quita maldiciones (la primera gratis). Después de conocerlo te espera en las fogatas: ${MAXWELL_PRECIO} Ergios por maldición, sin gastar la fogata.`, 3],
        ['i_rune', 'Reliquias malditas', "Llave de R'lyeh (+1 J por turno; 2 maldiciones), Ojo de Yuggoth (+1 carta por turno; 25 % de maldición al ganar) e Ídolo de Dagón (+2 kg o +2 m/s; empiezas con 2 Susurros).", 3],
      ];
      filas.forEach(([k, nom, d, e], i) => {
        const y = 182 + i * 66;
        L(s.add.image(120, y + 22, k).setScale(e));
        L(txt(s, 180, y, nom, 19, CSS.gold));
        L(txt(s, 180, y + 24, d, 15, CSS.bone, { wordWrap: { width: 700 } }));
      });
    },
  },
  {
    titulo: 'Maldiciones',
    texto: 'Las maldiciones son cartas guindas que no se pueden jugar y se quedan en tu mazo hasta que alguien te las quita: el Demonio de Maxwell o el Mercader («Olvidar una carta»).',
    dibujo: (s, L) => {
      const filas: [string, string][] = [
        ['Arrepentimiento', 'Al terminar el turno pierdes 1 de vida por cada carta en tu mano.'],
        ['Dolor Fantasma', 'Mientras esté en tu mano, cada carta que juegas te quita 1 de vida.'],
        ['Decaimiento Radiactivo', 'Si sigue en tu mano al terminar el turno, pierdes 2 de vida.'],
        ['Duda', 'Si sigue en tu mano al terminar el turno, el siguiente tienes 1 J menos.'],
        ['Normalidad', 'Mientras esté en tu mano, no puedes jugar más de 3 cartas por turno.'],
        ['Torpeza', 'Sólo ocupa espacio; al terminar el turno se agota (vuelve el siguiente combate).'],
        ['Parásito de Yuggoth', `Si te lo quitan del mazo, pierdes ${PARASITO_VIDA} de Vida máxima.`],
      ];
      filas.forEach(([nom, d], i) => {
        const y = 184 + i * 38;
        const g = s.add.graphics();
        g.fillStyle(0x6a1a3a, 1).fillRoundedRect(96, y + 2, 22, 28, 4);
        L(g);
        L(txt(s, 136, y + 4, nom, 18, '#e070a8'));
        L(txt(s, 380, y + 6, d, 16, CSS.bone, { wordWrap: { width: 500 } }));
      });
      L(txt(s, W / 2, 456, 'Aparecen con los pactos, las reliquias malditas, el Memorama de Fórmulas y otros encuentros.', 15, CSS.dim, { align: 'center' }).setOrigin(0.5, 0));
    },
  },
  {
    titulo: 'Las Tierras del Sueño',
    texto: 'En el nodo 🌙 te quedas dormido y eliges una de tres puertas. Cada una es un sueño de un cuento de Lovecraft. Colecciona los 7: hay premios en el Vestidor.',
    dibujo: (s, L) => {
      L(s.add.image(160, 330, 'bokrug').setOrigin(0.5, 1).setScale(2.6));
      L(txt(s, 160, 340, 'Bokrug, jefe del sueño', 17, CSS.gold).setOrigin(0.5, 0));
      const filas: [string, string, string][] = [
        ['i_sueno', 'Sueños', 'Celephaïs, El barco blanco, Sarnath, Hypnos, Más allá del muro del sueño, La llave de plata y Polaris.'],
        ['i_combat', 'Pesadilla', 'Algunos sueños terminan en pelea. La vida que pierdes en el sueño NO es real: al despertar la recuperas. La Cordura sí cuenta.'],
        ['i_skull', 'Si caes vencido en el sueño…', 'Sólo despiertas sudando (−15 de Cordura). No gastas la Vida Extra y la expedición sigue.'],
      ];
      filas.forEach(([ic, nom, d], i) => {
        const y = 196 + i * 84;
        L(s.add.image(310, y + 16, ic).setScale(3.2));
        L(txt(s, 344, y, nom, 20, CSS.gold));
        L(txt(s, 344, y + 26, d, 15, CSS.bone, { wordWrap: { width: 540 } }));
      });
    },
  },
  {
    titulo: 'Cartas del Abismo',
    texto: 'Sólo existen aquí. Cada una es un concepto de cuerpo rígido: centroides, momento de inercia, ejes paralelos, radio de giro. Las buenas son raras.',
    dibujo: (s, L) => {
      muestra(s, L, [{ id: 'centroideGolpe' }, { id: 'momentoInercia' }, { id: 'ejesParalelos' }, { id: 'geometriaImposible' }, { id: 'susurro' }],
        ['Común', 'Común', 'Común', '★ Rara', 'Estado: −3 Cordura\nsi se queda en tu mano'], 290, 0.66);
    },
  },
  {
    titulo: 'Criaturas del Abismo',
    texto: 'Cada criatura es un concepto. Si entiendes la física, sabes cómo vencerla.',
    dibujo: (s, L) => {
      const bichos: [string, string, string][] = [
        ['acolito', 'Acólito Inclinado', 'Su centro de masa está fuera de su base: con 2 golpes en un turno se VUELCA. Si se te cae encima, te aturde.'],
        ['polipo', 'Pólipo Compuesto', 'Figura compuesta: al morir se separa en partes.'],
        ['profundo', 'Profundo Hueco', 'Área negativa: los golpes a TODOS le hacen la mitad. Su arpón da Hemorragia.'],
        ['cultistaEje', 'Cultista del Eje', 'Gira cada vez más rápido y te da Vértigo.'],
      ];
      bichos.forEach(([sp, nom, txt0], i) => {
        const x = 150 + i * 220;
        L(s.add.image(x, 300, sp).setOrigin(0.5, 1).setScale(3.4));
        L(txt(s, x, 316, nom, 19, CSS.gold).setOrigin(0.5, 0));
        L(txt(s, x, 342, txt0, 16, CSS.bone, { align: 'center', wordWrap: { width: 200 } }).setOrigin(0.5, 0));
      });
      L(txt(s, W / 2, 446, 'Antes de cada jefe verás quién es y su desventaja. En el tramo 2 te espera un Primigenio: Nyarlathotep, Cthulhu, Yog-Sothoth, Hastur o Shub-Niggurath.', 16, '#c8a8ff', { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5, 0));
    },
  },
  {
    titulo: 'Ecos Quebrados y preguntas',
    texto: 'En los santuarios pueden aparecer científicos reales que vivieron crisis mentales graves. Sus dones ayudan con la Cordura. Las preguntas son de cuerpo rígido (60 %) y de repaso (40 %).',
    dibujo: (s, L) => {
      const ecos: [string, string][] = [['fig_newton1693', 'Newton, 1693'], ['fig_cantor', 'Cantor'], ['fig_boltzmann', 'Boltzmann'], ['fig_majorana', 'Majorana'], ['fig_godel', 'Gödel'], ['fig_galois', 'Galois']];
      ecos.forEach(([sp, nom], i) => {
        const x = 130 + i * 140;
        L(s.add.image(x, 280, sp).setScale(3.6));
        L(txt(s, x, 326, nom, 17, '#9ad8f0').setOrigin(0.5, 0));
      });
      L(txt(s, W / 2, 380, 'Temas: centroide · centro de masa · momento de inercia · ejes paralelos · radio de giro', 18, CSS.gold, { align: 'center' }).setOrigin(0.5, 0));
      L(txt(s, W / 2, 414, 'La salud mental también es salud. Si algo te pesa, hablar con alguien de confianza ayuda.', 17, CSS.dim, { align: 'center' }).setOrigin(0.5, 0));
    },
  },
];

/** Abre la guía encima de la escena actual. Al cerrarla llama a onClose. */
export function guiaAbismo(s: Phaser.Scene, onClose?: () => void, desde = 0) {
  codexFlag('abismo_guia');
  const capa = s.add.container(0, 0).setDepth(950);
  const fondo = s.add.rectangle(0, 0, W, H, 0x020606, 0.94).setOrigin(0).setInteractive();
  capa.add(fondo);
  const hoja = s.add.container(0, 0);
  capa.add(hoja);
  let i = desde;
  const cerrar = () => {
    for (let k = 0; k < 10; k++) { costOverride.delete(UID_EJEMPLO - k); costConfusion.delete(UID_EJEMPLO - k); }
    capa.destroy();
    onClose?.();
  };
  const pinta = () => {
    hoja.removeAll(true);
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { hoja.add(o); return o; };
    const pg = PAGINAS_GUIA[i];
    const g = s.add.graphics();
    frame(g, 24, 16, W - 48, H - 32, 0x060c0b, 0x2c5a4e, 0.98);
    L(g);
    for (let k = 0; k < 10; k++) { costOverride.delete(UID_EJEMPLO - k); costConfusion.delete(UID_EJEMPLO - k); } // cada página empieza sin costos alterados
    L(txt(s, 44, 28, `Guía del Abismo · ${i + 1}/${PAGINAS_GUIA.length}`, 17, '#5a8a7a'));
    L(title(s, W / 2, 70, pg.titulo, 38, '#9ad8c8'));
    L(txt(s, W / 2, 104, pg.texto, 19, CSS.bone, { align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5, 0));
    pg.dibujo(s, L);
    // puntitos de página
    PAGINAS_GUIA.forEach((_, k) => L(s.add.circle(W / 2 - (PAGINAS_GUIA.length - 1) * 9 + k * 18, 492, 4, k === i ? 0x9ad8c8 : 0x2c3a36)));
    if (i > 0) L(button(s, 150, 494, 160, 36, '◀ Anterior', () => { i--; audio.sfx('click'); pinta(); }, { size: 18 }));
    const ultima = i === PAGINAS_GUIA.length - 1;
    L(button(s, W - 150, 494, 180, 36, ultima ? '¡Entendido!' : 'Siguiente ▶', () => { if (ultima) cerrar(); else { i++; audio.sfx('click'); pinta(); } }, { size: 19, color: UI.gold }));
    if (!ultima) L(button(s, W - 330, 494, 140, 36, 'Cerrar', cerrar, { size: 17 }));
  };
  pinta();
  const teclas = s.input.keyboard;
  const der = () => { if (capa.active && i < PAGINAS_GUIA.length - 1) { i++; pinta(); } };
  const izq = () => { if (capa.active && i > 0) { i--; pinta(); } };
  teclas?.on('keydown-RIGHT', der);
  teclas?.on('keydown-LEFT', izq);
  capa.once('destroy', () => { teclas?.off('keydown-RIGHT', der); teclas?.off('keydown-LEFT', izq); });
  return capa;
}
