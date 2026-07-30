import { NotFoundError } from "../errors/index.js";
import { WeekDay, WorkoutGoal } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
}

interface OutputDto {
  id: string;
  name: string;
  goal?: WorkoutGoal;
  dailyWaterGoalInMl?: number;
  workoutDays: Array<{
    id: string;
    weekDay: WeekDay;
    name: string;
    isRest: boolean;
    coverImageUrl?: string;
    estimatedDurationInSeconds: number;
    exercisesCount: number;
  }>;
  meals: Array<{
    id: string;
    order: number;
    name: string;
    time: string;
    description: string;
    calories: number;
    proteinInGrams: number;
    carbsInGrams: number;
    fatInGrams: number;
  }>;
}

export class GetWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
      include: {
        workoutDays: {
          include: {
            _count: {
              select: { exercises: true },
            },
          },
        },
        meals: { orderBy: { order: "asc" } },
      },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      goal: workoutPlan.goal ?? undefined,
      dailyWaterGoalInMl: workoutPlan.dailyWaterGoalInMl ?? undefined,
      workoutDays: workoutPlan.workoutDays.map((day) => ({
        id: day.id,
        weekDay: day.weekDay,
        name: day.name,
        isRest: day.isRest,
        coverImageUrl: day.coverImageUrl ?? undefined,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        exercisesCount: day._count.exercises,
      })),
      meals: workoutPlan.meals.map((meal) => ({
        id: meal.id,
        order: meal.order,
        name: meal.name,
        time: meal.time,
        description: meal.description,
        calories: meal.calories,
        proteinInGrams: meal.proteinInGrams,
        carbsInGrams: meal.carbsInGrams,
        fatInGrams: meal.fatInGrams,
      })),
    };
  }
}
