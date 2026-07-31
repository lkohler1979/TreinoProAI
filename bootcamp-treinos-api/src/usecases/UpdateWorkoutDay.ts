import { NotFoundError } from "../errors/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  name: string;
  isRest: boolean;
  estimatedDurationInSeconds: number;
}

interface OutputDto {
  id: string;
  name: string;
  isRest: boolean;
  weekDay: WeekDay;
  estimatedDurationInSeconds: number;
  coverImageUrl?: string;
}

export class UpdateWorkoutDay {
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

    const updated = await prisma.$transaction(async (tx) => {
      if (dto.isRest && !workoutDay.isRest) {
        await tx.workoutExercise.deleteMany({
          where: { workoutDayId: dto.workoutDayId },
        });
      }

      return tx.workoutDay.update({
        where: { id: dto.workoutDayId },
        data: {
          name: dto.name,
          isRest: dto.isRest,
          estimatedDurationInSeconds: dto.estimatedDurationInSeconds,
        },
      });
    });

    return {
      id: updated.id,
      name: updated.name,
      isRest: updated.isRest,
      weekDay: updated.weekDay,
      estimatedDurationInSeconds: updated.estimatedDurationInSeconds,
      coverImageUrl: updated.coverImageUrl ?? undefined,
    };
  }
}
