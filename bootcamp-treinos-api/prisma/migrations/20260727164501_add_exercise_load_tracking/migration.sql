-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN     "loadInKg" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ExerciseLoadEntry" (
    "id" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "loadInKg" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseLoadEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseLoadEntry" ADD CONSTRAINT "ExerciseLoadEntry_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
