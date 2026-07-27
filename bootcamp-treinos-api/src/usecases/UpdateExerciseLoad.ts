import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  exerciseId: string;
  loadInKg: number;
}

interface OutputDto {
  id: string;
  loadInKg: number;
  recordedAt: string;
}

export class UpdateExerciseLoad {
  async execute(dto: InputDto): Promise<OutputDto> {
    const exercise = await prisma.workoutExercise.findUnique({
      where: { id: dto.exerciseId },
      include: { workoutDay: { include: { workoutPlan: true } } },
    });

    if (!exercise || exercise.workoutDay.workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Exercise not found");
    }

    const [, entry] = await prisma.$transaction([
      prisma.workoutExercise.update({
        where: { id: dto.exerciseId },
        data: { loadInKg: dto.loadInKg },
      }),
      prisma.exerciseLoadEntry.create({
        data: {
          workoutExerciseId: dto.exerciseId,
          loadInKg: dto.loadInKg,
        },
      }),
    ]);

    return {
      id: entry.id,
      loadInKg: entry.loadInKg,
      recordedAt: entry.recordedAt.toISOString(),
    };
  }
}
