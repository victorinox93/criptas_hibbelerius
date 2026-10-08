# Layla, la gata atigrada que atiende la tienda del menú.
# Uso: python3 tools/arte/layla.py → escribe src/art/layla.ts
import json, sys

# tonos de la foto: atigrada gris-café, rayas casi negras, hocico y pecho blancos, ojos gris verdoso
PAL = {'k': '#100e0c', 'o': '#8c7f6c', 'O': '#3e352c', 'd': '#2a241e', 'W': '#eee8de', 'w': '#c4baac', 'q': '#a89c88',
       'G': '#8ca89a', 'g': '#2a3a34', 'p': '#a8746a', 'n': '#6a4a2a', 'N': '#4a3020', 'y': '#e8c15a', 'Y': '#a87a2a', 'r': '#a8323a'}
W, H = 30, 32
g = [['.'] * W for _ in range(H)]
def P(x, y, c):
    if 0 <= x < W and 0 <= y < H: g[y][x] = c
def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): P(x, y, c)
def oval(cx, cy, rx, ry, c):
    for y in range(H):
        for x in range(W):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1: P(x, y, c)

cx = 13.5
# cola que se enrosca (detrás)
for i, (x, y) in enumerate([(22, 29), (24, 28), (26, 26), (27, 24), (27, 22), (26, 20), (25, 19)]):
    oval(x, y, 1.6, 1.6, 'o' if i % 2 == 0 else 'O')
P(25, 18, 'O'); P(24, 18, 'O')
# cuerpo sentado
oval(cx, 23, 8, 8, 'o')
oval(cx, 24, 4.5, 6.5, 'W')  # pecho blanco
# rayas del cuerpo (atigrado «caballa»: franjas verticales que bajan por los costados)
for y in (16, 19, 22, 25):
    for x in (6, 7, 8, 19, 20, 21):
        if 0 <= y < H and g[y][x] == 'o': P(x, y, 'O')
for y in (17, 20, 23, 26):
    for x in (5, 22):
        if g[y][x] == 'o': P(x, y, 'O')
# zona clara del lomo
for y in range(17, 28):
    for x in (9, 18):
        if g[y][x] == 'o': P(x, y, 'q')
# patitas atigradas con dedos blancos
rect(9, 28, 12, 31, 'o'); rect(15, 28, 18, 31, 'o')
for x in (9, 12, 15, 18): P(x, 29, 'O')
rect(9, 31, 12, 31, 'W'); rect(15, 31, 18, 31, 'W')
# cabeza
oval(cx, 10, 8, 6.8, 'o')
# orejas
for (ex, d) in ((7, -1), (20, 1)):
    for y in range(0, 6):
        w = (6 - y) // 2
        for x in range(ex - w, ex + w + 1): P(x, y + 1, 'o')
    P(ex, 3, 'p'); P(ex, 4, 'p'); P(ex + d, 4, 'p')
# rayas de la frente (M de los atigrados)
for (x, y) in ((11, 5), (12, 6), (13, 5), (14, 5), (15, 6), (16, 5), (13, 6), (14, 6)):
    P(x, y, 'O')
for (x, y) in ((5, 9), (6, 9), (5, 11), (6, 11), (4, 10), (12, 4), (15, 4), (13, 7), (14, 7)):
    P(x, y, 'O'); P(27 - x, y, 'O')
# línea oscura que sale del ojo (marca típica de los atigrados)
P(7, 11, 'O'); P(20, 11, 'O'); P(6, 12, 'O'); P(21, 12, 'O')
# hocico blanco
oval(cx, 13, 3.8, 2.6, 'W')
# ojos verdes
for ex in (10, 17):
    rect(ex - 1, 8, ex + 1, 10, 'G'); P(ex, 9, 'g'); P(ex, 10, 'g'); P(ex - 1, 8, 'W')
# nariz y boca
P(13, 12, 'p'); P(14, 12, 'p'); P(13, 13, 'k'); P(14, 13, 'k'); P(12, 14, 'k'); P(15, 14, 'k')
# bigotes
for (x, y) in ((4, 12), (5, 12), (6, 13), (4, 14), (5, 14)):
    P(x, y, 'w'); P(27 - x, y, 'w')
# collar con moneda de Momentum
rect(8, 16, 19, 16, 'r')
oval(cx, 18, 1.8, 1.8, 'y'); P(13, 18, 'Y'); P(14, 18, 'Y')
# contorno
src = [r[:] for r in g]
for y in range(H):
    for x in range(W):
        if src[y][x] != '.': continue
        if any(0 <= x + dx < W and 0 <= y + dy < H and src[y + dy][x + dx] != '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            g[y][x] = 'k'
rows = [''.join(r) for r in g]
out = ['// Layla, la gata atigrada de la tienda · generado con tools/arte/layla.py (python3)',
       'export const LAYLA_PAL: Record<string, string> = ' + json.dumps(PAL) + ';',
       'export const LAYLA_ROWS: string[] = [']
out += [f"  '{r}'," for r in rows] + ['];']
open(sys.argv[1] if len(sys.argv) > 1 else 'src/art/layla.ts', 'w').write('\n'.join(out) + '\n')
try:
    from PIL import Image
    im = Image.new('RGB', (W * 10, H * 10), (20, 16, 24))
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c == '.': continue
            col = tuple(int(PAL[c][i:i + 2], 16) for i in (1, 3, 5))
            for dy in range(10):
                for dx in range(10): im.putpixel((x * 10 + dx, y * 10 + dy), col)
    im.save('/tmp/claude-0/-home-claude/99d6a04e-70b7-50ea-9b4e-0411dda7099a/scratchpad/layla.png')
except Exception as e:
    print(e)
print('ok')
