---
name: spec-init-feature
description: Create a specification for a new feature of existing software project. Use when the user says "create the spec for the new feature", "help me plan a new feature", "let's specify a feature" and similar.
argument-hint: [feature name]
allowed-tools: Read, Glob, Grep, Write, Edit
model: claude-opus-4-6
---

# Spec init feature

## Task

Help me build a spec for a new feature of my project. Feature name is in $ARGUMENTS.

Use AskUserQuestion tool to help me build the spec in $ARGUMENTS by interviewing me and gathering requirements and details about the feature implementation, UI & UX (if any), tech stack (probably same as already existing in project), concerns, tradeoffs, etc.

Make sure questions are not obvious and probe deeper into the underlying needs and constraints.

Interview me continually and systematically until the spec is complete. Document all responses and insights to create a comprehensive and well-structured specification that serves as the foundation for the feature.

When the specification is complete:

- suggest a file name
- use the AskUserQuestion tool to let user change the file name
- save it
