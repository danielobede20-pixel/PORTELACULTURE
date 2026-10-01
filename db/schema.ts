import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const interesses = sqliteTable('interesses', {
 id: text('id').primaryKey(), sessao: text('sessao').notNull(), criadoEm: text('criado_em').notNull(),
 tipo: text('tipo').notNull(), origem: text('origem').notNull(), entrada: text('pagina_entrada').notNull(), pagina: text('pagina_atual').notNull(), posicionamento: text('posicionamento').notNull(),
 produtoId: text('produto_id'), produtoNome: text('produto_nome'), marca: text('marca'), categoria: text('categoria'), quiz: text('quiz').notNull(),
 cliqueWhatsapp: integer('clique_whatsapp').notNull().default(0), intencao: text('intencao').notNull(), status: text('status').notNull().default('novo')
}, table => [index('interesses_criado_em_idx').on(table.criadoEm), index('interesses_sessao_idx').on(table.sessao)]);
