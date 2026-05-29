---
name: company-research-step8-reviews
description: >
  Internal worker for company-research Step 8 (Reviews & Reputation, sub-sections A–E).
  DO NOT invoke as a standalone skill. Invoked only by the parent wave coordinator with a spawn prompt.
  Triggering this skill outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 8 — Reviews & Reputation (Last 12 Months)

## Inputs

None.

## Instructions

Research all five sub-sections below. Each sub-section is mandatory — if no data is found for a sub-section, state that explicitly (e.g., "No product reviews found on searched platforms"). Do not silently omit any sub-section.

If less than 12 months of reviews exist for any sub-section, include older reviews and note: `⚠️ Full 12-month data unavailable; includes reviews from [date range].`

---

**A — Product Review**

Search for product-specific reviews and, if the company has a consumer app, app store reviews.

Product review sources (use platforms relevant to the company type):

| Company type | Platforms |
|---|---|
| Consumer brand / eCommerce | Amazon · Flipkart · Myntra · Google Shopping |
| SaaS / B2B software | G2 · Capterra · Software Advice |
| Finance / Insurance | consumer forums · Google Business product listings |
| General | IndiaMart · Justdial product listings |

App review sources:
1. Primary — direct search: `site:apps.apple.com [company name]` and `site:play.google.com [company name]`
2. Fallback — AppFollow.io, AppBot.co (often accessible without paywall)
3. Last resort — Reddit, Product Hunt, tech blogs

Find:
- Platform, aggregate rating, review volume
- Top recurring themes from critical reviews (1–2 stars): note the most frequent complaints, platforms, and date range
- Top recurring themes from positive reviews (4–5 stars): same format
- For apps: app name, platform (iOS / Android / Both), aggregate rating; any visible company replies on reviews — note whether they appear on positive, negative, or both review types; include one verbatim example ≤40 words
- If no app found: write `No consumer app found — app review not applicable` and document the search query used
- If app found but reviews are gated: write `App found ([name] — [rating]/5 on [platform]) but individual review content is gated`

**Sentiment trend (12-month window):** After gathering themes, assess directional trend by sorting visible reviews from oldest to newest. Classify as:
- `Improving` — negative themes decreasing, positive themes increasing over the window
- `Worsening` — opposite pattern
- `Stable` — no clear directional shift
- `Insufficient data` — fewer than 10 reviews in the 12-month window

Include in output: `Trend: [Improving / Worsening / Stable / Insufficient data] — [1-sentence observation, e.g., "Complaints about app crashes spiked in Q3 2025 and have partially subsided in Q4"]`

BD framing: what does product/app quality feedback signal about operational gaps KServe can address?

**Client-count vs. review-count discrepancy flag:** After gathering all review data, cross-reference with any client/customer count claimed in Step 2 or the company website. If the company claims 1,000+ clients but fewer than 10 total public reviews were found across ALL platforms checked (sections A-D), add a Notable signal: `⚠️ Discrepancy: [N]+ clients claimed but only [M] total public reviews found — review volume is unusually low for the stated client base.`

---

**B — Service Review**

Search for customer sentiment about how the company serves its customers — support quality, delivery, responsiveness, experience.

Sources:
- Google Business Profile, Trustpilot, Justdial, Sulekha (all company types)
- Finance / Insurance: banking ombudsman forums, consumer court portals, RBI complaint trackers
- B2B: IndiaMart seller ratings, LinkedIn client testimonials, absence of case studies as a signal

Find:
- Recurring themes in customer service feedback: response time, resolution quality, staff attitude
- Specific complaints about support channels (phone, chat, email, in-store)
- Platforms checked with review count and date range

**Sentiment trend (12-month window):** Same method as Section A — classify as Improving / Worsening / Stable / Insufficient data, with a 1-sentence observation.

BD framing: where does customer service break down? This maps directly to KServe's Customer Service offering.

---

**C — Employee Review**

Search for what employees say about working at this company — signals operational maturity, management culture, and attrition risk.

Sources:
- AmbitionBox (primary for Indian companies), Glassdoor, Indeed
- LinkedIn "Reviews" tab if available

Find:
- Overall rating on each platform, review volume
- Top 3 positives (recurring themes)
- Top 3 negatives (recurring themes) — **always read the Dislikes/Cons field verbatim.** Do not write "nothing" without checking the actual field content. If the Cons/Dislikes field exists but is empty, note "Cons field present but blank" rather than omitting.
- Any mentions of process quality, training programs, tech stack, attrition rate, management style

BD framing: high attrition or poor internal process = outsourcing appetite; strong culture = partnership-friendly decision-maker.

---

**D — General Company Review**

Search for overall public perception, business reputation, and press sentiment — the narrative that doesn't fit product or service reviews.

Sources:
- Google Business (overall company rating, not product/service-specific)
- Industry forums and discussion boards
- News and media sentiment (last 12 months)
- Justdial, IndiaMart general business listings

Find:
- Overall public reputation narrative
- Any controversies, regulatory issues, or legal disputes
- Any awards, recognitions, or positive press
- Key sentiment trend (improving / stable / declining)

BD framing: reputational context that shapes outreach tone — a company under scrutiny needs a different pitch than one riding a growth wave.

---

**E — Review Handling Methodology**

Research how the company manages and responds to reviews across all platforms found in A–D. Use what was already observed in A–D as your primary signal. Run targeted additional searches only for tool detection (job postings, BuiltWith) — do not re-research review content already gathered.

Look for evidence of:

| Signal | Where to find it |
|---|---|
| Platform-native replies | Replies visible on Google Maps, App Store, Play Store, Trustpilot, Glassdoor |
| Email-based follow-up | Company support/FAQ pages; reviewer mentions ("they emailed me after I posted") |
| Third-party review tools | Job postings: `[company] "Birdeye" OR "Yotpo" OR "Respond.io" OR "Medallia" OR "ReviewTrackers"`; BuiltWith / G2 integrations |
| Automated vs manual | Identical boilerplate across reviews = likely automated; named agent sign-off + review-specific language = manual |
| Response rate | From reviews examined: High (>60%) / Medium (20–60%) / Low (<20%) / None — always note sample size (e.g., "based on 12 reviews examined") |
| Response speed | Timestamp lag between review and reply: <24h / 1–7 days / >7 days / Inconsistent / Not determinable. **Determining speed:** Look for timestamp pairs (review date + company reply date) on the same review — often visible on Google Business, Glassdoor, and App Store. If even 3 pairs are visible, compute the average lag and assign a category. Only use "Not determinable" if timestamp pairs are not visible on ANY of 3+ platforms checked. |

Synthesize into:
- Response channel(s) used
- Response style: Personalized / Templated / Mixed / Not found
- Response rate estimate with basis
- Response speed estimate
- Tool indicators (any third-party review management tools detected)
- **BD signal**: what does this methodology reveal about the company's CS culture, and where does KServe's offering address the gap? Must be an implication, not a description ("They respond to reviews" is not BD insight).

If no responses found across any platform: `No review responses found across [list platforms checked] — no active review management program detected, or handling is off-platform (email/DM only).`

## Output schema

See `schemas.step-8` in `company-research/output-schemas.json`. Fields summarized:
- `product_review`, `service_review`, `employee_review`, `general_review`, `review_handling` — each an object per sub-section A–E with platforms, themes, trend enum, and BD signal fields

## Output format

```
⭐ REVIEWS & REPUTATION (Last 12 months)

📦 A — PRODUCT REVIEW
[If no product reviews found: "No product reviews found on searched platforms"]
[Repeat for each platform checked:] Platform — Rating — Review count — URL
Top critical themes: ...
Top positive themes: ...
Trend: [Improving / Worsening / Stable / Insufficient data (<10 reviews)] — [1-sentence observation]
App:
  [Found]: [name] | [iOS / Android / Both] | [X.X]/5 ([X,XXX] ratings)
    Sample critical: "[verbatim ≤40 words]" — [reviewer] — [YYYY-MM-DD] | [URL]
    Sample positive: "[verbatim ≤40 words]" — [reviewer] — [YYYY-MM-DD] | [URL]
    Company replies on app: Yes (on: positive / negative / both) / No / Partial
      [If Yes or Partial:] Sample company reply: "[verbatim ≤40 words]" — [YYYY-MM-DD] | [URL]
  [Gated]: "App found ([name] — [rating]/5 on [platform]) but individual review content is gated. Search query used: [query]"
  [Not found]: "No consumer app found — app review not applicable. Search query used: [query]"
Confidence: HIGH/MED/LOW | Most recent: YYYY-MM-DD

🛎️ B — SERVICE REVIEW
[If no service reviews found: "No service reviews found on searched platforms"]
[Repeat for each platform checked:] Platform — Rating — Review count — URL
Top positives: ...
Top negatives: ...
Trend: [Improving / Worsening / Stable / Insufficient data] — [1-sentence observation]
Notable signal: [e.g., "No case studies found — signals limited B2B social proof" / "N/A"]
BD signal: [what this means for KServe's Customer Service pitch]
Confidence: HIGH/MED/LOW | Most recent: YYYY-MM-DD

👥 C — EMPLOYEE REVIEW
[If no employee reviews found: "No employee reviews found on searched platforms"]
[Repeat for each platform checked:] Platform — Rating — Review count — URL
Top positives: ...
Top negatives: ...
BD signal: [attrition / culture signal for outreach approach]
Confidence: HIGH/MED/LOW | Most recent: YYYY-MM-DD

🌐 D — GENERAL COMPANY REVIEW
[If no general reviews found: "No general company reviews found on searched platforms"]
[Repeat for each platform checked:] Platform — Rating — URL
Overall reputation narrative: ...
Notable: [awards / controversies / press sentiment]
BD signal: [outreach tone implication — e.g., "regulatory scrutiny: open with credibility" / "growth wave: lead with scale support"]
Confidence: HIGH/MED/LOW | Most recent: YYYY-MM-DD

🔄 E — REVIEW HANDLING METHODOLOGY
Response channel(s): [e.g., Google Maps native · App Store native / Not found]
Response style: Personalized / Templated / Mixed / Not found
Response rate: High (>60%) / Medium (20–60%) / Low (<20%) / None [sample: X reviews examined]
Response speed: <24h / 1–7 days / >7 days / Inconsistent / Not determinable
Tool indicators: [e.g., "Job posting cites Birdeye" / "None detected"]
BD signal: [1–2 sentences: CS culture implication and KServe opportunity]
Source(s): [URL] | Confidence: HIGH/MED/LOW | Source date: YYYY-MM-DD
```
