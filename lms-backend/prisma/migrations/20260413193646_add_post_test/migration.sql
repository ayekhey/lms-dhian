-- AlterTable
ALTER TABLE "User" ADD COLUMN     "postTestDone" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PostTestResult" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostTestResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostTestResult" ADD CONSTRAINT "PostTestResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
