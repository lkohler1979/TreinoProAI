import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import {
  getStudent,
  listStudentWorkoutPlanHistory,
} from "@/app/_lib/api/fetch-generated";
import { Button } from "@/components/ui/button";
import { StudentPlanHistorySection } from "./_components/student-plan-history-section";

export default async function StudentWorkoutPlansPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const [studentResponse, historyResponse] = await Promise.all([
    getStudent(studentId),
    listStudentWorkoutPlanHistory(studentId),
  ]);

  if (studentResponse.status !== 200) {
    redirect("/personal/students");
  }

  const plans = historyResponse.status === 200 ? historyResponse.data : [];

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background px-5 py-8 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/personal/students/${studentId}`}>
            <ArrowLeft className="size-5 text-foreground" />
          </Link>
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Treinos
          </h1>
        </div>
        <Button asChild size="sm" className="gap-1.5 rounded-full">
          <Link href={`/personal/students/${studentId}/workout-plans/new`}>
            <Plus className="size-4" />
            Novo plano
          </Link>
        </Button>
      </div>

      {plans.length === 0 ? (
        <p className="py-10 text-center font-heading text-sm text-muted-foreground">
          Nenhum plano de treino encontrado.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {plans.map((plan) => (
            <StudentPlanHistorySection
              key={plan.workoutPlanId}
              studentId={studentId}
              plan={plan}
            />
          ))}
        </div>
      )}
    </div>
  );
}
