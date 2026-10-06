"""Hibbelerius v0.14: la Parca del Tomo (48x64). Encapuchado esquelético que flota,
con guadaña sobre la cabeza y el tomo encadenado a la cintura. Genera hib.json y una vista previa."""
import math, json, sys
from PIL import Image

Wd, Ht = 48, 64
g = [['.'] * Wd for _ in range(Ht)]
C = 22.5


def put(x, y, ch):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < Wd and 0 <= y < Ht:
        g[y][x] = ch


def get(x, y):
    return g[y][x] if 0 <= x < Wd and 0 <= y < Ht else '.'


def line(x0, y0, x1, y1, ch, th=1):
    n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        y = y0 + (y1 - y0) * i / n
        for d in range(th):
            put(x + d, y, ch)


# ── túnica flotante: se abre y termina en jirones ──
for y in range(22, 62):
    t = (y - 22) / 39
    half = 8 + t * 12 + 2 * math.sin(t * 3)
    off = 1.5 * math.sin(y / 5)  # ondea
    for x in range(int(C - half + off), int(C + half + off) + 1):
        put(x, y, 'd')
    # pliegues
    for k in (-0.55, -0.15, 0.3, 0.7):
        if y > 28:
            put(C + off + k * half, y, 'p')
    put(C - half + off, y, 'k')
    put(C + half + off, y, 'k')
# jirones: tiras de distinto largo que se desvanecen
for i, x in enumerate(range(4, 44, 3)):
    ln = 2 + (i * 7) % 6
    for y in range(52, 52 + ln + 4):
        if get(x, y - 1) in 'dpP' or y == 52:
            put(x, y, 'd' if (y + i) % 3 else 'p')
for y in range(56, 64):
    for x in range(Wd):
        if get(x, y) in 'dpk' and (x * 7 + y * 3) % (11 - (y - 56)) == 0:
            put(x, y, '.')
# ribete dorado al centro de la túnica abierta
for y in range(30, 54):
    w = 2 + (y - 30) // 8
    put(C - w, y, 'y')
    put(C + w, y, 'y')
    for x in range(int(C - w + 1), int(C + w)):
        put(x, y, 'k')

# ── costillas visibles en el pecho ──
for y in (31, 34, 37, 40):
    line(C - 3.5, y, C + 3.5, y, 'w')
    put(C - 4, y + 1, 'h')
    put(C + 4, y + 1, 'h')
for y in range(30, 44):
    put(C, y, 'W')  # esternón / columna

# ── capucha profunda ──
for y in range(3, 27):
    if y < 10:
        half = 3 + (y - 3) * 0.95
    else:
        half = 9.6 + (y - 10) * 0.12
    lean = -(10 - y) * 0.35 if y < 10 else 0  # la punta cae hacia atrás
    for x in range(int(C - half + lean), int(C + half + lean) + 1):
        put(x, y, 'p')
    put(C - half + lean, y, 'k')
    put(C + half + lean, y, 'k')
    if y > 8:
        put(C - half + lean + 1, y, 'P')
# borde dorado de la capucha
for a in range(200, 341, 6):
    put(C + 7.4 * math.cos(math.radians(a)), 19 + 9.5 * math.sin(math.radians(a)), 'y')
# hueco oscuro de la capucha
for y in range(10, 27):
    for x in range(Wd):
        if ((x - C) / 6.4) ** 2 + ((y - 19) / 8.4) ** 2 <= 1:
            put(x, y, 'k')

# ── cráneo ──
for y in range(13, 26):
    for x in range(Wd):
        if ((x - C) / 4.6) ** 2 + ((y - 18.5) / 5.2) ** 2 <= 1:
            put(x, y, 'w')
for y in range(15, 24):
    put(C + 4, y, 'h')  # sombra lateral
# cuencas con brasas rojas
for ex in (C - 2, C + 2):
    for dx in (-0.5, 0.5):
        put(ex + dx, 17, 'k')
        put(ex + dx, 18, 'k')
    put(ex, 17, 'F')
    put(ex, 18, 'r')
# nariz y dientes
put(C, 20, 'k')
for x in range(int(C - 2), int(C + 3)):
    put(x, 22, 'W')
    if x % 2 == 0:
        put(x, 23, 'k')
put(C - 2.5, 23, 'h'); put(C + 2.5, 23, 'h')

# ── guadaña: asta en diagonal (delante del cuerpo) ──
SX0, SY0, SX1, SY1 = 4.5, 63, 42, 7
line(SX0, SY0, SX1, SY1, 'n')
line(SX0 + 1, SY0, SX1 + 1, SY1, 'N')
def on_shaft(y):
    return SX0 + (SY0 - y) * (SX1 - SX0) / (SY0 - SY1)

# ── brazos huesudos que la sostienen ──
hx1, hy1 = on_shaft(44), 44
hx2, hy2 = on_shaft(29), 29
line(C - 8, 27, hx1 - 2, hy1 - 3, 'P', 3)   # manga izquierda
line(C + 8, 26, hx2 + 1, hy2 - 1, 'P', 3)   # manga derecha
for (x, y) in ((hx1 - 1, hy1), (hx1, hy1 - 1), (hx1 + 1, hy1), (hx1, hy1 + 1), (hx1 + 2, hy1 + 1)):
    put(x, y, 'w')
for (x, y) in ((hx2, hy2), (hx2 + 1, hy2 - 1), (hx2 + 2, hy2), (hx2 + 1, hy2 + 1), (hx2 - 1, hy2 + 1)):
    put(x, y, 'w')

# hoja: medialuna sobre la cabeza que termina en punta hacia abajo a la izquierda
CX, CY, RO = 25, 33, 28
for i in range(160):
    t = i / 159
    a = math.radians(55 + 97 * t)
    th = 5.5 * (1 - t) + 1
    for k in range(int(th * 2) + 1):
        r = RO - k * 0.5
        ch = 'W' if k == 0 else ('g' if k >= int(th * 2) - 1 else 'l')
        put(CX + r * math.cos(a), CY - r * math.sin(a), ch)
# collar dorado donde la hoja se une al asta
for (x, y) in ((SX1, SY1), (SX1 + 1, SY1), (SX1, SY1 + 1), (SX1 + 1, SY1 + 1), (SX1 - 1, SY1 + 2)):
    put(x, y, 'y')

# ── el tomo encadenado a la cintura ──
for x in range(int(C - 13), int(C - 4)):
    put(x, 44 + (x % 2), 'l')  # cadena
for y in range(45, 54):
    for x in range(int(C - 17), int(C - 9)):
        put(x, y, 'R')
for y in range(46, 53):
    put(C - 10, y, 'W')  # páginas
for (x, y) in ((C - 15, 47), (C - 13, 49), (C - 15, 51)):
    put(x, y, 'y')
put(C - 13, 47, 'E')

# ── almas que lo rodean ──
for (x, y) in ((3, 20), (44, 34), (6, 44), (41, 50), (2, 32)):
    put(x, y, 'B'); put(x, y + 1, 'B'); put(x, y - 1, 'E')

rows = [''.join(r) for r in g]
pal = {
    'k': '#07060a', 'd': '#140e1c', 'p': '#2e1840', 'P': '#5a3478', 'q': '#4a0f1e',
    'y': '#c8a050', 'Y': '#8a6a30', 'R': '#6a1424', 'g': '#4a4656', 'l': '#8a8498',
    'w': '#e0d8c4', 'h': '#9a9080', 'W': '#f0ecf4', 'F': '#ff3a1a', 'E': '#ffd27a', 'r': '#7a1a10',
    's': '#8a7a8e', 'n': '#3a2a1e', 'N': '#5a4030', 'B': '#7fe8c8',
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
json.dump({'rows': rows, 'pal': pal}, open(sys.argv[2] if len(sys.argv) > 2 else 'hib.json', 'w'))
