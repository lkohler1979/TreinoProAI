"use server";

import { signUpPersonalTrainer } from "@/app/_lib/api/fetch-generated";

interface SignUpPersonalTrainerActionInput {
  name: string;
  email: string;
  password: string;
}

interface SignUpPersonalTrainerActionResult {
  success: boolean;
  error?: string;
}

export const signUpPersonalTrainerAction = async (
  payload: SignUpPersonalTrainerActionInput,
): Promise<SignUpPersonalTrainerActionResult> => {
  const response = await signUpPersonalTrainer(payload);

  if (response.status === 409) {
    return { success: false, error: "E-mail já cadastrado." };
  }

  if (response.status !== 201) {
    return { success: false, error: "Erro ao criar conta. Tente novamente." };
  }

  return { success: true };
};
