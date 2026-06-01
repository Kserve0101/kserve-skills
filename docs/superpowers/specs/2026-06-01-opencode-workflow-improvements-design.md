# OpenCode Workflow Improvements — Design Spec

**Date:** 2026-06-01  
**File:** `.github/workflows/opencode.yml`

---

## Goal

Extend the existing opencode GitHub Actions workflow to handle three distinct task types (`review`, `triage`, `fix`), enforce collaborator-only access, support model overrides, and queue concurrent runs — while keeping all production changes human-gated via draft PRs.

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

Unchanged from current:

```yaml
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
```

Activation condition (unchanged):

```yaml
if: |
  contains(github.event.comment.body, ' /oc') ||
  startsWith(github.event.comment.body, '/oc') ||
  contains(github.event.comment.body, ' /opencode') ||
  startsWith(github.event.comment.body, '/opencode')
```

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

Only repo collaborators (write access) can trigger opencode. Check via `author_association`:

```yaml
- name: Check collaborator permission
  id: auth
  run: |
    ASSOCIATION="${{ github.event.comment.author_association }}"
    if [[ "$ASSOCIATION" == "OWNER" || "$ASSOCIATION" == "MEMBER" || "$ASSOCIATION" == "COLLABORATOR" ]]; then
      echo "authorized=true" >> $GITHUB_OUTPUT
    else
      echo "authorized=false" >> $GITHUB_OUTPUT
    fi

- name: Exit if unauthorized
  if: steps.auth.outputs.authorized != 'true'
  run: exit 0
```

Silently exits (no error, no comment) for unauthorized users.

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

| Command | Trigger example | What opencode does | Output |
|---|---|---|---|
| `review` | `/oc review` | Analyze PR diff — code quality, security, logic | Comment on PR |
| `triage` | `/oc triage` | Analyze issue, suggest labels, ask clarifying Qs | Comment on issue |
| `fix` | `/oc fix` | Fix typos/formatting/docs only (no logic changes) | Draft PR from `opencode/fix-*` branch |
| `general` | `/oc` | Current behavior, no constraint | Comment |

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

- `review` / `triage` / `general`: read + comment only. No code changes.
- `fix`: opencode pushes to a new branch (`opencode/fix-*`), opens a **draft PR**. Human reviews diff and merges manually.
- opencode **cannot** merge PRs, push to `main`, or modify branch protection rules.

---

## Out of Scope

- Auto-approval flows
- Multiple variants per command
- Scheduled/workflow_dispatch triggers
- Notifications (Slack, email)
