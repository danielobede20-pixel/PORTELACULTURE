# Portela Culture — ponte de automação

A aplicação mantém o D1 como fonte de dados atual e adiciona uma saída opcional para n8n/CRM.

## Eventos enviados
- quiz_complete
- whatsapp_click

Visitas passivas de produto não são enviadas para evitar ruído e custo.

## Variáveis de produção
- PORTELA_AUTOMATION_WEBHOOK_URL: URL HTTPS do webhook de produção do n8n.
- PORTELA_AUTOMATION_WEBHOOK_TOKEN: token secreto compartilhado para autenticar o envio.

Sem URL configurada, a automação permanece desativada e o site funciona normalmente.

## Payload
Inclui ID idempotente do evento, sessão anônima, origem/campanha, página, posição do CTA, produto validado pelo servidor, respostas do quiz, intenção e indicação de clique no WhatsApp. Não inclui telefone, e-mail, cidade, IP ou outros dados pessoais.

## Próximo fluxo no n8n
Webhook -> validar token -> deduplicar eventId -> classificar intenção -> gravar/atualizar CRM -> rotear lead -> follow-up permitido.

Falhas do webhook não bloqueiam o registro no D1 nem o acesso do cliente ao WhatsApp.
