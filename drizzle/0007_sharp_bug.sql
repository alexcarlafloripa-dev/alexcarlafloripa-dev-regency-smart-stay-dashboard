CREATE TABLE `corretores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(16) NOT NULL,
	`nome` varchar(128) NOT NULL,
	`telefone` varchar(32) NOT NULL,
	`imobiliaria` varchar(128),
	`email` varchar(320),
	`ativo` enum('sim','nao') NOT NULL DEFAULT 'sim',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `corretores_id` PRIMARY KEY(`id`),
	CONSTRAINT `corretores_codigo_unique` UNIQUE(`codigo`)
);
