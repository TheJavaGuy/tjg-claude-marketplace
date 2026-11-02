---
name: spec-append-project
description: Fill the gaps in an existing spec file by interviewing the user. Use when the user wants to update or extend a spec, or says a spec is missing something.
argument-hint: [existing spec file]
allowed-tools: AskUserQuestion, Read, Glob, Grep, Write, Edit
model: opus
---

# Spec append project

Find what the spec at $ARGUMENTS leaves underspecified, interview the user to fill those gaps, and merge the answers back into the file.

## 1. Read the spec

If $ARGUMENTS is empty, missing, or an empty file, find candidate spec files in the repository and ask the user with AskUserQuestion which one to extend.

Read the whole file and summarise it before asking anything:

- **Scope**: what the project does and who it serves
- **Tech stack**: languages, frameworks, infrastructure
- **Decisions made**: architecture, data model, APIs, auth, deployment
- **Already open**: TODOs, TBDs, and unresolved questions the spec notes

## 2. Find the gaps

A gap is anything an implementer would have to guess. Rate each area as covered, partial, or absent:

| Area                        | What to look for                                         |
| --------------------------- | -------------------------------------------------------- |
| Functional requirements     | User stories, edge cases, error flows, permissions       |
| Non-functional requirements | Performance targets, SLAs, scalability, accessibility    |
| Data model                  | Entities, relationships, constraints, migration strategy |
| API / integration           | Endpoints, contracts, third-party services, auth flows   |
| Security                    | Threat model, input validation, secrets management       |
| Deployment / ops            | Environments, CI/CD, rollback, monitoring, alerting      |
| Testing strategy            | Unit, integration, e2e, load testing expectations        |
| Open questions              | Unresolved trade-offs, deferred decisions                |

Keep the gaps that would block implementation or cause rework, ranked by impact. Wording and formatting stay as they are.

## 3. Interview

Walk the gaps highest-impact first, one question per AskUserQuestion call, and follow up until each answer is concrete enough to build from. Every question targets something the spec leaves open; what it already settles stays settled. Question shapes:

- "The spec doesn't address [X]. What is the expected behaviour when [scenario]?"
- "You mentioned [Y] but haven't specified [constraint]. What are the limits?"
- "Is [Z] in scope for v1, or deferred?"

The interview is done when every high-impact gap is resolved or recorded as an open question, the user says they are done, or three answers in a row add nothing new.

## 4. Merge

Merge each answer into $ARGUMENTS:

- Place it right after the related content in the section it belongs to. When no section fits, add one at the end, matching the file's heading style.
- Add only net-new information, and replace each TBD an answer resolves.

Re-read the changed sections and confirm that no existing content was lost and no fact appears twice. Then show the user a one-line summary of what changed and ask with AskUserQuestion whether it looks right; apply any changes they request.
