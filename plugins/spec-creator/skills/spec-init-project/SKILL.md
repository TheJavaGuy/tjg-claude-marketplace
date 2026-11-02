---
name: spec-init-project
description: Write a spec for a new software project by interviewing the user. Use when the user wants a spec or requirements for a project that has no code yet.
argument-hint: [new project dir]
allowed-tools: AskUserQuestion, Read, Glob, Grep, Write, Edit
model: opus
---

# Spec init project

Interview the user until every coverage area of their new project is decided or recorded as an open question, then write the spec into the project directory $ARGUMENTS.

## 1. Read what exists

If $ARGUMENTS already holds files (notes, a README, a sketch), read them first. Every fact they state is settled; the interview builds on it.

## 2. Interview

A gap is anything an implementer would have to guess. Walk the gaps highest-impact first, one question per AskUserQuestion call, and follow up until each answer is concrete enough to build from.

Ask what only the user can answer: the need behind a feature, the constraint behind a choice, what happens when things go wrong, what v1 leaves out. Take each answer one level deeper with "why", "what breaks if", or "how many".

| Area                        | What to pin down                                              |
| --------------------------- | ------------------------------------------------------------- |
| Problem and users           | Who it serves, the problem it solves, what success looks like |
| Scope                       | What v1 does, explicit non-goals                              |
| Functional requirements     | User flows, edge cases, error flows, permissions              |
| Non-functional requirements | Performance, scale, availability, accessibility               |
| UI and UX                   | Surfaces, key screens or commands, interaction style          |
| Data model                  | Entities, relationships, constraints, retention               |
| Integrations                | External APIs and services, auth flows                        |
| Tech stack                  | Languages, frameworks, hosting, and the reason for each       |
| Security                    | Threats, input validation, secrets                            |
| Deployment and ops          | Environments, CI/CD, monitoring, rollback                     |
| Testing                     | What gets tested at the unit, integration, and e2e level      |

The interview is done when every area is decided or recorded as an open question and the user confirms nothing is missing. If the user ends it earlier, record each untouched area as an open question.

## 3. Write the spec

1. Suggest a path inside $ARGUMENTS, such as `SPEC.md`, and let the user confirm or change it with AskUserQuestion.
2. Write one section per area, in the table's order, then an Open questions section. State each decision with its reason.
3. Tell the user the path and the open questions that remain.
