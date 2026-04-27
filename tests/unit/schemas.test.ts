import { describe, expect, it } from "vitest";
import { cmsManifestSchema, cmsPageSchema, cmsSectionSchema } from "../../src/schemas/index.js";

const validPage = {
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
      type: "hero",
      theme: "muted",
      props: {
        heading: "Hello",
      },
    },
  ],
};

const validManifest = {
  version: 1,
  project: {
    name: "Fixture",
    framework: "nextjs",
  },
  content: {
    root: "content",
    pages: "pages",
    assets: "public/uploads",
  },
  localization: {
    enabled: true,
    defaultLocale: "cs",
    locales: ["cs", "en"],
  },
  blocks: {
    hero: {},
  },
};

describe("CMS schemas", () => {
  it("accepts a valid CmsPage", () => {
    expect(cmsPageSchema.safeParse(validPage).success).toBe(true);
  });

  it("rejects a slug without a leading slash", () => {
    const result = cmsPageSchema.safeParse({ ...validPage, slug: "home" });

    expect(result.success).toBe(false);
  });

  it("rejects a page with missing SEO fields", () => {
    const result = cmsPageSchema.safeParse({
      ...validPage,
      seo: {
        title: "Home",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects a section with className as a first-class field", () => {
    const result = cmsSectionSchema.safeParse({
      id: "hero",
      type: "hero",
      className: "text-4xl",
      props: {
        heading: "Hello",
      },
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid manifest", () => {
    expect(cmsManifestSchema.safeParse(validManifest).success).toBe(true);
  });

  it("accepts seo.indexable and defaults it to true when omitted", () => {
    const result = cmsPageSchema.safeParse({
      ...validPage,
      seo: {
        title: "Home",
        description: "A valid page description.",
      },
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data.seo.indexable : undefined).toBe(true);
  });
});
