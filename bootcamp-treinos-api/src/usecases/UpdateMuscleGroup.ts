import { ConflictError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  muscleGroupId: string;
  name: string;
}

interface OutputDto {
  id: string;
  name: string;
}

export class UpdateMuscleGroup {
  async execute(dto: InputDto): Promise<OutputDto> {
    const muscleGroup = await prisma.muscleGroup.findUnique({
      where: { id: dto.muscleGroupId },
    });

    if (!muscleGroup) {
      throw new NotFoundError("Muscle group not found");
    }

    const existing = await prisma.muscleGroup.findUnique({
      where: { name: dto.name },
    });

    if (existing && existing.id !== dto.muscleGroupId) {
      throw new ConflictError("Muscle group already exists");
    }

    const updated = await prisma.muscleGroup.update({
      where: { id: dto.muscleGroupId },
      data: { name: dto.name },
    });

    return { id: updated.id, name: updated.name };
  }
}
