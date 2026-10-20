import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Repo-specific consistency checks that `claude plugin validate` does not cover,
 * followed by `claude plugin validate --strict` itself. Collects every error and
 * exits 1 if any were found.
 */

const MARKETPLACE_NAME = "tjg-claude-marketplace";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const pluginsDir = join(repoRoot, "plugins");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
const readmePath = join(repoRoot, "README.md");

/** @type {string[]} */
const errors = [];

/**
 * @param {string} path
 * @returns {any}
 */
function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * Parses the single-line `key: value` pairs of a SKILL.md frontmatter block.
 *
 * @param {string} content
 * @returns {Map<string, string> | undefined}
 */
function frontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    return undefined;
  }
  /** @type {Map<string, string>} */
  const fields = new Map();
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator > 0 && !line.startsWith(" ")) {
      fields.set(
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim(),
      );
    }
  }
  return fields;
}

const pluginNames = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

/** @type {{ name: string; description: string; source: string }[]} */
const marketplaceEntries = readJson(marketplacePath).plugins;

for (const name of pluginNames) {
  const manifestPath = join(pluginsDir, name, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestPath)) {
    errors.push(`plugins/${name}: missing .claude-plugin/plugin.json`);
    continue;
  }
  const manifest = readJson(manifestPath);
  if (manifest.name !== name) {
    errors.push(
      `plugins/${name}: plugin.json name "${manifest.name}" does not match directory`,
    );
  }

  const entries = marketplaceEntries.filter(
    (entry) => entry.source === `./plugins/${name}`,
  );
  if (entries.length !== 1) {
    errors.push(
      `plugins/${name}: expected 1 marketplace.json entry with source "./plugins/${name}", found ${entries.length}`,
    );
  } else {
    for (const field of /** @type {const} */ (["name", "description"])) {
      if (entries[0][field] !== manifest[field]) {
        errors.push(
          `plugins/${name}: marketplace.json ${field} "${entries[0][field]}" differs from plugin.json "${manifest[field]}"`,
        );
      }
    }
  }

  const skillsDir = join(pluginsDir, name, "skills");
  const skillNames = existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
  for (const skill of skillNames) {
    const skillPath = `plugins/${name}/skills/${skill}/SKILL.md`;
    if (!existsSync(join(repoRoot, skillPath))) {
      errors.push(`${skillPath}: missing`);
      continue;
    }
    const fields = frontmatter(readFileSync(join(repoRoot, skillPath), "utf8"));
    if (!fields) {
      errors.push(`${skillPath}: missing frontmatter`);
      continue;
    }
    if (fields.get("name") !== skill) {
      errors.push(
        `${skillPath}: frontmatter name "${fields.get("name") ?? ""}" does not match directory "${skill}"`,
      );
    }
    if (!fields.get("description")) {
      errors.push(`${skillPath}: frontmatter description is empty`);
    }
  }
}

for (const entry of marketplaceEntries) {
  const directory = entry.source.replace(/^\.\/plugins\//, "");
  if (!pluginNames.includes(directory)) {
    errors.push(
      `marketplace.json: entry "${entry.name}" points at missing source "${entry.source}"`,
    );
  }
}

const readme = readFileSync(readmePath, "utf8");
for (const prefix of ["/plugin install", "claude plugin install"]) {
  const listed = readme
    .split("\n")
    .filter((line) => line.startsWith(`${prefix} `))
    .map((line) =>
      line.slice(prefix.length + 1).replace(`@${MARKETPLACE_NAME}`, ""),
    );
  if (listed.join() !== pluginNames.join()) {
    errors.push(
      `README.md: "${prefix}" lines must list every plugin alphabetically\n  expected: ${pluginNames.join(", ")}\n  found:    ${listed.join(", ")}`,
    );
  }
}

for (const target of [".", ...pluginNames.map((name) => `plugins/${name}`)]) {
  try {
    execFileSync("claude", ["plugin", "validate", "--strict", target], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const { code, stdout, stderr } =
      /** @type {{ code?: string; stdout?: string; stderr?: string }} */ (
        error
      );
    if (code === "ENOENT") {
      errors.push(
        "claude CLI not found on PATH; install Claude Code to run `claude plugin validate`",
      );
      break;
    }
    errors.push(
      `claude plugin validate --strict ${target} failed:\n${stdout ?? ""}${stderr ?? ""}`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `✘ ${error}`).join("\n"));
  process.exit(1);
}
console.log(`✔ validated ${pluginNames.length} plugins`);
