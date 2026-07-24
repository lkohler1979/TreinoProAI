interface TipOfDayProps {
  message: string;
}

export function TipOfDay({ message }: TipOfDayProps) {
  return (
    <div className="rounded-r-lg border-l-[3px] border-primary bg-accent px-3 py-2.5">
      <p className="font-heading text-sm leading-[1.4] text-accent-foreground">
        {message}
      </p>
    </div>
  );
}
