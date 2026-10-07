# Acto IV · El Núcleo del Cálculo: autómatas de relojería y AM.
# Uso: python3 tools/arte/en4.py  → escribe src/art/act4.ts y una vista previa en /tmp/act4.png
import math, json, sys
from PIL import Image

PAL = {
    'k': '#0a0908', 'd': '#1e1a16', 'g': '#4a4038', 'l': '#8a8070', 'w': '#d8d0b8',
    'y': '#d8a848', 'Y': '#8a6424', 'o': '#b8642a', 'O': '#7a3a18',
    'F': '#ff3a1a', 'E': '#ffd27a', 'c': '#7fd8ff', 'b': '#2a4a6a', 'B': '#4a7aa0',
    'L': '#3aff6a', 'M': '#1a7a3a', 'W': '#f0ece4', 'r': '#6a1414', 'R': '#a82a2a',
    'p': '#3a2a1e', 'P': '#6a4a2a', 's': '#c8b8a0', 'n': '#0e1210',
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

def ring(g, cx, cy, r, ch, ry=None, step=4):
    ry = ry or r
    for a in range(0, 360, step):
        P(g, cx + r * math.cos(math.radians(a)), cy + ry * math.sin(math.radians(a)), ch)

def line(g, x0, y0, x1, y1, ch):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1):
        t = i / max(1, n)
        P(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, ch)

def gear(g, cx, cy, r, teeth, body='y', tooth='Y', hub='d'):
    disc(g, cx, cy, r, body)
    for i in range(teeth):
        a = 2 * math.pi * i / teeth
        for d in (r + 0.6, r + 1.4):
            P(g, cx + d * math.cos(a), cy + d * math.sin(a), tooth)
    disc(g, cx, cy, max(1.2, r * 0.35), hub)

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

def mirror(g):
    w = len(g[0])
    for row in g:
        for x in range(w // 2):
            row[w - 1 - x] = row[x]
    return g

S = {}

# 1. Engrane Dentado: un engrane flotante con un ojo
g = canvas(22, 22)
gear(g, 10.5, 10.5, 7.2, 10)
disc(g, 10.5, 10.5, 3.6, 'Y')
disc(g, 10.5, 10.5, 2.2, 'd')
P(g, 10, 10, 'F'); P(g, 11, 10, 'F'); P(g, 10, 11, 'r'); P(g, 11, 11, 'F'); P(g, 10, 10, 'E')
for a in range(200, 260, 12):
    P(g, 10.5 + 5.6 * math.cos(math.radians(a)), 10.5 + 5.6 * math.sin(math.radians(a)), 'w')
S['engrane'] = outline(g)

# 2. Autómata Oscilante: el torso es un péndulo dentro de un marco
g = canvas(20, 30)
rect(g, 6, 2, 13, 7, 'l'); rect(g, 7, 3, 12, 6, 'g')
P(g, 8, 4, 'c'); P(g, 11, 4, 'c'); line(g, 8, 6, 11, 6, 'd')
line(g, 9, 0, 9, 1, 'g'); P(g, 9, 0, 'E')
rect(g, 4, 9, 15, 21, 'Y'); rect(g, 5, 10, 14, 20, 'd')
line(g, 9.5, 10, 7, 17, 'l'); disc(g, 6.8, 17.6, 1.8, 'y'); P(g, 6, 17, 'w')
for x in (5, 14):
    line(g, x, 8, x, 8, 'Y')
line(g, 3, 10, 1, 17, 'g'); line(g, 16, 10, 18, 17, 'g')
P(g, 1, 18, 'l'); P(g, 18, 18, 'l')
line(g, 7, 22, 6, 28, 'g'); line(g, 12, 22, 13, 28, 'g')
rect(g, 4, 28, 7, 29, 'l'); rect(g, 12, 28, 15, 29, 'l')
P(g, 9, 8, 'g'); P(g, 10, 8, 'g')
S['oscilador'] = outline(g)

# 3. Autómata Derivador: alto, con la recta tangente en el pecho
g = canvas(22, 32)
rect(g, 7, 1, 14, 7, 'l'); rect(g, 8, 2, 13, 6, 'g')
line(g, 8, 4, 13, 4, 'F'); P(g, 10, 4, 'E'); P(g, 11, 4, 'E')
line(g, 10, 0, 11, 0, 'Y')
rect(g, 9, 8, 12, 8, 'Y')
rect(g, 5, 9, 16, 21, 'b'); rect(g, 6, 10, 15, 20, 'd')
# curva y su tangente (dx/dt)
for x in range(6, 16):
    y = 19 - ((x - 6) / 9) ** 2 * 8
    P(g, x, y, 'B')
line(g, 8, 20, 15, 12, 'c'); P(g, 12, 15, 'E')
line(g, 4, 10, 1, 19, 'l'); line(g, 17, 10, 20, 19, 'l')
P(g, 1, 20, 'y'); P(g, 20, 20, 'y')
rect(g, 7, 22, 14, 23, 'g')
line(g, 8, 24, 7, 30, 'l'); line(g, 13, 24, 14, 30, 'l')
rect(g, 5, 30, 8, 31, 'g'); rect(g, 13, 30, 16, 31, 'g')
S['derivador'] = outline(g)

# 4. Autómata Integrador: ancho, con orugas y una ∫ de latón
g = canvas(26, 26)
rect(g, 8, 1, 17, 6, 'l'); rect(g, 9, 2, 16, 5, 'g')
P(g, 10, 3, 'F'); P(g, 15, 3, 'F'); P(g, 11, 3, 'r'); P(g, 14, 3, 'r')
rect(g, 3, 7, 22, 18, 'O'); rect(g, 4, 8, 21, 17, 'o')
# ∫
line(g, 14, 9, 13, 9, 'y'); P(g, 15, 10, 'y'); P(g, 12, 10, 'y')
line(g, 12, 10, 12, 15, 'y'); line(g, 13, 10, 13, 15, 'Y')
P(g, 11, 16, 'y'); P(g, 10, 16, 'y'); P(g, 9, 15, 'y')
for x in (5, 20):
    for y in (9, 12, 15):
        P(g, x, y, 'Y')
line(g, 2, 9, 0, 14, 'g'); line(g, 23, 9, 25, 14, 'g')
rect(g, 2, 19, 23, 24, 'g'); rect(g, 3, 20, 22, 23, 'd')
for x in range(4, 22, 3):
    disc(g, x + 0.5, 21.5, 1.2, 'l')
S['integrador'] = outline(g)

# 5. Reloj Andante: reloj de bolsillo con patas
g = canvas(20, 24)
disc(g, 9.5, 10, 7.5, 'y'); disc(g, 9.5, 10, 6, 'W')
for i in range(12):
    a = 2 * math.pi * i / 12
    P(g, 9.5 + 5 * math.cos(a), 10 + 5 * math.sin(a), 'g')
line(g, 9.5, 10, 9.5, 6, 'k'); line(g, 9.5, 10, 12, 11, 'k')
P(g, 7, 8, 'F'); P(g, 12, 8, 'F')
rect(g, 8, 1, 11, 2, 'Y'); rect(g, 9, 0, 10, 0, 'y')
line(g, 6, 17, 3, 22, 'g'); line(g, 13, 17, 16, 22, 'g')
line(g, 8, 17, 7, 22, 'g'); line(g, 11, 17, 12, 22, 'g')
line(g, 2, 9, 0, 12, 'g'); line(g, 17, 9, 19, 12, 'g')
P(g, 5, 6, 'w'); P(g, 6, 5, 'w')
S['reloj'] = outline(g)

# 6. Bobina de Chispas (Tesla)
g = canvas(18, 32)
disc(g, 8.5, 4, 6, 'l', 2.6); disc(g, 8.5, 4, 3.5, 'g', 1.2)
for y in range(7, 25):
    rect(g, 6, y, 11, y, 'o' if y % 2 else 'O')
rect(g, 3, 25, 14, 28, 'g'); rect(g, 2, 29, 15, 31, 'd')
P(g, 6, 27, 'F'); P(g, 11, 27, 'F')
for (x, y) in ((1, 2), (0, 4), (1, 6), (16, 1), (17, 4), (15, 6), (3, 9), (14, 10)):
    P(g, x, y, 'c')
S['bobina'] = outline(g)

# 7. Máquina Diferencial (élite): columnas de engranes sobre una base de madera
g = canvas(38, 36)
rect(g, 2, 28, 35, 33, 'p'); rect(g, 3, 29, 34, 32, 'P')
rect(g, 1, 34, 36, 35, 'd')
rect(g, 3, 2, 34, 4, 'Y'); rect(g, 3, 3, 34, 3, 'y')
for cx in (8, 18.5, 29):
    line(g, cx, 5, cx, 27, 'g')
    for k, cy in enumerate(range(7, 27, 4)):
        disc(g, cx, cy, 3.6, 'y' if k % 2 else 'Y', 1.4)
        P(g, cx - 1, cy, 'w')
disc(g, 18.5, 17, 3, 'r'); disc(g, 18.5, 17, 1.6, 'F'); P(g, 18, 17, 'E')
line(g, 34, 16, 37, 16, 'l'); line(g, 37, 16, 37, 20, 'l'); P(g, 37, 21, 'P')
for x in range(5, 33, 3):
    P(g, x, 30, 'Y')
S['babbage'] = outline(g)

# 8. Telar de Jacquard (élite): tarjetas perforadas y ojos en el travesaño
g = canvas(38, 34)
rect(g, 2, 6, 4, 32, 'p'); rect(g, 33, 6, 35, 32, 'p')
rect(g, 2, 6, 35, 9, 'P'); rect(g, 3, 7, 34, 8, 'p')
P(g, 14, 7, 'F'); P(g, 15, 7, 'F'); P(g, 22, 7, 'F'); P(g, 23, 7, 'F')
for x in range(6, 32, 2):
    line(g, x, 10, x, 26, 'l')
rect(g, 5, 18, 32, 19, 'Y')
rect(g, 5, 26, 32, 28, 'P')
rect(g, 1, 32, 36, 33, 'd')
# cadena de tarjetas perforadas que cuelga arriba
for i, x in enumerate(range(4, 34, 5)):
    y = 1 + (i % 2)
    rect(g, x, y, x + 3, y + 3, 's')
    P(g, x + 1, y + 1, 'k'); P(g, x + 2, y + 2, 'k')
for y in range(22, 26):
    rect(g, 15, y, 22, y, 'R' if y % 2 else 'r')
S['telar'] = outline(g)

# 9. El Turco Mecánico (élite): autómata de ajedrez sobre su gabinete
g = canvas(32, 38)
disc(g, 15.5, 5, 6, 'W', 4)
P(g, 15, 3, 'E'); P(g, 16, 3, 'F')
rect(g, 12, 8, 19, 12, 'l'); rect(g, 13, 9, 18, 11, 's')
P(g, 14, 10, 'F'); P(g, 17, 10, 'F'); line(g, 14, 12, 17, 12, 'g')
rect(g, 9, 13, 22, 23, 'R'); rect(g, 10, 14, 21, 22, 'r')
line(g, 15, 13, 15, 22, 'y'); line(g, 16, 13, 16, 22, 'y')
line(g, 8, 14, 3, 21, 'R'); line(g, 23, 14, 27, 19, 'R')
P(g, 3, 22, 'l'); P(g, 27, 20, 'l'); P(g, 28, 21, 'l')
rect(g, 1, 23, 30, 25, 'k')
for x in range(2, 30):
    P(g, x, 24, 'W' if (x // 2) % 2 else 'g')
rect(g, 2, 26, 29, 35, 'p'); rect(g, 3, 27, 28, 34, 'P')
rect(g, 5, 28, 13, 33, 'p'); rect(g, 18, 28, 26, 33, 'p')
P(g, 12, 31, 'y'); P(g, 19, 31, 'y')
rect(g, 1, 36, 30, 37, 'd')
P(g, 7, 22, 'W'); P(g, 7, 21, 'W'); P(g, 24, 22, 'k'); P(g, 24, 21, 'k')
S['turco'] = outline(g)

# 10. AM: monolito sin boca, circuitos verdes y un ojo rojo
g = canvas(46, 64)
for y in range(4, 58):
    half = 15 + (y - 4) * 0.08
    for x in range(46):
        if abs(x - 22.5) <= half:
            P(g, x, y, 'd')
for y in range(4, 58):
    half = 15 + (y - 4) * 0.08
    P(g, 22.5 - half, y, 'g'); P(g, 22.5 + half, y, 'g')
rect(g, 8, 3, 37, 4, 'g')
# circuitos (mitad izquierda; luego espejo)
for (x0, y0, x1, y1) in ((10, 8, 10, 20), (10, 20, 16, 20), (16, 20, 16, 26), (13, 30, 13, 44), (13, 44, 19, 44),
                         (19, 44, 19, 50), (10, 36, 13, 36), (17, 8, 17, 14), (17, 14, 20, 14), (9, 48, 9, 55)):
    line(g, x0, y0, x1, y1, 'M')
for (x, y) in ((10, 8), (16, 26), (13, 30), (19, 50), (17, 8), (9, 55), (10, 36)):
    P(g, x, y, 'L')
g = mirror(g)
# ojo
disc(g, 22.5, 22, 7, 'r', 5); disc(g, 22.5, 22, 4.6, 'R', 3.4); disc(g, 22.5, 22, 2.6, 'F', 2.2)
P(g, 22, 21, 'E'); P(g, 23, 21, 'E'); P(g, 22, 22, 'W')
# «no tengo boca»: costura cerrada
line(g, 15, 38, 30, 38, 'g')
for x in range(16, 30, 3):
    P(g, x, 37, 'l'); P(g, x, 39, 'l')
# cables que cuelgan
for x in (12, 18, 27, 33):
    for y in range(58, 64):
        P(g, x + (1 if (y // 2) % 2 else 0), y, 'g')
    P(g, x, 63, 'L')
S['am'] = outline(g)

# ── salida ──
pal = {k: v for k, v in PAL.items()}
lines = ['// ════════ ACTO IV · El Núcleo del Cálculo · generado con tools/arte/en4.py (python3) ════════',
         '/** Paleta de latón, cobre y acero (los autómatas) */',
         'export const ACT4_PAL: Record<string, string> = ' + json.dumps(pal) + ';',
         '/** Autómatas de relojería y AM */',
         'export const ACT4_SPRITES: Record<string, string[]> = {']
for k, g in S.items():
    lines.append(f'  {k}: [')
    for row in g:
        lines.append(f"    '{''.join(row)}',")
    lines.append('  ],')
lines.append('};')
open(sys.argv[1] if len(sys.argv) > 1 else 'src/art/act4.ts', 'w').write('\n'.join(lines) + '\n')

# vista previa
sc = 6
W = sum(len(g[0]) * sc + 20 for g in S.values())
Hh = max(len(g) for g in S.values()) * sc + 20
im = Image.new('RGB', (W, Hh), (24, 20, 28))
x0 = 10
for g in S.values():
    for y, row in enumerate(g):
        for x, ch in enumerate(row):
            if ch == '.':
                continue
            col = tuple(int(pal[ch][i:i + 2], 16) for i in (1, 3, 5))
            for dy in range(sc):
                for dx in range(sc):
                    im.putpixel((x0 + x * sc + dx, 10 + y * sc + dy), col)
    x0 += len(g[0]) * sc + 20
im.save('/tmp/claude-0/-home-claude/99d6a04e-70b7-50ea-9b4e-0411dda7099a/scratchpad/act4.png')
print('ok', list(S))
