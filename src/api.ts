import { API_URL } from './backend';

export const isOnline = () => API_URL.trim().length > 0;

async function call<T = any>(action: string, payload: Record<string, unknown>): Promise<T> {
  // text/plain evita la verificación CORS "preflight" que Apps Script no soporta
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || 'Error del servidor');
  return j as T;
}

export async function hashPass(matricula: string, pass: string): Promise<string> {
  const data = new TextEncoder().encode(`${matricula.trim().toUpperCase()}::${pass}::criptas`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface LoginResp {
  ok: true;
  token: string;
  matricula: string;
  grupo: string;
  alias: string;
  avatar: string; // JSON
}

export const api = {
  register: (matricula: string, passHash: string, grupo: string) =>
    call<LoginResp>('register', { matricula, passHash, grupo }),
  login: (matricula: string, passHash: string) => call<LoginResp>('login', { matricula, passHash }),
  saveProfile: (token: string, alias: string, avatar: string) => call('saveProfile', { token, alias, avatar }),
  startRun: (token: string, clase: string) => call<{ ok: true; runId: string }>('startRun', { token, clase }),
};

// ── Cola de registro "dispara y olvida": nunca bloquea el juego ──
type Pending = { action: string; payload: Record<string, unknown> };
const queue: Pending[] = [];
let flushing = false;

async function flush() {
  if (flushing || !isOnline()) return;
  flushing = true;
  while (queue.length) {
    const item = queue[0];
    try {
      await call(item.action, item.payload);
      queue.shift();
    } catch (e) {
      console.warn('[registro] reintento más tarde', e);
      break;
    }
  }
  flushing = false;
  if (queue.length) setTimeout(flush, 8000);
}

export function enqueue(action: string, payload: Record<string, unknown>) {
  if (!isOnline()) return;
  queue.push({ action, payload });
  flush();
}
