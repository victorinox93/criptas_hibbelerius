import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { PISOS_TRAMO, TRAMOS } from '../data/abismo_modo';
import { CARDS } from '../data/cards';
import { CLASSES } from '../data/classes';
import { defDiente } from '../data/dientes';
import { RELICS } from '../data/relics';
import { Game, Run } from '../state';
import { button, frame, icon, title, txt } from './widgets';

const COLOR_TIPO: Record<string, string> = { Ataque: '#e08a8a', Defensa: '#8ab0e0', Habilidad: '#9ad07a', Poder: '#c8a0f0', Estado: '#a8a0b0', Maldición: '#e070a8' };

/**
 * v0.71 · RESUMEN DEL DESCENSO (El Abismo es infinito): al terminar una expedición del Abismo
 * se muestra todo lo que llevabas —mazo, reliquias, dientes y hasta dónde llegaste— y un botón
 * para guardar una captura de pantalla (PNG) y presumirla.
 */
export function resumenAbismo(s: Phaser.Scene, run: Run, victoria: boolean, by?: string) {
  const capa = s.add.container(0, 0).setDepth(960);
  capa.add(s.add.rectangle(0, 0, W, H, 0x05040a, 0.97).setOrigin(0).setInteractive());
  const alias = Game.profile?.avatar?.alias ?? 'Explorador';
  const clase = CLASSES.find((c) => c.id === run.clase)?.name ?? run.clase;
  capa.add(title(s, W / 2, 34, victoria ? 'Tu descenso: saliste con vida' : 'Tu descenso al Abismo', 32, victoria ? '#9af07a' : '#c8b8ff'));
  const prof = (run.tramo ?? 1) > TRAMOS ? `Profundidad ${run.tramo}` : `Tramo ${run.tramo ?? 1} de ${TRAMOS}`;
  const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  capa.add(txt(s, W / 2, 60, `${alias} · ${clase} · ${prof}, piso ${Math.min(run.floor + 1, PISOS_TRAMO + 1)}${!victoria && by ? ` · cayó ante ${by}` : ''} · ${fecha}`, 16, CSS.dim).setOrigin(0.5, 0));

  // ── héroe y números ──
  const g = s.add.graphics();
  frame(g, 20, 88, 230, 400, 0x0c0a12, UI.border, 0.95);
  capa.add(g);
  if (s.textures.exists('hero')) capa.add(s.add.image(135, 190, 'hero').setScale(2.6));
  const datos: [string, string | number][] = [
    ['Puntaje', run.score.toLocaleString('es-MX')],
    ['Combates', run.stats.combates],
    ['Élites', run.stats.elites],
    ['Preguntas', `${run.stats.runasOk}/${run.stats.runasTotal}`],
    ['Locura máx.', run.entropiaMax ?? run.entropia ?? 0],
    ['Vida', `${Math.max(0, run.hp)}/${run.maxHp}`],
    ['Tiempo', `${Math.round((run.tiempo ?? 0) / 60)} min`],
  ];
  datos.forEach(([k, v], i) => {
    capa.add(txt(s, 34, 272 + i * 29, k, 16, CSS.dim));
    capa.add(txt(s, 236, 272 + i * 29, String(v), 17, CSS.bone).setOrigin(1, 0));
  });

  // ── mazo: cada carta con cuántas copias, del color de su tipo ──
  const g2 = s.add.graphics();
  frame(g2, 262, 88, 680, 252, 0x0c0a12, UI.border, 0.95);
  capa.add(g2);
  const grupos = new Map<string, { nombre: string; tipo: string; n: number }>();
  for (const c of run.deck) {
    const d = CARDS[c.id];
    if (!d) continue;
    const k = `${c.id}${c.up ? '+' : ''}`;
    const gr = grupos.get(k) ?? { nombre: `${d.name}${c.up ? '+' : ''}`, tipo: d.type, n: 0 };
    gr.n++;
    grupos.set(k, gr);
  }
  const malds = run.deck.filter((c) => CARDS[c.id]?.type === 'Maldición').length;
  capa.add(txt(s, 278, 98, `Mazo: ${run.deck.length} cartas${malds ? ` (${malds} maldición${malds > 1 ? 'es' : ''})` : ''}`, 19, CSS.gold));
  const lista = [...grupos.values()].sort((a, b) => a.tipo.localeCompare(b.tipo) || b.n - a.n);
  const cols = 3, maxFil = 9;
  lista.slice(0, cols * maxFil).forEach((gr, i) => {
    const x = 278 + Math.floor(i / maxFil) * 222, y = 128 + (i % maxFil) * 23;
    const t = txt(s, x, y, `${gr.n > 1 ? `${gr.n}× ` : ''}${gr.nombre}`, 15, COLOR_TIPO[gr.tipo] ?? CSS.bone);
    if (t.width > 212) t.setScale(212 / t.width, 1);
    capa.add(t);
  });
  if (lista.length > cols * maxFil) capa.add(txt(s, 926, 322, `…y ${lista.length - cols * maxFil} más`, 14, CSS.dim).setOrigin(1, 0));

  // ── reliquias y dientes ──
  const g3 = s.add.graphics();
  frame(g3, 262, 350, 336, 138, 0x0c0a12, UI.border, 0.95);
  frame(g3, 606, 350, 336, 138, 0x0c0a12, UI.border, 0.95);
  capa.add(g3);
  capa.add(txt(s, 276, 358, `Reliquias (${run.relics.length})`, 17, CSS.gold));
  run.relics.slice(0, 8).forEach((id, i) => {
    const r = RELICS[id];
    if (!r) return;
    const x = 278 + (i % 2) * 160, y = 386 + Math.floor(i / 2) * 24;
    capa.add(icon(s, x + 8, y + 9, r.icon, 1.6));
    const t = txt(s, x + 22, y, r.name, 14, r.maldita ? '#e070a8' : CSS.bone);
    if (t.width > 134) t.setScale(134 / t.width, 1);
    capa.add(t);
  });
  if (!run.relics.length) capa.add(txt(s, 278, 390, 'Ninguna', 15, CSS.dim));
  const dientes = (run.dientes ?? []).filter((d): d is string => !!d);
  capa.add(txt(s, 620, 358, `Dientes (${dientes.length})`, 17, CSS.gold));
  dientes.slice(0, 8).forEach((id, i) => {
    const d = defDiente(id);
    const x = 622 + (i % 2) * 160, y = 386 + Math.floor(i / 2) * 24;
    const t = txt(s, x, y, `🦷 ${d?.nombre ?? id}`, 14, d?.tipo === 'astro' ? '#9ad8f0' : d?.tipo === 'parasito' ? '#9af07a' : CSS.bone);
    if (t.width > 152) t.setScale(152 / t.width, 1);
    capa.add(t);
  });
  if (!dientes.length) capa.add(txt(s, 622, 390, 'Ninguno', 15, CSS.dim));

  // ── botones: captura y continuar ──
  const nota = txt(s, W / 2, 491, '', 14, CSS.green).setOrigin(0.5, 0);
  capa.add(nota);
  const bCap = button(s, W / 2 - 130, 520, 230, 34, '📸 Guardar captura', () => {
    bCap.setVisible(false);
    bOk.setVisible(false);
    s.game.renderer.snapshot((img) => {
      bCap.setVisible(true);
      bOk.setVisible(true);
      const src = (img as HTMLImageElement).src;
      if (!src) return;
      const a = document.createElement('a');
      a.href = src;
      a.download = `criptas-abismo-${alias.replace(/[^\w-]+/g, '_')}-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      audio.sfx('coin');
      nota.setText('Captura guardada en tus descargas');
    });
  }, { size: 17, color: 0x4a6a9a });
  const bOk = button(s, W / 2 + 130, 520, 230, 34, 'Continuar', () => capa.destroy(), { size: 18, color: UI.gold });
  capa.add([bCap, bOk]);
  return capa;
}
