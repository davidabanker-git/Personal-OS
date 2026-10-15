---
name: morning-brief
description: Build David's weekday morning brief (one prioritized list with the next best action, today's calendar, what's waiting on him, the next Keystone build item, habits) and post it to Slack #personal. Runs as a scheduled task at about 3:50 am Central; also use when David says "run my morning brief" or "what's my day".
---

# morning-brief

It replaces David's 30–60 minute planning sweep. He reads it on his phone at about 4:15 and should know his next move within a minute.

**Autonomy: L1 (suggest).** Read everything; change nothing. The only write is one Slack post to `#personal`, which David approved (`decisions/log.md`, 2026-10-14). Don't send email, edit the calendar, change Linear, or post anywhere else.

## 1. Gather (read-only; skip any source that fails)

All times are America/Chicago. "Today" is the date in Central time.

| Source | Pull |
|---|---|
| Google Calendar | Today's events on the primary calendar, tomorrow before 9:00, and the **next 7 days** for anything that needs prep (interviews, client or prospect calls, deadlines). |
| Gmail | `in:inbox newer_than:3d -from:me -category:promotions -category:social -category:updates -category:forums`. Keep threads where the last message isn't from David and someone asks him something or is waiting on him. Also catch **commitments in email that aren't on the calendar** (for example, "let's prep Thursday at 4:30"). Skip newsletters, receipts, security alerts and automated mail. |
| Linear (team `DAV`) | Open issues (not Done or Canceled) that are due within 2 days, are Urgent or High priority, or carry a `needs-me` label. |
| Open Brain connector (if connected) | Captures from the last 24 hours with type `task`, any CRM follow-ups due today or overdue, and last night's `Overnight results · <date>` thought. If the connector isn't there, skip it silently. |
| This repo | `context/priorities.md` (habits, Keystone build queue), `context/how-i-work.md` (§2, priority rule), and `docs/handoff.md` (David's open action items). |

## 2. Decide the Top 3

Rank candidates with David's rule (`context/how-i-work.md` §2), in this order:

1. Live deals, and anyone waiting on him (lead emails, David Lai, Austin Linney, Tommy Flynn).
2. Outreach to his short list.
3. Building: GTM workflows and this OS. Take at most one OS setup step from `docs/handoff.md` (the first open action item).

Then:
- **Fit the day.** Mon and Fri are work-from-home days with the most flexibility. Other weekdays are office days: there's a 75-minute drive home and no laptop work after. Mark each item `laptop` or `phone`, and put laptop items in the early-morning block.
- **Make each item concrete:** a verb, the person or thing, and the first step. "Reply to Tommy about the Algonquin intro" beats "Follow up with Tommy."
- **Call out the scary one.** If something has been deferred before, or is the daunting task (short-list outreach, building automations), say so in one plain phrase and give the smallest first step.

## 3. Write it (standard markdown, at most about 18 lines)

The first line must start with `Morning brief`. The capture function uses it to skip OS posts.

```
Morning brief · Wed, Oct 15 · Office day

**Top 3**
1. <Verb + who/what + first step> · laptop, ~30m
2. …
3. …

**Today**
• 9:00 Ensemble standup (30m)
• 12:30 Call with Austin Linney
_Open for Keystone: 4:30–7:00_

**Waiting on you**
• Tommy Flynn: asked for a time to talk (email, 2 days)
• DAV-12 Draft outreach list (due today)

**Overnight**
• 3 short-list contacts researched; openers in Gmail drafts

**Look ahead**
• Fri 3:00 interview: block 30 min of prep tomorrow morning

**Keystone queue:** next is `process-map`. When do you want to build it?

**Habits:** workout · meditate · reflection at 5:00
```

Rules:
- Leave out any empty section. Three bullets at most per section.
- **Look ahead** flags only events in the next 7 days that need prep, each with a concrete prep step and when to do it. Skip routine meetings.
- Plain words. Don't show the machinery (no tool names, queries or counts).
- Keep calendar titles short. Day-job meetings show as a title and a time only.
- If a source failed, add one last line: `_Couldn't reach <Gmail>._`
- Never quote anything that looks like a password, key, code or account number, even from David's own notes.
- Personal details stay fine here (`#personal` is private). Day-job details stay at title-and-time level.
- Always include the Keystone queue line: the first item in `context/priorities.md` → Keystone build queue whose skill folder (`.claude/skills/<name>/`) doesn't exist yet. One line, once per brief.

## 4. Post

Send it to Slack `#personal` (channel ID `C0C8Y3YFH8U`) as one message. If the post fails, stop. Don't retry in a loop, and don't post anywhere else.

## Later (not in v1)

- Log a `brief_sent` event to the Brain once the Open Brain connector has a write path for events.
- Save opportunities as structured records for the Phase 5c dashboard.
