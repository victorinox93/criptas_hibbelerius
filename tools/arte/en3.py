import math, json
from PIL import Image

PAL = {'k': '#0d0b10', 'd': '#2a2433', 'g': '#5a5468', 'l': '#9a93a8', 'w': '#d8d0c0', 'r': '#8b1e2b', 'R': '#c43a3a',
       'o': '#c87533', 'y': '#e8c15a', 'b': '#3b5a8a', 'B': '#6a8fc4', 'n': '#6b4a2b', 'p': '#4a2a5e', 'P': '#8e5bb0',
       'E': '#ffd27a', 'F': '#ff5a3a', 'W': '#f0ece4', 'h': '#4a3a2e', 'c': '#7fd8ff'}

def canvas(w, h):
    return [['.'] * w for _ in range(h)]

def P(g, x, y, ch):
    x, y = int(round(x)), int(round(y))
    if 0 <= y < len(g) and 0 <= x < len(g[0]): g[y][x] = ch

def disc(g, cx, cy, r, ch, ry=None):
    ry = ry or r
    for y in range(len(g)):
        for x in range(len(g[0])):
            if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1: g[y][x] = ch

def ring(g, cx, cy, r, ch, ry=None, step=6):
    ry = ry or r
    for a in range(0, 360, step):
        P(g, cx + r * math.cos(math.radians(a)), cy + ry * math.sin(math.radians(a)), ch)

S = {}
# 1. Bala de cañón espectral (con estela)
g = canvas(20, 14)
for i in range(7):
    for y in range(4 + i // 3, 11 - i // 3):
        P(g, i, y, 'o' if i > 3 else 'r' if (i + y) % 2 else '.')
disc(g, 13, 7, 6, 'd'); ring(g, 13, 7, 6, 'k', step=4)
disc(g, 11, 4.5, 2, 'g'); P(g, 10, 4, 'l')
P(g, 12, 7, 'F'); P(g, 13, 7, 'F'); P(g, 16, 7, 'F'); P(g, 17, 7, 'F')
for x in range(12, 18): P(g, x, 10, 'k')
P(g, 13, 9, 'k'); P(g, 16, 9, 'k')
S['bala'] = g

# 2. Tomo volador
g = canvas(22, 14)
for x in range(4, 18):
    for y in range(5, 12):
        P(g, x, y, 'W' if x != 10 and x != 11 else 'h')
for x in range(3, 19): P(g, x, 12, 'r'); P(g, x, 11, 'r') if x in (3, 18) else None
for y in range(5, 12): P(g, 3, y, 'r'); P(g, 18, y, 'r')
for y in (6, 8, 10):
    for x in (5, 6, 7, 8, 13, 14, 15, 16): P(g, x, y, 'g')
# ojo en la página
disc(g, 10.5, 8, 2.2, 'w', 1.6); P(g, 10, 8, 'F'); P(g, 11, 8, 'F')
# alas de páginas
for i in range(4):
    P(g, 2 - i // 2, 5 - i, 'w'); P(g, 1 - i // 2, 6 - i, 'l')
    P(g, 19 + i // 2, 5 - i, 'w'); P(g, 20 + i // 2, 6 - i, 'l')
S['tomo'] = g

# 3. Cohete de masa variable
g = canvas(12, 22)
for y in range(2, 16):
    half = min(3.5, (y - 1) * 0.9)
    for x in range(12):
        if abs(x - 5.5) <= half: P(g, x, y, 'l' if x < 6 else 'g')
for y in range(6, 9): P(g, 5, y, 'b'); P(g, 6, y, 'B')
P(g, 5, 7, 'c'); P(g, 6, 7, 'c')
for (x, y) in ((1, 13), (1, 14), (2, 12), (2, 13), (2, 14), (2, 15), (10, 13), (10, 14), (9, 12), (9, 13), (9, 14), (9, 15)):
    P(g, x, y, 'r')
for x in range(3, 9): P(g, x, 11, 'r')
for y in range(16, 22):
    for x in range(12):
        if abs(x - 5.5) <= 2.6 - (y - 16) * 0.4: P(g, x, y, 'E' if abs(x - 5.5) < 1 else 'o' if y < 19 else 'F')
S['cohete'] = g

# 4. Granada de conservación + fragmento
g = canvas(16, 18)
disc(g, 8, 11, 6, 'd'); ring(g, 8, 11, 6, 'k', step=4)
for (x, y) in ((6, 8), (7, 9), (7, 10), (8, 11), (10, 12), (11, 13), (5, 13), (6, 14)):
    P(g, x, y, 'o')
P(g, 6, 10, 'F'); P(g, 10, 10, 'F')
for y in range(3, 6): P(g, 8, y, 'g')
P(g, 9, 2, 'n'); P(g, 10, 1, 'E'); P(g, 11, 0, 'y'); P(g, 9, 1, 'o')
disc(g, 6.5, 8.5, 1.4, 'g')
S['granada'] = g
g = canvas(9, 9)
for (x, y) in ((4, 0), (3, 1), (4, 1), (5, 1), (2, 2), (3, 2), (4, 2), (5, 2), (6, 2), (1, 3), (2, 3), (3, 3), (4, 3), (5, 3), (6, 3), (7, 3),
               (2, 4), (3, 4), (4, 4), (5, 4), (6, 4), (3, 5), (4, 5), (5, 5), (4, 6)):
    P(g, x, y, 'd')
P(g, 3, 3, 'F'); P(g, 5, 3, 'F'); P(g, 4, 2, 'o'); P(g, 4, 4, 'o')
S['fragmento'] = g

# 5. Ariete del Tomo (élite): cabeza de carnero de hierro con cadenas
g = canvas(26, 18)
for x in range(2, 20):
    for y in range(7, 12): P(g, x, y, 'n' if (x + y) % 3 else 'h')
for x in (6, 12):
    for y in range(0, 7): P(g, x, y, 'g' if y % 2 else 'l')
disc(g, 20, 9, 5.5, 'g', 6); ring(g, 20, 9, 5.5, 'k', 6, 5)
for i in range(8):
    a = math.radians(200 + i * 25)
    P(g, 18 + 5 * math.cos(a), 6 + 4 * math.sin(a), 'l')
    P(g, 18 + 4 * math.cos(a), 6 + 3.2 * math.sin(a), 'w')
P(g, 22, 8, 'F'); P(g, 23, 8, 'F'); P(g, 24, 11, 'k'); P(g, 25, 10, 'l'); P(g, 25, 11, 'l')
for y in range(4, 15): P(g, 1, y, 'g'); P(g, 0, y, 'k')
S['ariete'] = g

# 6. Giróscopo centinela (élite)
g = canvas(22, 22)
ring(g, 11, 11, 10, 'y', 4, 4); ring(g, 11, 11, 4, 'y', 10, 4); ring(g, 11, 11, 8, 'l', 8, 5)
disc(g, 11, 11, 3.5, 'p'); disc(g, 11, 11, 2, 'w'); P(g, 11, 11, 'F'); P(g, 10, 11, 'F')
for y in range(0, 3): P(g, 11, y, 'g')
for y in range(19, 22): P(g, 11, y, 'g')
S['centinela'] = g

out = {k: [''.join(r) for r in v] for k, v in S.items()}
json.dump(out, open('en3.json', 'w'))
sc = 6
tot_w = sum(len(v[0]) + 4 for v in out.values()) * sc
im = Image.new('RGBA', (tot_w, 26 * sc), (40, 34, 50, 255))
ox = 0
for k, rows in out.items():
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in PAL:
                c = PAL[ch].lstrip('#')
                for dy in range(sc):
                    for dx in range(sc):
                        im.putpixel((ox + (x + 2) * sc + dx, (y + 2) * sc + dy), tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,))
    ox += (len(rows[0]) + 4) * sc
im.save('en3.png')
