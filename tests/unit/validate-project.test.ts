import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach } from "vitest";
import { describe, expect, it } from "vitest";
import { validateProject } from "../../src/validators/validate-project.js";

const fixtureRoot = path.resolve("tests/fixtures");
const tempRoots: string[] = [];

afterEach(() => {
  for (const tempRoot of tempRoots.splice(0)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

describe("validateProject", () => {
  it("passes a valid fixture repository", () => {
    const result = validateProject({
      projectRoot: path.join(fixtureRoot, "valid-next-app"),
    });

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("reports MISSING_ASSET for missing uploaded images", () => {
    const result = validateProject({
      projectRoot: path.join(fixtureRoot, "invalid-missing-image"),
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "MISSING_ASSET")).toBe(true);
  });

  it("reports UNKNOWN_BLOCK_TYPE for blocks outside the manifest registry", () => {
    const result = validateProject({
      projectRoot: path.join(fixtureRoot, "invalid-unknown-block"),
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "UNKNOWN_BLOCK_TYPE")).toBe(true);
  });

  it("uses fallback block validation when manifest blocks are omitted", () => {
    const projectRoot = createProject({
      manifest: {
        version: 1,
        project: { name: "Fallback", framework: "nextjs" },
        content: {
          root: "content",
          pages: "pages",
          assets: "public/uploads",
        },
      },
      page: validPage({ type: "gallery" }),
    });

    const result = validateProject({ projectRoot });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "UNKNOWN_BLOCK_TYPE")).toBe(true);
  });

  it("reports PAGE_SCHEMA_INVALID for invalid page schema", () => {
    const projectRoot = createProject({
      manifest: validManifest(),
      page: {
        ...validPage(),
        slug: "home",
      },
    });

    const result = validateProject({ projectRoot });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "PAGE_SCHEMA_INVALID")).toBe(true);
  });
});

function createProject(options: { manifest: unknown; page: unknown }): string {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "siteflow-validate-"));
  tempRoots.push(projectRoot);
  fs.mkdirSync(path.join(projectRoot, "content/pages/cs"), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, "public/uploads"), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, "cms.connector.json"), `${JSON.stringify(options.manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(projectRoot, "content/pages/cs/home.json"), `${JSON.stringify(options.page, null, 2)}\n`);
  return projectRoot;
}

function validManifest(): Record<string, unknown> {
  return {
    version: 1,
    project: { name: "Test", framework: "nextjs" },
    content: {
      root: "content",
      pages: "pages",
      assets: "public/uploads",
    },
    blocks: {
      hero: {},
    },
  };
}

function validPage(options: { type?: string } = {}): Record<string, unknown> {
  return {
    id: "home",
    locale: "cs",
    slug: "/",
    title: "Home",
    seo: {
      title: "Home",
      description: "A valid page description.",
      indexable: true,
    },
    sections: [
      {
        id: "hero",
        type: options.type ?? "hero",
        props: {
          heading: "Hello",
        },
      },
    ],
  };
}
