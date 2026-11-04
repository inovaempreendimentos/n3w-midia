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
cor = tuple(int(sys.argv[5][i:i + 2], 16) for i in (0, 2, 4)) if len(sys.argv) > 5 else (18, 18, 20)
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

def cta(im, t, W_, H_):
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

for i in range(n):
    raw = dec.stdout.read(W * H * 3)
    if len(raw) < W * H * 3: break
    t = i / FPS
    fr = Image.frombytes('RGB', (W, H), raw).convert('RGBA')
    # camadas nítidas: pergunta já no frame 0
    fr.alpha_composite(dep, dep_xy); fr.alpha_composite(q, q_xy); fr.alpha_composite(pr, pr_xy)
    f916 = fr.copy(); cta(f916, t, W, H)
    encs['9x16'].stdin.write(f916.convert('RGB').tobytes())
    # 4:5: recorte central do 9:16, subindo para caber depoimento (topo) e cartas (base) em 1350 px
    sc = 1350 / (OY + 1651 * 1.0) if False else 0.80
    small = fr.resize((int(W * sc), int(H * sc)), Image.LANCZOS)
    top = int(OY * sc) + int((1651 * sc - 1350) / 2) if 1651 * sc > 1350 else int(OY * sc) - int((1350 - 1651 * sc) / 2)
    can = Image.new('RGBA', (1080, 1350), (236, 232, 225, 255))
    xoff = int((1080 - small.width) / 2)
    can.alpha_composite(small.crop((0, top, small.width, top + 1350)), (xoff, 0)) if small.width <= 1080 else None
    # preenche laterais com o próprio linho espelhado
    if xoff > 0:
        lft = small.crop((0, top, xoff, top + 1350)).transpose(Image.FLIP_LEFT_RIGHT)
        rgt = small.crop((small.width - xoff, top, small.width, top + 1350)).transpose(Image.FLIP_LEFT_RIGHT)
        can.alpha_composite(lft, (0, 0)); can.alpha_composite(rgt, (1080 - xoff, 0))
    cta(can, t, 1080, 1350)
    encs['4x5'].stdin.write(can.convert('RGB').tobytes())
for e in encs.values():
    e.stdin.close(); e.wait()
print('ok', dur)
