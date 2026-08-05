import Link from "next/link";
import type { WorkoutCategory } from "@/app/_lib/workout-categories";
import {
  WORKOUT_CATEGORY_ICONS,
  WORKOUT_CATEGORY_LABELS,
} from "@/app/_lib/workout-categories";

interface CategoryCardProps {
  category: WorkoutCategory;
  href: string;
}

export function CategoryCard({ category, href }: CategoryCardProps) {
  const Icon = WORKOUT_CATEGORY_ICONS[category];

  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-5 text-center"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <span className="font-heading text-sm font-semibold text-foreground">
        {WORKOUT_CATEGORY_LABELS[category]}
      </span>
    </Link>
  );
}
