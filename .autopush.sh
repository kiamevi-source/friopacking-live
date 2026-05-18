#!/bin/bash
# Auto-push hook for friopacking-live
# Reads Claude Code hook stdin JSON; if the edited file is inside this repo,
# stage + commit + push to GitHub. Output logged to .autopush.log.

REPO="/Users/kmedina/Desktop/friopacking-live"
LOG="$REPO/.autopush.log"

input="$(cat)"
file_path="$(printf '%s' "$input" | /usr/bin/python3 -c 'import sys, json
try:
  d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))
except Exception:
  pass' 2>/dev/null)"

# Only act when the edited file lives inside the repo
case "$file_path" in
  "$REPO"/*) ;;
  *) exit 0 ;;
esac

cd "$REPO" || exit 0

{
  echo "--- $(date '+%Y-%m-%d %H:%M:%S') ---"
  echo "file: $file_path"
  git add -A
  if git diff --cached --quiet; then
    echo "no staged changes, skip"
    exit 0
  fi
  git -c user.name="kiamevi-source" -c user.email="kiamevi-source@users.noreply.github.com" \
    commit -m "auto: update from Claude Code"
  git push origin main
} >> "$LOG" 2>&1

exit 0
