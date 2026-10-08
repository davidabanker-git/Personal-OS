# Connections

Registry of every system this OS can reach. Update a row whenever a connection is added or verified.

**Mechanism:** `mcp` · `script` · `export` · `api` · `not yet connected`

| Domain | Tool | Mechanism | Access | Last verified |
|---|---|---|---|---|
| Memory | Open Brain (Supabase) | mcp | read/write | not yet built |
| Tasks | Linear | mcp / api | read/write | not yet connected |
| Chat front door | Slack (`#personal`, `#keystone`) | capture function + Claude Code in Slack | write (capture) | not yet connected |
| Email | Gmail | mcp | read; **drafts only** | available in Claude sessions |
| Calendar | Google Calendar | mcp | read; propose only | available in Claude sessions |
| Files | Google Drive (personal) | mcp | read | available in Claude sessions |
| Files | Google Drive (company) | mcp | read | TODO, depending on Keystone policy |
| Notes | Notion | mcp | read | available in Claude sessions |
| Reflections | Obsidian vault | import script | read | trial pending |
| Decisions | Jev (TypeSafe) | api (`api.typesafe.ai/v1/systemone`) | call | key exists; store as a Supabase secret |
| Embeddings | OpenRouter | api | call | not yet connected |
| Hosting | Vercel | mcp | deploy | later (dashboard) |

**When wiring a new tool:** add a `docs/learn/<tool>.md` note covering what it does, how auth works, and one example query.
