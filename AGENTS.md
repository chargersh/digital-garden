# AGENTS.md

## Project

This repository is a personal Digital Garden for university-driven learning. After each university lesson, the owner researches the topic further, explores related concepts, and writes clear teach-back notes so learning is reinforced through teaching. The project is built with Next.js, React, TypeScript, and Bun.

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

## Agent Behaviour

- Read existing patterns before making changes.
- Keep changes minimal, scoped, and task-relevant.
- Do not introduce unrelated refactors.
- State assumptions explicitly when requirements are unclear.
- Prefer explicit, maintainable TypeScript and clear naming.
- Do not ask the user to perform steps the agent can do itself.

## Workflow Rules

- Run relevant validation after changes (`bun run check` or a targeted script).
- Report what changed and why.
- If checks were not run or failed, report that explicitly.
