# Extrai a arte das cartas e o depoimento dos estáticos K1/K3 (0 crédito).
# Recorta só a área ilustrada (por dentro da borda) e redesenha moldura creme.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
D='afrodite/2026-11-04-videos-k1k3/'
NOMES={'k1':['enamorados','2copas','estrela'],'k3':['imperatriz','imperador','roda']}
def art_box(a, x0,x1):
    m=(a[...,1]>60)
    cols=[x for x in range(x0,x1) if m[1300:1740,x].mean()>0.6]
    sub=m[:,cols[0]:cols[-1]]
    rows=[y for y in range(1200,1900) if sub[y].mean()>0.6]
    return cols[0],rows[0],cols[-1],rows[-1]
SEGS={'k1':[(65,369),(393,688),(717,1023)],'k3':[(70,371),(393,687),(733,993)]}
for k in SEGS:
    im=Image.open(D+f'src/{k}_original.jpg').convert('RGB')
    a=np.asarray(im.convert('HSV')).astype(int)
    for (x0,x1),nome in zip(SEGS[k],NOMES[k]):
        bx=art_box(a,x0,x1) if nome!='roda' else (742,1342,988,1748); I=14 if nome!='roda' else 6
        art=im.crop((bx[0]+I,bx[1]+I,bx[2]-I,bx[3]-I)).resize((420,640),Image.LANCZOS)
        B=26; W,H=art.width+2*B,art.height+2*B
        card=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(card)
        d.rounded_rectangle([0,0,W-1,H-1],radius=22,fill=(247,240,224,255),outline=(214,200,170,255),width=2)
        card.paste(art,(B,B))
        d.rectangle([B,B,B+art.width-1,B+art.height-1],outline=(120,100,70,255),width=2)
        card.save(D+f'assets/{k}_{nome}.png'); print(k,nome,bx,card.size)
Image.open(D+'src/k1_original.jpg').crop((254,154,883,784)).save(D+'assets/depoimento.png')
