# El Abismo de los Ejes · capa 1: los Muelles Inclinados (horror cósmico).
# Uso: python3 tools/arte/abismo.py  → escribe src/art/abismo_sprites.ts y una vista previa en /tmp/abismo.png
# Todo se dibuja con figuras (círculos, líneas, polígonos) y se exporta como matrices de letras.
import math, json, sys

PAL = {
    'k': '#050909', 'd': '#0d1918', 'g': '#1c3632', 'G': '#2c5a4e', 't': '#4a8a74',
    'w': '#c4d6bc', 'W': '#eef4e6', 's': '#86a68c', 'S': '#56785f',
    'p': '#24163a', 'P': '#563880', 'v': '#9a6ad0',
    'E': '#b8ff9a', 'F': '#ff4a6a', 'y': '#d0ae4a', 'Y': '#7a6424',
    'r': '#4e1626', 'R': '#a43a4c', 'b': '#16264a', 'B': '#3a5a8a',
    'l': '#5e6e6c', 'L': '#a4b4ac', 'n': '#2a2016', 'c': '#7fe8d8',
}

def canvas(w, h):
    return [['.'] * w for _ in range(h)]

def P(g, x, y, ch):
    x, y = int(round(x)), int(round(y))
    if 0 <= y < len(g) and 0 <= x < len(g[0]):
        g[y][x] = ch

def rect(g, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            P(g, x, y, ch)

def disc(g, cx, cy, r, ch, ry=None):
    ry = ry or r
    for y in range(len(g)):
        for x in range(len(g[0])):
            if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1:
                g[y][x] = ch

def line(g, x0, y0, x1, y1, ch):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1):
        t = i / max(1, n)
        P(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, ch)

def poly(g, pts, ch):
    """Rellena un polígono (regla par-impar en el centro de cada píxel)."""
    h, w = len(g), len(g[0])
    for y in range(h):
        for x in range(w):
            px, py = x + 0.5, y + 0.5
            inside = False
            j = len(pts) - 1
            for i in range(len(pts)):
                xi, yi = pts[i]; xj, yj = pts[j]
                if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi + 1e-9) + xi:
                    inside = not inside
                j = i
            if inside:
                g[y][x] = ch

def arc(g, cx, cy, r, a0, a1, ch, ry=None):
    ry = ry or r
    for a in range(a0, a1 + 1, 3):
        P(g, cx + r * math.cos(math.radians(a)), cy + ry * math.sin(math.radians(a)), ch)

def outline(g, ch='k'):
    h, w = len(g), len(g[0])
    out = [row[:] for row in g]
    for y in range(h):
        for x in range(w):
            if g[y][x] != '.':
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and g[yy][xx] not in '.k':
                    out[y][x] = ch
                    break
    return out

def shade(g, ch_from, ch_to, side='right', frac=0.35):
    """Sombrea la orilla derecha (o izquierda) de cada fila de un color."""
    for row in g:
        xs = [x for x, c in enumerate(row) if c == ch_from]
        if not xs:
            continue
        n = max(1, int(len(xs) * frac))
        for x in (xs[-n:] if side == 'right' else xs[:n]):
            row[x] = ch_to

def rows(g):
    return [''.join(r) for r in g]

S = {}

# ── Acólito Inclinado: encapuchado que vive a punto de caerse ──
g = canvas(26, 30)
lean = 0.28  # inclinación: x se corre con la altura
def L(x, y): return (x + (29 - y) * lean, y)
poly(g, [L(7, 29), L(18, 29), L(15, 12), L(10, 12)], 'G')  # túnica
poly(g, [L(9, 13), L(16, 13), L(15, 5), L(12, 3), L(9, 6)], 'g')  # capucha
disc(g, *L(12.6, 9), 2.2, 'd')
P(g, *L(11.6, 9), 'E'); P(g, *L(13.6, 9), 'E')
shade(g, 'G', 'g')
line(g, *L(7, 20), *L(4, 20), 's')  # brazo
line(g, *L(3, 29), *L(6, 2), 'n')  # bastón torcido
poly(g, [L(3, 1), L(9, 3), L(5, 6)], 'y')  # triángulo «imposible» en la punta
P(g, *L(5.5, 3.2), 'Y')
for y in range(14, 29, 3): P(g, *L(12.5, y), 't')  # cordón
rect(g, 6, 28, 19, 29, 'd')  # base (pequeña: el CM queda afuera)
line(g, 14 + 0 * lean, 22, 14, 29, 'y')  # plomada del centro de masa (fuera de la base)
P(g, 14, 22, 'Y')
S['acolito'] = rows(outline(g))

# ── Pólipo Compuesto: tres lóbulos (figura compuesta) con su centroide marcado ──
g = canvas(28, 24)
disc(g, 8, 11, 6.5, 'G'); disc(g, 19, 9, 7.5, 't'); disc(g, 14, 16, 6, 'G')
for x0 in (5, 9, 13, 17, 21):
    line(g, x0, 18, x0 + (1 if x0 % 2 else -1), 23, 'S')
    P(g, x0 + (2 if x0 % 2 else -2), 23, 'S')
for cx, cy in ((7, 10), (20, 8), (14, 15)):
    P(g, cx, cy, 'E'); P(g, cx + 1, cy, 'k')
shade(g, 't', 'G'); shade(g, 'G', 'g', frac=0.25)
line(g, 13, 12, 15, 12, 'y'); line(g, 14, 11, 14, 13, 'y')  # centroide x̄
S['polipo'] = rows(outline(g))

g = canvas(14, 14)
disc(g, 7, 6, 5, 't')
shade(g, 't', 'G')
for x0 in (4, 7, 10): line(g, x0, 10, x0 + 1, 13, 'S')
P(g, 6, 5, 'E'); P(g, 8, 5, 'E')
S['polipito'] = rows(outline(g))

# ── Profundo Hueco: pez-hombre jorobado con un hueco en el pecho (área negativa) ──
g = canvas(26, 30)
disc(g, 13, 8, 7, 's', 6)  # cabeza
poly(g, [(5, 13), (21, 13), (22, 26), (4, 26)], 'S')  # torso
disc(g, 13, 19, 3.2, '.')  # el hueco
for a in range(0, 360, 20):
    P(g, 13 + 4.2 * math.cos(math.radians(a)), 19 + 4.2 * math.sin(math.radians(a)), 'r')
disc(g, 9, 7, 2.2, 'W'); disc(g, 17, 7, 2.2, 'W')  # ojos saltones
P(g, 9, 7, 'k'); P(g, 17, 7, 'k')
line(g, 9, 11, 17, 11, 'r')  # boca
for y in (9, 11): line(g, 4, y, 6, y + 1, 'g'); line(g, 22, y, 20, y + 1, 'g')  # agallas
line(g, 4, 15, 1, 22, 's'); line(g, 22, 15, 24, 22, 's')
rect(g, 0, 22, 2, 23, 't'); rect(g, 23, 22, 25, 23, 't')  # manos palmeadas
line(g, 24, 4, 24, 29, 'n'); poly(g, [(23, 4), (25, 4), (24, 0)], 'L')  # arpón
rect(g, 6, 27, 9, 29, 'S'); rect(g, 17, 27, 20, 29, 'S')
shade(g, 'S', 'g', frac=0.3)
S['profundo'] = rows(outline(g))

# ── Cultista del Eje: gira con los brazos extendidos alrededor de un eje dorado ──
g = canvas(30, 30)
for r, ch in ((13, 'P'), (11, 'p')):
    arc(g, 15, 15, r, 200, 330, ch, ry=5)
    arc(g, 15, 15, r, 20, 150, ch, ry=5)
poly(g, [(10, 28), (20, 28), (17, 11), (13, 11)], 'p')  # túnica
poly(g, [(12, 12), (18, 12), (17, 5), (15, 3), (13, 5)], 'P')
P(g, 14, 8, 'E'); P(g, 16, 8, 'E')
line(g, 3, 14, 13, 14, 'P'); line(g, 17, 14, 27, 14, 'P')  # brazos
P(g, 2, 14, 's'); P(g, 28, 14, 's')
shade(g, 'p', 'k', frac=0.2)
for y in range(0, 30, 2): P(g, 15, y, 'y')  # el eje
S['cultistaEje'] = rows(outline(g))

# ── El Vigía del Faro Hundido: armadura llena de agua con un faro por cabeza ──
g = canvas(30, 34)
poly(g, [(7, 33), (23, 33), (25, 14), (5, 14)], 'l')  # cuerpo
rect(g, 9, 17, 21, 30, 'G')  # agua dentro
for x, y in ((11, 20), (18, 24), (13, 27), (19, 19)): P(g, x, y, 'c')  # burbujas
rect(g, 11, 6, 19, 13, 'L')  # linterna
rect(g, 12, 7, 18, 12, 'y')
disc(g, 15, 9.5, 2, 'W')
poly(g, [(10, 6), (20, 6), (15, 1)], 'l')  # techo del faro
line(g, 5, 15, 1, 26, 'l'); line(g, 25, 15, 28, 26, 'l')
disc(g, 1, 27, 1.6, 'n'); line(g, 28, 26, 29, 33, 'n')  # ancla
P(g, 28, 33, 'L'); P(g, 29, 33, 'L')
for x, y in ((6, 16), (23, 20), (8, 31), (22, 31)): P(g, x, y, 'w')  # percebes
shade(g, 'l', 'g', frac=0.3)
S['vigia'] = rows(outline(g))

# ── La Madre Hidra: cuerpo enorme con tres cabezas ──
g = canvas(36, 30)
disc(g, 18, 22, 13, 'G', 7)
for hx, hy, bx in ((6, 6, 12), (18, 3, 18), (30, 6, 24)):
    line(g, bx, 18, hx, hy + 3, 't'); line(g, bx + 1, 18, hx + 1, hy + 3, 't'); line(g, bx - 1, 18, hx - 1, hy + 3, 'G')
    disc(g, hx, hy, 3.2, 't', 2.6)
    P(g, hx - 1, hy, 'F'); P(g, hx + 1, hy, 'F')
for x in range(7, 31, 4): line(g, x, 27, x + 1, 29, 'S')
shade(g, 'G', 'g', frac=0.3)
line(g, 17, 22, 19, 22, 'y'); line(g, 18, 21, 18, 23, 'y')
S['hidra'] = rows(outline(g))

# ── Vértice Errante ──
g = canvas(14, 14)
poly(g, [(1, 12), (13, 12), (7, 1)], 'v')
poly(g, [(4, 11), (10, 11), (7, 5)], 'p')
P(g, 7, 8, 'E')
S['vertice'] = rows(outline(g))

# ── El Geómetra No Euclidiano: un triángulo imposible con un ojo en su centroide ──
g = canvas(44, 42)
A, B, C = (22, 2), (2, 38), (42, 38)
CX, CY = (A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3
def band(p, q, ch, wdt=5):
    dx, dy = q[0] - p[0], q[1] - p[1]
    n = math.hypot(dx, dy)
    nx, ny = -dy / n * wdt, dx / n * wdt
    mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
    if (CX - mx) * nx + (CY - my) * ny < 0:  # la banda crece hacia adentro
        nx, ny = -nx, -ny
    poly(g, [(p[0], p[1]), (q[0], q[1]), (q[0] + nx, q[1] + ny), (p[0] + nx, p[1] + ny)], ch)
band(A, B, 'P'); band(B, C, 'v'); band(C, A, 'P')
line(g, A[0], A[1], B[0], B[1], 'v'); line(g, C[0], C[1], A[0], A[1], 'v')
# las juntas no cierran: tres cortes que se «cruzan» al revés (Penrose)
for (x, y) in ((20, 6), (5, 34), (38, 35)):
    disc(g, x, y, 1.6, 'k')
disc(g, 22, 26, 6, 'W', 4.5)  # el ojo en el centroide
disc(g, 22, 26, 3, 'E', 3)
disc(g, 22, 26, 1.3, 'k')
line(g, 15, 26, 13, 26, 'y'); line(g, 29, 26, 31, 26, 'y'); line(g, 22, 19, 22, 18, 'y')
for (x, y) in ((4, 8), (40, 10), (8, 22), (37, 24)):  # esquirlas
    poly(g, [(x, y), (x + 3, y + 1), (x + 1, y + 4)], 'v')
S['geometra'] = rows(outline(g))

out = ['// ════════ EL ABISMO DE LOS EJES · generado con tools/arte/abismo.py (python3) ════════',
       '/** Paleta abisal: verdes ahogados, violeta y hueso */',
       'export const ABISMO_PAL: Record<string, string> = ' + json.dumps(PAL) + ';',
       '/** Criaturas de la capa 1 (los Muelles Inclinados) */',
       'export const ABISMO_SPRITES: Record<string, string[]> = {']
for k, rs in S.items():
    out.append(f'  {k}: [')
    out += [f"    '{r}'," for r in rs]
    out.append('  ],')
out.append('};')
open('src/art/abismo_sprites.ts', 'w').write('\n'.join(out) + '\n')

try:
    from PIL import Image
    tiles = list(S.items())
    sc = 4
    W = sum(len(r[0]) * sc + 8 for _, r in tiles)
    H = max(len(r) for _, r in tiles) * sc
    im = Image.new('RGB', (W, H), (14, 12, 18))
    x0 = 0
    for k, rs in tiles:
        for y, row in enumerate(rs):
            for x, ch in enumerate(row):
                if ch in PAL:
                    c = tuple(int(PAL[ch][i:i + 2], 16) for i in (1, 3, 5))
                    for dy in range(sc):
                        for dx in range(sc):
                            im.putpixel((x0 + x * sc + dx, y * sc + dy), c)
        x0 += len(rs[0]) * sc + 8
    im.save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/abismo.png')
except ImportError:
    pass
print('ok', ', '.join(S))
