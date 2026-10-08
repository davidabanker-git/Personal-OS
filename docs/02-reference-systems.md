# Reference Systems Review

How three creators build a personal or business AI OS, plus Jev and Neo4j. The goal is to pull out principles, infrastructure and tools, then take the best of each.

Reviewed 2026-10-08. Sources:

- **Nate B. Jones:** Open Stack and Open Brain guides via Nate's Library (MCP), plus the public [OB1 repo](https://github.com/NateBJones-Projects/OB1).
- **Nate Herk:** [AIS-OS](https://github.com/nateherkai/AIS-OS) repo, read in full.
- **Liam Ottley:** public pages and videos.
- **Jev:** the TypeSafe launch post plus third-party coverage.

---

## 1. Nate B. Jones: Open Stack (Skills, Brain, Engine)

**Philosophy:** infrastructure you own, usable from any model. "One brain. All of them." Build the smallest part that fixes a problem you already have, and add another part only when your work proves you need it.

| Part | Job | How it's built |
|---|---|---|
| **Open Skills** | Saved procedure for one job: steps, tool rules, limits, a check | Folder of text files (`SKILL.md`). Portable across Claude Code, Codex and others. |
| **Open Brain** | Memory every AI shares | Supabase Postgres table (`thoughts`: text, vector embedding, metadata), pgvector for meaning search, MCP server as a Supabase Edge Function, OpenRouter for embeddings. Claude, ChatGPT and others connect by URL. |
| **Open Engine** | Tasks, owners, approvals, handoffs, receipts | A shared task list (Linear in v1; Notion, GitHub Issues or a markdown file also work). Each task is a seven-part record: requester, outcome, sources, acceptance criteria, boundaries, blocker rule, receipt. |

**Default order:** Skills, then Brain, then Engine. Change the order if another part fixes today's problem first.

### OB1 repo pieces directly relevant to us

- **`recipes/life-engine`:** a proactive loop (`/loop 30m /life-engine` in Claude Code). It checks the time and calendar, pulls relevant memory before meetings, tracks habits and check-ins, and sends briefings to Telegram or Discord. It's described as "self-improving," and by week four it suggests its own improvements. **This is the closest existing thing to the proactive assistant in our vision.**
- **`extensions/professional-crm`:** contacts → interactions → opportunities, with follow-up reminders. People as first-class objects.
- **`recipes/ob-graph`:** a knowledge graph (nodes, edges, traversal, shortest path) built *inside Postgres*. No separate graph database. Directly relevant to the Neo4j question.
- **`recipes/work-operating-model-activation`:** a 45-minute interview that captures how you work in five layers: rhythms, recurring decisions, dependencies, institutional knowledge, friction. It stores the answers as structured data. **This is how the OS learns "the way I work."**
- **`recipes/adaptive-capture-classification`, `auto-capture`, `daily-digest`, `weekly-digest`, `gmail-smart-pull`, `obsidian-vault-import`, `entity-wiki`:** capture, triage and review building blocks.
- **Dashboards:** templates that deploy to Vercel or Netlify.

### Automation Discovery skill (Nate's Library guide)

This skill reads your work history, starting with AI session history and then other sources you approve. It stores the records in a local SQLite file and verifies its findings against the original sources. It then produces an **offer sheet of 2–5 automations**, each backed by a query you can check.

- It requires **at least three separate examples** of a task.
- "Nothing worth building" is a valid result.
- You pick one, and it builds and tests only that one.

**This is the "proactively research ways to automate my work" behavior, already designed.**

### Principles worth keeping

- Anything an agent writes to memory is **unconfirmed** until a human approves it or a trusted source supports it.
- Write down **what the agent may do and what only the human may do** before automating:
  - Human-only: accounts, credentials, billing, publishing, deletion, anything that affects other people.
- Every task ends with a **receipt**: what changed, what was checked, what's blocked.
- Avoid one-click setups. The value is in the personal decisions you make explicit.
- **Send boundary:** an email agent drafts and files things, but cannot send. An ignored draft means nothing happens.

**Strength:** model-agnostic shared memory. It works with *both* of your subscriptions (ChatGPT and Claude) through MCP, and it has a big recipe library.

**Weakness:** you assemble many parts. It's easy to sprawl if you don't follow its own "one part at a time" rule.

---

## 2. Nate Herk: AIS-OS (AI Automation Society OS)

**Philosophy:** the method matters more than tools. "Boring is beautiful. Workflows beat agents." It's a free, MIT-licensed starter kit that turns Claude Code or Codex into your AI OS.

**Litmus test:** "While you're not at your desk, your AI OS observes one real-world event and produces an output that's faster and more accurate than what you'd produce yourself."

### Two frameworks

**The Four Cs (architecture).** The dependency order matters: Context can't be skipped, Connections and Capabilities can be built in parallel, and Cadence comes last.

| Layer | What it means | "In place" test |
|---|---|---|
| **Context** | Knows your business | A fresh session can explain who you are without browsing |
| **Connections** | Reaches your stuff | "What's on my calendar tomorrow and what's due?" answered with live data |
| **Capabilities** | Knows how to do the work | A short phrase triggers a multi-step workflow that produces an artifact |
| **Cadence** | Runs without being asked | Laptop closed, and a brief still lands |

**The Three Ms (operator brain).**

- **Mindset:**
  - *Default Shift:* "To what extent can AI be leveraged here?"
  - *Function Breakdown:* automate one tiny piece at a time.
  - *Curiosity Rule:* never ship what you can't explain.
- **Method:**
  - Find the constraint ("If 500 clients showed up tomorrow, what breaks?").
  - **EAD:** Eliminate, then Automate, then Delegate.
  - The **60/30/10 rule:** about 60% fully automated, 30% AI-drafted and human-reviewed, 10% manual.
  - **Map the process:** trigger, data sources, transformations, decision points, destination.
  - **Autonomy levels L0–L4:** default to the lowest level that works.
  - Tie every build to a KPI.
- **Machine:**
  - Lego principle: zero-AI steps first.
  - Assembly line: one specialized AI step per job.
  - Validation chain: test each step before chaining.
  - Bike method: training wheels → guided → watched → hands-off. Use confidence thresholds: high auto-sends, medium goes to the draft queue, low escalates.
  - **Intern rule:** the AI gets its own identity, read-only by default, never impersonates you, full audit trail.
  - **Kill switch.**

### Infrastructure

A git repo of markdown files:

- `CLAUDE.md` and `AGENTS.md`: a mirrored operating manual, so Claude Code and Codex share it.
- `context/`: about me, business, priorities.
- `references/`: voice samples, frameworks, API guides.
- `connections.md`: a registry of every system plus how each is reached (MCP, script, export).
- `decisions/log.md`: an append-only record of decisions and why.
- `brainstorms/`, `audits/`, `archives/`.
- **No database.** Claude Code is the runtime.

### Six skills

| Skill | What it does |
|---|---|
| `/onboard` | Seven-question intake that scaffolds the context files |
| `/grill-me` | One-question-at-a-time interview. Every answer is saved to disk immediately. |
| `/audit` | Evidence-based Four Cs score. Rewards working retrieval, not folder counts. |
| `/link` | Makes new sources findable |
| `/level-up` | **Weekly 3Ms interview that finds and ships one automation per week** |
| `/3d-brain` | Visual explorer for your knowledge |

### Principles worth keeping

- Success is *felt*, not measured by KPIs:
  - Teammates ask your OS instead of you.
  - You stop opening six tabs.
  - Knowledge leaves your head.
- "When you spot a manual task I'm doing three or more times, surface it." This is built into the operating manual.
- Folder hygiene: no `inbox/`, `misc/` or `notes/` graveyards. Add a folder only when you'll touch it three or more times a month.
- Cadence comes last: don't automate a workflow that doesn't work manually.

**Strength:** consulting-grade methodology you can hand to a client. It maps one-to-one onto Keystone's process mapping and consultative work. It's also cross-model (Claude Code and Codex).

**Weakness:** files only. There's no live data layer, no vector search and no phone interface, and cadence is left to you.

---

## 3. Liam Ottley: AIOS (AAA founder)

**Philosophy:** an AIOS is a *methodology*. It wraps layers of AI around an existing business until most of the operational work runs itself, freeing the owner for growth. He sells and teaches this as a done-for-you service to small businesses. That's relevant to Keystone as a commercial model.

**Five layers:**

1. **Context:** the AI learns the business "like a co-founder."
2. **Data:** scattered sources centralized into one queryable place or dashboard.
3. **Intelligence:** daily briefings and analysis on top of the context and data.
4. **Automate:** a task audit that finds what to automate vs. augment.
5. **Build:** with time freed up, build new things.

**KPIs he tracks:**

- Away-from-desk autonomy
- Percentage of tasks automated
- Revenue per employee

**Infrastructure:**

- Claude Code is the engine.
- His public setup pairs **Claude Code with Telegram**, so the OS runs from the phone. It handles text, **voice notes**, photos and brain dumps, has persistent conversations, can spawn multiple agents, and has GTD and databases built in.
- He positions it as more business-focused than OpenClaw.

**Strength:** a phone-first interface, a commercial framing and simple KPIs.

**Weakness:** the details sit behind lead magnets and the community. It's oriented to business owners more than personal life.

---

## Where all three agree

1. **Context first,** in one place you own.
2. **Build in layers, not leaps.** Prove each piece before adding the next.
3. **Lowest autonomy that works.** Drafts and approvals before autonomy. Workflows before agents.
4. **Write the permission boundary down.** Humans own sending, publishing, money, credentials and deletion.
5. **Evidence over vibes:** receipts, audits, decision logs.
6. **A weekly improvement ritual** finds the next automation:
   - Herk: `/level-up`
   - Nate B. Jones: Automation Discovery
   - Ottley: task audit
7. **Portability:** the same skills and memory work across Claude and ChatGPT or Codex.
8. **Measure lived outcomes,** not tool counts.

## How they differ

|  | Nate B. Jones | Nate Herk | Liam Ottley |
|---|---|---|---|
| Center of gravity | Data infrastructure | Method and operating manual | Business methodology and phone interface |
| Canonical store | Supabase (Postgres + vectors) | Markdown files in git | Claude Code workspace |
| Runtime | Any MCP client; Claude Code for loops | Claude Code or Codex | Claude Code + Telegram |
| Proactivity | Life Engine loop, digests | Cadence layer (left to you) | Daily briefings, phone agent |
| Best thing to steal | Shared memory, receipts, Life Engine, CRM, graph-in-Postgres | 3Ms and 4Cs, process map, autonomy levels, `/grill-me`, `/audit`, `/level-up` | Phone and voice front door, KPIs, the commercial model |

## Feature comparison (★ = only in this OS)

| Feature | Nate B. Jones | Nate Herk | Liam Ottley | **This OS** |
|---|---|---|---|---|
| Memory | Supabase + vectors | Markdown files | Claude Code workspace | Supabase + vectors + **people/graph + event log** ★ |
| Method | Skills → Brain → Engine | 3Ms + 4Cs | 5 layers | 4Cs + **process-map skill + autonomy levels** |
| Tasks | Linear (Open Engine) | — | GTD built in | Linear + receipts + approvals |
| Phone/chat | Slack/Telegram capture | — | Telegram + Claude Code | **Slack: capture + kick off tasks + briefs** |
| Proactive | Life Engine (local loop) | Cadence (DIY) | Daily briefings | **Cloud routines, no computer left on** ★ |
| Finds automations | Automation Discovery | /level-up | Task audit | Event log → weekly evidence-based offers |
| Fast decisions | — | — | — | **Jev triage with confidence** ★ |
| Model strategy | Any model via MCP | Claude + Codex | Claude | **Sol default, Opus escalation, Jev decisions, Grok-swappable** ★ |
| Inner life | Household extensions | — | — | **Obsidian reflective vault** ★ |
| Business layer | Generic | AIS consulting | Sells AIOS to SMBs | **Keystone skills, portable to the company stack** ★ |
| Learning built in | — | Curiosity Rule | — | **Explain-it-back note per phase** ★ |

## Recommended blend (input to the build plan)

- **Operating manual and method (Herk):**
  - A repo with a `CLAUDE.md`/`AGENTS.md` pair, `context/`, `connections.md` and `decisions/log.md`.
  - The 3Ms process map and autonomy levels as the first skill.
  - `/grill-me`-style interviews that you can run by voice.
- **Data layer (Nate B. Jones):**
  - Open Brain on Supabase, so both ChatGPT and Claude read and write the same memory.
  - Add the CRM and graph tables for people.
  - Add an event log so the system can see patterns.
- **Task, approval and receipt layer (Open Engine pattern).** The tool is still to be decided.
- **Proactive loop (Life Engine plus Automation Discovery plus `/level-up`):**
  - A scheduled loop does briefings and follow-ups.
  - A weekly discovery pass proposes 2–5 automations backed by evidence.
- **Front door (Ottley):** voice from the iPhone, via Telegram, the Claude or ChatGPT mobile apps with the brain connected, or both.
- **Fast decisions (Jev, optional):** triage and routing as "smart if-statements," using its confidence scores for auto-file vs. ask-me.

---

## 4. Jev (TypeSafe AI)

**What it is:** TypeSafe calls it a "System One" model. It launched on 2026-09-15 in **early access**, from a startup founded by a former OpenAI researcher.

- It **does not generate text.** You send unstructured state plus typed questions, and it returns typed decisions with calibrated probabilities.
- Answer types:
  - yes/no
  - choice from a predefined set (up to 255 options)
  - numeric score
- The output always matches your schema, so there are no type errors or invented categories.

**Claims and numbers** (vendor's own, plus third-party write-ups):

| Measure | Figure |
|---|---|
| Latency | About 70–500 ms per call (vs. seconds for LLMs) |
| Price | About $0.042 per million input tokens; output currently free |
| Accuracy on TypeSafe's own workflow eval | About 68%: on par with a mid-tier frontier LLM, a few points behind the top models, at a fraction of the cost and latency |
| Use cases they pitch | Classify, route, score, extract, branch ("smart if-statements"), verify or guardrail LLM output, high-volume map-reduce, real-time apps |

**What it can't do:**

- Write a reply or draft
- Invent a new category when none fit
- Run a multi-step process on its own

**Fit for this OS:**

- **Triage:**
  - Is this actionable?
  - Which area or project?
  - Which person?
  - Priority score
  - Needs approval?
- **Calibrated confidence maps directly onto the auto-file vs. ask-me rule.** It's the same idea as Herk's Bike Method thresholds: high confidence files automatically, medium goes to the approval queue, low asks you.
- **Verification:** score whether an agent's "done" output meets the acceptance criteria.
- The writing still comes from Claude or ChatGPT. Jev decides, code acts, the LLM writes.

**Risks:**

- New vendor, early access (waitlist).
- Benchmarks are the vendor's own.
- Designing around a single provider.

**Recommendation:** build triage behind a small "decision interface" (questions in, typed answers plus confidence out). Start with whatever is available, a cheap LLM or Jev, and swap without rewriting the workflow. Request early access now.

**Video referenced:** RoboNuggets, "These 19 Jev-Claude use cases" (2026-10-03). The free PDF of the use cases is in the RoboNuggets free Skool community (search "n79").

---

## 5. Neo4j

**What it adds:**

- A native graph database (Cypher query language).
- Excellent for relationship-heavy questions: "Who do I know at companies like X?", "What links this idea to that project?"
- A free cloud tier exists, with size limits and pause-on-idle. Check current limits.

**Tension:** it's a second database to keep in sync with the Supabase canonical store.

**Alternative already proven:** OB1's `ob-graph` recipe gets nodes, edges, multi-hop traversal and shortest path inside Postgres.

**Recommendation:**

1. Start with graph tables in Supabase.
2. Add Neo4j later as a *read-only projection* synced from Supabase, if:
   - graph questions become central, or
   - you want Cypher fluency for Keystone clients.

---

## 6. Tool landscape (what's available, by layer)

This isn't exhaustive. It's the categories to know, so you can recognize what a new tool *is*.

| Layer | Categories and examples |
|---|---|
| Capture | Voice dictation (Wispr Flow, iOS dictation), Claude and ChatGPT voice modes, Telegram or Discord bots, Apple Shortcuts, Notion, email forwarding |
| Data | Postgres or Supabase (with pgvector), SQLite (local), graph databases (Neo4j), vector-only databases (Pinecone, usually unnecessary if you use pgvector) |
| Context | Markdown operating manuals (`CLAUDE.md`/`AGENTS.md`), Obsidian, Notion |
| Connections | MCP servers (Gmail, Calendar, Drive, Notion, Supabase are already connected in this workspace), scripts that call APIs, exports |
| Intelligence | Frontier LLMs (Claude, ChatGPT), small or cheap LLMs for bulk work, decision models (Jev), embedding models |
| Orchestration | Claude Code (skills, `/loop`, scheduled routines, subagents), Codex, OpenClaw, deterministic workflow tools (n8n, Make), database triggers and edge functions |
| Tasks and approvals | Linear, Notion databases, GitHub Issues, a Supabase table plus your own UI |
| Interface | Hosted dashboards (Vercel or Netlify), OB1 dashboard templates, Claude artifacts, Telegram as a chat UI |
| Review | Daily and weekly digests, voice review sessions, decision log, audit skill |
