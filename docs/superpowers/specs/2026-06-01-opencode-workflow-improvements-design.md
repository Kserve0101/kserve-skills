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
| `issue_comment: created` | Comment contains `/oc` or `/opencode` | Slash command |
| `pull_request_review_comment: created` | Comment contains `/oc` or `/opencode` | Slash command |

Auto-triggers (issue/PR opened) run unconditionally — no slash command needed. Slash command triggers require `/oc` or `/opencode` prefix (existing behavior).

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

Slash commands (`/oc`, `/opencode`) restricted to collaborators only. Check via `author_association` — only runs for `issue_comment` and `pull_request_review_comment` events:

```yaml
- name: Check collaborator permission
  id: auth
  if: github.event_name == 'issue_comment' || github.event_name == 'pull_request_review_comment'
  run: |
    ASSOCIATION="${{ github.event.comment.author_association }}"
    if [[ "$ASSOCIATION" == "OWNER" || "$ASSOCIATION" == "MEMBER" || "$ASSOCIATION" == "COLLABORATOR" ]]; then
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

Silently exits (no error, no comment) for unauthorized slash command users.

---

## Comment Parsing

Extracts command type and optional `--model` flag:

```yaml
- name: Parse comment
  id: parse
  run: |
    BODY="${{ github.event.comment.body }}"

    if echo "$BODY" | grep -qE '(/oc|/opencode) review'; then
      echo "command=review" >> $GITHUB_OUTPUT
    elif echo "$BODY" | grep -qE '(/oc|/opencode) triage'; then
      echo "command=triage" >> $GITHUB_OUTPUT
    elif echo "$BODY" | grep -qE '(/oc|/opencode) fix'; then
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
| `review` | `/oc review` | Same as auto-review, manually triggered | Comment on PR |
| `triage` | `/oc triage` | Manually trigger triage on existing issue | Comment on issue |
| `fix` | `/oc fix` or `/oc continue` | Implement fix for simple issue (no logic changes) or typo/doc fix | Draft PR from `opencode/fix-*` branch |
| `general` | `/oc` | No constraint — current behavior | Comment |

### Auto-triage flow (issues: opened)

1. opencode reads issue title + body
2. Labels issue (bug / enhancement / question / etc.)
3. Assesses complexity: **simple** (typo, doc, small config) vs **complex** (logic, architecture)
4. If **complex**: posts clarifying questions, stops. User answers in comments, then triggers `/oc fix` or `/oc continue` to proceed.
5. If **simple**: posts proposed approach as comment, asks user to reply `/oc continue` to proceed or `/oc fix` to implement directly.
6. `/oc continue` or `/oc fix` on issue → opencode implements + opens draft PR.

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

## Out of Scope

- Auto-approval flows
- Multiple variants per command
- Scheduled/workflow_dispatch triggers
- Notifications (Slack, email)
