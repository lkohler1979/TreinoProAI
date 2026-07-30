import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  exerciseTemplateId: string;
}

export class DeleteExerciseTemplate {
  async execute(dto: InputDto): Promise<void> {
    const exerciseTemplate = await prisma.exerciseTemplate.findUnique({
      where: { id: dto.exerciseTemplateId },
    });

    if (!exerciseTemplate) {
      throw new NotFoundError("Exercise template not found");
    }

    await prisma.exerciseTemplate.delete({
      where: { id: dto.exerciseTemplateId },
    });
  }
}
