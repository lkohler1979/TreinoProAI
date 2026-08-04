"use client";

import { useTransition } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import type {
  GetWorkoutPlanDetails200WorkoutDaysItem,
  ListMuscleGroups200Item,
} from "@/app/_lib/api/fetch-generated";
import { WEEK_DAY_LABELS } from "@/app/_lib/week-days";
import type { WorkoutPlanEditActions } from "../_lib/actions-types";
import { AddExerciseForm } from "./add-exercise-form";
import { EditDayDetailsForm } from "./edit-day-details-form";
import { EditExerciseRow } from "./edit-exercise-row";

interface EditWorkoutDaySectionProps {
  workoutPlanId: string;
  day: GetWorkoutPlanDetails200WorkoutDaysItem;
  muscleGroups: ListMuscleGroups200Item[];
  actions: WorkoutPlanEditActions;
}

export function EditWorkoutDaySection({
  workoutPlanId,
  day,
  muscleGroups,
  actions,
}: EditWorkoutDaySectionProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggleRest = (isRest: boolean) => {
    startTransition(async () => {
      await actions.updateWorkoutDay(workoutPlanId, day.id, {
        name: isRest ? "Descanso" : "Novo treino",
        isRest,
        estimatedDurationInSeconds: isRest ? 1 : 3600,
      });
    });
  };

  return (
    <AccordionItem
      value={day.id}
      className="rounded-xl border border-border px-4"
    >
      <AccordionTrigger>
        <div className="flex flex-1 flex-col items-start gap-0.5">
          <span className="font-heading text-sm font-semibold text-foreground">
            {WEEK_DAY_LABELS[day.weekDay]}
          </span>
          <span className="font-heading text-xs text-muted-foreground">
            {day.isRest ? "Descanso" : day.name || "Dia de treino"}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <span className="font-heading text-sm text-foreground">
            Dia de descanso
          </span>
          <Switch
            checked={day.isRest}
            disabled={isPending}
            onCheckedChange={handleToggleRest}
          />
        </div>

        {!day.isRest && (
          <>
            <EditDayDetailsForm
              workoutPlanId={workoutPlanId}
              day={day}
              actions={actions}
            />

            <div className="flex flex-col gap-2">
              {day.exercises.map((exercise) => (
                <EditExerciseRow
                  key={exercise.id}
                  workoutPlanId={workoutPlanId}
                  workoutDayId={day.id}
                  exercise={exercise}
                  actions={actions}
                />
              ))}
            </div>

            <AddExerciseForm
              workoutPlanId={workoutPlanId}
              workoutDayId={day.id}
              muscleGroups={muscleGroups}
              actions={actions}
            />
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
