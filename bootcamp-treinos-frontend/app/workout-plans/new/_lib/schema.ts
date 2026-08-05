import { z } from "zod";
import { WEEK_DAYS } from "@/app/_lib/week-days";
import { EXERCISE_METHODS } from "@/app/_lib/exercise-methods";
import { WORKOUT_CATEGORIES } from "@/app/_lib/workout-categories";
import { WORKOUT_LEVELS } from "@/app/_lib/workout-levels";

export { WEEK_DAYS, WEEK_DAY_LABELS } from "@/app/_lib/week-days";
export { GOAL_OPTIONS } from "@/app/_lib/goals";

const numericString = () =>
  z.string().refine((value) => value !== "" && Number(value) > 0, {
    message: "Valor inválido",
  });

export const exerciseFieldSchema = z.object({
  muscleGroupId: z.string().min(1, "Selecione o grupo muscular"),
  exerciseTemplateId: z.string().min(1, "Selecione o exercício"),
  sets: numericString(),
  reps: numericString(),
  restTimeInSeconds: numericString(),
  method: z.enum(EXERCISE_METHODS),
});

export const workoutDayFieldSchema = z.object({
  weekDay: z.enum(WEEK_DAYS),
  isRest: z.boolean(),
  name: z.string(),
  durationInMinutes: z.string(),
  exercises: z.array(exerciseFieldSchema),
});

export const manualWorkoutPlanFormSchema = z
  .object({
    goal: z.string(),
    category: z.enum(WORKOUT_CATEGORIES).or(z.literal("")),
    level: z.enum(WORKOUT_LEVELS).or(z.literal("")),
    workoutDays: z.array(workoutDayFieldSchema),
  })
  .superRefine((values, ctx) => {
    values.workoutDays.forEach((day, index) => {
      if (day.isRest) return;

      if (!day.name.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o nome do dia",
          path: ["workoutDays", index, "name"],
        });
      }

      if (!day.durationInMinutes || Number(day.durationInMinutes) <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Informe a duração estimada",
          path: ["workoutDays", index, "durationInMinutes"],
        });
      }

      if (day.exercises.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Adicione ao menos um exercício",
          path: ["workoutDays", index, "exercises"],
        });
      }
    });
  });

export type ManualWorkoutPlanFormValues = z.infer<
  typeof manualWorkoutPlanFormSchema
>;
