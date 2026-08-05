import { NotFoundError } from "../errors/index.js";
import {
  ExerciseMethod,
  WorkoutCategory,
  WorkoutLevel,
} from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  workoutTemplateId: string;
}

interface OutputDto {
  id: string;
  name: string;
  category: WorkoutCategory;
  level: WorkoutLevel;
  muscleGroupId?: string;
  muscleGroupName?: string;
  estimatedDurationInSeconds: number;
  exercises: Array<{
    id: string;
    order: number;
    exerciseTemplateId: string;
    name: string;
    sets: number;
    reps: number;
    restTimeInSeconds: number;
    method: ExerciseMethod;
  }>;
}

export class GetWorkoutTemplate {
  async execute(dto: InputDto): Promise<OutputDto> {
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: dto.workoutTemplateId },
      include: {
        muscleGroup: true,
        exercises: {
          include: { exerciseTemplate: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!template) {
      throw new NotFoundError("Workout template not found");
    }

    return {
      id: template.id,
      name: template.name,
      category: template.category,
      level: template.level,
      muscleGroupId: template.muscleGroupId ?? undefined,
      muscleGroupName: template.muscleGroup?.name ?? undefined,
      estimatedDurationInSeconds: template.estimatedDurationInSeconds,
      exercises: template.exercises.map((exercise) => ({
        id: exercise.id,
        order: exercise.order,
        exerciseTemplateId: exercise.exerciseTemplateId,
        name: exercise.exerciseTemplate.name,
        sets: exercise.sets,
        reps: exercise.reps,
        restTimeInSeconds: exercise.restTimeInSeconds,
        method: exercise.method,
      })),
    };
  }
}
