import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  format as prettierFormat,
  resolveConfig as prettierResolveConfig,
} from "prettier";

interface PluginManifest {
  name: string;
  version: string;
  description: string;
  [key: string]: unknown;
}

const VERSION_LINE_PATTERN = '"version":';
const README_START_MARKER = "<!-- PLUGIN-VERSIONS:START -->";
const README_END_MARKER = "<!-- PLUGIN-VERSIONS:END -->";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const pluginsDir = join(repoRoot, "plugins");
const readmePath = join(repoRoot, "README.md");

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
}

function stagedDiffIsEmpty(sinceCommit: string, pathspecs: string[]): boolean {
  try {
    execFileSync(
      "git",
      ["diff", "--cached", "--quiet", sinceCommit, "--", ...pathspecs],
      {
        cwd: repoRoot,
        stdio: "ignore",
      },
    );
    return true;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 1) {
      return false;
    }
    throw error;
  }
}

function bumpPatch(version: string): string {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Cannot bump non-semver version "${version}"`);
  }
  const [, major, minor, patch] = match;
  return `${major}.${minor}.${Number(patch) + 1}`;
}

function readManifest(manifestPath: string): PluginManifest {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function writeManifest(manifestPath: string, manifest: PluginManifest): void {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function versionAtRef(
  ref: string,
  relativeManifestPath: string,
): string | undefined {
  let raw: string;
  try {
    raw = git(["show", `${ref}:${relativeManifestPath}`]);
  } catch {
    return undefined; // path doesn't exist at that ref
  }
  return (JSON.parse(raw) as PluginManifest).version;
}

const pluginNames = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const name of pluginNames) {
  const manifestPath = join(pluginsDir, name, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestPath)) {
    continue;
  }

  const relativeManifestPath = `plugins/${name}/.claude-plugin/plugin.json`;
  const relativePluginDir = `plugins/${name}/`;

  const headVersion = versionAtRef("HEAD", relativeManifestPath);
  const indexVersion = versionAtRef(":0", relativeManifestPath);
  if (
    headVersion !== undefined &&
    indexVersion !== undefined &&
    headVersion !== indexVersion
  ) {
    continue; // already bumped by an earlier, not-yet-committed run -- don't double-bump
  }

  const lastBumpCommit = git([
    "log",
    "-1",
    "--format=%H",
    `-G${VERSION_LINE_PATTERN}`,
    "--",
    relativeManifestPath,
  ]).trim();

  if (!lastBumpCommit) {
    continue; // brand new plugin, not yet in history -- nothing to compare against
  }

  const unchanged = stagedDiffIsEmpty(lastBumpCommit, [
    relativePluginDir,
    `:!${relativeManifestPath}`,
  ]);
  if (unchanged) {
    continue;
  }

  const manifest = readManifest(manifestPath);
  const previousVersion = manifest.version;
  manifest.version = bumpPatch(previousVersion);
  writeManifest(manifestPath, manifest);
  git(["add", relativeManifestPath]);
  console.log(`bumped ${name}: ${previousVersion} -> ${manifest.version}`);
}

const tableRows = pluginNames.map((name) => {
  const manifest = readManifest(
    join(pluginsDir, name, ".claude-plugin", "plugin.json"),
  );
  return `| ${manifest.name} | ${manifest.version} | ${manifest.description} |`;
});

const table = [
  "| Plugin | Version | Description |",
  "| --- | --- | --- |",
  ...tableRows,
].join("\n");

const readme = readFileSync(readmePath, "utf8");
const startIndex = readme.indexOf(README_START_MARKER);
const endIndex = readme.indexOf(README_END_MARKER);
if (startIndex === -1 || endIndex === -1) {
  throw new Error(
    `README.md is missing ${README_START_MARKER}/${README_END_MARKER} markers`,
  );
}

const updatedReadme =
  readme.slice(0, startIndex + README_START_MARKER.length) +
  `\n${table}\n` +
  readme.slice(endIndex);

const prettierConfig = await prettierResolveConfig(readmePath);
const formattedReadme = await prettierFormat(updatedReadme, {
  ...prettierConfig,
  filepath: readmePath,
});

if (formattedReadme !== readme) {
  writeFileSync(readmePath, formattedReadme);
  git(["add", "README.md"]);
  console.log("updated README.md plugin version table");
}
