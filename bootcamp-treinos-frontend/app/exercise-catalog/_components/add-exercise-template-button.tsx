"use client";

import { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createExerciseTemplateAction } from "../_actions";

const exerciseTemplateFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do exercício"),
});

type ExerciseTemplateFormValues = z.infer<typeof exerciseTemplateFormSchema>;

interface AddExerciseTemplateButtonProps {
  muscleGroupId: string;
}

export function AddExerciseTemplateButton({
  muscleGroupId,
}: AddExerciseTemplateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExerciseTemplateFormValues>({
    resolver: zodResolver(exerciseTemplateFormSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: ExerciseTemplateFormValues) => {
    startTransition(async () => {
      await createExerciseTemplateAction(muscleGroupId, values.name);
      form.reset();
      setIsOpen(false);
    });
  };

  if (isOpen) {
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
                  <Input
                    {...field}
                    autoFocus
                    className="h-8"
                    placeholder="Nome do exercício"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" size="xs" disabled={isPending}>
            Adicionar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setIsOpen(true)}
      className="w-full justify-start gap-1.5 text-muted-foreground"
    >
      <Plus className="size-3.5" />
      Adicionar exercício
    </Button>
  );
}
