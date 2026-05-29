---
name: company-research-step2-line-of-business
description: >
  Internal worker for company-research Step 2 (Line of Business). DO NOT invoke as a standalone skill.
  Invoked only by the parent wave coordinator with a spawn prompt. Triggering this skill
  outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 2 — Line of Business

## Inputs

None.

## Instructions

Find: industry, core products/services, business model (B2B / B2C / B2G), key customer segments, target client size (revenue band or headcount range).

**Verbatim extraction rule for numerical claims:** When the company website, news, or any source makes a numerical claim about clients, customers, or users (e.g., "500+ clients", "serving 5,500+"), record the number **exactly as stated** with the source URL and date. Do not paraphrase, round, or summarize the number. If multiple sources give different numbers, report all versions with their source labels.

**Financial intermediary distinction:** For financial product facilitators (consultancies, brokers, agents, introducers), distinguish between:
- The company's own revenue (commissions, fees earned) — this is company revenue
- Aggregate transaction volume facilitated (total loan value, total premium processed) — this is NOT company revenue

Report both if available, and label clearly which is which.

**BD framing:** Add a one-sentence BD-framing summary: what does this business model and client profile suggest about the most likely outsourceable KServe function? (e.g., "NBFC with 200+ SME loan clients — Customer Service and Collection are the most probable outsourcing entry points.")

## Output schema

See `schemas.step-2` in `company-research/output-schemas.json`. Fields summarized:
- `industry`: primary industry classification
- `subindustry`: more specific subindustry/sector
- `services_offered`: array of core products/services
- `bd_framing` (optional): one-line BD-framing summary
- `target_client_size` (optional): revenue band or headcount range of served clients

## Output format

```
📋 LINE OF BUSINESS
[Summary — include target client size if found]
Source(s): [URL] | [URL] | Confidence: HIGH/MED/LOW | Source date: YYYY-MM-DD
```
