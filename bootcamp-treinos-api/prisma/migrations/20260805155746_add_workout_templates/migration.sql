-- CreateEnum
CREATE TYPE "WorkoutCategory" AS ENUM ('MUSCULACAO', 'CROSSFIT', 'CALISTENIA', 'FUNCIONAL');

-- CreateEnum
CREATE TYPE "WorkoutLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ExerciseMethod" AS ENUM ('NORMAL', 'DROP_SET', 'REST_PAUSE', 'BI_SET', 'PYRAMID');

-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN     "method" "ExerciseMethod" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "WorkoutPlan" ADD COLUMN     "category" "WorkoutCategory",
ADD COLUMN     "level" "WorkoutLevel";

-- CreateTable
CREATE TABLE "WorkoutTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "WorkoutCategory" NOT NULL,
    "level" "WorkoutLevel" NOT NULL,
    "muscleGroupId" TEXT,
    "estimatedDurationInSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutTemplateExercise" (
    "id" TEXT NOT NULL,
    "workoutTemplateId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "exerciseTemplateId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "restTimeInSeconds" INTEGER NOT NULL,
    "method" "ExerciseMethod" NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "WorkoutTemplateExercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutTemplate" ADD CONSTRAINT "WorkoutTemplate_muscleGroupId_fkey" FOREIGN KEY ("muscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTemplateExercise" ADD CONSTRAINT "WorkoutTemplateExercise_workoutTemplateId_fkey" FOREIGN KEY ("workoutTemplateId") REFERENCES "WorkoutTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTemplateExercise" ADD CONSTRAINT "WorkoutTemplateExercise_exerciseTemplateId_fkey" FOREIGN KEY ("exerciseTemplateId") REFERENCES "ExerciseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
