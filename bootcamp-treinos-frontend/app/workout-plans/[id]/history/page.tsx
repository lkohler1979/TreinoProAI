import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import {
  getWorkoutSessions,
  getUserTrainData,
} from "@/app/_lib/api/fetch-generated";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/app/_components/bottom-nav";
import { PlanHistorySection } from "./_components/plan-history-section";

export default async function WorkoutHistoryPage({
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

  const [sessionsResponse, trainData] = await Promise.all([
    getWorkoutSessions(),
    getUserTrainData(),
  ]);

  if (trainData.status === 200 && !trainData.data) {
    redirect("/profile/setup");
  }

  if (sessionsResponse.status !== 200) {
    throw new Error("Failed to fetch workout history");
  }

  const workoutPlans = sessionsResponse.data;

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href={`/workout-plans/${id}`}>
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Histórico de Treinos
        </h1>
      </div>

      <div className="flex flex-col gap-6 px-5">
        {workoutPlans.length === 0 ? (
          <p className="py-10 text-center font-heading text-sm text-muted-foreground">
            Nenhum plano de treino encontrado.
          </p>
        ) : (
          workoutPlans.map((plan) => (
            <PlanHistorySection key={plan.workoutPlanId} plan={plan} />
          ))
        )}
      </div>

      <BottomNav activePage="calendar" />
    </div>
  );
}
