"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CIRCLE_RADIUS = 90;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const BEEP_THRESHOLD_IN_SECONDS = 10;

interface RestTimerOverlayProps {
  exerciseName: string;
  sets: number;
  loadInKg?: number;
  restTimeInSeconds: number;
  onClose: () => void;
}

export function RestTimerOverlay({
  exerciseName,
  sets,
  loadInKg,
  restTimeInSeconds,
  onClose,
}: RestTimerOverlayProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(restTimeInSeconds);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = (frequency: number, durationInSeconds: number) => {
    audioContextRef.current ??= new AudioContext();
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + durationInSeconds);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 0) {
          clearInterval(interval);
          return current;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0) {
      playBeep(880, 0.4);
      const timeout = setTimeout(onClose, 700);
      return () => clearTimeout(timeout);
    }

    if (remainingSeconds <= BEEP_THRESHOLD_IN_SECONDS) {
      playBeep(660, 0.15);
    }
  }, [remainingSeconds, onClose]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  const progress = remainingSeconds / restTimeInSeconds;
  const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-[70] mx-auto flex w-full max-w-[480px] flex-col bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4"
        onClick={onClose}
      >
        <X className="size-5 text-muted-foreground" />
      </Button>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 border-b border-border px-8">
        <span className="text-center font-heading text-2xl font-semibold text-foreground">
          {exerciseName}
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1.5 font-heading text-sm font-semibold uppercase text-muted-foreground">
            {sets} séries
          </span>
          {loadInKg != null && (
            <span className="rounded-full bg-muted px-3 py-1.5 font-heading text-sm font-semibold uppercase text-muted-foreground">
              {loadInKg}kg
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="size-56 -rotate-90">
            <circle
              cx="100"
              cy="100"
              r={CIRCLE_RADIUS}
              className="fill-none stroke-muted"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r={CIRCLE_RADIUS}
              className="fill-none stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-heading text-5xl font-bold text-foreground">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="font-heading text-sm text-muted-foreground">
              Descanso
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
