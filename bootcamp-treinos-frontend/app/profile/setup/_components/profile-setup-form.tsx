"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UpsertUserTrainDataBody } from "@/app/_lib/api/fetch-generated";
import { GOAL_OPTIONS } from "@/app/_lib/goals";
import { upsertProfileAction } from "../_actions";

const numericString = (message: string) =>
  z.string().refine((value) => value !== "" && Number(value) > 0, {
    message,
  });

const profileSetupFormSchema = z.object({
  weightInKg: numericString("Informe um peso válido"),
  heightInCentimeters: numericString("Informe uma altura válida"),
  age: numericString("Informe uma idade válida"),
  bodyFatPercentage: z
    .string()
    .refine(
      (value) => value !== "" && Number(value) >= 0 && Number(value) <= 100,
      { message: "Informe um percentual entre 0 e 100" },
    ),
  healthRestrictions: z.string(),
  goal: z.string().min(1, "Selecione um objetivo"),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupFormSchema>;

export function ProfileSetupForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupFormSchema),
    defaultValues: {
      weightInKg: "",
      heightInCentimeters: "",
      age: "",
      bodyFatPercentage: "",
      healthRestrictions: "",
      goal: "",
    },
  });

  const onSubmit = (values: ProfileSetupFormValues) => {
    const payload: UpsertUserTrainDataBody = {
      weightInGrams: Math.round(Number(values.weightInKg) * 1000),
      heightInCentimeters: Number(values.heightInCentimeters),
      age: Number(values.age),
      bodyFatPercentage: Number(values.bodyFatPercentage),
      healthRestrictions: values.healthRestrictions.trim() || undefined,
      goal: values.goal as UpsertUserTrainDataBody["goal"],
    };

    startTransition(async () => {
      await upsertProfileAction(payload);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="weightInKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.1" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heightInCentimeters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idade</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bodyFatPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% de gordura</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" max="100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="healthRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problemas de saúde ou lesões</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva, ou deixe em branco se não tiver nenhuma"
                  className="min-h-20"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full rounded-xl">
          Salvar e continuar
        </Button>
      </form>
    </Form>
  );
}
