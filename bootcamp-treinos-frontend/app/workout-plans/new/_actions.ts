"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createWorkoutPlan,
  type CreateWorkoutPlanBody,
} from "@/app/_lib/api/fetch-generated";

export async function createManualWorkoutPlanAction(
  payload: CreateWorkoutPlanBody,
) {
  const response = await createWorkoutPlan(payload);
  if (response.status !== 201) {
    throw new Error("Failed to create workout plan");
  }
  revalidatePath("/");
  redirect(`/workout-plans/${response.data.id}`);
}
