import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import dayjs from "dayjs";
import { Chat } from "@/app/_components/chat";

export default async function OnboardingPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const [homeData, trainData] = await Promise.all([
    getHomeData(dayjs().format("YYYY-MM-DD")),
    getUserTrainData(),
  ]);

  if (
    homeData.status === 200 &&
    trainData.status === 200 &&
    homeData.data.activeWorkoutPlanId &&
    trainData.data
  ) {
    redirect("/");
  }

  const hasProfile = trainData.status === 200 && !!trainData.data;
  const skipHref = hasProfile ? "/" : "/profile/setup";

  return (
    <Chat
      embedded
      skipHref={skipHref}
      initialMessage="Quero começar a melhorar minha saúde!"
    />
  );
}
