"use server";

import { revalidatePath } from "next/cache";
import {
  createExerciseTemplate,
  createMuscleGroup,
  deleteExerciseTemplate,
  deleteMuscleGroup,
  updateExerciseTemplate,
  updateMuscleGroup,
} from "@/app/_lib/api/fetch-generated";

export async function createMuscleGroupAction(name: string) {
  const response = await createMuscleGroup({ name });
  if (response.status !== 201) {
    throw new Error("Failed to create muscle group");
  }
  revalidatePath("/exercise-catalog");
  return response.data;
}

export async function updateMuscleGroupAction(
  muscleGroupId: string,
  name: string,
) {
  await updateMuscleGroup(muscleGroupId, { name });
  revalidatePath("/exercise-catalog");
}

export async function deleteMuscleGroupAction(muscleGroupId: string) {
  await deleteMuscleGroup(muscleGroupId);
  revalidatePath("/exercise-catalog");
}

export async function createExerciseTemplateAction(
  muscleGroupId: string,
  name: string,
) {
  const response = await createExerciseTemplate(muscleGroupId, { name });
  if (response.status !== 201) {
    throw new Error("Failed to create exercise template");
  }
  revalidatePath("/exercise-catalog");
  return response.data;
}

export async function updateExerciseTemplateAction(
  muscleGroupId: string,
  exerciseTemplateId: string,
  name: string,
) {
  await updateExerciseTemplate(muscleGroupId, exerciseTemplateId, { name });
  revalidatePath("/exercise-catalog");
}

export async function deleteExerciseTemplateAction(
  muscleGroupId: string,
  exerciseTemplateId: string,
) {
  await deleteExerciseTemplate(muscleGroupId, exerciseTemplateId);
  revalidatePath("/exercise-catalog");
}
