"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/app/actions";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

type State = { error?: string; success?: boolean; alreadyExists?: boolean } | null;

export function WaitlistForm() {
  const posthog = usePostHog();
  const [state, action, pending] = useActionState<State, FormData>(
    async (_prev: State, formData: FormData) => {
      const result = await joinWaitlist(formData);
      return result;
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      posthog?.capture("waitlist_cta_clicked");
      toast.success(
        state.alreadyExists
          ? "¡Ya estás en la lista de espera!"
          : "¡Te uniste a la lista de espera!"
      );
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, posthog]);

  return (
    <form action={action} className="flex w-full max-w-sm gap-2">
      <Input
        type="email"
        name="email"
        placeholder="tu@email.com"
        required
        className="flex-1"
        aria-label="Correo electrónico"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Acceso anticipado"}
      </Button>
    </form>
  );
}
