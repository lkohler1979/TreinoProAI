import { getPersonalTrainer } from "@/app/_lib/api/fetch-generated";
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
          Em breve você poderá cadastrar e gerenciar seus alunos por aqui.
        </p>
      </div>

      <PersonalLogoutButton />
    </div>
  );
}
