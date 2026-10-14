# V7 — Resultado (14/10/2026)

Worktree `PORTELA-RELEASE-20261014`, branch `feature/organizacao-vitrine-20261014`, HEAD 5cf0c72. Sem commit, push, merge ou deploy. Não está validado em navegador nem publicado.

## Arquivos alterados
- **Novo:** `tests/v7-catalog-integrity.test.mjs` (4 testes).
- **Novo:** `docs/V7-RESULTADO.md` (este arquivo).
- `public/`, `worker/` e `catalogo.json`: **nenhuma alteração**. Nenhum preço, foto, nome ou categoria foi tocado.
- `docs/ORDEM-CHATGPT-20261014.md` já estava não rastreado antes desta etapa.

## Objetivo 1 — nomes duplicados: já resolvido na interface, sem mudança de código
Auditoria de `public/catalogo.js`:
- **Card** (`render`): `<p>` com `p.id` (PC-…) acima do `<h3>` com o nome original; `aria-label` e `alt` também levam o ID.
- **Detalhe** (`showProduct`): linha "Referência PC-…" sob o título; o link do produto usa `?produto=PC-…`.
- **Cards da home** (`#curated`): `PC-… · Disponível sob encomenda`.
- Nenhum CSS oculta essas linhas.

Medição em `catalogo.json`: 206 grupos de mesma marca + categoria + nome, somando 2.669 itens (bate com o `nomes-duplicados.csv` da V6). Dentro de cada grupo os IDs são distintos. Como a referência já aparece sempre, sem condição, em todos os cards e no detalhe, mostrá-la só para duplicados seria mudança inútil e criaria inconsistência visual. Por isso não alterei nada.

Limite: o teste verifica o código-fonte do `catalogo.js` (regex), não o DOM renderizado, porque o projeto não tem navegador/DOM de teste instalado. A conferência visual em navegador (`docs/PLAYWRIGHT-QA.md`) **não foi feita**.

## Objetivo 2 — vitrine curada na home: NÃO integrada; só plano e seleção
Motivos para não forçar:
1. A seção atual `#selecao` ("Três pontos de partida") é aprovada e lista `PC-001`, `PC-003`, `PC-214` em `catalogo.js`; trocar por 12 itens muda o texto e a hierarquia da home.
2. Bonés e camisas não têm foto local (0 de 492 arquivos locais). Estão registrados em `worker/catalog-assets.json` (servidos via R2), mas não pude ver as imagens; a V6 também não as conferiu visualmente.
3. **Gênero:** nenhum item de tênis, boné ou roupa tem campo `genero` (só perfumaria tem). Masculino/feminino não está confirmado para nenhum dos itens abaixo, então não foi atribuído.

Seleção de IDs (todos existem, marca/categoria conferidas pelo teste; nomes e linhas exatamente como no catálogo):

| Grupo | ID | Nome | Marca | Linha |
|---|---|---|---|---|
| Tênis | PC-351 | Nike Air Force 1 Low — Wheat | Nike | Air Force 1 Low |
| Tênis | PC-355 | Adidas Superstar Lo Pro — Branco e preto | Adidas | Superstar Lo Pro |
| Tênis | PC-214 | New Balance 530 | New Balance | 530 |
| Tênis | PC-362 | ASICS GEL-1130 | ASICS | GEL-1130 |
| Tênis | PC-368 | On Running Cloudtilt | On | Cloudtilt |
| Tênis | PC-374 | Vans Authentic 44 | Vans | Authentic 44 |
| Boné | PC-2747 | Nike — Boné | Nike | Bonés |
| Boné | PC-1679 | Adidas — Boné | Adidas | Bonés |
| Boné | PC-2857 | On — Boné | On | Bonés |
| Boné | PC-462 | Gucci — Boné | Gucci | Boné |
| Camisa | PC-474 | Gucci — Polo | Gucci | Polo |
| Camisa | PC-2809 | Nike — Camisa de manga longa | Nike | Camisas |

Os 6 tênis têm foto local (V6). Se a vitrine precisar de uma única linha de boné, escolher 1 dos 4.

Plano técnico (menor diff, sem refatoração):
1. Em `public/catalogo.js`, trocar o array `['PC-001','PC-003','PC-214']` pela lista aprovada. O card reutiliza `showProduct`, WhatsApp e o estilo `.product-card`/`.curated` existentes.
2. Ajustar em `public/index.html` o título "Três pontos de partida" e subir o `?v=` do `catalogo.js`.
3. Em mobile, `.curated` já vira lista em 1 coluna; com 12 itens, considerar limitar a 6 visíveis ou 2 colunas.
4. Antes de publicar: aprovação visual de cada capa de boné/camisa (R2), QA Playwright (390px/320px, imagens quebradas, overflow) e decisão do usuário sobre a lista.

## Objetivo 3 — testes e build
`tests/v7-catalog-integrity.test.mjs`:
- 2.818 IDs únicos, todos `PC-n`, todos com fotos; hash SHA-256 fixando `id + marca + categoria + fotos` de todo o catálogo (detecta exclusão, reclassificação ou troca de foto). Este hash congela o catálogo atual: qualquer mudança legítima futura exige atualizá-lo de propósito.
- Toda foto existe em `public/` ou está registrada em `worker/catalog-assets.json`.
- Em cada grupo de nomes iguais (mesma marca e categoria) os IDs são distintos, e o código exibe `PC-…` no card e no detalhe (verificação por regex no fonte).
- A seleção acima existe, com marca/categoria corretas, sem `genero` e com as duas camisas em linhas diferentes.

Execução (fresca, neste worktree):
- `npm.cmd test`: 80 testes, 80 passaram, 0 falharam (dependências locais não foram necessárias).
- `npm.cmd run build`: concluído ("Built Worker, catalog assets and D1 migrations"); gera `dist/`, que não aparece no `git status`.

## Dificuldades / pendências
- Sem navegador de teste: QA visual, 390px/320px, WhatsApp e console **não executados**.
- Imagens de R2 não verificáveis localmente.
- Gênero de roupas/acessórios ausente no catálogo; precisa de fonte aprovada para qualquer vitrine masculino/feminino.
- Os testes novos ainda não foram commitados (sem commit, conforme a ordem).
