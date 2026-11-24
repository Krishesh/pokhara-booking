"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { SaveState } from "@/app/admin/actions";

/** Toasts the result of a save and returns to the list page on success. */
export function useSaveFeedback(state: SaveState, listHref: string) {
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push(listHref);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message ?? "Please fix the highlighted fields.");
    }
  }, [state, listHref, router]);
}

/**
 * onSubmit handler that runs a form action without React's automatic form reset,
 * so typed values survive a validation error.
 */
export function submitKeepingValues(formAction: (formData: FormData) => void) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}
