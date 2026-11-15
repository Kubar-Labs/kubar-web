import type { ContactEmailMessage } from "../../../src/lib/contact-queue";

interface ContactEmailWorkerEnv {
  EMAIL: SendEmail;
}

function isContactEmailMessage(value: unknown): value is ContactEmailMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<ContactEmailMessage>;
  return (
    (message.version === 1 || message.version === 2) &&
    typeof message.requestId === "string" &&
    typeof message.submittedAt === "string" &&
    !!message.email &&
    typeof message.email === "object"
  );
}

export default {
  async queue(batch, env) {
    for (const message of batch.messages) {
      if (!isContactEmailMessage(message.body)) {
        console.error(
          JSON.stringify({
            event: "contact_email_invalid_payload",
            messageId: message.id,
            attempt: message.attempts,
          }),
        );
        message.ack();
        continue;
      }

      const body = message.body;
      const log = { requestId: body.requestId, messageId: message.id, attempt: message.attempts };

      try {
        await env.EMAIL.send(body.email);
        console.info(JSON.stringify({ event: "contact_email_sent", ...log }));
        message.ack();
        continue;
      } catch (error) {
        console.error(
          JSON.stringify({
            event: "contact_email_delivery_failed",
            ...log,
            errorType: error instanceof Error ? error.name : "UnknownError",
          }),
        );
      }

      // The routed address couldn't be reached. Version 2 messages name a
      // fallback (outreach@) so nothing waits on Email Routing being set up.
      const fallbackTo = body.version === 2 ? body.fallbackTo : undefined;
      if (fallbackTo && body.email.to !== fallbackTo) {
        try {
          await env.EMAIL.send({ ...body.email, to: fallbackTo });
          console.info(JSON.stringify({ event: "contact_email_sent_to_fallback", ...log }));
          message.ack();
          continue;
        } catch (error) {
          console.error(
            JSON.stringify({
              event: "contact_email_fallback_failed",
              ...log,
              errorType: error instanceof Error ? error.name : "UnknownError",
            }),
          );
        }
      }

      message.retry({
        delaySeconds: Math.min(900, 30 * 2 ** message.attempts),
      });
    }
  },
} satisfies ExportedHandler<ContactEmailWorkerEnv, ContactEmailMessage>;
