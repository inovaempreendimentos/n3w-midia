// FOTOSADV – Grupo E (03/11 01h36): 10 formatos totalmente novos, diferentes de A–D (01–10) e entre si.
// Controle: mesmo rosto (P, padrão p01), mesma headline, mesmo CTA. Só o formato muda. 0 crédito.
// Uso: node gen_e.cjs   |   P=m01 node gen_e.cjs
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const PES = process.env.P || 'p01';
const R = (f) => { for (const d of [path.join(__dirname, 'raw'), path.join(__dirname, '..', '2026-11-03-p10', 'raw')]) { const p = path.join(d, f); if (fs.existsSync(p)) return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64'); } throw new Error('falta ' + f); };
const SF = R(PES + '_selfie.png'); const IM = ['bracos', 'mesa', 'palestra', 'varanda', 'notebook', 'corredor'].map((e) => R(PES + '_' + e + '.png'));
const H = `<h1>1 selfie entra.<br><b>15 fotos profissionais saem.</b></h1>`;
const CSS = `*{box-sizing:border-box;margin:0;padding:0}body{width:1080px;height:1350px;background:#0e1220;font-family:Poppins,sans-serif;color:#fff;overflow:hidden;position:relative}
h1{font-size:64px;line-height:1.12;font-weight:700;text-align:center;padding:62px 60px 0;position:relative;z-index:9}h1 b{color:#e8ba48}
.cta{position:absolute;left:60px;right:60px;bottom:58px;height:104px;border-radius:52px;background:#e8ba48;color:#0e1220;font-weight:700;font-size:38px;display:flex;align-items:center;justify-content:center;z-index:9}
.pr{position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:24px;color:#9aa2b4;z-index:9}
.mid{position:absolute;left:0;right:0;top:250px;height:900px}
.lbl{position:absolute;font-size:22px;font-weight:700;padding:6px 16px;border-radius:12px;background:#0e1220;color:#fff;border:2px solid #e8ba48;z-index:6}
img{display:block;object-fit:cover}`;
const CTA = `<div class="cta">Quero minhas fotos profissionais →</div><div class="pr">15 fotos por R$ 89 · ou 4 por R$ 49,90 · no Pix · prontas em minutos</div>`;
const pic = (s, x, y, w, h, st = '') => `<img src="${s}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}">`;

const E = {
  // E01 · CAPA DE REVISTA: a foto profissional vira capa, com chamadas. A selfie é o "antes" num canto.
  E01_revista: `${H}<div class="mid"><div style="position:absolute;left:150px;top:10px;width:620px;height:830px;background:#fff;box-shadow:0 30px 60px rgba(0,0,0,.6);overflow:hidden">
    ${pic(IM[0], 0, 0, 620, 830, 'object-position:50% 20%')}
    <div style="position:absolute;left:0;right:0;top:14px;text-align:center;font:900 120px/1 Georgia,serif;letter-spacing:6px;color:#c62f37">PERFIL</div>
    <div style="position:absolute;left:26px;top:200px;width:230px;font:800 30px/1.15 Poppins;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.7)">O novo rosto do mercado</div>
    <div style="position:absolute;left:26px;bottom:110px;font:700 24px/1.3 Poppins;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.8)">EDIÇÃO ESPECIAL<br><span style="color:#e8ba48;font-size:34px">15 fotos de capa</span></div>
    <div style="position:absolute;right:20px;bottom:20px;background:#fff;color:#111;font:700 18px Poppins;padding:6px 10px">R$ 89</div></div>
    <div style="position:absolute;left:770px;top:520px;width:240px;height:320px;padding:10px;background:#fff;transform:rotate(7deg);box-shadow:0 20px 40px rgba(0,0,0,.5)">${pic(SF, 10, 10, 220, 300)}<div style="position:absolute;bottom:-40px;left:0;right:0;text-align:center;font:700 22px Poppins;color:#fff">← era isso</div></div></div>${CTA}`,
  // E02 · SLIDER ANTES/DEPOIS: uma foto só, cortada ao meio por um controle deslizante, como app de edição.
  E02_slider: `${H}<div class="mid"><div style="position:absolute;left:90px;top:20px;width:900px;height:820px;border-radius:28px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)">
    ${pic(IM[0], 0, 0, 900, 820, 'object-position:50% 15%')}<div style="position:absolute;left:0;top:0;width:450px;height:820px;overflow:hidden">${pic(SF, 0, 0, 900, 820, 'object-position:50% 30%')}</div>
    <div style="position:absolute;left:446px;top:0;width:8px;height:820px;background:#fff"></div>
    <div style="position:absolute;left:400px;top:360px;width:100px;height:100px;border-radius:50%;background:#fff;color:#0e1220;font:800 44px Poppins;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.4)">⇆</div>
    <div class="lbl" style="left:24px;top:24px">ANTES</div><div class="lbl" style="right:24px;top:24px;background:#e8ba48;color:#0e1220">DEPOIS</div></div></div>${CTA}`,
  // E03 · CARTÃO DE VISITA + CRACHÁ: onde a foto vai ser usada, objetos reais na mesa.
  E03_cartao: `${H}<div class="mid"><div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#3a2a1c,#1a130d 70%);opacity:.9"></div>
    <div style="position:absolute;left:80px;top:110px;width:560px;height:330px;background:#f6f3ec;border-radius:16px;transform:rotate(-8deg);box-shadow:0 30px 50px rgba(0,0,0,.6);display:flex;gap:26px;padding:30px;color:#111">${pic(IM[0], 30, 30, 210, 270, 'position:relative;left:0;top:0;border-radius:10px;object-position:50% 15%')}<div style="padding-top:30px"><div style="font:700 36px Poppins">Rafael Moura</div><div style="font:500 22px Poppins;color:#666">Consultor · Sócio</div><div style="margin-top:60px;font:500 20px/1.6 Poppins;color:#444">(11) 9 0000-0000<br>rafael@empresa.com</div></div></div>
    <div style="position:absolute;left:560px;top:330px;width:400px;height:560px;background:#fff;border-radius:24px;transform:rotate(6deg);box-shadow:0 30px 50px rgba(0,0,0,.6);overflow:hidden;color:#111;text-align:center"><div style="height:70px;background:#1a6fd1"></div><div style="width:60px;height:14px;border-radius:7px;background:#ccc;margin:-50px auto 0"></div>${pic(IM[2], 90, 110, 220, 260, 'border-radius:16px;object-position:50% 15%')}<div style="position:absolute;top:400px;left:0;right:0;font:700 34px Poppins">RAFAEL MOURA</div><div style="position:absolute;top:450px;left:0;right:0;font:600 22px Poppins;color:#1a6fd1">PALESTRANTE</div></div>
    <div class="lbl" style="left:90px;top:560px;font-size:26px">tudo isso com 1 selfie ↓</div>
    <div style="position:absolute;left:90px;top:620px;width:200px;height:240px;padding:8px;background:#fff;border-radius:22px">${pic(SF, 8, 8, 184, 224, 'border-radius:16px')}</div></div>${CTA}`,
  // E04 · LUPA: selfie grande; uma lupa mostra, dentro do círculo, a versão profissional.
  E04_lupa: `${H}<div class="mid"><div style="position:absolute;left:90px;top:20px;width:900px;height:820px;border-radius:28px;overflow:hidden">${pic(SF, 0, 0, 900, 820, 'filter:saturate(.7) brightness(.85)')}
    <div style="position:absolute;left:330px;top:150px;width:460px;height:460px;border-radius:50%;overflow:hidden;border:16px solid #e8ba48;box-shadow:0 0 0 6px #0e1220,0 30px 60px rgba(0,0,0,.6)">${pic(IM[0], -330, -150, 900, 820, 'object-position:50% 15%')}</div>
    <div style="position:absolute;left:720px;top:560px;width:60px;height:260px;border-radius:30px;background:#2b2b2b;transform:rotate(-40deg);transform-origin:top center"></div>
    <div class="lbl" style="left:24px;top:24px">sua selfie</div><div class="lbl" style="left:360px;top:640px;background:#e8ba48;color:#0e1220">o que a IA enxerga</div></div></div>${CTA}`,
  // E05 · GERANDO: tela de progresso, barra 15/15 e lista de cenários marcados.
  E05_gerando: `${H}<div class="mid"><div style="position:absolute;left:100px;top:20px;width:880px;height:820px;background:#151b2c;border:2px solid #2a3350;border-radius:30px;padding:40px">
    <div style="display:flex;gap:26px;align-items:center">${pic(SF, 0, 0, 150, 190, 'position:relative;border-radius:18px')}<div><div style="font:600 26px Poppins;color:#9aa2b4">processando sua selfie</div><div style="font:800 64px Poppins;color:#e8ba48">15/15 prontas</div></div></div>
    <div style="height:28px;border-radius:14px;background:#2a3350;margin:30px 0;overflow:hidden"><div style="height:100%;width:100%;background:linear-gradient(90deg,#e8ba48,#f5d27a)"></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${['Escritório','Reunião','Palestra','Varanda','Home office','Corredor'].map((t, i) => `<div style="display:flex;gap:14px;align-items:center;background:#0e1220;border-radius:16px;padding:10px">${pic(IM[i], 0, 0, 90, 110, 'position:relative;border-radius:10px;object-position:50% 15%')}<div style="font:600 26px Poppins">${t}</div><div style="margin-left:auto;margin-right:14px;font:800 34px Poppins;color:#1fc16b">✓</div></div>`).join('')}</div></div></div>${CTA}`,
  // E06 · VISOR DE CÂMERA: foto profissional com a interface de câmera (REC, foco, ISO); selfie na miniatura da galeria.
  E06_camera: `${H}<div class="mid"><div style="position:absolute;left:60px;top:10px;width:960px;height:840px;border-radius:24px;overflow:hidden;background:#000">${pic(IM[3], 0, 0, 960, 840, 'object-position:50% 20%')}
    ${[[40,40,'border-left','border-top'],[880,40,'border-right','border-top'],[40,760,'border-left','border-bottom'],[880,760,'border-right','border-bottom']].map(([x,y,a,b])=>`<div style="position:absolute;left:${x}px;top:${y}px;width:40px;height:40px;${a}:5px solid #fff;${b}:5px solid #fff"></div>`).join('')}
    <div style="position:absolute;left:330px;top:150px;width:300px;height:300px;border:3px solid #e8ba48"></div>
    <div style="position:absolute;left:60px;top:50px;font:700 26px Poppins;display:flex;gap:10px;align-items:center"><i style="width:18px;height:18px;border-radius:50%;background:#e0393e;display:block"></i>REC</div>
    <div style="position:absolute;right:70px;top:50px;font:600 22px monospace">ISO 100 · f/1.8 · 85mm</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:150px;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:space-between;padding:0 50px"><div style="width:100px;height:100px;border-radius:14px;overflow:hidden;border:3px solid #fff">${pic(SF, 0, 0, 100, 100, 'position:relative')}</div><div style="width:110px;height:110px;border-radius:50%;border:8px solid #fff;background:#e8ba48"></div><div style="font:700 24px Poppins;width:100px;text-align:right">FOTO<br>ESTÚDIO</div></div>
    <div class="lbl" style="left:40px;bottom:170px">← sua selfie na galeria</div></div></div>${CTA}`,
  // E07 · MOSAICO: o rosto profissional dividido em 15 peças (3×5), como 15 fotos que formam você.
  E07_mosaico: `${H}<div class="mid">${Array.from({ length: 15 }, (_, k) => { const c = k % 3, r = Math.floor(k / 3), w = 250, h = 160, g = 12, X = 155 + c * (w + g), Y = 10 + r * (h + g); return `<div style="position:absolute;left:${X}px;top:${Y}px;width:${w}px;height:${h}px;overflow:hidden;border-radius:10px">${pic(IM[0], -c * (w + g), -r * (h + g), 3 * w + 2 * g, 5 * h + 4 * g, 'object-position:50% 15%')}</div><div style="position:absolute;left:${X + 8}px;top:${Y + 8}px;font:700 18px Poppins;background:rgba(14,18,32,.75);padding:2px 9px;border-radius:8px;z-index:3">${k + 1}</div>`; }).join('')}
    <div style="position:absolute;left:30px;top:640px;width:170px;height:210px;padding:8px;background:#fff;border-radius:20px;transform:rotate(-8deg);z-index:5">${pic(SF, 8, 8, 154, 194, 'border-radius:14px')}</div>
    <div class="lbl" style="left:40px;top:860px;transform:rotate(-8deg)">1 selfie</div></div>${CTA}`,
  // E08 · GALERIA DE ARTE: fotos em molduras douradas numa parede, selfie numa moldurinha barata no canto.
  E08_galeria: `${H}<div class="mid"><div style="position:absolute;inset:0;background:linear-gradient(#e9e3d8,#d8cfbf)"></div><div style="position:absolute;left:0;right:0;bottom:0;height:90px;background:#6b4a32"></div>
    ${[[60,60,300,380,0],[400,30,300,420,1],[740,60,280,380,2],[230,500,260,320,3],[560,480,260,340,4]].map(([x,y,w,h,i])=>`<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;padding:18px;background:linear-gradient(135deg,#b8862b,#f1d27a,#9c6d1d);box-shadow:0 20px 30px rgba(0,0,0,.35)"><div style="width:100%;height:100%;padding:10px;background:#f7f2e6">${pic(IM[i], 0, 0, w - 56, h - 56, 'position:relative;object-position:50% 15%')}</div></div>`).join('')}
    <div style="position:absolute;left:880px;top:560px;width:150px;height:190px;padding:6px;background:#888;transform:rotate(-6deg);box-shadow:0 10px 20px rgba(0,0,0,.3)">${pic(SF, 6, 6, 138, 178)}</div>
    <div style="position:absolute;left:840px;top:770px;font:700 22px Poppins;color:#3a2a1c;transform:rotate(-6deg)">a selfie de antes</div></div>${CTA}`,
  // E09 · PAPEL RASGADO: a selfie é rasgada e por baixo aparece a foto profissional.
  E09_rasgado: `${H}<div class="mid"><div style="position:absolute;left:90px;top:20px;width:900px;height:820px;border-radius:24px;overflow:hidden">${pic(IM[0], 0, 0, 900, 820, 'object-position:50% 15%')}
    <div style="position:absolute;inset:0;clip-path:polygon(0 0,100% 0,100% 18%,88% 24%,93% 31%,80% 36%,86% 44%,70% 47%,76% 55%,58% 58%,63% 66%,44% 70%,50% 78%,30% 80%,34% 88%,14% 90%,18% 97%,0 100%);filter:drop-shadow(0 0 0 #fff)">${pic(SF, 0, 0, 900, 820, 'filter:grayscale(.3)')}</div>
    <svg style="position:absolute;inset:0" width="900" height="820" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="100,18 88,24 93,31 80,36 86,44 70,47 76,55 58,58 63,66 44,70 50,78 30,80 34,88 14,90 18,97 0,100" fill="none" stroke="#fff" stroke-width="1.6"/></svg>
    <div class="lbl" style="left:24px;top:24px">selfie</div><div class="lbl" style="right:24px;bottom:24px;background:#e8ba48;color:#0e1220">profissional</div></div></div>${CTA}`,
  // E10 · PILHA 3D: as 15 fotos empilhadas em perspectiva, sumindo no fundo; selfie na frente.
  E10_pilha3d: `${H}<div class="mid" style="perspective:1400px">${Array.from({ length: 8 }, (_, k) => 7 - k).map((k) => `<div style="position:absolute;left:${380 + k * 48}px;top:${150 - k * 22}px;width:360px;height:480px;transform:rotateY(-28deg) translateZ(${-k * 90}px);border:5px solid #fff;border-radius:18px;overflow:hidden;box-shadow:-20px 20px 40px rgba(0,0,0,.5);opacity:${1 - k * 0.08}">${pic(IM[k % 6], 0, 0, 350, 470, 'object-position:50% 15%')}</div>`).join('')}
    <div style="position:absolute;left:60px;top:300px;width:280px;height:380px;padding:10px;background:#fff;border-radius:30px;transform:rotate(-5deg);z-index:9;box-shadow:0 30px 50px rgba(0,0,0,.6)">${pic(SF, 10, 10, 260, 360, 'border-radius:22px')}<div class="lbl" style="left:20px;bottom:20px">sua selfie</div></div>
    <div style="position:absolute;right:60px;top:690px;font:800 64px Poppins;color:#e8ba48">×15</div></div>${CTA}`,
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [k, html] of Object.entries(E)) {
    await p.setContent(`<html><head><style>${CSS}</style></head><body>${html}</body></html>`); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(__dirname, `FOTOSADV_${PES === 'p01' ? '' : PES + '_'}${k}.jpg`), type: 'jpeg', quality: 92 }); console.log('ok', k);
  }
  await b.close();
})();
