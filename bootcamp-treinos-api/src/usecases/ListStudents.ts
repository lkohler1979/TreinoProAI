import dayjs from "dayjs";

import { UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
}

interface StudentOutputDto {
  id: string;
  name: string;
  email: string;
  injuries?: string;
  metabolicConditions?: string;
  accessExpiresAt: string | null;
  isAccessExpired: boolean;
}

type OutputDto = StudentOutputDto[];

export class ListStudents {
  async execute(dto: InputDto): Promise<OutputDto> {
    const students = await prisma.user.findMany({
      where: { trainerId: dto.trainerId, role: UserRole.STUDENT },
      orderBy: { createdAt: "desc" },
    });

    return students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      injuries: student.injuries ?? undefined,
      metabolicConditions: student.metabolicConditions ?? undefined,
      accessExpiresAt: student.accessExpiresAt?.toISOString() ?? null,
      isAccessExpired:
        !!student.accessExpiresAt && dayjs().isAfter(student.accessExpiresAt),
    }));
  }
}
