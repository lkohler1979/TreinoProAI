import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { ProfileSetupForm } from "./_components/profile-setup-form";

export default async function ProfileSetupPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const trainData = await getUserTrainData();

  if (trainData.status === 200 && trainData.data) redirect("/");

  return (
    <div className="flex min-h-svh flex-col bg-background px-5 py-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Complete seu perfil
      </h1>
      <p className="pb-6 pt-2 font-heading text-sm text-muted-foreground">
        Precisamos de algumas informações para calcular seu treino, meta de
        água e plano alimentar.
      </p>
      <ProfileSetupForm />
    </div>
  );
}
