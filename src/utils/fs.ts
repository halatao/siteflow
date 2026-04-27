import fs from "node:fs";
import path from "node:path";

export type ReadJsonResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export function pathExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readJsonFile<T = unknown>(filePath: string): ReadJsonResult<T> {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return { success: true, data: JSON.parse(raw) as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export function walkJsonFiles(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const stat = fs.statSync(rootDir);
  if (!stat.isDirectory()) {
    return [];
  }

  const files: string[] = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    }
  }

  return files.sort();
}
