// Cloudflare Pages: site estático + /painel (Painel Tarô, só leitura, com login).
// O login é conferido na edge "painel-tarot" do Supabase; aqui não há senha nem segredo.
const EDGE = 'https://cdtfglylekiyxdmrgbne.supabase.co/functions/v1/painel-tarot';
async function edge(auth, body) {
  return fetch(EDGE, { method: 'POST', headers: { 'content-type': 'application/json', authorization: auth || '' }, body: JSON.stringify(body) });
}
async function sha(t) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
function pedeLogin() {
  return new Response('Login necessário.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Painel Taro", charset="UTF-8"', 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/painel')) return env.ASSETS.fetch(request);
    const auth = request.headers.get('authorization') || '';
    if (!/^Basic /i.test(auth)) return pedeLogin();
    if (request.method === 'POST' && url.pathname === '/painel/api/d') {
      const body = await request.json().catch(() => ({}));
      // leituras da Meta: uma consulta serve todo mundo por 4 min (menos chamadas = menos "código 17")
      if (body.tipo === 'meta' && !body.fresh) {
        const chave = new Request('https://cache.painel/meta/' + await sha(JSON.stringify([body.caminho, body.parametros || {}])));
        const hit = await caches.default.match(chave);
        if (hit) return hit;
        const r = await edge(auth, body);
        const txt = await r.text();
        let ok = r.status === 200; try { const jx = JSON.parse(txt); if (jx && (jx.error || jx.erro)) ok = false; } catch (_) { ok = false; }
        const res = new Response(txt, { status: r.status, headers: { 'content-type': 'application/json', 'cache-control': ok ? 'public, max-age=240' : 'no-store' } });
        if (ok) await caches.default.put(chave, res.clone());
        return res;
      }
      const r = await edge(auth, body);
      return new Response(r.body, { status: r.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }
    const ping = await edge(auth, { tipo: 'ping' });
    if (ping.status !== 200) return pedeLogin();
    const page = await env.ASSETS.fetch(new Request(new URL('/painel/', url), { method: 'GET' }));
    const h = new Headers(page.headers); h.set('cache-control', 'no-store'); h.set('x-robots-tag', 'noindex'); h.delete('etag');
    return new Response(page.body, { status: page.status, headers: h });
  },
};
