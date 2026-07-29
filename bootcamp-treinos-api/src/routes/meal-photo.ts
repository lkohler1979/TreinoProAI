import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { auth } from "../lib/auth.js";
import {
  AnalyzeMealPhotoBodySchema,
  ErrorSchema,
  MealAnalysisSchema,
} from "../schemas/index.js";
import { AnalyzeMealPhoto } from "../usecases/AnalyzeMealPhoto.js";

export const mealPhotoRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/analyze-photo",
    schema: {
      operationId: "analyzeMealPhoto",
      tags: ["Meals"],
      summary:
        "Analyze a photo of a meal and estimate its foods and macros. The photo is not stored.",
      body: AnalyzeMealPhotoBodySchema,
      response: {
        200: MealAnalysisSchema,
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

        const analyzeMealPhoto = new AnalyzeMealPhoto();
        const result = await analyzeMealPhoto.execute({
          image: request.body.image,
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
