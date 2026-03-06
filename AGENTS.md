# AGENTS.md

## Project

This repository is a personal Digital Garden for university-driven learning. After each university lesson, the owner researches the topic further, explores related concepts, and writes clear teach-back notes so learning is reinforced through teaching. The project is built with Next.js, React, TypeScript, Convex, and Bun.

## Command Contract (Bun Only)

- Use Bun commands only.
- Development server: `bun run dev` (do not run unless explicitly requested).
- Assume the dev server is already running; do not start a new dev server by default.
- Production build: `bun run build` is CI-only by default; do not run it after normal edits.
- Exception: run `bun run build` only when explicitly requested, or when `bun run check` already passed and _final production verification_ is necessary, not for every change.
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`
- Full validation: `bun run check`
- `bun run check` is the primary source of verification.
- Do not run `bun run typecheck` or `bun run lint` separately unless explicitly requested.
- Auto-fix lint/format issues: `bun run fix` (especially useful when `bun run check` reports linter formatting or sorting errors).
- If `bun run check` reports formatting, import ordering, or other auto-fixable lint issues, run `bun run fix` instead of hand-editing formatting-only changes.

## Convex Generated Code

- Never run `bunx convex codegen`.
- If generated Convex types or API references are genuinely stale, refresh them with `bunx convex dev --once`.
- Do not run `bunx convex dev --once` routinely after every Convex edit; use it only when there is a clear stale-generated-code or stale-cloud-deploy issue.
- Never edit generated Convex files by hand. This includes everything under `convex/_generated/`.

## Agent Behaviour

- Read existing patterns before making changes.
- Keep changes minimal, scoped, and task-relevant.
- Do not introduce unrelated refactors.
- State assumptions explicitly when requirements are unclear.
- Prefer explicit, maintainable TypeScript and clear naming.
- Prioritize code quality: write the cleanest, most elegant, and most maintainable solution possible. Do not blindly replicate weak existing patterns; it is expected and safe to improve implementation quality (frontend and Convex) when doing so remains scoped to the task.
- Do not ask the user to perform steps the agent can do itself.
- For frontend work involving shadcn primitives or components explicitly mentioned in the request (for example `card`, `popover`, or similar), ask the user to install the required shadcn component first instead of creating or installing it yourself.
- Use relevant skills when writing or updating code.

## Workflow Rules

- Run relevant validation after changes (`bun run check` or a targeted script).
- Report what changed and why.
- If checks were not run or failed, report that explicitly.
