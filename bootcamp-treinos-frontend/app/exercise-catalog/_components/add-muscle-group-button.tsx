"use client";

import { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createMuscleGroupAction } from "../_actions";

const muscleGroupFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do grupo"),
});

type MuscleGroupFormValues = z.infer<typeof muscleGroupFormSchema>;

export function AddMuscleGroupButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<MuscleGroupFormValues>({
    resolver: zodResolver(muscleGroupFormSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: MuscleGroupFormValues) => {
    startTransition(async () => {
      await createMuscleGroupAction(values.name);
      form.reset();
      setIsOpen(false);
    });
  };

  if (isOpen) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card p-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} autoFocus placeholder="Nome do grupo" />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" disabled={isPending}>
            Criar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
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
      variant="outline"
      onClick={() => setIsOpen(true)}
      className="w-full gap-1.5 rounded-xl"
    >
      <Plus className="size-4" />
      Adicionar grupo muscular
    </Button>
  );
}
