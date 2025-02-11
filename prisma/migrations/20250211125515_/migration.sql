/*
  Warnings:

  - A unique constraint covering the columns `[testCode]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Exam_testCode_key` ON `Exam`(`testCode`);
