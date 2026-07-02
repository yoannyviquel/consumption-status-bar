---
description: Set (or clear) the current task's time estimate shown by the status-line `eta` element
allowed-tools: Bash(node:*)
argument-hint: "<minutes> [label]   |   clear"
---

Record the current task's time estimate so the status line shows the clock time it
should finish. Scoped to the current project (git repo root, else cwd).

Arguments: `$ARGUMENTS`

## Steps

- **Clear** — if the argument is `clear`/`done` (or the task is finished):
  ```
  node "${CLAUDE_PLUGIN_ROOT}/scripts/set-eta.js" --clear
  ```

- **Set** — otherwise take the minutes (and optional label) from `$ARGUMENTS`, or
  estimate them yourself from the task at hand, then run:
  ```
  node "${CLAUDE_PLUGIN_ROOT}/scripts/set-eta.js" <minutes> --label "<short task>"
  ```

Report the command output. The `eta` segment appears on the next status-line
refresh (enable it once with `/statusline-mode … eta` if it isn't shown). It turns
red and shows `+Xm` once the estimate is overdue.

> Claude also sets this automatically before it starts coding a task, and clears it
> when done — this command is for setting or adjusting the estimate manually.
