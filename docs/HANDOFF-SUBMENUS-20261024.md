# HANDOFF — Submenus das categorias (24/10/2026)

Pedido do Daniel (4 vídeos, desktop e celular):
- TÊNIS abre a lista de marcas de tênis. ROUPAS abre a lista de marcas de roupas. Um clique na marca mostra os produtos filtrados.
- ACESSÓRIOS abre os tipos (meias, bonés, cintos, óculos…).
- PERFUMES abre Masculino/Feminino, e cada um abre os tipos (Perfumes, Kits, Body splash, Cremes hidratantes).

Branch: feature/submenus-categorias-20261024 (sobre feature/precos-tenis-20261023 @ dd88c39, sync do Sites v39).
Arquivos que vão ao ar: public/index.html, public/catalogo.js (v=38), public/catalogo-core.js (v=22), public/marble-preview.css (v=6), public/home-refino.css (v=5).
NÃO muda: catalogo.json, worker/, D1/R2, preços, fotos. O catálogo já trazia genero e subtipo dos perfumes; nada foi reclassificado.

## Regras implementadas
- Listas montadas do catálogo real, com contagem. Cada painel tem um "Ver todos" estático, que também serve de fallback sem JS.
- Um submenu aberto por vez; fecha ao clicar fora, ao escolher um item e com Esc. No celular, os itens abrem e fecham como sanfona (+/−).
- Perfumes: o gênero filtra só dentro de Perfumes, e os Unissex entram nos dois. Os links MASCULINO/FEMININO do menu principal continuam valendo só para roupas.
- Acessórios: "Boné"/"Bonés" e "Cinto"/"Cintos" foram unificados na exibição (alias em catalogo-core.js).
- URLs: ?marca=X&categoria=tenis · ?categoria=acessorios&linha=Meias · ?categoria=perfumaria&genero=Feminino&tipo=Hidratante.

## Evidência (Claude, 24/10)
- Testes: 135 testes, 132 passam; as 3 falhas já existiam na base (2 de vitrine e 1 de ordem das seções). Novo: tests/submenus.test.mjs.
- Playwright em 1440/390/320: os submenus abrem e listam marcas/tipos; o clique filtra (ex.: Adidas · Tênis = 56; Cremes hidratantes femininos = 2; link direto Kits masculinos = 7); Esc e clique fora fecham; sem rolagem lateral; sem erro de JS (só o 404 de api/ia no servidor local, que não tem o Worker).

## Critérios de aceite no ar
1. 2849 produtos e IDs únicos preservados; catalogo.json idêntico.
2. index.html referencia catalogo.js?v=38 e catalogo-core.js?v=22.
3. Desktop e 390/320: TÊNIS → marcas; ROUPAS → marcas; ACESSÓRIOS → tipos; PERFUMES → Masculino/Feminino → tipos.
4. Aplicar sobre a fonte atual do Sites (não sobrescrever com snapshot).
