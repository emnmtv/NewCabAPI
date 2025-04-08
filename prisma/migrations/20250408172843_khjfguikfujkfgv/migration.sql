/*
  Warnings:

  - You are about to drop the column `folder` on the `questionbank` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `questionbank` DROP COLUMN `folder`,
    ADD COLUMN `folderId` INTEGER NULL,
    ADD COLUMN `gradeLevel` INTEGER NULL,
    ADD COLUMN `lastUsed` DATETIME(3) NULL,
    ADD COLUMN `points` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `source` VARCHAR(191) NULL,
    ADD COLUMN `subtopic` VARCHAR(191) NULL,
    ADD COLUMN `successRate` DOUBLE NULL,
    ADD COLUMN `tags` JSON NULL,
    ADD COLUMN `timeLimit` INTEGER NULL,
    ADD COLUMN `topic` VARCHAR(191) NULL,
    ADD COLUMN `usageCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `QuestionBankFolder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuestionBankFolder` ADD CONSTRAINT `QuestionBankFolder_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionBank` ADD CONSTRAINT `QuestionBank_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `QuestionBankFolder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
