import { NotFoundError } from "../errors/index.js";
import { UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  trainerId: string;
  studentId: string;
  recordedAt: string;
  heightInCentimeters?: number;
  weightInGrams?: number;
  bodyMassIndex?: number;
  idealWeightInGrams?: number;
  bodyFatPercentage?: number;
  leanMassPercentage?: number;
  fatMassInGrams?: number;
  leanMassInGrams?: number;
  armMuscleAreaInCm2?: number;
  armFatAreaInCm2?: number;
  waistCircumferenceInCm?: number;
  abdomenCircumferenceInCm?: number;
  rightThighCircumferenceInCm?: number;
  leftThighCircumferenceInCm?: number;
  rightArmCircumferenceInCm?: number;
  leftArmCircumferenceInCm?: number;
  bicepsSkinfoldInMm?: number;
  tricepsSkinfoldInMm?: number;
  abdominalSkinfoldInMm?: number;
  midAxillarySkinfoldInMm?: number;
  suprailiacSkinfoldInMm?: number;
  subscapularSkinfoldInMm?: number;
  chestSkinfoldInMm?: number;
  notes?: string;
}

interface OutputDto {
  id: string;
  recordedAt: string;
  heightInCentimeters?: number;
  weightInGrams?: number;
  bodyMassIndex?: number;
  idealWeightInGrams?: number;
  bodyFatPercentage?: number;
  leanMassPercentage?: number;
  fatMassInGrams?: number;
  leanMassInGrams?: number;
  armMuscleAreaInCm2?: number;
  armFatAreaInCm2?: number;
  waistCircumferenceInCm?: number;
  abdomenCircumferenceInCm?: number;
  rightThighCircumferenceInCm?: number;
  leftThighCircumferenceInCm?: number;
  rightArmCircumferenceInCm?: number;
  leftArmCircumferenceInCm?: number;
  bicepsSkinfoldInMm?: number;
  tricepsSkinfoldInMm?: number;
  abdominalSkinfoldInMm?: number;
  midAxillarySkinfoldInMm?: number;
  suprailiacSkinfoldInMm?: number;
  subscapularSkinfoldInMm?: number;
  chestSkinfoldInMm?: number;
  notes?: string;
}

export class CreateBioimpedanceRecord {
  async execute(dto: InputDto): Promise<OutputDto> {
    const student = await prisma.user.findFirst({
      where: {
        id: dto.studentId,
        trainerId: dto.trainerId,
        role: UserRole.STUDENT,
      },
    });

    if (!student) {
      throw new NotFoundError("Aluno não encontrado");
    }

    const record = await prisma.bioimpedanceRecord.create({
      data: {
        studentId: student.id,
        recordedAt: new Date(dto.recordedAt),
        heightInCentimeters: dto.heightInCentimeters,
        weightInGrams: dto.weightInGrams,
        bodyMassIndex: dto.bodyMassIndex,
        idealWeightInGrams: dto.idealWeightInGrams,
        bodyFatPercentage: dto.bodyFatPercentage,
        leanMassPercentage: dto.leanMassPercentage,
        fatMassInGrams: dto.fatMassInGrams,
        leanMassInGrams: dto.leanMassInGrams,
        armMuscleAreaInCm2: dto.armMuscleAreaInCm2,
        armFatAreaInCm2: dto.armFatAreaInCm2,
        waistCircumferenceInCm: dto.waistCircumferenceInCm,
        abdomenCircumferenceInCm: dto.abdomenCircumferenceInCm,
        rightThighCircumferenceInCm: dto.rightThighCircumferenceInCm,
        leftThighCircumferenceInCm: dto.leftThighCircumferenceInCm,
        rightArmCircumferenceInCm: dto.rightArmCircumferenceInCm,
        leftArmCircumferenceInCm: dto.leftArmCircumferenceInCm,
        bicepsSkinfoldInMm: dto.bicepsSkinfoldInMm,
        tricepsSkinfoldInMm: dto.tricepsSkinfoldInMm,
        abdominalSkinfoldInMm: dto.abdominalSkinfoldInMm,
        midAxillarySkinfoldInMm: dto.midAxillarySkinfoldInMm,
        suprailiacSkinfoldInMm: dto.suprailiacSkinfoldInMm,
        subscapularSkinfoldInMm: dto.subscapularSkinfoldInMm,
        chestSkinfoldInMm: dto.chestSkinfoldInMm,
        notes: dto.notes,
      },
    });

    return {
      id: record.id,
      recordedAt: record.recordedAt.toISOString(),
      heightInCentimeters: record.heightInCentimeters ?? undefined,
      weightInGrams: record.weightInGrams ?? undefined,
      bodyMassIndex: record.bodyMassIndex ?? undefined,
      idealWeightInGrams: record.idealWeightInGrams ?? undefined,
      bodyFatPercentage: record.bodyFatPercentage ?? undefined,
      leanMassPercentage: record.leanMassPercentage ?? undefined,
      fatMassInGrams: record.fatMassInGrams ?? undefined,
      leanMassInGrams: record.leanMassInGrams ?? undefined,
      armMuscleAreaInCm2: record.armMuscleAreaInCm2 ?? undefined,
      armFatAreaInCm2: record.armFatAreaInCm2 ?? undefined,
      waistCircumferenceInCm: record.waistCircumferenceInCm ?? undefined,
      abdomenCircumferenceInCm: record.abdomenCircumferenceInCm ?? undefined,
      rightThighCircumferenceInCm:
        record.rightThighCircumferenceInCm ?? undefined,
      leftThighCircumferenceInCm:
        record.leftThighCircumferenceInCm ?? undefined,
      rightArmCircumferenceInCm:
        record.rightArmCircumferenceInCm ?? undefined,
      leftArmCircumferenceInCm: record.leftArmCircumferenceInCm ?? undefined,
      bicepsSkinfoldInMm: record.bicepsSkinfoldInMm ?? undefined,
      tricepsSkinfoldInMm: record.tricepsSkinfoldInMm ?? undefined,
      abdominalSkinfoldInMm: record.abdominalSkinfoldInMm ?? undefined,
      midAxillarySkinfoldInMm: record.midAxillarySkinfoldInMm ?? undefined,
      suprailiacSkinfoldInMm: record.suprailiacSkinfoldInMm ?? undefined,
      subscapularSkinfoldInMm: record.subscapularSkinfoldInMm ?? undefined,
      chestSkinfoldInMm: record.chestSkinfoldInMm ?? undefined,
      notes: record.notes ?? undefined,
    };
  }
}
