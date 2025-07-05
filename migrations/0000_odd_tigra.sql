CREATE TABLE `artists` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`age` integer NOT NULL,
	`country` text NOT NULL,
	`born_on` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
