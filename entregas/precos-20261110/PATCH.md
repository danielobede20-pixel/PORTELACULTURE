# Entrega: novos preços (10/11/2026)

Aprovado pelo Daniel em 10/11/2026. Muda só preço. Nenhum produto entra ou sai, nenhum nome, foto ou ID muda.

## Base
- Feito sobre o que está no ar: `catalogo.json?v=27` (2.849 itens), `catalogo.js?v=39`, `vitrine.js?v=3`.
- Esta branch serve só para transportar o arquivo. Não faça merge no main.

## O que aplicar na fonte atual do Sites
1. Substituir `public/catalogo.json` pelo arquivo `entregas/precos-20261110/catalogo.json` desta branch.
2. `public/catalogo.js`: BUSCAR `catalogo.json?v=27` e SUBSTITUIR por `catalogo.json?v=28` (1 ocorrência).
3. `public/vitrine.js`: BUSCAR `catalogo.json?v=27` e SUBSTITUIR por `catalogo.json?v=28` (1 ocorrência).
4. `public/index.html`: BUSCAR `catalogo.js?v=39` e SUBSTITUIR por `catalogo.js?v=40` (1 ocorrência).
5. `public/index.html`: BUSCAR `vitrine.js?v=3"` e SUBSTITUIR por `vitrine.js?v=4"` (1 ocorrência).

Se alguma âncora não aparecer exatamente 1 vez, pare e avise. Não sobrescreva outros arquivos.

## Critérios de aceite (no ar)
- `catalogo.json?v=28` responde 200, com 2.849 itens e IDs únicos.
- Tênis entre R$ 429,90 e R$ 699,90. Roupas entre R$ 159,90 e R$ 399,90.
- "Em destaque" (10 cards, preço lido do catálogo por ID): AF1 Branco PC-021 R$ 599,90 · Dunk PC-065 R$ 599,90 · NB 530 PC-214 R$ 549,90 · AF1 Wheat PC-351 R$ 599,90 · Samba PC-357 R$ 549,90 · GEL-1130 PC-363 R$ 549,90 · Khamrah PC-900001 R$ 259,90 · Asad PC-900002 R$ 239,90 · Mayar PC-900016 R$ 209,90 · Le Male PC-900023 R$ 479,90.
- 0 erro de JS em 1440 px e 390 px.

## O que não muda
Layout, textos, fotos, WhatsApp, D1/R2, Worker.
