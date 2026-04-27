import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { buildGeneratedFiles, type TemplateFile } from "../../templates/generated-files.js";
import { pathExists, readJsonFile } from "../../utils/fs.js";
import { info, success, warning } from "../../utils/logger.js";
import { findProjectRoot, resolveFromRoot } from "../../utils/project.js";

export type InitCommandOptions = {
  cwd?: string;
  locale?: string;
  locales?: string;
  dryRun?: boolean;
  force?: boolean;
};

type InitSummary = {
  created: string[];
  skipped: string[];
  warnings: string[];
};

export async function runInitCommand(options: InitCommandOptions = {}): Promise<InitSummary> {
  const projectRoot = options.cwd ?? findProjectRoot();
  const locale = normalizeLocale(options.locale);
  const locales = normalizeLocales(options.locales, locale);
  const summary: InitSummary = { created: [], skipped: [], warnings: [] };

  if (options.force) {
    summary.warnings.push("--force is reserved for future support and does not overwrite files in this MVP.");
  }

  addProjectDetectionWarnings(projectRoot, summary);

  for (const directory of ["public/uploads"]) {
    createDirectory(projectRoot, directory, Boolean(options.dryRun), summary);
  }

  for (const file of buildGeneratedFiles(locales, locale)) {
    writeFileIfMissing(projectRoot, file, Boolean(options.dryRun), summary);
  }

  updatePackageScripts(projectRoot, Boolean(options.dryRun), summary);
  printSummary(summary, Boolean(options.dryRun));

  return summary;
}

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create Siteflow CMS-ready files in the current Next.js repository")
    .option("--locale <locale>", "default locale for generated starter content", "cs")
    .option("--locales <locales>", "comma-separated locales for generated starter content")
    .option("--dry-run", "show what would be created without modifying files")
    .option("--force", "reserved for future overwrite support; no overwrite occurs in this MVP")
    .action(async (options: InitCommandOptions) => {
      await runInitCommand(options);
    });
}

function normalizeLocale(locale?: string): string {
  const normalized = locale?.trim();
  return normalized || "cs";
}

function normalizeLocales(locales: string | undefined, defaultLocale: string): string[] {
  if (!locales) {
    return [defaultLocale];
  }

  const parsed = locales
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean);

  return Array.from(new Set([defaultLocale, ...parsed]));
}

function addProjectDetectionWarnings(projectRoot: string, summary: InitSummary): void {
  const packageJsonPath = resolveFromRoot(projectRoot, "package.json");
  const packageJson = readJsonFile<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(
    packageJsonPath,
  );

  if (!packageJson.success) {
    summary.warnings.push("package.json was not found or could not be read; project detection was limited.");
    return;
  }

  const dependencies = {
    ...packageJson.data.dependencies,
    ...packageJson.data.devDependencies,
  };

  if (!dependencies.next) {
    summary.warnings.push("Next.js dependency was not detected in package.json.");
  }
}

function createDirectory(projectRoot: string, relativePath: string, dryRun: boolean, summary: InitSummary): void {
  const absolutePath = resolveFromRoot(projectRoot, relativePath);

  if (pathExists(absolutePath)) {
    summary.skipped.push(relativePath);
    return;
  }

  if (!dryRun) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }

  summary.created.push(relativePath);
}

function writeFileIfMissing(projectRoot: string, file: TemplateFile, dryRun: boolean, summary: InitSummary): void {
  const absolutePath = resolveFromRoot(projectRoot, file.path);

  if (pathExists(absolutePath)) {
    summary.skipped.push(file.path);
    return;
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, file.content, "utf8");
  }

  summary.created.push(file.path);
}

function updatePackageScripts(projectRoot: string, dryRun: boolean, summary: InitSummary): void {
  const packageJsonPath = resolveFromRoot(projectRoot, "package.json");
  const packageJson = readJsonFile<Record<string, unknown>>(packageJsonPath);

  if (!packageJson.success || !packageJson.data || typeof packageJson.data !== "object") {
    summary.warnings.push("package.json scripts were not updated because package.json could not be read.");
    return;
  }

  const scripts = isRecord(packageJson.data.scripts) ? { ...packageJson.data.scripts } : {};
  let changed = false;

  if (!scripts["cms:validate"]) {
    scripts["cms:validate"] = "siteflow validate";
    changed = true;
  }

  if (!scripts["cms:doctor"]) {
    scripts["cms:doctor"] = "siteflow doctor";
    changed = true;
  }

  if (!changed) {
    summary.skipped.push("package.json scripts");
    return;
  }

  if (!dryRun) {
    fs.writeFileSync(packageJsonPath, `${JSON.stringify({ ...packageJson.data, scripts }, null, 2)}\n`, "utf8");
  }

  summary.created.push("package.json scripts");
}

function printSummary(summary: InitSummary, dryRun: boolean): void {
  for (const createdPath of summary.created) {
    info(`${dryRun ? "Would create" : "Created"} ${createdPath}`);
  }

  for (const skippedPath of summary.skipped) {
    info(`Skipped ${skippedPath}`);
  }

  for (const warningMessage of summary.warnings) {
    warning(`Warning: ${warningMessage}`);
  }

  success(
    `${dryRun ? "Dry run complete" : "Init complete"}: created ${summary.created.length}, skipped ${summary.skipped.length}, warnings ${summary.warnings.length}.`,
  );
}

function isRecord(value: unknown): value is Record<string, string> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
