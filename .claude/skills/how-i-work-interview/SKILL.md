---
name: how-i-work-interview
description: Voice-first interview that maps how David's work actually runs (rhythms, recurring decisions, dependencies, institutional knowledge, friction) and saves the approved answers to context/how-i-work.md. Use when David says "start the interview", "how-I-work interview", or asks to re-run or update his operating model.
---

# How-I-Work Interview

Adapted from OB1's `work-operating-model` skill (five fixed layers, confirm before saving). Changes: built for voice while driving, and saves to `context/how-i-work.md` instead of extra database tables.

## Goal

Make David's tacit work patterns explicit, so briefs, triage, scheduling and `automate-this` work from how he *actually* works, not how he wishes he worked. About 45 minutes. It can pause and resume at any layer.

## Voice rules (he is usually driving)

- **One question per turn.** At most two short sentences. No lists, tables or links while he's driving.
- Ask for **real, recent examples**: "last Tuesday" beats "usually".
- Expect dictation errors and run-on answers. Infer the meaning, and confirm only if the ambiguity would change what gets saved.
- After each layer, read back a checkpoint of **3–5 short spoken bullets**, then ask "Save it, or what's off?" Save only on a yes.
- Never re-ask what `context/` already answers. Read `context/about-me.md`, `priorities.md` and `work-preferences.md` first, and confirm instead: "You start around 4:30. Still true?"
- If he says "pause" or goes quiet: save the approved layers, note the next layer at the top of the file, and stop.

## Layers (fixed order, about 5–6 questions each)

1. **Operating rhythms.** What a real day looks like versus the calendar.
   - "Walk me through yesterday from wake-up to hard stop."
   - "Where does your calendar lie to you?"
   - "When are you actually sharp, and when is it admin-only time?"
   - "What repeats every week even though nobody scheduled it?"
2. **Recurring decisions.** Judgment calls he makes over and over.
   - "What's a call you made three times last week?"
   - "What do you look at before deciding? What would make you say no?"
   - "Which of these could someone else make if they had your rules?"
3. **Dependencies.** Who and what he waits on, and who waits on him.
   - "What were you waiting on last week, and from whom?"
   - "What breaks if David Lai or the developer goes quiet for two days?"
   - "Who's waiting on you right now?"
4. **Institutional knowledge.** What only he knows.
   - "If you were out for two weeks, what would people get wrong?"
   - "Where does that knowledge live today: your head, Notion, email?"
5. **Friction.** Where time and energy leak.
   - "What did you do by hand last week that annoyed you?"
   - "What do you keep putting off?" (Probe gently. AGENTS.md friction watch applies.)
   - "Rough guess: how often does it happen, and how long does it take?"

## Saving

After each approved layer:

1. **Update `context/how-i-work.md`.** Use one section per layer. Each entry is a bold title plus short bullets: what, when or cadence, inputs, people, and the "rule" if there is one. Mark each entry `(confirmed)` if he said it directly, or `(synthesized)` if you abstracted it from several examples and he approved it.
2. **If the Open Brain connector is available**, capture **one** summary thought for the layer, e.g. "How I work (rhythms): …". One per layer, not one per entry.
3. **For friction entries**, add them to the `## Automation candidates` list at the bottom, with frequency × time cost. These feed `automate-this` and the weekly discovery pass.

## Close-out

1. Run a contradiction pass: rhythms vs. dependencies, decisions vs. knowledge, friction vs. the stated rhythm. Name each tension in one sentence and ask which version is true.
2. Propose (don't apply) the edits this implies for `work-preferences.md` or `priorities.md`. These are observed rules: they're promoted only with approval (AGENTS.md → Learning loop).
3. Tell him the top 1–2 automation candidates and offer to run `automate-this` on one.
4. Commit on the working branch: "Add how-I-work interview results".
