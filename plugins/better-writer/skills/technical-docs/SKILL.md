---
name: technical-docs
description: Write or improve technical documentation — READMEs, tutorials, how-to guides, reference pages.
disable-model-invocation: true
---

# Technical Docs

A doc succeeds when the reader completes their task without leaving the page. Every step below serves that reader.

## 1. Frame

State, one sentence each:

- **Reader** — who opens this doc, and what they already know
- **Task** — what the reader can do after reading that they couldn't before
- **Mode** — the Diátaxis quadrant this doc lives in: tutorial (learning by doing), how-to guide (a goal, reader knows the domain), reference (lookup), explanation (understanding)

One doc, one mode: a page that mixes tutorial and reference serves neither reader. If the material demands two modes, propose two docs.

Done when all three sentences are written and the user has confirmed any you had to guess.

## 2. Ground

Read the source before writing about it. Locate in code, config, or tests every command, flag, API, and behaviour the doc will name. For an existing doc, also read it end to end and mark every claim you cannot trace to source — these are the doc's lies, and fixing them outranks any style improvement.

Done when every claim the doc will make is traceable to a file, and every untraceable existing claim is listed for removal or correction.

## 3. Write

Draft — or revise with the smallest diff that fixes the diagnosed problems — under these rules:

- Open with what the thing is, one sentence, then the fastest path to the reader's task; details after.
- Every code block runs verbatim: real paths, real names, no `<placeholders>` the reader must decode.
- One concept, one example.
- Headings name the reader's goal ("Deploy to production"), not the feature ("The deploy subsystem").
- Second person, active voice, present tense.

Done when the draft accomplishes the Task from step 1 and every rule above has been checked against the text.

## 4. Verify

Execute every command and code block in the doc; where execution is impossible here, check it line by line against source. Fix what fails, re-verify.

Done when every block has run or been source-checked, and any output the doc shows matches the real output. A doc shipped with an unverified example is unfinished.
