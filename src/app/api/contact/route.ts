import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import {
  isIntent,
  OUTREACH_EMAIL,
  recipientFor,
  trimContact,
  validateContact,
  type ContactFields,
  type Intent,
} from "../../../lib/contact";
import type { ContactEmailMessage } from "@/lib/contact-queue";

/* ─── Addresses ─────────────────────────────────────────────── */
// The fallback for every message whose routed address can't be reached.
const FALLBACK_EMAIL =
  process.env.CONTACT_FORM_RECIPIENT_EMAIL || OUTREACH_EMAIL;
const SENDER_EMAIL =
  process.env.CONTACT_FORM_SENDER_EMAIL || "website@mail.kubar.tech";

const MAX_REQUEST_BYTES = 10_000;
const PRODUCTION_ORIGINS = new Set([
  "https://kubar.tech",
  "https://www.kubar.tech",
]);
const DEVELOPMENT_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function jsonResponse(body: object, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function getClientIdentifier(request: NextRequest): string {
  return request.headers.get("cf-connecting-ip")?.trim() || "unknown";
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const normalizedOrigin = new URL(origin).origin;
    return (
      PRODUCTION_ORIGINS.has(normalizedOrigin) ||
      (process.env.NODE_ENV === "development" &&
        DEVELOPMENT_ORIGINS.has(normalizedOrigin))
    );
  } catch {
    return false;
  }
}

async function readBodyWithLimit(request: NextRequest): Promise<string | null> {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

/* ─── The internal email ────────────────────────────────────── */
const intentLabels: Record<Intent, string> = {
  institution: "A bank, finance company, insurer or fund",
  platform: "A trade platform or marketplace",
  exporter: "An exporter",
  investor: "An investor",
  press: "Press",
  other: "Something else",
};

function escapeHTML(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

type Submission = ContactFields & { intent: Intent };

function emailRows(data: Submission): [string, string][] {
  return [
    ["Writing as", intentLabels[data.intent]],
    ["Full name", data.name],
    ["Work email", data.email],
    ["Organisation", data.organisation],
    ["Role", data.role || "Not given"],
  ];
}

/** Plain, readable HTML in the site's palette. Every value is escaped. */
function buildEmailHTML(data: Submission): string {
  const ink = "#022732";
  const muted = "#4E686F";
  const rule = "#CCD4D6";
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const rows = emailRows(data)
    .map(
      ([label, value]) => `
          <tr>
            <td style="padding:12px 16px 12px 0;border-bottom:1px solid ${rule};font-size:13px;color:${muted};vertical-align:top;width:140px;">${escapeHTML(label)}</td>
            <td style="padding:12px 0;border-bottom:1px solid ${rule};font-size:15px;color:${ink};vertical-align:top;">${escapeHTML(value)}</td>
          </tr>`,
    )
    .join("");
  const message = escapeHTML(data.message).replace(/\r?\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F7F7F5;font-family:${font};">
  <table role="presentation" width="100%" style="background:#F7F7F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" style="max-width:600px;text-align:left;">
          <tr>
            <td style="border-top:2px solid ${ink};padding:16px 0 24px;">
              <p style="margin:0;font-size:13px;color:${muted};">kubar.tech contact form</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:28px;font-weight:500;color:${ink};">${escapeHTML(data.name)}, ${escapeHTML(data.organisation)}</h1>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid ${rule};">${rows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0;border-bottom:2px solid ${ink};">
              <p style="margin:0 0 8px;font-size:13px;color:${muted};">Message</p>
              <p style="margin:0;font-size:15px;line-height:24px;color:${ink};">${message}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 0;">
              <p style="margin:0;font-size:13px;color:${muted};">Reply to this email to answer ${escapeHTML(data.name)} at ${escapeHTML(data.email)}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText(data: Submission): string {
  const rows = emailRows(data)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  return `kubar.tech contact form\n\n${rows}\n\nMessage:\n${data.message}\n`;
}

/* ─── POST handler ──────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    if (!isSameOrigin(request)) {
      return jsonResponse({ error: "Invalid request origin" }, 403);
    }

    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return jsonResponse({ error: "Unsupported content type" }, 415);
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return jsonResponse({ error: "Request body is too large" }, 413);
    }

    const identifier = getClientIdentifier(request);
    const { env } = await getCloudflareContext({ async: true });
    const edgeRateLimit = await env.CONTACT_RATE_LIMITER.limit({
      key: identifier,
    });
    if (!edgeRateLimit.success) {
      return jsonResponse(
        { error: "Too many requests. Please try again later." },
        429,
        { "Retry-After": "60" },
      );
    }

    const rawBody = await readBodyWithLimit(request);
    if (rawBody === null) {
      return jsonResponse({ error: "Request body is too large" }, 413);
    }

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return jsonResponse({ error: "Invalid form data" }, 400);
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (
      typeof body.intent !== "string" ||
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.organisation !== "string" ||
      (body.role !== undefined && typeof body.role !== "string") ||
      typeof body.message !== "string" ||
      (body.website !== undefined && typeof body.website !== "string")
    ) {
      return jsonResponse({ error: "Invalid form data" }, 400);
    }

    // The honeypot: a filled "website" is dropped, and told it was sent.
    if (body.website) {
      return jsonResponse({ success: true });
    }

    const fields = trimContact({
      intent: body.intent,
      name: body.name,
      email: body.email,
      organisation: body.organisation,
      role: typeof body.role === "string" ? body.role : "",
      message: body.message,
    });
    const errors = validateContact(fields);
    if (Object.keys(errors).length > 0 || !isIntent(fields.intent)) {
      return jsonResponse({ error: "Invalid form data", fields: errors }, 400);
    }
    const data: Submission = { ...fields, intent: fields.intent };

    const routedTo = recipientFor(data.intent);
    const mailOptions: EmailMessageBuilder = {
      from: { email: SENDER_EMAIL, name: "Kubar Labs contact form" },
      to: routedTo,
      replyTo: data.email,
      subject: `kubar.tech · ${data.intent} · ${data.organisation}`,
      html: buildEmailHTML(data),
      text: buildEmailText(data),
    };

    const queueMessage: ContactEmailMessage = {
      version: 2,
      requestId,
      submittedAt: new Date().toISOString(),
      intent: data.intent,
      email: mailOptions,
      // Until partnerships@ is an allowed destination in Cloudflare Email
      // Routing, the Worker falls back to this address (HANDOFF section 9).
      ...(routedTo === FALLBACK_EMAIL ? {} : { fallbackTo: FALLBACK_EMAIL }),
    };

    await env.CONTACT_EMAIL_QUEUE.send(queueMessage);
    console.info(
      JSON.stringify({ event: "contact_submission_queued", requestId, intent: data.intent }),
    );

    return jsonResponse({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "contact_submission_failed",
        requestId,
        errorType: error instanceof Error ? error.name : "UnknownError",
      }),
    );

    // In development, return success anyway so the UI flow works when the
    // remote Email Service binding is unavailable.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "DEV MODE: Email sending failed. Returning success for UI testing."
      );
      return jsonResponse(
        {
          success: true,
          message: "Message received (dev mode - email not actually sent)",
          dev: true,
        },
      );
    }

    return jsonResponse(
      { error: "Failed to send message. Please try again." },
      500,
    );
  }
}
