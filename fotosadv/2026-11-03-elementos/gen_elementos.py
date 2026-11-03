# FOTOSADV – teste de ELEMENTOS do H01 v2 (03/11). 100% código (Pillow), 0 crédito.
# Controle = H01 v2 original. Cada peça muda UM elemento só, para descobrir o que dá peso ao criativo.
import os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', '2026-10-08'))
import gen_autoridade as g
from PIL import Image, ImageDraw
H01 = g.panels('FOTOSADV_antes-depois_H01_v2_r3.png')
MULHER = g.A
W, H = g.W, g.H

def base(bg=g.BG, h=H):
    c = Image.new('RGB', (W, h), bg); return c, ImageDraw.Draw(c)

def titulo(d, lines=('Da selfie à', 'foto de sócio'), cols=None, y=78, size=84, cor=g.WHITE):
    cols = cols or [cor, cor]; g.hook(d, list(lines), cols, y=y, size=size)

def par(c, d, P, y0=290, h=780, top=(0.0, 0.0), tagbg=None):
    g.rpaste(c, g.cover(P[0], 473, h, top[0]), 60, y0); g.rpaste(c, g.cover(P[1], 473, h, top[1]), 547, y0)
    g.tag(d, 80, y0 + h - 64, 'ANTES', g.WHITE); g.tag(d, 567, y0 + h - 64, 'DEPOIS', g.GOLD)

def preco(d, y=1110, itens=(('3 fotos', 'R$ 39,90'), ('15 fotos', 'R$ 89'))):
    d.rounded_rectangle((60, y, 1020, y + 170), 28, fill=g.WHITE); d.line((540, y + 30, 540, y + 140), fill=(220, 222, 228), width=3)
    for cx, (a, b) in zip((300, 780), itens):
        fa = g.f('Regular', 34); fb = g.f('Bold', 62)
        d.text((cx - d.textlength(a, font=fa) / 2, y + 22), a, font=fa, fill=g.MID)
        d.text((cx - d.textlength(b, font=fb) / 2, y + 70), b, font=fb, fill=g.BG)

def selo(d, x, y, t, bg=g.GOLD, fg=g.BG, s=34):
    fl = g.f('Bold', s); w = d.textlength(t, font=fl) + 44
    d.rounded_rectangle((x, y, x + w, y + s + 30), 30, fill=bg); d.text((x + 22, y + 11), t, font=fl, fill=fg)

def controle_igual(o, **k):  # controle = a imagem original do H01 v2, sem refazer
    Image.open(os.path.join(D, '..', '2026-10-07', 'FOTOSADV_antes-depois_H01_v2_r3.png')).convert('RGB').save(o, quality=95)

def E1_mulher(o):
    c, d = base(); titulo(d, ('Da selfie à', 'foto de sócia')); par(c, d, MULHER); preco(d); c.save(o)
def E2_preco_novo(o):
    c, d = base(); titulo(d); par(c, d, H01); preco(d, itens=(('4 fotos', 'R$ 49,90'), ('15 fotos', 'R$ 89'))); c.save(o)
def E3_selo_minutos(o):
    c, d = base(); titulo(d); par(c, d, H01); selo(d, 590, 320, '⚡ pronto em minutos'.replace('⚡ ', '')); preco(d); c.save(o)
def E4_seta(o):
    c, d = base(); titulo(d); par(c, d, H01)
    cx, cy = 540, 680; d.ellipse((cx - 62, cy - 62, cx + 62, cy + 62), fill=g.GOLD)
    d.rectangle((cx - 34, cy - 10, cx + 6, cy + 10), fill=g.BG); d.polygon([(cx + 2, cy - 30), (cx + 38, cy), (cx + 2, cy + 30)], fill=g.BG); preco(d); c.save(o)
def E5_fundo_claro(o):
    c, d = base(bg=(244, 241, 234)); titulo(d, cor=g.BG); par(c, d, H01); preco(d); c.save(o)
def E6_rosto_perto(o):
    zoom = lambda im, b: im.crop(b)
    a = H01[0].crop((40, 120, 433, 610)); b = H01[1].crop((130, 90, 400, 430))
    c, d = base(); titulo(d); par(c, d, (a, b), top=(0.3, 0.2)); preco(d); c.save(o)
def E7_vertical(o):
    c, d = base(h=1920); g.hook(d, ['Da selfie à', 'foto de sócio'], [g.WHITE, g.WHITE], y=230, size=92)
    par(c, d, H01, y0=480, h=900)
    y = 1430; d.rounded_rectangle((60, y, 1020, y + 170), 28, fill=g.WHITE); d.line((540, y + 30, 540, y + 140), fill=(220, 222, 228), width=3)
    for cx, (a, b) in zip((300, 780), (('3 fotos', 'R$ 39,90'), ('15 fotos', 'R$ 89'))):
        fa = g.f('Regular', 34); fb = g.f('Bold', 62)
        d.text((cx - d.textlength(a, font=fa) / 2, y + 22), a, font=fa, fill=g.MID); d.text((cx - d.textlength(b, font=fb) / 2, y + 70), b, font=fb, fill=g.BG)
    c.save(o)
def E8_sem_preco(o):
    c, d = base(); titulo(d); par(c, d, H01, y0=290, h=990); c.save(o)
def E9_selo_ia(o):
    c, d = base(); titulo(d); par(c, d, H01); selo(d, 590, 320, 'feito com IA', bg=g.WHITE, s=30)
    g.ctext(d, 1290, '', g.f('Regular', 24), g.GREY); preco(d); c.save(o)

if __name__ == '__main__':
    o = lambda n: os.path.join(D, n)
    for fn, nome in [(controle_igual, 'E0_controle'), (E1_mulher, 'E1_mulher'), (E2_preco_novo, 'E2_preco-4fotos-4990'),
                     (E3_selo_minutos, 'E3_selo-pronto-em-minutos'), (E4_seta, 'E4_seta'), (E5_fundo_claro, 'E5_fundo-claro'),
                     (E6_rosto_perto, 'E6_rosto-perto'), (E7_vertical, 'E7_vertical-9x16'), (E8_sem_preco, 'E8_sem-preco'), (E9_selo_ia, 'E9_selo-feito-com-ia')]:
        fn(o(f'FOTOSADV_H01el_{nome}.jpg'))
    print('ok')
