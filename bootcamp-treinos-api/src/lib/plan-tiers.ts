export interface PlanTier {
  tier: "UP_TO_10" | "UP_TO_50" | "ABOVE_51";
  maxStudents: number;
  priceInCents: number;
}

export const PLAN_TIERS: PlanTier[] = [
  { tier: "UP_TO_10", maxStudents: 10, priceInCents: 14000 },
  { tier: "UP_TO_50", maxStudents: 50, priceInCents: 59900 },
  { tier: "ABOVE_51", maxStudents: Infinity, priceInCents: 98700 },
];
