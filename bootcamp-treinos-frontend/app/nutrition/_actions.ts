"use server";

import { revalidatePath } from "next/cache";
import {
  analyzeMealPhoto,
  createMeal,
  createWaterIntakeEntry,
  deleteMeal,
  updateMeal,
} from "@/app/_lib/api/fetch-generated";

interface MealInput {
  name: string;
  time: string;
  description: string;
  calories: number;
  proteinInGrams: number;
  carbsInGrams: number;
  fatInGrams: number;
}

export async function logWaterAction(amountInMl: number) {
  await createWaterIntakeEntry({ amountInMl });
  revalidatePath("/nutrition");
}

export async function createMealAction(
  workoutPlanId: string,
  meal: MealInput,
) {
  await createMeal(workoutPlanId, meal);
  revalidatePath("/nutrition");
}

export async function updateMealAction(
  workoutPlanId: string,
  mealId: string,
  meal: MealInput,
) {
  await updateMeal(workoutPlanId, mealId, meal);
  revalidatePath("/nutrition");
}

export async function deleteMealAction(workoutPlanId: string, mealId: string) {
  await deleteMeal(workoutPlanId, mealId);
  revalidatePath("/nutrition");
}

export async function analyzeMealPhotoAction(image: string) {
  const response = await analyzeMealPhoto({ image });
  if (response.status !== 200) {
    throw new Error("Failed to analyze meal photo");
  }
  return response.data;
}
