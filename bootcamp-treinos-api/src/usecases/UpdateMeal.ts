import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  mealId: string;
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

export class UpdateMeal {
  async execute(dto: InputDto): Promise<OutputDto> {
    const meal = await prisma.meal.findUnique({
      where: { id: dto.mealId },
      include: { workoutPlan: true },
    });

    if (!meal || meal.workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Meal not found");
    }

    const updated = await prisma.meal.update({
      where: { id: dto.mealId },
      data: {
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
      id: updated.id,
      order: updated.order,
      name: updated.name,
      time: updated.time,
      description: updated.description,
      calories: updated.calories,
      proteinInGrams: updated.proteinInGrams,
      carbsInGrams: updated.carbsInGrams,
      fatInGrams: updated.fatInGrams,
    };
  }
}
