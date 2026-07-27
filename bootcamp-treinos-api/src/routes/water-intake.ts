import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { auth } from "../lib/auth.js";
import {
  CreateWaterIntakeBodySchema,
  ErrorSchema,
  WaterIntakeEntrySchema,
  WaterIntakeTodayQuerySchema,
  WaterIntakeTodaySchema,
} from "../schemas/index.js";
import { CreateWaterIntakeEntry } from "../usecases/CreateWaterIntakeEntry.js";
import { GetWaterIntakeToday } from "../usecases/GetWaterIntakeToday.js";

export const waterIntakeRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getWaterIntakeToday",
      tags: ["Water Intake"],
      summary: "Get today's water intake entries, total, and daily goal",
      querystring: WaterIntakeTodayQuerySchema,
      response: {
        200: WaterIntakeTodaySchema,
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

        const getWaterIntakeToday = new GetWaterIntakeToday();
        const result = await getWaterIntakeToday.execute({
          userId: session.user.id,
          date: request.query.date,
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
    method: "POST",
    url: "/",
    schema: {
      operationId: "createWaterIntakeEntry",
      tags: ["Water Intake"],
      summary: "Log a water intake entry",
      body: CreateWaterIntakeBodySchema,
      response: {
        201: WaterIntakeEntrySchema,
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

        const createWaterIntakeEntry = new CreateWaterIntakeEntry();
        const result = await createWaterIntakeEntry.execute({
          userId: session.user.id,
          amountInMl: request.body.amountInMl,
        });

        return reply.status(201).send(result);
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
