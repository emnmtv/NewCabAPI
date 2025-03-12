/*
  Warnings:

  - You are about to drop the column `sectionId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `section` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_sectionId_fkey`;

-- DropIndex
DROP INDEX `User_sectionId_fkey` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `sectionId`,
    ADD COLUMN `section` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `section`;

-- CreateTable
CREATE TABLE `GradeSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grade` INTEGER NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GradeSection_grade_section_key`(`grade`, `section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
