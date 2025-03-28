/*
  Warnings:

  - You are about to drop the column `fileName` on the `subjecttask` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `subjecttask` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `tasksubmission` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `tasksubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `subjecttask` DROP COLUMN `fileName`,
    DROP COLUMN `fileUrl`;

-- AlterTable
ALTER TABLE `tasksubmission` DROP COLUMN `fileName`,
    DROP COLUMN `fileUrl`;

-- CreateTable
CREATE TABLE `TaskFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `taskId` INTEGER NULL,
    `submissionId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaskFile` ADD CONSTRAINT `TaskFile_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `SubjectTask`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskFile` ADD CONSTRAINT `TaskFile_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `TaskSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
