# Claude Code Plugins: Orchestration and Automation

> **⚡ Updated for Opus 4.6, Sonnet 4.6 & Haiku 4.5** — Three-tier model strategy for optimal performance

### How It Works

Each plugin is completely isolated with its own agents, commands, and skills:

- **Install only what you need** - Each plugin loads only its specific agents, commands, and skills
- **Minimal token usage** - No unnecessary resources loaded into context
- **Mix and match** - Compose multiple plugins for complex workflows
- **Clear boundaries** - Each plugin has a single, focused purpose
- **Progressive disclosure** - Skills load knowledge only when activated

## Quick Start

### Step 1: Add the Marketplace

Add this marketplace to Claude Code:

```bash
/plugin marketplace add thejavaguy/tjg-claude-marketplace
```

This makes all plugins available for installation, but **does not load any agents or tools** into your context.

### Step 2: Install Plugins

Browse available plugins:

```bash
/plugin
```

Install the plugins you need:

```bash
/plugin install spec-creator@tjg-claude-marketplace
```

Each installed plugin loads **only its specific agents, commands, and skills** into Claude's context.

### Plugins vs Agents

You install **plugins**, which bundle agents and skills.

### Troubleshooting

**"Plugin not found"** → Use plugin names, not agent names. Add `@tjg-claude-marketplace` suffix when installing.

**Plugins not loading** → Clear cache and reinstall:

```bash
rm -rf ~/.claude/plugins/cache/tjg-claude-marketplace && rm ~/.claude/plugins/installed_plugins.json
```
