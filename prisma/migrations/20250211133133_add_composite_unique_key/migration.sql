/*
  Warnings:

  - A unique constraint covering the columns `[examId,userId,questionId]` on the table `ExamAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ExamAnswer_examId_userId_questionId_key` ON `ExamAnswer`(`examId`, `userId`, `questionId`);
