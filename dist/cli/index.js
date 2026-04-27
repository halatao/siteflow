#!/usr/bin/env node

// src/cli/index.ts
import { Command } from "commander";

// src/cli/commands/doctor.ts
import fs2 from "fs";
import path4 from "path";

// src/validators/validate-project.ts
import path3 from "path";

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
function validateNoArbitraryClasses(value, ctx, path6 = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoArbitraryClasses(item, ctx, [...path6, index]));
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = [...path6, key];
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

// src/utils/logger.ts
function info(message) {
  console.log(message);
}
function success(message) {
  console.log(message);
}
function warning(message) {
  console.warn(message);
}
function error(message) {
  console.error(message);
}

// src/cli/commands/doctor.ts
async function runDoctorCommand(options = {}) {
  const result = checkDoctor({ root: options.root });
  for (const check of result.checks) {
    const line = `${check.status} ${check.name}: ${check.message}`;
    if (check.status === "error") {
      error(line);
    } else if (check.status === "warning") {
      warning(line);
    } else {
      success(line);
    }
  }
  info(`Doctor complete: ${result.checks.length} checks, ${result.ok ? "ready" : "issues found"}.`);
  return result.ok ? 0 : 1;
}
function registerDoctorCommand(program) {
  program.command("doctor").description("Check whether the current repository is ready for Siteflow CMS management").option("--root <path>", "repository root to inspect").action(async (options) => {
    process.exitCode = await runDoctorCommand(options);
  });
}
function checkDoctor(options = {}) {
  const projectRoot = path4.resolve(options.root ?? findProjectRoot());
  const checks = [];
  const packageJsonPath = resolveFromRoot(projectRoot, "package.json");
  const manifestPath = resolveFromRoot(projectRoot, "cms.connector.json");
  const packageJson = readJsonFile(packageJsonPath);
  const manifest = readManifest(manifestPath);
  addCheck(
    checks,
    fs2.existsSync(packageJsonPath),
    "package.json",
    "package.json exists.",
    "package.json is missing."
  );
  const dependencies = packageJson.success ? { ...packageJson.data.dependencies, ...packageJson.data.devDependencies } : {};
  addCheck(
    checks,
    Boolean(dependencies.next),
    "nextjs",
    "Next.js dependency detected.",
    "Next.js dependency was not detected."
  );
  addCheck(
    checks,
    fs2.existsSync(manifestPath),
    "manifest",
    "cms.connector.json exists.",
    "cms.connector.json is missing."
  );
  const contentPagesPath = manifest ? resolveManifestPath(projectRoot, manifest, manifest.content.pages) : resolveFromRoot(projectRoot, "content/pages");
  addCheck(
    checks,
    fs2.existsSync(contentPagesPath),
    "content-pages",
    "Content pages path exists.",
    `Content pages path is missing: ${contentPagesPath}.`
  );
  const uploadsPath = manifest ? resolveManifestPath(projectRoot, manifest, manifest.content.assets ?? "public/uploads") : resolveFromRoot(projectRoot, "public/uploads");
  addCheck(
    checks,
    fs2.existsSync(uploadsPath),
    "uploads",
    "public/uploads exists.",
    `Upload directory is missing: ${uploadsPath}.`
  );
  const scripts = packageJson.success && packageJson.data.scripts ? packageJson.data.scripts : {};
  addCheck(
    checks,
    Boolean(scripts["cms:validate"]),
    "cms:validate",
    "cms:validate script exists.",
    "cms:validate script is missing."
  );
  addCheck(
    checks,
    Boolean(scripts["cms:doctor"]),
    "cms:doctor",
    "cms:doctor script exists.",
    "cms:doctor script is missing."
  );
  const validation = validateProject({ projectRoot });
  addCheck(
    checks,
    validation.valid,
    "validation",
    "Content validation passes.",
    `Content validation failed with ${validation.issues.length} issue(s).`
  );
  return {
    projectRoot,
    checks,
    ok: checks.every((check) => check.status !== "error")
  };
}
function readManifest(manifestPath) {
  const manifest = readJsonFile(manifestPath);
  if (!manifest.success) {
    return void 0;
  }
  const parsed = cmsManifestSchema.safeParse(manifest.data);
  return parsed.success ? parsed.data : void 0;
}
function resolveManifestPath(projectRoot, manifest, configuredPath) {
  if (path4.isAbsolute(configuredPath)) {
    return configuredPath;
  }
  const normalized = configuredPath.replace(/\\/g, "/");
  const contentRoot = manifest.content.root.replace(/\\/g, "/").replace(/\/+$/, "");
  if (normalized === contentRoot || normalized.startsWith(`${contentRoot}/`) || normalized.startsWith("public/")) {
    return resolveFromRoot(projectRoot, configuredPath);
  }
  return resolveFromRoot(projectRoot, path4.join(manifest.content.root, configuredPath));
}
function addCheck(checks, condition, name, okMessage, errorMessage) {
  checks.push({
    status: condition ? "ok" : "error",
    name,
    message: condition ? okMessage : errorMessage
  });
}

// src/cli/commands/init.ts
import fs3 from "fs";
import path5 from "path";

// src/templates/generated-files.ts
var blockTypes = ["hero", "text", "textImage", "features", "faq", "cta"];
function buildGeneratedFiles(locales, defaultLocale) {
  return [
    { path: "cms.connector.json", content: manifestTemplate(locales, defaultLocale) },
    { path: "content/site.json", content: siteTemplate(defaultLocale) },
    { path: "content/navigation.json", content: navigationTemplate(defaultLocale) },
    ...locales.map((locale) => ({
      path: `content/pages/${locale}/home.json`,
      content: homePageTemplate(locale)
    })),
    { path: "src/cms/content-loader.ts", content: contentLoaderTemplate },
    { path: "src/cms/style-maps.ts", content: styleMapsTemplate },
    { path: "src/cms/block-registry.ts", content: blockRegistryTemplate },
    { path: "src/cms/types.ts", content: typesTemplate },
    { path: "src/components/cms/BlockRenderer.tsx", content: blockRendererTemplate },
    { path: "src/components/cms/HeroBlock.tsx", content: heroBlockTemplate },
    { path: "src/components/cms/TextBlock.tsx", content: textBlockTemplate },
    { path: "src/components/cms/TextImageBlock.tsx", content: textImageBlockTemplate },
    { path: "src/components/cms/FeaturesBlock.tsx", content: featuresBlockTemplate },
    { path: "src/components/cms/FaqBlock.tsx", content: faqBlockTemplate },
    { path: "src/components/cms/CtaBlock.tsx", content: ctaBlockTemplate }
  ];
}
function manifestTemplate(locales, defaultLocale) {
  return jsonTemplate({
    version: 1,
    project: {
      name: "Siteflow Website",
      framework: "nextjs",
      router: "app",
      language: "typescript",
      styling: "tailwind"
    },
    content: {
      root: "content",
      pages: "pages",
      site: "site.json",
      navigation: "navigation.json",
      assets: "public/uploads"
    },
    localization: {
      enabled: locales.length > 1,
      defaultLocale,
      locales
    },
    build: {
      validateCommand: "siteflow validate"
    },
    publishing: {
      provider: "github",
      mode: "pull-request"
    },
    features: {},
    editable: {
      files: ["content/**/*.json", "public/uploads/**/*"]
    },
    blocks: Object.fromEntries(blockTypes.map((type) => [type, {}]))
  });
}
function siteTemplate(defaultLocale) {
  return jsonTemplate({
    name: "Siteflow Website",
    defaultLocale,
    seo: {
      title: "Siteflow Website",
      description: "A CMS-ready static website powered by repository content.",
      indexable: true
    },
    theme: "light"
  });
}
function navigationTemplate(defaultLocale) {
  return jsonTemplate({
    items: [
      {
        label: "Home",
        href: "/",
        locale: defaultLocale
      }
    ]
  });
}
function homePageTemplate(locale) {
  return jsonTemplate({
    id: `home-${locale}`,
    locale,
    slug: "/",
    title: "Home",
    seo: {
      title: "Home",
      description: "A CMS-ready home page that can be edited through repository JSON.",
      indexable: true
    },
    sections: [
      {
        id: "hero",
        type: "hero",
        variant: "default",
        theme: "light",
        spacing: "lg",
        props: {
          eyebrow: "Siteflow",
          heading: "CMS-ready content without lock-in",
          body: "Edit this page by changing JSON files in the repository.",
          ctaLabel: "Get started",
          ctaHref: "/"
        }
      },
      {
        id: "intro",
        type: "text",
        variant: "default",
        theme: "muted",
        spacing: "md",
        props: {
          heading: "Repository-owned content",
          body: "Components own layout and styling. Content stores only structured data and safe presentation tokens."
        }
      }
    ]
  });
}
function jsonTemplate(value) {
  return `${JSON.stringify(value, null, 2)}
`;
}
var typesTemplate = `export type CmsTheme = "light" | "muted" | "dark" | "accent";
export type CmsSpacing = "sm" | "md" | "lg";

export type CmsBlock = {
  id: string;
  type: string;
  variant?: string;
  theme?: CmsTheme;
  spacing?: CmsSpacing;
  props: Record<string, unknown>;
};

export type CmsPage = {
  id: string;
  locale: string;
  slug: string;
  title: string;
  seo: {
    title: string;
    description: string;
    image?: string;
    indexable: boolean;
  };
  sections: CmsBlock[];
};
`;
var contentLoaderTemplate = `import fs from "node:fs";
import path from "node:path";
import type { CmsPage } from "./types";

const contentRoot = path.join(process.cwd(), "content");

export function loadPage(locale: string, slug = "/"): CmsPage | undefined {
  const pagesDir = path.join(contentRoot, "pages", locale);
  if (!fs.existsSync(pagesDir)) return undefined;

  for (const fileName of fs.readdirSync(pagesDir)) {
    if (!fileName.endsWith(".json")) continue;
    const page = JSON.parse(fs.readFileSync(path.join(pagesDir, fileName), "utf8")) as CmsPage;
    if (page.slug === slug) return page;
  }

  return undefined;
}

export function loadSiteConfig<T = unknown>(): T {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, "site.json"), "utf8")) as T;
}

export function loadNavigation<T = unknown>(): T {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, "navigation.json"), "utf8")) as T;
}
`;
var styleMapsTemplate = `export const themeClassMap = {
  light: "bg-white text-slate-950",
  muted: "bg-slate-50 text-slate-950",
  dark: "bg-slate-950 text-white",
  accent: "bg-emerald-50 text-slate-950",
} as const;

export const spacingClassMap = {
  sm: "py-8",
  md: "py-14",
  lg: "py-20",
} as const;
`;
var blockRegistryTemplate = `import { CtaBlock } from "../components/cms/CtaBlock";
import { FaqBlock } from "../components/cms/FaqBlock";
import { FeaturesBlock } from "../components/cms/FeaturesBlock";
import { HeroBlock } from "../components/cms/HeroBlock";
import { TextBlock } from "../components/cms/TextBlock";
import { TextImageBlock } from "../components/cms/TextImageBlock";

export const blockRegistry = {
  hero: HeroBlock,
  text: TextBlock,
  textImage: TextImageBlock,
  features: FeaturesBlock,
  faq: FaqBlock,
  cta: CtaBlock,
} as const;
`;
var blockRendererTemplate = `import type { CmsBlock } from "../../cms/types";
import { blockRegistry } from "../../cms/block-registry";

export function BlockRenderer({ blocks }: { blocks: CmsBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = blockRegistry[block.type as keyof typeof blockRegistry];
        if (!Component) return null;
        return <Component key={block.id} block={block} />;
      })}
    </>
  );
}
`;
var blockComponentBoilerplate = `import type { CmsBlock } from "../../cms/types";
import { spacingClassMap, themeClassMap } from "../../cms/style-maps";

type BlockProps = {
  block: CmsBlock;
};

function getText(value: unknown): string {
  return typeof value === "string" ? value : "";
}
`;
var heroBlockTemplate = `${blockComponentBoilerplate}
export function HeroBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "lg";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-sm font-medium uppercase tracking-wide">{getText(block.props.eyebrow)}</p>
        <h1 className="mt-3 text-4xl font-semibold">{getText(block.props.heading)}</h1>
        <p className="mt-5 max-w-2xl text-lg">{getText(block.props.body)}</p>
      </div>
    </section>
  );
}
`;
var textBlockTemplate = `${blockComponentBoilerplate}
export function TextBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
        <p className="mt-4 text-base leading-7">{getText(block.props.body)}</p>
      </div>
    </section>
  );
}
`;
var textImageBlockTemplate = `${blockComponentBoilerplate}
export function TextImageBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
          <p className="mt-4 text-base leading-7">{getText(block.props.body)}</p>
        </div>
      </div>
    </section>
  );
}
`;
var featuresBlockTemplate = `${blockComponentBoilerplate}
export function FeaturesBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
      </div>
    </section>
  );
}
`;
var faqBlockTemplate = `${blockComponentBoilerplate}
export function FaqBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
      </div>
    </section>
  );
}
`;
var ctaBlockTemplate = `${blockComponentBoilerplate}
export function CtaBlock({ block }: BlockProps) {
  const theme = block.theme ?? "accent";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
        <p className="mt-4">{getText(block.props.body)}</p>
      </div>
    </section>
  );
}
`;

// src/cli/commands/init.ts
async function runInitCommand(options = {}) {
  const projectRoot = options.cwd ?? findProjectRoot();
  const locale = normalizeLocale(options.locale);
  const locales = normalizeLocales(options.locales, locale);
  const summary = { created: [], skipped: [], warnings: [] };
  if (options.force) {
    summary.warnings.push("--force is reserved for future support and does not overwrite files in this MVP.");
  }
  addProjectDetectionWarnings(projectRoot, summary);
  for (const directory of ["public/uploads"]) {
    createDirectory(projectRoot, directory, Boolean(options.dryRun), summary);
  }
  for (const file of buildGeneratedFiles(locales, locale)) {
    writeFileIfMissing(projectRoot, file, Boolean(options.dryRun), summary);
  }
  updatePackageScripts(projectRoot, Boolean(options.dryRun), summary);
  printSummary(summary, Boolean(options.dryRun));
  return summary;
}
function registerInitCommand(program) {
  program.command("init").description("Create Siteflow CMS-ready files in the current Next.js repository").option("--locale <locale>", "default locale for generated starter content", "cs").option("--locales <locales>", "comma-separated locales for generated starter content").option("--dry-run", "show what would be created without modifying files").option("--force", "reserved for future overwrite support; no overwrite occurs in this MVP").action(async (options) => {
    await runInitCommand(options);
  });
}
function normalizeLocale(locale) {
  const normalized = locale?.trim();
  return normalized || "cs";
}
function normalizeLocales(locales, defaultLocale) {
  if (!locales) {
    return [defaultLocale];
  }
  const parsed = locales.split(",").map((locale) => locale.trim()).filter(Boolean);
  return Array.from(/* @__PURE__ */ new Set([defaultLocale, ...parsed]));
}
function addProjectDetectionWarnings(projectRoot, summary) {
  const packageJsonPath = resolveFromRoot(projectRoot, "package.json");
  const packageJson = readJsonFile(
    packageJsonPath
  );
  if (!packageJson.success) {
    summary.warnings.push("package.json was not found or could not be read; project detection was limited.");
    return;
  }
  const dependencies = {
    ...packageJson.data.dependencies,
    ...packageJson.data.devDependencies
  };
  if (!dependencies.next) {
    summary.warnings.push("Next.js dependency was not detected in package.json.");
  }
}
function createDirectory(projectRoot, relativePath, dryRun, summary) {
  const absolutePath = resolveFromRoot(projectRoot, relativePath);
  if (pathExists(absolutePath)) {
    summary.skipped.push(relativePath);
    return;
  }
  if (!dryRun) {
    fs3.mkdirSync(absolutePath, { recursive: true });
  }
  summary.created.push(relativePath);
}
function writeFileIfMissing(projectRoot, file, dryRun, summary) {
  const absolutePath = resolveFromRoot(projectRoot, file.path);
  if (pathExists(absolutePath)) {
    summary.skipped.push(file.path);
    return;
  }
  if (!dryRun) {
    fs3.mkdirSync(path5.dirname(absolutePath), { recursive: true });
    fs3.writeFileSync(absolutePath, file.content, "utf8");
  }
  summary.created.push(file.path);
}
function updatePackageScripts(projectRoot, dryRun, summary) {
  const packageJsonPath = resolveFromRoot(projectRoot, "package.json");
  const packageJson = readJsonFile(packageJsonPath);
  if (!packageJson.success || !packageJson.data || typeof packageJson.data !== "object") {
    summary.warnings.push("package.json scripts were not updated because package.json could not be read.");
    return;
  }
  const scripts = isRecord(packageJson.data.scripts) ? { ...packageJson.data.scripts } : {};
  let changed = false;
  if (!scripts["cms:validate"]) {
    scripts["cms:validate"] = "siteflow validate";
    changed = true;
  }
  if (!scripts["cms:doctor"]) {
    scripts["cms:doctor"] = "siteflow doctor";
    changed = true;
  }
  if (!changed) {
    summary.skipped.push("package.json scripts");
    return;
  }
  if (!dryRun) {
    fs3.writeFileSync(packageJsonPath, `${JSON.stringify({ ...packageJson.data, scripts }, null, 2)}
`, "utf8");
  }
  summary.created.push("package.json scripts");
}
function printSummary(summary, dryRun) {
  for (const createdPath of summary.created) {
    info(`${dryRun ? "Would create" : "Created"} ${createdPath}`);
  }
  for (const skippedPath of summary.skipped) {
    info(`Skipped ${skippedPath}`);
  }
  for (const warningMessage of summary.warnings) {
    warning(`Warning: ${warningMessage}`);
  }
  success(
    `${dryRun ? "Dry run complete" : "Init complete"}: created ${summary.created.length}, skipped ${summary.skipped.length}, warnings ${summary.warnings.length}.`
  );
}
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// src/cli/commands/validate.ts
async function runValidateCommand(options = {}) {
  const result = validateProject({ projectRoot: options.root ?? options.cwd ?? findProjectRoot() });
  if (result.valid) {
    success(`Validation passed. Checked ${result.checkedFiles.length} files.`);
    return 0;
  }
  error("Validation failed.");
  for (const issue of result.issues) {
    const log = issue.severity === "warning" ? warning : error;
    const pathLabel = issue.path ? ` (${issue.path})` : "";
    log(`${issue.severity.toUpperCase()} ${issue.file}${pathLabel}: ${issue.message}`);
  }
  info(`Checked ${result.checkedFiles.length} files.`);
  return 1;
}
function registerValidateCommand(program) {
  program.command("validate").description("Validate Siteflow CMS content in the current repository").option("--root <path>", "repository root to validate").action(async (options) => {
    process.exitCode = await runValidateCommand(options);
  });
}

// src/cli/index.ts
function createProgram() {
  const program = new Command();
  program.name("siteflow").description("Siteflow connector CLI");
  registerInitCommand(program);
  registerValidateCommand(program);
  registerDoctorCommand(program);
  return program;
}
async function main(argv = process.argv) {
  await createProgram().parseAsync(argv);
}
var invokedPath = process.argv[1]?.replace(/\\/g, "/") ?? "";
if (invokedPath.endsWith("/cli/index.js") || invokedPath.endsWith("/cli/index.cjs") || invokedPath.endsWith("/cli/index.ts") || invokedPath.endsWith("/siteflow") || invokedPath.endsWith("/siteflow.cmd")) {
  void main();
}
export {
  createProgram,
  main
};
//# sourceMappingURL=index.js.map