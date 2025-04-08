/*
  Warnings:

  - You are about to drop the column `gradeLevel` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsed` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `subtopic` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `successRate` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `timeLimit` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `questionbank` table. All the data in the column will be lost.
  - You are about to drop the column `usageCount` on the `questionbank` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `questionbank` DROP COLUMN `gradeLevel`,
    DROP COLUMN `lastUsed`,
    DROP COLUMN `points`,
    DROP COLUMN `source`,
    DROP COLUMN `subtopic`,
    DROP COLUMN `successRate`,
    DROP COLUMN `tags`,
    DROP COLUMN `timeLimit`,
    DROP COLUMN `topic`,
    DROP COLUMN `usageCount`;
