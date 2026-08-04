import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
  defaultAccessDurationInDays: number;
}

interface OutputDto {
  defaultAccessDurationInDays: number;
}

export class UpsertPersonalTrainerSettings {
  async execute(dto: InputDto): Promise<OutputDto> {
    const settings = await prisma.personalTrainerSettings.upsert({
      where: { trainerId: dto.trainerId },
      create: {
        trainerId: dto.trainerId,
        defaultAccessDurationInDays: dto.defaultAccessDurationInDays,
      },
      update: {
        defaultAccessDurationInDays: dto.defaultAccessDurationInDays,
      },
    });

    return {
      defaultAccessDurationInDays: settings.defaultAccessDurationInDays,
    };
  }
}
