import Link from "next/link";
import { Users } from "lucide-react";
import { getPersonalTrainer } from "@/app/_lib/api/fetch-generated";
import { Button } from "@/components/ui/button";
import { PersonalLogoutButton } from "./_components/personal-logout-button";

export default async function PersonalDashboardPage() {
  const trainerResponse = await getPersonalTrainer();
  const trainerName =
    trainerResponse.status === 200 ? trainerResponse.data?.name : undefined;

  return (
    <div className="flex min-h-svh flex-col gap-6 bg-background px-5 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Olá, {trainerName}
        </h1>
        <p className="font-heading text-sm text-muted-foreground">
          Gerencie seus alunos e acompanhe o treino de cada um.
        </p>
      </div>

      <Button asChild className="w-full gap-2 rounded-xl">
        <Link href="/personal/students">
          <Users className="size-4" />
          Meus alunos
        </Link>
      </Button>

      <PersonalLogoutButton />
    </div>
  );
}
