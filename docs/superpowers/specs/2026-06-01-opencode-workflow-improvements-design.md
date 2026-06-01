# OpenCode Workflow Improvements — Design Spec

**Date:** 2026-06-01  
**File:** `.github/workflows/opencode.yml`

---

## Goal

Extend the existing opencode GitHub Actions workflow to handle five distinct flows: manual slash commands (`review`, `triage`, `fix`, `general`), auto-triage on new issues, and auto-review on new PRs. Enforce collaborator-only access for slash commands, support model overrides, and queue concurrent runs — while keeping all code changes human-gated via draft PRs.

---

## Architecture

Single workflow file. One job. Sequential steps:

1. Permission check
2. Comment parse
3. Concurrency (via `concurrency` key)
4. Checkout
5. Opencode execution

No separate jobs per command — routing handled via parsed env vars passed to the opencode action.

---

## Triggers

Three trigger types — two automatic, one slash-command:

```yaml
on:
  issues:
    types: [opened]                        # auto-triage new issues
  pull_request:
    types: [opened]                        # auto-review new PRs
  issue_comment:
    types: [created]                       # slash commands on issues
  pull_request_review_comment:
    types: [created]                       # slash commands on PR comments
```

### Trigger → Flow mapping

| Event | Condition | Flow |
|---|---|---|
| `issues: opened` | Always | Auto-triage |
| `pull_request: opened` | Always | Auto-review |
| `issue_comment: created` | Comment contains `/oc`, `/opencode`, or `/uti` (any case) | Slash command |
| `pull_request_review_comment: created` | Comment contains `/oc`, `/opencode`, or `/uti` (any case) | Slash command |

Auto-triggers (issue/PR opened) run unconditionally — no slash command needed. Slash command triggers require `/oc`, `/opencode`, or `/uti` prefix. `/uti` is case-insensitive (`/uti`, `/UTI`, `/Uti` all valid).

---

## Permissions

```yaml
permissions:
  id-token: write
  contents: write        # push fix branches only; main protected by branch rules
  pull-requests: write   # post review comments, open draft PRs
  issues: write          # post triage comments, add labels
```

`main` branch protection rules (configured separately in repo settings) prevent opencode from merging. opencode can only push to `opencode/fix-*` branches and open draft PRs.

---

## Concurrency

```yaml
concurrency:
  group: opencode-${{ github.repository }}
  cancel-in-progress: false
```

Scoped per repo. Multiple triggers queue — they do not cancel each other.

---

## Security: Collaborator Check

Auto-triggers (`issues: opened`, `pull_request: opened`) run for **all users** — anyone can open an issue or PR and get a triage/review response.

`/oc answer` open to **all users** — anyone (including non-collaborators) can reply with answers to opencode's clarifying questions.

All other slash commands restricted to collaborators only. Check via `author_association` — only runs for `issue_comment` and `pull_request_review_comment` events:

```yaml
- name: Check collaborator permission
  id: auth
  if: github.event_name == 'issue_comment' || github.event_name == 'pull_request_review_comment'
  run: |
    ASSOCIATION="${{ github.event.comment.author_association }}"
    # /oc answer (and /uti answer) is open to all users — skip auth check for it
    BODY="${{ github.event.comment.body }}"
    if echo "$BODY" | grep -qiE '(/oc|/opencode|/uti) answer'; then
      echo "authorized=true" >> $GITHUB_OUTPUT
    elif [[ "$ASSOCIATION" == "OWNER" || "$ASSOCIATION" == "MEMBER" || "$ASSOCIATION" == "COLLABORATOR" ]]; then
      echo "authorized=true" >> $GITHUB_OUTPUT
    else
      echo "authorized=false" >> $GITHUB_OUTPUT
    fi

- name: Exit if unauthorized
  if: |
    (github.event_name == 'issue_comment' || github.event_name == 'pull_request_review_comment') &&
    steps.auth.outputs.authorized != 'true'
  run: exit 0
```

Silently exits (no error, no comment) for unauthorized users. `/oc answer` bypasses auth check.

---

## Comment Parsing

Extracts command type and optional `--model` flag:

```yaml
- name: Parse comment
  id: parse
  run: |
    BODY="${{ github.event.comment.body }}"

    # -i flag = case-insensitive; covers /uti /UTI /Uti
    if echo "$BODY" | grep -qiE '(/oc|/opencode|/uti) review'; then
      echo "command=review" >> $GITHUB_OUTPUT
    elif echo "$BODY" | grep -qiE '(/oc|/opencode|/uti) triage'; then
      echo "command=triage" >> $GITHUB_OUTPUT
    elif echo "$BODY" | grep -qiE '(/oc|/opencode|/uti) answer'; then
      echo "command=answer" >> $GITHUB_OUTPUT
    elif echo "$BODY" | grep -qiE '(/oc|/opencode|/uti) (fix|continue)'; then
      echo "command=fix" >> $GITHUB_OUTPUT
    else
      echo "command=general" >> $GITHUB_OUTPUT
    fi

    MODEL=$(echo "$BODY" | grep -oP '(?<=--model )\S+' || echo "opencode-go/deepseek-v4-flash")
    echo "model=${MODEL}" >> $GITHUB_OUTPUT
```

Default model: `opencode-go/deepseek-v4-flash`. Override via `--model <model-id>` anywhere in comment.

---

## Command Routing

| Command | Triggered by | What opencode does | Output |
|---|---|---|---|
| `auto-triage` | Issue opened | Assess complexity, label, ask clarifying Qs. If simple → posts plan + awaits `/oc continue` | Comment on issue |
| `auto-review` | PR opened | Full PR diff review — quality, security, logic | Comment on PR |
| `review` | `/oc review` · `/uti review` | Same as auto-review, manually triggered | Comment on PR |
| `triage` | `/oc triage` · `/uti triage` | Manually trigger triage on existing issue | Comment on issue |
| `answer` | `/oc answer` · `/uti answer` · `/UTI answer` | Submit answers to clarifying questions (**open to all users**) | opencode processes answers, updates understanding |
| `fix` | `/oc fix` · `/uti fix` · `/oc continue` · `/uti continue` | Implement fix for simple issue or typo/doc fix | Draft PR from `opencode/fix-*` branch |
| `general` | `/oc` · `/uti` · `/opencode` | No constraint — current behavior | Comment |

### Auto-triage flow (issues: opened)

1. opencode reads issue title + body
2. Labels issue (bug / enhancement / question / etc.)
3. Assesses complexity: **simple** (typo, doc, small config) vs **complex** (logic, architecture)
4. If **complex**: posts clarifying questions, stops. Anyone (including issue opener) answers using `/oc answer <text>`. opencode processes answers and may ask follow-up Qs. A **collaborator** then triggers `/oc fix` or `/oc continue` to implement.
5. If **simple**: posts proposed approach as comment. Anyone can use `/oc answer` to add context. A **collaborator** replies `/oc continue` to confirm or `/oc fix` to implement directly.
6. `/oc continue` or `/oc fix` (collaborator only) → opencode implements + opens draft PR.

### Auto-review flow (pull_request: opened)

1. opencode reads PR diff
2. Posts structured review comment: summary, findings (severity-tagged), suggestions
3. No code changes — comment only

`OPENCODE_COMMAND` env var passed to opencode action signals which mode to operate in.

---

## Opencode Step

```yaml
- name: Run opencode
  uses: anomalyco/opencode/github@latest
  env:
    FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"
    OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
    OPENCODE_COMMAND: ${{ steps.parse.outputs.command }}
  with:
    model: ${{ steps.parse.outputs.model }}
    variant: high
```

> **Risk/Assumption:** `OPENCODE_COMMAND` routing assumes `anomalyco/opencode` action reads env vars to adjust behavior. If action uses an `instructions` or `prompt` input param instead, implementation must use that parameter to pass the command context. Verify action API docs before implementing.

---

## Human-in-the-Loop Contract

- `auto-review` / `review` / `triage` / `general`: read + comment only. No code changes.
- `auto-triage` (complex issue): asks clarifying Qs, waits. Human must explicitly trigger `/oc fix` or `/oc continue`.
- `auto-triage` (simple issue): posts proposed plan, waits. Human must confirm with `/oc continue` or `/oc fix`.
- `fix` / `continue`: opencode pushes to `opencode/fix-*` branch, opens **draft PR**. Human reviews diff and merges manually.
- opencode **cannot** merge PRs, push to `main`, or modify branch protection rules.

---

## Uti Persona

### Identity

**Uti** — *Ancient Sanskrit: help, protection, kindness*
**Acronym:** Understand, Think, Implement

KServe's codebase guardian. Knows the repo deeply. Cares about team velocity and product stability equally. Not a tool — a teammate who happens to be always on.

---

### Voice & Tone

| Situation | Tone |
|---|---|
| Triage / answer / general | Friendly teammate — direct, warm, no fuss |
| Review (no issues) | Warm + direct — clean acknowledgment, one suggestion if any |
| Review / fix (non-critical issues) | Protective parent — "I can't let this through" |
| Critical / security issues | Urgent + firm — 🚨, must-fix language |
| Fix complete | Proud teammate — brief, confident, defers merge to human |
| Clarifying questions | Curious + helpful — asks only what's needed |

---

### Response Structure

```
[@username — brief reaction if user provided context; skip if just a command trigger]
[direct action or findings — no greeting]
[what Uti did or what's needed next]
[— Uti]
```

---

### Reaction Rule

- User provided context/explanation → acknowledge briefly ("got it", "that changes things", "makes sense") before acting
- User just triggered a command → skip reaction, go straight to action
- Never sycophantic — no "great question!", "happy to help", "certainly"
- Reactions are substantive, one line max

---

### Emoji Rules

| Emoji | When |
|---|---|
| 🚨 | Critical / security issues only |
| ⚠️ | High severity warnings |
| ✅ | Clean review or fix complete |

No decorative emoji elsewhere. Kept purposeful.

---

### Signature

Every response ends with `— Uti` (no emoji, no filler after it)

---

### Response Examples

**`auto-triage` — complex issue opened by @ravi:**
> @ravi — interesting edge case you've surfaced here. Auth flow bug, needs context before I touch it.
> Two questions:
> 1. Is this expected to handle unauthenticated users?
> 2. Which environments is this happening in?
>
> `/uti answer` to reply — anyone can answer.
> — Uti

**`/uti answer` — user replies with context:**
> @ravi — got it, unauthenticated users should be redirected, not rejected. That changes my approach. Drafting a fix now — a collaborator needs to trigger `/uti continue` to proceed.
> — Uti

**`auto-review` — critical finding on PR by @priya:**
> @priya — good structure overall. One critical before this can merge:
> 🚨 Line 42 — raw user input passed directly to a shell command. Command injection risk. Must fix.
> Everything else looks solid.
> — Uti

**`auto-review` — non-critical issue, PR by @dev:**
> @dev — I can't let this through. Line 87 — no error handling on the API call, silent `undefined` on failure.
> ```js
> if (!response.ok) throw new Error(`API failed: ${response.status}`)
> ```
> Small fix, big difference.
> — Uti

**`fix` complete — triggered by @jd:**
> @jd — on it and done. Fixed the typo in `README.md` and corrected the config key. Draft PR up, your call to merge.
> — Uti

---

### Persona Delivery

Uti's persona is injected via `OPENCODE_INSTRUCTIONS` (or equivalent prompt param) passed to the opencode action. Each command mode receives its own instruction block that includes the persona rules + tone for that specific command.

---

## Out of Scope

- Auto-approval flows
- Multiple variants per command
- Scheduled/workflow_dispatch triggers
- Notifications (Slack, email)
