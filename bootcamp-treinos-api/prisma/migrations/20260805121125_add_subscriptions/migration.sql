-- CreateEnum
CREATE TYPE "SubscriptionPlanTier" AS ENUM ('UP_TO_10', 'UP_TO_50', 'ABOVE_51');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED');

-- CreateTable
CREATE TABLE "Subscription" (
    "trainerId" TEXT NOT NULL,
    "planTier" "SubscriptionPlanTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodEnd" TIMESTAMPTZ,
    "paymentProviderCustomerId" TEXT,
    "paymentProviderSubscriptionId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("trainerId")
);

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
