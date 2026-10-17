# Refino premium Portela Culture — 17/10/2026 (Claude)

Status: LOCAL. NADA PUBLICADO. Branch refino/premium-20261017 (sobre restauro/visual-13out-20261017).
Toolkit: prompts 01 (medir antes de agir), 04 (pedido em plano) e 03 (revisão). Prompts de ESLint/Next não se aplicam (site estático, sem lint configurado).

## Implementado
- Abertura: mármore recolhido nas bordas (máscara radial no desktop, vertical no celular), brilho do efeito de rolagem reduzido de 8% para 3%, leve redução de saturação. Brasão e SEJA REFERÊNCIA intactos.
- Cabeçalho: faixa superior escura com dourado discreto (antes faixa dourada cheia), ícone de busca + menu com o mesmo padrão.
- Busca funcional: campo no catálogo e atalho no cabeçalho; ignora acentos e maiúsculas, aceita marca, modelo, referência (PC-xxx) e perfumaria; mensagem clara sem resultado; aceita ?busca= na URL.
- Padronização: raio único (2px), sombra única, bordas suaves, botões no mesmo padrão (sem salto ao passar o mouse), cards de produto e categoria unificados, hierarquia de títulos/eyebrows.
- Tudo visual concentrado em public/refino.css (reversível removendo o arquivo e o link).

## Arquivos
public/refino.css (novo), public/index.html, public/catalogo-core.js, public/catalogo.js, tests/busca.test.mjs (novo), tests/catalogo.test.mjs, tests/v9-fallback-quiz.test.mjs.

## Evidências
- Testes 98/98. Build OK. Catálogo 2.818 / 0 erros.
- Navegador: busca "dunk low" 191, "lattafa" 19, termo inexistente com mensagem, vazio 2.815. Sem rolagem lateral em 375px. Contraste dos textos-chave >= 7,6:1.

## Decisões que dependem do Daniel
- Busca: tinha sido removida de propósito em 7e7ac5f; voltou como complemento por pedido explícito. O teste que proibia a busca foi trocado por um que garante a navegação por marca/modelo.
- Preços, carrinho, estoque: não existem no site (fluxo é WhatsApp). Não inventei; exigem dados reais e autorização (AGENTS.md).
- Masculino/Feminino e Lançamentos: o catálogo não tem gênero (só perfumaria) nem data de lançamento. Criar exigiria rotular 2.778 produtos sem fonte. Existe trabalho seu de 15/10 em feature/home-unissex-20261015 para avaliar.
- Logo SVG/4K/3D: não há esses arquivos no notebook. O único brasão é um raster 1672x941 com mármore. Vetorizar perde o 3D dourado; precisa do arquivo original ou de um redesenho aprovado.
