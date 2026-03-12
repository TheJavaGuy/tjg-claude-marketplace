---
name: spec-init-project
description: Create a specification for a new software project. Use when the user says "create the spec for the new project", "help me plan a new project", "let's define requirements for a new application" and similar.
argument-hint: [new project dir]
allowed-tools: AskUserQuestion, Read, Glob, Grep, Write, Edit
model: claude-opus-4-6
---

# Spec init project

## Task

Help me build a spec for my new project in $ARGUMENTS.

Use the AskUserQuestion Tool to help build the spec in $ARGUMENTS by interviewing me and gathering requirements and details about the project implementation, UI & UX, tech stack, concerns, tradeoffs, etc.

Make sure questions are not obvious and probe deeper into the underlying needs and constraints.

Interview me continually and systematically until the spec is complete. Document all responses and insights to create a comprehensive and well-structured specification that serves as the foundation for the project.

When the specification is complete:

- suggest a file name
- use the AskUserQuestion tool to let user change the file name
- save it
