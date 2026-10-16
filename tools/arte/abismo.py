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
    'h': '#d8c040', 'H': '#8a7418', 'm': '#e070d0', 'M': '#7a2a8a', 'u': '#3a8a5a', 'U': '#1e4a32', 'i': '#e8d8f0',
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


# ════════ v0.41 · jefes del Descenso ════════
# ── Padre Dagón: rey pez con corona y tridente ──
g = canvas(40, 46)
poly(g, [(9, 45), (31, 45), (33, 20), (7, 20)], 'G')              # torso escamoso
for y in range(23, 44, 3):
    for x in range(10, 31, 4): P(g, x + (y % 2) * 2, y, 't')       # escamas
disc(g, 20, 13, 10, 'S', 9)                                         # cabeza de pez
disc(g, 13, 11, 3, 'W'); disc(g, 27, 11, 3, 'W'); P(g, 13, 11, 'k'); P(g, 27, 11, 'k')
line(g, 12, 18, 28, 18, 'r'); line(g, 14, 19, 26, 19, 'r')         # boca enorme
poly(g, [(10, 5), (14, 0), (17, 4), (20, -1), (23, 4), (26, 0), (30, 5)], 'y')  # corona
line(g, 7, 22, 2, 34, 'S'); line(g, 33, 22, 37, 30, 'S')           # brazos
line(g, 37, 44, 37, 6, 'L'); line(g, 34, 8, 34, 4, 'L'); line(g, 40, 8, 40, 4, 'L'); line(g, 34, 8, 40, 8, 'L')  # tridente
for y in (25, 28, 31): line(g, 5, y, 3, y + 2, 'g')                 # agallas/aletas
shade(g, 'G', 'g', frac=0.3)
S['dagon'] = rows(outline(g))

# ── El Color que Cayó del Cielo: un brillo sin forma de un color que no existe ──
g = canvas(44, 44)
import random
random.seed(7)
for (cx, cy, r, ch) in [(22, 24, 15, 'M'), (16, 20, 9, 'm'), (28, 18, 8, 'v'), (24, 30, 9, 'm'), (14, 30, 6, 'i'), (31, 28, 6, 'i'), (22, 22, 5, 'i')]:
    disc(g, cx, cy, r, ch)
for _ in range(40):
    x, y = random.randint(2, 41), random.randint(2, 41)
    if g[y][x] == '.': P(g, x, y, random.choice('mvi'))             # chispas sueltas
disc(g, 22, 22, 2, 'W')
S['colorCielo'] = rows(outline(g, 'M'))

# ── La Bailarina Ahogada: tutú, brazos abiertos y algas en el pelo ──
g = canvas(40, 46)
disc(g, 20, 7, 4, 's', 5)                                            # cabeza
for x in range(15, 26): line(g, x, 3, x + (x - 20) // 2, 14, 'G')    # pelo con algas
disc(g, 20, 7, 3, 's', 4); P(g, 19, 7, 'E'); P(g, 21, 7, 'E')
rect(g, 18, 12, 22, 22, 'S')                                         # torso
disc(g, 20, 24, 13, 'w', 4); disc(g, 20, 24, 10, 't', 2.5)           # tutú
line(g, 18, 13, 3, 6, 's'); line(g, 22, 13, 37, 6, 's')              # brazos abiertos
line(g, 18, 27, 15, 44, 's'); line(g, 22, 27, 26, 44, 's')           # piernas
rect(g, 14, 44, 16, 45, 'W'); rect(g, 25, 44, 27, 45, 'W')            # zapatillas
for (x, y) in ((6, 20), (34, 18), (9, 34), (31, 36)): P(g, x, y, 'c')  # burbujas
S['bailarina'] = rows(outline(g))

# ── El Engendro de Dunwich: casi invisible, sólo cuerdas de tentáculos y huellas ──
g = canvas(46, 40)
for k in range(9):
    x0 = 6 + k * 4
    for y in range(4, 34):
        x = x0 + math.sin(y / 4 + k) * 3
        P(g, x, y, 'l' if (y + k) % 3 else 'L')
disc(g, 23, 12, 6, 'l', 4); P(g, 20, 12, 'F'); P(g, 26, 12, 'F'); P(g, 23, 10, 'F')
for (x, y) in ((6, 37), (14, 38), (24, 37), (33, 38), (41, 37)):    # huellas enormes en el lodo
    disc(g, x, y, 2.5, 'n', 1.5)
S['dunwich'] = rows(g)

# ── Nyarlathotep: faraón negro con un rostro de tentáculos ──
g = canvas(36, 48)
poly(g, [(8, 47), (28, 47), (25, 18), (11, 18)], 'd')               # túnica
for y in range(20, 47, 4): line(g, 11, y, 25, y, 'p')
poly(g, [(9, 20), (27, 20), (24, 2), (12, 2)], 'b')                  # nemes
for y in range(3, 20, 3): line(g, 10, y, 26, y, 'y')
disc(g, 18, 11, 5, 'k')                                              # rostro vacío
for k in range(5): line(g, 15 + k * 1.5, 14, 13 + k * 2.5, 23 + (k % 2) * 3, 'P')  # tentáculos
P(g, 16, 9, 'E'); P(g, 20, 9, 'E')
line(g, 30, 47, 30, 10, 'y'); disc(g, 30, 9, 2.5, 'E')               # cetro
line(g, 25, 24, 30, 26, 'd')
S['nyarlathotep'] = rows(outline(g))

# ── Cthulhu: cabeza de pulpo, alas de murciélago y garras ──
g = canvas(48, 48)
poly(g, [(2, 30), (10, 8), (16, 18), (20, 12)], 'U'); poly(g, [(46, 30), (38, 8), (32, 18), (28, 12)], 'U')  # alas
for (a, b) in (((10, 8), (6, 28)), ((38, 8), (42, 28))): line(g, *a, *b, 'u')
poly(g, [(14, 46), (34, 46), (33, 24), (15, 24)], 'u')              # cuerpo
disc(g, 24, 14, 10, 'u', 9)                                          # cabeza
shade(g, 'u', 'U', frac=0.3)
P(g, 20, 13, 'F'); P(g, 28, 13, 'F'); P(g, 21, 13, 'E'); P(g, 27, 13, 'E')
for k in range(6):                                                   # barba de tentáculos
    x0 = 17 + k * 3
    for y in range(20, 34):
        P(g, x0 + math.sin(y / 2.5 + k) * 1.5, y, 'u' if k % 2 else 'U')
line(g, 14, 30, 8, 40, 'u'); line(g, 34, 30, 40, 40, 'u')            # brazos
for d in (-2, 0, 2): P(g, 8 + d, 42, 'W'); P(g, 40 + d, 42, 'W')      # garras
S['cthulhu'] = rows(outline(g))

# ── Yog-Sothoth: un amontonamiento de esferas iridiscentes ──
g = canvas(46, 44)
random.seed(3)
esferas = [(23, 22, 9), (12, 16, 6), (33, 14, 6), (14, 30, 7), (32, 31, 7), (23, 8, 5), (6, 26, 4), (40, 24, 4), (23, 37, 5)]
cols = ['i', 'v', 'c', 'B', 'P', 'i', 'c', 'v', 'B']
for (cx, cy, r), ch in zip(esferas, cols):
    disc(g, cx, cy, r, ch)
    P(g, cx - r // 3, cy - r // 3, 'W')                               # brillo
S['yogSothoth'] = rows(outline(g))

# ── Hastur: el Rey de Amarillo, túnica hecha jirones y máscara pálida ──
g = canvas(38, 48)
poly(g, [(5, 47), (33, 47), (28, 14), (10, 14)], 'h')               # túnica
for x in range(6, 33, 4): line(g, x, 47, x + 1, 41 + (x % 3) * 2, '.')  # jirones
shade(g, 'h', 'H', frac=0.35)
poly(g, [(9, 17), (29, 17), (26, 2), (12, 2)], 'H')                  # capucha
disc(g, 19, 11, 5, 'W', 6)                                           # máscara sin rostro
P(g, 17, 10, 'k'); P(g, 21, 10, 'k')
line(g, 10, 22, 2, 30, 'h'); line(g, 28, 22, 36, 30, 'h')            # mangas
for (x, y) in ((19, 28), (17, 30), (21, 30), (19, 32)): P(g, x, y, 'n')  # el Signo Amarillo
S['hastur'] = rows(outline(g))

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
