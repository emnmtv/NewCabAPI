/*
  Warnings:

  - You are about to drop the column `endDay` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `startDay` on the `schedule` table. All the data in the column will be lost.
  - Made the column `daysOfWeek` on table `schedule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `schedule` DROP COLUMN `endDay`,
    DROP COLUMN `startDay`,
    MODIFY `daysOfWeek` JSON NOT NULL;
