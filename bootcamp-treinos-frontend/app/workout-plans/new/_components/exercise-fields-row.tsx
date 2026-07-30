"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListMuscleGroups200Item } from "@/app/_lib/api/fetch-generated";
import type { ManualWorkoutPlanFormValues } from "../_lib/schema";

interface ExerciseFieldsRowProps {
  dayIndex: number;
  exerciseIndex: number;
  muscleGroups: ListMuscleGroups200Item[];
  onRemove: () => void;
}

export function ExerciseFieldsRow({
  dayIndex,
  exerciseIndex,
  muscleGroups,
  onRemove,
}: ExerciseFieldsRowProps) {
  const { control, setValue } = useFormContext<ManualWorkoutPlanFormValues>();
  const muscleGroupIdName =
    `workoutDays.${dayIndex}.exercises.${exerciseIndex}.muscleGroupId` as const;
  const exerciseTemplateIdName =
    `workoutDays.${dayIndex}.exercises.${exerciseIndex}.exerciseTemplateId` as const;
  const setsName = `workoutDays.${dayIndex}.exercises.${exerciseIndex}.sets` as const;
  const repsName = `workoutDays.${dayIndex}.exercises.${exerciseIndex}.reps` as const;
  const restTimeInSecondsName =
    `workoutDays.${dayIndex}.exercises.${exerciseIndex}.restTimeInSeconds` as const;

  const selectedMuscleGroupId = useWatch({
    control,
    name: muscleGroupIdName,
  });

  const selectedMuscleGroup = muscleGroups.find(
    (group) => group.id === selectedMuscleGroupId,
  );

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="font-heading text-xs font-semibold uppercase text-muted-foreground">
          Exercício {exerciseIndex + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5 text-muted-foreground" />
        </Button>
      </div>

      <FormField
        control={control}
        name={muscleGroupIdName}
        render={({ field }) => (
          <FormItem>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setValue(exerciseTemplateIdName, "");
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Grupo muscular" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={exerciseTemplateIdName}
        render={({ field }) => (
          <FormItem>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!selectedMuscleGroup}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Exercício" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {selectedMuscleGroup?.exerciseTemplates.map(
                  (exerciseTemplate) => (
                    <SelectItem
                      key={exerciseTemplate.id}
                      value={exerciseTemplate.id}
                    >
                      {exerciseTemplate.name}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-2">
        <FormField
          control={control}
          name={setsName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="Séries"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={repsName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} type="number" min="1" placeholder="Reps" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={restTimeInSecondsName}
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
    </div>
  );
}
