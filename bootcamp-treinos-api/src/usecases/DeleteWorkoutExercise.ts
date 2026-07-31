import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  exerciseId: string;
}

export class DeleteWorkoutExercise {
  async execute(dto: InputDto): Promise<void> {
    const exercise = await prisma.workoutExercise.findUnique({
      where: { id: dto.exerciseId },
      include: { workoutDay: { include: { workoutPlan: true } } },
    });

    if (
      !exercise ||
      exercise.workoutDay.workoutPlan.userId !== dto.userId ||
      exercise.workoutDay.workoutPlanId !== dto.workoutPlanId ||
      exercise.workoutDayId !== dto.workoutDayId
    ) {
      throw new NotFoundError("Exercise not found");
    }

    await prisma.workoutExercise.delete({ where: { id: dto.exerciseId } });
  }
}
