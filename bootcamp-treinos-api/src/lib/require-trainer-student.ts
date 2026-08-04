import { UserRole } from "../generated/prisma/enums.js";
import { prisma } from "./db.js";

export const isTrainerStudent = async (
  trainerId: string,
  studentId: string,
): Promise<boolean> => {
  const student = await prisma.user.findFirst({
    where: { id: studentId, trainerId, role: UserRole.STUDENT },
  });

  return !!student;
};
