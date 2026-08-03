import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { WeekDay, WorkoutGoal } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { CreateWorkoutExercise } from "../usecases/CreateWorkoutExercise.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { DeleteWorkoutExercise } from "../usecases/DeleteWorkoutExercise.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { ListWorkoutPlans } from "../usecases/ListWorkoutPlans.js";
import { UpdateWorkoutDay } from "../usecases/UpdateWorkoutDay.js";
import { UpdateWorkoutExercise } from "../usecases/UpdateWorkoutExercise.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

const SYSTEM_PROMPT = `Você é um personal trainer virtual especialista em montagem de planos de treino personalizados.

## Personalidade
- Tom amigável, motivador e acolhedor.
- Linguagem simples e direta, sem jargões técnicos. Seu público principal são pessoas leigas em musculação.
- Respostas curtas e objetivas.

## Regras de Interação

1. **SEMPRE** chame a tool \`getUserTrainData\` antes de qualquer interação com o usuário. Isso é obrigatório.
2. Se o usuário **não tem dados cadastrados** (retornou null):
   - Pergunte nome, peso (kg), altura (cm), idade, % de gordura corporal (inteiro de 0 a 100, onde 100 = 100%), quanto tempo já treina (meses), se tem algum problema de saúde ou lesão que impeça ou dificulte algum tipo de exercício, e qual o objetivo principal (hipertrofia/ganho de massa, perda de peso, resistência, força ou condicionamento geral).
   - Faça perguntas simples e diretas, tudo em uma única mensagem.
   - Após receber os dados, salve com a tool \`updateUserTrainData\`. **IMPORTANTE**: converta o peso de kg para gramas (multiplique por 1000) antes de salvar. Se o usuário disser que não tem nenhum problema de saúde, salve \`healthRestrictions\` como "Nenhuma".
3. Se o usuário **já tem dados cadastrados**: cumprimente-o pelo nome de forma amigável.
4. **SEMPRE**, logo em seguida, chame a tool \`getWorkoutPlans\` para verificar se o usuário já tem um plano de treino ativo (\`isActive: true\`).
   - Se **houver** um plano ativo, informe rapidamente qual é o plano/objetivo atual e pergunte o que o usuário deseja fazer:
     a) **Ajustar o treino atual** (trocar, adicionar ou remover um exercício, mudar a duração de um dia, transformar um dia de treino em descanso ou vice-versa);
     b) Diga que **mudou de objetivo** e quer um plano novo alinhado a isso;
     c) **Trocar o treino atual** por um plano novo, mantendo o mesmo objetivo.
   - **Nunca assuma** o que o usuário quer fazer com o plano existente — sempre pergunte antes de agir.
   - Se **não houver** plano ativo, siga direto para a seção "Criação de Plano de Treino".

## Ajustando um Plano Existente

Quando o usuário pedir um **ajuste pontual** (opção "a" acima):
- Use os dados já retornados por \`getWorkoutPlans\` (workoutPlanId, workoutDayId, exerciseId) para identificar exatamente o que precisa mudar. **Nunca** peça esses IDs ao usuário.
- Use as tools \`updateWorkoutDay\`, \`addWorkoutExercise\`, \`updateWorkoutExercise\` e \`removeWorkoutExercise\` para aplicar somente a mudança pedida. **Nunca** recrie o plano inteiro (\`createWorkoutPlan\`) para um ajuste pontual.
- Ao marcar um dia como descanso (\`isRest: true\`), os exercícios daquele dia são removidos automaticamente — avise o usuário disso antes de confirmar.
- Ao adicionar um exercício a um dia que era de descanso, ele passa a ser dia de treino automaticamente; atualize o nome do dia com \`updateWorkoutDay\` para refletir o novo foco.
- Ao final, confirme brevemente com o usuário o que foi alterado.

Quando o usuário indicar que **mudou de objetivo** ou quer **trocar o treino** (opções "b"/"c" acima):
- Pergunte apenas o que ainda não souber (novo objetivo, dias por semana disponíveis, restrições físicas) — não repita perguntas cujas respostas já tem.
- Monte o novo plano com base no foco/estrutura do treino atual (quando ainda fizer sentido para o novo objetivo) e nos dados de medidas do usuário (peso, altura, idade, % de gordura) já cadastrados.
- Chame \`createWorkoutPlan\` normalmente — isso desativa o plano anterior e recalcula a meta de água e o plano alimentar para o novo objetivo.

## Criação de Plano de Treino

Use esta seção tanto para o primeiro plano do usuário quanto para substituir um plano existente (opções "b"/"c" acima). Quando o usuário quiser criar um plano de treino:
- Use o objetivo e as restrições de saúde já cadastrados no perfil (\`getUserTrainData\`) como padrão. Só pergunte o objetivo de novo se o usuário quiser um foco diferente para este plano específico.
- Pergunte apenas quantos dias por semana ele pode treinar.
- Poucas perguntas, simples e diretas.
- O plano DEVE ter exatamente 7 dias (MONDAY a SUNDAY).
- Dias sem treino devem ter: \`isRest: true\`, \`exercises: []\`, \`estimatedDurationInSeconds: 0\`.
- Chame a tool \`createWorkoutPlan\` para salvar o plano, a meta de água e o plano alimentar juntos.

### Meta de Água Diária (dailyWaterGoalInMl)

Calcule com base no peso do usuário e na frequência/intensidade de treino:
- Baseline: 35ml por kg de peso corporal.
- Some 500ml a 750ml se o usuário treina 4 ou mais dias por semana, ou se os treinos são longos/intensos.
- Retorne o valor final em mililitros (ex: 2800).

### Plano Alimentar (meals)

Gere de 5 a 6 refeições cobrindo o dia inteiro (ex: Café da manhã, Almoço, Lanche da tarde, Jantar, Ceia), cada uma com:
- \`time\`: horário sugerido no formato "HH:mm" (ex: "07:00").
- \`description\`: alimentos sugeridos, em texto simples (ex: "3 ovos, 2 fatias de pão integral, 1 banana").
- \`calories\`, \`proteinInGrams\`, \`carbsInGrams\`, \`fatInGrams\`: estimativa nutricional daquela refeição.
- A soma das refeições deve refletir o objetivo do usuário (superávit calórico moderado para hipertrofia/ganho de massa, déficit moderado para perda de peso, manutenção para outros objetivos), usando o peso e dados cadastrados como referência.
- Priorize proteína suficiente para o objetivo (ex: 1.6-2.2g por kg de peso para hipertrofia).

### Divisões de Treino (Splits)

Escolha a divisão adequada com base nos dias disponíveis:
- **2-3 dias/semana**: Full Body ou ABC (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas+Ombros)
- **4 dias/semana**: Upper/Lower (recomendado, cada grupo 2x/semana) ou ABCD (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas, D: Ombros+Abdômen)
- **5 dias/semana**: PPLUL — Push/Pull/Legs + Upper/Lower (superior 3x, inferior 2x/semana)
- **6 dias/semana**: PPL 2x — Push/Pull/Legs repetido

### Princípios Gerais de Montagem
- Músculos sinérgicos juntos (peito+tríceps, costas+bíceps)
- Exercícios compostos primeiro, isoladores depois
- 4 a 8 exercícios por sessão
- 3-4 séries por exercício. 8-12 reps (hipertrofia), 4-6 reps (força)
- Descanso entre séries: 60-90s (hipertrofia), 2-3min (compostos pesados)
- Evitar treinar o mesmo grupo muscular em dias consecutivos
- Nomes descritivos para cada dia (ex: "Superior A - Peito e Costas", "Descanso")

### Imagens de Capa (coverImageUrl)

SEMPRE forneça um \`coverImageUrl\` para cada dia de treino. Escolha com base no foco muscular:

**Dias majoritariamente superiores** (peito, costas, ombros, bíceps, tríceps, push, pull, upper, full body):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

**Dias majoritariamente inferiores** (pernas, glúteos, quadríceps, posterior, panturrilha, legs, lower):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Alterne entre as duas opções de cada categoria para variar. Dias de descanso usam imagem de superior.`;

export const aiRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["AI"],
      summary: "Chat with AI personal trainer",
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const userId = session.user.id;
      const { messages } = request.body as { messages: UIMessage[] };

      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(10),
        tools: {
          getUserTrainData: tool({
            description:
              "Busca os dados de treino do usuário autenticado (peso, altura, idade, % gordura). Retorna null se não houver dados cadastrados.",
            inputSchema: z.object({}),
            execute: async () => {
              const getUserTrainData = new GetUserTrainData();
              return getUserTrainData.execute({ userId });
            },
          }),
          updateUserTrainData: tool({
            description:
              "Atualiza os dados de treino do usuário autenticado. O peso deve ser em gramas (converter kg * 1000).",
            inputSchema: z.object({
              weightInGrams: z
                .number()
                .describe("Peso do usuário em gramas (ex: 70kg = 70000)"),
              heightInCentimeters: z
                .number()
                .describe("Altura do usuário em centímetros"),
              age: z.number().describe("Idade do usuário"),
              bodyFatPercentage: z
                .number()
                .int()
                .min(0)
                .max(100)
                .describe("Percentual de gordura corporal (0 a 100)"),
              healthRestrictions: z
                .string()
                .describe(
                  "Problemas de saúde ou lesões que impeçam ou dificultem algum tipo de exercício. Usar \"Nenhuma\" se o usuário não tiver nenhuma restrição"
                ),
              goal: z
                .enum(WorkoutGoal)
                .describe("Objetivo principal do usuário"),
            }),
            execute: async (params) => {
              const upsertUserTrainData = new UpsertUserTrainData();
              return upsertUserTrainData.execute({ userId, ...params });
            },
          }),
          getWorkoutPlans: tool({
            description:
              "Lista todos os planos de treino do usuário autenticado, incluindo os dias (workoutDayId) e exercícios (exerciseId) de cada um. Use isActive para identificar o plano vigente. Use os IDs retornados aqui para ajustar um plano existente, sem precisar perguntá-los ao usuário.",
            inputSchema: z.object({}),
            execute: async () => {
              const listWorkoutPlans = new ListWorkoutPlans();
              return listWorkoutPlans.execute({ userId });
            },
          }),
          createWorkoutPlan: tool({
            description:
              "Cria um novo plano de treino completo para o usuário.",
            inputSchema: z.object({
              dailyWaterGoalInMl: z
                .number()
                .describe(
                  "Meta diária de consumo de água em mililitros, calculada com base no peso e na frequência de treino do usuário"
                ),
              workoutDays: z
                .array(
                  z.object({
                    name: z
                      .string()
                      .describe("Nome do dia (ex: Peito e Tríceps, Descanso)"),
                    weekDay: z.enum(WeekDay).describe("Dia da semana"),
                    isRest: z
                      .boolean()
                      .describe(
                        "Se é dia de descanso (true) ou treino (false)"
                      ),
                    estimatedDurationInSeconds: z
                      .number()
                      .describe(
                        "Duração estimada em segundos (0 para dias de descanso)"
                      ),
                    coverImageUrl: z
                      .string()
                      .url()
                      .describe(
                        "URL da imagem de capa do dia de treino. Usar as URLs de superior ou inferior conforme o foco muscular do dia."
                      ),
                    exercises: z
                      .array(
                        z.object({
                          order: z
                            .number()
                            .describe("Ordem do exercício no dia"),
                          name: z.string().describe("Nome do exercício"),
                          sets: z.number().describe("Número de séries"),
                          reps: z.number().describe("Número de repetições"),
                          restTimeInSeconds: z
                            .number()
                            .describe(
                              "Tempo de descanso entre séries em segundos"
                            ),
                        })
                      )
                      .describe(
                        "Lista de exercícios (vazia para dias de descanso)"
                      ),
                  })
                )
                .describe(
                  "Array com exatamente 7 dias de treino (MONDAY a SUNDAY)"
                ),
              meals: z
                .array(
                  z.object({
                    order: z.number().describe("Ordem da refeição no dia"),
                    name: z
                      .string()
                      .describe("Nome da refeição (ex: Café da manhã)"),
                    time: z
                      .string()
                      .describe("Horário sugerido no formato HH:mm"),
                    description: z
                      .string()
                      .describe("Alimentos sugeridos para a refeição"),
                    calories: z.number().describe("Calorias da refeição"),
                    proteinInGrams: z
                      .number()
                      .describe("Proteína em gramas"),
                    carbsInGrams: z
                      .number()
                      .describe("Carboidratos em gramas"),
                    fatInGrams: z.number().describe("Gordura em gramas"),
                  })
                )
                .describe(
                  "Plano alimentar com 5 a 6 refeições cobrindo o dia, alinhado ao objetivo do usuário"
                ),
            }),
            execute: async (input) => {
              const createWorkoutPlan = new CreateWorkoutPlan();
              return createWorkoutPlan.execute({
                userId,
                dailyWaterGoalInMl: input.dailyWaterGoalInMl,
                workoutDays: input.workoutDays,
                meals: input.meals,
              });
            },
          }),
          updateWorkoutDay: tool({
            description:
              "Atualiza o nome, a duração estimada ou o status de descanso de um dia do plano de treino. Marcar isRest como true remove automaticamente os exercícios daquele dia.",
            inputSchema: z.object({
              workoutPlanId: z.string().describe("ID do plano de treino"),
              workoutDayId: z.string().describe("ID do dia de treino"),
              name: z
                .string()
                .describe("Nome do dia (ex: Peito e Tríceps, Descanso)"),
              isRest: z
                .boolean()
                .describe("Se o dia passa a ser de descanso"),
              estimatedDurationInSeconds: z
                .number()
                .describe(
                  "Duração estimada em segundos (1 para dias de descanso)"
                ),
            }),
            execute: async (input) => {
              const updateWorkoutDay = new UpdateWorkoutDay();
              return updateWorkoutDay.execute({ userId, ...input });
            },
          }),
          addWorkoutExercise: tool({
            description:
              "Adiciona um novo exercício a um dia do plano de treino. Se o dia era de descanso, ele passa a ser dia de treino automaticamente.",
            inputSchema: z.object({
              workoutPlanId: z.string().describe("ID do plano de treino"),
              workoutDayId: z.string().describe("ID do dia de treino"),
              name: z.string().describe("Nome do exercício"),
              sets: z.number().describe("Número de séries"),
              reps: z.number().describe("Número de repetições"),
              restTimeInSeconds: z
                .number()
                .describe("Tempo de descanso entre séries em segundos"),
            }),
            execute: async (input) => {
              const createWorkoutExercise = new CreateWorkoutExercise();
              return createWorkoutExercise.execute({ userId, ...input });
            },
          }),
          updateWorkoutExercise: tool({
            description:
              "Atualiza o nome, séries, repetições ou descanso de um exercício existente.",
            inputSchema: z.object({
              workoutPlanId: z.string().describe("ID do plano de treino"),
              workoutDayId: z.string().describe("ID do dia de treino"),
              exerciseId: z.string().describe("ID do exercício"),
              name: z.string().describe("Nome do exercício"),
              sets: z.number().describe("Número de séries"),
              reps: z.number().describe("Número de repetições"),
              restTimeInSeconds: z
                .number()
                .describe("Tempo de descanso entre séries em segundos"),
            }),
            execute: async (input) => {
              const updateWorkoutExercise = new UpdateWorkoutExercise();
              return updateWorkoutExercise.execute({ userId, ...input });
            },
          }),
          removeWorkoutExercise: tool({
            description: "Remove um exercício de um dia do plano de treino.",
            inputSchema: z.object({
              workoutPlanId: z.string().describe("ID do plano de treino"),
              workoutDayId: z.string().describe("ID do dia de treino"),
              exerciseId: z.string().describe("ID do exercício"),
            }),
            execute: async (input) => {
              const deleteWorkoutExercise = new DeleteWorkoutExercise();
              await deleteWorkoutExercise.execute({ userId, ...input });
              return { success: true };
            },
          }),
        },
      });

      const response = result.toUIMessageStreamResponse();
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body);
    },
  });
};
