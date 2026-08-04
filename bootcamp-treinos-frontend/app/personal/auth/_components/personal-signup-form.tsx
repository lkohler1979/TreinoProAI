"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/app/_lib/auth-client";
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
import { signUpPersonalTrainerAction } from "../_actions";

const personalSignupFormSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome"),
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

type PersonalSignupFormValues = z.infer<typeof personalSignupFormSchema>;

export function PersonalSignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<PersonalSignupFormValues>({
    resolver: zodResolver(personalSignupFormSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (values: PersonalSignupFormValues) => {
    setFormError(null);
    startTransition(async () => {
      const result = await signUpPersonalTrainerAction(values);

      if (!result.success) {
        setFormError(result.error ?? "Erro ao criar conta.");
        return;
      }

      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setFormError("Conta criada, mas não foi possível entrar. Tente fazer login.");
        return;
      }

      router.push("/personal");
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
                <Input {...field} autoComplete="name" />
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
                <Input {...field} type="email" autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                />
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
          Criar conta
        </Button>
      </form>
    </Form>
  );
}
