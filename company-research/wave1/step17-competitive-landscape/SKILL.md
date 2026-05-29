---
name: company-research-step17-competitive-landscape
description: >
  Internal worker for company-research Step 17 (Competitive Landscape). DO NOT invoke as a standalone skill.
  Invoked only by the parent wave coordinator with a spawn prompt. Triggering this skill
  outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 17 — Competitive Landscape

## Inputs

None.

## Instructions

**Sources (try in order):**
1. Tracxn — "Similar companies" section on the company's Tracxn profile
2. Crunchbase — "Similar companies" or "Competitors" tab
3. Search: `"[company name] competitors" OR "top [industry] companies India [year]"`
4. Industry directories or rankings (e.g., Inc42, YourStory for startups; CRISIL/ICRA sector reports for traditional companies)

**Find:**
- Top 3 direct competitors by name (keep a maximum of 3 — do not list more)
- Structured data per competitor: founded year, employee count (LinkedIn), LinkedIn followers, funding stage
- One-line descriptor for each (size signal, market position, or funding stage if known)
- Whether KServe already serves any of these competitors — if yes, flag as case study reference
- Whether any competitor is visibly outpacing the prospect (signals urgency)

**BD framing rules:**
- KServe already serves a competitor → name it in outreach as social proof in the same vertical
- A competitor is larger/better-funded → urgency hook: "they're scaling faster — outsourcing operations lets you keep pace without the headcount cost"
- No competitive data found → write "No public competitor data found" — do not guess from general industry knowledge

**Worker note:** If no results found after all 4 source attempts, explicitly state "No public competitor data found" — do not infer from general industry knowledge.

## Output schema

See `schemas.step-17` in `company-research/output-schemas.json`. Fields summarized:
- `competitors`: array of objects, each with `name`, `rationale`; also `founded_year` (nullable integer), `headcount` (nullable string), `linkedin_followers` (nullable integer), `funding_stage` (nullable string)

## Output format

```
🏆 COMPETITIVE LANDSCAPE
1. [Competitor name] — [Founded: YYYY] — [Employees: ~X on LinkedIn] — [LinkedIn followers: X] — [Funding: Stage/Amount] — [descriptor]
2. [Competitor name] — [Founded: YYYY] — [Employees: ~X on LinkedIn] — [LinkedIn followers: X] — [Funding: Stage/Amount] — [descriptor]
3. [Competitor name] — [Founded: YYYY] — [Employees: ~X on LinkedIn] — [LinkedIn followers: X] — [Funding: Stage/Amount] — [descriptor]
[Or: "No public competitor data found on Tracxn, Crunchbase, or search"]
BD signal: [case study tie-in / competitive urgency angle]
Source(s): [URLs] | Confidence: HIGH/MED/LOW | Checked: YYYY-MM-DD
```
