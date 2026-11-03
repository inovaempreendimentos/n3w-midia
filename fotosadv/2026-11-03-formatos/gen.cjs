// FOTOSADV – 10 FORMATOS novos a partir do V06 (o que o Othon aprovou em 03/11 00h54).
// Regra do lote: mesmo rosto (p01), mesma headline, mesmo CTA. Só muda a geometria/elemento. 0 crédito (HTML + Playwright).
// Fotos: ../2026-11-03-p10/raw/p01_*.png (fa-img).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const R = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '..', '2026-11-03-p10', 'raw', f)).toString('base64');
// P=m01 troca a pessoa (fotos em ./raw/<P>_*.png quando não é p01). SO=F01,F02 limita os formatos.
const PES = process.env.P || 'p01';
const R2 = (f) => { const loc = path.join(__dirname, 'raw', f); return fs.existsSync(loc) ? 'data:image/png;base64,' + fs.readFileSync(loc).toString('base64') : R(f); };
const SF = R2(PES + '_selfie.png'); const EST = ['bracos', 'mesa', 'palestra', 'varanda', 'notebook', 'corredor']; const IM = EST.map((e) => R2(PES + '_' + e + '.png'));
const V49 = process.env.V === '49';
// V=49: headline validada dos vencedores de 22/10 ("Ensaio profissional completo por R$ 49") com o preço atual da página.
const H = V49 ? `<h1 style="font-size:60px;padding-top:44px">Ensaio profissional completo<br><b>por R$ 49,90</b><small style="display:block;font-size:28px;font-weight:600;color:#fff;margin-top:10px">Escolha sua profissão, envie uma selfie, e pronto!</small></h1>` : `<h1>1 selfie entra.<br><b>15 fotos profissionais saem.</b></h1>`;
const PFX = (V49 ? 'FOTOSADV_FMT49_' : 'FOTOSADV_FMT_') + (PES === 'p01' ? '' : PES + '_');
const CSS = `*{box-sizing:border-box;margin:0;padding:0}body{width:1080px;height:1350px;background:#0e1220;font-family:Poppins,sans-serif;color:#fff;overflow:hidden;position:relative}
h1{font-size:64px;line-height:1.12;font-weight:700;text-align:center;padding:62px 60px 0;position:relative;z-index:9}h1 b{color:#e8ba48}
.cta{position:absolute;left:60px;right:60px;bottom:58px;height:104px;border-radius:52px;background:#e8ba48;color:#0e1220;font-weight:700;font-size:38px;display:flex;align-items:center;justify-content:center;z-index:9}
.pr{position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:24px;color:#9aa2b4;z-index:9}
.mid{position:absolute;left:0;right:0;top:${V49?275:250}px;height:900px}
.im{position:absolute;object-fit:cover;border-radius:18px;border:4px solid #fff;box-shadow:0 20px 40px rgba(0,0,0,.45)}
.lbl{position:absolute;font-size:22px;font-weight:700;padding:6px 16px;border-radius:12px;background:#0e1220;color:#fff;border:2px solid #e8ba48;z-index:6}
.sfx{position:absolute;padding:10px;background:#fff;border-radius:34px;box-shadow:0 30px 60px rgba(0,0,0,.5);z-index:3}.sfx img{width:100%;height:100%;object-fit:cover;border-radius:26px;display:block}
.seta{position:absolute;z-index:5;filter:drop-shadow(0 8px 18px rgba(0,0,0,.5))}`;
const seta = (x, y, rot = 0, w = 170) => `<svg class="seta" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg)" width="${w}" height="${w * .88}" viewBox="0 0 170 150"><path d="M8 52 H98 V12 L162 75 L98 138 V98 H8 Z" fill="#e8ba48" stroke="#0e1220" stroke-width="6" stroke-linejoin="round"/></svg>`;
const CTA = `<div class="cta">Quero minhas fotos profissionais →</div><div class="pr">15 fotos por R$ 89 · ou 4 por R$ 49,90 · no Pix · prontas em minutos</div>`;
const sf = (x, y, w, h, rot = -6, lbl = 'sua selfie') => `<div class="sfx" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg)"><img src="${SF}"><div class="lbl" style="left:16px;bottom:16px">${lbl}</div></div>`;
const im = (i, x, y, w, h, extra = '') => `<img class="im" src="${IM[i % 6]}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}">`;

const F = {
  // F01 · ESTEIRA: linha do tempo horizontal. selfie → relógio "15 min" → tira de fotos como filme.
  F01_esteira: `${H}<div class="mid">${sf(70, 120, 230, 330, 0)}${seta(320, 240, 0, 120)}
    <div style="position:absolute;left:440px;top:120px;width:580px;height:330px;background:#1b2133;border-radius:24px;padding:18px;display:flex;gap:14px;overflow:hidden">${[0,1,2,3].map((i)=>`<img src="${IM[i]}" style="width:124px;height:294px;object-fit:cover;border-radius:12px;border:3px solid #fff">`).join('')}<div style="position:absolute;right:0;top:0;bottom:0;width:120px;background:linear-gradient(90deg,transparent,#1b2133)"></div></div>
    <div style="position:absolute;left:70px;top:520px;right:60px;display:flex;justify-content:space-between;align-items:center"><div style="font-size:30px;color:#9aa2b4">⏱ <b style="color:#fff">15 minutos</b> depois</div><div style="font-size:30px;color:#9aa2b4">+11 fotos</div></div>
    ${[4,5,0,1,2].map((i,k)=>im(i, 70+k*192, 590, 176, 270)).join('')}</div>${CTA}`,
  // F02 · CELULAR: mockup de celular com a selfie e botão "enviar"; as fotos saem em leque pela direita.
  F02_celular: `${H}<div class="mid">
    <div style="position:absolute;left:70px;top:60px;width:360px;height:740px;background:#111;border-radius:50px;padding:16px;box-shadow:0 30px 60px rgba(0,0,0,.6);z-index:4"><div style="background:#fff;border-radius:38px;height:100%;overflow:hidden;position:relative"><div style="height:60px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#333;font-weight:600">Fotos Profissionais</div><img src="${SF}" style="width:100%;height:500px;object-fit:cover"><div style="margin:22px 20px;height:70px;border-radius:35px;background:#e8ba48;color:#0e1220;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700">Enviar selfie ↑</div></div></div>
    ${[0,1,2,3,4].map((i,k)=>im(i, 420+k*110, 120+Math.abs(k-2)*40, 210, 420, `transform:rotate(${(k-2)*9}deg);z-index:${k===2?3:1};border-radius:22px`)).join('')}
    <div class="lbl" style="right:70px;top:620px;font-size:26px">15 fotos prontas ✓</div></div>${CTA}`,
  // F03 · ÓRBITA: selfie no centro, 6 fotos em círculo ao redor.
  F03_orbita: `${H}<div class="mid"><div style="position:absolute;left:220px;top:130px;width:640px;height:640px;border-radius:50%;border:3px dashed #39415a"></div>
    ${sf(440, 350, 200, 200, 0, "selfie")}
    ${[0,1,2,3,4,5].map((i)=>{const r=320,cy=450,w=170,h=220,a=-90+i*60,cx=540,x=cx+r*Math.cos(a*Math.PI/180)-w/2,y=cy+r*Math.sin(a*Math.PI/180)-h/2;return im(i,x,y,w,h,'border-radius:28px')}).join('')}</div>${CTA}`,
  // F04 · NÚMERO GIGANTE: um "15" enorme feito de fotos (máscara), selfie pequena no canto.
  F04_numero: `${H}<div class="mid"><div style="position:absolute;left:0;right:0;top:20px;text-align:center;font-size:600px;font-weight:800;line-height:1;letter-spacing:-30px;background:url(${IM[3]}) center/cover;-webkit-background-clip:text;color:transparent">15</div>
    ${sf(70, 560, 200, 280, -8)}${seta(270, 650, 0, 110)}
    <div class="lbl" style="right:80px;top:700px;font-size:30px">fotos profissionais</div></div>${CTA}`,
  // F05 · GRADE 3×3: 8 fotos profissionais e a selfie no meio, destoando.
  F05_grade: `${H}<div class="mid">${[0,1,2,3,-1,4,5,0,1].map((i,k)=>i<0?`<div class="sfx" style="left:${380+(k%3)*0}px;top:${0}px;display:none"></div>`+sf(380, 290, 300, 290, 0, 'o que você manda'):im(i, 70+(k%3)*320, 0+Math.floor(k/3)*300, 300, 280)).join('')}
    <div class="lbl" style="left:70px;top:870px;font-size:26px;border-color:#fff">o que você recebe: as outras 8 (e mais 7)</div></div>${CTA}`,
  // F06 · DIAGONAL: corte diagonal, selfie na metade esquerda (cinza), profissional na direita (cor).
  F06_diagonal: `${H}<div class="mid"><div style="position:absolute;left:60px;top:40px;width:960px;height:780px;border-radius:30px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)">
    <img src="${SF}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) brightness(.7)"><img src="${IM[0]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:polygon(58% 0,100% 0,100% 100%,32% 100%)">
    <div style="position:absolute;left:0;top:0;width:100%;height:100%;clip-path:polygon(57% 0,59% 0,33% 100%,31% 100%);background:#e8ba48"></div>
    <div class="lbl" style="left:30px;top:30px">antes · selfie</div><div class="lbl" style="right:30px;top:30px;background:#e8ba48;color:#0e1220">depois · 1 das 15</div></div>
    ${[1,2,3,4,5].map((i,k)=>im(i, 60+k*196, 850, 176, 60, 'height:0;display:none')).join('')}</div>${CTA}`,
  // F07 · POLAROIDS: fotos como polaroids espalhadas na mesa; selfie como notificação de celular no topo.
  F07_polaroids: `${H}<div class="mid"><div style="position:absolute;left:120px;top:0;width:840px;height:110px;background:#fff;border-radius:26px;display:flex;align-items:center;gap:20px;padding:0 24px;color:#111;z-index:8;box-shadow:0 20px 40px rgba(0,0,0,.4)"><img src="${SF}" style="width:74px;height:74px;border-radius:18px;object-fit:cover"><div style="font-size:24px;line-height:1.25"><b>Fotos Profissionais</b> · agora<br><span style="color:#555">1 selfie enviada ✓ · gerando 15 fotos…</span></div></div>
    ${[[80,170,-9],[400,150,5],[700,180,-4],[120,480,6],[430,500,-7],[720,470,8]].map(([x,y,r],i)=>`<div style="position:absolute;left:${x}px;top:${y}px;width:290px;height:350px;background:#fff;padding:14px 14px 50px;transform:rotate(${r}deg);box-shadow:0 20px 40px rgba(0,0,0,.5)"><img src="${IM[i]}" style="width:100%;height:100%;object-fit:cover"></div>`).join('')}</div>${CTA}`,
  // F08 · RECIBO: ticket de pedido. "Você enviou: 1 selfie / Você recebe: 15 fotos" com miniaturas.
  F08_recibo: `${H}<div class="mid"><div style="position:absolute;left:140px;top:20px;width:800px;height:830px;background:#fff;color:#111;border-radius:14px;padding:40px 44px;font-family:Poppins;box-shadow:0 30px 60px rgba(0,0,0,.5)">
    <div style="font-size:22px;color:#777;letter-spacing:3px">PEDIDO #4821</div>
    <div style="display:flex;align-items:center;gap:22px;margin-top:22px;padding-bottom:22px;border-bottom:2px dashed #ddd"><img src="${SF}" style="width:110px;height:140px;object-fit:cover;border-radius:10px"><div style="font-size:30px;line-height:1.3">Você enviou<br><b>1 selfie do celular</b></div><div style="margin-left:auto;font-size:30px;color:#777">×1</div></div>
    <div style="display:flex;align-items:center;gap:22px;margin-top:22px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:240px">${[0,1,2,3,4,5].map((i)=>`<img src="${IM[i]}" style="width:76px;height:96px;object-fit:cover;border-radius:6px">`).join('')}</div><div style="font-size:30px;line-height:1.3">Você recebe<br><b style="color:#1a9e5c">15 fotos profissionais</b><br><span style="font-size:22px;color:#777">6 cenários · roupa social · em minutos</span></div><div style="margin-left:auto;font-size:30px;color:#777">×15</div></div>
    <div style="border-top:2px dashed #ddd;margin-top:30px;padding-top:24px;display:flex;justify-content:space-between;font-size:36px;font-weight:700"><span>Total</span><span>${V49?'a partir de R$ 49,90':'R$ 89,00'}</span></div>
    <div style="font-size:22px;color:#777;margin-top:8px">Pix · entrega imediata · sem estúdio</div></div></div>${CTA}`,
  // F09 · ROLO VERTICAL: tira de filme vertical com as fotos "saindo" do celular que tem a selfie.
  F09_rolo: `${H}<div class="mid"><div style="position:absolute;left:0;right:0;top:0;height:900px;background:repeating-linear-gradient(90deg,#1b2133 0 20px,#0e1220 20px 40px);opacity:.25"></div>
    ${sf(90, 40, 260, 360, -5)}${seta(330, 180, 0, 120)}
    <div style="position:absolute;left:470px;top:0;width:560px;height:900px;overflow:hidden">${[0,1,2,3,4,5,0,1].map((i,k)=>`<img src="${IM[i]}" style="position:absolute;left:${(k%2)*280}px;top:${Math.floor(k/2)*230-40}px;width:260px;height:220px;object-fit:cover;object-position:50% 20%;border-radius:10px;border:3px solid #fff">`).join('')}<div style="position:absolute;left:0;right:0;bottom:0;height:200px;background:linear-gradient(180deg,transparent,#0e1220)"></div></div>
    <div class="lbl" style="left:90px;top:520px;font-size:26px">continua rolando…<br>são 15</div></div>${CTA}`,
  // F10 · PREÇO: balança. Fotógrafo R$ 600 vs selfie R$ 89. O elemento é o preço comparado.
  F10_preco: `${H}<div class="mid">${[['Ensaio com fotógrafo','R$ 600','3 dias', '#e0393e', 0],['Sua selfie + IA',V49?'R$ 49,90':'R$ 89','15 min','#1a9e5c',1]].map(([t,p,d,c,ok],k)=>`<div style="position:absolute;left:${60+k*500}px;top:30px;width:460px;height:800px;background:#fff;color:#111;border-radius:30px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;height:430px">${(ok?[0,1,2,3]:[0,0,0,0]).map((i)=>ok?`<img src="${IM[i]}" style="width:100%;height:213px;object-fit:cover;object-position:50% 20%">`:`<div style="height:213px;background:#e9ebef;display:flex;align-items:center;justify-content:center;font-size:60px;color:#bbb">📷</div>`).join('')}</div>
      <div style="padding:26px 30px"><div style="font-size:26px;color:#666;font-weight:600">${t}</div><div style="font-size:84px;font-weight:800;color:${c};line-height:1.1">${p}</div><div style="font-size:24px;color:#555">${V49?"4 fotos":"15 fotos"} · entrega em <b>${d}</b></div></div>
      ${ok?`<div class="lbl" style="right:24px;top:24px;background:#1a9e5c;border-color:#1a9e5c;font-size:24px">mesma qualidade</div>`:''}</div>`).join('')}${seta(470, 640, 0, 110)}${sf(60, 760, 150, 180, -8, 'entrada')}</div>${CTA}`,
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [k, html] of Object.entries(F)) {
    if (process.env.SO && !process.env.SO.split(',').includes(k.slice(0, 3))) continue;
    await p.setContent(`<html><head><style>${CSS}</style></head><body>${html}</body></html>`); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(__dirname, `${PFX}${k}.jpg`), type: 'jpeg', quality: 92 }); console.log('ok', k);
  }
  await b.close();
})();
