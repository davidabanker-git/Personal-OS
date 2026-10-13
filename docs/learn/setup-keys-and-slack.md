# Finish setup: keys and the Slack app (about 10 minutes, phone OK)

Everything else is built and deployed. These steps need you because they involve credentials.

## 1. Supabase secrets

Supabase dashboard → project `personal-os` → **Edge Functions → Secrets** → add:

| Name | Value |
|---|---|
| `OPENROUTER_API_KEY` | openrouter.ai → Keys |
| `MCP_ACCESS_KEY` | A long random string (iPhone Passwords app → generate). Save it there too. |
| `TYPESAFE_API_KEY` | Your Jev key |
| `SLACK_BOT_TOKEN` | From step 2 (starts with `xoxb-`) |
| `SLACK_SIGNING_SECRET` | From step 2 (Basic Information → Signing Secret) |

## 2. Slack app (api.slack.com/apps)

1. **Create New App → From scratch**, name it "Open Brain", and pick your workspace.
2. **OAuth & Permissions → Bot Token Scopes:** `channels:history`, `groups:history`, `chat:write`. Then **Install to Workspace**, and copy the bot token.
3. **Basic Information:** copy the **Signing Secret**.
4. Add both to Supabase (step 1) *before* the next step.
5. **Event Subscriptions** → on. Set the Request URL to
   `https://omotqffpafzzmwhezgki.supabase.co/functions/v1/slack-capture`
   and wait for "Verified". Subscribe to bot events `message.channels` and `message.groups`, then Save.
6. In Slack, type `/invite @Open Brain` in both `#personal` and `#keystone`.

**Test:** post "Test: call Jane about the Keystone proposal" in `#keystone`. You should get a threaded "Captured as task…" reply within about 10 seconds.

## 3. Connect Claude and ChatGPT to the Brain

Your connector URL is
`https://omotqffpafzzmwhezgki.supabase.co/functions/v1/open-brain-mcp?key=<your MCP_ACCESS_KEY>`

- **Claude:** Settings → Connectors → Add custom connector → paste the URL.
- **ChatGPT:** Settings → Connectors (developer mode) → Add → paste the URL.

**Two-tool test:** in Claude, say "save to my brain: two-tool test". In ChatGPT, ask "search my brain for two-tool test".

## How it works

- Slack signs every message it sends. The capture function rejects anything without a valid signature.
- The connector URL's key is the password for your memory. Anyone holding that URL can read and write it, so keep it private.
