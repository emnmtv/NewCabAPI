/*
  Warnings:

  - Added the required column `gradeLevel` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student` ADD COLUMN `gradeLevel` INTEGER NOT NULL;
