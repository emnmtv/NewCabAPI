-- AlterTable
ALTER TABLE `questionbank` ADD COLUMN `sourceClassCode` VARCHAR(191) NULL,
    ADD COLUMN `sourceExamTitle` VARCHAR(191) NULL,
    ADD COLUMN `sourceTestCode` VARCHAR(191) NULL;
