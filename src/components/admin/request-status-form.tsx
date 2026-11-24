"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateRequestStatus, type StatusChangeState } from "@/app/admin/requests/actions";
import { fieldA11y, FormField } from "@/components/admin/form-field";
import { submitKeepingValues } from "@/components/admin/use-save-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  allowedNextStatuses,
  NOTE_MAX,
  noteRequired,
  STAFF_NAME_MAX,
  STATUS_LABELS,
  type RequestStatus,
} from "@/lib/admin/requests";

const INITIAL: StatusChangeState = { status: "idle" };
const NAME_KEY = "pokhara-admin-staff-name";

const HELP: Record<RequestStatus, string> = {
  pending: "",
  confirmed: "The provider accepted, and the customer agreed to the price and terms.",
  rejected: "The provider can't do it (fully booked, weather, price changed…).",
  cancelled: "The customer or provider called it off after the request.",
};

export function RequestStatusForm({ id, reference, status }: { id: string; reference: string; status: RequestStatus }) {
  const [state, formAction, pending] = useActionState(updateRequestStatus, INITIAL);
  const router = useRouter();
  const options = allowedNextStatuses(status);

  const [to, setTo] = useState<RequestStatus | "">(options.length === 1 ? options[0] : "");
  const [note, setNote] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Remember the staff name in this browser so it's typed once.
  useEffect(() => {
    const saved = window.localStorage.getItem(NAME_KEY);
    if (saved && nameRef.current && !nameRef.current.value) nameRef.current.value = saved;
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh(); // the form remounts (keyed by status) with empty fields
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This request is {STATUS_LABELS[status].toLowerCase()}, which is final. If the customer wants to book again, ask
        them to send a new request on the website.
      </p>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const needsNote = to !== "" && noteRequired(to);

  const submit = submitKeepingValues((formData) => {
    window.localStorage.setItem(NAME_KEY, String(formData.get("staff_name") ?? "").trim());
    formAction(formData);
  });

  return (
    <form
      id={`status-form-${id}`}
      className="grid gap-4"
      noValidate
      onSubmit={(e) => {
        // Final outcomes get a confirmation step first (once the form looks complete;
        // otherwise submit straight away so the field errors show).
        const looksComplete = note.trim().length >= 3 && (nameRef.current?.value.trim().length ?? 0) >= 2;
        if (needsNote && looksComplete && !confirmOpen) {
          e.preventDefault();
          setConfirmOpen(true);
          return;
        }
        setConfirmOpen(false);
        submit(e);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="from" value={status} />
      <input type="hidden" name="to" value={to} />

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">New status</legend>
        <RadioGroup value={to} onValueChange={(v) => setTo(v as RequestStatus)} aria-label="New status" className="grid gap-2">
          {options.map((option) => (
            <Label
              key={option}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-data-checked:border-foreground/30 has-data-checked:bg-muted"
            >
              <RadioGroupItem value={option} className="mt-0.5" />
              <span className="grid gap-0.5">
                <span className="font-medium">{STATUS_LABELS[option]}</span>
                <span className="text-xs text-muted-foreground">{HELP[option]}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
      </fieldset>

      <FormField
        id="staff_note"
        label={needsNote ? "Reason" : "Note"}
        optional={!needsNote}
        error={errors.staff_note}
        hint={needsNote ? "Shared with the customer in the message template." : "For the team, e.g. who you spoke to."}
      >
        <Textarea
          id="staff_note"
          name="staff_note"
          rows={3}
          maxLength={NOTE_MAX}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          {...fieldA11y("staff_note", errors.staff_note, true)}
        />
      </FormField>

      <FormField id="staff_name" label="Your name" error={errors.staff_name} hint="Remembered in this browser.">
        <Input
          id="staff_name"
          name="staff_name"
          autoComplete="name"
          maxLength={STAFF_NAME_MAX}
          ref={nameRef}
          {...fieldA11y("staff_name", errors.staff_name, true)}
        />
      </FormField>

      {state.status === "error" && state.conflict && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
          {state.message}
          <Button type="button" size="sm" variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      )}

      <div>
        <Button type="submit" disabled={pending || to === ""}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {to ? `Mark ${STATUS_LABELS[to].toLowerCase()}` : "Choose a status"}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark {reference} {to ? STATUS_LABELS[to].toLowerCase() : ""}?</DialogTitle>
            <DialogDescription>
              This is final: the request can&apos;t be reopened. Remember to send the customer the message below.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Go back</DialogClose>
            <Button type="submit" form={`status-form-${id}`} variant="destructive">
              Yes, mark {to ? STATUS_LABELS[to].toLowerCase() : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
