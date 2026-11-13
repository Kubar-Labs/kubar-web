"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import {
  CONTACT_FIELD_ORDER,
  CONTACT_LIMITS,
  INTENTS,
  isIntent,
  trimContact,
  validateContact,
  type ContactErrorCode,
  type ContactErrors,
  type ContactField,
  type ContactFields,
  type Intent,
} from "@/lib/contact";
import { cn } from "@/lib/utils";

/*
 * The contact form (Figma Contact · 1440, 174:199; Forms board 153:53;
 * docs/rebuild/copy/06-contact.md). Fields are empty, with no placeholder
 * text; ?intent= preselects "I'm writing as". The button is never disabled:
 * the form checks its fields when it is sent. With errors, a summary appears
 * above the form, takes focus and links to each field, and each field shows
 * its message. While sending the button says "Sending…" and keeps its width.
 * Sent: the form is replaced by "Message sent." (focus moves to it).
 * Failed (server, rate limit, offline): a notice above the button; the
 * values stay.
 */
export type ContactFormCopy = {
  heading: string;
  labels: Record<ContactField | "website", string>;
  optional: string;
  emailHelp: string;
  intents: Record<Intent, string>;
  messageHelp: Partial<Record<Intent, string>>;
  count: string;
  errors: Record<Exclude<ContactErrorCode, "invalid">, string>;
  summary: string;
  send: string;
  sending: string;
  notice: string;
  privacy: string;
  sent: { heading: string; body: string; link: string };
  failed: { server: string; rate: string; offline: string };
};

type Failure = "server" | "rate" | "offline";
const EMPTY: ContactFields = { intent: "", name: "", email: "", organisation: "", role: "", message: "" };
const control =
  "t-body w-full border bg-raised px-3 text-ink outline-offset-[5px] transition-colors duration-(--duration-hover) ease-standard";

function ErrorLine({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="t-body-sm flex items-start gap-2 text-accent">
      <Icon name="alert" className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** A failure line with outreach@ as a mailto where the copy marks it. */
function FailureText({ text }: { text: string }) {
  const [before, rest] = text.split("<email>");
  if (rest === undefined) return <>{text}</>;
  const [address, after] = rest.split("</email>");
  return (
    <>
      {before}
      <a href={`mailto:${address}`} className="underline decoration-1 [text-underline-position:from-font] hover:decoration-2">
        {address}
      </a>
      {after}
    </>
  );
}

export function ContactForm({ copy }: { copy: ContactFormCopy }) {
  const params = useSearchParams();
  const preset = params.get("intent");
  const [values, setValues] = useState<ContactFields>(() => ({ ...EMPTY, intent: isIntent(preset) ? preset : "" }));
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [failure, setFailure] = useState<Failure | null>(null);
  const [firstName, setFirstName] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();
  const id = (field: string) => `contact-${field}`;

  // A route on this page ("Talk about an integration") changes ?intent= without a reload.
  const [seenPreset, setSeenPreset] = useState(preset);
  if (preset !== seenPreset) {
    setSeenPreset(preset);
    if (isIntent(preset)) setValues((current) => ({ ...current, intent: preset }));
  }

  useEffect(() => {
    if (status === "sent") sentRef.current?.focus();
  }, [status]);

  const errorText = (field: ContactField) => {
    const code = errors[field];
    return code && code !== "invalid" ? copy.errors[code] : undefined;
  };
  const listed = CONTACT_FIELD_ORDER.filter((field) => errorText(field));

  useEffect(() => {
    if (listed.length > 0) summaryRef.current?.focus();
    // Only when a new set of errors arrives from a send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  function set(field: ContactField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setFailure(null);

    const trimmed = trimContact(values);
    const found = validateContact(trimmed);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setFailure("offline");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...trimmed, website }),
      });
      if (response.ok) {
        setFirstName(trimmed.name.split(/\s+/)[0]);
        setStatus("sent");
        return;
      }
      setFailure(response.status === 429 ? "rate" : "server");
    } catch {
      setFailure(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "server");
    }
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-5 lg:max-w-[628px]">
        <h2 ref={sentRef} tabIndex={-1} className="t-h3 text-ink outline-none">
          {copy.sent.heading}
        </h2>
        <p className="t-body text-ink">{copy.sent.body.replace("{firstName}", firstName)}</p>
        <TextLink href="/" kind="arrow">{copy.sent.link}</TextLink>
      </div>
    );
  }

  const describedBy = (field: ContactField, helpId?: string) =>
    [helpId, errorText(field) ? `${id(field)}-error` : undefined].filter(Boolean).join(" ") || undefined;
  const border = (field: ContactField) => (errorText(field) ? "border-accent" : "border-rule-control");

  const textField = (
    field: "name" | "email" | "organisation" | "role",
    options: { type?: string; autoComplete: string; help?: string; optional?: boolean; inputMode?: "email" },
  ) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id(field)} className="flex flex-wrap items-baseline gap-1">
        <span className="t-ui text-ink">{copy.labels[field]}</span>
        {options.optional ? <span className="t-body-sm text-ink-muted">{copy.optional}</span> : null}
      </label>
      {options.help ? (
        <p id={`${id(field)}-help`} className="t-body-sm text-ink-muted">
          {options.help}
        </p>
      ) : null}
      <input
        id={id(field)}
        name={field}
        type={options.type ?? "text"}
        inputMode={options.inputMode}
        autoComplete={options.autoComplete}
        maxLength={CONTACT_LIMITS[field]}
        required={!options.optional}
        aria-required={!options.optional}
        aria-invalid={errorText(field) ? true : undefined}
        aria-describedby={describedBy(field, options.help ? `${id(field)}-help` : undefined)}
        value={values[field]}
        onChange={(event) => set(field, event.target.value)}
        className={cn(control, "h-12", border(field))}
      />
      {errorText(field) ? <ErrorLine id={`${id(field)}-error`}>{errorText(field)}</ErrorLine> : null}
    </div>
  );

  const messageHelp = isIntent(values.intent) ? copy.messageHelp[values.intent] : undefined;

  return (
    <form data-no-abbr noValidate onSubmit={onSubmit} aria-labelledby={`${uid}-heading`} className="flex flex-col gap-6 lg:max-w-[628px]">
      <h2 id={`${uid}-heading`} className="sr-only">
        {copy.heading}
      </h2>

      {listed.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="flex flex-col gap-3 border-l-2 border-accent bg-accent-soft px-5 py-4 outline-offset-2"
        >
          <p className="t-ui flex items-start gap-1 text-ink">
            <Icon name="alert" className="shrink-0 text-accent" />
            <span>{copy.summary}</span>
          </p>
          <ul className="flex flex-col items-start gap-1 pl-6">
            {listed.map((field) => (
              <li key={field}>
                <TextLink href={`#${id(field)}`} kind="anchor">{errorText(field)}</TextLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor={id("intent")} className="t-ui text-ink">
          {copy.labels.intent}
        </label>
        <div className="relative">
          <select
            id={id("intent")}
            name="intent"
            required
            aria-required
            aria-invalid={errorText("intent") ? true : undefined}
            aria-describedby={describedBy("intent")}
            value={values.intent}
            onChange={(event) => set("intent", event.target.value)}
            className={cn(control, "h-12 cursor-pointer appearance-none pr-10", border("intent"))}
          >
            <option value="" />
            {INTENTS.map((intent) => (
              <option key={intent} value={intent}>
                {copy.intents[intent]}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" className="pointer-events-none absolute top-3.5 right-3 text-ink" />
        </div>
        {errorText("intent") ? <ErrorLine id={`${id("intent")}-error`}>{errorText("intent")}</ErrorLine> : null}
      </div>

      {textField("name", { autoComplete: "name" })}
      {textField("email", { type: "email", inputMode: "email", autoComplete: "email", help: copy.emailHelp })}
      {textField("organisation", { autoComplete: "organization" })}
      {textField("role", { autoComplete: "organization-title", optional: true })}

      <div className="flex flex-col gap-2">
        <label htmlFor={id("message")} className="t-ui text-ink">
          {copy.labels.message}
        </label>
        <textarea
          id={id("message")}
          name="message"
          required
          aria-required
          aria-invalid={errorText("message") ? true : undefined}
          aria-describedby={describedBy("message", `${id("message")}-help`)}
          value={values.message}
          onChange={(event) => set("message", event.target.value)}
          className={cn(control, "block h-40 resize-y py-3", border("message"))}
        />
        <div className="flex items-start gap-4 text-ink-muted">
          <p id={`${id("message")}-help`} className="t-body-sm min-w-0 flex-1">
            {messageHelp}
          </p>
          <p className={cn("t-tag shrink-0 pt-[3px] text-right", values.message.trim().length > CONTACT_LIMITS.message && "text-accent")}>
            {copy.count.replace("{n}", values.message.trim().length.toLocaleString("en-GB"))}
          </p>
        </div>
        {errorText("message") ? <ErrorLine id={`${id("message")}-error`}>{errorText("message")}</ErrorLine> : null}
      </div>

      {/* The honeypot: off screen, out of the tab order and hidden from assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>{copy.labels.website}</label>
        <input
          id={id("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="flex flex-col items-start gap-4">
        <div role="alert" className={failure ? "t-body flex items-start gap-2 text-accent" : "sr-only"}>
          {failure ? (
            <>
              <Icon name="alert" className="mt-[3px] shrink-0" />
              <p>
                <FailureText text={copy.failed[failure]} />
              </p>
            </>
          ) : null}
        </div>
        <Button type="submit" icon="arrow-right" sending={status === "sending"} sendingLabel={copy.sending}>
          {copy.send}
        </Button>
        <div className="flex flex-col items-start gap-1">
          <p className="t-fine text-ink-muted">{copy.notice}</p>
          <TextLink href="/legal/privacy" kind="arrow">{copy.privacy}</TextLink>
        </div>
      </div>
    </form>
  );
}
