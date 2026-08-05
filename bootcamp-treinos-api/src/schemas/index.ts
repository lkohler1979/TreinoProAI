import z from "zod";

import {
  ExerciseMethod,
  StudentPaymentStatus,
  SubscriptionPlanTier,
  SubscriptionStatus,
  WeekDay,
  WorkoutCategory,
  WorkoutGoal,
  WorkoutLevel,
} from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const StartWorkoutSessionSchema = z.object({
  userWorkoutSessionId: z.uuid(),
});

export const UpdateWorkoutSessionBodySchema = z.object({
  completedAt: z.iso.datetime(),
});

export const UpdateWorkoutSessionSchema = z.object({
  id: z.uuid(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
});

export const StatsQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

export const StatsSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.iso.date(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    })
  ),
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
});

export const HomeDataSchema = z.object({
  activeWorkoutPlanId: z.uuid().optional(),
  todayWorkoutDay: z
    .object({
      workoutPlanId: z.uuid(),
      id: z.uuid(),
      name: z.string(),
      isRest: z.boolean(),
      weekDay: z.enum(WeekDay),
      estimatedDurationInSeconds: z.number(),
      coverImageUrl: z.url().optional(),
      exercisesCount: z.number(),
    })
    .optional(),
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.iso.date(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    })
  ),
});

export const GetWorkoutDaySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.url().optional(),
  estimatedDurationInSeconds: z.number(),
  weekDay: z.enum(WeekDay),
  exercises: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      order: z.number(),
      workoutDayId: z.uuid(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
      method: z.enum(ExerciseMethod),
      loadInKg: z.number().optional(),
    })
  ),
  sessions: z.array(
    z.object({
      id: z.uuid(),
      workoutDayId: z.uuid(),
      startedAt: z.iso.date().optional(),
      completedAt: z.iso.date().optional(),
    })
  ),
});

export const MealSchema = z.object({
  id: z.uuid(),
  order: z.number(),
  name: z.string(),
  time: z.string(),
  description: z.string(),
  calories: z.number(),
  proteinInGrams: z.number(),
  carbsInGrams: z.number(),
  fatInGrams: z.number(),
});

export const GetWorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  goal: z.enum(WorkoutGoal).optional(),
  category: z.enum(WorkoutCategory).optional(),
  level: z.enum(WorkoutLevel).optional(),
  dailyWaterGoalInMl: z.number().optional(),
  workoutDays: z.array(
    z.object({
      id: z.uuid(),
      weekDay: z.enum(WeekDay),
      name: z.string(),
      isRest: z.boolean(),
      coverImageUrl: z.url().optional(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    })
  ),
  meals: z.array(MealSchema),
});

export const UpdateWorkoutDayBodySchema = z.object({
  name: z.string().trim().min(1),
  isRest: z.boolean(),
  estimatedDurationInSeconds: z.number().min(1),
});

export const WorkoutDaySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isRest: z.boolean(),
  weekDay: z.enum(WeekDay),
  estimatedDurationInSeconds: z.number(),
  coverImageUrl: z.url().optional(),
});

export const CreateWorkoutExerciseBodySchema = z.object({
  name: z.string().trim().min(1),
  sets: z.number().min(1),
  reps: z.number().min(1),
  restTimeInSeconds: z.number().min(1),
  method: z.enum(ExerciseMethod).optional(),
});

export const UpdateWorkoutExerciseBodySchema = CreateWorkoutExerciseBodySchema;

export const WorkoutExerciseSchema = z.object({
  id: z.uuid(),
  order: z.number(),
  name: z.string(),
  sets: z.number(),
  reps: z.number(),
  restTimeInSeconds: z.number(),
  method: z.enum(ExerciseMethod),
});

export const GetWorkoutPlanDetailsSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z.enum(WorkoutCategory).optional(),
  level: z.enum(WorkoutLevel).optional(),
  workoutDays: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      weekDay: z.enum(WeekDay),
      isRest: z.boolean(),
      estimatedDurationInSeconds: z.number(),
      coverImageUrl: z.url().optional(),
      exercises: z.array(WorkoutExerciseSchema),
    })
  ),
});

export const ListWorkoutPlansQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const ListWorkoutPlansSchema = z.array(
  z.object({
    id: z.uuid(),
    name: z.string(),
    goal: z.enum(WorkoutGoal).optional(),
    category: z.enum(WorkoutCategory).optional(),
    level: z.enum(WorkoutLevel).optional(),
    isActive: z.boolean(),
    workoutDays: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        weekDay: z.enum(WeekDay),
        isRest: z.boolean(),
        estimatedDurationInSeconds: z.number(),
        coverImageUrl: z.url().optional(),
        exercises: z.array(
          z.object({
            id: z.uuid(),
            order: z.number(),
            name: z.string(),
            sets: z.number(),
            reps: z.number(),
            restTimeInSeconds: z.number(),
            method: z.enum(ExerciseMethod),
          })
        ),
      })
    ),
  })
);

export const UpsertUserTrainDataBodySchema = z.object({
  weightInGrams: z.number().min(0),
  heightInCentimeters: z.number().min(0),
  age: z.number().min(0),
  bodyFatPercentage: z.number().min(0).max(100),
  healthRestrictions: z.string().trim().optional(),
  goal: z.enum(WorkoutGoal),
});

export const UserTrainDataSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  weightInGrams: z.number(),
  heightInCentimeters: z.number(),
  age: z.number(),
  bodyFatPercentage: z.number().min(0).max(100),
  healthRestrictions: z.string().optional(),
  goal: z.enum(WorkoutGoal),
});

export const UpsertUserTrainDataSchema = z.object({
  userId: z.string(),
  weightInGrams: z.number(),
  heightInCentimeters: z.number(),
  age: z.number(),
  bodyFatPercentage: z.number(),
  healthRestrictions: z.string().optional(),
  goal: z.enum(WorkoutGoal),
});

export const WorkoutSessionHistoryItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  weekDay: z.enum(WeekDay),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
  durationInSeconds: z.number(),
  exercisesCount: z.number(),
});

export const WorkoutPlanHistorySchema = z.object({
  workoutPlanId: z.uuid(),
  workoutPlanName: z.string(),
  isActive: z.boolean(),
  completedWorkoutsCount: z.number(),
  totalTimeInSeconds: z.number(),
  sessions: z.array(WorkoutSessionHistoryItemSchema),
});

export const ListWorkoutPlanHistorySchema = z.array(WorkoutPlanHistorySchema);

export const UpdateExerciseLoadBodySchema = z.object({
  loadInKg: z.number().min(0),
});

export const ExerciseLoadEntrySchema = z.object({
  id: z.uuid(),
  loadInKg: z.number(),
  recordedAt: z.iso.datetime(),
});

export const ExerciseLoadHistorySchema = z.array(ExerciseLoadEntrySchema);

export const CreateMealBodySchema = z.object({
  name: z.string().trim().min(1),
  time: z.string(),
  description: z.string(),
  calories: z.number().min(0),
  proteinInGrams: z.number().min(0),
  carbsInGrams: z.number().min(0),
  fatInGrams: z.number().min(0),
});

export const UpdateMealBodySchema = CreateMealBodySchema;

export const AnalyzeMealPhotoBodySchema = z.object({
  image: z.string().min(1),
});

export const MealAnalysisSchema = z.object({
  name: z.string(),
  description: z.string(),
  calories: z.number().min(0),
  proteinInGrams: z.number().min(0),
  carbsInGrams: z.number().min(0),
  fatInGrams: z.number().min(0),
});

export const CreateWaterIntakeBodySchema = z.object({
  amountInMl: z.number().min(1),
});

export const WaterIntakeEntrySchema = z.object({
  id: z.uuid(),
  amountInMl: z.number(),
  recordedAt: z.iso.datetime(),
});

export const WaterIntakeTodayQuerySchema = z.object({
  date: z.iso.date(),
});

export const WaterIntakeTodaySchema = z.object({
  goalInMl: z.number().optional(),
  totalInMl: z.number(),
  entries: z.array(WaterIntakeEntrySchema),
});

export const WorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  goal: z.enum(WorkoutGoal).optional(),
  category: z.enum(WorkoutCategory).optional(),
  level: z.enum(WorkoutLevel).optional(),
  dailyWaterGoalInMl: z.number().min(0),
  workoutDays: z.array(
    z.object({
      name: z.string().trim().min(1),
      weekDay: z.enum(WeekDay),
      isRest: z.boolean().default(false),
      estimatedDurationInSeconds: z.number().min(1),
      coverImageUrl: z.url().optional(),
      exercises: z.array(
        z.object({
          order: z.number().min(0),
          name: z.string().trim().min(1),
          sets: z.number().min(1),
          reps: z.number().min(1),
          restTimeInSeconds: z.number().min(1),
          method: z.enum(ExerciseMethod).optional(),
        })
      ),
    })
  ),
  meals: z.array(
    z.object({
      order: z.number().min(0),
      name: z.string().trim().min(1),
      time: z.string(),
      description: z.string(),
      calories: z.number().min(0),
      proteinInGrams: z.number().min(0),
      carbsInGrams: z.number().min(0),
      fatInGrams: z.number().min(0),
    })
  ),
});

export const ExerciseTemplateSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export const ExerciseTemplateWithGroupSchema = ExerciseTemplateSchema.extend({
  muscleGroupId: z.uuid(),
});

export const MuscleGroupSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export const MuscleGroupWithExerciseTemplatesSchema = MuscleGroupSchema.extend(
  {
    exerciseTemplates: z.array(ExerciseTemplateSchema),
  }
);

export const ListMuscleGroupsSchema = z.array(
  MuscleGroupWithExerciseTemplatesSchema
);

export const CreateMuscleGroupBodySchema = z.object({
  name: z.string().trim().min(1),
});

export const UpdateMuscleGroupBodySchema = CreateMuscleGroupBodySchema;

export const CreateExerciseTemplateBodySchema = z.object({
  name: z.string().trim().min(1),
});

export const SignUpPersonalTrainerBodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8),
});

export const PersonalTrainerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});

export const CreateStudentBodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  injuries: z.string().trim().optional(),
  metabolicConditions: z.string().trim().optional(),
  accessDurationInDays: z.number().int().positive().optional(),
});

export const StudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  injuries: z.string().optional(),
  metabolicConditions: z.string().optional(),
  accessExpiresAt: z.iso.datetime().nullable(),
  isAccessExpired: z.boolean(),
});

export const ListStudentsSchema = z.array(StudentSchema);

export const UpdateStudentBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  injuries: z.string().trim().optional(),
  metabolicConditions: z.string().trim().optional(),
  accessExpiresAt: z.iso.datetime().optional(),
});

export const PersonalTrainerSettingsSchema = z.object({
  defaultAccessDurationInDays: z.number().int().positive(),
});

export const UpsertPersonalTrainerSettingsBodySchema =
  PersonalTrainerSettingsSchema;

export const CreateStudentPaymentRecordBodySchema = z.object({
  amountInCents: z.number().int().positive(),
  paymentDate: z.iso.datetime(),
  status: z.enum(StudentPaymentStatus),
});

export const StudentPaymentRecordSchema = z.object({
  id: z.string(),
  amountInCents: z.number(),
  paymentDate: z.iso.datetime(),
  status: z.enum(StudentPaymentStatus),
});

export const ListStudentPaymentRecordsSchema = z.array(
  StudentPaymentRecordSchema
);

export const CreateBioimpedanceRecordBodySchema = z.object({
  recordedAt: z.iso.datetime(),
  heightInCentimeters: z.number().int().positive().optional(),
  weightInGrams: z.number().int().positive().optional(),
  bodyMassIndex: z.number().positive().optional(),
  idealWeightInGrams: z.number().int().positive().optional(),
  bodyFatPercentage: z.number().int().min(0).max(100).optional(),
  leanMassPercentage: z.number().int().min(0).max(100).optional(),
  fatMassInGrams: z.number().int().positive().optional(),
  leanMassInGrams: z.number().int().positive().optional(),
  armMuscleAreaInCm2: z.number().positive().optional(),
  armFatAreaInCm2: z.number().positive().optional(),
  waistCircumferenceInCm: z.number().positive().optional(),
  abdomenCircumferenceInCm: z.number().positive().optional(),
  rightThighCircumferenceInCm: z.number().positive().optional(),
  leftThighCircumferenceInCm: z.number().positive().optional(),
  rightArmCircumferenceInCm: z.number().positive().optional(),
  leftArmCircumferenceInCm: z.number().positive().optional(),
  bicepsSkinfoldInMm: z.number().positive().optional(),
  tricepsSkinfoldInMm: z.number().positive().optional(),
  abdominalSkinfoldInMm: z.number().positive().optional(),
  midAxillarySkinfoldInMm: z.number().positive().optional(),
  suprailiacSkinfoldInMm: z.number().positive().optional(),
  subscapularSkinfoldInMm: z.number().positive().optional(),
  chestSkinfoldInMm: z.number().positive().optional(),
  notes: z.string().trim().optional(),
});

export const BioimpedanceRecordSchema = z.object({
  id: z.string(),
  recordedAt: z.iso.datetime(),
  heightInCentimeters: z.number().optional(),
  weightInGrams: z.number().optional(),
  bodyMassIndex: z.number().optional(),
  idealWeightInGrams: z.number().optional(),
  bodyFatPercentage: z.number().optional(),
  leanMassPercentage: z.number().optional(),
  fatMassInGrams: z.number().optional(),
  leanMassInGrams: z.number().optional(),
  armMuscleAreaInCm2: z.number().optional(),
  armFatAreaInCm2: z.number().optional(),
  waistCircumferenceInCm: z.number().optional(),
  abdomenCircumferenceInCm: z.number().optional(),
  rightThighCircumferenceInCm: z.number().optional(),
  leftThighCircumferenceInCm: z.number().optional(),
  rightArmCircumferenceInCm: z.number().optional(),
  leftArmCircumferenceInCm: z.number().optional(),
  bicepsSkinfoldInMm: z.number().optional(),
  tricepsSkinfoldInMm: z.number().optional(),
  abdominalSkinfoldInMm: z.number().optional(),
  midAxillarySkinfoldInMm: z.number().optional(),
  suprailiacSkinfoldInMm: z.number().optional(),
  subscapularSkinfoldInMm: z.number().optional(),
  chestSkinfoldInMm: z.number().optional(),
  notes: z.string().optional(),
});

export const ListBioimpedanceRecordsSchema = z.array(BioimpedanceRecordSchema);

export const UpdateExerciseTemplateBodySchema = CreateExerciseTemplateBodySchema;

export const ActivateSubscriptionBodySchema = z.object({
  planTier: z.enum(SubscriptionPlanTier),
});

export const SubscriptionSchema = z.object({
  planTier: z.enum(SubscriptionPlanTier).nullable(),
  status: z.enum(SubscriptionStatus).nullable(),
  maxStudents: z.number().nullable(),
  activeStudentsCount: z.number(),
  currentPeriodEnd: z.iso.datetime().nullable(),
});

export const ActivatedSubscriptionSchema = z.object({
  planTier: z.enum(SubscriptionPlanTier),
  status: z.enum(SubscriptionStatus),
  currentPeriodEnd: z.iso.datetime(),
});

export const CanceledSubscriptionSchema = z.object({
  status: z.enum(SubscriptionStatus),
});

export const ListWorkoutTemplatesQuerySchema = z.object({
  category: z.enum(WorkoutCategory).optional(),
  level: z.enum(WorkoutLevel).optional(),
  muscleGroupId: z.uuid().optional(),
});

export const WorkoutTemplateSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z.enum(WorkoutCategory),
  level: z.enum(WorkoutLevel),
  muscleGroupId: z.uuid().optional(),
  muscleGroupName: z.string().optional(),
  estimatedDurationInSeconds: z.number(),
  exercisesCount: z.number(),
});

export const ListWorkoutTemplatesSchema = z.array(WorkoutTemplateSchema);

export const WorkoutTemplateDetailSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  category: z.enum(WorkoutCategory),
  level: z.enum(WorkoutLevel),
  muscleGroupId: z.uuid().optional(),
  muscleGroupName: z.string().optional(),
  estimatedDurationInSeconds: z.number(),
  exercises: z.array(
    z.object({
      id: z.uuid(),
      order: z.number(),
      exerciseTemplateId: z.uuid(),
      name: z.string(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
      method: z.enum(ExerciseMethod),
    })
  ),
});
