import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContactEmailMessage } from "../../../src/lib/contact-queue";
import worker from "./index";

const payload: ContactEmailMessage = {
  version: 2,
  intent: "exporter",
  requestId: "request-123",
  submittedAt: "2026-08-26T00:00:00.000Z",
  email: {
    from: "website@mail.kubar.tech",
    to: "outreach@kubar.tech",
    replyTo: "visitor@example.com",
    subject: "Contact request",
    text: "Contact request body",
  },
};

function createBatch(body: unknown, attempts = 1) {
  const ack = vi.fn();
  const retry = vi.fn();
  const message = {
    id: "message-123",
    timestamp: new Date("2026-08-26T00:00:00.000Z"),
    body,
    attempts,
    ack,
    retry,
  };
  const batch = {
    queue: "kubar-contact-email",
    messages: [message],
    ackAll: vi.fn(),
    retryAll: vi.fn(),
    metadata: {
      metrics: { backlogCount: 0, backlogBytes: 0 },
    },
  } as unknown as MessageBatch<ContactEmailMessage>;

  return { ack, batch, retry };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("contact email queue consumer", () => {
  it("sends and acknowledges a valid message", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const send = vi.fn().mockResolvedValue({ messageId: "email-123" });
    const { ack, batch, retry } = createBatch(payload);

    await worker.queue?.(
      batch,
      { EMAIL: { send } },
    );

    expect(send).toHaveBeenCalledWith(payload.email);
    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
  });

  it("retries a failed delivery with exponential backoff", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const send = vi.fn().mockRejectedValue(new Error("temporary failure"));
    const { ack, batch, retry } = createBatch(payload, 2);

    await worker.queue?.(
      batch,
      { EMAIL: { send } },
    );

    expect(ack).not.toHaveBeenCalled();
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 120 });
  });

  it("acknowledges an invalid payload without attempting delivery", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const send = vi.fn();
    const { ack, batch, retry } = createBatch({ version: 3 });

    await worker.queue?.(
      batch,
      { EMAIL: { send } },
    );

    expect(send).not.toHaveBeenCalled();
    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
  });

  it("still delivers a version 1 message left in the queue", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const send = vi.fn().mockResolvedValue({ messageId: "email-123" });
    const v1 = { version: 1, requestId: payload.requestId, submittedAt: payload.submittedAt, email: payload.email };
    const { ack, batch } = createBatch(v1);

    await worker.queue?.(batch, { EMAIL: { send } });

    expect(send).toHaveBeenCalledWith(payload.email);
    expect(ack).toHaveBeenCalledOnce();
  });

  it("falls back to outreach@ when the routed address can't be reached", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const routed = {
      ...payload,
      intent: "institution" as const,
      email: { ...payload.email, to: "partnerships@kubar.tech" },
      fallbackTo: "outreach@kubar.tech",
    };
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error("destination address not allowed"))
      .mockResolvedValueOnce({ messageId: "email-456" });
    const { ack, batch, retry } = createBatch(routed);

    await worker.queue?.(batch, { EMAIL: { send } });

    expect(send).toHaveBeenNthCalledWith(1, routed.email);
    expect(send).toHaveBeenNthCalledWith(2, { ...routed.email, to: "outreach@kubar.tech" });
    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
  });

  it("retries when the fallback fails too", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const routed = { ...payload, email: { ...payload.email, to: "partnerships@kubar.tech" }, fallbackTo: "outreach@kubar.tech" };
    const send = vi.fn().mockRejectedValue(new Error("email service down"));
    const { ack, batch, retry } = createBatch(routed, 1);

    await worker.queue?.(batch, { EMAIL: { send } });

    expect(send).toHaveBeenCalledTimes(2);
    expect(ack).not.toHaveBeenCalled();
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 60 });
  });

  it("does not send twice to the same address when the fallback is the routed address", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const send = vi.fn().mockRejectedValue(new Error("temporary failure"));
    const { batch, retry } = createBatch({ ...payload, fallbackTo: "outreach@kubar.tech" });

    await worker.queue?.(batch, { EMAIL: { send } });

    expect(send).toHaveBeenCalledOnce();
    expect(retry).toHaveBeenCalledOnce();
  });
});
