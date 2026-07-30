"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ListMuscleGroups200Item } from "@/app/_lib/api/fetch-generated";
import { WEEK_DAY_LABELS, type ManualWorkoutPlanFormValues } from "../_lib/schema";
import { ExerciseFieldsRow } from "./exercise-fields-row";

interface WorkoutDayFormSectionProps {
  dayIndex: number;
  muscleGroups: ListMuscleGroups200Item[];
}

export function WorkoutDayFormSection({
  dayIndex,
  muscleGroups,
}: WorkoutDayFormSectionProps) {
  const { control, formState } = useFormContext<ManualWorkoutPlanFormValues>();
  const isRestName = `workoutDays.${dayIndex}.isRest` as const;
  const nameName = `workoutDays.${dayIndex}.name` as const;
  const durationName = `workoutDays.${dayIndex}.durationInMinutes` as const;
  const weekDayName = `workoutDays.${dayIndex}.weekDay` as const;
  const exercisesName = `workoutDays.${dayIndex}.exercises` as const;

  const weekDay = useWatch({ control, name: weekDayName });
  const isRest = useWatch({ control, name: isRestName });
  const dayName = useWatch({ control, name: nameName });

  const { fields, append, remove } = useFieldArray({
    control,
    name: exercisesName,
  });

  const exercisesError = formState.errors.workoutDays?.[dayIndex]?.exercises?.root?.message;

  return (
    <AccordionItem
      value={`day-${dayIndex}`}
      className="rounded-xl border border-border px-4"
    >
      <AccordionTrigger>
        <div className="flex flex-1 flex-col items-start gap-0.5">
          <span className="font-heading text-sm font-semibold text-foreground">
            {WEEK_DAY_LABELS[weekDay]}
          </span>
          <span className="font-heading text-xs text-muted-foreground">
            {isRest ? "Descanso" : dayName || "Dia de treino"}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3">
        <FormField
          control={control}
          name={isRestName}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <span className="font-heading text-sm text-foreground">
                Dia de descanso
              </span>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!isRest && (
          <>
            <FormField
              control={control}
              name={nameName}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nome do dia (ex: Peito e Tríceps)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={durationName}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="Duração estimada (minutos)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              {fields.map((field, exerciseIndex) => (
                <ExerciseFieldsRow
                  key={field.id}
                  dayIndex={dayIndex}
                  exerciseIndex={exerciseIndex}
                  muscleGroups={muscleGroups}
                  onRemove={() => remove(exerciseIndex)}
                />
              ))}
            </div>

            {exercisesError && (
              <p className="font-heading text-xs text-destructive">
                {exercisesError}
              </p>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start gap-1.5 text-muted-foreground"
              onClick={() =>
                append({
                  muscleGroupId: "",
                  exerciseTemplateId: "",
                  sets: "3",
                  reps: "12",
                  restTimeInSeconds: "60",
                })
              }
            >
              <Plus className="size-3.5" />
              Adicionar exercício
            </Button>
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
