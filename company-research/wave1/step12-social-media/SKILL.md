---
name: company-research-step12-social-media
description: >
  Internal worker for company-research Step 12 (Social Media Followers). DO NOT invoke as a standalone skill.
  Invoked only by the parent wave coordinator with a spawn prompt. Triggering this skill
  outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 12 — Social Media Followers

## Inputs

None.

## Instructions

Pull current follower counts: LinkedIn · Instagram · Facebook · Twitter/X · YouTube. Always check YouTube — do not skip even if the company seems non-media. Check WhatsApp Business presence (note: WhatsApp Business channel detected / Not detected).

Engagement signal (check the main platform — LinkedIn for B2B, Instagram for B2C):
- Review last 5–10 posts on the primary platform.
- Calculate observed engagement rate: (total likes + comments on sampled posts) ÷ (posts sampled × follower count).
- Apply platform-calibrated thresholds:

| Platform | Low engagement flag |
|---|---|
| LinkedIn (company page) | < 0.5% |
| Instagram | < 1.5% |
| Facebook | < 0.5% |
| Twitter/X | < 0.3% |

- Flag low engagement as: `Low engagement — [platform]: [engagement rate]% (based on [N] posts sampled)`
- Flag if posting frequency is < 2×/month across all active platforms.
- If follower count is below 1,000 on all platforms: write `Low follower base (< 1,000 on all platforms) — engagement rate not meaningful; flag as early-stage social presence.`
- Note sample size: `Engagement rate calculated on [N] posts as of [date]`

## Output schema

See `schemas.step-12` in `company-research/output-schemas.json`. Fields summarized:
- `social_media`: array of objects, each with `platform`, `url` (required); `followers` (nullable integer)

## Output format

```
📱 SOCIAL MEDIA FOLLOWERS
LinkedIn: X | Instagram: X | Facebook: X | Twitter/X: X | YouTube: X | WhatsApp Business: [Detected / Not detected]
Source(s): [URLs] | Confidence: HIGH/MED/LOW | Checked: YYYY-MM-DD
```
