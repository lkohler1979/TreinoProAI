import type { ExerciseMethod } from "@/app/_lib/exercise-methods";

export interface WorkoutDayUpdateInput {
  name: string;
  isRest: boolean;
  estimatedDurationInSeconds: number;
}

export interface WorkoutExerciseInput {
  name: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  method?: ExerciseMethod;
}

export interface WorkoutPlanEditActions {
  updateWorkoutDay: (
    workoutPlanId: string,
    workoutDayId: string,
    input: WorkoutDayUpdateInput,
  ) => Promise<void>;
  createWorkoutExercise: (
    workoutPlanId: string,
    workoutDayId: string,
    input: WorkoutExerciseInput,
  ) => Promise<void>;
  updateWorkoutExercise: (
    workoutPlanId: string,
    workoutDayId: string,
    exerciseId: string,
    input: WorkoutExerciseInput,
  ) => Promise<void>;
  deleteWorkoutExercise: (
    workoutPlanId: string,
    workoutDayId: string,
    exerciseId: string,
  ) => Promise<void>;
}
