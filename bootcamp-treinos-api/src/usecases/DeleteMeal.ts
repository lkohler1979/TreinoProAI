import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  mealId: string;
}

export class DeleteMeal {
  async execute(dto: InputDto): Promise<void> {
    const meal = await prisma.meal.findUnique({
      where: { id: dto.mealId },
      include: { workoutPlan: true },
    });

    if (!meal || meal.workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Meal not found");
    }

    await prisma.meal.delete({ where: { id: dto.mealId } });
  }
}
