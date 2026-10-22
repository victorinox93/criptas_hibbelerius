import Phaser from 'phaser';
import { W } from '../config';
import { Game } from '../state';

// ════════════════════════════════════════════════════════════════
//  v0.67 · DITHERING DE LA LOCURA
//  Mientras más Locura, más se «pixela» el FONDO del combate y del mapa:
//  se redibuja con 4 tonos y un patrón de puntos (dithering ordenado de Bayer).
//    · Locura < 40: nada.
//    · 40–69: tonos del lugar (verde en el Abismo), cada vez más fuerte.
//    · 70+: violeta y el patrón vibra.
//  Sólo afecta la capa del fondo (los objetos con profundidad < 0): personajes,
//  cartas, textos y barras quedan nítidos. Sólo con WebGL; en Canvas no hace nada.
// ════════════════════════════════════════════════════════════════

const FRAG = `
#define SHADER_NAME CRIPTAS_DITHER_FS
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uPixel;
uniform float uGain;
uniform float uShift;
uniform vec3 uPal0;
uniform vec3 uPal1;
uniform vec3 uPal2;
uniform vec3 uPal3;
varying vec2 outTexCoord;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec4 orig = texture2D(uMainSampler, outTexCoord);
  if (uIntensity <= 0.001) { gl_FragColor = orig; return; }
  vec2 celda = uPixel / uResolution;
  vec2 c = floor(outTexCoord / celda);
  vec3 col = texture2D(uMainSampler, (c + 0.5) * celda).rgb;
  float l = clamp(dot(col, vec3(0.3, 0.59, 0.11)) * uGain, 0.0, 1.0) * 3.0;
  float i0 = floor(l);
  float idx = i0 + step(bayer4(c + uShift), l - i0);
  vec3 p = idx < 0.5 ? uPal0 : idx < 1.5 ? uPal1 : idx < 2.5 ? uPal2 : uPal3;
  gl_FragColor = vec4(mix(orig.rgb, p, uIntensity), orig.a);
}`;

const hex = (h: number) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255] as const;
const PALETAS = {
  abismo: [0x030807, 0x0e2a24, 0x1f4a3e, 0x3a7a64],
  criptas: [0x060508, 0x1c1722, 0x3a3046, 0x6a5a7a],
  locura: [0x05020c, 0x2a0f48, 0x6a2a9a, 0xc070ff],
};

export class DitherPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  intensidad = 0;
  ganancia = 5;
  pixel = 3;
  desfase = 0;
  paleta: number[] = PALETAS.abismo;
  constructor(game: Phaser.Game) {
    super({ game, name: 'Dither', fragShader: FRAG });
  }
  onPreRender() {
    this.set1f('uIntensity', this.intensidad);
    this.set1f('uGain', this.ganancia);
    this.set1f('uShift', this.desfase);
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
    this.set1f('uPixel', this.pixel * (this.renderer.width / W));
    this.paleta.forEach((c, i) => { const [r, g, b] = hex(c); this.set3f(`uPal${i}`, r, g, b); });
  }
}

/**
 * Junta el fondo de la escena (todo lo que tiene profundidad < 0) en un contenedor con el filtro
 * y lo actualiza con la Locura de la partida. Llamar al final de create().
 */
export function ditherLocura(s: Phaser.Scene) {
  const r = s.renderer;
  if (!(r instanceof Phaser.Renderer.WebGL.WebGLRenderer)) return;
  if (!r.pipelines.postPipelineClasses.has('Dither')) r.pipelines.addPostPipeline('Dither', DitherPipeline);
  const fondo = s.children.list.filter((o) => (o as unknown as { depth: number }).depth < 0 && !(o instanceof Phaser.GameObjects.Container));
  if (!fondo.length) return;
  fondo.sort((a, b) => (a as unknown as { depth: number }).depth - (b as unknown as { depth: number }).depth);
  const minD = (fondo[0] as unknown as { depth: number }).depth;
  const capa = s.add.container(0, 0).setDepth(minD);
  capa.add(fondo);
  capa.setPostPipeline('Dither');
  const fx = capa.getPostPipeline('Dither') as DitherPipeline;
  if (!fx) return;
  const abismo = Game.run?.modo === 'abismo';
  const actualizar = () => {
    const loc = Game.run?.entropia ?? 0;
    if (loc < 40) { fx.intensidad = 0; return; }
    if (loc < 70) {
      fx.paleta = abismo ? PALETAS.abismo : PALETAS.criptas;
      fx.intensidad = 0.55 + (0.45 * (loc - 40)) / 30;
      fx.ganancia = 5;
      fx.desfase = 0;
    } else {
      fx.paleta = PALETAS.locura;
      fx.intensidad = 1;
      fx.ganancia = 7;
      fx.desfase = Math.floor(s.time.now / 240) % 4; // el patrón vibra
    }
  };
  actualizar();
  s.time.addEvent({ delay: 120, loop: true, callback: actualizar });
}
