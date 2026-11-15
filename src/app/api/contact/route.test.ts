import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { edgeLimitMock, getCloudflareContextMock, queueSendMock } = vi.hoisted(() => ({
  edgeLimitMock: vi.fn(),
  getCloudflareContextMock: vi.fn(),
  queueSendMock: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: getCloudflareContextMock,
}));

import { POST } from "./route";

const validSubmission = {
  intent: "institution",
  name: "Ada Lovelace",
  email: "ada@bank.example",
  organisation: "Analytical Engines Bank",
  role: "Head of trade finance",
  message: "We finance rice exporters and would like to understand how a programme would run for us.",
};

type RequestOptions = {
  origin?: string;
  ip?: string;
  contentLength?: number;
  contentType?: string | null;
};

function uniqueClient() {
  return `test-client-${crypto.randomUUID()}`;
}

function request(
  body: string,
  {
    origin = "https://kubar.tech",
    ip = uniqueClient(),
    contentLength,
    contentType = "application/json",
  }: RequestOptions = {},
) {
  const headers = new Headers({
    origin,
    "cf-connecting-ip": ip,
  });

  if (contentType !== null) {
    headers.set("content-type", contentType);
  }

  if (contentLength !== undefined) {
    headers.set("content-length", String(contentLength));
  }

  return new NextRequest("https://kubar.tech/api/contact", {
    method: "POST",
    headers,
    body,
  });
}

function jsonRequest(body: unknown, options?: RequestOptions) {
  return request(JSON.stringify(body), options);
}

beforeEach(() => {
  getCloudflareContextMock.mockReset();
  edgeLimitMock.mockReset();
  queueSendMock.mockReset();
  edgeLimitMock.mockResolvedValue({ success: true });
  queueSendMock.mockResolvedValue(undefined);
  getCloudflareContextMock.mockResolvedValue({
    env: {
      CONTACT_EMAIL_QUEUE: { send: queueSendMock },
      CONTACT_RATE_LIMITER: {
        limit: edgeLimitMock,
      },
    },
  });
});

describe("contact route hardening", () => {
  it("rejects cross-origin submissions", async () => {
    const response = await POST(jsonRequest(validSubmission, { origin: "https://example.com" }));
    expect(response.status).toBe(403);
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("rejects a request with no origin", async () => {
    const response = await POST(
      new NextRequest("https://kubar.tech/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json", "cf-connecting-ip": uniqueClient() },
        body: JSON.stringify(validSubmission),
      }),
    );
    expect(response.status).toBe(403);
  });

  it("requires a JSON content type", async () => {
    const response = await POST(request(JSON.stringify(validSubmission), { contentType: "text/plain" }));
    expect(response.status).toBe(415);
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and JSON that is not an object", async () => {
    expect((await POST(request("{not json"))).status).toBe(400);
    expect((await POST(request("[1,2]"))).status).toBe(400);
    expect((await POST(request("null"))).status).toBe(400);
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("rejects an oversized declared request before parsing it", async () => {
    const response = await POST(jsonRequest(validSubmission, { contentLength: 10_001 }));
    expect(response.status).toBe(413);
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("rejects an oversized actual body without trusting content-length", async () => {
    const response = await POST(jsonRequest({ ...validSubmission, message: "x".repeat(11_000) }, { contentLength: 100 }));
    expect(response.status).toBe(413);
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("rejects requests blocked by the Cloudflare edge limiter", async () => {
    edgeLimitMock.mockResolvedValue({ success: false });
    const response = await POST(jsonRequest(validSubmission));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("never caches its responses", async () => {
    const response = await POST(jsonRequest(validSubmission));
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("contact form contract (copy/06-contact.md)", () => {
  it.each(["intent", "name", "email", "organisation", "message"] as const)("rejects a missing %s", async (field) => {
    const body: Record<string, unknown> = { ...validSubmission };
    delete body[field];
    const response = await POST(jsonRequest(body));
    expect(response.status).toBe(400);
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it.each([
    ["name", "nameRequired"],
    ["email", "emailRequired"],
    ["organisation", "organisationRequired"],
    ["message", "messageRequired"],
  ] as const)("rejects an empty %s and names the field", async (field, code) => {
    const response = await POST(jsonRequest({ ...validSubmission, [field]: "   " }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid form data", fields: { [field]: code } });
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("rejects invalid field types", async () => {
    for (const body of [
      { ...validSubmission, name: 42 },
      { ...validSubmission, role: ["x"] },
      { ...validSubmission, message: { text: "hello" } },
      { ...validSubmission, website: 1 },
    ]) {
      expect((await POST(jsonRequest(body))).status).toBe(400);
    }
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it.each(["ada", "ada@bank", "ada @bank.example", "ada@bank.example\nbcc: x@y.z", "<ada@bank.example>"])(
    "rejects the email address %j",
    async (email) => {
      const response = await POST(jsonRequest({ ...validSubmission, email }));
      expect(response.status).toBe(400);
      expect(queueSendMock).not.toHaveBeenCalled();
    },
  );

  it("rejects an intent outside the six", async () => {
    for (const intent of ["bank", "fintech", "", "INSTITUTION"]) {
      const response = await POST(jsonRequest({ ...validSubmission, intent }));
      expect(response.status).toBe(400);
    }
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("accepts a message of 2,000 characters and rejects 2,001", async () => {
    expect((await POST(jsonRequest({ ...validSubmission, message: "m".repeat(2000) }))).status).toBe(200);
    const response = await POST(jsonRequest({ ...validSubmission, message: "m".repeat(2001) }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ fields: { message: "messageTooLong" } });
    expect(queueSendMock).toHaveBeenCalledOnce();
  });

  it("rejects over-long and control-character values in single-line fields", async () => {
    for (const body of [
      { ...validSubmission, name: "n".repeat(101) },
      { ...validSubmission, organisation: "o".repeat(161) },
      { ...validSubmission, role: "r".repeat(121) },
      { ...validSubmission, organisation: "Bank\r\nBcc: x@y.z" },
      { ...validSubmission, name: "Ada\u0000" },
    ]) {
      expect((await POST(jsonRequest(body))).status).toBe(400);
    }
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("accepts an omitted or empty optional role", async () => {
    const withoutRole: Record<string, unknown> = { ...validSubmission };
    delete withoutRole.role;
    expect((await POST(jsonRequest(withoutRole))).status).toBe(200);
    expect((await POST(jsonRequest({ ...validSubmission, role: "" }))).status).toBe(200);
    expect(queueSendMock).toHaveBeenCalledTimes(2);
    expect(queueSendMock.mock.calls[0][0].email.text).toContain("Role: Not given");
  });

  it("accepts a honeypot submission without sending email", async () => {
    const response = await POST(jsonRequest({ ...validSubmission, website: "https://spam.example" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(queueSendMock).not.toHaveBeenCalled();
  });

  it("ignores the old site's fields", async () => {
    const response = await POST(
      jsonRequest({ fullName: "Ada Lovelace", email: "ada@example.com", phone: "+91 98765 43210", companyName: "Analytical Engines", category: "fintech" }),
    );
    expect(response.status).toBe(400);
    expect(queueSendMock).not.toHaveBeenCalled();
  });
});

describe("contact email and routing", () => {
  it("queues a valid submission with the subject, reply-to and both parts", async () => {
    const response = await POST(jsonRequest(validSubmission));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, message: "Message sent successfully" });
    expect(edgeLimitMock).toHaveBeenCalledWith({ key: expect.stringMatching(/^test-client-/) });
    expect(queueSendMock).toHaveBeenCalledOnce();
    const message = queueSendMock.mock.calls[0][0];
    expect(message).toMatchObject({
      version: 2,
      requestId: expect.any(String),
      submittedAt: expect.any(String),
      intent: "institution",
      fallbackTo: "outreach@kubar.tech",
      email: {
        to: "partnerships@kubar.tech",
        replyTo: validSubmission.email,
        subject: "kubar.tech · institution · Analytical Engines Bank",
      },
    });
    expect(message.email.text).toContain(validSubmission.message);
    expect(message.email.html).toContain("Head of trade finance");
    expect(message.email.html).not.toMatch(/04040c|f0b429|phone/i);
  });

  it.each([
    ["institution", "partnerships@kubar.tech"],
    ["platform", "partnerships@kubar.tech"],
    ["investor", "partnerships@kubar.tech"],
    ["exporter", "outreach@kubar.tech"],
    ["press", "outreach@kubar.tech"],
    ["other", "outreach@kubar.tech"],
  ])("routes %s messages to %s", async (intent, to) => {
    await POST(jsonRequest({ ...validSubmission, intent }));
    const message = queueSendMock.mock.calls[0][0];
    expect(message.email.to).toBe(to);
    // Only messages routed away from outreach@ need the fallback.
    expect(message.fallbackTo).toBe(to === "outreach@kubar.tech" ? undefined : "outreach@kubar.tech");
  });

  it("escapes everything a visitor typed in the HTML part", async () => {
    await POST(
      jsonRequest({
        ...validSubmission,
        name: "<script>alert(1)</script>",
        organisation: "A & B \"Bank\"",
        message: "line one\n<img src=x onerror=alert(1)>",
      }),
    );
    const { html } = queueSendMock.mock.calls[0][0].email;
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("A &amp; B &quot;Bank&quot;");
    expect(html).toContain("line one<br>&lt;img");
  });

  it("trims what it stores", async () => {
    await POST(jsonRequest({ ...validSubmission, name: "  Ada Lovelace  ", email: " ada@bank.example " }));
    const { email } = queueSendMock.mock.calls[0][0];
    expect(email.replyTo).toBe("ada@bank.example");
    expect(email.text).toContain("Full name: Ada Lovelace\n");
  });

  it("returns a generic server error when queueing fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    queueSendMock.mockRejectedValue(new Error("queue unavailable"));

    const response = await POST(jsonRequest(validSubmission));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Failed to send message. Please try again." });
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("ada@bank.example");
    consoleError.mockRestore();
  });
});
