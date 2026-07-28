"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const subscribeNoop = () => () => {};

const getIsStandaloneSnapshot = () =>
  window.matchMedia("(display-mode: standalone)").matches;
const getIsStandaloneServerSnapshot = () => false;

const getIsIosSnapshot = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(navigator as unknown as { standalone?: boolean }).standalone;
const getIsIosServerSnapshot = () => false;

export const InstallPwaButton = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
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

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || isInstalled) return null;

  if (isIos) {
    return (
      <p className="text-center text-sm text-primary-foreground/80">
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
    setDeferredPrompt(null);
  };

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      className="h-[38px] rounded-full border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10"
    >
      <Download className="size-4 shrink-0" />
      Instalar app
    </Button>
  );
};
