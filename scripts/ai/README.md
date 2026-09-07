# External agent workers

Claude Code (the session you talk to) is the **orchestrator**. It decomposes
work, delegates pieces to external LLM agents, reviews everything they return,
and is the only one that merges, runs prod commands, or touches secrets.

Two workers are wired in as CLIs — both use your **existing Pro logins, no API keys**:

| Worker | CLI | Default model | Auth |
| --- | --- | --- | --- |
| **Codex** | `codex exec` | `gpt-5` | ChatGPT Pro (`codex login`) |
| **Antigravity** | `agy --prompt` | `gemini-3.1-pro-high` | Antigravity Pro (already logged in) |

> The standalone `gemini` CLI free tier was discontinued by Google. We use the
> Antigravity CLI (`agy`) instead — same model family, covered by your Pro plan.
> `agy models` lists what's available (Gemini 3.x Pro/Flash, also Claude/GPT-OSS).

## Who does what

### Codex — the one that touches code
- Precise multi-file edits against a clear spec
- Debugging concrete failures (stack trace → fix)
- Writing unit / integration tests; running the TDD red→green loop
- Second-opinion / adversarial code review (`codex review`)
- Self-contained: runs and verifies its own changes in its sandbox
- Weak at: large-context reads (not cheaper than the orchestrator), vague scope

### Antigravity — the one that reads and writes a lot
- Large-context reads: whole repo, `bbdd.md`, big JSON/CSV reports in one pass
- Long-form generation: docs, READMEs, ADRs, migration guides, release notes
- **SDD drafts**: `proposal` / `spec` / `design` / `tasks` — orchestrator reviews and gates
- Codebase-wide analysis, dependency mapping, summarization
- Translations, changelog, Spanish prose
- Weak at: surgical code edits, passing strict test loops, API details it half-remembers
- **Everything it produces is a draft** — the orchestrator reviews before use

### Stays with the orchestrator (Claude Code)
- Deciding who does what; final review and merge gate
- Anything touching `.env*`, secrets, prod, or irreversible operations
- SDD `apply` / `verify` phases (implementation loop + contract check)
- The "is this actually correct" judgment call

### Split rules worth remembering
- **TDD**: Antigravity drafts the test scenarios/plan; Codex (or the orchestrator)
  runs the write-failing-test → code → green loop.
- **Migrations**: Antigravity drafts the plan/guide; Codex or the orchestrator
  executes schema/data changes — never fire-and-forget.

## Usage

```bash
# Read-only by default. Task from a file or stdin.
scripts/ai/codex-run.sh         path/to/task.md
echo "Explain the auth flow in src/modules/auth" | scripts/ai/antigravity-run.sh -

# Allow edits
scripts/ai/codex-run.sh --write        path/to/task.md
scripts/ai/antigravity-run.sh --write  path/to/task.md

# Extra context file (deny-checked against secrets/PII)
scripts/ai/codex-run.sh --context src/modules/foo/bar.js path/to/task.md

# Pick model / effort for Antigravity
scripts/ai/antigravity-run.sh --model gemini-3.8-flash-high --effort medium task.md

# Structured output
scripts/ai/codex-run.sh        --schema schema.json task.md
scripts/ai/antigravity-run.sh  --json --schema schema.json task.md
```

Output is streamed and also saved under `scratch/ai/` (gitignored).

## Data boundary

- Wrappers refuse `--context` paths that look like secrets or personal data.
- `.codexignore` fences the Codex agent's own filesystem access: `.env*`, keys,
  `auth.json`, Baileys sessions, `*.pdf`, student/applicant CSVs, `node_modules/`,
  `dist/`, generated reports.
- Source code under `src/`, `tests/`, `docs/`, `scripts/` (minus the above) may be sent.

## Notes

- Build from **Windows PowerShell**, not WSL — `node_modules` is win32-x64;
  a WSL `npm run build` fails with a rolldown native-binding error.
- `agy` can be slow to start on a cold run (model spin-up); the wrapper allows 8m.
- If an Antigravity IDE/CLI session is already running against this repo, `agy`
  print-mode calls may queue behind it.
