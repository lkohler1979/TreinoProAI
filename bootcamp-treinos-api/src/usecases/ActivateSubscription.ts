import dayjs from "dayjs";

import { SubscriptionPlanTier, SubscriptionStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
  planTier: SubscriptionPlanTier;
}

interface OutputDto {
  planTier: SubscriptionPlanTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
}

export class ActivateSubscription {
  async execute(dto: InputDto): Promise<OutputDto> {
    const currentPeriodEnd = dayjs().add(30, "day").toDate();

    const subscription = await prisma.subscription.upsert({
      where: { trainerId: dto.trainerId },
      create: {
        trainerId: dto.trainerId,
        planTier: dto.planTier,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd,
      },
      update: {
        planTier: dto.planTier,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd,
      },
    });

    return {
      planTier: subscription.planTier,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd!.toISOString(),
    };
  }
}
