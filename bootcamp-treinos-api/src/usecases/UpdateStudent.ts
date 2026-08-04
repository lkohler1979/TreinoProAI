import dayjs from "dayjs";

import { NotFoundError } from "../errors/index.js";
import { UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
  studentId: string;
  name?: string;
  injuries?: string;
  metabolicConditions?: string;
  accessExpiresAt?: string;
}

interface OutputDto {
  id: string;
  name: string;
  email: string;
  injuries?: string;
  metabolicConditions?: string;
  accessExpiresAt: string | null;
  isAccessExpired: boolean;
}

export class UpdateStudent {
  async execute(dto: InputDto): Promise<OutputDto> {
    const student = await prisma.user.findFirst({
      where: {
        id: dto.studentId,
        trainerId: dto.trainerId,
        role: UserRole.STUDENT,
      },
    });

    if (!student) {
      throw new NotFoundError("Aluno não encontrado");
    }

    const updated = await prisma.user.update({
      where: { id: student.id },
      data: {
        name: dto.name,
        injuries: dto.injuries,
        metabolicConditions: dto.metabolicConditions,
        accessExpiresAt: dto.accessExpiresAt
          ? new Date(dto.accessExpiresAt)
          : undefined,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      injuries: updated.injuries ?? undefined,
      metabolicConditions: updated.metabolicConditions ?? undefined,
      accessExpiresAt: updated.accessExpiresAt?.toISOString() ?? null,
      isAccessExpired:
        !!updated.accessExpiresAt && dayjs().isAfter(updated.accessExpiresAt),
    };
  }
}
