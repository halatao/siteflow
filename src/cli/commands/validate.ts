import type { Command } from "commander";
import { validateProject } from "../../validators/validate-project.js";
import { error, info, success, warning } from "../../utils/logger.js";
import { findProjectRoot } from "../../utils/project.js";

export type ValidateCommandOptions = {
  cwd?: string;
  root?: string;
};

export async function runValidateCommand(options: ValidateCommandOptions = {}): Promise<number> {
  const result = validateProject({ projectRoot: options.root ?? options.cwd ?? findProjectRoot() });

  if (result.valid) {
    success(`Validation passed. Checked ${result.checkedFiles.length} files.`);
    return 0;
  }

  error("Validation failed.");

  for (const issue of result.issues) {
    const log = issue.severity === "warning" ? warning : error;
    const pathLabel = issue.path ? ` (${issue.path})` : "";
    log(`${issue.severity.toUpperCase()} ${issue.file}${pathLabel}: ${issue.message}`);
  }

  info(`Checked ${result.checkedFiles.length} files.`);
  return 1;
}

export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate Siteflow CMS content in the current repository")
    .option("--root <path>", "repository root to validate")
    .action(async (options: ValidateCommandOptions) => {
      process.exitCode = await runValidateCommand(options);
    });
}
