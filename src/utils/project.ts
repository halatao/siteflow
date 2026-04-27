import path from "node:path";
import { pathExists } from "./fs.js";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export function findProjectRoot(_startDir = process.cwd()): string {
  return process.cwd();
}

export function detectPackageManager(projectRoot: string): PackageManager {
  if (pathExists(path.join(projectRoot, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (pathExists(path.join(projectRoot, "yarn.lock"))) {
    return "yarn";
  }

  if (pathExists(path.join(projectRoot, "bun.lockb"))) {
    return "bun";
  }

  return "npm";
}

export function resolveFromRoot(projectRoot: string, relativePath: string): string {
  return path.resolve(projectRoot, relativePath);
}
