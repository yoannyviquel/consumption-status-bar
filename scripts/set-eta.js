#!/usr/bin/env node
// Record (or clear) the current task's time estimate for the status-line `eta` element.
//
// Usage: node set-eta.js <minutes> [--label "..."]     set an estimate starting now
//        node set-eta.js --minutes N [--label "..."]   (same, explicit flag)
//        node set-eta.js --clear                       clear this project's estimate
//
// Claude runs this before it starts coding a task ("this'll take ~45 min"), and
// --clear once the task is done. The estimate is scoped to the current project
// (git repo root, else cwd) — the status line shows `now-start`/`minutes` as the
// finish clock. Stored in ~/.claude/statusline-eta.json: { "<key>": { startMs, minutes, label } }.
const fs = require('fs');
const os = require('os');
const path = require('path');

const filePath = path.join(os.homedir(), '.claude', 'statusline-eta.json');

function fail(msg) { console.error('✗ ' + msg); process.exit(1); }

// Same key as the status line's projectKey(): git repo root if any, else cwd.
function gitRoot(start) {
  let dir = path.resolve(String(start));
  let prev = '';
  while (dir && dir !== prev) {
    try { if (fs.existsSync(path.join(dir, '.git'))) return dir; } catch { /* ignore */ }
    prev = dir;
    dir = path.dirname(dir);
  }
  return '';
}
function projectKey(dir) { return path.resolve(gitRoot(dir) || String(dir)); }

function load() {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')) || {}; }
  catch { return {}; }
}
function save(obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

const args = process.argv.slice(2);
const opts = { minutes: null, label: '', clear: false };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--clear' || a === '--done') opts.clear = true;
  else if (a === '--minutes') opts.minutes = Number(args[++i]);
  else if (a === '--label') opts.label = String(args[++i] || '');
  else if (opts.minutes === null && /^\d+(\.\d+)?$/.test(a)) opts.minutes = Number(a);
  else fail(`unexpected argument "${a}"`);
}

const key = projectKey(process.cwd());
const store = load();

if (opts.clear) {
  delete store[key];
  save(store);
  console.log(`✓ Cleared the eta estimate for ${key}.`);
  process.exit(0);
}

if (!(Number(opts.minutes) > 0)) fail('need a positive <minutes> (e.g. `set-eta.js 45`), or --clear.');

store[key] = { startMs: Date.now(), minutes: Number(opts.minutes), label: opts.label || undefined };
save(store);
const end = new Date(store[key].startMs + opts.minutes * 60000);
console.log(
  `✓ eta set: ~${opts.minutes} min${opts.label ? ` (${opts.label})` : ''} → finishes around ` +
    `${end.getHours()}h${String(end.getMinutes()).padStart(2, '0')} for ${key}.`,
);
console.log('  Shown by the `eta` element; run `set-eta.js --clear` when the task is done.');
