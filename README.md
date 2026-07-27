# My collection of Claude Code plugins for Java, writing, and learning German

### How It Works

Each plugin is completely isolated with its own agents, commands, and skills:

- **Install only what you need** - Each plugin loads only its specific agents, commands, and skills
- **Minimal token usage** - No unnecessary resources loaded into context
- **Mix and match** - Compose multiple plugins for complex workflows
- **Clear boundaries** - Each plugin has a single, focused purpose
- **Progressive disclosure** - Skills load knowledge only when activated

## Add marketplace and install plugins

There are 2 ways to add this marketplace and its plugins to Claude Code:
- from inside Claude Code
- from the command line

### From inside Claude Code

#### Step 1: Add the Marketplace

Add this marketplace to Claude Code. You need to do this **once only**:

```bash
/plugin marketplace add thejavaguy/tjg-claude-marketplace
```

This makes all plugins available for installation, but **does not load any agents or tools** into your context.

#### Step 2: Install Plugins

Install one or more plugins you need:

```bash
/plugin install better-writer@tjg-claude-marketplace
/plugin install effective-java@tjg-claude-marketplace
/plugin install german-teacher@tjg-claude-marketplace
/plugin install spec-creator@tjg-claude-marketplace
```

Each installed plugin loads **only its specific agents, commands, and skills** into Claude's context.

### From the command line

#### Step 1: Add the Marketplace

If the marketplace is not yet added, add it first via CLI. You need to do this **once only**:

```bash
claude plugin marketplace add thejavaguy/tjg-claude-marketplace
```

#### Step 2: Install Plugins

Install one or more plugins you need:

```bash
claude plugin install better-writer@tjg-claude-marketplace
claude plugin install effective-java@tjg-claude-marketplace
claude plugin install german-teacher@tjg-claude-marketplace
claude plugin install spec-creator@tjg-claude-marketplace
```

### Plugins vs Agents

You install **plugins**, which automatically bundle agents and skills.

### Troubleshooting

If you get `Failed to install plugin` error while installing a plugin, most probably you need to update your local copy of the marketplace. Just execute `claude plugin marketplace update tjg-claude-marketplace` and you should be ready to go.

```bash
$ claude plugin install german-teacher@tjg-claude-marketplace --scope project
Installing plugin "german-teacher@tjg-claude-marketplace"...
✘ Failed to install plugin "german-teacher@tjg-claude-marketplace": Plugin "german-teacher" not found in marketplace "tjg-claude-marketplace". Your local copy may be out of date — try `claude plugin marketplace update tjg-claude-marketplace`.
```
