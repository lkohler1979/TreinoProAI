-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'PERSONAL_TRAINER');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "accessExpiresAt" TIMESTAMP(3),
ADD COLUMN     "injuries" TEXT,
ADD COLUMN     "metabolicConditions" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "trainerId" TEXT;

-- CreateTable
CREATE TABLE "PersonalTrainerSettings" (
    "trainerId" TEXT NOT NULL,
    "defaultAccessDurationInDays" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "PersonalTrainerSettings_pkey" PRIMARY KEY ("trainerId")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalTrainerSettings" ADD CONSTRAINT "PersonalTrainerSettings_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
