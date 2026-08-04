import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ConflictError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import { requirePersonalTrainer } from "../lib/require-personal-trainer.js";
import {
  ErrorSchema,
  PersonalTrainerSchema,
  PersonalTrainerSettingsSchema,
  SignUpPersonalTrainerBodySchema,
  UpsertPersonalTrainerSettingsBodySchema,
} from "../schemas/index.js";
import { GetPersonalTrainer } from "../usecases/GetPersonalTrainer.js";
import { GetPersonalTrainerSettings } from "../usecases/GetPersonalTrainerSettings.js";
import { SignUpPersonalTrainer } from "../usecases/SignUpPersonalTrainer.js";
import { UpsertPersonalTrainerSettings } from "../usecases/UpsertPersonalTrainerSettings.js";

export const personalTrainerRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/me",
    schema: {
      operationId: "getPersonalTrainer",
      tags: ["Personal Trainer"],
      summary: "Get the authenticated personal trainer",
      response: {
        200: PersonalTrainerSchema.nullable(),
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

        const getPersonalTrainer = new GetPersonalTrainer();
        const result = await getPersonalTrainer.execute({
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/sign-up",
    schema: {
      operationId: "signUpPersonalTrainer",
      tags: ["Personal Trainer"],
      summary: "Sign up a personal trainer",
      body: SignUpPersonalTrainerBodySchema,
      response: {
        201: PersonalTrainerSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const signUpPersonalTrainer = new SignUpPersonalTrainer();
        const result = await signUpPersonalTrainer.execute({
          name: request.body.name,
          email: request.body.email,
          password: request.body.password,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof ConflictError) {
          return reply.status(409).send({
            error: error.message,
            code: "CONFLICT_ERROR",
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
    url: "/settings",
    schema: {
      operationId: "getPersonalTrainerSettings",
      tags: ["Personal Trainer"],
      summary: "Get the authenticated personal trainer's settings",
      response: {
        200: PersonalTrainerSettingsSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status === "unauthorized") {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }
        if (authResult.status === "forbidden") {
          return reply
            .status(403)
            .send({ error: "Forbidden", code: "FORBIDDEN" });
        }

        const getPersonalTrainerSettings = new GetPersonalTrainerSettings();
        const result = await getPersonalTrainerSettings.execute({
          trainerId: authResult.trainerId,
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
    method: "PATCH",
    url: "/settings",
    schema: {
      operationId: "upsertPersonalTrainerSettings",
      tags: ["Personal Trainer"],
      summary: "Update the authenticated personal trainer's settings",
      body: UpsertPersonalTrainerSettingsBodySchema,
      response: {
        200: PersonalTrainerSettingsSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status === "unauthorized") {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }
        if (authResult.status === "forbidden") {
          return reply
            .status(403)
            .send({ error: "Forbidden", code: "FORBIDDEN" });
        }

        const upsertPersonalTrainerSettings =
          new UpsertPersonalTrainerSettings();
        const result = await upsertPersonalTrainerSettings.execute({
          trainerId: authResult.trainerId,
          defaultAccessDurationInDays: request.body.defaultAccessDurationInDays,
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
