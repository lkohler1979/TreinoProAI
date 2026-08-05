import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  ErrorSchema,
  ListWorkoutTemplatesQuerySchema,
  ListWorkoutTemplatesSchema,
  WorkoutTemplateDetailSchema,
} from "../schemas/index.js";
import { GetWorkoutTemplate } from "../usecases/GetWorkoutTemplate.js";
import { ListWorkoutTemplates } from "../usecases/ListWorkoutTemplates.js";

export const workoutTemplateRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "listWorkoutTemplates",
      tags: ["Workout Template"],
      summary: "List workout templates, optionally filtered by category, level or muscle group",
      querystring: ListWorkoutTemplatesQuerySchema,
      response: {
        200: ListWorkoutTemplatesSchema,
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

        const listWorkoutTemplates = new ListWorkoutTemplates();
        const result = await listWorkoutTemplates.execute({
          category: request.query.category,
          level: request.query.level,
          muscleGroupId: request.query.muscleGroupId,
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutTemplateId",
    schema: {
      operationId: "getWorkoutTemplate",
      tags: ["Workout Template"],
      summary: "Get a workout template with its exercises",
      params: z.object({ workoutTemplateId: z.uuid() }),
      response: {
        200: WorkoutTemplateDetailSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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

        const getWorkoutTemplate = new GetWorkoutTemplate();
        const result = await getWorkoutTemplate.execute({
          workoutTemplateId: request.params.workoutTemplateId,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
