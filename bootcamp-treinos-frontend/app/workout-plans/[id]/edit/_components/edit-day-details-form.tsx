"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { GetWorkoutPlanDetails200WorkoutDaysItem } from "@/app/_lib/api/fetch-generated";
import { updateWorkoutDayAction } from "../_actions";

const dayDetailsFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do dia"),
  durationInMinutes: z
    .string()
    .refine((value) => value !== "" && Number(value) > 0, {
      message: "Informe a duração estimada",
    }),
});

type DayDetailsFormValues = z.infer<typeof dayDetailsFormSchema>;

interface EditDayDetailsFormProps {
  workoutPlanId: string;
  day: GetWorkoutPlanDetails200WorkoutDaysItem;
}

export function EditDayDetailsForm({
  workoutPlanId,
  day,
}: EditDayDetailsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<DayDetailsFormValues>({
    resolver: zodResolver(dayDetailsFormSchema),
    values: {
      name: day.name === "Descanso" ? "" : day.name,
      durationInMinutes: String(Math.round(day.estimatedDurationInSeconds / 60)),
    },
  });

  const onSubmit = (values: DayDetailsFormValues) => {
    startTransition(async () => {
      await updateWorkoutDayAction(workoutPlanId, day.id, {
        name: values.name,
        isRest: false,
        estimatedDurationInSeconds: Math.max(
          1,
          Math.round(Number(values.durationInMinutes) * 60),
        ),
      });
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nome do dia (ex: Peito e Tríceps)"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="durationInMinutes"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    placeholder="Duração estimada (minutos)"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" disabled={isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
