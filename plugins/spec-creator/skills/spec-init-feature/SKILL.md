---
name: spec-init-feature
description: Write a spec for a new feature of an existing codebase by reading the code and interviewing the user.
disable-model-invocation: true
argument-hint: [feature name]
allowed-tools: AskUserQuestion, Read, Glob, Grep, Write, Edit
model: opus
---

# Spec init feature

Interview the user until every coverage area of the feature $ARGUMENTS is decided or recorded as an open question, then write the spec. If $ARGUMENTS is empty, the first question is what the feature is.

## 1. Read the codebase

Before the first question, read the project's README, CLAUDE.md or AGENTS.md, build files, and the code the feature will touch. The code is the source of truth for the stack, conventions, and current behaviour; the user answers only what the code cannot. Note where existing specs or design docs live and how they are named.

## 2. Interview

A gap is anything an implementer would have to guess. Walk the gaps highest-impact first, one question per AskUserQuestion call, and follow up until each answer is concrete enough to build from.

Ask what only the user can answer: the need behind the feature, the constraint behind a choice, what happens when things go wrong, what this iteration leaves out. Take each answer one level deeper with "why", "what breaks if", or "how many".

| Area                        | What to pin down                                             |
| --------------------------- | ------------------------------------------------------------ |
| Problem and users           | Who needs it, the problem it solves, what success looks like |
| Scope                       | What the feature does, explicit non-goals                    |
| Behaviour                   | User flows, edge cases, error flows, permissions             |
| UI and UX                   | Where the feature surfaces, if anywhere                      |
| Data changes                | New or changed entities, migration of existing data          |
| Fit with existing code      | Modules touched, APIs changed, backward compatibility        |
| Non-functional requirements | Performance, scale, security                                 |
| Rollout                     | Feature flags, release order, rollback                       |
| Testing                     | What gets tested at the unit, integration, and e2e level     |

The interview is done when every area is decided or recorded as an open question and the user confirms nothing is missing. If the user ends it earlier, record each untouched area as an open question.

## 3. Write the spec

1. Suggest a path that follows the repository's existing spec location and naming; with none, suggest `docs/specs/<feature-slug>.md`. Let the user confirm or change it with AskUserQuestion.
2. Write one section per area, in the table's order, then an Open questions section. State each decision with its reason.
3. Tell the user the path and the open questions that remain.
