---
name: company-research-step5-years
description: >
  Internal worker for company-research Step 5 (Years in Existence). DO NOT invoke as a standalone skill.
  Invoked only by the parent wave coordinator with a spawn prompt. Triggering this skill
  outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 5 — Years in Existence

## Inputs

None.

## Instructions

Find the incorporation / founding year. Calculate age from today.

For Indian-registered companies, additionally collect:
- **CIN** (Corporate Identification Number)
- **ROC** (Registrar of Companies jurisdiction, e.g., ROC Mumbai, ROC Delhi)
- **Company type** (e.g., Private Limited, Public Limited, Limited Liability Partnership, Section 8)

If CIN is not found, note "CIN not publicly available" rather than omitting the field.

## Output schema

See `schemas.step-5` in `company-research/output-schemas.json`. Fields summarized:
- `years_in_existence`: integer years since founding (nullable)
- `founded_year`: integer founding year (nullable)
- `cin`: Corporate Identification Number (nullable, Indian companies)
- `roc`: Registrar of Companies jurisdiction (nullable, Indian companies)
- `company_type`: Private Limited, Public Limited, LLP, etc. (nullable, Indian companies)

## Output format

```
📅 YEARS IN EXISTENCE
Founded XXXX | X years old
CIN: [CIN / Not publicly available] | ROC: [Jurisdiction] | Type: [Company type]
Source(s): [URL] | Confidence: HIGH/MED/LOW | Source date: YYYY-MM-DD
```
