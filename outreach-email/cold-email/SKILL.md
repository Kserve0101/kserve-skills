---
name: cold-email
description: >
  Generate a personalized cold outreach email to the best-fit decision-maker
  at a prospect company. Requires company research data and DM contact details
  in context. Identifies the DM(s) with a verified email whose role is most
  relevant to the outsourcing decision, then drafts one tailored email per
  selected DM referencing company pain points, the DM's likely objections, and
  KServe's relevant services.
---

# Cold Email Generator

Generates tailored cold outreach emails to prospect decision-makers. Part of the KServe BD pipeline: company-research → apollo (DM enrichment) → outreach-email → bd-tracker-updater.

**Compatible with:** Claude.ai · Claude Code · Claude Desktop (MCP) · Cowork · OpenCode · Codex · Cursor · VS Code Agent · Any AI agent platform

---

## About KServe

KServe is an AI-powered Business Process Outsourcing (BPO) company headquartered in Thane, Maharashtra, India. KServe helps businesses grow and operate more efficiently by taking over key business functions — powered by integrated AI technology that delivers faster turnaround, higher accuracy, and better outcomes than traditional BPO.

### Services

| Service | What KServe does |
|---|---|
| **Lead Qualification** | Evaluates leads to determine fit, intent, and readiness to buy — so the client's sales team focuses only on high-value prospects |
| **Customer Onboarding** | Manages the end-to-end process of welcoming and activating new customers on behalf of the client |
| **Staff Augmentation** | Provides trained, dedicated staff who work as an extension of the client's own team — without the overhead of in-house hiring |
| **Customer Service** | Handles inbound and outbound customer interactions across voice, chat, email, and other channels |
| **Back-Office Operations** | Takes over internal processing tasks — data entry, documentation, verification, and admin workflows |
| **Collection** | Manages payment follow-ups, outstanding dues, and recovery processes on behalf of the client |
| **Market Research** | Gathers competitive intelligence, customer insights, and market data to support the client's business decisions |

> All services can be augmented with KServe's AI technology — enabling automation, smarter routing, predictive insights, and higher throughput at lower cost.

### Target Industries

BFSI · NBFC · Banking & Securities · Insurance · eCommerce · Education / EdTech · Automobile · Energy & Utilities · Healthcare · Media & Entertainment · Real Estate · Retail · Manufacturing · Tours & Travel · Hospitality · Agriculture · Immigration · Accounting · Fintech · Food & Beverages · Supply Chain Management · Logistics

---

## Input Requirements

This skill requires the following to be present in the conversation (from previous skill outputs or user-provided data):

1. **Company research report** — specifically needs these sections:
   - Step 2 (Line of Business — industry context)
   - Step 3 (Turnover — scale/financial framing)
   - Step 6B (Decision-Maker Dossiers — role, background, likely objections)
   - Step 7B (Job Postings — hiring pressure signals)
   - Step 8 (Reviews & Reputation — complaint themes, pain point evidence)
   - Step 10 (KServe Services Fit — which services match)
   - Step 10B (ICP Score — priority tier)
   - Step 15 (BD Intelligence Briefing — Section E: Next Best Action for recommended outreach sequence)
2. **Contact details** — verified business emails for decision-makers (from Apollo people-enrichment or other source)

If these are not present in the conversation, stop and ask the user to provide them before proceeding.

---

## Platform Execution Mode

**Always SEQUENTIAL.** This skill runs as a single reasoning pass — no parallel workers. Unlike company-research, there are no independent data-collection steps to parallelize. The entire workflow (input verification → DM selection → email drafting → quality check) is a linear chain where each step depends on the previous one.

---

## Workflow

### Step 1 — Input verification

Scan the conversation context for a company-research report and DM contact details. Verify the required sections (above) are present.

- If both are present → proceed to Step 2
- If only the research report is present but no contact details → ask the user for DM emails
- If neither is present → ask the user to provide the company research report first

### Step 2 — DM selection

From the Decision-Maker Dossiers (Step 6B) and the contact details, identify DMs who meet **ALL** of these criteria:

1. Their role is relevant to an outsourcing decision:
   - **Service Owner** (e.g., Chief Customer Experience, Head of Operations) — highest relevance
   - **Cost Gatekeeper** (e.g., CFO) — medium relevance
   - **Final Decision-Maker** (e.g., MD/CEO) — medium relevance
   - **Distribution Stakeholder** (e.g., Chief Retail) — lower relevance unless pain matches
2. They have a **verified business email** in the provided contact details
3. Their likely objection (from Step 6B dossiers) can be addressed by one of KServe's services

Use Step 15, Section E (Next Best Action) as a tiebreaker. Prefer the person closest to the operational pain (service owner) — an email to the ops lead who can escalate internally carries more weight than going directly to the CEO.

Select the best **1–2 candidates**. If none qualify:
- Explain which DMs were evaluated and why each was excluded
- Suggest concrete next steps: (a) re-run Apollo enrichment if no emails were found, (b) search LinkedIn manually for the contact, (c) deprioritise if no DM's role aligns with KServe's services

### Step 3 — Email drafting

For each selected DM, generate a tailored cold email with the following structure:

**Subject line** — Specific to the DM's role and the company's most relevant pain point. Must earn an open. Examples:
- "[Company]'s [pain point] — a process partnership worth 15 minutes"
- "[Company]'s [pain point] — how we solve it for BFSI companies"

**Opening** — Reference their specific role and a concrete recent company achievement or context. Shows genuine research, not a blast. Example:
> "Jane, [Company]'s 17% premium growth this year is impressive — and your cloud migration shows the organisation isn't afraid to restructure how work gets done."

**Pain point** — The most relevant problem from the report that falls under this DM's purview. Be specific: cite numbers (complaint counts, open roles, churn rates, complaint themes). Not generic. Example:
> "But 3,500+ consumer complaints about claim settlement delays and 200+ unanswered customer calls are a brand risk that scales with growth."

**KServe positioning** — The matching service from Step 10 (KServe Fit), framed as solving that specific pain point. Include relevant detail about KServe's approach. Do not use generic BPO claims. Example:
> "KServe handles claims processing and customer service for BFSI companies. We combine AI-powered triage with trained ops teams so claims move faster and CS backlogs clear — without you needing to build more internal capacity."

**Objection handling** — Directly pre-empt the DM's likely objection (from Step 6B). Diffuse it naturally within the narrative, not as a separate FAQ section. Examples:
- If objection is "we do things in-house": acknowledge their preference, suggest a small pilot
- If objection is "our metrics are already best-in-class": acknowledge their efficiency, frame as capacity scaling not replacement
- If objection is "service quality is core to our brand": acknowledge the brand promise, present the quality framework

**CTA** — Ask them to reply on this email. Always reply-based only:
> "If this sounds relevant, simply reply to this email and I'll share more details."

No calendar links, no call booking, no website CTAs, no PDF attachments.

**Sender signature** — Use the BD rep's actual name and `KServe BPO` in the signature block. Do not leave `[Your Name]` as a placeholder.

### Step 4 — Quality check (self-review before output)

Before presenting the email, verify it meets these criteria:
- [ ] References the DM's specific role and responsibility
- [ ] References a concrete, verifiable pain point from the report (with numbers where available)
- [ ] Positions the relevant KServe service as the solution
- [ ] Addresses the DM's likely objection
- [ ] Ends with a reply-only CTA (no links, no bookings)
- [ ] Feels like it was written for one person, not from a template

If any check fails, revise the email before output.

---

## Output Format

If one DM qualifies:

```
## Email to: [DM Name] — [Role]
**To:** [email]
**Subject:** [subject line]

[Full email body — 3-4 paragraphs, no more than ~250 words. The rationale below is separate.]

---
*Why this approach:* [1-2 sentence rationale — why this DM was chosen, what pain point was targeted, why this angle was used]
```

If multiple DMs qualify, present them sequentially with a summary at top:

```
*Drafting emails for 2 decision-makers: [Name 1] → [service angle], [Name 2] → [service angle]*

## Email to: [Name 1] …
…
## Email to: [Name 2] …
```

---

## Example

Given a fictional general insurer's company research report and these verified emails:
- jane.wong@aegis-insure.com (MD & CEO)
- raj.mehta@aegis-insure.com (CFO)
- priya.sharma@aegis-insure.com (Chief Retail & Government)

### DM selection

1. **Carlos Mendez** — best role match (Chief Customer Experience & Operations) but **no verified email** → excluded
2. **Jane Wong** — final decision-maker, has verified email, objection ("we keep operations in-house") addressable with pilot framing → selected
3. **Raj Mehta** — cost gatekeeper, has verified email, objection ("expense ratios are already optimized") addressable → could be secondary
4. **Priya Sharma** — distribution stakeholder, lower relevance for CS/claims pain point → lower priority

**Result:** 1 email — Jane Wong.

### Output

```
## Email to: Jane Wong — MD & CEO
**To:** jane.wong@aegis-insure.com
**Subject:** Aegis Insure's customer complaints — a process partnership worth 15 minutes

Jane,

Aegis Insure's 17% premium growth this year is impressive — and your investment in a full cloud migration shows the organisation isn't afraid to restructure how work gets done.

But 3,500+ consumer complaints about claim settlement delays and 200+ unanswered customer calls are a brand risk that scales with growth. For a company built on a promise of "smooth claims," every unresolved complaint erodes trust.

KServe handles claims processing and customer service for BFSI companies. We combine AI-powered triage with trained ops teams so claims move faster and CS backlogs clear — without Aegis needing to build more internal capacity. Our approach is tech-enabled, not headcount-heavy, so it fits the digital-first direction you've already set.

I know Aegis has historically preferred in-house operations. That's fair. What I'm suggesting is a small pilot — one process, measurable KPIs, 90 days. If it works, you scale. If it doesn't, there's no disruption.

If this sounds relevant, simply reply to this email and I'll share more details.

Best,
Rohit Sharma
KServe BPO

---
*Why this approach:* Jane is the final decision-maker with deep insurance industry experience. The email acknowledges Aegis's strengths first, then leads with the #1 customer complaint, and pre-empts the in-house objection with a low-friction pilot CTA. No external links — everything is a reply away.
```
