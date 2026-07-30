import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  muscleGroupId: string;
}

export class DeleteMuscleGroup {
  async execute(dto: InputDto): Promise<void> {
    const muscleGroup = await prisma.muscleGroup.findUnique({
      where: { id: dto.muscleGroupId },
    });

    if (!muscleGroup) {
      throw new NotFoundError("Muscle group not found");
    }

    await prisma.muscleGroup.delete({ where: { id: dto.muscleGroupId } });
  }
}
