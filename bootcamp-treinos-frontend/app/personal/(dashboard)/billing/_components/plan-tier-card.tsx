"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivateSubscriptionBody } from "@/app/_lib/api/fetch-generated";
import { activateSubscriptionAction } from "../_actions";

interface PlanTierCardProps {
  tier: ActivateSubscriptionBody["planTier"];
  label: string;
  priceInReais: number;
  isCurrent: boolean;
}

export function PlanTierCard({
  tier,
  label,
  priceInReais,
  isCurrent,
}: PlanTierCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleActivate = () => {
    startTransition(async () => {
      await activateSubscriptionAction(tier);
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border p-4",
        isCurrent ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="font-heading text-sm font-semibold text-foreground">
          {label}
        </span>
        <span className="font-heading text-xs text-muted-foreground">
          R${priceInReais}/mês
        </span>
      </div>
      <Button
        size="sm"
        disabled={isPending || isCurrent}
        onClick={handleActivate}
        variant={isCurrent ? "outline" : "default"}
        className="rounded-full"
      >
        {isCurrent ? "Plano atual" : "Assinar"}
      </Button>
    </div>
  );
}
