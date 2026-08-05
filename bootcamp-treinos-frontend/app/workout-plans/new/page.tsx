import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import {
  getUserTrainData,
  getWorkoutTemplate,
  listMuscleGroups,
  listWorkoutTemplates,
} from "@/app/_lib/api/fetch-generated";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { WorkoutCategory } from "@/app/_lib/workout-categories";
import { WORKOUT_CATEGORIES } from "@/app/_lib/workout-categories";
import { createManualWorkoutPlanAction } from "./_actions";
import { ManualWorkoutPlanForm } from "./_components/manual-workout-plan-form";

interface NewWorkoutPlanPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function NewWorkoutPlanPage({
  searchParams,
}: NewWorkoutPlanPageProps) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const trainData = await getUserTrainData();
  const missingProfile = trainData.status === 200 && !trainData.data;
  if (missingProfile) redirect("/profile/setup");

  const [muscleGroupsResponse, workoutTemplatesResponse] = await Promise.all([
    listMuscleGroups(),
    listWorkoutTemplates(),
  ]);

  if (muscleGroupsResponse.status !== 200) {
    throw new Error("Failed to fetch muscle groups");
  }
  if (workoutTemplatesResponse.status !== 200) {
    throw new Error("Failed to fetch workout templates");
  }

  const workoutTemplateDetails = await Promise.all(
    workoutTemplatesResponse.data.map(async (template) => {
      const response = await getWorkoutTemplate(template.id);
      if (response.status !== 200) {
        throw new Error("Failed to fetch workout template");
      }
      return response.data;
    }),
  );

  const { category } = await searchParams;
  const initialCategory = WORKOUT_CATEGORIES.includes(
    category as WorkoutCategory,
  )
    ? (category as WorkoutCategory)
    : undefined;

  return (
    <div className="flex min-h-svh flex-col bg-background pb-10">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href="/profile">
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Criar Treino Manualmente
        </h1>
      </div>

      <div className="px-5">
        <ManualWorkoutPlanForm
          muscleGroups={muscleGroupsResponse.data}
          workoutTemplates={workoutTemplateDetails}
          initialCategory={initialCategory}
          onCreate={createManualWorkoutPlanAction}
        />
      </div>
    </div>
  );
}
