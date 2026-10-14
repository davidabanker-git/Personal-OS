# Open Brain schema, in plain English

**What it is:** a Postgres database (Supabase project `personal-os`) that stores everything the OS remembers. Any AI reaches it through one MCP endpoint, so Claude and ChatGPT share the same memory.

## The tables

| Table | Holds | Notes |
|---|---|---|
| `thoughts` | Every capture: text, metadata, and an embedding | An embedding is 1,536 numbers that capture meaning, so "call Jane" finds "follow up with Jane" |
| `professional_contacts`, `contact_interactions`, `opportunities` | People, every touchpoint, deals | Logging an interaction updates the person's `last_contacted` automatically |
| `graph_nodes`, `graph_edges` | Relationships: people ↔ projects ↔ ideas | Graph search runs in Postgres; no Neo4j needed |
| `events` | What the OS did and why: captures, triage, approvals, friction | Append-only. Corrections are new rows, so history can't be rewritten |

## How data flows

1. A capture arrives (Slack, Claude, ChatGPT) → the MCP function gets an embedding from OpenRouter → `upsert_thought` saves it.
2. The same text twice is stored once: the content is fingerprinted, and the metadata is merged.
3. A search turns the question into an embedding → `match_thoughts` returns the closest thoughts by meaning.

## Security, in one line

The public API key can't read or call anything. Only server-side functions using the service key can, and even they can't edit the event log.

## How I'd teach it

"It's a notebook that files itself by meaning, plus a contacts app and a sticky-note wall of who-connects-to-what, and a diary of everything it did. Every AI uses the same notebook through one door."
