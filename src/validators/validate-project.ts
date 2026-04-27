import path from "node:path";
import { ZodError } from "zod";
import {
  cmsManifestSchema,
  cmsNavigationSchema,
  cmsPageSchema,
  cmsSiteSchema,
  type CmsManifest,
  type CmsPage,
  type CmsSection,
} from "../schemas/index.js";
import { pathExists, readJsonFile, walkJsonFiles } from "../utils/fs.js";
import { findProjectRoot, resolveFromRoot } from "../utils/project.js";

export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  file: string;
  message: string;
  path?: string;
};

export type ValidateProjectOptions = {
  projectRoot?: string;
};

export type ValidateProjectResult = {
  valid: boolean;
  projectRoot: string;
  checkedFiles: string[];
  issues: ValidationIssue[];
};

type LoadedPage = {
  filePath: string;
  page: CmsPage;
};

const fallbackBlockTypes = new Set(["hero", "text", "textImage", "features", "faq", "cta"]);

export function validateProject(options: ValidateProjectOptions = {}): ValidateProjectResult {
  const projectRoot = options.projectRoot ?? findProjectRoot();
  const checkedFiles: string[] = [];
  const issues: ValidationIssue[] = [];
  const manifestPath = resolveFromRoot(projectRoot, "cms.connector.json");

  if (!pathExists(manifestPath)) {
    checkedFiles.push(manifestPath);
    addIssue(issues, "error", "MANIFEST_MISSING", manifestPath, "MANIFEST_MISSING: cms.connector.json was not found.");
    return toResult(projectRoot, checkedFiles, issues);
  }

  const manifest = readAndValidate<CmsManifest>(
    manifestPath,
    (value) => cmsManifestSchema.safeParse(value),
    checkedFiles,
    issues,
    {
      invalidJsonCode: "MANIFEST_INVALID_JSON",
      schemaInvalidCode: "MANIFEST_SCHEMA_INVALID",
    },
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
      schemaInvalidCode: "SITE_CONFIG_SCHEMA_INVALID",
    });
  } else if (manifest.content.site) {
    addIssue(issues, "error", "SITE_CONFIG_MISSING", sitePath, "Site config file does not exist.");
  }

  if (pathExists(navigationPath)) {
    readAndValidate(navigationPath, (value) => cmsNavigationSchema.safeParse(value), checkedFiles, issues, {
      invalidJsonCode: "NAVIGATION_INVALID_JSON",
      schemaInvalidCode: "NAVIGATION_SCHEMA_INVALID",
    });
  } else if (manifest.content.navigation) {
    addIssue(issues, "error", "NAVIGATION_MISSING", navigationPath, "Navigation file does not exist.");
  }

  const pageFiles = walkJsonFiles(pagesDir);
  if (pageFiles.length === 0) {
    addIssue(issues, "error", "PAGES_MISSING", pagesDir, "No page JSON files found.");
  }

  const pages = pageFiles
    .map((filePath) => {
      const page = readAndValidate<CmsPage>(
        filePath,
        (value) => cmsPageSchema.safeParse(value),
        checkedFiles,
        issues,
        {
          invalidJsonCode: "PAGE_INVALID_JSON",
          schemaInvalidCode: "PAGE_SCHEMA_INVALID",
        },
      );
      return page ? { filePath, page } : undefined;
    })
    .filter((page): page is LoadedPage => Boolean(page));

  validateDuplicatePageIds(pages, issues);
  validateDuplicateSlugs(pages, issues);
  validateKnownSections(pages, manifest, issues);
  validateImageReferences(pages, projectRoot, manifest, issues);

  return toResult(projectRoot, checkedFiles, issues);
}

function readAndValidate<T>(
  filePath: string,
  parse: (value: unknown) => { success: true; data: T } | { success: false; error: ZodError },
  checkedFiles: string[],
  issues: ValidationIssue[],
  codes: { invalidJsonCode: string; schemaInvalidCode: string },
): T | undefined {
  checkedFiles.push(filePath);

  const json = readJsonFile(filePath);
  if (!json.success) {
    addIssue(issues, "error", codes.invalidJsonCode, filePath, `Invalid JSON: ${json.error}`);
    return undefined;
  }

  const parsed = parse(json.data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      addIssue(issues, "error", codes.schemaInvalidCode, filePath, issue.message, issue.path.join("."));
    }
    return undefined;
  }

  return parsed.data;
}

function validateDuplicatePageIds(pages: LoadedPage[], issues: ValidationIssue[]): void {
  const seen = new Map<string, string>();

  for (const { filePath, page } of pages) {
    const existingPath = seen.get(page.id);
    if (existingPath) {
      addIssue(
        issues,
        "error",
        "DUPLICATE_PAGE_ID",
        filePath,
        `Duplicate page id "${page.id}" also used in ${existingPath}.`,
        "id",
      );
      continue;
    }

    seen.set(page.id, filePath);
  }
}

function validateDuplicateSlugs(pages: LoadedPage[], issues: ValidationIssue[]): void {
  const seen = new Map<string, string>();

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
        "slug",
      );
      continue;
    }

    seen.set(key, filePath);
  }
}

function validateKnownSections(pages: LoadedPage[], manifest: CmsManifest, issues: ValidationIssue[]): void {
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
          `sections.${index}.type`,
        );
      }
    });
  }
}

function validateImageReferences(
  pages: LoadedPage[],
  projectRoot: string,
  manifest: CmsManifest,
  issues: ValidationIssue[],
): void {
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
            `sections.${sectionIndex}.props.${reference.path}`,
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
            `sections.${sectionIndex}.props.${reference.path}`,
          );
        }
      }
    });
  }
}

function getPageSections(page: CmsPage): CmsSection[] {
  return page.sections ?? page.blocks ?? [];
}

function collectImageReferences(value: unknown, keyPath = ""): Array<{ path: string; value: string }> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectImageReferences(item, joinPath(keyPath, String(index))));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const references: Array<{ path: string; value: string }> = [];

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

function isAssetReference(value: string): boolean {
  return value.startsWith("/uploads/") || value.startsWith("public/uploads/") || value.startsWith("uploads/");
}

function resolveAssetReference(
  assetsDir: string,
  reference: string,
): { filePath: string; insideAssetsDir: boolean } {
  const normalizedReference = reference
    .replace(/^\/uploads\//, "")
    .replace(/^uploads\//, "")
    .replace(/^public\/uploads\//, "");
  const filePath = path.resolve(assetsDir, normalizedReference);
  const relative = path.relative(assetsDir, filePath);

  return {
    filePath,
    insideAssetsDir: !relative.startsWith("..") && !path.isAbsolute(relative),
  };
}

function resolveContentPath(projectRoot: string, manifest: CmsManifest, configuredPath: string): string {
  if (path.isAbsolute(configuredPath)) {
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

  return path.resolve(contentRoot, configuredPath);
}

function addIssue(
  issues: ValidationIssue[],
  severity: ValidationSeverity,
  code: string,
  file: string,
  message: string,
  issuePath?: string,
): void {
  issues.push({ severity, code, file, message, path: issuePath });
}

function toResult(projectRoot: string, checkedFiles: string[], issues: ValidationIssue[]): ValidateProjectResult {
  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    projectRoot,
    checkedFiles,
    issues,
  };
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/").replace(/\/+$/, "");
}

function joinPath(left: string, right: string): string {
  return left ? `${left}.${right}` : right;
}
