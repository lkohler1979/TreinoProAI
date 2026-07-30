import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { listMuscleGroups } from "@/app/_lib/api/fetch-generated";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ManualWorkoutPlanForm } from "./_components/manual-workout-plan-form";

export default async function NewWorkoutPlanPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const muscleGroupsResponse = await listMuscleGroups();

  if (muscleGroupsResponse.status !== 200) {
    throw new Error("Failed to fetch muscle groups");
  }

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
        <ManualWorkoutPlanForm muscleGroups={muscleGroupsResponse.data} />
      </div>
    </div>
  );
}
