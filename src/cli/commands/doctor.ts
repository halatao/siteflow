import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { validateProject } from "../../validators/validate-project.js";
import { readJsonFile } from "../../utils/fs.js";
import { error, info, success, warning } from "../../utils/logger.js";
import { findProjectRoot, resolveFromRoot } from "../../utils/project.js";
import { cmsManifestSchema, type CmsManifest } from "../../schemas/index.js";

export type DoctorStatus = "ok" | "warning" | "error";

export type DoctorCheck = {
  status: DoctorStatus;
  name: string;
  message: string;
};

export type DoctorOptions = {
  root?: string;
};

export type DoctorResult = {
  projectRoot: string;
  checks: DoctorCheck[];
  ok: boolean;
};

export async function runDoctorCommand(options: DoctorOptions = {}): Promise<number> {
  const result = checkDoctor({ root: options.root });

  for (const check of result.checks) {
    const line = `${check.status} ${check.name}: ${check.message}`;

    if (check.status === "error") {
      error(line);
    } else if (check.status === "warning") {
      warning(line);
    } else {
      success(line);
    }
  }

  info(`Doctor complete: ${result.checks.length} checks, ${result.ok ? "ready" : "issues found"}.`);

  return result.ok ? 0 : 1;
}

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check whether the current repository is ready for Siteflow CMS management")
    .option("--root <path>", "repository root to inspect")
    .action(async (options: DoctorOptions) => {
      process.exitCode = await runDoctorCommand(options);
    });
}

export function checkDoctor(options: DoctorOptions = {}): DoctorResult {
  const projectRoot = path.resolve(options.root ?? findProjectRoot());
  const checks: DoctorCheck[] = [];
  const packageJsonPath = resolveFromRoot(projectRoot, "package.json");
  const manifestPath = resolveFromRoot(projectRoot, "cms.connector.json");
  const packageJson = readJsonFile<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  }>(packageJsonPath);
  const manifest = readManifest(manifestPath);

  addCheck(
    checks,
    fs.existsSync(packageJsonPath),
    "package.json",
    "package.json exists.",
    "package.json is missing.",
  );

  const dependencies = packageJson.success
    ? { ...packageJson.data.dependencies, ...packageJson.data.devDependencies }
    : {};
  addCheck(
    checks,
    Boolean(dependencies.next),
    "nextjs",
    "Next.js dependency detected.",
    "Next.js dependency was not detected.",
  );

  addCheck(
    checks,
    fs.existsSync(manifestPath),
    "manifest",
    "cms.connector.json exists.",
    "cms.connector.json is missing.",
  );

  const contentPagesPath = manifest
    ? resolveManifestPath(projectRoot, manifest, manifest.content.pages)
    : resolveFromRoot(projectRoot, "content/pages");
  addCheck(
    checks,
    fs.existsSync(contentPagesPath),
    "content-pages",
    "Content pages path exists.",
    `Content pages path is missing: ${contentPagesPath}.`,
  );

  const uploadsPath = manifest
    ? resolveManifestPath(projectRoot, manifest, manifest.content.assets ?? "public/uploads")
    : resolveFromRoot(projectRoot, "public/uploads");
  addCheck(
    checks,
    fs.existsSync(uploadsPath),
    "uploads",
    "public/uploads exists.",
    `Upload directory is missing: ${uploadsPath}.`,
  );

  const scripts = packageJson.success && packageJson.data.scripts ? packageJson.data.scripts : {};
  addCheck(
    checks,
    Boolean(scripts["cms:validate"]),
    "cms:validate",
    "cms:validate script exists.",
    "cms:validate script is missing.",
  );
  addCheck(
    checks,
    Boolean(scripts["cms:doctor"]),
    "cms:doctor",
    "cms:doctor script exists.",
    "cms:doctor script is missing.",
  );

  const validation = validateProject({ projectRoot });
  addCheck(
    checks,
    validation.valid,
    "validation",
    "Content validation passes.",
    `Content validation failed with ${validation.issues.length} issue(s).`,
  );

  return {
    projectRoot,
    checks,
    ok: checks.every((check) => check.status !== "error"),
  };
}

function readManifest(manifestPath: string): CmsManifest | undefined {
  const manifest = readJsonFile(manifestPath);
  if (!manifest.success) {
    return undefined;
  }

  const parsed = cmsManifestSchema.safeParse(manifest.data);
  return parsed.success ? parsed.data : undefined;
}

function resolveManifestPath(projectRoot: string, manifest: CmsManifest, configuredPath: string): string {
  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  const normalized = configuredPath.replace(/\\/g, "/");
  const contentRoot = manifest.content.root.replace(/\\/g, "/").replace(/\/+$/, "");

  if (normalized === contentRoot || normalized.startsWith(`${contentRoot}/`) || normalized.startsWith("public/")) {
    return resolveFromRoot(projectRoot, configuredPath);
  }

  return resolveFromRoot(projectRoot, path.join(manifest.content.root, configuredPath));
}

function addCheck(
  checks: DoctorCheck[],
  condition: boolean,
  name: string,
  okMessage: string,
  errorMessage: string,
): void {
  checks.push({
    status: condition ? "ok" : "error",
    name,
    message: condition ? okMessage : errorMessage,
  });
}
