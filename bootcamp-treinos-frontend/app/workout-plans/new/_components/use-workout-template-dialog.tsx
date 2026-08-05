"use client";

import { useState } from "react";
import { Clock, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GetWorkoutTemplate200 } from "@/app/_lib/api/fetch-generated";
import { WORKOUT_CATEGORY_LABELS } from "@/app/_lib/workout-categories";
import { WORKOUT_LEVEL_LABELS } from "@/app/_lib/workout-levels";

const ALL_MUSCLE_GROUPS_VALUE = "all";

interface UseWorkoutTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: GetWorkoutTemplate200[];
  onSelect: (template: GetWorkoutTemplate200) => void;
}

export function UseWorkoutTemplateDialog({
  open,
  onOpenChange,
  templates,
  onSelect,
}: UseWorkoutTemplateDialogProps) {
  const [muscleGroupFilter, setMuscleGroupFilter] = useState(
    ALL_MUSCLE_GROUPS_VALUE,
  );

  const muscleGroupNames = Array.from(
    new Set(
      templates
        .map((template) => template.muscleGroupName)
        .filter((name): name is string => !!name),
    ),
  );

  const filteredTemplates = templates.filter((template) =>
    muscleGroupFilter === ALL_MUSCLE_GROUPS_VALUE
      ? true
      : template.muscleGroupName === muscleGroupFilter,
  );

  const handleSelect = (template: GetWorkoutTemplate200) => {
    onSelect(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Usar template de treino</DialogTitle>
        </DialogHeader>

        {muscleGroupNames.length > 0 && (
          <Select
            value={muscleGroupFilter}
            onValueChange={setMuscleGroupFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Grupo muscular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_MUSCLE_GROUPS_VALUE}>
                Todos os grupos musculares
              </SelectItem>
              {muscleGroupNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex flex-col gap-2">
          {filteredTemplates.length === 0 && (
            <p className="font-heading text-sm text-muted-foreground">
              Nenhum template disponível para essa combinação de categoria e
              nível.
            </p>
          )}

          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template)}
              className="flex flex-col gap-1.5 rounded-lg border border-border p-3 text-left hover:bg-accent"
            >
              <span className="font-heading text-sm font-semibold text-foreground">
                {template.name}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-muted px-2 py-0.5 font-heading text-[11px] font-semibold uppercase text-muted-foreground">
                  {WORKOUT_CATEGORY_LABELS[template.category]}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 font-heading text-[11px] font-semibold uppercase text-muted-foreground">
                  {WORKOUT_LEVEL_LABELS[template.level]}
                </span>
                <span className="flex items-center gap-1 font-heading text-[11px] text-muted-foreground">
                  <Dumbbell className="size-3" />
                  {template.exercises.length} exercícios
                </span>
                <span className="flex items-center gap-1 font-heading text-[11px] text-muted-foreground">
                  <Clock className="size-3" />
                  {Math.round(template.estimatedDurationInSeconds / 60)} min
                </span>
              </div>
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
