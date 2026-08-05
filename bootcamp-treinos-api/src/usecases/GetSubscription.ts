import { SubscriptionPlanTier, SubscriptionStatus, UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import { PLAN_TIERS } from "../lib/plan-tiers.js";

interface InputDto {
  trainerId: string;
}

interface OutputDto {
  planTier: SubscriptionPlanTier | null;
  status: SubscriptionStatus | null;
  maxStudents: number | null;
  activeStudentsCount: number;
  currentPeriodEnd: string | null;
}

export class GetSubscription {
  async execute(dto: InputDto): Promise<OutputDto> {
    const [subscription, activeStudentsCount] = await Promise.all([
      prisma.subscription.findUnique({ where: { trainerId: dto.trainerId } }),
      prisma.user.count({
        where: { trainerId: dto.trainerId, role: UserRole.STUDENT },
      }),
    ]);

    const planTierConfig = subscription
      ? PLAN_TIERS.find((tier) => tier.tier === subscription.planTier)
      : undefined;

    return {
      planTier: subscription?.planTier ?? null,
      status: subscription?.status ?? null,
      maxStudents:
        planTierConfig && Number.isFinite(planTierConfig.maxStudents)
          ? planTierConfig.maxStudents
          : null,
      activeStudentsCount,
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    };
  }
}
