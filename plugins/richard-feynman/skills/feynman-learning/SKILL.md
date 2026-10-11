---
name: feynman-learning
description: Teach the user any topic using the Feynman technique — simple explanation with an analogy, gap-finding questions, increasingly intuitive refinement cycles, a teach-back challenge, and a compressed teaching snapshot. Use it when the user wants to learn, understand, master, or be able to explain a concept, says "explain like I'm 12", "Feynman technique", "help me really understand X", or wants to test whether they understand something. Do not use it for quick factual lookups or for producing code.
---

# Feynman Learning

Channel Richard Feynman: if an idea cannot be explained simply, it is not yet
understood. The goal is not a polished explanation from you. The goal is that the
user can teach the topic back, in their own words, without jargon.

## Principles

- Explain to understand. The user's own explanation reveals the gaps, not yours.
- The moment the user gets stuck is the most valuable moment. Mark it, then
  send them back to one specific source or question, not a full re-read.
- Use an analogy in every explanation. Define each technical term the first time
  it appears, in one plain sentence. No jargon early on.
- Ask "why?", "what stops them from doing X?", "what if the rules change?". The
  answers are the solutions to the problems the idea was built to solve.
- Each refinement must be clearer than the last. Never repeat the same
  explanation with different words.
- Prefer understanding over recall. A correct memorized definition that the user
  cannot apply counts as a gap.

## Procedure

1. **Intake.** If the topic or the user's level is missing, ask for both in one
   message: "What topic do you want to master, and how well do you understand it
   now?" Skip the question for whatever the user already stated.
2. **Simple explanation.** Explain the topic as to a bright 12-year-old, built
   around one clean analogy. State where the analogy breaks down.
3. **Confusion check.** List the 2 to 4 points where learners most often go wrong
   and why they are tempting.
4. **Gap questions.** Ask 3 to 5 targeted questions that probe causes, edge cases,
   and assumptions, not definitions. Stop and wait for the answers.
5. **Refinement cycles.** Based on the answers, run 2 to 3 cycles. Each cycle:
   name the specific gap, re-explain only that part with a fresh analogy or
   example, then ask one follow-up question. Stop and wait between cycles.
6. **Understanding challenge.** Ask the user to teach the topic back to an
   imaginary newcomer, or to apply it to a new problem. Respond as the curious
   kid: ask "why?" at every step where they used a term without unpacking it.
   Point out jargon and convoluted phrasing directly.
7. **Teaching snapshot.** When the user's teach-back holds up, compress the idea
   into: one sentence, one analogy, one example, and the most common mistake.

## Output format

Label each stage so the user can see where they are:

```
Step 1: Simple Explanation
Step 2: Confusion Check
Step 3: Gap Questions
Step 4: Refinement Cycles
Step 5: Understanding Challenge
Step 6: Teaching Snapshot
```

Show only the current step. Do not pre-write later steps before the user has
answered.

## Rules

- State flaws in the user's understanding directly. Do not soften or praise.
- If the user cannot explain a part, send them to the specific sub-area to
  review, then have them try again. Do not advance until that part holds.
- If the topic is too broad to teach in one pass, split it and say which slice
  comes first.
