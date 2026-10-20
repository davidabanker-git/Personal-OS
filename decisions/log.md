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

## 2026-10-14: Morning brief goes to #personal at 4:00 am

**What:** the morning brief (Phase 5, pulled forward) is the next build. It posts to Slack `#personal` on weekdays at 4:00 am Central, ready before I wake at about 4:15.

**Why:** it replaces the 30–60 minute planning sweep, my biggest daily friction, and it isn't blocked by the open setup items.

## 2026-10-14: Read-only Supabase tools run without approval

**What:** allow the read-only Supabase tools (list tables, migrations, extensions and functions; read logs, advisors, project info and docs) without a prompt. Running SQL, migrations, deploys and secrets still need my approval every time.

**Why:** I approved about a dozen prompts to delete one test row. Read-only calls can't change anything, so prompting for them is friction without protection. Agents also combine checks into one query and never retry a call that's waiting on my approval.

**How:** a `permissions.allow` list in `.claude/settings.json`. Agents can't commit changes to their own permissions, so I add the file myself.

**Would change if:** a read-only tool starts returning sensitive data, or Supabase adds write behavior to one of these tools.

## 2026-10-14: A live visual home, with a change-request loop

**What:** Phase 5c (after Phase 4) adds a live dashboard whose views evolve as I ask for them. It starts as a private Claude artifact; Vercel only if artifacts fall short. The first view is **Opportunities**: what the proactive agents found, with evidence, readiness (works now / light setup / heavier setup), one-time vs. repeatable, and the route (which agent, or me). I tick items and choose Delegate or Build the capability. Changes to any view go through a loop: I comment, the agent shows a before/after mockup, I approve, it builds, and a receipt lands in Linear.

**Why:** Slack is good for one decision at a time, but choosing among many opportunities and seeing the whole picture needs a page. The loop keeps the dashboard improving without me opening code.

**Would change if:** Slack plus Linear turn out to be enough, or artifacts can't show live data reliably.

## 2026-10-14: One standard for every workflow

**What:** recurring and triggered work follows `docs/workflows.md`.
- **Rule zero, works anywhere:** cloud only; nothing depends on my PC or a desktop app.
- **Two lanes:** agent workflows (judgment, writing) are a skill plus a Claude routine; plumbing (instant, frequent, deterministic) is a Supabase function.
- **Five parts:** skill, thin routine, access attached once by me, output to Slack/Linear/Brain with a known header, and a receipt so failures reach me.
- **One registry** of every workflow.

**Why:** the morning brief is the first of many scheduled workflows. A standard keeps each new one cheap to add, easy to swap to another model, and visible in one place.

**Would change if:** routines get too costly or limiting. Then move to one dispatcher routine, or to Lane B for more jobs.

**Also queued:** an `evaluate-tool` skill that gives a verdict (Adopt / Trial / Park / Skip) on new tools, plugins, MCPs and skills I come across.

## 2026-10-15: Phase 2 (Memory) complete

**What:** the two-tool test passed: a note saved from Claude was found from ChatGPT. Slack capture was verified on Oct 14. Done three days ahead of the Oct 18 plan; the overall finish stays Oct 31.

**Mobile:** ChatGPT's custom MCP servers are web/desktop only. On the phone, the Brain is reached through Claude (iPhone) and Slack.

## 2026-10-15: Evening reflection is a conversation, at 5 pm

**What:** at 5 pm the OS posts a short check-in (Top 3 status, one friction with a fix, a numbered overnight queue, "how did today go, 1–5"). I reply in the thread by voice or text. At 8:45 pm a silent agent saves the reflection and runs only what I approved (research and drafts). Results appear in the morning brief.

**Why:** a post I only read wouldn't build the habit or catch friction. Reply-in-thread keeps it to one decision, and quiet hours stay quiet.

## 2026-10-15: Day coach goes on the roadmap (Phase 5d)

**What:** check-ins before (feelings) and after (debrief) the day's important moments, look-ahead prep flags, and coaching when I'm stuck. At most 3 a day. Records live in a Supabase `checkins` table; the bot posts them so Slack pings me.

**Why:** the records grow more valuable over time. They show where I get stuck, what I do well, what I enjoy, and what I avoid, which is the data a coach needs.

**When:** after Phase 4, or sooner if the evening reflection sticks. Look-ahead is already in the morning brief.

## 2026-10-15: Starter prompts always come in chat

**What:** whenever a fresh session is needed, the assistant pastes the complete starter prompt in chat as one copy-ready block. It never points me to a file to copy from.

**Why:** opening a document to copy text is friction, and friction is what kills these systems.

## 2026-10-15: Docs-only PRs merge without asking

**What:** the assistant may merge PRs that only change docs (handoff, decisions, tracker, plans, learn notes) and tell me afterward. PRs that change code, skills, functions or settings still wait for my OK.

**Why:** I approved 7 docs-only merges in one day; the approval added friction, not safety.

## 2026-10-15: Imports keep more from deep conversations

**What:** the ChatGPT and Claude backfill doesn't keep a fixed 2–5 facts per chat. Depth and topic set the amount: deep explorations of mindfulness, thought work and emotional management keep about 5–15 facts plus a synthesis note. Restated ideas are linked as `refines`, not merged. The newest is current; older versions stay as history.

**Why:** my understanding of these topics deepens through repetition. Treating restatements as duplicates would erase how my thinking grew.

## 2026-10-20: Triage runs instantly (Option A)

**What:** a `triage` edge function files every capture within seconds, using Jev. High confidence auto-files (plus a Linear task when actionable); medium asks "Right?"; low asks one question. Thread replies correct it.

**Why:** a wrong label fixed by a one-word reply while the thought is fresh is low friction; a batch of stale labels to fix later is the kind of chore that gets skipped. It also keeps triage off the Claude plan (Jev costs pennies).

## 2026-10-20: OS posts come from the Open Brain bot, with links

**What:** briefs and reflections post as the Open Brain bot (new `post_to_slack` tool), not through the Slack connector. Every actionable item links to where it gets done (email, calendar event, Linear issue, Slack thread), and each run's notification links to the post. Email notifications on for the evening reflection.

**Why:** connector posts appear as me, so Slack never pinged me. That's the likely reason the Oct 16 and Oct 19 reflections went unanswered. Links make each item one tap away on phone or desktop.

## 2026-10-20: Clickable links, always

**What:** every reply, brief and post links each actionable item to where it gets done. URLs are never invented.

**Why:** one tap to act, on phone or desktop. Hunting for the right place is friction.
