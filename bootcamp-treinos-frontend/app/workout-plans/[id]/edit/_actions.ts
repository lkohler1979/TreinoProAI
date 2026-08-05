"use server";

import { revalidatePath } from "next/cache";
import {
  createWorkoutExercise,
  deleteWorkoutExercise,
  updateWorkoutDay,
  updateWorkoutExercise,
} from "@/app/_lib/api/fetch-generated";
import type {
  WorkoutDayUpdateInput,
  WorkoutExerciseInput,
} from "./_lib/actions-types";

export async function updateWorkoutDayAction(
  workoutPlanId: string,
  workoutDayId: string,
  input: WorkoutDayUpdateInput,
) {
  await updateWorkoutDay(workoutPlanId, workoutDayId, input);
  revalidatePath(`/workout-plans/${workoutPlanId}/edit`);
}

export async function createWorkoutExerciseAction(
  workoutPlanId: string,
  workoutDayId: string,
  input: WorkoutExerciseInput,
) {
  await createWorkoutExercise(workoutPlanId, workoutDayId, input);
  revalidatePath(`/workout-plans/${workoutPlanId}/edit`);
}

export async function updateWorkoutExerciseAction(
  workoutPlanId: string,
  workoutDayId: string,
  exerciseId: string,
  input: WorkoutExerciseInput,
) {
  await updateWorkoutExercise(workoutPlanId, workoutDayId, exerciseId, input);
  revalidatePath(`/workout-plans/${workoutPlanId}/edit`);
}

export async function deleteWorkoutExerciseAction(
  workoutPlanId: string,
  workoutDayId: string,
  exerciseId: string,
) {
  await deleteWorkoutExercise(workoutPlanId, workoutDayId, exerciseId);
  revalidatePath(`/workout-plans/${workoutPlanId}/edit`);
}
