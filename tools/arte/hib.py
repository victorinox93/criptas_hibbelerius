"""Genera la matriz de Hibbelerius (48x64) y una vista previa."""
import math, json, sys
from PIL import Image

Wd, Ht = 48, 64
g = [['.'] * Wd for _ in range(Ht)]
C = 23.5

def put(x, y, ch):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < Wd and 0 <= y < Ht:
        g[y][x] = ch

def sym(x, y, ch):
    put(x, y, ch); put(2 * C - x, y, ch)

def hline(x0, x1, y, ch):
    for x in range(int(x0), int(x1) + 1):
        put(x, y, ch)

# ── túnica: trapecio que se abre hacia abajo ──
for y in range(26, 64):
    t = (y - 26) / 37
    half = 9 + t * 14.5
    for x in range(int(C - half), int(C + half) + 1):
        put(x, y, 'd')
    # pliegues
    for k in (-0.62, -0.3, 0.3, 0.62):
        fx = C + k * half
        if y > 34: put(fx, y, 'p')
# dobladillo dentado
for x in range(0, Wd):
    if g[63][x] == 'd' and x % 3 == 0: g[63][x] = '.'
    if g[62][x] == 'd' and x % 6 == 0: g[62][x] = '.'
# franja central carmesí con runas doradas
for y in range(34, 64):
    w = 2 + (y - 34) // 10
    for x in range(int(C - w), int(C + w) + 1):
        put(x, y, 'q')
    if y % 4 == 0: sym(C - 0.5, y, 'y')
    sym(C - w - 1, y, 'y')
# ribete del dobladillo
for x in range(0, Wd):
    for y in (60, 61):
        if g[y][x] in 'dp' and (x + y) % 2 == 0: g[y][x] = 'P'

# sigilos dorados en la túnica
for cx in (C - 12, C + 12):
    for a in range(0, 360, 15):
        put(cx + 2.6 * math.cos(math.radians(a)), 49 + 2.6 * math.sin(math.radians(a)), 'y')
    put(cx, 49, 'E'); put(cx, 46, 'y'); put(cx, 52, 'y')
# ── capa exterior: sombra en los bordes ──
for y in range(28, 64):
    t = (y - 26) / 37
    half = 9 + t * 14.5
    put(C - half, y, 'k'); put(C + half, y, 'k')

# ── capucha ──
for y in range(4, 30):
    if y < 12:
        half = 2 + (y - 4) * 0.9
    else:
        half = 8.4 + (y - 12) * 0.2
    for x in range(int(C - half), int(C + half) + 1):
        put(x, y, 'p')
    put(C - half, y, 'k'); put(C + half, y, 'k')
    if y >= 12:
        put(C - half + 1, y, 'P'); put(C + half - 1, y, 'd')
# punta de la capucha
for y in range(0, 5):
    sym(C - 0.5, y, 'p')
put(C - 0.5, 0, 'k'); put(C + 0.5, 0, 'k')
# ── hombreras ──
for cx in (12.5, 34.5):
    for y in range(24, 32):
        for x in range(int(cx - 6), int(cx + 7)):
            if ((x - cx) / 6.2) ** 2 + ((y - 28) / 3.8) ** 2 <= 1:
                put(x, y, 'g')
    for x in range(int(cx - 5), int(cx + 6)):
        put(x, 25, 'l')
    # púas
    for i, dx in enumerate((-4, 0, 4)):
        put(cx + dx, 23, 'l'); put(cx + dx, 22, 'w')
        if dx == 0: put(cx, 21, 'w'); put(cx, 20, 'w')
    sym(cx - 5, 30, 'y') if cx < C else None

# hueco del rostro: vacío
for y in range(12, 25):
    for x in range(Wd):
        if ((x - C) / 5.2) ** 2 + ((y - 18) / 6.2) ** 2 <= 1:
            put(x, y, 'k')
# ojos
for ex in (20.5, 26.5):
    put(ex - 0.5, 16, 'F'); put(ex + 0.5, 16, 'F'); put(ex, 15, 'E'); put(ex, 17, 'r')

# ── corona con gemas ──
for x in range(17, 31):
    put(x, 10, 'y'); put(x, 11, 'Y')
for x in (19, 23.5, 28):
    put(x, 9, 'y')
put(23, 9, 'R'); put(24, 9, 'R'); put(23, 8, 'y'); put(24, 8, 'y')

# ── cuernos (hueso) ──
def horn(sign):
    for i in range(26):
        t = i / 25
        x = C + sign * (6 + 12 * t + 2 * math.sin(t * math.pi))
        y = 11 - 4 * t - 6 * t ** 3
        th = 4 if i < 5 else 3 if i < 10 else 2 if i < 15 else 1
        for d in range(th):
            put(x, y + d, 'w' if d == 0 else ('h' if d == th - 1 else 'W'))
        if i % 5 == 2 and th > 1: put(x, y + th - 1, 'k')
horn(-1); horn(1)

# ── barba ──
for y in range(21, 44):
    t = (y - 21) / 22
    half = 4.5 - t * 3.8
    for x in range(int(C - half), int(C + half) + 1):
        put(x, y, 'W' if (x + y) % 5 else 'l')
    put(C - half, y, 'l')
# boca/sombra
put(23, 22, 'k'); put(24, 22, 'k')

# ── brazo izquierdo (del espectador) y bastón ──
for i in range(9):
    x = 11 - i * 0.7; y = 31 + i
    for d in range(4):
        put(x + d - 1, y, 'd' if d else 'p')
for y in range(37, 40):
    for x in range(3, 8):
        put(x, y, 's')
# bastón
for y in range(14, 64):
    put(4, y, 'n'); put(5, y, 'N' if y % 5 else 'n')
# engrane en la punta
for a in range(0, 360, 10):
    r = 4.4 + (0.9 if (a // 30) % 2 == 0 else 0)
    put(4.5 + r * math.cos(math.radians(a)), 13.5 + r * math.sin(math.radians(a)), 'y')
for a in range(0, 360, 20):
    put(4.5 + 2.6 * math.cos(math.radians(a)), 13.5 + 2.6 * math.sin(math.radians(a)), 'k')
put(4, 13, 'E'); put(5, 13, 'E'); put(4, 14, 'B'); put(5, 14, 'E')

# ── brazo derecho y tomo abierto ──
for i in range(7):
    x = 36 + i * 0.3; y = 31 + i
    for d in range(4):
        put(x + d - 2, y, 'd' if d < 3 else 'p')
for x in range(33, 46):
    for y in range(36, 42):
        put(x, y, 'R')
for x in range(34, 45):
    for y in range(35, 40):
        put(x, y, 'W' if x != 39 else 'h')
for y in (36, 38):
    for x in (35, 36, 37, 41, 42, 43):
        put(x, y, 'k')
for x in range(36, 40):
    put(x, 41, 's')
# chispas del tomo
for (x, y) in ((37, 32), (41, 30), (39, 28), (43, 33), (35, 29), (40, 25)):
    put(x, y, 'B')
for (x, y) in ((38, 34), (42, 34), (39, 33)):
    put(x, y, 'E')

rows = [''.join(r) for r in g]
pal = {
    'k': '#07060a', 'd': '#1a1222', 'p': '#3a1f4e', 'P': '#6a3f8a', 'q': '#4a0f1e',
    'y': '#c8a050', 'Y': '#8a6a30', 'R': '#7a1a2a', 'g': '#3a3644', 'l': '#7a7488',
    'w': '#d8d0c0', 'h': '#8a8070', 'W': '#cfcad6', 'F': '#ff4a2a', 'E': '#ffd27a', 'r': '#7a1a10',
    's': '#8a7a8e', 'n': '#3a2a1e', 'N': '#5a4030', 'B': '#7fd8ff',
}
im = Image.new('RGBA', (Wd, Ht), (0, 0, 0, 0))
for y, r in enumerate(rows):
    for x, ch in enumerate(r):
        if ch in pal:
            c = pal[ch].lstrip('#')
            im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,))
bg = Image.new('RGBA', (Wd + 8, Ht + 8), (40, 34, 50, 255))
bg.paste(im, (4, 4), im)
bg.resize(((Wd + 8) * 6, (Ht + 8) * 6), Image.NEAREST).save(sys.argv[1] if len(sys.argv) > 1 else 'hib.png')
json.dump({'rows': rows, 'pal': pal}, open('hib.json', 'w'))
