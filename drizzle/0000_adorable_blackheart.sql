CREATE TABLE `education` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`institution` text NOT NULL,
	`degree` text NOT NULL,
	`field` text NOT NULL,
	`duration` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `experience_skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`experience_id` integer NOT NULL,
	`skill` text NOT NULL,
	FOREIGN KEY (`experience_id`) REFERENCES `work_experience`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `personal_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`tagline` text NOT NULL,
	`bio` text NOT NULL,
	`location` text NOT NULL,
	`email` text NOT NULL,
	`github` text NOT NULL,
	`linkedin` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`tech_stack` text NOT NULL,
	`url` text,
	`order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`skill` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `work_experience` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`position` text NOT NULL,
	`type` text NOT NULL,
	`duration` text NOT NULL,
	`location` text NOT NULL,
	`description` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL
);
