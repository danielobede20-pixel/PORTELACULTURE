# V8-CAT — Resultado (14/10/2026)

Branch `feature/v8-cat-20261014` = 8446bf3 (vitrine no ar, v23) + V7 (6ea59ae, nomes) + V8-CAT. **Não publicado.**

## O que mudou
- **33 produtos / 35 campos**, todos em `manifesto.json` / `manifesto.csv` com antes, depois, fotos do próprio produto e justificativa. Aplicados por `scripts/aplicar-v8-cat.mjs` (confere o valor "antes" e é idempotente) em `public/catalogo.json` e `worker/catalog.json`.
  - 24 marcas: 3 Adidas→Nike (PC-1553/1554/1555) e 21 Nike→Adidas (roupas com logo/trevo/3 listras Adidas).
  - PC-021: linha `Air Force 1 Low` (lingueta "Air Force 1"); antes caía em "Outros modelos" após a V7.
  - PC-1679: acessorios/Bonés → roupas/Moletons (as 41 fotos são o moletom Adidas x Mercedes-AMG F1).
  - Linhas: PC-2209 e PC-2260 → Moletons; PC-2217 → Calças; PC-2821 → Moletons; PC-2592 e PC-2593 → Faixas de cabeça.
  - PC-2599 (balaclavas): roupas/Camisetas → acessorios/Balaclavas.
- Famílias Dunk da V7 conferidas por foto e mantidas: PC-001 e PC-016 = Dunk Low (caixa vermelha, lingueta Nike); PC-165/176/191/193/207 = Dunk SB (lingueta "SB Dunk Low Pro", caixa roxa).
- Celular ≤360px: botão WhatsApp compacto (altura mínima de 44px) e 76px de espaço no fim do conteúdo.
- Testes: teste V7 obsoleto corrigido; travas de baseline aceitam exceções só pelo manifesto, campo a campo; 7 testes novos em `tests/v8-cat.test.mjs`.

## Verificação
- `node --test`: 98/98. Build OK. `validate-artifact`: OK (2818 produtos). `git diff --check`: limpo.
- QA em preview local (Chromium): 32/32 em 1440/390/360/320px. Destaques 12 cards, sem overflow, PC-021 na família Air Force 1 Low, PC-1950 em Adidas > Camisetas, PC-1679 em Adidas > Roupas > Moletons, modal e WhatsApp com referência, sem pageerror. Detalhes em `qa-preview.json`.
- Fotos do R2 não carregam no preview local (fallback aparece); a checagem visual delas foi feita nas fotos do site no ar.

## Não feito / duvidoso (não alterado)
- 17 linhas com nome "brando" (ex.: blusas em Camisetas, conjuntos Tech Fleece em Jaquetas/Calças, viseira em Bonés). Aceitáveis; não alterei sem critério do coordenador.
- Os "19 possíveis duplicados" e as listas antigas de 67/74/99 não existiam em arquivo; refiz a auditoria por critérios objetivos (marca no nome × campo marca; tipo de peça × categoria/linha) e conferi cada caso por foto.
- Botão flutuante sobre cards ao rolar: resolvido na 2ª entrega (abaixo).

## 2ª entrega (decisões do Daniel, 14/10)
- Vitrine Destaques: PC-1679 (moletom) trocado por **PC-1706 — Adidas Boné Trefoil** (trevo e escrita "adidas" nas fotos). Arte `docs/materiais-vitrine/story-bones-1080x1920` atualizada e PNG regerado com as fotos do site (4/4 carregadas). Não postar sem aprovação.
- Botão WhatsApp em telas até 820px: some ao rolar para baixo (após 160px) e volta ao rolar para cima, no topo, no fim da página ou ao receber foco. Usa opacidade/visibilidade, sem transform, então o modo de movimento reduzido continua funcionando. Desktop não muda.
- `catalogo.js?v=23` para os navegadores pegarem o script novo.
- Verificação: 100/100 testes, build OK, validate-artifact OK, diff --check limpo. QA preview 53/53 (1440/390/360/320): vitrine com PC-1706, sem overflow, botão some/volta/aparece no fim, menu, quiz abre/conclui com Perfumaria/fecha, produto corrigido com tamanho e cidade no WhatsApp, imagem quebrada usa fallback, rota inexistente tratada, sem erro crítico. Detalhes em `qa-preview-2.json`.

## Para o ChatGPT
- Revisar manifesto e este relatório; aplicar a branch sobre a fonte atual do Sites; deploy; QA de produção. Reversão = versão 23.
