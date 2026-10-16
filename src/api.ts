import { API_URL } from './backend';

export const isOnline = () => API_URL.trim().length > 0;

/** ¿Es un error pasajero del servidor (ocupado, candado, red)? Entonces vale la pena reintentar. */
function pasajero(msg: string) {
  return /OCUPADO|lock|timeout|tiempo|ocupado|Failed to fetch|NetworkError|Load failed|Service invoked too many times/i.test(msg);
}
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call<T = any>(action: string, payload: Record<string, unknown>): Promise<T> {
  // v0.41.1: si el servidor está ocupado (muchos alumnos a la vez), reintenta solo hasta 3 veces
  let ultimo = '';
  for (let intento = 0; intento < 3; intento++) {
    if (intento) await esperar(1500 * 2 ** (intento - 1) + Math.random() * 800);
    try {
      // text/plain evita la verificación CORS "preflight" que Apps Script no soporta
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload }),
      });
      const j = await res.json();
      if (j.ok) return j as T;
      ultimo = String(j.error || 'Error del servidor');
    } catch (e) {
      ultimo = (e as Error).message || 'Sin conexión';
    }
    if (!pasajero(ultimo)) break;
  }
  if (pasajero(ultimo)) throw new Error('El servidor está muy ocupado (muchos jugadores a la vez). Espera unos segundos e inténtalo de nuevo.');
  throw new Error(ultimo);
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
  grimorio?: string; // JSON
  expediciones?: number; // v0.29: partidas terminadas según la hoja
}

export interface RankRow {
  alias: string;
  avatar: string;
  grupo: string;
  puntaje: number;
  piso: number;
  victorias: number;
  gravedad: number;
  partidas: number;
  yo: boolean;
  lugar: number;
}

export interface Huella {
  id: number;
  alias: string;
  tipo: 'lapida' | 'signo';
  piso: number;
  jefe: string;
  datos: string; // JSON
}

export interface Estadisticas {
  partidas: number; victorias: number; derrotas: number; abandonadas: number;
  minutos: number; mejorPiso: number; mejorActo: number;
  combates?: number; elites?: number; jefes?: Record<string, number>; // v0.31.2
  causas: [string, number][];
  temas: [string, number, number][]; // [concepto, aciertos, intentos]
}

export const api = {
  huellas: (token: string, acto: number) => call<{ ok: true; lapidas: Huella[]; signos: Huella[] }>('huellas', { token, acto }),
  avisos: (token: string) => call<{ ok: true; ayudas: number; honras: number; ayudantes: string[] }>('avisos', { token }),
  estadisticas: (token: string) => call<{ ok: true } & Estadisticas>('estadisticas', { token }),
  register: (matricula: string, passHash: string, grupo: string) =>
    call<LoginResp>('register', { matricula, passHash, grupo }),
  login: (matricula: string, passHash: string) => call<LoginResp>('login', { matricula, passHash }),
  saveProfile: (token: string, alias: string, avatar: string) => call('saveProfile', { token, alias, avatar }),
  startRun: (token: string, clase: string, gravedad = 1) => call<{ ok: true; runId: string }>('startRun', { token, clase, gravedad }),
  leaderboard: (token: string, alcance: 'grupo' | 'todos', modo: 'normal' | 'abismo' = 'normal') =>
    call<{ ok: true; grupo: string; total: number; lista: RankRow[]; modo?: string }>('leaderboard', { token, alcance, modo }),
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
