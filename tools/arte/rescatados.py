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


# ════════ v0.81 · MÁS RESCATADOS, ahora repartidos por tramo ════════
# ── Tramo 1 · los Muelles Inclinados ──
# Osario Excéntrico (Esqueleto): huesos mal ensamblados, inclinado
g = canvas(24, 34)
disc(g, 14, 5, 4, 'w', 4)                                    # cráneo ladeado
P(g, 13, 5, 'E'); P(g, 16, 4, 'k'); line(g, 12, 8, 16, 8, 'k')
line(g, 13, 9, 10, 24, 'w', 2)                               # columna torcida
for y in (12, 15, 18): line(g, 8, y + 1, 15, y - 1, 'L')     # costillas chuecas
line(g, 11, 12, 4, 18, 'w'); line(g, 12, 12, 20, 16, 'w')    # brazos
disc(g, 20, 17, 1.5, 'L')                                    # un hueso de más en la mano
rect(g, 6, 23, 14, 25, 'L')                                  # cadera
line(g, 7, 25, 4, 33, 'w', 2); line(g, 12, 25, 15, 33, 'w', 2)
disc(g, 17, 27, 1.2, 'E'); disc(g, 6, 9, 1, 'E')             # chispas del centro de masa
S['osario'] = rows(outline(g))

# Shoggoth Joven (Babosa Madre) y Shoggotito
def gota(w, h, ojos):
    g = canvas(w, h)
    disc(g, w / 2, h * 0.62, w / 2 - 1, 'G', h * 0.38)
    disc(g, w / 2, h * 0.45, w / 3, 'G', h / 3)
    for (x, y) in ojos: disc(g, x, y, 1.4, 'W'); P(g, x, y, 'E')
    for x in range(2, w - 2, 3): P(g, x, h - 2, 't')
    shade(g, 'G', 'g', frac=0.3)
    return rows(outline(g))
S['shoggothJoven'] = gota(30, 24, [(8, 12), (14, 9), (20, 13), (24, 17), (11, 18), (17, 16)])
S['shoggotito'] = gota(16, 14, [(6, 7), (10, 8)])

# Sacerdote de Dagón (Escudero): túnica con escamas y báculo de coral
g = canvas(24, 36)
poly(g, [(6, 35), (18, 35), (16, 12), (8, 12)], 'b')
disc(g, 12, 8, 4, 'u', 4.5); P(g, 10, 7, 'y'); P(g, 14, 7, 'y'); line(g, 10, 11, 14, 11, 'U')
poly(g, [(8, 4), (12, 0), (16, 4)], 'y')                     # mitra
for y in range(15, 34, 3):
    for x in range(9 + (y % 2), 16, 3): P(g, x, y, 'B')       # escamas
line(g, 19, 6, 20, 35, 'n'); poly(g, [(17, 6), (19, 1), (21, 5), (23, 2), (22, 7)], 'R')  # báculo de coral
line(g, 15, 16, 19, 18, 'u')
S['sacerdoteDagon'] = rows(outline(g))

# Ánima Ahogada (Ánima): un fantasma con el cabello flotando como en el agua
g = canvas(24, 30)
disc(g, 12, 11, 7, 'L', 8)
poly(g, [(5, 13), (19, 13), (21, 29), (17, 25), (14, 29), (11, 24), (8, 29), (3, 27)], 'L')
for x0 in (6, 9, 15, 18): line(g, x0, 5, x0 - 3, -1, 'S')
P(g, 9, 11, 'k'); P(g, 15, 11, 'k'); disc(g, 12, 16, 1.5, 'k')
for x, y in ((4, 20), (20, 18), (12, 27)): P(g, x, y, 'c')   # burbujas
S['animaAhogada'] = rows(outline(g))

# Péndulo de Pnakotus (élite · Péndulo): una hoja enorme colgando de una cadena con ojos
g = canvas(30, 44)
line(g, 15, 0, 15, 24, 'l')
for y in range(2, 24, 4): P(g, 15, y, 'L')
disc(g, 15, 33, 11, 'L', 8); disc(g, 15, 30, 11, 'k', 4)     # media luna
poly(g, [(4, 33), (26, 33), (15, 43)], 'L')
for x, y in ((10, 34), (15, 36), (20, 34)): disc(g, x, y, 1.6, 'W'); P(g, x, y, 'F')
line(g, 6, 34, 24, 34, 'R')
shade(g, 'L', 'l', frac=0.3)
S['penduloPnakotus'] = rows(outline(g))

# El Ídolo de Arcilla de Wilcox (élite · Gólem): el bajorrelieve de «La llamada de Cthulhu»
g = canvas(34, 40)
rect(g, 4, 6, 29, 39, 'n')                                   # tableta de arcilla
rect(g, 6, 8, 27, 37, 'Y')
disc(g, 17, 18, 6, 'n', 5)                                   # cabeza de pulpo
for x0 in (12, 15, 19, 22): line(g, x0, 22, x0 + (x0 - 17) // 2, 30, 'n', 2)  # tentáculos
poly(g, [(7, 14), (11, 10), (12, 20)], 'n'); poly(g, [(27, 14), (23, 10), (22, 20)], 'n')  # alas
P(g, 15, 17, 'E'); P(g, 19, 17, 'E')
for x in range(8, 27, 3): P(g, x, 35, 'k')                   # jeroglíficos
for x in range(9, 26, 4): P(g, x, 33, 'k')
S['idoloWilcox'] = rows(outline(g))

# La Armadura del Capitán Marsh (élite · Armadura de Púas): coral y púas, llena de agua
g = canvas(28, 38)
rect(g, 8, 12, 20, 30, 'l')
disc(g, 14, 7, 5, 'l', 5); rect(g, 10, 6, 18, 8, 'k'); P(g, 12, 7, 'E'); P(g, 16, 7, 'E')
for x, y in ((7, 13), (21, 13), (6, 20), (22, 21), (8, 27), (20, 28), (14, 1)):
    line(g, x, y, x + (x - 14) // 3, y - 3, 'w')            # púas
for x, y in ((10, 16), (17, 19), (12, 25), (18, 27)): disc(g, x, y, 1.6, 'R')  # coral
rect(g, 9, 31, 12, 37, 'g'); rect(g, 16, 31, 19, 37, 'g')
line(g, 21, 15, 26, 26, 'l', 2); disc(g, 26, 28, 2.5, 'y')   # garfio de capitán
for x in range(9, 20, 3): P(g, x, 22, 'c')                   # agua por dentro
shade(g, 'l', 'g', frac=0.3)
S['armaduraMarsh'] = rows(outline(g))

# ── Tramo 2 · R'lyeh invertida ──
# Gárgola de Ángulos Imposibles (Gárgola): toda hecha de triángulos que no cierran
g = canvas(32, 30)
poly(g, [(16, 4), (26, 26), (6, 26)], 'l')
poly(g, [(16, 4), (6, 26), (2, 10)], 'L'); poly(g, [(16, 4), (26, 26), (31, 9)], 'g')
poly(g, [(12, 12), (20, 12), (16, 19)], 'k'); P(g, 14, 13, 'F'); P(g, 18, 13, 'F')
line(g, 2, 10, 31, 9, 'v'); line(g, 6, 26, 31, 9, 'v')       # líneas que se cruzan donde no deben
rect(g, 8, 26, 11, 29, 'g'); rect(g, 21, 26, 24, 29, 'g')
S['gargolaAngulos'] = rows(outline(g))

# El Bibliotecario de Celaeno (Bibliotecario) y el Tomo Prohibido
g = canvas(26, 38)
poly(g, [(5, 37), (19, 37), (17, 12), (8, 12)], 'p')
disc(g, 12, 8, 4.5, 'i', 5); rect(g, 9, 7, 15, 8, 'k'); P(g, 10, 7, 'c'); P(g, 14, 7, 'c')  # lentes
line(g, 12, 13, 12, 22, 'P')
rect(g, 17, 18, 24, 26, 'r'); rect(g, 18, 19, 23, 25, 'y'); line(g, 20, 19, 20, 25, 'r')    # libro abierto
for y in (4, 2): P(g, 9 + y, y, 'v'); P(g, 16 - y, y, 'v')
line(g, 8, 16, 3, 24, 'p', 2)
S['bibliotecarioCelaeno'] = rows(outline(g))

g = canvas(18, 18)
rect(g, 2, 3, 15, 14, 'r'); rect(g, 3, 4, 14, 13, 'R'); line(g, 8, 3, 8, 14, 'r')
disc(g, 5.5, 8, 1.6, 'W'); P(g, 5, 8, 'E'); disc(g, 11.5, 8, 1.6, 'W'); P(g, 12, 8, 'E')
line(g, 4, 11, 13, 11, 'k')
for x in (4, 7, 10, 13): P(g, x, 15, 'm'); P(g, x, 16, 'm')   # tentáculos de tinta
S['tomoProhibido'] = rows(outline(g))

# El Átomo de Azathoth (Átomo Inestable): un núcleo que burbujea con órbitas que no cierran
g = canvas(30, 30)
for a0 in (0, 60, 120): 
    for a in range(0, 360, 6):
        t = math.radians(a); r0 = math.radians(a0)
        x = 15 + 12 * math.cos(t) * math.cos(r0) - 5 * math.sin(t) * math.sin(r0)
        y = 15 + 12 * math.cos(t) * math.sin(r0) + 5 * math.sin(t) * math.cos(r0)
        P(g, x, y, 'v')
disc(g, 15, 15, 5.5, 'm'); disc(g, 13, 13, 1.6, 'E'); disc(g, 17, 16, 1.3, 'E'); disc(g, 15, 18, 1, 'W')
for x, y in ((27, 15), (6, 6), (9, 25)): disc(g, x, y, 1.6, 'c')
S['atomoAzathoth'] = rows(outline(g))

# La Colonia de Mi-Go (Colmena de Ánimas) y un Mi-Go
g = canvas(30, 34)
disc(g, 15, 18, 12, 'S', 14)
for x, y in ((10, 12), (19, 10), (14, 20), (22, 22), (8, 25), (17, 28)): disc(g, x, y, 2, 'k'); P(g, x, y, 'm')  # celdas
poly(g, [(15, 1), (12, 5), (18, 5)], 'S')
for x0 in (6, 24): line(g, x0, 20, x0 + (2 if x0 < 15 else -2), 33, 'U', 2)
shade(g, 'S', 'U', frac=0.3)
S['coloniaMiGo'] = rows(outline(g))

g = canvas(22, 20)
disc(g, 11, 11, 4, 'm', 5)                                   # cuerpo rosado de crustáceo
disc(g, 11, 5, 3, 'M', 2.5)                                  # cabeza en espiral
for a in range(0, 330, 30): P(g, 11 + 2 * math.cos(math.radians(a)), 5 + 1.6 * math.sin(math.radians(a)), 'i')
poly(g, [(7, 9), (0, 3), (2, 12)], 'v'); poly(g, [(15, 9), (22, 3), (20, 12)], 'v')   # alas membranosas
for x0 in (8, 11, 14): line(g, x0, 15, x0 - 1, 19, 'M')
S['miGo'] = rows(outline(g))

# El Ajedrecista del Rey de Amarillo (élite · El Turco): un autómata con túnica amarilla y su tablero
g = canvas(36, 40)
rect(g, 2, 26, 21, 31, 'n')                                  # mesa
for i in range(4):
    for j in range(2): rect(g, 3 + i * 4 + (j % 2) * 2, 27 + j * 2, 4 + i * 4 + (j % 2) * 2, 27 + j * 2, 'W')
poly(g, [(16, 38), (32, 38), (30, 12), (18, 12)], 'h')       # túnica amarilla
poly(g, [(18, 14), (24, 2), (30, 14)], 'H')                  # capucha
rect(g, 21, 8, 27, 12, 'k'); P(g, 22, 10, 'E'); P(g, 26, 10, 'E')
line(g, 18, 18, 12, 25, 'h', 2); disc(g, 11, 26, 1.6, 'k')   # mano sobre una pieza
for x in range(19, 30, 3): P(g, x, 22, 'H')
disc(g, 33, 4, 1.6, 'h'); line(g, 33, 6, 33, 9, 'h')         # el Signo Amarillo flotando
S['turcoAmarillo'] = rows(outline(g))

# El Horno de Yuggoth (élite · Horno Alto): un horno de piedra negra con una boca de fuego verde
g = canvas(32, 40)
poly(g, [(6, 39), (26, 39), (23, 6), (9, 6)], 'd')
rect(g, 12, 0, 20, 6, 'd')
for y in range(10, 39, 4): line(g, 8, y, 24, y, 'k')
disc(g, 16, 26, 6, 'E', 5); disc(g, 16, 27, 4, 'W', 3)       # la boca de fuego frío
for x, y in ((12, 22), (20, 22)): P(g, x, y, 'k')
for x, y in ((14, -1), (18, 1), (16, -3)): P(g, x, y, 'E')    # chispas
for x, y in ((11, 14), (21, 14)): disc(g, x, y, 1.4, 'F')    # ojos de brasa
S['hornoYuggoth'] = rows(outline(g))

# El Volante de Azathoth (élite · Volante): un volante de inercia que gira alrededor de un ojo ciego
g = canvas(36, 36)
for r, ch in ((16, 'l'), (13, 'g')): arc(g, 18, 18, r, 0, 360, ch, paso=2)
disc(g, 18, 18, 15, 'l'); disc(g, 18, 18, 12, 'g'); disc(g, 18, 18, 6, 'p')
for a in range(0, 360, 45):
    line(g, 18 + 6 * math.cos(math.radians(a)), 18 + 6 * math.sin(math.radians(a)), 18 + 12 * math.cos(math.radians(a)), 18 + 12 * math.sin(math.radians(a)), 'l')
disc(g, 18, 18, 3.5, 'i'); disc(g, 18, 18, 1.6, 'v')         # ojo ciego
for a in range(10, 360, 40): P(g, 18 + 17 * math.cos(math.radians(a)), 18 + 17 * math.sin(math.radians(a)), 'c')  # chispas de velocidad
S['volanteAzathoth'] = rows(outline(g))

# los enemigos miran hacia el héroe (izquierda)
for k in ('byakhee', 'gradiente', 'osario', 'turcoAmarillo'):
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
