# Grade numerada para o Othon apontar a peça. Uso: python3 grade.py PREFIXO SAIDA TITULO
import sys,glob
from PIL import Image,ImageDraw,ImageFont
pfx,out,tit=sys.argv[1:4]
fs=sorted(glob.glob(pfx+'*.jpg'));W,H=432,540;top=70;S=64
g=Image.new('RGB',(W*5+60,(H+S)*2+30+top),'#15181f');d=ImageDraw.Draw(g)
B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
d.text((14,18),tit,font=ImageFont.truetype(B,34),fill='#e8ba48')
for i,f in enumerate(fs):
  im=Image.open(f);im.thumbnail((W,H));x,y=10+(i%5)*(W+10),top+(i//5)*(H+S+10);g.paste(im,(x,y+S))
  n=f.split('_')[2][:3] if '_F' in f else str(i+1)
  d.rounded_rectangle((x,y,x+W,y+S-6),12,fill='#e0393e')
  d.text((x+W//2,y+(S-6)//2),n,font=ImageFont.truetype(B,44),fill='#fff',anchor='mm')
g.save(out,quality=85);print(out,len(fs))
