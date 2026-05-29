# Orchestrator — Assembly, Timeouts, Error Budget, Resume

After all 20 Workers complete and each Checker has approved (20 = 15 Wave 1 Workers [Steps 2, 3, 4, 5, 6, 7, 7B, 7C, 8, 11, 12, 13, 14, 16, 17] + 2 Wave 2 Workers [Steps 6B + 9] + 3 Wave 3 Workers [Steps 10 + 10B + 15]):

**Pre-assembly completeness checklist.** Before assembling the final report, verify all of the following:

| Check | Pass condition |
|---|---|
| All 20 Workers present | Outputs from Wave 1 (Steps 2, 3, 4, 5, 6, 7, 7B, 7C, 8, 11, 12, 13, 14, 16, 17) + Wave 2 (Steps 6B, 9) + Wave 3 (Steps 10, 10B, 15) all present |
| Wave sequencing correct | Wave 2 ran after Wave 1 fully complete; Wave 3 ran after Sanitizer complete |
| No pending steps | No step output is blank, "TBD", or "pending" without a ⚠️ flag or RETRY_EXHAUSTED signal |
| RETRY_EXHAUSTED collected | All exhausted-retry signals from Checkers are logged — none silently dropped |
| Sanitizer ran | Sanitizer gate completed between Wave 2 and Wave 3; security events line populated (even if "None") |

If any check fails: resolve before rendering. If a step is genuinely missing and cannot be recovered, add a ⚠️ note in its section and proceed.

1. Assemble all approved sections into the Output Format template in order
2. **Before assembling Steps 10, 10B & 15 (KServe Fit + ICP Score + BD Briefing):** verify the Sanitizer gate completed and sanitized outputs from ALL of Steps 2–9 are present. If Wave 3 Workers ran before the Sanitizer completed, discard those outputs and re-request with the full sanitized context.
3. Validate: no field is blank, pending, or "TBD" without a "Not publicly available" statement or a ⚠️ flag
4. If any section is missing or incomplete, return to that step's Checker with a re-request before rendering
5. Collect all `RETRY_EXHAUSTED` signals received from Checkers. If any exist, populate the "Data gaps" line in the 📝 DATA QUALITY footer with: `[Step N — field] — [reason]` for each one. If none, write "None".
   Separately, collect all `INJECTION_FLAGGED` signals from Checkers and any "Sanitizer stripped" entries from the Sanitizer. Populate the **Security events** line in the DATA QUALITY footer: list each as `INJECTION_FLAGGED: [Step N — platform]` or `Sanitizer stripped: [Step N — platform]`. If none, write "None".
6. Tally confidence levels across all 19 sections and populate the "Overall" line in the DATA QUALITY footer (e.g., `11/19 HIGH · 5 MEDIUM · 3 LOW`). Find the oldest source date across all sections and populate "Oldest source".
7. Render the final report for presentation to the user

**Partial-run resume (PARALLEL mode only).** If a PARALLEL run is interrupted mid-wave — connection drop, timeout, platform restart — present the user with a resume summary before restarting:

```
⚠️ Previous run interrupted for [Company Name].
Completed: Steps [list] ✓
Incomplete: Steps [list] — need to re-run

Resume (re-run only incomplete steps) or Start fresh?
```

- **Resume:** Re-use all Checker-approved outputs from the interrupted run. Spawn only the incomplete Workers. Re-run the Sanitizer gate and Wave 3 regardless — never re-use synthesis outputs from an interrupted run.
- **Start fresh:** Discard all prior outputs and run the full flow from Step 2.

If the platform does not support output persistence across sessions, skip resume detection and always run fresh.

## Output envelope (universal)

Every Worker returns this exact envelope. Wave coordinator parses and threads downstream:

```json
{
  "step": "<step-id>",
  "status": "APPROVED" | "RETRY_EXHAUSTED",
  "data": { /* step-specific payload — shape defined in output-schemas.json */ },
  "sources": [ { "url": "...", "title": "...", "tier": 1|2|3, "accessed": "ISO-date" } ],
  "confidence": "HIGH" | "MED" | "LOW",
  "notes": "<optional — gaps, caveats>"
}
```

`scripts/validate-output.ts` validates this envelope shape AND the `data` field against `output-schemas.json` per step.

## Timeouts (two-timer per-Worker model)

Workers use a **two-timer model** to distinguish "hung" from "slow." A slow-but-working Worker keeps emitting tool calls; a hung Worker stops. The no-progress timer catches genuine hangs in 2 min; the wall-clock backstop catches pathological cases.

| Scope | Limit | Type |
|---|---|---|
| Wave 1 (15 workers) | 25 minutes total | wall-clock backstop |
| Wave 2 (2 workers) | 10 minutes total | wall-clock backstop |
| Wave 3 (3 workers) | 10 minutes total | wall-clock backstop |
| Per-Worker — no-progress | 2 minutes since last tool-call return | **primary** — fires when Worker is actually hung |
| Per-Worker — total wall-clock | 8 minutes | backstop for pathological cases |
| Sanitizer gate (per gate) | 3 minutes | wall-clock |

**Per-Worker rule:** Worker is killed and marked `RETRY_EXHAUSTED` if EITHER timer trips (whichever fires first). The no-progress timer resets on every tool-call return, so a slow-but-progressing Worker can legitimately run past 8 min only if its individual tool calls each return within 2 min — which is the working definition of "making progress."

Timeouts apply only in parallel mode. Sequential mode has no enforced timeout — agent runs to completion.

## Error budget

Per run (across all waves):

- **0–5 RETRY_EXHAUSTED:** Run continues. Report renders with DATA QUALITY footer noting each gap.
- **>5 RETRY_EXHAUSTED:** **HARD-FAIL** with message: *"Preliminary Report — too many data gaps (N steps exhausted retries). Do not use for BD outreach without manual review."* Render whatever was collected, prepend the warning, mark report `PRELIMINARY`.

## State persistence and resume

To prevent re-running Sanitizer over non-deterministic web content after a crash, partial state is persisted to disk and **explicitly re-claimed by the user** on the next run — no silent auto-resume.

**Deployment assumption:** single-tenant per machine. Each employee runs `company-research` on their own AI plan / own session / own filesystem. Cross-user cache contention does not exist by construction; the threat model is **same-user, same-company, same-day re-runs across different chat sessions or after a crash**.

**Run-id (internal cache key, not a security boundary):**
- `run-id = sha1(canonical-company-name + start-timestamp-ISO8601)` generated at §3.
- Timestamp (not just date) ensures a deliberate fresh run never collides with a stale partial run from the same day.

**Resume flow:**
1. At §3, orchestrator scans `company-research/.state/` for any in-progress cache file whose `company` field matches the current canonical name AND whose `started_at` is on the current ISO date.
2. If a match is found, orchestrator **prompts the user**:
   *"Found in-progress run for `<company>` started at `<HH:MM>` (completed through `<last_wave>`). Resume? [y/n]"*
3. **Yes** → load cache, skip already-completed waves, continue from the next wave. Reuses sanitized outputs verbatim — no Sanitizer re-run.
4. **No** → discard the stale cache file, start a fresh run, generate a new `run-id` from the current timestamp, overwrite on first wave completion.
5. **No match** → start fresh, no prompt.

**Cache file shape** — one file per run, written under `company-research/.state/` and named `<run-id>.json`:
```json
{
  "run_id": "<sha1-hex>",
  "company": "<canonical-name>",
  "started_at": "2026-05-21T10:00:00Z",
  "last_wave_completed": "wave2",
  "sanitized_outputs": [ /* per-step output envelopes */ ]
}
```

**TTL:** cache files older than 24 hours are ignored on scan (never auto-resumed) and may be garbage-collected. A cross-day resume requires the user to start a fresh run — same-day partial work is the only resume case supported.

**Why explicit prompt, not silent auto-resume:**
- Same user, same company, same day, **different chat session** = ambiguous intent. Auto-resume would silently graft yesterday's-Chat-A partial work onto today's-Chat-B fresh run. Prompt makes intent explicit.
- After a true crash recovery, the user answers "y" and gets resume.
- For a deliberate re-do (e.g., refreshing data after an upstream source updated), the user answers "n" and gets a clean run.

Full implementation details — cache scan algorithm, prompt text, garbage-collection schedule — live in this file (see below).

## Resume prompt UX (canonical wording)

When §3 of the parent SKILL.md detects an in-progress cache for the current canonical company name with a `started_at` on today's ISO date AND the file's age is under 24h, emit exactly this prompt and wait for a y/n response:

> Found in-progress run for `<company>` started at `<HH:MM>` (completed through `<last_wave>`). Resume? [y/n]

- `<HH:MM>` is the local-time projection of the `started_at` ISO timestamp.
- `<last_wave>` is `wave1`, `wave2`, or `wave3` (the most recently completed wave per `last_wave_completed`).
- `y` (case-insensitive) → load `sanitized_outputs`, skip completed waves, continue.
- `n` (case-insensitive) → delete the stale cache file, generate a fresh run-id from the current timestamp, start at Wave 1.
- Any other response → re-prompt once. If still ambiguous, default to `n` (safe choice: a fresh run never loses data).

## Garbage collection

The cache directory (`company-research/.state/`) is swept opportunistically at §3 of every run: any file older than 24h is deleted before scanning for resume candidates. This keeps the directory bounded without requiring a separate cron or background process.
