"use server";

import dayjs from "dayjs";
import {
  createStudentPaymentRecord,
  updateStudent,
  type CreateStudentPaymentRecordBodyStatus,
} from "@/app/_lib/api/fetch-generated";

interface CreatePaymentRecordActionInput {
  studentId: string;
  amountInCents: number;
  paymentDate: string;
  status: CreateStudentPaymentRecordBodyStatus;
}

interface CreatePaymentRecordActionResult {
  success: boolean;
  error?: string;
}

export const createPaymentRecordAction = async (
  payload: CreatePaymentRecordActionInput,
): Promise<CreatePaymentRecordActionResult> => {
  const response = await createStudentPaymentRecord(payload.studentId, {
    amountInCents: payload.amountInCents,
    paymentDate: payload.paymentDate,
    status: payload.status,
  });

  if (response.status !== 201) {
    return { success: false, error: "Erro ao registrar pagamento." };
  }

  return { success: true };
};

export const renewStudentAccessAction = async (
  studentId: string,
): Promise<void> => {
  await updateStudent(studentId, {
    accessExpiresAt: dayjs().add(30, "day").toISOString(),
  });
};
