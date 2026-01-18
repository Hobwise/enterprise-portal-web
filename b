#!/bin/bash
# Browser Control Wrapper for Broker Project
# Manages sessions, logging, and executes via Bun

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSIONS_DIR="$SCRIPT_DIR/.browser-sessions"
SESSIONS_FILE="$SESSIONS_DIR/sessions.json"
LOG_FILE="$SESSIONS_DIR/logs/browser-control.log"

# Ensure directories exist
mkdir -p "$SESSIONS_DIR/logs"
mkdir -p "$SCRIPT_DIR/.browser-screenshots"

# Logging function
log() {
  echo "[$(date -Iseconds)] $*" >> "$LOG_FILE"
}

# Resolve session ID
resolve_session() {
  # Priority 1: Environment variable
  if [ -n "$BROWSER_SESSION_ID" ]; then
    echo "$BROWSER_SESSION_ID"
    return
  fi

  # Priority 2: Auto-detect if only one session exists
  if [ -f "$SESSIONS_FILE" ]; then
    local count
    count=$(jq -r '.sessions | length' "$SESSIONS_FILE" 2>/dev/null || echo "0")

    if [ "$count" -eq 1 ]; then
      jq -r '.sessions | keys[0]' "$SESSIONS_FILE"
      return
    fi

    # Priority 3: Default session
    local default
    default=$(jq -r '.defaultSession // empty' "$SESSIONS_FILE" 2>/dev/null)
    if [ -n "$default" ]; then
      echo "$default"
      return
    fi
  fi

  # No session resolved
  echo ""
}

# Show help
show_help() {
  cat << 'EOF'
Browser Control Tool - CDP-based browser automation

Usage: ./b <command> [args...]

Session Management:
  session init              Initialize a new browser session
  session list              List all active sessions
  session info              Show current session details
  session eval <expr>       Evaluate JS in session context

Navigation:
  navigate <url>            Navigate to URL
  refresh                   Reload the page

Screenshots:
  screenshot [selector]     Capture screenshot (full page or element)
  snap [name]               Quick timestamped screenshot
  sweep [breakpoints]       Screenshot across breakpoints
  ai-sweep                  AI-assisted visual analysis

UI Controls:
  ctl list                  List all interactive controls
  ctl button <selector>     Click a button
  ctl select <sel> <value>  Select dropdown option
  ctl slider <sel> <value>  Set slider value
  ctl batch <json>          Batch update controls

DOM Inspection:
  discover <selector|text>  Find elements
  inspect <selector>        Get element details
  chain <query>             Chain element queries
  snapshot                  Take DOM snapshot
  diff                      Compare DOM states
  align <sel1> <sel2>       Check element alignment
  measure <sel1> <sel2>     Measure distance

Input Automation:
  eval <expression>         Execute JavaScript
  mouse click <x> <y>       Click at coordinates
  mouse move <x> <y>        Move mouse
  el click <selector>       Click element
  el realclick <selector>   Simulate real click
  el clicktext <text>       Click by text content
  el center <selector>      Get element center

Recording & Debug:
  record start              Start screen recording
  record stop               Stop recording
  record gif                Create GIF from recording
  logs start                Start console log capture
  logs show                 Show captured logs
  timeline start            Start performance timeline
  perf                      Get performance metrics

Environment Variables:
  BROWSER_SESSION_ID        Override session auto-detection
  CDP_PORT                  Brave debugging port (default: 9222)

Prerequisites:
  Start Brave with debugging:
  /Applications/Brave\ Browser.app/Contents/MacOS/Brave\ Browser \\
    --remote-debugging-port=9222 --user-data-dir=/tmp/brave-debug-profile

Examples:
  ./b session init
  ./b navigate http://localhost:8000
  ./b screenshot full
  ./b ctl list
  ./b discover "#email"
  ./b eval "document.title"
EOF
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ] || [ "$1" = "help" ] || [ -z "$1" ]; then
  show_help
  exit 0
fi

# Resolve session
SESSION_ID=$(resolve_session)

# Log the command
log "Executing: $* (session: ${SESSION_ID:-none})"

# Execute via Node.js (or Bun if available)
if command -v bun &> /dev/null; then
  exec bun run "$SCRIPT_DIR/browser-control.cjs" \
    ${SESSION_ID:+--session "$SESSION_ID"} \
    "$@"
else
  exec node "$SCRIPT_DIR/browser-control.cjs" \
    ${SESSION_ID:+--session "$SESSION_ID"} \
    "$@"
fi
