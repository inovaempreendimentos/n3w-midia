# N3w TikTok — conector MCP próprio (TikTok Business API v1.3)

Substitui o Windsor no TikTok. Mesmo modelo do `n3w-meta-mcp`: Cloudflare Worker, MCP sem estado, URL `https://n3w-tiktok.<sub>.workers.dev/mcp/<CONNECTOR_KEY>`.

Ferramentas: `contas`, `relatorio` (gasto/impressões/cliques/CTR/conversões por dia e nível), `listar_campanhas`, `listar_conjuntos`, `listar_anuncios`, `pausar` (livre), `ativar` (exige autorizacao_humana), `alterar_orcamento` (reduzir livre; aumentar exige autorizacao_humana), `consultar` (GET livre).

Contas padrão (wrangler.toml): 7702236482601238529 (Astral Afrodite - Tarô), 7702235971634528308 (N3W DIGITAL).

## Como ligar (o que só o Othon faz)
1. **App de desenvolvedor**: https://business-api.tiktok.com/portal → criar app "N3W Conector" com escopos de leitura de relatórios e gestão de anúncios (Ads Management, Reporting). Aguardar aprovação.
2. **Autorizar as 2 contas de anúncio** no link de autorização do app → copiar o **Access Token** (longo prazo).
3. **Cloudflare** → Workers & Pages → Create → Worker `n3w-tiktok` (ou Workers Builds ligado a este repo com Root directory `ferramentas/n3w-tiktok-mcp`) → Settings → Variables: `TIKTOK_TOKEN` (Secret), `CONNECTOR_KEY` e `CONNECTOR_KEY_2` (Secret, chaves longas aleatórias).
4. **claude.ai** → Conectores → Adicionar conector personalizado: nome `N3w TikTok`, URL `https://n3w-tiktok.othon-rdss.workers.dev/mcp/<chave>`.
5. Testar: `https://n3w-tiktok.othon-rdss.workers.dev/saude` deve mostrar `token_configurado: true`.

## Rotina sem Claude
O Supabase chama este Worker de hora em hora (pg_cron + net.http_post com tools/call `relatorio`) e grava em `tt_anuncio_dia` — a montar quando o Worker estiver no ar.
