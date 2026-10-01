ALTER TABLE `interesses` ADD `observacoes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `interesses` ADD `historico` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `interesses` ADD `revisao` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `interesses` ADD `atualizado_em` text;