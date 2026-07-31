import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import {
  getWorkoutPlanDetails,
  listMuscleGroups,
} from "@/app/_lib/api/fetch-generated";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Accordion } from "@/components/ui/accordion";
import { WEEK_DAYS } from "@/app/_lib/week-days";
import { EditWorkoutDaySection } from "./_components/edit-workout-day-section";

export default async function EditWorkoutPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const { id } = await params;

  const [planResponse, muscleGroupsResponse] = await Promise.all([
    getWorkoutPlanDetails(id),
    listMuscleGroups(),
  ]);

  if (planResponse.status !== 200) redirect(`/workout-plans/${id}`);
  if (muscleGroupsResponse.status !== 200) {
    throw new Error("Failed to fetch muscle groups");
  }

  const sortedDays = [...planResponse.data.workoutDays].sort(
    (a, b) => WEEK_DAYS.indexOf(a.weekDay) - WEEK_DAYS.indexOf(b.weekDay),
  );

  return (
    <div className="flex min-h-svh flex-col bg-background pb-10">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href={`/workout-plans/${id}`}>
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Editar Plano de Treino
        </h1>
      </div>

      <div className="px-5">
        <Accordion type="multiple" className="flex flex-col gap-2">
          {sortedDays.map((day) => (
            <EditWorkoutDaySection
              key={day.id}
              workoutPlanId={id}
              day={day}
              muscleGroups={muscleGroupsResponse.data}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
