"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalyzeMealPhoto200 } from "@/app/_lib/api/fetch-generated";
import { analyzeMealPhotoAction } from "../_actions";
import { MealForm } from "./meal-form";

const MAX_DIMENSION_IN_PIXELS = 1024;
const JPEG_QUALITY = 0.7;

const resizeImageToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const scale = Math.min(
        1,
        MAX_DIMENSION_IN_PIXELS / Math.max(image.width, image.height),
      );
      const canvas = document.createElement("canvas");
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      const context = canvas.getContext("2d");
      URL.revokeObjectURL(objectUrl);

      if (!context) {
        reject(new Error("Canvas is not supported"));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load the selected image"));
    };

    image.src = objectUrl;
  });

interface PhotoMealCaptureProps {
  workoutPlanId: string;
}

export function PhotoMealCapture({ workoutPlanId }: PhotoMealCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [suggestedValues, setSuggestedValues] =
    useState<AnalyzeMealPhoto200 | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setHasError(false);
    setIsAnalyzing(true);
    try {
      const imageDataUrl = await resizeImageToDataUrl(file);
      const result = await analyzeMealPhotoAction(imageDataUrl);
      setSuggestedValues(result);
    } catch {
      setHasError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (suggestedValues) {
    return (
      <MealForm
        workoutPlanId={workoutPlanId}
        suggestedValues={suggestedValues}
        onDone={() => setSuggestedValues(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isAnalyzing}
        onClick={() => inputRef.current?.click()}
        className="w-full gap-1.5 rounded-xl"
      >
        <Camera className="size-4" />
        {isAnalyzing ? "Analisando foto..." : "Tirar foto do prato"}
      </Button>
      {hasError && (
        <p className="text-center font-heading text-xs text-destructive">
          Não foi possível analisar a foto. Tente novamente.
        </p>
      )}
    </div>
  );
}
