# How triage works (Phase 3)

**What:** every new capture, from Slack, Claude or ChatGPT, is filed within about a second: Keystone or personal, which area and project, whether it's a task, and how urgent it is. Clear calls are filed silently. Unsure ones get one short question.

**Data flow:**
1. A capture lands in the Brain (`slack-capture` or `open-brain-mcp` → `thoughts`).
2. That function calls the **`triage`** edge function with the thought's ID.
3. Triage asks **Jev** 8 typed questions in one call (about 200 ms, a fraction of a cent): actionable, domain, area, project, type, person, needs a decision, urgency.
4. **Routing** by confidence, using the weakest of domain, actionable and area:

| Confidence | What happens | You see (one reply in the thread) |
|---|---|---|
| High | Filed. A Linear task is created if it's a task and isn't an open decision | `✓ Keystone · Business development · task · this week → DAV-12` |
| Medium | Filed tentatively | `… Right? Reply yes, or correct me` |
| Low | One question about the weakest field | `Keystone or personal?` · `Something to do? yes / no` · `Which area: Learning or Personal OS?` |

5. **Your reply is feedback.** A thread reply under a capture goes to triage first. Jev reads it ("yes", "personal", "not a task", "that's learning") and the filing is updated. A reply that adds new information ("he has 40 units") is saved as a thought, as before.
6. **Everything is logged** to `events`: `triage` (answers + confidence), `approval` (you said yes), `correction` (before/after), `task` (Linear issue created). The weekly review measures accuracy from these.

**Claude/ChatGPT captures:** the filing line comes back in the chat. If triage is unsure, the Open Brain bot asks in `#personal`. During quiet hours (6:30 pm–5 am) the question waits until the next capture after 5 am.

**Where results live:** `thoughts.metadata.triage` (status `filed` · `confirm` · `ask` · `confirmed` · `corrected`, the filing, confidence, model, Linear ref, history of corrections). The top-level `metadata.domain` is updated once filed.

**Safety rails:**
- No `TYPESAFE_API_KEY` → triage skips and capture works exactly as before.
- Jev down → a small OpenRouter model answers, but it's uncalibrated, so it never auto-files (it always asks).
- No `LINEAR_API_KEY` → filing still works; tasks are skipped.
- A correction never deletes a Linear task; it tells you the task is still open.

**Decision model vs. LLM:** Jev doesn't write text. It returns typed answers with probabilities. A yes/no answer is P(yes); a choice comes with its confidence and every option's probability. That's why "how sure" can drive "file it or ask me." An LLM can say "90% sure," but that number isn't calibrated.

**Calibration (2026-10-20, jev-latest, 12 realistic captures):**
- After sharpening the wording (task examples, Ops vs. Sales, an "Unclear" area for noise), every high-confidence call was correct. The ambiguous ones (an idea that could be bizdev or sales, a Karpathy post that could be learning or Personal OS) came back unsure, as they should.
- Yes/no answers sit around 0.8–0.95 for clear calls, so they use their own bands: high at ≥ 0.75 or ≤ 0.25.
- Thresholds live in `supabase/functions/triage/rules.ts` (`THRESHOLDS`). Tune them once, after a week of real captures.

**To change the categories:** edit `context/taxonomy.md` and `AREAS` / `PROJECTS` in `rules.ts` together.

**Done when:** after one week of real captures, at least 70% are auto-filed correctly (filed and not later corrected).

**Teach it in one line:** a fast decision model answers typed questions about each capture, its confidence decides "file it or ask me," and every answer and correction is logged so the thresholds can be tuned.
