# V8 — Resultado (14/10/2026)

Worktree `PORTELA-RELEASE-20261014`, branch `feature/organizacao-vitrine-20261014`. Sem commit, push, merge ou deploy. Nenhum JSON de catálogo, preço, `worker/` ou configuração foi alterado.

## Arquivos
- **Alterado** `public/index.html`: nova `<section id="destaques">` ("Destaques Portela" / "Mais para explorar.") logo após `#selecao` e antes de `#catalogo`; poucas regras CSS (`.featured`, foco visível, 2 colunas ≤820px); `catalogo.js?v=20` → `?v=21`.
- **Alterado** `public/catalogo.js`: +2 linhas. Lista só os 12 IDs da V7 e monta os cards a partir dos objetos de `catalogo.json` (sem duplicar dados), no mesmo padrão do `#curated`: `<button>` nativo, `loading="lazy"`, `alt` = nome + referência, `aria-label` com nome/marca/ID, marca · PC-ID, nome, "Ver detalhes". O clique chama o `showProduct` existente (mesmo WhatsApp, tamanho/cidade opcionais e `?produto=`).
- **Preservado sem mudança:** "Três pontos de partida" (`PC-001/003/214`), manifesto, categorias, filtros, URLs, fluxo WhatsApp. Sem preço, sem gênero, sem métricas.
- **Novo** `tests/v8-destaques.test.mjs` (3 testes), `docs/materiais-vitrine/story-bones-1080x1920.html`, `docs/materiais-vitrine/feed-camisas-1080x1350.html`, este relatório.
- Já existiam não rastreados: `docs/ORDEM-*.md`, `docs/V7-RESULTADO.md`, `tests/v7-catalog-integrity.test.mjs`.

## Testes (execução fresca)
- `npm.cmd test`: **83 testes, 83 passaram** (80 anteriores + 3 novos: 12 IDs/ordem/capas/lazy/alt/clique; seção aditiva e anterior intacta; sem preço/gênero/claims).
- `npm.cmd run build`: concluído ("Built Worker, catalog assets and D1 migrations").
- `git diff --check`: limpo.
- **QA no navegador** (`@playwright/cli` global já instalado, Edge; preview local `scripts/preview.mjs`, SQLite em memória):

| Viewport | Cards | "Três pontos" intacto | Overflow horizontal | Colunas |
|---|---|---|---|---|
| 1440 | 12 | sim (3 cards) | não | 3 |
| 390 | 12 | sim | não | 2 |
| 320 | 12 | sim | não | 2 |

  Abertura por teclado (foco + Enter) no card PC-355: diálogo correto, "Referência PC-355", link WhatsApp com `?produto=PC-355`. Escape fecha. `loading=lazy` em todas as imagens.

## Imagens
- Locais (6 tênis): carregam em todos os viewports.
- **6 capas (PC-2747, 1679, 2857, 462, 474, 2809) retornam 404 no preview local**, porque não existem em disco (estão registradas em `worker/catalog-assets.json` e vêm do R2 no ambiente real). É a causa dos 2 erros de console (404). A ChatGPT confirmou 200 `image/webp` dessas capas no site público; **eu não consegui reverificar**: não há URL pública no repositório e não a presumi.
- Falha graciosa: sem a imagem, o card mantém nome, marca e referência.

## Materiais visuais (Tarefa B) — não postados
Sem `node_modules`: **sharp não está instalado**, então não gerei PNG. Sem a URL pública também não baixei nenhuma foto (zero downloads). Entreguei HTMLs de referência (1080×1920 Story de bonés com PC-2747/1679/2857/462; 1080×1350 feed de camisas com PC-474/2809), fundo `#050505`, dourado `#B8965A/#E1C98D`, sem preços nem promessas (rodapé: "Disponível sob encomenda · Consulte pelo WhatsApp", texto já usado no site). Renderizados e sem estouro de quadro. Para carregar as fotos reais: abrir com `?base=https://URL-PUBLICA-DO-SITE/`; sem isso mostram só a referência. As camisas PC-414 e PC-460 citadas pela ChatGPT **não** estão na seleção V7 de 12 e ficaram de fora; incluir exige sua confirmação.

## Tarefa D — como publicar (leitura apenas)
- `.openai/hosting.json` liga este código ao projeto Sites `appgprj_6ab421b9a2e881918220650051ac841a` (D1 `DB`, R2 `BUCKET`). O `origin` Git (`danielobede20-pixel/PORTELACULTURE`) é só repositório/CI (`.github/workflows/ci.yml` roda verificação, **não** faz deploy).
- Publicar no ChatGPT Sites é uma ação separada, feita pela ferramenta/plugin Sites do ChatGPT sobre a história nativa do projeto (v21 publicada, fonte `276f6e23…`). Os documentos do repo (`V5-RESGATE-PRODUCAO.md`, `SITES-PREPUBLICACAO-20261013.md`) dizem o mesmo: **um push no GitHub não atualiza o Sites** e a ferramenta Sites esteve indisponível em sessões anteriores. Não existe aqui comando de deploy verificado; não tentei.
- Não consegui verificar por leitura se `main` e o Sites estão sincronizados com esta branch.

## Limitações
- Capas de R2 não vistas por mim; QA de imagens remotas pendente.
- Não testei no navegador: filtros/quiz/menu completos do checklist `PLAYWRIGHT-QA.md` (só os fluxos afetados acima), nem reduced-motion.
- Sem PNG (sharp ausente). Aprovação visual das peças e da lista de 12 pendente.

## Recomendação
Pode ir para revisão do diff (`git diff`) e commit na branch. **Não publicar** antes de: (1) conferir as 6 capas de R2 com a URL pública no ambiente real (ou preview com R2); (2) aprovar visualmente a seção; (3) fazer o deploy pelo fluxo oficial do Sites, nunca por push, com os mesmos D1/R2.
