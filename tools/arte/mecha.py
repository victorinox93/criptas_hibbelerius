W_, H_ = 42, 44
G = [['.']*W_ for _ in range(H_)]
def R(x0,y0,x1,y1,c):
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            if 0<=x<W_ and 0<=y<H_: G[y][x]=c
def P(x,y,c):
    if 0<=x<W_ and 0<=y<H_: G[y][x]=c
# propulsores en la espalda
R(10,8,12,13,'w'); R(10,8,12,8,'g'); R(9,6,10,8,'l'); R(13,9,14,12,'g')
# escudo (brazo trasero) con emblema de rombo
R(2,20,9,33,'r'); R(2,33,9,33,'R'); R(2,20,9,20,'R'); P(5,24,'y'); P(6,24,'y'); P(4,25,'y'); P(7,25,'y'); P(4,26,'y'); P(7,26,'y'); P(5,27,'y'); P(6,27,'y')
# hombro trasero
R(7,13,14,19,'W'); R(7,13,14,13,'w'); R(8,15,13,16,'c'); R(7,19,14,19,'y')
# brazo trasero
R(10,20,13,28,'w')
# cabeza (más chica)
R(16,4,24,11,'W'); R(16,4,24,4,'w'); R(16,7,17,9,'w')
R(18,6,24,7,'g'); P(22,6,'E'); P(23,6,'E'); P(24,6,'E'); P(23,7,'E')
R(19,10,24,11,'w'); P(20,11,'g'); P(22,11,'g'); P(24,11,'g')
R(15,6,15,9,'r')
# cresta: una sola aleta inclinada
R(20,1,21,3,'y'); P(22,0,'y'); P(21,0,'y')
# cuello
R(18,12,22,12,'g')
# torso
R(13,13,27,21,'W'); R(14,14,26,18,'c'); R(14,17,26,18,'C')
R(15,15,17,16,'y'); R(23,15,25,16,'y'); R(19,14,21,20,'W'); P(20,16,'E'); P(20,15,'B'); P(20,17,'B')
# cintura
R(15,21,25,23,'r'); R(19,21,21,23,'W'); P(20,22,'y')
# faldones
R(13,23,18,27,'W'); R(22,23,27,27,'W'); R(13,27,18,27,'w'); R(22,27,27,27,'w')
# piernas (más largas)
R(14,28,18,31,'g'); R(22,28,26,31,'g')
R(13,31,19,39,'W'); R(21,31,27,39,'W'); R(13,31,19,32,'w'); R(21,31,27,32,'w')
R(14,35,15,37,'c'); R(25,35,26,37,'c'); R(18,33,19,38,'w'); R(26,33,27,38,'w')
# pies
R(11,40,20,42,'w'); R(21,40,30,42,'w'); R(11,43,20,43,'g'); R(21,43,30,43,'g'); R(18,40,20,41,'r'); R(28,40,30,41,'r')
# hombro delantero
R(26,13,34,19,'W'); R(26,13,34,13,'w'); R(27,15,33,16,'c'); R(26,19,34,19,'y')
# brazo delantero y mano
R(28,20,32,27,'W'); R(28,24,32,24,'w'); R(28,27,32,29,'g')
# rifle de haz
R(26,27,40,28,'l'); R(30,26,35,26,'g'); R(33,29,34,31,'g'); P(41,27,'B'); P(41,28,'B'); R(36,25,37,25,'g')
# contorno
F=[r[:] for r in G]
for y in range(H_):
    for x in range(W_):
        if F[y][x]=='.':
            if any(0<=x+dx<W_ and 0<=y+dy<H_ and F[y+dy][x+dx] not in '.k' for dx,dy in ((1,0),(-1,0),(0,1),(0,-1))):
                G[y][x]='k'
rows=[''.join(r) for r in G]
open('mecha_rows.txt','w').write('\n'.join(rows))
pal={'k':'#0d0b10','W':'#e8ecf0','w':'#9aa4b4','g':'#3a4050','l':'#6a7484','r':'#c8323a','R':'#7a1a20','y':'#e8c15a','c':'#3a6ad0','C':'#1e3e8a','E':'#7fe8ff','B':'#d8f8ff'}
from PIL import Image
im=Image.new('RGBA',(W_,H_),(0,0,0,0))
for y,r in enumerate(rows):
    for x,ch in enumerate(r):
        if ch in pal: im.putpixel((x,y),tuple(int(pal[ch][i:i+2],16) for i in (1,3,5))+(255,))
bg=Image.new('RGBA',(W_*8,H_*8),(30,26,36,255)); big=im.resize((W_*8,H_*8),Image.NEAREST); bg.alpha_composite(big); bg.save('mecha.png')
print('\n'.join(rows))
