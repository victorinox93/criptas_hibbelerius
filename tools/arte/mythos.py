# v0.51 · Las Tierras del Sueño: criaturas del mythos (cuentos publicados hasta 1930) y del sueño.
# Uso: python3 tools/arte/mythos.py [vista.png] → escribe src/art/mythos_sprites.ts
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
S = {}

# ── Necrófago («El modelo de Pickman», 1927): encorvado, cara de perro, piel de hule ──
g = canvas(28, 28)
disc(g, 13, 15, 8, 'S', 6)                       # lomo encorvado
disc(g, 21, 9, 4.5, 's', 4)                      # cabeza adelantada
poly(g, [(23, 8), (27, 10), (26, 13), (22, 12)], 's')  # hocico de perro
P(g, 21, 8, 'F'); P(g, 23, 8, 'F')
line(g, 23, 12, 26, 12, 'r'); P(g, 24, 13, 'W'); P(g, 26, 13, 'W')
poly(g, [(18, 4), (19, 7), (17, 6)], 'S')        # oreja
line(g, 18, 18, 21, 25, 'S', 2); P(g, 22, 26, 'w'); P(g, 21, 27, 'w')   # brazo largo con garras
line(g, 8, 19, 5, 25, 'S', 2); line(g, 5, 25, 9, 27, 'S')              # pierna doblada
line(g, 14, 20, 13, 26, 'S', 2); line(g, 13, 26, 16, 27, 'S')
line(g, 6, 12, 1, 9, 's')                        # cola pelada
shade(g, 'S', 'g', frac=0.3)
S['necrofago'] = rows(outline(g))

# ── Engendro de los Martense («El miedo que acecha», 1923): simiesco, pálido, un ojo de cada color ──
g = canvas(22, 24)
disc(g, 11, 15, 8, 'w', 7)
disc(g, 11, 7, 6, 'w', 5)
disc(g, 8, 6, 1.5, 'W'); disc(g, 14, 6, 1.5, 'W')
P(g, 8, 6, 'B'); P(g, 14, 6, 'n')                # heterocromía de los Martense
line(g, 8, 10, 14, 10, 'r')
line(g, 4, 13, 1, 21, 'w', 2); line(g, 18, 13, 20, 21, 'w', 2)
rect(g, 6, 21, 8, 23, 'L'); rect(g, 14, 21, 16, 23, 'L')
for x, y in ((6, 15), (15, 17), (10, 19)): P(g, x, y, 'L')
shade(g, 'w', 'L', frac=0.3)
S['martense'] = rows(outline(g))

# ── Criatura alada de «El Festival» (1925): ni cuervo ni topo ni buitre ──
g = canvas(34, 24)
poly(g, [(16, 8), (2, 2), (5, 10), (1, 14), (8, 14), (14, 16)], 'P')
poly(g, [(18, 8), (32, 2), (29, 10), (33, 14), (26, 14), (20, 16)], 'P')
for x in (5, 9, 25, 29): line(g, 16 if x < 17 else 18, 9, x, 13, 'p')
disc(g, 17, 13, 4.5, 'g', 6)
disc(g, 17, 6, 3, 'g')
poly(g, [(16, 7), (18, 7), (17, 11)], 'Y')       # pico
P(g, 16, 5, 'E'); P(g, 18, 5, 'E')
line(g, 15, 18, 13, 23, 'Y'); line(g, 19, 18, 21, 23, 'Y')
shade(g, 'P', 'p', frac=0.25)
S['aladoFestival'] = rows(outline(g))

# ── Reptil de «La ciudad sin nombre» (1921): entre cocodrilo y foca, se arrastra ──
g = canvas(36, 18)
disc(g, 17, 11, 13, 'u', 5)
poly(g, [(28, 8), (35, 10), (34, 13), (28, 14)], 'u')  # hocico
poly(g, [(4, 10), (0, 7), (1, 12)], 'u')         # cola
P(g, 29, 9, 'y'); line(g, 29, 12, 34, 12, 'U')
for x in (8, 12, 20, 24): line(g, x, 15, x - 1, 17, 'U', 2)
for x in range(8, 28, 4): P(g, x, 8, 'E')        # escamas brillantes
poly(g, [(14, 6), (17, 3), (20, 6)], 'y')        # tocado ceremonial
shade(g, 'u', 'U', frac=0.3)
S['reptilSinNombre'] = rows(outline(g))

# ── Wilbur Whateley («El horror de Dunwich», 1929): alto, abrigo largo, tentáculos debajo ──
g = canvas(26, 36)
poly(g, [(6, 34), (20, 34), (19, 12), (7, 12)], 'n')   # abrigo
disc(g, 13, 7, 4.5, 'h', 5.5)                     # cara de cabra
P(g, 11, 6, 'k'); P(g, 15, 6, 'k')
line(g, 12, 10, 14, 10, 'r'); line(g, 11, 12, 15, 12, 'Y')  # barba rala
poly(g, [(8, 3), (6, 0), (10, 2)], 'L'); poly(g, [(18, 3), (20, 0), (16, 2)], 'L')
for x0, x1 in ((8, 3), (11, 9), (15, 17), (18, 23)):
    line(g, x0, 30, x1, 35, 'm')                  # tentáculos asomando
line(g, 7, 14, 3, 24, 'n', 2); line(g, 19, 14, 23, 22, 'n', 2)
rect(g, 21, 20, 25, 25, 'r'); rect(g, 22, 21, 24, 24, 'Y')  # el libro
shade(g, 'n', 'k', frac=0.25)
S['wilbur'] = rows(outline(g))

# ── Sabueso de Tíndalos (F. B. Long, 1929): hecho de ángulos, sale de las esquinas ──
g = canvas(36, 28)
poly(g, [(4, 14), (12, 8), (24, 9), (30, 4), (35, 8), (31, 13), (26, 15), (24, 22), (20, 27), (19, 20), (12, 19), (8, 27), (6, 20)], 'B')
poly(g, [(12, 10), (22, 10), (18, 16)], 'b')
for (a, b_) in (((4, 14), (0, 9)), ((26, 15), (30, 25)), ((12, 19), (14, 27))): line(g, *a, *b_, 'b', 2)
P(g, 31, 7, 'F')
line(g, 34, 10, 34, 18, 'c'); P(g, 33, 19, 'c')  # lengua larga
for (x, y) in ((9, 4), (17, 3), (2, 24), (28, 22)):
    poly(g, [(x, y), (x + 3, y), (x, y + 3)], 'v')  # esquinas por donde entra
S['sabueso'] = rows(outline(g))

# ── Yig, Padre de las Serpientes («La maldición de Yig», 1929) ──
g = canvas(44, 44)
for r, ch in ((18, 'u'), (13, 'U'), (8, 'u')):
    disc(g, 22, 34, r, ch, r * 0.45)
for a in range(0, 360, 30):
    P(g, 22 + 16 * math.cos(math.radians(a)), 34 + 7 * math.sin(math.radians(a)), 'y')  # bandas
line(g, 22, 30, 22, 14, 'u', 2); line(g, 23, 30, 25, 14, 'U', 2)
disc(g, 23, 10, 8, 'u', 6)                        # cabeza / capucha
poly(g, [(15, 12), (8, 18), (18, 16)], 'u'); poly(g, [(31, 12), (38, 18), (28, 16)], 'u')
P(g, 20, 9, 'y'); P(g, 26, 9, 'y')
line(g, 21, 15, 23, 18, 'R'); line(g, 25, 15, 23, 18, 'R')   # lengua bífida
poly(g, [(16, 4), (19, 0), (22, 3), (25, 0), (28, 3), (31, 0), (30, 5)], 'y')  # corona
shade(g, 'u', 'U', frac=0.3)
S['yig'] = rows(outline(g))

# ── El Dios de las Cinco Cabezas («Bajo las pirámides», 1924) ──
g = canvas(48, 44)
disc(g, 24, 32, 18, 'l', 8)                       # cuerpo de piedra viva
for x in (9, 17, 31, 39): line(g, x, 37, x - 1, 43, 'n', 2)   # patas peludas
for i, (hx, hy) in enumerate(((5, 12), (14, 6), (24, 3), (34, 6), (43, 12))):
    line(g, 24 + (hx - 24) * 0.35, 26, hx, hy + 3, 'n', 2)
    disc(g, hx, hy, 3.6, 'L', 3)
    P(g, hx - 1, hy, 'F' if i == 2 else 'y'); P(g, hx + 1, hy, 'F' if i == 2 else 'y')
for x in range(10, 40, 5): P(g, x, 30, 'L'); P(g, x + 2, 34, 'n')
poly(g, [(18, 26), (30, 26), (24, 20)], 'y')      # pirámide en el lomo
shade(g, 'l', 'n', frac=0.3)
S['cincoCabezas'] = rows(outline(g))

# ── Shub-Niggurath, la Cabra Negra de los Mil Retoños ──
g = canvas(48, 48)
for cx, cy, r in ((24, 22, 15), (12, 26, 9), (36, 26, 9), (24, 12, 10), (16, 34, 8), (32, 34, 8)):
    disc(g, cx, cy, r, 'p')
for cx, cy in ((20, 14), (30, 20), (14, 28), (34, 30), (24, 30)):
    disc(g, cx, cy, 2.6, 'R', 1.6); line(g, cx - 2, cy, cx + 2, cy, 'W')  # bocas
for cx, cy in ((26, 9), (16, 20), (36, 14), (28, 36), (10, 22)): P(g, cx, cy, 'E')
for x0, x1 in ((6, 1), (10, 6), (38, 42), (42, 47)):
    line(g, x0, 30, x1, 42, 'P', 2)               # tentáculos
for x in (16, 30):                                 # patas de cabra
    line(g, x, 40, x + 1, 46, 'k', 2); rect(g, x, 46, x + 3, 47, 'n')
poly(g, [(16, 6), (10, 0), (18, 3)], 'L'); poly(g, [(32, 6), (38, 0), (30, 3)], 'L')  # cuernos
shade(g, 'p', 'k', frac=0.2)
S['shubNiggurath'] = rows(outline(g))

# ── Retoño (de los Mil): un árbol oscuro con bocas que camina ──
g = canvas(22, 26)
disc(g, 11, 9, 8, 'p', 7)
line(g, 11, 15, 11, 22, 'p', 2)
line(g, 8, 20, 5, 25, 'k', 2); line(g, 14, 20, 17, 25, 'k', 2)
for x0, x1 in ((4, 0), (18, 21)): line(g, x0, 8, x1, 4, 'P')
disc(g, 9, 9, 2, 'R', 1.3); line(g, 7, 9, 11, 9, 'W'); P(g, 13, 6, 'E')
shade(g, 'p', 'k', frac=0.2)
S['retono'] = rows(outline(g))

# ═════════ Criaturas del sueño ═════════
# ── Ser de Ib («La perdición que cayó sobre Sarnath», 1920): verde, ojos saltones, labios fofos ──
g = canvas(24, 28)
disc(g, 12, 9, 8, 'u', 7)
poly(g, [(5, 14), (19, 14), (21, 25), (3, 25)], 'U')
disc(g, 8, 6, 2.6, 'W'); disc(g, 16, 6, 2.6, 'W'); P(g, 8, 6, 'k'); P(g, 16, 6, 'k')
disc(g, 12, 12, 3.6, 'R', 1.6)                    # labios fofos
line(g, 4, 16, 1, 23, 'u', 2); line(g, 20, 16, 22, 23, 'u', 2)
rect(g, 6, 25, 9, 27, 'U'); rect(g, 15, 25, 18, 27, 'U')
for x, y in ((7, 18), (15, 21), (11, 23)): P(g, x, y, 'c')
shade(g, 'U', 'g', frac=0.3)
S['serIb'] = rows(outline(g))

# ── Lo que llegó de la Corona Boreal («Hypnos», 1923): una sombra coronada de estrellas ──
g = canvas(30, 32)
poly(g, [(6, 31), (24, 31), (21, 10), (15, 6), (9, 10)], 'p')
disc(g, 15, 10, 5, 'p')
P(g, 13, 10, 'i'); P(g, 17, 10, 'i')
for i, a in enumerate(range(200, 341, 20)):        # la Corona Boreal: 7 estrellas en arco
    P(g, 15 + 11 * math.cos(math.radians(a)), 9 + 7 * math.sin(math.radians(a)), 'i' if i != 3 else 'y')
for y in range(14, 31, 4): P(g, 10 + (y % 8) // 2, y, 'v'); P(g, 19 - (y % 8) // 2, y, 'v')
line(g, 8, 14, 2, 24, 'P'); line(g, 22, 14, 28, 24, 'P')
shade(g, 'p', 'k', frac=0.2)
S['sombraHypnos'] = rows(outline(g))

# ── Guardián de Thalarion («El barco blanco», 1919): eidolon pálido con máscara ──
g = canvas(26, 34)
poly(g, [(5, 33), (21, 33), (18, 11), (8, 11)], 'i')
disc(g, 13, 7, 5, 'v', 6)
disc(g, 13, 7, 3.4, 'W', 4)                        # máscara
P(g, 12, 6, 'k'); P(g, 14, 6, 'k'); line(g, 12, 9, 14, 9, 'k')
for y in range(14, 32, 3): line(g, 9, y, 17, y, 'm')
line(g, 8, 13, 2, 22, 'i', 2); line(g, 18, 13, 24, 22, 'i', 2)
line(g, 24, 4, 24, 30, 'y'); disc(g, 24, 3, 2, 'c')   # báculo con luz
shade(g, 'i', 'v', frac=0.3)
S['guardianThalarion'] = rows(outline(g))

# ── Bokrug, el Gran Lagarto de Agua: ídolo verde de Ib que vuelve por Sarnath ──
g = canvas(48, 38)
disc(g, 24, 24, 19, 'G', 9)                        # cuerpo
poly(g, [(36, 18), (47, 16), (47, 23), (38, 26)], 'G')  # cabeza
poly(g, [(6, 22), (0, 30), (8, 28)], 'G')          # cola
disc(g, 40, 18, 1.6, 'c'); P(g, 40, 18, 'k')
line(g, 39, 23, 47, 21, 't')
for x in (12, 20, 28, 34): line(g, x, 31, x - 2, 37, 't', 2)
for x in range(10, 38, 4): poly(g, [(x, 16), (x + 2, 11), (x + 4, 16)], 't')  # cresta
for x, y in ((16, 24), (24, 27), (30, 22)): P(g, x, y, 'c')
for x in range(4, 46, 6): P(g, x, 36, 'c'); P(g, x + 3, 35, 'B')  # agua
shade(g, 'G', 'g', frac=0.3)
S['bokrug'] = rows(outline(g))

# los enemigos están a la derecha y miran hacia el héroe (izquierda)
for k in ('necrofago', 'reptilSinNombre', 'sabueso', 'bokrug'):
    S[k] = [r[::-1] for r in S[k]]

out = ['// ════════ v0.51 · LAS TIERRAS DEL SUEÑO · generado con tools/arte/mythos.py (python3) ════════',
       '// Criaturas de cuentos publicados hasta 1930; los diseños son nuestros. Usa la paleta del Abismo.',
       '/** Criaturas del mythos y del sueño */',
       'export const MYTHOS_SPRITES: Record<string, string[]> = {']
for k, rs in S.items():
    out.append(f'  {k}: [')
    out += [f"    '{r}'," for r in rs]
    out.append('  ],')
out.append('};')
open('src/art/mythos_sprites.ts', 'w').write('\n'.join(out) + '\n')
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
    im.save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/mythos.png')
except ImportError: pass
print('ok', ', '.join(S))
