"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleHelp, History, Play, Weight, Zap } from "lucide-react";
import { useQueryStates, parseAsBoolean, parseAsString } from "nuqs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { GetWorkoutDay200ExercisesItem } from "@/app/_lib/api/fetch-generated";
import { EXERCISE_METHOD_LABELS } from "@/app/_lib/exercise-methods";
import { updateExerciseLoadAction } from "../_actions";
import { RestTimerOverlay } from "./rest-timer-overlay";

const loadFormSchema = z.object({
  loadInKg: z
    .string()
    .refine((value) => value !== "" && Number(value) >= 0, {
      message: "Informe uma carga válida",
    }),
});

type LoadFormValues = z.infer<typeof loadFormSchema>;

interface ExerciseCardProps {
  exercise: GetWorkoutDay200ExercisesItem;
  workoutPlanId: string;
  workoutDayId: string;
}

export function ExerciseCard({
  exercise,
  workoutPlanId,
  workoutDayId,
}: ExerciseCardProps) {
  const [, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
    chat_initial_message: parseAsString,
  });
  const [isPending, startTransition] = useTransition();
  const [isResting, setIsResting] = useState(false);

  const form = useForm<LoadFormValues>({
    resolver: zodResolver(loadFormSchema),
    defaultValues: {
      loadInKg: exercise.loadInKg != null ? String(exercise.loadInKg) : "",
    },
  });

  const handleHelp = () => {
    setChatParams({
      chat_open: true,
      chat_initial_message: `Como executar o exercício ${exercise.name} corretamente?`,
    });
  };

  const onSubmit = (values: LoadFormValues) => {
    startTransition(async () => {
      await updateExerciseLoadAction(
        workoutPlanId,
        workoutDayId,
        exercise.id,
        Number(values.loadInKg),
      );
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-foreground">
          {exercise.name}
        </span>
        <Button variant="ghost" size="icon" onClick={handleHelp}>
          <CircleHelp className="size-5 text-muted-foreground" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          {exercise.sets} séries
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          {exercise.reps} reps
        </span>
        {exercise.method !== "NORMAL" && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-heading text-xs font-semibold uppercase text-primary">
            {EXERCISE_METHOD_LABELS[exercise.method]}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsResting(true)}
          className="h-auto gap-1 rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground hover:bg-accent"
        >
          <Zap className="size-3.5" />
          {exercise.restTimeInSeconds}s
          <Play className="size-3 fill-current" />
        </Button>
      </div>

      {isResting && (
        <RestTimerOverlay
          exerciseName={exercise.name}
          sets={exercise.sets}
          loadInKg={exercise.loadInKg}
          restTimeInSeconds={exercise.restTimeInSeconds}
          onClose={() => setIsResting(false)}
        />
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-2 border-t border-border pt-3"
        >
          <Weight className="size-4 shrink-0 text-muted-foreground" />
          <FormField
            control={form.control}
            name="loadInKg"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Carga (kg)"
                    className="h-8 text-sm"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isPending}
          >
            Salvar
          </Button>
          <Link
            href={`/workout-plans/${workoutPlanId}/days/${workoutDayId}/exercises/${exercise.id}/history`}
          >
            <History className="size-4 text-muted-foreground" />
          </Link>
        </form>
      </Form>
    </div>
  );
}
