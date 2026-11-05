// Cloudflare Pages: site estático + /painel (Painel Tarô, só leitura, com login).
// O login é conferido na edge "painel-tarot" do Supabase; aqui não há senha nem segredo.
const EDGE = 'https://cdtfglylekiyxdmrgbne.supabase.co/functions/v1/painel-tarot';
async function edge(auth, body) {
  return fetch(EDGE, { method: 'POST', headers: { 'content-type': 'application/json', authorization: auth || '' }, body: JSON.stringify(body) });
}
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
      const r = await edge(auth, await request.json().catch(() => ({})));
      return new Response(r.body, { status: r.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }
    const ping = await edge(auth, { tipo: 'ping' });
    if (ping.status !== 200) return pedeLogin();
    const page = await env.ASSETS.fetch(new Request(new URL('/painel/', url), { method: 'GET' }));
    const h = new Headers(page.headers); h.set('cache-control', 'no-store'); h.set('x-robots-tag', 'noindex'); h.delete('etag');
    return new Response(page.body, { status: page.status, headers: h });
  },
};
