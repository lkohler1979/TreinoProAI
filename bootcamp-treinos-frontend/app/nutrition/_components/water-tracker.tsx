"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { GetWaterIntakeToday200 } from "@/app/_lib/api/fetch-generated";
import { logWaterAction } from "../_actions";

const QUICK_AMOUNTS_IN_ML = [200, 300, 500];

const waterFormSchema = z.object({
  amountInMl: z
    .string()
    .refine((value) => value !== "" && Number(value) > 0, {
      message: "Informe uma quantidade válida",
    }),
});

type WaterFormValues = z.infer<typeof waterFormSchema>;

interface WaterTrackerProps {
  data: GetWaterIntakeToday200;
}

export function WaterTracker({ data }: WaterTrackerProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  const form = useForm<WaterFormValues>({
    resolver: zodResolver(waterFormSchema),
    defaultValues: { amountInMl: "" },
  });

  const goalInLiters = data.goalInMl ? (data.goalInMl / 1000).toFixed(1) : null;
  const totalInLiters = (data.totalInMl / 1000).toFixed(1);
  const progress = data.goalInMl
    ? Math.min(100, Math.round((data.totalInMl / data.goalInMl) * 100))
    : 0;

  const logAmount = (amountInMl: number) => {
    setPendingAmount(amountInMl);
    startTransition(async () => {
      await logWaterAction(amountInMl);
      setPendingAmount(null);
    });
  };

  const onSubmit = (values: WaterFormValues) => {
    logAmount(Number(values.amountInMl));
    form.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 rounded-full bg-primary/8 p-3">
          <Droplet className="size-6 text-primary" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="font-heading text-2xl font-semibold text-foreground">
            {totalInLiters}L
            {goalInLiters && (
              <span className="text-muted-foreground"> / {goalInLiters}L</span>
            )}
          </p>
          <p className="font-heading text-xs text-muted-foreground">
            {goalInLiters ? "Meta diária de água" : "Sem meta definida ainda"}
          </p>
        </div>
        {data.goalInMl && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {QUICK_AMOUNTS_IN_ML.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => logAmount(amount)}
            className="flex-1 rounded-full"
          >
            {isPending && pendingAmount === amount ? "..." : `+${amount}ml`}
          </Button>
        ))}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-2"
        >
          <FormField
            control={form.control}
            name="amountInMl"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    placeholder="Outra quantidade (ml)"
                    className="h-9"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" disabled={isPending}>
            Registrar
          </Button>
        </form>
      </Form>

      <div className="flex flex-col gap-2">
        {data.entries.length === 0 ? (
          <p className="py-6 text-center font-heading text-sm text-muted-foreground">
            Nenhum registro de água hoje.
          </p>
        ) : (
          data.entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-border p-3"
            >
              <span className="font-heading text-sm font-semibold text-foreground">
                {entry.amountInMl}ml
              </span>
              <span className="font-heading text-xs text-muted-foreground">
                {dayjs(entry.recordedAt).format("HH:mm")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
