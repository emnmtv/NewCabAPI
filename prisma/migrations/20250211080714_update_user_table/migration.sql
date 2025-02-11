/*
  Warnings:

  - You are about to drop the `student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `Student_userId_fkey`;

-- DropForeignKey
ALTER TABLE `teacher` DROP FOREIGN KEY `Teacher_userId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `domain` VARCHAR(191) NULL,
    ADD COLUMN `gradeLevel` INTEGER NULL,
    ADD COLUMN `lrn` VARCHAR(191) NULL,
    ADD COLUMN `section` VARCHAR(191) NULL,
    ADD COLUMN `subject` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `student`;

-- DropTable
DROP TABLE `teacher`;
