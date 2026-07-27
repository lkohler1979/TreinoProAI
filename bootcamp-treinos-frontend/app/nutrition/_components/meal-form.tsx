"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GetWorkoutPlan200MealsItem } from "@/app/_lib/api/fetch-generated";
import { createMealAction, updateMealAction } from "../_actions";

const numericString = () =>
  z.string().refine((value) => value !== "" && Number(value) >= 0, {
    message: "Valor inválido",
  });

const mealFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da refeição"),
  time: z.string().trim().min(1, "Informe o horário"),
  description: z.string().trim().min(1, "Informe a descrição"),
  calories: numericString(),
  proteinInGrams: numericString(),
  carbsInGrams: numericString(),
  fatInGrams: numericString(),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

interface MealFormProps {
  workoutPlanId: string;
  meal?: GetWorkoutPlan200MealsItem;
  onDone?: () => void;
}

export function MealForm({ workoutPlanId, meal, onDone }: MealFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: meal?.name ?? "",
      time: meal?.time ?? "",
      description: meal?.description ?? "",
      calories: meal ? String(meal.calories) : "",
      proteinInGrams: meal ? String(meal.proteinInGrams) : "",
      carbsInGrams: meal ? String(meal.carbsInGrams) : "",
      fatInGrams: meal ? String(meal.fatInGrams) : "",
    },
  });

  const onSubmit = (values: MealFormValues) => {
    const payload = {
      name: values.name,
      time: values.time,
      description: values.description,
      calories: Number(values.calories),
      proteinInGrams: Number(values.proteinInGrams),
      carbsInGrams: Number(values.carbsInGrams),
      fatInGrams: Number(values.fatInGrams),
    };

    startTransition(async () => {
      if (meal) {
        await updateMealAction(workoutPlanId, meal.id, payload);
      } else {
        await createMealAction(workoutPlanId, payload);
        form.reset();
      }
      onDone?.();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} placeholder="Nome da refeição" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="w-24">
                <FormControl>
                  <Input {...field} type="time" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Alimentos sugeridos"
                  className="min-h-16"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="kcal" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="proteinInGrams"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="Prot g" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="carbsInGrams"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="Carb g" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fatInGrams"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="Gord g" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onDone && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDone}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
