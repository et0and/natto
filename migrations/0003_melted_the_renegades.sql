-- Custom SQL migration file, put your code below! --

CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`year` text,
	`genre` text,
	`description` text
);

CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text,
	`model` text,
	`brand` text,
	`date` text,
	`colour` text,
	`description` text
);

CREATE TABLE `galleries` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`address` text NOT NULL,
	`website` text NOT NULL,
	`email` text NOT NULL,
	`artists` text,
	`latitude` text NOT NULL,
	`longitude` text NOT NULL,
	`status` integer DEFAULT 1 NOT NULL,
	`opened` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);