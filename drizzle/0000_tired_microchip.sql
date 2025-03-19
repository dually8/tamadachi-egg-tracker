CREATE TABLE `EggPrice` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`price` real NOT NULL,
	`storeLocation` text NOT NULL,
	`storeName` text NOT NULL
);
