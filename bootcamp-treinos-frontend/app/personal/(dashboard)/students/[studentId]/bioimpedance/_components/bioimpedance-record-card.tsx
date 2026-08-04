import dayjs from "dayjs";
import type { ListBioimpedanceRecords200Item } from "@/app/_lib/api/fetch-generated";
import { ALL_BIOIMPEDANCE_FIELDS } from "../_lib/fields";

interface BioimpedanceRecordCardProps {
  record: ListBioimpedanceRecords200Item;
}

export function BioimpedanceRecordCard({ record }: BioimpedanceRecordCardProps) {
  const filledFields = ALL_BIOIMPEDANCE_FIELDS.filter(
    (field) => record[field.key] != null,
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <span className="font-heading text-sm font-semibold text-foreground">
        {dayjs(record.recordedAt).format("DD/MM/YYYY")}
      </span>

      {filledFields.length === 0 ? (
        <p className="font-heading text-xs text-muted-foreground">
          Nenhuma medida preenchida.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filledFields.map((field) => {
            const rawValue = record[field.key] as number;
            const displayValue = field.isGrams
              ? (rawValue / 1000).toFixed(1)
              : rawValue;

            return (
              <div key={field.key} className="flex flex-col">
                <span className="font-heading text-xs text-muted-foreground">
                  {field.label}
                </span>
                <span className="font-heading text-sm font-semibold text-foreground">
                  {displayValue}
                  {field.unit ? ` ${field.unit}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {record.notes && (
        <p className="font-heading text-xs text-muted-foreground">
          {record.notes}
        </p>
      )}
    </div>
  );
}
