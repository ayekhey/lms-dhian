-- DropForeignKey
ALTER TABLE "ModulePage" DROP CONSTRAINT "ModulePage_moduleId_fkey";

-- AlterTable
ALTER TABLE "ModulePage" ADD COLUMN     "blocks" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "content" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ModulePage" ADD CONSTRAINT "ModulePage_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
