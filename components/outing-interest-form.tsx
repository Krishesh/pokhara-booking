"use client"

import { useId, useState } from "react"
import { CircleCheck, Mail, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  validateInterestForm,
  type ContactType,
  type InterestFormErrors,
} from "@/lib/booking"

interface OutingInterestFormProps {
  outingId: string
  outingTitle: string
  organizer: string
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

export function OutingInterestForm({
  outingId,
  outingTitle,
  organizer,
}: OutingInterestFormProps) {
  const id = useId()
  const [customerName, setCustomerName] = useState("")
  const [contactType, setContactType] = useState<ContactType>("phone")
  const [contactValue, setContactValue] = useState("")
  const [participantCount, setParticipantCount] = useState("1")
  const [website, setWebsite] = useState("")
  const [errors, setErrors] = useState<InterestFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const count = Number(participantCount)

  function fieldProps(name: keyof InterestFormErrors) {
    return errors[name]
      ? { "aria-invalid": true, "aria-describedby": `${id}-${name}-error` }
      : {}
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    const validationErrors = validateInterestForm({
      customerName,
      contactType,
      contactValue,
      participantCount: count,
      website,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section
        aria-live="polite"
        className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
          <CircleCheck className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Interest received</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {organizer} will contact you with the plan. This doesn&apos;t
            reserve a place.
          </p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Outing</dt>
          <dd>{outingTitle}</dd>
          <dt className="text-muted-foreground">People</dt>
          <dd className="tabular-nums">{count}</dd>
        </dl>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-xl border border-border bg-card p-6 shadow-sm"
      noValidate
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">I&apos;m interested</h2>
        <p className="text-sm text-muted-foreground">
          Leave your details and the organizer will contact you. This
          doesn&apos;t reserve a place.
        </p>
      </div>

      <input type="hidden" name="outingId" value={outingId} />
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
          How should the organizer contact you?
        </legend>
        <RadioGroup
          value={contactType}
          onValueChange={(value) => {
            setContactType(value as ContactType)
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

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem] lg:grid-cols-1 xl:grid-cols-[1fr_8rem]">
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
              contactType === "phone" ? "+977 98XXXXXXXX" : "you@example.com"
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
        <div className="grid content-start gap-2">
          <Label htmlFor={`${id}-participantCount`}>How many people?</Label>
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

      <p className="text-sm text-muted-foreground">
        We only share your contact details with the organizer of this outing.
      </p>

      <div>
        <Button
          type="submit"
          className="h-11 w-full rounded-lg text-sm font-semibold"
        >
          Register interest
        </Button>
      </div>
    </form>
  )
}
