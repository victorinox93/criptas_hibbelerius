# Layla, la gata atigrada que atiende la tienda del menú.
# Uso: python3 tools/arte/layla.py → escribe src/art/layla.ts
import json, sys

PAL = {'k': '#120c08', 'o': '#e8913a', 'O': '#b8621e', 'd': '#7a3a12', 'W': '#f4ece0', 'w': '#d8c8b0',
       'G': '#7ad84a', 'g': '#2a5a1a', 'p': '#f0a0a8', 'n': '#6a4a2a', 'N': '#4a3020', 'y': '#e8c15a', 'Y': '#a87a2a', 'r': '#a8323a'}
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
P(25, 18, 'W'); P(24, 18, 'W')
# cuerpo sentado
oval(cx, 23, 8, 8, 'o')
oval(cx, 24, 4.5, 6.5, 'W')  # pecho blanco
# rayas del cuerpo
for y in (17, 20, 23):
    for x in (6, 7, 20, 21):
        P(x, y, 'O'); P(x, y + 1, 'O')
# patitas
rect(9, 29, 12, 31, 'W'); rect(15, 29, 18, 31, 'W')
P(10, 31, 'w'); P(16, 31, 'w')
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
P(5, 9, 'O'); P(6, 9, 'O'); P(21, 9, 'O'); P(22, 9, 'O'); P(5, 11, 'O'); P(22, 11, 'O')
# hocico blanco
oval(cx, 13, 3.8, 2.6, 'W')
# ojos verdes
for ex in (10, 17):
    rect(ex - 1, 9, ex + 1, 10, 'G'); P(ex, 9, 'k'); P(ex, 10, 'k'); P(ex - 1, 9, 'W')
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
