import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkDoctor, runDoctorCommand } from "../../src/cli/commands/doctor.js";

const fixtureRoot = path.resolve("tests/fixtures");
const tempRoots: string[] = [];

afterEach(() => {
  for (const tempRoot of tempRoots.splice(0)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

describe("doctor", () => {
  it("passes for a ready fixture", async () => {
    const projectRoot = path.join(fixtureRoot, "valid-next-app");

    const result = checkDoctor({ root: projectRoot });
    const exitCode = await runDoctorCommand({ root: projectRoot });

    expect(result.ok).toBe(true);
    expect(result.checks.every((check) => check.status !== "error")).toBe(true);
    expect(exitCode).toBe(0);
  });

  it("reports an error when the manifest is missing", () => {
    const projectRoot = createTempProject({
      "package.json": JSON.stringify(
        {
          name: "missing-manifest",
          dependencies: { next: "15.0.0" },
          scripts: {
            "cms:validate": "siteflow validate",
            "cms:doctor": "siteflow doctor",
          },
        },
        null,
        2,
      ),
    });

    const result = checkDoctor({ root: projectRoot });

    expect(result.ok).toBe(false);
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "manifest",
          status: "error",
        }),
      ]),
    );
  });

  it("does not modify files", () => {
    const projectRoot = path.join(fixtureRoot, "valid-next-app");
    const before = snapshotFiles(projectRoot);

    checkDoctor({ root: projectRoot });

    expect(snapshotFiles(projectRoot)).toEqual(before);
  });
});

function createTempProject(files: Record<string, string>): string {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "siteflow-doctor-"));
  tempRoots.push(projectRoot);

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(projectRoot, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, `${content}\n`, "utf8");
  }

  return projectRoot;
}

function snapshotFiles(rootDir: string): Record<string, string> {
  const snapshot: Record<string, string> = {};
  const pending = [rootDir];

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(absolutePath);
      } else if (entry.isFile()) {
        snapshot[path.relative(rootDir, absolutePath).replace(/\\/g, "/")] = fs.readFileSync(absolutePath, "utf8");
      }
    }
  }

  return snapshot;
}
