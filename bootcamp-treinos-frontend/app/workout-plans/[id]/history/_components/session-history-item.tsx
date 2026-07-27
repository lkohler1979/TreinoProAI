import dayjs from "dayjs";
import { Timer, Dumbbell } from "lucide-react";
import type { GetWorkoutSessions200ItemSessionsItem } from "@/app/_lib/api/fetch-generated";

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

interface SessionHistoryItemProps {
  session: GetWorkoutSessions200ItemSessionsItem;
}

export function SessionHistoryItem({ session }: SessionHistoryItemProps) {
  const durationInMinutes = Math.round(session.durationInSeconds / 60);
  const completedDate = dayjs(session.completedAt);

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {session.name}
        </h3>
        <span className="font-heading text-xs text-muted-foreground">
          {completedDate.format("DD/MM/YYYY")}
        </span>
      </div>
      <p className="font-heading text-xs text-muted-foreground">
        {WEEKDAY_LABELS[session.weekDay]}
      </p>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Timer className="size-3.5 text-muted-foreground" />
          <span className="font-heading text-xs text-muted-foreground">
            {durationInMinutes}min
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Dumbbell className="size-3.5 text-muted-foreground" />
          <span className="font-heading text-xs text-muted-foreground">
            {session.exercisesCount} exercícios
          </span>
        </div>
      </div>
    </div>
  );
}
