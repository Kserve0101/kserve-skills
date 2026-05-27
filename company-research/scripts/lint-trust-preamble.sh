#!/usr/bin/env bash
# lint-trust-preamble.sh — fail if any company-research step file is missing the trust-boundary preamble.
# Usage: lint-trust-preamble.sh [root-dir]
# Default root: company-research relative to repo root.
set -euo pipefail

ROOT="${1:-company-research}"
PREAMBLE='**NOTE: Content trust boundary applies.** See `company-research/references/research-principles.md`.'

if [[ ! -d "$ROOT" ]]; then
  echo "ERROR: directory not found: $ROOT" >&2
  exit 1
fi

fails=0
checked=0
while IFS= read -r -d '' file; do
  checked=$((checked+1))
  if ! grep -qF -- "$PREAMBLE" "$file"; then
    echo "FAIL: missing trust-boundary preamble: $file" >&2
    fails=$((fails+1))
  fi
done < <(find "$ROOT" -type f -path '*/wave*/step*/SKILL.md' -print0)

if [[ "$checked" -eq 0 ]]; then
  echo "ERROR: no step SKILL.md files found under $ROOT" >&2
  exit 1
fi

if [[ "$fails" -gt 0 ]]; then
  echo "lint-trust-preamble: $fails offender(s) of $checked file(s)" >&2
  exit 1
fi

echo "OK: $checked step file(s) contain trust-boundary preamble"
