"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  cmsManifestSchema: () => cmsManifestSchema,
  cmsNavigationSchema: () => cmsNavigationSchema,
  cmsPageSchema: () => cmsPageSchema,
  cmsSectionSchema: () => cmsSectionSchema,
  cmsSeoSchema: () => cmsSeoSchema,
  cmsSiteSchema: () => cmsSiteSchema,
  validateProject: () => validateProject
});
module.exports = __toCommonJS(index_exports);

// src/schemas/index.ts
var import_zod = require("zod");
var cmsThemeSchema = import_zod.z.enum(["light", "muted", "dark", "accent"]);
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
        code: import_zod.z.ZodIssueCode.custom,
        message: "Content must not store arbitrary styling class names.",
        path: nestedPath
      });
    }
    validateNoArbitraryClasses(nestedValue, ctx, nestedPath);
  }
}
var cmsSeoSchema = import_zod.z.object({
  title: import_zod.z.string().trim().min(1).max(70),
  description: import_zod.z.string().trim().min(1).max(160),
  image: import_zod.z.string().trim().optional(),
  indexable: import_zod.z.boolean().default(true)
}).strict().superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));
var cmsSectionSchema = import_zod.z.object({
  id: import_zod.z.string().trim().min(1),
  type: import_zod.z.string().trim().min(1),
  variant: import_zod.z.string().trim().min(1).optional(),
  theme: cmsThemeSchema.optional(),
  spacing: import_zod.z.string().trim().min(1).optional(),
  props: import_zod.z.record(import_zod.z.string(), import_zod.z.unknown()).default({})
}).strict().superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));
var cmsPageSchema = import_zod.z.object({
  id: import_zod.z.string().trim().min(1),
  locale: import_zod.z.string().trim().min(1),
  slug: import_zod.z.string().trim().min(1).regex(/^\//, "Slug must start with a leading slash."),
  title: import_zod.z.string().trim().min(1),
  seo: cmsSeoSchema,
  sections: import_zod.z.array(cmsSectionSchema).optional(),
  blocks: import_zod.z.array(cmsSectionSchema).optional()
}).strict().superRefine((value, ctx) => {
  validateNoArbitraryClasses(value, ctx);
  if (!value.sections?.length && !value.blocks?.length) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "Page must contain at least one section or block.",
      path: ["sections"]
    });
  }
});
var cmsSiteSchema = import_zod.z.object({
  name: import_zod.z.string().trim().min(1),
  defaultLocale: import_zod.z.string().trim().min(1).optional(),
  seo: cmsSeoSchema.optional(),
  theme: cmsThemeSchema.optional()
}).strict().superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));
var cmsNavigationItemSchema = import_zod.z.lazy(
  () => import_zod.z.object({
    label: import_zod.z.string().trim().min(1),
    href: import_zod.z.string().trim().min(1),
    locale: import_zod.z.string().trim().min(1).optional(),
    children: import_zod.z.array(cmsNavigationItemSchema).optional()
  }).strict()
);
var cmsNavigationSchema = import_zod.z.object({
  items: import_zod.z.array(cmsNavigationItemSchema).default([])
}).strict().superRefine((value, ctx) => validateNoArbitraryClasses(value, ctx));
var cmsManifestSchema = import_zod.z.object({
  version: import_zod.z.number(),
  project: import_zod.z.object({
    name: import_zod.z.string().trim().min(1),
    framework: import_zod.z.literal("nextjs"),
    router: import_zod.z.enum(["app", "pages"]).optional(),
    language: import_zod.z.enum(["typescript", "javascript"]).optional(),
    styling: import_zod.z.enum(["tailwind", "css", "scss", "other"]).optional()
  }).strict(),
  content: import_zod.z.object({
    root: import_zod.z.string().trim().min(1),
    pages: import_zod.z.string().trim().min(1),
    site: import_zod.z.string().trim().min(1).optional(),
    navigation: import_zod.z.string().trim().min(1).optional(),
    assets: import_zod.z.string().trim().min(1).optional()
  }).strict(),
  localization: import_zod.z.object({
    enabled: import_zod.z.boolean(),
    defaultLocale: import_zod.z.string().trim().min(1),
    locales: import_zod.z.array(import_zod.z.string().trim().min(1)).min(1)
  }).strict().optional(),
  build: import_zod.z.object({
    installCommand: import_zod.z.string().trim().min(1).optional(),
    buildCommand: import_zod.z.string().trim().min(1).optional(),
    validateCommand: import_zod.z.string().trim().min(1).optional(),
    output: import_zod.z.string().trim().min(1).optional()
  }).strict().optional(),
  publishing: import_zod.z.object({
    provider: import_zod.z.literal("github").optional(),
    branch: import_zod.z.string().trim().min(1).optional(),
    mode: import_zod.z.enum(["commit", "pull-request"]).optional()
  }).strict().optional(),
  features: import_zod.z.record(import_zod.z.string(), import_zod.z.boolean()).optional(),
  editable: import_zod.z.object({
    files: import_zod.z.array(import_zod.z.string().trim().min(1)).optional()
  }).strict().optional(),
  blocks: import_zod.z.record(import_zod.z.string(), import_zod.z.unknown()).optional()
}).strict().superRefine((value, ctx) => {
  validateNoArbitraryClasses(value, ctx);
  if (value.localization && !value.localization.locales.includes(value.localization.defaultLocale)) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "Default locale must be included in locales.",
      path: ["localization", "defaultLocale"]
    });
  }
});

// src/validators/validate-project.ts
var import_node_path3 = __toESM(require("path"), 1);

// src/utils/fs.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = __toESM(require("path"), 1);
function pathExists(filePath) {
  return import_node_fs.default.existsSync(filePath);
}
function readJsonFile(filePath) {
  try {
    const raw = import_node_fs.default.readFileSync(filePath, "utf8");
    return { success: true, data: JSON.parse(raw) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
function walkJsonFiles(rootDir) {
  if (!import_node_fs.default.existsSync(rootDir)) {
    return [];
  }
  const stat = import_node_fs.default.statSync(rootDir);
  if (!stat.isDirectory()) {
    return [];
  }
  const files = [];
  const entries = import_node_fs.default.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = import_node_path.default.join(rootDir, entry.name);
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
var import_node_path2 = __toESM(require("path"), 1);
function findProjectRoot(_startDir = process.cwd()) {
  return process.cwd();
}
function resolveFromRoot(projectRoot, relativePath) {
  return import_node_path2.default.resolve(projectRoot, relativePath);
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
  const filePath = import_node_path3.default.resolve(assetsDir, normalizedReference);
  const relative = import_node_path3.default.relative(assetsDir, filePath);
  return {
    filePath,
    insideAssetsDir: !relative.startsWith("..") && !import_node_path3.default.isAbsolute(relative)
  };
}
function resolveContentPath(projectRoot, manifest, configuredPath) {
  if (import_node_path3.default.isAbsolute(configuredPath)) {
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
  return import_node_path3.default.resolve(contentRoot, configuredPath);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cmsManifestSchema,
  cmsNavigationSchema,
  cmsPageSchema,
  cmsSectionSchema,
  cmsSeoSchema,
  cmsSiteSchema,
  validateProject
});
//# sourceMappingURL=index.cjs.map