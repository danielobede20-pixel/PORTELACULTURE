# Entrega: página de rastreio de pedidos (10/11/2026)

Pedido do Daniel (09/11 e 10/11/2026). Página nova + link no menu e no rodapé. Nada de preço, catálogo, D1/R2 ou Worker muda.
Base: o que está no ar (Sites v43: `catalogo.js?v=39`, `footer-reference.css?v=1`). Esta branch só transporta os arquivos: não fazer merge no main.
Independe da entrega de preços (`entrega/precos-20261110`); pode ir antes, depois ou junto.

## O que aplicar na fonte ATUAL do Sites (não sobrescrever com snapshot)

1. Arquivos novos, copiar como estão desta branch:
   - `public/rastreio.html`
   - `public/rastreio.js`

2. `public/index.html`, menu (1 ocorrência):
   - BUSCAR: `<a href="#como-pedir">COMO PEDIR</a></div></nav>`
   - SUBSTITUIR: `<a href="#como-pedir">COMO PEDIR</a><a href="rastreio.html">RASTREAR PEDIDO</a></div></nav>`

3. `public/index.html`, rodapé (1 ocorrência):
   - BUSCAR: `<span>15 a 20 dias.</span></p>`
   - SUBSTITUIR: `<span>15 a 20 dias.</span><a href="rastreio.html" style="display:block;margin-top:2px;color:#e1c98d;text-decoration:underline;text-underline-offset:3px">Rastrear pedido</a></p>`

Cada âncora aparece exatamente 1 vez no ar (conferido em 10/11/2026). Se não bater, parar e avisar.
Resultado esperado do `index.html`: `entregas/rastreio-20261110/index-no-ar-com-patch.html` (só referência; aplicar as trocas, não copiar o arquivo).

## Critérios de aceite (no ar)
- `/rastreio.html` e `/rastreio.js` respondem 200.
- Menu (desktop e gaveta do celular) e rodapé mostram "Rastrear pedido" levando a `/rastreio.html`.
- Código dos Correios (ex.: `AB123456789BR`) abre a página oficial dos Correios e copia o código; outro código abre o 17TRACK; vazio ou inválido mostra aviso e não abre nada.
- `/rastreio.html?codigo=AB123456789BR` já vem com o código preenchido e o botão em destaque.
- Sem rolagem horizontal e 0 erro de JS em 1440, 390 e 320 px.

## Verificado pelo Claude (10/11/2026)
- `node --test tests/rastreio.test.mjs`: 5/5 com o `index.html` no ar + patch; com o `index.html` atual sem patch, o teste do menu/rodapé falha (como esperado).
- QA no site real com a home trocada só no navegador de teste (nada publicado): 1440/390/320 sem rolagem lateral, link visível no menu e no rodapé, navegação do rodapé para `rastreio.html`, mensagens de vazio/inválido, nova aba aberta, `?codigo=` preenchido; 0 erro de JS. Capturas: `qa-1440-390-320.jpg`.
- Não verificado: abertura real do 17TRACK e dos Correios (bloqueados na rede do ambiente de teste; a nova aba abriu).

## Prazo
A página usa o mesmo prazo do rodapé no ar: "15 a 20 dias". Se o prazo mudar, trocar nos dois lugares.
