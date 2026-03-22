#!/usr/bin/env bash
set -euo pipefail

# Auto-resolve merge conflicts for static GitHub Pages files by
# keeping changes from the current branch (ours).

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

conflicted_files=$(git diff --name-only --diff-filter=U | rg '^docs/(index\.html|style\.css|script\.js|assets/.*)$' || true)

if [[ -z "${conflicted_files}" ]]; then
  echo "No matching conflicted docs files found."
  exit 0
fi

echo "Resolving conflicts by keeping CURRENT branch version for:"
echo "${conflicted_files}"

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  git checkout --ours -- "$file"
  git add "$file"
done <<< "${conflicted_files}"

echo "Done. Conflicts for docs files are marked as resolved."
