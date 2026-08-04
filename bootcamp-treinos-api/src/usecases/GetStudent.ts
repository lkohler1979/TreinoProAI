import dayjs from "dayjs";

import { NotFoundError } from "../errors/index.js";
import { UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
  studentId: string;
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

export class GetStudent {
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

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      injuries: student.injuries ?? undefined,
      metabolicConditions: student.metabolicConditions ?? undefined,
      accessExpiresAt: student.accessExpiresAt?.toISOString() ?? null,
      isAccessExpired:
        !!student.accessExpiresAt && dayjs().isAfter(student.accessExpiresAt),
    };
  }
}
