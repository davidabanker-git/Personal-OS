# Session Handoff

Last updated: 2026-10-20 (Phase 3 triage built). Read this first in a new session, then `AGENTS.md` and `docs/03-build-plan.md`.

## Where things stand

- **PR:** [davidabanker-git/Personal-OS#2](https://github.com/davidabanker-git/Personal-OS/pull/2) merged into `main` on 2026-10-14. New sessions start from `main`.
- **Phase 0:** done (Oct 13).
- **Phase 1:**
  - `how-i-work-interview` and `automate-this` skills built.
  - Interview done; results in `context/how-i-work.md`.
  - First real `automate-this` run is pending: short-list outreach, recommended.
- **Morning brief (Phase 5, pulled forward):** skill `.claude/skills/morning-brief/` built Oct 14. A preview for Oct 15 was posted to `#personal`. `slack-capture` v6 skips OS posts (verified: the preview wasn't captured). Merged in [davidabanker-git/Personal-OS#4](https://github.com/davidabanker-git/Personal-OS/pull/4). The scheduled task "Morning brief" (`trig_01YYZoWF38bE9ugc72SWwkxe`, weekdays 3:47 am Central, fresh session per run) was created Oct 14 **without the repo or connectors**: a session can't pass connectors to a schedule here. David adds the repo and the Calendar, Gmail, Linear and Slack connectors in the claude.ai routine settings, then runs it once to test. **Oct 15 3:47 run:** fired, cloned the repo, found no connectors, posted nothing and stopped safely (about $0.25 of plan usage). **Fixed Oct 15:** David attached the four connectors and turned on notifications; a manual test run posted the brief to `#personal`. It runs in Auto mode (a classifier checks connector calls; no approval prompts).
- **Evening reflection (Oct 15):** skill `.claude/skills/evening-reflection/` (prompt + process modes). Routines: "Evening reflection" weekdays 4:56 pm (`trig_018MvjaBArTEp6kCt9dRHsQh`, push on) and "Reflection processing" 8:45 pm silent (`trig_01TqQ1JqXm5uet5ApXJ8Pnz6`). Connectors for both (Slack, Gmail, Google Calendar, Linear, Open Brain) switched on by David Oct 15 and verified. **Checked Oct 20:** all three routines succeed on schedule. Oct 15 reflection processed; Oct 16 and Oct 19 prompts got no reply (logged as "Reflection skipped"), which is a friction signal for the reflection itself. `slack-capture` v8 captures thread replies with ✓. Known limit: posts from the Slack connector appear as David, so Slack doesn't ping him; the 5 pm routine's push notification is the ping for now, and Phase 5d moves OS posts to the Open Brain bot.
- **Phase 5d Day coach** added to the build plan (check-ins before and after, feelings check, look-ahead, coaching, `checkins` data). The morning brief already has look-ahead.
- **Phase 2:**
  - Supabase `personal-os` (ref `omotqffpafzzmwhezgki`): schema live (thoughts, CRM, ob-graph, events).
  - Edge functions `open-brain-mcp` and `slack-capture` deployed. Both fail closed until secrets are set.
- **Workflow standard (Oct 14):** `docs/workflows.md`: two lanes (agent workflows = skill + routine; plumbing = Supabase function), five parts per workflow, one registry. "Works anywhere" is build principle 6. `evaluate-tool` skill queued.
- **Roadmap additions:** Phase 5b agent team, a wiki track, and **Phase 5c visual home** (approved Oct 14): a live artifact dashboard, with an Opportunities view first and a comment → mockup → approve → build loop. See the build plan.
- **Session check (Oct 14, later):** Supabase logs show no edge-function traffic in the last 24 hours, so action items 1–3 are still open. Proposed next build: the morning brief (Phase 5, pulled forward), with Phase 2b import schema as the alternative. Waiting on David's pick.
- **Visual:** [Personal OS Stack](https://claude.ai/artifact/SN1ybdJ4Ftx2KP3ykzF1wT). The source lives in the old session's scratchpad; republish via `url`.

## David's action items (all phone-friendly)

1. ~~**Supabase secrets**~~ **done Oct 14; `MCP_ACCESS_KEY` rotated Oct 15** (the old one had been emailed; the email is deleted). `OPENROUTER_API_KEY` (its own key, `personal-os-supabase`, $5 limit) and `MCP_ACCESS_KEY` are set. `TYPESAFE_API_KEY` waits for Phase 3; it will be a new key, separate from the cloud environment's.
2. ~~**Slack app "Open Brain"**~~ **done Oct 14.** Created from a manifest; the event URL is verified. The `#keystone` test landed in `thoughts` (type task, domain keystone, embedded) with a `capture` event. Bot is in `#personal` (added Oct 14); **capture from `#personal` verified Oct 15** (test line filed as task · meditation). The `#keystone` test thought was deleted Oct 14.
3. ~~**Connect Claude and ChatGPT**~~ **done Oct 15; two-tool test passed.** Claude via claude.ai Connectors (account-wide, including cloud sessions). ChatGPT via the desktop app's MCP list (`x-brain-key` header), which isn't on the iPhone app. ChatGPT mobile can't use custom MCP servers (web only, per OpenAI help, Oct 15), so on the phone use Claude or Slack. Open Brain is switched on in the Morning brief routine (Oct 15). See `docs/learn/apps-and-surfaces.md`.
4. **Open loop:** schedule a session with David Lai on the research and process-mapping tools. **Oct 15:** David is texting him; the easy slot is the recurring Fri 8:15 "AI Stuff" call.
   - Keystone meeting slot order: WFH days, early mornings, drive-time calls, then about 4 pm on an office day as a last resort.
5. **Short list** of contacts for the first `automate-this` run (outreach drafts). **Deferred by David (Oct 15):** finish the harness first, then test skills.
6. **Exports for Phase 2b:**
   - ChatGPT: Settings → Data controls → Export data
   - Claude: Settings → Privacy → Export data
   - Notion: a list of the pages and workspaces to include or skip
7. **Decide the wiki model** (below). Recommendation: Nate's `wiki-compiler`. David wants a short talk-through soon; keep it queued.
8. **Skills repo (queued, Oct 15):** David has an empty GitHub repo `Skills` to share skills across his whole harness and projects, plus local skills to port and new ones to create. Design how projects consume it (e.g. submodule, sync, or plugin) after the harness is built.

## Phase 3: Jev triage (built Oct 20, waiting to go live)

David picked **Option A (instant)** on Oct 20. How it works: `docs/learn/triage.md`.

**Built (branch `claude/phase3-triage`, PR open, code, so it waits on David's OK):**
- New `supabase/functions/triage/`: `decide.ts` (Jev, with an OpenRouter fallback that never auto-files), `rules.ts` (taxonomy, questions, thresholds, reply text, feedback), `index.ts` (actions `triage` and `feedback`, Linear tasks, `events` logging), and `rules_test.ts` (11 passing).
- `slack-capture`: a new capture gets the triage line as its single reply. A thread reply goes to triage first as feedback; only non-feedback replies are captured.
- `open-brain-mcp`: one documented local change. `capture_thought` calls triage and appends the line. If unsure, the bot asks in `#personal`, and holds the question during quiet hours.
- Auth: callers send the service role key; no new auth secret. Deploy `triage` with `verify_jwt` off.
- Calibrated live against `jev-latest` (12 captures + 11 feedback replies, all correct after wording fixes).

**To go live (in order):**
1. David OKs the merge. Then deploy `triage`, `slack-capture` and `open-brain-mcp` (each deploy prompts David). Deploy `open-brain-mcp` **before** the next brief, or the skills fall back to posting as David. Safe in any order: without the key, triage skips and capture behaves as before.
2. David adds Supabase secrets `TYPESAFE_API_KEY` (a new TypeSafe key, `personal-os-supabase`) and `LINEAR_API_KEY` (a Linear personal API key). Both are phone steps. **In progress Oct 20:** David is creating both keys. The TypeSafe key in the Claude cloud environment works only inside Claude sessions; Supabase needs its own.
3. Smoke test: post one clear and one ambiguous line in `#keystone`, reply "personal" to the second, and check `events` (`triage`, `correction`).
4. One week of real captures, then measure: auto-filed and not corrected ≥ 70%. Tune `THRESHOLDS` once.

**Also in this PR (Oct 20): OS posts come from the Open Brain bot.** A new Open Brain tool, `post_to_slack` (channels `personal` and `keystone` only), posts as the bot so Slack notifies David; posts made through the connector appear as him and don't. The `morning-brief` and `evening-reflection` skills use it, falling back to the Slack connector if it fails, and they link every actionable item (Gmail thread, Calendar event, Linear issue, Slack permalink). Each run ends with `Posted: <permalink>`, so the push and email notifications link straight to the post.
- **David, one time:** (a) in Slack, set `#personal` notifications to **All new messages** (bot posts are the only other poster there); (b) turn on **email** for the "Evening reflection" scheduled task in its claude.ai settings (the morning brief already emails). Agents can't change notification settings on an existing scheduled task, and recreating it would drop its connectors.

**Follow-ups (not built):** surface unanswered triage questions in the morning brief; a Linear "Needs me" view; an Open Brain MCP tool for corrections from Claude/ChatGPT.

## Data sources

See `docs/04-data-sources.md`: distill, don't dump; read Gmail, Drive and Notion in place; backfill ChatGPT and Claude history first. Waiting on David's approval and his exports.

## Decision pending: which wiki model

Two patterns. They differ on what is canonical.

| | Nate's OB1 `recipes/wiki-compiler` | Karpathy / `nvk/llm-wiki` |
|---|---|---|
| Source of truth | Supabase (SQL). The wiki is a regenerable, compiled view | Raw source files. The AI-owned markdown wiki evolves over time |
| How pages are made | Entity extraction, then typed edges, then entity pages (people, companies, projects) plus topic pages, run on demand or on a schedule | Ingest each source into the wiki; query; lint |
| Fixing a wrong page | Fix the data, then regenerate | The AI edits the page; lint catches drift |
| Fits | People, leads, meeting prep (CRM-style dossiers) | Learning from articles and videos |

**Recommendation:** Nate's model as the default, because it keeps "Supabase is canonical" (decision of 2026-10-08) and needs no second store.
- Learning sources (links, transcripts) are captured into Supabase as thoughts with a `source` type.
- The compiler writes entity and topic pages into a git-synced Obsidian vault on a schedule.
- Karpathy's ingest/query/lint behaviour is implemented over Supabase.
- Use `nvk/llm-wiki` only if file-based ingest proves much better.

**Check before building:** OB1's `schemas/entity-extraction` and `integrations/entity-extraction-worker`. Our live graph tables come from `ob-graph` (`graph_nodes`/`graph_edges`), which are not the entity-extraction tables (`entities`, `thought_entities`, `edges`).

## How we compare to Nate's Open Stack

| Open Stack part | Nate's design | Ours |
|---|---|---|
| Open Skills | Saved procedures, one per repeated job | `.claude/skills/` (+ `.agents/skills`), same idea ✅ |
| Open Brain | Supabase + pgvector + MCP | Built, hardened ✅. Waiting on secrets |
| Open Engine | Linear queue, statuses, labels, private instructions, worker, receipts; smoke / blocked-resumed / approval tests | Planned as Phase 4, with the same design ⬜ |

**Nate's advice:** add a part only when a real problem needs it. Our order follows that. Not yet adopted: his maintained Open Engine guide (unlock-ai.natebjones.com/open-engine). Read it before building Phase 4.

## Gotchas learned

- **Supabase MCP `apply_migration` times out on big SQL.** Split migrations into a tables part and a functions part. Verify with `list_migrations` before retrying.
- **The sandbox can't reach `*.supabase.co`.** Verify live endpoints with Firecrawl scrape (no secrets in the URL).
- **Writing secrets is blocked by a permission check.** David enters them in the dashboard.
- **Read-only Supabase allow list is live:** David committed `.claude/settings.json` to `main` on Oct 15. `execute_sql`, migrations, deploys and secrets still prompt.
- **Every Supabase MCP call asks David to approve it.** If one times out after 60s, an approval is waiting on David's screen; it's not a bug. Don't retry. Put checks into one query, and keep Supabase calls to a minimum.
- **Deno isn't preinstalled.** Install it with `npm i deno@2` in the scratchpad, then use `deno check` and a local run to test functions.
- **Local Postgres 16 + pgvector** works for migration tests. Use `/var/lib/postgresql/<dir>`, since the scratchpad path is too long for the socket.

## New-session starter prompt

Paste this exactly:

```
Continue building my Personal OS in davidabanker-git/Personal-OS (start from main).

Read these first, in order:
1. docs/handoff.md (current state, my action items, pending decisions, gotchas)
2. AGENTS.md (operating manual; follow it)
3. context/how-i-work.md and context/about-me.md
4. docs/03-build-plan.md (phases and progress tracker)
5. docs/04-data-sources.md (data sources and the clean import pipeline)

Then reply with three things only:
- My open action items, in order, one line each.
- What you will build next and why (one or two options, with a recommendation).
- Any decision you need from me (one question at a time).

Don't rebuild anything that's already done. Update docs/handoff.md at the end of every session.

Today's focus: Phase 3 Jev triage (see "Next build" in the handoff).
```
