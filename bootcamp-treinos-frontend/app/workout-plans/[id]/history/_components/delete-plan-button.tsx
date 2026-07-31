"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteWorkoutPlanAction } from "../_actions";

interface DeletePlanButtonProps {
  workoutPlanId: string;
  workoutPlanName: string;
}

export function DeletePlanButton({
  workoutPlanId,
  workoutPlanName,
}: DeletePlanButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteWorkoutPlanAction(workoutPlanId);
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" disabled={isPending}>
          <Trash2 className="size-3.5 text-muted-foreground" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir plano de treino?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso vai excluir permanentemente o plano &quot;{workoutPlanName}
            &quot;, seus dias, exercícios e histórico de treinos concluídos.
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} variant="destructive">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
