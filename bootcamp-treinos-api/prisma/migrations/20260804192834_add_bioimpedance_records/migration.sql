-- CreateTable
CREATE TABLE "BioimpedanceRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "recordedAt" TIMESTAMPTZ NOT NULL,
    "heightInCentimeters" INTEGER,
    "weightInGrams" INTEGER,
    "bodyMassIndex" DOUBLE PRECISION,
    "idealWeightInGrams" INTEGER,
    "bodyFatPercentage" INTEGER,
    "leanMassPercentage" INTEGER,
    "fatMassInGrams" INTEGER,
    "leanMassInGrams" INTEGER,
    "armMuscleAreaInCm2" DOUBLE PRECISION,
    "armFatAreaInCm2" DOUBLE PRECISION,
    "waistCircumferenceInCm" DOUBLE PRECISION,
    "abdomenCircumferenceInCm" DOUBLE PRECISION,
    "rightThighCircumferenceInCm" DOUBLE PRECISION,
    "leftThighCircumferenceInCm" DOUBLE PRECISION,
    "rightArmCircumferenceInCm" DOUBLE PRECISION,
    "leftArmCircumferenceInCm" DOUBLE PRECISION,
    "bicepsSkinfoldInMm" DOUBLE PRECISION,
    "tricepsSkinfoldInMm" DOUBLE PRECISION,
    "abdominalSkinfoldInMm" DOUBLE PRECISION,
    "midAxillarySkinfoldInMm" DOUBLE PRECISION,
    "suprailiacSkinfoldInMm" DOUBLE PRECISION,
    "subscapularSkinfoldInMm" DOUBLE PRECISION,
    "chestSkinfoldInMm" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BioimpedanceRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BioimpedanceRecord" ADD CONSTRAINT "BioimpedanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
