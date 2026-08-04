import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getStudentWorkoutPlanDetails,
  listMuscleGroups,
} from "@/app/_lib/api/fetch-generated";
import { Accordion } from "@/components/ui/accordion";
import { WEEK_DAYS } from "@/app/_lib/week-days";
import { EditWorkoutDaySection } from "@/app/workout-plans/[id]/edit/_components/edit-workout-day-section";
import type { WorkoutPlanEditActions } from "@/app/workout-plans/[id]/edit/_lib/actions-types";
import {
  createStudentWorkoutExerciseAction,
  deleteStudentWorkoutExerciseAction,
  updateStudentWorkoutDayAction,
  updateStudentWorkoutExerciseAction,
} from "./_actions";

export default async function EditStudentWorkoutPlanPage({
  params,
}: {
  params: Promise<{ studentId: string; workoutPlanId: string }>;
}) {
  const { studentId, workoutPlanId } = await params;

  const [planResponse, muscleGroupsResponse] = await Promise.all([
    getStudentWorkoutPlanDetails(studentId, workoutPlanId),
    listMuscleGroups(),
  ]);

  if (planResponse.status !== 200) {
    redirect(`/personal/students/${studentId}/workout-plans`);
  }
  if (muscleGroupsResponse.status !== 200) {
    throw new Error("Failed to fetch muscle groups");
  }

  const sortedDays = [...planResponse.data.workoutDays].sort(
    (a, b) => WEEK_DAYS.indexOf(a.weekDay) - WEEK_DAYS.indexOf(b.weekDay),
  );

  const editActions: WorkoutPlanEditActions = {
    updateWorkoutDay: updateStudentWorkoutDayAction.bind(null, studentId),
    createWorkoutExercise: createStudentWorkoutExerciseAction.bind(
      null,
      studentId,
    ),
    updateWorkoutExercise: updateStudentWorkoutExerciseAction.bind(
      null,
      studentId,
    ),
    deleteWorkoutExercise: deleteStudentWorkoutExerciseAction.bind(
      null,
      studentId,
    ),
  };

  return (
    <div className="flex min-h-svh flex-col bg-background pb-10">
      <div className="flex h-14 items-center gap-3 px-5">
        <Link href={`/personal/students/${studentId}/workout-plans`}>
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
              workoutPlanId={workoutPlanId}
              day={day}
              muscleGroups={muscleGroupsResponse.data}
              actions={editActions}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
