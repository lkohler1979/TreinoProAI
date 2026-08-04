"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createStudentWorkoutPlan,
  type CreateStudentWorkoutPlanBody,
} from "@/app/_lib/api/fetch-generated";

export async function createStudentWorkoutPlanAction(
  studentId: string,
  payload: CreateStudentWorkoutPlanBody,
) {
  const response = await createStudentWorkoutPlan(studentId, payload);
  if (response.status !== 201) {
    throw new Error("Failed to create workout plan");
  }
  revalidatePath(`/personal/students/${studentId}/workout-plans`);
  redirect(
    `/personal/students/${studentId}/workout-plans/${response.data.id}/edit`,
  );
}
