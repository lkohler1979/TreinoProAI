"use client";

import { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ListMuscleGroups200Item } from "@/app/_lib/api/fetch-generated";
import { deleteMuscleGroupAction, updateMuscleGroupAction } from "../_actions";
import { AddExerciseTemplateButton } from "./add-exercise-template-button";
import { ExerciseTemplateRow } from "./exercise-template-row";

const muscleGroupFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do grupo"),
});

type MuscleGroupFormValues = z.infer<typeof muscleGroupFormSchema>;

interface MuscleGroupCardProps {
  muscleGroup: ListMuscleGroups200Item;
}

export function MuscleGroupCard({ muscleGroup }: MuscleGroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<MuscleGroupFormValues>({
    resolver: zodResolver(muscleGroupFormSchema),
    defaultValues: { name: muscleGroup.name },
  });

  const onSubmit = (values: MuscleGroupFormValues) => {
    startTransition(async () => {
      await updateMuscleGroupAction(muscleGroup.id, values.name);
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMuscleGroupAction(muscleGroup.id);
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      {isEditing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center gap-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} autoFocus className="h-8" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="xs" disabled={isPending}>
              Salvar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
          </form>
        </Form>
      ) : (
        <div className="flex items-center justify-between">
          <span className="font-heading text-base font-semibold text-foreground">
            {muscleGroup.name}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {muscleGroup.exerciseTemplates.map((exerciseTemplate) => (
          <ExerciseTemplateRow
            key={exerciseTemplate.id}
            muscleGroupId={muscleGroup.id}
            exerciseTemplate={exerciseTemplate}
          />
        ))}
      </div>

      <AddExerciseTemplateButton muscleGroupId={muscleGroup.id} />
    </div>
  );
}
