import { NotFoundError } from "../errors/index.js";
import { ExerciseMethod } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
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

export class CreateWorkoutExercise {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId },
      include: { workoutPlan: true },
    });

    if (
      !workoutDay ||
      workoutDay.workoutPlan.userId !== dto.userId ||
      workoutDay.workoutPlanId !== dto.workoutPlanId
    ) {
      throw new NotFoundError("Workout day not found");
    }

    const exercisesCount = await prisma.workoutExercise.count({
      where: { workoutDayId: dto.workoutDayId },
    });

    const exercise = await prisma.$transaction(async (tx) => {
      if (workoutDay.isRest) {
        await tx.workoutDay.update({
          where: { id: dto.workoutDayId },
          data: { isRest: false },
        });
      }

      return tx.workoutExercise.create({
        data: {
          workoutDayId: dto.workoutDayId,
          order: exercisesCount,
          name: dto.name,
          sets: dto.sets,
          reps: dto.reps,
          restTimeInSeconds: dto.restTimeInSeconds,
          method: dto.method ?? ExerciseMethod.NORMAL,
        },
      });
    });

    return {
      id: exercise.id,
      order: exercise.order,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      restTimeInSeconds: exercise.restTimeInSeconds,
      method: exercise.method,
    };
  }
}
