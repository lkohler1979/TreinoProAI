"use server";

import { revalidatePath } from "next/cache";
import {
  createStudentWorkoutExercise,
  deleteStudentWorkoutExercise,
  updateStudentWorkoutDay,
  updateStudentWorkoutExercise,
} from "@/app/_lib/api/fetch-generated";
import type {
  WorkoutDayUpdateInput,
  WorkoutExerciseInput,
} from "@/app/workout-plans/[id]/edit/_lib/actions-types";

export async function updateStudentWorkoutDayAction(
  studentId: string,
  workoutPlanId: string,
  workoutDayId: string,
  input: WorkoutDayUpdateInput,
) {
  await updateStudentWorkoutDay(studentId, workoutPlanId, workoutDayId, input);
  revalidatePath(
    `/personal/students/${studentId}/workout-plans/${workoutPlanId}/edit`,
  );
}

export async function createStudentWorkoutExerciseAction(
  studentId: string,
  workoutPlanId: string,
  workoutDayId: string,
  input: WorkoutExerciseInput,
) {
  await createStudentWorkoutExercise(
    studentId,
    workoutPlanId,
    workoutDayId,
    input,
  );
  revalidatePath(
    `/personal/students/${studentId}/workout-plans/${workoutPlanId}/edit`,
  );
}

export async function updateStudentWorkoutExerciseAction(
  studentId: string,
  workoutPlanId: string,
  workoutDayId: string,
  exerciseId: string,
  input: WorkoutExerciseInput,
) {
  await updateStudentWorkoutExercise(
    studentId,
    workoutPlanId,
    workoutDayId,
    exerciseId,
    input,
  );
  revalidatePath(
    `/personal/students/${studentId}/workout-plans/${workoutPlanId}/edit`,
  );
}

export async function deleteStudentWorkoutExerciseAction(
  studentId: string,
  workoutPlanId: string,
  workoutDayId: string,
  exerciseId: string,
) {
  await deleteStudentWorkoutExercise(
    studentId,
    workoutPlanId,
    workoutDayId,
    exerciseId,
  );
  revalidatePath(
    `/personal/students/${studentId}/workout-plans/${workoutPlanId}/edit`,
  );
}
