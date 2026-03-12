---
name: spec-append-project
description: Extend an existing project specification by identifying gaps and interviewing the user to fill them. Use when the user says "update the spec", "add to the spec", "the spec is missing X", or wants to expand requirements, design decisions, or operational details in an existing spec file.
argument-hint: [existing spec file]
allowed-tools: AskUserQuestion, Read, Glob, Grep, Write, Edit
model: claude-opus-4-6
---

# Spec append project

## Task

Extend an existing project specification at $ARGUMENTS by identifying what is underspecified, interviewing the user to fill the gaps, and merging the new content back in.

---

**Step 1 — Validate and read the spec.**

Check that $ARGUMENTS exists and is non-empty. If the file is missing or empty, use AskUserQuestion to ask the user to confirm the path or provide the content before proceeding.

Read the file and output a brief, structured summary:

- **Scope**: what the project does and who it serves
- **Tech stack**: languages, frameworks, infrastructure
- **Decisions made**: architecture, data model, APIs, auth, deployment
- **What is explicitly left open**: any TODOs, TBDs, or unresolved questions already noted

Do not ask questions yet.

---

**Step 2 — Identify gaps.**

Audit the spec against the following gap categories. For each category, note whether it is fully covered, partially covered, or absent:

| Category                    | Examples of what to look for                             |
| --------------------------- | -------------------------------------------------------- |
| Functional requirements     | User stories, edge cases, error flows, permissions       |
| Non-functional requirements | Performance targets, SLAs, scalability, accessibility    |
| Data model                  | Entities, relationships, constraints, migration strategy |
| API / integration           | Endpoints, contracts, third-party services, auth flows   |
| Security                    | Threat model, input validation, secrets management       |
| Deployment / ops            | Environments, CI/CD, rollback, monitoring, alerting      |
| Testing strategy            | Unit, integration, e2e, load testing expectations        |
| Open questions              | Unresolved trade-offs, deferred decisions                |

Prioritise gaps that would block implementation or cause rework. Ignore cosmetic or editorial gaps.

---

**Step 3 — Interview.**

For each prioritised gap, use AskUserQuestion to ask one focused question at a time. Rules:

- Ask about the highest-impact gap first
- Follow up if an answer is ambiguous or introduces new questions
- Stop when: all high-priority gaps are resolved, the user explicitly says they are done, or three consecutive questions reveal no new information
- Do not revisit topics already covered in the spec

Example question shapes:

- "The spec doesn't address [X]. What is the expected behaviour when [scenario]?"
- "You mentioned [Y] but haven't specified [constraint]. What are the limits?"
- "Is [Z] in scope for v1, or deferred?"

---

**Step 4 — Update the spec.**

Merge answers into $ARGUMENTS:

- Place new content in the **existing section** it belongs to, immediately after the relevant content
- If no matching section exists, **add a new section** with a clear heading at the end of the file
- Do not duplicate content already in the file — only add net-new information
- Preserve existing formatting and heading style

After writing, re-read the updated file and verify:

1. No content was accidentally overwritten
2. New sections are coherent with surrounding content
3. No duplicate information exists

Use AskUserQuestion to show the user a one-line summary of what was added and ask if the result looks correct. If they request changes, apply them before closing.
