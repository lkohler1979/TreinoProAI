import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  exerciseId: string;
}

interface OutputDto {
  id: string;
  loadInKg: number;
  recordedAt: string;
}

export class GetExerciseLoadHistory {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    const exercise = await prisma.workoutExercise.findUnique({
      where: { id: dto.exerciseId },
      include: { workoutDay: { include: { workoutPlan: true } } },
    });

    if (!exercise || exercise.workoutDay.workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Exercise not found");
    }

    const entries = await prisma.exerciseLoadEntry.findMany({
      where: { workoutExerciseId: dto.exerciseId },
      orderBy: { recordedAt: "desc" },
    });

    return entries.map((entry) => ({
      id: entry.id,
      loadInKg: entry.loadInKg,
      recordedAt: entry.recordedAt.toISOString(),
    }));
  }
}
