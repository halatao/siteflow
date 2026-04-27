# Siteflow Connector

`@siteflow/connector` is a CLI-first TypeScript package that prepares a Next.js repository for file-based CMS management without adding a CMS runtime dependency.

The package creates readable project files, validates repository-owned JSON content, and reports readiness for future external CMS workflows.

## Install

### GitHub-hosted install

Install directly from the repository while npm publishing is still pending:

```bash
npm install github:<owner>/<repo>
```

Then run the CLI through npm scripts or `npx`:

```bash
npx siteflow validate
```

### Local development

```bash
npm install
npm run build
npm run test
```

Run the built CLI locally:

```bash
node dist/cli/index.js validate
```

## CLI Usage

### `siteflow init`

Creates a CMS-ready repository structure in the current Next.js project.

```bash
siteflow init
siteflow init --locale cs
siteflow init --locales cs,en
siteflow init --dry-run
```

Options:

- `--locale <locale>`: default locale for generated starter content. Defaults to `cs`.
- `--locales <locales>`: comma-separated list of locales, for example `cs,en`.
- `--dry-run`: prints intended created/skipped/warning actions without modifying files.
- `--force`: reserved for future overwrite support. It does not overwrite files in the current MVP.

`init` is non-destructive. It creates missing files, skips existing files, and never overwrites existing files.

### `siteflow validate`

Validates connector-managed content.

```bash
siteflow validate
siteflow validate --root ./my-next-site
```

Validation checks include:

- `cms.connector.json` exists and matches the manifest schema.
- Page JSON files match the page schema.
- Duplicate page IDs are rejected.
- Duplicate slugs within the same locale are rejected.
- Unknown block types are rejected.
  If `manifest.blocks` is present, its keys define allowed block types; otherwise validation falls back to `hero`, `text`, `textImage`, `features`, `faq`, and `cta`.
- Missing assets referenced from content are rejected.
- Basic SEO fields are required, and `seo.indexable` is supported with generated/default value `true`.
- Arbitrary Tailwind class names in content are rejected.

### `siteflow doctor`

Reports repository readiness without modifying files.

```bash
siteflow doctor
siteflow doctor --root ./my-next-site
```

Doctor checks:

- `package.json` exists.
- The project appears to use Next.js.
- `cms.connector.json` exists.
- Content pages path exists.
- `public/uploads` exists.
- `cms:validate` script exists.
- `cms:doctor` script exists.
- Validation passes.

Doctor prints human-readable `ok`, `warning`, and `error` checks. It exits with `0` when there are no error checks and `1` when any error check fails.

## Generated File Contract

`siteflow init` creates plain, readable project files:

```text
cms.connector.json
content/site.json
content/navigation.json
content/pages/{locale}/home.json
public/uploads/
src/cms/content-loader.ts
src/cms/block-registry.ts
src/cms/style-maps.ts
src/cms/types.ts
src/components/cms/BlockRenderer.tsx
src/components/cms/HeroBlock.tsx
src/components/cms/TextBlock.tsx
src/components/cms/TextImageBlock.tsx
src/components/cms/FeaturesBlock.tsx
src/components/cms/FaqBlock.tsx
src/components/cms/CtaBlock.tsx
```

It also adds package scripts when missing:

```json
{
  "cms:validate": "siteflow validate",
  "cms:doctor": "siteflow doctor"
}
```

Existing scripts are not overwritten.

## Content Rules

- Website content lives in repository JSON files under `content/`.
- Uploaded assets live in `public/uploads`.
- React/Next.js components own layout and Tailwind classes.
- Tailwind classes may appear in generated React components and `style-maps.ts`.
- CMS content stores structured `props`, variants, themes, spacing, SEO fields, and page structure.
- Section payloads use `props`; `data` is not part of the MVP section contract.
- Theme values are limited to `light`, `muted`, `dark`, and `accent`.
- CMS content must not store arbitrary Tailwind class names.

## No Lock-In Guarantees

- No CMS runtime dependency is required.
- No remote API is required.
- No web server is introduced by the connector.
- Generated files are readable and editable.
- The website can run and build without an external CMS.
- Removing a future CMS integration does not remove repository content.

## MVP Limitations

This iteration does not include:

- CMS UI
- Web server
- GitHub integration
- Lovable import
- Existing repository auto-migration
- Drafts
- Gallery block
- Contact form block
- Visual drag and drop builder
- Remote API
