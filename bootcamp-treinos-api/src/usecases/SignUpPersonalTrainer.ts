import { APIError } from "better-auth/api";

import { ConflictError } from "../errors/index.js";
import { UserRole } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  name: string;
  email: string;
  password: string;
}

interface OutputDto {
  id: string;
  name: string;
  email: string;
}

export class SignUpPersonalTrainer {
  async execute(dto: InputDto): Promise<OutputDto> {
    try {
      const { user } = await auth.api.signUpEmail({
        body: {
          name: dto.name,
          email: dto.email,
          password: dto.password,
        },
      });

      const trainer = await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.PERSONAL_TRAINER },
      });

      return {
        id: trainer.id,
        name: trainer.name,
        email: trainer.email,
      };
    } catch (error) {
      if (error instanceof APIError && error.status === "UNPROCESSABLE_ENTITY") {
        throw new ConflictError("E-mail já cadastrado");
      }
      throw error;
    }
  }
}
