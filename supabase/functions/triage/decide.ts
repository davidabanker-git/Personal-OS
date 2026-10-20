// decide(state, questions) → typed answers with confidence.
// The one decision interface for the OS (docs/02-reference-systems.md §4):
// Jev answers first; if it fails, a small OpenRouter model answers the same
// questions in the same shape, flagged as uncalibrated so callers never
// auto-act on it. Swapping the decision model means changing this file only.

export type Question =
  | { type: "noul"; instructions: unknown; criteria?: { true?: string; false?: string } }
  | { type: "choice"; instructions: unknown; criteria: Record<string, unknown> }
  | { type: "score"; instructions: unknown; criteria: unknown[] };
export type Questions = Record<string, Question>;

export type Answer = {
  type: "noul" | "choice" | "score";
  noul?: number; // P(yes)
  choice?: string;
  score?: number; // expected level, 0-based
  confidence?: number;
  probabilities?: Record<string, number>;
};
export type Answers = Record<string, Answer>;

export type DecideResult = {
  answers: Answers;
  provider: "jev" | "openrouter";
  model: string;
  calibrated: boolean;
  usage?: { input_tokens: number; output_tokens: number };
};

type Env = { typesafeKey: string; openrouterKey: string; jevModel?: string; fetch?: typeof fetch };

const JEV_URL = "https://api.typesafe.ai/v1/systemone";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const FALLBACK_MODEL = "openai/gpt-4o-mini";

async function withTimeout<T>(ms: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await run(ctl.signal);
  } finally {
    clearTimeout(t);
  }
}

export async function askJev(state: unknown, questions: Questions, env: Env): Promise<DecideResult> {
  const f = env.fetch ?? fetch;
  const model = env.jevModel || "jev-latest";
  const body = await withTimeout(5000, async (signal) => {
    const r = await f(JEV_URL, {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${env.typesafeKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, state, questions }),
    });
    if (!r.ok) throw new Error(`jev ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return await r.json();
  });
  for (const name of Object.keys(questions)) {
    if (!body.answers?.[name]) throw new Error(`jev: missing answer ${name}`);
  }
  return { answers: body.answers, provider: "jev", model: body.model ?? model, calibrated: true, usage: body.usage };
}

// Same questions to a small LLM, asking for the same answer shape.
export async function askFallback(state: unknown, questions: Questions, env: Env): Promise<DecideResult> {
  const f = env.fetch ?? fetch;
  const spec = Object.entries(questions).map(([name, q]) => {
    if (q.type === "noul") return `- ${name} (yes/no): ${JSON.stringify(q.instructions)} → {"p_yes": 0-1}`;
    if (q.type === "choice") {
      return `- ${name} (pick one of ${JSON.stringify(Object.keys(q.criteria))}; meanings ${
        JSON.stringify(q.criteria)
      }): ${JSON.stringify(q.instructions)} → {"choice": "...", "confidence": 0-1}`;
    }
    return `- ${name} (score 0-${q.criteria.length - 1}; levels ${JSON.stringify(q.criteria)}): ${
      JSON.stringify(q.instructions)
    } → {"score": n, "confidence": 0-1}`;
  }).join("\n");

  const body = await withTimeout(8000, async (signal) => {
    const r = await f(OPENROUTER_URL, {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${env.openrouterKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: FALLBACK_MODEL,
        response_format: { type: "json_object" },
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              `Answer each question about the state. Return one JSON object keyed by question name.\n${spec}`,
          },
          { role: "user", content: JSON.stringify(state) },
        ],
      }),
    });
    if (!r.ok) throw new Error(`openrouter ${r.status}`);
    return await r.json();
  });

  const raw = JSON.parse(body.choices[0].message.content);
  const answers: Answers = {};
  for (const [name, q] of Object.entries(questions)) {
    const v = raw[name] ?? {};
    const conf = clamp(Number(v.confidence ?? 0.5));
    if (q.type === "noul") answers[name] = { type: "noul", noul: clamp(Number(v.p_yes ?? 0.5)) };
    else if (q.type === "choice") {
      const keys = Object.keys(q.criteria);
      const choice = keys.includes(v.choice) ? v.choice : keys[0];
      answers[name] = { type: "choice", choice, confidence: keys.includes(v.choice) ? conf : 0, probabilities: { [choice]: conf } };
    } else {
      const max = q.criteria.length - 1;
      answers[name] = { type: "score", score: Math.max(0, Math.min(max, Number(v.score ?? 0))), confidence: conf };
    }
  }
  return { answers, provider: "openrouter", model: FALLBACK_MODEL, calibrated: false };
}

const clamp = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5);

export async function decide(state: unknown, questions: Questions, env: Env): Promise<DecideResult> {
  try {
    return await askJev(state, questions, env);
  } catch (jevErr) {
    console.error("decide: jev failed, using fallback:", jevErr);
    if (!env.openrouterKey) throw jevErr;
    return await askFallback(state, questions, env);
  }
}
