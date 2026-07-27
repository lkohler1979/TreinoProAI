import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { prisma } from "../lib/db.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  goalInMl?: number;
  totalInMl: number;
  entries: Array<{
    id: string;
    amountInMl: number;
    recordedAt: string;
  }>;
}

export class GetWaterIntakeToday {
  async execute(dto: InputDto): Promise<OutputDto> {
    const day = dayjs.utc(dto.date);

    const [activeWorkoutPlan, entries] = await Promise.all([
      prisma.workoutPlan.findFirst({
        where: { userId: dto.userId, isActive: true },
      }),
      prisma.waterIntakeEntry.findMany({
        where: {
          userId: dto.userId,
          recordedAt: {
            gte: day.startOf("day").toDate(),
            lte: day.endOf("day").toDate(),
          },
        },
        orderBy: { recordedAt: "desc" },
      }),
    ]);

    return {
      goalInMl: activeWorkoutPlan?.dailyWaterGoalInMl ?? undefined,
      totalInMl: entries.reduce((total, entry) => total + entry.amountInMl, 0),
      entries: entries.map((entry) => ({
        id: entry.id,
        amountInMl: entry.amountInMl,
        recordedAt: entry.recordedAt.toISOString(),
      })),
    };
  }
}
