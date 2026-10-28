# v0.76 · Rescatados y criaturas del Núcleo (misma paleta y herramientas que mythos.py)
# Uso: python3 tools/arte/rescatados.py [vista.png] → escribe src/art/rescatados_sprites.ts
# Mismas herramientas y paleta que tools/arte/abismo.py (todo con figuras → matrices de letras).
import math, sys

PAL = {
    'k': '#050909', 'd': '#0d1918', 'g': '#1c3632', 'G': '#2c5a4e', 't': '#4a8a74',
    'w': '#c4d6bc', 'W': '#eef4e6', 's': '#86a68c', 'S': '#56785f',
    'p': '#24163a', 'P': '#563880', 'v': '#9a6ad0',
    'E': '#b8ff9a', 'F': '#ff4a6a', 'y': '#d0ae4a', 'Y': '#7a6424',
    'r': '#4e1626', 'R': '#a43a4c', 'b': '#16264a', 'B': '#3a5a8a',
    'l': '#5e6e6c', 'L': '#a4b4ac', 'n': '#2a2016', 'c': '#7fe8d8',
    'h': '#d8c040', 'H': '#8a7418', 'm': '#e070d0', 'M': '#7a2a8a', 'u': '#3a8a5a', 'U': '#1e4a32', 'i': '#e8d8f0',
}

def canvas(w, h): return [['.'] * w for _ in range(h)]
def P(g, x, y, ch):
    x, y = int(round(x)), int(round(y))
    if 0 <= y < len(g) and 0 <= x < len(g[0]): g[y][x] = ch
def rect(g, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): P(g, x, y, ch)
def disc(g, cx, cy, r, ch, ry=None):
    ry = ry or r
    for y in range(len(g)):
        for x in range(len(g[0])):
            if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1: g[y][x] = ch
def line(g, x0, y0, x1, y1, ch, w=1):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1):
        t = i / max(1, n)
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        P(g, x, y, ch)
        if w > 1: P(g, x + 1, y, ch); P(g, x, y + 1, ch)
def poly(g, pts, ch):
    h, w = len(g), len(g[0])
    for y in range(h):
        for x in range(w):
            px, py = x + 0.5, y + 0.5
            inside = False; j = len(pts) - 1
            for i in range(len(pts)):
                xi, yi = pts[i]; xj, yj = pts[j]
                if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi + 1e-9) + xi: inside = not inside
                j = i
            if inside: g[y][x] = ch
def arc(g, cx, cy, r, a0, a1, ch, ry=None, paso=3):
    ry = ry or r
    for a in range(a0, a1 + 1, paso): P(g, cx + r * math.cos(math.radians(a)), cy + ry * math.sin(math.radians(a)), ch)
def outline(g, ch='k'):
    h, w = len(g), len(g[0]); out = [row[:] for row in g]
    for y in range(h):
        for x in range(w):
            if g[y][x] != '.': continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and g[yy][xx] not in '.k': out[y][x] = ch; break
    return out
def shade(g, a, b, side='right', frac=0.35):
    for row in g:
        xs = [x for x, c in enumerate(row) if c == a]
        if not xs: continue
        n = max(1, int(len(xs) * frac))
        for x in (xs[-n:] if side == 'right' else xs[:n]): row[x] = b
def rows(g): return [''.join(r) for r in g]
def ojo(g, x, y, ch='E'): P(g, x, y, ch)

# ════════ v0.76 · RESCATADOS DEL JUEGO BASE y CRIATURAS DEL NÚCLEO (IA) ════════
S = {}
# Uso: python3 tools/arte/rescatados.py [vista.png] → escribe src/art/rescatados_sprites.ts

def engrane(g, cx, cy, r, dientes, ch, ch2, hueco=0.45):
    disc(g, cx, cy, r, ch)
    for i in range(dientes):
        a = 2 * math.pi * i / dientes
        for dr in (0.6, 1.2, 1.8):
            for da in (-0.09, 0, 0.09):
                P(g, cx + (r + dr) * math.cos(a + da), cy + (r + dr) * math.sin(a + da), ch)
    arc(g, cx, cy, r * 0.8, 0, 360, ch2, paso=4)
    if hueco: disc(g, cx, cy, r * hueco, 'k')

# ── Byakhee: el jinete alado entre estrellas (rescata al Murciélago) ──
g = canvas(36, 26)
poly(g, [(16, 12), (2, 2), (5, 9), (0, 12), (6, 14), (3, 19), (14, 16)], 'P')   # ala izquierda
poly(g, [(20, 12), (34, 2), (31, 9), (36, 12), (30, 14), (33, 19), (22, 16)], 'P')
for x0, y0 in ((2, 2), (0, 12), (3, 19)): line(g, 16, 13, x0, y0, 'p')
for x0, y0 in ((34, 2), (35, 12), (33, 19)): line(g, 20, 13, x0, y0, 'p')
disc(g, 18, 14, 5, 'G', 7)                                  # cuerpo de insecto
for y in (10, 13, 16, 19): line(g, 15, y, 21, y, 'g')      # segmentos
disc(g, 18, 6, 3.5, 'S', 3)                                 # cabeza
P(g, 16, 6, 'E'); P(g, 20, 6, 'E'); P(g, 18, 5, 'E')       # tres ojos
line(g, 17, 9, 16, 11, 'R'); line(g, 19, 9, 20, 11, 'R')    # mandíbulas
line(g, 16, 21, 13, 25, 'S'); line(g, 20, 21, 23, 25, 'S')  # patas
line(g, 18, 21, 18, 25, 'S')
shade(g, 'G', 'g', frac=0.3); shade(g, 'P', 'p', frac=0.2)
S['byakhee'] = rows(outline(g))

# ── Engranes de Leng (rescatan al Engrane Dentado): chico, del centro y grande ──
g = canvas(20, 20)
engrane(g, 10, 10, 6, 8, 'y', 'Y', 0.0)
disc(g, 10, 10, 2.6, 'W'); disc(g, 10, 10, 1.3, 'F'); P(g, 10, 10, 'k')
S['lengChico'] = rows(outline(g))

g = canvas(28, 30)
engrane(g, 14, 13, 9, 10, 'L', 'l', 0.0)
disc(g, 14, 13, 4.5, 'p'); disc(g, 14, 13, 3, 'v')
for a in range(0, 360, 60): P(g, 14 + 3.8 * math.cos(math.radians(a)), 13 + 3.8 * math.sin(math.radians(a)), 'E')
P(g, 14, 13, 'k')
for x0, x1 in ((9, 6), (14, 14), (19, 22)): line(g, x0, 22, x1, 29, 'm')   # el eje es un tentáculo
S['lengCentro'] = rows(outline(g))

g = canvas(34, 34)
engrane(g, 17, 17, 13, 14, 'H', 'Y', 0.0)
disc(g, 17, 17, 7, 'n')
line(g, 11, 19, 23, 19, 'R', 2)                             # boca
for x in (12, 15, 18, 21): P(g, x, 18, 'W'); P(g, x + 1, 21, 'W')
P(g, 13, 14, 'F'); P(g, 21, 14, 'F')
S['lengGrande'] = rows(outline(g))

# ── El Reloj de Yog-Sothoth (rescata al Reloj Andante): la Llave y la Puerta en un reloj de pie ──
g = canvas(30, 42)
rect(g, 9, 6, 21, 40, 'n')                                  # caja de madera
disc(g, 15, 12, 6, 'W'); arc(g, 15, 12, 6, 0, 360, 'Y', paso=4)   # carátula
for a in range(0, 360, 30): P(g, 15 + 5 * math.cos(math.radians(a)), 12 + 5 * math.sin(math.radians(a)), 'k')
line(g, 15, 12, 15, 8, 'k'); line(g, 15, 12, 18, 13, 'k')
rect(g, 12, 21, 18, 35, 'p')                                # ventana del péndulo: el más allá
line(g, 15, 21, 15, 31, 'y'); disc(g, 15, 32, 2, 'y')
for cx, cy, r, ch in ((5, 9, 3, 'v'), (25, 6, 3.5, 'c'), (4, 22, 2.5, 'm'), (26, 20, 3, 'v'), (6, 33, 3, 'c'), (25, 33, 2.5, 'm'), (15, 2, 2, 'i')):
    disc(g, cx, cy, r, ch); P(g, cx - 1, cy - 1, 'W')         # esferas iridiscentes
rect(g, 8, 4, 22, 5, 'Y'); rect(g, 8, 40, 22, 41, 'Y')
shade(g, 'n', 'k', frac=0.2)
S['relojYog'] = rows(outline(g))

# ── Ladrón de Rostros (rescata al Ratero): una máscara de Nyarlathotep con muchas caras robadas ──
g = canvas(26, 36)
poly(g, [(6, 35), (20, 35), (18, 10), (8, 10)], 'k')        # túnica negra
poly(g, [(7, 12), (13, 2), (19, 12)], 'p')                  # capucha
disc(g, 13, 10, 3.5, 'W', 4)                                # máscara blanca sin rasgos
P(g, 12, 9, 'k'); P(g, 14, 9, 'k'); line(g, 12, 12, 14, 12, 'k')
line(g, 8, 16, 2, 22, 'p', 2); line(g, 18, 16, 24, 21, 'p', 2)
for cx, cy, ch in ((3, 24, 'w'), (23, 23, 'i')):
    disc(g, cx, cy, 2.5, ch, 3); P(g, cx - 1, cy - 1, 'k'); P(g, cx + 1, cy - 1, 'k'); P(g, cx, cy + 1, 'R')  # rostros robados
for y in (20, 25, 30): line(g, 9, y, 17, y, 'p')
P(g, 10, 26, 'E'); P(g, 15, 22, 'E'); P(g, 12, 31, 'E')       # ojos que se asoman en la tela
S['ladronRostros'] = rows(outline(g))

# ── El Shoggoth con Carita Feliz (Núcleo): una masa de ojos con una máscara sonriente (RLHF) ──
def shoggoth(mascara):
    g = canvas(38, 32)
    disc(g, 19, 19, 17, 'G', 12)
    for cx, cy, r in ((7, 12, 5), (31, 13, 5), (12, 26, 5), (27, 27, 5), (19, 9, 6)): disc(g, cx, cy, r, 'G')
    for cx, cy in ((5, 18), (9, 9), (31, 9), (34, 20), (26, 24), (11, 23), (16, 28), (29, 16), (6, 26), (23, 7)):
        disc(g, cx, cy, 1.6, 'W'); P(g, cx, cy, 'E')
    if mascara:
        disc(g, 19, 17, 7, 'h'); arc(g, 19, 17, 7, 0, 360, 'H', paso=3)
        P(g, 16, 15, 'k'); P(g, 22, 15, 'k'); P(g, 16, 14, 'k'); P(g, 22, 14, 'k')
        arc(g, 19, 17, 4, 20, 160, 'k', paso=8)
        line(g, 19, 24, 21, 29, 'G')
    else:
        disc(g, 19, 18, 7, 'R', 5); disc(g, 19, 18, 5, 'r', 3.5)
        for x in range(13, 26, 2): P(g, x, 14, 'W'); P(g, x + 1, 22, 'W')
        for cx, cy in ((14, 11), (24, 11), (19, 6), (10, 16), (28, 18)): disc(g, cx, cy, 1.6, 'W'); P(g, cx, cy, 'F')
        rect(g, 31, 26, 35, 29, 'h'); P(g, 32, 27, 'k'); P(g, 34, 27, 'k')   # la máscara tirada
    shade(g, 'G', 'g', frac=0.3)
    return rows(outline(g))
S['shoggothRLHF'] = shoggoth(True)
S['shoggothRLHF_rev'] = shoggoth(False)

# ── Tokenizador (Núcleo): parte todo en pedacitos ──
g = canvas(30, 30)
cols = 'BvEyc'
for i in range(4):
    for j in range(4):
        x, y = 4 + i * 6, 4 + j * 6
        rect(g, x, y, x + 4, y + 4, cols[(i + 2 * j) % 5])
        P(g, x + 1, y + 2, 'k'); P(g, x + 3, y + 2, 'k')
disc(g, 15, 15, 4, 'W'); disc(g, 15, 15, 2, 'F'); P(g, 15, 15, 'k')
for x0, x1 in ((6, 3), (12, 11), (18, 19), (24, 27)): line(g, x0, 27, x1, 29, 'l')
S['tokenizador'] = rows(outline(g))

g = canvas(14, 16)
rect(g, 2, 2, 11, 11, 'c'); rect(g, 3, 3, 10, 10, 'B')
line(g, 4, 4, 9, 4, 'c'); line(g, 6, 4, 6, 9, 'c'); line(g, 7, 4, 7, 9, 'c')   # una «T»
P(g, 4, 8, 'E'); P(g, 9, 8, 'E')
line(g, 4, 12, 3, 15, 'l'); line(g, 9, 12, 10, 15, 'l')
S['token'] = rows(outline(g))

# ── La Ventana de Contexto (Núcleo): un marco que no deja pasar lo que ya no cabe ──
g = canvas(32, 36)
rect(g, 3, 2, 28, 30, 'L'); rect(g, 5, 4, 26, 28, 'k')
line(g, 15, 4, 15, 28, 'l'); line(g, 16, 4, 16, 28, 'l'); line(g, 5, 16, 26, 16, 'l')
for cx, cy in ((10, 10), (21, 22)): disc(g, cx, cy, 2.5, 'W'); P(g, cx, cy, 'F')
for x0, y0, x1, y1 in ((8, 26, 2, 34), (13, 26, 12, 35), (20, 26, 22, 35), (24, 26, 30, 33)): line(g, x0, y0, x1, y1, 'm', 2)
for x, y in ((7, 6), (24, 6), (20, 12), (9, 20)): P(g, x, y, 'c')   # letras que se borran
S['ventanaContexto'] = rows(outline(g))

# ── El Descenso del Gradiente (Núcleo): una esfera con un ojo que rueda cuesta abajo ──
g = canvas(36, 26)
poly(g, [(0, 25), (0, 6), (14, 15), (26, 22), (35, 22), (35, 25)], 'S')   # la curva de pérdida
line(g, 0, 6, 14, 15, 'w'); line(g, 14, 15, 26, 22, 'w'); line(g, 26, 22, 35, 22, 'w')
disc(g, 12, 8, 6, "P"); disc(g, 11, 7, 3, 'W'); disc(g, 11, 7, 1.5, 'E'); P(g, 11, 7, 'k')
arc(g, 12, 8, 6, 200, 340, 'v', paso=10)
for x, y in ((21, 4), (25, 7), (29, 10)): P(g, x, y, 'c')   # flechas del gradiente
line(g, 20, 3, 31, 12, 'c')
S['gradiente'] = rows(outline(g))

# ── El Autocompletador (Núcleo): un oráculo con pantalla por cara; siempre adivina tu siguiente jugada ──
g = canvas(26, 38)
poly(g, [(5, 37), (21, 37), (19, 14), (7, 14)], 'b')
poly(g, [(6, 16), (13, 3), (20, 16)], 'b')
rect(g, 8, 8, 18, 15, 'k'); rect(g, 9, 9, 17, 14, 'U')
for x in (10, 12, 14): P(g, x, 12, 'E')
rect(g, 16, 10, 16, 13, 'E')                               # cursor
line(g, 7, 18, 2, 27, 'b', 2); line(g, 19, 18, 24, 27, 'b', 2)
disc(g, 3, 29, 2.5, 'c'); disc(g, 23, 29, 2.5, 'c')        # orbes que predicen
for y in (22, 27, 32): line(g, 9, y, 17, y, 'B')
shade(g, 'b', 'p', frac=0.25)
S['autocompletador'] = rows(outline(g))

# los enemigos miran hacia el héroe (izquierda)
for k in ('byakhee', 'gradiente'):
    S[k] = [r[::-1] for r in S[k]]

out = ['// ════════ v0.76 · RESCATADOS y CRIATURAS DEL NÚCLEO · generado con tools/arte/rescatados.py (python3) ════════',
       '// Enemigos del juego base con un giro de horror cósmico, y la IA del Núcleo de AM vista desde el Abismo. Paleta del Abismo.',
       'export const RESCATADOS_SPRITES: Record<string, string[]> = {']
for k, rs in S.items():
    out.append(f'  {k}: [')
    out += [f"    '{r}'," for r in rs]
    out.append('  ],')
out.append('};')
open('src/art/rescatados_sprites.ts', 'w').write('\n'.join(out) + '\n')
try:
    from PIL import Image
    tiles = list(S.items()); sc = 5
    W = sum(len(r[0]) * sc + 10 for _, r in tiles); H = max(len(r) for _, r in tiles) * sc
    im = Image.new('RGB', (W, H), (40, 36, 50)); x0 = 0
    for k, rs in tiles:
        for y, row in enumerate(rs):
            for x, ch in enumerate(row):
                if ch in PAL:
                    c = tuple(int(PAL[ch][i:i + 2], 16) for i in (1, 3, 5))
                    for dy in range(sc):
                        for dx in range(sc): im.putpixel((x0 + x * sc + dx, y * sc + dy), c)
        x0 += len(rs[0]) * sc + 10
    im.save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/rescatados.png')
except ImportError: pass
print('ok', ', '.join(S))
