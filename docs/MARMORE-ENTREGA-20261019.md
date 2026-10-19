# Prévia mármore claro — 19/10/2026

Branch local `feature/marble-preview-20261019`, base `2269d07` (refino de 17/10). Nada foi publicado, enviado por push ou implantado.

## Continuidade com o Codex
- O Codex criou o clone isolado, a branch, `public/media/portela-marble-light.webp` e o roteiro `.design-edit.mjs`. O roteiro não chegou a ser executado.
- Esta etapa executou o roteiro (com ajustes), criou `public/marble-preview.css` e validou o resultado.

## Alterações
- Fundo global em mármore claro: `body:before` fixo, contínuo até o rodapé. A textura tem 56 KB.
- Equilíbrio: barra superior, menu, placa do brasão, categorias, painel masculino, painel "Treino. Rua. Rotina.", CTA e rodapé ficam em preto. O cabeçalho, o manifesto, o painel feminino e o catálogo ficam sobre o mármore.
- Logo: o brasão do cabeçalho é um recorte do arquivo oficial `portela-culture-opening.png` (`portela-crest-192.webp`, 16 KB). A arte completa continua no hero com fallback em PNG.
- Cabeçalho com busca, que reutiliza a busca do catálogo (`#header-search` em `catalogo.js`), mais o menu de categorias: Perfumes, Tênis, Roupas, Acessórios, Unissex, Masculino, Feminino, Marcas e Como pedir.
- Hero sem foto de modelo, com o brasão e três produtos reais do catálogo (PC-900002, PC-900015, PC-065).
- Cinco categorias, incluindo UNISSEX, e painéis masculino e feminino com o mesmo peso.
- Tipografia de títulos em Cormorant Garamond, com Inter e Manrope preservadas.
- Sem preços, carrinho, frete, parcelamento ou selos inventados (há um teste para isso).

## UNISSEX — regra aplicada
- Perfumaria: usa o campo `genero` já existente no catálogo (6 perfumes marcados como "Unissex": PC-900001, PC-900005, PC-900006, PC-900011, PC-900012 e PC-900037). O link é `?categoria=perfumaria&genero=Unissex`.
- Tênis (1.459) e roupas (1.203) não têm campo de gênero, e nenhum nome contém "unissex" ou "unisex". Nenhuma classificação foi inventada.
- Para estender o UNISSEX a tênis e roupas é preciso uma fonte verificável por modelo (página oficial do fabricante ou etiqueta do fornecedor). Depois disso, basta preencher `genero: "Unissex"` nesses itens e generalizar o filtro de `catalogo.js:133`, que hoje só lê `genero` em perfumaria.

## Validação
- `npm test`: 104/104. Eram 98 na base; entraram 6 testes novos em `tests/marble-preview.test.mjs`.
- `npm run build`: ok.
- Navegador (prévia local `node scripts/preview.mjs 8771`):
  - Sem rolagem horizontal em 375 px.
  - Menu mobile abre e fecha.
  - Filtro UNISSEX retorna 6 produtos.
  - `?produto=PC-900002` abre o detalhe com o link de WhatsApp.
  - A busca do cabeçalho filtra o catálogo ("dunk low": 191 produtos).
  - O dropdown de marcas funciona.
  - Nenhum erro no console.
- Limitação local: fotos de roupas e acessórios vêm do armazenamento R2 e não aparecem na prévia local. Os cartões ROUPAS e ACESSÓRIOS usam fundo tipográfico.

## Pendências
- Aprovação visual do Daniel.
- Publicação: depende de autorização explícita e do fluxo `portela-publicar-site`.
- `.design-edit.mjs` é um roteiro auxiliar e não entra no commit.
