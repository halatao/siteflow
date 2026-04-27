# CLI Contract: Siteflow Connector

## Binary

`siteflow`

Global behavior:
- Commands run from a target repository root.
- Human-readable output is the v1 default.
- Successful commands exit with code `0`.
- Blocking validation or readiness failures exit with non-zero code where appropriate.

## `siteflow init`

Purpose: create a CMS-ready file structure in a Next.js website repository.

Inputs:
- Current working directory is the target repository.

Behavior:
- Detect Next.js, router mode, TypeScript, and Tailwind.
- Create missing connector config, content files, upload directory, CMS helper files, block renderer, style maps, types, and starter blocks.
- Add `cms:validate` and `cms:doctor` scripts when absent.
- Skip existing files and report skipped paths.
- Do not require network access.

Outputs:
- Summary of created, skipped, and warning items.

## `siteflow validate`

Purpose: validate connector-managed content.

Inputs:
- `cms.connector.json`
- `content/site.json`
- `content/navigation.json`
- `content/pages/**/*.json`
- `public/uploads`

Behavior:
- Validate schemas.
- Detect malformed JSON, duplicate page IDs, duplicate locale slugs, unknown block types, missing images, navigation issues, and SEO issues.

Outputs:
- Passing summary or actionable error list with file paths.

## `siteflow doctor`

Purpose: inspect repository readiness for external CMS management.

Inputs:
- Current repository files only.

Behavior:
- Check Next.js detection, router, TypeScript, Tailwind, connector files, content directories, upload directory, helper files, scripts, and validation readiness.
- Never create, modify, or delete files.

Outputs:
- Pass/warn/fail readiness report with remediation guidance.

## Package Exports

Required exports:
- CLI binary: `siteflow`.
- Root package exports schemas, shared types, and validators.
- `@siteflow/connector/next` exports optional Next.js helper functions.
