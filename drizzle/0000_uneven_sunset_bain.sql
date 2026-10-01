CREATE TABLE `interesses` (
	`id` text PRIMARY KEY NOT NULL,
	`sessao` text NOT NULL,
	`criado_em` text NOT NULL,
	`tipo` text NOT NULL,
	`origem` text NOT NULL,
	`pagina_entrada` text NOT NULL,
	`pagina_atual` text NOT NULL,
	`posicionamento` text NOT NULL,
	`produto_id` text,
	`produto_nome` text,
	`marca` text,
	`categoria` text,
	`quiz` text NOT NULL,
	`clique_whatsapp` integer DEFAULT 0 NOT NULL,
	`intencao` text NOT NULL,
	`status` text DEFAULT 'novo' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `interesses_criado_em_idx` ON `interesses` (`criado_em`);--> statement-breakpoint
CREATE INDEX `interesses_sessao_idx` ON `interesses` (`sessao`);