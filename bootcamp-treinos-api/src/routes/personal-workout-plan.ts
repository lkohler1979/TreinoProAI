import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { requirePersonalTrainer } from "../lib/require-personal-trainer.js";
import { isTrainerStudent } from "../lib/require-trainer-student.js";
import {
  CreateWorkoutExerciseBodySchema,
  ErrorSchema,
  GetWorkoutPlanDetailsSchema,
  ListWorkoutPlanHistorySchema,
  UpdateWorkoutDayBodySchema,
  UpdateWorkoutExerciseBodySchema,
  WorkoutDaySchema,
  WorkoutExerciseSchema,
  WorkoutPlanSchema,
} from "../schemas/index.js";
import { CreateWorkoutExercise } from "../usecases/CreateWorkoutExercise.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { DeleteWorkoutExercise } from "../usecases/DeleteWorkoutExercise.js";
import { DeleteWorkoutPlan } from "../usecases/DeleteWorkoutPlan.js";
import { GetWorkoutPlanDetails } from "../usecases/GetWorkoutPlanDetails.js";
import { ListWorkoutPlanHistory } from "../usecases/ListWorkoutPlanHistory.js";
import { UpdateWorkoutDay } from "../usecases/UpdateWorkoutDay.js";
import { UpdateWorkoutExercise } from "../usecases/UpdateWorkoutExercise.js";

const respondAuthFailure = (
  reply: FastifyReply,
  authResultStatus: "unauthorized" | "forbidden",
) => {
  if (authResultStatus === "unauthorized") {
    return reply
      .status(401)
      .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }
  return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
};

export const personalWorkoutPlanRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:studentId/workout-plan-history",
    schema: {
      operationId: "listStudentWorkoutPlanHistory",
      tags: ["Personal Trainer"],
      summary: "List a student's workout plans with completed sessions",
      params: z.object({ studentId: z.string() }),
      response: {
        200: ListWorkoutPlanHistorySchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const { studentId } = request.params;
        if (!(await isTrainerStudent(authResult.trainerId, studentId))) {
          return reply
            .status(404)
            .send({ error: "Aluno não encontrado", code: "NOT_FOUND_ERROR" });
        }

        const listWorkoutPlanHistory = new ListWorkoutPlanHistory();
        const result = await listWorkoutPlanHistory.execute({
          userId: studentId,
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
    url: "/:studentId/workout-plans",
    schema: {
      operationId: "createStudentWorkoutPlan",
      tags: ["Personal Trainer"],
      summary: "Create a workout plan for a student",
      params: z.object({ studentId: z.string() }),
      body: WorkoutPlanSchema.omit({ id: true, name: true }),
      response: {
        201: WorkoutPlanSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const { studentId } = request.params;
        if (!(await isTrainerStudent(authResult.trainerId, studentId))) {
          return reply
            .status(404)
            .send({ error: "Aluno não encontrado", code: "NOT_FOUND_ERROR" });
        }

        const createWorkoutPlan = new CreateWorkoutPlan();
        const result = await createWorkoutPlan.execute({
          userId: studentId,
          goal: request.body.goal,
          dailyWaterGoalInMl: request.body.dailyWaterGoalInMl,
          workoutDays: request.body.workoutDays,
          meals: request.body.meals,
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
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:studentId/workout-plans/:workoutPlanId/details",
    schema: {
      operationId: "getStudentWorkoutPlanDetails",
      tags: ["Personal Trainer"],
      summary: "Get a student's workout plan with all days and exercises",
      params: z.object({
        studentId: z.string(),
        workoutPlanId: z.uuid(),
      }),
      response: {
        200: GetWorkoutPlanDetailsSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const { studentId, workoutPlanId } = request.params;
        if (!(await isTrainerStudent(authResult.trainerId, studentId))) {
          return reply
            .status(404)
            .send({ error: "Aluno não encontrado", code: "NOT_FOUND_ERROR" });
        }

        const getWorkoutPlanDetails = new GetWorkoutPlanDetails();
        const result = await getWorkoutPlanDetails.execute({
          userId: studentId,
          workoutPlanId,
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
    method: "DELETE",
    url: "/:studentId/workout-plans/:workoutPlanId",
    schema: {
      operationId: "deleteStudentWorkoutPlan",
      tags: ["Personal Trainer"],
      summary: "Delete a student's workout plan",
      params: z.object({
        studentId: z.string(),
        workoutPlanId: z.uuid(),
      }),
      response: {
        204: z.void(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const { studentId, workoutPlanId } = request.params;
        if (!(await isTrainerStudent(authResult.trainerId, studentId))) {
          return reply
            .status(404)
            .send({ error: "Aluno não encontrado", code: "NOT_FOUND_ERROR" });
        }

        const deleteWorkoutPlan = new DeleteWorkoutPlan();
        await deleteWorkoutPlan.execute({
          userId: studentId,
          workoutPlanId,
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
    method: "PATCH",
    url: "/:studentId/workout-plans/:workoutPlanId/days/:workoutDayId",
    schema: {
      operationId: "updateStudentWorkoutDay",
      tags: ["Personal Trainer"],
      summary: "Update a workout day of a student's plan",
      params: z.object({
        studentId: z.string(),
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
      }),
      body: UpdateWorkoutDayBodySchema,
      response: {
        200: WorkoutDaySchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const { studentId, workoutPlanId, workoutDayId } = request.params;
        if (!(await isTrainerStudent(authResult.trainerId, studentId))) {
          return reply
            .status(404)
            .send({ error: "Aluno não encontrado", code: "NOT_FOUND_ERROR" });
        }

        const updateWorkoutDay = new UpdateWorkoutDay();
        const result = await updateWorkoutDay.execute({
          userId: studentId,
          workoutPlanId,
          workoutDayId,
          name: request.body.name,
          isRest: request.body.isRest,
          estimatedDurationInSeconds: request.body.estimatedDurationInSeconds,
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
    method: "POST",
    url: "/:studentId/workout-plans/:workoutPlanId/days/:workoutDayId/exercises",
    schema: {
      operationId: "createStudentWorkoutExercise",
      tags: ["Personal Trainer"],
      summary: "Add an exercise to a student's workout day",
      params: z.object({
        studentId: z.string(),
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
      }),
      body: CreateWorkoutExerciseBodySchema,
      response: {
        201: WorkoutExerciseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const { studentId, workoutPlanId, workoutDayId } = request.params;
        if (!(await isTrainerStudent(authResult.trainerId, studentId))) {
          return reply
            .status(404)
            .send({ error: "Aluno não encontrado", code: "NOT_FOUND_ERROR" });
        }

        const createWorkoutExercise = new CreateWorkoutExercise();
        const result = await createWorkoutExercise.execute({
          userId: studentId,
          workoutPlanId,
          workoutDayId,
          name: request.body.name,
          sets: request.body.sets,
          reps: request.body.reps,
          restTimeInSeconds: request.body.restTimeInSeconds,
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
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:studentId/workout-plans/:workoutPlanId/days/:workoutDayId/exercises/:exerciseId",
    schema: {
      operationId: "updateStudentWorkoutExercise",
      tags: ["Personal Trainer"],
      summary: "Update an exercise in a student's workout day",
      params: z.object({
        studentId: z.string(),
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
        exerciseId: z.uuid(),
      }),
      body: UpdateWorkoutExerciseBodySchema,
      response: {
        200: WorkoutExerciseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const { studentId, workoutPlanId, workoutDayId, exerciseId } =
          request.params;
        if (!(await isTrainerStudent(authResult.trainerId, studentId))) {
          return reply
            .status(404)
            .send({ error: "Aluno não encontrado", code: "NOT_FOUND_ERROR" });
        }

        const updateWorkoutExercise = new UpdateWorkoutExercise();
        const result = await updateWorkoutExercise.execute({
          userId: studentId,
          workoutPlanId,
          workoutDayId,
          exerciseId,
          name: request.body.name,
          sets: request.body.sets,
          reps: request.body.reps,
          restTimeInSeconds: request.body.restTimeInSeconds,
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
    method: "DELETE",
    url: "/:studentId/workout-plans/:workoutPlanId/days/:workoutDayId/exercises/:exerciseId",
    schema: {
      operationId: "deleteStudentWorkoutExercise",
      tags: ["Personal Trainer"],
      summary: "Delete an exercise from a student's workout day",
      params: z.object({
        studentId: z.string(),
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
        exerciseId: z.uuid(),
      }),
      response: {
        204: z.void(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const { studentId, workoutPlanId, workoutDayId, exerciseId } =
          request.params;
        if (!(await isTrainerStudent(authResult.trainerId, studentId))) {
          return reply
            .status(404)
            .send({ error: "Aluno não encontrado", code: "NOT_FOUND_ERROR" });
        }

        const deleteWorkoutExercise = new DeleteWorkoutExercise();
        await deleteWorkoutExercise.execute({
          userId: studentId,
          workoutPlanId,
          workoutDayId,
          exerciseId,
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
