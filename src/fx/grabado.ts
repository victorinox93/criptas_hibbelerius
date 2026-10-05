import Phaser from 'phaser';
import { RES } from '../config';

// ════════════════════════════════════════════════════════════════
//  ESTILO GRABADO (experimental): un filtro sobre toda la pantalla
//  inspirado en el arte de tinta y tramado de juegos como Vermis.
//  Convierte la imagen a pocos tonos (tinta, sombra, hueso) con un
//  tramado ordenado (Bayer 4×4), conserva un poco de los colores
//  muy saturados (sangre, oro, brillos) y agrega grano de papel.
//  Se activa con el botón del pincel, arriba a la derecha.
// ════════════════════════════════════════════════════════════════

const FRAG = `
#define SHADER_NAME GRABADO_FS
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uCell;
varying vec2 outTexCoord;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec4 c = texture2D(uMainSampler, outTexCoord);
  float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  // curva de contraste: aclara medios tonos para que el tramado se lea
  float l = clamp(pow(lum, 0.75) * 1.35 - 0.02, 0.0, 1.0);
  vec2 px = floor(gl_FragCoord.xy / uCell);
  float d = bayer4(px) - 0.5;
  float q = clamp(floor(l * 3.0 + 0.5 + d * 0.9), 0.0, 3.0) / 3.0;
  vec3 ink = vec3(0.035, 0.028, 0.03);
  vec3 shade = vec3(0.20, 0.17, 0.15);
  vec3 mid = vec3(0.47, 0.42, 0.36);
  vec3 bone = vec3(0.86, 0.81, 0.70);
  vec3 col = q < 0.34 ? mix(ink, shade, q * 3.0) : q < 0.67 ? mix(shade, mid, (q - 0.333) * 3.0) : mix(mid, bone, (q - 0.667) * 3.0);
  // los colores muy saturados sobreviven (sangre, oro, brillos mágicos)
  float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
  float sat = mx > 0.0 ? (mx - mn) / mx : 0.0;
  col = mix(col, c.rgb * 1.15, smoothstep(0.45, 0.8, sat) * smoothstep(0.25, 0.55, mx) * 0.75);
  // grano de papel
  col += (hash(px + floor(uTime * 12.0)) - 0.5) * 0.035;
  gl_FragColor = vec4(col, c.a);
}
`;

export class GrabadoFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game: Phaser.Game) {
    super({ game, name: 'Grabado', fragShader: FRAG });
  }
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set1f('uCell', RES);
  }
}

const KEY = 'criptas:grabado';
export function grabadoOn(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

/** Aplica (o quita) el filtro a una escena */
export function applyGrabado(scene: Phaser.Scene, on = grabadoOn()) {
  if (scene.sys.settings.key === 'Overlay') return;
  if (scene.game.renderer.type !== Phaser.WEBGL) return;
  const cam = scene.cameras.main;
  if (on) cam.setPostPipeline(GrabadoFX);
  else cam.removePostPipeline('Grabado');
}

export function toggleGrabado(game: Phaser.Game) {
  const on = !grabadoOn();
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* sin almacenamiento */ }
  for (const sc of game.scene.getScenes(true)) applyGrabado(sc, on);
  return on;
}
