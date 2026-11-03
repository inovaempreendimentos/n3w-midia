// FOTOSADV – variações do H01 (antes/depois) com mockups. HTML/CSS + Playwright, 0 crédito.
// Aprendizado do FotoMatch: tela realista de app, número grande, carimbo, nota, CTA de benefício.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const A = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(__dirname, 'assets', f)).toString('base64');
const CSS = `*{box-sizing:border-box;margin:0;padding:0}body{width:1080px;height:1350px;background:#0e1220;font-family:Poppins,sans-serif;color:#fff;overflow:hidden;position:relative}
h1{font-size:62px;line-height:1.12;font-weight:700;text-align:center;padding:62px 60px 0;letter-spacing:-.5px}h1 b{color:#e8ba48;font-weight:700}
.cta{position:absolute;left:60px;right:60px;bottom:58px;height:104px;border-radius:52px;background:#e8ba48;color:#0e1220;font-weight:700;font-size:38px;display:flex;align-items:center;justify-content:center;gap:14px}
.pr{position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:24px;color:#9aa2b4}
.ph{background:#fff;border-radius:44px;padding:16px;box-shadow:0 30px 60px rgba(0,0,0,.45);color:#111;position:relative;overflow:hidden}
.sb{display:flex;justify-content:space-between;font-size:17px;font-weight:600;padding:2px 14px 10px;color:#111}
.row{display:flex;gap:28px;justify-content:center;padding:0 50px}
.lbl{position:absolute;bottom:18px;left:18px;font-size:22px;font-weight:700;padding:6px 16px;border-radius:12px;background:#0e1220;color:#fff}.lbl.g{color:#e8ba48}
.ph img{display:block;object-fit:cover}
.stamp{position:absolute;font-size:46px;font-weight:800;border:6px solid;border-radius:14px;padding:4px 18px;transform:rotate(-14deg);letter-spacing:1px;background:rgba(255,255,255,.12)}
.ilu{position:absolute;right:70px;bottom:178px;font-size:18px;color:#6f7789}
.chip{display:inline-block;font-size:22px;font-weight:700;padding:8px 18px;border-radius:30px}
`;
const cta = (t = 'Quero minhas fotos profissionais →', ilu = 1) => `${ilu ? '<div class="ilu">exemplo ilustrativo</div>' : ''}<div class="cta">${t}</div><div class="pr">15 fotos por R$ 89 · ou 4 por R$ 49,90 · no Pix · prontas em minutos</div>`;
const li = (img, nome, views, cor) => `<div class="ph" style="width:450px;height:700px;padding:0">
 <div style="height:150px;background:linear-gradient(120deg,#8aa4c8,#c9d6e6)"></div>
 <img src="${img}" style="width:190px;height:190px;border-radius:50%;border:7px solid #fff;margin:-95px 0 0 26px;width:210px;height:210px;object-position:50% 18%">
 <div style="padding:14px 28px"><div style="font-size:30px;font-weight:700">${nome}</div><div style="font-size:21px;color:#555;line-height:1.35">Advogado · Direito Empresarial<br>São Paulo, SP · 500+ conexões</div>
 <div style="display:flex;gap:10px;margin:18px 0"><span class="chip" style="background:#0a66c2;color:#fff;font-size:20px">Conectar</span><span class="chip" style="border:2px solid #0a66c2;color:#0a66c2;font-size:20px">Mensagem</span></div>
 <div style="border-top:1px solid #e5e5e5;padding-top:18px;font-size:20px;color:#555">Visualizações do perfil · 7 dias</div>
 <div style="font-size:120px;font-weight:800;color:${cor};line-height:1.1">${views}</div>
 <div style="font-size:20px;color:#555">${cor=='#1a9e5c'?'↑ 3 recrutadores e 2 clientes viram':'nenhum contato novo'}</div></div></div>`;
const P = {
 V01_linkedin: `<h1>Mesmo currículo.<br><b>Outra primeira impressão.</b></h1><div class="row" style="margin-top:90px">${li(A('eu_selfie.jpg'),'Rafael Moura','4','#c0392b')}${li(A('eu_bracos.jpg'),'Rafael Moura','61','#1a9e5c')}</div>${cta()}`,
 V02_carimbo: `<h1>O cliente decide em 1 segundo.<br><b>Olhando a sua foto.</b></h1><div class="row" style="margin-top:56px">
  <div class="ph" style="width:450px;height:800px;padding:0"><img src="${A('eu_selfie.jpg')}" style="width:100%;height:100%"><div class="stamp" style="color:#e0393e;top:90px;left:40px">PRÓXIMO</div><div class="lbl">selfie</div></div>
  <div class="ph" style="width:450px;height:800px;padding:0"><img src="${A('eu_poltrona.jpg')}" style="width:100%;height:100%"><div class="stamp" style="color:#1a9e5c;top:90px;left:40px">CONTRATO</div><div class="lbl g">foto profissional</div></div></div>${cta(undefined, 0)}`,
 V03_whatsapp: `<h1>Ele vê sua foto<br><b>antes de ler sua mensagem.</b></h1><div style="display:flex;justify-content:center;margin-top:50px"><div class="ph" style="width:640px;height:860px;padding:0;background:#efe7de">
  <div style="background:#075e54;color:#fff;display:flex;align-items:center;gap:18px;padding:26px 26px"><img src="${A('eu_bracos.jpg')}" style="width:84px;height:84px;border-radius:50%;object-position:50% 15%"><div><div style="font-size:30px;font-weight:700">Dr. Rafael Moura</div><div style="font-size:20px;opacity:.85">online</div></div></div>
  <div style="padding:30px 26px;display:flex;flex-direction:column;gap:18px;font-size:26px">
   <div style="align-self:flex-start;background:#fff;border-radius:16px;padding:16px 20px;max-width:80%">Boa tarde! Vi seu perfil e gostei. Você atende empresa? 🙂</div>
   <div style="align-self:flex-start;background:#fff;border-radius:16px;padding:16px 20px;max-width:80%">Pode me passar um orçamento?</div>
   <div style="align-self:flex-end;background:#d9fdd3;border-radius:16px;padding:16px 20px;max-width:80%">Atendo sim! Te mando agora ✅</div></div>
  <div style="position:absolute;right:26px;bottom:26px;display:flex;align-items:center;gap:14px;background:#fff;border-radius:20px;padding:12px 16px;box-shadow:0 10px 30px rgba(0,0,0,.2)"><img src="${A('eu_selfie.jpg')}" style="width:90px;height:90px;border-radius:50%;filter:grayscale(.2)"><div style="font-size:20px;color:#c0392b;font-weight:700;line-height:1.2">com selfie:<br><span style="color:#555;font-weight:500">visualizou e não respondeu</span></div></div></div></div>${cta()}`,
 V04_nota: `<h1>Sua foto de perfil<br><b>passa confiança?</b></h1><div class="row" style="margin-top:56px">${[['eu_selfie.jpg','38','#e0393e',[30,25,45,40]],['eu_bracos.jpg','94','#1a9e5c',[95,92,96,90]]].map(([f,n,c,v])=>`<div class="ph" style="width:450px;height:820px;padding:0"><img src="${A(f)}" style="width:100%;height:420px;object-position:50% 20%">
  <div style="padding:22px 28px"><div style="font-size:21px;color:#666;font-weight:600">NOTA DE CONFIANÇA</div><div style="font-size:96px;font-weight:800;color:${c};line-height:1">${n}<span style="font-size:40px;color:#999">/100</span></div>
  ${['Luz','Fundo','Roupa','Postura'].map((t,i)=>`<div style="display:flex;align-items:center;gap:12px;margin-top:12px;font-size:20px;color:#444"><span style="width:90px">${t}</span><span style="flex:1;height:14px;border-radius:7px;background:#eee;overflow:hidden"><span style="display:block;height:100%;width:${v[i]}%;background:${c}"></span></span></div>`).join('')}</div></div>`).join('')}</div>${cta()}`,
 V05_site: `<h1>Um sócio com selfie<br><b>derruba o site inteiro.</b></h1><div style="display:flex;justify-content:center;margin-top:52px"><div class="ph" style="width:960px;height:800px;padding:0;border-radius:24px">
  <div style="background:#e9ebef;padding:14px 20px;display:flex;gap:10px;align-items:center"><i style="width:16px;height:16px;border-radius:50%;background:#ff5f57"></i><i style="width:16px;height:16px;border-radius:50%;background:#febc2e"></i><i style="width:16px;height:16px;border-radius:50%;background:#28c840"></i><span style="margin-left:18px;background:#fff;border-radius:8px;padding:6px 18px;font-size:19px;color:#666">mouraadvogados.com.br/equipe</span></div>
  <div style="padding:34px 40px"><div style="font-size:40px;font-weight:700;color:#0e1220">Nossa equipe</div><div style="font-size:21px;color:#777;margin-bottom:26px">Sócios e associados</div>
  <div style="display:flex;gap:26px">${[['ela_pro.jpg','Dra. Camila Reis','Sócia',0],['eu_selfie.jpg','Dr. Rafael Moura','Sócio',1],['ele2_pro.jpg','Dr. Bruno Lima','Sócio',0]].map(([f,n,c,bad])=>`<div style="flex:1;position:relative"><img src="${A(f)}" style="width:100%;height:420px;border-radius:14px;object-position:50% 20%;${bad?'outline:6px solid #e0393e;outline-offset:4px':''}"><div style="font-size:24px;font-weight:700;color:#111;margin-top:14px">${n}</div><div style="font-size:19px;color:#777">${c}</div>${bad?'<div class="stamp" style="color:#e0393e;top:150px;left:10px;font-size:34px;background:#fff">E ESSE AQUI?</div>':''}</div>`).join('')}</div></div></div></div>${cta('Fotos profissionais para o time todo →')}`,
 V06_1selfie15: `<h1>1 selfie entra.<br><b>15 fotos profissionais saem.</b></h1><div style="position:relative;height:880px;margin-top:40px">
  <div class="ph" style="position:absolute;left:60px;top:250px;width:270px;height:400px;padding:10px;transform:rotate(-6deg);z-index:3"><img src="${A('eu_selfie.jpg')}" style="width:100%;height:100%;border-radius:30px"><div class="lbl">sua selfie</div></div>
  <div style="position:absolute;left:330px;top:410px;font-size:90px;color:#e8ba48;z-index:4">→</div>
  ${['bracos','mesa','palestra','varanda','notebook','corredor'].map((n,i)=>`<img src="${A('eu_'+n+'.jpg')}" style="position:absolute;left:${450+(i%3)*196}px;top:${40+Math.floor(i/3)*400}px;width:180px;height:380px;object-fit:cover;border-radius:18px;border:4px solid #fff">`).join('')}
  </div>${cta(undefined, 0)}`,
 V07_concorrente: `<h1>Ele não é melhor que você.<br><b>A foto dele é.</b></h1><div class="row" style="margin-top:56px">
  <div class="ph" style="width:450px;height:800px;padding:0"><img src="${A('eu_selfie.jpg')}" style="width:100%;height:100%"><div class="lbl">você</div></div>
  <div class="ph" style="width:450px;height:800px;padding:0"><img src="${A('ele2_pro.jpg')}" style="width:100%;height:100%;object-position:50% 20%"><div class="lbl g">seu concorrente</div><div style="position:absolute;top:24px;right:24px;background:#1a9e5c;color:#fff;font-weight:700;font-size:24px;padding:10px 18px;border-radius:14px">fechou o cliente</div></div></div>${cta('Quero foto de quem fecha →', 0)}`,
 V08_instagram: `<h1>Quem te acha no Instagram<br><b>julga pela bolinha da foto.</b></h1><div class="row" style="margin-top:90px">${[['eu_selfie.jpg','128','#c0392b'],['eu_bracos.jpg','2.431','#1a9e5c']].map(([f,s,c])=>`<div class="ph" style="width:450px;height:700px;padding:0">
  <div class="sb" style="padding:22px 26px 0">dr.rafaelmoura</div><div style="display:flex;align-items:center;gap:22px;padding:22px 26px"><div style="padding:6px;border-radius:50%;background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)"><img src="${A(f)}" style="width:150px;height:150px;border-radius:50%;border:5px solid #fff;object-position:50% 18%"></div>
  <div style="display:flex;gap:18px;text-align:center;font-size:18px;color:#444"><div><b style="font-size:28px;color:#111">42</b><br>posts</div><div><b style="font-size:28px;color:${c}">${s}</b><br>seguidores</div></div></div>
  <div style="padding:0 26px;font-size:21px;line-height:1.4;color:#222"><b>Dr. Rafael Moura</b><br>Advogado · Direito Empresarial<br>📍 São Paulo · Agende sua consulta</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:22px">${Array.from({length:6},(_,i)=>`<div style="height:150px;background:${['#d7dce4','#c4ccd8','#e3e6ea','#cfd5de','#dfe3e8','#c9d0da'][i]}"></div>`).join('')}</div></div>`).join('')}</div>${cta()}`,
 V09_mulher_linkedin: `<h1>Mesma profissional.<br><b>Outra primeira impressão.</b></h1><div class="row" style="margin-top:90px">${li(A('ela_selfie.jpg'),'Camila Reis','6','#c0392b').replace('Advogado','Advogada')}${li(A('ela_pro.jpg'),'Camila Reis','74','#1a9e5c').replace('Advogado','Advogada')}</div>${cta()}`,
 V10_sem_estudio: `<h1>Sem estúdio. Sem fotógrafo.<br><b>Só a sua selfie.</b></h1><div class="row" style="margin-top:56px">
  <div class="ph" style="width:450px;height:800px;padding:0;background:#f4f4f6"><div style="padding:30px;font-size:25px;line-height:1.7;color:#333"><div style="font-size:27px;font-weight:700;color:#c0392b;margin-bottom:8px">Ensaio em estúdio</div>✕ agendar horário<br>✕ ir até o local<br>✕ roupa, cabelo, maquiagem<br>✕ dias esperando a edição</div><img src="${A('eu_selfie.jpg')}" style="position:absolute;bottom:0;left:0;width:100%;height:360px;object-position:50% 30%"><div class="lbl">sua selfie</div></div>
  <div class="ph" style="width:450px;height:800px;padding:0"><img src="${A('eu_bracos.jpg')}" style="width:100%;height:540px;object-position:50% 20%"><div style="padding:24px 30px;font-size:25px;line-height:1.7;color:#333"><b style="color:#1a9e5c">✓ 1 selfie do celular</b><br>✓ escolhe sua profissão<br>✓ pronto em minutos</div></div></div>${cta('Quero minhas fotos profissionais →', 0)}`,
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [k, html] of Object.entries(P)) {
    await p.setContent(`<html><head><style>${CSS}</style></head><body>${html}</body></html>`); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(__dirname, `FOTOSADV_H01x_${k}.jpg`), type: 'jpeg', quality: 92 });
  }
  await b.close(); console.log('ok', Object.keys(P).length);
})();
