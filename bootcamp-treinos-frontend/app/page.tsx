import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getHomeData, getUserTrainData } from "./_lib/api/fetch-generated";
import dayjs from "dayjs";
import Link from "next/link";
import { Flame, Calendar } from "lucide-react";
import { BottomNav } from "./_components/bottom-nav";
import {
  ConsistencyTracker,
  getWeekDates,
} from "./_components/consistency-tracker";
import { WorkoutDayCard } from "./_components/workout-day-card";
import { TipOfDay } from "./_components/tip-of-day";
import { ShareStreakCard } from "./_components/share-streak-card";

function getTipMessage(
  todayWorkoutDay: { name: string; isRest: boolean } | undefined,
  completedThisWeek: number
) {
  const timesLabel = completedThisWeek === 1 ? "vez" : "vezes";

  if (todayWorkoutDay?.isRest) {
    return `Hoje é dia de descanso. Você já treinou ${completedThisWeek} ${timesLabel} essa semana — aproveite pra recuperar.`;
  }

  if (todayWorkoutDay) {
    return `Hoje é dia de ${todayWorkoutDay.name}. Você já treinou ${completedThisWeek} ${timesLabel} essa semana.`;
  }

  return `Você já treinou ${completedThisWeek} ${timesLabel} essa semana. Continue assim!`;
}

export default async function Home() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();
  const [homeData, trainData] = await Promise.all([
    getHomeData(today.format("YYYY-MM-DD")),
    getUserTrainData(),
  ]);

  if (homeData.status !== 200) {
    throw new Error("Failed to fetch home data");
  }

  const needsOnboarding =
    !homeData.data.activeWorkoutPlanId ||
    (trainData.status === 200 && !trainData.data);
  if (needsOnboarding) redirect("/onboarding");

  const { todayWorkoutDay, workoutStreak, consistencyByDay } = homeData.data;
  const userName = session.data.user.name?.split(" ")[0] ?? "";

  const completedThisWeek = getWeekDates(today).filter(
    (date) => consistencyByDay[date.format("YYYY-MM-DD")]?.workoutDayCompleted
  ).length;
  const tipMessage = getTipMessage(todayWorkoutDay, completedThisWeek);

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div
        className="relative flex shrink-0 flex-col gap-6 px-5 pb-7 pt-6"
        style={{
          backgroundImage: "linear-gradient(160deg, #211c17 0%, #3a2c1e 100%)",
        }}
      >
        <p
          className="text-[15px] uppercase leading-[1.15] tracking-wide text-[#f2ede4]"
          style={{ fontFamily: "var(--font-anton)" }}
        >
          TreinoPro.AI
        </p>

        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold leading-[1.05] text-[#f9f5ee]">
              Olá, {userName}
            </h1>
            <p className="font-heading text-sm leading-[1.15] text-[#d8cdbe]">
              Bora treinar hoje?
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2">
            <Flame className="size-3.5 text-primary-foreground" />
            <span className="font-heading text-sm font-semibold text-primary-foreground">
              {workoutStreak}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <TipOfDay message={tipMessage} />
      </div>

      <div className="flex flex-col gap-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Sua semana
          </h2>
          <button className="font-heading text-xs text-primary">
            Ver histórico
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <ConsistencyTracker
            consistencyByDay={consistencyByDay}
            today={today}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Treino de Hoje
          </h2>
          <button className="font-heading text-xs text-primary">
            Ver treinos
          </button>
        </div>

        {todayWorkoutDay?.isRest ? (
          <div className="flex h-[120px] flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card">
            <Calendar className="size-5 text-muted-foreground" />
            <p className="font-heading text-sm font-semibold text-foreground">
              Dia de descanso
            </p>
            <p className="font-heading text-xs text-muted-foreground">
              Aproveite pra recuperar
            </p>
          </div>
        ) : todayWorkoutDay ? (
          <Link
            href={`/workout-plans/${todayWorkoutDay.workoutPlanId}/days/${todayWorkoutDay.id}`}
          >
            <WorkoutDayCard
              name={todayWorkoutDay.name}
              weekDay={todayWorkoutDay.weekDay}
              estimatedDurationInSeconds={
                todayWorkoutDay.estimatedDurationInSeconds
              }
              exercisesCount={todayWorkoutDay.exercisesCount}
              coverImageUrl={todayWorkoutDay.coverImageUrl}
            />
          </Link>
        ) : null}
      </div>

      <div className="px-5 pb-2">
        <ShareStreakCard streak={workoutStreak} userName={userName} />
      </div>

      <BottomNav />
    </div>
  );
}
