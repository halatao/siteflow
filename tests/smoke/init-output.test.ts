import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runInitCommand } from "../../src/cli/commands/init.js";
import { validateProject } from "../../src/validators/validate-project.js";

const tempRoots: string[] = [];

afterEach(() => {
  for (const tempRoot of tempRoots.splice(0)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

describe("siteflow init", () => {
  it("creates expected files, package scripts, and validation-ready content", async () => {
    const projectRoot = createFixtureProject();

    const summary = await runInitCommand({ cwd: projectRoot });

    expect(summary.created).toContain("cms.connector.json");
    expect(summary.created).toContain("content/pages/cs/home.json");
    expect(summary.created).toContain("public/uploads");
    expect(summary.created).toContain("src/cms/content-loader.ts");
    expect(summary.created).toContain("src/components/cms/BlockRenderer.tsx");
    expect(summary.created).toContain("package.json scripts");

    for (const relativePath of [
      "cms.connector.json",
      "content/site.json",
      "content/navigation.json",
      "content/pages/cs/home.json",
      "public/uploads",
      "src/cms/content-loader.ts",
      "src/cms/style-maps.ts",
      "src/cms/block-registry.ts",
      "src/cms/types.ts",
      "src/components/cms/BlockRenderer.tsx",
      "src/components/cms/HeroBlock.tsx",
      "src/components/cms/TextBlock.tsx",
      "src/components/cms/TextImageBlock.tsx",
      "src/components/cms/FeaturesBlock.tsx",
      "src/components/cms/FaqBlock.tsx",
      "src/components/cms/CtaBlock.tsx",
    ]) {
      expect(fs.existsSync(path.join(projectRoot, relativePath))).toBe(true);
    }

    const packageJson = readJson<{ scripts: Record<string, string> }>(path.join(projectRoot, "package.json"));
    expect(packageJson.scripts["cms:validate"]).toBe("siteflow validate");
    expect(packageJson.scripts["cms:doctor"]).toBe("siteflow doctor");

    const homePage = readJson<{ seo: { indexable: boolean }; sections: Array<{ props: Record<string, unknown> }> }>(
      path.join(projectRoot, "content/pages/cs/home.json"),
    );
    expect(homePage.seo.indexable).toBe(true);
    expect(homePage.sections[0]?.props.heading).toBe("CMS-ready content without lock-in");

    const validation = validateProject({ projectRoot });
    expect(validation.valid).toBe(true);
    expect(validation.issues).toEqual([]);
  });

  it("skips existing files on a second run", async () => {
    const projectRoot = createFixtureProject();

    await runInitCommand({ cwd: projectRoot });
    const summary = await runInitCommand({ cwd: projectRoot });

    expect(summary.created).toHaveLength(0);
    expect(summary.skipped).toContain("cms.connector.json");
    expect(summary.skipped).toContain("content/pages/cs/home.json");
    expect(summary.skipped).toContain("package.json scripts");
  });

  it("does not modify files during dry-run", async () => {
    const projectRoot = createFixtureProject();

    const summary = await runInitCommand({ cwd: projectRoot, dryRun: true });

    expect(summary.created).toContain("cms.connector.json");
    expect(fs.existsSync(path.join(projectRoot, "cms.connector.json"))).toBe(false);
    expect(fs.existsSync(path.join(projectRoot, "content"))).toBe(false);

    const packageJson = readJson<{ scripts?: Record<string, string> }>(path.join(projectRoot, "package.json"));
    expect(packageJson.scripts?.["cms:validate"]).toBeUndefined();
    expect(packageJson.scripts?.["cms:doctor"]).toBeUndefined();
  });

  it("supports comma-separated locales", async () => {
    const projectRoot = createFixtureProject();

    await runInitCommand({ cwd: projectRoot, locale: "cs", locales: "cs,en" });

    expect(fs.existsSync(path.join(projectRoot, "content/pages/cs/home.json"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "content/pages/en/home.json"))).toBe(true);

    const validation = validateProject({ projectRoot });
    expect(validation.valid).toBe(true);
  });
});

function createFixtureProject(): string {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "siteflow-init-"));
  tempRoots.push(projectRoot);
  fs.writeFileSync(
    path.join(projectRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "fixture-next-app",
        private: true,
        dependencies: {
          next: "15.0.0",
        },
        scripts: {
          build: "next build",
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return projectRoot;
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}
