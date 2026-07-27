"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealForm } from "./meal-form";

interface AddMealButtonProps {
  workoutPlanId: string;
}

export function AddMealButton({ workoutPlanId }: AddMealButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <MealForm
        workoutPlanId={workoutPlanId}
        onDone={() => setIsOpen(false)}
      />
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => setIsOpen(true)}
      className="w-full gap-1.5 rounded-xl"
    >
      <Plus className="size-4" />
      Adicionar refeição
    </Button>
  );
}
