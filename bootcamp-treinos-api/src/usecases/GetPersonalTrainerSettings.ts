import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
}

interface OutputDto {
  defaultAccessDurationInDays: number;
}

export class GetPersonalTrainerSettings {
  async execute(dto: InputDto): Promise<OutputDto> {
    const settings = await prisma.personalTrainerSettings.findUnique({
      where: { trainerId: dto.trainerId },
    });

    return {
      defaultAccessDurationInDays: settings?.defaultAccessDurationInDays ?? 30,
    };
  }
}
