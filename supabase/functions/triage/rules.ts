// Triage rules: the taxonomy, the questions Jev answers, and confidence routing.
// Pure functions only (no network), so they're unit-tested in rules_test.ts.
//
// The taxonomy mirrors context/taxonomy.md. Change both together.
// Wording was calibrated against jev-latest on 2026-10-20 (docs/learn/triage.md).

import type { Answers, Questions } from "./decide.ts";

export const AREAS = {
  bizdev: {
    label: "Business development",
    domain: "keystone",
    criteria: "Keystone: business development and networking (deals, leads, partners, outreach)",
  },
  sales_mapping: {
    label: "Sales & process mapping",
    domain: "keystone",
    criteria:
      "Keystone: consultative sales and process mapping (prospect conversations, a prospect's pain points and processes, pricing and scoping engagements, process maps, build plans)",
  },
  ops: {
    label: "Keystone ops",
    domain: "keystone",
    criteria:
      "Keystone: internal operations (Keystone's own team, tools, access, onboarding and company processes; not client or prospect work)",
  },
  personal_os: {
    label: "Personal OS",
    domain: "personal",
    criteria: "Personal: building this Personal OS (automations, skills, agents, tooling)",
  },
  health: { label: "Health", domain: "personal", criteria: "Personal: health and movement (exercise, sleep, food)" },
  mindfulness: {
    label: "Mindfulness",
    domain: "personal",
    criteria: "Personal: meditation, mindfulness, thought work, emotions",
  },
  learning: {
    label: "Learning",
    domain: "personal",
    criteria: "Personal: learning (articles, courses, videos, books)",
  },
  family: { label: "Family", domain: "personal", criteria: "Personal: family and home" },
  unclear: { label: "Unclear", domain: null, criteria: "Too short or vague to tell what it is about" },
} as const;
export type Area = keyof typeof AREAS;
export type Domain = "keystone" | "personal";

export const PROJECTS = {
  personal_os_build: "Personal OS Phase 0–5: briefs, reflection, triage, tasks, one shipped automation",
  process_mapping_skill: "Process-mapping skill ready for Keystone's next closed deal",
  bizdev_pipeline: "Bizdev pipeline workflow: research → draft → follow-up loop for outreach",
  none: "Not part of any of these projects",
} as const;
export type Project = keyof typeof PROJECTS;

export const ITEM_TYPES = {
  task: "Something David still needs to do (not a log of something already done)",
  idea: "An idea to consider",
  reference: "Information to keep",
  "person-note": "A note about a person",
  meeting: "About a meeting",
  decision: "A decision made",
  reflection: "A personal reflection, feeling or lesson",
} as const;

export const URGENCY = ["someday", "this week", "today"] as const;

export function triageQuestions(): Questions {
  return {
    actionable: {
      type: "noul",
      instructions: {
        question: "Does this capture contain something David needs to do?",
        yes_examples: ["need to / remember to / ask X about Y / follow up with / book / call / send / add X to Y"],
        no_examples: [
          "a feeling or reflection",
          "an idea to consider later",
          "a fact or note about someone",
          "a log of something already done",
        ],
      },
    },
    domain: {
      type: "choice",
      instructions: "Which domain is this capture about?",
      criteria: {
        keystone:
          "David's work at Keystone AI: deals, prospects, partners, clients, process mapping, Keystone team",
        personal: "Everything else: family, health, mindfulness, learning, and building his Personal OS",
      },
    },
    area: {
      type: "choice",
      instructions: "Which ongoing area of David's life does this belong to?",
      criteria: Object.fromEntries(Object.entries(AREAS).map(([k, v]) => [k, v.criteria])),
    },
    project: {
      type: "choice",
      instructions: "Is this part of one of David's current projects?",
      criteria: { ...PROJECTS },
    },
    item_type: {
      type: "choice",
      instructions: "What kind of item is this?",
      criteria: { ...ITEM_TYPES },
    },
    involves_person: {
      type: "noul",
      instructions: "Does this capture involve a specific person other than David?",
    },
    needs_decision: {
      type: "noul",
      instructions: "Does this capture contain an open question or choice that needs David's judgment?",
    },
    urgency: {
      type: "score",
      instructions: "How soon does this need attention?",
      criteria: ["Someday or no deadline", "This week", "Today"],
    },
  };
}

// --- Confidence routing -----------------------------------------------------

export type Tier = "high" | "medium" | "low";

// Choice confidence is Jev's own. Yes/no answers are a probability, and Jev's
// clear calls sit around 0.8–0.95, so they get their own bands (distance from 0.5).
export const THRESHOLDS = {
  choiceHigh: 0.85,
  choiceMedium: 0.6,
  noulHigh: 0.25, // p ≥ 0.75 or ≤ 0.25
  noulMedium: 0.1, // p ≥ 0.6 or ≤ 0.4
};

export function choiceTier(conf: number): Tier {
  if (conf >= THRESHOLDS.choiceHigh) return "high";
  if (conf >= THRESHOLDS.choiceMedium) return "medium";
  return "low";
}

export function noulTier(p: number): Tier {
  const d = Math.abs(p - 0.5);
  if (d >= THRESHOLDS.noulHigh) return "high";
  if (d >= THRESHOLDS.noulMedium) return "medium";
  return "low";
}

const RANK: Record<Tier, number> = { low: 0, medium: 1, high: 2 };

export type Filing = {
  domain: Domain;
  area: Area;
  project: Project;
  item_type: keyof typeof ITEM_TYPES;
  actionable: boolean;
  involves_person: boolean;
  needs_decision: boolean;
  urgency: (typeof URGENCY)[number];
};

export type Decision = {
  filing: Filing;
  tier: Tier;
  confidence: number; // the weakest gating answer, 0–1
  weakest: "domain" | "actionable" | "area";
  area_options: Area[]; // top two, for an area question
  scores: Record<string, number>;
};

// Turns raw answers into one filing plus a tier. Domain, actionable and area
// gate the tier; the rest are recorded but never trigger a question.
export function route(a: Answers, opts: { capConfidence?: number } = {}): Decision {
  const cap = opts.capConfidence ?? 1;
  const domain = a.domain.choice as Domain;
  const area = a.area.choice as Area;
  const actionableP = a.actionable.noul!;

  const gates = {
    domain: { tier: choiceTier(Math.min(a.domain.confidence!, cap)), conf: a.domain.confidence! },
    actionable: { tier: noulTier(actionableP), conf: Math.max(actionableP, 1 - actionableP) },
    area: { tier: choiceTier(Math.min(a.area.confidence!, cap)), conf: a.area.confidence! },
  };
  // An area from the other domain contradicts the domain answer: ask.
  const areaDomain = AREAS[area]?.domain;
  if (areaDomain && areaDomain !== domain) gates.area.tier = "low";
  // Fallback models aren't calibrated, so they never auto-file.
  if (cap < 1) {
    for (const g of Object.values(gates)) if (g.tier === "high") g.tier = "medium";
  }

  const order = ["domain", "actionable", "area"] as const;
  const weakest = order.reduce((w, k) => (RANK[gates[k].tier] < RANK[gates[w].tier] ? k : w), order[0]);

  const areaProbs = a.area.probabilities ?? {};
  const area_options = (Object.keys(areaProbs) as Area[])
    .filter((k) => k !== "unclear" && (AREAS[k].domain === domain || gates.domain.tier !== "high"))
    .sort((x, y) => areaProbs[y] - areaProbs[x])
    .slice(0, 2);

  const urgencyIdx = Math.max(0, Math.min(2, Math.round(a.urgency.score ?? 0)));
  return {
    filing: {
      domain,
      area,
      project: a.project.choice as Project,
      // "Kettlebell 20 min done" can come back as type task; if it isn't
      // actionable, it's a log entry, which the taxonomy files as reference.
      item_type: actionableP < 0.5 && a.item_type.choice === "task"
        ? "reference"
        : a.item_type.choice as keyof typeof ITEM_TYPES,
      actionable: actionableP >= 0.5,
      involves_person: (a.involves_person.noul ?? 0) >= 0.5,
      needs_decision: (a.needs_decision.noul ?? 0) >= 0.5,
      urgency: URGENCY[urgencyIdx],
    },
    tier: gates[weakest].tier,
    confidence: Math.min(gates.domain.conf, gates.actionable.conf, gates.area.conf, cap),
    weakest,
    area_options,
    scores: {
      domain: a.domain.confidence!,
      area: a.area.confidence!,
      actionable: actionableP,
      needs_decision: a.needs_decision.noul ?? 0,
      urgency: a.urgency.score ?? 0,
    },
  };
}

// --- What David sees --------------------------------------------------------

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function filingLine(f: Filing): string {
  const parts = [cap(f.domain), AREAS[f.area].label];
  if (f.actionable) parts.push(`task · ${f.urgency}`);
  else parts.push(f.item_type);
  return parts.join(" · ");
}

// Status names are stored in metadata.triage.status.
export type Status = "filed" | "confirm" | "ask";

export function statusFor(tier: Tier): Status {
  return tier === "high" ? "filed" : tier === "medium" ? "confirm" : "ask";
}

// One short message: filed, "right?", or one question about the weakest field.
export function replyText(d: Decision, linearRef?: string): string {
  const line = filingLine(d.filing);
  const status = statusFor(d.tier);
  if (status === "filed") return `✓ ${line}${linearRef ? ` → ${linearRef}` : ""}`;
  if (status === "confirm") return `${line}. Right? Reply *yes*, or correct me (e.g. "personal", "not a task").`;
  if (d.weakest === "domain") return "Keystone or personal?";
  if (d.weakest === "actionable") return "Something to do? *yes* / *no*";
  const opts = d.area_options.map((k) => AREAS[k].label);
  return opts.length >= 2 ? `Which area: ${opts[0]} or ${opts[1]}?` : "Which area does this belong to?";
}

// --- Feedback (David's thread replies) ---------------------------------------

export function feedbackQuestions(): Questions {
  const keep = { unchanged: "The reply doesn't change or mention this" };
  return {
    is_feedback: {
      type: "noul",
      instructions:
        "Is David's reply answering or correcting how his capture was filed (e.g. 'yes', 'right', 'personal', 'not a task', 'that's learning'), rather than adding new information?",
    },
    confirms: {
      type: "noul",
      instructions: "Does David's reply say the filing is right (e.g. 'yes', 'yep', 'correct', 'right')?",
    },
    domain: {
      type: "choice",
      instructions: "Which domain does David's reply say the capture belongs to?",
      criteria: { ...keep, keystone: "Keystone (work)", personal: "Personal" },
    },
    actionable: {
      type: "choice",
      instructions:
        "Does David's reply explicitly say the capture is or isn't a task? A bare 'no' that corrects something else is unchanged.",
      criteria: { ...keep, yes: "It is a task / something to do", no: "It is not a task" },
    },
    area: {
      type: "choice",
      instructions:
        "Which area does David's reply explicitly name? If the reply names no area (only a domain like 'personal'), unchanged.",
      criteria: {
        ...keep,
        ...Object.fromEntries(
          Object.entries(AREAS).filter(([k]) => k !== "unclear").map(([k, v]) => [k, v.label]),
        ),
      },
    },
  };
}

export type Feedback =
  | { kind: "not_feedback" }
  | { kind: "confirmed"; filing: Filing }
  | { kind: "corrected"; filing: Filing; changed: Partial<Filing> }
  | { kind: "unclear" };

// A field changes only on a confident, explicit answer; anything else stays.
const pick = (a: Answers, k: string) =>
  a[k] && a[k].choice !== "unchanged" && (a[k].confidence ?? 0) >= THRESHOLDS.choiceHigh
    ? a[k].choice
    : undefined;

// Applies a reply to the current filing. A bare answer to an area question
// ("learning") changes the area; one that names a domain-mismatched area also
// moves the domain.
export function applyFeedback(current: Filing, a: Answers): Feedback {
  if ((a.is_feedback.noul ?? 0) < 0.5) return { kind: "not_feedback" };

  const changed: Partial<Filing> = {};
  const domain = pick(a, "domain") as Domain | undefined;
  const area = pick(a, "area") as Area | undefined;
  const actionable = pick(a, "actionable");

  if (area && area !== current.area) {
    changed.area = area;
    const ad = AREAS[area].domain;
    if (ad && ad !== current.domain) changed.domain = ad;
  }
  if (domain && domain !== (changed.domain ?? current.domain)) {
    changed.domain = domain;
    // The old area belongs to the other domain now; mark it for review.
    if (!changed.area && AREAS[current.area].domain !== domain) changed.area = "unclear";
  }
  if (actionable && (actionable === "yes") !== current.actionable) {
    changed.actionable = actionable === "yes";
    if (changed.actionable) changed.item_type = "task";
    else if (current.item_type === "task") changed.item_type = "idea";
  }

  if (Object.keys(changed).length) return { kind: "corrected", filing: { ...current, ...changed }, changed };
  if ((a.confirms.noul ?? 0) >= 0.6) return { kind: "confirmed", filing: current };
  return { kind: "unclear" };
}
