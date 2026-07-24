"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareStreakCardProps {
  streak: number;
  userName: string;
}

async function generateStreakImage(streak: number, userName: string) {
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#211c17");
  background.addColorStop(1, "#3a2c1e");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#e2571f";
  ctx.font = "600 48px sans-serif";
  ctx.fillText("TREINOPRO.AI", width / 2, 260);

  ctx.fillStyle = "#f9f5ee";
  ctx.font = "700 340px sans-serif";
  ctx.fillText(String(streak), width / 2, 900);

  ctx.fillStyle = "#d8cdbe";
  ctx.font = "500 56px sans-serif";
  ctx.fillText(
    streak === 1 ? "dia seguido treinando" : "dias seguidos treinando",
    width / 2,
    1020
  );

  ctx.fillStyle = "#f9f5ee";
  ctx.font = "600 44px sans-serif";
  ctx.fillText(userName, width / 2, height - 160);

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function ShareStreakCard({ streak, userName }: ShareStreakCardProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const blob = await generateStreakImage(streak, userName);
      if (!blob) return;

      const file = new File([blob], "treinopro-sequencia.png", {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "TreinoPro.AI",
          text: `Treinei ${streak} ${streak === 1 ? "dia seguido" : "dias seguidos"} no TreinoPro.AI!`,
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "treinopro-sequencia.png";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl bg-foreground p-4">
      <div className="flex h-[58px] w-[46px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-primary">
        <span className="font-heading text-lg font-semibold text-primary-foreground">
          {streak}
        </span>
        <span className="font-heading text-[6px] uppercase tracking-wide text-primary-foreground">
          {streak === 1 ? "dia" : "dias"}
        </span>
      </div>
      <div className="flex-1">
        <p className="font-heading text-sm font-semibold text-background">
          Manda pro story
        </p>
        <p className="font-heading text-xs text-background/60">
          Compartilhe sua sequência
        </p>
      </div>
      <Button
        size="sm"
        className="shrink-0 rounded-full"
        onClick={handleShare}
        disabled={isSharing}
      >
        <Send className="size-3.5" />
        Enviar
      </Button>
    </div>
  );
}
