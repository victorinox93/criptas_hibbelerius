import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { Edicion } from '../data/cards';
import { CORDURA, EDICIONES, ROMPER_CRISTAL, SEMAFORO } from '../data/abismo_modo';
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
    texto: 'Cada expedición al Abismo empieza igual: arrancas una página del Necronomicón, firmas un Pacto y abres 3 sobres. Luego bajas por 8 pisos hasta el jefe.',
    dibujo: (s, L) => {
      const pasos = ['Página del\nNecronomicón', 'Pacto\n(tu mazo base)', '3 sobres\n(+6 cartas)', 'Mapa:\n8 pisos + jefe'];
      const notas = ['Un poder y un costo\npara toda la partida', 'Eliges 1 de 3 mazos\no el Pacto ciego', 'De cada sobre te\nquedas con 2 cartas', 'Combates, runas,\necos y tiendas'];
      pasos.forEach((p, i) => {
        const x = 150 + i * 220, y = 300;
        const g = s.add.graphics();
        frame(g, x - 90, y - 50, 180, 100, 0x0c1614, i === 3 ? UI.gold : 0x2c5a4e, 0.97);
        L(g);
        L(txt(s, x, y, p, 20, i === 3 ? CSS.gold : '#9ad8c8', { align: 'center' }).setOrigin(0.5));
        L(txt(s, x, y + 66, notas[i], 15, CSS.dim, { align: 'center' }).setOrigin(0.5, 0));
        if (i < 3) L(txt(s, x + 110, y, '▶', 24, '#2c5a4e').setOrigin(0.5));
      });
    },
  },
  {
    titulo: 'La Cordura (el semáforo)',
    texto: `A la izquierda de la pantalla siempre ves tu Cordura. Aciertas una pregunta: +${CORDURA.runaBien}. Fallas: −${CORDURA.runaMal}. Los jefes, las élites y los Susurros también te la bajan.`,
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
    titulo: 'Confusión',
    texto: 'Algunos enemigos y cartas te CONFUNDEN: desde ese momento, cada carta que robes cuesta entre 0 y 3 J al azar durante ese combate. Su gema de costo se vuelve NARANJA y aparece un «?» que tiembla.',
    dibujo: (s, L) => {
      for (let k = 1; k <= 2; k++) costConfusion.add(UID_EJEMPLO - k);
      muestra(s, L, [{ id: 'golpe' }, { id: 'golpe', conf: 0 }, { id: 'normal', conf: 3 }], ['Normal: cuesta 1 J', 'Confundido: ¡0 J!', 'Confundido: ¡3 J!'], 312, 0.8);
      L(txt(s, W / 2, 448, 'Lo aplican el Cultista del Eje, el Vigía, el Geómetra, la carta Geometría Imposible y la página «La Confusión».', 16, CSS.dim, { align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5, 0));
    },
  },
  {
    titulo: 'Tipos de carta',
    texto: 'Cada carta tiene una rareza (Común, ★ Rara o ★★ Legendaria). Además, cualquier carta puede salir con una edición que la hace brillar y la vuelve más fuerte.',
    dibujo: (s, L) => {
      const eds: Edicion[] = ['lamina', 'holo', 'poli', 'cristal'];
      muestra(s, L, eds.map((ed) => ({ id: 'golpe', ed })), eds.map((ed) => `${EDICIONES[ed].nombre}\n${EDICIONES[ed].texto.replace(/\n.*/s, '')}`), 262, 0.68);
      L(txt(s, W / 2, 436, `El Cristal es frágil: cada vez que lo juegas hay ${Math.round(ROMPER_CRISTAL * 100)} % de probabilidad de que se rompa y salga de tu mazo.`, 16, '#c8f4ff', { align: 'center', wordWrap: { width: 780 } }).setOrigin(0.5, 0));
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
        ['acolito', 'Acólito Inclinado', 'Su centro de masa está fuera de su base: con 2 golpes en un turno se VUELCA.'],
        ['polipo', 'Pólipo Compuesto', 'Figura compuesta: al morir se separa en partes.'],
        ['profundo', 'Profundo Hueco', 'Área negativa: los golpes a TODOS le hacen la mitad.'],
        ['cultistaEje', 'Cultista del Eje', 'Gira cada vez más rápido y te Confunde.'],
      ];
      bichos.forEach(([sp, nom, txt0], i) => {
        const x = 150 + i * 220;
        L(s.add.image(x, 300, sp).setOrigin(0.5, 1).setScale(3.4));
        L(txt(s, x, 316, nom, 19, CSS.gold).setOrigin(0.5, 0));
        L(txt(s, x, 342, txt0, 16, CSS.bone, { align: 'center', wordWrap: { width: 200 } }).setOrigin(0.5, 0));
      });
      L(txt(s, W / 2, 452, 'Jefe: El Geómetra No Euclidiano. Con menos de la mitad de vida suelta vértices y te Confunde.', 17, '#c8a8ff', { align: 'center' }).setOrigin(0.5, 0));
    },
  },
  {
    titulo: 'Ecos Quebrados y preguntas',
    texto: 'En los santuarios pueden aparecer científicos reales que vivieron crisis mentales graves. Sus dones ayudan con la Cordura. Las preguntas son de cuerpo rígido (60 %) y de repaso (40 %).',
    dibujo: (s, L) => {
      const ecos: [string, string][] = [['fig_newton1693', 'Isaac Newton, 1693'], ['fig_cantor', 'Georg Cantor'], ['fig_boltzmann', 'Ludwig Boltzmann']];
      ecos.forEach(([sp, nom], i) => {
        const x = 230 + i * 250;
        L(s.add.image(x, 280, sp).setScale(4.4));
        L(txt(s, x, 330, nom, 18, '#9ad8f0').setOrigin(0.5, 0));
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
