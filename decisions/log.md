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

## 2026-10-08: Company Google Drive is readable

Approved for read access alongside personal Drive. Needs setup.

## 2026-10-08: Friction watch is a core feature

**Why:** past non-AI systems failed on friction in setup and upkeep.

**What:** the evening reflection reports observed friction with evidence and proposes one fix (simplify, automate, drop or move).

## 2026-10-08: `automate-this` skill joins Phase 1

**Why:** my top pain is quickly turning a described task and quality bar into an organized automation.

**What:** the skill offers 2–3 options; I pick one, and it builds that one.

## 2026-10-08: Compress the build to October 31

**What:** 3.5 weeks at about 6–8 hours a week. Morning brief and evening reflection start in week 1. The BD workflow is quick and dirty, built as the first `automate-this` run.

**Would change if:** the friction report shows overload. Then cut scope rather than push.
