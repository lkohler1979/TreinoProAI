import { NotFoundError } from "../errors/index.js";
import { StudentPaymentStatus, UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
  studentId: string;
  amountInCents: number;
  paymentDate: string;
  status: StudentPaymentStatus;
}

interface OutputDto {
  id: string;
  amountInCents: number;
  paymentDate: string;
  status: StudentPaymentStatus;
}

export class CreateStudentPaymentRecord {
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

    const paymentRecord = await prisma.studentPaymentRecord.create({
      data: {
        studentId: student.id,
        amountInCents: dto.amountInCents,
        paymentDate: new Date(dto.paymentDate),
        status: dto.status,
      },
    });

    return {
      id: paymentRecord.id,
      amountInCents: paymentRecord.amountInCents,
      paymentDate: paymentRecord.paymentDate.toISOString(),
      status: paymentRecord.status,
    };
  }
}
