import { APIError } from "better-auth/api";
import dayjs from "dayjs";

import { ConflictError } from "../errors/index.js";
import { UserRole } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/db.js";
import { sendWelcomeEmail } from "../lib/email.js";
import { generateRandomPassword } from "../lib/generate-random-password.js";

interface InputDto {
  trainerId: string;
  name: string;
  email: string;
  injuries?: string;
  metabolicConditions?: string;
  accessDurationInDays?: number;
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

export class CreateStudent {
  async execute(dto: InputDto): Promise<OutputDto> {
    const password = generateRandomPassword();

    try {
      const { user } = await auth.api.signUpEmail({
        body: {
          name: dto.name,
          email: dto.email,
          password,
        },
      });

      const settings = await prisma.personalTrainerSettings.findUnique({
        where: { trainerId: dto.trainerId },
      });
      const accessDurationInDays =
        dto.accessDurationInDays ??
        settings?.defaultAccessDurationInDays ??
        30;
      const accessExpiresAt = dayjs()
        .add(accessDurationInDays, "day")
        .toDate();

      const student = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: UserRole.STUDENT,
          trainerId: dto.trainerId,
          injuries: dto.injuries,
          metabolicConditions: dto.metabolicConditions,
          accessExpiresAt,
        },
      });

      await sendWelcomeEmail({
        to: student.email,
        studentName: student.name,
        loginEmail: student.email,
        password,
      });

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        injuries: student.injuries ?? undefined,
        metabolicConditions: student.metabolicConditions ?? undefined,
        accessExpiresAt: accessExpiresAt.toISOString(),
        isAccessExpired: false,
      };
    } catch (error) {
      if (
        error instanceof APIError &&
        error.status === "UNPROCESSABLE_ENTITY"
      ) {
        throw new ConflictError("E-mail já cadastrado");
      }
      throw error;
    }
  }
}
