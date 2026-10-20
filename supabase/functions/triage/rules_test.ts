// Run: deno test supabase/functions/triage/
import { assert, assertEquals } from "jsr:@std/assert@1";
import type { Answers } from "./decide.ts";
import { applyFeedback, type Filing, replyText, route, statusFor } from "./rules.ts";

// Shapes match real jev-latest answers from the 2026-10-20 calibration run.
function answers(o: {
  act: number;
  domain: [string, number];
  area: [string, number, Record<string, number>?];
  decision?: number;
  urgency?: number;
}): Answers {
  return {
    actionable: { type: "noul", noul: o.act },
    domain: { type: "choice", choice: o.domain[0], confidence: o.domain[1] },
    area: {
      type: "choice",
      choice: o.area[0],
      confidence: o.area[1],
      probabilities: o.area[2] ?? { [o.area[0]]: o.area[1] },
    },
    project: { type: "choice", choice: "none", confidence: 0.9 },
    item_type: { type: "choice", choice: o.act >= 0.5 ? "task" : "idea", confidence: 0.9 },
    involves_person: { type: "noul", noul: 0.2 },
    needs_decision: { type: "noul", noul: o.decision ?? 0.1 },
    urgency: { type: "score", score: o.urgency ?? 0.2, confidence: 0.8 },
  };
}

Deno.test("clear task files automatically", () => {
  // "Need to follow up with Tommy about the two multifamily owners…"
  const d = route(answers({ act: 0.9, domain: ["keystone", 1], area: ["bizdev", 0.9], urgency: 1 }));
  assertEquals(d.tier, "high");
  assertEquals(statusFor(d.tier), "filed");
  assertEquals(replyText(d, "DAV-12"), "✓ Keystone · Business development · task · this week → DAV-12");
});

Deno.test("borderline task asks for a confirm", () => {
  // "Remember to ask David Lai about access to the Spine pipeline view" (act 0.61)
  const d = route(answers({ act: 0.61, domain: ["keystone", 0.98], area: ["ops", 1] }));
  assertEquals(d.tier, "medium");
  assertEquals(d.weakest, "actionable");
  assert(replyText(d).endsWith(`Right? Reply *yes*, or correct me (e.g. "personal", "not a task").`));
});

Deno.test("unsure area asks one question with the top two", () => {
  // "Read Karpathy's LLM wiki post…" (learning 0.53)
  const d = route(answers({
    act: 0.14,
    domain: ["personal", 1],
    area: ["learning", 0.53, { learning: 0.53, personal_os: 0.4, bizdev: 0.05, unclear: 0.02 }],
  }));
  assertEquals(d.tier, "low");
  assertEquals(replyText(d), "Which area: Learning or Personal OS?");
});

Deno.test("area from the other domain forces a question", () => {
  const d = route(answers({ act: 0.1, domain: ["personal", 0.99], area: ["bizdev", 0.95] }));
  assertEquals(d.tier, "low");
  assertEquals(d.weakest, "area");
});

Deno.test("noise is filed as unclear, no question", () => {
  // "hmm"
  const d = route(answers({ act: 0.05, domain: ["personal", 1], area: ["unclear", 0.97] }));
  assertEquals(d.tier, "high");
  assertEquals(replyText(d), "✓ Personal · Unclear · idea");
});

Deno.test("fallback answers never auto-file", () => {
  const d = route(answers({ act: 0.95, domain: ["keystone", 1], area: ["bizdev", 1] }), { capConfidence: 0.84 });
  assertEquals(d.tier, "medium");
  assertEquals(d.confidence, 0.84);
});

const filed: Filing = {
  domain: "keystone",
  area: "bizdev",
  project: "none",
  item_type: "task",
  actionable: true,
  involves_person: true,
  needs_decision: false,
  urgency: "this week",
};

function fb(o: { is: number; confirms?: number; domain?: string; actionable?: string; area?: string }): Answers {
  const c = (v?: string) => ({ type: "choice" as const, choice: v ?? "unchanged", confidence: 0.95 });
  return {
    is_feedback: { type: "noul", noul: o.is },
    confirms: { type: "noul", noul: o.confirms ?? 0.1 },
    domain: c(o.domain),
    actionable: c(o.actionable),
    area: c(o.area),
  };
}

Deno.test("yes confirms", () => {
  assertEquals(applyFeedback(filed, fb({ is: 0.95, confirms: 0.97 })).kind, "confirmed");
});

Deno.test("'personal' moves the domain and clears a mismatched area", () => {
  const r = applyFeedback(filed, fb({ is: 0.95, domain: "personal" }));
  assertEquals(r.kind, "corrected");
  if (r.kind !== "corrected") return;
  assertEquals(r.filing.domain, "personal");
  assertEquals(r.filing.area, "unclear");
});

Deno.test("an area answer also moves the domain", () => {
  const r = applyFeedback(filed, fb({ is: 0.9, area: "family" }));
  assert(r.kind === "corrected");
  assertEquals(r.filing.domain, "personal");
  assertEquals(r.filing.area, "family");
});

Deno.test("'not a task' clears actionable", () => {
  const r = applyFeedback(filed, fb({ is: 0.9, actionable: "no" }));
  assert(r.kind === "corrected");
  assertEquals(r.filing.actionable, false);
  assertEquals(r.filing.item_type, "idea");
});

Deno.test("new information isn't feedback", () => {
  assertEquals(applyFeedback(filed, fb({ is: 0.1 })).kind, "not_feedback");
});
