# Workflows: standard and registry

Every recurring or triggered workflow in this OS follows one standard. The morning brief is the first instance. Adopted 2026-10-14 (`decisions/log.md`).

## Rule zero: works anywhere

Every part runs in the cloud. No step depends on my PC, a desktop app or a local file. If I can't run it, fix it or approve it from my phone, it isn't done.

## Two lanes

| Lane | Use it for | Runs on |
|---|---|---|
| **A. Agent workflows** | Judgment, several sources, writing | Skill + Claude routine (scheduled or event-triggered) |
| **B. Plumbing** | Instant, high-frequency, deterministic | Supabase edge function (+ `pg_cron` for schedules) |

**Pick Lane B when** it must react in seconds, runs more than about hourly, or needs no judgment. Everything else is Lane A.

## The five parts of a Lane A workflow

1. **Skill (the what).** All logic lives in `.claude/skills/<name>/SKILL.md`. It's portable: Codex or another model can run the same file.
2. **Routine (the when).** A schedule or trigger plus a thin prompt: "Run skill `<name>`, follow it exactly, boundaries: …". No logic in the prompt, so the orchestrator can be swapped.
3. **Access (with what).** The repo and the connectors the skill needs, attached **once per routine by me** in the claude.ai routine settings (agents can't grant account access to themselves). Read-only tools go in the `.claude/settings.json` allow list.
4. **Output (where it lands).** Slack for anything I read or approve; Linear for work; the Brain for memory. OS posts start with a known header (`Morning brief`, `Evening reflection`, `Weekly review`, …) so Slack capture skips them. Add new headers to `OS_POST_HEADERS` in `supabase/functions/slack-capture/index.ts`.
5. **Receipt (proof it ran).** The run is visible: a post, a Linear receipt, or an event. A failed run must reach me: turn on push notifications for the routine, and the next brief reports any failed run.

## Adding a workflow (checklist)

- [ ] Lane chosen, and why
- [ ] Skill written, starting at L1–L2
- [ ] Routine created with a thin prompt; the schedule avoids :00 and :30
- [ ] Repo + connectors attached (David, one time)
- [ ] Output header added to `OS_POST_HEADERS` if it posts to Slack
- [ ] One test run checked end to end
- [ ] Row added to the registry below; `docs/learn/<name>.md` written

## Scaling notes

- Each run uses Claude plan usage (a brief costs about $0.25 at list price). Keep skills tight; move frequent jobs to Lane B.
- Each run starts fresh. State lives in the Brain, Linear or the repo, never in the session.
- If routines pass about 8, consider one hourly **dispatcher** routine that runs whatever is due from a schedule file. New workflows then need no settings step.

## Registry

| Workflow | Lane | Skill | Trigger | Connectors | Output | Autonomy | Status |
|---|---|---|---|---|---|---|---|
| Morning brief | A | `morning-brief` | Weekdays 3:47 am Central (`trig_01YYZoWF38bE9ugc72SWwkxe`) | Calendar, Gmail, Linear, Slack | `#personal` | L1 | **Live Oct 15.** Connectors and notifications attached; test run posted in about 37s (about $0.37 at list price) |
| Slack capture | B | — (`slack-capture` function) | Slack event, instant | Slack app, OpenRouter | Brain + thread reply | L3 (files captures) | Live since Oct 14 |
