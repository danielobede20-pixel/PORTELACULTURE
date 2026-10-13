# V5 — Preparação segura da Perfumaria sobre a versão publicada

**Estado:** release local para validação. NÃO publicar automaticamente.

A branch `release/sites-catalogo-2818` parte de `origin/main` em `f0886a8177997ce549b5c9c0da572ca0dcbd570c`, preservando os PRs #1 e #2.

- Catálogo público recuperado de produção em 13/10/2026: 2.778 IDs únicos, preservados **integralmente**, com SHA-256 do JSON normalizado `2fa655daf0a083ef70a469eca295b6890bceb083e45efc52a96fa69154f73775`.
- Itens novos de Perfumaria: 40, provenientes de `fb2bd0e0e8b1dbd15c59e9f0aa6bc2a0807c2b37`.
- Catálogo de teste resultante: 2.818 produtos. `worker/catalog.json` mantém os mesmos metadados sem o campo de fotos.
- Imagens adicionais do catálogo publicado: 22.085 WebP recuperados separadamente, com SHA-256 e tamanho conferidos individualmente. Backup fora deste repositório em `Downloads/_claude_check/resgate-publico-20261013/imagens-recuperadas`.
- `worker/catalog-assets.json` foi ampliado para registrar as 22.085 chaves originais, além das existentes. As imagens novas NÃO foram incluídas no Git para evitar o aumento excessivo do repositório.
- Home, filtros de Perfumaria, mensagens WhatsApp com referência PC, textos dos kits em português e proteção de códigos do fornecedor provêm das etapas V1–V5.1.

## Condições indispensáveis antes do deploy

1. Confirmar que o site original do ChatGPT Sites e o novo deploy compartilham **o mesmo bucket R2 e as mesmas ligações D1**, ou migrar explicitamente as imagens e configurações.
2. Recuperar/confirmar a versão real do Worker no Sites. Os arquivos públicos de produção foram baixados, mas o código privado do Worker não é publicamente acessível.
3. Executar testes, build, QA browser e validar o registro de assets.
4. Confirmar endereço/origem do deploy e realizar aprovação final; não assumir que um push no GitHub atualiza automaticamente o Sites.
5. Depois do deploy, testar imagens da coleção, catálogo completo, perfumaria, conversão WhatsApp, registros D1 e backend.

A ausência da ferramenta Sites nesta sessão continua sendo um bloqueio operacional. **Não confundir release tecnicamente preparada com publicação concluída.**

Nenhum preço foi acrescentado. A auditoria de tênis/acessórios do worktree principal não foi incorporada.
