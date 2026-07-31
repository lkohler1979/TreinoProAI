"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListMuscleGroups200Item } from "@/app/_lib/api/fetch-generated";
import { createWorkoutExerciseAction } from "../_actions";

const numericString = () =>
  z.string().refine((value) => value !== "" && Number(value) > 0, {
    message: "Valor inválido",
  });

const addExerciseFormSchema = z.object({
  muscleGroupId: z.string().min(1, "Selecione o grupo muscular"),
  exerciseTemplateId: z.string().min(1, "Selecione o exercício"),
  sets: numericString(),
  reps: numericString(),
  restTimeInSeconds: numericString(),
});

type AddExerciseFormValues = z.infer<typeof addExerciseFormSchema>;

interface AddExerciseFormProps {
  workoutPlanId: string;
  workoutDayId: string;
  muscleGroups: ListMuscleGroups200Item[];
}

export function AddExerciseForm({
  workoutPlanId,
  workoutDayId,
  muscleGroups,
}: AddExerciseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddExerciseFormValues>({
    resolver: zodResolver(addExerciseFormSchema),
    defaultValues: {
      muscleGroupId: "",
      exerciseTemplateId: "",
      sets: "3",
      reps: "12",
      restTimeInSeconds: "60",
    },
  });

  const selectedMuscleGroupId = useWatch({
    control: form.control,
    name: "muscleGroupId",
  });
  const selectedMuscleGroup = muscleGroups.find(
    (group) => group.id === selectedMuscleGroupId,
  );

  const onSubmit = (values: AddExerciseFormValues) => {
    const exerciseTemplate = selectedMuscleGroup?.exerciseTemplates.find(
      (item) => item.id === values.exerciseTemplateId,
    );

    startTransition(async () => {
      await createWorkoutExerciseAction(workoutPlanId, workoutDayId, {
        name: exerciseTemplate?.name ?? "Exercício",
        sets: Number(values.sets),
        reps: Number(values.reps),
        restTimeInSeconds: Number(values.restTimeInSeconds),
      });
      form.reset();
      setIsOpen(false);
    });
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="justify-start gap-1.5 text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-3.5" />
        Adicionar exercício
      </Button>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 rounded-lg border border-border p-3"
      >
        <FormField
          control={form.control}
          name="muscleGroupId"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("exerciseTemplateId", "");
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
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exerciseTemplateId"
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
            </FormItem>
          )}
        />

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
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Adicionar
          </Button>
        </div>
      </form>
    </Form>
  );
}
