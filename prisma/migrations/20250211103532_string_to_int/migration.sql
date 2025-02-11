/*
  Warnings:

  - Made the column `lrn` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `lrn` INTEGER NOT NULL;
