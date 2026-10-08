# Portela Culture — IA de seleção (08/10/2026)

## Escopo da correção

- A API `/api/ia` usa `worker/catalog.json` (1.505 referências), mas envia ao modelo somente até **48 referências relevantes** por consulta.
- O filtro considera marca explícita, linha e nomes dos produtos. Preferências da conversa são consideradas nas mensagens recentes.
- A resposta segue o contrato original `{message,products}`, com no máximo três IDs válidos do subconjunto enviado. O servidor rejeita IDs que não foram apresentados ao modelo.
- Não há migração de banco, alteração de UI, duplicação de catálogo ou alteração do fluxo de atendimento pelo WhatsApp.
- O limite de payload (80 KB), quota por IP/hora (12) e limite mensal de tentativas (400 reservas) foram preservados; uma consulta rejeitada pelo tamanho não consome a quota.
- Nenhuma afirmação sobre preços, estoque, tamanho, prazos, autenticidade ou condições comerciais deve ser gerada pelo assistente. Essas informações continuam sob confirmação humana.

## Ativação controlada

O recurso permanece **desativado** por padrão. O endpoint GET `/api/ia` anuncia `enabled: true` somente quando todas as condições estiverem presentes no ambiente do site:

- `PORTELA_IA_ENABLED=1`
- `OPENAI_API_KEY` configurada exclusivamente como segredo no servidor
- `PORTELA_IA_MONTHLY_USD=20`
- `DB` disponível para controlar uso

O valor 20 é a autorização configurada pelo projeto. O controle de **400 reservas de consultas** não substitui um orçamento/alerta na plataforma da API e não mede o custo faturado em tempo real. Configure limites adicionais no projeto de API antes de ativar publicamente.

## Validação

- `npm test`: validar todos os testes, incluindo `tests/ia.test.mjs`.
- `npm run build` e `node scripts/validate-artifact.mjs`.
- Testes mockados: ASICS GEL-1130, Adidas Samba com continuidade de conversa, Nike Alphafly de referências adicionadas, limite de payload, privacidade, origem, orçamento e falha do provedor.
- Após disponibilizar chave/DB na infraestrutura, validar em ambiente de teste com consulta real de baixo custo e verificar GET `/api/ia`, cartões e passagem ao WhatsApp, antes da ativação em produção.
- **Não interpretar testes mockados como prova de que a chave, a cobrança e o modelo estão operando na produção.**
