# Which app does what (Anthropic and OpenAI)

**The rule:** anything set at the **account** level follows me everywhere. Anything set at the **device or app** level only works there. The OS uses account-level settings wherever it can ("works anywhere").

| Company | Product | For | Runs | Account connectors (e.g., Open Brain)? |
|---|---|---|---|---|
| Anthropic | Claude (chat) | Talking, thinking | Web, desktop, iPhone | Yes, all three. Set once: claude.ai → Settings → Connectors |
| Anthropic | Cowork | Claude doing tasks with my files and apps | Desktop app | Yes, the same connectors |
| Anthropic | Claude Code, cloud | Building; scheduled routines (morning brief) | Anthropic's cloud | Yes (verified Oct 15). Routines need connectors switched on per routine |
| Anthropic | Claude Code, local | Building on my PC | My PC | Own settings; not needed for the OS |
| OpenAI | ChatGPT (chat) | Talking, thinking | Web, desktop, iPhone | Through **Apps** (custom ones need Developer mode) |
| OpenAI | Codex / desktop MCP list | Building; the desktop app's own MCP servers | Cloud or my PC | Own list. Offers STDIO, which means "run a program on this computer" |

**What we learned (Oct 15):**
- Open Brain added in claude.ai Connectors appeared in cloud Claude Code at once.
- Open Brain added in the ChatGPT desktop app's **MCPs** list worked on desktop but not on the iPhone app.
- Per OpenAI's help center (checked Oct 15), custom MCP servers in ChatGPT (chatgpt.com → Plugins → + → Add custom MCP server) are **web only, not mobile**. So on the phone, reach the Brain through **Claude on iPhone** or **Slack**.
- In the ChatGPT desktop MCP form: use Streamable HTTP, the plain URL, and an `x-brain-key` header, so the password isn't in the URL.

**Teach it in one line:** a connector lives either with your account (everywhere) or with one app on one device (only there). Pick account-level.

## Where skills, rules and settings live (checked against Claude Code docs, Oct 15)

| Layer | Holds | Reaches | Set up |
|---|---|---|---|
| **Account (claude.ai)** | Skills enabled for my account, connectors, profile preferences | Claude chat, Cowork, cloud Claude Code sessions, **routines**, and terminal sessions signed in with the account | claude.ai → Customize → Skills (upload) and Connectors |
| **Project (a repo)** | `AGENTS.md`/`CLAUDE.md`, `.claude/skills/`, `.claude/settings.json` | Sessions on that repo | Commit to the repo |
| **Environment** | The cloud machine: network policy, secrets, setup script | Sessions that pick it | claude.ai/code environment settings; not where skills go |
| **Personal folder** | `~/.claude/skills` | One computer only; **not** cloud or Cowork | Skip it; it breaks "works anywhere" |

**Attaching several repos to one session** is for work that spans repos (for example, Personal OS plus a Keystone repo). It isn't the way to share skills: I'd have to remember to attach the skills repo every time, and routines wouldn't have it.

**Plan:** git stays the source of truth. When a second project needs shared skills, create a `skills` repo, and publish the cross-project ones (e.g., `automate-this`, `evaluate-tool`, `process-map`) to my claude.ai account so they load everywhere. Project-only skills stay in their repo.
