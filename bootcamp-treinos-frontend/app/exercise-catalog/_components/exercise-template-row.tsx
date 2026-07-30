"use client";

import { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ListMuscleGroups200ItemExerciseTemplatesItem } from "@/app/_lib/api/fetch-generated";
import {
  deleteExerciseTemplateAction,
  updateExerciseTemplateAction,
} from "../_actions";

const exerciseTemplateFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do exercício"),
});

type ExerciseTemplateFormValues = z.infer<typeof exerciseTemplateFormSchema>;

interface ExerciseTemplateRowProps {
  muscleGroupId: string;
  exerciseTemplate: ListMuscleGroups200ItemExerciseTemplatesItem;
}

export function ExerciseTemplateRow({
  muscleGroupId,
  exerciseTemplate,
}: ExerciseTemplateRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExerciseTemplateFormValues>({
    resolver: zodResolver(exerciseTemplateFormSchema),
    defaultValues: { name: exerciseTemplate.name },
  });

  const onSubmit = (values: ExerciseTemplateFormValues) => {
    startTransition(async () => {
      await updateExerciseTemplateAction(
        muscleGroupId,
        exerciseTemplate.id,
        values.name,
      );
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteExerciseTemplateAction(muscleGroupId, exerciseTemplate.id);
    });
  };

  if (isEditing) {
    return (
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
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
      <span className="font-heading text-sm text-foreground">
        {exerciseTemplate.name}
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
  );
}
