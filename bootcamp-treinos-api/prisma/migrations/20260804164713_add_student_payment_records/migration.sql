-- CreateEnum
CREATE TYPE "StudentPaymentStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE');

-- CreateTable
CREATE TABLE "StudentPaymentRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "paymentDate" TIMESTAMPTZ NOT NULL,
    "status" "StudentPaymentStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "StudentPaymentRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentPaymentRecord" ADD CONSTRAINT "StudentPaymentRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
