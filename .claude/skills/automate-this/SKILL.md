---
name: automate-this
description: Turn a task David describes (what he's doing plus what a great deliverable looks like) into an organized automation. Maps it lightly, offers 2–3 options with autonomy level, effort and tools, then builds the one he picks as a skill, routine or Linear template. Use when David says "automate this", "can we automate…", "turn this into a workflow", or picks an automation candidate from a brief or reflection.
---

# automate-this

David's top pain is going quickly from "I keep doing X, and good looks like Y" to a working automation that stays organized. This skill is that path. Keep it fast: **at most 3 questions before options.**

## 1. Intake (voice-friendly, one question at a time)

You need four things. Pull what you can from his message, `context/how-i-work.md` (automation candidates) and the event log. Ask only for what's missing:

1. **Trigger:** what starts it? (an email, a meeting, a time, a new prospect…)
2. **Steps:** what he does now, roughly. Three to seven verbs is enough.
3. **Quality bar:** what a great deliverable looks like. Ask for a past example if one exists.
4. **Frequency × time:** how often, and how long each time.

## 2. Lightweight map (show it in 5–8 lines)

```
Trigger: …
Steps:   1. … (L?)  2. … (L?)  3. … (L?)
Output:  … → where it lands (Slack thread, Linear, Gmail draft, Brain)
Quality bar: …
Saves: ~N min × M/week
```

Autonomy per step:

- **L0:** David does it.
- **L1:** the agent suggests.
- **L2:** the agent drafts.
- **L3:** the agent acts, and David reviews after.
- **L4:** full autonomy.

**New workflows start at L1–L2.** Any step that sends, publishes, books, spends or deletes stays at L0–L2 (AGENTS.md → Permissions).

## 3. Options (2, at most 3)

Each option fits on one line plus a short detail:

| Option | What gets built | Autonomy | Effort to build | Runs on |
|---|---|---|---|---|
| A: lightest | e.g. a Linear template + checklist | L1 | ~15 min | Linear |
| B: balanced | e.g. a skill he triggers from Slack | L2 | ~1 hr | Claude Code (Slack) |
| C: proactive | e.g. a scheduled routine that drafts and posts to Slack | L2 | ~2 hr | Routine + Brain |

- Recommend one, and say why in one sentence.
- Name the model per AGENTS.md routing (Jev for decisions, Sol by default, Opus for design or polish).
- **One decision for David:** "A, B or C?"

## 4. Build the chosen option

| Type | Where it goes | Must include |
|---|---|---|
| Skill | `.claude/skills/<name>/SKILL.md` | Frontmatter with a trigger-rich description; the quality bar as acceptance criteria; output format; permission boundaries |
| Routine | Claude Code routine; prompt stored in `.claude/routines/<name>.md` once that path is used 3+ times, otherwise in the skill | Schedule in Central time; quiet hours (none after 6:30 pm); posts to Slack, never sends externally |
| Linear template | Linear team `DAV` | The seven-part task record (AGENTS.md → Doing work) |

Then:

1. **Dry run** on one real example and show David the output against his quality bar.
2. **Record it:**
   - Add a line to `decisions/log.md` (what was automated and at which level).
   - Log an `automation` event in the Brain if the connector is available.
3. **Explain it back** in two lines: how it works and how to change it.
4. **Set a promotion check:** after about 5 real runs with few corrections, propose moving up one autonomy level. Never promote silently.

## Guardrails

- Business or Keystone outputs carry only project-relevant details (personal content rule).
- Client data stays in Keystone's stack. Keystone skills must be portable `SKILL.md` files.
- If the task needs a new connector, check `connections.md` first. Offer to set it up yourself, and pause only for passwords, codes, terms or payment.
