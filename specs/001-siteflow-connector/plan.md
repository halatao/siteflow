# Implementation Plan: Siteflow Connector

**Branch**: `001-siteflow-connector` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-siteflow-connector/spec.md`

## Summary

Build `@siteflow/connector` as a small ESM TypeScript npm package with a CLI-first surface. The `siteflow` binary provides `init`, `validate`, and `doctor` commands for converting a Next.js repository into a CMS-ready static website repository where content remains editable as plain JSON and images live under `public/uploads`.

The package must not introduce a web server, CMS UI, remote API dependency, or opaque runtime layer. Generated files are plain project files copied from templates, and the initialized website must continue to run and build without any external CMS.

## Technical Context

**Language/Version**: TypeScript targeting Node.js 18.18+ with ESM output  
**Primary Dependencies**: `commander` for CLI registration, `zod` for schemas/validation, `fs-extra` or native `fs/promises` for filesystem work  
**Storage**: Repository files only: JSON content under `content/` and images under `public/uploads`  
**Testing**: Vitest unit and smoke tests  
**Target Platform**: Local developer machines and CI running Node.js; package installable from GitHub first, npm publishing later  
**Project Type**: CLI-first npm package with optional Next.js helper exports  
**Performance Goals**: `init`, `validate`, and `doctor` complete within a few seconds for typical small/medium static sites; validation handles recursive page content without network access  
**Constraints**: No web server, no CMS UI, no remote API, no arbitrary Tailwind class names in content, non-destructive initialization, readable generated files  
**Scale/Scope**: Single target website repository per command invocation, run from repository root in v1

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file still contains placeholder principles and defines no enforceable gates. This plan applies the feature constraints as operational gates:

- CLI-first package: PASS, all primary behavior is exposed through `siteflow`.
- File-based CMS readiness: PASS, all content and uploads remain repository-managed.
- No vendor lock-in: PASS, generated website files do not require a CMS runtime or remote service.
- Simplicity/readability: PASS, package structure is small and explicit.
- Testability: PASS, validation logic and init output have dedicated tests.

Post-design re-check: PASS. Research, data model, contracts, and quickstart preserve the same gates.

## Project Structure

### Documentation (this feature)

```text
specs/001-siteflow-connector/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── cli/
│   ├── index.ts
│   └── commands/
│       ├── init.ts
│       ├── validate.ts
│       └── doctor.ts
├── next/
│   └── index.ts
├── schemas/
│   └── index.ts
├── templates/
│   ├── cms.connector.json
│   ├── content/
│   ├── public/
│   └── src/
└── utils/
    ├── fs.ts
    ├── logger.ts
    └── project.ts

tests/
├── smoke/
│   └── init-output.test.ts
└── unit/
    ├── schemas.test.ts
    └── validate-duplicates.test.ts
```

**Structure Decision**: Use a single root-level npm package. CLI commands own command orchestration, schemas own content contracts, `src/next` owns optional helper exports, and `src/templates` stores readable files that `init` copies into target websites.

## Complexity Tracking

No constitution violations or justified complexity exceptions.
