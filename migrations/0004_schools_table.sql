-- Custom SQL migration file for schools table --

CREATE TABLE `schools` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text,
	`region` text,
	`address` text,
	`website` text,
	`email` text,
	`phone` text,
	`principal` text,
	`roll` integer,
	`decile` integer,
	`latitude` text,
	`longitude` text,
	`status` integer DEFAULT 1 NOT NULL,
	`snapshot_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);