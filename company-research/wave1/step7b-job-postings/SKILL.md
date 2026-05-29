---
name: company-research-step7b-job-postings
description: >
  Internal worker for company-research Step 7B (Job Postings & Workforce Signals). DO NOT invoke
  as a standalone skill. Invoked only by the parent wave coordinator with a spawn prompt.
  Triggering this skill outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 7B — Job Postings & Workforce Signals

## Inputs

None.

## Instructions

Search for active job postings to reveal what functions the company is actively trying to fill — a direct signal of where they have resource gaps KServe can address.

**Sources (try in order):**
1. `site:naukri.com "[company name]"` — primary for Indian companies
2. LinkedIn Jobs: `"[company name]"` filter by India
3. Indeed India · Company careers page

**Find:**
- Approximate number of open roles (not exact — a range is fine, e.g., "15–20 open roles")
- Top 3 functions with the most open roles (e.g., "Customer Support: 12, Back-Office: 5, Collections: 4")
- Keywords in JDs that signal outsourcing pain: "manage high volume," "handle escalations," "coordinate with outsourcing vendor," "work with BPO partner," "process-driven," "high-throughput"
- Attrition signals in JDs — flag separately from outsourcing pain: "replacement hire," "immediate joiners," "notice period buyout," "backfill," "high-volume hiring" (for the same role type repeatedly posted), "we are continuously hiring"
- Roles that directly match KServe's services: Customer Service agents, Collections executives, Lead Generation reps, Data Entry / Back-Office Processing staff, Market Research analysts
- Attrition signal: are any open roles in functions KServe serves phrased as replacement hires or immediate-joiner urgency? If yes, flag the function and the keyword found.

**BD framing:** List 2–3 open roles most directly relevant to KServe's services:
Format: `[Role title] — [KServe service match] — [approximate count or "multiple"]`
Then: 1-sentence BD signal — what does this hiring pattern imply about the company's current resourcing pressure?
- High attrition in a KServe-relevant function (flagged by replacement / immediate-joiner language) → strongest outsourcing trigger: the company is losing productivity every hiring cycle; outsourcing removes the attrition cost entirely. Lead with: "We've helped companies in [industry] eliminate recurring backfill cost in [function] by transitioning to a managed-ops model."

**If no public job postings found:** Search archived listings on LinkedIn, Naukri, and Indeed for the last 12–24 months. Report the most recent role types per function area as in-house function signals (e.g., "Last known hiring: Customer Support roles posted on Naukri in Q3 2025; Back-Office roles on LinkedIn in Q2 2025"). If no archived listings found either: Write `No active or archived job postings found on Naukri, LinkedIn Jobs, or Indeed India as of [date]. Company may not be publicly recruiting, or postings may be behind a login wall.`

**Employee Headcount & Growth Trend:**
Search LinkedIn company page for current employee count and any displayed growth percentage. Cross-reference with Crunchbase employee range.

**Sources:**
1. LinkedIn company page — employee count + displayed growth % (e.g., "+18% in 2 years")
2. Crunchbase — employee range as cross-reference

**Find:**
- Current LinkedIn employee count (or band if only a range is shown)
- Displayed growth % if LinkedIn surfaces it
- Directional classification: `Growing` / `Stable` / `Shrinking` / `Insufficient data`
- Correlation with job postings: high posting volume + growing headcount = scaling pain; few/no postings + flat/declining headcount = cost-cutting mode

**BD framing:**
- Scaling → outsourcing appetite; pitch capacity and speed
- Hiring freeze / shrinking → cost-conscious; lead with cost-per-transaction vs. in-house

## Output schema

See `schemas.step-7b` in `company-research/output-schemas.json`. Fields summarized:
- `open_roles_count`, `top_functions`, `kserve_relevant_roles`, `attrition_signal`, `headcount`, `headcount_trend`

## Output format

```
💼 JOB POSTINGS & WORKFORCE SIGNALS
Open roles: ~[N] | Top functions: [e.g., Customer Support: 12, Back-Office: 5, Collections: 4]
KServe-relevant openings:
  [Role title] — [KServe service match] — [count]
BD signal: [what this hiring pattern implies about resourcing pressure]
LinkedIn Headcount: ~X employees [as of YYYY-MM-DD]
Trend: Growing / Stable / Shrinking / Insufficient data
Basis: [e.g., "+18% per LinkedIn over 2 years; corroborated by 23 open roles on Naukri"]
Headcount signal: [scaling pain → outsourcing appetite / freeze → cost-conscious pitch, lead with ROI]
Attrition signal: [High — [function] JDs show replacement/immediate-joiner language / None detected / Insufficient data]
Source(s): [URLs] | Confidence: HIGH/MED/LOW | Checked: YYYY-MM-DD
```
