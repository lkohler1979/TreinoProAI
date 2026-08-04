import { FastifyInstance, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ConflictError, NotFoundError } from "../errors/index.js";
import { requirePersonalTrainer } from "../lib/require-personal-trainer.js";
import {
  CreateStudentBodySchema,
  CreateStudentPaymentRecordBodySchema,
  ErrorSchema,
  ListStudentPaymentRecordsSchema,
  ListStudentsSchema,
  StudentPaymentRecordSchema,
  StudentSchema,
  UpdateStudentBodySchema,
} from "../schemas/index.js";
import { CreateStudent } from "../usecases/CreateStudent.js";
import { CreateStudentPaymentRecord } from "../usecases/CreateStudentPaymentRecord.js";
import { GetStudent } from "../usecases/GetStudent.js";
import { ListStudentPaymentRecords } from "../usecases/ListStudentPaymentRecords.js";
import { ListStudents } from "../usecases/ListStudents.js";
import { UpdateStudent } from "../usecases/UpdateStudent.js";

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

export const personalStudentRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "createStudent",
      tags: ["Personal Trainer"],
      summary: "Create a student for the authenticated personal trainer",
      body: CreateStudentBodySchema,
      response: {
        201: StudentSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const createStudent = new CreateStudent();
        const result = await createStudent.execute({
          trainerId: authResult.trainerId,
          name: request.body.name,
          email: request.body.email,
          injuries: request.body.injuries,
          metabolicConditions: request.body.metabolicConditions,
          accessDurationInDays: request.body.accessDurationInDays,
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
    url: "/",
    schema: {
      operationId: "listStudents",
      tags: ["Personal Trainer"],
      summary: "List the authenticated personal trainer's students",
      response: {
        200: ListStudentsSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const authResult = await requirePersonalTrainer(request);
        if (authResult.status !== "ok") {
          return respondAuthFailure(reply, authResult.status);
        }

        const listStudents = new ListStudents();
        const result = await listStudents.execute({
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
    method: "GET",
    url: "/:studentId",
    schema: {
      operationId: "getStudent",
      tags: ["Personal Trainer"],
      summary: "Get a student of the authenticated personal trainer",
      params: z.object({ studentId: z.string() }),
      response: {
        200: StudentSchema,
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

        const getStudent = new GetStudent();
        const result = await getStudent.execute({
          trainerId: authResult.trainerId,
          studentId: request.params.studentId,
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
    method: "PATCH",
    url: "/:studentId",
    schema: {
      operationId: "updateStudent",
      tags: ["Personal Trainer"],
      summary: "Update a student of the authenticated personal trainer",
      params: z.object({ studentId: z.string() }),
      body: UpdateStudentBodySchema,
      response: {
        200: StudentSchema,
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

        const updateStudent = new UpdateStudent();
        const result = await updateStudent.execute({
          trainerId: authResult.trainerId,
          studentId: request.params.studentId,
          name: request.body.name,
          injuries: request.body.injuries,
          metabolicConditions: request.body.metabolicConditions,
          accessExpiresAt: request.body.accessExpiresAt,
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
    url: "/:studentId/payments",
    schema: {
      operationId: "createStudentPaymentRecord",
      tags: ["Personal Trainer"],
      summary: "Create a payment record for a student",
      params: z.object({ studentId: z.string() }),
      body: CreateStudentPaymentRecordBodySchema,
      response: {
        201: StudentPaymentRecordSchema,
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

        const createStudentPaymentRecord = new CreateStudentPaymentRecord();
        const result = await createStudentPaymentRecord.execute({
          trainerId: authResult.trainerId,
          studentId: request.params.studentId,
          amountInCents: request.body.amountInCents,
          paymentDate: request.body.paymentDate,
          status: request.body.status,
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
    url: "/:studentId/payments",
    schema: {
      operationId: "listStudentPaymentRecords",
      tags: ["Personal Trainer"],
      summary: "List payment records for a student",
      params: z.object({ studentId: z.string() }),
      response: {
        200: ListStudentPaymentRecordsSchema,
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

        const listStudentPaymentRecords = new ListStudentPaymentRecords();
        const result = await listStudentPaymentRecords.execute({
          trainerId: authResult.trainerId,
          studentId: request.params.studentId,
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
