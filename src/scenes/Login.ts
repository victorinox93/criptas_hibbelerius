import Phaser from 'phaser';
import { api, hashPass, isOnline } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { VERSION, W } from '../config';
import { Game, loadLocal, rememberSession, restoreSession, Avatar } from '../state';
import { T } from '../textos';
import { button, Btn, dungeonBackground, embers, fadeTo, frame, TextField, title, txt } from '../ui/widgets';

export class LoginScene extends Phaser.Scene {
  constructor() { super('Login'); }

  create() {
    this.cameras.main.fadeIn(400);
    audio.play('menu');
    dungeonBackground(this, 11);
    embers(this);

    const prev = restoreSession();
    if (prev) {
      Game.profile = prev;
      const local = loadLocal();
      if (!Game.profile.avatar && local.avatar) Game.profile.avatar = local.avatar;
      Game.run = local.run && !local.run.done ? local.run : null;
      this.time.delayedCall(10, () => fadeTo(this, Game.profile!.avatar ? 'Menu' : 'Avatar'));
      return;
    }

    title(this, W / 2, 62, T.titulo, 54);
    txt(this, W / 2, 104, T.subtitulo, 22, CSS.dim).setOrigin(0.5);
    txt(this, W - 12, 530, VERSION, 16, '#4a3f55').setOrigin(1, 1);

    const col = this.add.image(W / 2 + 330, 300, 'colossus').setScale(5).setAlpha(0.1).setTint(0x6d4a8a);
    this.tweens.add({ targets: col, y: 306, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const pg = this.add.graphics();
    const online = isOnline();
    const L = (x: number, y: number, s: string) => txt(this, x, y, s, 20, CSS.dim);
    const cx = W / 2;
    const left = cx - 190;
    const msg = txt(this, cx, 0, '', 20, CSS.blood, { align: 'center' }).setOrigin(0.5, 0);
    const say = (m: string, ok = false) => msg.setText(m).setColor(ok ? CSS.green : CSS.blood);

    if (!online) {
      frame(pg, cx - 220, 130, 440, 270);
      L(left, 160, T.login.matriculaOffline);
      const mat = new TextField(this, cx, 204, 380, { upper: true, maxLength: 12, onEnter: () => go() });
      const go = () => {
        const m = mat.value.trim().toUpperCase();
        if (!/^[A-Z0-9_-]{3,12}$/.test(m)) return say(T.login.errMatricula);
        Game.profile = { matricula: m, grupo: 'local', token: '', offline: true, avatar: null };
        this.enter();
      };
      button(this, cx, 264, 380, 46, T.login.botonJugar, go, { color: UI.blood });
      msg.setY(296);
      txt(this, cx, 334, T.login.notaOffline, 18, CSS.dim, { align: 'center' }).setOrigin(0.5, 0);
      this.time.delayedCall(400, () => mat.focus());
      return;
    }

    let mode: 'login' | 'reg' = 'login';
    L(left, 188, T.login.matricula);
    const mat = new TextField(this, cx, 226, 380, { upper: true, maxLength: 12, onEnter: () => go() });
    L(left, 250, T.login.contrasena);
    const pass = new TextField(this, cx, 288, 380, { password: true, maxLength: 40, onEnter: () => go() });
    const l3 = L(left, 312, T.login.confirmar);
    const pass2 = new TextField(this, cx, 350, 380, { password: true, maxLength: 40, onEnter: () => go() });
    const l4 = L(left, 374, T.login.grupo);
    const grp = new TextField(this, cx, 412, 380, { upper: true, maxLength: 20, onEnter: () => go() });

    const tabs: Btn[] = [];
    const goBtn = button(this, cx, 0, 380, 46, '', () => go(), { color: UI.blood });
    const layout = () => {
      const reg = mode === 'reg';
      [l3, l4].forEach((o) => o.setVisible(reg));
      pass2.setVisible(reg);
      grp.setVisible(reg);
      pg.clear();
      frame(pg, cx - 220, 130, 440, reg ? 392 : 282);
      goBtn.setY(reg ? 466 : 346);
      goBtn.label.setText(reg ? T.login.botonCrear : T.login.botonEntrar);
      msg.setY(reg ? 492 : 374);
      tabs.forEach((t, i) => t.setEnabled(true).label.setColor((i === 0) === !reg ? CSS.gold : CSS.dim));
      say('');
    };
    tabs.push(button(this, cx - 98, 160, 186, 36, T.login.entrar, () => { mode = 'login'; layout(); }, { size: 22 }));
    tabs.push(button(this, cx + 98, 160, 186, 36, T.login.crear, () => { mode = 'reg'; layout(); }, { size: 22 }));
    layout();
    this.time.delayedCall(400, () => mat.focus());

    let busy = false;
    const go = async () => {
      if (busy) return;
      const m = mat.value.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,12}$/.test(m)) return say(T.login.errMatricula);
      if (pass.value.length < 6) return say(T.login.errContrasena);
      if (mode === 'reg') {
        if (pass.value !== pass2.value) return say(T.login.errNoCoinciden);
        if (!grp.value.trim()) return say(T.login.errGrupo);
      }
      busy = true;
      goBtn.setEnabled(false);
      say(T.login.consultando, true);
      try {
        const h = await hashPass(m, pass.value);
        const r = mode === 'reg' ? await api.register(m, h, grp.value.trim().toUpperCase()) : await api.login(m, h);
        let avatar: Avatar | null = null;
        try { avatar = r.avatar ? JSON.parse(r.avatar) : null; } catch { avatar = null; }
        Game.profile = { matricula: r.matricula, grupo: r.grupo, token: r.token, offline: false, avatar };
        this.enter();
      } catch (e) {
        say((e as Error).message || 'No se pudo conectar.');
        goBtn.setEnabled(true);
        busy = false;
      }
    };
  }

  enter() {
    const local = loadLocal();
    if (!Game.profile!.avatar && local.avatar) Game.profile!.avatar = local.avatar;
    Game.run = local.run && !local.run.done ? local.run : null;
    rememberSession();
    fadeTo(this, Game.profile!.avatar ? 'Menu' : 'Avatar');
  }
}
