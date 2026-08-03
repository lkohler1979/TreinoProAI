import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import {
  getExerciseLoadHistory,
  getUserTrainData,
} from "@/app/_lib/api/fetch-generated";
import dayjs from "dayjs";
import { ArrowLeft, Weight } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/app/_components/bottom-nav";

export default async function ExerciseLoadHistoryPage({
  params,
}: {
  params: Promise<{ id: string; dayId: string; exerciseId: string }>;
}) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const { id, dayId, exerciseId } = await params;

  const [historyResponse, trainData] = await Promise.all([
    getExerciseLoadHistory(exerciseId),
    getUserTrainData(),
  ]);

  if (trainData.status === 200 && !trainData.data) {
    redirect("/profile/setup");
  }

  if (historyResponse.status !== 200) redirect(`/workout-plans/${id}/days/${dayId}`);

  const entries = historyResponse.data;

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href={`/workout-plans/${id}/days/${dayId}`}>
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Histórico de Carga
        </h1>
      </div>

      <div className="flex flex-col gap-3 px-5">
        {entries.length === 0 ? (
          <p className="py-10 text-center font-heading text-sm text-muted-foreground">
            Nenhuma carga registrada ainda.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <Weight className="size-4 text-muted-foreground" />
                <span className="font-heading text-base font-semibold text-foreground">
                  {entry.loadInKg}kg
                </span>
              </div>
              <span className="font-heading text-xs text-muted-foreground">
                {dayjs(entry.recordedAt).format("DD/MM/YYYY [às] HH:mm")}
              </span>
            </div>
          ))
        )}
      </div>

      <BottomNav activePage="calendar" />
    </div>
  );
}
