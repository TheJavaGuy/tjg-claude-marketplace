# german-teacher: new plugin + skill

- [x] Create plugins/german-teacher/.claude-plugin/plugin.json
- [x] Write plugins/german-teacher/skills/german-teacher/SKILL.md (CEFR range + learning target asked at setup, Feynman teaching, mastery bar per level)
- [x] Register plugin in .claude-plugin/marketplace.json, bump version to 0.0.4
- [x] Validate structure (JSON valid, all plugin dirs covered in marketplace.json)

## Review

New german-teacher plugin. Skill is user-invoked (disable-model-invocation: true, zero context load).
Draft persona reworked into 4 steps with checkable completion criteria: Setup (ask CEFR start/target + learning target), Teach (Feynman, level-scoped), The bar (3 consecutive correct, ≥1 novel production; recall questions excluded), The ladder (climb until target, closing summary).
Correction rule stated once (single source of truth), applies to all steps.
