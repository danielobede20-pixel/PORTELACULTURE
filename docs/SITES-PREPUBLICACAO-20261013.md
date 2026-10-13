# Conferência do Sites original — 13/10/2026

Projeto: appgprj_6ab421b9a2e881918220650051ac841a.
Fonte recuperada pelo fluxo oficial Sites: 276f6e23cf4ed10f4670637b6dbab2056bc6be00.
Versão publicada observada: 21. Acesso público preservado.

- Manifesto do Sites e do release usam o mesmo project_id, D1 DB e R2 BUCKET. Nenhuma mudança de bindings ou migração foi feita.
- As quatro migrações SQL coincidem após normalização CRLF/LF; atendimento.js e atendimento-page.js também coincidem.
- Worker principal difere funcionalmente pela inclusão da categoria perfumaria.
- ia.js contém a seleção limitada de candidatos vinda dos PRs do GitHub; não foi ativada IA nem alterada configuração de produção.
- catalog-media.js difere apenas na ordem da leitura/checagem de autorização.
- Registro original Sites: 32.876 imagens. Release anterior: 32.233. Preservados mais 643 registros originais (624 da coleção e 19 Nike Vomero Premium), com verificação de conflitos antes da união.
- Catálogo segue com 2.818 produtos, incluindo os 2.778 publicados e 40 referências de perfumaria.
- Testes, build e validação de artefato foram novamente executados após a união do registro. Consultar logs sites-next-* em Downloads/_claude_check.

## Estado

Preparação local. Sem push, deploy ou alteração do banco/bucket de produção.
A publicação ainda exige conciliar este release com a história nativa do Sites, empacotar a fonte correspondente e revisar o resultado antes do deploy. Não assumir que um push no GitHub publica o Sites.
