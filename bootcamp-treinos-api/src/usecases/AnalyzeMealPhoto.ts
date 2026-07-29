import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import z from "zod";

interface InputDto {
  image: string;
}

interface OutputDto {
  name: string;
  description: string;
  calories: number;
  proteinInGrams: number;
  carbsInGrams: number;
  fatInGrams: number;
}

const MealAnalysisResultSchema = z.object({
  name: z.string().describe("Nome curto do prato (ex: Frango grelhado com arroz e salada)"),
  description: z
    .string()
    .describe("Descrição dos alimentos identificados na foto"),
  calories: z.number().describe("Estimativa de calorias totais do prato"),
  proteinInGrams: z.number().describe("Estimativa de proteína em gramas"),
  carbsInGrams: z.number().describe("Estimativa de carboidratos em gramas"),
  fatInGrams: z.number().describe("Estimativa de gordura em gramas"),
});

export class AnalyzeMealPhoto {
  async execute(dto: InputDto): Promise<OutputDto> {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: MealAnalysisResultSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise a foto deste prato de comida. Identifique os alimentos presentes e estime as calorias, proteínas, carboidratos e gordura totais do prato.",
            },
            {
              type: "image",
              image: dto.image,
            },
          ],
        },
      ],
    });

    return object;
  }
}
