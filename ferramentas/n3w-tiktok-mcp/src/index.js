// N3w TikTok — conector MCP próprio para a TikTok Business API (Marketing API v1.3). Substitui o Windsor no TikTok.
// Roda como Cloudflare Worker. Protocolo: MCP Streamable HTTP (JSON-RPC 2.0, sem estado).
//
// Segredos (painel Cloudflare > Worker > Settings > Variables, tipo Secret — nunca no repo):
//   TIKTOK_TOKEN     access token de longo prazo do app TikTok for Business (Marketing API), autorizado nas contas de anúncio
//   CONNECTOR_KEY    chave longa aleatória (conta Claude 1); a URL do conector fica https://<worker>/mcp/<CONNECTOR_KEY>
//   CONNECTOR_KEY_2  chave da conta Claude 2 (opcional)
// Variáveis (wrangler.toml):
//   API_VERSION      v1.3
//   ADVERTISER_IDS   contas padrão separadas por vírgula
//
// REGRA INQUEBRÁVEL (igual ao N3w Meta): nada é ativado e nenhum orçamento sobe sem autorização humana.
// Pausar e reduzir orçamento são livres. Ativar ou aumentar exigem `autorizacao_humana` com a frase do Othon.

const SERVER_INFO = { name: "n3w-tiktok", version: "0.1.0" };
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class TikTokError extends Error {
  constructor(code, message, requestId) { super(message || `code ${code}`); this.code = code; this.requestId = requestId; }
  toJSON() { return { erro: this.message, code: this.code, request_id: this.requestId }; }
}

// Códigos temporários (limite de taxa / sistema ocupado) que valem nova tentativa.
const RETRY_CODES = new Set([40100, 40133, 50000, 50002, 51021, 51305]);

async function tt(env, method, path, params = {}) {
  const base = `https://business-api.tiktok.com/open_api/${env.API_VERSION || "v1.3"}/${path.replace(/^\/|\/$/g, "")}/`;
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    let url = base, init = { method, headers: { "Access-Token": env.TIKTOK_TOKEN, "Content-Type": "application/json" } };
    if (method === "GET") {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) q.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
      url += "?" + q.toString();
    } else init.body = JSON.stringify(params);
    const r = await fetch(url, init);
    let j; try { j = await r.json(); } catch { j = { code: r.status, message: "resposta não-JSON" }; }
    if (j.code === 0) return j.data;
    if (RETRY_CODES.has(j.code) && tentativa < 3) { await sleep(800 * (tentativa + 1)); continue; }
    throw new TikTokError(j.code, j.message, j.request_id);
  }
}

const contas = (env, a) => {
  const v = a.contas || a.conta || env.ADVERTISER_IDS || "";
  return (Array.isArray(v) ? v : String(v).split(",")).map((x) => String(x).trim()).filter(Boolean);
};
const exigeAutorizacao = (a, oque) => {
  const f = String(a.autorizacao_humana || "").trim();
  if (f.length < 8) throw new Error(`${oque} exige autorizacao_humana com a frase literal do Othon (regra inquebrável).`);
  return f;
};
const reais = (v) => Math.round(Number(v) * 100) / 100;

async function todasPaginas(env, path, params, max = 20) {
  const out = [];
  for (let page = 1; page <= max; page++) {
    const d = await tt(env, "GET", path, { ...params, page, page_size: params.page_size || 1000 });
    out.push(...(d.list || []));
    const pi = d.page_info || {};
    if (!pi.total_page || page >= pi.total_page) break;
  }
  return out;
}

const TOOLS = [
  {
    name: "contas",
    description: "Lista as contas de anúncio (advertisers) configuradas, com nome, moeda, fuso e status.",
    inputSchema: { type: "object", properties: { contas: { type: "string", description: "IDs separados por vírgula (opcional)" } } },
    run: async (env, a) => {
      const ids = contas(env, a);
      const d = await tt(env, "GET", "advertiser/info", { advertiser_ids: ids, fields: ["advertiser_id", "name", "currency", "timezone", "status", "balance"] });
      return d.list || d;
    },
  },
  {
    name: "relatorio",
    description: "Métricas por dia (gasto, impressões, cliques, CTR, conversões) no nível account|campaign|adgroup|ad. Datas AAAA-MM-DD no fuso da conta (máx. 30 dias por chamada).",
    inputSchema: {
      type: "object",
      properties: {
        nivel: { type: "string", enum: ["account", "campaign", "adgroup", "ad"], description: "padrão ad" },
        desde: { type: "string" }, ate: { type: "string" },
        contas: { type: "string", description: "IDs separados por vírgula (opcional)" },
        por_dia: { type: "boolean", description: "padrão true" },
        so_com_gasto: { type: "boolean", description: "padrão true" },
      },
      required: ["desde", "ate"],
    },
    run: async (env, a) => {
      const nivel = a.nivel || "ad";
      const dl = { account: "AUCTION_ADVERTISER", campaign: "AUCTION_CAMPAIGN", adgroup: "AUCTION_ADGROUP", ad: "AUCTION_AD" }[nivel];
      const idDim = { account: "advertiser_id", campaign: "campaign_id", adgroup: "adgroup_id", ad: "ad_id" }[nivel];
      const dims = a.por_dia === false ? [idDim] : [idDim, "stat_time_day"];
      const nomes = { account: ["advertiser_name"], campaign: ["campaign_name"], adgroup: ["campaign_name", "adgroup_name"], ad: ["campaign_name", "adgroup_name", "ad_name"] }[nivel];
      const metrics = [...nomes, "spend", "impressions", "clicks", "ctr", "cpc", "cpm", "conversion", "cost_per_conversion"];
      const out = [];
      for (const id of contas(env, a)) {
        const rows = await todasPaginas(env, "report/integrated/get", {
          advertiser_id: id, report_type: "BASIC", data_level: dl, dimensions: dims, metrics,
          start_date: a.desde, end_date: a.ate, ...(a.so_com_gasto === false ? {} : { filtering: [{ field_name: "spend", filter_type: "GREATER_THAN", filter_value: "0" }] }),
        });
        for (const r of rows) {
          const d = r.dimensions || {}, m = r.metrics || {};
          out.push({
            conta: id, dia: d.stat_time_day ? String(d.stat_time_day).slice(0, 10) : null, id: d[idDim],
            campanha: m.campaign_name, conjunto: m.adgroup_name, anuncio: m.ad_name,
            gasto: reais(m.spend || 0), impressoes: Number(m.impressions || 0), cliques: Number(m.clicks || 0),
            ctr: Number(m.ctr || 0), cpc: Number(m.cpc || 0), cpm: Number(m.cpm || 0),
            conversoes: Number(m.conversion || 0), custo_conversao: Number(m.cost_per_conversion || 0) || null,
          });
        }
      }
      return out;
    },
  },
  {
    name: "listar_campanhas",
    description: "Lista campanhas (id, nome, status, orçamento) das contas.",
    inputSchema: { type: "object", properties: { contas: { type: "string" }, status: { type: "string", description: "ex.: CAMPAIGN_STATUS_ENABLE (opcional)" } } },
    run: async (env, a) => {
      const out = [];
      for (const id of contas(env, a)) {
        const l = await todasPaginas(env, "campaign/get", { advertiser_id: id, ...(a.status ? { filtering: { primary_status: a.status } } : {}) }, 5);
        out.push(...l.map((c) => ({ conta: id, id: c.campaign_id, nome: c.campaign_name, status: c.operation_status, status_secundario: c.secondary_status, objetivo: c.objective_type, orcamento: c.budget, modo_orcamento: c.budget_mode })));
      }
      return out;
    },
  },
  {
    name: "listar_conjuntos",
    description: "Lista grupos de anúncios (adgroups), opcionalmente de uma campanha.",
    inputSchema: { type: "object", properties: { contas: { type: "string" }, campanha_id: { type: "string" } } },
    run: async (env, a) => {
      const out = [];
      for (const id of contas(env, a)) {
        const l = await todasPaginas(env, "adgroup/get", { advertiser_id: id, ...(a.campanha_id ? { filtering: { campaign_ids: [a.campanha_id] } } : {}) }, 5);
        out.push(...l.map((g) => ({ conta: id, id: g.adgroup_id, nome: g.adgroup_name, campanha_id: g.campaign_id, status: g.operation_status, status_secundario: g.secondary_status, orcamento: g.budget, modo_orcamento: g.budget_mode, lance: g.bid_price, otimizacao: g.optimization_goal })));
      }
      return out;
    },
  },
  {
    name: "listar_anuncios",
    description: "Lista anúncios, opcionalmente de um grupo de anúncios.",
    inputSchema: { type: "object", properties: { contas: { type: "string" }, conjunto_id: { type: "string" } } },
    run: async (env, a) => {
      const out = [];
      for (const id of contas(env, a)) {
        const l = await todasPaginas(env, "ad/get", { advertiser_id: id, ...(a.conjunto_id ? { filtering: { adgroup_ids: [a.conjunto_id] } } : {}) }, 5);
        out.push(...l.map((x) => ({ conta: id, id: x.ad_id, nome: x.ad_name, conjunto_id: x.adgroup_id, campanha_id: x.campaign_id, status: x.operation_status, status_secundario: x.secondary_status, texto: x.ad_text, video_id: x.video_id, url: x.landing_page_url })));
      }
      return out;
    },
  },
  {
    name: "pausar",
    description: "Pausa campanhas, grupos ou anúncios (livre; avisar o Othon em 1 linha).",
    inputSchema: { type: "object", properties: { conta: { type: "string" }, tipo: { type: "string", enum: ["campanha", "conjunto", "anuncio"] }, ids: { type: "array", items: { type: "string" } } }, required: ["conta", "tipo", "ids"] },
    run: (env, a) => mudarStatus(env, a, "DISABLE"),
  },
  {
    name: "ativar",
    description: "ATIVA campanhas, grupos ou anúncios. Bloqueado sem autorizacao_humana (regra inquebrável).",
    inputSchema: { type: "object", properties: { conta: { type: "string" }, tipo: { type: "string", enum: ["campanha", "conjunto", "anuncio"] }, ids: { type: "array", items: { type: "string" } }, autorizacao_humana: { type: "string" } }, required: ["conta", "tipo", "ids", "autorizacao_humana"] },
    run: async (env, a) => { const f = exigeAutorizacao(a, "Ativar"); return { autorizacao_registrada: f, resultado: await mudarStatus(env, a, "ENABLE") }; },
  },
  {
    name: "alterar_orcamento",
    description: "Altera o orçamento diário (na moeda da conta) de uma campanha ou grupo. Reduzir é livre; AUMENTAR exige autorizacao_humana.",
    inputSchema: { type: "object", properties: { conta: { type: "string" }, tipo: { type: "string", enum: ["campanha", "conjunto"] }, id: { type: "string" }, orcamento: { type: "number" }, autorizacao_humana: { type: "string" } }, required: ["conta", "tipo", "id", "orcamento"] },
    run: async (env, a) => {
      const camp = a.tipo === "campanha";
      const atual = await tt(env, "GET", camp ? "campaign/get" : "adgroup/get", { advertiser_id: a.conta, filtering: camp ? { campaign_ids: [a.id] } : { adgroup_ids: [a.id] } });
      const obj = (atual.list || [])[0];
      if (!obj) throw new Error("Objeto não encontrado nessa conta.");
      const antes = Number(obj.budget || 0), novo = reais(a.orcamento);
      let f = null;
      if (novo > antes) f = exigeAutorizacao(a, "Aumentar orçamento");
      const body = camp ? { advertiser_id: a.conta, campaign_id: a.id, budget: novo } : { advertiser_id: a.conta, adgroup_id: a.id, budget: novo };
      await tt(env, "POST", camp ? "campaign/update" : "adgroup/budget/update", camp ? body : { advertiser_id: a.conta, budget: [{ adgroup_id: a.id, budget: novo }] });
      return { ok: true, antes, depois: novo, autorizacao_registrada: f };
    },
  },
  {
    name: "consultar",
    description: "Leitura livre (GET) em qualquer endpoint da Business API v1.3, ex.: caminho 'campaign/get', parametros {advertiser_id:..., ...}.",
    inputSchema: { type: "object", properties: { caminho: { type: "string" }, parametros: { type: "object" } }, required: ["caminho"] },
    run: (env, a) => tt(env, "GET", a.caminho, a.parametros || {}),
  },
];

async function mudarStatus(env, a, op) {
  const ids = (a.ids || []).map(String);
  if (!ids.length) throw new Error("ids vazio");
  const [path, campo] = { campanha: ["campaign/status/update", "campaign_ids"], conjunto: ["adgroup/status/update", "adgroup_ids"], anuncio: ["ad/status/update", "ad_ids"] }[a.tipo] || [];
  if (!path) throw new Error("tipo inválido");
  return tt(env, "POST", path, { advertiser_id: a.conta, [campo]: ids, operation_status: op });
}

// ---------------------------------------------------------------- MCP (JSON-RPC)

const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

async function handleRpc(env, msg) {
  const { id, method, params } = msg;
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  const fail = (code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });
  switch (method) {
    case "initialize": {
      const v = PROTOCOL_VERSIONS.includes(params && params.protocolVersion) ? params.protocolVersion : PROTOCOL_VERSIONS[0];
      return ok({ protocolVersion: v, serverInfo: SERVER_INFO, capabilities: { tools: { listChanged: false } },
        instructions: "Conector TikTok Ads da N3w. Pausar e reduzir são livres. Ativar e aumentar orçamento exigem autorizacao_humana com a frase do Othon. Valores na moeda da conta (BRL)." });
    }
    case "ping": return ok({});
    case "tools/list": return ok({ tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case "tools/call": {
      const t = TOOL_MAP[params && params.name];
      if (!t) return fail(-32602, `Ferramenta desconhecida: ${params && params.name}`);
      try {
        const data = await t.run(env, (params && params.arguments) || {});
        return ok({ content: [{ type: "text", text: JSON.stringify(data, null, 1) }] });
      } catch (e) {
        const info = e instanceof TikTokError ? e.toJSON() : { erro: String(e.message || e) };
        return ok({ isError: true, content: [{ type: "text", text: JSON.stringify(info, null, 1) }] });
      }
    }
    default:
      if (method && method.startsWith("notifications/")) return null;
      return fail(-32601, `Método não suportado: ${method}`);
  }
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE" };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (url.pathname === "/" || url.pathname === "/saude") {
      return Response.json({ ok: true, servidor: SERVER_INFO, api: env.API_VERSION, token_configurado: !!env.TIKTOK_TOKEN, chave_configurada: !!env.CONNECTOR_KEY, chave2_configurada: !!env.CONNECTOR_KEY_2, contas: (env.ADVERTISER_IDS || "").split(",").filter(Boolean).length }, { headers: CORS });
    }
    const m = url.pathname.match(/^\/mcp(?:\/([^/]+))?\/?$/);
    if (!m) return new Response("not found", { status: 404 });
    const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const chaves = [env.CONNECTOR_KEY, env.CONNECTOR_KEY_2].filter(Boolean);
    if (!chaves.length || !chaves.some((k) => safeEqual(m[1] || "", k) || safeEqual(bearer, k))) return new Response("unauthorized", { status: 401, headers: CORS });
    if (request.method === "GET") return new Response("method not allowed", { status: 405, headers: { ...CORS, Allow: "POST" } });
    if (request.method === "DELETE") return new Response(null, { status: 204, headers: CORS });
    if (request.method !== "POST") return new Response("method not allowed", { status: 405, headers: CORS });
    if (!env.TIKTOK_TOKEN) return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "TIKTOK_TOKEN não configurado no Worker" } }, { headers: CORS });
    let body;
    try { body = await request.json(); } catch { return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON inválido" } }, { status: 400, headers: CORS }); }
    const batch = Array.isArray(body);
    const results = (await Promise.all((batch ? body : [body]).map((msg) => handleRpc(env, msg)))).filter(Boolean);
    if (!results.length) return new Response(null, { status: 202, headers: CORS });
    return Response.json(batch ? results : results[0], { headers: { ...CORS, "Content-Type": "application/json" } });
  },
};

export { TOOLS, handleRpc };
