export const EXERCISE_METHODS = [
  "NORMAL",
  "DROP_SET",
  "REST_PAUSE",
  "BI_SET",
  "PYRAMID",
] as const;

export type ExerciseMethod = (typeof EXERCISE_METHODS)[number];

export const EXERCISE_METHOD_LABELS: Record<ExerciseMethod, string> = {
  NORMAL: "Normal",
  DROP_SET: "Drop Set",
  REST_PAUSE: "Rest Pause",
  BI_SET: "Bi Set",
  PYRAMID: "Pirâmide",
};

export const EXERCISE_METHOD_OPTIONS = EXERCISE_METHODS.map((value) => ({
  value,
  label: EXERCISE_METHOD_LABELS[value],
}));
