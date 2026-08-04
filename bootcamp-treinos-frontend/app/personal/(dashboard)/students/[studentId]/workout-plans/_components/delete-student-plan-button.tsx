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
import { deleteStudentWorkoutPlanAction } from "../_actions";

interface DeleteStudentPlanButtonProps {
  studentId: string;
  workoutPlanId: string;
  workoutPlanName: string;
}

export function DeleteStudentPlanButton({
  studentId,
  workoutPlanId,
  workoutPlanName,
}: DeleteStudentPlanButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteStudentWorkoutPlanAction(studentId, workoutPlanId);
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
