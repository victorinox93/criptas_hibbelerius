# v0.59 · Los Astros Ambulantes: planetas del horror cósmico (nodos especiales del Abismo).
# Uso: python3 tools/arte/astros.py [vista.png] → escribe src/art/astros_sprites.ts
# Mismas herramientas que tools/arte/mythos.py, con una paleta propia (colores de planeta).
import math, sys

PAL = {
    'k': '#050608', 'W': '#f4f0e8', 'w': '#c8c4bc', 'F': '#ff4a6a', 'E': '#b8ff9a', 'r': '#4e1626', 'R': '#a43a4c',
    # Mercurio
    'q': '#9a98a0', 'Q': '#5e5c66', 'j': '#3a3842',
    # Venus
    'e': '#f0dc9a', 'f': '#c8a85a', 'g': '#8a6a2a', 'v': '#7ad84a',
    # Marte
    'z': '#d0582e', 'Z': '#8a2e16', 'X': '#4a160c',
    # Júpiter
    'a': '#e8c8a0', 'b': '#c08a5a', 'B': '#7a4a2a', 'o': '#e06a3a',
    # Saturno
    's': '#e8d8a8', 'S': '#b8a070', 'n': '#6a5a3a', 'i': '#d8d0c0',
    # Sol
    'x': '#fffbe0', 'y': '#ffe070', 'h': '#ffb030', 'H': '#e0601a', 'O': '#9a2a0a',
    # tentáculos
    'm': '#6a2a8a', 'M': '#3a1450', 'p': '#c890e0',
}

def canvas(w, h): return [['.'] * w for _ in range(h)]
def P(g, x, y, ch):
    x, y = int(round(x)), int(round(y))
    if 0 <= y < len(g) and 0 <= x < len(g[0]): g[y][x] = ch
def rect(g, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): P(g, x, y, ch)
def disc(g, cx, cy, r, ch, ry=None, solo=None):
    ry = ry or r
    for y in range(len(g)):
        for x in range(len(g[0])):
            if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1 and (solo is None or g[y][x] in solo): g[y][x] = ch
def line(g, x0, y0, x1, y1, ch, w=1):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1):
        t = i / max(1, n)
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        P(g, x, y, ch)
        if w > 1: P(g, x + 1, y, ch); P(g, x, y + 1, ch)
def outline(g, ch='k'):
    h, w = len(g), len(g[0]); out = [row[:] for row in g]
    for y in range(h):
        for x in range(w):
            if g[y][x] != '.': continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and g[yy][xx] not in '.k': out[y][x] = ch; break
    return out
def esfera(g, cx, cy, r, luz, sombra, oscuro=None):
    """Esfera con luz arriba a la izquierda y terminador abajo a la derecha"""
    disc(g, cx, cy, r, luz)
    for y in range(len(g)):
        for x in range(len(g[0])):
            d = math.hypot(x - cx, y - cy)
            if d <= r:
                k = ((x - cx) + (y - cy)) / (r * 1.4)
                if k > 0.35: g[y][x] = sombra
                if oscuro and k > 0.75: g[y][x] = oscuro
def ojo(g, cx, cy, r, iris='F', ry=None):
    ry = ry or r * 0.7
    disc(g, cx, cy, r, 'W', ry); disc(g, cx, cy, max(1, ry * 0.9), iris, ry * 0.9); rect(g, int(cx), int(cy - ry * 0.7), int(cx), int(cy + ry * 0.7), 'k')
def tentaculo(g, x0, y0, largo, dx, fase=0):
    for i in range(largo):
        t = i / largo
        x = x0 + dx * t + math.sin(t * 5 + fase) * 2.5
        y = y0 + i
        w = max(2, int(6 * (1 - t)) + 1)
        for k in range(-w // 2, w - w // 2): P(g, x + k, y, 'm' if k < w - 1 else 'M')
        if i % 3 == 0 and w > 1: P(g, x - 1, y, 'p')
def rows(g): return [''.join(r) for r in g]
S = {}

# ── Mercurio, el Mensajero Veloz: esfera gris llena de cráteres, un ojo y alas pequeñas ──
g = canvas(54, 38)
for lado in (-1, 1):  # alas (como las del casco de Mercurio)
    for k in range(5):
        x0 = 27 + lado * 14
        line(g, x0, 14 + k * 2, x0 + lado * (12 - k * 2), 6 + k * 3, 'w' if k % 2 else 'W', 2)
esfera(g, 27, 19, 14, 'q', 'Q', 'j')
for cx, cy, r in ((20, 12, 3), (33, 26, 2.5), (22, 26, 2), (35, 14, 1.6), (16, 20, 1.5)):
    disc(g, cx, cy, r, 'Q'); P(g, cx - 1, cy - 1, 'j')
ojo(g, 28, 19, 5, 'F')
S['mercurio'] = rows(outline(g))

# ── Venus, la Nube que Quema: nubes de ácido que giran, ojos que se asoman y gotas que caen ──
g = canvas(48, 52)
esfera(g, 24, 22, 19, 'e', 'f', 'g')
for k in range(5):  # remolinos de nube
    a0 = k * 1.3
    for i in range(40):
        t = i / 40
        r = 6 + t * 13
        P(g, 24 + r * math.cos(a0 + t * 3.2), 22 + r * math.sin(a0 + t * 3.2) * 0.9, 'f' if k % 2 else 'W')
for cx, cy, r in ((17, 15, 3), (31, 18, 4), (22, 29, 2.6), (33, 31, 2)):
    ojo(g, cx, cy, r, 'v')
for x, l in ((12, 6), (18, 9), (26, 7), (31, 11), (36, 5)):  # gotas de ácido sulfúrico
    for y in range(0, l):
        P(g, x, 40 + y - (4 if x in (18, 26, 31) else 7), 'v')
    P(g, x, 40 + l - (4 if x in (18, 26, 31) else 7), 'E')
S['venus'] = rows(outline(g))

# ── Marte, el Ojo Rojo: cañón que es una boca con dientes, casquete polar y un ojo ──
g = canvas(46, 46)
esfera(g, 23, 23, 20, 'z', 'Z', 'X')
disc(g, 23, 6, 8, 'W', 3, solo='zZX')                       # casquete polar
for x in range(9, 39):                                      # Valles Marineris: la boca
    y = 27 + math.sin(x / 4) * 2
    for d in range(-2, 3): P(g, x, y + d, 'X')
    if x % 3 == 0: P(g, x, y - 2, 'W'); P(g, x + 1, y + 2, 'W')
ojo(g, 23, 16, 5, 'h' if 'h' in PAL else 'F')
for cx, cy in ((12, 18), (34, 35), (30, 11)): disc(g, cx, cy, 1.6, 'Z')
S['marte'] = rows(outline(g))

# Fobos y Deimos: lunas como papas, con un ojo cada una
g = canvas(20, 16)
disc(g, 10, 8, 8, 'Q', 6); disc(g, 8, 7, 6, 'q', 4.5)
disc(g, 13, 10, 2, 'j'); ojo(g, 9, 7, 3, 'F')
S['fobos'] = rows(outline(g))
g = canvas(16, 13)
disc(g, 8, 6, 6, 'Q', 5); disc(g, 7, 5, 4.5, 'q', 3.5)
ojo(g, 7, 6, 2.4, 'F')
S['deimos'] = rows(outline(g))

# ── Júpiter, el Gigante: bandas de nubes, la Gran Mancha Roja es un ojo y tentáculos abajo ──
g = canvas(62, 66)
for i, (dx, l) in enumerate(((-18, 14), (-9, 18), (0, 20), (9, 18), (18, 14))):
    tentaculo(g, 31 + dx, 44, l, dx * 0.4, i)
esfera(g, 31, 28, 26, 'a', 'b')
for y in range(len(g)):
    for x in range(len(g[0])):
        if g[y][x] in 'ab' and int((y + math.sin(x / 6) * 1.5) / 4) % 2 == 0:
            g[y][x] = 'b' if g[y][x] == 'a' else 'B'
disc(g, 38, 34, 7, 'o', 4.5); ojo(g, 38, 34, 5, 'F', 3.2)
S['jupiter'] = rows(outline(g))

# ── Saturno, el que Devora a sus Hijos: anillos de dientes y una boca enorme ──
g = canvas(74, 44)
for i in range(360):  # anillo de atrás
    a = math.radians(i)
    for rr in (32, 34, 36):
        x, y = 37 + rr * math.cos(a), 22 + rr * 0.3 * math.sin(a)
        if math.sin(a) < 0: P(g, x, y, 'S' if rr == 34 else 'n')
esfera(g, 37, 22, 17, 's', 'S', 'n')
for y in range(len(g)):
    for x in range(len(g[0])):
        if g[y][x] in 'sS' and (y // 3) % 3 == 0: g[y][x] = 'S' if g[y][x] == 's' else 'n'
for x in range(28, 47):  # boca
    for y in range(26, 32):
        if ((x - 37) / 9.5) ** 2 + ((y - 28.5) / 3) ** 2 <= 1: g[y][x] = 'X'
for x in range(29, 46, 2): P(g, x, 26, 'i'); P(g, x + 1, 31, 'i')
ojo(g, 31, 17, 3, 'F'); ojo(g, 43, 17, 3, 'F')
for i in range(360):  # anillo de enfrente, hecho de dientes
    a = math.radians(i)
    if math.sin(a) >= 0:
        for rr in (32, 34, 36):
            P(g, 37 + rr * math.cos(a), 22 + rr * 0.3 * math.sin(a), 'i' if (i // 6) % 2 else 'w')
S['saturno'] = rows(outline(g))

# ── El Sol, el Ojo que Arde: llamaradas, manchas solares y un ojo en el centro ──
g = canvas(68, 68)
for k in range(16):  # corona: rayos de distinto largo
    a = k * math.pi / 8 + 0.1
    largo = 33 if k % 2 else 28
    for rr in range(18, largo):
        w = 2 if rr < largo - 4 else 1
        for d in range(-w, w + 1):
            P(g, 34 + rr * math.cos(a) - d * math.sin(a), 34 + rr * math.sin(a) + d * math.cos(a), 'H' if rr > largo - 5 else 'h')
disc(g, 34, 34, 22, 'h'); disc(g, 33, 33, 19, 'y'); disc(g, 31, 31, 12, 'x')
for cx, cy, r in ((22, 44, 2.4), (47, 26, 2), (44, 46, 1.6)): disc(g, cx, cy, r, 'O'); disc(g, cx, cy, r * 0.5, 'X')
disc(g, 34, 34, 9, 'W', 6.5); disc(g, 34, 34, 6, 'H', 5.5); disc(g, 34, 34, 2.4, 'k', 5)
S['sol'] = rows(outline(g))

out = ['// ════════ v0.59 · LOS ASTROS AMBULANTES · generado con tools/arte/astros.py (python3) ════════',
       '// Planetas del horror cósmico (diseños originales). Paleta propia: ASTROS_PAL.',
       f'export const ASTROS_PAL: Record<string, string> = {{ {", ".join(f"{k}: {v!r}" for k, v in PAL.items())} }};',
       'export const ASTROS_SPRITES: Record<string, string[]> = {']
for k, rs in S.items():
    out.append(f'  astro_{k}: [')
    out += [f"    '{r}'," for r in rs]
    out.append('  ],')
out.append('};')
open('src/art/astros_sprites.ts', 'w').write('\n'.join(out) + '\n')
try:
    from PIL import Image
    tiles = list(S.items()); sc = 5
    W = sum(len(r[0]) * sc + 10 for _, r in tiles); H = max(len(r) for _, r in tiles) * sc
    im = Image.new('RGB', (W, H), (24, 20, 34)); x0 = 0
    for k, rs in tiles:
        for y, row in enumerate(rs):
            for x, ch in enumerate(row):
                if ch in PAL:
                    c = tuple(int(PAL[ch][i:i + 2], 16) for i in (1, 3, 5))
                    for dy in range(sc):
                        for dx in range(sc): im.putpixel((x0 + x * sc + dx, y * sc + dy), c)
        x0 += len(rs[0]) * sc + 10
    im.save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/astros.png')
except ImportError: pass
print('ok', ', '.join(S))
