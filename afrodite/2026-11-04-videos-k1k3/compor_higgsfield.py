# Pós do vídeo animado no Higgsfield (0 crédito): recoloca nítidos o depoimento, a pergunta e o preço
# originais por cima (a IA costuma deformar letras), adiciona a CTA final e gera 9:16 e 4:5.
# Uso: python3 compor_higgsfield.py <k1|k3> <video_higgsfield.mp4> <saida_prefixo> [hook] [cor_hex]
import sys, subprocess, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

D = os.path.dirname(os.path.abspath(__file__)) + '/'
GF = '/usr/share/fonts/truetype/google-fonts/'
k, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
hook = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else None
cor = tuple(int(sys.argv[5][i:i + 2], 16) for i in (0, 2, 4)) if len(sys.argv) > 5 and sys.argv[5] else (18, 18, 20)
EFEITO = sys.argv[6] if len(sys.argv) > 6 else ''
W, H, FPS = 1080, 1920, 30
S, OX, OY = 928 / 1080, 76, 134          # como o quadro inicial foi montado (gen start frame)
orig = Image.open(D + f'src/{k}_original.jpg').convert('RGB')

def lora(sz):
    f = ImageFont.truetype(GF + 'Lora-Variable.ttf', sz)
    try: f.set_variation_by_axes([500])
    except Exception: pass
    return f
def pop(sz): return ImageFont.truetype(GF + 'Poppins-Bold.ttf', sz)

def layer(box, pad=0):
    x0, y0, x1, y1 = box
    im = orig.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    w, h = int(im.width * S), int(im.height * S)
    return im.resize((w, h), Image.LANCZOS).convert('RGBA'), (int(OX + (x0 - pad) * S), int(OY + (y0 - pad) * S))

dep, dep_xy = layer((254, 154, 883, 784))
q, q_xy = layer((222, 795, 858, 924), 2)
pr, pr_xy = layer((250, 1042, 832, 1133), 2)
if hook or cor != (18, 18, 20):                 # variação: redesenha a caixa da pergunta (e do preço, se mudar cor)
    def box(text, ref_w_h, size):
        f = lora(size); d = ImageDraw.Draw(Image.new('RGB', (1, 1)))
        l, t, r, b = d.textbbox((0, 0), text, font=f)
        padx, pady = 40, (ref_w_h[1] - (b - t)) // 2
        im = Image.new('RGBA', (r - l + 2 * padx, ref_w_h[1]), cor + (255,))
        ImageDraw.Draw(im).text((padx - l, pady - t), text, font=f, fill=(255, 255, 255))
        return im
    qh = hook or 'Meu ex vai voltar?'
    nq = box(qh, q.size, int(q.height * 0.52))
    q_xy = (int(W / 2 - nq.width / 2), q_xy[1]); q = nq
    if cor != (18, 18, 20):
        npr = box('tarô a partir de R$20,00', pr.size, int(pr.height * 0.48))
        pr_xy = (int(W / 2 - npr.width / 2), pr_xy[1]); pr = npr

cta_f = pop(64); sub_f = lora(56)
def wrap(text, f, maxw):
    d = ImageDraw.Draw(Image.new('RGB', (1, 1))); out, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: out.append(cur); cur = w
    return out + [cur]
cta_lines = wrap('Toque em Enviar mensagem e faça sua pergunta', cta_f, W - 220)

probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True)
dur = float(probe.stdout.strip())
CTA_T = max(5.5, dur - 2.6)
n = int(dur * FPS)
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={W}:{H}:flags=lanczos,fps={FPS}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
encs = {}
for fmt, (ow, oh) in {'9x16': (1080, 1920), '4x5': (1080, 1350)}.items():
    encs[fmt] = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{ow}x{oh}', '-r', str(FPS), '-i', '-',
                                  '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
                                  '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', f'{out}_{fmt}.mp4'], stdin=subprocess.PIPE)

def ease(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)

# headline fixa no topo (faixa sólida), como pedido pelo Othon em 04/11
def _headline(w, h, size, cy):
    im = Image.new('RGBA', (w, h), (255, 214, 0, 255))
    ImageDraw.Draw(im).text((w / 2, cy), 'Faça sua pergunta', font=pop(size), fill=(18, 18, 20, 255), anchor='mm')
    return im
TARJA = _headline(W, 250, 78, 140)
TARJA45 = _headline(1080, 112, 60, 58)
TARJA_Y = 0

def cta_old(im, t, W_, H_):
    ca = ease((t - CTA_T) / 0.4)
    if ca <= 0: return
    im.alpha_composite(Image.new('RGBA', (W_, H_), (12, 10, 14, int(195 * ca))))
    lh = int(cta_f.size * 1.28); bh = lh * len(cta_lines) + 90
    by = H_ / 2 - bh / 2 - 30
    bx = Image.new('RGBA', (W_ - 140, bh), (255, 255, 255, int(255 * ca))); bd = ImageDraw.Draw(bx)
    for j, ln in enumerate(cta_lines):
        bd.text((bx.width / 2, 45 + j * lh), ln, font=cta_f, fill=cor + (int(255 * ca),), anchor='mt')
    im.alpha_composite(bx, (70, int(by)))
    d = ImageDraw.Draw(im)
    d.text((W_ / 2, by - 30), hook or 'Meu ex vai voltar?', font=sub_f, fill=(255, 255, 255, int(235 * ca)), anchor='mb')
    pulse = 0.5 + 0.5 * math.sin((t - CTA_T) * 2 * math.pi * 1.4)
    ay = by + bh + 45 + pulse * 16; col = (255, 255, 255, int(255 * ca))
    d.polygon([(W_ / 2 - 44, ay), (W_ / 2 + 44, ay), (W_ / 2, ay + 50)], fill=col)
    d.rectangle([W_ / 2 - 14, ay - 50, W_ / 2 + 14, ay], fill=col)


# ---------- efeitos de atenção nos 3 primeiros segundos (0 crédito) ----------
QBOX = (q_xy[0], q_xy[1], q_xy[0] + q.width, q_xy[1] + q.height)
def efeito(fr, t):
    if t > 3.2 or not EFEITO: return fr
    if EFEITO == 'zoom':
        # começa dentro da pergunta e "abre" para o quadro inteiro, com um tranco no fim
        p = ease(t / 0.75); z = 1.38 - 0.38 * p
        cx, cy = (QBOX[0] + QBOX[2]) / 2, (QBOX[1] + QBOX[3]) / 2
        cx = cx * (1 - p) + W / 2 * p; cy = cy * (1 - p) + H / 2 * p
        sh = 10 * math.sin(t * 60) * max(0, 1 - abs(t - 0.82) / 0.12) if 0.7 < t < 0.94 else 0
        w2, h2 = W / z, H / z
        x0 = min(max(0, cx - w2 / 2 + sh), W - w2); y0 = min(max(0, cy - h2 / 2), H - h2)
        return fr.crop((int(x0), int(y0), int(x0 + w2), int(y0 + h2))).resize((W, H), Image.LANCZOS)
    if EFEITO == 'luz':
        # dois feixes de luz passando na diagonal por cima da pergunta e das cartas
        ov = Image.new('L', (W, H), 0); d = ImageDraw.Draw(ov)
        for t0 in (0.15, 1.45):
            pp = (t - t0) / 1.0
            if 0 <= pp <= 1:
                x = -500 + pp * (W + 1000)
                for k2 in range(0, 260, 6):
                    a = int(235 * (1 - abs(k2 - 130) / 130) ** 1.5)
                    d.polygon([(x + k2, 0), (x + k2 + 6, 0), (x + k2 + 6 - 700, H), (x + k2 - 700, H)], fill=a)
        glow = Image.new('RGBA', (W, H), (255, 250, 235, 0)); glow.putalpha(ov)
        fr = fr.copy(); fr.alpha_composite(glow)
        return fr
    if EFEITO == 'seta':
        fr = fr.copy(); d = ImageDraw.Draw(fr)
        draw = ease(t / 0.45); bob = 14 * math.sin(t * 2 * math.pi * 1.6)
        tip = (QBOX[2] + 18 + bob * 0.6, (QBOX[1] + QBOX[3]) / 2 + bob * 0.4)
        st = (W - 70, QBOX[1] - 230)
        pts = []
        for i in range(31):
            u = i / 30 * draw
            mx, my = (st[0] + 40, tip[1] - 40)
            x = (1 - u) ** 2 * st[0] + 2 * (1 - u) * u * mx + u * u * tip[0]
            y = (1 - u) ** 2 * st[1] + 2 * (1 - u) * u * my + u * u * tip[1]
            pts.append((x, y))
        yel = (255, 214, 0, 255)
        d.line(pts, fill=(20, 20, 20, 255), width=26, joint='curve'); d.line(pts, fill=yel, width=16, joint='curve')
        if draw > 0.95:
            ang = math.atan2(pts[-1][1] - pts[-4][1], pts[-1][0] - pts[-4][0])
            L = 54
            a1 = (tip[0] - L * math.cos(ang - 0.55), tip[1] - L * math.sin(ang - 0.55))
            a2 = (tip[0] - L * math.cos(ang + 0.55), tip[1] - L * math.sin(ang + 0.55))
            d.polygon([tip, a1, a2], fill=yel, outline=(20, 20, 20, 255), width=5)
        # moldura pulsando na pergunta
        pa = 0.5 + 0.5 * math.sin(t * 2 * math.pi * 2)
        d.rounded_rectangle([QBOX[0] - 12, QBOX[1] - 12, QBOX[2] + 12, QBOX[3] + 12], radius=14, outline=(255, 214, 0, int(140 + 115 * pa)), width=8)
        return fr
    if EFEITO == 'notif':
        # notificação de mensagem descendo no topo (área segura: a partir de 260 px)
        p_in = ease(t / 0.35); p_out = ease((t - 2.7) / 0.35)
        y = 260 - 220 * (1 - p_in) - 300 * p_out
        if p_out >= 1: return fr
        fr = fr.copy(); bw, bh = 960, 190
        card = Image.new('RGBA', (bw, bh), (0, 0, 0, 0)); cd = ImageDraw.Draw(card)
        cd.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=34, fill=(250, 250, 250, 245), outline=(225, 225, 225, 255), width=2)
        cd.ellipse([28, 40, 128, 140], fill=(37, 180, 100, 255))
        cd.rounded_rectangle([56, 70, 100, 104], radius=10, fill=(255, 255, 255, 255)); cd.polygon([(62, 100), (60, 118), (78, 103)], fill=(255, 255, 255, 255))
        cd.text((156, 38), 'Mensagem de cliente', font=pop(36), fill=(25, 25, 25, 255))
        cd.text((bw - 40, 44), 'agora', font=ImageFont.truetype(GF + 'Poppins-Medium.ttf', 28), fill=(120, 120, 120, 255), anchor='ra')
        cd.text((156, 96), '"Oi, bateu demais essa tiragem.', font=ImageFont.truetype(GF + 'Poppins-Medium.ttf', 34), fill=(60, 60, 60, 255))
        cd.text((156, 138), 'Tudo muito certo..."', font=ImageFont.truetype(GF + 'Poppins-Medium.ttf', 34), fill=(60, 60, 60, 255))
        fr.alpha_composite(card, (int(W / 2 - bw / 2), int(y)))
        return fr
    return fr

for i in range(n):
    raw = dec.stdout.read(W * H * 3)
    if len(raw) < W * H * 3: break
    t = i / FPS
    fr = Image.frombytes('RGB', (W, H), raw).convert('RGBA')
    # camadas nítidas: pergunta já no frame 0
    fr.alpha_composite(dep, dep_xy); fr.alpha_composite(q, q_xy); fr.alpha_composite(pr, pr_xy)
    fr = efeito(fr, t)
    f916 = fr.copy(); f916.alpha_composite(TARJA, (0, TARJA_Y))
    encs['9x16'].stdin.write(f916.convert('RGB').tobytes())
    # 4:5: recorte central do 9:16, subindo para caber depoimento (topo) e cartas (base) em 1350 px
    sc = 1350 / (OY + 1651 * 1.0) if False else 0.80
    small = fr.resize((int(W * sc), int(H * sc)), Image.LANCZOS)
    top = int(OY * sc) + int((1651 * sc - 1350) / 2) if 1651 * sc > 1350 else int(OY * sc) - int((1350 - 1651 * sc) / 2)
    # fundo das laterais: o próprio quadro ampliado e desfocado (sem espelhar setas/cartas)
    from PIL import ImageFilter
    bgf = fr.resize((270, 480)).crop((0, int(top / H * 480 / sc * 1.0) if False else 60, 270, 60 + 338)).resize((1080, 1350)).filter(ImageFilter.GaussianBlur(28))
    can = bgf.convert('RGBA')
    xoff = int((1080 - small.width) / 2)
    can.alpha_composite(small.crop((0, top, small.width, top + 1350)), (xoff, 0))
    can.alpha_composite(TARJA45, (0, 0))
    encs['4x5'].stdin.write(can.convert('RGB').tobytes())
for e in encs.values():
    e.stdin.close(); e.wait()
print('ok', dur)
