# Session Handoff

Last updated: 2026-10-14. Read this first in a new session, then `AGENTS.md` and `docs/03-build-plan.md`.

## Where things stand

- **PR:** [davidabanker-git/Personal-OS#2](https://github.com/davidabanker-git/Personal-OS/pull/2) merged into `main` on 2026-10-14. New sessions start from `main`.
- **Phase 0:** done (Oct 13).
- **Phase 1:**
  - `how-i-work-interview` and `automate-this` skills built.
  - Interview done; results in `context/how-i-work.md`.
  - First real `automate-this` run is pending: short-list outreach, recommended.
- **Morning brief (Phase 5, pulled forward):** skill `.claude/skills/morning-brief/` built Oct 14. A preview for Oct 15 was posted to `#personal`. `slack-capture` v6 skips OS posts (verified: the preview wasn't captured). Merged in [davidabanker-git/Personal-OS#4](https://github.com/davidabanker-git/Personal-OS/pull/4). The scheduled task "Morning brief" (`trig_01YYZoWF38bE9ugc72SWwkxe`, weekdays 3:47 am Central, fresh session per run) was created Oct 14 **without the repo or connectors**: a session can't pass connectors to a schedule here. David adds the repo and the Calendar, Gmail, Linear and Slack connectors in the claude.ai routine settings, then runs it once to test. **Oct 15 3:47 run:** fired, cloned the repo, found no connectors, posted nothing and stopped safely (about $0.25 of plan usage). **Fixed Oct 15:** David attached the four connectors and turned on notifications; a manual test run posted the brief to `#personal`. It runs in Auto mode (a classifier checks connector calls; no approval prompts). Unattended runs may stop at approval prompts; if so, the brief's read tools and the Slack post need allow rules in `.claude/settings.json` (David's call: allowing the Slack post means no prompt for any Slack send).
- **Phase 2:**
  - Supabase `personal-os` (ref `omotqffpafzzmwhezgki`): schema live (thoughts, CRM, ob-graph, events).
  - Edge functions `open-brain-mcp` and `slack-capture` deployed. Both fail closed until secrets are set.
- **Workflow standard (Oct 14):** `docs/workflows.md`: two lanes (agent workflows = skill + routine; plumbing = Supabase function), five parts per workflow, one registry. "Works anywhere" is build principle 6. `evaluate-tool` skill queued.
- **Roadmap additions:** Phase 5b agent team, a wiki track, and **Phase 5c visual home** (approved Oct 14): a live artifact dashboard, with an Opportunities view first and a comment → mockup → approve → build loop. See the build plan.
- **Session check (Oct 14, later):** Supabase logs show no edge-function traffic in the last 24 hours, so action items 1–3 are still open. Proposed next build: the morning brief (Phase 5, pulled forward), with Phase 2b import schema as the alternative. Waiting on David's pick.
- **Visual:** [Personal OS Stack](https://claude.ai/artifact/SN1ybdJ4Ftx2KP3ykzF1wT). The source lives in the old session's scratchpad; republish via `url`.

## David's action items (all phone-friendly)

1. ~~**Supabase secrets**~~ **done Oct 14; `MCP_ACCESS_KEY` rotated Oct 15** (the old one had been emailed; the email is deleted). `OPENROUTER_API_KEY` (its own key, `personal-os-supabase`, $5 limit) and `MCP_ACCESS_KEY` are set. `TYPESAFE_API_KEY` waits for Phase 3; it will be a new key, separate from the cloud environment's.
2. ~~**Slack app "Open Brain"**~~ **done Oct 14.** Created from a manifest; the event URL is verified. The `#keystone` test landed in `thoughts` (type task, domain keystone, embedded) with a `capture` event. Confirm the bot is also invited to `#personal`. The test thought was deleted Oct 14.
3. **Connect Claude and ChatGPT** to `.../functions/v1/open-brain-mcp?key=<MCP_ACCESS_KEY>`, then run the two-tool test.
4. **Open loop:** schedule a session with David Lai on the research and process-mapping tools.
   - Keystone meeting slot order: WFH days, early mornings, drive-time calls, then about 4 pm on an office day as a last resort.
5. **Short list** of contacts for the first `automate-this` run (outreach drafts).
6. **Exports for Phase 2b:**
   - ChatGPT: Settings → Data controls → Export data
   - Claude: Settings → Privacy → Export data
   - Notion: a list of the pages and workspaces to include or skip
7. **Decide the wiki model** (below). Recommendation: Nate's `wiki-compiler`.

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
- **Read-only Supabase allow list approved Oct 14**, but agents can't commit their own permission changes. David adds `.claude/settings.json` himself. Until then, every Supabase call prompts. Contents:
  ```json
  {"permissions": {"allow": [
    "mcp__Supabase__list_tables", "mcp__Supabase__list_migrations",
    "mcp__Supabase__list_extensions", "mcp__Supabase__list_edge_functions",
    "mcp__Supabase__get_edge_function", "mcp__Supabase__query_logs",
    "mcp__Supabase__get_advisors", "mcp__Supabase__get_project",
    "mcp__Supabase__get_project_url", "mcp__Supabase__search_docs"
  ]}}
  ```
- **Every Supabase MCP call asks David to approve it.** If one times out after 60s, an approval is waiting on David's screen; it's not a bug. Don't retry. Put checks into one query, and keep Supabase calls to a minimum.
- **Deno isn't preinstalled.** Install it with `npm i deno@2` in the scratchpad, then use `deno check` and a local run to test functions.
- **Local Postgres 16 + pgvector** works for migration tests. Use `/var/lib/postgresql/<dir>`, since the scratchpad path is too long for the socket.

## New-session starter prompt

Paste this exactly:

```
Continue building my Personal OS in davidabanker-git/Personal-OS (start from main; PR #2 is merged).

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
```
