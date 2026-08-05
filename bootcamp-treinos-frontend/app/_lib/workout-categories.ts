import { Activity, Dumbbell, PersonStanding, Zap } from "lucide-react";

export const WORKOUT_CATEGORIES = [
  "MUSCULACAO",
  "CROSSFIT",
  "CALISTENIA",
  "FUNCIONAL",
] as const;

export type WorkoutCategory = (typeof WORKOUT_CATEGORIES)[number];

export const WORKOUT_CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  MUSCULACAO: "Musculação",
  CROSSFIT: "Crossfit",
  CALISTENIA: "Calistenia",
  FUNCIONAL: "Funcional",
};

export const WORKOUT_CATEGORY_ICONS: Record<
  WorkoutCategory,
  typeof Dumbbell
> = {
  MUSCULACAO: Dumbbell,
  CROSSFIT: Zap,
  CALISTENIA: PersonStanding,
  FUNCIONAL: Activity,
};
