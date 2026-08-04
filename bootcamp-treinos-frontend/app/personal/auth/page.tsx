import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/app/_lib/auth-client";
import { getPersonalTrainer } from "@/app/_lib/api/fetch-generated";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PersonalLoginForm } from "./_components/personal-login-form";
import { PersonalPricingTable } from "./_components/personal-pricing-table";
import { PersonalSignupForm } from "./_components/personal-signup-form";

export default async function PersonalAuthPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (session.data?.user) {
    const trainerResponse = await getPersonalTrainer();
    if (trainerResponse.status === 200 && trainerResponse.data) {
      redirect("/personal");
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-5">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Área do Personal Trainer
          </h1>
          <p className="font-heading text-sm text-muted-foreground">
            Gerencie seus alunos e monte treinos personalizados.
          </p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="w-full">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="pt-4">
            <PersonalLoginForm />
          </TabsContent>

          <TabsContent value="signup" className="pt-4">
            <PersonalSignupForm />
          </TabsContent>
        </Tabs>

        <PersonalPricingTable />
      </div>
    </div>
  );
}
