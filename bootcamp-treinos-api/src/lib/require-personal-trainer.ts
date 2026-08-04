import { FastifyRequest } from "fastify";

import { UserRole } from "../generated/prisma/enums.js";
import { getAuthenticatedSession } from "./get-authenticated-session.js";

type RequirePersonalTrainerResult =
  | { status: "unauthorized" }
  | { status: "forbidden" }
  | { status: "ok"; trainerId: string };

export const requirePersonalTrainer = async (
  request: FastifyRequest,
): Promise<RequirePersonalTrainerResult> => {
  const authResult = await getAuthenticatedSession(request);

  if (authResult.status !== "authenticated") {
    return { status: "unauthorized" };
  }

  if (authResult.session.role !== UserRole.PERSONAL_TRAINER) {
    return { status: "forbidden" };
  }

  return { status: "ok", trainerId: authResult.session.userId };
};
