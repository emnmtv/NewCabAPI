/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `scheduleType` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schedule` DROP COLUMN `dayOfWeek`,
    ADD COLUMN `daysOfWeek` JSON NULL,
    ADD COLUMN `endDay` VARCHAR(191) NULL,
    ADD COLUMN `scheduleType` VARCHAR(191) NOT NULL,
    ADD COLUMN `startDay` VARCHAR(191) NULL;
