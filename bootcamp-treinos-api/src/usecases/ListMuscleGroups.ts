import { prisma } from "../lib/db.js";

interface OutputDto {
  id: string;
  name: string;
  exerciseTemplates: Array<{
    id: string;
    name: string;
  }>;
}

export class ListMuscleGroups {
  async execute(): Promise<OutputDto[]> {
    const muscleGroups = await prisma.muscleGroup.findMany({
      include: { exerciseTemplates: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    });

    return muscleGroups.map((group) => ({
      id: group.id,
      name: group.name,
      exerciseTemplates: group.exerciseTemplates.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
      })),
    }));
  }
}
