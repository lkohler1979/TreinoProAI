"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Sparkles } from "lucide-react";
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
import type {
  GetWorkoutTemplate200,
  ListMuscleGroups200Item,
} from "@/app/_lib/api/fetch-generated";
import type { WorkoutCategory } from "@/app/_lib/workout-categories";
import type { WorkoutLevel } from "@/app/_lib/workout-levels";
import { WEEK_DAY_LABELS, type ManualWorkoutPlanFormValues } from "../_lib/schema";
import { ExerciseFieldsRow } from "./exercise-fields-row";
import { UseWorkoutTemplateDialog } from "./use-workout-template-dialog";

interface WorkoutDayFormSectionProps {
  dayIndex: number;
  muscleGroups: ListMuscleGroups200Item[];
  workoutTemplates: GetWorkoutTemplate200[];
  category?: WorkoutCategory;
  level?: WorkoutLevel;
}

export function WorkoutDayFormSection({
  dayIndex,
  muscleGroups,
  workoutTemplates,
  category,
  level,
}: WorkoutDayFormSectionProps) {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const { control, formState, setValue } =
    useFormContext<ManualWorkoutPlanFormValues>();
  const isRestName = `workoutDays.${dayIndex}.isRest` as const;
  const nameName = `workoutDays.${dayIndex}.name` as const;
  const durationName = `workoutDays.${dayIndex}.durationInMinutes` as const;
  const weekDayName = `workoutDays.${dayIndex}.weekDay` as const;
  const exercisesName = `workoutDays.${dayIndex}.exercises` as const;

  const weekDay = useWatch({ control, name: weekDayName });
  const isRest = useWatch({ control, name: isRestName });
  const dayName = useWatch({ control, name: nameName });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: exercisesName,
  });

  const exercisesError = formState.errors.workoutDays?.[dayIndex]?.exercises?.root?.message;

  const availableTemplates = workoutTemplates.filter(
    (template) =>
      (!category || template.category === category) &&
      (!level || template.level === level),
  );

  const handleApplyTemplate = (template: GetWorkoutTemplate200) => {
    setValue(nameName, template.name, { shouldValidate: true });
    setValue(
      durationName,
      String(Math.max(1, Math.round(template.estimatedDurationInSeconds / 60))),
      { shouldValidate: true },
    );

    replace(
      template.exercises.map((exercise) => {
        const group = muscleGroups.find((item) =>
          item.exerciseTemplates.some(
            (exerciseTemplate) =>
              exerciseTemplate.id === exercise.exerciseTemplateId,
          ),
        );

        return {
          muscleGroupId: group?.id ?? "",
          exerciseTemplateId: exercise.exerciseTemplateId,
          sets: String(exercise.sets),
          reps: String(exercise.reps),
          restTimeInSeconds: String(exercise.restTimeInSeconds),
          method: exercise.method,
        };
      }),
    );
  };

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

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!category || !level}
              className="justify-center gap-1.5"
              onClick={() => setIsTemplateDialogOpen(true)}
            >
              <Sparkles className="size-3.5" />
              Usar template
            </Button>
            {(!category || !level) && (
              <p className="font-heading text-xs text-muted-foreground">
                Selecione a categoria e o nível do plano para usar um
                template.
              </p>
            )}

            <UseWorkoutTemplateDialog
              open={isTemplateDialogOpen}
              onOpenChange={setIsTemplateDialogOpen}
              templates={availableTemplates}
              onSelect={handleApplyTemplate}
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
                  method: "NORMAL",
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
