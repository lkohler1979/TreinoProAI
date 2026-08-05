export const WORKOUT_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export type WorkoutLevel = (typeof WORKOUT_LEVELS)[number];

export const WORKOUT_LEVEL_LABELS: Record<WorkoutLevel, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
};

export const WORKOUT_LEVEL_OPTIONS = WORKOUT_LEVELS.map((value) => ({
  value,
  label: WORKOUT_LEVEL_LABELS[value],
}));
