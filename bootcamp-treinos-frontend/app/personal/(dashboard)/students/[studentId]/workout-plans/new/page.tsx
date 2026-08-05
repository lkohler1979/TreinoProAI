import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getWorkoutTemplate,
  listMuscleGroups,
  listWorkoutTemplates,
} from "@/app/_lib/api/fetch-generated";
import { ManualWorkoutPlanForm } from "@/app/workout-plans/new/_components/manual-workout-plan-form";
import { createStudentWorkoutPlanAction } from "./_actions";

export default async function NewStudentWorkoutPlanPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

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

  return (
    <div className="flex min-h-svh flex-col bg-background pb-10">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href={`/personal/students/${studentId}/workout-plans`}>
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Criar Treino para o Aluno
        </h1>
      </div>

      <div className="px-5">
        <ManualWorkoutPlanForm
          muscleGroups={muscleGroupsResponse.data}
          workoutTemplates={workoutTemplateDetails}
          onCreate={createStudentWorkoutPlanAction.bind(null, studentId)}
        />
      </div>
    </div>
  );
}
