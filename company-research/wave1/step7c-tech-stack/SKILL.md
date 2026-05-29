---
name: company-research-step7c-tech-stack
description: >
  Internal worker for company-research Step 7C (Technology Stack). DO NOT invoke as a standalone skill.
  Invoked only by the parent wave coordinator with a spawn prompt. Triggering this skill
  outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 7C — Technology Stack

## Inputs

None.

## Instructions

Search for what technology tools the company uses — reveals digital maturity, existing vendor relationships, and integration opportunities for KServe.

**Sources (try in order):**
1. **Website HTML source inspection (primary):** Load the company's website and inspect raw HTML source. Search for: gtag.js (Google Analytics), GTM container IDs (Google Tag Manager), Meta Pixel, Microsoft Clarity, Hotjar, and any embedded chat widget scripts. Record all detected tags with their source lines.
2. BuiltWith (builtwith.com) — enter company domain
3. Wappalyzer (wappalyzer.com) — enter company domain
4. Job postings: look for technology mentions in JD requirements (e.g., "experience with Salesforce CRM," "proficient in Zendesk")
5. Company website footer: check for cookie/analytics vendor tags, embedded chat widget vendor logos

**Find:**
- CRM in use (Salesforce, HubSpot, Zoho, LeadSquared, etc.) — KServe can operate within these
- Customer support tool (Zendesk, Freshdesk, Intercom, etc.) — KServe's CS team plugs in without migration
- Review management tool (cross-reference Step 8E findings)
- Marketing automation platform (signals marketing team maturity and data readiness)

**BD framing:** For each tool found: `[Tool] detected — KServe integrates natively with this stack; no migration required.`

**If no tech stack data accessible:** Write `Tech stack not publicly detectable via BuiltWith, Wappalyzer, or job postings as of [date].`

## Output schema

See `schemas.step-7c` in `company-research/output-schemas.json`. Fields summarized:
- `crm`, `support_tool`, `review_tool`, `marketing_automation` (all nullable strings)

## Output format

```
🛠️ TECHNOLOGY STACK
CRM: [Tool / Not detected] | Support tool: [Tool / Not detected] | Review tool: [Tool / Not detected (see 8E)]
Marketing automation: [Tool / Not detected]
BD framing: [integration angle]
Source(s): [URLs] | Confidence: HIGH/MED/LOW | Checked: YYYY-MM-DD
```
