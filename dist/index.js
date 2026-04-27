// src/schemas/index.ts
import { z } from "zod";
var cmsThemeSchema = z.enum(["light", "muted", "dark", "accent"]);
var forbiddenContentKeys = /* @__PURE__ */ new Set([
  "class",
  "classes",
  "className",
  "tailwind",
  "tailwindClass",
  "tailwindClasses"
]);
function validateNoArbitraryClasses(value, ctx, path4 = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoArbitraryClasses(item, ctx, [...path4, index]));
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = [...path4, key];
    if (forbiddenContentKeys.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Content must not store arbitrary styling class names.",
        path: nestedPath
      });
    }
    validateNoArbitraryClasses(nestedValue, ctx, nestedPath);
  }
}
var cmsSeoSchema = z.object({
  title: z.string().trim().min(1).max(70),
  description: z.string().trim().min(1).max(160),
  image: z.string().trim().optional(),
  indexable: z.boolean().default(true)
}).strict().superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));
var cmsSectionSchema = z.object({
  id: z.string().trim().min(1),
  type: z.string().trim().min(1),
  variant: z.string().trim().min(1).optional(),
  theme: cmsThemeSchema.optional(),
  spacing: z.string().trim().min(1).optional(),
  props: z.record(z.string(), z.unknown()).default({})
}).strict().superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));
var cmsPageSchema = z.object({
  id: z.string().trim().min(1),
  locale: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^\//, "Slug must start with a leading slash."),
  title: z.string().trim().min(1),
  seo: cmsSeoSchema,
  sections: z.array(cmsSectionSchema).optional(),
  blocks: z.array(cmsSectionSchema).optional()
}).strict().superRefine((value, ctx) => {
  validateNoArbitraryClasses(value, ctx);
  if (!value.sections?.length && !value.blocks?.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Page must contain at least one section or block.",
      path: ["sections"]
    });
  }
});
var cmsSiteSchema = z.object({
  name: z.string().trim().min(1),
  defaultLocale: z.string().trim().min(1).optional(),
  seo: cmsSeoSchema.optional(),
  theme: cmsThemeSchema.optional()
}).strict().superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));
var cmsNavigationItemSchema = z.lazy(
  () => z.object({
    label: z.string().trim().min(1),
    href: z.string().trim().min(1),
    locale: z.string().trim().min(1).optional(),
    children: z.array(cmsNavigationItemSchema).optional()
  }).strict()
);
var cmsNavigationSchema = z.object({
  items: z.array(cmsNavigationItemSchema).default([])
}).strict().superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));
var cmsManifestSchema = z.object({
  version: z.number(),
  project: z.object({
    name: z.string().trim().min(1),
    framework: z.literal("nextjs"),
    router: z.enum(["app", "pages"]).optional(),
    language: z.enum(["typescript", "javascript"]).optional(),
    styling: z.enum(["tailwind", "css", "scss", "other"]).optional()
  }).strict(),
  content: z.object({
    root: z.string().trim().min(1),
    pages: z.string().trim().min(1),
    site: z.string().trim().min(1).optional(),
    navigation: z.string().trim().min(1).optional(),
    assets: z.string().trim().min(1).optional()
  }).strict(),
  localization: z.object({
    enabled: z.boolean(),
    defaultLocale: z.string().trim().min(1),
    locales: z.array(z.string().trim().min(1)).min(1)
  }).strict().optional(),
  build: z.object({
    installCommand: z.string().trim().min(1).optional(),
    buildCommand: z.string().trim().min(1).optional(),
    validateCommand: z.string().trim().min(1).optional(),
    output: z.string().trim().min(1).optional()
  }).strict().optional(),
  publishing: z.object({
    provider: z.literal("github").optional(),
    branch: z.string().trim().min(1).optional(),
    mode: z.enum(["commit", "pull-request"]).optional()
  }).strict().optional(),
  features: z.record(z.string(), z.boolean()).optional(),
  editable: z.object({
    files: z.array(z.string().trim().min(1)).optional()
  }).strict().optional(),
  blocks: z.record(z.string(), z.unknown()).optional()
}).strict().superRefine((value, ctx) => {
  validateNoArbitraryClasses(value, ctx);
  if (value.localization && !value.localization.locales.includes(value.localization.defaultLocale)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Default locale must be included in locales.",
      path: ["localization", "defaultLocale"]
    });
  }
});

// src/validators/validate-project.ts
import path3 from "path";

// src/utils/fs.ts
import fs from "fs";
import path from "path";
function pathExists(filePath) {
  return fs.existsSync(filePath);
}
function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return { success: true, data: JSON.parse(raw) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
function walkJsonFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }
  const stat = fs.statSync(rootDir);
  if (!stat.isDirectory()) {
    return [];
  }
  const files = [];
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

// src/utils/project.ts
import path2 from "path";
function findProjectRoot(_startDir = process.cwd()) {
  return process.cwd();
}
function resolveFromRoot(projectRoot, relativePath) {
  return path2.resolve(projectRoot, relativePath);
}

// src/validators/validate-project.ts
var fallbackBlockTypes = /* @__PURE__ */ new Set(["hero", "text", "textImage", "features", "faq", "cta"]);
function validateProject(options = {}) {
  const projectRoot = options.projectRoot ?? findProjectRoot();
  const checkedFiles = [];
  const issues = [];
  const manifestPath = resolveFromRoot(projectRoot, "cms.connector.json");
  if (!pathExists(manifestPath)) {
    checkedFiles.push(manifestPath);
    addIssue(issues, "error", "MANIFEST_MISSING", manifestPath, "MANIFEST_MISSING: cms.connector.json was not found.");
    return toResult(projectRoot, checkedFiles, issues);
  }
  const manifest = readAndValidate(
    manifestPath,
    (value) => cmsManifestSchema.safeParse(value),
    checkedFiles,
    issues,
    {
      invalidJsonCode: "MANIFEST_INVALID_JSON",
      schemaInvalidCode: "MANIFEST_SCHEMA_INVALID"
    }
  );
  if (!manifest) {
    return toResult(projectRoot, checkedFiles, issues);
  }
  const sitePath = resolveContentPath(projectRoot, manifest, manifest.content.site ?? "site.json");
  const navigationPath = resolveContentPath(projectRoot, manifest, manifest.content.navigation ?? "navigation.json");
  const pagesDir = resolveContentPath(projectRoot, manifest, manifest.content.pages);
  if (pathExists(sitePath)) {
    readAndValidate(sitePath, (value) => cmsSiteSchema.safeParse(value), checkedFiles, issues, {
      invalidJsonCode: "SITE_CONFIG_INVALID_JSON",
      schemaInvalidCode: "SITE_CONFIG_SCHEMA_INVALID"
    });
  } else if (manifest.content.site) {
    addIssue(issues, "error", "SITE_CONFIG_MISSING", sitePath, "Site config file does not exist.");
  }
  if (pathExists(navigationPath)) {
    readAndValidate(navigationPath, (value) => cmsNavigationSchema.safeParse(value), checkedFiles, issues, {
      invalidJsonCode: "NAVIGATION_INVALID_JSON",
      schemaInvalidCode: "NAVIGATION_SCHEMA_INVALID"
    });
  } else if (manifest.content.navigation) {
    addIssue(issues, "error", "NAVIGATION_MISSING", navigationPath, "Navigation file does not exist.");
  }
  const pageFiles = walkJsonFiles(pagesDir);
  if (pageFiles.length === 0) {
    addIssue(issues, "error", "PAGES_MISSING", pagesDir, "No page JSON files found.");
  }
  const pages = pageFiles.map((filePath) => {
    const page = readAndValidate(
      filePath,
      (value) => cmsPageSchema.safeParse(value),
      checkedFiles,
      issues,
      {
        invalidJsonCode: "PAGE_INVALID_JSON",
        schemaInvalidCode: "PAGE_SCHEMA_INVALID"
      }
    );
    return page ? { filePath, page } : void 0;
  }).filter((page) => Boolean(page));
  validateDuplicatePageIds(pages, issues);
  validateDuplicateSlugs(pages, issues);
  validateKnownSections(pages, manifest, issues);
  validateImageReferences(pages, projectRoot, manifest, issues);
  return toResult(projectRoot, checkedFiles, issues);
}
function readAndValidate(filePath, parse, checkedFiles, issues, codes) {
  checkedFiles.push(filePath);
  const json = readJsonFile(filePath);
  if (!json.success) {
    addIssue(issues, "error", codes.invalidJsonCode, filePath, `Invalid JSON: ${json.error}`);
    return void 0;
  }
  const parsed = parse(json.data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      addIssue(issues, "error", codes.schemaInvalidCode, filePath, issue.message, issue.path.join("."));
    }
    return void 0;
  }
  return parsed.data;
}
function validateDuplicatePageIds(pages, issues) {
  const seen = /* @__PURE__ */ new Map();
  for (const { filePath, page } of pages) {
    const existingPath = seen.get(page.id);
    if (existingPath) {
      addIssue(
        issues,
        "error",
        "DUPLICATE_PAGE_ID",
        filePath,
        `Duplicate page id "${page.id}" also used in ${existingPath}.`,
        "id"
      );
      continue;
    }
    seen.set(page.id, filePath);
  }
}
function validateDuplicateSlugs(pages, issues) {
  const seen = /* @__PURE__ */ new Map();
  for (const { filePath, page } of pages) {
    const key = `${page.locale}:${page.slug}`;
    const existingPath = seen.get(key);
    if (existingPath) {
      addIssue(
        issues,
        "error",
        "DUPLICATE_SLUG",
        filePath,
        `Duplicate slug "${page.slug}" for locale "${page.locale}" also used in ${existingPath}.`,
        "slug"
      );
      continue;
    }
    seen.set(key, filePath);
  }
}
function validateKnownSections(pages, manifest, issues) {
  const allowedTypes = manifest.blocks ? new Set(Object.keys(manifest.blocks)) : fallbackBlockTypes;
  for (const { filePath, page } of pages) {
    getPageSections(page).forEach((section, index) => {
      if (!allowedTypes.has(section.type)) {
        addIssue(
          issues,
          "error",
          "UNKNOWN_BLOCK_TYPE",
          filePath,
          `Unknown section type "${section.type}".`,
          `sections.${index}.type`
        );
      }
    });
  }
}
function validateImageReferences(pages, projectRoot, manifest, issues) {
  const assetsDir = resolveContentPath(projectRoot, manifest, manifest.content.assets ?? "public/uploads");
  for (const { filePath, page } of pages) {
    getPageSections(page).forEach((section, sectionIndex) => {
      const references = collectImageReferences(section.props);
      for (const reference of references) {
        const resolved = resolveAssetReference(assetsDir, reference.value);
        if (!resolved.insideAssetsDir) {
          addIssue(
            issues,
            "error",
            "ASSET_OUTSIDE_UPLOADS",
            filePath,
            `Image reference "${reference.value}" must resolve inside ${assetsDir}.`,
            `sections.${sectionIndex}.props.${reference.path}`
          );
          continue;
        }
        if (!pathExists(resolved.filePath)) {
          addIssue(
            issues,
            "error",
            "MISSING_ASSET",
            filePath,
            `Missing image asset "${reference.value}".`,
            `sections.${sectionIndex}.props.${reference.path}`
          );
        }
      }
    });
  }
}
function getPageSections(page) {
  return page.sections ?? page.blocks ?? [];
}
function collectImageReferences(value, keyPath = "") {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectImageReferences(item, joinPath(keyPath, String(index))));
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  const references = [];
  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = joinPath(keyPath, key);
    const keyLooksLikeImage = /^(image|imageSrc|src|url|asset|photo)$/i.test(key);
    if (keyLooksLikeImage && typeof nestedValue === "string" && isAssetReference(nestedValue)) {
      references.push({ path: nestedPath, value: nestedValue });
      continue;
    }
    references.push(...collectImageReferences(nestedValue, nestedPath));
  }
  return references;
}
function isAssetReference(value) {
  return value.startsWith("/uploads/") || value.startsWith("public/uploads/") || value.startsWith("uploads/");
}
function resolveAssetReference(assetsDir, reference) {
  const normalizedReference = reference.replace(/^\/uploads\//, "").replace(/^uploads\//, "").replace(/^public\/uploads\//, "");
  const filePath = path3.resolve(assetsDir, normalizedReference);
  const relative = path3.relative(assetsDir, filePath);
  return {
    filePath,
    insideAssetsDir: !relative.startsWith("..") && !path3.isAbsolute(relative)
  };
}
function resolveContentPath(projectRoot, manifest, configuredPath) {
  if (path3.isAbsolute(configuredPath)) {
    return configuredPath;
  }
  const contentRoot = resolveFromRoot(projectRoot, manifest.content.root);
  const normalizedRoot = normalizePath(manifest.content.root);
  const normalizedConfigured = normalizePath(configuredPath);
  if (normalizedConfigured === normalizedRoot || normalizedConfigured.startsWith(`${normalizedRoot}/`)) {
    return resolveFromRoot(projectRoot, configuredPath);
  }
  if (normalizedConfigured.startsWith("public/")) {
    return resolveFromRoot(projectRoot, configuredPath);
  }
  return path3.resolve(contentRoot, configuredPath);
}
function addIssue(issues, severity, code, file, message, issuePath) {
  issues.push({ severity, code, file, message, path: issuePath });
}
function toResult(projectRoot, checkedFiles, issues) {
  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    projectRoot,
    checkedFiles,
    issues
  };
}
function normalizePath(value) {
  return value.replace(/\\/g, "/").replace(/\/+$/, "");
}
function joinPath(left, right) {
  return left ? `${left}.${right}` : right;
}
export {
  cmsManifestSchema,
  cmsNavigationSchema,
  cmsPageSchema,
  cmsSectionSchema,
  cmsSeoSchema,
  cmsSiteSchema,
  validateProject
};
//# sourceMappingURL=index.js.map