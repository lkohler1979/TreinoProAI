"use server";

import { revalidatePath } from "next/cache";
import { deleteStudentWorkoutPlan } from "@/app/_lib/api/fetch-generated";

export async function deleteStudentWorkoutPlanAction(
  studentId: string,
  workoutPlanId: string,
) {
  await deleteStudentWorkoutPlan(studentId, workoutPlanId);
  revalidatePath(`/personal/students/${studentId}/workout-plans`);
}
