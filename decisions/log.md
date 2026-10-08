# Decisions Log

Append-only. Format: date, decision, why, and what would change my mind.

---

## 2026-10-08: Supabase is the canonical store

**Why:** one database for memory, people, graph and event log, with vector search built in. It reaches both Claude and ChatGPT over MCP.

**Would change if:** graph queries outgrow Postgres. Neo4j would then be a read-only projection.

## 2026-10-08: Linear owns task state

**Why:** it's a real task app with an API and MCP access, and it's the Open Engine pattern. Supabase keeps only task links and events.

## 2026-10-08: Slack is the front door

**What:** capture, kicking off tasks via @Claude, and receiving briefs.

**Why:** a ready-made capture recipe exists, Claude Code in Slack can start cloud sessions, and routines can post to Slack. No always-on computer is needed.

**Would change if:** the Phase 0 test shows @Claude can't reliably run non-coding tasks. Fallback: Slack, then a Linear task, then a routine.

## 2026-10-08: Model routing

**What:** Sol is the default, Opus (high effort) handles design, long builds and client-facing polish, and Jev handles all typed decisions.

**Why:** Sol is about 5–6x cheaper per task and close on most work. Opus leads on taste and long autonomous builds.

## 2026-10-08: Personal content rule replaces sensitivity tags

**What:** the AI reads everything. Business and Keystone outputs contain only project-relevant details.

## 2026-10-08: Parked items

- Passive time tracking
- Neo4j
- Always-on chat session
- Dashboard (until Slack plus Linear prove insufficient)

## 2026-10-08: Client data stays out

Client meeting notes and transcripts live in the company's AI stack. Keystone skills built here must be portable to it.
