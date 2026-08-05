import { SubscriptionPlanTier } from "../generated/prisma/enums.js";

export interface PlanTier {
  tier: SubscriptionPlanTier;
  maxStudents: number;
  priceInCents: number;
}

export const PLAN_TIERS: PlanTier[] = [
  { tier: SubscriptionPlanTier.UP_TO_10, maxStudents: 10, priceInCents: 14000 },
  { tier: SubscriptionPlanTier.UP_TO_50, maxStudents: 50, priceInCents: 59900 },
  {
    tier: SubscriptionPlanTier.ABOVE_51,
    maxStudents: Infinity,
    priceInCents: 98700,
  },
];
