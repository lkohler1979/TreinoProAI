import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import { getSubscription } from "@/app/_lib/api/fetch-generated";
import { PlanTierCard } from "./_components/plan-tier-card";

const PRICING_TIERS = [
  { tier: "UP_TO_10" as const, label: "Até 10 alunos", priceInReais: 140 },
  { tier: "UP_TO_50" as const, label: "Até 50 alunos", priceInReais: 599 },
  {
    tier: "ABOVE_51" as const,
    label: "Acima de 51 alunos",
    priceInReais: 987,
  },
];

const PLAN_LABELS: Record<string, string> = {
  UP_TO_10: "Até 10 alunos",
  UP_TO_50: "Até 50 alunos",
  ABOVE_51: "Acima de 51 alunos",
};

export default async function PersonalBillingPage() {
  const subscriptionResponse = await getSubscription();
  const subscription =
    subscriptionResponse.status === 200 ? subscriptionResponse.data : null;

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background px-5 py-8 pb-16">
      <div className="flex items-center gap-3">
        <Link href="/personal">
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Assinatura
        </h1>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
        {subscription?.planTier ? (
          <>
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm text-muted-foreground">
                Plano atual
              </span>
              <span className="font-heading text-sm font-semibold text-foreground">
                {PLAN_LABELS[subscription.planTier]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm text-muted-foreground">
                Status
              </span>
              <span className="font-heading text-sm font-semibold text-foreground">
                {subscription.status === "ACTIVE" ? "Ativo" : "Cancelado"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm text-muted-foreground">
                Alunos
              </span>
              <span className="font-heading text-sm font-semibold text-foreground">
                {subscription.activeStudentsCount}
                {subscription.maxStudents != null
                  ? `/${subscription.maxStudents}`
                  : " (ilimitado)"}
              </span>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm text-muted-foreground">
                  Renova em
                </span>
                <span className="font-heading text-sm font-semibold text-foreground">
                  {dayjs(subscription.currentPeriodEnd).format("DD/MM/YYYY")}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="font-heading text-sm text-muted-foreground">
            Você ainda não tem uma assinatura ativa. Escolha um plano abaixo
            para poder cadastrar alunos.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-semibold uppercase text-muted-foreground">
          Planos disponíveis
        </h2>
        {PRICING_TIERS.map((tier) => (
          <PlanTierCard
            key={tier.tier}
            tier={tier.tier}
            label={tier.label}
            priceInReais={tier.priceInReais}
            isCurrent={
              subscription?.planTier === tier.tier &&
              subscription?.status === "ACTIVE"
            }
          />
        ))}
        <p className="font-heading text-xs text-muted-foreground">
          Pagamento simulado nesta versão — a integração com um gateway de
          pagamento real será feita em uma fase futura.
        </p>
      </div>
    </div>
  );
}
