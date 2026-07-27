"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GetWorkoutPlan200MealsItem } from "@/app/_lib/api/fetch-generated";
import { deleteMealAction } from "../_actions";
import { MealForm } from "./meal-form";

interface MealCardProps {
  workoutPlanId: string;
  meal: GetWorkoutPlan200MealsItem;
}

export function MealCard({ workoutPlanId, meal }: MealCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteMealAction(workoutPlanId, meal.id);
    });
  };

  if (isEditing) {
    return (
      <MealForm
        workoutPlanId={workoutPlanId}
        meal={meal}
        onDone={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-foreground">
          {meal.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="font-heading text-xs text-muted-foreground">
            {meal.time}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <p className="font-heading text-sm text-muted-foreground">
        {meal.description}
      </p>
      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          {meal.calories} kcal
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          P {meal.proteinInGrams}g
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          C {meal.carbsInGrams}g
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-heading text-xs font-semibold uppercase text-muted-foreground">
          G {meal.fatInGrams}g
        </span>
      </div>
    </div>
  );
}
