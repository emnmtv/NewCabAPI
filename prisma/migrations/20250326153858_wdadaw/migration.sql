/*
  Warnings:

  - You are about to drop the `schedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `schedule` DROP FOREIGN KEY `Schedule_subjectId_fkey`;

-- AlterTable
ALTER TABLE `subject` ADD COLUMN `daysOfWeek` JSON NULL,
    ADD COLUMN `endTime` VARCHAR(191) NULL,
    ADD COLUMN `scheduleType` VARCHAR(191) NULL,
    ADD COLUMN `startTime` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `schedule`;
