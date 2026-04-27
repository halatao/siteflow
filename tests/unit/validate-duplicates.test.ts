import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateProject } from "../../src/validators/validate-project.js";

const fixtureRoot = path.resolve("tests/fixtures");

describe("validateProject duplicate slug checks", () => {
  it("reports DUPLICATE_SLUG for duplicate slugs in the same locale", () => {
    const result = validateProject({
      projectRoot: path.join(fixtureRoot, "invalid-duplicate-slug"),
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "DUPLICATE_SLUG")).toBe(true);
  });
});
