# CLAUDE.md — Portela Culture

Regras estáveis do projeto: @AGENTS.md
Este arquivo só acrescenta disciplina de contexto e tokens. Mantenha-o curto (meta: menos de 60 linhas).

## Arquivos que nunca se abrem inteiros
- `worker/catalog-assets.json` (~1,2 milhão de tokens), `public/catalogo.json` (~500 mil), `worker/catalog.json` (~90 mil).
- Para consultar o catálogo: `node scripts/catalogo-consulta.mjs PC-021` · `--busca "air force"` · `--marca Adidas --categoria roupas --contar` · `--resumo`.
- Para mudar o catálogo: script que lê, altera e grava (ex.: `scripts/aplicar-v8-cat.mjs`), nunca edição manual do JSON.
- Imagens (`public/media/**`): não abrir para "ver"; usar a lista de fotos do produto.

## Verificação barata
- Testes: `npm run test:resumo` (só totais e falhas). Use `npm test` completo só para investigar uma falha.
- Build: `npm run build` · Artefato: `node scripts/validate-artifact.mjs` · Diff: `git diff --check`.

## Começo de sessão (passagem de bastão)
1. Ler primeiro o estado curto do projeto, se existir: `docs/ESTADO-ATUAL.md` (missão, branch, o que falta). Não ler logs longos inteiros; usar só o fim deles.
2. Confirmar branch e últimos commits com `git status -sb` e `git log --oneline -5`.

## Instruções para compactação
Ao compactar, preserve: branch e commit atuais, arquivos alterados, comandos de verificação com o resultado,
decisões do Daniel e pendências. Descarte: saídas longas de testes, listagens de catálogo e conteúdo de imagens.

## Subagentes
- Use subagente para leitura volumosa (livros, logs, auditorias) e peça só a síntese de volta.
- Quem implementa não valida o próprio trabalho: verificação em passo separado, com evidência (comando + resultado).
