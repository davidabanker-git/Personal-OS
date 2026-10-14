# How the morning brief works

**What:** every weekday at about 3:50 am Central, a fresh cloud session runs the `morning-brief` skill and posts one message to Slack `#personal`. It's ready before I wake at about 4:15.

**Data flow:**
1. A scheduled task starts a new Claude Code session on this repo, with the Calendar, Gmail, Linear and Slack connectors.
2. The session reads today's calendar, recent email that needs me, open Linear issues, and this repo's priorities and action items.
3. It ranks a Top 3 with my own rule: live deals and people waiting on me, then outreach, then building.
4. It posts one short message. It changes nothing else (L1: suggest).

**Why the Brain doesn't save the brief:** the Slack capture function skips messages that start with `Morning brief`, `Evening reflection` or `Weekly review`. Those are the OS talking, not me capturing.

**To change it:** edit `.claude/skills/morning-brief/SKILL.md`, or just tell the assistant what to change.

**Teach it in one line:** a scheduled agent reads my sources, applies my priority rule, and hands me one decision-ready list before I'm up.
