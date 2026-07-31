"use server";

import { revalidatePath } from "next/cache";
import { deleteWorkoutPlan } from "@/app/_lib/api/fetch-generated";

export async function deleteWorkoutPlanAction(workoutPlanId: string) {
  await deleteWorkoutPlan(workoutPlanId);
  revalidatePath("/workout-plans/[id]/history", "page");
  revalidatePath("/");
}
