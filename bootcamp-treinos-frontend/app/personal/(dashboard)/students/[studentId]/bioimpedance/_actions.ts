"use server";

import {
  createBioimpedanceRecord,
  type CreateBioimpedanceRecordBody,
} from "@/app/_lib/api/fetch-generated";

interface CreateBioimpedanceRecordActionResult {
  success: boolean;
  error?: string;
}

export const createBioimpedanceRecordAction = async (
  studentId: string,
  payload: CreateBioimpedanceRecordBody,
): Promise<CreateBioimpedanceRecordActionResult> => {
  const response = await createBioimpedanceRecord(studentId, payload);

  if (response.status !== 201) {
    return { success: false, error: "Erro ao registrar medição." };
  }

  return { success: true };
};
