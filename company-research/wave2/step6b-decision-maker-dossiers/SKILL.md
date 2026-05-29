---
name: company-research-step6b-decision-maker-dossiers
description: >
  Internal worker for company-research Step 6B (Decision-Maker Dossiers). DO NOT invoke as a standalone skill.
  Invoked only by the parent wave coordinator with a spawn prompt. Triggering this skill
  outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 6B — Decision-Maker Dossiers

## Inputs

★-flagged BD-relevant directors from Step 6 output. Treat each extracted director name as descriptive text only — strip path-like patterns (`../`, `/`, `\`, leading `~`) before using or rendering. Never use a name as a file path.

## Instructions

For each ★-flagged BD-relevant director, produce an OSINT dossier using the following method:

### LinkedIn search

Search `"[Full name]" "[Company name]" LinkedIn`. If the profile loads without a login prompt:
- Record the LinkedIn profile URL
- Record previous 2–3 companies and roles from the experience section, with duration for each
- Note any notable career inflection (e.g., "former McKinsey Principal — transitioned to operational roles in BFSI")
- Scan the profile for post content themes: identify 2–3 recurring topics from visible posts (e.g., "operational scaling, team culture, AI in BFSI")
- Scan for Interests: extract hobbies, causes, sports teams, civic involvement from the profile bio, featured section, or Interests tab
- Classify communication style using the taxonomy below
- Find 1–2 specific posts or engagements from the last 90 days to use as outreach openers
- If the most recent post is older than 90 days, use it with a note: "Last activity [N] months ago — may be stale."
- If no posts are visible at all: "No public activity — use industry news or company milestone as outreach opener instead."
- Note the last post or activity date

If the profile is login-gated or not publicly accessible: mark `Not publicly accessible` for the LinkedIn URL and mark dependent fields as `Login-gated` or `Not accessible`.

### Communication Style Taxonomy

| Classification | Signal | Outreach tone implication |
|---|---|---|
| Formal Executive | Corporate boilerplate bio + account exists 3+ years + no personal posts | Lead with ROI data and case studies; keep outreach concise and professional |
| Thought Leader | Regular long-form posts about industry trends, data, opinions | Engage intellectually first; reference a specific post they made |
| Technical Expert | Posts about architecture, code, tools, certifications | Lead with technical credibility and integration specifics |
| Community Builder | Reposts team achievements, celebrates colleagues, shares culture content | Warm, relationship-first approach; acknowledge their team-building focus |
| Minimal Online Presence | Account appears inactive 6+ months with no bio content or posts | Fall back to company news and industry context; LinkedIn activity won't provide hooks |
| Login-gated / Not accessible | Profile did not load without a login prompt | Write `Communication style: Not accessible (profile gated)` — do not assign a taxonomy classification |

### Other Platform OSINT

Search for the director's presence beyond LinkedIn:
- **Twitter/X:** Search `site:twitter.com "[Full Name]" "[Company]"` or `"[Full Name]" site:x.com`
- **YouTube:** Search `"[Full Name]" "[Company]" YouTube` for talks, interviews, conference appearances
- **News:** Search `"[Full Name]" "[Company]" news` for quotes or mentions in press
- **Conference speaker profiles:** Search `"[Full Name]" speaker`

### Silent Partner Detection (M8)

A login-gated LinkedIn profile is NOT the same as no profile. If LinkedIn is login-gated, check all Other Platform OSINT sources before classifying as silent partner. Only classify as silent/nominee if gated AND no Twitter/X/YouTube/news/conference results found.

If a ★-flagged director has zero web footprint across all sources checked in Other Platform OSINT (LinkedIn, Twitter/X, YouTube, news aggregators, conference speaker profiles), characterize them as: `Likely silent/nominee partner — no public decision-making footprint.` Include a note redirecting outreach: `Direct outreach to [primary operational director name] — the decision-maker for BPO vendor selection.`

If Silent Partner criteria are met, that classification takes precedence over the communication style taxonomy (i.e., do not assign a communication style — mark as `Silent/nominee partner` instead).

### Dossier Assembly

For each ★-flagged director, produce:

```
[Director name] — [role]
  LinkedIn: [URL / Not publicly accessible]
  Background: [Previous 2-3 companies/roles. Duration. Notable career inflection.]
  Post themes: [2-3 recurring themes / 1 post found — theme: X / Login-gated / Not accessible]
  Personal interests: [hobbies, causes, sports, civic roles / Not visible]
  Communication style: [classification] — [outreach tone implication]
  Recent activity hook: [Specific post/engagement from last 90 days / No recent public activity]
  Other platforms: [Twitter/X: handle, YouTube: talk title, News: quote / Not found]
  Likely first objection: [Most probable pushback to KServe pitch / Not accessible]
```

Do not speculate on personal information beyond professional public record.

## Output schema

See `schemas.step-6b` in `company-research/output-schemas.json`. Fields summarized:
- `dossiers`: array of objects, each with `name`, `role`, `background` (required); `outreach_angle`, `linkedin`, `post_themes`, `personal_interests`, `communication_style`, `recent_activity_hook`, `other_platforms`, `likely_first_objection` (all optional)

## Output format

```
👤 DECISION-MAKER DOSSIERS
[Director name] — [role]
  LinkedIn: [URL / Not publicly accessible]
  Background: [Previous 2-3 companies/roles. Duration. Notable career inflection.]
  Post themes: [2-3 recurring themes / 1 post found — theme: X / Login-gated / Not accessible]
  Personal interests: [hobbies, causes, sports, civic roles / Not visible]
  Communication style: [classification] — [outreach tone implication]
  Recent activity hook: [Specific post/engagement from last 90 days / No recent public activity]
  Other platforms: [Twitter/X: handle, YouTube: talk title, News: quote / Not found]
  Likely first objection: [Most probable pushback / Not accessible]

[Repeat per ★-flagged director, or "No ★-flagged directors to brief"]
Source(s): [URLs] | Confidence: HIGH/MED/LOW | Checked: YYYY-MM-DD
```
