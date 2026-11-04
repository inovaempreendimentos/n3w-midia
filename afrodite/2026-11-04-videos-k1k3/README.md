# Vídeos K1/K3 · Afrodite Tarot · 04/11/2026

Vídeos feitos a partir dos estáticos K3 (ROAS 6,2) e K1 (ROAS 5,1). Montagem por código (Pillow + ffmpeg), 0 crédito de IA, sem voz.

- `src/` estáticos originais (baixados do anúncio 120255611746740558 e 120255611744870558)
- `assets/` cartas recortadas + print do depoimento (`gen_assets.py`)
- `gen_videos.py <VAR> <916|45>` gera cada vídeo; `out/` = 12 arquivos (6 variações × 9:16 e 4:5)

Roteiro (12 s): 0 s pergunta + 3 cartas viradas para baixo · 1–3,7 s cartas viram uma a uma com nome e sentido · 4,7 s depoimento · 6,6 s "tarô a partir de R$20,00" · 9,3 s CTA "Toque em Enviar mensagem e faça sua pergunta".
9:16: nada essencial nos 250 px de cima e de baixo.

| Código | Muda | Detalhe |
|---|---|---|
| K3A | base | "Meu ex vai voltar?", preto, Imperatriz → Imperador → Roda |
| K3B | gancho | "Ele ainda pensa em mim?" |
| K3C | ordem | Roda → Imperatriz → Imperador |
| K1A | base | "Meu ex vai voltar?", preto, Enamorados → 2 de Copas → Estrela |
| K1B | gancho | "Ele vai voltar pra mim?" |
| K1C | cor | caixas roxas |

Status: aguardando aprovação do Othon (painel https://claude.ai/artifact/8FoyrBBoJSjbR3JqiAXXa8).
