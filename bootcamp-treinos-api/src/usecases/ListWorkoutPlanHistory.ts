import dayjs from "dayjs";

import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface SessionItemDto {
  id: string;
  name: string;
  weekDay: WeekDay;
  startedAt: string;
  completedAt: string;
  durationInSeconds: number;
  exercisesCount: number;
}

interface WorkoutPlanHistoryDto {
  workoutPlanId: string;
  workoutPlanName: string;
  isActive: boolean;
  completedWorkoutsCount: number;
  totalTimeInSeconds: number;
  sessions: SessionItemDto[];
}

export class ListWorkoutPlanHistory {
  async execute(dto: InputDto): Promise<WorkoutPlanHistoryDto[]> {
    const workoutPlans = await prisma.workoutPlan.findMany({
      where: { userId: dto.userId },
      orderBy: { createdAt: "desc" },
      include: {
        workoutDays: {
          include: {
            exercises: true,
            sessions: { where: { completedAt: { not: null } } },
          },
        },
      },
    });

    return workoutPlans.map((plan) => {
      const sessions: SessionItemDto[] = plan.workoutDays
        .flatMap((day) =>
          day.sessions.map((session) => ({
            id: session.id,
            name: day.name,
            weekDay: day.weekDay,
            startedAt: session.startedAt.toISOString(),
            completedAt: session.completedAt!.toISOString(),
            durationInSeconds: dayjs(session.completedAt).diff(
              dayjs(session.startedAt),
              "second"
            ),
            exercisesCount: day.exercises.length,
          }))
        )
        .sort((a, b) => dayjs(b.completedAt).diff(dayjs(a.completedAt)));

      const totalTimeInSeconds = sessions.reduce(
        (total, session) => total + session.durationInSeconds,
        0
      );

      return {
        workoutPlanId: plan.id,
        workoutPlanName: plan.name,
        isActive: plan.isActive,
        completedWorkoutsCount: sessions.length,
        totalTimeInSeconds,
        sessions,
      };
    });
  }
}
