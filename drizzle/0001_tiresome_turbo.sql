CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('unit_view','compare_add','whatsapp_click','copy_click','compare_view','simulator_use') NOT NULL,
	`unitCota` varchar(32),
	`unitTipologia` varchar(32),
	`unitAndar` varchar(32),
	`currency` varchar(8),
	`sessionId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
