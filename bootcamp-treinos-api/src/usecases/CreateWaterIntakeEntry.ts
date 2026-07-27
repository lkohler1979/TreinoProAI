import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  amountInMl: number;
}

interface OutputDto {
  id: string;
  amountInMl: number;
  recordedAt: string;
}

export class CreateWaterIntakeEntry {
  async execute(dto: InputDto): Promise<OutputDto> {
    const entry = await prisma.waterIntakeEntry.create({
      data: {
        userId: dto.userId,
        amountInMl: dto.amountInMl,
      },
    });

    return {
      id: entry.id,
      amountInMl: entry.amountInMl,
      recordedAt: entry.recordedAt.toISOString(),
    };
  }
}
