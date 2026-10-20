// Triage: files each new capture with Jev (Phase 3, docs/learn/triage.md).
//
// Called by slack-capture and open-brain-mcp right after a capture. Two actions:
//   triage   {thought_id, origin: "slack" | "mcp"} → files it, returns the reply text
//   feedback {thread_ts, text}                      → applies David's thread reply
//                                                     ("yes", "personal", "not a task")
// Confidence routing (AGENTS.md → Triage): high → auto-file (+ Linear task when
// actionable); medium → "Right?"; low → one question. Every decision and every
// correction is logged to events.
//
// Auth: callers send the project's service role key as a Bearer token (both
// callers already have it), so no extra secret. Deploy with verify_jwt off.
// Secrets: TYPESAFE_API_KEY (triage skips cleanly without it), OPENROUTER_API_KEY
// (fallback), LINEAR_API_KEY (optional; tasks are skipped without it),
// SLACK_BOT_TOKEN (questions about Claude/ChatGPT captures).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";
import { decide } from "./decide.ts";
import {
  applyFeedback,
  AREAS,
  THRESHOLDS,
  type Decision,
  feedbackQuestions,
  type Filing,
  filingLine,
  replyText,
  route,
  statusFor,
  triageQuestions,
} from "./rules.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TYPESAFE_API_KEY = Deno.env.get("TYPESAFE_API_KEY") ?? "";
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") ?? "";
const LINEAR_API_KEY = Deno.env.get("LINEAR_API_KEY") ?? "";
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const JEV_MODEL = Deno.env.get("TRIAGE_MODEL") ?? "jev-latest";

const LINEAR_TEAM_KEY = "DAV";
const PERSONAL_CHANNEL = "C0C8Y3YFH8U";
const CHANNEL_NAMES: Record<string, string> = { C0C8Y3YFH8U: "#personal", C0C8WB86HPB: "#keystone" };
const FALLBACK_CONFIDENCE_CAP = 0.84; // below auto-file, so fallback answers always ask

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const env = { typesafeKey: TYPESAFE_API_KEY, openrouterKey: OPENROUTER_API_KEY, jevModel: JEV_MODEL };

type Thought = { id: string; content: string; metadata: Record<string, any>; created_at: string };

// --- helpers ---------------------------------------------------------------

function safeEqual(a: string, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function chicago(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return {
    today: `${parts.weekday} ${parts.year}-${parts.month}-${parts.day}`,
    // Quiet hours (AGENTS.md → Cadence): no prompts 6:30 pm – 5:00 am.
    quiet: minutes >= 18 * 60 + 30 || minutes < 5 * 60,
  };
}

async function logEvent(row: Record<string, unknown>) {
  const { error } = await supabase.from("events").insert(row);
  if (error) console.error("event insert failed:", error.message);
}

async function saveTriage(t: Thought, triage: Record<string, unknown>, domain?: string) {
  const metadata = { ...t.metadata, triage, ...(domain ? { domain } : {}) };
  const { error } = await supabase.from("thoughts").update({ metadata }).eq("id", t.id);
  if (error) throw new Error(`save triage: ${error.message}`);
  t.metadata = metadata;
}

async function slackPost(channel: string, text: string): Promise<string | null> {
  if (!SLACK_BOT_TOKEN) return null;
  const r = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel, text }),
  });
  const d = await r.json().catch(() => ({}));
  return d.ok ? d.ts : null;
}

// --- Linear ----------------------------------------------------------------

let linearTeamId: string | null = null;

async function linear(query: string, variables: Record<string, unknown> = {}) {
  const r = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { Authorization: LINEAR_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const d = await r.json();
  if (!r.ok || d.errors) throw new Error(`linear: ${JSON.stringify(d.errors ?? r.status).slice(0, 200)}`);
  return d.data;
}

const PRIORITY: Record<Filing["urgency"], number> = { today: 2, "this week": 3, someday: 4 };

async function createTask(t: Thought, f: Filing, via: string): Promise<{ id: string; ref: string } | null> {
  if (!LINEAR_API_KEY) return null;
  if (!linearTeamId) {
    const d = await linear(`query($k: String!) { teams(filter: { key: { eq: $k } }) { nodes { id } } }`, {
      k: LINEAR_TEAM_KEY,
    });
    linearTeamId = d.teams.nodes[0]?.id ?? null;
    if (!linearTeamId) throw new Error(`linear: team ${LINEAR_TEAM_KEY} not found`);
  }
  const actions = Array.isArray(t.metadata.action_items) ? t.metadata.action_items : [];
  const raw = String(actions[0] ?? t.content).replace(/\s+/g, " ").trim();
  const title = raw.length > 80 ? raw.slice(0, 77) + "…" : raw;
  const description = [
    `**Requester:** David (captured via ${via}, ${t.created_at.slice(0, 10)})`,
    "",
    `> ${t.content.replace(/\n/g, "\n> ")}`,
    "",
    `Filed by triage: ${filingLine(f)}. Open Brain thought \`${t.id}\`.`,
  ].join("\n");
  const d = await linear(
    `mutation($input: IssueCreateInput!) { issueCreate(input: $input) { issue { id identifier } } }`,
    { input: { teamId: linearTeamId, title, description, priority: PRIORITY[f.urgency] } },
  );
  const issue = d.issueCreate.issue;
  await logEvent({
    event_type: "task",
    source: "triage",
    actor: "triage",
    thought_id: t.id,
    linear_issue_id: issue.identifier,
    payload: { action: "created", title },
  });
  return { id: issue.id, ref: issue.identifier };
}

// A task is created only when David's call isn't needed: filed (or confirmed)
// and actionable, and not an open decision.
const wantsTask = (f: Filing) => f.actionable && !f.needs_decision;

// --- triage ----------------------------------------------------------------

function viaLabel(t: Thought): string {
  if (t.metadata.source === "slack") return CHANNEL_NAMES[t.metadata.slack_channel] ?? "Slack";
  return "Claude/ChatGPT";
}

async function triage(thoughtId: string, origin: "slack" | "mcp") {
  if (!TYPESAFE_API_KEY) return { status: "skipped", reason: "no TYPESAFE_API_KEY" };

  const { data: t, error } = await supabase.from("thoughts").select("id, content, metadata, created_at")
    .eq("id", thoughtId).single<Thought>();
  if (error || !t) throw new Error(`thought ${thoughtId}: ${error?.message ?? "not found"}`);
  if (t.metadata.triage) return { status: "already", reply: t.metadata.triage.reply };

  const via = viaLabel(t);
  const { today, quiet } = chicago();
  const result = await decide(
    { capture: t.content, captured_via: via, today },
    triageQuestions(),
    env,
  );
  const d: Decision = route(result.answers, {
    capConfidence: result.calibrated ? 1 : FALLBACK_CONFIDENCE_CAP,
  });
  const status = statusFor(d.tier);

  let task: { id: string; ref: string } | null = null;
  let taskError: string | undefined;
  if (status === "filed" && wantsTask(d.filing)) {
    try {
      task = await createTask(t, d.filing, via);
    } catch (e) {
      taskError = String(e);
      console.error(taskError);
    }
  }
  const reply = replyText(d, task?.ref);

  // Questions about Claude/ChatGPT captures go to #personal from the bot,
  // except in quiet hours (they wait for the next capture after 5 am).
  let ask_ts: string | null = null;
  let deferred = false;
  if (origin === "mcp" && status !== "filed") {
    if (quiet) deferred = true;
    else ask_ts = await slackPost(PERSONAL_CHANNEL, askMessage(t, reply));
  }

  await saveTriage(t, {
    status,
    ...d.filing,
    confidence: Number(d.confidence.toFixed(3)),
    reply,
    provider: result.provider,
    model: result.model,
    at: new Date().toISOString(),
    ...(task ? { linear_issue: task.ref } : {}),
    ...(ask_ts ? { ask_ts } : {}),
    ...(deferred ? { deferred: true } : {}),
  }, status === "filed" ? d.filing.domain : undefined);

  await logEvent({
    event_type: "triage",
    source: result.provider === "jev" ? "jev" : "openrouter",
    actor: "triage",
    thought_id: t.id,
    linear_issue_id: task?.ref ?? null,
    confidence: d.confidence,
    payload: {
      status,
      tier: d.tier,
      weakest: d.weakest,
      filing: d.filing,
      scores: d.scores,
      origin,
      model: result.model,
      usage: result.usage ?? null,
      ...(taskError ? { task_error: taskError } : {}),
    },
  });

  if (!quiet) await flushDeferred(t.id);
  return { status, reply, filing: d.filing };
}

function askMessage(t: Thought, reply: string): string {
  const snippet = t.content.replace(/\s+/g, " ").trim();
  const short = snippet.length > 140 ? snippet.slice(0, 137) + "…" : snippet;
  return `Filing a capture from Claude/ChatGPT: "${short}"\n${reply}`;
}

// Posts up to 3 questions that were held back during quiet hours.
async function flushDeferred(exceptId: string) {
  const { data } = await supabase.from("thoughts").select("id, content, metadata, created_at")
    .eq("metadata->triage->>deferred", "true").neq("id", exceptId).limit(3);
  for (const t of (data ?? []) as Thought[]) {
    const ask_ts = await slackPost(PERSONAL_CHANNEL, askMessage(t, t.metadata.triage.reply));
    if (!ask_ts) continue;
    const { deferred: _d, ...rest } = t.metadata.triage;
    await saveTriage(t, { ...rest, ask_ts });
  }
}

// --- feedback --------------------------------------------------------------

async function findByThread(threadTs: string): Promise<Thought | null> {
  for (const col of ["metadata->>slack_ts", "metadata->triage->>ask_ts"]) {
    const { data } = await supabase.from("thoughts").select("id, content, metadata, created_at")
      .eq(col, threadTs).not("metadata->triage", "is", null).limit(1);
    if (data?.length) return data[0] as Thought;
  }
  return null;
}

async function feedback(threadTs: string, text: string) {
  if (!TYPESAFE_API_KEY) return { handled: false };
  const t = await findByThread(threadTs);
  if (!t) return { handled: false };

  const tr = t.metadata.triage;
  const current: Filing = {
    domain: tr.domain,
    area: tr.area,
    project: tr.project,
    item_type: tr.item_type,
    actionable: tr.actionable,
    involves_person: tr.involves_person,
    needs_decision: tr.needs_decision,
    urgency: tr.urgency,
  };
  const result = await decide(
    { capture: t.content, filed_as: filingLine(current), assistant_asked: tr.reply, davids_reply: text },
    feedbackQuestions(),
    env,
  );
  const fb = applyFeedback(current, result.answers);
  if (fb.kind === "not_feedback") return { handled: false };
  if (fb.kind === "unclear") {
    return { handled: true, reply: `Not sure what to change. Try "keystone", "personal", "not a task" or an area.` };
  }

  // A domain flip leaves the area unclear: re-pick it within the new domain.
  if (fb.kind === "corrected" && fb.filing.area === "unclear") {
    try {
      const options = Object.fromEntries(
        Object.entries(AREAS).filter(([, v]) => v.domain === fb.filing.domain).map(([k, v]) => [k, v.criteria]),
      );
      const r = await decide(
        { capture: t.content, domain: fb.filing.domain },
        { area: { type: "choice", instructions: "Which ongoing area does this belong to?", criteria: options } },
        env,
      );
      if (r.calibrated && (r.answers.area.confidence ?? 0) >= THRESHOLDS.choiceHigh) {
        fb.filing.area = r.answers.area.choice as Filing["area"];
        fb.changed.area = fb.filing.area;
      }
    } catch (e) {
      console.error("area re-pick failed:", e);
    }
  }

  const via = viaLabel(t);
  let taskRef: string | undefined = tr.linear_issue;
  let note = "";
  if (wantsTask(fb.filing) && !taskRef) {
    try {
      taskRef = (await createTask(t, fb.filing, via))?.ref;
    } catch (e) {
      console.error(String(e));
    }
  } else if (!fb.filing.actionable && taskRef) {
    note = ` (${taskRef} is still open in Linear; close it if it isn't needed.)`;
  }

  const status = fb.kind; // "confirmed" | "corrected"
  await saveTriage(t, {
    ...tr,
    ...fb.filing,
    status,
    ...(taskRef ? { linear_issue: taskRef } : {}),
    history: [...(tr.history ?? []), { at: new Date().toISOString(), from: current, reply: text }],
  }, fb.filing.domain);

  await logEvent({
    event_type: status === "corrected" ? "correction" : "approval",
    source: "slack",
    actor: "david",
    thought_id: t.id,
    linear_issue_id: taskRef ?? null,
    payload: {
      previous_status: tr.status,
      before: current,
      after: fb.filing,
      ...(fb.kind === "corrected" ? { changed: fb.changed } : {}),
      reply: text,
      provider: result.provider,
    },
  });

  return { handled: true, reply: `✓ ${filingLine(fb.filing)}${taskRef && !note ? ` → ${taskRef}` : ""}${note}` };
}

// --- server ----------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const auth = req.headers.get("authorization") ?? "";
  if (!safeEqual(auth.replace(/^Bearer\s+/i, ""), SUPABASE_SERVICE_ROLE_KEY)) {
    return new Response("unauthorized", { status: 401 });
  }

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  try {
    let out: unknown;
    if (body.action === "triage" && typeof body.thought_id === "string") {
      out = await triage(body.thought_id, body.origin === "mcp" ? "mcp" : "slack");
    } else if (body.action === "feedback" && typeof body.thread_ts === "string" && typeof body.text === "string") {
      out = await feedback(body.thread_ts, body.text);
    } else {
      return new Response("bad request", { status: 400 });
    }
    return Response.json(out);
  } catch (err) {
    console.error("triage failed:", err);
    await logEvent({
      event_type: "triage_failed",
      source: "triage",
      actor: "triage",
      thought_id: typeof body.thought_id === "string" ? body.thought_id : null,
      payload: { action: body.action, error: String(err) },
    });
    return Response.json({ status: "error" }, { status: 500 });
  }
});
