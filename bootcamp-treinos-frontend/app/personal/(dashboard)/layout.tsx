import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/app/_lib/auth-client";
import { getPersonalTrainer } from "@/app/_lib/api/fetch-generated";

export default async function PersonalDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/personal/auth");

  const trainerResponse = await getPersonalTrainer();
  if (trainerResponse.status !== 200 || !trainerResponse.data) {
    redirect("/personal/auth");
  }

  return <>{children}</>;
}
