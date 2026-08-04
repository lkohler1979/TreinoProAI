import { NotFoundError } from "../errors/index.js";
import { StudentPaymentStatus, UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
  studentId: string;
}

interface PaymentRecordOutputDto {
  id: string;
  amountInCents: number;
  paymentDate: string;
  status: StudentPaymentStatus;
}

type OutputDto = PaymentRecordOutputDto[];

export class ListStudentPaymentRecords {
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

    const paymentRecords = await prisma.studentPaymentRecord.findMany({
      where: { studentId: student.id },
      orderBy: { paymentDate: "desc" },
    });

    return paymentRecords.map((paymentRecord) => ({
      id: paymentRecord.id,
      amountInCents: paymentRecord.amountInCents,
      paymentDate: paymentRecord.paymentDate.toISOString(),
      status: paymentRecord.status,
    }));
  }
}
