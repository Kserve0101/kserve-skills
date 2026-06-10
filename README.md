# KServe Skills

> **Private repository.** Internal agent skills for KServe's BD team. Not for public distribution.

Agent skills for KServe's business development and sales intelligence workflows.
Compatible with Claude Code, Claude.ai, OpenCode, Codex, and any platform that supports the [skills](https://github.com/vercel-labs/skills) standard.

## Install

```bash
npx skills add KServe-FMS/skills
```

Install a specific skill:

```bash
npx skills add KServe-FMS/skills --skill company-research
npx skills add KServe-FMS/skills --skill bd-tracker-updater
npx skills add KServe-FMS/skills --skill apollo
npx skills add KServe-FMS/skills --skill outreach-email
npx skills add KServe-FMS/skills --skill linkedin-messaging
```

## Available Skills

| Skill | Description |
|---|---|
| `company-research` | Researches a prospect company and produces a full BD intelligence report — turnover, directors, reviews, KServe fit assessment, and actionable outreach briefing |
| `bd-tracker-updater` | Saves a company prospect to KServe's BD Tracker via webhook — extracts fields from a research report, raw data, or guided collection; validates, previews, and submits |
| `apollo` | Calls Apollo.io APIs for sales intelligence — people enrichment from LinkedIn profile URLs via People Match API |
| `outreach-email` | Generates personalized cold outreach emails to prospect decision-makers using company research data and DM contact details |
| `linkedin-messaging` | Sends, reads, and manages LinkedIn messages via the linkedin-scraper-mcp MCP server — search people, view profiles, send messages with mandatory dry-run, manage conversations, and send connection requests |

---

## `apollo`

### How to use

Trigger with a LinkedIn profile URL to enrich person data:

- `"Enrich this person: https://www.linkedin.com/in/username/"`
- `"Look up this person on Apollo"`
- `"Get Apollo data for this profile"`

The skill validates the URL, calls the Apollo.io People Match API, and returns the enriched person JSON.

### What you need

```
APOLLO_API_KEY=<your-apollo-io-api-key>
```

---

## `company-research`

Deep BD-grade research report on any target company (financials, leadership, hiring, tech stack, competitors, outsourcing exposure, KServe service fit, ICP score, BD briefing). Triggers on phrases like `research <company>`, `deep dive on <company>`, `BD intel on <company>`.

Structure: parent SKILL + 3 wave coordinators + 20 step files + reference files + scripts. See `company-research/ADD_STEP.md` for how to add a step.

Platforms: parallel mode requires a subagent dispatch tool (Claude Code, OpenCode, Codex). Sequential mode (fallback) works on any platform with a filesystem.

Install: `npx skills add KServe-FMS/skills --skill company-research`

---

## `bd-tracker-updater`

### How to use

Trigger after a company-research report, with raw data, or with no data at all:

- `"Add this company to BD tracker"`
- `"Save Reliance Retail to BD tracker"`
- `"Log this company"` *(after a research report is in context)*
- `"Record in BD"`
- `"Push to tracker"`

The skill detects what data is already available, fills any gaps, shows a pre-submit summary, and fires the API only after you confirm.

### What you need

Set these env vars in your environment before using:

```
BD_Tracker_Base_URL=<your-n8n-instance-url>
BD_Tracker_Endpoint=<webhook-path>
```

### What it submits

18 fields per company:

| Field | Rule |
|---|---|
| Company Name | Required — non-empty |
| Line of Business | Required — must match 15-item approved list; case-insensitive input normalised on submit |
| Website | Required — main domain only (e.g. `kserve.co.in`); paths, `www.`, and trailing slashes stripped |
| Turnover (Cr) | Required — JSON number, latest year (e.g. `2.5`) |
| Location | Required — `"City, Country"` format |
| Year in Existence | Optional — numbers only |
| Directors | Optional — comma-separated names |
| Branches | Optional — count |
| Review | Optional — 1–2 sentence company overview |
| Rating | Optional — 1–2 sentence product/service rating |
| Services | Optional — KServe services to pitch |
| Customer Care No. | Optional — phone number |
| Social Media | Optional — `"Platform - XK Followers"` format |
| Tracxn | Optional — number only |
| Acquisitions | Optional — short pointers |
| BD Manager | Always `"VBDE"` — hardcoded |
| Form Type | Always `"Company"` — hardcoded |
| Website Exists | Always `"Yes"` — hardcoded |

Optional fields not available default to `"NA"` automatically.

---

## `outreach-email`

### How to use

Trigger after you have company research and DM contact details:

- `"Write a cold email to the right person at [company name]"`
- `"Generate outreach for the decision-maker at this company"`
- `"Draft a personalized email for [DM name]"`

The skill reads the company research and DM dossiers from context, identifies the best-fit decision-maker with a verified email, and drafts a personalized cold outreach email.

### What you need

A company research report (from `company-research` skill) and verified DM emails (from `apollo` skill).

---

## Rollback

If the tree decomposition of `company-research` (added 2026-05-22) causes regressions, install the pre-decomposition monolith:

```bash
npx skills add KServe-FMS/skills --skill company-research-legacy
```

`company-research-legacy` registers under a distinct name so it never collides with the new tree's trigger phrases. It will be removed in the release following confirmation that the new tree is stable.

## Adding New Skills

Drop a new directory with a `SKILL.md` file into this repo. The skills CLI will automatically discover it.

```
skills/
├── company-research/
│   └── SKILL.md
├── your-new-skill/      ← add here
│   └── SKILL.md
```

See [CHANGELOG.md](./CHANGELOG.md) for version history and [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Versioning

This repo follows semantic versioning:

| Bump | When to use |
|---|---|
| **Patch** (1.x.Y) | Typo fixes, instruction clarifications, Checker criteria wording |
| **Minor** (1.X.0) | New skills added, new sub-sections within an existing step, new Checker criteria, new output fields, new steps |
| **Major** (X.0.0) | Workflow restructuring, breaking changes to output format |
