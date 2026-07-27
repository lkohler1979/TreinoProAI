import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  ErrorSchema,
  ExerciseLoadEntrySchema,
  ExerciseLoadHistorySchema,
  UpdateExerciseLoadBodySchema,
} from "../schemas/index.js";
import { GetExerciseLoadHistory } from "../usecases/GetExerciseLoadHistory.js";
import { UpdateExerciseLoad } from "../usecases/UpdateExerciseLoad.js";

export const exerciseRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:exerciseId/load",
    schema: {
      operationId: "updateExerciseLoad",
      tags: ["Exercise"],
      summary: "Update an exercise's current load and log the change",
      params: z.object({ exerciseId: z.uuid() }),
      body: UpdateExerciseLoadBodySchema,
      response: {
        200: ExerciseLoadEntrySchema,
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

        const updateExerciseLoad = new UpdateExerciseLoad();
        const result = await updateExerciseLoad.execute({
          userId: session.user.id,
          exerciseId: request.params.exerciseId,
          loadInKg: request.body.loadInKg,
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:exerciseId/load-history",
    schema: {
      operationId: "getExerciseLoadHistory",
      tags: ["Exercise"],
      summary: "List the load history for an exercise",
      params: z.object({ exerciseId: z.uuid() }),
      response: {
        200: ExerciseLoadHistorySchema,
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

        const getExerciseLoadHistory = new GetExerciseLoadHistory();
        const result = await getExerciseLoadHistory.execute({
          userId: session.user.id,
          exerciseId: request.params.exerciseId,
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
