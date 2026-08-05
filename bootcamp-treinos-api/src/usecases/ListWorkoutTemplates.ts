import {
  WorkoutCategory,
  WorkoutLevel,
} from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  category?: WorkoutCategory;
  level?: WorkoutLevel;
  muscleGroupId?: string;
}

interface WorkoutTemplateOutputDto {
  id: string;
  name: string;
  category: WorkoutCategory;
  level: WorkoutLevel;
  muscleGroupId?: string;
  muscleGroupName?: string;
  estimatedDurationInSeconds: number;
  exercisesCount: number;
}

type OutputDto = WorkoutTemplateOutputDto[];

export class ListWorkoutTemplates {
  async execute(dto: InputDto): Promise<OutputDto> {
    const templates = await prisma.workoutTemplate.findMany({
      where: {
        category: dto.category,
        level: dto.level,
        muscleGroupId: dto.muscleGroupId,
      },
      include: {
        muscleGroup: true,
        _count: { select: { exercises: true } },
      },
      orderBy: { name: "asc" },
    });

    return templates.map((template) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      level: template.level,
      muscleGroupId: template.muscleGroupId ?? undefined,
      muscleGroupName: template.muscleGroup?.name ?? undefined,
      estimatedDurationInSeconds: template.estimatedDurationInSeconds,
      exercisesCount: template._count.exercises,
    }));
  }
}
