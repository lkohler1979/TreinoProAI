"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CreateWorkoutPlanBody,
  ListMuscleGroups200Item,
} from "@/app/_lib/api/fetch-generated";
import {
  GOAL_OPTIONS,
  WEEK_DAYS,
  manualWorkoutPlanFormSchema,
  type ManualWorkoutPlanFormValues,
} from "../_lib/schema";
import { WorkoutDayFormSection } from "./workout-day-form-section";

const DEFAULT_DAILY_WATER_GOAL_IN_ML = 2000;

interface ManualWorkoutPlanFormProps {
  muscleGroups: ListMuscleGroups200Item[];
  onCreate: (payload: CreateWorkoutPlanBody) => Promise<void>;
}

export function ManualWorkoutPlanForm({
  muscleGroups,
  onCreate,
}: ManualWorkoutPlanFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ManualWorkoutPlanFormValues>({
    resolver: zodResolver(manualWorkoutPlanFormSchema),
    defaultValues: {
      goal: "",
      workoutDays: WEEK_DAYS.map((weekDay) => ({
        weekDay,
        isRest: true,
        name: "",
        durationInMinutes: "",
        exercises: [],
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "workoutDays",
  });

  const onSubmit = (values: ManualWorkoutPlanFormValues) => {
    const payload: CreateWorkoutPlanBody = {
      goal: values.goal
        ? (values.goal as CreateWorkoutPlanBody["goal"])
        : undefined,
      dailyWaterGoalInMl: DEFAULT_DAILY_WATER_GOAL_IN_ML,
      meals: [],
      workoutDays: values.workoutDays.map((day) => ({
        name: day.isRest ? "Descanso" : day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.isRest
          ? 1
          : Math.max(1, Math.round(Number(day.durationInMinutes) * 60)),
        exercises: day.isRest
          ? []
          : day.exercises.map((exercise, index) => {
              const group = muscleGroups.find(
                (item) => item.id === exercise.muscleGroupId,
              );
              const exerciseTemplate = group?.exerciseTemplates.find(
                (item) => item.id === exercise.exerciseTemplateId,
              );

              return {
                order: index,
                name: exerciseTemplate?.name ?? "Exercício",
                sets: Number(exercise.sets),
                reps: Number(exercise.reps),
                restTimeInSeconds: Number(exercise.restTimeInSeconds),
              };
            }),
      })),
    };

    startTransition(async () => {
      await onCreate(payload);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 pb-10"
      >
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GOAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Accordion type="multiple" className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <WorkoutDayFormSection
              key={field.id}
              dayIndex={index}
              muscleGroups={muscleGroups}
            />
          ))}
        </Accordion>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl"
        >
          Criar plano de treino
        </Button>
      </form>
    </Form>
  );
}
