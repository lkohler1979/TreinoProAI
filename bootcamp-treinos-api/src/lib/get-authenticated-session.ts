import { fromNodeHeaders } from "better-auth/node";
import dayjs from "dayjs";
import { FastifyRequest } from "fastify";

import { UserRole } from "../generated/prisma/enums.js";
import { auth } from "./auth.js";
import { prisma } from "./db.js";

interface AuthenticatedSession {
  userId: string;
  role: UserRole;
}

type GetAuthenticatedSessionResult =
  | { status: "unauthenticated" }
  | { status: "access_expired" }
  | { status: "authenticated"; session: AuthenticatedSession };

export const getAuthenticatedSession = async (
  request: FastifyRequest,
): Promise<GetAuthenticatedSessionResult> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    return { status: "unauthenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, accessExpiresAt: true },
  });

  if (!user) {
    return { status: "unauthenticated" };
  }

  const isExpiredStudent =
    user.role === UserRole.STUDENT &&
    !!user.accessExpiresAt &&
    dayjs().isAfter(user.accessExpiresAt);

  if (isExpiredStudent) {
    return { status: "access_expired" };
  }

  return {
    status: "authenticated",
    session: { userId: session.user.id, role: user.role },
  };
};
