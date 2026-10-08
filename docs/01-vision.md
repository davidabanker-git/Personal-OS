# Personal OS: Vision, Decisions, Assumptions

Status: discovery, pre-build plan. Last updated 2026-10-08 (round 5).

This doc consolidates two voice-note sessions plus the follow-up discussion. It is split into the two topics the notes actually contain:

- **Part A: the Personal OS.** This is the thing being built.
- **Part B: the Keystone layer.** These are the runbooks, workflows, agents, skills, connectors and tools that run *on* the OS.

---

## The one-sentence version

A personal operating system that knows how I work. It proactively watches what I'm involved in, gets about 90% of the work done (both the doing of tasks and the building of new repeatable workflows), and leaves me as the human judgment in the loop.

**Purpose (the "why"):** my days are lived in goal- and values-aligned ways. I react faster with higher quality, and I'm more proactive because the system is proactive for me. An evolving daily habits list in the context layer is the yardstick.

**Learning goal:** I understand what every tool is actually doing well enough to explain it and help someone else build it. That working knowledge lets me reuse the pieces in other use cases, including Keystone client work.

---

## Part A: The Personal OS (the build)

### Layers

| Layer | What it does | Current direction |
|---|---|---|
| **Capture** | Gets everything in, from voice first | Voice (phone, driving, walking), Notion for think-out-loud notes, Gmail, Drive (personal and company), Calendar |
| **Data (canonical store)** | One source of truth that every AI can read and write | **Supabase** (Postgres plus pgvector), exposed to Claude and ChatGPT over MCP |
| **Context** | Who I am, how I work, priorities, people, rules and habits | Markdown operating manual plus Obsidian as a thinking and viewing surface |
| **Intelligence** | Triage, classify, prioritize, research, draft | Claude and ChatGPT (existing subscriptions), plus Jev as a candidate fast or cheap decision layer |
| **Action / Orchestration** | Triggers, scheduled loops, agents that do the work | Claude Code loops and routines; write actions behind approval gates |
| **Interface** | Where I see and steer it | Tabbed site: quick-capture intake, Today/Week (GTD/PARA views), people, approvals queue |
| **Review and learning loop** | Makes it smarter over time | Daily and weekly reviews (voice-friendly); approved decisions become stored rules |

### Behaviors I want

- **Quick capture intake.** Items are listed by source and hyperlinked back to the original. The system auto-triages when the answer is obvious and asks for approval when it isn't.
- **Knows my work preferences.** Planning and deep work in the morning when possible, meetings in the afternoon.
- **Conversational scheduling.** "Meeting with X about Y" returns options that follow my scheduling rules.
- **Proactive orchestrator:**
  - It watches what I'm involved in and how I work.
  - It researches ways to automate recurring work.
  - It proposes new workflows and builds them once I approve.
  - It does the work itself, roughly 90% of the way to done.
- **People are first-class objects.** Every person has a record of interactions, open loops and context.
- **Voice maintenance.** Reviews and system upkeep happen as voice conversations while driving or walking.
- **Flexible.** It can capture new ideas for how I interact with it.

### Decisions so far

| Decision | Choice |
|---|---|
| Canonical store | Supabase |
| Phone | iPhone |
| Primary capture | Voice-first |
| LLM spend | Use existing ChatGPT and Claude subscriptions where possible |
| Client data | Not housed here. Client meeting notes and transcripts live in the company's AI stack. |
| Keystone data | Allowed to the extent I connect it. I manage the connections. |
| Write actions | Behind guardrails and approval gates |
| 30-day success | Things are organized enough that it can make suggestions and take proactive action |
| Passive time tracking | **Parked.** Too hard to do well on iPhone. Revisit later. |
| Task layer | **Linear**. It owns task state: status, owner, approvals, and receipts as comments. Supabase stores only links and task events, for pattern detection. |
| Obsidian | **Personal reflective vault**: thinking patterns, life, mindfulness, thought work, learnings. The AI may read all of it; the personal content rule governs where content is reused. |
| Jev | **Access confirmed.** It's the decision layer for triage, routing and verification (see build plan). |
| Capture front door | **Slack**, with a personal channel plus a Keystone channel. It uses Open Brain's ready-made `slack-capture` recipe. |
| Conversational / proactive front door | **Slack is viable end to end, with no always-on computer required:**<br>- Mentioning @Claude in a thread starts a Claude Code cloud session on this repo and posts progress and a summary back to the thread.<br>- Scheduled **routines** run in the cloud (hourly at most often), use connectors, and can post into Slack.<br>- Telegram, Discord or iMessage via Channels remain an alternative for a live, always-on session. |
| Notion | Stays available as a capture surface. Its content can be extracted into Obsidian, so it's referenceable and linked. |
| Obsidian | **Explore before committing.** If adopted, the system reads the whole vault, under the personal content rule (see below). |

### Hidden assumptions and suggested changes

1. **"The bottleneck is tooling."** Most personal OS projects fail at the *review habit*, not at capture. A system that ingests everything and gets reviewed by no one becomes a nicer junk drawer.
   - **Change:** make the daily and weekly review loop a core feature, and make it voice-friendly.
2. **"More sources means a better system."** Every connector adds noise. Auto-triage is only as good as the categories it sorts into.
   - **Change:** define a taxonomy first: areas, projects, people, and Keystone vs. personal. Then connect sources one at a time.
3. **"Notion, Obsidian and Supabase can all hold the truth."** Three tools in a chain means sync and conflict problems.
   - **Change:** Supabase is canonical. Notion is a capture surface (inbound only). Obsidian is a generated view plus a thinking space, and edits made there flow back through one defined path. Data should never have two masters.
4. **"I need a separate vector database (Pinecone)."** You don't. Supabase includes pgvector, and Open Brain is exactly this design.
   - **Change:** one database.
5. ~~"I'll build the time tracker and scheduler."~~ Time tracking is parked (see Decisions). For scheduling, build the conversational layer and the rules. Don't rebuild a scheduling engine.
6. **"Personal and company data can live in one brain."** Resolved: client data stays in the company stack.
   - **Remaining rule:** anything built here for Keystone should be *portable* (skills, runbooks, process maps) so it can move to the company's AI stack.

### New assumptions from round two

7. **Proactivity is a data problem before it's an AI problem.** The system can only notice "you did this three times" if it has a record of what you did. The Automation Discovery pattern in the reference review requires at least three separate examples before it suggests anything.
   - **Change:** the OS needs an **activity and event log** from day one, covering captures, triage decisions, approvals, tasks done and sessions with the assistant. That log is what the "automation researcher" reads.
8. **"Done" claimed by an agent isn't done.** Getting 90% done only works if each run leaves evidence: what changed, what was checked, and what still needs me.
   - **Change:** every agent task ends with a *receipt*.
9. **"Agent-learned preferences can steer behavior immediately."** Anything an agent writes into memory is *unconfirmed* until I approve it.
   - **Change:** the learning loop has two tiers: observed (unconfirmed) and approved rule.
10. **"My ChatGPT and Claude subscriptions cover everything."** They generally cover *interactive* use. That includes chat, voice, Claude Code and Codex sessions, and loops you start from them.
    - Server-side triggers (a database event that calls a model with nobody at the keyboard) usually need **API keys billed by usage**.
    - Embeddings for search are also a small API cost.
    - **Change:** budget a small monthly API line item, and route high-volume, cheap decisions to the cheapest capable model.
11. **"Jev can produce work output."** It can't. Jev makes typed decisions (yes/no, pick from a list, score) with confidence. It never writes text. It's a strong fit for triage and routing; an LLM still writes the output. (See `02-reference-systems.md`.)
12. **"Neo4j is needed for relationships."** A graph layer is valuable for people ↔ projects ↔ companies ↔ ideas. But it can live as graph tables inside Supabase (Open Brain's `ob-graph` recipe does exactly this).
    - Neo4j is a second database to keep in sync.
    - **Change:** start with graph tables in Supabase. Add Neo4j later only for its learning value or if graph queries outgrow Postgres.

### Blind spots resolved or acknowledged

- People are first-class objects: **agreed.**
- Client meeting transcripts: **not here.** They live in the company stack.
- Voice-first: **agreed.**
- Guardrails for write actions: **agreed.**
- Learning loop: **agreed.** See assumption 9 for the two-tier design.
- Maintenance burden: handled by time-boxing plus voice maintenance sessions.
- Success measures: lived habits list, response speed and quality, and proactive actions taken.

---

## Part B: The Keystone layer (what runs on the OS)

The OS is the platform. Keystone work is a set of portable capabilities that run on top of it:

| Type | What it is | Examples |
|---|---|---|
| **Runbooks** | Written procedures a human or agent can follow | Discovery call prep, process-mapping session, proposal assembly |
| **Skills** | Runbooks packaged for an agent (`SKILL.md` format, works in Claude Code and Codex) | `process-map`, `bizdev-outreach`, `wireframe-brief`, `meeting-prep` |
| **Workflows** | Triggered, repeatable chains of steps | New lead → research → draft outreach → approval queue |
| **Agents** | Long-running or scheduled workers with scoped permissions | Weekly pipeline review, follow-up watcher |
| **Connectors** | Access to systems (MCP, scripts, exports) | Gmail, Calendar, Drive, Notion, Supabase |
| **Tools** | The products underneath | Supabase, Claude Code, n8n or Make, Vercel, etc. |

### Keystone use cases to cover

- Outreach, marketing and business development (all forms)
- Consultative sales
- Business analysis
- Process analysis and process mapping
- Wireframing
- Light workflow builds
- Operations involvement

### The prerequisite skill: process mapping

The original notes said "may need to create the build skill or process map first." The reference review found a ready-made structure for it, from Nate Herk's Method layer. Every process gets mapped as:

**Trigger → Data sources → Transformations → Decision points → Destination**

Then each step is assigned an autonomy level:

| Level | Name |
|---|---|
| L0 | Manual |
| L1 | Suggested |
| L2 | Drafted |
| L3 | Supervised |
| L4 | Autonomous |

That one skill serves both topics:

- **The OS** uses it on my own work to decide what to automate.
- **Keystone** uses it on client processes.

It's the first skill to build.

---

## Open questions for the build plan

1. **Slack spike:** test whether @Claude reliably starts non-coding tasks ("draft follow-ups for X") with our skills and connectors.
2. **Obsidian trial:** after exploring it, keep it as the personal thinking space or let Notion keep that role?
3. **Neo4j:** learning project now, or parked behind Supabase graph tables?

### Personal content rule (replaces sensitivity tags)

The AI may read everything. One standing rule in the operating manual covers it: **any business or Keystone output contains only project-relevant details.** Professionalism means my personal details are neither necessary nor appropriate in emails, agreements, proposals or posts.

An optional safeguard: a cheap Jev yes/no check on outbound drafts ("contains personal or non-project details?"), applied before they reach my approval queue.
