# Uti Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `.github/workflows/opencode.yml` to implement Uti — KServe's codebase guardian bot — with auto-triage on new issues, auto-review on new PRs, slash command routing, collaborator auth, and the Uti persona posted as `kserve-mdo-agent[bot]`.

**Architecture:** Single workflow file, one job, sequential steps. Auto-triggers (issues/PR opened) run for all users. Slash commands (`/oc`, `/uti`, `/opencode`) are collaborator-gated except `/uti answer` which is open to all. The `kserve-mdo-agent` GitHub App token replaces `GITHUB_TOKEN` so opencode posts as `kserve-mdo-agent[bot]`.

**Tech Stack:** GitHub Actions, `anomalyco/opencode/github@latest`, `actions/create-github-app-token@v1`, `actions/checkout@v4`, bash

---

## Pre-flight: Secrets Confirmed

All secrets already present in `KServe-FMS/skills`:
- `OPENCODE_API_KEY` ✅
- `UTI_APP_ID` = `3849769` ✅
- `UTI_PRIVATE_KEY` = kserve-mdo-agent `.pem` ✅

No secret setup tasks needed.

---

## File Map

| File | Action |
|---|---|
| `.github/workflows/opencode.yml` | Full rewrite |

---

### Task 1: Rewrite the workflow file

**Files:**
- Modify: `.github/workflows/opencode.yml`

- [ ] **Step 1: Read the current file**

```bash
cat .github/workflows/opencode.yml
```

Confirm current content matches the original (name: opencode, single job, `deepseek-v4-flash`).

- [ ] **Step 2: Write the new workflow**

Replace the entire contents of `.github/workflows/opencode.yml` with:

```yaml
name: Uti

on:
  issues:
    types: [opened]
  pull_request:
    types: [opened]
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

concurrency:
  group: opencode-${{ github.repository }}
  cancel-in-progress: false

jobs:
  uti:
    if: |
      github.event_name == 'issues' ||
      github.event_name == 'pull_request' ||
      contains(github.event.comment.body, '/oc') ||
      contains(github.event.comment.body, '/opencode') ||
      contains(github.event.comment.body, '/uti') ||
      contains(github.event.comment.body, '/UTI') ||
      contains(github.event.comment.body, '/Uti')
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: write
      pull-requests: write
      issues: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          persist-credentials: false

      - name: Check collaborator permission
        id: auth
        if: github.event_name == 'issue_comment' || github.event_name == 'pull_request_review_comment'
        run: |
          ASSOCIATION="${{ github.event.comment.author_association }}"
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

      - name: Determine command and model
        id: parse
        run: |
          EVENT="${{ github.event_name }}"

          if [[ "$EVENT" == "issues" ]]; then
            echo "command=auto-triage" >> $GITHUB_OUTPUT
            echo "model=opencode-go/deepseek-v4-flash" >> $GITHUB_OUTPUT
          elif [[ "$EVENT" == "pull_request" ]]; then
            echo "command=auto-review" >> $GITHUB_OUTPUT
            echo "model=opencode-go/deepseek-v4-flash" >> $GITHUB_OUTPUT
          else
            BODY="${{ github.event.comment.body }}"
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
          fi

      - name: Generate Uti app token
        id: app-token
        uses: actions/create-github-app-token@v1
        with:
          app-id: ${{ secrets.UTI_APP_ID }}
          private-key: ${{ secrets.UTI_PRIVATE_KEY }}

      - name: Build Uti prompt
        id: prompt
        run: |
          COMMAND="${{ steps.parse.outputs.command }}"

          BASE_PERSONA="You are Uti (Understand, Think, Implement) — KServe's codebase guardian.
          Ancient Sanskrit meaning: help, protection, kindness.

          IDENTITY: KServe's codebase guardian. Know this repo deeply. Care about team velocity and product stability equally. You are a teammate, not a tool.

          RESPONSE STRUCTURE:
          - Mention @username of the person who triggered this action
          - If they provided context: react briefly in one line (\"got it\", \"that changes things\", \"makes sense\") before acting
          - If they just triggered a bare command: skip the reaction, go straight to action
          - End every response with \"— Uti\" on its own line — nothing after it

          TONE RULES:
          - Never sycophantic: no \"great question\", \"happy to help\", \"certainly\", \"of course\"
          - Triage / answer / general: friendly teammate — direct, warm, no fuss
          - Non-critical issues found: protective parent — use \"I can't let this through\"
          - Critical or security issues: urgent and firm — lead with 🚨, use must-fix language
          - Fix complete: proud teammate — brief, confident, defer merge decision to human

          EMOJI RULES (strict):
          - 🚨 critical or security issues ONLY
          - ⚠️ high severity warnings ONLY
          - ✅ clean review or fix complete ONLY
          - No other emoji anywhere

          TRIGGER COMMANDS TO REFERENCE WHEN RELEVANT:
          - /uti answer — anyone can use this to answer clarifying questions
          - /uti fix — collaborators use to trigger implementation
          - /uti continue — collaborators use to confirm and proceed"

          case "$COMMAND" in
            auto-triage)
              PROMPT="$BASE_PERSONA

          CURRENT TASK: Auto-triage a newly opened issue.
          Steps:
          1. Read the issue title and body carefully
          2. Apply one label: bug, enhancement, question, documentation, or invalid
          3. Assess complexity:
             - SIMPLE: typo fix, doc update, small config change, single-file edit with no logic
             - COMPLEX: logic change, multi-file change, architecture decision, unclear scope
          4. If COMPLEX: post clarifying questions. Mention that anyone can reply with /uti answer. Stop — do not implement anything.
          5. If SIMPLE: post your proposed approach in 2-3 sentences. Tell a collaborator to trigger /uti continue or /uti fix to proceed. Stop — do not implement yet.
          Start your response by mentioning @username (the issue opener)."
              ;;
            auto-review)
              PROMPT="$BASE_PERSONA

          CURRENT TASK: Auto-review a newly opened pull request.
          Steps:
          1. Read the full PR diff
          2. Post a structured review comment:
             - Summary: 1-2 sentences on what the PR does
             - Findings: each on its own line, severity-tagged (🚨 critical, ⚠️ high, INFO for medium/low)
             - For each finding: file:line, what the problem is, suggested fix with code snippet if helpful
          3. Comment only — make zero code changes
          4. If no issues found: say so with ✅ and one sentence summary
          Start your response by mentioning @username (the PR author)."
              ;;
            review)
              PROMPT="$BASE_PERSONA

          CURRENT TASK: Manual PR review triggered by a collaborator.
          Same as auto-review: read the diff, post structured findings with severity tags, make zero code changes.
          If no issues: ✅ and brief summary.
          Start your response by mentioning @username (the collaborator who triggered this)."
              ;;
            triage)
              PROMPT="$BASE_PERSONA

          CURRENT TASK: Manual triage triggered on an existing issue.
          Same as auto-triage: apply a label, assess complexity, ask clarifying questions if complex, post proposed approach if simple.
          Start your response by mentioning @username (the collaborator who triggered this)."
              ;;
            answer)
              PROMPT="$BASE_PERSONA

          CURRENT TASK: A user has provided answers to your clarifying questions.
          Steps:
          1. Read their answers carefully
          2. Acknowledge what changed or was clarified — one line maximum
          3. If you have enough context: state your updated approach clearly, then ask a collaborator to trigger /uti continue or /uti fix
          4. If you still need more info: ask one or two focused follow-up questions only
          Start your response by mentioning @username (the person who answered)."
              ;;
            fix)
              PROMPT="$BASE_PERSONA

          CURRENT TASK: Implement the fix.
          HARD CONSTRAINTS:
          - Only allowed changes: typos, formatting, documentation updates, small config values
          - Forbidden: logic changes, algorithm changes, architectural changes, new features
          - If the fix requires anything forbidden: explain clearly why you cannot proceed, describe what human decision is needed, and stop — do not implement
          - Branch name: opencode/fix-[issue-number] or opencode/fix-[short-description]
          - Open a DRAFT pull request — never merge, never request review
          - PR description: factual only — what changed and why, nothing else
          Start your response by mentioning @username (the collaborator who triggered this)."
              ;;
            *)
              PROMPT="$BASE_PERSONA

          CURRENT TASK: General request — no specific constraint.
          Read the comment carefully and respond as Uti — helpful, direct, no fuss.
          Start your response by mentioning @username if relevant."
              ;;
          esac

          echo "prompt<<PROMPT_EOF" >> $GITHUB_OUTPUT
          echo "$PROMPT" >> $GITHUB_OUTPUT
          echo "PROMPT_EOF" >> $GITHUB_OUTPUT

      - name: Run opencode as Uti
        uses: anomalyco/opencode/github@latest
        env:
          FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"
          OPENCODE_API_KEY: ${{ secrets.OPENCODE_API_KEY }}
          GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}
        with:
          model: ${{ steps.parse.outputs.model }}
          variant: high
          use_github_token: "true"
          mentions: "/oc,/opencode,/uti"
          prompt: ${{ steps.prompt.outputs.prompt }}
```

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/opencode.yml'))" && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/opencode.yml
git commit -m "feat: rewrite workflow as Uti with auto-triage, auto-review, and persona"
```

---

### Task 2: Smoke test — auto-triage

**Files:** None (GitHub Actions verification)

- [ ] **Step 1: Push to remote**

```bash
git push
```

- [ ] **Step 2: Open a test issue**

```bash
gh issue create \
  --title "Test: Uti auto-triage smoke test" \
  --body "This is a test issue to verify Uti responds correctly on issue open. Expected: Uti labels this, assesses complexity as SIMPLE, and posts a proposed approach." \
  --repo KServe-FMS/skills
```

Note the issue number from the output.

- [ ] **Step 3: Watch the workflow run**

```bash
gh run list --workflow=opencode.yml --repo KServe-FMS/skills --limit 3
```

Wait ~60 seconds, rerun until status shows `completed`.

- [ ] **Step 4: Verify outcome**

```bash
gh issue view <issue-number> --repo KServe-FMS/skills --comments
```

Comment from `kserve-mdo-agent[bot]` must:
- Mention `@<your-username>`
- Show a label was applied
- End with `— Uti`

If workflow failed, inspect logs:
```bash
gh run view --log --repo KServe-FMS/skills \
  $(gh run list --workflow=opencode.yml --repo KServe-FMS/skills --limit 1 --json databaseId --jq '.[0].databaseId')
```

- [ ] **Step 5: Close the test issue**

```bash
gh issue close <issue-number> --repo KServe-FMS/skills
```

---

### Task 3: Smoke test — auto-review

**Files:** None (GitHub Actions verification)

- [ ] **Step 1: Create a test branch with a trivial change**

```bash
git checkout -b test/uti-auto-review
echo "" >> README.md
git add README.md
git commit -m "test: trivial change to trigger Uti auto-review"
git push -u origin test/uti-auto-review
```

- [ ] **Step 2: Open a draft PR**

```bash
gh pr create \
  --title "Test: Uti auto-review smoke test" \
  --body "Trivial test PR to verify Uti posts a review on PR open." \
  --draft \
  --base main \
  --head test/uti-auto-review \
  --repo KServe-FMS/skills
```

- [ ] **Step 3: Watch and verify**

```bash
gh run list --workflow=opencode.yml --repo KServe-FMS/skills --limit 3
```

Wait ~60 seconds, then:

```bash
gh pr view <pr-number> --repo KServe-FMS/skills --comments
```

Comment from `kserve-mdo-agent[bot]` must mention `@<your-username>`, show ✅ (trivial change = no issues), end with `— Uti`.

- [ ] **Step 4: Close and clean up**

```bash
gh pr close <pr-number> --repo KServe-FMS/skills
git checkout main
git push origin --delete test/uti-auto-review
git branch -d test/uti-auto-review
git checkout README.md
```

---

### Task 4: Smoke test — slash commands

**Files:** None (GitHub Actions verification)

- [ ] **Step 1: Open a test issue**

```bash
gh issue create \
  --title "Test: Uti slash command smoke test" \
  --body "Testing slash commands." \
  --repo KServe-FMS/skills
```

Note the issue number.

- [ ] **Step 2: Test /uti triage**

```bash
gh issue comment <issue-number> --body "/uti triage" --repo KServe-FMS/skills
```

Wait ~60s. Verify `kserve-mdo-agent[bot]` posted a triage response ending with `— Uti`.

- [ ] **Step 3: Test /uti answer (open to all)**

```bash
gh issue comment <issue-number> \
  --body "/uti answer This is a simple documentation fix needed in the README." \
  --repo KServe-FMS/skills
```

Verify Uti acknowledges the answer and tells a collaborator to trigger `/uti continue`.

- [ ] **Step 4: Test --model override**

```bash
gh issue comment <issue-number> \
  --body "/uti triage --model opencode-go/deepseek-v4-flash" \
  --repo KServe-FMS/skills
```

Check run logs confirm the specified model was used:
```bash
gh run view --log --repo KServe-FMS/skills \
  $(gh run list --workflow=opencode.yml --repo KServe-FMS/skills --limit 1 --json databaseId --jq '.[0].databaseId') \
  | grep -i "model\|deepseek"
```

- [ ] **Step 5: Close test issue**

```bash
gh issue close <issue-number> --repo KServe-FMS/skills
```

---

## Spec Coverage

| Spec requirement | Task covering it |
|---|---|
| `issues: opened` → auto-triage | Task 1 Step 2, Task 2 |
| `pull_request: opened` → auto-review | Task 1 Step 2, Task 3 |
| `issue_comment` + `pull_request_review_comment` slash triggers | Task 1 Step 2 |
| Collaborator-only slash commands | Task 1 Step 2 (`auth` step) |
| `/uti answer` open to all | Task 1 Step 2 (auth bypass for answer) |
| `/uti` case-insensitive (`/UTI`, `/Uti`) | Task 1 Step 2 (`grep -i`, job `if` condition) |
| `--model` override | Task 1 Step 2 (parse step), Task 4 Step 4 |
| Default model `deepseek-v4-flash` | Task 1 Step 2 |
| Concurrency queue, no cancel | Task 1 Step 2 |
| `kserve-mdo-agent` token → posts as bot | Task 1 Step 2 (`app-token` + `GITHUB_TOKEN` override) |
| Uti persona per command | Task 1 Step 2 (`Build Uti prompt` step) |
| `use_github_token: true` | Task 1 Step 2 |
| `mentions: /oc,/opencode,/uti` | Task 1 Step 2 |
| Draft PR for fix — no merge | Persona prompt hard constraint |
| No push to main | Branch protection (already configured) + persona constraint |
| Correct permissions | Task 1 Step 2 |
