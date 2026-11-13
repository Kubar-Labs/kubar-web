import type { Intent } from "./contact";

/*
 * What the site puts on the contact queue for the email Worker.
 * Version 2 adds the intent and a fallback address: if delivery to the
 * routed address fails (partnerships@ is not yet an allowed destination in
 * Cloudflare Email Routing), the Worker sends the same email to the fallback.
 * Version 1 messages still in the queue at deploy time are delivered as before.
 */
export type ContactEmailMessageV1 = {
  version: 1;
  requestId: string;
  submittedAt: string;
  email: EmailMessageBuilder;
};

export type ContactEmailMessageV2 = {
  version: 2;
  requestId: string;
  submittedAt: string;
  intent: Intent;
  email: EmailMessageBuilder;
  /** Where to send the email if the routed address can't be reached. */
  fallbackTo?: string;
};

export type ContactEmailMessage = ContactEmailMessageV1 | ContactEmailMessageV2;
