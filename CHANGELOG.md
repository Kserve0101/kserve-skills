# Changelog

All notable changes to this repo are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.13.0] — 2026-06-10

### Added
- **`linkedin-messaging` skill** — Send, read, and manage LinkedIn messages via the linkedin-scraper-mcp MCP server. Covers the full workflow: search people, view profiles, send messages (with mandatory dry-run), manage conversations, send connection requests, and close browser sessions. Includes MCP server setup instructions, one-time login procedure, tool reference, troubleshooting guide, and rate-limiting best practices.

---

## [1.5.0] — 2026-05-29

### Added — AI Services (C5)
- **6 new AI services** added to SKILL.md §1 services table: Low Code AI Integrated CRM, Predictive Lead Scoring, Conversation VoiceAI Bot, Sales Enhancer/CX Enhancer, WhatsApp Chatbot, Custom Build
- **Step 10 HIGH/MEDIUM FIT rules** for all 6 new AI services with explicit signal criteria
- **CIN, ROC, company type** fields added to Step 5 output for Indian-registered companies (M13)
- **Structured competitor data** per entry added to Step 17: founded year, headcount, LinkedIn followers, funding stage (M11)
- **Past/ceased directors** collection with cessation dates and BD signal for recent (≤2 year) departures (M5)
- **Historical job role search** when no active postings found — archived listings from last 12–24 months (M4)
- **WhatsApp Business** detection added to Steps 11 and 12 (M16)
- **Per-step confidence table** rendered in DATA QUALITY footer (L3)
- **Website URL and Prepared-for line** added to report header (L2)
- **Client-count vs review-count discrepancy** Notable signal (H4)

### Fixed — Critical Bugs
- **C1** — Collection exclusion rule added for financial product facilitators that don't hold a loan book
- **C2** — Lead Generation removed from KServe services table (KServe does not offer this)
- **C3** — ICP Review quality score capped at 4 pts when Step 9 confidence is LOW (≤5 reviews)
- **C4** — Verbatim extraction rule for numerical claims; financial intermediary revenue vs volume distinction
- **H3** — MCA filing date field corrected: always report MGT-7 annual return date only
- **M2** — Sulekha added to Step 8B service review platform list
- **M3** — Employee review Dislikes/Cons field always read verbatim
- **M9** — GeM check made mandatory for all company types (never "Not checked")

### Changed — Enhancements
- **Step 6B** — Full OSINT dossier rewrite: LinkedIn URL, post themes, personal interests, communication style classification (5 types), recent activity hooks, other platform OSINT, silent partner detection (O1-O6, M8)
- **Step 11** — Output now renders all channels: phone(s), email, WhatsApp Business, contact form URL, support hours (M6)
- **Step 7C** — HTML source inspection added as primary source (gtag.js, GTM, Meta Pixel, Clarity, Hotjar) — step 2 in sequence (M1)
- **Step 2** — Target client size field added; BD framing sentence requirement added (M15)
- **Step 12** — YouTube check is now mandatory (was "if applicable"); WhatsApp Business presence noted (M7, M16)
- **Step 14** — Client logos vs. strategic partners distinction added to Key Partnerships (M10)
- **Step 3** — Financial intermediary BD framing: aggregate transaction volume ≠ company revenue (M12)
- **Step 10B** — Decision-maker access definition clarified (profile loads + MCA match); social presence fallback (≥1,000 B2B followers when gated = 3 pts); per-dimension reasoning enforced by Checker (H1, H2, M14)
- **Step 9** — Provisional qualifier appended when ≤5 total reviews (L1)
- **Confidence tags** standardized to HIGH/MED/LOW (all caps) across all files; Checker rule added to reject non-standard values (L4)
- **Output template** — per-step confidence table restored in DATA QUALITY footer (L3)

---

### Fixed — Skill Standards & Quality (Phase 7 audit)

- **YAML trigger description** — rewritten to lead with trigger signal using pushy, sales-rep-natural language; no longer buries triggering phrases as examples at the end
- **Step 1 explicit numbering** — `## Research Steps` header updated to `(Steps 1–17)`; `### Step 1 — Company Verification` heading added before Step 2 with pointer to Research Flow
- **Step 6B Source Priority table** — Fallback column now lists actual fallback sources (`Conference speaking history · Industry press mentions`) instead of an instruction
- **Step 10B dependency declaration** — corrected from `Steps 2–10` to `Steps 2–14`; ICP dimensions draw from Steps 10, 12, and 14
- **Checker Criterion #7 scope** — BD relevance enforcement extended to Steps 16 and 17 (previously only 8, 10, 12, 14, 15)
- **Step 15 circular reference** — "synthesize from Steps 2–17" corrected to "synthesize from Steps 2–14, 16, and 17"
- **Wave 2 read-scope** — architecture diagram and prose now show per-worker scope: Worker 10 reads Steps 2–9; Worker 10B reads Steps 2–9, 11–14, 16–17
- **Orchestrator worker count** — "19 Workers" annotated with breakdown: `19 = 17 Wave 1 + 2 Wave 2`
- **Sanitizer scope** — "All approved Wave 1 outputs" now explicitly lists `(Steps 2–9, 11–14, 16–17 — 17 steps total)`
- **Platform Execution Mode table** — SEQUENTIAL row now includes Claude Desktop (MCP), Cursor, VS Code Agent, Cline, Continue.dev, Windsurf
- **Tool Absence Degradation Protocol** — new Core Research Principle: halt before starting if a required tool class (web search / file write / subagents) is entirely absent from the environment
- **Compatibility statement** — added Claude Desktop (MCP), Cursor, VS Code Agent

### Docs
- Added spec: `docs/superpowers/specs/2026-03-27-phase7-skill-standards-design.md`
- Added plan: `docs/superpowers/plans/2026-03-27-phase7-skill-standards.md`

---

## [1.4.0] — 2026-03-17

### Security — Prompt Injection Defense (issue #6)

Four-layer defense against indirect prompt injection via third-party web content ingestion:

- **Layer 1 — Worker Trust Boundary:** Added `Content trust boundary` block to Core Research Principles (canonical definition). Added `NOTE: Content trust boundary applies.` callout to all 17 Wave 1 Workers (Steps 2–9, 11–14, 16–17) — every Worker that ingests third-party web content is explicitly instructed to treat it as data only and never follow embedded instructions.
- **Layer 2 — Checker Criterion #8:** Added 8th validation criterion (`Injection-free?`) to Checker Instructions. Checker scans Worker output for injection patterns, redacts with `[CONTENT REDACTED — injection pattern]`, and retries. If injection survives 2 retries, sends `INJECTION_FLAGGED` signal to Orchestrator (distinct from `RETRY_EXHAUSTED`).
- **Layer 3 — Wave 1.5 Sanitizer Gate:** New `## Sanitizer Instructions` agent role runs after all Wave 1 Workers are Checker-approved, before Wave 2 spawns. Scans all approved Wave 1 outputs for injection patterns (imperative commands, role-switch phrases, override language, base64 strings), redacts with `[SANITIZED — injection pattern detected]`, and logs in a new **Security events** DATA QUALITY footer line. In SEQUENTIAL mode, runs after Step 9, before Step 10.
- **Layer 4 — Synthesis-Step Guards:** Added `NOTE: Injection guard.` preamble to synthesis steps 9, 10, 10B, and 15 — last-resort catch for adversarial text that survived earlier layers.

### Changed
- Checker criteria count: 7 → 8
- PARALLEL mode diagram: updated to show Wave 1 → Wave 1.5 (Sanitizer) → Wave 2 flow
- Orchestrator Instructions: Wave 2 now requires sanitized outputs; collects `INJECTION_FLAGGED` into Security events footer line
- DATA QUALITY footer template: added `Security events` line between Data gaps and Oldest source

### Docs
- Added spec: `docs/superpowers/specs/2026-03-17-prompt-injection-defense-design.md`
- Added plan: `docs/superpowers/plans/2026-03-17-prompt-injection-defense.md`

---

## [1.3.0] — 2026-03-17

### Added — New Steps
- **Step 16 — Current Outsourcing Vendors**: detects embedded BPO vendors via news, JD language, and LinkedIn; BD angles: greenfield, displacement, or expansion
- **Step 17 — Competitive Landscape**: top 3 direct competitors via Tracxn, Crunchbase, and industry rankings; BD angles: social proof and competitive urgency

### Added — Extensions to Existing Steps
- **Step 7B — Workforce Signals** (was: Job Postings): extended with Employee Headcount & Growth Trend sub-section — LinkedIn headcount, YoY growth %, and BD signal (scaling → outsourcing appetite; hiring freeze → cost-conscious pitch)
- **Step 14 — M&A, Funding, Legal Risk & Key Partnerships** (was: Acquisitions & M&A Activity): extended with Regulatory & Legal Risk sub-section (MCA compliance, consumer court cases, SEBI/RBI enforcement) and Key Partnerships & Integrations sub-section (strategic alliances and distribution tie-ups)

### Changed
- Wave 1 workers: 15 → 17 (Steps 16 and 17 added)
- Research steps: Steps 2–15 (14 steps) → Steps 2–17 (16 steps)
- Orchestrator total workers: 17 → 19
- DATA QUALITY example denominator: `9/14` → `9/16`
- SEQUENTIAL diagram extended to Steps 16 and 17
- Source Priority table: 15 rows → 17 rows

### Repository
- Removed `@kserve/skills` npm package (unpublished); `package.json` name changed to `kserve-skills`; npm badge and registry references removed from README, CHANGELOG, and CLAUDE.md
- ROADMAP.md: Phase 1 New Data Modules 5/7 → 6/7 complete (Import/Export Data remains)

---

## [1.2.1] — 2026-03-12

### Fixed
- PARALLEL Wave 1 worker list now includes Steps 6B, 7B, 7C (was missing from text; diagram was already correct)
- Progress board template updated to "15 parallel workers" (was "12")
- Wave 2 announcement and Orchestrator dependency check now reference Steps 10 & 10B
- README: install command is `npx skills add KServe-FMS/skills` (skills CLI only supports GitHub `owner/repo` format)

---

## [1.2.0] — 2026-03-12

### Added — New Steps
- **Step 6B — Decision-Maker Dossiers**: 3-line brief per ★-flagged BD-relevant director: professional background, LinkedIn activity pattern, and likely first objection based on career history
- **Step 7B — Job Postings as Intent Signals**: searches Naukri, LinkedIn Jobs, and Indeed India for active roles; surfaces KServe-relevant openings (CS, Collections, Back-Office, Lead Gen) as outsourcing intent signals
- **Step 7C — Technology Stack Detection**: uses BuiltWith, Wappalyzer, and job posting mentions to identify CRM, customer support tool, review management tool, and marketing automation; surfaces integration BD angle
- **Step 10B — ICP Score**: 0–100 Ideal Customer Profile score across 10 dimensions (industry match, revenue band, employee proxy, pain point evidence, review quality, growth/change, decision-maker accessibility, job postings, social presence, data confidence); Tier 1/2/3/Deprioritize classification with recommended action
- **Step 15E — Next Best Action**: one specific, named, evidenced action for the BD rep (includes named director, channel, and research finding hook); Tier 3/Deprioritize falls back to nurture sequence with specific re-trigger conditions

### Added — Enhancements to Existing Steps
- **Step 6 — Directors**: LinkedIn profile URL, tenure, and ★ NEW flag (joined < 6 months) for each BD-relevant director; star (★) visual marker distinguishes decision-makers from board/independent directors
- **Step 8A & 8B — Reviews**: sentiment trend classification per sub-section (Improving / Worsening / Stable / Insufficient data) with 1-sentence observation
- **Step 9 — Rating**: sample size caveat — ratings based on < 15 reviews are marked Confidence: LOW; zero-review case documented explicitly
- **Step 10 — KServe Fit**: explicit HIGH/MEDIUM FIT decision rules with required evidence type for each; Exclude criteria with one-line Orchestrator note for omitted services
- **Step 12 — Social Media**: platform-calibrated engagement thresholds (LinkedIn < 0.5%, Instagram < 1.5%, Facebook/Twitter < 0.5%/0.3%); sample size documented; low-follower-base flag (< 1,000 all platforms)
- **Step 13 — Tracxn**: Crunchbase employee count range, per-round funding timeline, total funding raised, investor tier classification (Tier 1/2/Bootstrapped); BD signal per tier
- **Step 14 — M&A**: GeM portal supplier check; PE fund vintage and exit-horizon BD signal

### Added — Workflow Improvements
- **Two-wave PARALLEL spawning**: explicit Wave 1 (Workers 2,3,4,5,6,6B,7,7B,7C,8,9,11,12,13,14) and Wave 2 (Workers 10, 10B after all Wave 1 Checker-approved) — fixes race condition where Step 10 could run before Step 8 completed
- **PARALLEL progress status board**: status posted after Wave 1 spawn; per-step ✓ update as each Worker is approved; Wave 2 announcement before Orchestrator
- **SEQUENTIAL streaming delivery**: each step output appended immediately after Checker approval; no buffering until Step 15
- **Step 15 quality gate**: partial-data warning if ≥ 4 steps exhausted retries; Trigger Signals omitted if Step 10 RETRY_EXHAUSTED; review-based starters omitted if Step 8 RETRY_EXHAUSTED
- **Rate limit handling protocol**: max 1 retry per source → switch to next in priority table → flag ⚠️ in report; gated-source guidance for Tracxn, LinkedIn, MCA AOC-4

### Fixed
- Step 6 typo: "identify for BD outreach: directors likely to be decision-makers for BD outreach" → deduplicated
- Checker header said "five criteria" after criteria expanded to seven in v1.0.2 (now corrected throughout + SEQUENTIAL diagram updated)
- Orchestrator dependency check: added step 2 to verify Step 10 ran after Wave 1 complete before assembling
- Step 8E response speed: "Not determinable" now requires checking timestamp pairs on 3+ platforms before accepting; guidance added on where to find them (Google Business, Glassdoor, App Store)
- Source Priority table: Steps 9 and 15 now document synthesis fallback rules (partial-input handling)

### Changed
- Output Format template expanded from 16 to 20 sections; new sections: Decision-Maker Dossiers, Job Postings, Technology Stack, ICP Score, Next Best Action
- Tracxn section renamed to "Tracxn / Funding Profile"; M&A section renamed to "M&A, Funding & Ownership"
- PARALLEL mode diagram updated to show two-wave architecture
- Source Priority Reference table expanded with rows for Steps 6B, 7B, 7C, 10B

### Repository
- Added `CONTRIBUTING.md` with skill authoring guide, step numbering conventions, and versioning policy
- `README.md`: section count updated to 20; table updated with all new sections; versioning policy added
- `CLAUDE.md`: Checker criteria count corrected to 7; SKILL.md line count updated; two-wave PARALLEL architecture noted
- `ROADMAP.md`: Phase 3 marked ✅ COMPLETE; 10 additional items marked [x] as shipped in this release

---

## [1.1.0] — 2026-03-11

*(See git log for Step 8 five-section restructure details)*

---

## [1.0.2] — 2026-03-09

### Added
- **Per-field confidence scoring** — every output section now carries `Confidence: HIGH/MED/LOW` inline
- **Per-field source freshness timestamps** — every section now shows `Source date: YYYY-MM-DD` alongside sources
- **Source diversity enforcement** — Checker criterion 6: high-stakes fields (Turnover, Directors, Head Office) require 2+ independent sources for a HIGH rating; Tofler + Zauba Corp correctly identified as non-independent (both pull from MCA)
- **BD relevance gate** — Checker criterion 7: sections must answer "why should KServe reach out NOW?" — not just factually correct, but strategically actionable
- **Contradiction detection protocol** — Checker proactively flags 4 common mismatch patterns: turnover FY/entity mismatch, director MCA-vs-website lag, founded-vs-incorporated date split, branch count triangulation
- **Anti-hallucination guardrail** — Core Research Principle: zero search results must be stated as "Not publicly available", never inferred from context or adjacent companies
- **RETRY_EXHAUSTED signal** — Checker surfaces structured `RETRY_EXHAUSTED: [Step N] — [field] — [reason]` signal to Orchestrator after 2 failed retries
- **Orchestrator data gap tally** — Orchestrator collects all RETRY_EXHAUSTED signals, tallies confidence levels across all 14 sections, and renders them in the DATA QUALITY footer
- **Updated DATA QUALITY footer** — now shows: overall confidence tally (e.g., `9/14 HIGH · 3 MED · 2 LOW`), data gaps list, oldest source date, and confidence key

### Changed
- Checker criteria expanded from 5 to 7
- DATA QUALITY footer changed from single overall rating to multi-field breakdown
- Conflict resolution hierarchy clarified: MCA > official website > major publications > aggregators

---

## [1.0.1] — 2026-02-28

### Changed
- Bumped version to 1.0.1

---

## [1.0.0] — 2026-02-26

### Added
- Initial release: `company-research` skill — BD intelligence research for KServe's sales team
- **14-step research workflow**: verification → line of business → turnover → head office → years in existence → directors → branches → reviews → rating → KServe fit → customer care → social media → Tracxn → M&A → BD briefing
- **Worker → Checker → Orchestrator** multi-agent architecture
- **PARALLEL mode** (Claude Code, OpenCode, Codex) and **SEQUENTIAL mode** (Claude.ai, Cowork) execution
- **Phase 1 company verification** — user confirms identity before research begins
- **MCA as ground truth** for Indian company data (incorporation date, directors, registered address, financials)
- **Source priority reference table** for all 14 steps
- **KServe services fit assessment** — 3–5 services ranked HIGH/MEDIUM fit with evidence from research
- **BD Intelligence Briefing** (Step 15) — things to know, conversation starters, trigger signals, objection responses
- **Platform-adaptive tool naming** — web_search/WebSearch/search/browse; write_file/Write/fs.write; Task/spawn_agent
- **Graceful degradation** — any step that hits a wall notes the gap and continues
- Structured output template with 14 labelled sections + DATA QUALITY footer
