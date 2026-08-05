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

  if (response.status === 402) {
    return {
      success: false,
      error:
        "Você precisa de uma assinatura ativa para cadastrar alunos. Acesse Assinatura no seu painel.",
    };
  }

  if (response.status === 403) {
    return {
      success: false,
      error:
        "Limite de alunos do seu plano atual atingido. Faça upgrade em Assinatura.",
    };
  }

  if (response.status === 409) {
    return { success: false, error: "E-mail já cadastrado." };
  }

  if (response.status !== 201) {
    return { success: false, error: "Erro ao cadastrar aluno." };
  }

  return { success: true };
};
