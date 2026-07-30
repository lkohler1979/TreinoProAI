import { ConflictError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  name: string;
}

interface OutputDto {
  id: string;
  name: string;
}

export class CreateMuscleGroup {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existing = await prisma.muscleGroup.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictError("Muscle group already exists");
    }

    const muscleGroup = await prisma.muscleGroup.create({
      data: { name: dto.name },
    });

    return { id: muscleGroup.id, name: muscleGroup.name };
  }
}
