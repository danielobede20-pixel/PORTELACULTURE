# Restauro Portela Culture — entrega 17/10/2026 (Claude)

Status: PRONTO PARA APROVAÇÃO. NADA FOI PUBLICADO.

## Local
- Projeto: C:\Users\danie\Documents\PORTELA-RESTAURO-13OUT-20261017 (worktree do repo C:\Users\danie\Documents\PORTELA-CULTURE)
- Branch: restauro/visual-13out-20261017 (local, sem push). Base: 8446bf3 (14/10) com visual de 8b3c2c0 (13/10).
- Build de produção: dist\ (node scripts/build.mjs)
- main, backups e demais worktrees: não alterados.

## Commits
1. 7fe30a7 — trabalho do Codex 17/10: remove seção Destaques (14/10) do index.html.
2. c53ef1b — remove código morto de Destaques no catalogo.js; rel=noopener em 2 links; catalogo.js v23; teste do visual 13/10; script de validação.
3. (final) — abertura em WebP (2,2 MB → 299 KB desktop / 107 KB celular) com PNG original como fallback; CSS v6; teste.

## Evidências
- Testes: 93/93 (antes: 88/90, as 2 falhas eram da seção Destaques removida).
- Catálogo: 2.818 produtos, idênticos entre public e worker, 0 IDs duplicados, 0 campos vazios. 2.815 visíveis (3 acessórios Alo ocultos por regra já existente em catalogo-core.js).
- Fotos: 34.346 referências; 2.331 no disco; 32.015 no armazenamento do site. Amostra ao vivo: 2.525/2.525 OK (todas as capas fora do disco + 200 aleatórias), bytes iguais ao registro.
- Links: 0 âncoras quebradas, 1 número de WhatsApp, todos os target=_blank com noopener.
- Navegador (prévia local): seções na ordem de 13/10, sem Destaques, sem rolagem horizontal em 375 px; abertura com mesmo tamanho renderizado antes/depois.
- Validação reproduzível: node scripts/validar-restauro.mjs

## Pendências
- Publicar no ChatGPT Sites (exige autorização do Daniel).
- No ar hoje: catalogo.js v20 (versão 13/10, sem o fallback de imagem e sem a perfumaria no quiz).
