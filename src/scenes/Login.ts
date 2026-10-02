import Phaser from 'phaser';
import { api, hashPass, isOnline } from '../api';
import { CSS } from '../art/palette';
import { GAME_TITLE, VERSION, W } from '../config';
import { Game, loadLocal, rememberSession, restoreSession, Avatar } from '../state';
import { dungeonBackground, embers, fadeTo, panel, title, txt } from '../ui/widgets';

export class LoginScene extends Phaser.Scene {
  constructor() { super('Login'); }

  create() {
    this.cameras.main.fadeIn(400);
    dungeonBackground(this, 11);
    embers(this);

    // Sesión ya abierta en esta pestaña
    const prev = restoreSession();
    if (prev) {
      Game.profile = prev;
      const local = loadLocal();
      if (!Game.profile.avatar && local.avatar) Game.profile.avatar = local.avatar;
      Game.run = local.run;
      this.time.delayedCall(10, () => fadeTo(this, Game.profile!.avatar ? 'Menu' : 'Avatar'));
      return;
    }

    title(this, W / 2, 62, GAME_TITLE, 54);
    txt(this, W / 2, 104, 'Un roguelike de Dinámica · Leyes de Newton y Energía', 22, CSS.dim).setOrigin(0.5);
    txt(this, W - 12, 530, VERSION, 16, '#4a3f55').setOrigin(1, 1);

    // Coloso al fondo
    const col = this.add.image(W / 2 + 330, 300, 'colossus').setScale(5).setAlpha(0.18).setTint(0x8e5bb0);
    this.tweens.add({ targets: col, y: 306, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    panel(this, W / 2 - 220, 128, 440, isOnline() ? 392 : 290);

    const online = isOnline();
    const html = online
      ? `
      <div class="form">
        <div class="tabs"><div class="tab on" data-t="login">Entrar</div><div class="tab" data-t="reg">Crear cuenta</div></div>
        <label>Matrícula</label><input id="mat" autocomplete="username" maxlength="12" />
        <label>Contraseña</label><input id="pass" type="password" autocomplete="current-password" maxlength="40" />
        <div id="regf" class="hide">
          <label>Confirmar contraseña</label><input id="pass2" type="password" autocomplete="new-password" maxlength="40" />
          <label>Clave de grupo (te la da tu profesor)</label><input id="grp" maxlength="20" />
        </div>
        <button class="go" id="go">Entrar a las criptas</button>
        <div class="msg" id="msg"></div>
      </div>`
      : `
      <div class="form">
        <label>Matrícula (o un alias)</label><input id="mat" maxlength="12" />
        <button class="go" id="go">Jugar</button>
        <div class="msg" id="msg"></div>
        <div class="note">Modo sin conexión: tu progreso se guarda sólo en este navegador y no se reporta al profesor.</div>
      </div>`;

    const dom = this.add.dom(W / 2, online ? 322 : 270).createFromHTML(html);
    const el = dom.node as HTMLElement;
    const $ = (id: string) => el.querySelector('#' + id) as HTMLInputElement;
    let mode: 'login' | 'reg' = 'login';

    el.querySelectorAll('.tab').forEach((t) =>
      t.addEventListener('click', () => {
        mode = (t as HTMLElement).dataset.t as 'login' | 'reg';
        el.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === t));
        $('regf').classList.toggle('hide', mode === 'login');
        $('go').textContent = mode === 'login' ? 'Entrar a las criptas' : 'Crear mi cuenta';
        $('msg').textContent = '';
      }),
    );

    const msg = (m: string, ok = false) => {
      $('msg').textContent = m;
      $('msg').classList.toggle('ok', ok);
    };

    const submit = async () => {
      const mat = $('mat').value.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,12}$/.test(mat)) return msg('Matrícula inválida (3–12 letras o números).');

      if (!online) {
        Game.profile = { matricula: mat, grupo: 'local', token: '', offline: true, avatar: null };
        return this.enter();
      }

      const pass = $('pass').value;
      if (pass.length < 6) return msg('La contraseña debe tener al menos 6 caracteres.');
      if (mode === 'reg') {
        if (pass !== $('pass2').value) return msg('Las contraseñas no coinciden.');
        if (!$('grp').value.trim()) return msg('Escribe la clave de grupo.');
      }
      ($('go') as unknown as HTMLButtonElement).disabled = true;
      msg('Consultando el grimorio…', true);
      try {
        const h = await hashPass(mat, pass);
        const r = mode === 'reg' ? await api.register(mat, h, $('grp').value.trim().toUpperCase()) : await api.login(mat, h);
        let avatar: Avatar | null = null;
        try { avatar = r.avatar ? JSON.parse(r.avatar) : null; } catch { avatar = null; }
        Game.profile = { matricula: r.matricula, grupo: r.grupo, token: r.token, offline: false, avatar };
        this.enter();
      } catch (e) {
        msg((e as Error).message || 'No se pudo conectar.');
        ($('go') as unknown as HTMLButtonElement).disabled = false;
      }
    };
    $('go').addEventListener('click', submit);
    el.addEventListener('keydown', (ev) => { if ((ev as KeyboardEvent).key === 'Enter') submit(); });
  }

  enter() {
    const local = loadLocal();
    if (!Game.profile!.avatar && local.avatar) Game.profile!.avatar = local.avatar;
    Game.run = local.run && !local.run.done ? local.run : null;
    rememberSession();
    fadeTo(this, Game.profile!.avatar ? 'Menu' : 'Avatar');
  }
}
