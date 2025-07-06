PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_artists` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`name` text,
	`term_id` text,
	`contributor_id` text,
	`full_name` text,
	`type` text,
	`nationality_code` text,
	`description` text
);
--> statement-breakpoint
INSERT INTO `__new_artists`("id", "parent_id", "name", "term_id", "contributor_id", "full_name", "type", "nationality_code", "description") SELECT "id", "parent_id", "name", "term_id", "contributor_id", "full_name", "type", "nationality_code", "description" FROM `artists`;--> statement-breakpoint
DROP TABLE `artists`;--> statement-breakpoint
ALTER TABLE `__new_artists` RENAME TO `artists`;--> statement-breakpoint
PRAGMA foreign_keys=ON;