---
name: company-research-step14-ma-funding-legal
description: >
  Internal worker for company-research Step 14 (M&A, Funding, Legal Risk & Key Partnerships).
  DO NOT invoke as a standalone skill. Invoked only by the parent wave coordinator with a spawn prompt.
  Triggering this skill outside that context will produce an incomplete report.
---

**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.

# Step 14 — M&A, Funding, Legal Risk & Key Partnerships

## Inputs

None.

## Instructions

Search for any recent (last 12 months preferred): acquisitions · being acquired · mergers · major investment rounds · PE/VC backing changes.

**Additional searches:**
- **Government contracts (mandatory for ALL company types):** Search gem.gov.in by: (1) registered company name, (2) CIN from Step 5 if available. Note which method returned the result. Report if they are an active GeM (Government e-Marketplace) supplier. This check is mandatory for every company regardless of type. Never write "Not checked" or omit this search. If no results found on GeM, write `GeM supplier: Not found on gem.gov.in.` This signals compliance maturity, longer procurement timelines, and that the company operates in regulated environments. BD implication: open with compliance and documentation-quality credentials.
- **PE ownership depth:** If Tracxn or Crunchbase shows PE backing, search for the PE firm's portfolio page. Note: PE firm name · stake held (majority/minority/not specified) · fund vintage year. **Fund vintage BD signal:** A PE fund 6+ years into a typical 10-year cycle is approaching exit horizon — cost reduction programs are usually underway; outsourcing is a direct lever.

BD signals:
- Being acquired → may freeze vendor decisions (note in report)
- Fresh funding raised → likely expanding, open to outsourcing (highlight as trigger signal for Step 15)
- GeM supplier → compliance-driven, longer sales cycle, pitch with documentation accuracy and audit trails
- Late-stage PE backing → cost reduction is a stated goal; lead with cost-per-transaction vs. in-house comparison

**Regulatory & Legal Risk:**

**Sources (try in order):**
1. MCA filing status — check if annual returns / AOC-4 are overdue via Tofler or Zauba Corp. **MCA filing date field:** Always report the last annual return filing date (Form MGT-7) only. Do not use balance sheet date, AOC-4 date, or incorporation date. If MGT-7 date is not available, note which field was used instead.
2. News search: `"[company name]" "legal notice" OR "court case" OR "SEBI" OR "RBI" OR "regulatory action"`
3. Consumer court portals: consumerforum.in, National Consumer Helpline database
4. SEBI enforcement orders: sebi.gov.in; RBI press releases: rbi.org.in

**Find:**
- MCA compliance status: filings current, overdue, or struck-off risk
- Consumer court cases filed against the company (count + nature if visible)
- SEBI or RBI enforcement notices
- Any other material litigation in public record

**BD framing rules:**
- Compliance gaps / court cases → urgency trigger + pitch KServe's documentation accuracy and audit-trail credentials
- Clean record → reliability framing ("you're compliance-conscious — so is KServe")
- SEBI/RBI action → high-distress signal; approach carefully, but outsourcing cost reduction is directly relevant

**Key Partnerships & Integrations:**
Covers business-level strategic alliances and distribution tie-ups. Technology vendor relationships (CRM, support tools) belong in Step 7C — do not duplicate them here.

**Client logos vs. strategic partners distinction:** When reviewing "Trusted By" / "Our Partners" logo grids on the company website, explicitly categorize each entry:
- **Client logos** — companies shown as customers/clients (logos without a formal partnership description)
- **Strategic partners** — companies with formal alliance descriptions (distribution tie-ups, co-marketing, integration partnerships, reseller agreements)

Do not assume a logo grid represents strategic partnerships. Label each entry clearly. If the page blurs the distinction, note: `Logo grid found but partnership vs. client distinction is unclear from page context.`

**Sources (try in order):**
1. Company website — Partners, Integrations, or Ecosystem page
2. Press releases: `"[company name]" "partnership" OR "alliance" OR "tie-up" OR "integration"`
3. LinkedIn company updates (last 12 months)
4. Tracxn / Crunchbase partnerships section

**Find:**
- Named strategic partners (distribution alliances, co-marketing, formal tie-ups)
- Business-level integrations beyond tech tools (e.g., "official partner of HDFC Bank," "distribution tie-up with BigBasket")
- Direction signal: what does the partner ecosystem reveal about where the company is heading?

**BD framing:** A company actively building a partner network is culturally open to new vendor relationships. Named partners can serve as warm referral angles if KServe already works with them.

## Output schema

See `schemas.step-14` in `company-research/output-schemas.json`. Fields summarized:
- `events`: array of objects, each with `category` (enum: m&a / funding / legal / partnership), `summary`, `date`

## Output format

```
🔀 M&A, FUNDING, LEGAL RISK & KEY PARTNERSHIPS
[Summary of recent M&A/funding or "No recent M&A activity found"]
GeM supplier: [Yes — active / Not found on gem.gov.in]
PE ownership: [PE firm — stake — fund vintage year / Not applicable]
BD signal: [ownership/funding implication]
Source(s): [URL] | Confidence: HIGH/MED/LOW | Source date: YYYY-MM-DD

⚖️ REGULATORY & LEGAL RISK
MCA compliance: [Clean — filings current / Overdue: X filings / Struck-off risk / Unable to verify]
Consumer court: [X cases found — [nature] / None found]
SEBI / RBI: [Notice found: [summary] / None found]
BD signal: [distress → urgency + compliance credentials / clean → reliability framing]
Source(s): [URLs] | Confidence: HIGH/MED/LOW | Checked: YYYY-MM-DD

🤝 KEY PARTNERSHIPS & INTEGRATIONS
[Partner name — nature of alliance — BD implication]
[Repeat for each named partner, or "No public partnerships found"]
BD signal: [partner ecosystem direction / referral angle if KServe knows the partner]
Source(s): [URLs] | Confidence: HIGH/MED/LOW | Source date: YYYY-MM-DD
```
