// Simulador: expediciones completas de un Caballero sin desbloqueos (Tierra, nivel 1).
// Los combates son los REALES (escena Combat); los nodos sin combate se resuelven con reglas simples.
// Uso: node sim.mjs <config: base|menos> <runs> <pages>
import { chromium } from 'playwright';
const CONFIG = process.argv[2] ?? 'base';
const RUNS = Number(process.argv[3] ?? 4);
const PAGES = Number(process.argv[4] ?? 2);
const ACIERTO = 0.75; // probabilidad de que el «alumno» conteste bien una runa / eco / encuentro

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
let pendientes = RUNS;

async function worker(wi) {
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  const W = (ms) => p.waitForTimeout(ms);
  const active = () => p.evaluate(() => window.__criptas?.game.scene.getScenes(true).map((s) => s.scene.key).filter((k) => k !== 'Overlay') ?? []);
  const ws = async (k) => { for (let i = 0; i < 200; i++) { const a = await active(); if (a[0] === k) return; await W(150); } throw new Error('timeout ' + k); };
  await p.goto('http://localhost:5175/?res=1');
  await ws('Title'); await W(400); await p.mouse.click(480, 300); await ws('Login');
  await p.mouse.click(480, 204); await p.keyboard.type(`sim${wi}${Date.now() % 10000}`); await p.keyboard.press('Enter'); await ws('Avatar');
  await p.mouse.click(188, 112); await p.keyboard.type('Sim'); await p.mouse.click(650, 512); await ws('Menu');

  while (pendientes > 0) {
    pendientes--;
    const t0 = Date.now();
    await p.evaluate(async (cfg) => {
      const S = await import('/src/state.ts');
      const G = window.__criptas.Game;
      G.codex = S.emptyCodex();
      G.codex.flags = ['primera', 'acto1-visto'];
      const r = S.newRun('SIM-' + Math.random().toString(36).slice(2, 7), 1, 'caballero');
      if (cfg === 'menos') { const i = r.deck.findIndex((c) => c.id === 'normal'); r.deck.splice(i, 1); }
      G.run = r;
      window.__sim = { combates: 0, elites: 0, log: [] };
      const s = window.__criptas.game.scene.getScenes(true).find((x) => x.scene.key !== 'Overlay');
      s.scene.start('Glosario');
    }, CONFIG);
    await ws('Glosario');
    let fin = null;
    for (let paso = 0; paso < 400 && !fin; paso++) {
      // 1) elegir y resolver el siguiente nodo
      const nodo = await p.evaluate(async (ACIERTO) => {
        const S = await import('/src/state.ts');
        const C = await import('/src/data/cards.ts');
        const R = await import('/src/data/relics.ts');
        const RW = await import('/src/scenes/Reward.ts');
        const FG = await import('/src/data/figures.ts');
        const G = window.__criptas.Game, r = G.run;
        const cur = r.map.find((n) => n.id === r.pos);
        const ids = cur ? cur.next : r.map.filter((n) => n.floor === 0).map((n) => n.id);
        const opts = ids.map((id) => r.map.find((n) => n.id === id));
        const vida = r.hp / r.maxHp;
        const peso = (n) => {
          if (n.type === 'jefe') return 100;
          if (n.type === 'fogata') return vida < 0.5 ? 9 : 2;
          if (n.type === 'elite') return vida > 0.7 ? 4 : 0.5;
          if (n.type === 'runa' || n.type === 'santuario') return 4;
          if (n.type === 'mercader') return r.ergios >= 90 ? 4 : 1;
          return 3;
        };
        let tot = opts.reduce((a, n) => a + peso(n), 0), x = Math.random() * tot, n = opts[0];
        for (const o of opts) { x -= peso(o); if (x <= 0) { n = o; break; } }
        r.pos = n.id; r.visited.push(n.id); r.floor = n.floor;
        Object.assign(window.__sim, { acto: r.acto, piso: n.floor, mazo: r.deck.length, reliquias: r.relics.length, hp: r.hp });
        const ok = Math.random() < ACIERTO;
        const pool = C.rewardPool('caballero', r.acto, S.nivelActual());
        switch (n.type) {
          case 'combate': case 'elite': case 'jefe':
            return { combate: n.type === 'jefe' ? 'boss' : n.type === 'elite' ? 'elite' : n.floor <= 1 ? 'easy' : 'normal', floor: n.floor };
          case 'fogata': {
            if (r.hp < r.maxHp * 0.8) r.hp = Math.min(r.maxHp, r.hp + Math.round(r.maxHp * 0.3));
            else { const c = r.deck.find((c) => !c.up); if (c) c.up = true; } // forjar
            break;
          }
          case 'runa': // altar: reliquia si contesta bien
            if (ok) { const rel = R.RELIC_POOL.filter((id) => !r.relics.includes(id)); if (rel.length) RW.grantRelic(rel[Math.floor(Math.random() * rel.length)]); }
            break;
          case 'santuario': { // eco: un don (épico si contesta bien)
            const figs = FG.FIGURES.filter((f) => !f.act || r.acto >= f.act);
            const f = figs[Math.floor(Math.random() * figs.length)];
            const id = f.boons[Math.floor(Math.random() * f.boons.length)];
            if (!r.boons.some((b) => b.id === id)) r.boons.push({ id, epic: ok });
            break;
          }
          case 'evento':
            if (ok) { S.addErgios(25); r.hp = Math.min(r.maxHp, r.hp + 6); } else r.hp = Math.max(1, r.hp - 6);
            break;
          case 'mercader':
            if (r.ergios >= 75) { S.addErgios(-75); S.addCard(pool[Math.floor(Math.random() * pool.length)]); }
            break;
          default: break; // taberna
        }
        return { combate: null, tipo: n.type };
      }, ACIERTO);
      if (process.env.V) console.log(wi, paso, JSON.stringify(nodo));
      if (!nodo.combate) continue;
      // 2) combate real
      await p.evaluate((d) => { const s = window.__criptas.game.scene.getScenes(true).find((x) => x.scene.key !== 'Overlay'); s.scene.start('Combat', d); }, { kind: nodo.combate, floor: nodo.floor });
      await ws('Combat');
      let estado = 'Combat';
      for (let k = 0; k < 2500; k++) {
        const a = await active();
        estado = a[0];
        if (estado !== 'Combat') break;
        const dbg = await p.evaluate(async () => {
          const s = window.__criptas.game.scene.getScene('Combat');
          window.__dbg = { php: window.__criptas.Game.run?.hp, blk: s.block, fr: s.friccion, en: s.enemies?.map((e) => e.st.def.id + ':' + JSON.stringify(e.st.intent)).join(' '), busy: s.busy, turn: s.turn, e: s.energy, hand: s.hand?.map((c) => c.inst.id).join(','), hp: s.enemies?.map((e) => e.st.hp).join('/') };
          s.time.timeScale = 40; s.tweens.timeScale = 40;
          if (s.busy || !s.hand || s.turn === 0 || s.bannerT?.getData('dead')) return;
          const C = (await import('/src/data/cards.ts')).CARDS;
          const al = s.enemies.filter((e) => !e.dead && e.st.hp > 0);
          if (!al.length) return;
          let inc = 0;
          for (const e of al) { const it = e.st.intent; if (it.kind === 'attack') inc += it.dmg * (it.hits ?? 1); else if (it.dmg) inc += it.dmg; }
          const pl = s.hand.filter((c) => !C[c.inst.id].unplayable && s.cost(c) <= s.energy);
          const tipo = (c) => C[c.inst.id].type;
          const defs = pl.filter((c) => tipo(c) === 'Defensa');
          const atks = pl.filter((c) => tipo(c) === 'Ataque');
          const otros = pl.filter((c) => tipo(c) !== 'Defensa' && tipo(c) !== 'Ataque');
          const obj = al.reduce((x, y) => (y.st.hp < x.st.hp ? y : x));
          let c = null;
          const r = window.__criptas.Game.run;
          const atkDmg = atks.length; // aproximado: cuántos golpes puedo dar
          const peligro = inc - s.block >= 10 || (inc - s.block >= 5 && r.hp < r.maxHp * 0.5) || inc - s.block >= r.hp;
          const remata = al.length === 1 && obj.st.hp <= 8 * Math.min(atkDmg, s.energy);
          if (defs.length && peligro && !remata) c = defs[0];
          else if (otros.length) c = otros[0];
          else if (atks.length) c = atks[0];
          else if (defs.length) c = defs[0];
          if (c) { window.__dbg.play = c.inst.id + '→' + obj.st.def.id; await s.playOn(c, obj); window.__dbg.e2 = s.energy; window.__dbg.hp2 = s.enemies.map((e) => e.st.hp).join('/'); return; }
          window.__dbg.play = 'END';
          s.endTurn();
        }).then(() => p.evaluate(() => JSON.stringify(window.__dbg))).catch((e) => 'ERR ' + e.message);
        if (process.env.V && (process.env.V === '2' || k % 10 === 0)) console.log(wi, 'k', k, dbg);
        await W(50);
      }
      if (process.env.V) console.log(wi, 'fin combate', estado);
      if (estado === 'Reward') {
        await p.evaluate(async () => {
          const S = await import('/src/state.ts'); const C = await import('/src/data/cards.ts');
          const r = window.__criptas.Game.run; window.__sim.combates++;
          const pool = C.rewardPool('caballero', r.acto, S.nivelActual());
          if (Math.random() < 0.8) S.addCard(pool[Math.floor(Math.random() * pool.length)]);
          const s = window.__criptas.game.scene.getScenes(true).find((x) => x.scene.key !== 'Overlay'); s.scene.start('Glosario');
        });
        await ws('Glosario');
      } else if (estado === 'ActTransition') {
        await p.evaluate(async () => {
          const S = await import('/src/state.ts'); const C = await import('/src/data/cards.ts'); const R = await import('/src/data/relics.ts'); const RW = await import('/src/scenes/Reward.ts');
          const r = window.__criptas.Game.run;
          const to = (r.acto ?? 1) + 1;
          r.hp = Math.min(r.maxHp, r.hp + Math.ceil((r.maxHp - r.hp) * 0.75));
          const br = R.BOSS_RELICS.filter((id) => !r.relics.includes(id)); if (br.length) RW.grantRelic(br[Math.floor(Math.random() * br.length)]);
          const lg = C.legendariasDisponibles(r.deck, 1); if (lg.length) S.addCard(lg[0]);
          r.acto = to; r.map = S.generateMap(to); r.pos = -1; r.visited = []; r.floor = 0; r.shop = undefined;
          const s = window.__criptas.game.scene.getScenes(true).find((x) => x.scene.key !== 'Overlay'); s.scene.start('Glosario');
        });
        await ws('Glosario');
      } else if (estado === 'End') {
        fin = await p.evaluate(() => { const s = window.__criptas.game.scene.getScene('End'); const d = s.sys.settings.data; const m = window.__sim; return { victoria: !!d.victory, by: d.by ?? '', acto: m.acto, piso: m.piso, mazo: m.mazo, reliquias: m.reliquias, combates: m.combates }; });
        // Game.run queda en null tras End; lo leemos antes
      } else {
        fin = { error: 'estado ' + estado };
      }
    }
    fin ??= { error: 'sin fin' };
    fin.min = Math.round((Date.now() - t0) / 6000) / 10;
    fin.cfg = CONFIG;
    results.push(fin);
    console.log(JSON.stringify(fin));
  }
  if (errs.length) console.log('errores', wi, [...new Set(errs)].slice(0, 5).join(' | '));
}
await Promise.all(Array.from({ length: PAGES }, (_, i) => worker(i)));
const v = results.filter((r) => r.victoria).length;
console.log(`RESUMEN ${CONFIG}: ${v}/${results.length} victorias`);
const porActo = {};
for (const r of results.filter((r) => !r.victoria && !r.error)) porActo[r.acto] = (porActo[r.acto] ?? 0) + 1;
console.log('muertes por acto', JSON.stringify(porActo));
await b.close();
