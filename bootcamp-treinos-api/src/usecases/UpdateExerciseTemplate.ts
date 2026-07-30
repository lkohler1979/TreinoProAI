import { ConflictError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  exerciseTemplateId: string;
  name: string;
}

interface OutputDto {
  id: string;
  name: string;
  muscleGroupId: string;
}

export class UpdateExerciseTemplate {
  async execute(dto: InputDto): Promise<OutputDto> {
    const exerciseTemplate = await prisma.exerciseTemplate.findUnique({
      where: { id: dto.exerciseTemplateId },
    });

    if (!exerciseTemplate) {
      throw new NotFoundError("Exercise template not found");
    }

    const existing = await prisma.exerciseTemplate.findUnique({
      where: {
        muscleGroupId_name: {
          muscleGroupId: exerciseTemplate.muscleGroupId,
          name: dto.name,
        },
      },
    });

    if (existing && existing.id !== dto.exerciseTemplateId) {
      throw new ConflictError("Exercise template already exists");
    }

    const updated = await prisma.exerciseTemplate.update({
      where: { id: dto.exerciseTemplateId },
      data: { name: dto.name },
    });

    return {
      id: updated.id,
      name: updated.name,
      muscleGroupId: updated.muscleGroupId,
    };
  }
}
