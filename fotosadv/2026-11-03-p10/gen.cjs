// FOTOSADV – formato "1 selfie entra, 15 fotos saem" (V06 aprovado pelo Othon 02/11 22h56) com 10 personagens.
// Fotos: OpenAI gpt-image via função fa-img (selfie + 6 estilos com o mesmo rosto). Montagem: HTML + Playwright.
// Uso: node gen.cjs  (lê raw/pNN_selfie.png e raw/pNN_<estilo>.png; P = lista abaixo)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const R = (f) => { const p = path.join(__dirname, 'raw', f); return fs.existsSync(p) ? 'data:image/png;base64,' + fs.readFileSync(p).toString('base64') : null; };
const EST = ['bracos', 'mesa', 'palestra', 'varanda', 'notebook', 'corredor'];
const P = [['p01', 'Desenvolvedor, 28'], ['p02', 'Advogada, 30'], ['p03', 'Médico, 38'], ['p04', 'Psicóloga, 42'], ['p05', 'Empresário, 50'],
  ['p06', 'Corretora, 55'], ['p07', 'Engenheiro, 35'], ['p08', 'Nutricionista, 26'], ['p09', 'Contador, 60'], ['p10', 'Dentista, 45']];
const CSS = `*{box-sizing:border-box;margin:0;padding:0}body{width:1080px;height:1350px;background:#0e1220;font-family:Poppins,sans-serif;color:#fff;overflow:hidden;position:relative}
h1{font-size:64px;line-height:1.12;font-weight:700;text-align:center;padding:62px 60px 0}h1 b{color:#e8ba48}
.cta{position:absolute;left:60px;right:60px;bottom:58px;height:104px;border-radius:52px;background:#e8ba48;color:#0e1220;font-weight:700;font-size:38px;display:flex;align-items:center;justify-content:center}
.pr{position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:24px;color:#9aa2b4}
.sf{position:absolute;left:60px;top:500px;width:270px;height:400px;padding:10px;background:#fff;border-radius:40px;transform:rotate(-6deg);z-index:3;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.sf img{width:100%;height:100%;object-fit:cover;border-radius:30px}.lbl{position:absolute;bottom:22px;left:22px;font-size:24px;font-weight:700;padding:6px 16px;border-radius:12px;background:#0e1220;color:#fff}
.g{position:absolute;width:180px;height:380px;object-fit:cover;border-radius:18px;border:4px solid #fff}
.tag{position:absolute;left:60px;top:930px;font-size:26px;font-weight:600;color:#9aa2b4;width:300px;text-align:center}`;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [id, prof] of P) {
    const sf = R(`${id}_selfie.png`); const ims = EST.map((e) => R(`${id}_${e}.png`));
    if (!sf || ims.some((x) => !x)) { console.log('falta', id); continue; }
    const html = `<h1>1 selfie entra.<br><b>15 fotos profissionais saem.</b></h1>
      <div class="sf"><img src="${sf}"><div class="lbl">sua selfie</div></div><div class="tag">${prof}</div>
      <svg style="position:absolute;left:300px;top:600px;z-index:5;filter:drop-shadow(0 8px 18px rgba(0,0,0,.5))" width="170" height="150" viewBox="0 0 170 150"><path d="M8 52 H98 V12 L162 75 L98 138 V98 H8 Z" fill="#e8ba48" stroke="#0e1220" stroke-width="6" stroke-linejoin="round"/></svg>
      ${ims.map((s, i) => `<img class="g" src="${s}" style="left:${450 + (i % 3) * 196}px;top:${280 + Math.floor(i / 3) * 400}px">`).join('')}
      <div class="cta">Quero minhas fotos profissionais →</div><div class="pr">15 fotos por R$ 89 · ou 4 por R$ 49,90 · no Pix · prontas em minutos</div>`;
    await pg.setContent(`<html><head><style>${CSS}</style></head><body>${html}</body></html>`); await pg.waitForTimeout(200);
    await pg.screenshot({ path: path.join(__dirname, `FOTOSADV_1selfie15_${id}.jpg`), type: 'jpeg', quality: 92 });
    console.log('ok', id);
  }
  await b.close();
})();
