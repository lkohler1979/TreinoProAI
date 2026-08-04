"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import dayjs from "dayjs";
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
import type { CreateBioimpedanceRecordBody } from "@/app/_lib/api/fetch-generated";
import { createBioimpedanceRecordAction } from "../_actions";
import {
  ALL_BIOIMPEDANCE_FIELDS,
  BIOIMPEDANCE_FIELD_GROUPS,
} from "../_lib/fields";

const measurementFieldsShape = Object.fromEntries(
  ALL_BIOIMPEDANCE_FIELDS.map((field) => [field.key, z.string()]),
) as Record<(typeof ALL_BIOIMPEDANCE_FIELDS)[number]["key"], z.ZodString>;

const createBioimpedanceRecordFormSchema = z.object({
  recordedAt: z.string().min(1, "Informe a data"),
  notes: z.string(),
  ...measurementFieldsShape,
});

type CreateBioimpedanceRecordFormValues = z.infer<
  typeof createBioimpedanceRecordFormSchema
>;

interface CreateBioimpedanceRecordFormProps {
  studentId: string;
}

export function CreateBioimpedanceRecordForm({
  studentId,
}: CreateBioimpedanceRecordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateBioimpedanceRecordFormValues>({
    resolver: zodResolver(createBioimpedanceRecordFormSchema),
    defaultValues: {
      recordedAt: dayjs().format("YYYY-MM-DD"),
      notes: "",
      ...Object.fromEntries(
        ALL_BIOIMPEDANCE_FIELDS.map((field) => [field.key, ""]),
      ),
    } as CreateBioimpedanceRecordFormValues,
  });

  const onSubmit = (values: CreateBioimpedanceRecordFormValues) => {
    setFormError(null);
    startTransition(async () => {
      const payload: CreateBioimpedanceRecordBody = {
        recordedAt: dayjs(values.recordedAt).toISOString(),
        notes: values.notes.trim() || undefined,
      };

      for (const field of ALL_BIOIMPEDANCE_FIELDS) {
        const rawValue = values[field.key];
        if (!rawValue) continue;
        const numericValue = Number(rawValue);
        payload[field.key] = field.isGrams
          ? Math.round(numericValue * 1000)
          : numericValue;
      }

      const result = await createBioimpedanceRecordAction(
        studentId,
        payload,
      );

      if (!result.success) {
        setFormError(result.error ?? "Erro ao registrar medição.");
        return;
      }

      router.push(`/personal/students/${studentId}/bioimpedance`);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="recordedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data da avaliação</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {BIOIMPEDANCE_FIELD_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <h2 className="font-heading text-sm font-semibold uppercase text-muted-foreground">
              {group.title}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {group.fields.map((fieldConfig) => (
                <FormField
                  key={fieldConfig.key}
                  control={form.control}
                  name={fieldConfig.key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {fieldConfig.label}
                        {fieldConfig.unit ? ` (${fieldConfig.unit})` : ""}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.1" min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        ))}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-16" />
              </FormControl>
            </FormItem>
          )}
        />

        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl"
        >
          Salvar medição
        </Button>
      </form>
    </Form>
  );
}
