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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateStudentPaymentRecordBodyStatus } from "@/app/_lib/api/fetch-generated";
import { createPaymentRecordAction } from "../_actions";

const PAYMENT_STATUS_OPTIONS: Array<{
  value: CreateStudentPaymentRecordBodyStatus;
  label: string;
}> = [
  { value: "PAID", label: "Pago" },
  { value: "PENDING", label: "Pendente" },
  { value: "OVERDUE", label: "Atrasado" },
];

const addPaymentRecordFormSchema = z.object({
  amountInReais: z
    .string()
    .refine((value) => value !== "" && Number(value) > 0, {
      message: "Informe um valor válido",
    }),
  paymentDate: z.string().min(1, "Informe a data"),
  status: z.string().min(1, "Selecione a situação"),
});

type AddPaymentRecordFormValues = z.infer<typeof addPaymentRecordFormSchema>;

interface AddPaymentRecordFormProps {
  studentId: string;
}

export function AddPaymentRecordForm({
  studentId,
}: AddPaymentRecordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<AddPaymentRecordFormValues>({
    resolver: zodResolver(addPaymentRecordFormSchema),
    defaultValues: {
      amountInReais: "",
      paymentDate: dayjs().format("YYYY-MM-DD"),
      status: "PAID",
    },
  });

  const onSubmit = (values: AddPaymentRecordFormValues) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createPaymentRecordAction({
        studentId,
        amountInCents: Math.round(Number(values.amountInReais) * 100),
        paymentDate: dayjs(values.paymentDate).toISOString(),
        status: values.status as CreateStudentPaymentRecordBodyStatus,
      });

      if (!result.success) {
        setFormError(result.error ?? "Erro ao registrar pagamento.");
        return;
      }

      form.reset({
        amountInReais: "",
        paymentDate: dayjs().format("YYYY-MM-DD"),
        status: "PAID",
      });
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="amountInReais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situação</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
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
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Button type="submit" disabled={isPending} className="rounded-xl">
          Lançar pagamento
        </Button>
      </form>
    </Form>
  );
}
