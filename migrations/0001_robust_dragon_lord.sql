ALTER TABLE `artists` RENAME COLUMN "age" TO "parent_id";--> statement-breakpoint
ALTER TABLE `artists` RENAME COLUMN "born_on" TO "term_id";--> statement-breakpoint
ALTER TABLE `artists` ALTER COLUMN "term_id" TO "term_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `artists` ADD `full_name` text;--> statement-breakpoint
ALTER TABLE `artists` ADD `contributor_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `artists` ADD `artist_type` text;