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
