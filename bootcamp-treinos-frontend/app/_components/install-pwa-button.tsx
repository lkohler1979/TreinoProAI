"use client";

import { useState, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPromptServerSnapshot,
  getDeferredInstallPromptSnapshot,
  subscribeToDeferredInstallPrompt,
} from "@/app/_lib/pwa-install";

const subscribeNoop = () => () => {};

const getIsStandaloneSnapshot = () =>
  window.matchMedia("(display-mode: standalone)").matches;
const getIsStandaloneServerSnapshot = () => false;

const getIsIosSnapshot = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(navigator as unknown as { standalone?: boolean }).standalone;
const getIsIosServerSnapshot = () => false;

interface InstallPwaButtonProps {
  buttonClassName?: string;
  instructionsClassName?: string;
}

export const InstallPwaButton = ({
  buttonClassName,
  instructionsClassName,
}: InstallPwaButtonProps) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const isStandalone = useSyncExternalStore(
    subscribeNoop,
    getIsStandaloneSnapshot,
    getIsStandaloneServerSnapshot,
  );
  const isIos = useSyncExternalStore(
    subscribeNoop,
    getIsIosSnapshot,
    getIsIosServerSnapshot,
  );
  const deferredPrompt = useSyncExternalStore(
    subscribeToDeferredInstallPrompt,
    getDeferredInstallPromptSnapshot,
    getDeferredInstallPromptServerSnapshot,
  );

  if (isStandalone || isInstalled) return null;

  if (isIos) {
    return (
      <p
        className={cn(
          "text-center text-sm text-primary-foreground/80",
          instructionsClassName,
        )}
      >
        Para instalar: toque em{" "}
        <span className="font-semibold">Compartilhar</span> →{" "}
        <span className="font-semibold">Adicionar à Tela de Início</span>
      </p>
    );
  }

  if (!deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    clearDeferredInstallPrompt();
  };

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      className={cn(
        "h-[38px] rounded-full border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10",
        buttonClassName,
      )}
    >
      <Download className="size-4 shrink-0" />
      Instalar app
    </Button>
  );
};
