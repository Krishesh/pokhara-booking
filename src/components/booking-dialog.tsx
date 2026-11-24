"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { AlertTriangle, CircleCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { submitBookingRequest, type BookingState, type BookingSuccess } from "@/app/activities/[slug]/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  calculateTotal,
  MAX_PARTICIPANTS,
  maxRequestDate,
  todayInTimeZone,
  type BookingField,
  type ContactType,
} from "@/lib/booking";
import { formatCheckedDate, formatPrice, formatPricingUnit } from "@/lib/offer-format";
import type { Currency, PricingUnit } from "@/lib/types";

export type BookableOffer = {
  id: string;
  price: number;
  currency: Currency;
  pricing_unit: PricingUnit;
  package_name: string | null;
  vendor: string;
};

export function BookingDialog({ offer, activityName }: { offer: BookableOffer; activityName: string }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSession((s) => s + 1); // fresh form each time it opens
      }}
    >
      <DialogTrigger render={<Button className="w-full sm:w-auto" />}>Request booking</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <BookingForm key={session} offer={offer} activityName={activityName} />
      </DialogContent>
    </Dialog>
  );
}

const INITIAL: BookingState = { status: "idle" };

function BookingForm({ offer, activityName }: { offer: BookableOffer; activityName: string }) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, INITIAL);
  const ids = useId();

  // Controlled fields so values survive a failed submit.
  const [customerName, setCustomerName] = useState("");
  const [contactType, setContactType] = useState<ContactType>("phone");
  const [contactValue, setContactValue] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [participantCount, setParticipantCount] = useState("1");

  // If the server reports a changed price, show and submit the new terms.
  const terms = state.status === "error" && state.changedOffer ? state.changedOffer : offer;

  useEffect(() => {
    if (state.status === "error" && state.message && !state.changedOffer && !state.unavailable) {
      toast.error(state.message);
    }
  }, [state]);

  if (state.status === "success") return <BookingConfirmation booking={state.booking} />;

  const today = todayInTimeZone(new Date());
  const count = Number(participantCount);
  const validCount = Number.isInteger(count) && count >= 1 && count <= MAX_PARTICIPANTS;
  const total = validCount ? calculateTotal(terms.price, terms.pricing_unit, count) : null;
  const unit = formatPricingUnit(terms.pricing_unit);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errorProps = (name: BookingField) =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": `${ids}-${name}-error` }
      : {};

  if (state.status === "error" && state.unavailable) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Offer unavailable</DialogTitle>
          <DialogDescription>{state.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Request booking</DialogTitle>
        <DialogDescription>
          {activityName} · {offer.package_name ?? "Standard package"} · {offer.vendor}
        </DialogDescription>
      </DialogHeader>

      {state.status === "error" && state.changedOffer && (
        <div role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <p>
            The price changed to{" "}
            <strong>
              {formatPrice(terms.price, terms.currency)}
              {unit && ` ${unit}`}
            </strong>
            . Review the new total below and submit again.
          </p>
        </div>
      )}

      <input type="hidden" name="offerId" value={offer.id} />
      <input type="hidden" name="shownPrice" value={terms.price} />
      <input type="hidden" name="shownCurrency" value={terms.currency} />
      <input type="hidden" name="shownUnit" value={terms.pricing_unit} />
      <input type="hidden" name="contactType" value={contactType} />
      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${ids}-website`}>Website</label>
        <input id={`${ids}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field id={`${ids}-customerName`} label="Your name" error={errors.customerName}>
        <Input
          id={`${ids}-customerName`}
          name="customerName"
          autoComplete="name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          maxLength={100}
          {...errorProps("customerName")}
        />
      </Field>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">How should we contact you?</legend>
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
        {errors.contactType && <p className="text-sm text-destructive">{errors.contactType}</p>}
      </fieldset>

      <Field
        id={`${ids}-contactValue`}
        label={contactType === "phone" ? "Phone number" : "Email address"}
        error={errors.contactValue}
      >
        <Input
          id={`${ids}-contactValue`}
          name="contactValue"
          type={contactType === "phone" ? "tel" : "email"}
          inputMode={contactType === "phone" ? "tel" : "email"}
          autoComplete={contactType === "phone" ? "tel" : "email"}
          placeholder={contactType === "phone" ? "+977 98XXXXXXXX" : "you@example.com"}
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          required
          {...errorProps("contactValue")}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field id={`${ids}-requestedDate`} label="Date" error={errors.requestedDate}>
          <Input
            id={`${ids}-requestedDate`}
            name="requestedDate"
            type="date"
            min={today}
            max={maxRequestDate(today)}
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            required
            {...errorProps("requestedDate")}
          />
        </Field>
        <Field id={`${ids}-participantCount`} label="Participants" error={errors.participantCount}>
          <Input
            id={`${ids}-participantCount`}
            name="participantCount"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_PARTICIPANTS}
            step={1}
            value={participantCount}
            onChange={(e) => setParticipantCount(e.target.value)}
            required
            {...errorProps("participantCount")}
          />
        </Field>
      </div>

      <div className="rounded-lg bg-muted p-3" aria-live="polite">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-muted-foreground">Estimated total</span>
          <span className="text-xl font-bold tracking-tight">
            {total === null ? "—" : formatPrice(total, terms.currency)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatPrice(terms.price, terms.currency)}
          {unit && ` ${unit}`}
          {terms.pricing_unit === "per_person" && validCount && ` × ${count}`}
          {terms.pricing_unit !== "per_person" && " (flat price)"}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        This is a request, not a confirmed booking. We only use your contact details to arrange this booking.
      </p>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {pending ? "Sending…" : "Send request"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function BookingConfirmation({ booking }: { booking: BookingSuccess }) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 text-primary">
          <CircleCheck className="size-6" aria-hidden="true" />
          <DialogTitle>Request received</DialogTitle>
        </div>
        <DialogDescription>
          Request received. Confirmation is pending. This request does not reserve capacity or guarantee a booking.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-muted-foreground">Your reference</p>
        <p className="font-mono text-2xl font-bold tracking-widest">{booking.reference}</p>
        <p className="mt-1 text-xs text-muted-foreground">Keep this to quote when we contact you.</p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Activity</dt>
        <dd>{booking.activityName}</dd>
        <dt className="text-muted-foreground">Offer</dt>
        <dd>
          {booking.packageName ?? "Standard package"} · {booking.vendor}
        </dd>
        <dt className="text-muted-foreground">Date</dt>
        <dd>{formatCheckedDate(booking.requestedDate)}</dd>
        <dt className="text-muted-foreground">Participants</dt>
        <dd>{booking.participantCount}</dd>
        <dt className="text-muted-foreground">Estimated total</dt>
        <dd className="font-medium">{formatPrice(booking.total, booking.currency)}</dd>
      </dl>

      <DialogFooter>
        <DialogClose render={<Button />}>Done</DialogClose>
      </DialogFooter>
    </>
  );
}
