"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { renewStudentAccessAction } from "../_actions";

interface RenewAccessButtonProps {
  studentId: string;
}

export function RenewAccessButton({ studentId }: RenewAccessButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await renewStudentAccessAction(studentId);
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-full"
    >
      Renovar por 30 dias
    </Button>
  );
}
