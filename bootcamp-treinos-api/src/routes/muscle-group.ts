import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ConflictError, NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateExerciseTemplateBodySchema,
  CreateMuscleGroupBodySchema,
  ErrorSchema,
  ExerciseTemplateWithGroupSchema,
  ListMuscleGroupsSchema,
  MuscleGroupSchema,
  UpdateExerciseTemplateBodySchema,
  UpdateMuscleGroupBodySchema,
} from "../schemas/index.js";
import { CreateExerciseTemplate } from "../usecases/CreateExerciseTemplate.js";
import { CreateMuscleGroup } from "../usecases/CreateMuscleGroup.js";
import { DeleteExerciseTemplate } from "../usecases/DeleteExerciseTemplate.js";
import { DeleteMuscleGroup } from "../usecases/DeleteMuscleGroup.js";
import { ListMuscleGroups } from "../usecases/ListMuscleGroups.js";
import { UpdateExerciseTemplate } from "../usecases/UpdateExerciseTemplate.js";
import { UpdateMuscleGroup } from "../usecases/UpdateMuscleGroup.js";

export const muscleGroupRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "listMuscleGroups",
      tags: ["Muscle Group"],
      summary: "List muscle groups with their exercise templates",
      response: {
        200: ListMuscleGroupsSchema,
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

        const listMuscleGroups = new ListMuscleGroups();
        const result = await listMuscleGroups.execute();

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
      operationId: "createMuscleGroup",
      tags: ["Muscle Group"],
      summary: "Create a muscle group",
      body: CreateMuscleGroupBodySchema,
      response: {
        201: MuscleGroupSchema,
        401: ErrorSchema,
        409: ErrorSchema,
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

        const createMuscleGroup = new CreateMuscleGroup();
        const result = await createMuscleGroup.execute({
          name: request.body.name,
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
    method: "PATCH",
    url: "/:muscleGroupId",
    schema: {
      operationId: "updateMuscleGroup",
      tags: ["Muscle Group"],
      summary: "Update a muscle group",
      params: z.object({ muscleGroupId: z.uuid() }),
      body: UpdateMuscleGroupBodySchema,
      response: {
        200: MuscleGroupSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
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

        const updateMuscleGroup = new UpdateMuscleGroup();
        const result = await updateMuscleGroup.execute({
          muscleGroupId: request.params.muscleGroupId,
          name: request.body.name,
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
    method: "DELETE",
    url: "/:muscleGroupId",
    schema: {
      operationId: "deleteMuscleGroup",
      tags: ["Muscle Group"],
      summary: "Delete a muscle group",
      params: z.object({ muscleGroupId: z.uuid() }),
      response: {
        204: z.void(),
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

        const deleteMuscleGroup = new DeleteMuscleGroup();
        await deleteMuscleGroup.execute({
          muscleGroupId: request.params.muscleGroupId,
        });

        return reply.status(204).send();
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
    method: "POST",
    url: "/:muscleGroupId/exercise-templates",
    schema: {
      operationId: "createExerciseTemplate",
      tags: ["Exercise Template"],
      summary: "Create an exercise template within a muscle group",
      params: z.object({ muscleGroupId: z.uuid() }),
      body: CreateExerciseTemplateBodySchema,
      response: {
        201: ExerciseTemplateWithGroupSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
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

        const createExerciseTemplate = new CreateExerciseTemplate();
        const result = await createExerciseTemplate.execute({
          muscleGroupId: request.params.muscleGroupId,
          name: request.body.name,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
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
    method: "PATCH",
    url: "/:muscleGroupId/exercise-templates/:exerciseTemplateId",
    schema: {
      operationId: "updateExerciseTemplate",
      tags: ["Exercise Template"],
      summary: "Update an exercise template",
      params: z.object({
        muscleGroupId: z.uuid(),
        exerciseTemplateId: z.uuid(),
      }),
      body: UpdateExerciseTemplateBodySchema,
      response: {
        200: ExerciseTemplateWithGroupSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
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

        const updateExerciseTemplate = new UpdateExerciseTemplate();
        const result = await updateExerciseTemplate.execute({
          exerciseTemplateId: request.params.exerciseTemplateId,
          name: request.body.name,
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
    method: "DELETE",
    url: "/:muscleGroupId/exercise-templates/:exerciseTemplateId",
    schema: {
      operationId: "deleteExerciseTemplate",
      tags: ["Exercise Template"],
      summary: "Delete an exercise template",
      params: z.object({
        muscleGroupId: z.uuid(),
        exerciseTemplateId: z.uuid(),
      }),
      response: {
        204: z.void(),
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

        const deleteExerciseTemplate = new DeleteExerciseTemplate();
        await deleteExerciseTemplate.execute({
          exerciseTemplateId: request.params.exerciseTemplateId,
        });

        return reply.status(204).send();
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
