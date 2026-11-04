# Vídeos K1/K3 a partir dos estáticos vencedores — montagem por código (Pillow + ffmpeg, 0 crédito).
# Uso: python3 gen_videos.py <VAR> <FMT> [preview]   VAR = K1A K1B K1C K3A K3B K3C   FMT = 916 | 45
import sys, math, subprocess, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

D = os.path.dirname(os.path.abspath(__file__)) + '/'
GF = '/usr/share/fonts/truetype/google-fonts/'
FPS, DUR = 30, 12.0

def lora(size, w=500):
    f = ImageFont.truetype(GF + 'Lora-Variable.ttf', size)
    try: f.set_variation_by_axes([w])
    except Exception: pass
    return f
def lora_it(size, w=500):
    f = ImageFont.truetype(GF + 'Lora-Italic-Variable.ttf', size)
    try: f.set_variation_by_axes([w])
    except Exception: pass
    return f
def pop(size, bold=True):
    return ImageFont.truetype(GF + ('Poppins-Bold.ttf' if bold else 'Poppins-Medium.ttf'), size)

CARTAS = {
    'enamorados': ('Os Enamorados', 'escolha do coração e reencontro'),
    '2copas': ('2 de Copas', 'reconciliação e união'),
    'estrela': ('A Estrela', 'esperança que se renova'),
    'imperatriz': ('A Imperatriz', 'o amor volta a florescer'),
    'imperador': ('O Imperador', 'compromisso e segurança'),
    'roda': ('A Roda da Fortuna', 'o jogo vira a seu favor'),
}
VARS = {
    'K1A': dict(k='k1', hook='Meu ex vai voltar?', ordem=['enamorados', '2copas', 'estrela'], cor=(18, 18, 20)),
    'K1B': dict(k='k1', hook='Ele vai voltar pra mim?', ordem=['enamorados', '2copas', 'estrela'], cor=(18, 18, 20)),
    'K1C': dict(k='k1', hook='Meu ex vai voltar?', ordem=['enamorados', '2copas', 'estrela'], cor=(74, 32, 110)),
    'K3A': dict(k='k3', hook='Meu ex vai voltar?', ordem=['imperatriz', 'imperador', 'roda'], cor=(18, 18, 20)),
    'K3B': dict(k='k3', hook='Ele ainda pensa em mim?', ordem=['imperatriz', 'imperador', 'roda'], cor=(18, 18, 20)),
    'K3C': dict(k='k3', hook='Meu ex vai voltar?', ordem=['roda', 'imperatriz', 'imperador'], cor=(18, 18, 20)),
}
# layouts (y em px). 9:16: nada essencial nos 250 px de cima e de baixo.
LAY = {
    '916': dict(W=1080, H=1920, q_y=290, q_size=78, card_w=322, cards_y=440, cap_y=950,
                dep_w=580, dep_y=952, price_y=1556, price_size=54, cta_size=64),
    '45': dict(W=1080, H=1350, q_y=46, q_size=70, card_w=262, cards_y=178, cap_y=625,
               dep_w=470, dep_y=612, price_y=1112, price_size=50, cta_size=60),
}

def ease(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def lin(t, a, b): return max(0.0, min(1.0, (t - a) / (b - a)))

def linen(W, H, seed=7):
    rng = np.random.default_rng(seed)
    base = np.full((H, W, 3), (236, 232, 225), np.float32)
    n = rng.normal(0, 1, (H, W)).astype(np.float32)
    h = Image.fromarray(np.uint8(np.clip(128 + n * 40, 0, 255))).filter(ImageFilter.BoxBlur(0))
    hx = np.asarray(h.resize((W // 6, H)).resize((W, H), Image.BILINEAR), np.float32) - 128
    hy = np.asarray(h.resize((W, H // 6)).resize((W, H), Image.BILINEAR), np.float32) - 128
    tex = (hx * 0.10 + hy * 0.10 + n * 2.2)[..., None]
    yy, xx = np.mgrid[0:H, 0:W]
    vig = 1 - 0.06 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    img = np.clip((base + tex) * vig[..., None], 0, 255).astype(np.uint8)
    return Image.fromarray(img).convert('RGBA')

def card_back(w, h, cor):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    bg = tuple(int(c * 0.55 + v * 0.45) for c, v in zip(cor, (58, 31, 92))) if cor != (18, 18, 20) else (58, 31, 92)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=int(w * 0.047), fill=(247, 240, 224, 255), outline=(214, 200, 170, 255), width=2)
    B = int(w * 0.055)
    d.rectangle([B, B, w - B, h - B], fill=bg + (255,))
    gold = (214, 178, 96, 255)
    d.rectangle([B + 10, B + 10, w - B - 10, h - B - 10], outline=gold, width=3)
    d.rectangle([B + 20, B + 20, w - B - 20, h - B - 20], outline=gold, width=1)
    cx, cy, R = w / 2, h / 2, w * 0.22
    pts = []
    for i in range(16):
        r = R if i % 2 == 0 else R * 0.42
        a = math.pi * i / 8 - math.pi / 2
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d.polygon(pts, fill=gold)
    d.ellipse([cx - R * 1.35, cy - R * 1.35, cx + R * 1.35, cy + R * 1.35], outline=gold, width=2)
    for fx, fy in [(0.25, 0.18), (0.75, 0.18), (0.25, 0.82), (0.75, 0.82)]:
        x, y, r = w * fx, h * fy, w * 0.025
        d.ellipse([x - r, y - r, x + r, y + r], fill=gold)
    return im

def shadow_of(im, blur=14, alpha=90, off=(0, 10)):
    a = im.split()[3].point(lambda v: v * alpha // 255)
    sh = Image.new('RGBA', (im.width + 2 * blur * 2, im.height + 2 * blur * 2), (0, 0, 0, 0))
    blk = Image.new('RGBA', im.size, (40, 30, 20, 255)); blk.putalpha(a)
    sh.paste(blk, (blur * 2, blur * 2), blk)
    return sh.filter(ImageFilter.GaussianBlur(blur)), (off[0] - blur * 2, off[1] - blur * 2)

def text_box(text, font, fg, bg, padx, pady, maxw=None):
    tmp = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    l, t, r, b = tmp.textbbox((0, 0), text, font=font)
    w, h = r - l + 2 * padx, b - t + 2 * pady
    im = Image.new('RGBA', (w, h), bg + (255,)); d = ImageDraw.Draw(im)
    d.text((padx - l, pady - t), text, font=font, fill=fg)
    return im

def paste_c(dst, im, cx, y, alpha=1.0, scale=1.0):
    if alpha <= 0: return
    if scale != 1.0:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)
    if alpha < 1:
        im = im.copy(); im.putalpha(im.split()[3].point(lambda v: int(v * alpha)))
    dst.alpha_composite(im, (int(cx - im.width / 2), int(y)))

def wrap_lines(text, font, maxw):
    d = ImageDraw.Draw(Image.new('RGB', (1, 1))); out, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: out.append(cur); cur = w
    out.append(cur); return out

def build(var, fmt):
    V, L = VARS[var], LAY[fmt]
    W, H = L['W'], L['H']
    bg = linen(W, H)
    cw = L['card_w']; gap = int(cw * 0.08)
    faces = []
    for nome in V['ordem']:
        im = Image.open(D + f"assets/{V['k']}_{nome}.png").convert('RGBA')
        faces.append(im.resize((cw, int(im.height * cw / im.width)), Image.LANCZOS))
    ch = faces[0].height
    back = card_back(cw, ch, V['cor'])
    xs = [W / 2 + (i - 1) * (cw + gap) for i in range(3)]
    q = text_box(V['hook'], lora(L['q_size'], 500), (255, 255, 255), V['cor'], 46, 26)
    price = text_box('tarô a partir de R$20,00', lora(L['price_size'], 500), (255, 255, 255), V['cor'], 40, 22)
    dep = Image.open(D + 'assets/depoimento.png').convert('RGBA')
    dep = dep.resize((L['dep_w'], int(dep.height * L['dep_w'] / dep.width)), Image.LANCZOS)
    dm = Image.new('L', dep.size, 0); ImageDraw.Draw(dm).rounded_rectangle([0, 0, dep.width - 1, dep.height - 1], radius=26, fill=255)
    dep.putalpha(dm)
    dep_sh, dep_off = shadow_of(dep, 18, 110, (0, 14))
    card_sh, card_off = shadow_of(faces[0], 12, 100, (0, 10))
    f_name, f_mean = pop(int(L['q_size'] * 0.72)), lora_it(int(L['q_size'] * 0.64), 500)
    lab_f = pop(int(L['q_size'] * 0.40), False)
    cta_f = pop(L['cta_size'])
    cta_lines = wrap_lines('Toque em Enviar mensagem e faça sua pergunta', cta_f, W - 220)
    T_FLIP = [1.0, 2.1, 3.2]; FL = 0.55

    def frame(t):
        im = bg.copy(); d = ImageDraw.Draw(im)
        # pergunta: visível desde o frame 0
        s = 1.0 + 0.04 * (1 - ease(lin(t, 0, 0.35)))
        paste_c(im, q, W / 2, L['q_y'], 1.0, s)
        # cartas: entram deslizando (0–0.6 s) e viram uma a uma
        for i in range(3):
            ent = ease(lin(t, -0.35 + i * 0.06, 0.25 + i * 0.06))
            y = L['cards_y'] + (1 - ent) * 60
            p = lin(t, T_FLIP[i], T_FLIP[i] + FL)
            lift = math.sin(math.pi * p) * 0.07
            sx = abs(math.cos(math.pi * p))
            src = back if p < 0.5 else faces[i]
            w2 = max(2, int(cw * sx * (1 + lift))); h2 = int(ch * (1 + lift))
            c = src.resize((w2, h2), Image.LANCZOS)
            sh = card_sh.resize((max(2, int(card_sh.width * sx)), card_sh.height))
            im.alpha_composite(sh, (int(xs[i] - sh.width / 2), int(y + card_off[1] + lift * 40)))
            im.alpha_composite(c, (int(xs[i] - w2 / 2), int(y - (h2 - ch) / 2 - lift * 30)))
        # legenda da carta virada (some quando entra o depoimento)
        cur = None
        for i in range(3):
            if t >= T_FLIP[i] + FL * 0.5: cur = i
        cap_a = 1 - ease(lin(t, 4.5, 4.8))
        if cur is not None and cap_a > 0:
            nome, sig = CARTAS[V['ordem'][cur]]
            a0 = ease(lin(t, T_FLIP[cur] + FL * 0.5, T_FLIP[cur] + FL * 0.5 + 0.25)) * cap_a
            # marcador sob a carta
            mx = xs[cur]; my = L['cards_y'] + ch + 18
            d.polygon([(mx - 16, my + 16), (mx + 16, my + 16), (mx, my)], fill=V['cor'] + (int(255 * a0),))
            line1 = Image.new('RGBA', (W, 200), (0, 0, 0, 0)); dl = ImageDraw.Draw(line1)
            t1 = f'{cur + 1}ª carta: {nome}'
            dl.text((W / 2, 10), t1, font=f_name, fill=V['cor'] + (255,), anchor='mt')
            dl.text((W / 2, 10 + int(f_name.size * 1.35)), sig, font=f_mean, fill=(60, 50, 45, 255), anchor='mt')
            paste_c(im, line1, W / 2, L['cap_y'], a0)
        # depoimento
        da = ease(lin(t, 4.7, 5.2))
        if da > 0:
            yy = L['dep_y'] + (1 - da) * 50
            sh = dep_sh.copy(); sh.putalpha(sh.split()[3].point(lambda v: int(v * da)))
            im.alpha_composite(sh, (int(W / 2 - dep.width / 2 + dep_off[0]), int(yy + dep_off[1])))
            paste_c(im, dep, W / 2, yy, da)
        # preço
        pa = ease(lin(t, 6.6, 7.0))
        if pa > 0:
            paste_c(im, price, W / 2, L['price_y'], pa, 1 + 0.06 * (1 - pa))
        # CTA final (9,3 s → fim)
        ca = ease(lin(t, 9.3, 9.7))
        if ca > 0:
            ov = Image.new('RGBA', (W, H), (12, 10, 14, int(200 * ca)))
            im.alpha_composite(ov)
            lh = int(cta_f.size * 1.28); bh = lh * len(cta_lines) + 90
            by = H / 2 - bh / 2 - 40
            box = Image.new('RGBA', (W - 140, bh), (255, 255, 255, 255)); bd = ImageDraw.Draw(box)
            for j, ln in enumerate(cta_lines):
                bd.text((box.width / 2, 45 + j * lh), ln, font=cta_f, fill=V['cor'] + (255,), anchor='mt')
            paste_c(im, box, W / 2, by, ca, 1 + 0.05 * (1 - ca))
            # seta pulsando para o botão
            pulse = 0.5 + 0.5 * math.sin((t - 9.7) * 2 * math.pi * 1.4)
            ay = by + bh + 50 + pulse * 18
            col = (255, 255, 255, int(255 * ca))
            d2 = ImageDraw.Draw(im)
            d2.polygon([(W / 2 - 44, ay), (W / 2 + 44, ay), (W / 2, ay + 50)], fill=col)
            d2.rectangle([W / 2 - 14, ay - 50, W / 2 + 14, ay], fill=col)
            sub = lora(int(L['cta_size'] * 0.9), 500)
            d2.text((W / 2, by - 36), V['hook'], font=sub, fill=(255, 255, 255, int(235 * ca)), anchor='mb')
        return im.convert('RGB')
    return frame, (W, H)

def render(var, fmt, out):
    frame, (W, H) = build(var, fmt)
    n = int(FPS * DUR)
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '64k',
                          '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for i in range(n):
        p.stdin.write(frame(i / FPS).tobytes())
    p.stdin.close(); p.wait()

if __name__ == '__main__':
    var, fmt = sys.argv[1], sys.argv[2]
    if len(sys.argv) > 3 and sys.argv[3] == 'preview':
        frame, _ = build(var, fmt)
        for t in [0.0, 1.8, 3.9, 5.8, 8.0, 11.0]:
            frame(t).save(sys.argv[4] + f'/{var}_{fmt}_{t:04.1f}.png')
    else:
        os.makedirs(D + 'out', exist_ok=True)
        render(var, fmt, D + f'out/{var}_{"9x16" if fmt == "916" else "4x5"}.mp4')
