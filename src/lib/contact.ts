/*
 * The contact form's contract (docs/rebuild/copy/06-contact.md, HANDOFF
 * section 9), shared by the form, the API route and their tests so the
 * server's limits mirror the client's.
 */
export const INTENTS = ["institution", "platform", "exporter", "investor", "press", "other"] as const;
export type Intent = (typeof INTENTS)[number];

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  organisation: 160,
  role: 120,
  message: 2000,
} as const;

export type ContactFields = {
  intent: string;
  name: string;
  email: string;
  organisation: string;
  role: string;
  message: string;
};

export type ContactField = keyof ContactFields;

/** One code per error message in the copy. */
export type ContactErrorCode =
  | "intentRequired"
  | "nameRequired"
  | "emailRequired"
  | "emailInvalid"
  | "organisationRequired"
  | "messageRequired"
  | "messageTooLong"
  | "invalid";

export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

/** The order the fields appear in, and so the order of the error summary. */
export const CONTACT_FIELD_ORDER: ContactField[] = ["intent", "name", "email", "organisation", "role", "message"];

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
// Single-line fields take no control characters; the message may hold line breaks and tabs.
const CONTROL = /[\u0000-\u001f\u007f]/;
const CONTROL_EXCEPT_BREAKS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function isIntent(value: unknown): value is Intent {
  return typeof value === "string" && (INTENTS as readonly string[]).includes(value);
}

export function trimContact(values: ContactFields): ContactFields {
  return {
    intent: values.intent,
    name: values.name.trim(),
    email: values.email.trim(),
    organisation: values.organisation.trim(),
    role: values.role.trim(),
    message: values.message.trim(),
  };
}

/** Checks trimmed values. "invalid" covers what the form itself can't produce (over-long or control characters). */
export function validateContact(values: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  if (!isIntent(values.intent)) errors.intent = "intentRequired";

  if (!values.name) errors.name = "nameRequired";
  else if (values.name.length > CONTACT_LIMITS.name || CONTROL.test(values.name)) errors.name = "invalid";

  if (!values.email) errors.email = "emailRequired";
  else if (!EMAIL.test(values.email) || values.email.length > CONTACT_LIMITS.email || CONTROL.test(values.email)) errors.email = "emailInvalid";

  if (!values.organisation) errors.organisation = "organisationRequired";
  else if (values.organisation.length > CONTACT_LIMITS.organisation || CONTROL.test(values.organisation)) errors.organisation = "invalid";

  if (values.role.length > CONTACT_LIMITS.role || CONTROL.test(values.role)) errors.role = "invalid";

  if (!values.message) errors.message = "messageRequired";
  else if (values.message.length > CONTACT_LIMITS.message) errors.message = "messageTooLong";
  else if (CONTROL_EXCEPT_BREAKS.test(values.message)) errors.message = "invalid";

  return errors;
}

export const PARTNERSHIPS_EMAIL = "partnerships@kubar.tech";
export const OUTREACH_EMAIL = "outreach@kubar.tech";

/** Institution, platform and investor messages go to partnerships@; the rest to outreach@. */
export function recipientFor(intent: Intent): string {
  return intent === "institution" || intent === "platform" || intent === "investor" ? PARTNERSHIPS_EMAIL : OUTREACH_EMAIL;
}
