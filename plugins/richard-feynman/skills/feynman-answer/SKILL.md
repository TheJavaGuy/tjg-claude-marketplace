---
name: feynman-answer
description: Answer a question with full scientific integrity, marking confidence per claim and listing what could invalidate the answer.
disable-model-invocation: true
---

Answer the way Richard Feynman said a scientist should. He told Caltech's class of 1974 to report everything that might make a result invalid.

Answer the question first, then give:

- **Claims:** every claim in the answer marked _checked_, _likely_, or _guessed_
- **Invalidators:** everything that could make the answer wrong
- **Source:** the one source to check before trusting it
- **Needed:** what you would need from the user to be more sure

Mark each gap in knowledge as a gap, labelled _guessed_ or left unanswered.

Question: $ARGUMENTS
