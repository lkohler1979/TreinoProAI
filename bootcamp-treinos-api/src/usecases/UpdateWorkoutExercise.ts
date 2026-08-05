import { NotFoundError } from "../errors/index.js";
import { ExerciseMethod } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  method?: ExerciseMethod;
}

interface OutputDto {
  id: string;
  order: number;
  name: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
  method: ExerciseMethod;
}

export class UpdateWorkoutExercise {
  async execute(dto: InputDto): Promise<OutputDto> {
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

    const updated = await prisma.workoutExercise.update({
      where: { id: dto.exerciseId },
      data: {
        name: dto.name,
        sets: dto.sets,
        reps: dto.reps,
        restTimeInSeconds: dto.restTimeInSeconds,
        method: dto.method,
      },
    });

    return {
      id: updated.id,
      order: updated.order,
      name: updated.name,
      sets: updated.sets,
      reps: updated.reps,
      restTimeInSeconds: updated.restTimeInSeconds,
      method: updated.method,
    };
  }
}
