# v0.58 · El Astrónomo Aficionado de Providence de cuerpo entero (traje gris, leyendo un libro)
# y las piezas del set «Cazador de Ecos» (diseño original).
# Uso: python3 tools/arte/astronomo.py [vista.png] → imprime las filas para src/art/abismo.ts
import sys, json
sys.path.insert(0, 'tools/arte')

PAL = {
    'h': '#1e1a16', 's': '#e8d6c2', 'q': '#b89c86', 'k': '#141018', 'c': '#6a6a76', 'C': '#44444e',
    'D': '#2c2c34', 'W': '#eeeae0', 't': '#6a2a3a', 'b': '#5a3420', 'B': '#3a2014', 'p': '#e8dcb8', 'P': '#b8a880',
    'n': '#3a2a1e', 'r': '#9a7a5a',
}

def canvas(w, h): return [['.'] * w for _ in range(h)]
def P(g, x, y, ch):
    if 0 <= y < len(g) and 0 <= x < len(g[0]): g[y][x] = ch
def rect(g, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): P(g, x, y, ch)
def disc(g, cx, cy, r, ch, ry=None):
    ry = ry or r
    for y in range(len(g)):
        for x in range(len(g[0])):
            if ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 <= 1: g[y][x] = ch
def outline(g, ch='k'):
    h, w = len(g), len(g[0]); out = [row[:] for row in g]
    for y in range(h):
        for x in range(w):
            if g[y][x] != '.': continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and g[yy][xx] not in '.k': out[y][x] = ch; break
    return out

W_, H_ = 26, 54
g = canvas(W_, H_)
# piernas (pantalón gris) y zapatos
rect(g, 9, 36, 12, 50, 'C'); rect(g, 14, 36, 17, 50, 'C')
rect(g, 10, 36, 11, 50, 'c'); rect(g, 15, 36, 16, 50, 'c')
rect(g, 8, 51, 12, 52, 'n'); rect(g, 14, 51, 18, 52, 'n'); P(g, 8, 51, 'r'); P(g, 14, 51, 'r')
# saco: torso con faldón
rect(g, 7, 15, 19, 35, 'c')
rect(g, 6, 17, 6, 33, 'c'); rect(g, 20, 17, 20, 33, 'c')
for y in range(15, 36): P(g, 7, y, 'C'); P(g, 19, y, 'C')
# solapas en V y camisa con corbata
for i in range(8):
    P(g, 10 + i // 2, 15 + i, 'C'); P(g, 16 - i // 2, 15 + i, 'C')
rect(g, 11, 15, 15, 17, 'W'); rect(g, 12, 18, 14, 19, 'W'); P(g, 13, 20, 'W')
rect(g, 13, 15, 13, 21, 't'); P(g, 12, 16, 't'); P(g, 14, 16, 't')
# botones
P(g, 13, 26, 'D'); P(g, 13, 30, 'D')
# brazos doblados hacia el libro
rect(g, 5, 17, 7, 26, 'C'); rect(g, 19, 17, 21, 26, 'C')
rect(g, 7, 25, 10, 27, 'C'); rect(g, 16, 25, 19, 27, 'C')
P(g, 10, 26, 's'); P(g, 16, 26, 's'); P(g, 10, 27, 's'); P(g, 16, 27, 's')
for y in range(17, 25): P(g, 8, y, 'D'); P(g, 18, y, 'D')
for y in range(19, 25): P(g, 5, y, 'D'); P(g, 21, y, 'D')
# faldón abierto abajo y hombros caídos
P(g, 13, 33, 'D'); P(g, 13, 34, 'D'); P(g, 12, 35, 'D'); P(g, 14, 35, 'D')
P(g, 6, 16, 'C'); P(g, 20, 16, 'C')
# libro abierto (tapas cafés, hojas claras)
rect(g, 8, 22, 18, 26, 'b')
rect(g, 9, 22, 12, 25, 'p'); rect(g, 14, 22, 17, 25, 'p'); rect(g, 13, 22, 13, 26, 'B')
for x in (10, 15): P(g, x, 23, 'P'); P(g, x + 1, 24, 'P')
P(g, 8, 26, 'B'); P(g, 18, 26, 'B')
# cuello y cabeza (cara larga, mandíbula grande, mirando hacia el libro)
rect(g, 11, 13, 15, 14, 's'); P(g, 15, 14, 'q')
disc(g, 13, 7, 4.6, 's', 6.2)
rect(g, 10, 10, 16, 12, 's')
for x in range(10, 17): P(g, x, 13, 'q' if x in (10, 16) else 's')
# pelo corto con raya
for y in range(0, 6):
    xs = [x for x in range(W_) if g[y][x] == 's']
    for x in xs:
        if y < 4 or x <= xs[0] or x >= xs[-1]: g[y][x] = 'h'
for x in range(9, 18): P(g, x, 4, 'h') if x < 11 else None
P(g, 11, 1, 'q')  # la raya del peinado
# ojos bajos (leyendo), nariz, boca seria, sombra del lado derecho
P(g, 11, 7, 'k'); P(g, 15, 7, 'k'); P(g, 11, 6, 'q'); P(g, 15, 6, 'q')
P(g, 13, 8, 'q'); P(g, 13, 9, 'q')
rect(g, 12, 11, 14, 11, 'q')
for y in range(3, 14):
    xs = [x for x in range(W_) if g[y][x] == 's']
    if xs: P(g, xs[-1], y, 'q')
g = outline(g)
AST = [''.join(r) for r in g]

out = {'fig_astronomo': AST}
print(json.dumps(out, indent=0))

if len(sys.argv) > 1:
    from PIL import Image
    S = 10
    im = Image.new('RGBA', (W_ * S + 20, H_ * S + 20), (30, 26, 40, 255))
    for y, r in enumerate(AST):
        for x, ch in enumerate(r):
            if ch == '.': continue
            c = PAL[ch]
            for dy in range(S):
                for dx in range(S): im.putpixel((10 + x * S + dx, 10 + y * S + dy), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    im.save(sys.argv[1])
