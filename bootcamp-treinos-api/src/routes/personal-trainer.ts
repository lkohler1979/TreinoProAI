import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ConflictError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  ErrorSchema,
  PersonalTrainerSchema,
  SignUpPersonalTrainerBodySchema,
} from "../schemas/index.js";
import { GetPersonalTrainer } from "../usecases/GetPersonalTrainer.js";
import { SignUpPersonalTrainer } from "../usecases/SignUpPersonalTrainer.js";

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
};
