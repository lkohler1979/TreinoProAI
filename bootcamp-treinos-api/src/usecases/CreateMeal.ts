import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  name: string;
  time: string;
  description: string;
  calories: number;
  proteinInGrams: number;
  carbsInGrams: number;
  fatInGrams: number;
}

interface OutputDto {
  id: string;
  order: number;
  name: string;
  time: string;
  description: string;
  calories: number;
  proteinInGrams: number;
  carbsInGrams: number;
  fatInGrams: number;
}

export class CreateMeal {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const mealsCount = await prisma.meal.count({
      where: { workoutPlanId: dto.workoutPlanId },
    });

    const meal = await prisma.meal.create({
      data: {
        workoutPlanId: dto.workoutPlanId,
        order: mealsCount,
        name: dto.name,
        time: dto.time,
        description: dto.description,
        calories: dto.calories,
        proteinInGrams: dto.proteinInGrams,
        carbsInGrams: dto.carbsInGrams,
        fatInGrams: dto.fatInGrams,
      },
    });

    return {
      id: meal.id,
      order: meal.order,
      name: meal.name,
      time: meal.time,
      description: meal.description,
      calories: meal.calories,
      proteinInGrams: meal.proteinInGrams,
      carbsInGrams: meal.carbsInGrams,
      fatInGrams: meal.fatInGrams,
    };
  }
}
