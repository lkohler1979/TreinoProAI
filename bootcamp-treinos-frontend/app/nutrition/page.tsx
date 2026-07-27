import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import {
  getHomeData,
  getUserTrainData,
  getWorkoutPlan,
  getWaterIntakeToday,
} from "@/app/_lib/api/fetch-generated";
import dayjs from "dayjs";
import { BottomNav } from "@/app/_components/bottom-nav";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { WaterTracker } from "./_components/water-tracker";
import { MealCard } from "./_components/meal-card";
import { AddMealButton } from "./_components/add-meal-button";

export default async function NutritionPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();
  const [homeData, trainData] = await Promise.all([
    getHomeData(today.format("YYYY-MM-DD")),
    getUserTrainData(),
  ]);

  const needsOnboarding =
    (homeData.status === 200 && !homeData.data.activeWorkoutPlanId) ||
    (trainData.status === 200 && !trainData.data);
  if (needsOnboarding) redirect("/onboarding");

  if (homeData.status !== 200 || !homeData.data.activeWorkoutPlanId) {
    redirect("/");
  }

  const workoutPlanId = homeData.data.activeWorkoutPlanId;

  const [workoutPlanResponse, waterResponse] = await Promise.all([
    getWorkoutPlan(workoutPlanId),
    getWaterIntakeToday({ date: today.format("YYYY-MM-DD") }),
  ]);

  if (workoutPlanResponse.status !== 200 || waterResponse.status !== 200) {
    throw new Error("Failed to fetch nutrition data");
  }

  const { meals } = workoutPlanResponse.data;

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <div className="flex h-14 items-center px-5">
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Água e Refeições
        </h1>
      </div>

      <div className="px-5">
        <Tabs defaultValue="water">
          <TabsList className="w-full">
            <TabsTrigger value="water">Água</TabsTrigger>
            <TabsTrigger value="meals">Refeições</TabsTrigger>
          </TabsList>

          <TabsContent value="water" className="pt-4">
            <WaterTracker data={waterResponse.data} />
          </TabsContent>

          <TabsContent value="meals" className="flex flex-col gap-3 pt-4">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                workoutPlanId={workoutPlanId}
                meal={meal}
              />
            ))}
            <AddMealButton workoutPlanId={workoutPlanId} />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav activePage="nutrition" />
    </div>
  );
}
