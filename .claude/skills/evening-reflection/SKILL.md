---
name: evening-reflection
description: David's weekday evening reflection, in two modes. "prompt" (about 5 pm) posts a short check-in to Slack #personal: how today's Top 3 went, one friction with evidence and a fix, and a numbered overnight queue to approve. "process" (about 8:45 pm) reads his thread reply, saves the reflection to the Brain, and runs the approved overnight items at draft/research level. Also use when David says "do my reflection" or "reflect on today".
---

# evening-reflection

David's past systems died from friction. This is the daily loop that catches it: a two-minute check-in he answers by voice or text, then agents work while he sleeps. The tone is a supportive coach, never a scold.

**Autonomy:** prompt = L1 (one Slack post). Process = L2 (research and drafts only). Never send email or messages, accept invites, spend money, or act in David's name. Quiet hours start at 6:30 pm: **process mode posts nothing to Slack.**

Times are America/Chicago. Slack `#personal` is channel `C0C8Y3YFH8U`.

---

## Mode: prompt (about 5:00 pm weekdays)

### 1. Gather (read-only; skip any source that fails)

| Source | Pull |
|---|---|
| Slack `#personal` | This morning's message starting `Morning brief` (its Top 3). Also the last 5 weekdays of `Morning brief` and `Evening reflection` posts and their thread replies, for repeat patterns. |
| Gmail | `from:me newer_than:1d` (what he actually sent), plus new threads waiting on him. |
| Google Calendar | Today's events (did they happen?) and the next 7 days (anything that needs prep). |
| Linear (team `DAV`) | Issues changed today. |
| Open Brain | Captures from today, and `reflection` thoughts from the last 7 days (rating trend, friction already named). |

### 2. Decide

- **Top 3 status:** for each item in this morning's brief, mark it done, partly done, or not started, using evidence. If you can't tell, say "not sure" and let him answer; never guess.
- **One friction, with evidence.** Use AGENTS.md → Friction watch signals (deferred twice or more, skipped habit, unanswered prompt, abandoned step). Name the evidence plainly ("short list slipped Wed and Thu"). Suggest a likely root cause (unclear next step, scary task, energy timing, perfectionism) and **one** fix: simplify, automate, drop or move. Prefer a fix agents can do tonight.
- **Overnight queue: 1 to 3 items** agents can do tonight at draft or research level, chosen to unblock tomorrow's Top 3 (research contacts, draft openers, prep notes for an upcoming meeting, summarize a thread). Each item is one line.

### 3. Write (standard markdown, at most about 14 lines)

The first line must start with `Evening reflection`. Slack capture uses it to skip OS posts.

```
Evening reflection · Thu, Oct 15

**Today:** David Lai ✓ · Open Brain ✓ · Short list: not started
**Friction:** the short list slipped again (Wed, Thu). Likely an unclear first step.
Fix: I'll research 3 names tonight so you only have to pick.

**Overnight queue** (reply with numbers):
1. Research 3 short-list contacts and draft openers
2. Prep notes for Friday's 3:00 interview

**How did today go?** A number from 1–5 and one line. Voice is fine.
```

Rules: plain words, no machinery, and nothing that looks like a password or code. Personal details are fine (private channel). Day-job items stay at title level.

### 4. Post

One message to `#personal`. If the post fails, stop.

---

## Mode: process (about 8:45 pm weekdays, silent)

### 1. Read the reply

Find today's `Evening reflection` post in `#personal` and read its thread. David's replies hold some of: a rating (1–5), a few words on the day, and approved queue numbers ("do 1 and 3", "all", "none").

- **No reply:** save one Brain thought, `Reflection skipped · <date>` (an unanswered prompt is a friction signal), run nothing, and stop.

### 2. Save the reflection

Save one Brain thought with Open Brain `capture_thought`:

```
Reflection · <date> · rating <n>/5
Day: <his words, lightly cleaned>
Top 3: <statuses>
Friction: <what was named> → fix: <fix> (accepted / declined / no answer)
Overnight: approved <numbers>
```

Over time these records show where he gets stuck, what he does well, and what he enjoys or avoids. Keep his words; don't editorialize.

### 3. Run the approved overnight items

- Do only what he approved, and keep it to research and drafts. Email drafts go into Gmail **as drafts**. Never send.
- Time-box each item to about 10 minutes of work. If one needs a decision from him, stop and write down the question instead.
- Save the results as one Brain thought starting `Overnight results · <date>`: one or two lines per item, saying what was done, where it is (Gmail draft, Brain, link), and what he needs to decide. The morning brief picks this up.

### 4. Don't post

No Slack messages in process mode. The results surface in the 3:47 am morning brief.

---

## Later (not in v1)

- Root-cause suggestions that cite David's own Obsidian notes (needs the vault synced; wiki track).
- A spoken version through Claude voice mode for the drive home.
- Friction events in the event log, for the weekly review (needs an events write path).
