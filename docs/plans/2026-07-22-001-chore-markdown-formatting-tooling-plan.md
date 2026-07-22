---
title: Markdown Formatting Tooling - Plan
type: chore
date: 2026-07-22
topic: markdown-formatting-tooling
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
execution: code
---

# Markdown Formatting Tooling - Plan

## Goal Capsule

- **Objective:** Introduce baseline Node tooling to this repo so markdown formatting is pinned, scriptable, and enforced at push time.
- **Product authority:** Scope confirmed by the user in the brainstorm session on 2026-07-22; plan-time scope (whole-repo pre-push check, scaffolding additions) confirmed 2026-07-22.
- **Stop conditions:** Surface a blocker instead of guessing if the pinned versions fail to install, or if enforcing the hook requires changing files outside the tooling surface (`package.json`, lockfile, `.nvmrc`, `.gitignore`, `lefthook.yml`, markdown files).
- **Open blockers:** None.

---

## Product Contract

### Summary

Add `package.json` with prettier 3.9.6 and lefthook as dev dependencies, an `.nvmrc` pinning node 24.16.0, a lefthook pre-push hook that blocks pushes containing unformatted markdown, and npm scripts for formatting all markdown or only branch-changed markdown on demand.

### Key Decisions

- **Pre-push check-only enforcement** (session-settled: user-directed — chosen over pre-commit format-and-stage and pre-push format-and-amend: the hook runs `prettier --check` and aborts the push listing offenders; it never rewrites files, so commits stay clean and history is never amended by tooling).
- **Changed-files format script is in scope** (session-settled: user-approved — the user conditioned inclusion on it staying simple; a merge-base diff against `master` filtered to markdown is simple, so it stays in).
- **One-time formatting pass over existing markdown** (session-settled: user-approved — without it, the first push after setup fails on pre-existing unformatted files).

### Requirements

**Toolchain pinning**

- R1. `.nvmrc` at the repo root pins node `24.16.0`.
- R2. `package.json` declares prettier `3.9.6` and lefthook `2.1.10` as dev dependencies; both are pinned to exact versions.

**Push-time enforcement**

- R3. A lefthook pre-push hook runs a prettier format check on the repo's markdown files; when any file is unformatted, the push aborts and the output names the offending files.
- R4. The hook never modifies files — enforcement is check-only.

**On-demand scripts**

- R5. An npm script formats all markdown files in the repo.
- R6. An npm script formats only the markdown files changed on the current branch relative to its merge-base with `master`.

**Initial adoption**

- R7. All existing markdown files in the repo are formatted once as part of the setup, so the first post-setup push passes the hook.

### Acceptance Examples

- AE1. **Covers R3, R4.** Given a branch containing a commit with an unformatted markdown file, when the user runs `git push`, then the push aborts, the output lists that file, and the file's contents on disk are unchanged.
- AE2. **Covers R3.** Given all markdown in the pushed commits is formatted, when the user runs `git push`, then the hook passes and the push proceeds.

### Scope Boundaries

- Formatting of non-markdown files (JSON, YAML, workflow files) is out of scope.
- A CI formatting check in the existing GitHub workflow is out of scope — enforcement is hook-only for now.

---

## Planning Contract

**Product Contract preservation:** unchanged, except the former Outstanding Questions entry (lefthook version pin, hook-install mechanism) is resolved into KTD2 and KTD3 below, and R2 now names the lefthook pin `2.1.10` to match KTD2.

### Key Technical Decisions

- KTD1. **The pre-push hook checks all repo markdown, not only files in the pushed commits** (session-settled: user-approved — chosen over diffing the pushed range: a whole-repo `prettier --check` is one simple command, instant at this repo's scale (~21 markdown files), and catches files that entered unformatted through any path). The check targets git-tracked markdown only (`git ls-files` piped to prettier), not a filesystem glob. Consequence: a push can fail on a tracked file the pusher didn't touch — the format-all script is the one-command remedy; untracked working-tree drafts are deliberately excluded and never block a push.
- KTD2. **Lefthook is pinned to exactly `2.1.10`** — the latest release as of 2026-07-22, verified against the npm registry. Matches the exact-pin convention R2 sets for prettier, so hook behavior doesn't drift across machines.
- KTD3. **Git hooks install automatically via an npm `prepare` script running `lefthook install`** — chosen over documented manual installation: `prepare` runs on every `npm install`, so a fresh clone gets working hooks without extra steps.
- KTD4. **No prettier config file** — prettier 3 defaults govern markdown formatting (`proseWrap: preserve` leaves prose line breaks alone). A config file is added only if a real formatting dispute arises later.
- KTD5. **Instantiates the Product Contract's check-only decision:** the lefthook `pre-push` job invokes prettier in check mode only; no lefthook `fix` or `stage_fixed` options are used (see Key Decisions, "Pre-push check-only enforcement").

### Assumptions

- Node `24.16.0` is installable via the user's version manager; the local machine currently runs v22.15.0 with nvm available, so `.nvmrc` is load-bearing.
- `npm` is the package manager (no yarn/pnpm artifacts exist in the repo); `package-lock.json` is committed.

---

## Implementation Units

### U1. Node toolchain scaffolding

- **Goal:** Give the repo a pinned Node toolchain and the hygiene files that make it safe.
- **Requirements:** R1, R2.
- **Dependencies:** None.
- **Files:** `.nvmrc`, `package.json`, `package-lock.json`, `.gitignore`.
- **Approach:** Create `package.json` (private, no version publishing concerns) with `prettier` at exactly `3.9.6` and `lefthook` at exactly `2.1.10` as devDependencies (KTD2). `.nvmrc` contains `24.16.0` (R1). Create `.gitignore` with `node_modules/` — the repo has no `.gitignore` today. Run the install to generate and commit the lockfile.
- **Test scenarios:** Test expectation: none — pure config and scaffolding; correctness is proven by the smoke verification below.
- **Verification:** `npm install` completes cleanly; `npx prettier --version` prints `3.9.6`; `node_modules/` is untracked by git.

### U2. On-demand formatting scripts

- **Goal:** Let the user format markdown at will, repo-wide or branch-scoped.
- **Requirements:** R5, R6.
- **Dependencies:** U1.
- **Files:** `package.json`.
- **Approach:** Two npm scripts: `format` runs prettier in write mode over all repo markdown; `format:changed` writes only markdown files changed on the current branch relative to `git merge-base master HEAD`, must tolerate an empty change set (exit 0, no error), and must skip deleted files so prettier isn't handed paths that no longer exist.
- **Execution note:** Packaging/config work — prefer runtime smoke verification over unit coverage.
- **Test scenarios (manual smoke):**
  - Happy path: `npm run format` on the formatted repo is idempotent — a second run produces no diff.
  - Happy path: with one modified markdown file on a branch, `npm run format:changed` reformats only that file.
  - Edge case: `npm run format:changed` with zero changed markdown files exits 0 with no error.
  - Edge case: `npm run format:changed` after deleting a markdown file on the branch exits 0 and does not pass the deleted path to prettier.
- **Verification:** All four smoke scenarios pass; `git diff` after the idempotency check is empty.

### U3. Lefthook pre-push enforcement

- **Goal:** Make unformatted markdown unpushable.
- **Requirements:** R3, R4; AE1, AE2; KTD1, KTD3, KTD5.
- **Dependencies:** U1.
- **Files:** `lefthook.yml`, `package.json`.
- **Approach:** `lefthook.yml` defines one `pre-push` job running a prettier check over all git-tracked markdown (KTD1) in check-only mode (KTD5); untracked files are excluded by construction. Add the `prepare` script running `lefthook install` (KTD3) so hooks activate on every `npm install`.
- **Test scenarios (manual smoke):**
  - Covers AE1: commit an intentionally unformatted markdown file on a scratch branch; `git push --dry-run` aborts, output names the file, file contents unchanged; revert afterwards.
  - Covers AE2: with all markdown formatted, `git push --dry-run` passes the hook.
  - Fresh-activation path: after `rm -rf node_modules && npm install`, `.git/hooks/pre-push` exists and is lefthook-managed.
- **Verification:** All three smoke scenarios pass; `lefthook run pre-push` on a clean tree exits 0.

### U4. Initial repo-wide format pass

- **Goal:** Bring the 21 existing markdown files into compliance so the first real push passes.
- **Requirements:** R7.
- **Dependencies:** U2.
- **Files:** All tracked `*.md` files (repo-wide; includes `README.md`, `CLAUDE.md`, `docs/`, `plugins/`, `tasks/`).
- **Approach:** Run the U2 `format` script once and commit the resulting diff separately from the tooling changes, so the mechanical reformat doesn't obscure the tooling review. Eyeball the diff for surprises (prettier normalizing tables, list markers, emphasis style) rather than assuming it's noise-free.
- **Test scenarios:** Test expectation: none — mechanical reformat; correctness is the check passing.
- **Verification:** A repo-wide prettier check exits clean; `lefthook run pre-push` exits 0.

---

## Verification Contract

| Gate | Command | Applies to | Pass signal |
|---|---|---|---|
| Toolchain smoke | `npm install && npx prettier --version` | U1 | Install clean; prints `3.9.6` |
| Format idempotency | `npm run format` twice, then `git diff` | U2, U4 | Second run yields empty diff |
| Changed-files script | U2 smoke scenarios for `npm run format:changed` (modified file, zero changed files, deleted file) | U2 | All three scenarios exit 0; only changed files are reformatted |
| Repo check clean | `git ls-files -z '*.md' \| xargs -0 npx prettier --check` | U3, U4 | Exit 0 |
| Hook enforcement | AE1/AE2 smoke via `git push --dry-run` on a scratch branch | U3 | Dirty push aborts naming the file; clean push proceeds |
| Hook activation | `rm -rf node_modules && npm install` | U3 | `.git/hooks/pre-push` present and lefthook-managed |

No unit-test framework exists in this repo and none is introduced; all gates are smoke checks.

---

## Definition of Done

- All four units landed; R1-R7 hold and AE1/AE2 demonstrably pass.
- A fresh clone followed by `npm install` yields working pre-push enforcement with no manual steps.
- Repo-wide prettier check exits clean on `master` after merge.
- The initial format pass (U4) is a separate commit from the tooling setup.
- No experimental or scratch files (test markdown, throwaway branches' leftovers) remain in the final diff.
