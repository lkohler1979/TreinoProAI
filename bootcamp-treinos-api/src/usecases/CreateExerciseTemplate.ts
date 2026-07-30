import { ConflictError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  muscleGroupId: string;
  name: string;
}

interface OutputDto {
  id: string;
  name: string;
  muscleGroupId: string;
}

export class CreateExerciseTemplate {
  async execute(dto: InputDto): Promise<OutputDto> {
    const muscleGroup = await prisma.muscleGroup.findUnique({
      where: { id: dto.muscleGroupId },
    });

    if (!muscleGroup) {
      throw new NotFoundError("Muscle group not found");
    }

    const existing = await prisma.exerciseTemplate.findUnique({
      where: {
        muscleGroupId_name: {
          muscleGroupId: dto.muscleGroupId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Exercise template already exists");
    }

    const exerciseTemplate = await prisma.exerciseTemplate.create({
      data: { muscleGroupId: dto.muscleGroupId, name: dto.name },
    });

    return {
      id: exerciseTemplate.id,
      name: exerciseTemplate.name,
      muscleGroupId: exerciseTemplate.muscleGroupId,
    };
  }
}
