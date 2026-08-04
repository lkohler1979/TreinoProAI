"use server";

import {
  createStudent,
  type CreateStudentBody,
} from "@/app/_lib/api/fetch-generated";

interface CreateStudentActionResult {
  success: boolean;
  error?: string;
}

export const createStudentAction = async (
  payload: CreateStudentBody,
): Promise<CreateStudentActionResult> => {
  const response = await createStudent(payload);

  if (response.status === 409) {
    return { success: false, error: "E-mail já cadastrado." };
  }

  if (response.status !== 201) {
    return { success: false, error: "Erro ao cadastrar aluno." };
  }

  return { success: true };
};
