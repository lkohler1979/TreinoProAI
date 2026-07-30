import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { listMuscleGroups } from "@/app/_lib/api/fetch-generated";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/app/_components/bottom-nav";
import { MuscleGroupCard } from "./_components/muscle-group-card";
import { AddMuscleGroupButton } from "./_components/add-muscle-group-button";

export default async function ExerciseCatalogPage() {
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

  const muscleGroups = muscleGroupsResponse.data;

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href="/profile">
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Grupos Musculares e Exercícios
        </h1>
      </div>

      <p className="px-5 pb-4 font-heading text-sm text-muted-foreground">
        Cadastre os grupos musculares e exercícios que poderão ser usados na
        montagem manual de um treino.
      </p>

      <div className="flex flex-col gap-3 px-5">
        {muscleGroups.map((muscleGroup) => (
          <MuscleGroupCard key={muscleGroup.id} muscleGroup={muscleGroup} />
        ))}
        <AddMuscleGroupButton />
      </div>

      <BottomNav activePage="profile" />
    </div>
  );
}
