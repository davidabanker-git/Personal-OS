// Slack capture: messages in #personal / #keystone become Open Brain thoughts.
// Based on OB1 integrations/slack-capture. Changes: verifies Slack's request
// signature (fails closed), covers two channels and tags the domain, dedups via
// upsert_thought, acks within Slack's 3s window, and logs a capture event.
//
// Secrets: SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN, OPENROUTER_API_KEY.
// Deploy with verify_jwt off (Slack can't send a Supabase JWT; the signature is the auth).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") ?? "";
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const SLACK_SIGNING_SECRET = Deno.env.get("SLACK_SIGNING_SECRET") ?? "";

// Channel IDs aren't secret. Domain feeds triage (context/taxonomy.md).
const CHANNELS: Record<string, "personal" | "keystone"> = {
  C0C8Y3YFH8U: "personal",
  C0C8WB86HPB: "keystone",
};

// Posts the OS itself writes (briefs, reflections, reviews) start with one of
// these headers. They aren't captures, so they're skipped.
const OS_POST_HEADERS = ["Morning brief", "Evening reflection", "Weekly review"];

export function isOsPost(text: string): boolean {
  const first = text.trimStart().replace(/^[*_]+/, "");
  return OS_POST_HEADERS.some((h) => first.startsWith(h));
}

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const MAX_SKEW_SECONDS = 60 * 5;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const encoder = new TextEncoder();

export async function verifySlackSignature(
  secret: string,
  timestamp: string | null,
  signature: string | null,
  rawBody: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  if (!secret || !timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSeconds - ts) > MAX_SKEW_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`v0:${timestamp}:${rawBody}`));
  const expected = "v0=" + Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");

  // Constant-time comparison.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

async function getEmbedding(text: string): Promise<number[]> {
  const r = await fetch(`${OPENROUTER_BASE}/embeddings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai/text-embedding-3-small", input: text }),
  });
  if (!r.ok) throw new Error(`embeddings ${r.status}`);
  const d = await r.json();
  return d.data[0].embedding;
}

async function extractMetadata(text: string): Promise<Record<string, unknown>> {
  try {
    const r = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Extract metadata from the user's captured thought. Return JSON with:
- "people": array of people mentioned (empty if none)
- "action_items": array of implied to-dos (empty if none)
- "dates_mentioned": array of dates YYYY-MM-DD (empty if none)
- "topics": array of 1-3 short topic tags (always at least one)
- "type": one of "observation", "task", "idea", "reference", "person_note"
Only extract what's explicitly there.`,
          },
          { role: "user", content: text },
        ],
      }),
    });
    const d = await r.json();
    return JSON.parse(d.choices[0].message.content);
  } catch {
    return { topics: ["uncategorized"], type: "observation" };
  }
}

async function replyInThread(channel: string, threadTs: string, text: string): Promise<void> {
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel, thread_ts: threadTs, text }),
  });
}

function confirmation(meta: Record<string, unknown>): string {
  let text = `Captured as *${meta.type || "thought"}*`;
  if (Array.isArray(meta.topics) && meta.topics.length) text += ` · ${meta.topics.join(", ")}`;
  if (Array.isArray(meta.people) && meta.people.length) text += `\nPeople: ${meta.people.join(", ")}`;
  if (Array.isArray(meta.action_items) && meta.action_items.length) {
    text += `\nActions: ${meta.action_items.join("; ")}`;
  }
  return text;
}

async function capture(text: string, channel: string, ts: string): Promise<void> {
  const domain = CHANNELS[channel];
  try {
    const [embedding, extracted] = await Promise.all([getEmbedding(text), extractMetadata(text)]);
    const metadata = { ...extracted, source: "slack", domain, slack_channel: channel, slack_ts: ts };

    const { data, error } = await supabase.rpc("upsert_thought", {
      p_content: text,
      p_payload: { metadata },
    });
    if (error) throw new Error(error.message);

    const thoughtId = (data as { id: string }).id;
    const { error: embError } = await supabase.from("thoughts").update({ embedding }).eq("id", thoughtId);
    if (embError) throw new Error(embError.message);

    await supabase.from("events").insert({
      event_type: "capture",
      source: "slack",
      actor: "david",
      thought_id: thoughtId,
      payload: { domain, channel, type: extracted.type ?? null },
    });
    await replyInThread(channel, ts, confirmation(extracted));
  } catch (err) {
    console.error("capture failed:", err);
    // Best effort: neither of these may throw out of the background task.
    await Promise.allSettled([
      replyInThread(channel, ts, "Couldn't save that one. I'll show it in the next brief."),
      supabase.from("events").insert({
        event_type: "capture_failed",
        source: "slack",
        actor: "slack-capture",
        payload: { channel, slack_ts: ts, error: String(err) },
      }),
    ]);
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const rawBody = await req.text();
  const ok = await verifySlackSignature(
    SLACK_SIGNING_SECRET,
    req.headers.get("x-slack-request-timestamp"),
    req.headers.get("x-slack-signature"),
    rawBody,
  );
  if (!ok) return new Response("unauthorized", { status: 401 });

  let body: Record<string, any>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("bad request", { status: 400 });
  }

  if (body.type === "url_verification") {
    return new Response(JSON.stringify({ challenge: body.challenge }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Slack retries when we're slow; the first delivery is already being processed.
  if (req.headers.get("x-slack-retry-num")) return new Response("ok");

  const event = body.event;
  const isCapture = event && event.type === "message" && !event.subtype && !event.bot_id &&
    !event.thread_ts && event.channel in CHANNELS && typeof event.text === "string" &&
    event.text.trim() !== "" && !isOsPost(event.text);
  if (!isCapture) return new Response("ok");

  // Ack now; finish after the response so Slack's 3s window isn't hit.
  const work = capture(event.text.trim(), event.channel, event.ts);
  // deno-lint-ignore no-explicit-any
  (globalThis as any).EdgeRuntime?.waitUntil(work);
  return new Response("ok");
});
