# Entrega — refino da home (19/10/2026)

Base: `publish/marmore-20261019` @ 4b3a9a4 (public/index.html idêntico ao site no ar em 19/10, 20:57).
Aprovado visualmente pelo Daniel em 19/10. Testado localmente com o catálogo real (sem erros de JS).

## Arquivos
- `public/index.html` — alterado (único arquivo existente modificado)
- `public/home-refino.css` — novo
- `public/home-refino.js` — novo
- `public/media/home/*.webp` — 11 imagens novas (5 categorias 3D + 6 da vitrine do topo)

## Mudanças na home
- Hero: "Seu estilo. Em todos os momentos." + texto complementar; 1 botão (Explorar categorias).
- Vitrine do topo: 6 produtos reais em imagens de alta qualidade.
- Removidos: manifesto, Treino/Rua/Rotina, CTA final. "Escolhas que transcendem" fica `hidden` (catalogo.js usa #curated).
- Catálogo some da home e aparece ao escolher categoria, marca, busca ou #catalogo (classe `home-compact`).
- "Como pedir" vira painel (dialog) aberto pelo menu e rodapé.
- Categorias com imagens 3D; no celular as 5 aparecem sem arrastar.
- Rodapé: prazo 15–20 dias úteis, Pix ou cartão de crédito, "Não encontrou?", WhatsApp.

## Não muda
catalogo.json, catalogo*.js, conversao*, ia*, vitrine.js, motion.js, CSS existentes, Worker, D1/R2, preços, produtos.

## Testes locais (19/10)
- Altura da home: celular 13.044 → 3.396 px; desktop 11.692 → 2.750 px.
- Tênis 1459, Perfumes 40, Roupas 1203, Acessórios 113, Unissex 6 produtos.
- Produto abre pela vitrine; "Como pedir" abre pelo menu e rodapé; console sem erros.
