"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { GetWorkoutPlanDetails200WorkoutDaysItemExercisesItem } from "@/app/_lib/api/fetch-generated";
import type { WorkoutPlanEditActions } from "../_lib/actions-types";

const numericString = () =>
  z.string().refine((value) => value !== "" && Number(value) > 0, {
    message: "Valor inválido",
  });

const exerciseFormSchema = z.object({
  sets: numericString(),
  reps: numericString(),
  restTimeInSeconds: numericString(),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

interface EditExerciseRowProps {
  workoutPlanId: string;
  workoutDayId: string;
  exercise: GetWorkoutPlanDetails200WorkoutDaysItemExercisesItem;
  actions: WorkoutPlanEditActions;
}

export function EditExerciseRow({
  workoutPlanId,
  workoutDayId,
  exercise,
  actions,
}: EditExerciseRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      sets: String(exercise.sets),
      reps: String(exercise.reps),
      restTimeInSeconds: String(exercise.restTimeInSeconds),
    },
  });

  const onSubmit = (values: ExerciseFormValues) => {
    startTransition(async () => {
      await actions.updateWorkoutExercise(
        workoutPlanId,
        workoutDayId,
        exercise.id,
        {
          name: exercise.name,
          sets: Number(values.sets),
          reps: Number(values.reps),
          restTimeInSeconds: Number(values.restTimeInSeconds),
        },
      );
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await actions.deleteWorkoutExercise(
        workoutPlanId,
        workoutDayId,
        exercise.id,
      );
    });
  };

  if (isEditing) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2 rounded-lg border border-border p-3"
        >
          <span className="font-heading text-sm font-semibold text-foreground">
            {exercise.name}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <FormField
              control={form.control}
              name="sets"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="number" min="1" placeholder="Séries" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reps"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="number" min="1" placeholder="Reps" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="restTimeInSeconds"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="Descanso (s)"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="xs" disabled={isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-heading text-sm font-semibold text-foreground">
          {exercise.name}
        </span>
        <span className="font-heading text-xs text-muted-foreground">
          {exercise.sets}x{exercise.reps} · {exercise.restTimeInSeconds}s descanso
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="size-3.5 text-muted-foreground" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isPending}
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
