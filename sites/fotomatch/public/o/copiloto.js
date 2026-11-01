(function () {
  const FN = "https://cdtfglylekiyxdmrgbne.supabase.co/functions/v1/match-copiloto";
  const EV = "https://cdtfglylekiyxdmrgbne.supabase.co/functions/v1/match-evento";
  const $ = (s) => document.querySelector(s);
  const q = new URLSearchParams(location.search), DEMO = q.has("demo"), utm = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach((k) => q.get(k) && (utm[k] = q.get(k)));
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* */ } } };
  const SESSAO = ls.get("cp_s") || (() => { const v = Array.from(crypto.getRandomValues(new Uint8Array(10)), (x) => x.toString(16).padStart(2, "0")).join(""); ls.set("cp_s", v); return v; })();
  let email = ls.get("cp_e") || "";
  const marca = (tela, ordem) => { if (DEMO) return; fetch(EV, { method: "POST", headers: { "Content-Type": "text/plain" }, keepalive: true, body: JSON.stringify({ sessao: SESSAO, pagina: "COPILOTO", tela, ordem, anuncio: utm.utm_content || null }) }).catch(() => {}); };
  const fb = (ev, d) => { try { if (!DEMO && window.fbq) fbq("track", ev, d); } catch { /* */ } };
  const call = (b) => fetch(FN, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(b) }).then((r) => r.json());
  const mostra = (id) => ["envio", "carregando", "resultado"].forEach((s) => ($("#" + s).hidden = s !== id));
  marca("inicio", 0);

  // checkout
  const CK = document.body.dataset.checkout;
  const cta = $("#cta");
  if (CK) { const u = new URL(CK); Object.entries(utm).forEach(([k, v]) => u.searchParams.set(k, v)); cta.href = u.toString(); } else cta.href = "#";
  cta.addEventListener("click", () => { marca("checkout", 9); fb("InitiateCheckout", { content_name: "Copiloto de Conversa", currency: "BRL", value: 9.9 }); });

  let objetivo = "continuar";
  document.querySelectorAll("#obj .chip").forEach((c) => c.addEventListener("click", () => {
    objetivo = c.dataset.v; document.querySelectorAll("#obj .chip").forEach((x) => x.setAttribute("aria-pressed", x === c ? "true" : "false"));
  }));

  let imgs = [];
  const reduz = (f) => new Promise((ok, no) => { const im = new Image(); im.onload = () => {
    const m = 1800, k = Math.min(1, m / Math.max(im.width, im.height)); const c = document.createElement("canvas");
    c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
    URL.revokeObjectURL(im.src); ok(c.toDataURL("image/jpeg", 0.85)); }; im.onerror = no; im.src = URL.createObjectURL(f); });
  $("#arq").addEventListener("change", async (e) => {
    const fs = Array.from(e.target.files || []).slice(0, 4); if (!fs.length) return;
    imgs = (await Promise.all(fs.map(reduz).map((p) => p.catch(() => null)))).filter(Boolean);
    $("#thumbs").innerHTML = imgs.map((u) => `<img src="${u}" alt="">`).join("");
    $("#vai").disabled = !imgs.length; marca("prints", 1);
  });

  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const FALSO = "Essa resposta está pronta para você copiar e mandar agora";
  function desenha(r) {
    const it = (r.interesse || "").toLowerCase(); const t = $("#rInt");
    t.textContent = { frio: "❄️ Frio", morno: "🌤 Morno", quente: "🔥 Quente" }[it] || it; t.className = "tag " + (it === "quente" ? "bom" : it === "morno" ? "morno" : "ruim");
    $("#rIntP").textContent = r.interesse_porque || ""; $("#rLei").textContent = r.leitura || ""; $("#rErro").textContent = r.erro || "";
    $("#rEst").textContent = r.estrategia || ""; $("#rEvi").textContent = r.evitar || "";
    $("#rResp").innerHTML = (r.respostas || []).map((x) => x.bloqueada
      ? `<div class="resp tranca"><p class="r-h">${esc(x.tom)}</p><p class="tx">${FALSO}</p><p class="pq">e o porquê de funcionar com ela</p></div>`
      : `<div class="resp"><button class="cp" data-t="${esc(x.texto)}">Copiar</button><p class="r-h">${esc(x.tom)}</p><p class="tx">${esc(x.texto)}</p><p class="pq">${esc(x.porque)}</p></div>`).join("");
    document.querySelectorAll(".cp").forEach((b) => b.addEventListener("click", () => { navigator.clipboard?.writeText(b.dataset.t); b.textContent = "Copiado"; marca("copiou", 4); }));
    if (!r.pago) $("#rResp").insertAdjacentHTML("beforeend", `<a class="btn" href="#pague" id="ctaMeio" style="margin:6px 0 4px">Liberar as outras respostas · R$ 9,90</a>`);
    $("#ctaMeio")?.addEventListener("click", () => marca("cta_meio", 6));
    const prox = $("#cProx"); if (r.proximo_passo) { prox.classList.remove("tranca"); $("#rProx").textContent = r.proximo_passo; } else { prox.classList.add("tranca"); $("#rProx").innerHTML = `<span class="tx" style="display:block">${FALSO}, com o passo seguinte</span>`; }
    $("#pague").hidden = !!r.pago; $("#selo").textContent = r.pago ? "Ilimitado ativo" : "1ª análise grátis";
    mostra("resultado"); scrollTo(0, 0);
  }

  $("#vai").addEventListener("click", async () => {
    $("#erro").textContent = ""; mostra("carregando"); marca("analisou", 2);
    try {
      const r = await call({ acao: "analisar", sessao: SESSAO, email, imagens: imgs, objetivo, contexto: $("#ctx").value, anuncio: utm.utm_content || null });
      if (r.bloqueado) { mostra("envio"); $("#pague").hidden = false; $("#pague").scrollIntoView({ behavior: "smooth" }); marca("paywall", 5); return; }
      if (r.fora_do_escopo) { mostra("envio"); $("#erro").textContent = "Não consegui ler uma conversa nesses prints. Mande o print da conversa no app."; return; }
      if (r.erro) { mostra("envio"); $("#erro").textContent = r.erro; return; }
      desenha(r); marca("resultado", 3); if (!r.pago) { marca("paywall", 5); fb("Lead", { content_name: "Copiloto" }); }
    } catch { mostra("envio"); $("#erro").textContent = "Sem conexão. Tente de novo."; }
  });
  $("#outro").addEventListener("click", () => { imgs = []; $("#thumbs").innerHTML = ""; $("#arq").value = ""; $("#vai").disabled = true; mostra("envio"); scrollTo(0, 0); });
  $("#entrar").addEventListener("click", async () => {
    const e = $("#email").value.trim(); if (!e) return; $("#emailMsg").textContent = "Verificando…";
    try { const r = await call({ acao: "acesso", email: e });
      if (r.ativo) { email = r.email; ls.set("cp_e", email); $("#emailMsg").textContent = "✓ Copiloto liberado. Mande seus prints."; $("#selo").textContent = "Ilimitado ativo"; $("#pague").hidden = true; mostra("envio"); scrollTo(0, 0); }
      else $("#emailMsg").textContent = "Ainda não achei pagamento nesse e-mail. Se acabou de pagar, espere 1 minuto e tente de novo.";
    } catch { $("#emailMsg").textContent = "Sem conexão. Tente de novo."; }
  });
  if (email && !DEMO) call({ acao: "acesso", email }).then((r) => { if (r.ativo) $("#selo").textContent = "Ilimitado ativo"; }).catch(() => {});
  if (DEMO && q.get("demo") === "res") desenha({ pago: false, interesse: "morno", interesse_porque: "Ela responde rápido e devolve pergunta, mas com mensagens curtas.",
    leitura: "A conversa está viva, mas virou entrevista: você pergunta, ela responde e devolve.", erro: "Três perguntas seguidas sem contar nada sobre você.",
    estrategia: "Pare de perguntar e conte algo seu ligado ao que ela falou da viagem. Isso dá assunto para ela e abre espaço para um convite.",
    evitar: "Não mande outra pergunta sobre trabalho.",
    respostas: [{ tom: "Leve", texto: "Salvador sem acarajé não conta, então já vou considerar que você me deve uma indicação", porque: "Usa o assunto dela e cria uma brincadeira entre vocês." }, { tom: "Curiosa", bloqueada: true }, { tom: "Direta", bloqueada: true }] });
})();
