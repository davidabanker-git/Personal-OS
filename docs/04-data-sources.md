# Data Sources Plan

Status: draft v1, 2026-10-14. How information gets from where it lives today into the Brain (Supabase) and the wiki, cleanly.

## Principles

1. **Distill, don't dump.** Import extracted facts (decisions, preferences, people, commitments, learnings), not raw transcripts or inboxes. Raw stays where it is, linked by `source_ref`.
2. **Read in place when you can.** Gmail, Drive, Calendar and Notion are reachable through connectors. Agents read them on demand, and only distilled facts are copied into the Brain.
3. **Value first, not everything.** Backfill a source only when it feeds a current priority: leads, Keystone, how I work, or growth. Skip the long tail.
4. **Live capture before backfill.** Stop new mess first (Slack, connectors), then clean the history.
5. **Every row knows where it came from:** `source`, `source_ref` (an ID or URL), `captured_at`, `original_date`.
6. **Day-job (Ensemble) and client data stay out.**

## Pipeline: one path for every source

```
source → landing (raw, with a reference) → distill (atomize, extract type, people, dates) → dedup → review queue (low confidence only) → Brain (thoughts, CRM, events) → compiled wiki pages
```

**Dedup has three layers:**
1. **Exact:** a content fingerprint (already live in `upsert_thought`).
2. **Same source item:** `source_ref` is unique per source, so re-running an import is safe.
3. **Near-duplicate:** semantic similarity of 0.92 or higher against existing thoughts. The two are merged (metadata union, oldest date kept) and a `merge` event is logged. Borderline cases go to the review queue.

**People are resolved to one CRM record** using name, email and aliases (for example, "Tommy" = "Tommy Flynn"). Unsure matches go to review.

## Source by source

| Source | What's worth keeping | Method | Live / backfill | Priority |
|---|---|---|---|---|
| **Slack `#personal` `#keystone`** | Everything I capture | `slack-capture` (built) | Live | 1 |
| **Claude + ChatGPT apps** | Things I say to save | Open Brain connector (built) | Live | 1 |
| **ChatGPT history** | Decisions, preferences, learnings, context about me | OB1 `chatgpt-conversation-import`: filters trivial chats and extracts 2–5 typed thoughts per conversation | Backfill once | 2 |
| **Claude history** | Same as ChatGPT | Adapt the ChatGPT importer to Claude's export format | Backfill once | 2 |
| **Notion** | Projects, plans, reflections, reading notes | Notion connector; I pick the workspaces and pages; distill to thoughts plus wiki sources | Backfill selected pages, then read live | 2 |
| **Gmail** | People, commitments, lead threads (Keystone and personal) | Read live for briefs and follow-ups. Backfill only Keystone and lead threads from the last 12 months into the CRM (OB1 `gmail-smart-pull`) | Live reads + small backfill | 3 |
| **Google Drive** | Specific docs (plans, decks, process maps) | Read on demand; import only docs I flag | On demand | 3 |
| **Paper notes** | Ideas, plans, to-dos | Photo → Slack with `notes:` → the AI transcribes, distills and files it. Backlog: one batch of photos | Live + one batch | 3 |
| **Calendar** | Meetings, people met | Read live (briefs, meeting prep); log interactions to the CRM | Live | 1 |
| **Obsidian / wiki** | Compiled view | Generated from the Brain (see the handoff wiki decision) | Output, not input | — |
| **Fathom (meeting recorder)** | Personal and Keystone-internal meeting notes only | Connector; distill action items and decisions | Live | 3 |

## Order of work

1. Finish live capture (secrets, Slack app, connectors). Already in progress.
2. ChatGPT + Claude history backfill. Highest value, because it holds years of my thinking.
3. Notion: one pass over the pages I select.
4. Gmail: lead and Keystone threads into the CRM.
5. Paper notes: one photo batch.
6. Drive: on demand.

## Needed from me

- **ChatGPT export:** Settings → Data controls → Export data. Download the zip from the email.
- **Claude export:** Settings → Privacy → Export data.
- **Notion:** a list of the workspaces and pages that matter, and the ones to skip.
- **Paper notes:** a time to photograph the backlog.

## Schema change before backfill

Add a `source_ref` column (unique per source) and a small `import_runs` table (source, counts, errors), so imports are repeatable and auditable. Add a review-queue view (low-confidence merges and person matches).
