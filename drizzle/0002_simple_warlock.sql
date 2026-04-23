ALTER TABLE `test_cases` MODIFY COLUMN `input` text;--> statement-breakpoint
ALTER TABLE `test_cases` MODIFY COLUMN `expected_output` text;--> statement-breakpoint
ALTER TABLE `problems` ADD `start_time` timestamp;--> statement-breakpoint
ALTER TABLE `problems` ADD `end_time` timestamp;--> statement-breakpoint
ALTER TABLE `problems` ADD `duration` int;--> statement-breakpoint
ALTER TABLE `problems` ADD `timing_mode` varchar(20) DEFAULT 'scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE `problems` ADD `is_public` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `test_cases` ADD `type` varchar(20) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE `test_cases` ADD `test_script` text;