"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { createStudentAction } from "../_actions";

const createStudentFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do aluno"),
  email: z.email("Informe um e-mail válido"),
  injuries: z.string(),
  metabolicConditions: z.string(),
  accessDurationInDays: z.string(),
});

type CreateStudentFormValues = z.infer<typeof createStudentFormSchema>;

export function CreateStudentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      injuries: "",
      metabolicConditions: "",
      accessDurationInDays: "",
    },
  });

  const onSubmit = (values: CreateStudentFormValues) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createStudentAction({
        name: values.name,
        email: values.email,
        injuries: values.injuries.trim() || undefined,
        metabolicConditions: values.metabolicConditions.trim() || undefined,
        accessDurationInDays: values.accessDurationInDays
          ? Number(values.accessDurationInDays)
          : undefined,
      });

      if (!result.success) {
        setFormError(result.error ?? "Erro ao cadastrar aluno.");
        return;
      }

      router.push("/personal/students");
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="injuries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesões</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Deixe em branco se não houver"
                  className="min-h-16"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metabolicConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problemas metabólicos</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Deixe em branco se não houver"
                  className="min-h-16"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessDurationInDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dias de acesso (padrão 30)</FormLabel>
              <FormControl>
                <Input {...field} type="number" min="1" placeholder="30" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl"
        >
          Cadastrar aluno
        </Button>
      </form>
    </Form>
  );
}
