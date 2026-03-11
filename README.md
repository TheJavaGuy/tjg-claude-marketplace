# Claude Code Plugins: Orchestration and Automation

> **⚡ Updated for Opus 4.6, Sonnet 4.6 & Haiku 4.5** — Three-tier model strategy for optimal performance

### How It Works

Each plugin is completely isolated with its own agents, commands, and skills:

- **Install only what you need** - Each plugin loads only its specific agents, commands, and skills
- **Minimal token usage** - No unnecessary resources loaded into context
- **Mix and match** - Compose multiple plugins for complex workflows
- **Clear boundaries** - Each plugin has a single, focused purpose
- **Progressive disclosure** - Skills load knowledge only when activated

**Example**: Installing `python-development` loads 3 Python agents, 1 scaffolding tool, and makes 16 skills available (~1000 tokens), not the entire marketplace.

## Quick Start

### Step 1: Add the Marketplace

Add this marketplace to Claude Code:

```bash
/plugin marketplace add thejavaguy/tjg-claude-marketplace
```

This makes all 72 plugins available for installation, but **does not load any agents or tools** into your context.

### Step 2: Install Plugins

Browse available plugins:

```bash
/plugin
```

Install the plugins you need:

```bash
# Essential development plugins
/plugin install python-development          # Python with 16 specialized skills
/plugin install javascript-typescript       # JS/TS with 4 specialized skills
/plugin install backend-development         # Backend APIs with 3 architecture skills

# Infrastructure & operations
/plugin install kubernetes-operations       # K8s with 4 deployment skills
/plugin install cloud-infrastructure        # AWS/Azure/GCP with 4 cloud skills

# Security & quality
/plugin install security-scanning           # SAST with security skill
/plugin install comprehensive-review       # Multi-perspective code analysis

# Full-stack orchestration
/plugin install full-stack-orchestration   # Multi-agent workflows
```

Each installed plugin loads **only its specific agents, commands, and skills** into Claude's context.

### Plugins vs Agents

You install **plugins**, which bundle agents:

| Plugin                  | Agents                                            |
| ----------------------- | ------------------------------------------------- |
| `comprehensive-review`  | architect-review, code-reviewer, security-auditor |
| `javascript-typescript` | javascript-pro, typescript-pro                    |
| `python-development`    | python-pro, django-pro, fastapi-pro               |
| `blockchain-web3`       | blockchain-developer                              |

```bash
# ❌ Wrong - can't install agents directly
/plugin install typescript-pro

# ✅ Right - install the plugin
/plugin install javascript-typescript@tjg-claude-marketplace
```

### Troubleshooting

**"Plugin not found"** → Use plugin names, not agent names. Add `@tjg-claude-marketplace` suffix when installing.

**Plugins not loading** → Clear cache and reinstall:

```bash
rm -rf ~/.claude/plugins/cache/tjg-claude-marketplace && rm ~/.claude/plugins/installed_plugins.json
```
