import Link from "next/link";
import { CircleCheck, Hourglass, Pencil } from "lucide-react";
import type { ListStudentWorkoutPlanHistory200Item } from "@/app/_lib/api/fetch-generated";
import { SessionHistoryItem } from "@/app/workout-plans/[id]/history/_components/session-history-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteStudentPlanButton } from "./delete-student-plan-button";

function formatTotalTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h${minutes.toString().padStart(2, "0")}m`;
}

interface StudentPlanHistorySectionProps {
  studentId: string;
  plan: ListStudentWorkoutPlanHistory200Item;
}

export function StudentPlanHistorySection({
  studentId,
  plan,
}: StudentPlanHistorySectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-heading text-sm text-muted-foreground">
          {plan.workoutPlanName}
        </p>
        <div className="flex items-center gap-1">
          {plan.isActive && (
            <Badge className="rounded-full px-2.5 py-1 font-heading text-[10px] font-semibold uppercase">
              Ativo
            </Badge>
          )}
          <Button asChild variant="ghost" size="icon-xs">
            <Link
              href={`/personal/students/${studentId}/workout-plans/${plan.workoutPlanId}/edit`}
            >
              <Pencil className="size-3.5 text-muted-foreground" />
            </Link>
          </Button>
          <DeleteStudentPlanButton
            studentId={studentId}
            workoutPlanId={plan.workoutPlanId}
            workoutPlanName={plan.workoutPlanName}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-primary/8 p-3">
          <CircleCheck className="size-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-heading text-sm font-semibold text-foreground">
              {plan.completedWorkoutsCount}
            </span>
            <span className="font-heading text-[11px] text-muted-foreground">
              Treinos Feitos
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary/8 p-3">
          <Hourglass className="size-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-heading text-sm font-semibold text-foreground">
              {formatTotalTime(plan.totalTimeInSeconds)}
            </span>
            <span className="font-heading text-[11px] text-muted-foreground">
              Tempo Total
            </span>
          </div>
        </div>
      </div>

      {plan.sessions.length === 0 ? (
        <p className="py-4 text-center font-heading text-sm text-muted-foreground">
          Nenhum treino concluído neste plano.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {plan.sessions.map((session) => (
            <SessionHistoryItem key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
