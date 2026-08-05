import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ConflictError, NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import { requirePersonalTrainer } from "../lib/require-personal-trainer.js";
import {
  ActivatedSubscriptionSchema,
  ActivateSubscriptionBodySchema,
  CanceledSubscriptionSchema,
  ErrorSchema,
  PersonalTrainerSchema,
  PersonalTrainerSettingsSchema,
  SignUpPersonalTrainerBodySchema,
  SubscriptionSchema,
  UpsertPersonalTrainerSettingsBodySchema,
} from "../schemas/index.js";
import { ActivateSubscription } from "../usecases/ActivateSubscription.js";
import { CancelSubscription } from "../usecases/CancelSubscription.js";
import { GetPersonalTrainer } from "../usecases/GetPersonalTrainer.js";
import { GetPersonalTrainerSettings } from "../usecases/GetPersonalTrainerSettings.js";
import { GetSubscription } from "../usecases/GetSubscription.js";
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/subscription",
    schema: {
      operationId: "getSubscription",
      tags: ["Personal Trainer"],
      summary: "Get the authenticated personal trainer's subscription",
      response: {
        200: SubscriptionSchema,
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

        const getSubscription = new GetSubscription();
        const result = await getSubscription.execute({
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
    method: "POST",
    url: "/subscription",
    schema: {
      operationId: "activateSubscription",
      tags: ["Personal Trainer"],
      summary: "Activate or change the personal trainer's subscription plan",
      body: ActivateSubscriptionBodySchema,
      response: {
        200: ActivatedSubscriptionSchema,
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

        const activateSubscription = new ActivateSubscription();
        const result = await activateSubscription.execute({
          trainerId: authResult.trainerId,
          planTier: request.body.planTier,
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
    method: "DELETE",
    url: "/subscription",
    schema: {
      operationId: "cancelSubscription",
      tags: ["Personal Trainer"],
      summary: "Cancel the personal trainer's subscription",
      response: {
        200: CanceledSubscriptionSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
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

        const cancelSubscription = new CancelSubscription();
        const result = await cancelSubscription.execute({
          trainerId: authResult.trainerId,
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
