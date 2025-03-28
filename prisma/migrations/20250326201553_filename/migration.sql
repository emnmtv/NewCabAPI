/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `tasksubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `subjecttask` ADD COLUMN `fileName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tasksubmission` DROP COLUMN `updatedAt`,
    ADD COLUMN `fileName` VARCHAR(191) NULL;
