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

## 2026-10-08: Process-map skill moves to the Keystone build queue

**Why:** it's Keystone work, not OS foundation. `automate-this` keeps a lightweight internal map. The assistant asks during planning when to build the full client version.

## 2026-10-08: Skills live in the repo

**What:** skills go in `.claude/skills/`, with `.agents/skills` symlinked to it for Codex.

**Why:** cloud sessions start from a fresh clone, so local `~/.claude/skills` aren't available. Repo skills travel with every session.

## 2026-10-08: Design principle: minimal surface, robust underneath

**What:** every touchpoint feels Apple-simple: one decision at a time, plain words, and no visible machinery.

## 2026-10-08: The friction review uses the Obsidian vault

**What:** it draws on my growth, mindfulness and thought-work notes to suggest root causes and strategies, citing the note.

**Requires:** the vault must sync into Open Brain. Cloud sessions can't read local files.

## 2026-10-09: The assistant offers to do setup itself

**What:** before handing me a setup step, the assistant checks for a connector, browser or computer use, offers to do it, and asks for approval. I handle only passwords, verification codes, terms and payment.

**Applies:** to Claude Code and Codex via `AGENTS.md`. Cowork and claude.ai chats need the same line in my claude.ai profile preferences.

## 2026-10-13: Phase 0 complete

**What:** operating manual, Supabase `personal-os`, Linear team `DAV`, Slack `#personal` and `#keystone`, OpenRouter and TypeSafe keys are all in place and verified from a cloud session. Finished two days after plan, one day ahead of the last projection.

**Next:** Phases 1 and 2 (`automate-this` + how-I-work interview, Open Brain + Slack capture), target Oct 18. Overall finish stays Oct 31.

## 2026-10-13: Open Brain schema follows OB1, hardened

**What:** the `thoughts`, CRM and graph tables use OB1's exact names and columns, so OB1's MCP server and extensions run unmodified. Changes from upstream: every function is callable only by the server, and the event log can't be edited or deleted.

**Why:** reusing OB1 means less custom code to maintain, and the lockdown keeps the public API key from reaching memory.

**Would change if:** OB1's schema drifts far enough that tracking it costs more than owning ours.

## 2026-10-13: Dedicated agent team and LLM wiki join the roadmap

**What:**
- Phase 5b adds role-based agents: chief of staff, researcher, outreach writer, triage, librarian and builder. Each gets the model that fits its job, and handoffs go through Linear.
- The Obsidian trial becomes a wiki track built on `nvk/llm-wiki` (Karpathy's LLM wiki pattern). The vault lives in a private GitHub repo, so cloud agents can maintain it.

**Why:** agents with one job each are easier to tune and cheaper to run, and Linear handoffs leave receipts. The wiki turns scattered notes into linked knowledge that agents and I can both use.

**Would change if:** Linear handoffs prove too slow for agent-to-agent work, or the plugin's footprint outweighs its value. A simpler fallback is a plain markdown vault plus OB1's Obsidian import.
