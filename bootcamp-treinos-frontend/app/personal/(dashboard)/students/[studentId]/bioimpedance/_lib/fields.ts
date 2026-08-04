import type { CreateBioimpedanceRecordBody } from "@/app/_lib/api/fetch-generated";

export type BioimpedanceFieldKey = Exclude<
  keyof CreateBioimpedanceRecordBody,
  "recordedAt" | "notes"
>;

interface BioimpedanceFieldConfig {
  key: BioimpedanceFieldKey;
  label: string;
  unit: string;
  isGrams?: boolean;
}

interface BioimpedanceFieldGroup {
  title: string;
  fields: BioimpedanceFieldConfig[];
}

export const BIOIMPEDANCE_FIELD_GROUPS: BioimpedanceFieldGroup[] = [
  {
    title: "Medidas gerais",
    fields: [
      { key: "heightInCentimeters", label: "Altura", unit: "cm" },
      { key: "weightInGrams", label: "Peso", unit: "kg", isGrams: true },
      { key: "bodyMassIndex", label: "IMC", unit: "" },
      {
        key: "idealWeightInGrams",
        label: "Peso Ideal",
        unit: "kg",
        isGrams: true,
      },
      { key: "bodyFatPercentage", label: "% Massa Gorda", unit: "%" },
      { key: "leanMassPercentage", label: "% Massa Magra", unit: "%" },
      {
        key: "fatMassInGrams",
        label: "Massa Gorda",
        unit: "kg",
        isGrams: true,
      },
      {
        key: "leanMassInGrams",
        label: "Massa Magra",
        unit: "kg",
        isGrams: true,
      },
      {
        key: "armMuscleAreaInCm2",
        label: "Área Muscular Braço",
        unit: "cm²",
      },
      { key: "armFatAreaInCm2", label: "Área Gordura Braço", unit: "cm²" },
    ],
  },
  {
    title: "Circunferências",
    fields: [
      { key: "waistCircumferenceInCm", label: "Cintura", unit: "cm" },
      { key: "abdomenCircumferenceInCm", label: "Abdômen", unit: "cm" },
      {
        key: "rightThighCircumferenceInCm",
        label: "Coxa Direita",
        unit: "cm",
      },
      {
        key: "leftThighCircumferenceInCm",
        label: "Coxa Esquerda",
        unit: "cm",
      },
      {
        key: "rightArmCircumferenceInCm",
        label: "Braço Relaxado Dir.",
        unit: "cm",
      },
      {
        key: "leftArmCircumferenceInCm",
        label: "Braço Relaxado Esq.",
        unit: "cm",
      },
    ],
  },
  {
    title: "Pregas cutâneas",
    fields: [
      { key: "bicepsSkinfoldInMm", label: "Bíceps", unit: "mm" },
      { key: "tricepsSkinfoldInMm", label: "Tríceps", unit: "mm" },
      { key: "abdominalSkinfoldInMm", label: "Abdominal", unit: "mm" },
      { key: "midAxillarySkinfoldInMm", label: "Axilar Média", unit: "mm" },
      { key: "suprailiacSkinfoldInMm", label: "Suprailíaca", unit: "mm" },
      { key: "subscapularSkinfoldInMm", label: "Subescapular", unit: "mm" },
      { key: "chestSkinfoldInMm", label: "Tórax", unit: "mm" },
    ],
  },
];

export const ALL_BIOIMPEDANCE_FIELDS: BioimpedanceFieldConfig[] =
  BIOIMPEDANCE_FIELD_GROUPS.flatMap((group) => group.fields);
