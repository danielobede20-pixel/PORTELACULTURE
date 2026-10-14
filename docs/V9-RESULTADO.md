# V9 — Resultado (14/10/2026)

Branch `feature/organizacao-vitrine-20261014`, base HEAD 71b091e. **Nada commitado, mergeado, enviado ou publicado.**

## Plano executado
1. Fallback local de imagem (SVG neutro, escuro/dourado, sem dados de fornecedor).
2. Rádio "Perfumaria" no grupo `category` do quiz.
3. Sufixo da query do catálogo `v=20` → `v=21` (JSON e `cache:'no-cache'` intocados).
4. Testes + build + validação + QA Playwright.

## Arquivos
| Arquivo | Mudança |
|---|---|
| `public/media/imagem-indisponivel.svg` | novo, 960×960, `role="img"` + `aria-label` |
| `public/catalogo.js` | listener `error` em captura (escopo `.products, .thumbs, #produto`); `catalogo.json?v=21` |
| `public/index.html` | `<input type="radio" name="category" value="perfumaria">` |
| `tests/v9-fallback-quiz.test.mjs` | novo, 7 testes |

Comportamento do fallback: troca o `src` da imagem quebrada pela SVG local e acrescenta " (imagem indisponível)" ao `alt`. Sem loop: se o `src` já é o fallback, o handler sai. Imagem real válida nunca é tocada; ao trocar miniatura, a imagem principal volta a poder cair no fallback (guard por `src`, não por flag). O `src` de fornecedor não é exposto.

`conversao-core.js`, `worker/*`, catálogo JSON, `r2`, IDs, preços e filtro de marca **não foram alterados** (labels e `choices.category` já aceitavam perfumaria).

## Evidências (execução real)
- `npm.cmd test`: **90 testes, 90 pass, 0 fail** (inclui 7 novos).
- `npm.cmd run build`: OK.
- `node scripts/validate-artifact.mjs`: OK (ESM válido, 2818 produtos verificados, rota de IA falha fechada).
- `git diff --check`: sem erros (apenas aviso LF→CRLF do git).
- Playwright (chromium headless 1208, preview local porta 8795, DB disponível), em 1440×900, 390×844 e 320×700 — 33/33 checks PASS:
  - imagens abortadas na rede → fallback carregado (naturalWidth>0), cards, destaques, detalhe e miniaturas;
  - clique em miniatura funciona; campos tamanho/cidade aceitam entrada; rascunho WhatsApp mantém o produto (PC-…);
  - quiz com Perfumaria: resumo mostra "Categoria: Perfumaria"; texto do WhatsApp contém "Categoria: Perfumaria"; fecha corretamente;
  - sem overflow horizontal; sem erro JS crítico.
  - Os 19 erros de "resource" por viewport ignorados no check são as requisições de imagem que **eu mesmo abortei** de propósito para forçar o fallback; erros de JS (`pageerror`) = 0.
- Worker aceita `quiz.category='perfumaria'` (teste no D1 em memória: 201 + valor persistido). Produção/banco real não tocados.

## Não coberto / limitações
- QA de busca, filtros de marca, menu e dead routes **não foi reexecutado** nesta etapa (fora do escopo das mudanças); o QA anterior do ChatGPT cobre.
- Teste do handler usa DOM simulado (Node) + Playwright real; sem teste visual (screenshot) do fallback.
- Porta 8791 já estava ocupada por outro processo; não mexi nele e usei 8795 (preview encerrado).
- FAQ não alterada (não necessária).

## Riscos
- Baixo. `alt` ganha sufixo para leitor de tela quando a imagem falha (intencional). O SVG usa fontes do sistema/Manrope se disponível.
- Cache: `catalogo.js?v=21` já era o sufixo do script; como o JS mudou, **o `?v=` do `<script src="catalogo.js">` deveria subir para 22** para forçar navegadores com cache a pegar o handler — não alterei por não estar na ordem; decisão do ChatGPT.

## Condição de publicação
Revisão do diff pelo ChatGPT/Daniel → commit → deploy autorizado. Recomendo decidir o bump `catalogo.js?v=22` antes.

## Validação complementar do ChatGPT — 14/10/2026
- Aprovada a correção adicional de cache sugerida pelo Claude: `catalogo.js?v=21` -> `catalogo.js?v=22` no HTML para garantir atualização do script nos navegadores. `catalogo.json?v=21` permanece, sem mudança de JSON nem de política de cache. Teste V9 sincronizado.
- Testes novamente executados após o ajuste: `npm.cmd test` 90/90, `npm.cmd run build` OK, `node scripts/validate-artifact.mjs` OK (2818 produtos), `git diff --check` limpo.
- QA de navegação independente ChatGPT (preview local com D1 em memória, 1440/390/320): 51/51, incluindo menus, filtros, perfumaria, quiz, WhatsApp e galeria. O primeiro ciclo, intencionalmente com DB desativado, gerou respostas 503 esperadas; a reexecução com DB em memória eliminou esses avisos. Não houve bug de filtro Nike: existem produtos Nike em calçados e roupas.
- 12/12 capas da vitrine com HTTP 200 no domínio público; arquivos reais preservados. QA específico do Claude: 33/33 ao simular falhas de rede e validar fallback, após a qual foram feitos os ajustes apenas no sufixo do script e no teste correspondente.
- Banco de produção, R2, preços, catálogo JSON e branch main intocados. Publicação depende de acesso ao fluxo oficial do ChatGPT Sites; push GitHub não publica o projeto Sites.
