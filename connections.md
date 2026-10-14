# Connections

Registry of every system this OS can reach. Update a row whenever a connection is added or verified.

**Mechanism:** `mcp` · `script` · `export` · `api` · `not yet connected`

| Domain | Tool | Mechanism | Access | Last verified |
|---|---|---|---|---|
| Memory | Open Brain (Supabase project `personal-os`, ref `omotqffpafzzmwhezgki`, us-east-2) | mcp | read/write | schema live 2026-10-13; secrets set 2026-10-14; Claude/ChatGPT connectors pending |
| Tasks | Linear (team `DAV`) | mcp / api | read/write | verified 2026-10-13 |
| Chat front door | Slack (`#personal`, `#keystone`) | capture function + Slack connector | capture; morning brief posts to `#personal` | Slack app "Open Brain" live 2026-10-14; capture verified end to end; skips OS posts (v6) |
| Email | Gmail | mcp | read; **drafts only** | available in Claude sessions |
| Calendar | Google Calendar | mcp | read; propose only | available in Claude sessions |
| Files | Google Drive (personal) | mcp | read | available in Claude sessions |
| Files | Google Drive (company) | mcp | read | approved; needs setup |
| Notes | Notion | mcp | read | available in Claude sessions |
| Reflections | Obsidian vault | import script | read | trial pending |
| Decisions | Jev (TypeSafe) | api (`api.typesafe.ai/v1/systemone`) | call | key works in Claude sessions; store as a Supabase secret in Phase 2 |
| Embeddings | OpenRouter | api | call | key verified 2026-10-13; store as a Supabase secret in Phase 2 |
| Hosting | Vercel | mcp | deploy | later (dashboard) |

**When wiring a new tool:** add a `docs/learn/<tool>.md` note covering what it does, how auth works, and one example query.
