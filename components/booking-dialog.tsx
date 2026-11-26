"use client"

import { useId, useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  Loader2,
  Mail,
  Phone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  calculateTotal,
  generateReference,
  maxRequestDate,
  todayInTimeZone,
  validateBookingForm,
  type BookingFormErrors,
  type RequestableOffer,
} from "@/lib/booking"
import {
  formatDateLabel,
  formatPricingUnit,
  formatPrice,
} from "@/lib/offer-format"
import type { AvailableOffer } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BookingDialogProps {
  offer: RequestableOffer
  activityName: string
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null
  }
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  )
}

interface ConfirmationData {
  reference: string
  packageName: string
  vendorName: string
  total: number
  currency: AvailableOffer["currency"]
  requestedDate: string
  participantCount: number
}

export function BookingDialog({ offer, activityName }: BookingDialogProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [contactType, setContactType] = useState<"phone" | "email">("phone")
  const [contactValue, setContactValue] = useState("")
  const [requestedDate, setRequestedDate] = useState("")
  const [participantCount, setParticipantCount] = useState("1")
  const [website, setWebsite] = useState("")
  const [errors, setErrors] = useState<BookingFormErrors>({})
  const [sending, setSending] = useState(false)
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(
    null
  )

  const today = todayInTimeZone()
  const packageName = offer.package_name?.trim() || "Standard package"
  const vendorName = offer.provider?.name ?? `Listed on ${offer.source_domain}`
  const pricingUnit = offer.pricing_unit
  const unitLabel = formatPricingUnit(pricingUnit)
  const count = Number(participantCount)
  const validCount = Number.isInteger(count) && count >= 1 && count <= 20
  const estimatedTotal = validCount
    ? calculateTotal(offer.price, pricingUnit, count)
    : null

  function resetForm() {
    setCustomerName("")
    setContactType("phone")
    setContactValue("")
    setRequestedDate("")
    setParticipantCount("1")
    setWebsite("")
    setErrors({})
    setConfirmation(null)
    setSending(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      resetForm()
    }
    setOpen(nextOpen)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    const validationErrors = validateBookingForm(
      {
        customerName,
        contactType,
        contactValue,
        requestedDate,
        participantCount: count,
        website,
      },
      today
    )

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSending(true)
    const total = calculateTotal(offer.price, pricingUnit, count)
    setConfirmation({
      reference: generateReference(),
      packageName,
      vendorName,
      total,
      currency: offer.currency,
      requestedDate,
      participantCount: count,
    })
    setSending(false)
  }

  function fieldProps(name: keyof BookingFormErrors) {
    return errors[name]
      ? { "aria-invalid": true, "aria-describedby": `${id}-${name}-error` }
      : {}
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="h-11 w-full" />}>
        Request booking
        <ArrowRight aria-hidden="true" />
      </DialogTrigger>

      <DialogContent className="max-h-[92dvh] overflow-y-auto shadow-lifted sm:max-w-lg">
        {confirmation ? (
          <>
            <DialogHeader className="items-start pr-10">
              <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <CircleCheck className="size-6" aria-hidden="true" />
              </span>
              <DialogTitle>Request received</DialogTitle>
              <DialogDescription>
                Request received. Confirmation is pending. This request does not
                reserve capacity or guarantee a booking.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-ink p-4 text-center text-mist">
              <p className="text-sm text-mist/70">Your reference</p>
              <p className="pt-1 text-2xl font-bold tracking-[0.1em] tabular-nums">
                {confirmation.reference}
              </p>
              <p className="mt-1 text-sm text-mist/70">
                Quote it when we contact you.
              </p>
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Activity</dt>
              <dd>{activityName}</dd>
              <dt className="text-muted-foreground">Offer</dt>
              <dd>
                {confirmation.packageName}, {confirmation.vendorName}
              </dd>
              <dt className="text-muted-foreground">Date</dt>
              <dd>{formatDateLabel(confirmation.requestedDate)}</dd>
              <dt className="text-muted-foreground">Participants</dt>
              <dd>{confirmation.participantCount}</dd>
              <dt className="text-muted-foreground">Estimated total</dt>
              <dd className="font-bold text-primary tabular-nums">
                {formatPrice(confirmation.total, confirmation.currency)}
              </dd>
            </dl>

            <DialogFooter className="border-t-0 bg-transparent p-0">
              <DialogClose render={<Button />}>Done</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
            <DialogHeader className="pr-10">
              <DialogTitle>Request booking</DialogTitle>
              <DialogDescription className="text-sm leading-snug">
                <span className="font-semibold text-foreground">
                  {packageName}
                </span>{" "}
                with {vendorName}, for {activityName}.
              </DialogDescription>
            </DialogHeader>

            <input type="hidden" name="offerId" value={offer.id} />
            <input type="hidden" name="shownPrice" value={offer.price} />
            <input type="hidden" name="shownCurrency" value={offer.currency} />
            <input type="hidden" name="shownUnit" value={pricingUnit} />
            <input type="hidden" name="contactType" value={contactType} />

            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <Label htmlFor={`${id}-website`}>Website</Label>
              <Input
                id={`${id}-website`}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>

            <div className="grid content-start gap-2">
              <Label htmlFor={`${id}-customerName`}>Your name</Label>
              <Input
                id={`${id}-customerName`}
                name="customerName"
                autoComplete="name"
                maxLength={100}
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
                className="h-11 rounded-lg bg-card px-3.5"
                {...fieldProps("customerName")}
              />
              <FieldError
                id={`${id}-customerName-error`}
                message={errors.customerName}
              />
            </div>

            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">
                How should we contact you?
              </legend>
              <RadioGroup
                value={contactType}
                onValueChange={(value) => {
                  setContactType(value as "phone" | "email")
                  setContactValue("")
                }}
                className="grid grid-cols-2 gap-3"
                aria-label="Contact method"
              >
                <Label className="flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-input bg-card px-3.5 font-medium transition-colors has-data-checked:border-primary has-data-checked:bg-accent">
                  <RadioGroupItem value="phone" />
                  <Phone className="size-4 text-primary" aria-hidden="true" />
                  Phone
                </Label>
                <Label className="flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-input bg-card px-3.5 font-medium transition-colors has-data-checked:border-primary has-data-checked:bg-accent">
                  <RadioGroupItem value="email" />
                  <Mail className="size-4 text-primary" aria-hidden="true" />
                  Email
                </Label>
              </RadioGroup>
            </fieldset>

            <div className="grid content-start gap-2">
              <Label htmlFor={`${id}-contactValue`}>
                {contactType === "phone" ? "Phone number" : "Email address"}
              </Label>
              <Input
                id={`${id}-contactValue`}
                name="contactValue"
                type={contactType === "phone" ? "tel" : "email"}
                inputMode={contactType === "phone" ? "tel" : "email"}
                autoComplete={contactType === "phone" ? "tel" : "email"}
                placeholder={
                  contactType === "phone"
                    ? "+977 98XXXXXXXX"
                    : "you@example.com"
                }
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                required
                className="h-11 rounded-lg bg-card px-3.5"
                {...fieldProps("contactValue")}
              />
              <FieldError
                id={`${id}-contactValue-error`}
                message={errors.contactValue}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid content-start gap-2">
                <Label htmlFor={`${id}-requestedDate`}>Date</Label>
                <Input
                  id={`${id}-requestedDate`}
                  name="requestedDate"
                  type="date"
                  min={today}
                  max={maxRequestDate(today)}
                  value={requestedDate}
                  onChange={(event) => setRequestedDate(event.target.value)}
                  required
                  className="h-11 rounded-lg bg-card px-3.5"
                  {...fieldProps("requestedDate")}
                />
                <FieldError
                  id={`${id}-requestedDate-error`}
                  message={errors.requestedDate}
                />
              </div>
              <div className="grid content-start gap-2">
                <Label htmlFor={`${id}-participantCount`}>Participants</Label>
                <Input
                  id={`${id}-participantCount`}
                  name="participantCount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20}
                  step={1}
                  value={participantCount}
                  onChange={(event) => setParticipantCount(event.target.value)}
                  required
                  className="h-11 rounded-lg bg-card px-3.5"
                  {...fieldProps("participantCount")}
                />
                <FieldError
                  id={`${id}-participantCount-error`}
                  message={errors.participantCount}
                />
              </div>
            </div>

            <div className="rounded-lg bg-accent p-4" aria-live="polite">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-semibold">Estimated total</span>
                <span className="text-2xl font-bold tracking-tight text-primary tabular-nums">
                  {estimatedTotal === null
                    ? "—"
                    : formatPrice(estimatedTotal, offer.currency)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                {formatPrice(offer.price, offer.currency)}
                {unitLabel ? ` ${unitLabel}` : ""}
                {pricingUnit === "per_person" && validCount
                  ? ` × ${count}`
                  : ""}
                {pricingUnit !== "per_person" ? " (flat price)" : ""}
              </p>
            </div>

            <p className="flex gap-2.5 rounded-lg bg-muted p-3.5 text-sm leading-snug text-muted-foreground">
              <BadgeCheck
                className={cn("mt-0.5 size-4 shrink-0")}
                aria-hidden="true"
              />
              <span>
                This is a request, not a confirmed booking. Nothing is charged.
                We only use your contact details to arrange this booking.
              </span>
            </p>

            <DialogFooter className="gap-3 border-t-0 bg-transparent p-0">
              <DialogClose render={<Button variant="ghost" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  "Send request"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
