# FOTOSADV · Fábrica 07/11 · lote de 10 peças · 100% código (Pillow), 0 crédito.
# Vencedor atual: H01 v2 antes-depois (Cópia H01: 04/11 R$172 · 7 compras · ROAS 3,51 Meta).
# O1–O5 = órbitas do H01 v2 (1 elemento por peça) · N1–N3 = conceitos novos · S1–S2 = somados.
# Fotos: H01 v2 (2026-10-07), p01 e m01 (fa-img de 03/11). Nenhum rosto novo.
import os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', '2026-10-08'))
import gen_autoridade as g
from PIL import Image, ImageDraw, ImageFilter
W, H = g.W, g.H
H01 = g.panels('FOTOSADV_antes-depois_H01_v2_r3.png')
RAW = lambda p: Image.open(os.path.join(D, '..', p)).convert('RGB')
P01 = {k: RAW(f'2026-11-03-p10/raw/p01_{k}.png') for k in ['selfie', 'bracos', 'mesa', 'palestra', 'varanda', 'notebook', 'corredor']}
M01 = {k: RAW(f'2026-11-03-formatos/raw/m01_{k}.png') for k in ['selfie', 'mesa', 'bracos']}

def base(bg=g.BG):
    c = Image.new('RGB', (W, H), bg); return c, ImageDraw.Draw(c)
def par(c, d, P, y0=290, h=780, top=(0.0, 0.0)):
    g.rpaste(c, g.cover(P[0], 473, h, top[0]), 60, y0); g.rpaste(c, g.cover(P[1], 473, h, top[1]), 547, y0)
    g.tag(d, 80, y0 + h - 64, 'ANTES', g.WHITE); g.tag(d, 567, y0 + h - 64, 'DEPOIS', g.GOLD)
def preco(d, y=1110, itens=(('4 fotos', 'R$ 49,90'), ('15 fotos', 'R$ 89'))):
    d.rounded_rectangle((60, y, 1020, y + 170), 28, fill=g.WHITE); d.line((540, y + 30, 540, y + 140), fill=(220, 222, 228), width=3)
    for cx, (a, b) in zip((300, 780), itens):
        fa = g.f('Regular', 34); fb = g.f('Bold', 62)
        d.text((cx - d.textlength(a, font=fa) / 2, y + 22), a, font=fa, fill=g.MID); d.text((cx - d.textlength(b, font=fb) / 2, y + 70), b, font=fb, fill=g.BG)
def selo(d, x, y, t, bg=g.GOLD, fg=g.BG, s=34):
    fl = g.f('Bold', s); w = d.textlength(t, font=fl) + 44
    d.rounded_rectangle((x, y, x + w, y + s + 30), 30, fill=bg); d.text((x + 22, y + 11), t, font=fl, fill=fg); return w
def titulo(d, l1, l2, c1=g.WHITE, c2=g.GOLD, size=78, y=82):
    g.hook(d, [l1, l2], [c1, c2], y=y, size=size)
def seta(d, cx=540, cy=680):
    d.ellipse((cx - 62, cy - 62, cx + 62, cy + 62), fill=g.GOLD)
    d.rectangle((cx - 34, cy - 10, cx + 6, cy + 10), fill=g.BG); d.polygon([(cx + 2, cy - 30), (cx + 38, cy), (cx + 2, cy + 30)], fill=g.BG)
def sombra(c, box, r=26, off=18, blur=22):
    s = Image.new('L', (W, H), 0); ImageDraw.Draw(s).rounded_rectangle((box[0], box[1] + off, box[2], box[3] + off), r, fill=150)
    s = s.filter(ImageFilter.GaussianBlur(blur)); c.paste((0, 0, 0), (0, 0), s)
def girado(c, im, x, y, ang, borda=14, fundo=(255, 255, 255), base_extra=0):
    fr = Image.new('RGB', (im.width + 2 * borda, im.height + 2 * borda + base_extra), fundo); fr.paste(im, (borda, borda))
    m = Image.new('L', fr.size, 255); fr = fr.rotate(ang, expand=True, resample=Image.BICUBIC); m = m.rotate(ang, expand=True)
    sh = Image.new('L', (W, H), 0); sh.paste(m, (x + 10, y + 22)); sh = sh.filter(ImageFilter.GaussianBlur(16))
    c.paste((0, 0, 0), (0, 0), sh.point(lambda v: v * 0.55)); c.paste(fr, (x, y), m)

# ---------- ÓRBITAS (1 elemento muda; resto = H01 v2) ----------
def O1_hook_dor(o):  # HOOK: dor/perda no lugar de "Da selfie à foto de sócio"
    c, d = base(); titulo(d, 'Sua foto de perfil está', 'espantando clientes?', size=70); par(c, d, H01); preco(d); c.save(o, quality=93)
def O2_hook_validado(o):  # HOOK: headline validada dos vencedores de 22/10
    c, d = base(); titulo(d, 'Ensaio profissional completo', 'por R$ 49,90', size=70); par(c, d, H01); preco(d); c.save(o, quality=93)
def O3_rosto_m01(o):  # ROSTO: mulher ~56 (segmento mulheres 55–64, ROAS 1,32)
    c, d = base(); titulo(d, 'Da selfie à', 'foto de sócia'); par(c, d, (M01['selfie'], M01['mesa']), top=(0.25, 0.15)); preco(d); c.save(o, quality=93)
def O4_formato_inset(o):  # FORMATO: depois em tela cheia + selfie pequena girada no canto (nunca rodou)
    c, d = base(); titulo(d, 'Da selfie à', 'foto de sócio')
    sombra(c, (60, 290, 1020, 1070)); g.rpaste(c, g.cover(H01[1], 960, 780, 0.0), 60, 290)
    girado(c, g.cover(H01[0], 270, 360, 0.2), 70, 640, 7, borda=12)
    g.tag(d, 640, 1000, 'DEPOIS · 1 das 15', g.GOLD); g.tag(d, 112, 590, 'ANTES', g.WHITE)
    preco(d); c.save(o, quality=93)
def O5_preco_por_foto(o):  # PREÇO: "R$ 5,93 por foto" no lugar da grade 4/15
    c, d = base(); titulo(d, 'Da selfie à', 'foto de sócio'); par(c, d, H01)
    y = 1110; d.rounded_rectangle((60, y, 1020, y + 170), 28, fill=g.WHITE)
    fb = g.f('Bold', 84); fa = g.f('Regular', 32); t = 'R$ 5,93'; tw = d.textlength(t, font=fb)
    d.text((110, y + 30), t, font=fb, fill=g.BG); d.text((130 + tw, y + 52), 'por foto', font=g.f('Bold', 44), fill=g.MID)
    d.text((660, y + 42), '15 fotos por R$ 89', font=fa, fill=g.MID); d.text((660, y + 90), 'no Pix · em minutos', font=fa, fill=g.MID)
    c.save(o, quality=93)

# ---------- CONCEITOS NOVOS ----------
def N1_quiz(o):  # QUIZ (formato nunca rodado): 4 fotos, "qual veio de uma selfie?" → todas
    c, d = base(); titulo(d, 'Qual destas fotos', 'veio de uma selfie?', size=72)
    ks = ['bracos', 'mesa', 'palestra', 'varanda']
    for i, k in enumerate(ks):
        x = 60 + (i % 2) * 490; y = 290 + (i // 2) * 410
        g.rpaste(c, g.cover(P01[k], 470, 390, 0.15), x, y)
        d.ellipse((x + 18, y + 18, x + 88, y + 88), fill=g.GOLD); fl = g.f('Bold', 44); L = 'ABCD'[i]
        d.text((x + 53 - d.textlength(L, font=fl) / 2, y + 22), L, font=fl, fill=g.BG)
    y = 1120; d.rounded_rectangle((60, y, 1020, y + 160), 28, fill=g.GOLD)
    g.ctext(d, y + 18, 'Resposta: TODAS.', g.f('Bold', 58), g.BG); g.ctext(d, y + 94, '1 selfie vira 15 fotos profissionais · R$ 89', g.f('Regular', 34), g.BG)
    c.save(o, quality=93)
def N2_mural(o):  # MURAL DE CORTIÇA (formato nunca rodado): fotos presas com alfinete + bilhete
    c, d = base(bg=(120, 86, 56)); rnd = __import__('random'); rnd.seed(7)
    for _ in range(9000):
        x, y = rnd.randrange(W), rnd.randrange(H); v = rnd.randrange(-22, 22); d.point((x, y), fill=(120 + v, 86 + v, 56 + v))
    d.rounded_rectangle((60, 50, 1020, 250), 26, fill=g.BG); titulo(d, 'Mandou 1 selfie.', 'Recebeu o mural todo.', size=66, y=72)
    girado(c, g.cover(P01['selfie'], 250, 320, 0.2), 70, 300, 8, borda=12, base_extra=46)
    for (k, x, y, a) in [('bracos', 390, 280, -5), ('palestra', 700, 300, 6), ('mesa', 380, 700, 4), ('varanda', 720, 720, -7), ('notebook', 60, 760, -3)]:
        girado(c, g.cover(P01[k], 270, 320, 0.15), x, y, a, borda=12, base_extra=46)
    for (x, y) in [(200, 300), (520, 285), (835, 305), (515, 705), (850, 725), (190, 765)]:
        d.ellipse((x - 16, y - 16, x + 16, y + 16), fill=(214, 48, 49)); d.ellipse((x - 6, y - 10, x + 2, y - 2), fill=(255, 150, 150))
    d.polygon([(120, 650), (360, 630), (372, 740), (128, 760)], fill=(255, 232, 120))
    d.text((140, 660), 'esta é a selfie', font=g.f('Bold', 29), fill=(60, 50, 20)); d.text((140, 702), 'o resto é IA', font=g.f('Regular', 30), fill=(60, 50, 20))
    d.rounded_rectangle((60, 1170, 1020, 1300), 28, fill=g.BG); g.ctext(d, 1196, '15 fotos profissionais · R$ 89 no Pix', g.f('Bold', 46), g.GOLD)
    c.save(o, quality=93)
def N3_cartao(o):  # CARTÃO DE VISITA (formato nunca rodado): mesmo cartão, selfie riscada × foto profissional
    c, d = base(); titulo(d, 'Seu cartão diz', 'quem você é.', size=76)
    def cartao(y, foto, ok):
        sombra(c, (110, y, 970, y + 380), r=22); d.rounded_rectangle((110, y, 970, y + 380), 22, fill=(250, 248, 242))
        g.rpaste(c, g.cover(foto, 280, 340, 0.15), 130, y + 20, r=16)
        d.text((450, y + 70), 'Dr. Ricardo Alves', font=g.f('Bold', 46), fill=g.BG); d.text((450, y + 135), 'Advogado · Direito Empresarial', font=g.f('Regular', 30), fill=g.MID)
        d.line((450, y + 195, 920, y + 195), fill=g.GOLD, width=4); d.text((450, y + 220), '(11) 9 0000-0000', font=g.f('Regular', 28), fill=g.MID)
        if ok: selo(d, 690, y + 290, 'foto feita de selfie', s=26)
        else:
            d.line((130, y + 20, 410, y + 360), fill=(214, 48, 49), width=10); d.line((410, y + 20, 130, y + 360), fill=(214, 48, 49), width=10)
    cartao(290, H01[0], False); cartao(700, H01[1], True)
    preco(d, y=1120); c.save(o, quality=93)

# ---------- SOMADOS (elementos vencedores juntos) ----------
def S1_validado_porfoto(o):  # antes/depois H01 + headline validada R$ 49,90 + selo R$ 5,93/foto
    c, d = base(); titulo(d, 'Ensaio profissional completo', 'por R$ 49,90', size=70); par(c, d, H01)
    selo(d, 590, 320, 'R$ 5,93 por foto no de 15', s=28); preco(d); c.save(o, quality=93)
def S2_hook_seta_preco(o):  # antes/depois H01 + hook original + seta central + grade 4/15 atual
    c, d = base(); titulo(d, 'Da selfie à', 'foto de sócio'); par(c, d, H01); seta(d); preco(d); c.save(o, quality=93)

PECAS = [('O1', 'hook-dor', O1_hook_dor), ('O2', 'hook-validado-4990', O2_hook_validado), ('O3', 'rosto-m01', O3_rosto_m01),
         ('O4', 'formato-inset', O4_formato_inset), ('O5', 'preco-por-foto', O5_preco_por_foto),
         ('N1', 'quiz-qual-selfie', N1_quiz), ('N2', 'mural-cortica', N2_mural), ('N3', 'cartao-visita', N3_cartao),
         ('S1', 'validado-porfoto', S1_validado_porfoto), ('S2', 'hook-seta-preco', S2_hook_seta_preco)]
if __name__ == '__main__':
    fs = []
    for cod, nome, fn in PECAS:
        p = os.path.join(D, f'FOTOSADV_F0711_{cod}_{nome}.jpg'); fn(p); fs.append((cod, p))
    # grade com o código grande em cima
    tw, th = 432, 540; G = Image.new('RGB', (5 * tw + 6 * 20, 2 * (th + 80) + 3 * 20), (240, 240, 240)); gd = ImageDraw.Draw(G)
    for i, (cod, p) in enumerate(fs):
        x = 20 + (i % 5) * (tw + 20); y = 20 + (i // 5) * (th + 100)
        gd.text((x, y), cod, font=g.f('Bold', 60), fill=(20, 20, 20)); G.paste(Image.open(p).resize((tw, th)), (x, y + 76))
    G.save(os.path.join(D, 'grade-fabrica-0711.jpg'), quality=88); print('ok', len(fs))
