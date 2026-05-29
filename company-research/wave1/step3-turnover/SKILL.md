---
name: company-research-step3-turnover
description: >
  Internal worker for company-research Step 3 (Turnover). DO NOT invoke as a standalone skill.
  Invoked only by the parent wave coordinator with a spawn prompt. Triggering this skill
  outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 3 — Turnover (₹ Crores)

## Inputs

None.

## Instructions

Find annual revenue/turnover in Indian Rupees (Crores). The **most recent financial year** is mandatory — always report it. Then attempt to retrieve the **2 prior financial years** (i.e., the last 3 financial years total) for trend context.

For Indian-registered companies: use MCA annual filings → Tofler/Zauba → news.
For non-Indian companies or Indian subsidiaries of foreign entities: report in original currency, convert to INR at filing-date exchange rate, and note in report: `Revenue in [currency]; converted to INR at [rate] as of [date].`
If a prior year is not publicly available: write `[FY label]: Not available` for that year.
If the latest year is unavailable: write "Private company — turnover not publicly disclosed." and omit the trend section.

**Trend classification (requires at least 2 years of data):**
- `Growing` — revenue higher each year than the prior year
- `Declining` — revenue lower each year than the prior year
- `Mixed` — revenue fluctuated across years (requires all 3 years present; cannot be assigned with only 2 years)
- `Insufficient data` — only 1 year available; trend cannot be determined

**BD framing:**
- Growing trend → company is expanding; pitch capacity and speed ("we scale with you")
- Declining trend → cost pressure is real; lead with cost-per-transaction vs. in-house
- Mixed trend → probe for context (acquisition year, market disruption); don't lead with growth assumptions

**Financial intermediary distinction:** For consultancies, brokers, agents, and introducers: aggregate transaction volume facilitated (total loan value, total premium processed) is NOT the company's revenue. The company's revenue is its commissions, fees, and service charges earned on those transactions. If the source reports transaction volume rather than revenue, label it clearly: `Note: This is aggregate transaction volume facilitated, not company revenue. Company revenue is a fraction of this figure (commissions/fees earned).`

## Output schema

See `schemas.step-3` in `company-research/output-schemas.json`. Fields summarized:
- `turnover_inr_crores`: most recent FY turnover in INR Crores (nullable)
- `year`: most recent FY year (nullable)
- `source_type`: `audited` | `estimated` | `reported` | `unknown`
- `currency_original` (optional): original currency if non-INR

## Output format

```
💰 TURNOVER
[Most recent FY]: ₹[X] Cr | [Prior FY]: ₹[X] Cr | [FY before that]: ₹[X] Cr (or "Not available")
Trend: Growing / Declining / Mixed / Insufficient data
BD signal: [growth → scale pitch / decline → cost-reduction pitch / mixed → probe before assuming]
Source(s): [URL] | Confidence: HIGH/MED/LOW | Source date: YYYY-MM-DD
```
