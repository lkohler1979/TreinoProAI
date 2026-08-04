const PRICING_TIERS = [
  { label: "Até 10 alunos", priceInReais: 140 },
  { label: "Até 50 alunos", priceInReais: 599 },
  { label: "Acima de 51 alunos", priceInReais: 987 },
];

export function PersonalPricingTable() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center font-heading text-xs font-semibold uppercase text-muted-foreground">
        Planos de assinatura mensal
      </p>
      <div className="flex flex-col gap-2">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.label}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <span className="font-heading text-sm text-foreground">
              {tier.label}
            </span>
            <span className="font-heading text-base font-semibold text-foreground">
              R${tier.priceInReais}/mês
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
