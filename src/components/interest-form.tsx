"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { CircleCheck, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { registerInterest, type InterestState } from "@/app/outings/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MAX_PARTICIPANTS, type ContactType } from "@/lib/booking";
import type { InterestField } from "@/lib/outings";

const INITIAL: InterestState = { status: "idle" };

export function InterestForm({ outingId }: { outingId: string }) {
  const [state, formAction, pending] = useActionState(registerInterest, INITIAL);
  const ids = useId();
  const [customerName, setCustomerName] = useState("");
  const [contactType, setContactType] = useState<ContactType>("phone");
  const [contactValue, setContactValue] = useState("");
  const [participantCount, setParticipantCount] = useState("1");

  useEffect(() => {
    if (state.status === "error" && state.message && !state.closed) toast.error(state.message);
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="space-y-2 rounded-xl border p-5">
        <p className="flex items-center gap-2 font-semibold">
          <CircleCheck className="size-5 text-primary" aria-hidden="true" />
          {state.alreadyRegistered ? "You're already on the list for this outing" : "Interest received"}
        </p>
        <p className="text-sm text-muted-foreground">
          {state.alreadyRegistered
            ? "We already have your details for this outing. The organizer will contact you."
            : "Interest received. This does not confirm participation or reserve a place. The organizer will contact you."}
        </p>
      </div>
    );
  }

  if (state.status === "error" && state.closed) {
    return (
      <p role="alert" className="flex gap-2 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {state.message}
      </p>
    );
  }

  const errors: Partial<Record<InterestField, string>> = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const a11y = (name: InterestField) =>
    errors[name] ? { "aria-invalid": true as const, "aria-describedby": `${ids}-${name}-error` } : {};
  const error = (name: InterestField) =>
    errors[name] && (
      <p id={`${ids}-${name}-error`} className="text-sm text-destructive">
        {errors[name]}
      </p>
    );

  return (
    <form action={formAction} className="grid gap-4 rounded-xl border p-5" noValidate>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">I&apos;m interested</h2>
        <p className="text-sm text-muted-foreground">
          Leave your details and the organizer will contact you. This doesn&apos;t reserve a place.
        </p>
      </div>

      <input type="hidden" name="outingId" value={outingId} />
      <input type="hidden" name="contactType" value={contactType} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${ids}-website`}>Website</label>
        <input id={`${ids}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${ids}-customerName`}>Your name</Label>
        <Input
          id={`${ids}-customerName`}
          name="customerName"
          autoComplete="name"
          maxLength={100}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          {...a11y("customerName")}
        />
        {error("customerName")}
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">How should the organizer contact you?</legend>
        <RadioGroup
          value={contactType}
          onValueChange={(value) => {
            setContactType(value as ContactType);
            setContactValue("");
          }}
          className="flex gap-6"
          aria-label="Contact method"
        >
          {(["phone", "email"] as const).map((type) => (
            <Label key={type} className="flex items-center gap-2 font-normal">
              <RadioGroupItem value={type} />
              {type === "phone" ? "Phone" : "Email"}
            </Label>
          ))}
        </RadioGroup>
        {error("contactType")}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="grid content-start gap-2">
          <Label htmlFor={`${ids}-contactValue`}>{contactType === "phone" ? "Phone number" : "Email address"}</Label>
          <Input
            id={`${ids}-contactValue`}
            name="contactValue"
            type={contactType === "phone" ? "tel" : "email"}
            inputMode={contactType === "phone" ? "tel" : "email"}
            autoComplete={contactType === "phone" ? "tel" : "email"}
            placeholder={contactType === "phone" ? "+977 98XXXXXXXX" : "you@example.com"}
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            {...a11y("contactValue")}
          />
          {error("contactValue")}
        </div>
        <div className="grid content-start gap-2">
          <Label htmlFor={`${ids}-participantCount`}>How many people?</Label>
          <Input
            id={`${ids}-participantCount`}
            name="participantCount"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_PARTICIPANTS}
            value={participantCount}
            onChange={(e) => setParticipantCount(e.target.value)}
            {...a11y("participantCount")}
          />
          {error("participantCount")}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        We only share your contact details with the organizer of this outing.
      </p>

      <div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {pending ? "Sending…" : "Register interest"}
        </Button>
      </div>
    </form>
  );
}
