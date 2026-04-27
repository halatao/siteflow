import { z } from "zod";

const cmsThemeSchema = z.enum(["light", "muted", "dark", "accent"]);

const forbiddenContentKeys = new Set([
  "class",
  "classes",
  "className",
  "tailwind",
  "tailwindClass",
  "tailwindClasses",
]);

function validateNoArbitraryClasses(value: unknown, ctx: z.RefinementCtx, path: (string | number)[] = []): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoArbitraryClasses(item, ctx, [...path, index]));
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = [...path, key];

    if (forbiddenContentKeys.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Content must not store arbitrary styling class names.",
        path: nestedPath,
      });
    }

    validateNoArbitraryClasses(nestedValue, ctx, nestedPath);
  }
}

export const cmsSeoSchema = z
  .object({
    title: z.string().trim().min(1).max(70),
    description: z.string().trim().min(1).max(160),
    image: z.string().trim().optional(),
    indexable: z.boolean().default(true),
  })
  .strict()
  .superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));

export const cmsSectionSchema = z
  .object({
    id: z.string().trim().min(1),
    type: z.string().trim().min(1),
    variant: z.string().trim().min(1).optional(),
    theme: cmsThemeSchema.optional(),
    spacing: z.string().trim().min(1).optional(),
    props: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));

export const cmsPageSchema = z
  .object({
    id: z.string().trim().min(1),
    locale: z.string().trim().min(1),
    slug: z.string().trim().min(1).regex(/^\//, "Slug must start with a leading slash."),
    title: z.string().trim().min(1),
    seo: cmsSeoSchema,
    sections: z.array(cmsSectionSchema).optional(),
    blocks: z.array(cmsSectionSchema).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    validateNoArbitraryClasses(value, ctx);

    if (!value.sections?.length && !value.blocks?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Page must contain at least one section or block.",
        path: ["sections"],
      });
    }
  });

export const cmsSiteSchema = z
  .object({
    name: z.string().trim().min(1),
    defaultLocale: z.string().trim().min(1).optional(),
    seo: cmsSeoSchema.optional(),
    theme: cmsThemeSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));

type NavigationItem = {
  label: string;
  href: string;
  locale?: string;
  children?: NavigationItem[];
};

const cmsNavigationItemSchema: z.ZodType<NavigationItem> = z.lazy(() =>
  z
    .object({
      label: z.string().trim().min(1),
      href: z.string().trim().min(1),
      locale: z.string().trim().min(1).optional(),
      children: z.array(cmsNavigationItemSchema).optional(),
    })
    .strict(),
);

export const cmsNavigationSchema = z
  .object({
    items: z.array(cmsNavigationItemSchema).default([]),
  })
  .strict()
  .superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));

export const cmsManifestSchema = z
  .object({
    version: z.number(),
    project: z
      .object({
        name: z.string().trim().min(1),
        framework: z.literal("nextjs"),
        router: z.enum(["app", "pages"]).optional(),
        language: z.enum(["typescript", "javascript"]).optional(),
        styling: z.enum(["tailwind", "css", "scss", "other"]).optional(),
      })
      .strict(),
    content: z
      .object({
        root: z.string().trim().min(1),
        pages: z.string().trim().min(1),
        site: z.string().trim().min(1).optional(),
        navigation: z.string().trim().min(1).optional(),
        assets: z.string().trim().min(1).optional(),
      })
      .strict(),
    localization: z
      .object({
        enabled: z.boolean(),
        defaultLocale: z.string().trim().min(1),
        locales: z.array(z.string().trim().min(1)).min(1),
      })
      .strict()
      .optional(),
    build: z
      .object({
        installCommand: z.string().trim().min(1).optional(),
        buildCommand: z.string().trim().min(1).optional(),
        validateCommand: z.string().trim().min(1).optional(),
        output: z.string().trim().min(1).optional(),
      })
      .strict()
      .optional(),
    publishing: z
      .object({
        provider: z.literal("github").optional(),
        branch: z.string().trim().min(1).optional(),
        mode: z.enum(["commit", "pull-request"]).optional(),
      })
      .strict()
      .optional(),
    features: z.record(z.string(), z.boolean()).optional(),
    editable: z
      .object({
        files: z.array(z.string().trim().min(1)).optional(),
      })
      .strict()
      .optional(),
    blocks: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    validateNoArbitraryClasses(value, ctx);

    if (value.localization && !value.localization.locales.includes(value.localization.defaultLocale)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default locale must be included in locales.",
        path: ["localization", "defaultLocale"],
      });
    }
  });

export type CmsManifest = z.infer<typeof cmsManifestSchema>;
export type CmsSeo = z.infer<typeof cmsSeoSchema>;
export type CmsSection = z.infer<typeof cmsSectionSchema>;
export type CmsPage = z.infer<typeof cmsPageSchema>;
export type CmsSite = z.infer<typeof cmsSiteSchema>;
export type CmsNavigation = z.infer<typeof cmsNavigationSchema>;
