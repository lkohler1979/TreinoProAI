"use client";

import { Sparkles } from "lucide-react";
import { useQueryStates, parseAsBoolean, parseAsString } from "nuqs";

export function OpenAiChatButton() {
  const [, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
    chat_initial_message: parseAsString,
  });

  return (
    <button
      type="button"
      onClick={() => setChatParams({ chat_open: true })}
      className="flex items-center justify-center gap-1.5 font-heading text-xs text-muted-foreground"
    >
      <Sparkles className="size-3.5" />
      Ou monte com a ajuda da IA
    </button>
  );
}
