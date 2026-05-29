---
name: company-research-step11-customer-care
description: >
  Internal worker for company-research Step 11 (Customer Care Number). DO NOT invoke as a standalone skill.
  Invoked only by the parent wave coordinator with a spawn prompt. Triggering this skill
  outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 11 — Customer Care Number

## Inputs

None.

## Instructions

Find all publicly listed customer support channels:
- Phone number(s) — support / helpline
- Email address(es) — support email
- Contact form URL
- WhatsApp Business number (search for WhatsApp click-to-chat links on website, or search `"[company name] WhatsApp"`)
- Support hours (if published)

BD insight: presence of a published number signals a formal support structure. Absence may indicate underdeveloped customer ops — a potential KServe entry point. If no number is found, note in report: "No published support number found." WhatsApp Business presence is a strong signal for AI Chatbot fit (Step 10).

## Output schema

See `schemas.step-11` in `company-research/output-schemas.json`. Fields summarized:
- `customer_care_number` (nullable string), `support_email` (nullable string), `support_hours` (nullable string), `whatsapp_business` (nullable string), `contact_form_url` (nullable string)

## Output format

```
📞 CUSTOMER CARE NUMBER
Phone: [Number(s) or "Not published"] | Email: [Email or "Not published"] | WhatsApp Business: [Number or "Not detected"] | Contact form: [URL or "Not found"] | Support hours: [Hours or "Not published"]
Source(s): [URL] | Confidence: HIGH/MED/LOW | Source date: YYYY-MM-DD
```
