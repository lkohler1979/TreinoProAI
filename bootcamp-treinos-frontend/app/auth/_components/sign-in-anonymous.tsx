"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { Button } from "@/components/ui/button";

export const SignInAnonymous = () => {
  const router = useRouter();

  const handleAnonymousLogin = async () => {
    const { error } = await authClient.signIn.anonymous();

    if (error) {
      console.error(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <Button
      onClick={handleAnonymousLogin}
      variant="ghost"
      className="h-[38px] rounded-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
    >
      Entrar sem login (dev)
    </Button>
  );
};
