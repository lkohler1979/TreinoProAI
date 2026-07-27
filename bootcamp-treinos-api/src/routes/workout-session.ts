import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { auth } from "../lib/auth.js";
import { ErrorSchema, ListWorkoutPlanHistorySchema } from "../schemas/index.js";
import { ListWorkoutPlanHistory } from "../usecases/ListWorkoutPlanHistory.js";

export const workoutSessionRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Workout Session"],
      summary: "List all workout plans with their completed sessions and stats",
      response: {
        200: ListWorkoutPlanHistorySchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const listWorkoutPlanHistory = new ListWorkoutPlanHistory();
        const result = await listWorkoutPlanHistory.execute({
          userId: session.user.id,
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
