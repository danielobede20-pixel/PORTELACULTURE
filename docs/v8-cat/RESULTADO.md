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
- Botão flutuante: em 320/360px ele ainda passa por cima de parte de um card durante a rolagem (é fixo). Ficou menor e o fim da página tem espaço reservado. Eliminar 100% exige decisão de design (ex.: esconder ao rolar para baixo).

## Pontos para o ChatGPT/Daniel
- Vitrine "Destaques" usa PC-1679 como boné; ele é moletom. Continua exibido corretamente como Adidas, mas o texto "Tênis, bonés e camisas" e a arte `docs/materiais-vitrine/story-bones-1080x1920` (não publicada) usam esse item como boné. Sugestão: trocar por um boné Adidas real.
- Publicação: aplicar a branch sobre a fonte atual do Sites (ChatGPT, após 18:40). Reversão = versão 23.
